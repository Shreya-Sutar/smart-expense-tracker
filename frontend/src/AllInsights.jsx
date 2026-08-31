import {
  useMemo,
  useState,
} from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  PieChart as PieIcon,
  BarChart3,
  Activity,
} from "lucide-react";

const COLORS = [
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#6366f1",
  "#818cf8",
  "#4f46e5",
  "#6d28d9",
  "#9333ea",
];

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

function AllInsights({
  transactions,
  selectedMonth,
  selectedYear,
  budget,
}) {
  const [analysisMode, setAnalysisMode] =
    useState("monthly");

  /* =====================================================
     MONTH DATA
  ===================================================== */

  const monthlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(
        transaction.date
      );

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
     YEAR DATA
  ===================================================== */

  const yearlyTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(
        transaction.date
      );

      return (
        date.getFullYear() ===
        selectedYear
      );
    });
  }, [
    transactions,
    selectedYear,
  ]);

  /* =====================================================
     CURRENT DATA
  ===================================================== */

  const currentTransactions =
    analysisMode === "monthly"
      ? monthlyTransactions
      : yearlyTransactions;

  /* =====================================================
     CATEGORY PIE
  ===================================================== */

  const categoryData = useMemo(() => {
    const map = {};

    currentTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .forEach((transaction) => {
        const category =
          transaction.category ||
          "Other";

        map[category] =
          (map[category] || 0) +
          Number(transaction.amount);
      });

    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (a, b) => b.value - a.value
      );
  }, [currentTransactions]);

  /* =====================================================
     MONTHLY BAR
  ===================================================== */

  const monthlyBarData = useMemo(() => {
    return months.map(
      (month, monthIndex) => {
        const monthTransactions =
          yearlyTransactions.filter(
            (transaction) => {
              const date = new Date(
                transaction.date
              );

              return (
                date.getMonth() ===
                monthIndex
              );
            }
          );

        let income = 0;
        let expense = 0;

        monthTransactions.forEach(
          (transaction) => {
            if (
              transaction.type ===
              "income"
            ) {
              income += Number(
                transaction.amount
              );
            } else {
              expense += Number(
                transaction.amount
              );
            }
          }
        );

        return {
          month,
          income,
          expense,
        };
      }
    );
  }, [yearlyTransactions]);

  /* =====================================================
     DAILY LINE CHART
  ===================================================== */

  const dailyLineData = useMemo(() => {
    const daysInMonth = new Date(
      selectedYear,
      selectedMonth + 1,
      0
    ).getDate();

    return Array.from(
      { length: daysInMonth },
      (_, index) => {
        const day = index + 1;

        const dayTransactions =
          monthlyTransactions.filter(
            (transaction) => {
              const date = new Date(
                transaction.date
              );

              return (
                date.getDate() === day
              );
            }
          );

        let income = 0;
        let expense = 0;

        dayTransactions.forEach(
          (transaction) => {
            if (
              transaction.type ===
              "income"
            ) {
              income += Number(
                transaction.amount
              );
            } else {
              expense += Number(
                transaction.amount
              );
            }
          }
        );

        return {
          day: String(day),
          income,
          expense,
        };
      }
    );
  }, [
    monthlyTransactions,
    selectedMonth,
    selectedYear,
  ]);

  /* =====================================================
     TOTALS
  ===================================================== */

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;

    currentTransactions.forEach(
      (transaction) => {
        const amount = Number(
          transaction.amount
        );

        if (
          transaction.type ===
          "income"
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
  }, [currentTransactions]);

  const savingsRate =
    totals.income > 0
      ? ((totals.income -
          totals.expense) /
          totals.income) *
        100
      : 0;

  /* =====================================================
     TOP CATEGORY
  ===================================================== */

  const topCategory =
    categoryData.length > 0
      ? categoryData[0]
      : null;

  return (
    <div className="insights-page">

      {/* HEADER */}

      <section className="insights-heading">

        <div>
          <span className="section-label">
            FINANCIAL ANALYTICS
          </span>

          <h1>
            Insights & Analysis
          </h1>

          <p>
            Understand where your money
            goes and identify spending
            patterns.
          </p>
        </div>

        <div className="analysis-toggle">
          <button
            className={
              analysisMode ===
              "monthly"
                ? "active"
                : ""
            }
            onClick={() =>
              setAnalysisMode(
                "monthly"
              )
            }
          >
            Monthly
          </button>

          <button
            className={
              analysisMode ===
              "yearly"
                ? "active"
                : ""
            }
            onClick={() =>
              setAnalysisMode(
                "yearly"
              )
            }
          >
            Yearly
          </button>
        </div>

      </section>

      {/* INSIGHT CARDS */}

      <section className="insight-summary-grid">

        <div className="insight-summary-card">
          <div className="insight-card-icon">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Income</span>

            <strong>
              ₹
              {totals.income.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>
        </div>

        <div className="insight-summary-card">
          <div className="insight-card-icon">
            <TrendingDown size={20} />
          </div>

          <div>
            <span>Expenses</span>

            <strong>
              ₹
              {totals.expense.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>
        </div>

        <div className="insight-summary-card">
          <div className="insight-card-icon">
            <Activity size={20} />
          </div>

          <div>
            <span>Net Balance</span>

            <strong>
              ₹
              {totals.balance.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>
        </div>

        <div className="insight-summary-card">
          <div className="insight-card-icon">
            <PieIcon size={20} />
          </div>

          <div>
            <span>Top Category</span>

            <strong>
              {topCategory
                ? topCategory.name
                : "—"}
            </strong>
          </div>
        </div>

      </section>

      {/* CHARTS */}

      {currentTransactions.length === 0 ? (
        <div className="glass-card insights-empty">
          <div className="empty-icon">
            <BarChart3 size={32} />
          </div>

          <h3>
            Not enough data yet
          </h3>

          <p>
            Add some transactions to
            generate your financial
            insights and charts.
          </p>
        </div>
      ) : (
        <>
          {/* PIE */}

          <section className="charts-grid">

            <div className="glass-card chart-card">

              <div className="chart-header">
                <div>
                  <span className="section-label">
                    SPENDING BREAKDOWN
                  </span>

                  <h3>
                    Expenses by category
                  </h3>
                </div>

                <div className="chart-title-icon">
                  <PieIcon size={18} />
                </div>
              </div>

              <div className="chart-container pie-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {categoryData.map(
                        (_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        `₹${Number(
                          value
                        ).toLocaleString(
                          "en-IN"
                        )}`
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* BAR */}

            <div className="glass-card chart-card">

              <div className="chart-header">
                <div>
                  <span className="section-label">
                    YEARLY OVERVIEW
                  </span>

                  <h3>
                    Income vs Expenses
                  </h3>
                </div>

                <div className="chart-title-icon">
                  <BarChart3 size={18} />
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      monthlyBarData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                    />

                    <YAxis />

                    <Tooltip
                      formatter={(
                        value
                      ) =>
                        `₹${Number(
                          value
                        ).toLocaleString(
                          "en-IN"
                        )}`
                      }
                    />

                    <Legend />

                    <Bar
                      dataKey="income"
                      name="Income"
                      fill="#7c3aed"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                    />

                    <Bar
                      dataKey="expense"
                      name="Expenses"
                      fill="#c4b5fd"
                      radius={[
                        5,
                        5,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

          </section>

          {/* LINE */}

          <section className="glass-card chart-card full-chart">

            <div className="chart-header">

              <div>
                <span className="section-label">
                  MONTHLY TREND
                </span>

                <h3>
                  Daily income & expense
                </h3>
              </div>

              <div className="chart-title-icon">
                <Activity size={18} />
              </div>

            </div>

            <div className="chart-container line-chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={dailyLineData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    label={{
                      value: "Day",
                      position:
                        "insideBottom",
                      offset: -5,
                    }}
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(
                      value
                    ) =>
                      `₹${Number(
                        value
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    }
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expenses"
                    stroke="#a78bfa"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>

            </div>

          </section>

          {/* INSIGHT TEXT */}

          <section className="insight-message-grid">

            <div className="glass-card insight-message">
              <div className="message-icon">
                <TrendingDown size={20} />
              </div>

              <div>
                <span>
                  SPENDING INSIGHT
                </span>

                <h3>
                  {topCategory
                    ? `${topCategory.name} is your highest spending category`
                    : "Track your spending"}
                </h3>

                <p>
                  {topCategory
                    ? `You spent ₹${topCategory.value.toLocaleString(
                        "en-IN"
                      )} on ${
                        topCategory.name
                      } during this ${
                        analysisMode ===
                        "monthly"
                          ? "month"
                          : "year"
                      }.`
                    : "Add more transactions to receive personalized spending insights."}
                </p>
              </div>
            </div>

            <div className="glass-card insight-message">
              <div className="message-icon">
                <TrendingUp size={20} />
              </div>

              <div>
                <span>
                  SAVINGS INSIGHT
                </span>

                <h3>
                  {savingsRate >= 20
                    ? "Great savings progress!"
                    : savingsRate > 0
                    ? "You are saving, keep going!"
                    : "Focus on building savings"}
                </h3>

                <p>
                  Your current savings
                  rate is{" "}
                  <strong>
                    {Math.max(
                      savingsRate,
                      0
                    ).toFixed(1)}
                    %
                  </strong>
                  .
                </p>
              </div>
            </div>

          </section>
        </>
      )}
    </div>
  );
}

export default AllInsights;