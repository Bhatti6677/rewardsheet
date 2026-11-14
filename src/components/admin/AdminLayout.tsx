import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  CheckSquare,
  FileCheck2,
  Disc,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Share2,
  Receipt,
  Megaphone,
  BarChart3,
  Settings,
  History as HistoryIcon,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Bell,
  Ticket,
  KeyRound,
  ShieldCheck,
  Search,
  User as UserIcon,
  ExternalLink,
  Loader2,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/adminpanal/users': {
    title: 'Member Management',
    subtitle: 'View member accounts, reset passwords with audit logging, and perform balance adjustments.',
  },
  '/adminpanal/mini-admins': {
    title: 'Mini Admin Management',
    subtitle: 'Create and control Mini Admins with unique 10-minute dynamic OTP authentication.',
  },
  '/adminpanal/level-approvals': {
    title: 'Unlock Levels',
    subtitle: 'Approve and unlock VIP tiers (Level 4 through 10) for registered members.',
  },
  '/adminpanal/dashboard': {
    title: 'Administrative Overview',
    subtitle: 'System performance, user metrics, real-time platform activity and summary.',
  },
  '/adminpanal/levels': {
    title: 'Level Management',
    subtitle: 'Configure tier progression rules, completion rewards, and prerequisite thresholds.',
  },
  '/adminpanal/tasks': {
    title: 'Task Management',
    subtitle: 'Create, edit, organize tasks and manage task configuration.',
  },
  '/adminpanal/submissions': {
    title: 'Task Verification Desk',
    subtitle: 'Review proof submissions, verify transactions, and approve member progress.',
  },
  '/adminpanal/spin': {
    title: 'Spin Wheel & Prize Management',
    subtitle: 'Configure lucky wheel prizes, probabilities, and approve milestone spin wins.',
  },
  '/adminpanal/deposits': {
    title: 'Deposit Management',
    subtitle: 'Verify inbound account deposits, bank receipts, and credit balances.',
  },
  '/adminpanal/withdrawals': {
    title: 'Withdrawal Management',
    subtitle: 'Process and disburse withdrawal requests according to level withdrawal quota.',
  },
  '/adminpanal/wallets': {
    title: 'Balance Management Desk',
    subtitle: 'Manual balance and credit point adjustments with audit logging.',
  },
  '/adminpanal/referrals': {
    title: 'Invitation Codes',
    subtitle: 'Manage 6-letter single-use invitation codes and registered Telegram bot clients with referral quotas.',
  },
  '/adminpanal/referral-codes': {
    title: 'Invitation Codes',
    subtitle: 'Manage 6-letter single-use invitation codes and registered Telegram bot clients with referral quotas.',
  },
  '/adminpanal/assigned-codes': {
    title: 'Assigned Codes',
    subtitle: 'View your live available invitation codes and assigned referral activity.',
  },
  '/adminpanal/transactions': {
    title: 'Financial Transactions Ledger',
    subtitle: 'Comprehensive audit trail of all platform financial movements.',
  },
  '/adminpanal/announcements': {
    title: 'Announcement Management',
    subtitle: 'Publish platform notices, alerts, and system broadcast banners.',
  },
  '/adminpanal/reports': {
    title: 'Financial Reports & Intelligence',
    subtitle: 'System cash flow analytics, profit and loss, and transaction metrics.',
  },
  '/adminpanal/settings': {
    title: 'Website Settings',
    subtitle: 'Platform parameters, payment accounts, system rules, and configurations.',
  },
  '/adminpanal/activity-logs': {
    title: 'Administrative Audit Trail',
    subtitle: 'Tamper-proof record of all admin activities and changes.',
  },
  '/adminpanal/developer': {
    title: 'Developer Master Control Panel',
    subtitle: 'Manage Website Maintenance Mode, Master Admin Popup Reminders, and Live Dual-Supabase Sync.',
  },
};

