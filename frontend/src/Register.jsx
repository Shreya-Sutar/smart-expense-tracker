import React, { useState } from "react";

function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (
      !name ||
      !email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.length < 2) {
      setError("Please enter a valid name.");
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

    try {
      const users = JSON.parse(
        localStorage.getItem("spendwise_users") || "[]"
      );

      const existingUser = users.find(
        (user) => user.email.toLowerCase() === email
      );

      if (existingUser) {
        setError("An account with this email already exists.");
        return;
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password: form.password,
      };

      const updatedUsers = [...users, newUser];

      localStorage.setItem(
        "spendwise_users",
        JSON.stringify(updatedUsers)
      );

      localStorage.setItem(
        "spendwise_current_user",
        JSON.stringify(newUser)
      );

      onLogin(newUser);
    } catch {
      setError("Unable to create account. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape shape-one" />
      <div className="auth-background-shape shape-two" />

      <div className="auth-card register-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">₹</div>

          <div>
            <h1>SpendWise</h1>
            <p>Smart Expense Manager</p>
          </div>
        </div>

        <div className="auth-heading">
          <span className="auth-eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p>
            Start managing your money smarter today.
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
            <label htmlFor="register-name">Full name</label>

            <input
              id="register-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">
              Email address
            </label>

            <input
              id="register-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">
              Password
            </label>

            <div className="password-wrapper">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
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

          <div className="form-group">
            <label htmlFor="register-confirm-password">
              Confirm password
            </label>

            <div className="password-wrapper">
              <input
                id="register-confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (previous) => !previous
                  )
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="primary-button auth-button"
          >
            Create Account
          </button>
        </form>

        <div className="auth-switch">
          <span>Already have an account?</span>

          <button type="button" onClick={onLogin}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;