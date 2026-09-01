# 💰 SpendWise — Smart Expense Manager

> A modern full-stack personal finance management application that helps users track income and expenses, manage monthly budgets, visualize spending patterns, and receive AI-powered financial insights.

---

## 📌 Overview

**SpendWise** is a full-stack smart expense management application designed to make personal financial tracking simple, visual, and intelligent.

Users can securely create an account, record their income and expenses, organize transactions by category, set monthly budgets, monitor their financial balance, and analyze their spending through an interactive insights dashboard.

The application also includes a dedicated **AI service** that analyzes transaction data and provides spending-related insights.

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* Secure authentication using JWT
* Persistent login using browser local storage
* Logout functionality
* Protected transaction and budget APIs

### 💳 Transaction Management

* Add income and expense transactions
* Edit existing transactions
* Delete transactions
* Categorize transactions
* Add transaction notes
* Select transaction dates
* View monthly transaction history
* Separate income and expense transactions

### 📊 Dashboard

The dashboard provides a quick overview of personal finances:

* Total income
* Total expenses
* Current balance
* Monthly budget
* Remaining budget
* Budget usage percentage
* Recent transactions
* Monthly analysis period selector

### 💰 Budget Management

Users can:

* Set a monthly spending budget
* Update an existing budget
* View total amount spent
* View remaining budget
* Monitor budget utilization
* Track budgets separately for different months and years

### 🤖 AI Spending Insights

SpendWise integrates a dedicated AI service to analyze transaction data.

The AI service can process:

* Spending patterns
* Expense categories
* Average expenses
* Transaction counts
* High-spending areas
* Financial trends

The application displays the AI service connection and analysis status directly inside the dashboard.

### 📈 Insights Dashboard

The AI Insights page provides a detailed financial overview using:

* Spending analysis
* Income vs expense information
* Category-based analysis
* Budget analysis
* Financial summaries
* Visual data representation
* AI-generated spending information

### 📱 Responsive UI

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile devices

It includes a responsive sidebar, mobile navigation, cards, tables, forms, modals, and interactive controls.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* JavaScript
* CSS
* Lucide React
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* REST APIs

## AI Service

* Python
* FastAPI
* Uvicorn
* Pandas

## Development Tools

* Visual Studio Code
* Git
* GitHub
* npm
* Postman

---

# 🏗️ Project Architecture

```text
                   ┌──────────────────────┐
                   │      SpendWise       │
                   │   React Frontend     │
                   │      Port 5173       │
                   └──────────┬───────────┘
                              │
                              │ REST API
                              ▼
                   ┌──────────────────────┐
                   │       Backend        │
                   │   Node.js + Express  │
                   │      Port 5000       │
                   └──────────┬───────────┘
                              │
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐   ┌─────────────────┐
          │     MongoDB     │   │    AI Service   │
          │ User & Finance  │   │ Python + FastAPI│
          │      Data       │   │    Port 8000    │
          └─────────────────┘   └─────────────────┘
```

---

# 📂 Project Structure

```text
smart-expense-tracker/
│
├── ai-service/
│   ├── main.py
│   └── requirements.txt
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── src/
│
├── frontend/
│   └── src/
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

Follow the steps below to run SpendWise locally.

## 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project directory:

```bash
cd smart-expense-tracker
```

---

# 🖥️ 2. Start the Frontend

Open a terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

# ⚙️ 3. Start the Backend

Open a **new terminal**.

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start
```

If your backend uses a development command, you can also use:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

---

# 🤖 4. Start the AI Service

Open another terminal.

Navigate to the AI service:

```bash
cd ai-service
```

Create a virtual environment:

### Windows

```bash
python -m venv .venv
```

Activate it:

```bash
.venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Start the FastAPI service:

```bash
uvicorn main:app --reload --port 8000
```

The AI service will run at:

```text
http://localhost:8000
```

---

# 🔄 Running the Complete Application

SpendWise requires three services to run simultaneously.

### Terminal 1 — Frontend

```bash
cd frontend
npm run dev
```

### Terminal 2 — Backend

```bash
cd backend
npm start
```

### Terminal 3 — AI Service

```bash
cd ai-service
.venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Then open:

```text
http://localhost:5173
```

---

# 🔌 API Services

| Service    | URL                     | Purpose                                |
| ---------- | ----------------------- | -------------------------------------- |
| Frontend   | `http://localhost:5173` | User interface                         |
| Backend    | `http://localhost:5000` | Authentication, transactions & budgets |
| AI Service | `http://localhost:8000` | Spending analysis                      |

---

# 📡 Main API Operations

## Authentication

```text
POST /api/register
POST /api/login
```

## Transactions

```text
GET    /api/transactions
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

## Budget

```text
GET /api/budget
PUT /api/budget
```

## AI Analysis

```text
POST /process-transactions
```

---

# 📊 Application Flow

```text
User
 │
 ▼
Register / Login
 │
 ▼
SpendWise Dashboard
 │
 ├───────────────┐
 │               │
 ▼               ▼
Transactions    Budget
 │               │
 │               │
 └───────┬───────┘
         │
         ▼
   Financial Data
         │
         ▼
     AI Service
         │
         ▼
  Spending Analysis
         │
         ▼
   AI Insights Page
```

---

# 🧠 How the AI Integration Works

SpendWise sends transaction information from the React frontend to the Python-based AI service.

The transaction data includes information such as:

```text
Transaction ID
Title
Amount
Type
Category
Date
Note
```

The AI service processes the transaction dataset and returns analysis results to the frontend.

Example data flow:

```text
React Frontend
      │
      │ Transaction Data
      ▼
FastAPI AI Service
      │
      │ Data Processing
      ▼
Spending Analysis
      │
      ▼
AI Results
      │
      ▼
SpendWise Dashboard
```

---

# 🔒 Security

SpendWise implements authentication and protected APIs using:

* JWT-based authentication
* Authorization headers
* Protected transaction endpoints
* Protected budget endpoints
* User-specific financial data
* Environment-based configuration

> **Important:** Never commit passwords, JWT secrets, MongoDB credentials, API keys, or other sensitive information to GitHub.

---

# 🎯 Future Enhancements

Possible future improvements include:

* Advanced AI-generated financial recommendations
* Expense forecasting
* Monthly spending predictions
* Automatic financial alerts
* Email notifications
* Custom transaction categories
* Recurring transactions
* Export transactions to CSV/PDF
* Advanced filtering and search
* Dark/light theme customization
* Financial goal tracking
* Cloud deployment
* Mobile application

---

# 🎓 Project Purpose

SpendWise was developed as a full-stack software project to demonstrate practical implementation of:

* Frontend development
* Backend development
* REST API integration
* Database management
* Authentication
* Data visualization
* AI service integration
* Responsive UI/UX design
* Git and GitHub workflow

---

# 👩‍💻 Developer

**Shreya Sutar**

B.E. Computer Science Engineering

Interested in:

* Web Development
* Artificial Intelligence
* Machine Learning
* Data Science
* Software Development

---

# 📜 License

This project is created for educational and academic purposes.

---

## ⭐ SpendWise

**Track your money. Understand your spending. Make smarter decisions.**

---
