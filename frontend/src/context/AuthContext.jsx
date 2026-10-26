import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "bluetail_user";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(
    (username, email, password) => authService.register(username, email, password),
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
