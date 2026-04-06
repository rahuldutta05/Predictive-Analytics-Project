#!/usr/bin/env python
# coding: utf-8

# In[150]:


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px


# In[151]:


df = pd.read_csv("yield_prediction_dataset.csv")


# In[152]:


df.head()


# In[153]:


df.info()


# In[154]:


df.describe()


# In[155]:


# df.duplicated().sum()
df.isnull().sum()


# In[156]:


df.nunique()


# In[157]:


from sklearn.preprocessing import OneHotEncoder
import pandas as pd

encoder = OneHotEncoder(sparse_output=False)  # IMPORTANT

encoded = encoder.fit_transform(df[['label']])

encoded_df = pd.DataFrame(
    encoded,
    columns=encoder.get_feature_names_out(['label'])
)

df = df.drop('label', axis=1)
df = pd.concat([df, encoded_df], axis=1)


# In[158]:


df.isnull().sum()


# In[159]:


df.shape


# In[160]:


import numpy as np

# Remove invalid values
df = df[df['N'] >= 0]
df = df[df['rainfall'] >= 0]

# Clip based on boxplot/domain
df['P'] = df['P'].clip(upper=120)
df['K'] = df['K'].clip(upper=120)
df['ph'] = df['ph'].clip(4, 9)

df['rainfall'] = df['rainfall'].clip(upper=250)

df['Fertilizer_kg_ha'] = df['Fertilizer_kg_ha'].clip(upper=350)

df['Irrigation_mm'] = df['Irrigation_mm'].clip(250, 600)


# In[161]:


df['Yield_t_ha'] = np.log1p(df['Yield_t_ha'])


# In[162]:


X = df.drop('Yield_t_ha', axis=1)
y = df['Yield_t_ha']


# In[163]:


from sklearn.preprocessing import StandardScaler
import pandas as pd

scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)


# In[164]:


from sklearn.model_selection import train_test_split

# Train-Test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train-Validation
X_train, X_val, y_train, y_val = train_test_split(
    X_train, y_train, test_size=0.25, random_state=42
)


# In[166]:


from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error
import numpy as np
import matplotlib.pyplot as plt

gbr = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)

gbr.fit(X_train, y_train)

gb_train_errors = []
gb_val_errors = []

# Train errors
for y_pred in gbr.staged_predict(X_train):
    gb_train_errors.append(np.sqrt(mean_squared_error(y_train, y_pred)))

# Val errors
for y_pred in gbr.staged_predict(X_val):
    gb_val_errors.append(np.sqrt(mean_squared_error(y_val, y_pred)))

# Print epoch-wise
for i in range(len(gb_train_errors)):
    print(f"GB Epoch {i+1} | Train RMSE: {gb_train_errors[i]:.4f} | Val RMSE: {gb_val_errors[i]:.4f}")

# Plot
plt.figure()
plt.plot(gb_train_errors, label="Train RMSE")
plt.plot(gb_val_errors, label="Val RMSE")
plt.xlabel("Epoch")
plt.ylabel("RMSE")
plt.title("Gradient Boosting Learning Curve")
plt.legend()
plt.show()


# In[169]:


import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error

gbr = GradientBoostingRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)

gbr.fit(X_train, y_train)

train_errors = []
val_errors = []

# Track errors
for y_pred in gbr.staged_predict(X_train):
    train_errors.append(np.sqrt(mean_squared_error(y_train, y_pred)))

for y_pred in gbr.staged_predict(X_val):
    val_errors.append(np.sqrt(mean_squared_error(y_val, y_pred)))

# Find best epoch
best_epoch = np.argmin(val_errors)
print("Best Epoch:", best_epoch + 1)

# Retrain with best epoch
best_model = GradientBoostingRegressor(
    n_estimators=best_epoch + 1,
    learning_rate=0.1,
    max_depth=3,
    random_state=42
)

best_model.fit(X_train, y_train)


# In[170]:


from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error
import numpy as np

xgb = XGBRegressor(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=4,
    random_state=42
)

xgb.fit(
    X_train, y_train,
    eval_set=[(X_train, y_train), (X_val, y_val)],
    verbose=True
)


# In[171]:


results = xgb.evals_result()

train_rmse = results['validation_0']['rmse']
val_rmse = results['validation_1']['rmse']

import matplotlib.pyplot as plt

plt.figure()
plt.plot(train_rmse, label="Train RMSE")
plt.plot(val_rmse, label="Val RMSE")
plt.xlabel("Epoch")
plt.ylabel("RMSE")
plt.title("XGBoost Learning Curve")
plt.legend()
plt.show()


# In[172]:


import pandas as pd
import matplotlib.pyplot as plt

importance = best_model.feature_importances_
features = X_train.columns

imp_df = pd.DataFrame({
    'Feature': features,
    'Importance': importance
}).sort_values(by='Importance', ascending=False)

print(imp_df)

# Plot
plt.figure()
plt.barh(imp_df['Feature'], imp_df['Importance'])
plt.gca().invert_yaxis()
plt.title("Feature Importance (GB)")
plt.show()


# In[173]:


importance = xgb.feature_importances_

