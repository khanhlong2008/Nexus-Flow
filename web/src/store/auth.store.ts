import { create } from 'zustand';
import type { UserRole } from '../types/menu';

interface AuthState {
  userId: string | null;
  role: UserRole | null;
  setAuth: (userId: string, role: UserRole) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  role: null,

  setAuth: (userId, role) => set({ userId, role }),
  clearAuth: () => set({ userId: null, role: null }),
}));
