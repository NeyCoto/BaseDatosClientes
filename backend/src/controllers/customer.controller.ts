import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { AppError } from "../types";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerListQuerySchema,
  customerIdParamSchema,
} from "../config/customer.schemas";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  removeCustomer,
} from "../services/customer.service";
import {
  CustomerWithCampaign,
  PaginatedCustomers,
  DeleteCustomerResult,
} from "../types/customer.types";

// ─── GET /api/customers ───────────────────────────────────────────────────────

export async function getCustomersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = customerListQuerySchema.parse(req.query);
    const result: PaginatedCustomers = await listCustomers(query);

    const body: ApiResponse<PaginatedCustomers> = {
      success: true,
      data: result,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/customers/:id ───────────────────────────────────────────────────

export async function getCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = customerIdParamSchema.parse(req.params);
    const customer: CustomerWithCampaign = await getCustomer(id);

    const body: ApiResponse<CustomerWithCampaign> = {
      success: true,
      data: customer,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/customers ──────────────────────────────────────────────────────

export async function createCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createCustomerSchema.parse(req.body);

    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const customer: CustomerWithCampaign = await createCustomer(
      input,
      req.user.id
    );

    const body: ApiResponse<CustomerWithCampaign> = {
      success: true,
      data: customer,
      message: `Customer "${customer.first_name} ${customer.last_name}" created successfully`,
    };
    res.status(201).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/customers/:id ───────────────────────────────────────────────────

export async function updateCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = customerIdParamSchema.parse(req.params);
    const input = updateCustomerSchema.parse(req.body);
    const customer: CustomerWithCampaign = await updateCustomer(id, input);

    const body: ApiResponse<CustomerWithCampaign> = {
      success: true,
      data: customer,
      message: `Customer "${customer.first_name} ${customer.last_name}" updated successfully`,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/customers/:id ────────────────────────────────────────────────

export async function deleteCustomerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = customerIdParamSchema.parse(req.params);
    const deleted: DeleteCustomerResult = await removeCustomer(id);

    const body: ApiResponse<DeleteCustomerResult> = {
      success: true,
      data: deleted,
      message: `Customer "${deleted.first_name} ${deleted.last_name}" deleted successfully`,
    };
    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
