import { useMemo, type ElementType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  BadgeCheck,
  Building2,
  CheckSquare,
  FileText,
  FilePlus,
  LayoutDashboard,
  LogOut,
  PieChart,
  ScrollText,
  ShieldCheck,
  type LucideProps,
} from 'lucide-react';

import { useAuthStore } from '../store/auth.store';
import { useSidebarStore } from '../store/sidebar.store';
import { useSidebar } from '../hooks/useSidebar';
import { buildMenuForRole } from '../lib/menu.config';
import type { MenuItem } from '../types/menu';

// ─── Ánh xạ icon name → Lucide component ────────────────────────────────────
const ICON_MAP: Record<string, ElementType<LucideProps>> = {
  FilePlus,
  FileText,
  CheckSquare,
  BadgeCheck,
  LayoutDashboard,
  ShieldCheck,
  BarChart2,
  Building2,
  PieChart,
  ScrollText,
};

// ─── Nhãn hiển thị cho từng Role ────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  STAFF:       'Nhân viên',
  BRANCH_LEAD: 'Trưởng chi nhánh',
  DIRECTOR:    'Giám đốc',
  ADMIN:       'Quản trị viên',
};

// ─── Màu Badge theo Role ─────────────────────────────────────────────────────
const ROLE_BADGE_COLORS: Record<string, string> = {
  STAFF:       'bg-sky-500/20     text-sky-300',
  BRANCH_LEAD: 'bg-emerald-500/20 text-emerald-300',
  DIRECTOR:    'bg-violet-500/20  text-violet-300',
  ADMIN:       'bg-rose-500/20    text-rose-300',
};

// ─── NavItem ─────────────────────────────────────────────────────────────────
function NavItem({ item }: { item: MenuItem }) {
  const Icon = ICON_MAP[item.icon] ?? FileText;

  return (
    <li>
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          [
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white',
          ].join(' ')
        }
      >
        <Icon size={17} aria-hidden="true" />
        <span>{item.label}</span>
      </NavLink>
    </li>
  );
}

// ─── MainLayout ───────────────────────────────────────────────────────────────
export function MainLayout() {
  const { userId, role, clearAuth } = useAuthStore();
  const { userName } = useSidebarStore();
  const navigate = useNavigate();

  // Fetch menu từ API và đồng bộ userName vào store
  useSidebar(userId);

  // Lọc menu phía client theo role
  const menuItems = useMemo(() => buildMenuForRole(role), [role]);

  const badgeClass =
    ROLE_BADGE_COLORS[role ?? ''] ?? 'bg-slate-500/20 text-slate-300';
  const roleLabel = ROLE_LABELS[role ?? ''] ?? (role ?? '');

  // Ký tự đầu để hiển thị avatar
  const avatarChar = (userName ?? 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">

      {/* ══ SIDEBAR ══════════════════════════════════════════════════════════ */}
      <aside className="flex w-64 flex-shrink-0 flex-col bg-slate-900">

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-slate-700/60 px-5 py-4">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
            <LayoutDashboard size={15} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            Nexus Flow
          </span>
        </div>

        {/* Navigation */}
        <nav aria-label="Menu chính" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {menuItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </ul>
        </nav>

        {/* Mini user card */}
        <div className="border-t border-slate-700/60 px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white"
            >
              {avatarChar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {userName ?? '—'}
              </p>
              <span
                className={`mt-0.5 inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}
              >
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ══ CONTENT AREA ════════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          {/* Slot cho page title (có thể mở rộng sau) */}
          <span />

          {/* Right: tên nhân viên + role badge + logout */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {userName ?? '—'}
              </p>
              <p className="text-xs text-slate-400 leading-tight">{roleLabel}</p>
            </div>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}
            >
              {roleLabel}
            </span>

            <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} aria-hidden="true" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
