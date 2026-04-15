import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from hmmlearn.hmm import GaussianHMM
import joblib

DATASET_PATH = 'NovaTech.csv'
OUTPUT_PATH = 'NovaTech_HMM.csv'
QUARTERLY_PATH = 'quarterly_summary.csv'
MODEL_PATH = 'hmm_model.pkl'
SCALER_PATH = 'hmm_scaler.pkl'

FEATURES = ['current_ratio', 'debt_to_asset']
N_STATES = 4
N_ITER = 1000
RANDOM_STATE = 42
TOL = 1e-4

STATE_LABELS = {0: 'Financially Stable', 1: 'Recovery', 2: 'Under Pressure', 3: 'Distressed'}

def loadData(path):
    return pd.read_csv(path)

def AggregateQuarterlyObservations(df):
    quarterly = df.groupby(['fiscal_year', 'quarter']).agg(
        current_assets=('current_assets_pkr', 'first'),
        current_liabilities=('current_liabilities_pkr', 'first'),
        fixed_assets=('fixed_assets_pkr', 'first'),
        total_assets=('total_assets_pkr', 'first'),
        total_liabilities=('total_liabilities_pkr', 'first'),
        long_term_loans=('long_term_loans_pkr', 'first'),
        quarterly_revenue=('quarterly_revenue_pkr', 'first'),
        total_expense=('amount_pkr', 'sum'),
        flagged_count=('approval_status', lambda x: (x == 'Flagged').sum()),
        total_txn_count=('approval_status', 'count')
    ).reset_index()

    quarterly['current_ratio'] = quarterly['current_assets'] / quarterly['current_liabilities']
    quarterly['debt_to_asset'] = quarterly['total_liabilities'] / quarterly['total_assets']
    quarterly['loan_coverage'] = quarterly['quarterly_revenue'] / quarterly['long_term_loans']
    quarterly['expense_to_revenue'] = quarterly['total_expense'] / quarterly['quarterly_revenue']
    quarterly['anomaly_rate'] = quarterly['flagged_count'] / quarterly['total_txn_count']
    return quarterly

def scale_features(quarterly):
    X_raw = quarterly[FEATURES].values
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw)
    return X_raw, X_scaled, scaler

def train_hmm(X_scaled):
    hmm = GaussianHMM(
        n_components=N_STATES,
        covariance_type='diag',
        n_iter=N_ITER,
        tol=TOL,
        random_state=RANDOM_STATE,
        min_covar=1e-3
    )
    hmm.fit(X_scaled)
    return hmm

def decode_states(hmm, X_scaled, X_raw):
    hidden_state_ids = hmm.predict(X_scaled)
    state_cr_means = []
    for s in range(N_STATES):
        mask = hidden_state_ids == s
        if mask.sum() > 0:
            cr_mean = X_raw[mask, 0].mean()
            da_mean = X_raw[mask, 1].mean()
            state_cr_means.append((s, cr_mean, da_mean, int(mask.sum())))
    state_cr_means.sort(key=lambda x: x[1], reverse=True)
    state_id_to_label = {}
    for rank, (sid, _, _, _) in enumerate(state_cr_means):
        state_id_to_label[sid] = STATE_LABELS[rank]
    return hidden_state_ids, state_id_to_label

def assign_and_validate(quarterly, hidden_state_ids, state_id_to_label):
    quarterly = quarterly.copy()
    quarterly['hmm_state_id'] = hidden_state_ids
    quarterly['hmm_state'] = quarterly['hmm_state_id'].map(state_id_to_label)
    return quarterly

df = loadData(DATASET_PATH)
quarterly = AggregateQuarterlyObservations(df)
X_raw, X_scaled, scaler = scale_features(quarterly)
hmm = train_hmm(X_scaled)
hidden_state_ids, state_id_to_label = decode_states(hmm, X_scaled, X_raw)
quarterly = assign_and_validate(quarterly, hidden_state_ids, state_id_to_label)

quarterly.to_csv(QUARTERLY_PATH, index=False)
df = df.merge(quarterly[['fiscal_year', 'quarter', 'hmm_state']], on=['fiscal_year', 'quarter'], how='left')
df.to_csv(OUTPUT_PATH, index=False)

joblib.dump(hmm, MODEL_PATH)
joblib.dump(scaler, SCALER_PATH)

print("HMM pipeline completed successfully")
print(f"States used: {N_STATES}")
print(f"Files created: {OUTPUT_PATH}, {QUARTERLY_PATH}, {MODEL_PATH}, {SCALER_PATH}")