import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../services/campaigns.service";
import {
  Campaign,
  PaginatedCampaigns,
  CampaignListParams,
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from "../types";
import { getErrorMessage } from "../services/api";

interface UseCampaignsReturn {
  data: PaginatedCampaigns | null;
  loading: boolean;
  error: string | null;
  search: string;
  isActive: "true" | "false" | "";
  page: number;
  setSearch: (v: string) => void;
  setIsActive: (v: "true" | "false" | "") => void;
  setPage: (v: number) => void;
  refetch: () => void;
  handleCreate: (body: CreateCampaignRequest) => Promise<Campaign>;
  handleUpdate: (id: string, body: UpdateCampaignRequest) => Promise<Campaign>;
  handleDelete: (id: string) => Promise<void>;
}

export function useCampaigns(): UseCampaignsReturn {
  const [data, setData]        = useState<PaginatedCampaigns | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);
  const [search, setSearchRaw] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isActive, setIsActiveRaw] = useState<"true" | "false" | "">("");
  const [page, setPage]        = useState(1);
  const debounceRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search — 350ms, resets to page 1 — mirrors useCustomers.ts
  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 350);
  }, []);

  const setIsActive = useCallback((value: "true" | "false" | "") => {
    setIsActiveRaw(value);
    setPage(1);
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: CampaignListParams = { page, limit: 10 };
      if (debouncedSearch) params.search    = debouncedSearch;
      if (isActive)        params.is_active = isActive;
      const result = await getCampaigns(params);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, isActive]);

  useEffect(() => {
    void fetchCampaigns();
  }, [fetchCampaigns]);

  // ─── CRUD operations ──────────────────────────────────────────────────────

  const handleCreate = useCallback(
    async (body: CreateCampaignRequest): Promise<Campaign> => {
      const campaign = await createCampaign(body);
      void fetchCampaigns();
      return campaign;
    },
    [fetchCampaigns]
  );

  const handleUpdate = useCallback(
    async (id: string, body: UpdateCampaignRequest): Promise<Campaign> => {
      const campaign = await updateCampaign(id, body);
      void fetchCampaigns();
      return campaign;
    },
    [fetchCampaigns]
  );

  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      await deleteCampaign(id);
      void fetchCampaigns();
    },
    [fetchCampaigns]
  );

  return {
    data,
    loading,
    error,
    search,
    isActive,
    page,
    setSearch,
    setIsActive,
    setPage,
    refetch: fetchCampaigns,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
