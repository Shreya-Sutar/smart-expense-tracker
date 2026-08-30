import { useEffect, useState } from "react";
import {
PieChart,
Pie,
Cell,
Tooltip,
Legend,
ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
const [showForm, setShowForm] = useState(false);
const [expenses, setExpenses] = useState([]);
const [editingId, setEditingId] = useState(null);

const [budget, setBudget] = useState(0);
const [budgetInput, setBudgetInput] = useState("");

const [expense, setExpense] = useState({
title: "",
amount: "",
category: "",
date: "",
paymentMethod: "",
});

// ==================== FETCH EXPENSES ====================

const fetchExpenses = async () => {
try {
const response = await fetch("http://localhost:5000/api/expenses");


  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }

  const data = await response.json();

  setExpenses(data);
} catch (error) {
  console.error("Error fetching expenses:", error);
}


};

// ==================== FETCH BUDGET ====================

const fetchBudget = async () => {
try {
const response = await fetch("http://localhost:5000/api/budget");


  if (!response.ok) {
    throw new Error("Failed to fetch budget");
  }

  const data = await response.json();

  setBudget(data.budget);
  setBudgetInput(data.budget.toString());
} catch (error) {
  console.error("Error fetching budget:", error);
}


};

// ==================== LOAD DATA ====================

useEffect(() => {
fetchExpenses();
fetchBudget();
}, []);

// ==================== HANDLE INPUT ====================

const handleChange = (event) => {
const { name, value } = event.target;


setExpense({
  ...expense,
  [name]: value,
});


};

// ==================== ADD / UPDATE EXPENSE ====================

const handleSubmit = async (event) => {
event.preventDefault();


try {
  const url = editingId
    ? `http://localhost:5000/api/expenses/${editingId}`
    : "http://localhost:5000/api/expenses";

  const method = editingId ? "PUT" : "POST";

  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expense),
  });

  if (!response.ok) {
    throw new Error("Failed to save expense");
  }

  const data = await response.json();

  console.log("Backend response:", data);

  await fetchExpenses();

  setExpense({
    title: "",
    amount: "",
    category: "",
    date: "",
    paymentMethod: "",
  });

  setEditingId(null);
  setShowForm(false);
} catch (error) {
  console.error("Error saving expense:", error);
}


};

// ==================== EDIT EXPENSE ====================

const handleEdit = (item) => {
setExpense({
title: item.title,
amount: item.amount,
category: item.category,
date: item.date,
paymentMethod: item.paymentMethod,
});


setEditingId(item._id);
setShowForm(true);


};

// ==================== DELETE EXPENSE ====================

const handleDelete = async (id) => {
try {
const response = await fetch(
`http://localhost:5000/api/expenses/${id}`,
{
method: "DELETE",
}
);


  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }

  const data = await response.json();

  console.log("Delete response:", data);

  await fetchExpenses();
} catch (error) {
  console.error("Error deleting expense:", error);
}


};

// ==================== CANCEL FORM ====================

const handleCancel = () => {
setExpense({
title: "",
amount: "",
category: "",
date: "",
paymentMethod: "",
});


setEditingId(null);
setShowForm(false);


};

// ==================== SET BUDGET ====================

const handleBudgetSubmit = async (event) => {
event.preventDefault();


if (!budgetInput || Number(budgetInput) <= 0) {
  alert("Please enter a valid budget.");
  return;
}

try {
  const response = await fetch("http://localhost:5000/api/budget", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      budget: Number(budgetInput),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update budget");
  }

  const data = await response.json();

  console.log("Budget response:", data);

  setBudget(data.budget);
} catch (error) {
  console.error("Error setting budget:", error);
}


};

// ==================== TOTAL EXPENSES ====================

const totalExpenses = expenses.reduce(
(total, item) => total + Number(item.amount),
0
);

// ==================== THIS MONTH ====================

const currentDate = new Date();

const thisMonthExpenses = expenses
.filter((item) => {
const expenseDate = new Date(item.date);


  return (
    expenseDate.getMonth() === currentDate.getMonth() &&
    expenseDate.getFullYear() === currentDate.getFullYear()
  );
})
.reduce((total, item) => total + Number(item.amount), 0);


// ==================== BUDGET REMAINING ====================

const budgetRemaining = budget - thisMonthExpenses;

// ==================== BUDGET USAGE ====================

const budgetUsage =
budget > 0 ? (thisMonthExpenses / budget) * 100 : 0;

// ==================== SMART BUDGET ALERT ====================

