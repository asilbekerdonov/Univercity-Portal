import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import "../styles/Login.css";

export function Login() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setFormError("Invalid email or password. Please try again.");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <span className="login-mark">MP</span>
          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">Marketing Portal — staff access only</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {fieldErrors.email?.map((msg) => (
              <span key={msg} className="field-error">
                {msg}
              </span>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {fieldErrors.password?.map((msg) => (
              <span key={msg} className="field-error">
                {msg}
              </span>
            ))}
          </div>

          {formError && <p className="form-error">{formError}</p>}

          <button type="submit" className="button login-submit" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="login-footnote">
          Accounts are created by an administrator. Contact your supervisor if
          you need access.
        </p>
      </div>
    </div>
  );
}
