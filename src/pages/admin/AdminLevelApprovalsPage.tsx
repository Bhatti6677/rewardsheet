import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';

export const AdminLevelApprovalsPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingLevels, setUpdatingLevels] = useState<Record<string, boolean>>({});
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLevelApprovals = async (targetPage = page, searchTerm = search) => {
    try {
      setLoading(true);
      const res: any = await api.getAdminLevelApprovals({
        search: searchTerm,
        page: targetPage,
        limit: 20,
      });

      if (res && res.users) {
        setUsers(res.users);
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages || 1);
        setTotalCount(res.pagination.total || 0);
      }
    } catch (err: any) {
      console.error('Failed to load level approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevelApprovals(1, search);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchLevelApprovals(1, val);
    }, 350);
  };

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4000);
  };

  const handleToggleLevel = async (userId: string, levelNumber: number, currentApproved: boolean) => {
    const key = `${userId}_${levelNumber}`;
    if (updatingLevels[key]) return;

    setUpdatingLevels((prev) => ({ ...prev, [key]: true }));

    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            approvals: {
              ...u.approvals,
              [levelNumber]: !currentApproved,
            },
          };
        }
        return u;
      })
    );

    try {
      const res: any = await api.toggleAdminLevelApproval({
        userId,
        levelNumber,
        isApproved: !currentApproved,
      });
      showNotification(res.message || `Level ${levelNumber} ${!currentApproved ? 'unlocked' : 'locked'} successfully.`);
    } catch (err: any) {
      // Revert on error
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              approvals: {
                ...u.approvals,
                [levelNumber]: currentApproved,
              },
            };
          }
          return u;
        })
      );
      alert(err.message || `Failed to update Level ${levelNumber} status.`);
    } finally {
      setUpdatingLevels((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleBatchUnlock = async (userId: string, isApproved: boolean) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const allKeys = [5, 6, 7, 8, 9, 10].reduce((acc, lvl) => {
      acc[`${userId}_${lvl}`] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setUpdatingLevels((prev) => ({ ...prev, ...allKeys }));

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newApprovals = { ...u.approvals };
          for (let lvl = 5; lvl <= 10; lvl++) {
            newApprovals[lvl] = isApproved;
          }
          return { ...u, approvals: newApprovals };
        }
        return u;
      })
    );

    try {
      const res: any = await api.batchAdminLevelApprovals({
        userId,
        levelNumbers: [5, 6, 7, 8, 9, 10],
        isApproved,
      });
      showNotification(res.message || `Levels 5-10 ${isApproved ? 'unlocked' : 'locked'} for ${user.name}.`);
    } catch (err: any) {
      fetchLevelApprovals(page, search);
      alert(err.message || 'Failed to update levels in batch.');
    } finally {
      setUpdatingLevels((prev) => {
        const next = { ...prev };
        for (let lvl = 5; lvl <= 10; lvl++) {
          delete next[`${userId}_${lvl}`];
        }
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notificationMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Top Banner / Filter Bar */}
      <div className="bg-white rounded-xl border border-[#D9E4F2] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search member name or phone..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#CBD5E1] rounded-lg bg-white text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={() => fetchLevelApprovals(page, search)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC] text-xs font-semibold transition-all disabled:opacity-50"
            title="Refresh member list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Information Header Box */}
      <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-3.5 flex items-start gap-3">
        <KeyRound className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E40AF]">
          <p className="font-bold">Level 5 to 10 Approval System</p>
          <p className="text-[11px] text-[#3B82F6] mt-0.5">
            Levels 1 through 4 unlock automatically through standard user progression. Every level beyond Level 4 (Levels 5 through 10) strictly requires administrative unlock approval. Click on any level tag below to toggle its unlocked/locked state for that member.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-[#D9E4F2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-2.5 px-4 min-w-[170px]">Member Name</th>
                <th className="py-2.5 px-3 min-w-[120px]">Phone</th>
                <th className="py-2.5 px-3 min-w-[120px]">Current Tier</th>
                <th className="py-2.5 px-4 min-w-[340px]">Post-Level 4 Approvals (Lvl 5 - 10)</th>
                <th className="py-2.5 px-4 min-w-[180px] text-right">Quick Batch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Loading member level data...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Users className="w-8 h-8 text-[#CBD5E1]" />
                      <span className="text-xs font-semibold">No members found matching your search.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0F172A]">{u.name}</div>
                        <div className="text-[10px] text-[#64748B] flex items-center gap-1 font-mono">
                          ID: {u.id.slice(0, 10)}...
                          {u.accountStatus === 'SUSPENDED' && (
                            <span className="bg-red-50 text-red-600 border border-red-200 px-1 rounded text-[9px] font-bold">
                              SUSPENDED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3 text-[#334155] font-mono text-[11px]">
                        {u.phone}
                      </td>

                      {/* Current Tier */}
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                            Level {u.currentLevel}
                          </span>
                          {u.level4Completed && (
                            <span className="inline-flex items-center gap-0.5 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              <Check className="w-2.5 h-2.5" /> L4 Completed
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Post-Level 4 Approvals (5 to 10) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[5, 6, 7, 8, 9, 10].map((lvl) => {
                            const isApproved = Boolean(u.approvals?.[lvl]);
                            const isUpdating = Boolean(updatingLevels[`${u.id}_${lvl}`]);

                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => handleToggleLevel(u.id, lvl, isApproved)}
                                disabled={isUpdating}
                                title={isApproved ? `Click to lock Level ${lvl}` : `Click to approve/unlock Level ${lvl}`}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all cursor-pointer border ${
                                  isApproved
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 shadow-xs'
                                    : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                                } ${isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                {isUpdating ? (
                                  <RefreshCw className="w-3 h-3 animate-spin text-current" />
                                ) : isApproved ? (
                                  <Unlock className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                                ) : (
                                  <Lock className="w-3 h-3 text-[#94A3B8] stroke-[2.5]" />
                                )}
                                <span>L{lvl}</span>
                                <span className="text-[9px] opacity-80 uppercase tracking-tighter">
                                  {isApproved ? 'Unlocked' : 'Locked'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBatchUnlock(u.id, true)}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-[#EAF2FF] text-[#2563EB] hover:bg-[#D4E5FF] border border-[#BFDBFE] transition-colors cursor-pointer"
                            title="Unlock all levels from 5 through 10 at once"
                          >
                            Unlock All
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBatchUnlock(u.id, false)}
                            className="px-2 py-1 rounded text-[10px] font-bold bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#CBD5E1] transition-colors cursor-pointer"
                            title="Lock all levels from 5 through 10"
                          >
                            Lock All
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
          <div>
            Showing <strong className="text-[#0F172A]">{users.length}</strong> of{' '}
            <strong className="text-[#0F172A]">{totalCount}</strong> members
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchLevelApprovals(page - 1, search)}
              disabled={page <= 1 || loading}
              className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[11px]"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-[11px]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchLevelApprovals(page + 1, search)}
              disabled={page >= totalPages || loading}
              className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[11px]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
