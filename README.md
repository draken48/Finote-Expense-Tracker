# 💰 Finote AI — Intelligent Finance Controller

> **Submission for Razorpay AI Builder 2026 — Track 4: AI Finance Controller**
>
> *Finote AI is an AI-powered financial intelligence platform that understands transactions, detects unusual spending, monitors budgets, forecasts financial outcomes, explains financial behavior, and provides actionable recommendations using grounded financial data.*

---

## 🎯 Product Vision & Core Philosophy

Traditional expense trackers show users **what happened** in the past (Track → Report).

**Finote AI** acts as an autonomous finance controller operating on a 6-stage continuous intelligence loop:

$$\textbf{Observe} \longrightarrow \textbf{Understand} \longrightarrow \textbf{Detect} \longrightarrow \textbf{Predict} \longrightarrow \textbf{Recommend} \longrightarrow \textbf{Act}$$

---

## ✨ Key Features & Architectural Modules

### 1. 🛡️ Executive Finance Dashboard
- **Live Financial Health Score**: 0 to 100 transparent, reproducible composite score across 6 weighted dimensions.
- **Real-Time Grounded Cashflow**: Monthly Income (₹40,000 baseline), Current Expenses, Remaining Buffer, and Projected Spend.
- **Active Risk Ribbon**: Proactive alerts for budget overruns, abnormal spikes, and month-end liquidity deficits.
- **Visual Analytics**: Dynamic Recharts category distribution and income vs expense monthly trends.

### 2. ⚡ Action Center (Signature Feature)
- Centralized triage center for critical risk alerts, budget threshold warnings, spending anomalies, and AI recommendations.
- Interactive user actions: **Review Anomaly**, **Adjust Budget**, **Mark Normal**, and **Dismiss Alert**.

### 3. 🚨 Statistical Anomaly Detection Engine
- Evaluates incoming transactions against the user's category-specific historical baseline.
- Employs **Z-Score** and **Interquartile Range (IQR)** statistics to flag spending anomalies with normalized severity scores (0 to 100) and human-readable comparative explanations.

### 4. 📈 Linear Burn Rate Forecasting Service
- Projects month-end spending, projected deficit/surplus, and category-level overruns based on active calendar burn rates.
- Evaluates fixed recurring commitments against discretionary pacing.

### 5. 🤖 Grounded AI Finance Copilot (Tool-Calling Agent)
- Not a generic chatbot wrapper. The AI calls **14 structured financial tools** to query live database metrics before answering.
- Displays transparent database citations (e.g., *"Analyzed 47 transactions | Budget data grounded"*).
- Pre-configured prompt chips for 5-minute presentation inquiries (*"Am I going to exceed my budget?"*, *"Why did my spending increase?"*, *"Can I afford ₹5,000 this weekend?"*).

### 6. 📸 Receipt Intelligence & OCR Pipeline
- Automated extraction of merchant, date, amount, applicable GST/tax, and itemized lines from receipt text or images.
- Interactive pre-save verification modal before ledger insertion.

### 7. 🎯 5-Minute Razorpay Pitch Demo Mode
- Instant 1-click synthetic data seeder populating ₹40,000 income, balanced multi-category expenses, recurring subscriptions, and a signature high-impact spending anomaly (₹7,850 Croma Electronics).

---

## 🏗️ System Architecture

```
User (Browser)
      │
      ▼
React 18 Fintech Dashboard  (Tailwind CSS + Recharts + Lucide)
      │
      ▼ (REST API / JSON / Offline Resilience)
FastAPI Python Backend  (Port 8000)
      │
      ├── Finance Controller Event Pipeline
      ├── Transaction & Categorization Service
      ├── Statistical Anomaly Detection Engine (Z-score + IQR)
      ├── Linear Burn Rate Forecasting Engine
      ├── Deterministic 100-Pt Health Score Engine
      ├── Receipt OCR Intelligence Service
      ├── AI Tool-Calling Agent (14 Structured Tools)
      │
      ▼
SQLAlchemy Relational Database  (SQLite / PostgreSQL)
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18+ or v24+
- **Python**: 3.10+ or 3.11+

### 1. Clone & Setup Repository
```bash
git clone <repository-url>
cd Finote-Expense-Tracker-main/Finote-Expense-Tracker-main
```

### 2. Setup & Start Backend (FastAPI)
```bash
cd backend
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (Interactive Swagger Docs at `http://localhost:8000/docs`).

### 3. Setup & Start Frontend (React)
In a new terminal:
```bash
cd Finote-Expense-Tracker-main/Finote-Expense-Tracker-main
npm install
npm start
```
Frontend application will open at `http://localhost:3000`.

---

## 🧪 Running Automated Tests

Run the complete backend test suite:
```bash
cd backend
.venv\Scripts\python.exe -m pytest -v
```
All 14 automated unit and integration tests will execute and pass:
- Anomaly detection verification
- Linear burn forecasting calculation
- 100-point Health Score deterministic breakdown
- AI Agent grounded tool execution
- Transaction CRUD & filtering
- REST API endpoint contracts

---

## 🎬 5-Minute Razorpay Pitch Demo Flow

1. **Open Dashboard**: Load `http://localhost:3000` and click **"Seed 5-Min Pitch Demo Data"** at the top banner.
2. **Review Health Score**: Observe the **78 / 100** Financial Health Score, income (₹40,000), current expenses, and projected overspend.
3. **Action Center Triage**: Navigate to the **Action Center** tab to inspect the flagged **Croma Electronics Anomaly** (₹7,850) and shopping budget threshold warning.
4. **AI Copilot Interaction**: Open **AI Copilot** and click:
   - *"Am I going to exceed my budget?"* → AI calls `get_forecast()` and explains the projected ₹3,200 overrun with database citations.
   - *"Why did my spending increase?"* → AI identifies the Croma Electronics outlier and category shifts.
   - *"Can I afford to spend ₹5,000 this weekend?"* → AI checks remaining liquidity buffer and advises caution.
5. **Receipt Intelligence**: Click the purple camera button in the bottom right, select the **Starbucks Coffee Receipt**, click **"Analyze & Extract"**, verify the pre-save confirmation modal, and click **"Confirm & Add Transaction"**.
6. **Live Controller Update**: Watch the Dashboard and Forecast immediately recompute with the new transaction.

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets**: All configuration is managed via environment variables (`.env.example`).
- **Data Grounding**: Financial analytics and AI responses are 100% grounded in real relational database tables.
- **Privacy First**: Sensitive receipt image buffers are processed securely with optional local fallback.

---

## 👥 Authors & Credits

Developed for the **Razorpay AI Builder Internship 2026 (Track 4: AI Finance Controller)** by **Mayur V, Nivedha K, Divya SB**.
