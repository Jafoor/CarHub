import { useAuthStore } from "@/lib/store/auth-store";

export function useAuth() {
  const { user, tokens, isAuthenticated, setAuth, setUser, setTokens, clearAuth } =
    useAuthStore();

  return {
    user,
    tokens,
    isAuthenticated,
    setAuth,
    setUser,
    setTokens,
    clearAuth,
  };
}
