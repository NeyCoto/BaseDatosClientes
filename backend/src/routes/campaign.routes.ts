import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  getCampaignsController,
  getCampaignController,
  createCampaignController,
  updateCampaignController,
  deleteCampaignController,
} from "../controllers/campaign.controller";

const router = Router();

/**
 * Campaign Routes
 * Mounted at: /api/campaigns  (registered in server.ts)
 *
 * All routes require a valid JWT (authenticate).
 * Write routes additionally require the admin role (authorize).
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  Method  │  Path               │  Auth          │  Description           │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  GET     │  /api/campaigns     │  any user      │  List (search, filter) │
 * │  GET     │  /api/campaigns/:id │  any user      │  Get one campaign      │
 * │  POST    │  /api/campaigns     │  admin only    │  Create campaign        │
 * │  PUT     │  /api/campaigns/:id │  admin only    │  Update campaign        │
 * │  DELETE  │  /api/campaigns/:id │  admin only    │  Delete campaign        │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

// All routes require authentication
router.use(authenticate);

// Read — any authenticated user
router.get("/",    getCampaignsController);
router.get("/:id", getCampaignController);

// Write — admin only
router.post("/",    authorize("admin"), createCampaignController);
router.put("/:id",  authorize("admin"), updateCampaignController);
router.delete("/:id", authorize("admin"), deleteCampaignController);

export default router;
