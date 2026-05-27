import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage } from "../services/api";
import { Alert } from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname ?? "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Already logged in → redirect immediately
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ username: username.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background grid pattern */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          opacity: 0.4,
        }}
      />

      {/* Accent glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(ellipse at center, rgba(var(--accent-rgb), 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "380px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span style={{ color: "var(--bg)", fontSize: "20px", fontWeight: 800 }}>C</span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "28px",
              letterSpacing: "-0.02em",
              color: "var(--text)",
              marginBottom: "6px",
            }}
          >
            CMS Admin
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", letterSpacing: "0.05em" }}>
            CUSTOMER MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{ padding: "32px" }}
        >
          <form
            onSubmit={(e) => void handleSubmit(e)}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            <div className="field">
              <label className="label" htmlFor="login-username">Username</label>
              <input
                className="input"
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoFocus
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="login-password">Password</label>
              <input
                className="input"
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            {error && <Alert type="error" message={error} />}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !username || !password}
              style={{ marginTop: "4px", width: "100%" }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                  <Spinner size="sm" /> Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          Access restricted to authorized personnel only
        </p>
      </div>
    </div>
  );
}
