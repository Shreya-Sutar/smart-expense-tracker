import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

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

/* =========================================================
   ICONS
========================================================= */

const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),

  Transactions: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  ),

  Analytics: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 16v-5" />
      <path d="M12 16V7" />
      <path d="M17 16V9" />
    </svg>
  ),

  Wallet: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M3 7h18v12H3z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h14" />
      <path d="M16 13h5" />
    </svg>
  ),

  Plus: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),

  Edit: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  ),

  Trash: () => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 15H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),

  Search: () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none"
      stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  ),

  Close: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),

  TrendingUp: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="m3 17 6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  ),

  TrendingDown: () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
      stroke="currentColor" strokeWidth="2">
      <path d="m3 7 6 6 4-4 8 8" />
      <path d="M15 17h6v-6" />
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
    category: "Salary",
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

const expenseCategories = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other Income",
];

const categoryColors = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#10b981",
];

/* =========================================================
   SOUND
========================================================= */

function playSound(type = "success") {
  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContext) return;

    const context = new AudioContext();

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    if (type === "success") {
      oscillator.frequency.setValueAtTime(650, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        900,
        context.currentTime + 0.12
      );
    } else {
      oscillator.frequency.setValueAtTime(260, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        140,
        context.currentTime + 0.15
      );
    }

    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.2
    );

    oscillator.start();

    oscillator.stop(context.currentTime + 0.2);
  } catch {
    // Audio is optional.
  }
}

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (date) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* =========================================================
   TRANSACTION MODAL
   IMPORTANT:
   Form state is kept HERE, not in App.
   This makes typing smooth.
========================================================= */

const TransactionModal = memo(function TransactionModal({
  show,
  editingTransaction,
  onClose,
  onSave,
}) {
  const getInitialForm = useCallback(() => {
    if (editingTransaction) {
      return {
        title: editingTransaction.title,
        amount: String(editingTransaction.amount),
        category: editingTransaction.category,
        type: editingTransaction.type,
        date: editingTransaction.date,
      };
    }

    return {
      title: "",
      amount: "",
      category: "Food",
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    };
  }, [editingTransaction]);

  const [form, setForm] = useState(getInitialForm);

  React.useEffect(() => {
    if (show) {
      setForm(getInitialForm());
    }
  }, [show, getInitialForm]);

  if (!show) return null;

  const categories =
    form.type === "income"
      ? incomeCategories
      : expenseCategories;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: value,
      };

      if (name === "type") {
        updated.category =
          value === "income" ? "Salary" : "Food";
      }

      return updated;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const amount = Number(form.amount);

    if (
      !title ||
      !form.amount ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !form.date
    ) {
      playSound("error");

      window.alert(
        "⚠️ Invalid fields\n\nPlease enter a valid name, amount and date."
      );

      return;
    }

    onSave({
      ...form,
      title,
      amount,
    });
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>
              {editingTransaction
                ? "Edit Transaction"
                : "Add Transaction"}
            </h2>

            <p>
              {editingTransaction
                ? "Update your transaction details."
                : "Enter your transaction details below."}
            </p>
          </div>

          <button
            className="close-button"
            type="button"
            onClick={onClose}
          >
            <Icons.Close />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Transaction Name</label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping"
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Type</label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
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
              >
                {categories.map((category) => (
                  <option
                    value={category}
                    key={category}
                  >
                    {category}
                  </option>
                ))}
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
              onClick={onClose}
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
});

/* =========================================================
   TRANSACTION LIST
========================================================= */

const TransactionList = memo(function TransactionList({
  transactions,
  onEdit,
  onDelete,
  limit,
}) {
  const list = limit
    ? transactions.slice(0, limit)
    : transactions;

  if (list.length === 0) {
    return (
      <div className="empty-state">
        <strong>No transactions found</strong>
        <span>
          Add a transaction to start tracking your money.
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
              className={`transaction-avatar ${
                transaction.type === "income"
                  ? "income-avatar"
                  : ""
              }`}
            >
              {transaction.title
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>{transaction.title}</strong>

              <small>
                {transaction.category} •{" "}
                {formatDate(transaction.date)}
              </small>
            </div>
          </div>

          <div
            className={`transaction-amount ${transaction.type}`}
          >
            {transaction.type === "income" ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </div>

          <div className="transaction-actions">
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              title="Edit transaction"
            >
              <Icons.Edit />
            </button>

            <button
              type="button"
              onClick={() => onDelete(transaction.id)}
              title="Delete transaction"
            >
              <Icons.Trash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
});

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  className = "",
  icon,
}) {
  return (
    <div className={`stat-card ${className}`}>
      <div>
        <p className="stat-title">{title}</p>

        <h2>{formatCurrency(value)}</h2>

        <span>{subtitle}</span>
      </div>

      <div className="stat-icon">
        {icon || <Icons.Wallet />}
      </div>
    </div>
  );
});

/* =========================================================
   APP
========================================================= */

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [transactions, setTransactions] =
    useState(initialTransactions);

  const [budget, setBudget] = useState(10000);

  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth());

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  /* =====================================================
     CURRENT MONTH
  ===================================================== */

  const monthTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(
        `${transaction.date}T00:00:00`
      );

      return date.getMonth() === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  /* =====================================================
     TOTALS
  ===================================================== */

  const expenses = useMemo(() => {
    return monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );
  }, [monthTransactions]);

  const income = useMemo(() => {
    return monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );
  }, [monthTransactions]);

  const balance = income - expenses;

  const remainingBudget = budget - expenses;

  const budgetPercentage =
    budget > 0
      ? Math.min((expenses / budget) * 100, 100)
      : 0;

  /* =====================================================
     SEARCH
  ===================================================== */

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...monthTransactions]
      .filter((transaction) => {
        if (!query) return true;

        return `${transaction.title} ${transaction.category} ${transaction.type}`
          .toLowerCase()
          .includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      );
  }, [monthTransactions, search]);

  /* =====================================================
     CATEGORY CHART
  ===================================================== */

  const categoryData = useMemo(() => {
    const map = {};

    monthTransactions
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
  }, [monthTransactions]);

  /* =====================================================
     YEARLY CHART
  ===================================================== */

  const monthlyData = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map((month, index) => {
      let expense = 0;
      let incomeAmount = 0;

      transactions.forEach((transaction) => {
        const date = new Date(
          `${transaction.date}T00:00:00`
        );

        if (date.getMonth() === index) {
          if (transaction.type === "expense") {
            expense += Number(transaction.amount);
          } else {
            incomeAmount += Number(
              transaction.amount
            );
          }
        }
      });

      return {
        month,
        expense,
        income: incomeAmount,
      };
    });
  }, [transactions]);

  /* =====================================================
     DAILY TREND
  ===================================================== */

  const trendData = useMemo(() => {
    const monthExpenses = monthTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      );

    let runningTotal = 0;

    return monthExpenses.map((transaction) => {
      runningTotal += Number(transaction.amount);

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
  }, [monthTransactions]);

  /* =====================================================
     MODAL
  ===================================================== */

  const openAddModal = useCallback(() => {
    setEditingTransaction(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback(
    (transaction) => {
      setEditingTransaction(transaction);
      setShowModal(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingTransaction(null);
  }, []);

  /* =====================================================
     SAVE TRANSACTION
  ===================================================== */

  const saveTransaction = useCallback(
    (transactionData) => {
      if (editingTransaction) {
        setTransactions((previous) =>
          previous.map((transaction) =>
            transaction.id ===
            editingTransaction.id
              ? {
                  ...transaction,
                  ...transactionData,
                  amount: Number(
                    transactionData.amount
                  ),
                }
              : transaction
          )
        );

        playSound("success");

        closeModal();

        return;
      }

      const amount = Number(
        transactionData.amount
      );

      const newTransaction = {
        id:
          Date.now() +
          Math.floor(Math.random() * 1000),

        title: transactionData.title,

        amount,

        category: transactionData.category,

        type: transactionData.type,

        date: transactionData.date,
      };

      setTransactions((previous) => [
        newTransaction,
        ...previous,
      ]);

      playSound("success");

      if (
        transactionData.type === "expense" &&
        expenses + amount > budget
      ) {
        setTimeout(() => {
          playSound("error");

          window.alert(
            `⚠️ Budget Exceeded!\n\nYou have spent ${formatCurrency(
              expenses + amount
            )} against your monthly budget of ${formatCurrency(
              budget
            )}.`
          );
        }, 250);
      }

      closeModal();
    },
    [
      editingTransaction,
      expenses,
      budget,
      closeModal,
    ]
  );

  /* =====================================================
     DELETE
  ===================================================== */

  const deleteTransaction = useCallback(
    (id) => {
      const shouldDelete = window.confirm(
        "Are you sure you want to delete this transaction?"
      );

      if (!shouldDelete) return;

      setTransactions((previous) =>
        previous.filter(
          (transaction) =>
            transaction.id !== id
        )
      );

      playSound("success");
    },
    []
  );

  /* =====================================================
     DASHBOARD
  ===================================================== */

  const Dashboard = () => (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">OVERVIEW</p>

          <h1>Dashboard</h1>

          <p>
            Track your money and understand your
            spending.
          </p>
        </div>

        <div className="header-actions">
          <MonthSelector
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            <Icons.Plus />
            Add Transaction
          </button>
        </div>
      </div>

      {expenses > budget && (
        <div className="budget-alert">
          <div className="budget-alert-icon">
            ⚠️
          </div>

          <div>
            <strong>Budget exceeded</strong>

            <p>
              You have spent{" "}
              {formatCurrency(expenses)} over your
              monthly budget of{" "}
              {formatCurrency(budget)}.
            </p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total Balance"
          value={balance}
          subtitle="Income minus expenses"
          icon={<Icons.Wallet />}
        />

        <StatCard
          title="Total Income"
          value={income}
          subtitle="Money received"
          className="income-card"
          icon={<Icons.TrendingUp />}
        />

        <StatCard
          title="Total Expenses"
          value={expenses}
          subtitle="Money spent"
          className="expense-card"
          icon={<Icons.TrendingDown />}
        />

        <StatCard
          title="Remaining"
          value={remainingBudget}
          subtitle={
            remainingBudget < 0
              ? "Over budget"
              : "Available budget"
          }
          className={
            remainingBudget < 0
              ? "danger-card"
              : ""
          }
          icon={<Icons.Wallet />}
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Monthly Spending</h3>

              <p>
                Income vs expenses throughout the
                year
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

                <XAxis dataKey="month" />

                <YAxis />

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
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#6366f1"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <BudgetPanel
          budget={budget}
          expenses={expenses}
          budgetPercentage={budgetPercentage}
          setBudget={setBudget}
        />
      </div>

      <div className="panel recent-panel">
        <div className="panel-header">
          <div>
            <h3>Recent Transactions</h3>

            <p>
              Latest activity for{" "}
              {getMonthName(selectedMonth)}
            </p>
          </div>

          <button
            className="text-button"
            onClick={() =>
              setActivePage("transactions")
            }
          >
            View All
          </button>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          onEdit={openEditModal}
          onDelete={deleteTransaction}
          limit={5}
        />
      </div>
    </>
  );

  /* =====================================================
     TRANSACTIONS PAGE
  ===================================================== */

  const TransactionsPage = () => (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">
            MONEY ACTIVITY
          </p>

          <h1>Transactions</h1>

          <p>
            Manage your income and expenses.
          </p>
        </div>

        <div className="header-actions">
          <MonthSelector
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
          />

          <button
            className="primary-button"
            onClick={openAddModal}
          >
            <Icons.Plus />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="transaction-toolbar">
          <div className="search-box">
            <Icons.Search />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transactions..."
            />
          </div>

          <div className="transaction-count">
            {filteredTransactions.length}{" "}
            transactions
          </div>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          onEdit={openEditModal}
          onDelete={deleteTransaction}
        />
      </div>
    </>
  );

  /* =====================================================
     ANALYTICS PAGE
  ===================================================== */

  const AnalyticsPage = () => (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">INSIGHTS</p>

          <h1>Analytics</h1>

          <p>
            Understand your spending patterns.
          </p>
        </div>

        <MonthSelector
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
        />
      </div>

      <div className="analytics-stats">
        <div className="analytics-mini-card">
          <span>Income</span>

          <strong className="income-text">
            {formatCurrency(income)}
          </strong>
        </div>

        <div className="analytics-mini-card">
          <span>Expenses</span>

          <strong className="expense-text">
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
              <h3>
                Income vs Expenses
              </h3>

              <p>
                Monthly comparison
              </p>
            </div>
          </div>

          <div className="large-chart">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="month" />

                <YAxis />

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
                    7,
                    7,
                    0,
                    0,
                  ]}
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[
                    7,
                    7,
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
              <h3>
                Expenses by Category
              </h3>

              <p>
                {getMonthName(
                  selectedMonth
                )} spending
              </p>
            </div>
          </div>

          <div className="pie-chart-container">
            {categoryData.length === 0 ? (
              <div className="empty-state">
                No expense data for this month.
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
                    cy="45%"
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
              <h3>Spending Trend</h3>

              <p>
                Cumulative spending for{" "}
                {getMonthName(
                  selectedMonth
                )}
              </p>
            </div>
          </div>

          <div className="large-chart">
            {trendData.length === 0 ? (
              <div className="empty-state">
                No expense data available.
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

                  <XAxis dataKey="date" />

                  <YAxis />

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
                    dot={{
                      r: 4,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Icons.Wallet />
          </div>

          <div>
            <strong>SpendWise</strong>
            <span>Expense Manager</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${
              activePage === "dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <Icons.Dashboard />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "transactions"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("transactions")
            }
          >
            <Icons.Transactions />
            <span>Transactions</span>
          </button>

          <button
            className={`nav-item ${
              activePage === "analytics"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActivePage("analytics")
            }
          >
            <Icons.Analytics />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="sidebar-budget">
          <span>Monthly Budget</span>

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

      <TransactionModal
        show={showModal}
        editingTransaction={
          editingTransaction
        }
        onClose={closeModal}
        onSave={saveTransaction}
      />
    </div>
  );
}

/* =========================================================
   BUDGET PANEL
========================================================= */

function BudgetPanel({
  budget,
  expenses,
  budgetPercentage,
  setBudget,
}) {
  return (
    <div className="panel budget-panel">
      <div className="panel-header">
        <div>
          <h3>Budget</h3>
          <p>Monthly spending limit</p>
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

      <p className="budget-text">
        {budgetPercentage >= 100
          ? "⚠️ You have exceeded your budget."
          : `${Math.round(
              budgetPercentage
            )}% of your budget used.`}
      </p>

      <div className="budget-edit">
        <label>Set Monthly Budget</label>

        <input
          type="number"
          min="0"
          value={budget}
          onChange={(event) => {
            const value = Number(
              event.target.value
            );

            setBudget(
              Number.isFinite(value)
                ? value
                : 0
            );
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MONTH SELECTOR
========================================================= */

function MonthSelector({
  selectedMonth,
  setSelectedMonth,
}) {
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

  return (
    <select
      className="month-selector"
      value={selectedMonth}
      onChange={(event) =>
        setSelectedMonth(
          Number(event.target.value)
        )
      }
    >
      {months.map((month, index) => (
        <option
          value={index}
          key={month}
        >
          {month} 2026
        </option>
      ))}
    </select>
  );
}

/* =========================================================
   MONTH NAME
========================================================= */

function getMonthName(index) {
  return [
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
  ][index];
}

export default App;