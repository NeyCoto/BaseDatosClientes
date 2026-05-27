import { UserRole, USER_ROLES } from "../../types";

interface UserFiltersProps {
  search: string;
  role: UserRole | "";
  onSearchChange: (v: string) => void;
  onRoleChange: (v: UserRole | "") => void;
  total: number;
}

export function UserFilters({
  search,
  role,
  onSearchChange,
  onRoleChange,
  total,
}: UserFiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "320px" }}>
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontSize: "14px",
            pointerEvents: "none",
          }}
        >
          ⌕
        </span>
        <input
          className="input"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by username…"
          style={{ paddingLeft: "32px" }}
        />
      </div>

      {/* Role filter */}
      <select
        className="input"
        value={role}
        onChange={(e) => onRoleChange(e.target.value as UserRole | "")}
        style={{ width: "auto", minWidth: "140px" }}
      >
        <option value="">All roles</option>
        {USER_ROLES.map((r) => (
          <option key={r} value={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </option>
        ))}
      </select>

      {/* Result count */}
      <span
        style={{
          marginLeft: "auto",
          fontSize: "12px",
          fontFamily: "var(--font-mono)",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        {total} {total === 1 ? "user" : "users"}
      </span>
    </div>
  );
}
