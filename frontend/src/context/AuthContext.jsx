import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearPersistedAuth,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
  loginWithPhone,
  persistAuth,
  registerWithPhone,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState("");

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken("");
    clearPersistedAuth();
  }, []);

  const logout = useCallback(() => {
    setAuthError("");
    clearAuth();
  }, [clearAuth]);

  const login = useCallback(async ({ phone, password }) => {
    setAuthError("");
    const response = await loginWithPhone({ phone, password });
    persistAuth(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async ({ full_name, phone, password }) => {
    setAuthError("");
    const response = await registerWithPhone({ full_name, phone, password });
    persistAuth(response.access_token, response.user);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const restoreSession = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setIsLoadingAuth(false);
      return;
    }

    try {
      const meResponse = await getCurrentUser(storedToken);
      persistAuth(storedToken, meResponse.user);
      setToken(storedToken);
      setUser(meResponse.user);
      setAuthError("");
    } catch {
      clearAuth();
      setAuthError("auth.errors.sessionExpired");
    } finally {
      setIsLoadingAuth(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoadingAuth,
      authError,
      setAuthError,
      login,
      register,
      logout,
    }),
    [authError, isLoadingAuth, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
