import { useMemo } from "react";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  Sparkles,
  Target,
  PieChart,
  Activity,
} from "lucide-react";

import "./AllInsights.css";

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatShortCurrency = (value) => {
  const amount = Number(value) || 0;

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }

  return `₹${Math.round(amount)}`;
};

const getTransactionDate = (transaction) => {
  if (!transaction?.date) return null;

  const date = new Date(transaction.date);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getCategoryColorClass = (index) => {
  return `category-color-${index % 8}`;
};

// =========================================================
// COMPONENT
// =========================================================

function AllInsights({
  transactions = [],
  selectedMonth,
  selectedYear,
  budget = 0,
  aiData = null,
  aiLoading = false,
}) {
  // =======================================================
  // SELECTED MONTH TRANSACTIONS
  // =======================================================

  const selectedTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = getTransactionDate(transaction);

      if (!date) return false;

      return (
        date.getMonth() === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  }, [transactions, selectedMonth, selectedYear]);

  // =======================================================
  // TOTALS
  // =======================================================

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

  // =======================================================
  // CATEGORY DATA
  // =======================================================

  const categoryData = useMemo(() => {
    const map = {};

    selectedTransactions
      .filter(
        (transaction) =>
          transaction?.type !== "income"
      )
      .forEach((transaction) => {
        const category =
          transaction?.category || "Other";

        const amount =
          Number(transaction?.amount) || 0;

        map[category] =
          (map[category] || 0) + amount;
      });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [selectedTransactions]);

  const maxCategoryAmount = useMemo(() => {
    return Math.max(
      ...categoryData.map((item) => item.amount),
      1
    );
  }, [categoryData]);

  // =======================================================
  // DAILY EXPENSE DATA
  // =======================================================

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();

    const daily = Array.from(
      { length: daysInMonth },
      (_, index) => ({
        day: index + 1,
        amount: 0,
      })
    );

    selectedTransactions.forEach((transaction) => {
      if (transaction?.type === "income") {
        return;
      }

      const date =
        getTransactionDate(transaction);

      if (!date) return;

      const day = date.getDate();
      const amount =
        Number(transaction?.amount) || 0;

      if (daily[day - 1]) {
        daily[day - 1].amount += amount;
      }
    });

    return daily;
  }, [
    selectedTransactions,
    selectedMonth,
    selectedYear,
  ]);

  const maxDailyAmount = useMemo(() => {
    return Math.max(
      ...dailyData.map((item) => item.amount),
      1
    );
  }, [dailyData]);

  const highestSpendingDay = useMemo(() => {
    if (!dailyData.length) {
      return {
        day: 0,
        amount: 0,
      };
    }

    return dailyData.reduce(
      (highest, current) =>
        current.amount > highest.amount
          ? current
          : highest,
      dailyData[0]
    );
  }, [dailyData]);

  // =======================================================
  // SAVING RATE
  // =======================================================

  const savingRate =
    totals.income > 0
      ? ((totals.income - totals.expense) /
          totals.income) *
        100
      : 0;

  // =======================================================
  // BUDGET
  // =======================================================

  const budgetUsage =
    budget > 0
      ? (totals.expense / budget) * 100
      : 0;

  const remainingBudget =
    Number(budget) - totals.expense;

  // =======================================================
  // BAR CHART WIDTH
  // =======================================================

  const incomeBar =
    totals.income > 0
      ? Math.min(
          (totals.income /
            Math.max(
              totals.income,
              totals.expense,
              1
            )) *
            100,
          100
        )
      : 0;

  const expenseBar =
    totals.expense > 0
      ? Math.min(
          (totals.expense /
            Math.max(
              totals.income,
              totals.expense,
              1
            )) *
            100,
          100
        )
      : 0;

  // =======================================================
  // EMPTY STATE
  // =======================================================

  const hasTransactions =
    selectedTransactions.length > 0;

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="insights-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="insights-hero">

        <div className="insights-hero-content">

          <div className="insights-eyebrow">
            <Sparkles size={16} />
            POWERED BY SPENDWISE AI
          </div>

          <h1>
            Your spending insights
          </h1>

          <p>
            Understand your financial habits,
            discover spending patterns and make
            smarter decisions.
          </p>

        </div>

        <div className="insights-hero-icon">
          <BarChart3 size={54} />
        </div>

      </section>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="insights-summary-grid">

        <div className="insight-summary-card">

          <div className="summary-icon income-icon">
            <TrendingUp size={21} />
          </div>

          <div>
            <span>Total income</span>

            <strong>
              {formatCurrency(totals.income)}
            </strong>

            <small>
              {selectedTransactions.filter(
                (transaction) =>
                  transaction.type === "income"
              ).length}{" "}
              income records
            </small>
          </div>

        </div>

        <div className="insight-summary-card">

          <div className="summary-icon expense-icon">
            <TrendingDown size={21} />
          </div>

          <div>
            <span>Total spending</span>

            <strong>
              {formatCurrency(totals.expense)}
            </strong>

            <small>
              {selectedTransactions.filter(
                (transaction) =>
                  transaction.type !== "income"
              ).length}{" "}
              expense records
            </small>
          </div>

        </div>

        <div className="insight-summary-card">

          <div className="summary-icon balance-icon">
            <Wallet size={21} />
          </div>

          <div>
            <span>Net balance</span>

            <strong
              className={
                totals.balance < 0
                  ? "negative-value"
                  : ""
              }
            >
              {formatCurrency(totals.balance)}
            </strong>

            <small>
              Income − Expenses
            </small>
          </div>

        </div>

        <div className="insight-summary-card">

          <div className="summary-icon ai-summary-icon">
            <Sparkles size={21} />
          </div>

          <div>
            <span>Saving rate</span>

            <strong>
              {Math.max(
                0,
                savingRate
              ).toFixed(1)}
              %
            </strong>

            <small>
              Based on recorded income
            </small>
          </div>

        </div>

      </section>

      {!hasTransactions ? (
        /* =================================================
           EMPTY
        ================================================= */

        <section className="insights-empty">

          <div className="empty-chart-icon">
            <BarChart3 size={38} />
          </div>

          <h2>
            No spending data yet
          </h2>

          <p>
            Add transactions for{" "}
            {new Date(
              selectedYear,
              selectedMonth
            ).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            })}{" "}
            to generate your AI spending insights
            and graphs.
          </p>

        </section>
      ) : (
        <>
          {/* =================================================
              KEY INSIGHTS
          ================================================= */}

          <section className="insight-highlights">

            <div className="highlight-card">

              <div className="highlight-icon purple">
                <PieChart size={21} />
              </div>

              <div>
                <span>
                  TOP SPENDING CATEGORY
                </span>

                <h3>
                  {categoryData[0]?.category ||
                    "No data"}
                </h3>

                <p>
                  {categoryData[0]
                    ? `${(
                        (categoryData[0]
                          .amount /
                          totals.expense) *
                        100
                      ).toFixed(1)}% of your total spending.`
                    : "Add expenses to see your top category."}
                </p>
              </div>

            </div>

            <div className="highlight-card">

              <div className="highlight-icon green">
                <TrendingUp size={21} />
              </div>

              <div>
                <span>
                  SAVINGS RATE
                </span>

                <h3>
                  {Math.max(
                    0,
                    savingRate
                  ).toFixed(1)}
                  %
                </h3>

                <p>
                  {totals.income > 0
                    ? `You are saving approximately ${Math.max(
                        0,
                        savingRate
                      ).toFixed(
                        1
                      )}% of your recorded income.`
                    : "Add income to calculate your savings rate."}
                </p>
              </div>

            </div>

            <div className="highlight-card">

              <div className="highlight-icon orange">
                <Activity size={21} />
              </div>

              <div>
                <span>
                  HIGHEST SPENDING DAY
                </span>

                <h3>
                  {highestSpendingDay.amount >
                  0
                    ? `Day ${highestSpendingDay.day}`
                    : "No data"}
                </h3>

                <p>
                  {highestSpendingDay.amount >
                  0
                    ? `Your highest spending was ${formatCurrency(
                        highestSpendingDay.amount
                      )}.`
                    : "No daily spending recorded."}
                </p>
              </div>

            </div>

          </section>

          {/* =================================================
              CATEGORY + INCOME EXPENSE
          ================================================= */}

          <section className="chart-grid">

            {/* CATEGORY BAR GRAPH */}

            <div className="insight-card">

              <div className="chart-header">

                <div>
                  <span className="insight-section-label">
                    SPENDING BREAKDOWN
                  </span>

                  <h2>
                    Expenses by category
                  </h2>

                  <p>
                    Where your money is going
                  </p>
                </div>

                <div className="chart-header-icon">
                  <PieChart size={21} />
                </div>

              </div>

              {categoryData.length === 0 ? (
                <div className="chart-empty">
                  No expense data available.
                </div>
              ) : (
                <div className="category-chart">

                  {categoryData.map(
                    (
                      item,
                      index
                    ) => {
                      const percentage =
                        totals.expense >
                        0
                          ? (item.amount /
                              totals.expense) *
                            100
                          : 0;

                      return (
                        <div
                          className="category-row"
                          key={
                            item.category
                          }
                        >

                          <div className="category-row-top">

                            <div className="category-name">

                              <span
                                className={`category-dot ${getCategoryColorClass(
                                  index
                                )}`}
                              />

                              <strong>
                                {
                                  item.category
                                }
                              </strong>

                            </div>

                            <div className="category-values">

                              <strong>
                                {formatCurrency(
                                  item.amount
                                )}
                              </strong>

                              <span>
                                {percentage.toFixed(
                                  1
                                )}
                                %
                              </span>

                            </div>

                          </div>

                          <div className="category-bar-track">

                            <div
                              className={`category-bar-fill ${getCategoryColorClass(
                                index
                              )}`}
                              style={{
                                width: `${Math.max(
                                  2,
                                  (item.amount /
                                    maxCategoryAmount) *
                                    100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* INCOME VS EXPENSE */}

            <div className="insight-card">

              <div className="chart-header">

                <div>
                  <span className="insight-section-label">
                    CASH FLOW
                  </span>

                  <h2>
                    Income vs expenses
                  </h2>

                  <p>
                    Compare your money coming in
                    and going out
                  </p>
                </div>

                <div className="chart-header-icon">
                  <TrendingUp size={21} />
                </div>

              </div>

              <div className="cash-flow-chart">

                <div className="cash-flow-total">

                  <span>
                    Net balance
                  </span>

                  <strong>
                    {formatCurrency(
                      totals.balance
                    )}
                  </strong>

                </div>

                <div className="comparison-bars">

                  <div className="comparison-item">

                    <div className="comparison-label">
                      <span>
                        Income
                      </span>

                      <strong>
                        {formatCurrency(
                          totals.income
                        )}
                      </strong>
                    </div>

                    <div className="comparison-track">

                      <div
                        className="comparison-fill income-fill"
                        style={{
                          width: `${incomeBar}%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="comparison-item">

                    <div className="comparison-label">
                      <span>
                        Expenses
                      </span>

                      <strong>
                        {formatCurrency(
                          totals.expense
                        )}
                      </strong>
                    </div>

                    <div className="comparison-track">

                      <div
                        className="comparison-fill expense-fill"
                        style={{
                          width: `${expenseBar}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

                <div className="cash-flow-legend">

                  <div>
                    <span className="legend-dot income-dot" />
                    Income
                  </div>

                  <div>
                    <span className="legend-dot expense-dot" />
                    Expenses
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              DAILY EXPENSE GRAPH
          ================================================= */}

          <section className="insight-card daily-chart-card">

            <div className="chart-header">

              <div>
                <span className="insight-section-label">
                  SPENDING ACTIVITY
                </span>

                <h2>
                  Daily expense pattern
                </h2>

                <p>
                  Track how your spending changed
                  throughout the month
                </p>
              </div>

              <div className="chart-header-icon">
                <BarChart3 size={21} />
              </div>

            </div>

            <div className="daily-chart-wrapper">

              <div className="y-axis">

                <span>
                  {formatShortCurrency(
                    maxDailyAmount
                  )}
                </span>

                <span>
                  {formatShortCurrency(
                    maxDailyAmount / 2
                  )}
                </span>

                <span>
                  ₹0
                </span>

              </div>

              <div className="daily-chart">

                <div className="grid-line line-top" />
                <div className="grid-line line-middle" />
                <div className="grid-line line-bottom" />

                <div className="bars">

                  {dailyData.map(
                    (item) => {
                      const height =
                        item.amount > 0
                          ? Math.max(
                              5,
                              (item.amount /
                                maxDailyAmount) *
                                100
                            )
                          : 0;

                      return (
                        <div
                          className="daily-bar-wrapper"
                          key={item.day}
                          title={`Day ${item.day}: ${formatCurrency(
                            item.amount
                          )}`}
                        >

                          <div
                            className={`daily-bar ${
                              item.amount ===
                              highestSpendingDay.amount &&
                              item.amount > 0
                                ? "highest-day"
                                : ""
                            }`}
                            style={{
                              height: `${height}%`,
                            }}
                          />

                          <span>
                            {item.day}
                          </span>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

            <div className="daily-chart-footer">

              <div>
                <strong>
                  {formatCurrency(
                    highestSpendingDay.amount
                  )}
                </strong>

                <span>
                  Highest single-day spending
                </span>
              </div>

              <div>
                <strong>
                  Day{" "}
                  {highestSpendingDay.day || "—"}
                </strong>

                <span>
                  Highest spending day
                </span>
              </div>

            </div>

          </section>

          {/* =================================================
              BUDGET ANALYSIS
          ================================================= */}

          <section className="chart-grid">

            <div className="insight-card budget-insight-card">

              <div className="chart-header">

                <div>
                  <span className="insight-section-label">
                    BUDGET ANALYSIS
                  </span>

                  <h2>
                    Monthly budget
                  </h2>

                  <p>
                    How much of your budget you
                    have used
                  </p>
                </div>

                <div className="chart-header-icon">
                  <Target size={21} />
                </div>

              </div>

              {budget > 0 ? (
                <div className="budget-visual">

                  <div
                    className="budget-circle"
                    style={{
                      "--budget-progress": `${Math.min(
                        budgetUsage,
                        100
                      ) * 3.6}deg`,
                    }}
                  >
                    <div className="budget-circle-inner">

                      <strong>
                        {Math.round(
                          budgetUsage
                        )}
                        %
                      </strong>

                      <span>
                        used
                      </span>

                    </div>
                  </div>

                  <div className="budget-details">

                    <div>
                      <span>
                        Budget
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
                          remainingBudget <
                          0
                            ? "negative-value"
                            : ""
                        }
                      >
                        {formatCurrency(
                          remainingBudget
                        )}
                      </strong>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="budget-not-set">

                  <Target size={35} />

                  <h3>
                    No budget set
                  </h3>

                  <p>
                    Set a monthly budget from
                    your dashboard to track your
                    spending progress.
                  </p>

                </div>
              )}

            </div>

            {/* AI STATUS */}

            <div className="insight-card ai-insight-card">

              <div className="chart-header">

                <div>
                  <span className="insight-section-label">
                    AI ANALYSIS
                  </span>

                  <h2>
                    SpendWise AI
                  </h2>

                  <p>
                    Automated analysis of your
                    transaction data
                  </p>
                </div>

                <div className="chart-header-icon ai-chart-icon">
                  <Sparkles size={21} />
                </div>

              </div>

              {aiLoading ? (
                <div className="ai-insight-loading">

                  <div className="ai-loader">
                    <Sparkles size={26} />
                  </div>

                  <h3>
                    Analyzing your spending...
                  </h3>

                  <p>
                    SpendWise AI is processing
                    your transactions.
                  </p>

                </div>
              ) : aiData ? (
                <div className="ai-insight-results">

                  <div className="ai-metric">

                    <span>
                      Transactions analyzed
                    </span>

                    <strong>
                      {aiData.transactionCount ??
                        selectedTransactions.length}
                    </strong>

                  </div>

                  <div className="ai-metric">

                    <span>
                      Average expense
                    </span>

                    <strong>
                      {formatCurrency(
                        aiData.averageExpense ??
                          0
                      )}
                    </strong>

                  </div>

                  <div className="ai-ready">

                    <Sparkles size={17} />

                    <span>
                      AI analysis ready
                    </span>

                  </div>

                </div>
              ) : (
                <div className="ai-not-ready">

                  <Sparkles size={34} />

                  <h3>
                    AI analysis available
                  </h3>

                  <p>
                    Add more transactions to
                    generate deeper spending
                    insights.
                  </p>

                </div>
              )}

            </div>

          </section>

          {/* =================================================
              FINAL MESSAGE
          ================================================= */}

          <section className="insights-footer-card">

            <div className="footer-sparkle">
              <Sparkles size={22} />
            </div>

            <div>
              <span>
                POWERED BY SPENDWISE AI
              </span>

              <h2>
                Keep tracking. Keep improving.
              </h2>

              <p>
                The more consistently you record
                your transactions, the better your
                spending patterns become.
              </p>
            </div>

          </section>
        </>
      )}

    </div>
  );
}

export default AllInsights;