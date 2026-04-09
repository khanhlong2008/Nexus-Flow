import { UserRole } from '@prisma/client';

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
}

// Toàn bộ menu items trong hệ thống
const ALL_MENU_ITEMS: MenuItem[] = [
  // --- Yêu cầu ---
  { id: 'create-request',   label: 'Tạo yêu cầu',          path: '/requests/create',         icon: 'FilePlus'        },
  { id: 'my-requests',      label: 'Yêu cầu của tôi',       path: '/requests/mine',           icon: 'FileText'        },
  // --- Chi nhánh ---
  { id: 'branch-approve',   label: 'Duyệt chi nhánh',       path: '/requests/branch-approve', icon: 'CheckSquare'     },
  { id: 'branch-reports',   label: 'Báo cáo chi nhánh',     path: '/reports/branch',          icon: 'BarChart2'       },
  // --- Hệ thống (Director/Admin) ---
  { id: 'final-approve',    label: 'Phê duyệt cuối cùng',   path: '/requests/final-approve',  icon: 'BadgeCheck'      },
  { id: 'dashboard',        label: 'Tổng quan',              path: '/dashboard',               icon: 'LayoutDashboard' },
  { id: 'branch-management',label: 'Quản lý Chi nhánh',      path: '/branches',                icon: 'Building2'       },
  { id: 'reports',          label: 'Báo cáo',                path: '/reports',                 icon: 'PieChart'        },
  { id: 'audit-logs',       label: 'Audit Log',              path: '/audit-logs',              icon: 'ScrollText'      },
  { id: 'access-control',   label: 'Phân quyền & Cấu hình', path: '/access-control',          icon: 'ShieldCheck'     },
];

const ROLE_MENU_MAP: Record<UserRole, string[]> = {
  [UserRole.STAFF]: [
    'create-request',
    'my-requests',
  ],
  [UserRole.BRANCH_LEAD]: [
    'create-request',
    'my-requests',
    'branch-approve',
    'branch-reports',
  ],
  [UserRole.DIRECTOR]: [
    'create-request',
    'my-requests',
    'branch-approve',
    'branch-reports',
    'final-approve',
    'dashboard',
    'branch-management',
    'reports',
    'audit-logs',
  ],
  [UserRole.ADMIN]: [
    'create-request',
    'my-requests',
    'branch-approve',
    'branch-reports',
    'final-approve',
    'dashboard',
    'branch-management',
    'reports',
    'audit-logs',
    'access-control',
  ],
};

export function buildMenuForRole(role: UserRole): MenuItem[] {
  const allowedIds = ROLE_MENU_MAP[role] ?? [];
  return ALL_MENU_ITEMS.filter((item) => allowedIds.includes(item.id));
}
