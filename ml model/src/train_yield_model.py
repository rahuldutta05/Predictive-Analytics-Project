# train_yield_model.py
# Trains a Random Forest Regressor for crop yield prediction
# Output: models/yield_predictor.pkl
#
# Approach  : SIH hyperparameters (300 estimators, max_depth=10)
#             + clean feature engineering (no data leakage)
#             + RepeatedKFold & Monte Carlo CV
#


import os
import time
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import (
    train_test_split, cross_val_score,
    RepeatedKFold, ShuffleSplit
)
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH  = os.path.join(BASE_DIR, "data", "Crop_recommendation_balanced.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "yield_predictor.pkl")

RANDOM_STATE = 42

# ──────────────────────────────────────────────
# 1. Load Dataset
# ──────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)

print(f"Dataset    : {df.shape[0]} samples, {df.shape[1]} columns")
print(f"Yield range: {df['Yield_t_ha'].min():.2f} – {df['Yield_t_ha'].max():.2f} t/ha\n")

# ──────────────────────────────────────────────
# 2. Feature Engineering  (clean — no leakage)
#    All 5 derived features use ONLY input variables,
#    never the target (Yield_t_ha).
# ──────────────────────────────────────────────
df["Nutrient_Balance_Index"]          = (df["N"] + df["P"] + df["K"]) / 3
df["Stress_Index"]                    = df["temperature"] * (1 - df["humidity"] / 100)
df["Rainfall_N_Interaction"]          = df["rainfall"] * df["N"]
df["Temp_Humidity_Interaction"]       = df["temperature"] * df["humidity"]
df["Fertilizer_Rainfall_Interaction"] = df["Fertilizer_kg_ha"] * df["rainfall"]

FEATURE_COLS = [
    # 11 raw inputs
    "N", "P", "K", "temperature", "humidity", "ph", "rainfall",
    "Soil_OC", "Fertilizer_kg_ha", "Pest_Index", "Irrigation_mm",
    # 5 engineered (no leakage)
    "Nutrient_Balance_Index", "Stress_Index",
    "Rainfall_N_Interaction", "Temp_Humidity_Interaction",
    "Fertilizer_Rainfall_Interaction",
]

X = df[FEATURE_COLS]
y = df["Yield_t_ha"]

print(f"Total features : {len(FEATURE_COLS)} (11 raw + 5 engineered)")
print(f"Missing values : {X.isnull().sum().sum()}\n")

# ──────────────────────────────────────────────
# 3. EDA
# ──────────────────────────────────────────────
raw_cols = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall",
            "Soil_OC", "Fertilizer_kg_ha", "Pest_Index", "Irrigation_mm"]

fig, axes = plt.subplots(1, 2, figsize=(16, 5))

axes[0].hist(y, bins=40, color="steelblue", edgecolor="white")
axes[0].set_title("Yield Distribution (t/ha)")
axes[0].set_xlabel("Yield (t/ha)")
axes[0].set_ylabel("Count")

corr_with_yield = df[raw_cols + ["Yield_t_ha"]].corr()["Yield_t_ha"].drop("Yield_t_ha").sort_values()
corr_with_yield.plot(kind="barh", ax=axes[1], color=[
    "tomato" if v < 0 else "mediumseagreen" for v in corr_with_yield
])
axes[1].set_title("Feature Correlation with Yield")
axes[1].set_xlabel("Pearson Correlation")
axes[1].axvline(0, color="black", linewidth=0.8)

plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "yield_eda.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 4. Train / Test Split  (80/20)
# ──────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE
)
print(f"Train : {X_train.shape[0]} samples")
print(f"Test  : {X_test.shape[0]} samples\n")

# ──────────────────────────────────────────────
# 5. Pipeline: StandardScaler + RandomForest
#    SIH hyperparameters:
#      n_estimators=300  → better accuracy than 200
#      max_depth=10      → regularized, ~4x smaller model
#      min_samples_leaf=5 → prevents leaf overfitting
# ──────────────────────────────────────────────
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        min_samples_leaf=5,
        max_features="sqrt",
        random_state=RANDOM_STATE,
        n_jobs=-1
    ))
])

t0 = time.time()
pipeline.fit(X_train, y_train)
print(f"Training complete in {time.time() - t0:.1f}s\n")

# ──────────────────────────────────────────────
# 6. Evaluate on Test Set
# ──────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
r2     = r2_score(y_test, y_pred)
mae    = mean_absolute_error(y_test, y_pred)
rmse   = np.sqrt(mean_squared_error(y_test, y_pred))

print("📊 Model Performance on Test Data:")
print(f"   R²   : {r2:.4f}  ({r2 * 100:.2f}%)")
print(f"   MAE  : {mae:.4f} t/ha")
print(f"   RMSE : {rmse:.4f} t/ha\n")

# Actual vs Predicted + Residuals
fig, axes = plt.subplots(1, 2, figsize=(14, 5))

