import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Home, Compass, Bell, Bookmark, Settings, LogOut,
  PenLine, User, Search, Sparkles, TrendingUp, Menu, X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import clsx from 'clsx';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => api.get('/notifications?limit=1').then(r => r.data),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unread_count || 0;

  const navItems = [
    { to: '/', icon: Home, label: 'الرئيسية', auth: false },
    { to: '/explore', icon: Compass, label: 'استكشاف', auth: false },
    ...(isAuthenticated ? [
      { to: '/notifications', icon: Bell, label: 'الإشعارات', auth: true, badge: unreadCount },
      { to: '/bookmarks', icon: Bookmark, label: 'المحفوظات', auth: true },
      { to: `/${user?.username}`, icon: User, label: 'ملفي', auth: true },
      { to: '/settings', icon: Settings, label: 'الإعدادات', auth: true },
    ] : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed top-0 right-0 h-full w-64 bg-surface-50 border-l border-white/5 z-50',
        'flex flex-col transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">QuizZer</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={clsx('nav-link relative', location.pathname === to && 'active')}
            >
              <Icon size={20} />
              <span>{label}</span>
              {badge > 0 && (
                <span className="mr-auto bg-brand-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Compose Button */}
        {isAuthenticated && (
          <div className="p-3 border-t border-white/5">
            <Link
              to="/compose"
              onClick={() => setSidebarOpen(false)}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              <PenLine size={18} />
              إنشاء سؤال
            </Link>
          </div>
        )}

        {/* User / Auth */}
        <div className="p-3 border-t border-white/5">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-100 transition-colors group">
              <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.avatar_url
                  ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-sm font-bold">{user?.display_name?.[0]}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.display_name}</div>
                <div className="text-xs text-slate-500 truncate">@{user?.username}</div>
              </div>
              <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <LogOut size={16} className="text-slate-500 hover:text-red-400 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link to="/login" className="btn-secondary w-full text-center text-sm block py-2.5">تسجيل الدخول</Link>
              <Link to="/register" className="btn-primary w-full text-center text-sm block py-2.5">إنشاء حساب</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:mr-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-4 h-14 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-surface-100">
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-bold text-white">QuizZer</span>
          </Link>
          {isAuthenticated ? (
            <Link to="/compose" className="p-2 rounded-xl hover:bg-surface-100">
              <PenLine size={20} className="text-brand-400" />
            </Link>
          ) : (
            <Link to="/login" className="text-sm text-brand-400 font-medium">دخول</Link>
          )}
        </header>

        {/* Page content */}
        <main className="max-w-2xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
