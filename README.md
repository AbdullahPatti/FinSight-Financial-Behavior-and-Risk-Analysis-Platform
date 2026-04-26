# 📚 FinSight - Complete Project Documentation

**Financial Behavior and Risk Analysis Platform**

---

## 📑 Quick Navigation

1. **[Project Overview](#overview)** - What FinSight is and does
2. **[Key Features](#features)** - Main capabilities
3. **[System Architecture](#architecture)** - How it works
4. **[User Guide](#user-guide)** - Step-by-step usage
5. **[Setup & Deployment](#setup)** - Installation guide
6. **[Technical Details](#tech-stack)** - Technology stack

---

## 🎯 Overview

**FinSight** is a data-driven financial analytics platform that transforms raw transaction data into actionable insights.

**Core Purpose:**
Instead of just showing numbers, FinSight explains whether financial behavior is healthy or risky through automated analysis and pattern recognition.

**What It Answers:**
- ✅ Is your company financially healthy?
- ✅ Where is money being spent excessively?
- ✅ Are there hidden risks or anomalies in transactions?
- ✅ How is financial behavior changing over time?

**Use Cases:**
Corporate financial monitoring | Risk assessment | Spending pattern analysis | Anomaly detection | Compliance tracking

---

## ⭐ Key Features

### 🔐 Authentication
- Secure signup and login
- Profile-based personalization
- Password protection

### 📤 Data Upload
- CSV file upload with automatic validation
- Data format checking
- Support for large datasets

### 📊 Dashboard
Real-time metrics and visual analytics:
- **Top Metrics**: Total transactions, spending, health score, average transaction
- **Risk Assessment**: Current level (Low|Medium|High|Extreme), trend, recommendations
- **Charts**: Spending distribution (pie), quarterly trends (line/bar), anomaly alerts
- **Filters**: Date range, category, risk level

### 🔍 Financial Analysis
Deep insights into financial behavior:
- Transaction-level analysis with drill-down details
- Behavioral pattern recognition (regular vs. irregular spending)
- Anomaly detection (outliers, rare categories, time anomalies, pattern breaks)
- Risk scoring breakdown showing factor contributions (Volatility 30%, Anomalies 25%, Trends 20%, Patterns 15%, Amounts 10%)
- Quarterly risk profiles
- Exportable reports (PDF/CSV/Excel)

### 💰 Expense Management
Track and analyze expenses:
- Comprehensive transaction table (Date, Description, Category, Amount, Status)
- Category-based breakdown visualization
- Multiple filters (date, category, amount, status)
- Sort by date, amount, category, or status
- **Export as CSV** for external analysis and accounting software integration

### 👤 Profile Management
Manage personal and company information:
- Personal details (name, email, phone, job title, department)
- Company information (name, industry, size, country, tax ID)
- Password management with security requirements
- Notification and display preferences
- Data privacy and security settings
- Activity log and login history

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────┐
│  Frontend (React.js + Tailwind CSS)                │
│  • Login/Signup  • Dashboard  • Upload  • Profile   │
└─────────────────────┬────────────────────────────┘
                      │ HTTP/REST API
┌─────────────────────▼────────────────────────────┐
│  Backend API (FastAPI - Python)                  │
│  ┌──────────────────────────────────────────┐   │
│  │ • Authentication  • Upload  • API Routes │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ Analysis Pipelines:                      │   │
│  │ • Anomaly Detection    • HMM Pipeline     │   │
│  │ • NLP Analysis         • Risk Scoring     │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────┬────────────────────────────┘
                      │
┌─────────────────────▼────────────────────────────┐
│  Database (SQLite/PostgreSQL)                    │
│  • Users  • Transactions  • Risk Profiles       │
│  • Uploads  • Analysis Results                   │
└────────────────────────────────────────────────┘
```

---

## 👥 User Guide

### 1️⃣ Sign Up Process

**Step 1-3:** Click "Sign Up" → Fill form with:
- Full Name
- Email Address (for login)
- Company Name  
- Strong Password (8+ chars, uppercase, number, special char)

**Step 4:** Accept terms and create account

**Result:** Auto-login and dashboard access

---

### 2️⃣ Sign In Process

**Step 1:** Click "Login" on landing page

**Step 2:** Enter email and password

**Step 3 (Optional):** Check "Remember Me" to stay logged in

**Step 4:** Click "Sign In"

**Result:** Dashboard with personalized data

---

### 3️⃣ Dataset Upload

**Supported Format:** CSV with columns:
| Column | Type | Example |
|--------|------|---------|
| Date | YYYY-MM-DD | 2024-01-15 |
| Description | Text | Office supplies |
| Amount | Numeric | 250.50 |
| Category | Text | Supplies |
| Status | Text | Completed |

**Upload Steps:**
1. Navigate to Upload page
2. Select CSV file from computer
3. Preview data and verify columns
4. Click "Validate" - system checks format and data quality
5. Click "Upload Dataset"
6. Wait for processing (automatic cleaning, normalization, analysis)
7. Receive confirmation with summary

**Processing Includes:**
Data validation | Cleaning & normalization | Feature engineering | Risk assessment | Anomaly detection | Statistical analysis

---

### 4️⃣ Dashboard Overview

**Top Metrics (Cards):**
```
┌─────────────────┐  ┌─────────────────┐
│ Total Trans.    │  │ Total Spending  │
│ 1,250 txns      │  │ $2,450,000      │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ Avg Transaction │  │ Health Score    │
│ $1,960          │  │ 78/100 (Good)   │
└─────────────────┘  └─────────────────┘
```

**Risk Assessment:**
- Level: Low 🟢 | Medium 🟡 | High 🟠 | Extreme 🔴
- Trend: Increasing ↑ | Stable → | Decreasing ↓
- Percentage: Estimated financial risk %

**Visualizations:**

| Chart | Shows | Purpose |
|-------|-------|---------|
| **Spending Distribution** | % by category | Where money goes |
| **Quarterly Trend** | Spending over time | Spending patterns |
| **Anomaly Alerts** | Count & severity | Risk indicators |

**Navigation Menu:**
🏠 Dashboard | 📊 Analysis | 💰 Expenses | 👤 Profile | 🚪 Logout

---

### 5️⃣ Financial Analysis

**Transaction Analysis:**
- Total transactions processed
- Date range coverage  
- Category breakdown
- High-risk transaction list

**Behavioral Patterns:**
- Spending behavior classification
- Peak spending times and days
- Spending consistency
- Cyclical patterns

**Anomaly Detection:**
| Type | Description | Severity |
|------|-------------|----------|
| Outlier | Much larger than usual | High |
| Rare Category | New category | Medium |
| Time Anomaly | Unusual time/date | Low |
| Pattern Break | Deviation from normal | Medium |

**Risk Score Formula:**
```
Risk = (Volatility × 30%) + (Anomalies × 25%) + 
       (Trend × 20%) + (Patterns × 15%) + (Amounts × 10%)

Ranges:
0-25:   Low Risk 🟢
25-50:  Medium Risk 🟡
50-75:  High Risk 🟠
75-100: Extreme Risk 🔴
```

**Quarterly Profiles:**
Summary showing risk level, spending changes, anomaly count, and recommendations per quarter

**Export Reports:**
Format: PDF | CSV | Excel  
Use: Share with stakeholders, audit purposes

---

### 6️⃣ Expense Management

**Expense Table:**
Columns: Date | Description | Category | Amount | Status | Actions

**Filters:**
- Date range (custom, last 30 days, last quarter)
- Category (dropdown)
- Amount range (min-max)
- Status (All/Pending/Approved)

**Sorting:**
By Date | By Amount | By Category | By Status

**Export as CSV:**
1. Apply desired filters
2. Click "Export as CSV"
3. Choose: Current view or All data
4. Download to computer
5. Open in Excel/Sheets for analysis

**CSV Example:**
```
Date,Description,Category,Amount,Status
2024-01-15,Dell Laptop,Equipment,1200.50,Approved
2024-01-16,Team Lunch,Meals,150.00,Approved
2024-01-17,Office Rent,Rent,5000.00,Approved
```

**Use Cases:**
📊 Import to accounting software | 🔍 Provide to auditors | 📈 Create custom Excel reports | 📧 Share with finance team | 💾 Backup data | 🔄 Bank reconciliation

---

### 7️⃣ Profile Management

**Personal Information (Editable):**
- Full Name
- Email Address
- Phone Number
- Job Title
- Department

**Company Information:**
- Company Name
- Industry
- Company Size
- Country
- Tax ID / Registration

**Password Management:**
1. Click "Change Password"
2. Enter current password
3. Enter new password (8+ chars, uppercase, number, special char)
4. Confirm and update

**Preferences:**
- Notifications: Email alerts, weekly reports, system updates
- Display: Currency, date format, theme (Light/Dark), language
- Changes save automatically

**Data & Privacy:**
- Download My Data
- Delete Account
- Security Settings (2FA)
- Privacy Policy

**Activity Log:**
- Login history with timestamps and IP
- Recent uploads
- Profile changes
- Admin actions

---

## 🔧 Setup & Deployment

### Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.8+ | Backend runtime |
| Node.js | 14.0+ | Frontend build |
| npm | 6.0+ | Package manager |
| Git | Latest | Version control |
| PostgreSQL/SQLite | Latest | Database |

### Installation

**1. Clone Repository:**
```bash
cd Desktop\Python\AI Project
git clone <repository-url>
cd FinSight-Financial-Behavior-and-Risk-Analysis-Platform
```

**2. Backend Setup:**
```bash
cd Backend/App

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Or (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**3. Frontend Setup:**
```bash
cd frontend
npm install
```

**4. Database Configuration:**

Edit `Backend/App/db.py`:

**SQLite (Development):**
```python
DATABASE_URL = "sqlite:///./finsight.db"
```

**PostgreSQL (Production):**
```python
DATABASE_URL = "postgresql://username:password@localhost/finsight_db"
```

### Running Application

**Start Backend (Terminal 1):**
```bash
cd Backend/App
venv\Scripts\activate
python main.py
# Or: uvicorn main:app --reload --port 8000
```
→ Backend: `http://localhost:8000`
→ API Docs: `http://localhost:8000/docs`

**Start Frontend (Terminal 2):**
```bash
cd frontend
npm start
```
→ Frontend: `http://localhost:3000`

**Access:** Open browser → `http://localhost:3000`

### Docker Setup

**Build and Run:**
```bash
cd Backend/App
docker-compose up --build

# In new terminal:
cd frontend
docker build -t finsight-frontend .
docker run -p 3000:3000 finsight-frontend
```

**Stop:**
```bash
docker-compose down
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8000 in use | `uvicorn main:app --port 8001` |
| ModuleNotFoundError | `pip install -r requirements.txt` |
| Database error | Update DATABASE_URL in db.py |
| Port 3000 in use | `PORT=3001 npm start` |
| npm not found | Install Node.js from nodejs.org |

---

## 🛠️ Technical Stack

**Frontend:**
React.js | Tailwind CSS | Axios | Chart.js | JavaScript ES6+

**Backend:**
FastAPI | Python 3.x | Pandas | NumPy | Scikit-learn | NLTK/Gensim | SQLAlchemy | Pydantic

**Database:**
SQLite (Development) | PostgreSQL (Production)

**Deployment:**
Docker | Docker Compose

### Data Processing Pipeline

```
CSV Upload
    ↓
Data Validation (format, duplicates, missing values)
    ↓
Data Preprocessing (normalize, standardize, clean)
    ↓
Feature Engineering (create new features, statistics)
    ↓
Analysis Engines:
  • Anomaly Detection (Isolation Forest)
  • HMM Pipeline (behavioral states)
  • NLP Pipeline (description analysis)
  • Risk Band Pipeline (risk classification)
    ↓
Risk Scoring (combine all signals)
    ↓
Store Results in Database
    ↓
Display on Dashboard
```

### Core Pipelines

**1. Anomaly Detection:**
- Finds unusual transactions
- Uses Isolation Forest / Local Outlier Factor
- Returns anomaly scores

**2. HMM Pipeline:**
- Models spending as behavioral states
- States: Normal | Elevated | High-Risk
- Shows behavior timeline changes

**3. NLP Pipeline:**
- Analyzes transaction descriptions
- Extracts keywords and patterns
- Supports fraud detection

**4. Risk Band Pipeline:**
- Calculates quarterly risk level
- Multi-factor scoring
- Output: Low | Medium | High | Extreme

---

## 📁 Project Structure

```
FinSight/
├── Backend/
│   ├── App/
│   │   ├── main.py                 ← Entry point
│   │   ├── db.py                   ← Database config
│   │   ├── requirements.txt
│   │   ├── Core/
│   │   │   └── pipelines.py        ← Core logic
│   │   ├── Crud/                   ← Database ops
│   │   ├── Models/                 ← Data models
│   │   ├── Routers/                ← API endpoints
│   │   ├── Schemas/                ← Data validation
│   │   └── Pipelines/              ← Analysis engines
│   ├── Data/                       ← Sample datasets
│   └── requirements.txt
│
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.js                  ← Main component
│   │   ├── pages/                  ← Page components
│   │   ├── components/             ← UI components
│   │   └── styles/                 ← CSS files
│   └── README.md
│
└── README.md
```

---

## 🔐 Security Checklist

Before production deployment:
- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Set up regular backups
- [ ] Keep dependencies updated

**Environment Variables (.env):**
```
DATABASE_URL=postgresql://user:password@localhost/db
SECRET_KEY=your_secure_key_here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## ✅ Pre-Submission Checklist

- [ ] All dependencies installed
- [ ] Backend starts without errors
- [ ] Frontend compiles successfully
- [ ] Database connection working
- [ ] Account creation works
- [ ] CSV upload successful
- [ ] Dashboard displays correctly
- [ ] Analysis pipelines complete
- [ ] CSV export feature works
- [ ] Profile editing functional
- [ ] No console errors
- [ ] Documentation complete

---

## 📚 API Endpoints Summary

**Authentication:**
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

**Data:**
- `POST /api/upload` - Upload CSV
- `GET /api/transactions` - List transactions
- `GET /api/transactions/export` - Export CSV

**Analysis:**
- `GET /api/analysis/dashboard` - Dashboard metrics
- `GET /api/analysis/risk` - Risk assessment
- `GET /api/analysis/anomalies` - Anomaly details

**User:**
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/password` - Change password

---

## 📖 Quick Example: New User Journey

1. **Signup:** User creates account
2. **First Login:** Empty dashboard
3. **Upload:** User uploads Q1-Q2 expense CSV (3,500 transactions)
4. **Processing:** System analyzes data (2-5 minutes)
5. **Dashboard Shows:**
   - Total Spending: $2,500,000
   - Health Score: 72/100 (Good)
   - Risk: Medium
6. **Analysis:** 
   - 35% salaries, 20% equipment, 15% travel
   - 32 anomalies in Q2
   - Spending up 25% Q1→Q2
7. **Export:** User downloads CSV for CFO
8. **Profile:** User updates company info

---

## 👥 Team

- **Abdullah Haroon**
- **Zayan Amjad** 
- **Ikhlas Ahmad**

**Institution:** FAST NUCES Lahore

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2024 | Initial release |
| 1.1 | Feb 2024 | HMM pipeline |
| 1.2 | Mar 2024 | Dashboard UI |
| 1.3 | Apr 2024 | CSV export |
| 1.4 | May 2024 | NLP improvements |

---

## 📞 Support

**Technical Issues:**
- Email: support@finsight.com
- Documentation: This guide
- API Docs: `http://localhost:8000/docs`

---

*For updates or corrections, contact the development team.*
