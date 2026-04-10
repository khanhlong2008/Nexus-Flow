import type { MenuItem, UserRole } from '../types/menu';

// ─── Toàn bộ menu items của hệ thống ────────────────────────────────────────
export const ALL_MENU_ITEMS: MenuItem[] = [
  // --- Yêu cầu ---
  { id: 'create-request',    label: 'Tạo yêu cầu',          path: '/requests/create',         icon: 'FilePlus'        },
  { id: 'my-requests',       label: 'Yêu cầu của tôi',       path: '/requests/mine',           icon: 'FileText'        },
  // --- Chi nhánh ---
  { id: 'branch-approve',    label: 'Duyệt chi nhánh',       path: '/requests/branch-approve', icon: 'CheckSquare'     },
  { id: 'branch-reports',    label: 'Báo cáo chi nhánh',     path: '/reports/branch',          icon: 'BarChart2'       },
  // --- Hệ thống (Director / Admin) ---
  { id: 'final-approve',     label: 'Phê duyệt',   path: '/requests/final-approve',  icon: 'BadgeCheck'      },
  { id: 'dashboard',         label: 'Tổng quan',              path: '/dashboard',               icon: 'LayoutDashboard' },
  { id: 'branch-management', label: 'Quản lý chi nhánh',      path: '/branches',                icon: 'Building2'       },
  { id: 'report',           label: 'Báo cáo',                path: '/reports',                 icon: 'PieChart'        },
  { id: 'audit-logs',        label: 'Audit Log',              path: '/audit-logs',              icon: 'ScrollText'      },
  { id: 'access-control',    label: 'Phân quyền & Cấu hình', path: '/access-control',          icon: 'ShieldCheck'     },
];

// ─── Ánh xạ role → danh sách id được phép ────────────────────────────────────
const ROLE_MENU_MAP: Record<UserRole, string[]> = {
  STAFF: [
    'create-request',
    'my-requests',
  ],
  BRANCH_LEAD: [
    'create-request',
    'my-requests',
    'branch-approve',
    'branch-reports',
  ],
  DIRECTOR: [
    'final-approve',
    'dashboard',
    'branch-management',
    'report',
    'audit-logs',
    'access-control',
  ],
  ADMIN: [
    'final-approve',
    'dashboard',
    'branch-management',
    'report',
    'audit-logs',
    'access-control',
  ],
};

/**
 * Trả về danh sách MenuItem mà role đó được phép truy cập.
 * Trả về mảng rỗng khi role là null (chưa xác thực).
 */
export function buildMenuForRole(role: UserRole | null): MenuItem[] {
  if (!role) return [];
  const allowedIds = ROLE_MENU_MAP[role] ?? [];
  return ALL_MENU_ITEMS.filter((item) => allowedIds.includes(item.id));
}
