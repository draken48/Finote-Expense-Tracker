# 💰 Finote AI — Intelligent Finance Controller

<p align="center">
  <img src="https://img.shields.io/badge/AI-Finance%20Controller-blueviolet?style=for-the-badge" alt="AI Finance Controller"/>
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-2.x-D71F00?style=for-the-badge" alt="SQLAlchemy"/>
</p>

<p align="center">
  <strong>Submission for Razorpay AI Builder 2026 — Track 4: AI Finance Controller</strong>
</p>

<p align="center">
  <strong>Observe → Understand → Detect → Predict → Recommend → Act</strong>
</p>

---

## 📌 Overview

**Finote AI** is an AI-powered financial intelligence platform designed to operate as a personal **Finance Controller**, rather than simply acting as an expense tracker.

Traditional expense trackers primarily answer:

> **"Where did my money go?"**

Finote AI goes further and answers:

> **"What is happening with my finances, why is it happening, what is likely to happen next, and what should I do about it?"**

Finote AI combines transaction intelligence, budget monitoring, anomaly detection, forecasting, financial health scoring, receipt intelligence, and a grounded AI Finance Copilot into one continuous financial-control workflow.

### Core Intelligence Loop

```text
┌─────────┐
│ Observe │
└────┬────┘
     ↓
┌────────────┐
│ Understand │
└────┬───────┘
     ↓
┌─────────┐
│ Detect  │
└────┬────┘
     ↓
┌─────────┐
│ Predict │
└────┬────┘
     ↓
┌─────────────┐
│ Recommend   │
└────┬────────┘
     ↓
┌─────────┐
│   Act   │
└─────────┘
```

---

# ✨ Key Features

## 1. 🏦 Executive Finance Dashboard

The dashboard provides a high-level real-time view of the user's financial position.

- Financial Health Score from 0–100
- Monthly income
- Current expenses
- Remaining balance / buffer
- Projected month-end spend
- Active financial risk alerts
- Grounded AI controller insights
- Spending distribution by category
- Income vs expense trend visualization
- Quick operations for common financial workflows

### Dashboard

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192740.png" width="100%" alt="Finote AI Dashboard"/>
</p>

### Dashboard Analytics & Controller Insights

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192841.png" width="100%" alt="Dashboard analytics and controller insights"/>
</p>

---

## 2. ⚡ Finance Action Center

The **Action Center** is the proactive risk-management layer of Finote AI.

It collects financial events that require attention and converts them into actionable recommendations.

### Supported alert categories

- Critical / high-risk events
- Budget risks
- Spending anomalies
- Forecast warnings
- AI recommendations
- Category threshold warnings
- Month-end overspending risks

Users can review alerts, open the affected category, dismiss an alert, and act on controller recommendations.

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192855.png" width="100%" alt="Finance Action Center"/>
</p>

---

## 3. 💳 Transaction Intelligence

Finote AI maintains a searchable transaction ledger containing financial events, metadata, categories, payment methods, recurring markers, and anomaly information.

### Transaction capabilities

- Add income or expenses
- Merchant / entity tracking
- Category selection and auto-categorization
- Date and payment-method tracking
- Recurring commitment / subscription support
- Search and filtering
- Anomaly-only filtering
- Edit and delete transactions
- CSV export
- Controller checks after transaction creation

### Transaction Ledger — Anomaly Detection

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192907.png" width="100%" alt="Transaction ledger with anomaly detection"/>
</p>

### Transaction Ledger — Example Anomaly

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192907.png" width="100%" alt="Transaction ledger showing anomaly"/>
</p>

---

## 4. 🚨 Statistical Anomaly Detection

Finote AI evaluates transactions against historical spending behavior and identifies unusual transactions.

The anomaly engine uses statistical signals including:

- **Z-Score**
- **Interquartile Range (IQR)**
- Category-specific historical baselines
- Median spending comparisons
- Normal-range deviation
- Normalized anomaly severity

The interface explains *why* a transaction was flagged instead of only showing a generic warning.

Example demo behavior:

> A ₹7,850 Shopping transaction is identified as a major outlier compared with the user's historical Shopping spending.

---

## 5. 📈 Burn-Rate Forecasting

Finote AI projects future spending using the user's current spending pace and financial commitments.

The forecasting layer supports:

- Daily burn-rate calculation
- Projected month-end spending
- Projected surplus / deficit
- Category-level projected overruns
- Recurring commitment awareness
- Budget pacing warnings

This enables Finote AI to identify problems **before** they become month-end problems.

---

## 6. 💰 Budget Monitoring

The Budget Monitoring module allows users to define category-level monthly spending limits and continuously monitor utilization.

### Budget intelligence includes

- Total monthly budget
- Total spending
- Unspent buffer
- Overall budget utilization
- Category-specific spending caps
- Warning thresholds
- Over-budget detection
- Projected month-end overruns

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192915.png" width="100%" alt="Budget Monitoring"/>
</p>

---

## 7. 🤖 Grounded AI Finance Copilot

