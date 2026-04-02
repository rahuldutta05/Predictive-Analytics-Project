# Ensemble Upgrade Analysis: Crop Yield Prediction

## Current State Summary

| Aspect | Crop Classifier | Yield Regressor |
|---|---|---|
| **Algorithm** | Random Forest Classifier | Random Forest Regressor |
| **Estimators** | 300 trees | 300 trees |
| **Max Depth** | Unlimited (full-depth) | 10 (capped) |
| **Min Samples Leaf** | 2 | 5 |
| **Max Features** | sqrt | sqrt |
| **Pipeline** | StandardScaler + RF | StandardScaler + RF |
| **Features** | 7 raw agronomic | 11 raw + 5 engineered (16 total) |
| **Dataset** | 8800 rows, 22 balanced classes | 8800 rows, yield range 0.5–45.34 t/ha |
| **CV Strategy** | RepeatedKFold + Monte Carlo | RepeatedKFold + Monte Carlo |

### Key Weaknesses in Current Approach

1. **Single-model risk**: Both tasks depend 100% on a single Random Forest. There's no diversity — if the RF makes a systematic error on certain crop types, it propagates unchecked.
2. **Crop Classifier: Unlimited tree depth** — with no `max_depth`, the 300 trees can fully overfit to SMOTE-generated synthetic samples, inflating training accuracy.
3. **Yield Regressor: Standard scaling is unnecessary for RFs** — tree-based models are inherently scale-invariant. The scaler adds computation with zero benefit.
4. **No confidence calibration for the classifier** — `predict_proba` from a vanilla RF is known to be overconfident and not reliably probabilistic.
5. **No hyperparameter search** — the `n_estimators=300` hyperparameters are fixed heuristically (SIH approach), not tuned via cross-validation.
6. **SMOTE oversampling bias** — since the dataset was expanded to 8800 via SMOTE (400 per class × 22 classes), the synthetic samples could introduce noise. Ensemble methods that subsample base learners naturally reduce SMOTE bias.

---

## Recommended Ensemble Approaches

### Task 1: Crop Recommendation Classifier (22 classes)

#### ✅ Recommended: Voting Ensemble (Hard + Soft) with Calibration

Combine three diverse, strong classifiers that each learn differently:

| Base Learner | Strength | Why include |
|---|---|---|
| **Random Forest** (depth=15) | Bagging, low variance | Strong baseline, already proven |
| **Gradient Boosting (XGBoost)** | Sequential error correction | Captures residual patterns RF misses |
| **Extra Trees Classifier** | Extreme randomness | Reduces SMOTE overfitting via high entropy splits |

**Final combiner**: `SoftVotingClassifier` — averages calibrated probabilities from all three.

The RF and Extra Trees use `CalibratedClassifierCV` (isotonic regression) to fix the overconfident `predict_proba` problem before voting.

```
Input (7 features)
     ├──> [RF Classifier] ──> CalibratedCV ──┐
     ├──> [XGBoost Classifier]               ├──> SoftVoting ──> Top-K crops
     └──> [Extra Trees]  ──> CalibratedCV ──┘
```

**Expected improvement**: +1–2% accuracy, significantly better probability calibration for Top-K ranking.

---

### Task 2: Yield Prediction Regressor (continuous output)

#### ✅ Recommended: Stacking Ensemble (Level-1 meta-learner)

This is the most powerful approach for tabular regression. Base models each capture different aspects of the data:

| Base Learner | What it captures |
|---|---|
| **Random Forest Regressor** (depth=10) | Non-linear interactions via bagging |
| **Gradient Boosting (XGBoost)** | Residual patterns, gradient error correction |
| **Ridge Regression** | Linear trends, fast, generalizes well |

**Meta-learner**: `Ridge Regression` — takes the 3 out-of-fold base predictions and learns the optimal weighted combination. This is trained on held-out fold predictions (out-of-fold stacking), preventing data leakage.

```
Input (16 features)
     ├──> [RF Regressor]    ─ out-of-fold predictions ─┐
     ├──> [XGBoost]         ─ out-of-fold predictions ─┼──> [Ridge Meta-Learner] ──> Yield (t/ha)
     └──> [Ridge Regressor] ─ out-of-fold predictions ─┘
```

**Expected improvement**: +3–5% R², lower RMSE, more robust across diverse crop types.

---

## Comparison Table

| Metric | Current RF | Proposed Ensemble |
|---|---|---|
| **Architecture** | Single estimator | Voting (classifier) / Stacking (regressor) |
| **Diversity** | None | 3 different learning algorithms |
| **SMOTE robustness** | Low (pure RF overfits synthetic) | High (ensemble averages noise out) |
| **Probability calibration** | No | Yes (isotonic calibration) |
| **Overfitting risk** | Medium-High (no depth limit on classifier) | Low (diverse regularization) |
| **Training time** | ~Fast | ~3–4× longer, still very manageable |
| **Model size (pkl)** | 38 MB crop / 10 MB yield | Will be larger (~2–3× per model) |
| **Expected Crop Accuracy** | ~99% (RF, on SMOTE data) | Same / slightly higher, better calibrated |
| **Expected Yield R²** | ~85–90% | ~90–94% |

---

## Implementation Plan

> [!IMPORTANT]
> The new models will be saved with new names so the existing ones are preserved as fallback.
> - `crop_recommendation_topk_model.pkl` → new: `crop_ensemble_v2.pkl`  
> - `yield_predictor.pkl` → new: `yield_ensemble_v2.pkl`
> - `backend/main.py` paths will be updated to point to the new models.

### Files to create / modify

1. **[NEW]** `ml model/src/train_crop_ensemble.py` — Voting ensemble for classifier
2. **[NEW]** `ml model/src/train_yield_ensemble.py` — Stacking ensemble for regressor
3. **[MODIFY]** `backend/main.py` — Update `MODEL_DIR` paths + feature engineering  
4. **[MODIFY]** `ml model/requirements.txt` — Add `xgboost`

### Dependencies to add

```
xgboost>=2.0.0
```

---

## Shall I proceed?

Reply **yes** and I will:
1. Write both new training scripts
2. Install `xgboost` in the ML environment
3. Run training and show you the before/after metrics comparison
4. Update `backend/main.py` to use the new models
