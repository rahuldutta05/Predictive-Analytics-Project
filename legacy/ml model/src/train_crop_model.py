# train_crop_model.py
# Trains a Random Forest Classifier for crop recommendation (Top-K output)
# Output: models/crop_recommendation_topk_model.pkl
#
# Approach: SIH hyperparameters (300 estimators) + RepeatedKFold & Monte Carlo CV
# Features : N, P, K, temperature, humidity, ph, rainfall  (7 agronomic inputs)

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
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH  = os.path.join(BASE_DIR, "data", "Crop_recommendation_balanced.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "crop_recommendation_topk_model.pkl")

RANDOM_STATE = 42
FEATURE_COLS = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# ──────────────────────────────────────────────
# 1. Load Dataset
# ──────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
X  = df[FEATURE_COLS]
y  = df["label"]

print(f"Dataset   : {df.shape[0]} samples, {df.shape[1]} columns")
print(f"Crops     : {y.nunique()} unique — {sorted(y.unique())}")
print(f"Class balance:\n{y.value_counts().to_string()}\n")

# ──────────────────────────────────────────────
# 2. EDA — Correlation heatmap + class distribution
# ──────────────────────────────────────────────
fig, axes = plt.subplots(1, 2, figsize=(16, 5))

corr = df[FEATURE_COLS].corr()
sns.heatmap(corr, annot=True, fmt=".2f", cmap="RdYlGn", ax=axes[0])
axes[0].set_title("Feature Correlation Matrix")

y.value_counts().sort_values().plot(kind="barh", ax=axes[1], color="steelblue")
axes[1].set_title("Crop Class Distribution")
axes[1].set_xlabel("Sample Count")

plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "crop_eda.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 3. Train / Test Split  (80/20, stratified)
# ──────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
)
print(f"Train : {X_train.shape[0]} samples")
print(f"Test  : {X_test.shape[0]} samples\n")

# ──────────────────────────────────────────────
# 4. Pipeline: StandardScaler + RandomForest
#    300 estimators (SIH approach — better than 200)
#    n_jobs=-1 for parallel training
# ──────────────────────────────────────────────
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("model", RandomForestClassifier(
        n_estimators=300,
        min_samples_leaf=2,
        max_features="sqrt",
        random_state=RANDOM_STATE,
        n_jobs=-1
    ))
])

t0 = time.time()
pipeline.fit(X_train, y_train)
print(f"Training complete in {time.time() - t0:.1f}s\n")

# ──────────────────────────────────────────────
# 5. Evaluate on Test Set
# ──────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
acc    = accuracy_score(y_test, y_pred)

print("📊 Model Performance on Test Data:")
print(f"   Accuracy : {acc * 100:.2f}%\n")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Confusion matrix
cm = confusion_matrix(y_test, y_pred, labels=pipeline.classes_)
fig, ax = plt.subplots(figsize=(14, 12))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=pipeline.classes_,
            yticklabels=pipeline.classes_, ax=ax)
ax.set_title("Confusion Matrix — Test Set")
ax.set_xlabel("Predicted")
ax.set_ylabel("Actual")
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "crop_confusion_matrix.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 6. Cross-Validation (RepeatedKFold + Monte Carlo)
# ──────────────────────────────────────────────
rkf       = RepeatedKFold(n_splits=10, n_repeats=5, random_state=None)
rkf_scores = cross_val_score(pipeline, X, y, cv=rkf, scoring="accuracy", n_jobs=-1)
print(f"Repeated K-Fold CV  — Mean: {rkf_scores.mean() * 100:.2f}%  Std: {rkf_scores.std() * 100:.2f}%")

ss        = ShuffleSplit(n_splits=20, test_size=0.2, random_state=None)
ss_scores = cross_val_score(pipeline, X, y, cv=ss,  scoring="accuracy", n_jobs=-1)
print(f"Monte Carlo CV      — Mean: {ss_scores.mean() * 100:.2f}%  Std: {ss_scores.std() * 100:.2f}%\n")

# CV box plot
fig, ax = plt.subplots(figsize=(8, 4))
ax.boxplot([rkf_scores * 100, ss_scores * 100],
           labels=["Repeated K-Fold", "Monte Carlo"],
           patch_artist=True,
           boxprops=dict(facecolor="lightgreen"))
ax.set_ylabel("Accuracy (%)")
ax.set_title("Cross-Validation Score Distribution")
ax.set_ylim(96, 101)
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "crop_cv_scores.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 7. Feature Importance
# ──────────────────────────────────────────────
importances = pipeline.named_steps["model"].feature_importances_
feat_series = pd.Series(importances, index=FEATURE_COLS).sort_values(ascending=False)
print("Feature Importances:")
print(feat_series.to_string())

fig, ax = plt.subplots(figsize=(8, 4))
feat_series.sort_values().plot(kind="barh", ax=ax, color="darkorange")
ax.set_title("Feature Importances — Crop Recommendation")
ax.set_xlabel("Mean Decrease in Impurity")
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "models", "crop_feature_importance.png"), dpi=120, bbox_inches="tight")
plt.close()

# ──────────────────────────────────────────────
# 8. Top-K Prediction Helper
# ──────────────────────────────────────────────
def predict_top_k(model_pipeline, input_data: dict, k: int = 3):
    """
    Return top-k crop recommendations with probability scores.

    Parameters
    ----------
    model_pipeline : fitted sklearn Pipeline
    input_data     : dict with keys N, P, K, temperature, humidity, ph, rainfall
    k              : number of crops to return

    Returns
    -------
    list of (crop_name: str, probability: float) tuples
    """
    row     = pd.DataFrame([input_data])[FEATURE_COLS]
    probs   = model_pipeline.predict_proba(row)[0]
    classes = model_pipeline.classes_
    top_idx = np.argsort(probs)[::-1][:k]
    return [(classes[i], round(float(probs[i]) * 100, 2)) for i in top_idx]


# Smoke test
sample = X_test.iloc[0].to_dict()
print(f"\nSample input : {sample}")
print(f"Actual crop  : {y_test.iloc[0]}")
print("\nTop-3 recommendations:")
for crop, prob in predict_top_k(pipeline, sample, k=3):
    print(f"  {crop:<15s}  {prob:.2f}%")

t0 = time.time()
for _ in range(1000):
    pipeline.predict_proba(pd.DataFrame([sample])[FEATURE_COLS])
print(f"\nAvg inference time : {(time.time() - t0):.3f}s per 1000 calls")

# ──────────────────────────────────────────────
# 9. Save Pipeline
# ──────────────────────────────────────────────
joblib.dump(pipeline, MODEL_PATH)
size_mb = os.path.getsize(MODEL_PATH) / 1024 / 1024
print(f"\n✅ Saved → {MODEL_PATH}")
print(f"   Model size : {size_mb:.2f} MB")
