import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckSquare,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Share2,
  Clock,
  Layers,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  ExternalLink,
  Send,
  Calendar,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { admin } = useAdminAuth();
  const isMiniAdmin = admin?.role === 'MINI_ADMIN';

  const [data, setData] = useState<any>(null);
  const [gridData, setGridData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const loadData = (isManual = false) => {
    if (isManual) setReloading(true);
    else setLoading(true);

    if (isMiniAdmin) {
      api
        .getAdminDashboard()
        .then((dashRes) => {
          setData(dashRes);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setLoading(false);
          setReloading(false);
        });
    } else {
      Promise.all([api.getAdminDashboard(), api.getTaskGrid()])
        .then(([dashRes, gridRes]) => {
          setData(dashRes);
          setGridData(gridRes.grid || []);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          setLoading(false);
          setReloading(false);
        });
    }
  };

  useEffect(() => {
    loadData();
  }, [isMiniAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
      </div>
    );
  }

  // ========================================================
  // DEDICATED MINI ADMIN PERFORMANCE DASHBOARD
  // ========================================================
  if (isMiniAdmin) {
    const perf = data?.performance || {};
    const tg = perf.telegramAccount;
    const invitedUsers: any[] = perf.invitedUsers || [];
    const dateBreakdown: any[] = perf.dateBreakdown || [];

    const filteredUsers = invitedUsers.filter((u) => {
      if (!userSearch.trim()) return true;
      return (u.name || '').toLowerCase().includes(userSearch.toLowerCase().trim());
    });

    return (
      <div className="space-y-6">
        {/* Top Header with Liquid Water Accent & Moving Beam */}
        <div className="mini-beam-card">
          <div className="mini-beam-inner p-4 sm:p-5 mini-water-surface relative">
            <div className="mini-water-caustic" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-blue-700 via-sky-600 to-teal-600 bg-clip-text text-transparent">
                    Mini Admin Performance Dashboard
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-700 border border-sky-400/30 px-2.5 py-0.5 rounded-full mini-water-ripple-cyan shadow-xs">
                    Live Stream
                  </span>
                </h1>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Track your Telegram invitation code performance, date-wise registrations, and pending task reviews.
                </p>
              </div>

              <button
                onClick={() => loadData(true)}
                disabled={reloading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-300 bg-white/90 hover:bg-sky-50 text-blue-700 font-bold text-xs transition-all h-9 disabled:opacity-60 shadow-sm cursor-pointer self-start sm:self-auto mini-water-ripple-cyan"
                title="Refresh Performance Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
                <span>{reloading ? 'Refreshing...' : 'Refresh Stats'}</span>
              </button>
            </div>
            <div className="mini-water-wave-bar mt-3.5 rounded-full" />
          </div>
        </div>

        {/* Telegram Account Info Banner */}
        {tg ? (
          <div className="mini-beam-card mini-beam-card-cyan">
            <div className="mini-beam-inner p-4 sm:p-5 mini-water-surface relative">
              <div className="mini-water-caustic" />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-teal-400 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/30 mini-water-ripple-cyan">
                    <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm sm:text-base">
                        {tg.username ? `@${tg.username}` : tg.firstName || 'Telegram User'}
                      </span>
                      <span className="text-[10px] font-mono bg-white/90 px-2 py-0.5 rounded-md border border-sky-300 text-sky-800 font-bold shadow-xs">
                        Chat ID: {tg.chatId}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        Connected
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">
                      Linked Telegram invitation account generating real-time referral codes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="bg-white/95 border border-sky-200/90 rounded-xl px-4 py-2.5 shadow-sm min-w-[130px] text-right sm:text-left">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Available Codes</span>
                    <span className="font-black text-sky-600 text-xl block mt-0.5 font-mono">
                      {tg.availableCodes ?? 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mini-water-wave-bar mt-3 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="mini-beam-card">
            <div className="mini-beam-inner p-4 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold block">No Telegram Invitation Account Linked</span>
                <p className="text-amber-800 mt-0.5">
                  Please ask administration to link or merge your Telegram account. Once linked, users registering through your codes will be tracked here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4 Performance Stat Cards with Moving Laser Lines & Fluid Water Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users Invited */}
          <div className="mini-beam-card">
            <div className="mini-beam-inner p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Total Users Invited</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mini-water-ripple-cyan">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-2 tracking-tight">
                  {(perf.totalInvited || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Via your official codes</span>
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div className="mini-water-wave-bar mt-3 -mx-5 -mb-5" />
            </div>
          </div>

          {/* Card 2: Invited Today */}
          <div className="mini-beam-card mini-beam-card-emerald">
            <div className="mini-beam-inner p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Invited Today</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mini-water-ripple-emerald">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 block mt-2 tracking-tight">
                  {(perf.invitedToday || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <span>Last 24 hours</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="mini-water-wave-bar mt-3 -mx-5 -mb-5" />
            </div>
          </div>

          {/* Card 3: Invited This Week */}
          <div className="mini-beam-card mini-beam-card-indigo">
            <div className="mini-beam-inner p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Invited This Week</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mini-water-ripple-indigo">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-indigo-600 block mt-2 tracking-tight">
                  {(perf.invitedThisWeek || 0).toLocaleString()}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Past 7 days volume</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div className="mini-water-wave-bar mt-3 -mx-5 -mb-5" />
            </div>
          </div>

          {/* Card 4: Pending Submissions */}
          <Link to="/adminpanal/submissions" className="mini-beam-card mini-beam-card-cyan group cursor-pointer block">
            <div className="mini-beam-inner p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Pending Submissions</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mini-water-ripple-cyan group-hover:scale-110 transition-transform">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl font-black text-sky-600 block mt-2 tracking-tight">
                  {perf.pendingSubmissions || 0}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-sky-700 font-bold flex items-center justify-between group-hover:text-blue-700">
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Review Level 1 & 2 <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              </div>
              <div className="mini-water-wave-bar mt-3 -mx-5 -mb-5" />
            </div>
          </Link>
        </div>

        {/* Date-wise Breakdown Section */}
        <div className="mini-beam-card">
          <div className="mini-beam-inner p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mini-water-ripple-cyan">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span>Invited Users on Each Date</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Summary of registrations generated by your assigned codes across dates.
                </p>
              </div>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full shadow-xs">
                {dateBreakdown.length} Active Date{dateBreakdown.length === 1 ? '' : 's'}
              </span>
            </div>

            {dateBreakdown.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/80 rounded-xl border border-dashed border-slate-200">
                No invitations recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {dateBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-gradient-to-br from-white via-sky-50/40 to-blue-50/30 border border-sky-200/80 rounded-xl space-y-2.5 shadow-xs hover:border-sky-400 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        {item.date}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 shadow-xs">
                        {item.count} {item.count === 1 ? 'user' : 'users'}
                      </span>
                    </div>

                    {item.names && item.names.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-200/60">
                        {item.names.slice(0, 3).map((name: string, nIdx: number) => (
                          <span
                            key={nIdx}
                            className="px-2 py-0.5 rounded-md bg-white text-slate-800 border border-slate-200 text-[10px] font-semibold truncate max-w-[120px] shadow-2xs"
                          >
                            {name}
                          </span>
                        ))}
                        {item.names.length > 3 && (
                          <span className="text-[10px] text-sky-700 font-bold self-center">
                            +{item.names.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="mini-water-wave-bar -mx-5 -mb-5" />
          </div>
        </div>

        {/* Invited Users Registry (Name & Date ONLY - Strict Privacy) */}
        <div className="mini-beam-card">
          <div className="mini-beam-inner overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-sky-50/30 to-white">
              <div>
                <h2 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mini-water-ripple-emerald">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span>Invited Members Registry</span>
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {invitedUsers.length} Total
                  </span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  <span>Privacy Mode: Showing only member names and registration dates.</span>
                </p>
              </div>

              {/* Search Input by Name */}
              <div className="relative min-w-[220px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by user name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none placeholder:text-slate-400 h-9 transition-all"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                {userSearch
                  ? `No invited members found matching "${userSearch}".`
                  : 'No users have registered with your invitation codes yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Member Name</th>
                      <th className="py-3 px-4">Registration Date & Time</th>
                      <th className="py-3 px-4 text-right">Invite Code Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-black flex items-center justify-center text-xs flex-shrink-0 shadow-xs mini-water-ripple-cyan">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                          {user.date
                            ? `${new Date(user.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })} at ${new Date(user.date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs">
                            {user.code || 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mini-water-wave-bar -mx-0 -mb-0" />
          </div>
        </div>
      </div>
    );
  }

  // ========================================================
  // MASTER SUPER ADMIN DASHBOARD
  // ========================================================
  const { metrics, recentActivity = [], recentTransactions = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Header Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
          Administrative Overview
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Real-time platform metrics, 10x10 task grid, financial queues, and audit trails.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Users */}
        <div className="admin-card p-4">
          <span className="text-[11px] font-semibold text-[#6B7280] block">Total Members</span>
          <span className="text-xl font-bold text-[#111827] block mt-1">
            {metrics?.totalUsers?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">
            {metrics?.activeUsers?.toLocaleString() || 0} active
          </span>
        </div>

        {/* Pending Task Submissions */}
        <Link to="/adminpanal/submissions" className="admin-card p-4 hover:border-[#2563EB] transition-colors">
          <span className="text-[11px] font-semibold text-[#6B7280] block">Pending Tasks</span>
          <span className="text-xl font-bold text-[#2563EB] block mt-1">
            {metrics?.pendingSubmissions || 0}
          </span>
          <span className="text-[10px] text-[#2563EB] font-medium flex items-center gap-1">
            Review Queue <ChevronRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Pending Deposits */}
        <Link to="/adminpanal/deposits" className="admin-card p-4 hover:border-[#2563EB] transition-colors">
          <span className="text-[11px] font-semibold text-[#6B7280] block">Pending Deposits</span>
          <span className="text-xl font-bold text-amber-600 block mt-1">
            {metrics?.pendingDeposits || 0}
          </span>
          <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
            Verify Payments <ChevronRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Pending Withdrawals */}
        <Link to="/adminpanal/withdrawals" className="admin-card p-4 hover:border-[#2563EB] transition-colors">
          <span className="text-[11px] font-semibold text-[#6B7280] block">Pending Payouts</span>
          <span className="text-xl font-bold text-red-600 block mt-1">
            {metrics?.pendingWithdrawals || 0}
          </span>
          <span className="text-[10px] text-red-600 font-medium flex items-center gap-1">
            Review Requests <ChevronRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Total Deposits Sum */}
        <div className="admin-card p-4">
          <span className="text-[11px] font-semibold text-[#6B7280] block">Deposited PKR</span>
          <span className="text-xl font-bold text-emerald-700 block mt-1 truncate">
            PKR {metrics?.totalDepositsAmount?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-[#6B7280]">Approved in bank</span>
        </div>

        {/* Total Paid Withdrawals Sum */}
        <div className="admin-card p-4">
          <span className="text-[11px] font-semibold text-[#6B7280] block">Paid Payouts</span>
          <span className="text-xl font-bold text-blue-700 block mt-1 truncate">
            PKR {metrics?.totalPaidWithdrawalsAmount?.toLocaleString() || 0}
          </span>
          <span className="text-[10px] text-[#6B7280]">Disbursed to members</span>
        </div>
      </div>

      {/* 10x10 Task Status Overview Grid (Super Admin Only) */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2563EB]" /> 10x10 Task Status Overview Grid
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Matrix of all 100 task slots across Levels 1–10. Shows configuration status and pending submissions.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Active Task
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              Pending Submissions
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              VIP Paid Task
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
              Disabled
            </span>
          </div>
        </div>

        {/* The 10x10 Table */}
        <div className="overflow-x-auto border border-[#D9E4F2] rounded-lg">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="bg-[#F8FAFD] border-b border-[#D9E4F2] text-[#4B5563] font-semibold text-[11px]">
                <th className="py-2.5 px-3 text-left w-32 border-r border-[#D9E4F2]">Level</th>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
                  <th key={t} className="py-2.5 px-1.5 border-r border-[#D9E4F2] w-16">
                    Task {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E4F2]">
              {gridData.map((row) => (
                <tr key={row.levelId} className="hover:bg-[#F8FAFD]/50 transition-colors">
                  <td className="py-2.5 px-3 text-left font-bold text-[#111827] border-r border-[#D9E4F2] whitespace-nowrap bg-[#FAFCFF]">
                    <span className="text-[#2563EB]">Level {row.levelNumber}</span>
                    <span className="block text-[10px] text-[#6B7280] font-normal truncate max-w-[120px]">
                      {row.levelTitle}
                    </span>
                  </td>

                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => {
                    const task = row.tasks[`task${t}`];
                    const hasPending = (task?.pendingSubmissionsCount || 0) > 0;
                    const isPaid = task?.isPaid;

                    let bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    let label = 'Active';

                    if (hasPending) {
                      bgClass = 'bg-blue-100 text-blue-800 border-blue-300 font-bold animate-pulse';
                      label = `${task.pendingSubmissionsCount} Rev`;
                    } else if (isPaid) {
                      bgClass = 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
                      label = 'VIP Fee';
                    } else if (task?.status === 'DISABLED') {
                      bgClass = 'bg-slate-100 text-slate-500 border-slate-200';
                      label = 'Off';
                    }

                    return (
                      <td key={t} className="p-1 border-r border-[#D9E4F2]">
                        <Link
                          to={hasPending ? `/adminpanal/submissions?level=${row.levelNumber}` : `/adminpanal/tasks?level=${row.levelNumber}`}
                          className={`block py-1.5 px-1 rounded border text-[10px] transition-all hover:scale-105 ${bgClass}`}
                          title={`${task?.title || ''} (Reward: PKR ${task?.rewardAmount || 0})`}
                        >
                          <span className="block font-bold">{label}</span>
                          <span className="block text-[8px] opacity-75">
                            {task?.rewardAmount ? `PKR ${task.rewardAmount}` : ''}
                          </span>
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Layout: Recent Transactions (Super Admin only) & Recent Admin Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">Recent Platform Ledger Transactions</h3>
            <Link to="/adminpanal/transactions" className="text-xs text-[#2563EB] font-semibold hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {recentTransactions.map((tx: any) => (
              <div
                key={tx.id}
                className="p-3 bg-[#F8FAFD] border border-[#EDF1F7] rounded-lg flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-[#111827] truncate">{tx.reason}</p>
                  <p className="text-[10px] text-[#6B7280]">
                    Member: {tx.user?.name || 'User'} ({tx.user?.phone || 'N/A'}) • {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className={`font-bold block ${tx.amount > 0 ? 'text-emerald-600' : 'text-[#111827]'}`}>
                    {tx.amount > 0 ? '+' : ''}PKR {Math.abs(tx.amount).toLocaleString()}
                  </span>
                  <span className="text-[9px] text-[#6B7280] uppercase">{tx.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">Recent Administrator Audit Logs</h3>
            <Link to="/adminpanal/activity-logs" className="text-xs text-[#2563EB] font-semibold hover:underline">
              View Audit Log
            </Link>
          </div>

          <div className="space-y-2">
            {recentActivity.map((log: any) => (
              <div
                key={log.id}
                className="p-3 bg-[#F8FAFD] border border-[#EDF1F7] rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#111827]">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-[#6B7280]">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] text-[#4B5563]">
                  Admin: <strong className="text-[#2563EB]">{log.adminUsername}</strong> • Entity: {log.entityType} ({log.entityId.slice(-6)})
                </p>
                {log.reason && (
                  <p className="text-[10px] text-[#6B7280] italic">Reason: {log.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
