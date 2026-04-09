import { useAuthStore } from '../store/auth.store';

/**
 * Hook truy cập thông tin xác thực của người dùng hiện tại.
 * Bao gồm userId, role và các hành động setAuth / clearAuth.
 */
export function useAuth() {
  return useAuthStore((state) => ({
    userId: state.userId,
    role: state.role,
    setAuth: state.setAuth,
    clearAuth: state.clearAuth,
  }));
}
