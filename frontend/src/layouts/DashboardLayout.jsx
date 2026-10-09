import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function navClass({ isActive }) {
  return `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-brand-700 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;
}

export default function DashboardLayout() {
  const { user, logout, dashboardPath } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: dashboardPath, label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'user'] },
    { to: '/tasks', label: 'Tasks', icon: ClipboardList, roles: ['admin', 'manager', 'user'] },
    { to: '/users', label: 'Users', icon: Users, roles: ['admin'] },
    { to: '/activity-logs', label: 'Activity Logs', icon: Activity, roles: ['admin'] },
    { to: '/profile', label: 'Profile', icon: User, roles: ['admin', 'manager', 'user'] },
  ].filter((l) => l.roles.includes(user?.role));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-navy-900 text-white transition md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <Link to={dashboardPath} className="text-lg font-semibold tracking-tight">
            TaskFlow
          </Link>
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass} onClick={() => setMobileOpen(false)}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden text-sm text-slate-500 md:block">
            Signed in as <span className="font-medium text-slate-800">{user?.name}</span>
            <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs capitalize text-brand-800">
              {user?.role}
            </span>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
