import { useState } from "react";
import {
  WalletCards,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Login({
  onLogin,
  onRegister,
}) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError(
        "Please enter your email and password."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Login failed"
        );
      }

      onLogin(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-decoration one" />
      <div className="auth-decoration two" />

      <div className="auth-card">

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <WalletCards size={25} />
          </div>

          <h1>SpendWise</h1>

          <p>
            Smart Personal Expense Manager
          </p>
        </div>

        <div className="auth-heading">
          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to continue managing
            your finances.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="auth-field">
            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label>
              Password
            </label>

            <div className="password-field">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            Don't have an account?
          </span>

          <button
            onClick={onRegister}
          >
            Create account
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;