import { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  AlertTriangle,
  Sparkles,
  Brain,
  Lightbulb,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  CircleDollarSign,
} from "lucide-react";

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

function AllInsights({
  transactions = [],
  selectedMonth,
  selectedYear,
  budget = 0,
}) {
  /*
   * =====================================================
   * SELECTED MONTH DATA
   * =====================================================
   */

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.date) return false;

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

  /*
   * =====================================================
   * TOTALS
   * =====================================================
   */

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    monthlyTransactions.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;

      if (transaction.type === "income") {
        income += amount;
      } else if (transaction.type === "expense") {
        expense += amount;
      }
    });

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [monthlyTransactions]);

  /*
   * =====================================================
   * CATEGORY DATA
   * =====================================================
   */

  const categoryData = useMemo(() => {
    const result = {};

    categories.forEach((category) => {
      result[category] = 0;
    });

    monthlyTransactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;

      const category = transaction.category || "Other";

      if (!Object.prototype.hasOwnProperty.call(result, category)) {
        result[category] = 0;
      }

      result[category] += Number(transaction.amount) || 0;
    });

    return Object.entries(result)
      .filter(([, amount]) => amount > 0)
      .map(([name, value]) => ({
        name,
        value,
      }));
  }, [monthlyTransactions]);

  /*
   * =====================================================
   * DAILY EXPENSE DATA
   * =====================================================
   */

  const dailyExpenseData = useMemo(() => {
    const result = {};

    monthlyTransactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;
      if (!transaction.date) return;

      const date = new Date(transaction.date);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const day = date.getDate();

      if (!result[day]) {
        result[day] = 0;
      }

      result[day] += Number(transaction.amount) || 0;
    });

    return Object.entries(result)
      .map(([day, amount]) => ({
        day: `Day ${day}`,
        amount,
        dayNumber: Number(day),
      }))
      .sort((a, b) => a.dayNumber - b.dayNumber);
  }, [monthlyTransactions]);

  /*
   * =====================================================
   * INCOME VS EXPENSE
   * =====================================================
   */

  const incomeExpenseData = useMemo(() => {
    return [
      {
        name: "Income",
        amount: totals.income,
      },
      {
        name: "Expenses",
        amount: totals.expense,
      },
    ];
  }, [totals]);

  /*
   * =====================================================
   * BUDGET
   * =====================================================
   */

  const budgetPercentage =
    budget > 0
      ? Math.min((totals.expense / budget) * 100, 100)
      : 0;

  const remaining = budget - totals.expense;

  /*
   * =====================================================
   * FORMAT MONEY
   * =====================================================
   */

  const money = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  /*
   * =====================================================
   * TOP CATEGORY
   * =====================================================
   */

  const topCategory = useMemo(() => {
    if (categoryData.length === 0) {
      return null;
    }

    return categoryData.reduce((max, item) =>
      item.value > max.value ? item : max
    );
  }, [categoryData]);

  /*
   * =====================================================
   * AVERAGE EXPENSE
   * =====================================================
   */

  const averageExpense = useMemo(() => {
    const expenseTransactions = monthlyTransactions.filter(
      (transaction) => transaction.type === "expense"
    );

    if (expenseTransactions.length === 0) {
      return 0;
    }

    return totals.expense / expenseTransactions.length;
  }, [monthlyTransactions, totals.expense]);

  /*
   * =====================================================
   * AI INSIGHTS
   * =====================================================
   */

  const aiInsights = useMemo(() => {
    const insights = [];

    /*
     * No expenses
     */

    if (totals.expense === 0) {
      insights.push({
        icon: Sparkles,
        type: "neutral",
        title: "Start tracking your spending",
        text:
          "Add a few expense transactions to unlock personalized AI spending insights.",
      });

      return insights;
    }

    /*
     * Top category insight
     */

    if (topCategory) {
      const percentage =
        totals.expense > 0
          ? (topCategory.value / totals.expense) * 100
          : 0;

      insights.push({
        icon: TrendingDown,
        type: "warning",
        title: `${topCategory.name} is your biggest expense`,
        text:
          `${topCategory.name} accounts for approximately ` +
          `${Math.round(percentage)}% of your total spending this month.`,
      });
    }

    /*
     * Budget insight
     */

    if (budget > 0) {
      if (totals.expense > budget) {
        insights.push({
          icon: AlertTriangle,
          type: "danger",
          title: "You're over your budget",
          text:
            `Your spending is ${money(
              totals.expense - budget
            )} above your monthly budget. Consider reducing non-essential spending.`,
        });
      } else if (budgetPercentage >= 80) {
        insights.push({
          icon: AlertTriangle,
          type: "warning",
          title: "Budget usage is getting high",
          text:
            `You've used ${Math.round(
              budgetPercentage
            )}% of your monthly budget. Keep an eye on upcoming expenses.`,
        });
      } else {
        insights.push({
          icon: ShieldCheck,
          type: "positive",
          title: "You're within your budget",
          text:
            `You still have ${money(
              remaining
            )} available for the rest of the month.`,
        });
      }
    }

    /*
     * Balance insight
     */

    if (totals.balance > 0) {
      insights.push({
        icon: TrendingUp,
        type: "positive",
        title: "Positive monthly balance",
        text:
          "Your income is currently higher than your expenses for this month.",
      });
    } else if (totals.balance < 0) {
      insights.push({
        icon: TrendingDown,
        type: "danger",
        title: "Expenses are higher than income",
        text:
          "Your current spending is greater than your recorded income this month.",
      });
    }

    /*
     * Average expense insight
     */

    if (averageExpense > 0) {
      insights.push({
        icon: CircleDollarSign,
        type: "neutral",
        title: "Average transaction size",
        text:
          `Your average expense is around ${money(
            averageExpense
          )} per transaction.`,
      });
    }

    return insights.slice(0, 4);
  }, [
    totals,
    topCategory,
    budget,
    budgetPercentage,
    remaining,
    averageExpense,
  ]);

  /*
   * =====================================================
   * TOOLTIP
   * =====================================================
   */

  const CustomTooltip = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div className="chart-tooltip">
        {label && <strong>{label}</strong>}

        {payload.map((item, index) => (
          <div key={index}>
            {item.name || "Amount"}: {money(item.value)}
          </div>
        ))}
      </div>
    );
  };

  /*
   * =====================================================
   * EMPTY STATE
   * =====================================================
   */

  if (monthlyTransactions.length === 0) {
    return (
      <div className="insights-page">

        {/* PAGE HEADER */}

        <section className="insights-heading">
          <div>
            <span className="section-label">
              FINANCIAL ANALYTICS
            </span>

            <h1>Insights & Analytics</h1>

            <p>
              Understand your spending patterns and
              financial habits.
            </p>
          </div>
        </section>

        {/* AI EMPTY STATE */}

        <section className="ai-insights-card">

          <div className="ai-insights-header">

            <div className="ai-title-area">

              <div className="ai-icon">
                <Sparkles size={22} />
              </div>

              <div>
                <span className="section-label">
                  AI POWERED
                </span>

                <h2>
                  Smart Financial Insights
                </h2>

                <p>
                  Personalized recommendations based
                  on your spending activity.
                </p>
              </div>

            </div>

            <div className="ai-status">
              <span className="ai-status-dot" />
              AI Ready
            </div>

          </div>

          <div className="ai-empty-content">

            <div className="ai-empty-icon">
              <Brain size={38} />
            </div>

            <h3>
              Your AI insights are waiting
            </h3>

            <p>
              Add transactions for{" "}
              <strong>
                {months[selectedMonth]} {selectedYear}
              </strong>{" "}
              and SpendWise will analyze your
              spending patterns, budget usage and
              financial behavior.
            </p>

          </div>

        </section>

        {/* NORMAL EMPTY STATE */}

        <div className="insights-empty">

          <div className="insights-empty-icon">
            <TrendingUp size={34} />
          </div>

          <h2>No data for this month</h2>

          <p>
            Add some transactions for{" "}
            <strong>
              {months[selectedMonth]} {selectedYear}
            </strong>{" "}
            to see your charts and spending insights.
          </p>

        </div>

      </div>
    );
  }

  /*
   * =====================================================
   * MAIN UI
   * =====================================================
   */

  return (
    <div className="insights-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="insights-heading">

        <div>

          <span className="section-label">
            FINANCIAL ANALYTICS
          </span>

          <h1>
            Insights & Analytics
          </h1>

          <p>
            Understand your spending patterns,
            income and budget performance.
          </p>

        </div>

      </section>

      {/* =================================================
          AI INSIGHTS
      ================================================= */}

      <section className="ai-insights-card">

        <div className="ai-insights-header">

          <div className="ai-title-area">

            <div className="ai-icon">
              <Sparkles size={22} />
            </div>

            <div>

              <span className="section-label">
                AI POWERED
              </span>

              <h2>
                Smart Financial Insights
              </h2>

              <p>
                Intelligent analysis of your{" "}
                {months[selectedMonth]} spending.
              </p>

            </div>

          </div>

          <div className="ai-status">
            <span className="ai-status-dot" />
            AI Ready
          </div>

        </div>

        <div className="ai-insights-grid">

          {aiInsights.map((insight, index) => {

            const Icon = insight.icon;

            return (
              <div
                className={`ai-insight-item ${insight.type}`}
                key={index}
              >

                <div className="ai-insight-icon">
                  <Icon size={19} />
                </div>

                <div className="ai-insight-content">

                  <h4>
                    {insight.title}
                  </h4>

                  <p>
                    {insight.text}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

        <div className="ai-footer">

          <div>
            <Brain size={17} />

            <span>
              SpendWise AI is analyzing your
              financial patterns
            </span>
          </div>

          <span className="ai-footer-badge">
            Smart Analysis
          </span>

        </div>

      </section>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section className="insight-stats">

        {/* INCOME */}

        <div className="insight-stat-card">

          <div className="insight-stat-icon income">
            <TrendingUp size={21} />
          </div>

          <div>

            <span>
              Total Income
            </span>

            <strong>
              {money(totals.income)}
            </strong>

            <small>
              {months[selectedMonth]}
            </small>

          </div>

        </div>

        {/* EXPENSE */}

        <div className="insight-stat-card">

          <div className="insight-stat-icon expense">
            <TrendingDown size={21} />
          </div>

          <div>

            <span>
              Total Expenses
            </span>

            <strong>
              {money(totals.expense)}
            </strong>

            <small>
              {months[selectedMonth]}
            </small>

          </div>

        </div>

        {/* BALANCE */}

        <div className="insight-stat-card">

          <div className="insight-stat-icon balance">
            <Wallet size={21} />
          </div>

          <div>

            <span>
              Balance
            </span>

            <strong>
              {money(totals.balance)}
            </strong>

            <small>
              Income − Expenses
            </small>

          </div>

        </div>

        {/* BUDGET */}

        <div className="insight-stat-card">

          <div className="insight-stat-icon budget">
            <Target size={21} />
          </div>

          <div>

            <span>
              Budget Usage
            </span>

            <strong>
              {Math.round(budgetPercentage)}%
            </strong>

            <small>
              {budget > 0
                ? `${money(remaining)} remaining`
                : "No budget set"}
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          QUICK AI METRICS
      ================================================= */}

      <section className="ai-quick-grid">

        {/* TOP CATEGORY */}

        <div className="ai-quick-card">

          <div className="ai-quick-icon">
            <TrendingDown size={19} />
          </div>

          <div>

            <span>
              Top Category
            </span>

            <strong>
              {topCategory
                ? topCategory.name
                : "No data"}
            </strong>

            <small>
              {topCategory
                ? money(topCategory.value)
                : "—"}
            </small>

          </div>

        </div>

        {/* AVERAGE EXPENSE */}

        <div className="ai-quick-card">

          <div className="ai-quick-icon">
            <CircleDollarSign size={19} />
          </div>

          <div>

            <span>
              Average Expense
            </span>

            <strong>
              {money(averageExpense)}
            </strong>

            <small>
              Per transaction
            </small>

          </div>

        </div>

        {/* BUDGET STATUS */}

        <div className="ai-quick-card">

          <div className="ai-quick-icon">
            <Target size={19} />
          </div>

          <div>

            <span>
              Budget Status
            </span>

            <strong>
              {budget === 0
                ? "Not Set"
                : totals.expense > budget
                ? "Exceeded"
                : "On Track"}
            </strong>

            <small>
              {budget > 0
                ? `${Math.round(
                    budgetPercentage
                  )}% used`
                : "Set a monthly budget"}
            </small>

          </div>

        </div>

        {/* FINANCIAL HEALTH */}

        <div className="ai-quick-card">

          <div className="ai-quick-icon">
            <ShieldCheck size={19} />
          </div>

          <div>

            <span>
              Financial Health
            </span>

            <strong>
              {totals.balance > 0
                ? "Positive"
                : totals.balance < 0
                ? "Needs Attention"
                : "Balanced"}
            </strong>

            <small>
              Based on this month
            </small>

          </div>

        </div>

      </section>

      {/* =================================================
          CHART ROW
      ================================================= */}

      <section className="insights-chart-grid">

        {/* =================================================
            PIE CHART
        ================================================= */}

        <div className="insight-chart-card">

          <div className="insight-chart-header">

            <div>

              <span className="section-label">
                EXPENSE BREAKDOWN
              </span>

              <h3>
                Spending by Category
              </h3>

              <p>
                Where your money is going
              </p>

            </div>

          </div>

          <div className="chart-container">

            {categoryData.length === 0 ? (

              <div className="chart-no-data">
                No expense data available.
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
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >

                    {categoryData.map(
                      (_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${
                            (index * 42) % 360
                          }, 70%, 55%)`}
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={45}
                  />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* =================================================
            BAR CHART
        ================================================= */}

        <div className="insight-chart-card">

          <div className="insight-chart-header">

            <div>

              <span className="section-label">
                INCOME VS EXPENSE
              </span>

              <h3>
                Money Flow
              </h3>

              <p>
                Compare your income and spending
              </p>

            </div>

          </div>

          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={incomeExpenseData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                />

                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

                <Bar
                  dataKey="amount"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                  fill="#6366f1"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </section>

      {/* =================================================
          DAILY EXPENSE CHART
      ================================================= */}

      <section className="insight-chart-card full-chart">

        <div className="insight-chart-header">

          <div>

            <span className="section-label">
              DAILY SPENDING
            </span>

            <h3>
              Expense Trend
            </h3>

            <p>
              How your spending changed
              throughout{" "}
              {months[selectedMonth]}
            </p>

          </div>

        </div>

        <div className="chart-container large">

          {dailyExpenseData.length === 0 ? (

            <div className="chart-no-data">
              No expense data available.
            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={dailyExpenseData}
                margin={{
                  top: 20,
                  right: 25,
                  left: 10,
                  bottom: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="day"
                  interval="preserveStartEnd"
                />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                />

                <Tooltip
                  content={
                    <CustomTooltip />
                  }
                />

                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Expense"
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

      </section>

      {/* =================================================
          BOTTOM ANALYSIS
      ================================================= */}

      <section className="insight-bottom-grid">

        {/* =================================================
            BUDGET ANALYSIS
        ================================================= */}

        <div className="insight-chart-card">

          <div className="insight-chart-header">

            <div>

              <span className="section-label">
                BUDGET ANALYSIS
              </span>

              <h3>
                Monthly Budget
              </h3>

              <p>
                Your spending against your budget
              </p>

            </div>

          </div>

          <div className="budget-insight-content">

            <div
              className="budget-circle"
              style={{
                "--budget-progress":
                  budgetPercentage,
              }}
            >

              <div>

                <strong>
                  {Math.round(
                    budgetPercentage
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

                <span>
                  Budget
                </span>

                <strong>
                  {money(budget)}
                </strong>

              </div>

              <div>

                <span>
                  Spent
                </span>

                <strong>
                  {money(totals.expense)}
                </strong>

              </div>

              <div>

                <span>
                  Remaining
                </span>

                <strong
                  className={
                    remaining < 0
                      ? "negative"
                      : ""
                  }
                >
                  {money(remaining)}
                </strong>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            TOP CATEGORY
        ================================================= */}

        <div className="insight-chart-card">

          <div className="insight-chart-header">

            <div>

              <span className="section-label">
                SPENDING INSIGHT
              </span>

              <h3>
                Top Spending Category
              </h3>

              <p>
                Your biggest expense area
              </p>

            </div>

          </div>

          {categoryData.length > 0 && topCategory ? (

            <div className="top-category">

              <div className="top-category-icon">
                <TrendingDown size={28} />
              </div>

              <div>

                <span>
                  Highest spending
                </span>

                <strong>
                  {topCategory.name}
                </strong>

                <p>
                  {money(topCategory.value)}
                </p>

              </div>

            </div>

          ) : (

            <div className="chart-no-data">
              No category data.
            </div>

          )}

          {budget > 0 &&
            totals.expense > budget && (

              <div className="budget-warning">

                <AlertTriangle size={18} />

                <div>

                  <strong>
                    Budget exceeded
                  </strong>

                  <span>
                    You have spent{" "}
                    {money(
                      totals.expense - budget
                    )}{" "}
                    over your budget.
                  </span>

                </div>

              </div>

            )}

        </div>

      </section>

      {/* =================================================
          AI RECOMMENDATIONS
      ================================================= */}

      <section className="ai-recommendations-card">

        <div className="ai-recommendations-header">

          <div className="ai-recommendation-title">

            <div className="recommendation-icon">
              <Lightbulb size={21} />
            </div>

            <div>

              <span className="section-label">
                SMART RECOMMENDATIONS
              </span>

              <h3>
                What SpendWise recommends
              </h3>

              <p>
                Simple actions based on your
                current financial activity.
              </p>

            </div>

          </div>

        </div>

        <div className="recommendation-list">

          {/* RECOMMENDATION 1 */}

          {topCategory && (

            <div className="recommendation-item">

              <div className="recommendation-number">
                01
              </div>

              <div>

                <strong>
                  Review your{" "}
                  {topCategory.name} spending
                </strong>

                <p>
                  This is currently your
                  largest expense category.
                  Consider setting a spending
                  limit for it.
                </p>

              </div>

              <ArrowDownRight size={19} />

            </div>

          )}

          {/* RECOMMENDATION 2 */}

          {budget > 0 &&
            remaining > 0 && (

              <div className="recommendation-item">

                <div className="recommendation-number">
                  02
                </div>

                <div>

                  <strong>
                    Protect your remaining
                    budget
                  </strong>

                  <p>
                    You still have{" "}
                    {money(remaining)}{" "}
                    available. Try to keep
                    upcoming non-essential
                    expenses within this amount.
                  </p>

                </div>

                <Target size={19} />

              </div>

            )}

          {/* RECOMMENDATION 3 */}

          {totals.balance > 0 && (

            <div className="recommendation-item">

              <div className="recommendation-number">
                03
              </div>

              <div>

                <strong>
                  Build on your positive
                  balance
                </strong>

                <p>
                  Your income currently exceeds
                  your expenses. Consider
                  directing part of the
                  remaining balance toward
                  savings.
                </p>

              </div>

              <ArrowUpRight size={19} />

            </div>

          )}

          {/* RECOMMENDATION 3 - NEGATIVE */}

          {totals.balance <= 0 && (

            <div className="recommendation-item">

              <div className="recommendation-number">
                03
              </div>

              <div>

                <strong>
                  Focus on reducing
                  unnecessary expenses
                </strong>

                <p>
                  Review your recent
                  transactions and identify
                  expenses that can be reduced
                  or postponed.
                </p>

              </div>

              <ArrowDownRight size={19} />

            </div>

          )}

        </div>

      </section>

    </div>
  );
}

export default AllInsights;