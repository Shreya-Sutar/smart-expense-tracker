const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "smart_expense_tracker_secret";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ||
  "http://localhost:8000";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/* =========================================================
   USER SCHEMA
========================================================= */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   TRANSACTION SCHEMA
========================================================= */

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   BUDGET SCHEMA
========================================================= */

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index(
  {
    userId: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

const Budget = mongoose.model(
  "Budget",
  budgetSchema
);

/* =========================================================
   AUTHENTICATION MIDDLEWARE
========================================================= */

function authenticateToken(req, res, next) {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token =
    authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.json({
    message:
      "Smart Expense Tracker API is running",
  });
});

/* =========================================================
   REGISTER
========================================================= */

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          message:
            "All fields are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must contain at least 6 characters",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account with this email already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user =
        await User.create({
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
        });

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.status(201).json({
        message:
          "Account created successfully",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while creating account",
      });
    }
  }
);

/* =========================================================
   LOGIN
========================================================= */

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message:
            "Email and password are required",
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const user =
        await User.findOne({
          email: normalizedEmail,
        });

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        message:
          "Login successful",

        token,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      res.status(500).json({
        message:
          "Server error while logging in",
      });
    }
  }
);

/* =========================================================
   CURRENT USER
========================================================= */

app.get(
  "/api/auth/me",
  authenticateToken,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.user.userId
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error(
        "Get user error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch user",
      });
    }
  }
);

/* =========================================================
   GET TRANSACTIONS
========================================================= */

app.get(
  "/api/transactions",
  authenticateToken,
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find({
          userId: req.user.userId,
        }).sort({
          date: -1,
          createdAt: -1,
        });

      res.json(transactions);
    } catch (error) {
      console.error(
        "Get transactions error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch transactions",
      });
    }
  }
);

/* =========================================================
   ADD TRANSACTION
========================================================= */

app.post(
  "/api/transactions",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        title,
        amount,
        type,
        category,
        date,
        note,
      } = req.body;

      if (
        !title ||
        amount === undefined ||
        !type ||
        !category ||
        !date
      ) {
        return res.status(400).json({
          message:
            "Please fill all required transaction fields",
        });
      }

      const numericAmount =
        Number(amount);

      if (
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Amount must be greater than zero",
        });
      }

      const transaction =
        await Transaction.create({
          userId: req.user.userId,
          title: title.trim(),
          amount: numericAmount,
          type,
          category: category.trim(),
          date: new Date(date),
          note: note
            ? note.trim()
            : "",
        });

      res.status(201).json(
        transaction
      );
    } catch (error) {
      console.error(
        "Add transaction error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to add transaction",
      });
    }
  }
);

/* =========================================================
   UPDATE TRANSACTION
========================================================= */

app.put(
  "/api/transactions/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const transaction =
        await Transaction.findOne({
          _id: req.params.id,
          userId: req.user.userId,
        });

      if (!transaction) {
        return res.status(404).json({
          message:
            "Transaction not found",
        });
      }

      const {
        title,
        amount,
        type,
        category,
        date,
        note,
      } = req.body;

      if (
        !title ||
        amount === undefined ||
        !type ||
        !category ||
        !date
      ) {
        return res.status(400).json({
          message:
            "Please fill all required fields",
        });
      }

      const numericAmount =
        Number(amount);

      if (
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Amount must be greater than zero",
        });
      }

      transaction.title =
        title.trim();

      transaction.amount =
        numericAmount;

      transaction.type = type;

      transaction.category =
        category.trim();

      transaction.date =
        new Date(date);

      transaction.note =
        note ? note.trim() : "";

      await transaction.save();

      res.json(transaction);
    } catch (error) {
      console.error(
        "Update transaction error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to update transaction",
      });
    }
  }
);

/* =========================================================
   DELETE TRANSACTION
========================================================= */

app.delete(
  "/api/transactions/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const transaction =
        await Transaction.findOneAndDelete({
          _id: req.params.id,
          userId: req.user.userId,
        });

      if (!transaction) {
        return res.status(404).json({
          message:
            "Transaction not found",
        });
      }

      res.json({
        message:
          "Transaction deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete transaction error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to delete transaction",
      });
    }
  }
);

