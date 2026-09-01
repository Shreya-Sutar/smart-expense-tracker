import { useMemo } from "react";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  Target,
  PieChart as PieChartIcon,
  Activity,
  AlertCircle,
  Brain,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

import "./AllInsights.css";

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

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const getTransactionId = (transaction, index) => {
  return String(
    transaction?._id ||
      transaction?.id ||
      `transaction-${index}`
  );
};

const getSafeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

function AllInsights({
  transactions = [],
  selectedMonth = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
  budget = 0,
  aiData = null,
  aiLoading = false,
}) {
  // =========================================================
  // SELECTED MONTH TRANSACTIONS
  // =========================================================

  const selectedTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) {
      return [];
    }

    return transactions.filter((transaction) => {
      const date = getSafeDate(transaction?.date);

      if (!date) {
        return false;
      }

      return (
        date.getMonth() === Number(selectedMonth) &&
        date.getFullYear() === Number(selectedYear)
      );
    });
  }, [
    transactions,
    selectedMonth,
    selectedYear,
  ]);

  // =========================================================
  // TOTALS
  // =========================================================

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    selectedTransactions.forEach((transaction) => {
      const amount = Number(transaction?.amount) || 0;

      if (transaction?.type === "income") {
        income += amount;
      } else {
        expense += amount;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [selectedTransactions]);

  // =========================================================
  // CATEGORY DATA
  // =========================================================

  const categoryData = useMemo(() => {
    const categoryTotals = {};

    categories.forEach((category) => {
      categoryTotals[category] = 0;
    });

    selectedTransactions.forEach((transaction) => {
      if (transaction?.type !== "expense") {
        return;
      }

      const category =
        transaction?.category &&
        categories.includes(transaction.category)
          ? transaction.category
          : "Other";

      categoryTotals[category] +=
        Number(transaction?.amount) || 0;
    });

    return categories
      .map((category) => ({
        name: category,
        value: Number(
          categoryTotals[category].toFixed(2)
        ),
      }))
      .filter((item) => item.value > 0);
  }, [selectedTransactions]);

  // =========================================================
  // DAILY SPENDING DATA
  // =========================================================

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(
      Number(selectedYear),
      Number(selectedMonth) + 1,
      0
    ).getDate();

    const dailyTotals = {};

    for (let day = 1; day <= daysInMonth; day++) {
      dailyTotals[day] = {
        expense: 0,
        income: 0,
      };
    }

    selectedTransactions.forEach((transaction) => {
      const date = getSafeDate(transaction?.date);

      if (!date) {
        return;
      }

      const day = date.getDate();
      const amount = Number(transaction?.amount) || 0;

      if (transaction?.type === "income") {
        dailyTotals[day].income += amount;
      } else {
        dailyTotals[day].expense += amount;
      }
    });

    return Object.entries(dailyTotals).map(
      ([day, values]) => ({
        day: Number(day),
        expense: Number(values.expense.toFixed(2)),
        income: Number(values.income.toFixed(2)),
      })
    );
  }, [
    selectedTransactions,
    selectedMonth,
    selectedYear,
  ]);

  // =========================================================
  // CATEGORY BAR DATA
  // =========================================================

  const categoryBarData = useMemo(() => {
    return categories.map((category) => {
      const matching = selectedTransactions.filter(
        (transaction) =>
          transaction?.type !== "income" &&
          (transaction?.category === category ||
            (!transaction?.category &&
              category === "Other"))
      );

      const amount = matching.reduce(
        (sum, transaction) =>
          sum + (Number(transaction?.amount) || 0),
        0
      );

      return {
        category,
        amount: Number(amount.toFixed(2)),
      };
    });
  }, [selectedTransactions]);

  // =========================================================
  // TRANSACTION TYPE DATA
  // =========================================================

  const typeData = useMemo(() => {
    const income = selectedTransactions.filter(
      (transaction) =>
        transaction?.type === "income"
    ).length;

    const expense = selectedTransactions.filter(
      (transaction) =>
        transaction?.type !== "income"
    ).length;

    return [
      {
        name: "Income",
        value: income,
      },
      {
        name: "Expenses",
        value: expense,
      },
    ].filter((item) => item.value > 0);
  }, [selectedTransactions]);

  // =========================================================
  // TOP CATEGORY
  // =========================================================

  const topCategory = useMemo(() => {
    if (categoryData.length === 0) {
      return null;
    }

    return [...categoryData].sort(
      (a, b) => b.value - a.value
    )[0];
  }, [categoryData]);

  // =========================================================
  // AVERAGE EXPENSE
  // =========================================================

  const averageExpense = useMemo(() => {
    const expenseTransactions =
      selectedTransactions.filter(
        (transaction) =>
          transaction?.type !== "income"
      );

    if (expenseTransactions.length === 0) {
      return 0;
    }

    return (
      totals.expense /
      expenseTransactions.length
    );
  }, [
    selectedTransactions,
    totals.expense,
  ]);

  // =========================================================
  // BUDGET
  // =========================================================

  const budgetUsedPercentage = useMemo(() => {
    if (!Number(budget) || Number(budget) <= 0) {
      return 0;
    }

    return Math.min(
      (totals.expense / Number(budget)) * 100,
      100
    );
  }, [budget, totals.expense]);

  const remainingBudget =
    Number(budget) - totals.expense;

  // =========================================================
  // SPENDING INSIGHT
  // =========================================================

  const spendingMessage = useMemo(() => {
    if (selectedTransactions.length === 0) {
      return "Add some transactions to generate personalized spending insights.";
    }

    if (
      budget > 0 &&
      totals.expense > Number(budget)
    ) {
      return `You have exceeded your monthly budget by ${formatCurrency(
        totals.expense - Number(budget)
      )}. Consider reducing spending in your highest-spending category.`;
    }

    if (
      budget > 0 &&
      budgetUsedPercentage >= 80
    ) {
      return `You have used ${Math.round(
        budgetUsedPercentage
      )}% of your monthly budget. Keep an eye on your remaining spending.`;
    }

    if (topCategory) {
      return `${topCategory.name} is currently your highest spending category at ${formatCurrency(
        topCategory.value
      )}.`;
    }

    return "Your spending is being analyzed based on your recent transactions.";
  }, [
    selectedTransactions.length,
    budget,
    totals.expense,
    budgetUsedPercentage,
    topCategory,
  ]);

  // =========================================================
  // TOOLTIP
  // =========================================================

  const currencyTooltipFormatter = (value) => {
    return formatCurrency(value);
  };

  // =========================================================
  // PIE COLORS
  // =========================================================

  const pieColors = [
    "#7c3aed",
    "#2563eb",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#8b5cf6",
    "#64748b",
  ];

  return (
    <div className="insights-page">

      {/* =====================================================
          PAGE INTRO
      ===================================================== */}

      <section className="insights-hero">

        <div className="insights-hero-content">

          <div className="insights-hero-icon">
            <Sparkles size={26} />
          </div>

          <div>

            <span className="insights-eyebrow">
              AI-POWERED FINANCIAL ANALYSIS
            </span>

            <h1>
              Spending Insights
            </h1>

            <p>
              Understand where your money goes,
              identify spending patterns and make
              smarter financial decisions.
            </p>

          </div>

        </div>

        <div className="insights-period">

          <CalendarIcon />

          <div>
            <span>Analysis period</span>

            <strong>
              {months[selectedMonth]}{" "}
              {selectedYear}
            </strong>
          </div>

        </div>

      </section>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="insights-summary-grid">

        <div className="insight-stat-card">

          <div className="insight-stat-icon expense-icon">
            <TrendingDown size={21} />
          </div>

          <div>
            <span>Total spending</span>

            <strong>
              {formatCurrency(
                totals.expense
              )}
            </strong>

            <small>
              {selectedTransactions.filter(
                (transaction) =>
                  transaction?.type !== "income"
              ).length}{" "}
              expense transactions
            </small>
          </div>

        </div>

        <div className="insight-stat-card">

          <div className="insight-stat-icon income-icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Total income</span>

            <strong>
              {formatCurrency(
                totals.income
              )}
            </strong>

            <small>
              This month
            </small>
          </div>

        </div>

        <div className="insight-stat-card">

          <div className="insight-stat-icon balance-icon">
            <Wallet size={21} />
          </div>

          <div>
            <span>Net balance</span>

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

        <div className="insight-stat-card">

          <div className="insight-stat-icon average-icon">
            <Activity size={21} />
          </div>

          <div>
            <span>Average expense</span>

            <strong>
              {formatCurrency(
                averageExpense
              )}
            </strong>

            <small>
              Per transaction
            </small>
          </div>

        </div>

      </section>

      {/* =====================================================
          AI INSIGHT
      ===================================================== */}

      <section className="ai-insight-banner">

        <div className="ai-insight-left">

          <div className="ai-brain-icon">
            <Brain size={24} />
          </div>

          <div>

            <span>
              SPENDWISE AI
            </span>

            <h3>
              Personalized spending insight
            </h3>

            <p>
              {aiLoading
                ? "Analyzing your transactions..."
                : spendingMessage}
            </p>

          </div>

        </div>

        <div className="ai-status">

          <Sparkles size={16} />

          {aiLoading
            ? "Analyzing"
            : aiData
            ? "AI Connected"
            : "Smart Analysis"}

        </div>

      </section>

      {/* =====================================================
          CHART ROW 1
      ===================================================== */}

      <section className="charts-grid">

        {/* CATEGORY PIE CHART */}

        <div className="chart-card">

          <div className="chart-card-header">

            <div>

              <span className="chart-label">
                EXPENSE BREAKDOWN
              </span>

              <h3>
                Spending by category
              </h3>

            </div>

            <div className="chart-icon">
              <PieChartIcon size={19} />
            </div>

          </div>

          {categoryData.length === 0 ? (

            <div className="chart-empty">

              <PieChartIcon size={38} />

              <strong>
                No expense data
              </strong>

              <p>
                Add expenses to see your
                category breakdown.
              </p>

            </div>

          ) : (

            <div className="pie-chart-container">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={58}
                    paddingAngle={3}
                  >

                    {categoryData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            pieColors[
                              index %
                                pieColors.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    formatter={
                      currencyTooltipFormatter
                    }
                  />

                </PieChart>

              </ResponsiveContainer>

              <div className="pie-legend">

                {categoryData.map(
                  (item, index) => (

                    <div
                      className="legend-item"
                      key={item.name}
                    >

                      <span
                        className="legend-dot"
                        style={{
                          background:
                            pieColors[
                              index %
                                pieColors.length
                            ],
                        }}
                      />

                      <span>
                        {item.name}
                      </span>

                      <strong>
                        {formatCurrency(
                          item.value
                        )}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

        {/* DAILY TREND */}

        <div className="chart-card">

          <div className="chart-card-header">

            <div>

              <span className="chart-label">
                DAILY ACTIVITY
              </span>

              <h3>
                Income vs expenses
              </h3>

            </div>

            <div className="chart-icon">
              <TrendingUp size={19} />
            </div>

          </div>

          <ResponsiveContainer
            width="100%"
            height={330}
          >

            <LineChart
              data={dailyData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  `₹${value}`
                }
              />

              <Tooltip
                formatter={
                  currencyTooltipFormatter
                }
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={3}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="expense"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </section>

      {/* =====================================================
          CHART ROW 2
      ===================================================== */}

      <section className="charts-grid">

        {/* BAR CHART */}

        <div className="chart-card">

          <div className="chart-card-header">

            <div>

              <span className="chart-label">
                CATEGORY ANALYSIS
              </span>

              <h3>
                Where you spend the most
              </h3>

            </div>

            <div className="chart-icon">
              <BarChart3 size={19} />
            </div>

          </div>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <BarChart
              data={categoryBarData}
              margin={{
                top: 15,
                right: 10,
                left: 0,
                bottom: 55,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="category"
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 10 }}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  `₹${value}`
                }
              />

              <Tooltip
                formatter={
                  currencyTooltipFormatter
                }
              />

              <Bar
                dataKey="amount"
                name="Spending"
                fill="#7c3aed"
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

        {/* BUDGET ANALYSIS */}

        <div className="chart-card budget-insight-card">

          <div className="chart-card-header">

            <div>

              <span className="chart-label">
                BUDGET HEALTH
              </span>

              <h3>
                Monthly budget
              </h3>

            </div>

            <div className="chart-icon">
              <Target size={19} />
            </div>

          </div>

          <div className="budget-insight-content">

            <div className="budget-circle">

              <div
                className="budget-circle-progress"
                style={{
                  background: `conic-gradient(
                    #7c3aed ${budgetUsedPercentage}%,
                    #e5e7eb ${budgetUsedPercentage}% 100%
                  )`,
                }}
              >

                <div className="budget-circle-inner">

                  <strong>
                    {Math.round(
                      budgetUsedPercentage
                    )}
                    %
                  </strong>

                  <span>
                    used
                  </span>

                </div>

              </div>

            </div>

            <div className="budget-details">

              <div>
                <span>
                  Monthly budget
                </span>

                <strong>
                  {formatCurrency(
                    budget
                  )}
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

              <div>
                <span>
                  Remaining
                </span>

                <strong
                  className={
                    remainingBudget < 0
                      ? "danger-value"
                      : "success-value"
                  }
                >
                  {formatCurrency(
                    remainingBudget
                  )}
                </strong>
              </div>

            </div>

            <div
              className={`budget-message ${
                remainingBudget < 0
                  ? "budget-danger"
                  : budget > 0 &&
                    budgetUsedPercentage >=
                      80
                  ? "budget-warning"
                  : "budget-good"
              }`}
            >

              {budget <= 0 ? (
                <>
                  <Target size={19} />

                  <span>
                    Set a monthly budget to
                    track your spending
                    progress.
                  </span>
                </>
              ) : remainingBudget < 0 ? (
                <>
                  <AlertCircle size={19} />

                  <span>
                    You have exceeded your
                    budget.
                  </span>
                </>
              ) : budgetUsedPercentage >=
                80 ? (
                <>
                  <AlertCircle size={19} />

                  <span>
                    You're close to your
                    monthly spending limit.
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp size={19} />

                  <span>
                    You're currently within
                    your budget.
                  </span>
                </>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          TRANSACTION OVERVIEW
      ===================================================== */}

      <section className="chart-card transaction-overview-card">

        <div className="chart-card-header">

          <div>

            <span className="chart-label">
              TRANSACTION OVERVIEW
            </span>

            <h3>
              Income and expense activity
            </h3>

          </div>

          <div className="chart-icon">
            <Activity size={19} />
          </div>

        </div>

        {typeData.length === 0 ? (

          <div className="chart-empty horizontal">

            <Activity size={36} />

            <div>
              <strong>
                No transactions yet
              </strong>

              <p>
                Add income or expenses to
                see your activity overview.
              </p>
            </div>

          </div>

        ) : (

          <div className="transaction-overview-content">

            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <BarChart
                data={typeData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 30,
                  left: 30,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  name="Transactions"
                  fill="#2563eb"
                  radius={[
                    0,
                    7,
                    7,
                    0,
                  ]}
                  barSize={35}
                />

              </BarChart>

            </ResponsiveContainer>

            <div className="overview-numbers">

              <div className="overview-number">

                <span>
                  Total transactions
                </span>

                <strong>
                  {
                    selectedTransactions.length
                  }
                </strong>

              </div>

              <div className="overview-number">

                <span>
                  Highest category
                </span>

                <strong>
                  {topCategory
                    ? topCategory.name
                    : "—"}
                </strong>

              </div>

              <div className="overview-number">

                <span>
                  Highest category spend
                </span>

                <strong>
                  {topCategory
                    ? formatCurrency(
                        topCategory.value
                      )
                    : "₹0"}
                </strong>

              </div>

            </div>

          </div>

        )}

      </section>

      {/* =====================================================
          AI DATA
      ===================================================== */}

      {aiData && (

        <section className="ai-data-card">

          <div className="ai-data-header">

            <div className="ai-data-title">

              <div className="ai-data-icon">
                <Sparkles size={19} />
              </div>

              <div>

                <span>
                  AI ANALYSIS
                </span>

                <h3>
                  SpendWise AI results
                </h3>

              </div>

            </div>

            <div className="ai-connected">
              <span />
              Connected
            </div>

          </div>

          <div className="ai-data-grid">

            <div>

              <span>
                Transactions processed
              </span>

              <strong>
                {aiData.transactionCount ??
                  transactions.length}
              </strong>

            </div>

            <div>

              <span>
                Average expense
              </span>

              <strong>
                {formatCurrency(
                  aiData.averageExpense ??
                    averageExpense
                )}
              </strong>

            </div>

            <div>

              <span>
                Current spending
              </span>

              <strong>
                {formatCurrency(
                  totals.expense
                )}
              </strong>

            </div>

            <div>

              <span>
                Analysis status
              </span>

              <strong>
                Ready
              </strong>

            </div>

          </div>

        </section>

      )}

      {/* =====================================================
          NO DATA
      ===================================================== */}

      {selectedTransactions.length === 0 && (

        <section className="no-data-card">

          <div className="no-data-icon">
            <BarChart3 size={27} />
          </div>

          <div>

            <h3>
              Start tracking your spending
            </h3>

            <p>
              There are no transactions for{" "}
              <strong>
                {months[selectedMonth]}{" "}
                {selectedYear}
              </strong>
              . Add transactions from the
              Transactions page to unlock
              detailed insights and graphs.
            </p>

          </div>

        </section>

      )}

    </div>
  );
}

// =========================================================
// SMALL CALENDAR ICON COMPONENT
// =========================================================

function CalendarIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="2"
      />
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="6"
      />
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="6"
      />
      <line
        x1="3"
        y1="10"
        x2="21"
        y2="10"
      />
    </svg>
  );
}

export default AllInsights;