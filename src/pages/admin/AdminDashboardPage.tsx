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
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2">
              <span>Mini Admin Performance Dashboard</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                Delegated View
              </span>
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Track your Telegram invitation code performance, date-wise registrations, and pending task reviews.
            </p>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={reloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E4F2] bg-white hover:bg-[#F8FAFD] text-[#2563EB] font-bold text-xs transition-all h-9 disabled:opacity-60 shadow-xs cursor-pointer self-start sm:self-auto"
            title="Refresh Performance Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
            <span>{reloading ? 'Refreshing...' : 'Refresh Stats'}</span>
          </button>
        </div>

        {/* Telegram Account Info Banner */}
        {tg ? (
          <div className="p-4 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-sky-500/20">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">
                    {tg.username ? `@${tg.username}` : tg.firstName || 'Telegram User'}
                  </span>
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-sky-200 text-sky-800">
                    Chat ID: {tg.chatId}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Linked Telegram invitation account generating referral codes.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-white/90 border border-sky-200 rounded-xl px-4 py-2 shadow-xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Available Codes</span>
                <span className="font-black text-sky-700 text-base">
                  {tg.availableCodes ?? 0}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <span className="font-bold block">No Telegram Invitation Account Linked</span>
              <p className="text-amber-800 mt-0.5">
                Please ask administration to link or merge your Telegram account. Once linked, users registering through your codes will be tracked here.
              </p>
            </div>
          </div>
        )}

        {/* 4 Performance Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">Total Users Invited</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-2xl font-black text-[#111827] block mt-1">
              {(perf.totalInvited || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Registered via your invitation codes
            </span>
          </div>

          <div className="admin-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">Invited Today</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-2xl font-black text-emerald-600 block mt-1">
              {(perf.invitedToday || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              New signups in the last 24 hours
            </span>
          </div>

          <div className="admin-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">Invited This Week</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-2xl font-black text-indigo-600 block mt-1">
              {(perf.invitedThisWeek || 0).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Signups across the past 7 days
            </span>
          </div>

          <Link to="/adminpanal/submissions" className="admin-card p-5 hover:border-[#2563EB] transition-colors group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6B7280]">Pending Submissions</span>
              <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
            </div>
            <span className="text-2xl font-black text-[#2563EB] block mt-1">
              {perf.pendingSubmissions || 0}
            </span>
            <span className="text-[11px] text-[#2563EB] font-bold flex items-center gap-1 mt-1 group-hover:translate-x-0.5 transition-transform">
              Review Level 1 Proofs <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Date-wise Breakdown Section */}
        <div className="admin-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2563EB]" />
                <span>Invited Users on Each Date</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Summary of how many users were invited on which dates.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {dateBreakdown.length} Active Date{dateBreakdown.length === 1 ? '' : 's'}
            </span>
          </div>

          {dateBreakdown.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-[#F8FAFD] rounded-xl border border-dashed border-[#D9E4F2]">
              No invitations recorded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {dateBreakdown.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-[#F8FAFD] border border-[#D9E4F2] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {item.date}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      {item.count} {item.count === 1 ? 'user' : 'users'}
                    </span>
                  </div>

                  {item.names && item.names.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-200/60">
                      {item.names.slice(0, 3).map((name: string, nIdx: number) => (
                        <span
                          key={nIdx}
                          className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px] font-medium truncate max-w-[120px]"
                        >
                          {name}
                        </span>
                      ))}
                      {item.names.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{item.names.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invited Users Registry (Name & Date ONLY - Strict Privacy) */}
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-[#D9E4F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFCFF]">
            <div>
              <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Invited Members Registry</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {invitedUsers.length} Total
                </span>
              </h2>
              <p className="text-[11px] text-[#6B7280] mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 inline" />
                <span>Privacy Mode: Showing only member names and registration dates.</span>
              </p>
            </div>

            {/* Search Input by Name */}
            <div className="relative min-w-[220px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by user name..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none placeholder:text-[#9CA3AF] h-8"
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
              <table className="w-full text-left text-xs admin-table">
                <thead>
                  <tr className="bg-[#F8FAFD] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-600">
                    <th className="py-2.5 px-4 w-12 text-center">#</th>
                    <th className="py-2.5 px-4">Member Name</th>
                    <th className="py-2.5 px-4">Registration Date & Time</th>
                    <th className="py-2.5 px-4 text-right">Invite Code Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredUsers.map((user, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-2.5 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
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
                      <td className="py-2.5 px-4 text-right">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {user.code || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