/* =========================================================
   STEP 3 — SEND USER TRANSACTIONS TO AI SERVICE
========================================================= */

app.post(
  "/api/ai/process-transactions",
  authenticateToken,
  async (req, res) => {
    try {
      const transactions =
        await Transaction.find({
          userId: req.user.userId,
        }).sort({
          date: -1,
          createdAt: -1,
        });

      const aiTransactions =
        transactions.map(
          (transaction) => ({
            id: transaction._id.toString(),

            title: transaction.title,

            amount: Number(
              transaction.amount
            ),

            type: transaction.type,

            category:
              transaction.category,

            date:
              transaction.date
                .toISOString()
                .split("T")[0],

            note:
              transaction.note || "",
          })
        );

      const aiResponse =
        await fetch(
          `${AI_SERVICE_URL}/process-transactions`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              transactions:
                aiTransactions,
            }),
          }
        );

      const aiData =
        await aiResponse.json();

      if (!aiResponse.ok) {
        console.error(
          "AI service error:",
          aiData
        );

        return res.status(502).json({
          message:
            "AI service could not process transactions",
        });
      }

      res.json({
        success: true,

        message:
          "Transactions successfully connected to AI",

        data: aiData,
      });
    } catch (error) {
      console.error(
        "AI transaction connection error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to connect transactions to AI service",
      });
    }
  }
);

/* =========================================================
   GET MONTHLY BUDGET
========================================================= */

app.get(
  "/api/budget",
  authenticateToken,
  async (req, res) => {
    try {
      const month =
        Number(req.query.month);

      const year =
        Number(req.query.year);

      if (!month || !year) {
        return res.status(400).json({
          message:
            "Month and year are required",
        });
      }

      const budget =
        await Budget.findOne({
          userId: req.user.userId,
          month,
          year,
        });

      res.json({
        amount: budget
          ? budget.amount
          : 0,

        month,

        year,
      });
    } catch (error) {
      console.error(
        "Get budget error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch budget",
      });
    }
  }
);

/* =========================================================
   SET / UPDATE MONTHLY BUDGET
========================================================= */

app.put(
  "/api/budget",
  authenticateToken,
  async (req, res) => {
    try {
      const {
        month,
        year,
        amount,
      } = req.body;

      const numericMonth =
        Number(month);

      const numericYear =
        Number(year);

      const numericAmount =
        Number(amount);

      if (
        !numericMonth ||
        !numericYear ||
        Number.isNaN(numericAmount) ||
        numericAmount < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid budget details",
        });
      }

      const budget =
        await Budget.findOneAndUpdate(
          {
            userId:
              req.user.userId,

            month:
              numericMonth,

            year:
              numericYear,
          },

          {
            userId:
              req.user.userId,

            month:
              numericMonth,

            year:
              numericYear,

            amount:
              numericAmount,
          },

          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      res.json({
        message:
          "Monthly budget saved successfully",

        budget,
      });
    } catch (error) {
      console.error(
        "Save budget error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to save budget",
      });
    }
  }
);

/* =========================================================
   DELETE BUDGET
========================================================= */

app.delete(
  "/api/budget",
  authenticateToken,
  async (req, res) => {
    try {
      const month =
        Number(req.query.month);

      const year =
        Number(req.query.year);

      await Budget.findOneAndDelete({
        userId: req.user.userId,
        month,
        year,
      });

      res.json({
        message:
          "Budget removed successfully",
      });
    } catch (error) {
      console.error(
        "Delete budget error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to remove budget",
      });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

async function startServer() {
  try {
    if (!MONGO_URI) {
      console.error(
        "MONGO_URI is missing in .env"
      );

      process.exit(1);
    }

    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      "✓ MongoDB connected"
    );

    app.listen(PORT, () => {
      console.log(
        `✓ Server running on http://localhost:${PORT}`
      );

      console.log(
        `✓ AI service configured at ${AI_SERVICE_URL}`
      );
    });
  } catch (error) {
    console.error(
      "Database connection failed:",
      error
    );

    process.exit(1);
  }
}

startServer();