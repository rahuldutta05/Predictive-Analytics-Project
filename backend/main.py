import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List, Optional
import json
import base64
from PIL import Image
import io
import sys
from sklearn.base import BaseEstimator, TransformerMixin

class CropPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self, outlier_quantile=0.01, corr_threshold=0.85):
        self.outlier_quantile = outlier_quantile
        self.corr_threshold   = corr_threshold

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        df = X.copy()
        for col in ['N', 'P', 'K', 'rainfall']:
            df[col] = df[col].clip(lower=0)
        df['humidity'] = df['humidity'].clip(0, 100)
        df['ph']       = df['ph'].clip(0, 14)

        df = df.fillna(self.medians_)
        df = self._apply_caps(df)
        df[['N', 'P', 'K', 'rainfall']] = self.pt_.transform(
            df[['N', 'P', 'K', 'rainfall']]
        )
        df = self._engineer_features(df)
        df = df.drop(columns=[c for c in self.to_drop_ if c in df.columns])
        return df

    def _apply_caps(self, df):
        for col, (lo, hi) in self.caps_.items():
            df[col] = df[col].clip(lo, hi)
        return df

    def _engineer_features(self, df):
        df = df.copy()
        df['NPK_sum']      = df['N'] + df['P'] + df['K']
        df['N_to_P']       = df['N'] / (df['P'] + 1e-5)
        if 'Soil_OC' in df.columns:
            df['soil_score']   = df['Soil_OC'] * df['NPK_sum']
        else:
            df['soil_score']   = 1.0 * df['NPK_sum'] # fallback if completely missing
        df['climate_score']= df['temperature'] * df['humidity']
        return df

setattr(sys.modules['__main__'], 'CropPreprocessor', CropPreprocessor)
# ========== APP SETUP ==========
app = FastAPI(title="AgriSense API v2.0", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== MODEL LOADING ==========
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "ml model", "models")
CROP_MODEL_PATH = os.path.join(MODEL_DIR, "best_model.pkl")
YIELD_MODEL_PATH = os.path.join(MODEL_DIR, "crop_yield_model.pkl")

import warnings
try:
    from sklearn.exceptions import InconsistentVersionWarning
    warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
except ImportError:
    pass

try:
    crop_data = joblib.load(CROP_MODEL_PATH)
    if isinstance(crop_data, dict):
        crop_model = crop_data.get("model")
        crop_le = crop_data.get("label_encoder")
        crop_preprocessor = crop_data.get("preprocessor")
        crop_features = None
    else:
        crop_model, crop_le, crop_features = crop_data
        crop_preprocessor = None

    yield_data = joblib.load(YIELD_MODEL_PATH)
    yield_model = yield_data["model"]
    yield_scaler = yield_data["scaler"]
    yield_encoder = yield_data["encoder"]
    yield_features = yield_data["columns"]
    print("✅ Models loaded successfully.")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    crop_model = None
    crop_le = None
    crop_features = None
    crop_preprocessor = None
    yield_model = None
    yield_scaler = None
    yield_encoder = None
    yield_features = None

# ========== FEATURE DEFINITIONS ==========
CROP_FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
YIELD_RAW_COLS = [
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
    "Soil_OC", "Fertilizer_kg_ha", "Pest_Index", "Irrigation_mm"
]

# ========== DATA MODELS ==========

