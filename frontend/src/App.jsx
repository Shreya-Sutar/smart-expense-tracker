import React, { useMemo, useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./App.css";
import AIInsights from "./AIInsights.jsx";

/* =========================================================
   ICONS
========================================================= */

const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),

  Transactions: () => (
    <svg viewBox="0 0 24 24">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),

  Analytics: () => (
    <svg viewBox="0 0 24 24">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 16v-5" />
      <path d="M12 16V7" />
      <path d="M17 16V9" />
    </svg>
  ),

  AI: () => (
    <svg viewBox="0 0 24 24">
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 9h6v6H9z" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </svg>
  ),

  Wallet: () => (
    <svg viewBox="0 0 24 24">
      <path d="M3 7h18v12H3z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h14" />
      <path d="M16 13h5" />
      <circle cx="16" cy="13" r="1" />
    </svg>
  ),

  Plus: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),

  Edit: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  ),

  Trash: () => (
    <svg viewBox="0 0 24 24">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),

  Search: () => (
    <svg viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  ),

  Close: () => (
    <svg viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),

  ArrowUp: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  ),

  ArrowDown: () => (
    <svg viewBox="0 0 24 24">
      <path d="M12 5v14" />
      <path d="m18 13-6 6-6-6" />
    </svg>
  ),
};

/* =========================================================
   DATA
========================================================= */

const initialTransactions = [
  {
    id: 1,
    title: "Lunch",
    category: "Food",
    amount: 250,
    type: "expense",
    date: "2026-08-30",
  },
  {
    id: 2,
    title: "Uber",
    category: "Travel",
    amount: 180,
    type: "expense",
    date: "2026-08-29",
  },
  {
    id: 3,
    title: "Shopping",
    category: "Shopping",
    amount: 1200,
    type: "expense",
    date: "2026-08-27",
  },
  {
    id: 4,
    title: "Salary",
    category: "Income",
    amount: 35000,
    type: "income",
    date: "2026-08-25",
  },
  {
    id: 5,
    title: "Electricity Bill",
    category: "Bills",
    amount: 1450,
    type: "expense",
    date: "2026-08-22",
  },
  {
    id: 6,
    title: "Movie",
    category: "Entertainment",
    amount: 400,
    type: "expense",
    date: "2026-08-20",
  },
];

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

const categoryColors = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#10b981",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

/* =========================================================
   APP
========================================================= */

