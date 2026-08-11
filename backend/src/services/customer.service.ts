import { AppError } from "../types";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListQueryInput,
} from "../config/customer.schemas";
import {
  CustomerWithCampaign,
  PaginatedCustomers,
  DeleteCustomerResult,
} from "../types/customer.types";
import {
  findCustomers,
  findCustomerById,
  insertCustomer,
  updateCustomerById,
  deleteCustomerById,
} from "../repositories/customer.repository";

// ─── List customers ───────────────────────────────────────────────────────────

export async function listCustomers(
  query: CustomerListQueryInput
): Promise<PaginatedCustomers> {
  return findCustomers({
    page: query.page,
    limit: query.limit,
    search: query.search,
    campaign_id: query.campaign_id,
  });
}

// ─── Get one customer ─────────────────────────────────────────────────────────

export async function getCustomer(id: string): Promise<CustomerWithCampaign> {
  const customer = await findCustomerById(id);
  if (!customer) {
    throw new AppError("Customer not found", 404);
  }
  return customer;
}

// ─── Create customer ──────────────────────────────────────────────────────────

export async function createCustomer(
  input: CreateCustomerInput,
  createdBy: string
): Promise<CustomerWithCampaign> {
  return insertCustomer({
    first_name: input.first_name,
    last_name: input.last_name,
    phone: input.phone,
    email: input.email,
    alternative_email: input.alternative_email,
    country: input.country,
    city: input.city,
    campaign_id: input.campaign_id,
    created_by: createdBy,
  });
}

// ─── Update customer ──────────────────────────────────────────────────────────

export async function updateCustomer(
  id: string,
  input: UpdateCustomerInput
): Promise<CustomerWithCampaign> {
  const existing = await findCustomerById(id);
  if (!existing) {
    throw new AppError("Customer not found", 404);
  }

  const updated = await updateCustomerById(id, {
    first_name: input.first_name,
    last_name: input.last_name,
    phone: input.phone,
    email: input.email,
    alternative_email: input.alternative_email,
    country: input.country,
    city: input.city,
    campaign_id: input.campaign_id ?? undefined,
  });

  if (!updated) {
    throw new AppError("Failed to update customer", 500);
  }

  return updated;
}

// ─── Delete customer ──────────────────────────────────────────────────────────

export async function removeCustomer(
  id: string
): Promise<DeleteCustomerResult> {
  const existing = await findCustomerById(id);
  if (!existing) {
    throw new AppError("Customer not found", 404);
  }

  const deleted = await deleteCustomerById(id);
  if (!deleted) {
    throw new AppError("Failed to delete customer", 500);
  }

  return deleted;
}
