import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import RobustScaler
import joblib

DATASET_PATH = 'NovaTech_HMM.csv'
OUTPUT_PATH = 'NovaTech_HMM.csv'

NUMERIC_FEATURES = ['log amount', 'amount_zscore_dept', 'amount / quarterly_revenue', 'debt_ratio', 'current_ratio', 'vendor_freq', 'vendor_avg_amount', 'is_cash']

def loadData(path):
    return pd.read_csv(path)

def FeatureEngineering(df):
    df_new = df.copy()
    df_new['log amount'] = np.log(df['amount_pkr'])
    dept_stats = df_new.groupby('department')['amount_pkr'].agg(['mean','std'])
    df_new = df_new.join(dept_stats, on='department', rsuffix='_dept')
    df_new['amount_zscore_dept'] = (df_new['amount_pkr'] - df_new['mean']) / df_new['std'].replace(0, 1)
    df_new['amount / quarterly_revenue'] = df['amount_pkr'] / df['quarterly_revenue_pkr']
    df_new['current_ratio'] = df['current_liabilities_pkr'] / df['current_assets_pkr']
    df_new['debt_ratio'] = df['total_liabilities_pkr'] / df['total_assets_pkr']
    vendor_freq = df_new['vendor_name'].value_counts()
    df_new['vendor_freq'] = df_new['vendor_name'].map(vendor_freq)
    vendor_avg = df_new.groupby('vendor_name')['amount_pkr'].mean()
    df_new['vendor_avg_amount'] = df_new['vendor_name'].map(vendor_avg)
    df_new['is_cash'] = (df_new['payment_method'] == 'Cash').astype(int)
    return df_new

df = loadData(DATASET_PATH)
df_new = FeatureEngineering(df)

CAT_FEATURES = ['expense_category', 'payment_method', 'quarter']
df_encoded = pd.get_dummies(df_new, columns=CAT_FEATURES, drop_first=True)
ohe_cols = [c for c in df_encoded.columns if any(c.startswith(f) for f in CAT_FEATURES)]
ALL_FEATURES = NUMERIC_FEATURES + ohe_cols
X_all = df_encoded[ALL_FEATURES].copy()
X_all = X_all.fillna(X_all.median())

scaler = RobustScaler()
X_scaled = scaler.fit_transform(X_all)

iso = IsolationForest(contamination=0.05, random_state=42)
df['is_anomaly'] = iso.fit_predict(X_scaled)
df['anomaly_score'] = -iso.decision_function(X_scaled)

def assign_review_tier(row):
    if row['hmm_state'] == 'Financially Stable' and row['is_anomaly'] == 1:
        return 'High — review now'
    elif row['hmm_state'] in ['Under Pressure', 'Distressed', 'Critical'] and row['is_anomaly'] == 1:
        return 'Critical — immediate review'
    return 'Normal'
df['review_tier'] = df.apply(assign_review_tier, axis=1)

df.to_csv(OUTPUT_PATH, index=False)
joblib.dump(iso, 'isolation_forest.pkl')
joblib.dump(scaler, 'anomaly_scaler.pkl')
print("Anomaly pipeline finished - NovaTech_HMM.csv updated + isolation_forest.pkl, anomaly_scaler.pkl created")