const AdminHeaderUserSearch: React.FC<{ isMiniAdmin: boolean }> = ({ isMiniAdmin }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcuts: Cmd+K / Ctrl+K to focus search, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live debounced search across database
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (isMiniAdmin) {
          const res: any = await api.getAdminSubmissions({ search: trimmed, limit: 6 });
          setResults(res.submissions || []);
        } else {
          const res: any = await api.getAdminUsers({ search: trimmed, limit: 6 });
          setResults(res.users || []);
        }
        setIsOpen(true);
      } catch (err) {
        console.error('Header user search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isMiniAdmin]);

  const handleSelectUser = (user: any, target: 'users' | 'submissions' | 'deposits' | 'withdrawals' = 'users') => {
    setIsOpen(false);
    const identifier = user.phone || user.name || user.id;
    navigate(`/adminpanal/${target}?search=${encodeURIComponent(identifier)}`);
  };

  const handleSelectSubmission = (sub: any) => {
    setIsOpen(false);
    const identifier = sub.user?.phone || sub.user?.name || sub.id;
    navigate(`/adminpanal/submissions?search=${encodeURIComponent(identifier)}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    if (isMiniAdmin) {
      navigate(`/adminpanal/submissions?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`/adminpanal/users?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-2" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen && e.target.value.trim()) setIsOpen(true);
            }}
            placeholder={isMiniAdmin ? "Search Level 1 & 2 submissions by user..." : "Search user (Name, Phone, ID, Referral)..."}
            className="w-full bg-[#F8FAFD] hover:bg-white focus:bg-white border border-[#D9E4F2] focus:border-[#2563EB] rounded-xl pl-9 pr-14 py-2 text-xs text-[#111827] focus:outline-none transition-all placeholder:text-[#9CA3AF] shadow-2xs focus:shadow-sm"
          />
          <div className="absolute right-2 flex items-center gap-1">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setIsOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-[#6B7280] bg-white border border-[#D9E4F2] rounded shadow-3xs pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      </form>

      {/* Floating Live Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-[#D9E4F2] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[440px] flex flex-col">
          <div className="px-3 py-2 border-b border-[#E5E7EB] flex items-center justify-between text-xs">
            <span className="font-bold text-[#111827] flex items-center gap-1.5">
              <span>{isMiniAdmin ? 'Matching Submissions' : 'Matching Members'}</span>
              {!loading && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {results.length}
                </span>
              )}
            </span>
            <span className="text-[10px] text-[#9CA3AF] font-medium hidden sm:inline">Esc to dismiss</span>
          </div>

          <div className="overflow-y-auto divide-y divide-[#F1F5F9] max-h-[340px] py-1">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#6B7280]">
                <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
                <span>Searching {isMiniAdmin ? 'submissions' : 'database for members'}...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">
                No {isMiniAdmin ? 'submissions' : 'members'} found matching "{query}".
              </div>
            ) : isMiniAdmin ? (
              results.map((sub: any) => (
                <div
                  key={sub.id}
                  onClick={() => handleSelectSubmission(sub)}
                  className="p-2.5 hover:bg-[#F8FAFD] rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#111827] truncate">{sub.user?.name || 'Unknown Member'}</span>
                      <span className="text-[10px] font-mono text-[#6B7280]">{sub.user?.phone}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        sub.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        sub.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                      Task: {sub.task?.title || 'Level 1 Task'} • ID: {sub.id.slice(0, 8)}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                </div>
              ))
            ) : (
              results.map((u: any) => (
                <div
                  key={u.id}
                  className="p-2.5 hover:bg-[#F8FAFD] rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div
                    onClick={() => handleSelectUser(u, 'users')}
                    className="min-w-0 flex items-center gap-2.5 cursor-pointer flex-1"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
                      {u.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-[#111827] truncate hover:text-[#2563EB]">{u.name}</span>
                        <span className="text-[10px] font-mono text-[#6B7280]">{u.phone}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.accountStatus === 'SUSPENDED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {u.accountStatus || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#6B7280] mt-0.5">
                        <span className="font-semibold text-emerald-700">
                          Balance: ₨ {(u.wallet?.availableBalance ?? 0).toLocaleString()}
                        </span>
                        {u.referralCode && (
                          <span className="text-[10px] font-mono bg-slate-100 px-1 rounded text-slate-600">
                            Ref: {u.referralCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Shortcuts */}
                  <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectUser(u, 'users')}
                      className="px-2 py-1 text-[11px] font-semibold text-[#2563EB] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                      title="View user details and edit"
                    >
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(u, 'submissions')}
                      className="px-2 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                      title="View user task submissions"
                    >
                      Submissions
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(u, 'deposits')}
                      className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                      title="View user deposit history"
                    >
                      Deposits
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(u, 'withdrawals')}
                      className="px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                      title="View user withdrawal requests"
                    >
                      Withdrawals
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] px-2 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="text-[#2563EB] hover:text-[#1D4ED8] font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View all matching results in {isMiniAdmin ? 'Submissions' : 'Users directory'}</span>
              <span>→</span>
            </button>
            <span className="text-[#9CA3AF] text-[10px]">Press Enter ↵</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminLayout: React.FC = () => {
  const { admin, adminLogout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notificationCounts, setNotificationCounts] = useState<{
    total: number;
    tasks: number;
    submissions: number;
    spins: number;
    deposits: number;
    withdrawals: number;
  }>({
    total: 0,
    tasks: 0,
    submissions: 0,
    spins: 0,
    deposits: 0,
    withdrawals: 0,
  });

  useBodyScrollLock(sidebarOpen);

  const isFetchingRef = useRef(false);

  const fetchNotificationCounts = useCallback(() => {
    if (isFetchingRef.current || (typeof document !== 'undefined' && document.hidden)) {
      return;
    }
    isFetchingRef.current = true;
    api.getAdminNotificationCounts()
      .then((res: any) => {
        if (res?.counts) {
          setNotificationCounts(res.counts);
        }
      })
      .catch(() => {})
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchNotificationCounts();
    // Auto-refresh every 45 seconds when tab is active and visible
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchNotificationCounts();
      }
    }, 45000);

    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchNotificationCounts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleLiveEvent = () => fetchNotificationCounts();
    window.addEventListener('royal_live_update', handleLiveEvent);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('royal_live_update', handleLiveEvent);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fetchNotificationCounts]);

  const currentPath = location.pathname;
  const matchedPage = Object.entries(PAGE_TITLES).find(([path]) =>
    currentPath === path || (path !== '/adminpanal' && currentPath.startsWith(path))
  );
  const pageInfo = matchedPage ? matchedPage[1] : {
    title: 'Earn Street Administration',
    subtitle: 'Light-Mode Control Panel',
  };

  const getItemCount = (path: string) => {
    if (path === '/adminpanal/submissions' || path === '/adminpanal/tasks') {
      return notificationCounts.tasks;
    }
    if (path === '/adminpanal/spin') {
      return notificationCounts.spins;
    }
    if (path === '/adminpanal/deposits') {
      return notificationCounts.deposits;
    }
    if (path === '/adminpanal/withdrawals') {
      return notificationCounts.withdrawals;
    }
    return 0;
  };

  const isMiniAdmin = admin?.role === 'MINI_ADMIN';
  const isDeveloper = admin?.role === 'DEVELOPER';

  // Master Admin / Mini Admin Lock & Maintenance Enforcement (After Login)
  const [adminAccessLock, setAdminAccessLock] = useState<{
    locked: boolean;
    isMaintenance: boolean;
    title: string;
    message: string;
    expectedEnd?: string;
  }>({
    locked: false,
    isMaintenance: false,
    title: '',
    message: '',
    expectedEnd: '',
  });
  const [checkingLockStatus, setCheckingLockStatus] = useState(false);

  // Master Admin Recurring Payment Reminder (strictly SUPER_ADMIN / !isMiniAdmin && !isDeveloper)
  const [showPaymentNotice, setShowPaymentNotice] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    enabled: false,
    title: 'Payment Notice',
    message: 'Payment needs to be updated. Kindly pay the payment to continue working.',
    intervalMinutes: 15,
  });

  // Master Admin Sticky Bottom Notification Ribbon with Marquee Effect (Empty text by default, controlled by Developer)
  const [ribbonConfig, setRibbonConfig] = useState({
    enabled: true,
    text: '',
  });

  const checkAdminLockAndSettings = useCallback(async () => {
    if (isDeveloper) {
      setAdminAccessLock((prev) => (prev.locked ? { ...prev, locked: false } : prev));
      return;
    }
    setCheckingLockStatus(true);
    try {
      const settings: any = await api.getPublicSettings({ bypassCache: true });
      const maintOn = Boolean(settings?.maintenanceMode);
      const masterBlocked = !isMiniAdmin && Boolean(settings?.masterAdminBlocked);
      const miniBlocked = isMiniAdmin && Boolean(settings?.miniAdminBlocked);

      if (maintOn) {
        setAdminAccessLock({
          locked: true,
          isMaintenance: true,
          title: settings?.maintenanceTitle || 'Website is Under Maintenance',
          message:
            settings?.maintenanceMessage ||
            'Website is under maintenance, you cannot work right now. Please wait until the developer completes maintenance.',
          expectedEnd: settings?.maintenanceExpectedEnd || '',
        });
      } else if (masterBlocked || miniBlocked) {
        setAdminAccessLock({
          locked: true,
          isMaintenance: false,
          title: settings?.adminBlockTitle || 'Administrator Access Locked',
          message:
            settings?.adminBlockMessage ||
            'Website is under maintenance, you cannot work right now. Please contact the developer.',
          expectedEnd: '',
        });
      } else {
        setAdminAccessLock((prev) => (prev.locked ? { ...prev, locked: false } : prev));
      }

      if (!isMiniAdmin) {
        const enabled = settings?.masterAdminPopupEnabled === true;
        const title = settings?.masterAdminPopupTitle || 'Payment Notice';
        const message =
          settings?.masterAdminPopupMessage ||
          'Payment needs to be updated. Kindly pay the payment to continue working.';
        const intervalMinutes = Math.max(1, Number(settings?.masterAdminPopupIntervalMinutes) || 15);
        setPopupConfig({ enabled, title, message, intervalMinutes });

        setRibbonConfig({
          enabled: settings?.masterAdminRibbonEnabled !== false,
          text: settings?.masterAdminRibbonText ?? '',
        });
      }
    } catch {
      // Ignore transient errors
    } finally {
      setCheckingLockStatus(false);
    }
  }, [isDeveloper, isMiniAdmin]);

  useEffect(() => {
    checkAdminLockAndSettings();
    const pollTimer = setInterval(checkAdminLockAndSettings, 15000);

    const handleLockedEvent = (e: any) => {
      if (isDeveloper) return;
      const detail = e?.detail || {};
      setAdminAccessLock({
        locked: true,
        isMaintenance: Boolean(detail.adminMaintenance),
        title:
          detail.blockTitle ||
          (detail.adminMaintenance ? 'Website is Under Maintenance' : 'Administrator Access Locked'),
        message:
          detail.blockMessage ||
          detail.error ||
          'Website is under maintenance, you cannot work right now.',
        expectedEnd: '',
      });
    };

    window.addEventListener('royal_admin_locked', handleLockedEvent);
    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('royal_admin_locked', handleLockedEvent);
    };
  }, [checkAdminLockAndSettings, isDeveloper]);

  useEffect(() => {
    if (isMiniAdmin || isDeveloper) {
      setShowPaymentNotice(false);
      return;
    }

    if (!popupConfig.enabled) {
      setShowPaymentNotice(false);
      return;
    }

    setShowPaymentNotice(true);
    const timer = setInterval(() => {
      setShowPaymentNotice(true);
    }, popupConfig.intervalMinutes * 60 * 1000);

    return () => clearInterval(timer);
  }, [isMiniAdmin, isDeveloper, popupConfig.enabled, popupConfig.intervalMinutes]);

  const primaryMenuItems = isMiniAdmin
    ? [
        { label: 'Dashboard', path: '/adminpanal/dashboard', icon: LayoutDashboard },
        { label: 'Submissions', path: '/adminpanal/submissions', icon: FileCheck2 },
        { label: 'Assigned Codes', path: '/adminpanal/assigned-codes', icon: Ticket },
      ]
    : isDeveloper
    ? [
        { label: 'Developer Console', path: '/adminpanal/developer', icon: Terminal },
        { label: 'Website Settings', path: '/adminpanal/settings', icon: Settings },
      ]
    : [
        { label: 'Dashboard', path: '/adminpanal/dashboard', icon: LayoutDashboard },
        { label: 'Users', path: '/adminpanal/users', icon: Users },
        { label: 'Submissions', path: '/adminpanal/submissions', icon: FileCheck2 },
        { label: 'Spin Wheel', path: '/adminpanal/spin', icon: Disc },
        { label: 'Deposit', path: '/adminpanal/deposits', icon: ArrowDownLeft },
        { label: 'Withdrawals', path: '/adminpanal/withdrawals', icon: ArrowUpRight },
        { label: 'Invitation Codes', path: '/adminpanal/referral-codes', icon: Ticket },
        { label: 'Mini Admins', path: '/adminpanal/mini-admins', icon: ShieldCheck },
        { label: 'Unlock Levels', path: '/adminpanal/level-approvals', icon: KeyRound },
      ];

  const moreMenuItems = isMiniAdmin
    ? []
    : isDeveloper
    ? [
        { label: 'Dashboard', path: '/adminpanal/dashboard', icon: LayoutDashboard },
        { label: 'Users', path: '/adminpanal/users', icon: Users },
        { label: 'Submissions', path: '/adminpanal/submissions', icon: FileCheck2 },
        { label: 'Spin Wheel', path: '/adminpanal/spin', icon: Disc },
        { label: 'Deposit', path: '/adminpanal/deposits', icon: ArrowDownLeft },
        { label: 'Withdrawals', path: '/adminpanal/withdrawals', icon: ArrowUpRight },
        { label: 'Invitation Codes', path: '/adminpanal/referral-codes', icon: Ticket },
        { label: 'Mini Admins', path: '/adminpanal/mini-admins', icon: ShieldCheck },
        { label: 'Unlock Levels', path: '/adminpanal/level-approvals', icon: KeyRound },
        { label: 'Levels', path: '/adminpanal/levels', icon: Layers },
        { label: 'Tasks', path: '/adminpanal/tasks', icon: CheckSquare },
        { label: 'Balance Adjustments', path: '/adminpanal/wallets', icon: Wallet },
        { label: 'Transactions', path: '/adminpanal/transactions', icon: Receipt },
        { label: 'Announcements', path: '/adminpanal/announcements', icon: Megaphone },
        { label: 'Reports', path: '/adminpanal/reports', icon: BarChart3 },
        { label: 'Audit Logs', path: '/adminpanal/activity-logs', icon: HistoryIcon },
      ]
    : [
        { label: 'Levels', path: '/adminpanal/levels', icon: Layers },
        { label: 'Tasks', path: '/adminpanal/tasks', icon: CheckSquare },
        { label: 'Balance Adjustments', path: '/adminpanal/wallets', icon: Wallet },
        { label: 'Transactions', path: '/adminpanal/transactions', icon: Receipt },
        { label: 'Announcements', path: '/adminpanal/announcements', icon: Megaphone },
        { label: 'Reports', path: '/adminpanal/reports', icon: BarChart3 },
        { label: 'Website Settings', path: '/adminpanal/settings', icon: Settings },
        { label: 'Audit Logs', path: '/adminpanal/activity-logs', icon: HistoryIcon },
      ];

  const isMoreRouteActive = moreMenuItems.some(
    (item) =>
      location.pathname === item.path ||
      (item.path !== '/adminpanal/dashboard' && location.pathname.startsWith(item.path))
  );

  const [moreOpen, setMoreOpen] = useState(isMoreRouteActive);

  useEffect(() => {
    if (isMoreRouteActive) {
      setMoreOpen(true);
    }
  }, [isMoreRouteActive]);

  const moreItemsCount = moreMenuItems.reduce((acc, item) => acc + getItemCount(item.path), 0);

  const handleLogout = () => {
    adminLogout();
    navigate('/adminpanal');
  };

  // Full-Screen After-Login Maintenance / Admin Lock Screen for Master Admin & Mini Admin
  if (!isDeveloper && adminAccessLock.locked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white flex items-center justify-center p-4 font-sans antialiased">
        <div className="max-w-lg w-full bg-slate-900/90 border border-slate-700/80 rounded-3xl shadow-2xl p-8 text-center space-y-6 backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              {adminAccessLock.isMaintenance ? 'Website Under Maintenance' : 'Admin Access Locked'}
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {adminAccessLock.title || 'Website is Under Maintenance'}
            </h1>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-slate-200 font-medium leading-relaxed">
            {adminAccessLock.message ||
              'Website is under maintenance, you cannot work right now. Please wait until the developer completes maintenance.'}
            {adminAccessLock.expectedEnd && (
              <p className="mt-3 pt-3 border-t border-slate-700 text-xs font-bold text-amber-300">
                Expected Completion: {adminAccessLock.expectedEnd}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-400">
            Logged in as <strong className="text-slate-200">{admin?.username || 'Administrator'}</strong> ({isMiniAdmin ? 'Mini Admin' : 'Master Admin'}). Only the Developer can unlock or disable Maintenance Mode.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={checkAdminLockAndSettings}
              disabled={checkingLockStatus}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {checkingLockStatus ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Check Status / Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-[#111827] flex font-sans antialiased">
      {/* Desktop Sidebar (240px) */}
      <aside className={`hidden lg:flex w-60 bg-white border-r ${isMiniAdmin ? 'mini-sidebar-water shadow-md shadow-sky-500/5' : 'border-[#D9E4F2]'} flex-col flex-shrink-0 z-30 transition-all`}>
        {/* Brand Header */}
        <div className="h-16 border-b border-[#D9E4F2] px-6 flex items-center justify-between bg-white">
          <Link to="/adminpanal/dashboard" className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white shadow-sm shadow-[#2563EB]/30 ${isMiniAdmin ? 'mini-water-ripple-cyan' : ''}`}>
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-[#111827] block">
                ROYAL ADMIN
              </span>
              <span className={`text-[10px] font-medium block -mt-1 ${isMiniAdmin ? 'text-sky-600 font-bold' : 'text-[#6B7280]'}`}>
                {isMiniAdmin ? 'Mini Admin Desk' : 'Management Portal'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {primaryMenuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/adminpanal/dashboard' && location.pathname.startsWith(item.path));
            const count = getItemCount(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? isMiniAdmin
                      ? 'bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-teal-500/15 text-[#0284c7] border border-sky-400/40 shadow-xs mini-water-surface'
                      : 'bg-[#EAF2FF] text-[#2563EB]'
                    : isMiniAdmin
                    ? 'text-[#4B5563] hover:bg-sky-50/60 hover:text-sky-900 mini-water-table-row'
                    : 'text-[#4B5563] hover:bg-[#F8FAFD] hover:text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? (isMiniAdmin ? 'text-sky-600' : 'text-[#2563EB]') : 'text-[#6B7280]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {count > 0 && (
                  <span className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-red-600 rounded-full shadow-sm leading-none">
                      {count}
                    </span>
                  </span>
                )}
              </Link>
            );
          })}

          {!isMiniAdmin && moreMenuItems.length > 0 && (
            <div className="pt-2 border-t border-[#E5EBF4] mt-2">
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isMoreRouteActive
                    ? 'text-[#2563EB] bg-[#F0F5FF]'
                    : 'text-[#4B5563] hover:bg-[#F8FAFD] hover:text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MoreHorizontal className="w-4 h-4 flex-shrink-0 text-[#6B7280]" />
                  <span className="truncate font-semibold">More Options</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                  {!moreOpen && moreItemsCount > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-red-600 rounded-full shadow-sm leading-none">
                      {moreItemsCount}
                    </span>
                  )}
                  {moreOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                  )}
                </div>
              </button>

              {moreOpen && (
                <div className="mt-1 space-y-1 pl-2 border-l-2 border-[#D9E4F2] ml-3.5 pt-0.5">
                  {moreMenuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/adminpanal/dashboard' && location.pathname.startsWith(item.path));
                    const count = getItemCount(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-[#EAF2FF] text-[#2563EB]'
                            : 'text-[#4B5563] hover:bg-[#F8FAFD] hover:text-[#111827]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-[#2563EB]' : 'text-[#6B7280]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {count > 0 && (
                          <span className="flex items-center gap-1 ml-auto flex-shrink-0">
                            <span className="min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-600 rounded-full shadow-sm leading-none">
                              {count}
                            </span>
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Admin User Footer Profile */}
        <div className="p-3 border-t border-[#D9E4F2] bg-[#F8FAFD]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs flex items-center justify-center">
                {admin?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#111827] truncate">{admin?.username || 'Admin'}</p>
                <p className="text-[10px] text-[#6B7280] truncate font-semibold">
                  {admin?.role === 'DEVELOPER'
                    ? 'Developer Master Console'
                    : admin?.role === 'MINI_ADMIN'
                    ? 'Mini Admin (Submissions Only)'
                    : 'Master Admin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-2xl">
            <div className="h-16 border-b border-[#D9E4F2] px-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#2563EB]" />
                <span className="font-bold text-sm text-[#111827]">ROYAL ADMIN</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {primaryMenuItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/adminpanal/dashboard' && location.pathname.startsWith(item.path));
                const count = getItemCount(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-[#EAF2FF] text-[#2563EB]' : 'text-[#4B5563] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {count > 0 && (
                      <span className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-red-600 rounded-full shadow-sm leading-none">
                          {count}
                        </span>
                      </span>
                    )}
                  </Link>
                );
              })}

              {!isMiniAdmin && moreMenuItems.length > 0 && (
                <div className="pt-2 border-t border-[#E5EBF4] mt-2">
                  <button
                    type="button"
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isMoreRouteActive
                        ? 'text-[#2563EB] bg-[#F0F5FF]'
                        : 'text-[#4B5563] hover:bg-[#F8FAFD]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MoreHorizontal className="w-4 h-4 flex-shrink-0 text-[#6B7280]" />
                      <span className="truncate font-semibold">More Options</span>
                    </div>
                    <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                      {!moreOpen && moreItemsCount > 0 && (
                        <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black text-white bg-red-600 rounded-full shadow-sm leading-none">
                          {moreItemsCount}
                        </span>
                      )}
                      {moreOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      )}
                    </div>
                  </button>

                  {moreOpen && (
                    <div className="mt-1 space-y-1 pl-2 border-l-2 border-[#D9E4F2] ml-3.5 pt-0.5">
                      {moreMenuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/adminpanal/dashboard' && location.pathname.startsWith(item.path));
                        const count = getItemCount(item.path);

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                              isActive ? 'bg-[#EAF2FF] text-[#2563EB]' : 'text-[#4B5563] hover:bg-[#F8FAFD]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {count > 0 && (
                              <span className="flex items-center gap-1 ml-auto flex-shrink-0">
                                <span className="min-w-[16px] h-[16px] px-1 flex items-center justify-center text-[9px] font-black text-white bg-red-600 rounded-full shadow-sm leading-none">
                                  {count}
                                </span>
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 sm:h-18 bg-white border-b border-[#D9E4F2] px-3 sm:px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#4B5563] hover:bg-[#F8FAFD] rounded-lg border border-[#D9E4F2] flex-shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0 hidden md:block">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-[#111827] truncate">
                {pageInfo.title}
              </h1>
              <p className="text-[11px] sm:text-xs text-[#6B7280] truncate max-w-xs lg:max-w-md hidden sm:block">
                {pageInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Persistent Global User Search - Available across ALL Admin Pages */}
          <AdminHeaderUserSearch isMiniAdmin={isMiniAdmin} />

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Notification Bell with Dot Badge & Quantity Count */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-[#4B5563] hover:text-[#111827] hover:bg-[#F8FAFD] rounded-lg border border-[#D9E4F2] transition-colors cursor-pointer"
                title={`${notificationCounts.total} Pending Notifications`}
              >
                <Bell className="w-5 h-5" />
                {notificationCounts.total > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-600 text-[10px] font-black text-white shadow ring-2 ring-white animate-pulse">
                    {notificationCounts.total}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#D9E4F2] p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                    <span className="font-bold text-[#111827]">Pending Reviews & Submissions</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                      {notificationCounts.total} Pending
                    </span>
                  </div>

                  <div className="py-2 space-y-1">
                    <Link
                      to="/adminpanal/submissions"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFD] text-[#374151] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${notificationCounts.tasks > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
                        Task Submissions
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        notificationCounts.tasks > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {notificationCounts.tasks}
                      </span>
                    </Link>

                    <Link
                      to="/adminpanal/spin"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFD] text-[#374151] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${notificationCounts.spins > 0 ? 'bg-purple-500 animate-pulse' : 'bg-slate-300'}`} />
                        Spin Reviews & Claims
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        notificationCounts.spins > 0 ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {notificationCounts.spins}
                      </span>
                    </Link>

                    <Link
                      to="/adminpanal/deposits"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFD] text-[#374151] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${notificationCounts.deposits > 0 ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                        Deposit Requests
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        notificationCounts.deposits > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {notificationCounts.deposits}
                      </span>
                    </Link>

                    <Link
                      to="/adminpanal/withdrawals"
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFD] text-[#374151] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${notificationCounts.withdrawals > 0 ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                        Withdrawal Requests
                      </span>
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        notificationCounts.withdrawals > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {notificationCounts.withdrawals}
                      </span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 bg-[#F8FAFD] px-3 py-1.5 rounded-lg border border-[#D9E4F2] text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#111827]">Live Synchronized</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 ${!isMiniAdmin && !isDeveloper && ribbonConfig.enabled ? 'pb-16' : ''}`}>
          <div key={location.pathname} className="animate-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Master Admin Sticky Bottom Animated Marquee Notification Ribbon */}
      {!isMiniAdmin && !isDeveloper && ribbonConfig.enabled && (
        <>
          <style>{`
            @keyframes masterAdminMarquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            @keyframes masterAdminRibbonGlow {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .master-admin-marquee-track {
              display: inline-block;
              white-space: nowrap;
              will-change: transform;
              animation: masterAdminMarquee 18s linear infinite;
            }
            .master-admin-marquee-track:hover {
              animation-play-state: paused;
            }
            .master-admin-ribbon-bar {
              background: linear-gradient(90deg, #0f172a, #1e3a8a, #0f172a, #1e3a8a);
              background-size: 300% 100%;
              animation: masterAdminRibbonGlow 8s ease infinite;
            }
          `}</style>
          <div className="fixed bottom-0 left-0 right-0 z-[9990] h-10 master-admin-ribbon-bar border-t border-amber-400/50 shadow-[0_-4px_20px_rgba(0,0,0,0.25)] flex items-center overflow-hidden">
            <div className="w-full overflow-hidden flex items-center">
              <div className="master-admin-marquee-track text-xs sm:text-sm font-extrabold tracking-wide text-amber-300 px-4">
                {ribbonConfig.text}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Master Admin Payment Reminder Modal */}
      {!isMiniAdmin && !isDeveloper && popupConfig.enabled && showPaymentNotice && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setShowPaymentNotice(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shadow-xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{popupConfig.title}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Important Service Notification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentNotice(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {popupConfig.message}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="px-6 pb-6 pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setShowPaymentNotice(false)}
                className="w-full py-2.5 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
