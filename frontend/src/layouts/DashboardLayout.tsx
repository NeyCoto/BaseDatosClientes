import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* ── Top navbar ── */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "var(--bg)", fontSize: "14px", fontWeight: 800 }}>C</span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "16px",
                letterSpacing: "0.04em",
                color: "var(--text)",
              }}
            >
              CMS
            </span>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                borderLeft: "1px solid var(--border)",
                paddingLeft: "12px",
                letterSpacing: "0.08em",
              }}
            >
              ADMIN PANEL
            </span>
          </div>

          {/* User info + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text)",
                  fontWeight: 500,
                }}
              >
                {user?.username}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {user?.role}
              </div>
            </div>
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main style={{ flex: 1, maxWidth: "1280px", margin: "0 auto", padding: "32px 24px", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
