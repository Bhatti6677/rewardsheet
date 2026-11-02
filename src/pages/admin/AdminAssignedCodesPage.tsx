import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertCircle,
  Send,
  Clock,
  UserCheck,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../api/client';

export const AdminAssignedCodesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'USED'>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadAssignedCodes = (isManual = false) => {
    if (isManual) setReloading(true);
    else setLoading(true);

    api
      .getAdminMyAssignedCodes()
      .then((res: any) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load assigned codes:', err);
      })
      .finally(() => {
        setLoading(false);
        setReloading(false);
      });
  };

  useEffect(() => {
    loadAssignedCodes();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setActionNotice(`Copied code "${code}" to clipboard!`);
    setTimeout(() => {
      setCopiedCode(null);
      setActionNotice(null);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-xs text-[#6B7280]">Loading your assigned invitation codes...</p>
      </div>
    );
  }

  const hasLinkedTelegram = Boolean(data?.hasLinkedTelegram && data?.telegramAccount);
  const tg = data?.telegramAccount;
  const allCodes: any[] = data?.codes || [];

  const availableCodes = allCodes.filter((c) => c.status === 'AVAILABLE');
  const usedCodes = allCodes.filter((c) => c.status === 'USED');

  const filteredCodes = allCodes.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchCode = (c.code || '').toLowerCase().includes(q);
      const matchName = (c.usedByName || '').toLowerCase().includes(q);
      return matchCode || matchName;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2">
            <Ticket className="w-6 h-6 text-[#2563EB]" />
            <span>Assigned Invitation Codes</span>
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            View and manage your invitation codes issued via your linked Telegram account.
          </p>
        </div>

        <button
          onClick={() => loadAssignedCodes(true)}
          disabled={reloading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E4F2] bg-white hover:bg-[#F8FAFD] text-[#2563EB] font-bold text-xs transition-all h-9 disabled:opacity-60 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
          <span>{reloading ? 'Refreshing...' : 'Refresh Codes'}</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. SCENARIO: TELEGRAM ACCOUNT NOT LINKED                 */}
      {/* ======================================================== */}
      {!hasLinkedTelegram ? (
        <div className="admin-card p-8 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/60 via-white to-slate-50 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                Telegram Account Not Linked
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Action Required
                </span>
              </h2>
              <p className="text-sm font-semibold text-amber-900">
                Please ask administration to link or merge your Telegram account.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Your Mini Admin profile is currently not connected to any active Telegram invitation account. Once the Master Administrator selects your Telegram account in Mini Admin Management, or merges your existing account data, all your assigned invitation codes and available quota will appear on this page.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Send className="w-3.5 h-3.5 text-sky-600" />
              Telegram Account Linking / Merge (Murj) handled by Master Admin
            </span>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 2. SCENARIO: TELEGRAM ACCOUNT LINKED                     */
        /* ======================================================== */
        <div className="space-y-5">
          {/* Linked Account & Available Codes Bar */}
          <div className="p-4 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-sky-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

            {/* Strictly only showing how many codes are available (per Requirement 5) */}
            <div className="bg-white border border-sky-200 rounded-xl px-4 py-2 self-start sm:self-auto shadow-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                Available Codes
              </span>
              <span className="text-lg font-black text-sky-700">
                {tg.availableCodes ?? 0}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="admin-card p-4 border-l-4 border-l-emerald-500">
              <span className="text-[11px] font-semibold text-[#6B7280] block">Available Codes</span>
              <span className="text-xl font-black text-emerald-700 block mt-0.5">
                {tg.availableCodes ?? availableCodes.length}
              </span>
              <span className="text-[10px] text-emerald-600">Ready to issue to new users</span>
            </div>

            <div className="admin-card p-4 border-l-4 border-l-slate-400">
              <span className="text-[11px] font-semibold text-[#6B7280] block">Redeemed Codes</span>
              <span className="text-xl font-black text-slate-800 block mt-0.5">
                {usedCodes.length}
              </span>
              <span className="text-[10px] text-slate-500">Used by registered members</span>
            </div>

            <div className="admin-card p-4 border-l-4 border-l-blue-500">
              <span className="text-[11px] font-semibold text-[#6B7280] block">Total Issued by Bot</span>
              <span className="text-xl font-black text-[#111827] block mt-0.5">
                {allCodes.length}
              </span>
              <span className="text-[10px] text-blue-600">Generated on Telegram</span>
            </div>
          </div>

          {/* Table Card */}
          <div className="admin-card overflow-hidden">
            <div className="p-4 border-b border-[#D9E4F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAFCFF]">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-[#2563EB] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All ({allCodes.length})
                </button>
                <button
                  onClick={() => setStatusFilter('AVAILABLE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'AVAILABLE'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Available ({availableCodes.length})
                </button>
                <button
                  onClick={() => setStatusFilter('USED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === 'USED'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Used ({usedCodes.length})
                </button>
              </div>

              {/* Search box */}
              <div className="relative min-w-[200px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search code or member name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none placeholder:text-[#9CA3AF] h-8"
                />
              </div>
            </div>

            {filteredCodes.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                {search
                  ? `No codes found matching "${search}".`
                  : 'No invitation codes found for this filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs admin-table">
                  <thead>
                    <tr className="bg-[#F8FAFD] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-600">
                      <th className="py-2.5 px-4">Invitation Code</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Invited Member</th>
                      <th className="py-2.5 px-4">Used Timestamp</th>
                      <th className="py-2.5 px-4">Generated On</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {filteredCodes.map((item) => {
                      const isCopied = copiedCode === item.code;
                      const isAvailable = item.status === 'AVAILABLE';

                      return (
                        <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="py-2.5 px-4">
                            <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {item.code}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            {isAvailable ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Available</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <UserCheck className="w-3 h-3 text-slate-500" />
                                <span>Redeemed</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            {item.usedByName ? (
                              <span className="font-bold text-slate-900">
                                {item.usedByName}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                            {item.usedAt ? (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{new Date(item.usedAt).toLocaleString()}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Unused</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={() => handleCopy(item.code)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Copy Code"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
