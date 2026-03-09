# FinSight

## Financial Behavior and Risk Analysis Platform

> **National University of Computer and Emerging Sciences**
> Department of Computer Science, Lahore
> Software Engineering and Artificial Intelligence

| Name | Roll No. |
|---|---|---|
| Abdullah Haroon | 23L-0734 |
| Zayan Amjad | 23L-0721 |
| Ikhlas Ahmad | 23L-0638 |

**GitHub Repository:** [FinSight on GitHub](https://github.com/AbdullahPatti/FinSight-Financial-Behavior-and-Risk-Analysis-Platform.git)

---

## Objective

FinSight takes structured financial data exported from a company's accounting or ERP system, processes it through a data analytics and ML pipeline, and delivers behavioral insights, risk categorization, and spending pattern visualizations.

The core output is a **risk profile per time period** classifying financial health into one of four bands: `Low`, `Medium`, `High`, or `Extreme`. The system also surfaces dominant expense categories, asset and liability trends, and transactions that deviate from established patterns. Where datasets include natural language description fields, an NLP component extracts spending context and improves categorization.

---

## Problem Statement

Standard financial reporting answers *how much*. It does not answer whether a pattern is healthy, where risk is concentrating, or what the current financial state implies about the near future.

FinSight addresses three specific gaps:

1. Financial health assessment is currently manual and inconsistent
2. Granular spending pattern analysis requires analyst time most organizations don't invest
3. Anomalies in financial behavior go undetected until they become material problems

**Domain:** Financial analytics and intelligent decision-support for corporate entities operating on structured transaction and balance sheet data.

**Target Audience:**
- Finance departments seeking automated behavioral analysis
- Management teams requiring periodic risk assessments without manual effort
- Internal audit functions looking for transaction-level anomaly detection
- Organizational leadership requiring a data-driven view of financial health trends

---

## Dataset

Four years of corporate financial records for **NovaTech Industries Ltd**, a Pakistani manufacturing and services conglomerate.

- **Rows:** 50,000
- **Columns:** 19
- **Period:** FY2021 – FY2024
- **Anomalies:** 1,500 injected labeled anomalous transactions for model evaluation

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

## Data Preprocessing

1. Handle missing values through imputation or removal depending on column type and missingness rate
2. Correct data types and parse date fields into fiscal year and quarter components
3. Treat outliers in numeric columns using IQR-based detection and capping
4. Encode categorical variables for ML model input
5. Normalize numeric columns where required by algorithm
6. Apply NLP preprocessing to `transaction_description`: lowercasing, punctuation removal, tokenization, stopword removal

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

## System Architecture

The pipeline runs two parallel tracks — **numerical analysis** and **NLP** — that converge at the risk scoring stage.

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

## Model Selection

| Task | Technique | Justification |
|---|---|---|
| Spending pattern analysis | Aggregation and statistical profiling | Identifies dominant categories, trends, and department distributions |
| Risk band classification | Decision Tree / Random Forest | Maps derived financial indicators to Low / Medium / High / Extreme bands |
| Anomaly detection | Isolation Forest / statistical threshold modeling | Detects transactions deviating from learned behavioral baselines |
| Behavioral state modeling | Hidden Markov Model + Viterbi decoding | Infers latent financial states from observable quarterly sequences |
| Transaction categorization (NLP) | TF-IDF + text classifier | Predicts expense category from description text |
| Semantic text representation (NLP) | Word2Vec (CBOW and Skip-gram) | Learns semantic similarity between spending-related terms |
| POS-based intent extraction (NLP) | POS Tagging | Differentiates transaction types sharing similar vocabulary |

---

## Model Training and Evaluation

### Training Methodology

- Risk classifier trained on labeled quarterly records where bands are derived from financial ratio thresholds
- Anomaly detector trained on clean transactions, evaluated against 1,500 labeled anomalous entries
- HMM trained on time-ordered quarterly sequences via Baum-Welch algorithm, decoded via Viterbi
- NLP text classifier trained on the labeled `expense_category` column using description text as input

### Evaluation Metrics

| Component | Metric |
|---|---|
| Risk band classifier | Accuracy, Precision, Recall, F1-score per class |
| Anomaly detector | Precision, Recall, F1-score against labeled anomalies |
| HMM behavioral model | Log-likelihood of observed sequences, qualitative state coherence |
| NLP text classifier | Per-class F1-score across 12 expense categories |

Cross-validation is applied to classification models. The HMM is evaluated by comparing decoded state sequences against periods of known financial stress.

---

## Risk Scoring

| Risk Band | Financial Indicators | Behavioral Signals |
|---|---|---|
| **Low** | Current ratio > 1.5, debt-to-asset < 0.4, stable revenue | Consistent patterns, near-zero anomaly rate, stable state |
| **Medium** | Current ratio 1.0–1.5, moderate debt, flat revenue | Some category concentration, minor anomalies |
| **High** | Current ratio < 1.0, high debt-to-asset, declining revenue | Elevated anomaly rate, unusual category spikes |
| **Extreme** | Liquidity crisis, debt exceeding assets, severe revenue contraction | High anomaly concentration, erratic spending, critical state |

The model weights financial ratio indicators highest, followed by behavioral sequence state, then transaction-level anomaly signals. Bands are computed per quarter producing a four-year timeline.

---

## Anomaly Detection

Three complementary signals:

1. **Numerical** — Transaction amount is statistically unusual relative to category baseline
2. **Behavioral** — Combination of category, amount, and timing is inconsistent with the organization's learned pattern (via HMM context)
3. **NLP** — Description text contains unusual language or vocabulary mismatched with the assigned category

---

## Behavioral Sequence Modeling (HMM)

| HMM Component | Definition |
|---|---|
| Hidden States | Financially Stable, Under Pressure, Distressed, Critical, Recovery |
| Observations | Derived financial indicators and expense category distributions per quarter |
| Transition Probabilities | Likelihood of moving between financial states across consecutive quarters |
| Emission Probabilities | Likelihood of observing a financial signal combination in a given state |
| Initial Distribution | Starting state probability from the first available quarter |

Viterbi decoding produces a behavioral timeline across the four-year dataset showing when stress periods began, how long they lasted, and whether recovery followed.

---

## NLP Component

Operates as a self-contained supporting layer. The core financial pipeline does not depend on it.

| Technique | Application |
|---|---|
| Text Preprocessing | Lowercasing, punctuation removal, tokenization, stopword removal |
| Bag of Words & TF-IDF | Converts descriptions to numeric vectors; weights informative tokens higher |
| N-grams (Unigrams & Bigrams) | Bigrams like "car tank" or "client dinner" carry category signals unigrams miss |
| Word2Vec (CBOW & Skip-gram) | Dense embeddings cluster semantically similar terms like "petrol", "fuel", "diesel" |
| Text Classification | Predicts expense category from description as a validation layer |
| POS Tagging | Distinguishes transaction types sharing vocabulary (purchase vs. maintenance) |
| HMM on Text Sequences | Detects unusual language patterns in description token sequences |

---

## Deployment

| Layer | Technology | Detail |
|---|---|---|
| Backend | FastAPI | Serves preprocessing, model inference, and insight generation as REST endpoints |
| Frontend | React.js | Interactive dashboard with charts, risk timelines, and anomaly views |
| Database | PostgreSQL / SQLite | Stores processed records and model outputs for dashboard queries |
| Input | CSV / XLSX upload | System processes end-to-end and returns a complete behavioral analysis report |

Designed for batch processing up to 100,000 rows without infrastructure changes.

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

## Dashboard Outputs

| Output | Description |
|---|---|
| Spending Pattern Report | Category, department, and vendor distribution charts across fiscal years |
| Risk Band Timeline | Quarterly Low / Medium / High / Extreme classification over FY2021–FY2024 |
| Financial Ratio Dashboard | Current ratio, debt-to-asset, loan coverage, and expense-to-revenue per quarter |
| Anomaly Report | Flagged transactions with numeric and behavioral justification |
| Behavioral State Timeline | HMM-decoded financial state sequence across four fiscal years |
| NLP Category Validation | Description-based category predictions compared against labeled values |

---

## Scope Boundaries

Not included in this project:

- Real-time banking API integrations or live data feeds
- Automated payment processing
- Taxation computation or regulatory financial advisory
- Deep learning architectures (CNNs, RNNs, LSTMs, Transformers, LLMs)

---

## Future Extensions

- Real-time transaction ingestion for live behavioral monitoring
- Multi-company comparative analysis and industry benchmarking
- Personalized financial recommendation engine built on behavioral state profiles
- Explainable risk reports surfacing the exact signals driving each band assignment

---

*National University of Computer and Emerging Sciences | Department of Computer Science, Lahore*
