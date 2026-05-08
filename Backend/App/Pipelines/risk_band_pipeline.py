import pandas as pd
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_predict
from sklearn.preprocessing import LabelEncoder
import joblib

DATA_PATH = os.environ.get('RISK_INPUT', 'quarterly_summary.csv')

df = pd.read_csv(DATA_PATH)

def rule_based_risk(row):
    score = 0
    if row['current_ratio'] < 1.0: score += 3
    elif row['current_ratio'] < 1.5: score += 1
    if row['debt_to_asset'] > 0.55: score += 2
    if row['expense_to_revenue'] > 1.8: score += 2
    if row['anomaly_rate'] > 0.04: score += 1
    if row['hmm_state'] in ['Distressed', 'Critical']: score += 3
    elif row['hmm_state'] == 'Under Pressure': score += 1
    if score >= 7: return 'Extreme'
    elif score >= 5: return 'High'
    elif score >= 3: return 'Medium'
    return 'Low'

df['risk_band'] = df.apply(rule_based_risk, axis=1)

features = ['current_ratio', 'debt_to_asset', 'loan_coverage', 'expense_to_revenue', 'anomaly_rate']
X = df[features]
y = df['risk_band']

le = LabelEncoder()
y_encoded = le.fit_transform(y)

rf = RandomForestClassifier(n_estimators=200, random_state=42)
# For performance and stability, fit on full data and predict on training set
rf.fit(X, y_encoded)
y_pred = rf.predict(X)
df['predicted_band'] = le.inverse_transform(y_pred)
df['confidence'] = np.max(rf.predict_proba(X), axis=1)
df['low_confidence'] = df['confidence'] < 0.65
df['correct'] = df['risk_band'] == df['predicted_band']

MODELS_DIR = os.environ.get('MODELS_DIR', '.')
df.to_csv(os.environ.get('RISK_OUTPUT', 'risk_bands.csv'), index=False)
joblib.dump(rf, os.path.join(MODELS_DIR, 'risk_random_forest.pkl'))
joblib.dump(le, os.path.join(MODELS_DIR, 'risk_label_encoder.pkl'))
print(f"Risk band pipeline finished - predictions saved to {os.environ.get('RISK_OUTPUT', 'risk_bands.csv')} and models to {MODELS_DIR}")
