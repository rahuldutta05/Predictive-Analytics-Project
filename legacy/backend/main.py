import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="AgriSense API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to models
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "ml model", "models")
CROP_MODEL_PATH = os.path.join(MODEL_DIR, "crop_recommendation_topk_model.pkl")
YIELD_MODEL_PATH = os.path.join(MODEL_DIR, "yield_predictor.pkl")

# Load models
try:
    crop_pipeline = joblib.load(CROP_MODEL_PATH)
    yield_pipeline = joblib.load(YIELD_MODEL_PATH)
    print("Models loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    crop_pipeline = None
    yield_pipeline = None

# Feature lists
CROP_FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
YIELD_RAW_COLS = [
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
    "Soil_OC", "Fertilizer_kg_ha", "Pest_Index", "Irrigation_mm"
]

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

class RecommendCropPayload(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.post("/predict_yield")
async def predict_yield_endpoint(payload: PredictYieldPayload):
    if yield_pipeline is None:
        raise HTTPException(status_code=500, detail="Yield model not loaded")
    
    try:
        data = payload.dict()
        row = pd.DataFrame([data])
        
        # Add engineered features (matching train_yield_model.py)
        row["Nutrient_Balance_Index"]          = (row["N"] + row["P"] + row["K"]) / 3
        row["Stress_Index"]                    = row["temperature"] * (1 - row["humidity"] / 100)
        row["Rainfall_N_Interaction"]          = row["rainfall"] * row["N"]
        row["Temp_Humidity_Interaction"]       = row["temperature"] * row["humidity"]
        row["Fertilizer_Rainfall_Interaction"] = row["Fertilizer_kg_ha"] * row["rainfall"]
        
        # Final feature set in correct order
        FEATURE_COLS = [
            "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
            "Soil_OC", "Fertilizer_kg_ha", "Pest_Index", "Irrigation_mm",
            "Nutrient_Balance_Index", "Stress_Index",
            "Rainfall_N_Interaction", "Temp_Humidity_Interaction",
            "Fertilizer_Rainfall_Interaction",
        ]
        
        prediction = yield_pipeline.predict(row[FEATURE_COLS])[0]
        
        return {
            "predicted_yield_t_ha": round(float(prediction), 4),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/recommend_crop")
async def recommend_crop_endpoint(payload: RecommendCropPayload, k: int = 3):
    if crop_pipeline is None:
        raise HTTPException(status_code=500, detail="Crop model not loaded")
    
    try:
        data = payload.dict()
        row = pd.DataFrame([data])[CROP_FEATURE_COLS]
        
        probs = crop_pipeline.predict_proba(row)[0]
        classes = crop_pipeline.classes_
        top_idx = probs.argsort()[::-1][:k]
        
        top_crops = [
            {"crop": classes[i], "probability": round(float(probs[i]) * 100, 2)}
            for i in top_idx
        ]
        
        return {
            "top_crops": top_crops,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
