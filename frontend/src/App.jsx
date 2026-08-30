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

import Login from "./Login.jsx";
import Register from "./Register.jsx";

import "./App.css";

/* =========================================================
   ICONS
========================================================= */

const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),

  Transactions: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),

  Analytics: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 16v-5" />
      <path d="M12 16V7" />
      <path d="M17 16V9" />
    </svg>
  ),

  Wallet: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M3 7h18v12H3z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h14" />
      <path d="M16 13h5" />
      <circle cx="16" cy="13" r="1" />
    </svg>
  ),

  Plus: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),

  Edit: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  ),

  Trash: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),

  Search: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  ),

  Close: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),

  ArrowUp: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </svg>
  ),

  ArrowDown: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M12 5v14" />
      <path d="m18 13-6 6-6-6" />
    </svg>
  ),

  Logout: () => (
    <svg viewBox="0 0 24 24" className="icon">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
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

function playSound(type = "success") {
  try {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value =
      type === "success" ? 700 : 220;

    oscillator.type = "sine";

    gain.gain.setValueAtTime(
      0.05,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.15
    );

    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);
  } catch {
    // Optional sound.
  }
}

/* =========================================================
   APP
========================================================= */

function App() {
  const today = new Date();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "spendwise_current_user"
        ) || "null"
      );
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] =
    useState("login");

  const [activePage, setActivePage] =
    useState("dashboard");

  const [transactions, setTransactions] =
    useState(initialTransactions);

  const [budget, setBudget] =
    useState(10000);

  const [search, setSearch] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

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
     AUTH
  ======================================================= */

  const handleLogin = (user) => {
    setCurrentUser(user);
    setAuthMode("login");
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "spendwise_current_user"
    );

    setCurrentUser(null);
    setActivePage("dashboard");
  };

  if (!currentUser) {
    if (authMode === "register") {
      return (
        <Register
          onLogin={() => setAuthMode("login")}
          onRegister={() => setAuthMode("register")}
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() => setAuthMode("register")}
      />
    );
  }

  /* =======================================================
     AVAILABLE YEARS
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
    years.add(today.getFullYear() - 1);
    years.add(today.getFullYear() + 1);

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

  const income = useMemo(() => {
    return selectedTransactions
      .filter((t) => t.type === "income")
      .reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
  }, [selectedTransactions]);

  const expenses = useMemo(() => {
    return selectedTransactions
      .filter((t) => t.type === "expense")
      .reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );
  }, [selectedTransactions]);

  const balance = income - expenses;

  const budgetPercentage =
    budget > 0
      ? Math.min(
          (expenses / budget) * 100,
          100
        )
      : 0;

  /* =======================================================
     FILTERED TRANSACTIONS
  ======================================================= */

  const filteredTransactions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return [...selectedTransactions]
      .filter((transaction) => {
        if (!query) return true;

        return `${transaction.title} ${transaction.category} ${transaction.type}`
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(
            `${b.date}T00:00:00`
          ) -
          new Date(
            `${a.date}T00:00:00`
          )
      );
  }, [
    selectedTransactions,
    search,
  ]);

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
          if (
            transaction.type === "expense"
          ) {
            expense += Number(
              transaction.amount
            );
          } else {
            incomeAmount += Number(
              transaction.amount
            );
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
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        map[transaction.category] =
          (map[transaction.category] || 0) +
          Number(transaction.amount);
      });

    return Object.entries(map).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [selectedTransactions]);

  /* =======================================================
     TREND DATA
  ======================================================= */

  const trendData = useMemo(() => {
    const sorted = [
      ...selectedTransactions,
    ].sort(
      (a, b) =>
        new Date(
          `${a.date}T00:00:00`
        ) -
        new Date(
          `${b.date}T00:00:00`
        )
    );

    let runningTotal = 0;

    return sorted.map((transaction) => {
      if (
        transaction.type === "expense"
      ) {
        runningTotal += Number(
          transaction.amount
        );
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
     YEARLY ANALYSIS
  ======================================================= */

  const yearlyAnalysis = useMemo(() => {
    const yearlyTransactions =
      transactions.filter((transaction) => {
        const date = new Date(
          `${transaction.date}T00:00:00`
        );

        return (
          date.getFullYear() === selectedYear
        );
      });

    let yearlyIncome = 0;
    let yearlyExpenses = 0;

    yearlyTransactions.forEach(
      (transaction) => {
        if (
          transaction.type === "income"
        ) {
          yearlyIncome += Number(
            transaction.amount
          );
        } else {
          yearlyExpenses += Number(
            transaction.amount
          );
        }
      }
    );

    const monthlyExpenses = months.map(
      (month, index) => {
        const value =
          yearlyTransactions
            .filter((transaction) => {
              const date = new Date(
                `${transaction.date}T00:00:00`
              );

              return (
                date.getMonth() === index &&
                transaction.type ===
                  "expense"
              );
            })
            .reduce(
              (sum, transaction) =>
                sum +
                Number(transaction.amount),
              0
            );

        return {
          month,
          shortMonth:
            month.substring(0, 3),
          value,
        };
      }
    );

    const highestMonth =
      monthlyExpenses.reduce(
        (highest, current) =>
          current.value > highest.value
            ? current
            : highest,
        {
          month: "None",
          value: 0,
        }
      );

    const monthsWithData =
      monthlyExpenses.filter(
        (item) => item.value > 0
      );

    const lowestMonth =
      monthsWithData.length > 0
        ? monthsWithData.reduce(
            (lowest, current) =>
              current.value <
              lowest.value
                ? current
                : lowest
          )
        : {
            month: "None",
            value: 0,
          };

    const categoryMap = {};

    yearlyTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        categoryMap[
          transaction.category
        ] =
          (categoryMap[
            transaction.category
          ] || 0) +
          Number(transaction.amount);
      });

    const highestCategory =
      Object.entries(
        categoryMap
      ).reduce(
        (highest, [category, value]) =>
          value > highest.value
            ? {
                category,
                value,
              }
            : highest,
        {
          category: "None",
          value: 0,
        }
      );

    return {
      yearlyIncome,
      yearlyExpenses,
      yearlySavings:
        yearlyIncome - yearlyExpenses,
      monthlyExpenses,
      highestMonth,
      lowestMonth,
      highestCategory,
    };
  }, [transactions, selectedYear]);

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
      date: today
        .toISOString()
        .split("T")[0],
    });

    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);

    setForm({
      title: transaction.title,
      amount: transaction.amount,
      category:
        transaction.type === "income"
          ? "Income"
          : transaction.category,
      type: transaction.type,
      date: transaction.date,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  /* =======================================================
     FORM
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleTypeChange = (event) => {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      type: value,
      category:
        value === "income"
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

    if (
      !title ||
      !amount ||
      amount <= 0 ||
      !form.date
    ) {
      playSound("error");

      window.alert(
        "Please enter valid transaction details."
      );

      return;
    }

    if (editingTransaction) {
      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id ===
          editingTransaction.id
            ? {
                ...transaction,
                title,
                amount,
                category:
                  form.type === "income"
                    ? "Income"
                    : form.category,
                type: form.type,
                date: form.date,
              }
            : transaction
        )
      );

      playSound("success");
      closeModal();

      return;
    }

    const newTransaction = {
      id: Date.now(),
      title,
      amount,
      category:
        form.type === "income"
          ? "Income"
          : form.category,
      type: form.type,
      date: form.date,
    };

    const newExpenseTotal =
      expenses +
      (form.type === "expense"
        ? amount
        : 0);

    setTransactions((previous) => [
      newTransaction,
      ...previous,
    ]);

    playSound("success");
    closeModal();

    if (
      form.type === "expense" &&
      newExpenseTotal > budget
    ) {
      setTimeout(() => {
        playSound("error");

        window.alert(
          `Budget exceeded!\n\nYour spending has crossed the ${formatCurrency(
            budget
          )} budget.`
        );
      }, 200);
    }
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
        (transaction) =>
          transaction.id !== id
      )
    );

    playSound("success");
  };

  /* =======================================================
     PERIOD SELECTOR
  ======================================================= */

  const PeriodSelector = ({
    title = "Analysis Period",
  }) => (
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
            <option
              value={year}
              key={year}
            >
              {year}
            </option>
          ))}
        </select>

        <select
          value={
            analysisMode === "yearly"
              ? "yearly"
              : selectedMonth
          }
          onChange={(event) => {
            if (
              event.target.value ===
              "yearly"
            ) {
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
              value={index}
              key={month}
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
     STAT CARD
  ======================================================= */

  const StatCard = ({
    title,
    value,
    subtitle,
    type = "default",
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
        {icon || <Icons.Wallet />}
      </div>
    </div>
  );

  /* =======================================================
     TRANSACTION LIST
  ======================================================= */

  const TransactionList = ({ limit }) => {
    const list = limit
      ? filteredTransactions.slice(
          0,
          limit
        )
      : filteredTransactions;

    if (list.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">
            <Icons.Wallet />
          </div>

          <strong>
            No transactions found
          </strong>

          <span>
            Add a transaction to start
            tracking your money.
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

                  {formatDate(
                    transaction.date
                  )}
                </small>
              </div>
            </div>

            <div
              className={`transaction-amount ${transaction.type}`}
            >
              {transaction.type === "income"
                ? "+"
                : "-"}
              {formatCurrency(
                transaction.amount
              )}
            </div>

            <div className="transaction-actions">
              <button
                onClick={() =>
                  openEditModal(
                    transaction
                  )
                }
                title="Edit transaction"
              >
                <Icons.Edit />
              </button>

              <button
                className="delete-action"
                onClick={() =>
                  deleteTransaction(
                    transaction.id
                  )
                }
                title="Delete transaction"
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
     PAGE HEADER
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
        title={`Good day, ${currentUser.name.split(" ")[0]} 👋`}
        description="Track your money and understand your spending."
        action={
          <button
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
          subtitle={
            analysisMode === "yearly"
              ? `${selectedYear} balance`
              : "Income minus expenses"
          }
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

              <h3>
                {analysisMode === "yearly"
                  ? `${selectedYear} Monthly Spending`
                  : "Monthly Spending"}
              </h3>

              <p>
                Income compared with
                expenses
              </p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={monthlyData}
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
                  tickFormatter={(value) =>
                    `₹${value / 1000}k`
                  }
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
              {Math.round(
                budgetPercentage
              )}
              % used
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
                      Number(
                        event.target.value
                      )
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

            <h3>
              Recent Transactions
            </h3>

            <p>
              Latest activity for{" "}
              {analysisMode === "yearly"
                ? selectedYear
                : `${months[selectedMonth]} ${selectedYear}`}
            </p>
          </div>

          <button
            className="text-button"
            onClick={() =>
              setActivePage(
                "transactions"
              )
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
     TRANSACTIONS
  ======================================================= */

  const TransactionsPage = () => (
    <>
      <PageHeader
        eyebrow="MONEY ACTIVITY"
        title="Transactions"
        description="Manage all your income and expenses."
        action={
          <button
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
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search transactions..."
            />
          </div>

          <div className="transaction-count">
            {filteredTransactions.length}{" "}
            {filteredTransactions.length ===
            1
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

  const AnalyticsPage = () => {
    const savingsRate =
      yearlyAnalysis.yearlyIncome > 0
        ? Math.round(
            (yearlyAnalysis.yearlySavings /
              yearlyAnalysis.yearlyIncome) *
              100
          )
        : 0;

    return (
      <>
        <PageHeader
          eyebrow="INSIGHTS"
          title="Analytics"
          description="Visualize your financial habits and spending patterns."
        />

        <PeriodSelector title="Analytics Period" />

        {analysisMode === "yearly" ? (
          <>
            <div className="analytics-stats">
              <div className="analytics-mini-card">
                <span>
                  Yearly Income
                </span>

                <strong>
                  {formatCurrency(
                    yearlyAnalysis.yearlyIncome
                  )}
                </strong>
              </div>

              <div className="analytics-mini-card">
                <span>
                  Yearly Expenses
                </span>

                <strong>
                  {formatCurrency(
                    yearlyAnalysis.yearlyExpenses
                  )}
                </strong>
              </div>

              <div className="analytics-mini-card">
                <span>
                  Yearly Savings
                </span>

                <strong>
                  {formatCurrency(
                    yearlyAnalysis.yearlySavings
                  )}
                </strong>
              </div>

              <div className="analytics-mini-card">
                <span>
                  Savings Rate
                </span>

                <strong>
                  {savingsRate}%
                </strong>
              </div>
            </div>

            <div className="yearly-summary">
              <div className="yearly-summary-card">
                <span>
                  Highest Spending Month
                </span>

                <strong>
                  {
                    yearlyAnalysis
                      .highestMonth
                      .month
                  }
                </strong>

                <small>
                  {formatCurrency(
                    yearlyAnalysis
                      .highestMonth
                      .value
                  )}
                </small>
              </div>

              <div className="yearly-summary-card">
                <span>
                  Lowest Spending Month
                </span>

                <strong>
                  {
                    yearlyAnalysis
                      .lowestMonth
                      .month
                  }
                </strong>

                <small>
                  {formatCurrency(
                    yearlyAnalysis
                      .lowestMonth
                      .value
                  )}
                </small>
              </div>

              <div className="yearly-summary-card">
                <span>
                  Top Spending Category
                </span>

                <strong>
                  {
                    yearlyAnalysis
                      .highestCategory
                      .category
                  }
                </strong>

                <small>
                  {formatCurrency(
                    yearlyAnalysis
                      .highestCategory
                      .value
                  )}
                </small>
              </div>

              <div className="yearly-summary-card">
                <span>
                  Savings Rate
                </span>

                <strong>
                  {savingsRate}%
                </strong>

                <small>
                  of income saved
                </small>
              </div>
            </div>
          </>
        ) : (
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
                {Math.round(
                  budgetPercentage
                )}
                %
              </strong>
            </div>
          </div>
        )}

        <div className="analytics-grid">
          <div className="panel chart-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">
                  COMPARISON
                </span>

                <h3>
                  {analysisMode ===
                  "yearly"
                    ? `${selectedYear} Income vs Expenses`
                    : `${months[selectedMonth]} ${selectedYear}`}
                </h3>

                <p>
                  Compare your financial
                  activity
                </p>
              </div>
            </div>

            <div className="large-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    analysisMode ===
                    "yearly"
                      ? monthlyData
                      : [
                          {
                            month:
                              months[
                                selectedMonth
                              ].substring(
                                0,
                                3
                              ),
                            income,
                            expense:
                              expenses,
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
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#ef4444"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
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

                <p>
                  Where your money is
                  going
                </p>
              </div>
            </div>

            <div className="pie-chart-container">
              {categoryData.length ===
              0 ? (
                <div className="empty-state">
                  <strong>
                    No expense data
                  </strong>

                  <span>
                    Add an expense to see
                    the breakdown.
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
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`${entry.name}-${index}`}
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
                  {analysisMode ===
                  "yearly"
                    ? `${selectedYear} Spending Trend`
                    : `${months[selectedMonth]} Spending Trend`}
                </h3>

                <p>
                  Cumulative expense growth
                </p>
              </div>
            </div>

            <div className="large-chart">
              {trendData.length ===
              0 ? (
                <div className="empty-state">
                  <strong>
                    No spending data
                  </strong>

                  <span>
                    Add expenses to see
                    your trend.
                  </span>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={trendData}
                  >
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

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="spending"
                      name="Cumulative Spending"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {analysisMode === "yearly" && (
            <div className="panel chart-panel full-width">
              <div className="panel-header">
                <div>
                  <span className="panel-label">
                    YEARLY BREAKDOWN
                  </span>

                  <h3>
                    Monthly Expense
                    Breakdown
                  </h3>

                  <p>
                    Your spending across{" "}
                    {selectedYear}
                  </p>
                </div>
              </div>

              <div className="large-chart">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      yearlyAnalysis.monthlyExpenses
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="shortMonth"
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

                    <Bar
                      dataKey="value"
                      name="Expenses"
                      fill="#6366f1"
                      radius={[
                        8,
                        8,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

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
                Enter your transaction
                details below.
              </p>
            </div>

            <button
              className="close-button"
              onClick={closeModal}
            >
              <Icons.Close />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Transaction Name
              </label>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Grocery shopping"
                autoComplete="off"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Amount</label>

                <div className="currency-input">
                  <span>₹</span>

                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Type</label>

                <select
                  name="type"
                  value={form.type}
                  onChange={
                    handleTypeChange
                  }
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
                <label>Category</label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={
                    form.type ===
                    "income"
                  }
                >
                  {form.type ===
                    "income" && (
                    <option value="Income">
                      Income
                    </option>
                  )}

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>

                <input
                  type="date"
                  name="date"
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
     MAIN LAYOUT
  ======================================================= */

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Icons.Wallet />
          </div>

          <div className="brand-text">
            <strong>
              SpendWise
            </strong>

            <span>
              Expense Manager
            </span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(
                "dashboard"
              )
            }
          >
            <Icons.Dashboard />
            <span>Dashboard</span>
          </button>

          <button
            className={
              activePage ===
              "transactions"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(
                "transactions"
              )
            }
          >
            <Icons.Transactions />
            <span>Transactions</span>
          </button>

          <button
            className={
              activePage ===
              "analytics"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(
                "analytics"
              )
            }
          >
            <Icons.Analytics />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-budget">
          <div className="sidebar-budget-top">
            <span>
              Monthly Budget
            </span>

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
            {formatCurrency(expenses)}{" "}
            spent
          </small>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {currentUser.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>
              {currentUser.name}
            </strong>

            <span>
              {currentUser.email}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            <Icons.Logout />
          </button>
        </div>

        <div className="sidebar-footer">
          <span>SpendWise</span>
          <span>
            Personal Finance
          </span>
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
      </main>

      <TransactionModal />
    </div>
  );
}

export default App;