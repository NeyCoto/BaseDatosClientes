import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customers.service";
import {
  Customer,
  PaginatedCustomers,
  CustomerListParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "../types";
import { getErrorMessage } from "../services/api";

interface UseCustomersReturn {
  data: PaginatedCustomers | null;
  loading: boolean;
  error: string | null;
  search: string;
  campaignId: string;
  page: number;
  setSearch: (v: string) => void;
  setCampaignId: (v: string) => void;
  setPage: (v: number) => void;
  refetch: () => void;
  handleCreate: (body: CreateCustomerRequest) => Promise<Customer>;
  handleUpdate: (id: string, body: UpdateCustomerRequest) => Promise<Customer>;
  handleDelete: (id: string) => Promise<void>;
}

export function useCustomers(): UseCustomersReturn {
  const [data, setData]        = useState<PaginatedCustomers | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);
  const [search, setSearchRaw] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [campaignId, setCampaignIdRaw] = useState("");
  const [page, setPage]        = useState(1);
  const debounceRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 350);
  }, []);

  const setCampaignId = useCallback((value: string) => {
    setCampaignIdRaw(value);
    setPage(1);
  }, []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CustomerListParams = { page, limit: 10 };
      if (debouncedSearch) params.search      = debouncedSearch;
      if (campaignId)      params.campaign_id = campaignId;
      const result = await getCustomers(params);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, campaignId]);

  useEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const handleCreate = useCallback(
    async (body: CreateCustomerRequest): Promise<Customer> => {
      const customer = await createCustomer(body);
      void fetchCustomers();
      return customer;
    },
    [fetchCustomers]
  );

  const handleUpdate = useCallback(
    async (id: string, body: UpdateCustomerRequest): Promise<Customer> => {
      const customer = await updateCustomer(id, body);
      void fetchCustomers();
      return customer;
    },
    [fetchCustomers]
  );

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      await deleteCustomer(id);
      void fetchCustomers();
    },
    [fetchCustomers]
  );

  return {
    data,
    loading,
    error,
    search,
    campaignId,
    page,
    setSearch,
    setCampaignId,
    setPage,
    refetch: fetchCustomers,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
