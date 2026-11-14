import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown,
  Home,
  CheckSquare,
  Disc,
  ArrowUpRight,
  Clock,
  HelpCircle,
  Users,
  Wallet,
  Coins,
  Star,
  Gift,
  Copy,
  Check,
  TrendingUp,
  User as UserIcon,
  Sparkles,
  ChevronRight,
  X,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Mail,
  Shield,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useBodyScrollLock } from '../../utils/useBodyScrollLock';

export const DashboardPage: React.FC = () => {
  const { user, wallet: authWallet, updateWallet } = useAuth();
  const navigate = useNavigate();

  const fallbackDashboard = {
    wallet: authWallet || {
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      creditPoints: 100,
    },
    levelProgress: {
      currentLevelNumber: 1,
      levelTitle: 'Apprentice Tier',
      approvedTasksCount: 0,
    },
    recentTransactions: [],
    recentSubmissions: [],
  };

  const cachedDashboard = api.getCachedData<any>('/user/dashboard');
  const [data, setData] = useState<any>(() => {
    if (cachedDashboard) {
      return {
        ...cachedDashboard,
        wallet: authWallet || cachedDashboard.wallet || fallbackDashboard.wallet,
      };
    }
    return fallbackDashboard;
  });
  const [loading, setLoading] = useState(!cachedDashboard && !authWallet);
  const [copiedLink, setCopiedLink] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Prevent background scrolling while help modal is active
  useBodyScrollLock(helpModalOpen);

  useEffect(() => {
    api
      .getDashboard()
      .then((res: any) => {
        setData(res);
        if (res?.wallet) {
          updateWallet(res.wallet);
        }
      })
      .catch((err) => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false));
  }, []);

  // Realtime Live Update Listener (Zero Reload Strategy)
  useEffect(() => {
    const handleLiveEvent = (e: any) => {
      const type = e.detail?.type;
      const payload = e.detail?.payload;

      // Targeted direct update for wallet changes without refetching entire dashboard
      if (type === 'wallet' && payload) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            wallet: { ...prev.wallet, ...payload },
          };
        });
        updateWallet(payload);
        return;
      }

      if (type === 'task' || type === 'command' || type === 'all' || type === 'refresh') {
        api.invalidateCache('/user/dashboard');
        api
          .getDashboard()
          .then((res: any) => {
            setData(res);
            if (res?.wallet) {
              updateWallet(res.wallet);
            }
          })
          .catch(() => {});
      }
    };
    window.addEventListener('royal_live_update', handleLiveEvent);
    return () => {
      window.removeEventListener('royal_live_update', handleLiveEvent);
    };
  }, []);

  const {
    levelProgress,
    recentTransactions = [],
    recentSubmissions = [],
  } = data || {};

  // Level calculations (strictly 10 tasks per level)
  const currentLevelNumber = levelProgress?.currentLevelNumber || 1;
  const levelTitle = levelProgress?.levelTitle || 'Apprentice Tier';
  const approvedTasksCount = levelProgress?.approvedTasksCount || 0;
  const remainingTasksInLevel = Math.max(0, 10 - approvedTasksCount);
  const progressPercent = Math.min(100, Math.round((approvedTasksCount / 10) * 100));

  // Available balance & Credit points - single source of truth across TopNav and Dashboard
  const currentWallet = data?.wallet || authWallet;
  const availableBalance = currentWallet?.availableBalance ?? (authWallet?.availableBalance || 0);
  const creditPoints = currentWallet?.creditPoints ?? (authWallet?.creditPoints ?? 100);

  // Withdrawal Eligibility & Level Quota (10% of total balance on every level completion)
  const completedLevelsCount =
    data?.withdrawalEligibility?.completedLevelsCount ??
    levelProgress?.completedLevelsCount ??
    (currentLevelNumber > 1 ? currentLevelNumber - 1 : 0);
  const eligibleWithdrawalPercent =
    data?.withdrawalEligibility?.eligiblePercent ?? (completedLevelsCount >= 1 ? 10 : 0);
  const maxWithdrawableAmount =
    data?.withdrawalEligibility?.maxWithdrawableAmount ??
    Math.floor((availableBalance * eligibleWithdrawalPercent) / 100);

  // Member ID formatting
  const memberId = user?.id ? `RR${user.id.slice(-8).toUpperCase()}` : 'RR00000000';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Container Layout: Left Sidebar (Desktop) + Right Dashboard Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ========================================================
            A. LEFT SIDEBAR (Desktop Only: hidden on mobile)
            Obsidian Black & Crimson Red Executive Sidebar
            ======================================================== */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-3xl bg-[#0D0A0E] border border-red-900/40 p-5 space-y-6 shadow-2xl sticky top-20">
          {/* Earn Street Logo Branding */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/25">
              <div className="w-full h-full bg-[#08080B] rounded-[14px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white leading-none">
                EARN STREET
              </h2>
              <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">
                Executive Suite
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            {/* 1. Home (Active with crimson glow) */}
            <Link
              to="/app"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-600/35 border border-red-400/40 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* 2. Tasks */}
            <Link
              to="/app/tasks"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-[#171115] font-semibold text-xs border border-transparent hover:border-red-900/50 transition-all group"
            >
              <CheckSquare className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
              <span>Tasks & Levels</span>
            </Link>

            {/* 3. Spin */}
            <Link
              to="/app/spin"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-[#171115] font-semibold text-xs border border-transparent hover:border-red-900/50 transition-all group"
            >
              <Disc className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
              <span>Fortune Spin</span>
            </Link>

            {/* 4. Withdraw */}
            <Link
              to="/app/withdrawals"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-[#171115] font-semibold text-xs border border-transparent hover:border-red-900/50 transition-all group"
            >
              <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Withdraw</span>
            </Link>

            {/* 5. History */}
            <Link
              to="/app/wallet"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-[#171115] font-semibold text-xs border border-transparent hover:border-red-900/50 transition-all group"
            >
              <Clock className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span>Wallet & Ledger</span>
            </Link>

            {/* 6. Help Center */}
            <button
              onClick={() => setHelpModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-400 hover:text-white hover:bg-[#171115] font-semibold text-xs border border-transparent hover:border-red-900/50 transition-all group text-left"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Help Center</span>
            </button>
          </nav>

          {/* Sidebar Mini Promo Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-[#1A0D12] to-[#0B0A0D] border border-red-900/50 text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-white">Daily Crimson Spins</h4>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Complete level milestones to unlock instant cash wheel spins!
            </p>
            <Link
              to="/app/tasks"
              className="inline-block w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-[11px] font-bold transition-all"
            >
              Start Tasks
            </Link>
          </div>
        </aside>

        {/* ========================================================
            RIGHT DASHBOARD CONTENT AREA
            Mobile + Desktop responsive dashboard modules
            ======================================================== */}
        <main className="flex-1 w-full min-w-0 space-y-6">
          {/* ========================================================
              MOBILE UNIFIED EXECUTIVE CARD (Covers Profile, Balance & Credit Points in 1 Box)
              ======================================================== */}
          <div className="sm:hidden rounded-3xl bg-gradient-to-br from-[#1A0B10] via-[#100B0E] to-[#08080B] border border-red-900/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/80 to-transparent" />
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

            {/* Top Row: Avatar + Name + ID + Level + My Profile */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 p-0.5 shadow-md shadow-red-600/20">
                    <div className="w-full h-full bg-[#09090C] rounded-[14px] flex items-center justify-center font-black text-white text-base">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-md bg-red-600 border-2 border-[#09090C] flex items-center justify-center text-white">
                    <Crown className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="text-sm font-black text-white tracking-tight truncate">
                      {user?.name || 'Executive Member'}
                    </h1>
                    <span className="text-[9px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono font-medium truncate">
                    ID: <span className="text-red-400 font-bold">{memberId}</span>
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold">
                    <Crown className="w-3 h-3 text-red-500 shrink-0" />
                    <span>Level {currentLevelNumber}</span>
                    <span className="text-zinc-500 font-normal truncate">• {levelTitle}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/app/profile"
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#161014] border border-red-900/50 text-[11px] font-semibold text-zinc-300 hover:text-white hover:border-red-500 transition-all"
              >
                <UserIcon className="w-3 h-3 text-red-400" />
                <span>Profile</span>
              </Link>
            </div>

            {/* Middle Row: Total Balance & Credit Points Side-by-Side */}
            <div className="grid grid-cols-2 border-t border-red-900/35 bg-[#0C090C]/60">
              <div className="p-3.5 space-y-1">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Total Balance
                </span>
                <p className="text-lg font-black text-amber-400 tracking-tight leading-tight">
                  PKR {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="block text-[10px] text-zinc-500 font-medium">
                  Available Wallet
                </span>
              </div>

              <div className="p-3.5 space-y-1 border-l border-red-900/35">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Credit Points
                </span>
                <p className="text-lg font-black text-white tracking-tight leading-tight">
                  {creditPoints.toLocaleString()} <span className="text-xs font-bold text-red-400">Pts</span>
                </p>
                <span className="block text-[10px] text-emerald-400 font-semibold truncate">
                  100 CPs on joining • Tier {currentLevelNumber}
                </span>
              </div>
            </div>

            {/* Bottom Action Bar: Withdraw & Deposit */}
            <div className="px-4 py-2.5 border-t border-red-900/35 flex items-center justify-between bg-[#09070A]/80 text-xs">
              <Link
                to="/app/withdrawals"
                className="font-bold text-red-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Withdraw Funds</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/app/deposits"
                className="px-3 py-1 rounded-xl bg-red-600/20 border border-red-500/40 font-bold text-red-300 hover:bg-red-600 hover:text-white transition-all"
              >
                Deposit
              </Link>
            </div>
          </div>

          {/* ========================================================
              C. USER PROFILE SUMMARY & TOP HEADER CONTROLS (Desktop/Tablet)
              ======================================================== */}
          <div className="hidden sm:flex p-5 rounded-3xl bg-gradient-to-r from-[#140C10] via-[#0F0B0E] to-[#0A0A0D] border border-red-900/45 shadow-xl flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
            {/* User Avatar + Name + ID + Level */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 p-0.5 shadow-md shadow-red-600/20">
                  <div className="w-full h-full bg-[#09090C] rounded-[14px] flex items-center justify-center font-black text-white text-lg">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-red-600 border-2 border-[#09090C] flex items-center justify-center text-white">
                  <Crown className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {user?.name || 'Executive Member'}
                  </h1>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono font-medium">
                  Member ID: <span className="text-red-400 font-bold">{memberId}</span>
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold pt-0.5">
                  <Crown className="w-3.5 h-3.5 text-red-500" />
                  <span>Level {currentLevelNumber}</span>
                  <span className="text-zinc-500 font-normal">• {levelTitle}</span>
                </div>
              </div>
            </div>

            {/* Quick Profile Actions */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link
                to="/app/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#161014] border border-red-900/50 text-xs font-semibold text-zinc-300 hover:text-white hover:border-red-500 transition-all"
              >
                <UserIcon className="w-3.5 h-3.5 text-red-400" />
                <span>My Profile</span>
              </Link>
            </div>
          </div>

          {/* ========================================================
              D. BALANCE AND CREDIT POINTS (Two Summary Cards - Desktop/Tablet)
              ======================================================== */}
          <div className="hidden sm:grid grid-cols-2 gap-4">
            {/* Total Balance Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#1C0B10] via-[#110B0E] to-[#0A0A0D] border border-red-900/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/15 rounded-full blur-2xl pointer-events-none group-hover:bg-red-600/25 transition-all" />

              <div className="mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Total Balance
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
                  PKR {availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <Link
                  to="/app/withdrawals"
                  className="font-bold text-red-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>Withdraw Funds</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/app/deposits"
                  className="font-bold text-zinc-300 hover:text-red-400 transition-colors"
                >
                  Deposit
                </Link>
              </div>
            </div>

            {/* Credit Points Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#190D12] via-[#100C0F] to-[#0A0A0D] border border-red-900/50 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-600/20 transition-all" />

              <div className="mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Credit Points
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {creditPoints.toLocaleString()} <span className="text-base font-bold text-red-400">Pts</span>
                </h3>
                <p className="text-xs font-semibold text-emerald-400">
                  100 CPs awarded upon joining
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="font-bold text-red-400">
                  Account Standing Score
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">Rank Tier {currentLevelNumber}</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              E. UNIFIED TRANSPARENT OVERVIEW BOX (Welcome + Tier Progress + Milestone CTA)
              ======================================================== */}
          <div className="rounded-3xl bg-transparent backdrop-blur-sm border border-red-900/40 divide-y divide-red-900/30">
            {/* 1. Welcome & Rewards Header */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-400 uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Small Steps, Big Rewards</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Welcome to Earn Street!
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Complete tasks sequentially, earn verified PKR rewards, and unlock higher prestige tiers.
                </p>
              </div>

              <div className="shrink-0">
                <Link
                  to="/app/tasks"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/20 transition-all"
                >
                  <span>View Tasks</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 2. Tier Ascent & Milestone Progress */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Tier Ascent Status
                  </h3>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Level {currentLevelNumber}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 font-medium">Approved: </span>
                    <span className="font-black text-white">{approvedTasksCount} / 10</span>
                  </div>
                  <div className="h-3 w-px bg-red-900/40" />
                  <div>
                    <span className="text-zinc-500 font-medium">Remaining: </span>
                    <span className="font-black text-red-400">{remainingTasksInLevel} Tasks</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Milestone Progress</span>
                  <span className="font-bold text-white">{progressPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-red-900/35">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <p className="text-zinc-400">
                  {completedLevelsCount === 0
                    ? `Complete Level ${currentLevelNumber} tasks to earn rewards and unlock 10% withdrawal!`
                    : `Level ${currentLevelNumber} Active • Complete sequential tasks to advance and unlock spins.`}
                </p>
                <Link
                  to="/app/tasks"
                  className="inline-flex items-center gap-1.5 font-bold text-red-400 hover:text-white transition-colors shrink-0"
                >
                  <span>Continue Level {currentLevelNumber} Tasks</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================
          HELP CENTER MODAL
          ======================================================== */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in overflow-y-auto overscroll-contain">
          <div className="w-full max-w-lg max-h-[90dvh] overflow-y-auto overscroll-contain rounded-3xl bg-[#120D10] border border-red-900/50 p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Earn Street Help Center</h3>
                  <p className="text-[11px] text-zinc-400">Support & common inquiries</p>
                </div>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-2 rounded-xl bg-[#09090C] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3.5 rounded-2xl bg-[#09090C] border border-zinc-800 space-y-1">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  How do tasks work?
                </h4>
                <p className="leading-relaxed">
                  Tasks are completed sequentially across 10 levels. After completing a task, submit confirmation for admin review. Once approved, your PKR reward is credited and the next task unlocks.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09090C] border border-zinc-800 space-y-1">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  How do withdrawals work?
                </h4>
                <p className="leading-relaxed">
                  Go to the Withdraw page, select your preferred payment channel (EasyPaisa / JazzCash / Bank), enter your details, and submit. Funds are processed after admin confirmation.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#09090C] border border-zinc-800 space-y-1">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-red-400" />
                  How do I unlock Level 2?
                </h4>
                <p className="leading-relaxed">
                  All 10 tasks in Level 1 must be approved by the administrator before Level 2 unlocks. Each tier follows the same rule up to Level 10.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:brightness-110 text-white text-xs font-bold transition-all shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
