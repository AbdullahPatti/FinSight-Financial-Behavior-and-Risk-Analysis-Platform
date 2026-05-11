import pandas as pd
import os
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import RobustScaler
import joblib
import json

DATASET_PATH = os.environ.get('ANOMALY_INPUT', 'NovaTech_HMM.csv')
OUTPUT_PATH = os.environ.get('ANOMALY_OUTPUT', 'NovaTech_HMM.csv')

NUMERIC_FEATURES = ['log amount', 'amount_zscore_dept', 'amount / quarterly_revenue', 'debt_ratio', 'current_ratio', 'vendor_freq', 'vendor_avg_amount', 'is_cash']

def loadData(path):
    return pd.read_csv(path)

def FeatureEngineering(df):
    df_new = df.copy()
    df_new['log amount'] = np.log(df['amount_pkr'])
    dept_stats = df_new.groupby('department')['amount_pkr'].agg(['mean','std'])
    df_new = df_new.join(dept_stats, on='department', rsuffix='_dept')
    df_new['amount_zscore_dept'] = (
        (df_new['amount_pkr'] - df_new['mean']) / df_new['std'].replace(0, 1)
    )
    df_new['amount / quarterly_revenue'] = df['amount_pkr'] / df['quarterly_revenue_pkr']
    # CORRECT
    df_new['current_ratio'] = df['current_assets_pkr'] / df['current_liabilities_pkr']
    df_new['debt_ratio'] = df['total_liabilities_pkr'] / df['total_assets_pkr']
    vendor_freq = df_new['vendor_name'].value_counts()
    df_new['vendor_freq'] = df_new['vendor_name'].map(vendor_freq)
    vendor_avg  = df_new.groupby('vendor_name')['amount_pkr'].mean()
    df_new['vendor_avg_amount'] = df_new['vendor_name'].map(vendor_avg)
    df_new['is_cash'] = (df_new['payment_method'] == 'Cash').astype(int)

    return df_new

df = loadData(DATASET_PATH)
df_new =FeatureEngineering(df)

CAT_FEATURES = ['expense_category', 'payment_method', 'quarter']
df_encoded = pd.get_dummies(df_new, columns=CAT_FEATURES, drop_first=True)
ohe_cols = [c for c in df_encoded.columns
            if any(c.startswith(f) for f in CAT_FEATURES)]
ALL_FEATURES = NUMERIC_FEATURES + ohe_cols
X_all = df_encoded[ALL_FEATURES].copy()
X_all = X_all.fillna(X_all.median())

HMM_STATES = df['hmm_state'].unique()

models   = {}   # one model per state
scalers  = {}   # one scaler per state
scores   = np.zeros(len(df))  # anomaly scores for all rows

for state in HMM_STATES:
    mask = df_encoded['hmm_state'] == state
    X_state = X_all[mask].copy()

    # Scale within this state only
    scaler = RobustScaler()
    X_scaled = scaler.fit_transform(X_state)

    # Fit Isolation Forest
    iso = IsolationForest(
        n_estimators=200,
        contamination='auto',   # expect ~5% anomalies
        max_samples='auto',
        random_state=42,
        n_jobs=-1
    )
    iso.fit(X_scaled)

    # score_samples: lower = more anomalous
    scores[mask] = iso.score_samples(X_scaled)

    models[state]  = iso
    scalers[state] = scaler

df['anomaly_score'] = scores
df['is_anomaly']    = (scores < np.percentile(scores, 5)).astype(int)

# Rank: 1 = most anomalous
df['anomaly_rank'] = df['anomaly_score'].rank(ascending=True).astype(int)

# Review tiers
df['review_tier'] = pd.cut(
    df['anomaly_score'],
    bins=[df['anomaly_score'].min(), 
          np.percentile(scores, 2),
          np.percentile(scores, 5),
          df['anomaly_score'].max()],
    labels=['High — review now', 'Medium — weekly batch', 'Normal']
)   

df.to_csv(OUTPUT_PATH, index=False)
MODELS_DIR = os.environ.get('MODELS_DIR', '.')
thresholds = {
    "tier_high":   float(np.percentile(scores, 2)),
    "tier_medium": float(np.percentile(scores, 5)),
}
with open(os.path.join(MODELS_DIR, 'anomaly_thresholds.json'), 'w') as f:
    json.dump(thresholds, f)
joblib.dump(models,  os.path.join(MODELS_DIR, 'isolation_forests.pkl'))  # dict: {state -> IsoForest}
joblib.dump(scalers, os.path.join(MODELS_DIR, 'anomaly_scalers.pkl'))
print(f"Anomaly pipeline finished - NovaTech_HMM.csv updated + isolation_forests.pkl, anomaly_scalers.pkl created in {MODELS_DIR}")
