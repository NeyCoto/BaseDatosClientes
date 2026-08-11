interface CampaignFiltersProps {
  search: string;
  isActive: "true" | "false" | "";
  total: number;
  onSearchChange: (v: string) => void;
  onIsActiveChange: (v: "true" | "false" | "") => void;
}

export function CampaignFilters({
  search,
  isActive,
  total,
  onSearchChange,
  onIsActiveChange,
}: CampaignFiltersProps) {
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
      <div
        style={{
          position: "relative",
          flex: "1",
          minWidth: "200px",
          maxWidth: "320px",
        }}
      >
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
          placeholder="Search by campaign name…"
          style={{ paddingLeft: "32px" }}
        />
      </div>

      {/* Active filter */}
      <select
        className="input"
        value={isActive}
        onChange={(e) =>
          onIsActiveChange(e.target.value as "true" | "false" | "")
        }
        style={{ width: "auto", minWidth: "140px" }}
      >
        <option value="">All campaigns</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
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
        {total} {total === 1 ? "campaign" : "campaigns"}
      </span>
    </div>
  );
}