function App() {
  const today = new Date();

  const [activePage, setActivePage] =
    useState("dashboard");

  const [transactions, setTransactions] =
    useState(initialTransactions);

  const [budget, setBudget] = useState(10000);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const [analysisMode, setAnalysisMode] =
    useState("monthly");

  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    type: "expense",
    date: today.toISOString().split("T")[0],
  });

  /* =======================================================
     YEARS
  ======================================================= */

  const availableYears = useMemo(() => {
    const years = new Set();

    transactions.forEach((transaction) => {
      const year = new Date(
        `${transaction.date}T00:00:00`
      ).getFullYear();

      years.add(year);
    });

    years.add(today.getFullYear());

    return Array.from(years).sort(
      (a, b) => b - a
    );
  }, [transactions]);

  /* =======================================================
     SELECTED TRANSACTIONS
  ======================================================= */

  const selectedTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(
        `${transaction.date}T00:00:00`
      );

      if (
        date.getFullYear() !== selectedYear
      ) {
        return false;
      }

      if (analysisMode === "yearly") {
        return true;
      }

      return date.getMonth() === selectedMonth;
    });
  }, [
    transactions,
    selectedYear,
    selectedMonth,
    analysisMode,
  ]);

  /* =======================================================
     TOTALS
  ======================================================= */

  const income = useMemo(
    () =>
      selectedTransactions
        .filter((t) => t.type === "income")
        .reduce(
          (sum, t) => sum + Number(t.amount || 0),
          0
        ),
    [selectedTransactions]
  );

  const expenses = useMemo(
    () =>
      selectedTransactions
        .filter((t) => t.type === "expense")
        .reduce(
          (sum, t) => sum + Number(t.amount || 0),
          0
        ),
    [selectedTransactions]
  );

  const balance = income - expenses;

  const budgetPercentage =
    budget > 0
      ? Math.min((expenses / budget) * 100, 100)
      : 0;

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...selectedTransactions]
      .filter((transaction) => {
        if (!query) return true;

        return `${transaction.title} ${transaction.category} ${transaction.type}`
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(`${b.date}T00:00:00`) -
          new Date(`${a.date}T00:00:00`)
      );
  }, [selectedTransactions, search]);

  /* =======================================================
     MONTHLY DATA
  ======================================================= */

  const monthlyData = useMemo(() => {
    return months.map((month, index) => {
      let expense = 0;
      let incomeAmount = 0;

      transactions.forEach((transaction) => {
        const date = new Date(
          `${transaction.date}T00:00:00`
        );

        if (
          date.getFullYear() === selectedYear &&
          date.getMonth() === index
        ) {
          if (transaction.type === "expense") {
            expense += Number(transaction.amount || 0);
          } else {
            incomeAmount += Number(transaction.amount || 0);
          }
        }
      });

      return {
        month: month.substring(0, 3),
        expense,
        income: incomeAmount,
      };
    });
  }, [transactions, selectedYear]);

  /* =======================================================
     CATEGORY DATA
  ======================================================= */

  const categoryData = useMemo(() => {
    const map = {};

    selectedTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        map[transaction.category] =
          (map[transaction.category] || 0) +
          Number(transaction.amount || 0);
      });

    return Object.entries(map).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [selectedTransactions]);

  /* =======================================================
     TREND
  ======================================================= */

  const trendData = useMemo(() => {
    const sorted = [...selectedTransactions].sort(
      (a, b) =>
        new Date(`${a.date}T00:00:00`) -
        new Date(`${b.date}T00:00:00`)
    );

    let runningTotal = 0;

    return sorted.map((transaction) => {
      if (transaction.type === "expense") {
        runningTotal += Number(transaction.amount || 0);
      }

      return {
        date: new Date(
          `${transaction.date}T00:00:00`
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        spending: runningTotal,
      };
    });
  }, [selectedTransactions]);

  /* =======================================================
     MODAL
  ======================================================= */

  const openAddModal = () => {
    setEditingTransaction(null);

    setForm({
      title: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    });

    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);

    setForm({
      title: transaction.title || "",
      amount: String(transaction.amount || ""),
      category:
        transaction.type === "income"
          ? "Income"
          : transaction.category || "Food",
      type: transaction.type || "expense",
      date: transaction.date,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  /* =======================================================
     FORM — FIXED
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;

    setForm((previous) => ({
      ...previous,
      type,
      category:
        type === "income"
          ? "Income"
          : previous.category === "Income"
          ? "Food"
          : previous.category,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const amount = Number(form.amount);

    if (!title) {
      window.alert("Please enter a transaction name.");
      return;
    }

    if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
      window.alert("Please enter a valid amount.");
      return;
    }

    if (!form.date) {
      window.alert("Please select a date.");
      return;
    }

    const transactionData = {
      title,
      amount,
      category:
        form.type === "income"
          ? "Income"
          : form.category,
      type: form.type,
      date: form.date,
    };

    if (editingTransaction) {
      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === editingTransaction.id
            ? {
                ...transaction,
                ...transactionData,
              }
            : transaction
        )
      );
    } else {
      setTransactions((previous) => [
        {
          id: Date.now(),
          ...transactionData,
        },
        ...previous,
      ]);
    }

    closeModal();
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteTransaction = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    setTransactions((previous) =>
      previous.filter(
        (transaction) => transaction.id !== id
      )
    );
  };

  /* =======================================================
     PERIOD
  ======================================================= */

  const PeriodSelector = ({ title }) => (
    <div className="period-selector">
      <div className="period-info">
        <span>{title}</span>

        <strong>
          {analysisMode === "yearly"
            ? `Full Year ${selectedYear}`
            : `${months[selectedMonth]} ${selectedYear}`}
        </strong>
      </div>

      <div className="period-controls">
        <select
          value={selectedYear}
          onChange={(event) =>
            setSelectedYear(
              Number(event.target.value)
            )
          }
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={
            analysisMode === "yearly"
              ? "yearly"
              : String(selectedMonth)
          }
          onChange={(event) => {
            if (event.target.value === "yearly") {
              setAnalysisMode("yearly");
            } else {
              setAnalysisMode("monthly");
              setSelectedMonth(
                Number(event.target.value)
              );
            }
          }}
        >
          {months.map((month, index) => (
            <option
              key={month}
              value={index}
            >
              {month}
            </option>
          ))}

          <option value="yearly">
            Full Year
          </option>
        </select>
      </div>
    </div>
  );

  /* =======================================================
     STAT
  ======================================================= */

  const StatCard = ({
    title,
    value,
    subtitle,
    type,
    icon,
  }) => (
    <div className={`stat-card ${type}`}>
      <div className="stat-content">
        <span className="stat-title">
          {title}
        </span>

        <h2>{formatCurrency(value)}</h2>

        <small>{subtitle}</small>
      </div>

      <div className="stat-icon">
        {icon}
      </div>
    </div>
  );

  /* =======================================================
     TRANSACTION LIST
  ======================================================= */

  const TransactionList = ({ limit }) => {
    const list = limit
      ? filteredTransactions.slice(0, limit)
      : filteredTransactions;

    if (list.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            <Icons.Wallet />
          </div>

          <strong>No transactions found</strong>

          <span>
            Add a transaction to start tracking
            your money.
          </span>
        </div>
      );
    }

    return (
      <div className="transaction-list">
        {list.map((transaction) => (
          <div
            className="transaction-row"
            key={transaction.id}
          >
            <div className="transaction-info">
              <div
                className={`transaction-avatar ${transaction.type}`}
              >
                {transaction.title
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="transaction-details">
                <strong>
                  {transaction.title}
                </strong>

                <small>
                  {transaction.category}
                  <span>•</span>
                  {formatDate(transaction.date)}
                </small>
              </div>
            </div>

            <div
              className={`transaction-amount ${transaction.type}`}
            >
              {transaction.type === "income"
                ? "+"
                : "-"}
              {formatCurrency(transaction.amount)}
            </div>

            <div className="transaction-actions">
              <button
                type="button"
                onClick={() =>
                  openEditModal(transaction)
                }
                title="Edit"
              >
                <Icons.Edit />
              </button>

              <button
                type="button"
                className="delete-action"
                onClick={() =>
                  deleteTransaction(transaction.id)
                }
                title="Delete"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* =======================================================
     HEADER
  ======================================================= */

  const PageHeader = ({
    eyebrow,
    title,
    description,
    action,
  }) => (
    <div className="page-header">
      <div>
        <span className="eyebrow">
          {eyebrow}
        </span>

        <h1>{title}</h1>

        <p>{description}</p>
      </div>

      {action}
    </div>
  );

  /* =======================================================
     DASHBOARD
  ======================================================= */

  const Dashboard = () => (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title="Dashboard"
        description="Track your money and understand your spending."
        action={
          <button
            type="button"
            className="primary-button"
            onClick={openAddModal}
          >
            <Icons.Plus />
            Add Transaction
          </button>
        }
      />

      <PeriodSelector title="View Analysis" />

      <div className="stats-grid">
        <StatCard
          title="Total Balance"
          value={balance}
          subtitle="Income minus expenses"
          type={
            balance >= 0
              ? "balance-card"
              : "negative-card"
          }
          icon={
            balance >= 0 ? (
              <Icons.ArrowUp />
            ) : (
              <Icons.ArrowDown />
            )
          }
        />

        <StatCard
          title="Total Income"
          value={income}
          subtitle="Money received"
          type="income-card"
          icon={<Icons.ArrowDown />}
        />

        <StatCard
          title="Total Expenses"
          value={expenses}
          subtitle="Money spent"
          type="expense-card"
          icon={<Icons.ArrowUp />}
        />

        <StatCard
          title="Budget Remaining"
          value={Math.max(
            budget - expenses,
            0
          )}
          subtitle={`Budget: ${formatCurrency(
            budget
          )}`}
          type="budget-card"
          icon={<Icons.Wallet />}
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                FINANCIAL OVERVIEW
              </span>

              <h3>Monthly Spending</h3>

              <p>
                Income compared with expenses
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel budget-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                SPENDING CONTROL
              </span>

              <h3>Budget</h3>

              <p>
                Monthly spending limit
              </p>
            </div>
          </div>

          <div className="budget-number">
            {formatCurrency(expenses)}

            <span>
              / {formatCurrency(budget)}
            </span>
          </div>

          <div className="progress">
            <div
              className={`progress-fill ${
                budgetPercentage >= 100
                  ? "danger"
                  : ""
              }`}
              style={{
                width: `${budgetPercentage}%`,
              }}
            />
          </div>

          <div className="budget-meta">
            <span>
              {Math.round(budgetPercentage)}%
              {" "}used
            </span>

            <span>
              {formatCurrency(
                Math.max(
                  budget - expenses,
                  0
                )
              )}{" "}
              left
            </span>
          </div>

          <p className="budget-text">
            {budgetPercentage >= 100
              ? "⚠️ You have exceeded your budget."
              : "You're within your spending limit."}
          </p>

          <div className="budget-edit">
            <label>Set Budget</label>

            <div className="budget-input">
              <span>₹</span>

              <input
                type="number"
                min="0"
                value={budget}
                onChange={(event) =>
                  setBudget(
                    Math.max(
                      0,
                      Number(event.target.value) || 0
                    )
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="panel recent-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">
              ACTIVITY
            </span>

            <h3>Recent Transactions</h3>

            <p>
              Your latest financial activity
            </p>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={() =>
              setActivePage("transactions")
            }
          >
            View All →
          </button>
        </div>

        <TransactionList limit={5} />
      </div>
    </>
  );

  /* =======================================================
     TRANSACTIONS PAGE
  ======================================================= */

  const TransactionsPage = () => (
    <>
      <PageHeader
        eyebrow="MONEY ACTIVITY"
        title="Transactions"
        description="Manage all your income and expenses."
        action={
          <button
            type="button"
            className="primary-button"
            onClick={openAddModal}
          >
            <Icons.Plus />
            Add Transaction
          </button>
        }
      />

      <PeriodSelector title="Showing Transactions" />

      <div className="panel transactions-panel">
        <div className="transaction-toolbar">
          <div className="search-box">
            <Icons.Search />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transactions..."
            />
          </div>

          <div className="transaction-count">
            {filteredTransactions.length}{" "}
            {filteredTransactions.length === 1
              ? "transaction"
              : "transactions"}
          </div>
        </div>

        <TransactionList />
      </div>
    </>
  );

  /* =======================================================
     ANALYTICS
  ======================================================= */

  const AnalyticsPage = () => (
    <>
      <PageHeader
        eyebrow="INSIGHTS"
        title="Analytics"
        description="Visualize your financial habits and spending patterns."
      />

      <PeriodSelector title="Analytics Period" />

      <div className="analytics-stats">
        <div className="analytics-mini-card">
          <span>Total Income</span>
          <strong>
            {formatCurrency(income)}
          </strong>
        </div>

        <div className="analytics-mini-card">
          <span>Total Expenses</span>
          <strong>
            {formatCurrency(expenses)}
          </strong>
        </div>

        <div className="analytics-mini-card">
          <span>Savings</span>
          <strong>
            {formatCurrency(
              Math.max(balance, 0)
            )}
          </strong>
        </div>

        <div className="analytics-mini-card">
          <span>Budget Used</span>
          <strong>
            {Math.round(budgetPercentage)}%
          </strong>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                COMPARISON
              </span>

              <h3>
                Income vs Expenses
              </h3>
            </div>
          </div>

          <div className="large-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  analysisMode === "yearly"
                    ? monthlyData
                    : [
                        {
                          month:
                            months[
                              selectedMonth
                            ].substring(0, 3),
                          income,
                          expense: expenses,
                        },
                      ]
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(value)
                  }
                />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[8, 8, 0, 0]}
                />

                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                BREAKDOWN
              </span>

              <h3>
                Expenses by Category
              </h3>
            </div>
          </div>

          <div className="pie-chart-container">
            {categoryData.length === 0 ? (
              <div className="empty-state">
                <strong>
                  No expense data
                </strong>

                <span>
                  Add an expense to see the
                  breakdown.
                </span>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map(
                      (entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            categoryColors[
                              index %
                                categoryColors.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="panel chart-panel full-width">
          <div className="panel-header">
            <div>
              <span className="panel-label">
                SPENDING TREND
              </span>

              <h3>
                Cumulative Spending
              </h3>
            </div>
          </div>

          <div className="large-chart">
            {trendData.length === 0 ? (
              <div className="empty-state">
                <strong>
                  No spending data
                </strong>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart data={trendData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="spending"
                    name="Spending"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );

  /* =======================================================
     MODAL
  ======================================================= */

  const TransactionModal = () => {
    if (!showModal) return null;

    return (
      <div
        className="modal-overlay"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            closeModal();
          }
        }}
      >
        <div
          className="modal"
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          <div className="modal-header">
            <div>
              <span className="panel-label">
                TRANSACTION
              </span>

              <h2>
                {editingTransaction
                  ? "Edit Transaction"
                  : "Add Transaction"}
              </h2>

              <p>
                Enter your transaction details
                below.
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={closeModal}
            >
              <Icons.Close />
            </button>
          </div>

          <form
            className="transaction-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="transaction-title">
                Transaction Name
              </label>

              <input
                id="transaction-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Grocery shopping"
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transaction-amount">
                  Amount
                </label>

                <div className="currency-input">
                  <span>₹</span>

                  <input
                    id="transaction-amount"
                    name="amount"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="transaction-type">
                  Type
                </label>

                <select
                  id="transaction-type"
                  name="type"
                  value={form.type}
                  onChange={handleTypeChange}
                >
                  <option value="expense">
                    Expense
                  </option>

                  <option value="income">
                    Income
                  </option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transaction-category">
                  Category
                </label>

                <select
                  id="transaction-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={
                    form.type === "income"
                  }
                >
                  {form.type === "income" ? (
                    <option value="Income">
                      Income
                    </option>
                  ) : (
                    categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="transaction-date">
                  Date
                </label>

                <input
                  id="transaction-date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                {editingTransaction
                  ? "Save Changes"
                  : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  /* =======================================================
     APP LAYOUT
  ======================================================= */

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Icons.Wallet />
          </div>

          <div className="brand-text">
            <strong>SpendWise</strong>

            <span>
              Expense Manager
            </span>
          </div>
        </div>

        <nav className="navigation">
          <button
            type="button"
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <Icons.Dashboard />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={
              activePage === "transactions"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("transactions")
            }
          >
            <Icons.Transactions />
            <span>Transactions</span>
          </button>

          <button
            type="button"
            className={
              activePage === "analytics"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("analytics")
            }
          >
            <Icons.Analytics />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            className={
              activePage === "ai"
                ? "nav-item active ai-nav-item"
                : "nav-item ai-nav-item"
            }
            onClick={() =>
              setActivePage("ai")
            }
          >
            <Icons.AI />
            <span>AI Insights</span>
            <small>NEW</small>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-budget">
          <div className="sidebar-budget-top">
            <span>Monthly Budget</span>
            <Icons.Wallet />
          </div>

          <strong>
            {formatCurrency(budget)}
          </strong>

          <div className="mini-progress">
            <div
              style={{
                width: `${budgetPercentage}%`,
              }}
            />
          </div>

          <small>
            {formatCurrency(expenses)} spent
          </small>
        </div>

        <div className="sidebar-footer">
          <span>SpendWise</span>
          <span>Personal Finance</span>
        </div>
      </aside>

      <main className="main-content">
        {activePage === "dashboard" && (
          <Dashboard />
        )}

        {activePage === "transactions" && (
          <TransactionsPage />
        )}

        {activePage === "analytics" && (
          <AnalyticsPage />
        )}

        {activePage === "ai" && (
          <AIInsights
            transactions={transactions}
            budget={budget}
          />
        )}
      </main>

      <TransactionModal />
    </div>
  );
}

export default App;