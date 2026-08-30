
import React, { useState } from "react";

function Login({ onLogin, onRegister }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!form.email.trim() || !form.password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("spendwise_users") || "[]"
    );

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === form.email.trim().toLowerCase() &&
        item.password === form.password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      "spendwise_current_user",
      JSON.stringify(user)
    );

    onLogin(user);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
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
          <h2>Welcome back</h2>
          <p>Sign in to continue managing your expenses.</p>
        </div>

        {error && (
          <div className="form-alert error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email address</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <label>Password</label>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword((value) => !value)
              }
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            className="primary-button auth-button"
          >
            Login
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account?
          <button type="button" onClick={onRegister}>
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