class PredictYieldPayload(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    Soil_OC: float
    Fertilizer_kg_ha: float
    Pest_Index: float
    Irrigation_mm: float
    label: Optional[str] = None

class RecommendCropPayload(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class SoilAnalysisPayload(BaseModel):
    N: float
    P: float
    K: float
    ph: float
    organic_matter: float
    microbial_count: float
    crop_name: str

class ExpensePayload(BaseModel):
    seeds_cost: float
    fertilizer_cost: float
    pesticide_cost: float
    labor_cost: float
    water_cost: float
    machinery_cost: float
    land_area_ha: float
    crop_name: str

class FieldDataPayload(BaseModel):
    field_id: str
    field_name: str
    area_ha: float
    crop_name: str
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float
    yield_achieved: Optional[float] = None

class CropRotationPayload(BaseModel):
    current_crop: str
    region: str

class IrrigationSchedulePayload(BaseModel):
    crop_name: str
    soil_type: str
    irrigation_method: str
    rainfall_expected: float
    growth_stage: str

class ForumPostPayload(BaseModel):
    farmer_name: str
    crop_name: str
    region: str
    title: str
    description: str
    tags: List[str]

class ForumAnswerPayload(BaseModel):
    post_id: str
    responder_name: str
    answer: str
    is_expert: bool

# ========== IN-MEMORY DATA STORAGE ==========
# In production, use a database like PostgreSQL
forum_posts = {}
forum_answers = {}
expense_records = {}
field_records = {}
soil_records = {}
water_usage_records = {}

# ========== EXISTING ENDPOINTS ==========

@app.post("/predict_yield")
async def predict_yield_endpoint(payload: PredictYieldPayload):
    """Predict crop yield based on soil and environmental parameters"""
    if yield_model is None:
        raise HTTPException(status_code=500, detail="Yield model not loaded")
    
    try:
        data = payload.dict()
        
        # If no label provided, use the crop_model to predict it first
        if not data.get("label"):
            if crop_model is not None:
                if crop_preprocessor is not None:
                    # Isolate only the features needed for crop prediction
                    crop_keys = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'Soil_OC']
                    crop_input = {k: data[k] for k in crop_keys if k in data}
                    if 'Soil_OC' not in crop_input:
                        crop_input['Soil_OC'] = np.nan
                    crop_row = pd.DataFrame([crop_input])
                    crop_row_transformed = crop_preprocessor.transform(crop_row)
                    pred_encoded = crop_model.predict(crop_row_transformed)[0]
                    data['label'] = crop_le.inverse_transform([pred_encoded])[0]
                else:
                    crop_row = pd.DataFrame([data])
                    crop_row['NPK_sum'] = crop_row['N'] + crop_row['P'] + crop_row['K']
                    crop_row['N_to_P'] = crop_row['N'] / (crop_row['P'] + 1e-5)
                    crop_row['climate_score'] = crop_row['temperature'] * crop_row['humidity']
                    for col in crop_features:
                        if col not in crop_row.columns:
                            crop_row[col] = 0
                    pred_encoded = crop_model.predict(crop_row[crop_features])[0]
                    data['label'] = crop_le.inverse_transform([pred_encoded])[0]
            else:
                raise HTTPException(status_code=500, detail="Cannot infer crop name without crop model")
                
        df = pd.DataFrame([data])
        
        # --- ONE HOT ENCODING ---
        encoded = yield_encoder.transform(df[['label']])
        encoded_df = pd.DataFrame(
            encoded,
            columns=yield_encoder.get_feature_names_out(['label'])
        )
        
        # Drop original label
        df = df.drop('label', axis=1)
        
        # Combine numeric + encoded
        df = pd.concat([df.reset_index(drop=True), encoded_df.reset_index(drop=True)], axis=1)
        
        # --- MATCH TRAINING COLUMNS ---
        df = df.reindex(columns=yield_features, fill_value=0)
        
        # --- SCALING ---
        df_scaled = yield_scaler.transform(df)
        
        # --- PREDICTION ---
        prediction = yield_model.predict(df_scaled)[0]
        
        return {
            "predicted_yield_t_ha": round(float(prediction), 4),
            "timestamp": datetime.now().isoformat(),
            "crop_used": data.get("label")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/recommend_crop")
async def recommend_crop_endpoint(payload: RecommendCropPayload, k: int = 3):
    """Recommend top 3 crops based on soil and environmental parameters"""
    if crop_model is None:
        raise HTTPException(status_code=500, detail="Crop model not loaded")
    
    try:
        data = payload.dict()
        df = pd.DataFrame([data])
        
        if crop_preprocessor is not None:
            if 'Soil_OC' not in df.columns:
                df['Soil_OC'] = np.nan
            row = crop_preprocessor.transform(df)
            probs = crop_model.predict_proba(row)[0]
            top_idx = probs.argsort()[::-1][:k]
            top_crops = [
                {"crop": crop_le.inverse_transform([idx])[0], "probability": round(float(probs[idx]) * 100, 2)}
                for idx in top_idx
            ]
        else:
            # Feature engineering (same as training)
            df['NPK_sum'] = df['N'] + df['P'] + df['K']
            df['N_to_P'] = df['N'] / (df['P'] + 1e-5)
            df['climate_score'] = df['temperature'] * df['humidity']
            
            # Align columns
            for col in crop_features:
                if col not in df.columns:
                    df[col] = 0
                    
            row = df[crop_features]
            
            probs = crop_model.predict_proba(row)[0]
            classes_encoded = crop_model.classes_
            top_idx = probs.argsort()[::-1][:k]
            
            top_crops = [
                {"crop": crop_le.inverse_transform([classes_encoded[idx]])[0], "probability": round(float(probs[idx]) * 100, 2)}
                for idx in top_idx
            ]
        
        return {
            "top_crops": top_crops,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 1: SOIL HEALTH MONITORING ==========

@app.post("/soil_analysis")
async def soil_analysis(payload: SoilAnalysisPayload):
    """Analyze soil health and provide recommendations"""
    try:
        recommendations = []
        soil_score = 0
        max_score = 100
        
        # NPK Analysis
        optimal_ranges = {
            "N": (30, 60),
            "P": (15, 30),
            "K": (150, 300)
        }
        
        npk_status = {}
        for nutrient in ["N", "P", "K"]:
            value = getattr(payload, nutrient)
            optimal_min, optimal_max = optimal_ranges[nutrient]
            
            if optimal_min <= value <= optimal_max:
                npk_status[nutrient] = "Optimal"
                soil_score += 30
            elif value < optimal_min:
                npk_status[nutrient] = "Low"
                recommendations.append(f"{nutrient} is low. Recommend: Apply {nutrient}-rich fertilizer (e.g., Urea for N, DAP for P, MOP for K)")
            else:
                npk_status[nutrient] = "High"
                recommendations.append(f"{nutrient} is high. Avoid excessive application to prevent soil degradation.")
        
        # pH Analysis
        if 6.0 <= payload.ph <= 7.5:
            ph_status = "Ideal for most crops"
            soil_score += 20
        elif 5.5 <= payload.ph < 6.0:
            ph_status = "Slightly Acidic"
            recommendations.append("Add lime to increase pH for crops preferring neutral soil")
        elif 7.5 < payload.ph <= 8.5:
            ph_status = "Slightly Alkaline"
            recommendations.append("Add sulfur to decrease pH")
        else:
            ph_status = "Extreme"
            recommendations.append("Consult agricultural expert for soil amendment")
        
        # Organic Matter
        if payload.organic_matter >= 3.0:
            om_status = "Excellent"
            soil_score += 20
        elif payload.organic_matter >= 2.0:
            om_status = "Good"
            soil_score += 15
        elif payload.organic_matter >= 1.0:
            om_status = "Fair"
            soil_score += 10
            recommendations.append("Increase organic matter by adding compost/FYM")
        else:
            om_status = "Poor"
            recommendations.append("Critical: Add organic matter. Mix in 10-15 tons/ha of FYM or compost")
        
        soil_record = {
            "crop": payload.crop_name,
            "timestamp": datetime.now().isoformat(),
            "npk_status": npk_status,
            "ph": payload.ph,
            "ph_status": ph_status,
            "organic_matter": payload.organic_matter,
            "om_status": om_status,
            "microbial_count": payload.microbial_count,
            "soil_score": soil_score,
            "recommendations": recommendations
        }
        
        soil_records[datetime.now().isoformat()] = soil_record
        
        return {
            "soil_score": soil_score,
            "npk_status": npk_status,
            "ph_status": ph_status,
            "organic_matter_status": om_status,
            "recommendations": recommendations,
            "message": "Soil analysis complete. Follow recommendations for optimal soil health."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 2: FERTILIZER RECOMMENDATION ==========

FERTILIZER_DB = {
    "N": [
        {"name": "Urea", "npk_ratio": "46-0-0", "cost_per_kg": 6, "efficiency": "High"},
        {"name": "Ammonium Sulfate", "npk_ratio": "21-0-0", "cost_per_kg": 8, "efficiency": "Medium"},
    ],
    "P": [
        {"name": "DAP", "npk_ratio": "18-46-0", "cost_per_kg": 20, "efficiency": "High"},
        {"name": "SSP", "npk_ratio": "0-16-0", "cost_per_kg": 8, "efficiency": "Medium"},
    ],
    "K": [
        {"name": "MOP", "npk_ratio": "0-0-60", "cost_per_kg": 18, "efficiency": "High"},
        {"name": "Potassium Chloride", "npk_ratio": "0-0-50", "cost_per_kg": 16, "efficiency": "High"},
    ]
}

@app.post("/fertilizer_recommendation")
async def fertilizer_recommendation(soil_analysis: dict, target_yield: float, crop_name: str):
    """Recommend specific fertilizers based on soil deficiencies"""
    try:
        recommendations = []
        estimated_npk_needed = {
            "N": max(0, (60 - soil_analysis.get("N", 40)) * target_yield),
            "P": max(0, (30 - soil_analysis.get("P", 15)) * target_yield),
            "K": max(0, (300 - soil_analysis.get("K", 150)) * target_yield)
        }
        
        total_cost = 0
        for nutrient, amount_needed in estimated_npk_needed.items():
            if amount_needed > 0:
                fertilizers = FERTILIZER_DB.get(nutrient, [])
                if fertilizers:
                    best = fertilizers[0]
                    cost = amount_needed * best["cost_per_kg"]
                    total_cost += cost
                    recommendations.append({
                        "nutrient": nutrient,
                        "amount_needed_kg": round(amount_needed, 2),
                        "fertilizer": best["name"],
                        "npk_ratio": best["npk_ratio"],
                        "estimated_cost": round(cost, 2),
                        "efficiency": best["efficiency"]
                    })
        
        estimated_roi = (target_yield * 2500 - total_cost) / total_cost * 100 if total_cost > 0 else 0
        
        return {
            "recommendations": recommendations,
            "total_estimated_cost": round(total_cost, 2),
            "estimated_roi_percent": round(estimated_roi, 2),
            "crop": crop_name,
            "note": "Use this as guidance. Consult local agricultural officer for final decision."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 3: FIELD PERFORMANCE COMPARATOR ==========

@app.post("/field_record")
async def record_field_data(payload: FieldDataPayload):
    """Record data for a specific field"""
    try:
        if payload.field_id not in field_records:
            field_records[payload.field_id] = []
        
        field_records[payload.field_id].append({
            "timestamp": datetime.now().isoformat(),
            "field_name": payload.field_name,
            "area_ha": payload.area_ha,
            "crop": payload.crop_name,
            "N": payload.N,
            "P": payload.P,
            "K": payload.K,
            "temperature": payload.temperature,
            "humidity": payload.humidity,
            "ph": payload.ph,
            "rainfall": payload.rainfall,
            "yield_achieved": payload.yield_achieved
        })
        
        return {
            "status": "recorded",
            "field_id": payload.field_id,
            "message": f"Data recorded for field: {payload.field_name}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/field_comparison")
async def compare_fields():
    """Compare performance across all fields"""
    try:
        comparison = []
        for field_id, records in field_records.items():
            if records:
                latest = records[-1]
                avg_yield = np.mean([r.get("yield_achieved", 0) for r in records if r.get("yield_achieved")])
                avg_npk = np.mean([r["N"] + r["P"] + r["K"] for r in records]) / 3
                
                comparison.append({
                    "field_id": field_id,
                    "field_name": latest["field_name"],
                    "area_ha": latest["area_ha"],
                    "current_crop": latest["crop"],
                    "avg_yield_t_ha": round(avg_yield, 2),
                    "avg_npk": round(avg_npk, 2),
                    "number_of_records": len(records)
                })
        
        if comparison:
            best_field = max(comparison, key=lambda x: x["avg_yield_t_ha"])
            return {
                "field_comparison": comparison,
                "best_performing_field": best_field,
                "message": f"Best field: {best_field['field_name']} with avg yield {best_field['avg_yield_t_ha']} t/ha"
            }
        else:
            return {"message": "No field data available yet"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 4: EXPENSE & INCOME TRACKER ==========

@app.post("/track_expense")
async def track_expense(payload: ExpensePayload):
    """Track farming expenses and calculate ROI"""
    try:
        total_expense = (
            payload.seeds_cost + payload.fertilizer_cost + 
            payload.pesticide_cost + payload.labor_cost + 
            payload.water_cost + payload.machinery_cost
        )
        
        cost_per_ha = total_expense / payload.land_area_ha if payload.land_area_ha > 0 else 0
        
        record = {
            "timestamp": datetime.now().isoformat(),
            "crop": payload.crop_name,
            "seeds": payload.seeds_cost,
            "fertilizer": payload.fertilizer_cost,
            "pesticide": payload.pesticide_cost,
            "labor": payload.labor_cost,
            "water": payload.water_cost,
            "machinery": payload.machinery_cost,
            "total": total_expense,
            "cost_per_ha": cost_per_ha,
            "area_ha": payload.land_area_ha
        }
        
        expense_records[datetime.now().isoformat()] = record
        
        return {
            "total_expense": round(total_expense, 2),
            "cost_per_ha": round(cost_per_ha, 2),
            "breakdown": {
                "seeds": payload.seeds_cost,
                "fertilizer": payload.fertilizer_cost,
                "pesticide": payload.pesticide_cost,
                "labor": payload.labor_cost,
                "water": payload.water_cost,
                "machinery": payload.machinery_cost
            },
            "message": "Expense recorded. Link with yield prediction for ROI calculation."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/expense_summary")
async def expense_summary(crop_name: str = None):
    """Get expense summary for a crop"""
    try:
        records = list(expense_records.values())
        if crop_name:
            records = [r for r in records if r.get("crop") == crop_name]
        
        if records:
            avg_total = np.mean([r["total"] for r in records])
            avg_cost_per_ha = np.mean([r["cost_per_ha"] for r in records])
            
            return {
                "crop": crop_name or "All crops",
                "total_records": len(records),
                "avg_total_expense": round(avg_total, 2),
                "avg_cost_per_ha": round(avg_cost_per_ha, 2),
                "highest_expense": round(max([r["total"] for r in records]), 2),
                "lowest_expense": round(min([r["total"] for r in records]), 2)
            }
        else:
            return {"message": "No expense records available"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 5: WEATHER-BASED ADVISORIES ==========

WEATHER_ADVISORY_DB = {
    "heavy_rain": {
        "advisory": "Heavy rain expected",
        "actions": [
            "Don't apply fertilizers (will wash away)",
            "Ensure proper drainage to avoid waterlogging",
            "Delay pesticide application",
            "Monitor for fungal diseases"
        ]
    },
    "frost": {
        "advisory": "Frost warning",
        "actions": [
            "Cover sensitive crops",
            "Irrigate fields (water retains heat)",
            "Avoid new plantings",
            "Monitor early morning temperatures"
        ]
    },
    "heatwave": {
        "advisory": "Heatwave alert",
        "actions": [
            "Increase irrigation frequency",
            "Apply mulch to retain moisture",
            "Water in early morning/evening",
            "Monitor for pest outbreaks"
        ]
    },
    "drought": {
        "advisory": "Drought conditions",
        "actions": [
            "Reduce irrigation to essential crops",
            "Use drip irrigation for efficiency",
            "Apply compost for water retention",
            "Select drought-resistant varieties"
        ]
    }
}

@app.post("/weather_advisory")
async def weather_advisory(
    temperature: float,
    humidity: float,
    rainfall_forecast: float,
    crop_name: str,
    growth_stage: str
):
    """Generate weather-based farming advisories"""
    try:
        advisories = []
        
        if rainfall_forecast > 100:
            advisories.append(WEATHER_ADVISORY_DB["heavy_rain"])
        
        if temperature < 0:
            advisories.append(WEATHER_ADVISORY_DB["frost"])
        elif temperature > 35:
            advisories.append(WEATHER_ADVISORY_DB["heatwave"])
        
        if rainfall_forecast < 20 and humidity < 40:
            advisories.append(WEATHER_ADVISORY_DB["drought"])
        
        # Stage-specific advice
        stage_specific = {}
        if growth_stage == "seedling":
            stage_specific["tip"] = "Seedlings are sensitive to temperature extremes. Provide adequate water."
        elif growth_stage == "flowering":
            stage_specific["tip"] = "Excessive rainfall during flowering can affect pollination."
        elif growth_stage == "maturity":
            stage_specific["tip"] = "Avoid excess irrigation near harvest to maintain grain quality."
        
        return {
            "crop": crop_name,
            "growth_stage": growth_stage,
            "weather_conditions": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall_forecast_mm": rainfall_forecast
            },
            "advisories": advisories,
            "stage_specific_advice": stage_specific,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 6: CROP ROTATION RECOMMENDER ==========

CROP_ROTATION_DB = {
    "Rice": ["Wheat", "Pulses", "Oilseeds"],
    "Wheat": ["Rice", "Pulses", "Vegetables"],
    "Corn": ["Legumes", "Wheat", "Oats"],
    "Tomato": ["Beans", "Carrots", "Lettuce"],
    "Pulses": ["Rice", "Wheat", "Corn"],
    "Sugarcane": ["Legumes", "Rice", "Wheat"]
}

@app.post("/crop_rotation")
async def crop_rotation(payload: CropRotationPayload):
    """Recommend next crop for rotation"""
    try:
        current = payload.current_crop
        region = payload.region
        
        recommended = CROP_ROTATION_DB.get(current, ["Legumes", "Mixed Vegetables"])
        
        rotation_benefits = {
            "Nitrogen replenishment": "Legumes fix atmospheric nitrogen",
            "Pest cycle breaking": "Different crops prevent pest build-up",
            "Soil structure improvement": "Diverse root systems improve soil",
            "Balanced nutrient use": "Different crops use different nutrients"
        }
        
        return {
            "current_crop": current,
            "region": region,
            "recommended_next_crops": recommended,
            "benefits": rotation_benefits,
            "next_season_timing": "Plan rotation 2-3 months before current crop ends",
            "message": f"Rotating from {current} breaks pest cycles and improves soil health"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 7: IRRIGATION SCHEDULER ==========

@app.post("/irrigation_schedule")
async def irrigation_schedule(payload: IrrigationSchedulePayload):
    """Generate weekly irrigation schedule"""
    try:
        crop = payload.crop_name
        soil_type = payload.soil_type
        method = payload.irrigation_method
        rainfall = payload.rainfall_expected
        stage = payload.growth_stage
        
        # Base water requirement (mm/week)
        water_requirement = {
            "Rice": 70,
            "Wheat": 40,
            "Corn": 50,
            "Tomato": 35,
            "Cotton": 45
        }
        
        base_requirement = water_requirement.get(crop, 40)
        
        # Adjust for growth stage
        stage_multiplier = {
            "seedling": 0.5,
            "vegetative": 1.0,
            "flowering": 1.3,
            "fruiting": 1.2,
            "maturity": 0.7
        }
        
        adjusted_requirement = base_requirement * stage_multiplier.get(stage, 1.0)
        
        # Adjust for rainfall
        irrigation_needed = max(0, adjusted_requirement - rainfall)
        
        # Soil type affects irrigation frequency
        frequency = {
            "Sandy": "3 days",
            "Loamy": "5 days",
            "Clay": "7 days"
        }
        
        schedule = []
        for day in range(0, 28, int(frequency[soil_type].split()[0])):
            schedule.append({
                "day": f"Day {day + int(frequency[soil_type].split()[0])}",
                "irrigation_mm": round(irrigation_needed / 4, 1),
                "timing": "Early morning (5-7 AM)" if method == "sprinkler" else "Evening (4-6 PM)"
            })
        
        return {
            "crop": crop,
            "growth_stage": stage,
            "soil_type": soil_type,
            "irrigation_method": method,
            "weekly_requirement_mm": round(irrigation_needed, 1),
            "schedule": schedule,
            "notes": [
                "Adjust based on actual rainfall",
                "Monitor soil moisture before irrigation",
                "Drip irrigation is 40% more efficient than flood irrigation"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 8: PEST & WEED ALERT SYSTEM ==========

PEST_ALERT_DB = {
    "high_humidity_high_temp": {
        "pests": ["Aphids", "Spider Mites", "Leaf Spot"],
        "risk_level": "High"
    },
    "moderate_humidity": {
        "pests": ["Whiteflies", "Mealybugs"],
        "risk_level": "Medium"
    },
    "low_humidity": {
        "pests": ["Grasshoppers", "Locusts"],
        "risk_level": "Medium"
    }
}

@app.post("/pest_alert")
async def pest_alert(
    region: str,
    crop_name: str,
    season: str,
    temperature: float,
    humidity: float,
    rainfall: float
):
    """Generate pest and weed alerts"""
    try:
        alerts = []
        
        # Determine humidity-temp risk profile
        if humidity > 70 and temperature > 25:
            risk_profile = "high_humidity_high_temp"
        elif 50 <= humidity <= 70:
            risk_profile = "moderate_humidity"
        else:
            risk_profile = "low_humidity"
        
        pest_info = PEST_ALERT_DB.get(risk_profile, {})
        
        alerts.append({
            "type": "Pest Alert",
            "pests": pest_info.get("pests", []),
            "risk_level": pest_info.get("risk_level", "Low"),
            "recommendations": [
                "Scout fields regularly for pest presence",
                "Use light traps in evening",
                "Apply recommended pesticides if threshold exceeded",
                "Encourage natural predators"
            ]
        })
        
        # Weed alerts based on season and rainfall
        if rainfall > 60 and season in ["monsoon", "spring"]:
            alerts.append({
                "type": "Weed Alert",
                "weeds": ["Cyperus rotundus", "Convolvulus arvensis"],
                "risk_level": "High",
                "recommendations": [
                    "Weed out manually or use herbicides",
                    "Mulch to prevent weed growth",
                    "Ensure field is clean before sowing"
                ]
            })
        
        return {
            "region": region,
            "crop": crop_name,
            "season": season,
            "alerts": alerts,
            "weather_conditions": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall": rainfall
            },
            "next_alert_in": "7 days"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 9: MARKET PRICE INTEGRATION ==========

MARKET_PRICE_DB = {
    "Rice": {"price_per_quintal": 2100, "trend": "stable", "region": "India"},
    "Wheat": {"price_per_quintal": 2500, "trend": "up", "region": "India"},
    "Tomato": {"price_per_kg": 12, "trend": "volatile", "region": "India"},
    "Cotton": {"price_per_quintal": 5800, "trend": "down", "region": "India"},
    "Corn": {"price_per_quintal": 1850, "trend": "stable", "region": "India"}
}

@app.get("/market_prices")
async def market_prices(crop_name: str = None):
    """Get current market prices for crops"""
    try:
        if crop_name and crop_name in MARKET_PRICE_DB:
            price_info = MARKET_PRICE_DB[crop_name]
            return {
                "crop": crop_name,
                "price_info": price_info,
                "last_updated": datetime.now().isoformat(),
                "note": "Prices are reference mandi rates. Actual prices vary by region."
            }
        else:
            all_prices = [{"crop": k, **v} for k, v in MARKET_PRICE_DB.items()]
            return {
                "crops": all_prices,
                "last_updated": datetime.now().isoformat()
            }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/revenue_estimate")
async def revenue_estimate(
    crop_name: str,
    predicted_yield: float,
    land_area_ha: float
):
    """Calculate estimated revenue based on yield and market price"""
    try:
        if crop_name not in MARKET_PRICE_DB:
            raise HTTPException(status_code=404, detail=f"Price data for {crop_name} not available")
        
        price_info = MARKET_PRICE_DB[crop_name]
        
        # Convert yield to appropriate unit
        if "quintal" in str(price_info):
            total_production = predicted_yield * land_area_ha * 10  # t/ha to quintal
            price_unit = "per quintal"
        else:
            total_production = predicted_yield * land_area_ha * 1000  # t/ha to kg
            price_unit = "per kg"
        
        price = list(price_info.values())[0]  # Get the price value
        total_revenue = total_production * price
        
        return {
            "crop": crop_name,
            "land_area_ha": land_area_ha,
            "predicted_yield_t_ha": predicted_yield,
            "total_production": round(total_production, 2),
            "market_price": f"₹{price} {price_unit}",
            "estimated_revenue": f"₹{total_revenue:,.0f}",
            "market_trend": price_info.get("trend", "stable"),
            "note": "This is an estimate. Actual revenue depends on crop quality and market fluctuations."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 10: GOVERNMENT SCHEMES FINDER ==========

GOVERNMENT_SCHEMES_DB = [
    {
        "name": "PM-KISAN",
        "description": "Direct cash transfer to farmers",
        "benefit": "₹6,000 per year in 3 installments",
        "eligibility": "All farmers",
        "applicable_states": "All states"
    },
    {
        "name": "Crop Insurance Scheme (PMFBY)",
        "description": "Insurance coverage for crop failure",
        "benefit": "Up to 100% compensation for crop loss",
        "eligibility": "Farmers growing notified crops",
        "applicable_states": "All states"
    },
    {
        "name": "Soil Health Card Scheme",
        "description": "Free soil testing and guidance",
        "benefit": "Free soil testing + recommendations",
        "eligibility": "All farmers",
        "applicable_states": "All states"
    },
    {
        "name": "Pradhan Mantri Krishi Sinchayee Yojana",
        "description": "Irrigation infrastructure development",
        "benefit": "50-75% subsidy on drip irrigation",
        "eligibility": "Farmers with own land",
        "applicable_states": "All states"
    }
]

@app.get("/government_schemes")
async def government_schemes(
    state: str = None,
    crop_name: str = None,
    land_size_ha: float = None
):
    """Find applicable government schemes"""
    try:
        schemes = GOVERNMENT_SCHEMES_DB
        
        if state:
            schemes = [s for s in schemes if state in s.get("applicable_states", "All states")]
        
        return {
            "schemes": schemes,
            "state": state or "All states",
            "message": "Visit your State Agriculture Department or agritech portal for application.",
            "helpful_links": [
                "https://pmkisan.gov.in",
                "https://agritech.tn.gov.in",
                "https://efarmer.gov.in"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 11: COMMUNITY FORUM ==========

@app.post("/forum/post")
async def create_forum_post(payload: ForumPostPayload):
    """Create a forum post for farmer doubts"""
    try:
        post_id = f"post_{len(forum_posts) + 1}"
        
        forum_posts[post_id] = {
            "post_id": post_id,
            "farmer_name": payload.farmer_name,
            "crop": payload.crop_name,
            "region": payload.region,
            "title": payload.title,
            "description": payload.description,
            "tags": payload.tags,
            "created_at": datetime.now().isoformat(),
            "answers": 0,
            "status": "open"
        }
        
        return {
            "status": "created",
            "post_id": post_id,
            "message": f"Your question '{payload.title}' has been posted! Experts and farmers will answer soon."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/forum/posts")
async def get_forum_posts(crop_name: str = None, region: str = None):
    """Get forum posts with optional filtering"""
    try:
        posts = list(forum_posts.values())
        
        if crop_name:
            posts = [p for p in posts if p["crop"].lower() == crop_name.lower()]
        
        if region:
            posts = [p for p in posts if p["region"].lower() == region.lower()]
        
        return {
            "total_posts": len(posts),
            "posts": posts
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/forum/answer")
async def answer_forum_post(payload: ForumAnswerPayload):
    """Post an answer to a forum question"""
    try:
        if payload.post_id not in forum_posts:
            raise HTTPException(status_code=404, detail="Post not found")
        
        answer_id = f"answer_{len(forum_answers) + 1}"
        
        forum_answers[answer_id] = {
            "answer_id": answer_id,
            "post_id": payload.post_id,
            "responder_name": payload.responder_name,
            "answer": payload.answer,
            "is_expert": payload.is_expert,
            "created_at": datetime.now().isoformat(),
            "helpful_votes": 0
        }
        
        forum_posts[payload.post_id]["answers"] += 1
        
        return {
            "status": "posted",
            "answer_id": answer_id,
            "message": "Your answer has been posted successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 12: WATER AUDIT & SAVINGS ==========

@app.post("/water_audit")
async def water_audit(
    water_used_mm: float,
    crop_name: str,
    irrigation_method: str,
    land_area_ha: float
):
    """Audit water usage and suggest savings"""
    try:
        # Reference water usage
        reference_usage = {
            "Rice": 1200,
            "Wheat": 400,
            "Corn": 500,
            "Tomato": 400,
            "Cotton": 700
        }
        
        reference = reference_usage.get(crop_name, 600)
        
        # Efficiency of different methods
        efficiency = {
            "Flood": 40,
            "Sprinkler": 70,
            "Drip": 95
        }
        
        current_efficiency = efficiency.get(irrigation_method, 60)
        reference_efficiency = 50  # Typical flood irrigation
        
        # Calculate comparison
        actual_water = water_used_mm
        expected_water = (reference * current_efficiency) / 100
        difference = actual_water - expected_water
        
        # Water cost estimate
        water_cost_per_mm = 50  # ₹ per mm per hectare (approximate)
        total_cost = actual_water * land_area_ha * water_cost_per_mm
        
        record = {
            "timestamp": datetime.now().isoformat(),
            "crop": crop_name,
            "water_used_mm": water_used_mm,
            "method": irrigation_method,
            "area_ha": land_area_ha
        }
        
        water_usage_records[datetime.now().isoformat()] = record
        
        return {
            "crop": crop_name,
            "water_used_mm": water_used_mm,
            "expected_water_mm": round(expected_water, 1),
            "difference_mm": round(difference, 1),
            "efficiency_percent": current_efficiency,
            "total_water_cost": round(total_cost, 2),
            "recommendations": [
                "Switch to drip irrigation to save 25-30% water" if irrigation_method != "Drip" else "Great! You're using efficient drip irrigation",
                "Mulch fields to reduce evaporation",
                "Schedule irrigation early morning/evening",
                "Monitor soil moisture before irrigation"
            ] if difference > 0 else ["Your water usage is optimal!"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== NEW FEATURE 13: CROP-SPECIFIC ADVISORY TIMELINE ==========

CROP_TIMELINE_DB = {
    "Rice": {
        "Month 1": ["Land preparation", "Field leveling", "Seed selection and treatment"],
        "Month 2": ["Sowing", "Water management", "Nursery care"],
        "Month 3": ["Transplanting", "Weed management", "Nitrogen application"],
        "Month 4": ["Monitoring growth", "Pest surveillance", "Second nitrogen dose"],
        "Month 5": ["Flowering stage", "Irrigation scheduling", "Disease monitoring"],
        "Month 6": ["Harvesting", "Threshing", "Drying and storage"]
    },
    "Wheat": {
        "Month 1": ["Soil testing", "Field preparation", "Variety selection"],
        "Month 2": ["Sowing", "Seed dressing", "Pre-emergence herbicide"],
        "Month 3": ["Early growth stage", "First irrigation", "Nitrogen application"],
        "Month 4": ["Tillering stage", "Second irrigation", "Weed control"],
        "Month 5": ["Flowering", "Third irrigation", "Pest monitoring"],
        "Month 6": ["Maturity", "Harvesting", "Threshing and storage"]
    }
}

@app.post("/crop_advisory_timeline")
async def crop_advisory_timeline(crop_name: str, region: str):
    """Get month-by-month advisory for a crop"""
    try:
        timeline = CROP_TIMELINE_DB.get(crop_name, {})
        
        if not timeline:
            raise HTTPException(status_code=404, detail=f"Timeline for {crop_name} not available")
        
        return {
            "crop": crop_name,
            "region": region,
            "season_duration_months": len(timeline),
            "timeline": timeline,
            "notification_preference": "Set push notifications for monthly reminders"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========== HEALTH CHECK ==========

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "Crop Recommendation",
            "Yield Prediction",
            "Soil Health Monitoring",
            "Fertilizer Recommendation",
            "Field Performance Comparison",
            "Expense Tracking",
            "Weather Advisories",
            "Crop Rotation Guidance",
            "Irrigation Scheduling",
            "Pest & Weed Alerts",
            "Market Price Integration",
            "Revenue Estimation",
            "Government Schemes",
            "Community Forum",
            "Water Audit",
            "Crop Advisory Timeline"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
