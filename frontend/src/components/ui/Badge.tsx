import { UserRole } from "../../types";

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const isAdmin = role === "admin";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        border: `1px solid ${isAdmin ? "var(--accent)" : "var(--border)"}`,
        color: isAdmin ? "var(--accent)" : "var(--text-muted)",
        background: isAdmin ? "var(--accent-dim)" : "transparent",
      }}
    >
      {role}
    </span>
  );
}

interface StatusBadgeProps {
  active: boolean;
}

export function StatusBadge({ active }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        fontFamily: "var(--font-mono)",
        color: active ? "var(--green)" : "var(--text-muted)",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: active ? "var(--green)" : "var(--text-muted)",
          flexShrink: 0,
        }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