The **AI Finance Controller Copilot** is designed to answer financial questions using structured financial data instead of behaving like a generic chatbot.

The Copilot can reason over:

- Current transactions
- Historical spending
- Budgets
- Category utilization
- Merchant-level spending
- Recurring commitments
- Forecast metrics
- Anomaly signals
- Financial health metrics

### Example questions

- How much did I spend on food this month?
- Am I going to exceed my budget?
- Why did my spending increase?
- Can I afford to spend ₹5,000 this weekend?
- Find unusual transactions.
- What is my projected month-end balance?
- How can I cut expenses?

### AI Copilot — Financial Overview

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193127.png" width="100%" alt="AI Finance Controller Copilot"/>
</p>

### AI Copilot — Food Spending Analysis

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193207.png" width="100%" alt="AI Copilot food spending analysis"/>
</p>

### AI Copilot — Affordability Forecast

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193151.png" width="100%" alt="AI Copilot affordability analysis"/>
</p>

### AI Copilot — Spending Increase Explanation

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193138.png" width="100%" alt="AI Copilot spending increase analysis"/>
</p>

---

## 8. 📸 Receipt Intelligence & OCR

Finote AI includes a Receipt Intelligence workflow for extracting structured financial information from receipt text or uploaded receipt images.

The interface supports extraction of information such as:

- Merchant
- Invoice information
- Date
- Amounts
- Tax / GST information when available
- Itemized receipt lines
- Suggested category

The extracted information can be reviewed before being used in the financial workflow.

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193337.png" width="90%" alt="Receipt Intelligence OCR"/>
</p>

---

## 9. ➕ Transaction Recording & Recurring Commitments

Finote AI provides a dedicated transaction-entry workflow.

### Standard transaction entry

Users can enter:

- Amount
- Description / purpose
- Merchant / entity
- Category
- Date
- Payment method
- Income or expense type

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192753.png" width="80%" alt="Record transaction form"/>
</p>

### Recurring transaction support

Transactions can be marked as recurring commitments or subscriptions and assigned a recurrence frequency.

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192829.png" width="80%" alt="Recurring transaction form"/>
</p>

---

## 10. 🎯 Financial Goals & Savings Milestones

The Goals module allows users to define financial targets and track progress toward them.

Features include:

- Goal name
- Target amount
- Deadline
- Current saved amount
- Remaining amount
- Progress visualization
- Incremental contribution tracking

### Create Financial Goal

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192936.png" width="100%" alt="Create financial goal"/>
</p>

### Saved Goal Progress

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193003.png" width="100%" alt="Financial goal progress"/>
</p>

---

## 11. ⚙️ Settings & Data Management

The Settings module provides user-level financial configuration and data-management controls.

### Supported controls include

- Theme appearance
- Fintech dark mode
- Base currency selection
- Data backup
- Data restoration
- Platform information
- Controller configuration information

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193248.png" width="100%" alt="Finote AI settings"/>
</p>

---

# 🏗️ System Architecture

```text
                         USER
                          │
                          ▼
              ┌──────────────────────┐
              │   React 18 Frontend  │
              │ Tailwind / Recharts  │
              │     Lucide Icons     │
              └──────────┬───────────┘
                         │
                    REST / JSON
                         │
                         ▼
              ┌──────────────────────┐
              │   FastAPI Backend    │
              │       Python        │
              └──────────┬───────────┘
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
        ▼                ▼                 ▼
 Transaction       Controller        AI Finance
 Intelligence       Pipeline          Copilot
        │                │                 │
        ▼                ▼                 ▼
 Anomaly Engine   Forecast Engine    Structured Tools
 Z-Score + IQR    Burn Rate          Grounded Queries
        │                │                 │
        └────────────────┼─────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ SQLAlchemy Database  │
              │ SQLite / PostgreSQL  │
              └──────────────────────┘
```

### Architecture Diagram

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/structure.png" width="100%" alt="Finote AI system architecture"/>
</p>

---

# 🧠 Intelligence Architecture

Finote AI is built around several complementary intelligence engines.

| Engine | Purpose |
|---|---|
| Transaction Intelligence | Records and analyzes financial events |
| Categorization | Organizes spending into financial categories |
| Anomaly Detection | Detects unusual spending behavior |
| Forecasting | Projects future spending and balance |
| Budget Controller | Monitors limits and threshold utilization |
| Health Score | Produces a deterministic financial-health metric |
| Receipt Intelligence | Converts receipt information into structured fields |
| AI Copilot | Answers grounded financial questions |
| Action Center | Converts financial events into actions |
| Goals | Tracks savings targets and milestones |

---

# 📊 Example Controller Scenario

Finote AI can detect a situation such as:

```text
Monthly Income                 ₹40,000
Current Expenses               ₹27,524.26
Remaining Balance              ₹12,475.74
Projected Month-End Spend      ₹42,662.60
Projected Deficit               ₹2,662.60

Food & Dining Budget Usage             89%
Shopping Budget                        Over Limit
High-Value Shopping Transaction      ₹7,850
```

Instead of simply reporting the numbers, the controller can:

