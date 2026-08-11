import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { AppError } from "../types";
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignListQuerySchema,
  campaignIdParamSchema,
} from "../config/campaign.schemas";
import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  removeCampaign,
} from "../services/campaign.service";
import {
  CampaignRow,
  PaginatedCampaigns,
  DeleteCampaignResult,
} from "../types/campaign.types";

// ─── GET /api/campaigns ───────────────────────────────────────────────────────

export async function getCampaignsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = campaignListQuerySchema.parse(req.query);
    const result: PaginatedCampaigns = await listCampaigns(query);

    const body: ApiResponse<PaginatedCampaigns> = {
      success: true,
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/campaigns/:id ───────────────────────────────────────────────────

export async function getCampaignController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = campaignIdParamSchema.parse(req.params);
    const campaign: CampaignRow = await getCampaign(id);

    const body: ApiResponse<CampaignRow> = {
      success: true,
      data: campaign,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/campaigns ──────────────────────────────────────────────────────

export async function createCampaignController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createCampaignSchema.parse(req.body);

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const campaign: CampaignRow = await createCampaign(input, req.user.id);

    const body: ApiResponse<CampaignRow> = {
      success: true,
      data: campaign,
      message: `Campaign "${campaign.name}" created successfully`,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/campaigns/:id ───────────────────────────────────────────────────

export async function updateCampaignController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = campaignIdParamSchema.parse(req.params);
    const input = updateCampaignSchema.parse(req.body);
    const campaign: CampaignRow = await updateCampaign(id, input);

    const body: ApiResponse<CampaignRow> = {
      success: true,
      data: campaign,
      message: `Campaign "${campaign.name}" updated successfully`,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/campaigns/:id ────────────────────────────────────────────────

export async function deleteCampaignController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = campaignIdParamSchema.parse(req.params);
    const deleted: DeleteCampaignResult = await removeCampaign(id);

    const body: ApiResponse<DeleteCampaignResult> = {
      success: true,
      data: deleted,
      message: `Campaign "${deleted.name}" deleted successfully`,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
