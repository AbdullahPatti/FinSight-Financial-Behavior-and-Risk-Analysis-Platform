# FinSight

## Financial Behavior and Risk Analysis Platform

A modular machine learning pipeline that analyzes structured corporate financial data to produce behavioral insights, risk classifications, and spending pattern visualizations.

> **National University of Computer and Emerging Sciences**
> Department of Computer Science, Lahore, Pakistan
>
> Abdullah Haroon — 23L-0734
> Zayan Amjad — 23L-0721
> Ikhlas Ahmad — 23L-0638

---

## Objective

FinSight takes structured financial data exported from a company's accounting or ERP system, processes it through a data analytics and ML pipeline, and delivers behavioral insights, risk categorization, and spending pattern visualizations.

The core output is a **risk profile per time period** classifying the company's financial health into one of four bands: `Low`, `Medium`, `High`, or `Extreme`. The system also surfaces dominant expense categories, asset and liability trends, and transactions that deviate from established patterns. Where datasets include natural language description fields, an NLP component extracts spending context and improves categorization.

---

## Problem Statement

Standard financial reporting answers *how much*. It does not answer whether a pattern is healthy, where risk is concentrating, or what the current financial state implies about the near future.

FinSight addresses three specific gaps:

1. Financial health assessment is currently manual and inconsistent
2. Granular spending pattern analysis requires analyst time most organizations don't invest
3. Anomalies in financial behavior go undetected until they become material problems

---

## Scope

### In Scope

- Data ingestion and preprocessing from CSV or XLSX
- Cleaning, normalization, and feature engineering
- Financial health ratio computation
- Spending pattern detection across categories, departments, and time periods
- ML-based risk scoring into Low, Medium, High, and Extreme bands
- Transaction-level anomaly detection using learned behavioral baselines
- Behavioral sequence modeling over time-ordered financial data
- NLP processing of transaction description fields
- Interactive visualization dashboard

### Out of Scope

- Real-time banking integrations
- Automated payment processing
- Regulatory advisory or taxation computation
- Deep learning architectures (CNNs, RNNs, LSTMs, Transformers, LLMs)

---

## Dataset

Four years of corporate financial records for **NovaTech Industries Ltd**, a Pakistani manufacturing and services conglomerate.

- **Rows:** 50,000
- **Columns:** 19
- **Period:** FY2021 – FY2024
- **Anomalies:** 1,500 injected labeled anomalous transactions for evaluation

| Column | Type | Description |
|---|---|---|
| `transaction_id` | String | Unique identifier per transaction |
| `date` | Date | Transaction date (2021–2024) |
| `fiscal_year` | Categorical | FY2021 through FY2024 |
| `quarter` | Categorical | Q1 through Q4 |
| `department` | Categorical | Originating department (12 departments) |
| `expense_category` | Categorical | Expense type label (12 categories) |
| `vendor_name` | String | Vendor or payee name |
| `transaction_description` | Free Text | Natural language description by submitting employee |
| `amount_pkr` | Numeric | Transaction amount in PKR |
| `payment_method` | Categorical | Bank Transfer, Cash, Corporate Card, Cheque, Online Portal |
| `approval_status` | Categorical | Approved, Pending, Flagged, Rejected |
| `approved_by` | String | Approving officer name |
| `total_assets_pkr` | Numeric | Quarterly snapshot of total assets |
| `current_assets_pkr` | Numeric | Liquid and short-term assets |
| `fixed_assets_pkr` | Numeric | Long-term tangible asset value |
| `total_liabilities_pkr` | Numeric | Total financial obligations |
| `current_liabilities_pkr` | Numeric | Short-term obligations due within one year |
| `long_term_loans_pkr` | Numeric | Outstanding long-term loan balances |
| `quarterly_revenue_pkr` | Numeric | Revenue generated during the quarter |

---

## System Architecture

The pipeline has two parallel tracks that converge at risk scoring: a **numerical analysis track** and an **NLP track**.

| Module | Responsibility |
|---|---|
| Data Ingestion | Accepts CSV or XLSX, validates schema, loads into typed DataFrame |
| Data Preprocessing | Missing value handling, outlier treatment, type normalization, date parsing |
| Feature Engineering | Derives financial ratios, spending shares, trend indicators, time aggregations |
| NLP Module | Processes `transaction_description` for categorization and anomaly signals |
| Spending Pattern Analyzer | Identifies top categories, department distributions, temporal trends |
| Risk Scoring Engine | Computes weighted risk score per period and assigns band |
| Anomaly Detector | Flags transactions deviating from learned behavioral baselines |
| Behavioral Sequence Modeler | Models hidden financial states via HMM across quarterly sequences |
| Insight Engine | Aggregates module outputs into structured summaries |
| Visualization Dashboard | Interactive charts, risk timelines, and pattern breakdowns via React.js |

---

## Feature Engineering

