import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Crown,
  Home,
  CheckSquare,
  Disc,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

export const UserLayout: React.FC = () => {
  const { user, wallet, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const cachedNotifs = api.getCachedData<any>('/notifications');
  const cachedAnnounce = api.getCachedData<any>('/notifications/announcements');
  const [unreadCount, setUnreadCount] = useState<number>(cachedNotifs?.unreadCount || 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(
    cachedAnnounce?.announcements?.[0]?.content || null
  );
  const [refreshingPath, setRefreshingPath] = useState<string | null>(null);
  const lastClickRef = useRef<{ [key: string]: number }>({});

  // Prevent background scrolling while the mobile drawer menu is open
  useBodyScrollLock(mobileMenuOpen);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleRefresh = (path: string) => {
    setRefreshingPath(path);
    if (path.includes('wallet')) api.invalidateCache('/wallet');
    else if (path.includes('tasks')) api.invalidateCache('/tasks');
    else if (path.includes('spin')) api.invalidateCache('/spin');
    else if (path.includes('withdrawals')) api.invalidateCache('/withdrawals');
    else api.invalidateCache('/user/dashboard');

    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.dispatchEvent(
        new CustomEvent('royal_live_update', {
          detail: { type: 'refresh', timestamp: Date.now() },
        })
      );
    } else {
      navigate(path);
    }
    setTimeout(() => setRefreshingPath(null), 400);
  };

  const handleBottomNavClick = (path: string, e: React.MouseEvent) => {
    const now = Date.now();
    const lastTime = lastClickRef.current[path] || 0;
    if (now - lastTime < 450) {
      e.preventDefault();
      lastClickRef.current[path] = 0;
      handleRefresh(path);
      return;
    }
    lastClickRef.current[path] = now;
  };

  const handleBottomNavDoubleClick = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    lastClickRef.current[path] = 0;
    handleRefresh(path);
  };

  useEffect(() => {
    const fetchUnread = () => {
      if (location.pathname === '/app/notifications') {
        setUnreadCount(0);
        return;
      }
      api.getNotifications({ bypassCache: true })
        .then((res) => {
          const rawNotifs: any[] = res.notifications || [];
          let readAnnounce: string[] = [];
          try {
            readAnnounce = JSON.parse(localStorage.getItem('royal_read_announcements') || '[]');
          } catch {}
          const unread = rawNotifs.filter((n: any) => {
            if (n.isAnnouncement || n.id?.startsWith('announcement_')) {
              return !readAnnounce.includes(n.id) && !n.isRead;
            }
            return !n.isRead;
          }).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    };

    fetchUnread();

    api.getAnnouncements()
      .then((res) => {
        if (res.announcements && res.announcements.length > 0) {
          setAnnouncement(res.announcements[0].content);
        }
      })
      .catch(() => {});

    const handleLiveEvent = (e: any) => {
      if (e.detail?.unreadCount !== undefined) {
        setUnreadCount(e.detail.unreadCount);
      } else if (e.detail?.type === 'notification' || e.detail?.type === 'refresh') {
        fetchUnread();
      }
    };
    window.addEventListener('royal_live_update', handleLiveEvent);
    return () => window.removeEventListener('royal_live_update', handleLiveEvent);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/app', icon: Home },
    { label: 'Tasks & Levels', path: '/app/tasks', icon: CheckSquare },
    { label: 'Royal Spin', path: '/app/spin', icon: Disc, badge: 'Win PKR' },
    { label: 'Wallet', path: '/app/wallet', icon: Wallet },
    { label: 'Deposit', path: '/app/deposits', icon: ArrowDownLeft },
    { label: 'Withdraw', path: '/app/withdrawals', icon: ArrowUpRight },
    { label: 'Notifications', path: '/app/notifications', icon: Bell, badgeCount: location.pathname === '/app/notifications' ? 0 : unreadCount },
    { label: 'Profile', path: '/app/profile', icon: UserIcon },
  ];

  const bottomNavItems = [
    { label: 'Home', path: '/app', icon: Home },
    { label: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { label: 'Spin', path: '/app/spin', icon: Disc },
    { label: 'Withdraw', path: '/app/withdrawals', icon: ArrowUpRight },
    { label: 'Profile', path: '/app/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#08080B] text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#050507]/95 backdrop-blur-xl border-b border-red-950/60 px-2 sm:px-5 lg:px-6 py-2 sm:py-2.5 w-full max-w-full overflow-hidden shadow-lg shadow-black/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 w-full">
          {/* Brand */}
          <Link to="/app" className="flex items-center group flex-shrink-0 min-w-0">
            <div>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-red-400 bg-clip-text text-transparent block leading-tight">
                EARN STREET
              </span>
              <span className="block text-[8px] sm:text-[9px] text-red-400 font-bold tracking-wider uppercase leading-none">
                {user?.phone || 'Official'}
              </span>
            </div>
          </Link>

          {/* Center Desktop Quick Nav */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#100D10] p-1 rounded-xl border border-red-950/60">
            {navItems.slice(0, 5).map((item) => {
              const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm shadow-red-600/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  {item.label}
                  {item.badge && (
                    <span className="bg-amber-400 text-[#050507] text-[8px] font-black px-1.5 py-0.2 rounded-full leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions: CP Box, PKR Box, Notifications & Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Credit Points (CP) Box - Clean & compact */}
            <Link
              to="/app"
              className="flex items-center gap-1 bg-[#120E12] hover:bg-[#191217] border border-red-500/30 hover:border-red-500/60 rounded-lg px-1.5 sm:px-2.5 py-1 transition-all group shadow-2xs"
              title="Credit Points (CP)"
            >
              <span className="text-[8px] sm:text-[9px] text-zinc-400 font-semibold uppercase">CP:</span>
              <span className="text-[10px] sm:text-xs font-bold text-red-400">
                {(wallet?.creditPoints ?? 100).toLocaleString()}
              </span>
            </Link>

            {/* Wallet Balance (PKR) Box - Clean & compact */}
            <Link
              to="/app/wallet"
              className="flex items-center gap-1 bg-[#120E12] hover:bg-[#191217] border border-amber-500/30 hover:border-amber-500/60 rounded-lg px-1.5 sm:px-2.5 py-1 transition-all group shadow-2xs"
              title="PKR Available Balance"
            >
              <span className="text-[8px] sm:text-[9px] text-zinc-400 font-semibold uppercase">PKR:</span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-400">
                {(wallet?.availableBalance || 0).toLocaleString()}
              </span>
            </Link>

            {/* Notification Bell */}
            <Link
              to="/app/notifications"
              onClick={() => setUnreadCount(0)}
              className="relative p-1.5 rounded-lg bg-[#120E12] border border-zinc-800 text-zinc-300 hover:text-white hover:border-red-500 transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && location.pathname !== '/app/notifications' && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#050507] animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Logout Button */}
            <button
              onClick={() => logout()}
              className="hidden sm:flex items-center gap-1 p-1.5 px-2 rounded-lg bg-[#120E12] border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-500/50 transition-all text-[11px] font-medium"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-[#120E12] border border-zinc-800 text-zinc-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer (Popup page with locked background scroll) */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[#050507]/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 h-[100dvh] max-h-screen overflow-hidden overscroll-contain animate-in fade-in duration-200"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Drawer Top Bar */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-red-950/60 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <Crown className="w-6 h-6 text-red-500" />
              <span className="font-extrabold text-lg text-white">EARN STREET</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-white/5 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain py-3 sm:py-4 space-y-3 min-h-0 pr-1 select-none">
            {/* User Profile Card */}
            <div className="p-3 bg-[#110D10] rounded-xl border border-red-500/30">
              <p className="text-xs text-zinc-400">Logged in as</p>
              <p className="font-bold text-white text-base">{user?.name}</p>
              <p className="text-xs text-red-400 font-mono">{user?.phone}</p>
              <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center text-xs">
                <span className="text-zinc-300">Wallet Balance:</span>
                <span className="text-amber-400 font-bold text-sm">
                  PKR {(wallet?.availableBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (item.path === '/app/notifications') {
                      setUnreadCount(0);
                    }
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30 text-zinc-200 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="bg-amber-400 text-[#050507] text-[10px] font-black px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : item.badgeCount && item.badgeCount > 0 ? (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badgeCount}
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Drawer Footer Actions */}
          <div className="pt-3 sm:pt-4 border-t border-zinc-800 flex-shrink-0">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-red-600/15 text-red-400 border border-red-500/30 font-semibold text-sm hover:bg-red-600/25 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-28 md:pb-16 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div key={location.pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050507]/95 backdrop-blur-xl border-t border-red-950/70 px-2 py-2 flex items-center justify-around shadow-2xl select-none"
        style={{ touchAction: 'manipulation' }}
      >
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/app' && location.pathname.startsWith(item.path));
          const isRefreshing = refreshingPath === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => handleBottomNavClick(item.path, e)}
              onDoubleClick={(e) => handleBottomNavDoubleClick(item.path, e)}
              title="Tap to open • Double tap to reload & update data"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative active:scale-95 cursor-pointer ${
                isActive ? 'text-red-500' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-red-500 rounded-full shadow-sm shadow-red-500" />
              )}
              <item.icon className={`w-5 h-5 transition-transform ${isRefreshing ? 'animate-spin text-red-400' : isActive ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-medium mt-1">
                {isRefreshing ? 'Updating...' : item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
