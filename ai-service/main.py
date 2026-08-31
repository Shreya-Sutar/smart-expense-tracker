from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import pandas as pd


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="SpendWise AI Service",
    description="AI processing service for Smart Expense Tracker",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# TRANSACTION MODEL
# =========================================================

class Transaction(BaseModel):

    id: str

    title: str

    amount: float = Field(gt=0)

    type: str

    category: str

    date: str

    note: Optional[str] = ""


# =========================================================
# REQUEST MODEL
# =========================================================

class TransactionRequest(BaseModel):

    transactions: List[Transaction]


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "message": "SpendWise AI Service is running",
        "status": "connected",
        "service": "spendwise-ai",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "spendwise-ai",
    }


# =========================================================
# PROCESS TRANSACTIONS
# =========================================================

@app.post("/process-transactions")
def process_transactions(
    request: TransactionRequest
):

    try:

        transactions = request.transactions

        # -------------------------------------------------
        # NO TRANSACTIONS
        # -------------------------------------------------

        if not transactions:

            return {
                "success": True,
                "message": "No transactions available",
                "transactionCount": 0,
                "expenseCount": 0,
                "incomeCount": 0,
                "expenseTotal": 0,
                "incomeTotal": 0,
                "transactions": [],
            }

        # -------------------------------------------------
        # CONVERT PYDANTIC MODELS TO DICTIONARIES
        # -------------------------------------------------

        transaction_data = [
            transaction.model_dump()
            for transaction in transactions
        ]

        # -------------------------------------------------
        # CREATE DATAFRAME
        # -------------------------------------------------

        df = pd.DataFrame(
            transaction_data
        )

        # -------------------------------------------------
        # CLEAN TYPE
        # -------------------------------------------------

        df["type"] = (
            df["type"]
            .astype(str)
            .str.lower()
            .str.strip()
        )

        # -------------------------------------------------
        # CLEAN CATEGORY
        # -------------------------------------------------

        df["category"] = (
            df["category"]
            .astype(str)
            .str.strip()
        )

        # -------------------------------------------------
        # CLEAN AMOUNT
        # -------------------------------------------------

        df["amount"] = pd.to_numeric(
            df["amount"],
            errors="coerce",
        )

        # -------------------------------------------------
        # CLEAN DATE
        # -------------------------------------------------

        df["date"] = pd.to_datetime(
            df["date"],
            errors="coerce",
        )

        # -------------------------------------------------
        # REMOVE INVALID DATA
        # -------------------------------------------------

        df = df.dropna(
            subset=[
                "amount",
                "date",
            ]
        )

        # -------------------------------------------------
        # IF EVERYTHING WAS INVALID
        # -------------------------------------------------

        if df.empty:

            return {
                "success": True,
                "message": "No valid transactions available",
                "transactionCount": 0,
                "expenseCount": 0,
                "incomeCount": 0,
                "expenseTotal": 0,
                "incomeTotal": 0,
                "transactions": [],
            }

        # -------------------------------------------------
        # AI-READY FEATURES
        # -------------------------------------------------

        df["year"] = df["date"].dt.year

        df["month"] = df["date"].dt.month

        df["day"] = df["date"].dt.day

        df["day_of_week"] = (
            df["date"].dt.dayofweek
        )

        df["is_weekend"] = (
            df["day_of_week"] >= 5
        )

        df["is_expense"] = (
            df["type"] == "expense"
        )

        df["is_income"] = (
            df["type"] == "income"
        )

        # -------------------------------------------------
        # PREPARE PROCESSED TRANSACTIONS
        # -------------------------------------------------

        processed_transactions = []

        for _, row in df.iterrows():

            processed_transactions.append(
                {
                    "id": str(row["id"]),

                    "title": str(
                        row["title"]
                    ),

                    "amount": float(
                        row["amount"]
                    ),

                    "type": str(
                        row["type"]
                    ),

                    "category": str(
                        row["category"]
                    ),

                    "date": row["date"].strftime(
                        "%Y-%m-%d"
                    ),

                    "note": str(
                        row["note"] or ""
                    ),

                    "year": int(
                        row["year"]
                    ),

                    "month": int(
                        row["month"]
                    ),

                    "day": int(
                        row["day"]
                    ),

                    "dayOfWeek": int(
                        row["day_of_week"]
                    ),

                    "isWeekend": bool(
                        row["is_weekend"]
                    ),

                    "isExpense": bool(
                        row["is_expense"]
                    ),

                    "isIncome": bool(
                        row["is_income"]
                    ),
                }
            )

        # -------------------------------------------------
        # EXPENSE COUNT
        # -------------------------------------------------

        expense_count = int(
            (
                df["type"] == "expense"
            ).sum()
        )

        # -------------------------------------------------
        # INCOME COUNT
        # -------------------------------------------------

        income_count = int(
            (
                df["type"] == "income"
            ).sum()
        )

        # -------------------------------------------------
        # EXPENSE TOTAL
        # -------------------------------------------------

        expense_total = float(
            df.loc[
                df["type"] == "expense",
                "amount",
            ].sum()
        )

        # -------------------------------------------------
        # INCOME TOTAL
        # -------------------------------------------------

        income_total = float(
            df.loc[
                df["type"] == "income",
                "amount",
            ].sum()
        )

        # -------------------------------------------------
        # CATEGORY ANALYSIS
        # -------------------------------------------------

        expense_df = df[
            df["type"] == "expense"
        ]

        category_summary = []

        if not expense_df.empty:

            grouped = (
                expense_df
                .groupby("category")["amount"]
                .sum()
                .sort_values(
                    ascending=False
                )
            )

            for category, amount in grouped.items():

                category_summary.append(
                    {
                        "category": str(
                            category
                        ),
                        "amount": float(
                            amount
                        ),
                    }
                )

        # -------------------------------------------------
        # WEEKEND EXPENSE
        # -------------------------------------------------

        weekend_expense = float(
            df.loc[
                (
                    (df["type"] == "expense")
                    & (df["is_weekend"])
                ),
                "amount",
            ].sum()
        )

        # -------------------------------------------------
        # WEEKDAY EXPENSE
        # -------------------------------------------------

        weekday_expense = float(
            df.loc[
                (
                    (df["type"] == "expense")
                    & (~df["is_weekend"])
                ),
                "amount",
            ].sum()
        )

        # -------------------------------------------------
        # AVERAGE EXPENSE
        # -------------------------------------------------

        average_expense = 0

        if expense_count > 0:

            average_expense = (
                expense_total
                / expense_count
            )

        # -------------------------------------------------
        # HIGHEST EXPENSE
        # -------------------------------------------------

        highest_expense = 0

        if not expense_df.empty:

            highest_expense = float(
                expense_df["amount"].max()
            )

        # -------------------------------------------------
        # RETURN
        # -------------------------------------------------

        return {

            "success": True,

            "message":
                "Transactions successfully processed",

            "transactionCount":
                len(
                    processed_transactions
                ),

            "expenseCount":
                expense_count,

            "incomeCount":
                income_count,

            "expenseTotal":
                round(
                    expense_total,
                    2
                ),

            "incomeTotal":
                round(
                    income_total,
                    2
                ),

            "averageExpense":
                round(
                    average_expense,
                    2
                ),

            "highestExpense":
                round(
                    highest_expense,
                    2
                ),

            "weekendExpense":
                round(
                    weekend_expense,
                    2
                ),

            "weekdayExpense":
                round(
                    weekday_expense,
                    2
                ),

            "categorySummary":
                category_summary,

            "transactions":
                processed_transactions,
        }

    except Exception as error:

        print(
            "AI processing error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to process transactions",
        )