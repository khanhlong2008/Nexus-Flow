import { useAuthStore } from '../store/auth.store';

/**
 * Hook truy cập thông tin xác thực của người dùng hiện tại.
 * Bao gồm userId, role và các hành động setAuth / clearAuth.
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    accessToken,
    user,
    userId: user?.id ?? null,
    role: user?.role ?? null,
    setAuth,
    clearAuth,
    isAuthenticated: Boolean(accessToken && user),
  };
}
