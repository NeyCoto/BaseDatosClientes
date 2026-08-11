import { ReactNode } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: "/dashboard",  label: "Users",      icon: "◈" },
  { path: "/campaigns",  label: "Campaigns",  icon: "◉" },
  { path: "/customers",  label: "Customers",  icon: "◎" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top navbar ── */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <div
          style={{
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
                flexShrink: 0,
              }}
            >
              <span
                style={{ color: "var(--bg)", fontSize: "14px", fontWeight: 800 }}
              >
                C
              </span>
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

          {/* User info */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <nav
          style={{
            width: "200px",
            flexShrink: 0,
            background: "var(--surface)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            padding: "16px 0",
          }}
        >
          <div style={{ flex: 1 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    background: isActive ? "var(--accent-dim)" : "transparent",
                    borderLeft: isActive
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--text)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "var(--surface-2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--text-muted)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "transparent";
                    }
                  }}
                >
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Logout at bottom */}
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "16px 20px 8px",
            }}
          >
            <button
              className="btn-ghost"
              onClick={handleLogout}
              style={{ width: "100%", textAlign: "left", padding: "8px 0" }}
            >
              ↩ Logout
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            padding: "32px 28px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
