import { useState, useEffect, useCallback, useRef } from "react";
import { getUsers } from "../services/users.service";
import { PaginatedUsers, UserRole, UserListParams } from "../types";
import { getErrorMessage } from "../services/api";

interface UseUsersReturn {
  data: PaginatedUsers | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  setSearch: (v: string) => void;
  setRole: (v: UserRole | "") => void;
  setPage: (v: number) => void;
  search: string;
  role: UserRole | "";
  page: number;
}

export function useUsers(): UseUsersReturn {
  const [data, setData]       = useState<PaginatedUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearchRaw] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole]       = useState<UserRole | "">("");
  const [page, setPage]       = useState(1);
  const debounceRef           = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search — wait 350ms after the user stops typing
  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 350);
  }, []);

  const handleSetRole = useCallback((value: UserRole | "") => {
    setRole(value);
    setPage(1);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: UserListParams = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (role) params.role = role;
      const result = await getUsers(params);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, role]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    loading,
    error,
    refetch: fetchUsers,
    setSearch,
    setRole: handleSetRole,
    setPage,
    search,
    role,
    page,
  };
}
