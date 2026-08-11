import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  getCustomersController,
  getCustomerController,
  createCustomerController,
  updateCustomerController,
  deleteCustomerController,
} from "../controllers/customer.controller";
import {
  uploadMiddleware,
  handleMulterError,
  importCustomersController,
} from "../controllers/import.controller";

const router = Router();

/**
 * Customer Routes
 * Mounted at: /api/customers  (registered in server.ts)
 *
 * All routes require a valid JWT (authenticate).
 * Write routes additionally require the admin role (authorize).
 *
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │  Method  │  Path                   │  Auth        │  Description            │
 * ├──────────────────────────────────────────────────────────────────────────────┤
 * │  GET     │  /api/customers         │  any user    │  List (search, filter)  │
 * │  GET     │  /api/customers/:id     │  any user    │  Get one customer       │
 * │  POST    │  /api/customers/import  │  admin only  │  Bulk import from Excel │
 * │  POST    │  /api/customers         │  admin only  │  Create single customer │
 * │  PUT     │  /api/customers/:id     │  admin only  │  Update customer        │
 * │  DELETE  │  /api/customers/:id     │  admin only  │  Delete customer        │
 * └──────────────────────────────────────────────────────────────────────────────┘
 * 
 *  IMPORTANT: POST /import must be registered BEFORE POST / and GET /:id
 * to prevent Express from matching "import" as an :id parameter.
 */

// All routes require authentication
router.use(authenticate);

// Read — any authenticated user
router.get("/",    getCustomersController);

// Import — must come before /:id to avoid route shadowing
router.post(
  "/import",
  authorize("admin"),
  uploadMiddleware,
  handleMulterError,
  importCustomersController
);

// Read single — after /import to avoid shadowing
router.get("/:id", getCustomerController);

// Write — admin only
router.post("/",      authorize("admin"), createCustomerController);
router.put("/:id",    authorize("admin"), updateCustomerController);
router.delete("/:id", authorize("admin"), deleteCustomerController);

export default router;
