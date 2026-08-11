import { useState } from "react";
import { Campaign, PaginatedCampaigns } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { StatusBadge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { Alert } from "../ui/Alert";
import { formatDate } from "../../utils/format";
import { getErrorMessage } from "../../services/api";

interface CampaignsTableProps {
  data: PaginatedCampaigns | null;
  loading: boolean;
  error: string | null;
  page: number;
  onPageChange: (p: number) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => Promise<void>;
}

const TH_STYLE: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontSize: "11px",
  fontFamily: "var(--font-mono)",
  fontWeight: 500,
  color: "var(--text-muted)",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  background: "var(--surface-2)",
};

const TD_STYLE: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "13px",
  color: "var(--text)",
};

const MUTED: React.CSSProperties = {
  ...TD_STYLE,
  color: "var(--text-muted)",
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  whiteSpace: "nowrap",
};

export function CampaignsTable({
  data,
  loading,
  error,
  page,
  onPageChange,
  onEdit,
  onDelete,
}: CampaignsTableProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(c: Campaign) {
    if (!confirm(`Delete campaign "${c.name}"? This cannot be undone.`)) return;
    setDeletingId(c.id);
    setDeleteError(null);
    try {
      await onDelete(c.id);
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  const headers = [
    "Name",
    "Description",
    "Start Date",
    "End Date",
    "Status",
    "Created",
    ...(isAdmin ? [""] : []),
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Card header */}
      <div
        className="card-header"
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h2 className="card-title">Campaigns</h2>
      </div>

      {deleteError && (
        <div style={{ padding: "12px 24px 0" }}>
          <Alert type="error" message={deleteError} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "64px",
            gap: "12px",
          }}
        >
          <Spinner size="lg" />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
              fontSize: "13px",
            }}
          >
            Loading campaigns…
          </span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ padding: "40px 24px" }}>
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && data?.items.length === 0 && (
        <div
          style={{
            padding: "64px 24px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>
            ◻
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>
            No campaigns found
          </p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && data && data.items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {headers.map((h) => (
                  <th key={h} style={TH_STYLE}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((c, i) => {
                const isDeleting = deletingId === c.id;
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom:
                        i < data.items.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        "transparent";
                    }}
                  >
                    {/* Name */}
                    <td style={TD_STYLE}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            background: "var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {c.name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td
                      style={{
                        ...MUTED,
                        maxWidth: "220px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.description ?? "—"}
                    </td>

                    {/* Status */}
                    <td style={TD_STYLE}>
                      <StatusBadge active={c.is_active} />
                    </td>

                    {/* Created */}
                    <td style={MUTED}>{formatDate(c.created_at)}</td>

                    {/* Actions — admin only */}
                    {isAdmin && (
                      <td
                        style={{
                          ...TD_STYLE,
                          textAlign: "right",
                          paddingRight: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "flex-end",
                          }}
                        >
                          <button
                            className="btn-ghost"
                            style={{ fontSize: "11px", padding: "4px 10px" }}
                            onClick={() => onEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => void handleDelete(c)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? <Spinner size="sm" /> : "Delete"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination — mirrors CustomersTable exactly */}
      {!loading && data && data.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
            }}
          >
            Page {data.page} of {data.totalPages} — {data.total} total
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn-ghost"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              ← Prev
            </button>
            <button
              className="btn-ghost"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= data.totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
