
import React, { useState } from "react";

function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("spendwise_users") || "[]"
    );

    const exists = users.some(
      (user) =>
        user.email.toLowerCase() ===
        form.email.trim().toLowerCase()
    );

    if (exists) {
      setError("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    };

    localStorage.setItem(
      "spendwise_users",
      JSON.stringify([...users, newUser])
    );

    localStorage.setItem(
      "spendwise_current_user",
      JSON.stringify(newUser)
    );

    onLogin(newUser);
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-brand">
          <div className="brand-icon">
            <span>₹</span>
          </div>

          <div>
            <h1>SpendWise</h1>
            <p>Smart Expense Manager</p>
          </div>
        </div>

        <div className="auth-heading">
          <h2>Create your account</h2>
          <p>Start managing your money smarter.</p>
        </div>

        {error && (
          <div className="form-alert error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full name</label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />

          <label>Email address</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
          />

          <label>Confirm password</label>

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Repeat your password"
          />

          <button
            type="submit"
            className="primary-button auth-button"
          >
            Create Account
          </button>
        </form>

        <div className="auth-switch">
          Already have an account?
          <button type="button" onClick={onLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;

