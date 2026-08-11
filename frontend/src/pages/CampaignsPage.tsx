import { useState } from "react";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { CampaignFilters } from "../components/campaigns/CampaignFilters";
import { CampaignsTable } from "../components/campaigns/CampaignsTable";
import { CampaignFormModal } from "../components/campaigns/CampaignFormModal";
import { useCampaigns } from "../hooks/useCampaigns";
import { useAuth } from "../hooks/useAuth";
import {
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from "../types";

export function CampaignsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const {
    data,
    loading,
    error,
    search,
    isActive,
    page,
    setSearch,
    setIsActive,
    setPage,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useCampaigns();

  // Modal state
  const [formOpen, setFormOpen]               = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  function openCreate() {
    setEditingCampaign(null);
    setFormOpen(true);
  }

  function openEdit(campaign: Campaign) {
    setEditingCampaign(campaign);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCampaign(null);
  }

  async function handleSave(
    body: CreateCampaignRequest | UpdateCampaignRequest
  ): Promise<Campaign> {
    if (editingCampaign) {
      return handleUpdate(editingCampaign.id, body as UpdateCampaignRequest);
    }
    return handleCreate(body as CreateCampaignRequest);
  }

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
            Campaigns
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Manage marketing campaigns and track their status
          </p>
        </div>

        {/* Admin-only: create button */}
        {isAdmin && (
          <button className="btn-primary" onClick={openCreate}>
            + New Campaign
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "16px" }}>
        <CampaignFilters
          search={search}
          isActive={isActive}
          total={data?.total ?? 0}
          onSearchChange={setSearch}
          onIsActiveChange={setIsActive}
        />
      </div>

      {/* Table */}
      <CampaignsTable
        data={data}
        loading={loading}
        error={error}
        page={page}
        onPageChange={setPage}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Create / Edit modal */}
      <CampaignFormModal
        isOpen={formOpen}
        onClose={closeForm}
        onSave={handleSave}
        campaign={editingCampaign}
      />
    </DashboardLayout>
  );
}
