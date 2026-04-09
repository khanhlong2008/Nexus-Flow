import { create } from 'zustand';
import type { AuthUser } from '../types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const AUTH_USER_KEY = 'auth_user';

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (accessToken: string, user: AuthUser) => void;
  clearAuth: () => void;
}

const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
const storedUser = readStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: storedToken,
  user: storedUser,

  setAuth: (accessToken, user) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    set({ accessToken, user });
  },
  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    set({ accessToken: null, user: null });
  },
}));
