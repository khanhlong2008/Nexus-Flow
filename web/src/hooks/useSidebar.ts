import { useEffect } from 'react';
import apiClient from '../lib/api-client';
import { useSidebarStore } from '../store/sidebar.store';
import type { UserWithMenuDto } from '../types/menu';

/**
 * Gọi GET /api/users/:userId/menu để lấy danh sách menu động theo Role.
 * Kết quả được lưu vào Zustand store (useSidebarStore).
 *
 * @param userId - ID của người dùng hiện tại (lấy từ auth context/store)
 */
export function useSidebar(userId: string | null) {
  const { setMenuItems, setUserName, setLoading, setError } = useSidebarStore();

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get<UserWithMenuDto>(
          `/users/${userId}/menu`,
        );
        if (!cancelled) {
          setMenuItems(data.menu);
          setUserName(data.name);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Không thể tải menu';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchMenu();

    return () => {
      cancelled = true;
    };
  }, [userId, setMenuItems, setUserName, setLoading, setError]);

  return useSidebarStore((state) => ({
    menuItems: state.menuItems,
    userName: state.userName,
    isLoading: state.isLoading,
    error: state.error,
  }));
}
