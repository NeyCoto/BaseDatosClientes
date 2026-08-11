import { useState } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { CustomerFilters } from "../components/customers/CustomerFilters";
import { CustomersTable } from "../components/customers/CustomersTable";
import { CustomerFormModal } from "../components/customers/CustomerFormModal";
import { ImportModal } from "../components/customers/ImportModal";
import { useCustomers } from "../hooks/useCustomers";
import { useCampaigns } from "../hooks/useCampaigns";
import { useAuth } from "../hooks/useAuth";
import { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "../types";

export function CustomersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const {
    data,
    loading,
    error,
    search,
    campaignId,
    page,
    setSearch,
    setCampaignId,
    setPage,
    refetch,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCustomers();

  const { data: campaignData } = useCampaigns();
  const campaigns = campaignData?.items ?? [];

  // ─── Create / Edit modal ────────────────────────────────────────────────────
  const [formOpen, setFormOpen]               = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  function openCreate() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCustomer(null);
  }

  async function handleSave(
    body: CreateCustomerRequest | UpdateCustomerRequest
  ): Promise<Customer> {
    if (editingCustomer) {
      return handleUpdate(editingCustomer.id, body as UpdateCustomerRequest);
    }
    return handleCreate(body as CreateCustomerRequest);
  }

  // ─── Import modal ───────────────────────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false);

  return (
    <DashboardLayout>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "28px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
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
            Customers
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Search, filter, and manage your customer records
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <button className="btn-ghost" onClick={() => setImportOpen(true)}>
              ↑ Import Excel
            </button>
            <button className="btn-primary" onClick={openCreate}>
              + New Customer
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "16px" }}>
        <CustomerFilters
          search={search}
          campaignId={campaignId}
          campaigns={campaigns}
          total={data?.total ?? 0}
          onSearchChange={setSearch}
          onCampaignChange={setCampaignId}
        />
      </div>

      {/* Table */}
      <CustomersTable
        data={data}
        loading={loading}
        error={error}
        page={page}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit modal */}
      <CustomerFormModal
        isOpen={formOpen}
        onClose={closeForm}
        onSave={handleSave}
        customer={editingCustomer}
        campaigns={campaigns}
      />

      {/* Import modal */}
      <ImportModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => refetch()}
      />
    </DashboardLayout>
  );
}
