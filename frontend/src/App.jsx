import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";

import Login from "./Login";
import Register from "./Register";
import AllInsights from "./AllInsights";

import "./App.css";

const API_URL = "http://localhost:5000/api";

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

function App() {
  const [token, setToken] = useState(
    localStorage.getItem("expense_token")
  );

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(
      "expense_user"
    );

    return saved ? JSON.parse(saved) : null;
  });

  const [authPage, setAuthPage] = useState("login");

  const [activePage, setActivePage] =
    useState("dashboard");

  const now = new Date();

  const [selectedMonth, setSelectedMonth] =
    useState(now.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(now.getFullYear());

  const [transactions, setTransactions] =
    useState([]);

  const [budget, setBudget] = useState(0);

  const [loading, setLoading] = useState(false);

  const [showTransactionModal, setShowTransactionModal] =
    useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState(null);

  const [showBudgetModal, setShowBudgetModal] =
    useState(false);

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [transactionForm, setTransactionForm] =
    useState({
      title: "",
      amount: "",
      type: "expense",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });

  const [budgetInput, setBudgetInput] =
    useState("");

  /* =====================================================
     AUTH HELPERS
  ===================================================== */

  const logout = () => {
    localStorage.removeItem("expense_token");
    localStorage.removeItem("expense_user");

    setToken(null);
    setUser(null);
  };

  const handleLogin = (data) => {
    localStorage.setItem(
      "expense_token",
      data.token
    );

    localStorage.setItem(
      "expense_user",
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);
  };

  const handleRegister = (data) => {
    localStorage.setItem(
      "expense_token",
      data.token
    );

    localStorage.setItem(
      "expense_user",
      JSON.stringify(data.user)
    );

    setToken(data.token);
    setUser(data.user);
  };

  /* =====================================================
     API
  ===================================================== */

  const apiFetch = async (
    endpoint,
    options = {}
  ) => {
    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type": "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),

          ...(options.headers || {}),
        },
      }
    );

    const data = await response
      .json()
      .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Something went wrong"
      );
    }

    return data;
  };

  /* =====================================================
     FETCH TRANSACTIONS
  ===================================================== */

  const fetchTransactions = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const data = await apiFetch(
        "/transactions"
      );

      setTransactions(data);
    } catch (error) {
      console.error(error);

      if (
        error.message.includes("token") ||
        error.message.includes("Authentication")
      ) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FETCH BUDGET
  ===================================================== */

  const fetchBudget = async () => {
    if (!token) return;

    try {
      const data = await apiFetch(
        `/budget?month=${
          selectedMonth + 1
        }&year=${selectedYear}`
      );

      setBudget(Number(data.amount || 0));
      setBudgetInput(
        data.amount ? String(data.amount) : ""
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBudget();
    }
  }, [
    token,
    selectedMonth,
    selectedYear,
  ]);

  /* =====================================================
     SELECTED MONTH TRANSACTIONS
  ===================================================== */

  const selectedTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.date);

      return (
        date.getMonth() === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  }, [
    transactions,
    selectedMonth,
    selectedYear,
  ]);

  /* =====================================================
     DASHBOARD TOTALS
  ===================================================== */

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    selectedTransactions.forEach(
      (transaction) => {
        const amount = Number(
          transaction.amount
        );

        if (transaction.type === "income") {
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

  const remainingBudget = Math.max(
    budget - totals.expense,
    0
  );

  const budgetPercentage =
    budget > 0
      ? Math.min(
          (totals.expense / budget) * 100,
          100
        )
      : 0;

  /* =====================================================
     FORM
  ===================================================== */

  const openAddTransaction = () => {
    setEditingTransaction(null);

    setTransactionForm({
      title: "",
      amount: "",
      type: "expense",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      note: "",
    });

    setShowTransactionModal(true);
  };

  const openEditTransaction = (
    transaction
  ) => {
    setEditingTransaction(transaction);

    setTransactionForm({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date)
        .toISOString()
        .split("T")[0],
      note: transaction.note || "",
    });

    setShowTransactionModal(true);
  };

  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleFormChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setTransactionForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =====================================================
     ADD / UPDATE TRANSACTION
  ===================================================== */

  const handleTransactionSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (
      !transactionForm.title.trim() ||
      !transactionForm.amount ||
      Number(transactionForm.amount) <= 0 ||
      !transactionForm.date
    ) {
      alert(
        "Please enter a valid title, amount and date."
      );

      return;
    }

    try {
      const payload = {
        ...transactionForm,
        amount: Number(
          transactionForm.amount
        ),
      };

      if (editingTransaction) {
        await apiFetch(
          `/transactions/${editingTransaction._id}`,
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

      closeTransactionModal();
    } catch (error) {
      alert(error.message);
    }
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      await apiFetch(
        `/transactions/${id}`,
        {
          method: "DELETE",
        }
      );

      await fetchTransactions();
    } catch (error) {
      alert(error.message);
    }
  };

  /* =====================================================
     BUDGET
  ===================================================== */

  const saveBudget = async (event) => {
    event.preventDefault();

    const amount = Number(budgetInput);

    if (Number.isNaN(amount) || amount < 0) {
      alert(
        "Please enter a valid budget amount."
      );

      return;
    }

    try {
      await apiFetch("/budget", {
        method: "PUT",

        body: JSON.stringify({
          month: selectedMonth + 1,
          year: selectedYear,
          amount,
        }),
      });

      setBudget(amount);

      setShowBudgetModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  /* =====================================================
     YEAR OPTIONS
  ===================================================== */

  const years = [];

  for (
    let year = now.getFullYear() - 4;
    year <= now.getFullYear() + 2;
    year++
  ) {
    years.push(year);
  }

  /* =====================================================
     AUTH SCREEN
  ===================================================== */

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

  /* =====================================================
     NAVIGATION
  ===================================================== */

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
      label: "Insights",
      icon: BarChart3,
    },
  ];

  const pageTitle =
    activePage === "dashboard"
      ? "Dashboard"
      : activePage === "transactions"
      ? "Transactions"
      : "Insights";

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-icon">
            <WalletCards size={23} />
          </div>

          <div>
            <h1>SpendWise</h1>
            <span>Smart Expense Manager</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
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
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">
              {user.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main-content">

        {/* HEADER */}

        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() =>
              setMobileMenu(!mobileMenu)
            }
          >
            <Menu size={22} />
          </button>

          <div>
            <p className="eyebrow">
              PERSONAL FINANCE
            </p>

            <h2>{pageTitle}</h2>
          </div>

          <div className="topbar-actions">
            {activePage === "transactions" && (
              <button
                className="primary-button"
                onClick={openAddTransaction}
              >
                <Plus size={18} />
                Add Transaction
              </button>
            )}

            {activePage === "dashboard" && (
              <button
                className="primary-button"
                onClick={openAddTransaction}
              >
                <Plus size={18} />
                Add Transaction
              </button>
            )}
          </div>
        </header>

        {/* PERIOD SELECTOR */}

        {(activePage === "dashboard" ||
          activePage === "insights") && (
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
                      Number(event.target.value)
                    )
                  }
                >
                  {months.map(
                    (month, index) => (
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
                      Number(event.target.value)
                    )
                  }
                >
                  {years.map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </section>
        )}

        {/* DASHBOARD */}

        {activePage === "dashboard" && (
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
            </section>

            {/* STATS */}

            <section className="stats-grid">

              <div className="stat-card">
                <div className="stat-icon income">
                  <TrendingUp size={21} />
                </div>

                <div>
                  <span>Total Income</span>

                  <strong>
                    ₹
                    {totals.income.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <small>
                    {months[selectedMonth]}{" "}
                    income
                  </small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon expense">
                  <TrendingDown size={21} />
                </div>

                <div>
                  <span>Total Expenses</span>

                  <strong>
                    ₹
                    {totals.expense.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <small>
                    {months[selectedMonth]}{" "}
                    spending
                  </small>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon balance">
                  <Wallet size={21} />
                </div>

                <div>
                  <span>Balance</span>

                  <strong>
                    ₹
                    {totals.balance.toLocaleString(
                      "en-IN"
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
                  <span>Monthly Budget</span>

                  <strong>
                    ₹
                    {budget.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <small>
                    {budget > 0
                      ? `₹${remainingBudget.toLocaleString(
                          "en-IN"
                        )} remaining`
                      : "No budget set"}
                  </small>
                </div>
              </div>

            </section>

            {/* BUDGET + RECENT */}

            <section className="dashboard-grid">

              <div className="glass-card budget-card">

                <div className="card-header">
                  <div>
                    <span className="section-label">
                      MONTHLY BUDGET
                    </span>

                    <h3>
                      {months[selectedMonth]}{" "}
                      budget
                    </h3>
                  </div>

                  <button
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
                    <span>Budget</span>

                    <strong>
                      ₹
                      {budget.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div className="budget-amount">
                    <span>Spent</span>

                    <strong>
                      ₹
                      {totals.expense.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div className="budget-amount">
                    <span>Remaining</span>

                    <strong>
                      ₹
                      {remainingBudget.toLocaleString(
                        "en-IN"
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
                        width: `${budgetPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                <button
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
                      {months[
                        selectedMonth
                      ]}{" "}
                      {selectedYear}.
                    </p>

                    <button
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
                        (transaction) => (
                          <div
                            className="recent-item"
                            key={
                              transaction._id
                            }
                          >
                            <div className="transaction-symbol">
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
                                }{" "}
                                •{" "}
                                {new Date(
                                  transaction.date
                                ).toLocaleDateString(
                                  "en-IN"
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
                              ₹
                              {Number(
                                transaction.amount
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          </div>
                        )
                      )}
                  </div>
                )}

              </div>
            </section>
          </div>
        )}

        {/* TRANSACTIONS */}

        {activePage === "transactions" && (
          <div className="page-container">

            <section className="transactions-intro">
              <div>
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
                  <span>Transactions</span>
                  <strong>
                    {
                      selectedTransactions.length
                    }
                  </strong>
                </div>

                <div>
                  <span>Spent</span>
                  <strong>
                    ₹
                    {totals.expense.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section className="glass-card transaction-table-card">

              <div className="card-header">
                <div>
                  <span className="section-label">
                    {months[selectedMonth].toUpperCase()}{" "}
                    {selectedYear}
                  </span>

                  <h3>
                    Transaction history
                  </h3>
                </div>

                {/* ONLY ONE ADD BUTTON */}

                <button
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
                        <th>Transaction</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedTransactions.map(
                        (transaction) => (
                          <tr
                            key={
                              transaction._id
                            }
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
                              {new Date(
                                transaction.date
                              ).toLocaleDateString(
                                "en-IN"
                              )}
                            </td>

                            <td>
                              <span
                                className={`type-badge ${transaction.type}`}
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
                                ₹
                                {Number(
                                  transaction.amount
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>
                            </td>

                            <td>
                              <div className="row-actions">
                                <button
                                  className="icon-button"
                                  onClick={() =>
                                    openEditTransaction(
                                      transaction
                                    )
                                  }
                                >
                                  <Pencil
                                    size={16}
                                  />
                                </button>

                                <button
                                  className="icon-button danger"
                                  onClick={() =>
                                    handleDelete(
                                      transaction._id
                                    )
                                  }
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

        {/* INSIGHTS */}

        {activePage === "insights" && (
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
              budget={budget}
            />
          </div>
        )}

      </main>

      {/* TRANSACTION MODAL */}

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
                className="icon-button"
                onClick={
                  closeTransactionModal
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
                <label>
                  Title
                </label>

                <input
                  name="title"
                  value={
                    transactionForm.title
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="e.g. Grocery shopping"
                  autoComplete="off"
                />
              </div>

              <div className="form-grid">

                <div className="form-group">
                  <label>
                    Amount
                  </label>

                  <div className="input-with-icon">
                    <IndianRupee
                      size={17}
                    />

                    <input
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
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Type
                  </label>

                  <select
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
                  <label>
                    Category
                  </label>

                  <select
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
                  <label>
                    Date
                  </label>

                  <input
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
                <label>
                  Note
                </label>

                <textarea
                  name="note"
                  value={
                    transactionForm.note
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Add an optional note..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={
                    closeTransactionModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Save size={17} />

                  {editingTransaction
                    ? "Update Transaction"
                    : "Save Transaction"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BUDGET MODAL */}

      {showBudgetModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowBudgetModal(false);
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
                className="icon-button"
                onClick={() =>
                  setShowBudgetModal(false)
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

            <form onSubmit={saveBudget}>

              <div className="form-group">
                <label>
                  Monthly budget amount
                </label>

                <div className="large-money-input">
                  <span>₹</span>

                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={budgetInput}
                    onChange={(event) =>
                      setBudgetInput(
                        event.target.value
                      )
                    }
                    placeholder="Enter amount"
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
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Save size={17} />
                  Save Budget
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