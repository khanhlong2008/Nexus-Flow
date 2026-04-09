import {
  BadgeCheck,
  CheckSquare,
  FileText,
  FilePlus,
  LayoutDashboard,
  ShieldCheck,
  type LucideProps,
} from 'lucide-react';
import { useMemo, type ElementType } from 'react';
import type { MenuItem, UserRole } from '../types/menu';
import { useAuth } from '../hooks/useAuth';

// Map icon name (string) → Lucide component
const ICON_MAP: Record<string, ElementType<LucideProps>> = {
  FilePlus,
  FileText,
  CheckSquare,
  BadgeCheck,
  LayoutDashboard,
  ShieldCheck,
};

interface NavItem extends MenuItem {
  /** Danh sách role được phép nhìn thấy mục này */
  roles: UserRole[];
}

/**
 * Mảng navigation trung tâm — nguồn dữ liệu duy nhất cho Sidebar.
 * Mỗi mục khai báo rõ role nào được hiển thị.
 */
const navigation: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    roles: ['STAFF', 'BRANCH_LEAD', 'DIRECTOR', 'ADMIN'],
  },
  {
    id: 'create-request',
    label: 'Tạo yêu cầu',
    path: '/requests/create',
    icon: 'FilePlus',
    roles: ['STAFF'],
  },
  {
    id: 'branch-approve',
    label: 'Duyệt chi nhánh',
    path: '/requests/branch-approve',
    icon: 'CheckSquare',
    roles: ['BRANCH_LEAD'],
  },
  {
    id: 'system-approve',
    label: 'Phê duyệt hệ thống',
    path: '/requests/system-approve',
    icon: 'BadgeCheck',
    roles: ['DIRECTOR'],
  },
  {
    id: 'admin',
    label: 'Quản trị',
    path: '/admin',
    icon: 'ShieldCheck',
    roles: ['ADMIN'],
  },
];

/**
 * Lọc mảng navigation theo role của user hiện tại.
 * Trả về mảng rỗng khi role là null (chưa đăng nhập).
 */
function filterByRole(role: UserRole | null): NavItem[] {
  if (!role) return [];
  return navigation.filter((item) => item.roles.includes(role));
}

interface SidebarProps {
  /** Path hiện tại để highlight active item */
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

function SidebarItem({
  item,
  isActive,
  onNavigate,
}: {
  item: MenuItem;
  isActive: boolean;
  onNavigate?: (path: string) => void;
}) {
  const Icon = ICON_MAP[item.icon] ?? FileText;

  return (
    <li>
      <button
        type="button"
        onClick={() => onNavigate?.(item.path)}
        aria-current={isActive ? 'page' : undefined}
        className={[
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-indigo-600 text-white'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white',
        ].join(' ')}
      >
        <Icon size={18} aria-hidden="true" />
        <span>{item.label}</span>
      </button>
    </li>
  );
}

export function Sidebar({ currentPath = '', onNavigate }: SidebarProps) {
  const { role } = useAuth();

  const menuItems = useMemo(() => filterByRole(role), [role]);

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-800 px-4 py-6">
      {/* Logo / Tên ứng dụng */}
      <div className="mb-8 px-3">
        <span className="text-xl font-bold tracking-tight text-white">
          Nexus&nbsp;Flow
        </span>
      </div>

      {/* Danh sách menu được lọc theo role */}
      <nav aria-label="Menu chính" className="flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={currentPath === item.path}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