1. Detect the spending anomaly.
2. Identify the affected category.
3. Compare current spending with historical behavior.
4. Forecast the month-end outcome.
5. Explain the financial risk.
6. Recommend reducing discretionary spending.
7. Present the recommendation inside the Action Center and AI Copilot.

This is the central difference between an **expense tracker** and a **finance controller**.

---

# 🎬 Razorpay AI Builder Demo Mode

Finote AI includes a synthetic-data demo workflow intended to make the controller behavior easy to demonstrate during a short presentation.

The demo scenario can populate financial activity around:

- ₹40,000 monthly income
- Multiple spending categories
- Recurring commitments
- Budget limits
- Spending anomalies
- Forecasting signals
- Action Center alerts
- AI Copilot questions

A representative anomaly is the **₹7,850 Croma Electronics transaction**, which provides a clear demonstration of anomaly detection, budget impact, forecasting, and AI explanation.

---

# 🖥️ Complete UI Gallery

## Dashboard

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192740.png" width="100%" alt="Dashboard"/>
</p>

## Action Center

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192855.png" width="100%" alt="Action Center"/>
</p>

## Transactions

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192907.png" width="100%" alt="Transactions"/>
</p>

## Budgets

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20192915.png" width="100%" alt="Budgets"/>
</p>

## Goals

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193003.png" width="100%" alt="Goals"/>
</p>

## AI Finance Copilot

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193127.png" width="100%" alt="AI Finance Copilot"/>
</p>

## Settings

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193248.png" width="100%" alt="Settings"/>
</p>

## Receipt Intelligence

<p align="center">
  <img src="https://raw.githubusercontent.com/draken48/Finote-Expense-Tracker/main/Screenshot%202026-08-20%20193337.png" width="90%" alt="Receipt Intelligence"/>
</p>

---

# 🛠️ Technology Stack

### Frontend

- React 18
- Create React App / React Scripts
- Recharts
- Lucide React
- CSS-based responsive dashboard UI

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- NumPy
- Python Dotenv
- Multipart upload support

### AI / Intelligence

- Grounded financial reasoning
- Structured financial tools
- Statistical anomaly detection
- Z-Score analysis
- IQR analysis
- Linear burn-rate forecasting
- Deterministic financial health scoring
- Receipt extraction / OCR workflow

### Database

- SQLAlchemy ORM
- SQLite for local development
- PostgreSQL-compatible architecture

---

# 🚀 Getting Started Locally

## Prerequisites

- Node.js 18+
- Python 3.10+
- npm
- Git

## 1. Clone the repository

```bash
git clone https://github.com/draken48/Finote-Expense-Tracker.git
cd Finote-Expense-Tracker
```

## 2. Start the Backend

```bash
cd backend

python -m venv .venv
```

### Windows PowerShell

```powershell
.venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

## 3. Start the Frontend

Open a new terminal at the project root:

```bash
npm install
npm start
```

Frontend:

```text
http://localhost:3000
```

---

# 🧪 Testing

The backend includes automated tests using **pytest**.

Run:

```bash
cd backend
pytest -v
```

The test suite covers controller and API behavior such as financial calculations, transaction workflows, anomaly logic, forecasting, and endpoint behavior where implemented in the repository.

---

# 🔐 Security & Data Practices

- Do not commit API keys or credentials.
- Store secrets in environment variables.
- Keep `.env` files out of version control.
- Financial calculations should be grounded in stored transaction and budget data.
- Receipt processing should avoid exposing sensitive data unnecessarily.
- Use the provided `.env.example` / environment configuration where applicable.

---

# 📁 Repository Structure

```text
Finote-Expense-Tracker/
│
├── backend/
│   ├── app/
│   ├── tests/
│   └── requirements.txt
│
├── public/
├── src/
├── docs/
├── build/
├── structure.png
├── package.json
├── package-lock.json
├── README.md
└── Screenshot *.png
```

---

# 🎯 Product Philosophy

Finote AI is designed around a simple principle:

> **Don't just tell users what happened. Help them understand what is happening, predict what happens next, and decide what to do.**

The controller therefore moves from:

```text
Tracking
   ↓
Understanding
   ↓
Detection
   ↓
Prediction
   ↓
Recommendation
   ↓
Action
```

This transforms Finote AI from a traditional expense-management application into an **intelligent financial control system**.

---

# 🏆 Razorpay AI Builder 2026

**Track:** 4 — AI Finance Controller

**Project:** Finote AI

**Core proposition:**

> **An AI-powered finance controller that continuously observes financial activity, detects risk, predicts future outcomes, explains financial behavior, and recommends actions grounded in the user's financial data.**

---

## 👨‍💻 Author

**Mayur V**

GitHub: [@draken48](https://github.com/draken48)

Repository: [Finote-Expense-Tracker](https://github.com/draken48/Finote-Expense-Tracker)

---

## ⭐ If you find Finote AI interesting

Star the repository and explore the implementation, controller logic, AI Copilot, anomaly detection, forecasting, and financial dashboard.