const getBudgetAlert = () => {
if (budget <= 0) {
return {
type: "info",
message: "Set a monthly budget to start tracking your spending.",
};
}


if (budgetUsage >= 100) {
  return {
    type: "danger",
    message: `Budget exceeded by ₹${Math.abs(budgetRemaining)}.`,
  };
}

if (budgetUsage >= 80) {
  return {
    type: "warning",
    message: `Warning! You have used ${budgetUsage.toFixed(
      0
    )}% of your monthly budget.`,
  };
}

if (budgetUsage >= 50) {
  return {
    type: "caution",
    message: `You're approaching your budget. You've used ${budgetUsage.toFixed(
      0
    )}% of your monthly budget.`,
  };
}

return {
  type: "success",
  message: `Your budget is under control. You've used ${budgetUsage.toFixed(
    0
  )}% of your monthly budget.`,
};


};

const budgetAlert = getBudgetAlert();

// ==================== CATEGORY DATA ====================

const categoryTotals = {};

expenses.forEach((item) => {
const category = item.category;


if (!categoryTotals[category]) {
  categoryTotals[category] = 0;
}

categoryTotals[category] += Number(item.amount);


});

const categoryData = Object.keys(categoryTotals).map((category) => ({
name: category,
value: categoryTotals[category],
}));

const chartColors = [
"#4F46E5",
"#16A34A",
"#F59E0B",
"#DC2626",
"#9333EA",
"#0891B2",
];

return ( <div className="app"> <header className="header"> <h1>Smart Expense Tracker</h1> <p>Track your expenses and manage your money smarter.</p> </header>


  <main className="dashboard">
    <div className="summary-card">
      <h2>Total Expenses</h2>
      <p>₹{totalExpenses}</p>
    </div>

    <div className="summary-card">
      <h2>This Month</h2>
      <p>₹{thisMonthExpenses}</p>
    </div>

    <div className="summary-card">
      <h2>Budget Remaining</h2>
      <p>₹{budgetRemaining}</p>
    </div>

    <form className="budget-form" onSubmit={handleBudgetSubmit}>
      <label htmlFor="budget">Monthly Budget</label>

      <input
        id="budget"
        type="number"
        value={budgetInput}
        onChange={(event) => setBudgetInput(event.target.value)}
        placeholder="Enter monthly budget"
        min="1"
        required
      />

      <button type="submit" className="budget-btn">
        Set Budget
      </button>
    </form>

    <button
      className="add-expense-btn"
      onClick={() => {
        setEditingId(null);

        setExpense({
          title: "",
          amount: "",
          category: "",
          date: "",
          paymentMethod: "",
        });

        setShowForm(true);
      }}
    >
      + Add Expense
    </button>
  </main>

  <section className={`budget-alert ${budgetAlert.type}`}>
    <h2>Smart Budget Alert</h2>
    <p>{budgetAlert.message}</p>
  </section>

  {showForm && (
    <div className="form-container">
      <h2>{editingId ? "Edit Expense" : "Add New Expense"}</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Expense Title</label>

        <input
          id="title"
          type="text"
          name="title"
          value={expense.title}
          onChange={handleChange}
          placeholder="Example: Grocery shopping"
          required
        />

        <label htmlFor="amount">Amount</label>

        <input
          id="amount"
          type="number"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
          placeholder="Enter amount"
          min="1"
          required
        />

        <label htmlFor="category">Category</label>

        <select
          id="category"
          name="category"
          value={expense.category}
          onChange={handleChange}
          required
        >
          <option value="">Select category</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="date">Date</label>

        <input
          id="date"
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          required
        />

        <label htmlFor="paymentMethod">Payment Method</label>

        <select
          id="paymentMethod"
          name="paymentMethod"
          value={expense.paymentMethod}
          onChange={handleChange}
          required
        >
          <option value="">Select payment method</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>

        <button type="submit" className="save-btn">
          {editingId ? "Update Expense" : "Save Expense"}
        </button>

        <button
          type="button"
          className="cancel-btn"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </form>
    </div>
  )}

  <section className="expense-list">
    <h2>Recent Expenses</h2>

    {expenses.length === 0 ? (
      <p>No expenses added yet.</p>
    ) : (
      expenses.map((item) => (
        <div className="expense-item" key={item._id}>
          <div>
            <h3>{item.title}</h3>

            <p>
              {item.category} • {item.paymentMethod} • {item.date}
            </p>
          </div>

          <strong>₹{item.amount}</strong>

          <button
            className="edit-btn"
            onClick={() => handleEdit(item)}
          >
            Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => handleDelete(item._id)}
          >
            Delete
          </button>
        </div>
      ))
    )}
  </section>

  {categoryData.length > 0 && (
    <section className="analytics-section">
      <h2>Expense Breakdown</h2>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>

            <Tooltip formatter={(value) => `₹${value}`} />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="category-summary">
        {categoryData.map((item) => (
          <div className="category-item" key={item.name}>
            <span>{item.name}</span>
            <strong>₹{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )}
</div>


);
}

export default App;
