# Machine Learning Models

This directory contains the source code, data, and trained models for crop recommendation and yield prediction.

## Overview

We utilize two primary models to provide agricultural insights:
1.  **Crop Recommendation Model**: A Random Forest Classifier that suggests the best crops to grow based on soil and weather conditions.
2.  **Yield Prediction Model**: A Random Forest Regressor that forecasts the expected yield (tonnes/hectare) for a chosen scenario.

## Dataset

The models are trained on the [Crop_recommendation_balanced.csv](data/Crop_recommendation_balanced.csv) dataset, which include:
- **Agronomic Inputs (7)**: Nitrogen (N), Phosphorous (P), Potassium (K), Temperature, Humidity, pH, and Rainfall.
- **Additional Yield Features (4)**: Organic Carbon (Soil_OC), Fertilizer usage, Pest Index, and Irrigation.

## Training Process

The training scripts are located in the `src/` directory.

### 1. Crop Recommendation ([train_crop_model.py](src/train_crop_model.py))
- **Model**: Random Forest Classifier (300 estimators).
- **Preprocessing**: `StandardScaler` for feature normalization.
- **Evaluation**: 
    - achieves ~99% accuracy on test data.
    - Verified using **Repeated K-Fold** and **Monte Carlo Cross-Validation**.
- **Output**: `models/crop_recommendation_topk_model.pkl`.

### 2. Yield Prediction ([train_yield_model.py](src/train_yield_model.py))
- **Model**: Random Forest Regressor (300 estimators, restricted `max_depth=10` for better generalization).
- **Feature Engineering**: Engineered interactions like `Nutrient_Balance_Index` and `Stress_Index` while strictly avoiding target leakage.
- **Inference Efficiency**: The model is regularized to be lean (~10MB) for fast API response times.
- **Output**: `models/yield_predictor.pkl`.

## Usage

The trained models are loaded by the FastAPI backend to serve predictions to the frontend dashboard. To retrain the models, ensure you have the requirements installed and run the scripts in `src/`.

```bash
python src/train_crop_model.py
python src/train_yield_model.py
```
