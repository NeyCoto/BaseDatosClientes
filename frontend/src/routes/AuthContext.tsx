import {
  createContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AuthContextValue, AuthUser, LoginRequest } from "../types";
import { loginRequest } from "../services/auth.service";
import { storage } from "../utils/storage";

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser]   = useState<AuthUser | null>(storage.getUser);
  const [token, setToken] = useState<string | null>(storage.getToken);

  const login = useCallback(async (credentials: LoginRequest) => {
    const result = await loginRequest(credentials);
    storage.setToken(result.token);
    storage.setUser(result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    storage.clear();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: token !== null && user !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
