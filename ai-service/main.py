from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from collections import defaultdict
import statistics

app = FastAPI(
    title="SpendWise AI Service",
    description="AI-powered spending analysis service for SpendWise",
    version="1.0.0"
)

# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# MODELS
# =========================================================

class Transaction(BaseModel):
    id: Optional[str] = ""
    title: str = ""
    amount: float = 0
    type: str = "expense"
    category: str = "Other"
    date: str = ""
    note: str = ""


class TransactionRequest(BaseModel):
    transactions: List[Transaction]


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/")
def root():
    return {
        "service": "SpendWise AI",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def safe_amount(value):
    try:
        amount = float(value)

        if amount < 0:
            return 0

        return amount

    except:
        return 0


def clean_category(category):
    if not category:
        return "Other"

    return str(category).strip().title()


def clean_type(transaction_type):
    if str(transaction_type).lower() == "income":
        return "income"

    return "expense"


# =========================================================
# SPENDING ANALYSIS
# =========================================================

def analyze_spending(transactions):

    expenses = []
    incomes = []

    category_totals = defaultdict(float)
    category_counts = defaultdict(int)

    daily_expenses = defaultdict(float)

    largest_expense = None

    for transaction in transactions:

        amount = safe_amount(transaction.amount)
        transaction_type = clean_type(transaction.type)
        category = clean_category(transaction.category)

        if transaction_type == "expense":

            expenses.append(amount)

            category_totals[category] += amount
            category_counts[category] += 1

            if transaction.date:
                daily_expenses[transaction.date] += amount

            if (
                largest_expense is None
                or amount > safe_amount(largest_expense["amount"])
            ):
                largest_expense = {
                    "title": transaction.title or "Untitled",
                    "amount": amount,
                    "category": category,
                    "date": transaction.date
                }

        else:
            incomes.append(amount)

    total_expense = sum(expenses)
    total_income = sum(incomes)

    transaction_count = len(transactions)

    expense_count = len(expenses)

    average_expense = (
        total_expense / expense_count
        if expense_count > 0
        else 0
    )

    highest_category = None

    if category_totals:

        category_name = max(
            category_totals,
            key=category_totals.get
        )

        highest_category = {
            "category": category_name,
            "amount": round(
                category_totals[category_name],
                2
            ),
            "percentage": round(
                (
                    category_totals[category_name]
                    / total_expense
                    * 100
                )
                if total_expense > 0
                else 0,
                2
            )
        }

    categories = []

    for category, amount in category_totals.items():

        percentage = (
            amount / total_expense * 100
            if total_expense > 0
            else 0
        )

        categories.append(
            {
                "category": category,
                "amount": round(amount, 2),
                "count": category_counts[category],
                "percentage": round(
                    percentage,
                    2
                )
            }
        )

    categories.sort(
        key=lambda item: item["amount"],
        reverse=True
    )

    # -----------------------------------------------------
    # SPENDING LEVEL
    # -----------------------------------------------------

    if total_expense == 0:
        spending_level = "No spending"

    elif total_income > 0:

        expense_ratio = (
            total_expense / total_income
        )

        if expense_ratio < 0.5:
            spending_level = "Low"

        elif expense_ratio < 0.8:
            spending_level = "Moderate"

        elif expense_ratio <= 1:
            spending_level = "High"

        else:
            spending_level = "Very High"

    else:

        if total_expense < 5000:
            spending_level = "Low"

        elif total_expense < 15000:
            spending_level = "Moderate"

        elif total_expense < 30000:
            spending_level = "High"

        else:
            spending_level = "Very High"

    # -----------------------------------------------------
    # INSIGHTS
    # -----------------------------------------------------

    insights = []

    if total_expense == 0:

        insights.append({
            "type": "info",
            "title": "No expenses recorded",
            "message": (
                "Add some expense transactions "
                "to receive personalized spending insights."
            )
        })

    else:

        if highest_category:

            insights.append({
                "type": "category",
                "title": "Top spending category",
                "message": (
                    f"{highest_category['category']} is your "
                    f"largest spending category at "
                    f"₹{highest_category['amount']:,.2f}, "
                    f"which is "
                    f"{highest_category['percentage']:.1f}% "
                    f"of your total expenses."
                )
            })

        if average_expense > 0:

            insights.append({
                "type": "average",
                "title": "Average expense",
                "message": (
                    f"Your average expense is "
                    f"₹{average_expense:,.2f}."
                )
            })

        if total_income > 0:

            savings = total_income - total_expense

            savings_rate = (
                savings / total_income * 100
            )

            if savings_rate >= 30:

                insights.append({
                    "type": "positive",
                    "title": "Strong savings",
                    "message": (
                        f"You are saving approximately "
                        f"{savings_rate:.1f}% of your income. "
                        "Great job maintaining a healthy balance."
                    )
                })

            elif savings_rate >= 10:

                insights.append({
                    "type": "positive",
                    "title": "Positive cash flow",
                    "message": (
                        f"Your estimated savings rate is "
                        f"{savings_rate:.1f}%."
                    )
                })

            elif savings_rate >= 0:

                insights.append({
                    "type": "warning",
                    "title": "Low savings",
                    "message": (
                        "Your expenses are taking up most "
                        "of your income. Consider reviewing "
                        "your largest spending categories."
                    )
                })

            else:

                insights.append({
                    "type": "danger",
                    "title": "Expenses exceed income",
                    "message": (
                        "Your recorded expenses are higher "
                        "than your recorded income."
                    )
                })

        if highest_category:

            if highest_category["percentage"] >= 40:

                insights.append({
                    "type": "warning",
                    "title": "High category concentration",
                    "message": (
                        f"{highest_category['category']} accounts "
                        f"for more than 40% of your expenses. "
                        "Consider checking whether this spending "
                        "can be reduced."
                    )
                })

    # -----------------------------------------------------
    # RECOMMENDATIONS
    # -----------------------------------------------------

    recommendations = []

    if highest_category:

        recommendations.append(
            f"Review your {highest_category['category']} "
            "expenses and identify possible savings."
        )

    if average_expense > 0:

        recommendations.append(
            "Set a weekly spending limit to keep "
            "individual expenses under control."
        )

    if total_income > 0 and total_expense > total_income:

        recommendations.append(
            "Prioritize essential expenses and reduce "
            "non-essential spending."
        )

    if not recommendations:

        recommendations.append(
            "Continue tracking your transactions regularly "
            "to receive more accurate insights."
        )

    # -----------------------------------------------------
    # DAILY SPENDING
    # -----------------------------------------------------

    daily_spending = []

    for date, amount in daily_expenses.items():

        daily_spending.append({
            "date": date,
            "amount": round(amount, 2)
        })

    daily_spending.sort(
        key=lambda item: item["date"]
    )

    return {
        "transactionCount": transaction_count,
        "expenseCount": expense_count,
        "incomeCount": len(incomes),

        "totalExpense": round(
            total_expense,
            2
        ),

        "totalIncome": round(
            total_income,
            2
        ),

        "averageExpense": round(
            average_expense,
            2
        ),

        "spendingLevel": spending_level,

        "largestExpense": largest_expense,

        "highestCategory": highest_category,

        "categories": categories,

        "dailySpending": daily_spending,

        "insights": insights,

        "recommendations": recommendations
    }


# =========================================================
# PROCESS TRANSACTIONS
# =========================================================

@app.post("/process-transactions")
def process_transactions(
    request: TransactionRequest
):

    transactions = request.transactions

    analysis = analyze_spending(
        transactions
    )

    return analysis


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )