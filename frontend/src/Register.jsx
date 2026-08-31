import { useState } from "react";
import {
  WalletCards,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Register({
  onRegister,
  onLogin,
}) {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all fields."
      );

      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
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
            "Registration failed"
        );
      }

      onRegister(data);
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

      <div className="auth-card register-card">

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
            Create your account
          </h2>

          <p>
            Start tracking your money
            smarter today.
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
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

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
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
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

          <div className="auth-field">
            <label>
              Confirm Password
            </label>

            <div className="password-field">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  confirmPassword
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Repeat your password"
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
              >
                {showConfirmPassword ? (
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
              ? "Creating account..."
              : "Create Account"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            Already have an account?
          </span>

          <button
            onClick={onLogin}
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register;