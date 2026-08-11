import { Campaign } from "../../types";

interface CustomerFiltersProps {
  search: string;
  campaignId: string;
  campaigns: Campaign[];
  total: number;
  onSearchChange: (v: string) => void;
  onCampaignChange: (v: string) => void;
}

export function CustomerFilters({
  search,
  campaignId,
  campaigns,
  total,
  onSearchChange,
  onCampaignChange,
}: CustomerFiltersProps) {
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
          maxWidth: "300px",
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
          placeholder="Search name, email, phone…"
          style={{ paddingLeft: "32px" }}
        />
      </div>

      {/* Campaign filter */}
      <select
        className="input"
        value={campaignId}
        onChange={(e) => onCampaignChange(e.target.value)}
        style={{ width: "auto", minWidth: "150px" }}
      >
        <option value="">All campaigns</option>
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
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
        {total} {total === 1 ? "customer" : "customers"}
      </span>
    </div>
  );
}
