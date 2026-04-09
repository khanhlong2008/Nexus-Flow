import { type ElementType } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BadgeCheck,
  BarChart2,
  Building2,
  CheckSquare,
  FilePlus,
  FileText,
  LayoutDashboard,
  LogOut,
  PieChart,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

const ICONS: Record<string, ElementType<{ size?: number }>> = {
  FilePlus,
  FileText,
  CheckSquare,
  BarChart2,
  BadgeCheck,
  LayoutDashboard,
  Building2,
  PieChart,
  ScrollText,
  ShieldCheck,
};

const ROLE_LABEL: Record<string, string> = {
  STAFF: 'Nhân viên',
  BRANCH_LEAD: 'Trưởng chi nhánh',
  DIRECTOR: 'Giám đốc',
  ADMIN: 'Quản trị viên',
};

export function MainLayout() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const initial = user.name.slice(0, 1).toUpperCase();

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">Nexus Flow</div>

        <nav>
          <ul className="menu-list">
            {user.menu.map((item) => {
              const Icon = ICONS[item.icon] ?? FileText;
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <p className="muted-small">Hệ thống phê duyệt nội bộ</p>
            <h1>{user.branchName ? `Chi nhánh ${user.branchName}` : 'Trụ sở chính'}</h1>
          </div>

          <div className="user-chip">
            <div className="avatar">{initial}</div>
            <div>
              <p>{user.name}</p>
              <span>{ROLE_LABEL[user.role] ?? user.role}</span>
            </div>
            <button type="button" className="btn ghost" onClick={handleLogout}>
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
