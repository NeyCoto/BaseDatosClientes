import { useState } from "react";
import { User, PaginatedUsers } from "../../types";
import { deleteUser } from "../../services/users.service";
import { getErrorMessage } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { RoleBadge, StatusBadge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { Alert } from "../ui/Alert";
import { formatDate } from "../../utils/format";

interface UsersTableProps {
  data: PaginatedUsers | null;
  loading: boolean;
  error: string | null;
  page: number;
  onPageChange: (p: number) => void;
  onDeleted: () => void;
}

export function UsersTable({
  data,
  loading,
  error,
  page,
  onPageChange,
  onDeleted,
}: UsersTableProps) {
  const { user: currentUser } = useAuth();
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [deleteError, setDeleteError]   = useState<string | null>(null);

  async function handleDelete(u: User) {
    if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    setDeletingId(u.id);
    setDeleteError(null);
    try {
      await deleteUser(u.id);
      onDeleted();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Table header */}
      <div className="card-header" style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
        <h2 className="card-title">System Users</h2>
      </div>

      {deleteError && (
        <div style={{ padding: "0 24px 0" }}>
          <Alert type="error" message={deleteError} />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "64px", gap: "12px" }}>
          <Spinner size="lg" />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "13px" }}>
            Loading users…
          </span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ padding: "40px 24px" }}>
          <Alert type="error" message={error} />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data?.items.length === 0 && (
        <div
          style={{
            padding: "64px 24px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.4 }}>◻</div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>No users found</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Try adjusting your search or filters</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && data && data.items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Username", "Role", "Status", "Created", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 24px",
                      textAlign: "left",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 500,
                      color: "var(--text-muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      background: "var(--surface-2)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((u, i) => {
                const isSelf    = u.id === currentUser?.id;
                const isDeleting = deletingId === u.id;
                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: i < data.items.length - 1 ? "1px solid var(--border)" : "none",
                      background: isSelf ? "var(--accent-dim)" : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelf) (e.currentTarget as HTMLTableRowElement).style.background = "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = isSelf ? "var(--accent-dim)" : "transparent";
                    }}
                  >
                    <td style={{ padding: "14px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {/* Avatar */}
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            background: "var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontFamily: "var(--font-mono)",
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            flexShrink: 0,
                          }}
                        >
                          {u.username[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text)" }}>
                          {u.username}
                          {isSelf && (
                            <span style={{ marginLeft: "6px", fontSize: "10px", color: "var(--accent)" }}>
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: "14px 24px" }}>
                      <RoleBadge role={u.role} />
                    </td>

                    <td style={{ padding: "14px 24px" }}>
                      <StatusBadge active={u.is_active} />
                    </td>

                    <td style={{ padding: "14px 24px", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {formatDate(u.created_at)}
                    </td>

                    <td style={{ padding: "14px 24px", textAlign: "right" }}>
                      <button
                        className="btn-danger"
                        onClick={() => void handleDelete(u)}
                        disabled={isSelf || isDeleting}
                        title={isSelf ? "You cannot delete your own account" : `Delete ${u.username}`}
                        style={{ opacity: isSelf ? 0.3 : 1 }}
                      >
                        {isDeleting ? <Spinner size="sm" /> : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
          <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            Page {data.page} of {data.totalPages}
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
