import React, { useMemo } from "react";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

function AIInsights({
  transactions = [],
  budget = 10000,
  selectedYear,
  selectedMonth,
  analysisMode = "monthly",
}) {
  const analysis = useMemo(() => {
    const filteredTransactions = transactions.filter((transaction) => {
      const date = new Date(`${transaction.date}T00:00:00`);

      if (date.getFullYear() !== selectedYear) {
        return false;
      }

      if (analysisMode === "yearly") {
        return true;
      }

      return date.getMonth() === selectedMonth;
    });

    const expenses = filteredTransactions.filter(
      (transaction) => transaction.type === "expense"
    );

    const income = filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    const totalExpenses = expenses.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );

    const categoryTotals = {};

    expenses.forEach((transaction) => {
      const category = transaction.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(transaction.amount);
    });

    const categoryEntries = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    );

    const topCategory = categoryEntries.length
      ? categoryEntries[0]
      : ["None", 0];

    const secondCategory = categoryEntries.length > 1
      ? categoryEntries[1]
      : ["None", 0];

    const savings = income - totalExpenses;

    const budgetUsed =
      budget > 0 ? (totalExpenses / budget) * 100 : 0;

    let spendingLevel = "healthy";

    if (budgetUsed >= 100) {
      spendingLevel = "danger";
    } else if (budgetUsed >= 80) {
      spendingLevel = "warning";
    }

    return {
      filteredTransactions,
      expenses,
      income,
      totalExpenses,
      categoryTotals,
      categoryEntries,
      topCategory,
      secondCategory,
      savings,
      budgetUsed,
      spendingLevel,
    };
  }, [
    transactions,
    budget,
    selectedYear,
    selectedMonth,
    analysisMode,
  ]);

  const {
    filteredTransactions,
    expenses,
    income,
    totalExpenses,
    categoryEntries,
    topCategory,
    secondCategory,
    savings,
    budgetUsed,
    spendingLevel,
  } = analysis;

  const periodText =
    analysisMode === "yearly"
      ? `${selectedYear}`
      : `${new Date(
          selectedYear,
          selectedMonth,
          1
        ).toLocaleString("en-IN", {
          month: "long",
        })} ${selectedYear}`;

  const getMainInsight = () => {
    if (expenses.length === 0) {
      return {
        title: "Not enough spending data yet",
        text:
          "Add a few expenses to your SpendWise account and AI Insights will analyze your spending patterns.",
        icon: "📊",
        className: "neutral",
      };
    }

    if (budgetUsed >= 100) {
      return {
        title: "Your budget has been exceeded",
        text: `You have spent ${formatCurrency(
          totalExpenses
        )}, which is ${Math.round(
          budgetUsed
        )}% of your ${formatCurrency(
          budget
        )} budget.`,
        icon: "⚠️",
        className: "danger",
      };
    }

    if (budgetUsed >= 80) {
      return {
        title: "You're approaching your budget",
        text: `You've already used ${Math.round(
          budgetUsed
        )}% of your available budget. Consider reducing non-essential spending.`,
        icon: "⚡",
        className: "warning",
      };
    }

    return {
      title: `${topCategory[0]} is your top spending category`,
      text: `You spent ${formatCurrency(
        topCategory[1]
      )} on ${topCategory[0]}. This is currently your largest expense category.`,
      icon: "✨",
      className: "success",
    };
  };

  const getRecommendation = () => {
    if (expenses.length === 0) {
      return "Start adding your daily expenses. More transaction data will allow SpendWise to provide better financial recommendations.";
    }

    if (budgetUsed >= 100) {
      return `Your spending has crossed the budget. Try reducing ${topCategory[0]} expenses first because it is your largest spending category.`;
    }

    if (budgetUsed >= 80) {
      return `You are close to your budget limit. Keep an eye on ${topCategory[0]} spending and avoid unnecessary purchases for the rest of the period.`;
    }

    if (topCategory[1] > budget * 0.3) {
      return `${topCategory[0]} represents a large portion of your budget. Setting a smaller limit for this category could help you save more.`;
    }

    return "Your spending is currently within your budget. Continue tracking your expenses consistently to maintain healthy financial habits.";
  };

  const mainInsight = getMainInsight();

  return (
    <div className="ai-page">
      <div className="ai-hero">
        <div className="ai-hero-content">
          <div className="ai-badge">
            <span>✦</span>
            AI POWERED
          </div>

          <h1>AI Spending Insights</h1>

          <p>
            Understand your spending habits and get personalized
            recommendations based on your SpendWise transactions.
          </p>

          <div className="ai-period">
            Analyzing: <strong>{periodText}</strong>
          </div>
        </div>

        <div className="ai-hero-icon">
          <span>✦</span>
        </div>
      </div>

      <div className="ai-summary-grid">
        <div className="ai-summary-card">
          <span>Total Expenses</span>
          <strong>{formatCurrency(totalExpenses)}</strong>
          <small>Money spent</small>
        </div>

        <div className="ai-summary-card">
          <span>Total Income</span>
          <strong>{formatCurrency(income)}</strong>
          <small>Money received</small>
        </div>

        <div className="ai-summary-card">
          <span>Savings</span>
          <strong className={savings >= 0 ? "positive" : "negative"}>
            {formatCurrency(savings)}
          </strong>
          <small>Income minus expenses</small>
        </div>

        <div className="ai-summary-card">
          <span>Budget Used</span>
          <strong
            className={
              spendingLevel === "danger"
                ? "negative"
                : spendingLevel === "warning"
                ? "warning-text"
                : "positive"
            }
          >
            {Math.round(budgetUsed)}%
          </strong>
          <small>Of {formatCurrency(budget)}</small>
        </div>
      </div>

      <div className="ai-content-grid">
        <div className="ai-insight-card">
          <div className="ai-card-heading">
            <div className="ai-heading-icon">
              {mainInsight.icon}
            </div>

            <div>
              <span className="ai-label">AI ANALYSIS</span>
              <h2>{mainInsight.title}</h2>
            </div>
          </div>

          <div className={`ai-main-message ${mainInsight.className}`}>
            <p>{mainInsight.text}</p>
          </div>
        </div>

        <div className="ai-insight-card">
          <div className="ai-card-heading">
            <div className="ai-heading-icon">💡</div>

            <div>
              <span className="ai-label">SMART RECOMMENDATION</span>
              <h2>What you can improve</h2>
            </div>
          </div>

          <p className="ai-recommendation">
            {getRecommendation()}
          </p>
        </div>
      </div>

      <div className="ai-content-grid">
        <div className="ai-insight-card">
          <div className="ai-card-heading">
            <div className="ai-heading-icon">🏆</div>

            <div>
              <span className="ai-label">TOP CATEGORY</span>
              <h2>Where your money goes</h2>
            </div>
          </div>

          {categoryEntries.length === 0 ? (
            <div className="ai-empty">
              <span>📊</span>
              <p>No expense categories available yet.</p>
            </div>
          ) : (
            <div className="ai-category-list">
              {categoryEntries.slice(0, 5).map(
                ([category, amount], index) => {
                  const percentage =
                    totalExpenses > 0
                      ? (amount / totalExpenses) * 100
                      : 0;

                  return (
                    <div
                      className="ai-category-item"
                      key={category}
                    >
                      <div className="ai-category-top">
                        <div className="ai-category-name">
                          <span className="ai-rank">
                            {index + 1}
                          </span>

                          <strong>{category}</strong>
                        </div>

                        <div className="ai-category-value">
                          {formatCurrency(amount)}
                        </div>
                      </div>

                      <div className="ai-category-progress">
                        <div
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <small>
                        {Math.round(percentage)}% of total expenses
                      </small>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        <div className="ai-insight-card">
          <div className="ai-card-heading">
            <div className="ai-heading-icon">📈</div>

            <div>
              <span className="ai-label">SPENDING PATTERN</span>
              <h2>Financial overview</h2>
            </div>
          </div>

          <div className="ai-pattern-list">
            <div className="ai-pattern-row">
              <span>Largest category</span>
              <strong>
                {topCategory[0]}
              </strong>
            </div>

            <div className="ai-pattern-row">
              <span>Amount spent</span>
              <strong>
                {formatCurrency(topCategory[1])}
              </strong>
            </div>

            <div className="ai-pattern-row">
              <span>Second largest</span>
              <strong>
                {secondCategory[0]}
              </strong>
            </div>

            <div className="ai-pattern-row">
              <span>Total transactions</span>
              <strong>
                {filteredTransactions.length}
              </strong>
            </div>

            <div className="ai-pattern-row">
              <span>Budget remaining</span>
              <strong>
                {formatCurrency(
                  Math.max(budget - totalExpenses, 0)
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="ai-disclaimer">
        <span>✦</span>
        <div>
          <strong>SpendWise AI Insights</strong>
          <p>
            These insights are generated from your recorded
            transactions and are intended for personal budgeting
            guidance. They are not professional financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AIInsights;