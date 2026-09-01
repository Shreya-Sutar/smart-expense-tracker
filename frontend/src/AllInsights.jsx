import { useMemo } from "react";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return `₹${amount.toLocaleString("en-IN")}`;
};

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

function AllInsights({
  transactions = [],
  selectedMonth,
  selectedYear,
  budget = 0,
}) {
  /* =====================================================
     FILTER CURRENT MONTH
     ===================================================== */

  const selectedTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction?.date) {
        return false;
      }

      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return (
        date.getMonth() === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  }, [transactions, selectedMonth, selectedYear]);

  /* =====================================================
     CALCULATE TOTALS
     ===================================================== */

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

  /* =====================================================
     CATEGORY ANALYSIS
     ===================================================== */

  const categoryData = useMemo(() => {
    const categoryTotals = {};

    selectedTransactions.forEach((transaction) => {
      if (transaction?.type !== "expense") {
        return;
      }

      const category =
        transaction?.category || "Other";

      const amount =
        Number(transaction?.amount) || 0;

      categoryTotals[category] =
        (categoryTotals[category] || 0) + amount;
    });

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totals.expense > 0
            ? (amount / totals.expense) * 100
            : 0,
      }));
  }, [selectedTransactions, totals.expense]);

  /* =====================================================
     TOP CATEGORY
     ===================================================== */

  const topCategory =
    categoryData.length > 0
      ? categoryData[0]
      : null;

  /* =====================================================
     BUDGET
     ===================================================== */

  const budgetUsage =
    budget > 0
      ? Math.min(
          (totals.expense / budget) * 100,
          100
        )
      : 0;

  const remainingBudget =
    budget - totals.expense;

  /* =====================================================
     AVERAGE EXPENSE
     ===================================================== */

  const expenseTransactions =
    selectedTransactions.filter(
      (transaction) =>
        transaction?.type !== "income"
    );

  const averageExpense =
    expenseTransactions.length > 0
      ? totals.expense /
        expenseTransactions.length
      : 0;

  /* =====================================================
     INSIGHT MESSAGE
     ===================================================== */

  let insightMessage =
    "Start adding transactions to receive personalized spending insights.";

  if (totals.expense > 0 && topCategory) {
    if (
      budget > 0 &&
      totals.expense > budget
    ) {
      insightMessage = `Your spending has exceeded your ${months[selectedMonth]} budget. Consider reviewing your ${topCategory.category} expenses.`;
    } else if (
      budget > 0 &&
      budgetUsage >= 80
    ) {
      insightMessage = `You have used ${Math.round(
        budgetUsage
      )}% of your monthly budget. Keep an eye on your ${topCategory.category} spending.`;
    } else {
      insightMessage = `Your highest spending category is ${topCategory.category}. You're currently using ${Math.round(
        budgetUsage
      )}% of your monthly budget.`;
    }
  }

  /* =====================================================
     EMPTY STATE
     ===================================================== */

  if (selectedTransactions.length === 0) {
    return (
      <div className="insights-page">

        <section className="insights-hero">
          <div className="insights-hero-content">
            <div className="insights-icon-large">
              <Sparkles size={24} />
            </div>

            <div>
              <span className="insights-eyebrow">
                SMART ANALYSIS
              </span>

              <h1>
                Your Financial Insights
              </h1>

              <p>
                Understand your spending patterns,
                track your progress and make smarter
                financial decisions.
              </p>
            </div>
          </div>

          <div className="insights-period">
            {months[selectedMonth]}{" "}
            {selectedYear}
          </div>
        </section>

        <section className="insights-empty-card">
          <div className="insights-empty-icon">
            <BarChart3 size={30} />
          </div>

          <h2>
            No insights available yet
          </h2>

          <p>
            Add some transactions for{" "}
            {months[selectedMonth]}{" "}
            {selectedYear} to see your spending
            analysis.
          </p>
        </section>
      </div>
    );
  }

  /* =====================================================
     MAIN INSIGHTS UI
     ===================================================== */

  return (
    <div className="insights-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="insights-hero">
        <div className="insights-hero-content">

          <div className="insights-icon-large">
            <Sparkles size={24} />
          </div>

          <div>
            <span className="insights-eyebrow">
              SMART ANALYSIS
            </span>

            <h1>
              Your Financial Insights
            </h1>

            <p>
              Here's what your spending looks like
              for {months[selectedMonth]}{" "}
              {selectedYear}.
            </p>
          </div>

        </div>

        <div className="insights-period">
          {months[selectedMonth]}{" "}
          {selectedYear}
        </div>
      </section>

      {/* =================================================
          INSIGHT MESSAGE
      ================================================= */}

      <section className="smart-insight-card">

        <div className="smart-insight-icon">
          <Sparkles size={19} />
        </div>

        <div>
          <span>
            SMART INSIGHT
          </span>

          <p>
            {insightMessage}
          </p>
        </div>

      </section>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="insights-summary-grid">

        <div className="insight-stat-card">

          <div className="insight-stat-icon income">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Total Income</span>

            <strong>
              {formatCurrency(
                totals.income
              )}
            </strong>

            <small>
              {months[selectedMonth]}
            </small>
          </div>

        </div>

        <div className="insight-stat-card">

          <div className="insight-stat-icon expense">
            <TrendingDown size={20} />
          </div>

          <div>
            <span>Total Expenses</span>

            <strong>
              {formatCurrency(
                totals.expense
              )}
            </strong>

            <small>
              {expenseTransactions.length} expense
              {expenseTransactions.length === 1
                ? ""
                : "s"}
            </small>
          </div>

        </div>

        <div className="insight-stat-card">

          <div className="insight-stat-icon balance">
            <Wallet size={20} />
          </div>

          <div>
            <span>Balance</span>

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

          <div className="insight-stat-icon average">
            <BarChart3 size={20} />
          </div>

          <div>
            <span>Average Expense</span>

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

      {/* =================================================
          ANALYSIS GRID
      ================================================= */}

      <section className="insights-analysis-grid">

        {/* ===============================================
            CATEGORY BREAKDOWN
        =============================================== */}

        <div className="insights-card">

          <div className="insights-card-header">

            <div>
              <span className="insights-section-label">
                SPENDING BREAKDOWN
              </span>

              <h2>
                Expenses by Category
              </h2>
            </div>

            <div className="insights-card-header-icon">
              <PieChart size={18} />
            </div>

          </div>

          <div className="category-list">

            {categoryData.map(
              (item, index) => (
                <div
                  className="category-row"
                  key={item.category}
                >

                  <div className="category-row-top">

                    <div className="category-name">
                      <span className="category-number">
                        {index + 1}
                      </span>

                      <strong>
                        {item.category}
                      </strong>
                    </div>

                    <div className="category-value">
                      {formatCurrency(
                        item.amount
                      )}
                    </div>

                  </div>

                  <div className="category-progress">
                    <div
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>

                  <div className="category-percentage">
                    {item.percentage.toFixed(1)}%
                    of total expenses
                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* ===============================================
            BUDGET
        =============================================== */}

        <div className="insights-card">

          <div className="insights-card-header">

            <div>
              <span className="insights-section-label">
                BUDGET ANALYSIS
              </span>

              <h2>
                Monthly Budget
              </h2>
            </div>

            <div className="insights-card-header-icon">
              <Target size={18} />
            </div>

          </div>

          <div className="budget-insight-main">

            <div
                className="budget-circle"
                style={{
                  "--progress": budgetUsage * 3.6,
                }}
              >

              <div>
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

            <div className="budget-insight-details">

              <div>
                <span>Budget</span>

                <strong>
                  {formatCurrency(
                    budget
                  )}
                </strong>
              </div>

              <div>
                <span>Spent</span>

                <strong className="expense-color">
                  {formatCurrency(
                    totals.expense
                  )}
                </strong>
              </div>

              <div>
                <span>Remaining</span>

                <strong
                  className={
                    remainingBudget >= 0
                      ? "income-color"
                      : "expense-color"
                  }
                >
                  {formatCurrency(
                    remainingBudget
                  )}
                </strong>
              </div>

            </div>

          </div>

          {budget <= 0 ? (
            <div className="budget-warning neutral">
              <Target size={16} />

              <span>
                No monthly budget has been set.
              </span>
            </div>
          ) : remainingBudget < 0 ? (
            <div className="budget-warning danger">
              <ArrowDownRight size={16} />

              <span>
                You are{" "}
                {formatCurrency(
                  Math.abs(
                    remainingBudget
                  )
                )}{" "}
                over your budget.
              </span>
            </div>
          ) : budgetUsage >= 80 ? (
            <div className="budget-warning warning">
              <TrendingUp size={16} />

              <span>
                You've used most of your monthly
                budget.
              </span>
            </div>
          ) : (
            <div className="budget-warning success">
              <ArrowUpRight size={16} />

              <span>
                You're currently within your budget.
              </span>
            </div>
          )}

        </div>

      </section>

      {/* =================================================
          QUICK TAKEAWAYS
      ================================================= */}

      <section className="insights-card takeaways-card">

        <div className="insights-card-header">

          <div>
            <span className="insights-section-label">
              QUICK TAKEAWAYS
            </span>

            <h2>
              What your numbers say
            </h2>
          </div>

          <div className="insights-card-header-icon">
            <BarChart3 size={18} />
          </div>

        </div>

        <div className="takeaways-grid">

          <div className="takeaway">

            <div className="takeaway-icon">
              <TrendingDown size={17} />
            </div>

            <div>
              <strong>
                Top spending category
              </strong>

              <p>
                {topCategory
                  ? `${topCategory.category} accounts for ${topCategory.percentage.toFixed(
                      1
                    )}% of your expenses.`
                  : "No category data available."}
              </p>
            </div>

          </div>

          <div className="takeaway">

            <div className="takeaway-icon">
              <BarChart3 size={17} />
            </div>

            <div>
              <strong>
                Average transaction
              </strong>

              <p>
                Your average expense is{" "}
                {formatCurrency(
                  averageExpense
                )}.
              </p>
            </div>

          </div>

          <div className="takeaway">

            <div className="takeaway-icon">
              <Wallet size={17} />
            </div>

            <div>
              <strong>
                Financial position
              </strong>

              <p>
                {totals.balance >= 0
                  ? `You have a positive balance of ${formatCurrency(
                      totals.balance
                    )}.`
                  : `Your expenses exceed your income by ${formatCurrency(
                      Math.abs(
                        totals.balance
                      )
                    )}.`}
              </p>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AllInsights;