| Derived Feature | Computation | Purpose |
|---|---|---|
| Current Ratio | Current Assets / Current Liabilities | Short-term obligation coverage |
| Debt-to-Asset Ratio | Total Liabilities / Total Assets | Leverage and solvency |
| Loan Coverage Ratio | Long Term Loans / Quarterly Revenue | Debt load sustainability |
| Expense-to-Revenue Ratio | Total Period Expenses / Quarterly Revenue | Operational cost efficiency |
| Category Spending Share | Category Total / Period Total Spend | Dominant expense identification |
| Quarter-on-Quarter Trend | Current Period Value / Previous Period Value | Growth or decline detection |
| Anomaly Rate | Flagged Transactions / Total Transactions | Internal control quality |
| Asset Growth Rate | Change in Total Assets / Previous Period Assets | Balance sheet trajectory |

---

## Risk Scoring

| Risk Band | Financial Indicators | Behavioral Signals |
|---|---|---|
| **Low** | Current ratio > 1.5, debt-to-asset < 0.4, stable revenue | Consistent patterns, near-zero anomaly rate, stable state |
| **Medium** | Current ratio 1.0–1.5, moderate debt, flat revenue | Some category concentration, minor anomalies |
| **High** | Current ratio < 1.0, high debt-to-asset, declining revenue | Elevated anomaly rate, unusual category spikes |
| **Extreme** | Liquidity crisis, debt exceeding assets, severe revenue contraction | High anomaly concentration, erratic spending, critical state |

The scoring model weights financial ratio indicators highest, followed by behavioral sequence state, then transaction-level anomaly signals. Risk bands are computed per quarter producing a four-year timeline.

---

## Anomaly Detection

Anomalies are detected using three complementary signals:

1. **Numerical** — Transaction amount is statistically unusual relative to category baseline
2. **Behavioral** — Combination of category, amount, and timing is inconsistent with the organization's learned pattern (via HMM context)
3. **NLP** — Description text contains unusual language or vocabulary mismatched with the assigned category

---

## Behavioral Sequence Modeling (HMM)

Financial behavior moves through observable phases. HMM infers latent states from observable financial data.

| HMM Component | Definition |
|---|---|
| Hidden States | Financially Stable, Under Pressure, Distressed, Critical, Recovery |
| Observations | Derived financial indicators and expense category distributions per quarter |
| Transition Probabilities | Likelihood of moving between financial states across consecutive quarters |
| Emission Probabilities | Likelihood of observing a financial signal combination in a given state |
| Initial Distribution | Starting state probability from the first available quarter |

**Viterbi decoding** produces a behavioral timeline across the four-year dataset showing when stress periods began, how long they lasted, and whether recovery followed.

---

## NLP Component

Processes the `transaction_description` column to enrich categorization and anomaly detection. Operates as a self-contained supporting layer — the core financial pipeline does not depend on it.

| Technique | Application |
|---|---|
| Text Preprocessing | Lowercasing, punctuation removal, tokenization, stopword removal |
| Bag of Words & TF-IDF | Converts descriptions to numeric vectors; TF-IDF weights informative tokens higher |
| N-grams (Unigrams & Bigrams) | Bigrams like "car tank" or "client dinner" carry category signals unigrams miss |
| Word2Vec (CBOW & Skip-gram) | Dense embeddings cluster semantically similar terms like "petrol", "fuel", "diesel" |
| Text Classification | Predicts expense category from description text as a validation layer |
| POS Tagging | Distinguishes transaction types sharing vocabulary (purchase vs. maintenance) |
| HMM on Text Sequences | Detects unusual language patterns in description token sequences |

---

## Tech Stack

| Category | Technology |
|---|---|
| Programming Languages | Python, JavaScript |
| Backend Framework | FastAPI |
| Frontend | HTML, CSS, React.js |
| Database | PostgreSQL / SQLite |
| Data Processing | pandas, numpy |
| Machine Learning | scikit-learn |
| NLP Libraries | NLTK, Gensim (Word2Vec) |
| Sequence Modeling | hmmlearn |
| Visualization | React chart libraries, Matplotlib |
| Dev Tools | Git, GitHub |

---

## Key Deliverables

- Cleaned and preprocessed financial dataset with derived feature columns
- Spending pattern report across categories, departments, and vendors for FY2021–FY2024
- Quarterly risk band timeline (Low / Medium / High / Extreme)
- Anomaly detection report with numeric and behavioral justification per flagged transaction
- HMM-decoded behavioral state timeline across four fiscal years
- NLP-based categorization validation and description anomaly flags
- Interactive visualization dashboard with spending breakdowns, risk trends, and anomaly highlights

---

## Future Extensions

- Real-time transaction ingestion for live behavioral monitoring
- Multi-company comparative analysis and industry benchmarking
- Personalized financial recommendation engine built on behavioral state profiles
- Explainable risk reports surfacing the exact signals driving each band assignment

---

*National University of Computer and Emerging Sciences | Department of Computer Science, Lahore*
