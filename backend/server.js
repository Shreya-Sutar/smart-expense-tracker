const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
console.log("MongoDB connected successfully");
})
.catch((error) => {
console.error("MongoDB connection error:", error);
});

// ==================== EXPENSE SCHEMA ====================

const expenseSchema = new mongoose.Schema(
{
title: {
type: String,
required: true,
},
amount: {
type: Number,
required: true,
},
category: {
type: String,
required: true,
},
date: {
type: String,
required: true,
},
paymentMethod: {
type: String,
required: true,
},
},
{
timestamps: true,
}
);

const Expense = mongoose.model("Expense", expenseSchema);

// ==================== BUDGET SCHEMA ====================

const budgetSchema = new mongoose.Schema(
{
amount: {
type: Number,
required: true,
default: 0,
},
},
{
timestamps: true,
}
);

const Budget = mongoose.model("Budget", budgetSchema);

// ==================== TEST ROUTE ====================

app.get("/", (req, res) => {
res.json({
message: "Smart Expense Tracker Backend is running!",
});
});

// ==================== EXPENSE ROUTES ====================

// Get all expenses
app.get("/api/expenses", async (req, res) => {
try {
const expenses = await Expense.find().sort({ createdAt: -1 });


res.json(expenses);


} catch (error) {
console.error("Error fetching expenses:", error);


res.status(500).json({
  message: "Error fetching expenses",
});


}
});

// Add expense
app.post("/api/expenses", async (req, res) => {
try {
const newExpense = new Expense(req.body);


const savedExpense = await newExpense.save();

console.log("Received expense:", savedExpense);

res.status(201).json({
  message: "Expense added successfully!",
  expense: savedExpense,
});


} catch (error) {
console.error("Error adding expense:", error);


res.status(500).json({
  message: "Error adding expense",
});


}
});

// Update expense
app.put("/api/expenses/:id", async (req, res) => {
try {
const updatedExpense = await Expense.findByIdAndUpdate(
req.params.id,
req.body,
{
new: true,
runValidators: true,
}
);


if (!updatedExpense) {
  return res.status(404).json({
    message: "Expense not found",
  });
}

console.log("Updated expense:", updatedExpense);

res.json({
  message: "Expense updated successfully",
  expense: updatedExpense,
});


} catch (error) {
console.error("Error updating expense:", error);


res.status(500).json({
  message: "Error updating expense",
});


}
});

// Delete expense
app.delete("/api/expenses/:id", async (req, res) => {
try {
const deletedExpense = await Expense.findByIdAndDelete(req.params.id);


if (!deletedExpense) {
  return res.status(404).json({
    message: "Expense not found",
  });
}

res.json({
  message: "Expense deleted successfully",
});


} catch (error) {
console.error("Error deleting expense:", error);


res.status(500).json({
  message: "Error deleting expense",
});


}
});

// ==================== BUDGET ROUTES ====================

// Get monthly budget
app.get("/api/budget", async (req, res) => {
try {
const budget = await Budget.findOne();


if (!budget) {
  return res.json({
    budget: 0,
  });
}

res.json({
  budget: budget.amount,
});


} catch (error) {
console.error("Error fetching budget:", error);


res.status(500).json({
  message: "Error fetching budget",
});


}
});

// Set monthly budget
app.post("/api/budget", async (req, res) => {
try {
const { budget } = req.body;


if (budget === undefined || Number(budget) <= 0) {
  return res.status(400).json({
    message: "Please provide a valid budget",
  });
}

let existingBudget = await Budget.findOne();

if (existingBudget) {
  existingBudget.amount = Number(budget);

  await existingBudget.save();
} else {
  existingBudget = await Budget.create({
    amount: Number(budget),
  });
}

console.log("Monthly budget:", existingBudget.amount);

res.json({
  message: "Budget updated successfully",
  budget: existingBudget.amount,
});


} catch (error) {
console.error("Error setting budget:", error);


res.status(500).json({
  message: "Error setting budget",
});


}
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
