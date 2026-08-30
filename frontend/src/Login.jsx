import React, { useState } from "react";

function Login({ onLogin, onRegister }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      const users = JSON.parse(
        localStorage.getItem("spendwise_users") || "[]"
      );

      const user = users.find(
        (item) =>
          item.email.toLowerCase() === email &&
          item.password === password
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
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape shape-one" />
      <div className="auth-background-shape shape-two" />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">₹</div>

          <div>
            <h1>SpendWise</h1>
            <p>Smart Expense Manager</p>
          </div>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h2>Sign in to your account</h2>
          <p>
            Track expenses, manage budgets and understand
            your spending.
          </p>
        </div>

        {error && (
          <div className="form-alert error">
            <span>⚠</span>
            <p>{error}</p>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>

            <input
              id="login-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="primary-button auth-button">
            Sign In
          </button>
        </form>

        <div className="auth-switch">
          <span>Don't have an account?</span>

          <button type="button" onClick={onRegister}>
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;