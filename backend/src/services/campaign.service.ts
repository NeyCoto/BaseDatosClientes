import { AppError } from "../types";
import {
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignListQueryInput,
} from "../config/campaign.schemas";
import {
  CampaignRow,
  PaginatedCampaigns,
  DeleteCampaignResult,
} from "../types/campaign.types";
import {
  findCampaigns,
  findCampaignById,
  insertCampaign,
  updateCampaignById,
  deleteCampaignById,
} from "../repositories/campaign.repository";

// ─── List campaigns ───────────────────────────────────────────────────────────

export async function listCampaigns(
  query: CampaignListQueryInput
): Promise<PaginatedCampaigns> {
  return findCampaigns({
    page: query.page,
    limit: query.limit,
    search: query.search,
    is_active: query.is_active,
  });
}

// ─── Get one campaign ─────────────────────────────────────────────────────────

export async function getCampaign(id: string): Promise<CampaignRow> {
  const campaign = await findCampaignById(id);
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }
  return campaign;
}

// ─── Create campaign ──────────────────────────────────────────────────────────
// created_by is taken from req.user.id in the controller — never from the body.

export async function createCampaign(
  input: CreateCampaignInput,
  createdBy: string
): Promise<CampaignRow> {
  return insertCampaign({
    name: input.name,
    description: input.description,
    is_active: input.is_active,
    created_by: createdBy,
  });
}

// ─── Update campaign ──────────────────────────────────────────────────────────

export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput
): Promise<CampaignRow> {
  // Confirm the campaign exists before attempting update
  const existing = await findCampaignById(id);
  if (!existing) {
    throw new AppError("Campaign not found", 404);
  }

  const updated = await updateCampaignById(id, {
    name: input.name,
    description: input.description,
    is_active: input.is_active,
  });

  if (!updated) {
    throw new AppError("Failed to update campaign", 500);
  }

  return updated;
}

// ─── Delete campaign ──────────────────────────────────────────────────────────

export async function removeCampaign(id: string): Promise<DeleteCampaignResult> {
  const existing = await findCampaignById(id);
  if (!existing) {
    throw new AppError("Campaign not found", 404);
  }

  const deleted = await deleteCampaignById(id);
  if (!deleted) {
    throw new AppError("Failed to delete campaign", 500);
  }

  return deleted;
}
