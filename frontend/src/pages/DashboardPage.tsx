import { DashboardLayout } from "../layouts/DashboardLayout";
import { CreateUserForm } from "../components/dashboard/CreateUserForm";
import { UsersTable } from "../components/dashboard/UsersTable";
import { UserFilters } from "../components/dashboard/UserFilters";
import { useUsers } from "../hooks/useUsers";

export function DashboardPage() {
  const {
    data,
    loading,
    error,
    refetch,
    setSearch,
    setRole,
    setPage,
    search,
    role,
    page,
  } = useUsers();

  function handleCreated() {
    refetch();
  }

  function handleDeleted() {
    refetch();
  }

  return (
    <DashboardLayout>
      {/* Page title */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "26px",
            letterSpacing: "-0.02em",
            color: "var(--text)",
            marginBottom: "4px",
          }}
        >
          User Management
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Create, search, filter, and delete system users
        </p>
      </div>

      {/* Two-column layout: form left, table right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left — create form */}
        <div>
          <CreateUserForm onCreated={handleCreated} />
        </div>

        {/* Right — filters + table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <UserFilters
            search={search}
            role={role}
            onSearchChange={setSearch}
            onRoleChange={setRole}
            total={data?.total ?? 0}
          />
          <UsersTable
            data={data}
            loading={loading}
            error={error}
            page={page}
            onPageChange={setPage}
            onDeleted={handleDeleted}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
