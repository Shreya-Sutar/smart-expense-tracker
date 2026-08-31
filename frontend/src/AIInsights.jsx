import React, { useMemo } from "react";

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

function AIInsights({ transactions, budget }) {
  const insights = useMemo(() => {
    const expenses = transactions.filter(
      (transaction) => transaction.type === "expense"
    );

    const income = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const totalExpenses = expenses.reduce(
      (sum, transaction) => sum + Number(transaction.amount || 0),
      0
    );

    const categoryTotals = {};

    expenses.forEach((transaction) => {
      const category = transaction.category || "Other";

      categoryTotals[category] =
        (categoryTotals[category] || 0) +
        Number(transaction.amount || 0);
    });

    const sortedCategories = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    );

    const topCategory = sortedCategories[0];

    const budgetUsage =
      budget > 0 ? (totalExpenses / budget) * 100 : 0;

    const savings = income - totalExpenses;

    const generatedInsights = [];

    if (transactions.length === 0) {
      generatedInsights.push({
        type: "info",
        icon: "🤖",
        title: "Let's start tracking",
        text: "Add a few transactions and SpendWise will analyze your spending patterns.",
      });
    } else {
      if (budgetUsage >= 100) {
        generatedInsights.push({
          type: "danger",
          icon: "⚠️",
          title: "Budget exceeded",
          text: `You've spent ${formatCurrency(
            totalExpenses
          )}, which is above your ${formatCurrency(budget)} budget.`,
        });
      } else if (budgetUsage >= 80) {
        generatedInsights.push({
          type: "warning",
          icon: "⚠️",
          title: "Budget warning",
          text: `You've already used ${Math.round(
            budgetUsage
          )}% of your budget. Consider slowing down discretionary spending.`,
        });
      } else {
        generatedInsights.push({
          type: "success",
          icon: "✅",
          title: "Budget looks healthy",
          text: `You've used ${Math.round(
            budgetUsage
          )}% of your current budget.`,
        });
      }

      if (topCategory) {
        generatedInsights.push({
          type: "info",
          icon: "📊",
          title: "Highest spending category",
          text: `${topCategory[0]} is your largest expense category at ${formatCurrency(
            topCategory[1]
          )}.`,
        });
      }

      if (savings > 0) {
        generatedInsights.push({
          type: "success",
          icon: "💰",
          title: "Positive savings",
          text: `Based on the transactions you've entered, you're currently saving ${formatCurrency(
            savings
          )}.`,
        });
      } else if (income > 0 && savings < 0) {
        generatedInsights.push({
          type: "danger",
          icon: "📉",
          title: "Spending is above income",
          text: `Your recorded expenses are ${formatCurrency(
            Math.abs(savings)
          )} higher than your recorded income.`,
        });
      }

      if (expenses.length >= 3) {
        const averageExpense =
          totalExpenses / expenses.length;

        generatedInsights.push({
          type: "info",
          icon: "💡",
          title: "Average transaction",
          text: `Your average expense is approximately ${formatCurrency(
            averageExpense
          )}.`,
        });
      }
    }

    return {
      totalExpenses,
      income,
      savings,
      budgetUsage,
      topCategory,
      generatedInsights,
    };
  }, [transactions, budget]);

  return (
    <div className="ai-page">
      <div className="ai-hero">
        <div className="ai-hero-icon">🤖</div>

        <div>
          <span className="eyebrow">SMART FINANCE</span>

          <h1>AI Insights</h1>

          <p>
            Understand your spending habits with
            intelligent financial insights.
          </p>
        </div>
      </div>

      <div className="ai-summary-grid">
        <div className="ai-summary-card">
          <span>Total Income</span>
          <strong>
            {formatCurrency(insights.income)}
          </strong>
        </div>

        <div className="ai-summary-card">
          <span>Total Expenses</span>
          <strong>
            {formatCurrency(insights.totalExpenses)}
          </strong>
        </div>

        <div className="ai-summary-card">
          <span>Savings</span>
          <strong
            className={
              insights.savings >= 0
                ? "positive"
                : "negative"
            }
          >
            {formatCurrency(insights.savings)}
          </strong>
        </div>

        <div className="ai-summary-card">
          <span>Budget Used</span>
          <strong>
            {Math.round(insights.budgetUsage)}%
          </strong>
        </div>
      </div>

      <div className="ai-section">
        <div className="section-heading">
          <div>
            <span className="panel-label">
              AI ANALYSIS
            </span>

            <h2>Your Financial Insights</h2>

            <p>
              Personalized observations based on your
              recorded transactions.
            </p>
          </div>
        </div>

        <div className="ai-insight-list">
          {insights.generatedInsights.map(
            (insight, index) => (
              <div
                className={`ai-insight-card ${insight.type}`}
                key={`${insight.title}-${index}`}
              >
                <div className="ai-insight-icon">
                  {insight.icon}
                </div>

                <div>
                  <h3>{insight.title}</h3>

                  <p>{insight.text}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {insights.topCategory && (
        <div className="ai-recommendation">
          <div className="recommendation-icon">
            🎯
          </div>

          <div>
            <span>SMART RECOMMENDATION</span>

            <h2>
              Keep an eye on{" "}
              {insights.topCategory[0]}
            </h2>

            <p>
              This category currently represents your
              largest recorded expense. Reviewing these
              purchases could help you save more.
            </p>
          </div>
        </div>
      )}

      <div className="ai-disclaimer">
        <span>✨</span>

        <p>
          These insights are generated from the
          transactions entered in SpendWise. They are
          financial observations, not professional
          financial advice.
        </p>
      </div>
    </div>
  );
}

export default AIInsights;