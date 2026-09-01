# SpendWise - Smart Expense Manager

> A modern full-stack personal finance management application for tracking income and expenses, managing monthly budgets, visualizing spending patterns, and receiving AI-powered financial insights.

---

## Overview

**SpendWise** is a full-stack smart expense management application designed to make personal financial tracking simple, visual, and intelligent.

Users can create an account, record income and expenses, organize transactions by category, set monthly budgets, monitor their financial balance, and analyze their spending through an interactive insights dashboard.

The application also includes a dedicated Python-based AI service that processes transaction data and provides spending-related analysis.

---

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Persistent login using browser local storage
- Logout functionality
- Protected transaction and budget APIs
- User-specific financial data

### Transaction Management

- Add income transactions
- Add expense transactions
- Edit existing transactions
- Delete transactions
- Categorize transactions
- Add transaction notes
- Select transaction dates
- View transaction history
- Separate income and expense transactions

### Dashboard

The SpendWise dashboard provides a quick overview of personal finances:

- Total income
- Total expenses
- Current balance
- Monthly budget
- Remaining budget
- Budget usage percentage
- Recent transactions
- Monthly analysis period

### Budget Management

Users can:

- Set a monthly spending budget
- Update an existing budget
- View total amount spent
- View remaining budget
- Monitor budget utilization
- Manage budgets for different months and years

### AI Spending Insights

SpendWise integrates a dedicated Python FastAPI service for transaction analysis.

The AI service processes information such as:

- Spending patterns
- Expense categories
- Average expenses
- Transaction counts
- High-spending areas
- Financial trends

The application displays AI-related analysis directly inside the insights experience.

### Insights Dashboard

The Insights page provides a detailed financial overview including:

- Spending analysis
- Income vs expense analysis
- Category-based analysis
- Budget analysis
- Financial summaries
- Interactive charts
- AI-generated spending information

### Responsive UI

SpendWise is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

The interface includes a responsive sidebar, navigation, cards, forms, tables, modals, and interactive controls.

---

# Tech Stack

## Frontend

- React.js
- Vite
- JavaScript
- CSS
- Lucide React
- Recharts

## Backend

- Node.js
- Express.js
- MongoDB
- JWT Authentication
- REST APIs

## AI Service

- Python
- FastAPI
- Uvicorn
- Pandas

## Development Tools

- Visual Studio Code
- Git
- GitHub
- npm
- Postman

---

# Project Architecture

```text
                         SpendWise
                            |
                            v
                 +----------------------+
                 |    React Frontend    |
                 |       Vite           |
                 |      Port 5173       |
                 +----------+-----------+
                            |
                            | REST API
                            v
                 +----------------------+
                 |       Backend        |
                 |   Node.js + Express  |
                 |      Port 5000       |
                 +----------+-----------+
                            |
                 +----------+-----------+
                 |                      |
                 v                      v
        +----------------+    +----------------------+
        |    MongoDB     |    |     AI Service       |
        | User & Finance |    | Python + FastAPI     |
        |      Data      |    |      Port 8000       |
        +----------------+    +----------------------+