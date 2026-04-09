import { create } from 'zustand';
import type { MenuItem } from '../types/menu';

interface SidebarState {
  menuItems: MenuItem[];
  userName: string | null;
  isLoading: boolean;
  error: string | null;
  setMenuItems: (items: MenuItem[]) => void;
  setUserName: (name: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  menuItems: [],
  userName: null,
  isLoading: false,
  error: null,

  setMenuItems: (items) => set({ menuItems: items, error: null }),
  setUserName: (name) => set({ userName: name }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () => set({ menuItems: [], userName: null, isLoading: false, error: null }),
}));