axes[0].scatter(y_test, y_pred, alpha=0.3, s=10, color="steelblue")
lims = [y_test.min(), y_test.max()]
axes[0].plot(lims, lims, "r--", linewidth=1.5, label="Perfect prediction")
axes[0].set_xlabel("Actual Yield (t/ha)")
axes[0].set_ylabel("Predicted Yield (t/ha)")
axes[0].set_title(f"Actual vs Predicted  (R²={r2:.4f})")
axes[0].legend()

residuals = y_test - y_pred
axes[1].hist(residuals, bins=40, color="coral", edgecolor="white")
axes[1].axvline(0, color="black", linestyle="--")
axes[1].set_title("Residual Distribution")
axes[1].set_xlabel("Residual (t/ha)")

plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "yield_actual_vs_predicted.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 7. Cross-Validation (RepeatedKFold + Monte Carlo)
# ──────────────────────────────────────────────
rkf        = RepeatedKFold(n_splits=10, n_repeats=5, random_state=None)
rkf_scores = cross_val_score(pipeline, X, y, cv=rkf, scoring="r2", n_jobs=-1)
print(f"Repeated K-Fold CV  — Mean R²: {rkf_scores.mean() * 100:.2f}%  Std: {rkf_scores.std() * 100:.2f}%")

ss         = ShuffleSplit(n_splits=20, test_size=0.2, random_state=None)
ss_scores  = cross_val_score(pipeline, X, y, cv=ss,  scoring="r2", n_jobs=-1)
print(f"Monte Carlo CV      — Mean R²: {ss_scores.mean() * 100:.2f}%  Std: {ss_scores.std() * 100:.2f}%\n")

fig, ax = plt.subplots(figsize=(8, 4))
ax.boxplot([rkf_scores * 100, ss_scores * 100],
           labels=["Repeated K-Fold", "Monte Carlo"],
           patch_artist=True,
           boxprops=dict(facecolor="lightyellow"))
ax.set_ylabel("R² Score (%)")
ax.set_title("Cross-Validation R² Distribution")
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "yield_cv_scores.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 8. Feature Importance (Top 10)
# ──────────────────────────────────────────────
importances = pipeline.named_steps["model"].feature_importances_
feat_series = pd.Series(importances, index=FEATURE_COLS).sort_values(ascending=False)

print("Top-10 Feature Importances:")
print(feat_series.head(10).to_string())

fig, ax = plt.subplots(figsize=(9, 5))
feat_series.head(10).sort_values().plot(kind="barh", ax=ax, color="darkorange")
ax.set_title("Top-10 Feature Importances — Yield Predictor")
ax.set_xlabel("Mean Decrease in Impurity")
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "yield_feature_importance.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 9. Prediction Helper
# ──────────────────────────────────────────────
def predict_yield(model_pipeline, input_data: dict) -> float:
    """
    Predict crop yield in tonnes/hectare.

    Parameters
    ----------
    model_pipeline : fitted sklearn Pipeline
    input_data     : dict with 11 raw feature keys:
                     N, P, K, temperature, humidity, ph, rainfall,
                     Soil_OC, Fertilizer_kg_ha, Pest_Index, Irrigation_mm

    Returns
    -------
    float — predicted yield (t/ha)
    """
    row = pd.DataFrame([input_data])
    row["Nutrient_Balance_Index"]          = (row["N"] + row["P"] + row["K"]) / 3
    row["Stress_Index"]                    = row["temperature"] * (1 - row["humidity"] / 100)
    row["Rainfall_N_Interaction"]          = row["rainfall"] * row["N"]
    row["Temp_Humidity_Interaction"]       = row["temperature"] * row["humidity"]
    row["Fertilizer_Rainfall_Interaction"] = row["Fertilizer_kg_ha"] * row["rainfall"]
    return round(float(model_pipeline.predict(row[FEATURE_COLS])[0]), 4)


# Smoke test
raw_keys   = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall",
              "Soil_OC", "Fertilizer_kg_ha", "Pest_Index", "Irrigation_mm"]
sample     = {k: float(X_test[k].iloc[0]) for k in raw_keys}
predicted  = predict_yield(pipeline, sample)
actual     = float(y_test.iloc[0])

print(f"\nSample input    : {sample}")
print(f"Predicted yield : {predicted} t/ha")
print(f"Actual yield    : {actual} t/ha")
print(f"Error           : {abs(predicted - actual):.4f} t/ha")

t0 = time.time()
for _ in range(1000):
    predict_yield(pipeline, sample)
print(f"\nAvg inference time : {(time.time() - t0):.3f}s per 1000 calls")

# ──────────────────────────────────────────────
# 10. Save Pipeline
# ──────────────────────────────────────────────
joblib.dump(pipeline, MODEL_PATH)
size_mb = os.path.getsize(MODEL_PATH) / 1024 / 1024
print(f"\n✅ Saved → {MODEL_PATH}")
print(f"   Model size : {size_mb:.2f} MB")
print(f"   (vs ~51 MB unregularized — max_depth=10 keeps it lean)")