imp_df = pd.DataFrame({
    'Feature': X_train.columns,
    'Importance': importance
}).sort_values(by='Importance', ascending=False)

print(imp_df)

plt.figure()
plt.barh(imp_df['Feature'], imp_df['Importance'])
plt.gca().invert_yaxis()
plt.title("Feature Importance (XGBoost)")
plt.show()


# In[176]:


import optuna
from sklearn.metrics import mean_squared_error
from sklearn.ensemble import GradientBoostingRegressor
import numpy as np

def objective_gb(trial):
    model = GradientBoostingRegressor(
        n_estimators=trial.suggest_int('n_estimators', 50, 200),
        learning_rate=trial.suggest_float('learning_rate', 0.01, 0.2),
        max_depth=trial.suggest_int('max_depth', 2, 5),
        random_state=42
    )

    model.fit(X_train, y_train)
    y_pred = model.predict(X_val)

    rmse = np.sqrt(mean_squared_error(y_val, y_pred))
    return rmse

study = optuna.create_study(direction='minimize')
study.optimize(objective_gb, n_trials=20)

print("Best Params:", study.best_params)


# In[177]:


import optuna
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error
import numpy as np

def objective_xgb(trial):
    model = XGBRegressor(
        n_estimators=trial.suggest_int('n_estimators', 100, 300),
        learning_rate=trial.suggest_float('learning_rate', 0.01, 0.2),
        max_depth=trial.suggest_int('max_depth', 3, 6),
        subsample=trial.suggest_float('subsample', 0.7, 1.0),
        colsample_bytree=trial.suggest_float('colsample_bytree', 0.7, 1.0),
        random_state=42
    )

    model.fit(X_train, y_train)
    y_pred = model.predict(X_val)

    rmse = np.sqrt(mean_squared_error(y_val, y_pred))
    return rmse

study_xgb = optuna.create_study(direction='minimize')
study_xgb.optimize(objective_xgb, n_trials=30)

print("Best Params:", study_xgb.best_params)


# In[178]:


from sklearn.ensemble import GradientBoostingRegressor

gb_model = GradientBoostingRegressor(
    n_estimators=159,
    learning_rate=0.1629968354244898,
    max_depth=3,
    random_state=42
)

gb_model.fit(X_train, y_train)


# In[179]:


from xgboost import XGBRegressor

xgb_model = XGBRegressor(
    n_estimators=298,
    learning_rate=0.17605006585973212,
    max_depth=4,
    subsample=0.8462267206453731,
    colsample_bytree=0.815368523851296,
    random_state=42
)

xgb_model.fit(X_train, y_train)


# In[180]:


from sklearn.metrics import mean_squared_error, r2_score
import numpy as np

# Gradient Boosting
gb_pred = gb_model.predict(X_val)
gb_rmse = np.sqrt(mean_squared_error(y_val, gb_pred))
gb_r2 = r2_score(y_val, gb_pred)

# XGBoost
xgb_pred = xgb_model.predict(X_val)
xgb_rmse = np.sqrt(mean_squared_error(y_val, xgb_pred))
xgb_r2 = r2_score(y_val, xgb_pred)

print("Gradient Boosting → RMSE:", gb_rmse, "R2:", gb_r2)
print("XGBoost → RMSE:", xgb_rmse, "R2:", xgb_r2)


# In[181]:


# Gradient Boosting
gb_test_pred = gb_model.predict(X_test)
print("GB Test RMSE:", np.sqrt(mean_squared_error(y_test, gb_test_pred)))

# XGBoost
xgb_test_pred = xgb_model.predict(X_test)
print("XGB Test RMSE:", np.sqrt(mean_squared_error(y_test, xgb_test_pred)))


# In[182]:


import pandas as pd
import matplotlib.pyplot as plt

# GB importance
gb_imp = pd.Series(gb_model.feature_importances_, index=X_train.columns)

# XGB importance
xgb_imp = pd.Series(xgb_model.feature_importances_, index=X_train.columns)

# Plot
plt.figure()
gb_imp.sort_values().plot(kind='barh', title='GB Feature Importance')
plt.show()

plt.figure()
xgb_imp.sort_values().plot(kind='barh', title='XGB Feature Importance')
plt.show()


# In[183]:


print("Model Comparison:")
print(f"GB RMSE: {gb_rmse:.4f}")
print(f"XGB RMSE: {xgb_rmse:.4f}")


# In[193]:


import shap

# Create explainer
explainer = shap.TreeExplainer(xgb_model)

# Compute SHAP values
shap_values = explainer.shap_values(X_val)


# In[194]:


shap.summary_plot(shap_values, X_val)


# In[187]:


shap.summary_plot(shap_values, X_val, plot_type="bar")


# In[188]:


shap.initjs()
shap.force_plot(
    explainer.expected_value,
    shap_values[0],
    X_val.iloc[0]
)


# In[190]:


shap.dependence_plot("K", shap_values, X_val)


# In[191]:


explainer_gb = shap.TreeExplainer(gb_model)
shap_values_gb = explainer_gb.shap_values(X_val)

shap.summary_plot(shap_values_gb, X_val)


# In[ ]:




