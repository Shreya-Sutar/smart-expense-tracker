import { useCallback, useEffect, useMemo, useState } from "react";

import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  WalletCards,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
  Save,
  Menu,
  IndianRupee,
  Sparkles,
  Brain,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Login from "./Login";
import Register from "./Register";
import AllInsights from "./AllInsights";

import "./App.css";

// =========================================================
// API URLS
// =========================================================

const API_URL = "http://localhost:5000/api";
const AI_API_URL = "http://localhost:8000";

// =========================================================
// MONTHS
// =========================================================

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

// =========================================================
// CATEGORIES
// =========================================================

const categories = [
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Travel",
  "Other",
];

// =========================================================
// HELPERS
// =========================================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTransactionId = (transaction) => {
  return String(transaction?._id || transaction?.id || "");
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

// =========================================================
// APP
// =========================================================

function App() {
  // =======================================================
  // AUTH
  // =======================================================

  const [token, setToken] = useState(() =>
    localStorage.getItem("expense_token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("expense_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const [authPage, setAuthPage] = useState("login");

  // =======================================================
  // NAVIGATION
  // =======================================================

  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  // =======================================================
  // DATE
  // =======================================================

  const currentDate = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth()
  );

  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear()
  );

  // =======================================================
  // TRANSACTIONS
  // =======================================================

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // =======================================================
  // BUDGET
  // =======================================================

  const [budget, setBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);

  // =======================================================
  // AI SPENDING INSIGHTS
  // =======================================================

  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // =======================================================
  // MODALS
  // =======================================================

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [showBudgetModal, setShowBudgetModal] =
    useState(false);

  // =======================================================
  // TRANSACTION FORM
  // =======================================================

  const [transactionForm, setTransactionForm] = useState({
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: getToday(),
    note: "",
  });

  const [savingTransaction, setSavingTransaction] =
    useState(false);

  // =======================================================
  // LOGOUT
  // =======================================================

  const logout = useCallback(() => {
    localStorage.removeItem("expense_token");
    localStorage.removeItem("expense_user");

    setToken(null);
    setUser(null);

    setTransactions([]);
    setAiData(null);
    setAiError("");

    setActivePage("dashboard");
  }, []);

  // =======================================================
  // LOGIN
  // =======================================================

  const handleLogin = (data) => {
    if (!data?.token || !data?.user) {
      alert("Invalid login response from server.");
      return;
    }

    localStorage.setItem("expense_token", data.token);

    localStorage.setItem(
      "expense_user",
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);
  };

  // =======================================================
  // REGISTER
  // =======================================================

  const handleRegister = (data) => {
    if (!data?.token || !data?.user) {
      alert("Invalid registration response from server.");
      return;
    }

    localStorage.setItem("expense_token", data.token);

    localStorage.setItem(
      "expense_user",
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);
  };

  // =======================================================
  // API FETCH
  // =======================================================

  const apiFetch = useCallback(
    async (endpoint, options = {}) => {
      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,

        headers: {
          ...(options.body
            ? {
                "Content-Type": "application/json",
              }
            : {}),

          Authorization: `Bearer ${token}`,

          ...(options.headers || {}),
        },
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.error ||
          data?.detail ||
          "Something went wrong.";

        throw new Error(errorMessage);
      }

      return data;
    },
    [token]
  );

  // =======================================================
  // FETCH TRANSACTIONS
  // =======================================================

  const fetchTransactions = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const data = await apiFetch("/transactions");

      let transactionList = [];

      if (Array.isArray(data)) {
        transactionList = data;
      } else if (Array.isArray(data?.transactions)) {
        transactionList = data.transactions;
      } else if (Array.isArray(data?.data)) {
        transactionList = data.data;
      }

      setTransactions(transactionList);
    } catch (error) {
      console.error(
        "Transaction fetch error:",
        error
      );

      const message =
        error?.message?.toLowerCase() || "";

      if (
        message.includes("token") ||
        message.includes("authentication") ||
        message.includes("unauthorized") ||
        message.includes("jwt") ||
        message.includes("expired")
      ) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [apiFetch, logout, token]);

  // =======================================================
  // FETCH BUDGET
  // =======================================================

  const fetchBudget = useCallback(async () => {
    if (!token) return;

    try {
      const data = await apiFetch(
        `/budget?month=${selectedMonth + 1}&year=${selectedYear}`
      );

      const amount = Number(data?.amount || 0);

      setBudget(amount);

      setBudgetInput(
        amount > 0 ? String(amount) : ""
      );
    } catch (error) {
      console.error(
        "Budget fetch error:",
        error
      );

      setBudget(0);
      setBudgetInput("");
    }
  }, [
    apiFetch,
    selectedMonth,
    selectedYear,
    token,
  ]);

  // =======================================================
  // INITIAL TRANSACTION FETCH
  // =======================================================

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token, fetchTransactions]);

  // =======================================================
  // BUDGET FETCH
  // =======================================================

  useEffect(() => {
    if (token) {
      fetchBudget();
    }
  }, [
    token,
    selectedMonth,
    selectedYear,
    fetchBudget,
  ]);

  // =======================================================
  // AI SPENDING INSIGHTS
  // =======================================================

  const connectTransactionsToAI = useCallback(
    async () => {
      if (!token) {
        setAiData(null);
        setAiError("");
        return;
      }

      try {
        setAiLoading(true);
        setAiError("");

        // -------------------------------------------------
        // Send ALL transactions to AI service.
        // The AI service can analyze:
        // - spending patterns
        // - categories
        // - average expenses
        // - high spending areas
        // - financial trends
        // -------------------------------------------------

        const formattedTransactions =
          transactions.map((transaction) => ({
            id: getTransactionId(transaction),

            title: String(
              transaction?.title || ""
            ),

            amount: Number(
              transaction?.amount || 0
            ),

            type: String(
              transaction?.type || "expense"
            ),

            category: String(
              transaction?.category || "Other"
            ),

            date: transaction?.date
              ? new Date(transaction.date)
                  .toISOString()
                  .split("T")[0]
              : getToday(),

            note: String(
              transaction?.note || ""
            ),
          }));

        const response = await fetch(
          `${AI_API_URL}/process-transactions`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              transactions:
                formattedTransactions,

              analysisPeriod: {
                month:
                  selectedMonth + 1,

                year:
                  selectedYear,
              },
            }),
          }
        );

        const data = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              "AI service request failed."
          );
        }

        setAiData(data);

        console.log(
          "AI Spending Insights:",
          data
        );
      } catch (error) {
        console.error(
          "AI connection error:",
          error
        );

        setAiError(
          error?.message ||
            "Unable to connect to AI service."
        );
      } finally {
        setAiLoading(false);
      }
    },
    [
      token,
      transactions,
      selectedMonth,
      selectedYear,
    ]
  );

  // =======================================================
  // RUN AI WHEN TRANSACTIONS CHANGE
  // =======================================================

  useEffect(() => {
    if (token) {
      connectTransactionsToAI();
    } else {
      setAiData(null);
      setAiError("");
    }
  }, [
    token,
    transactions,
    selectedMonth,
    selectedYear,
    connectTransactionsToAI,
  ]);

  // =======================================================
  // SELECTED MONTH TRANSACTIONS
  // =======================================================

  const selectedTransactions = useMemo(() => {
    return transactions.filter(
      (transaction) => {
        if (!transaction?.date) {
          return false;
        }

        const date = new Date(
          transaction.date
        );

        if (Number.isNaN(date.getTime())) {
          return false;
        }

        return (
          date.getMonth() === selectedMonth &&
          date.getFullYear() === selectedYear
        );
      }
    );
  }, [
    transactions,
    selectedMonth,
    selectedYear,
  ]);

  // =======================================================
  // TOTALS
  // =======================================================

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    selectedTransactions.forEach(
      (transaction) => {
        const amount = Number(
          transaction?.amount || 0
        );

        if (
          transaction?.type === "income"
        ) {
          income += amount;
        } else {
          expense += amount;
        }
      }
    );

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [selectedTransactions]);

  // =======================================================
  // BUDGET CALCULATIONS
  // =======================================================

  const remainingBudget =
    budget - totals.expense;

  const budgetPercentage =
    budget > 0
      ? Math.min(
          (totals.expense / budget) * 100,
          100
        )
      : 0;

  // =======================================================
  // OPEN ADD TRANSACTION
  // =======================================================

  const openAddTransaction = () => {
    setEditingTransaction(null);

    setTransactionForm({
      title: "",
      amount: "",
      type: "expense",
      category: "Food",
      date: getToday(),
      note: "",
    });

    setShowTransactionModal(true);
  };

  // =======================================================
  // OPEN EDIT TRANSACTION
  // =======================================================

  const openEditTransaction = (
    transaction
  ) => {
    setEditingTransaction(transaction);

    setTransactionForm({
      title: String(
        transaction?.title || ""
      ),

      amount:
        transaction?.amount !== undefined &&
        transaction?.amount !== null
          ? String(transaction.amount)
          : "",

      type:
        transaction?.type === "income"
          ? "income"
          : "expense",

      category:
        transaction?.category &&
        categories.includes(
          transaction.category
        )
          ? transaction.category
          : "Other",

      date: transaction?.date
        ? new Date(transaction.date)
            .toISOString()
            .split("T")[0]
        : getToday(),

      note: String(
        transaction?.note || ""
      ),
    });

    setShowTransactionModal(true);
  };

  // =======================================================
  // CLOSE TRANSACTION MODAL
  // =======================================================

  const closeTransactionModal = () => {
    if (savingTransaction) return;

    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  // =======================================================
  // FORM CHANGE
  // =======================================================

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setTransactionForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  // =======================================================
  // ADD / UPDATE TRANSACTION
  // =======================================================

  const handleTransactionSubmit =
    async (event) => {
      event.preventDefault();

      if (savingTransaction) {
        return;
      }

      const title =
        transactionForm.title.trim();

      const amountText =
        String(
          transactionForm.amount
        ).trim();

      const amount =
        Number(amountText);

      if (!title) {
        alert(
          "Please enter a transaction title."
        );
        return;
      }

      if (
        !amountText ||
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        alert(
          "Please enter a valid amount greater than 0."
        );
        return;
      }

      if (!transactionForm.date) {
        alert("Please select a date.");
        return;
      }

      if (
        !["income", "expense"].includes(
          transactionForm.type
        )
      ) {
        alert(
          "Please select a valid transaction type."
        );
        return;
      }

      const payload = {
        title,
        amount,
        type: transactionForm.type,

        category:
          transactionForm.category ||
          "Other",

        date: transactionForm.date,

        note:
          transactionForm.note.trim(),
      };

      try {
        setSavingTransaction(true);

        if (editingTransaction) {
          const id =
            getTransactionId(
              editingTransaction
            );

          if (!id) {
            throw new Error(
              "Transaction ID is missing."
            );
          }

          await apiFetch(
            `/transactions/${id}`,
            {
              method: "PUT",
              body: JSON.stringify(payload),
            }
          );
        } else {
          await apiFetch(
            "/transactions",
            {
              method: "POST",
              body: JSON.stringify(payload),
            }
          );
        }

        await fetchTransactions();

        setShowTransactionModal(false);
        setEditingTransaction(null);

        setTransactionForm({
          title: "",
          amount: "",
          type: "expense",
          category: "Food",
          date: getToday(),
          note: "",
        });
      } catch (error) {
        console.error(
          "Save transaction error:",
          error
        );

        alert(
          error?.message ||
            "Unable to save transaction."
        );
      } finally {
        setSavingTransaction(false);
      }
    };

  // =======================================================
  // DELETE TRANSACTION
  // =======================================================

  const handleDelete = async (id) => {
    if (!id) {
      alert(
        "Transaction ID is missing."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this transaction?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await apiFetch(
        `/transactions/${id}`,
        {
          method: "DELETE",
        }
      );

      await fetchTransactions();
    } catch (error) {
      console.error(
        "Delete transaction error:",
        error
      );

      alert(
        error?.message ||
          "Unable to delete transaction."
      );
    }
  };

  // =======================================================
  // SAVE BUDGET
  // =======================================================

  const saveBudget = async (event) => {
    event.preventDefault();

    if (budgetSaving) {
      return;
    }

    const amountText =
      String(
        budgetInput
      ).trim();

    const amount =
      Number(amountText);

    if (
      !amountText ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      alert(
        "Please enter a valid budget amount."
      );
      return;
    }

    try {
      setBudgetSaving(true);

      await apiFetch(
        "/budget",
        {
          method: "PUT",

          body: JSON.stringify({
            month:
              selectedMonth + 1,

            year:
              selectedYear,

            amount,
          }),
        }
      );

      setBudget(amount);

      setBudgetInput(
        amount > 0
          ? String(amount)
          : ""
      );

      setShowBudgetModal(false);
    } catch (error) {
      console.error(
        "Save budget error:",
        error
      );

      alert(
        error?.message ||
          "Unable to save budget."
      );
    } finally {
      setBudgetSaving(false);
    }
  };

  // =======================================================
  // YEAR OPTIONS
  // =======================================================

  const years = [];

  for (
    let year =
      currentDate.getFullYear() - 4;
    year <=
    currentDate.getFullYear() + 2;
    year++
  ) {
    years.push(year);
  }

  // =======================================================
  // AUTH SCREEN
  // =======================================================

  if (!token || !user) {
    if (authPage === "register") {
      return (
        <Register
          onRegister={handleRegister}
          onLogin={() =>
            setAuthPage("login")
          }
        />
      );
    }

    return (
      <Login
        onLogin={handleLogin}
        onRegister={() =>
          setAuthPage("register")
        }
      />
    );
  }

  // =======================================================
  // NAVIGATION
  // =======================================================

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
    },
    {
      id: "insights",
      label: "AI Insights",
      icon: BarChart3,
    },
  ];

  const pageTitle =
    activePage === "dashboard"
      ? "Dashboard"
      : activePage === "transactions"
      ? "Transactions"
      : "AI Spending Insights";

  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="app-shell">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${
          mobileMenu
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="brand">

          <div className="brand-icon">
            <WalletCards size={23} />
          </div>

          <div>
            <h1>SpendWise</h1>

            <span>
              Smart Expense Manager
            </span>
          </div>

        </div>

        <nav className="sidebar-nav">

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${
                  activePage === item.id
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenu(false);
                }}
              >

                <Icon size={19} />

                <span>
                  {item.label}
                </span>

              </button>
            );
          })}

        </nav>

        <div className="sidebar-bottom">

          <div className="user-card">

            <div className="avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </div>

            <div className="user-info">

              <strong>
                {user?.name || "User"}
              </strong>

              <span>
                {user?.email || ""}
              </span>

            </div>

          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="topbar">

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenu(
                (previous) =>
                  !previous
              )
            }
          >
            <Menu size={22} />
          </button>

          <div>

            <p className="eyebrow">
              PERSONAL FINANCE
            </p>

            <h2>
              {pageTitle}
            </h2>

          </div>

          <div className="topbar-actions">

            {(activePage ===
              "dashboard" ||
              activePage ===
                "transactions") && (

              <button
                type="button"
                className="primary-button"
                onClick={
                  openAddTransaction
                }
              >
                <Plus size={18} />
                Add Transaction
              </button>

            )}

          </div>

        </header>

        {/* =================================================
            PERIOD SELECTOR
        ================================================= */}

        {(activePage ===
          "dashboard" ||
          activePage ===
            "insights") && (

          <section className="period-toolbar">

            <div>

              <span className="toolbar-label">
                Analysis period
              </span>

              <strong>
                {months[selectedMonth]}{" "}
                {selectedYear}
              </strong>

            </div>

            <div className="period-controls">

              <div className="select-wrapper">

                <CalendarDays size={17} />

                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  {months.map(
                    (
                      month,
                      index
                    ) => (

                      <option
                        key={month}
                        value={index}
                      >
                        {month}
                      </option>

                    )
                  )}

                </select>

              </div>

              <div className="select-wrapper">

                <select
                  value={selectedYear}
                  onChange={(event) =>
                    setSelectedYear(
                      Number(
                        event.target.value
                      )
                    )
                  }
                >

                  {years.map(
                    (year) => (

                      <option
                        key={year}
                        value={year}
                      >
                        {year}
                      </option>

                    )
                  )}

                </select>

              </div>

            </div>

          </section>

        )}

        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activePage ===
          "dashboard" && (

          <div className="page-container">

            {/* WELCOME */}

            <section className="welcome-section">

              <div>

                <p className="welcome-small">
                  Welcome back 👋
                </p>

                <h1>
                  Here's your financial
                  overview.
                </h1>

                <p>
                  Track your spending,
                  manage your budget and
                  make smarter financial
                  decisions.
                </p>

              </div>

              <div className="welcome-decoration">
                <WalletCards size={72} />
              </div>

            </section>

            {/* STATS */}

            <section className="stats-grid">

              <div className="stat-card">

                <div className="stat-icon income">
                  <TrendingUp size={21} />
                </div>

                <div>

                  <span>
                    Total Income
                  </span>

                  <strong>
                    {formatCurrency(
                      totals.income
                    )}
                  </strong>

                  <small>
                    {months[selectedMonth]} income
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon expense">
                  <TrendingDown size={21} />
                </div>

                <div>

                  <span>
                    Total Expenses
                  </span>

                  <strong>
                    {formatCurrency(
                      totals.expense
                    )}
                  </strong>

                  <small>
                    {months[selectedMonth]} spending
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon balance">
                  <Wallet size={21} />
                </div>

                <div>

                  <span>
                    Balance
                  </span>

                  <strong>
                    {formatCurrency(
                      totals.balance
                    )}
                  </strong>

                  <small>
                    Income − Expenses
                  </small>

                </div>

              </div>

              <div className="stat-card">

                <div className="stat-icon budget">
                  <WalletCards size={21} />
                </div>

                <div>

                  <span>
                    Monthly Budget
                  </span>

                  <strong>
                    {formatCurrency(
                      budget
                    )}
                  </strong>

                  <small>
                    {budget > 0
                      ? `${formatCurrency(
                          remainingBudget
                        )} remaining`
                      : "No budget set"}
                  </small>

                </div>

              </div>

            </section>

            {/* BUDGET + RECENT */}

            <section className="dashboard-grid">

              {/* BUDGET */}

              <div className="glass-card budget-card">

                <div className="card-header">

                  <div>

                    <span className="section-label">
                      MONTHLY BUDGET
                    </span>

                    <h3>
                      {months[selectedMonth]} budget
                    </h3>

                  </div>

                  <button
                    type="button"
                    className="icon-button"
                    onClick={() =>
                      setShowBudgetModal(true)
                    }
                    title="Edit budget"
                  >
                    <Pencil size={17} />
                  </button>

                </div>

                <div className="budget-main">

                  <div className="budget-amount">

                    <span>
                      Budget
                    </span>

                    <strong>
                      {formatCurrency(
                        budget
                      )}
                    </strong>

                  </div>

                  <div className="budget-amount">

                    <span>
                      Spent
                    </span>

                    <strong>
                      {formatCurrency(
                        totals.expense
                      )}
                    </strong>

                  </div>

                  <div className="budget-amount">

                    <span>
                      Remaining
                    </span>

                    <strong
                      className={
                        remainingBudget < 0
                          ? "danger-text"
                          : ""
                      }
                    >
                      {formatCurrency(
                        remainingBudget
                      )}
                    </strong>

                  </div>

                </div>

                <div className="progress-container">

                  <div className="progress-label">

                    <span>
                      Budget usage
                    </span>

                    <strong>
                      {Math.round(
                        budgetPercentage
                      )}
                      %
                    </strong>

                  </div>

                  <div className="progress-track">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${budgetPercentage}%`,
                      }}
                    />

                  </div>

                </div>

                <button
                  type="button"
                  className="secondary-button full"
                  onClick={() =>
                    setShowBudgetModal(true)
                  }
                >

                  <WalletCards size={17} />

                  {budget > 0
                    ? "Update Monthly Budget"
                    : "Set Monthly Budget"}

                </button>

              </div>

              {/* RECENT */}

              <div className="glass-card recent-card">

                <div className="card-header">

                  <div>

                    <span className="section-label">
                      RECENT ACTIVITY
                    </span>

                    <h3>
                      Latest transactions
                    </h3>

                  </div>

                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      setActivePage(
                        "transactions"
                      )
                    }
                  >
                    View all
                  </button>

                </div>

                {selectedTransactions.length ===
                0 ? (

                  <div className="empty-state small">

                    <Receipt size={32} />

                    <p>
                      No transactions for{" "}
                      {months[selectedMonth]}{" "}
                      {selectedYear}.
                    </p>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={
                        openAddTransaction
                      }
                    >
                      <Plus size={16} />
                      Add Transaction
                    </button>

                  </div>

                ) : (

                  <div className="recent-list">

                    {selectedTransactions
                      .slice(0, 5)
                      .map(
                        (
                          transaction
                        ) => (

                          <div
                            className="recent-item"
                            key={
                              getTransactionId(
                                transaction
                              )
                            }
                          >

                            <div
                              className={`transaction-symbol ${
                                transaction.type ===
                                "income"
                                  ? "income-symbol"
                                  : "expense-symbol"
                              }`}
                            >
                              {transaction.type ===
                              "income"
                                ? "+"
                                : "−"}
                            </div>

                            <div className="recent-details">

                              <strong>
                                {
                                  transaction.title
                                }
                              </strong>

                              <span>
                                {
                                  transaction.category
                                }

                                {" • "}

                                {formatDate(
                                  transaction.date
                                )}
                              </span>

                            </div>

                            <strong
                              className={
                                transaction.type ===
                                "income"
                                  ? "amount-positive"
                                  : "amount-negative"
                              }
                            >
                              {transaction.type ===
                              "income"
                                ? "+"
                                : "−"}

                              {formatCurrency(
                                transaction.amount
                              )}
                            </strong>

                          </div>

                        )
                      )}

                  </div>

                )}

              </div>

            </section>

            {/* =================================================
                AI SPENDING INSIGHTS STATUS
            ================================================= */}

            <section className="glass-card ai-status-card">

              <div className="card-header">

                <div className="ai-title-wrapper">

                  <div className="ai-icon">
                    <Sparkles size={19} />
                  </div>

                  <div>

                    <span className="section-label">
                      AI SPENDING INSIGHTS
                    </span>

                    <h3>
                      SpendWise AI
                    </h3>

                  </div>

                </div>

                <span
                  className={`ai-status-pill ${
                    aiLoading
                      ? "processing"
                      : aiError
                      ? "offline"
                      : aiData
                      ? "online"
                      : ""
                  }`}
                >
                  {aiLoading
                    ? "Processing"
                    : aiError
                    ? "Offline"
                    : aiData
                    ? "Connected"
                    : "Waiting"}
                </span>

              </div>

              {aiLoading && (

                <div className="ai-message">

                  <div className="loading-dot" />

                  <p>
                    Analyzing your spending
                    patterns with SpendWise AI...
                  </p>

                </div>

              )}

              {!aiLoading &&
                aiError && (

                  <div className="ai-message error">

                    <AlertCircle size={20} />

                    <p>
                      AI service unavailable:{" "}
                      {aiError}
                    </p>

                  </div>

                )}

              {!aiLoading &&
                !aiError &&
                aiData && (

                  <div className="ai-results">

                    <div className="ai-result">

                      <span>
                        Processed transactions
                      </span>

                      <strong>
                        {
                          aiData.transactionCount ??
                          transactions.length
                        }
                      </strong>

                    </div>

                    <div className="ai-result">

                      <span>
                        Average expense
                      </span>

                      <strong>
                        {formatCurrency(
                          aiData.averageExpense
                        )}
                      </strong>

                    </div>

                    <div className="ai-result">

                      <span>
                        AI status
                      </span>

                      <strong>
                        <CheckCircle2
                          size={16}
                        />

                        Analysis ready
                      </strong>

                    </div>

                  </div>

                )}

              {!aiLoading &&
                !aiError &&
                !aiData &&
                transactions.length === 0 && (

                  <div className="ai-message">

                    <Brain size={20} />

                    <p>
                      Add transactions to
                      generate AI spending
                      insights.
                    </p>

                  </div>

                )}

            </section>

          </div>

        )}

        {/* =================================================
            TRANSACTIONS
        ================================================= */}

        {activePage ===
          "transactions" && (

          <div className="page-container">

            <section className="transactions-intro">

              <div>

                <p className="welcome-small">
                  FINANCIAL RECORDS
                </p>

                <h1>
                  Your Transactions
                </h1>

                <p>
                  Manage all your income and
                  expenses in one place.
                </p>

              </div>

              <div className="transaction-summary">

                <div>

                  <span>
                    Transactions
                  </span>

                  <strong>
                    {
                      selectedTransactions.length
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    Spent
                  </span>

                  <strong>
                    {formatCurrency(
                      totals.expense
                    )}
                  </strong>

                </div>

              </div>

            </section>

            <section className="glass-card transaction-table-card">

              <div className="card-header">

                <div>

                  <span className="section-label">
                    {months[
                      selectedMonth
                    ].toUpperCase()}{" "}
                    {selectedYear}
                  </span>

                  <h3>
                    Transaction history
                  </h3>

                </div>

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    openAddTransaction
                  }
                >
                  <Plus size={18} />
                  Add Transaction
                </button>

              </div>

              {loading ? (

                <div className="loading-state">

                  <div className="spinner" />

                  Loading transactions...

                </div>

              ) : selectedTransactions.length ===
                0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    <Receipt size={30} />
                  </div>

                  <h3>
                    No transactions yet
                  </h3>

                  <p>
                    Add your first transaction
                    for this month.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      openAddTransaction
                    }
                  >
                    <Plus size={18} />
                    Add Transaction
                  </button>

                </div>

              ) : (

                <div className="table-wrapper">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Transaction
                        </th>

                        <th>
                          Category
                        </th>

                        <th>
                          Date
                        </th>

                        <th>
                          Type
                        </th>

                        <th>
                          Amount
                        </th>

                        <th>
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {selectedTransactions.map(
                        (
                          transaction
                        ) => (

                          <tr
                            key={getTransactionId(
                              transaction
                            )}
                          >

                            <td>

                              <div className="table-title">

                                <div className="mini-icon">

                                  <Receipt
                                    size={15}
                                  />

                                </div>

                                <div>

                                  <strong>
                                    {
                                      transaction.title
                                    }
                                  </strong>

                                  {transaction.note && (

                                    <span>
                                      {
                                        transaction.note
                                      }
                                    </span>

                                  )}

                                </div>

                              </div>

                            </td>

                            <td>

                              <span className="category-pill">
                                {
                                  transaction.category
                                }
                              </span>

                            </td>

                            <td>
                              {formatDate(
                                transaction.date
                              )}
                            </td>

                            <td>

                              <span
                                className={`type-badge ${
                                  transaction.type
                                }`}
                              >
                                {
                                  transaction.type
                                }
                              </span>

                            </td>

                            <td>

                              <strong
                                className={
                                  transaction.type ===
                                  "income"
                                    ? "amount-positive"
                                    : "amount-negative"
                                }
                              >

                                {transaction.type ===
                                "income"
                                  ? "+"
                                  : "−"}

                                {formatCurrency(
                                  transaction.amount
                                )}

                              </strong>

                            </td>

                            <td>

                              <div className="row-actions">

                                <button
                                  type="button"
                                  className="icon-button"
                                  onClick={() =>
                                    openEditTransaction(
                                      transaction
                                    )
                                  }
                                  title="Edit transaction"
                                >
                                  <Pencil
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  className="icon-button danger"
                                  onClick={() =>
                                    handleDelete(
                                      getTransactionId(
                                        transaction
                                      )
                                    )
                                  }
                                  title="Delete transaction"
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </div>

        )}

        {/* =================================================
            AI SPENDING INSIGHTS
        ================================================= */}

        {activePage ===
          "insights" && (

          <div className="page-container">

            <AllInsights
              transactions={
                transactions
              }

              selectedMonth={
                selectedMonth
              }

              selectedYear={
                selectedYear
              }

              budget={
                budget
              }

              aiData={
                aiData
              }

              aiLoading={
                aiLoading
              }

            />

          </div>

        )}

      </main>

      {/* ===================================================
          TRANSACTION MODAL
      =================================================== */}

      {showTransactionModal && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeTransactionModal();
            }

          }}
        >

          <div className="modal">

            <div className="modal-header">

              <div>

                <span className="section-label">
                  TRANSACTION
                </span>

                <h2>
                  {editingTransaction
                    ? "Edit Transaction"
                    : "Add Transaction"}
                </h2>

              </div>

              <button
                type="button"
                className="icon-button"
                onClick={
                  closeTransactionModal
                }
                disabled={
                  savingTransaction
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={
                handleTransactionSubmit
              }
            >

              <div className="form-group">

                <label htmlFor="transaction-title">
                  Title
                </label>

                <input
                  id="transaction-title"
                  name="title"
                  type="text"
                  value={
                    transactionForm.title
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="e.g. Grocery shopping"
                  autoComplete="off"
                  autoFocus
                />

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="transaction-amount">
                    Amount
                  </label>

                  <div className="input-with-icon">

                    <IndianRupee
                      size={17}
                    />

                    <input
                      id="transaction-amount"
                      type="number"
                      name="amount"
                      value={
                        transactionForm.amount
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
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
                    value={
                      transactionForm.type
                    }
                    onChange={
                      handleFormChange
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

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="transaction-category">
                    Category
                  </label>

                  <select
                    id="transaction-category"
                    name="category"
                    value={
                      transactionForm.category
                    }
                    onChange={
                      handleFormChange
                    }
                  >

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

                  <label htmlFor="transaction-date">
                    Date
                  </label>

                  <input
                    id="transaction-date"
                    type="date"
                    name="date"
                    value={
                      transactionForm.date
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>

              </div>

              <div className="form-group">

                <label htmlFor="transaction-note">
                  Note
                </label>

                <textarea
                  id="transaction-note"
                  name="note"
                  value={
                    transactionForm.note
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Add an optional note..."
                  rows={3}
                />

              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeTransactionModal
                  }
                  disabled={
                    savingTransaction
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    savingTransaction
                  }
                >

                  <Save size={17} />

                  {savingTransaction
                    ? "Saving..."
                    : editingTransaction
                    ? "Update Transaction"
                    : "Save Transaction"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ===================================================
          BUDGET MODAL
      =================================================== */}

      {showBudgetModal && (

        <div
          className="modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              if (!budgetSaving) {
                setShowBudgetModal(
                  false
                );
              }

            }

          }}
        >

          <div className="modal budget-modal">

            <div className="modal-header">

              <div>

                <span className="section-label">
                  MONTHLY BUDGET
                </span>

                <h2>
                  Set your budget
                </h2>

              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  setShowBudgetModal(
                    false
                  )
                }
                disabled={
                  budgetSaving
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="budget-modal-period">

              <CalendarDays size={20} />

              <div>

                <span>
                  Budget period
                </span>

                <strong>
                  {months[selectedMonth]}{" "}
                  {selectedYear}
                </strong>

              </div>

            </div>

            <form
              onSubmit={saveBudget}
            >

              <div className="form-group">

                <label htmlFor="budget-input">
                  Monthly budget amount
                </label>

                <div className="large-money-input">

                  <span>
                    ₹
                  </span>

                  <input
                    id="budget-input"
                    type="number"
                    min="0"
                    step="100"
                    value={
                      budgetInput
                    }
                    onChange={(event) =>
                      setBudgetInput(
                        event.target.value
                      )
                    }
                    placeholder="Enter amount"
                    inputMode="decimal"
                    autoFocus
                  />

                </div>

              </div>

              <p className="budget-helper">
                Set how much you want to spend
                during this month. You can
                change it anytime.
              </p>

              <div className="modal-actions">

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setShowBudgetModal(
                      false
                    )
                  }
                  disabled={
                    budgetSaving
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    budgetSaving
                  }
                >

                  <Save size={17} />

                  {budgetSaving
                    ? "Saving..."
                    : "Save Budget"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;