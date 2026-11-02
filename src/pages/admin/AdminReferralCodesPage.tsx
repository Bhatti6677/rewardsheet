import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Copy,
  Check,
  Search,
  Plus,
  Minus,
  RefreshCw,
  CheckCircle2,
  Users,
  AlertCircle,
  Clock,
  Send,
  ShieldCheck,
  Zap,
  Trash2,
  GitMerge,
  X,
} from 'lucide-react';
import { api } from '../../api/client';

export const AdminReferralCodesPage: React.FC = () => {
  const [data, setData] = useState<{
    availableCodes: any[];
    usedCodes: any[];
    stats: { total: number; available: number; used: number };
  } | null>(null);

  const [telegramUsers, setTelegramUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTg, setLoadingTg] = useState(false);
  const [activeTab, setActiveTab] = useState<'telegram' | 'available' | 'used'>('telegram');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedChatId, setCopiedChatId] = useState<string | null>(null);
  const [quickCopied, setQuickCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [grantingChatId, setGrantingChatId] = useState<string | null>(null);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Delete & batch selection state
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [batchDeleting, setBatchDeleting] = useState(false);

  // Murj (Merge) Telegram state
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeSourceChatId, setMergeSourceChatId] = useState('');
  const [mergeTargetChatId, setMergeTargetChatId] = useState('');
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);

  const loadCodes = (silent = false) => {
    if (!silent) setLoading(true);
    api
      .getAdminReferralCodes()
      .then((res: any) => {
        setData(res);
      })
      .catch((err) => {
        console.error('Failed to load referral codes:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const loadTelegramUsers = (silent = false) => {
    if (!silent) setLoadingTg(true);
    api
      .getAdminTelegramUsers()
      .then((res: any) => {
        setTelegramUsers(res.users || []);
      })
      .catch((err) => {
        console.error('Failed to load telegram users:', err);
      })
      .finally(() => {
        setLoadingTg(false);
      });
  };

  useEffect(() => {
    loadCodes();
    loadTelegramUsers(true);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyChatId = (chatId: string) => {
    navigator.clipboard.writeText(String(chatId));
    setCopiedChatId(String(chatId));
    setTimeout(() => setCopiedChatId(null), 2000);
  };

  const handleQuickCopyNext = () => {
    if (!data?.availableCodes || data.availableCodes.length === 0) return;
    const nextCode = data.availableCodes[0].code;
    navigator.clipboard.writeText(nextCode);
    setQuickCopied(true);
    setActionNotice(`Copied available 6-letter code "${nextCode}" to clipboard!`);
    setTimeout(() => {
      setQuickCopied(false);
      setActionNotice(null);
    }, 3500);
  };

  const handleGenerateMore = async (count = 10) => {
    setGenerating(true);
    try {
      const res: any = await api.generateAdminReferralCodes({ count });
      setData(res);
      setActionNotice(`Successfully generated ${count} additional 6-letter referral codes!`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to generate codes');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteCode = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to permanently delete code "${code}"?`)) return;
    setDeletingId(id);
    try {
      await api.deleteAdminReferralCode(id);
      setActionNotice(`Referral code "${code}" deleted successfully.`);
      setSelectedCodes((prev) => prev.filter((item) => item !== id));
      loadCodes(true);
    } catch (err: any) {
      alert(err.message || 'Failed to delete code');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedCodes.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedCodes.length} selected referral codes?`)) return;
    setBatchDeleting(true);
    try {
      await api.batchDeleteAdminReferralCodes(selectedCodes);
      setActionNotice(`Successfully deleted ${selectedCodes.length} referral codes.`);
      setSelectedCodes([]);
      loadCodes(true);
    } catch (err: any) {
      alert(err.message || 'Failed to delete selected codes');
    } finally {
      setBatchDeleting(false);
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceChatId.trim() || !mergeTargetChatId.trim()) {
      setMergeError('Please select or enter both old and new Telegram account chat IDs.');
      return;
    }
    if (mergeSourceChatId.trim() === mergeTargetChatId.trim()) {
      setMergeError('Source (old) and Target (new) accounts cannot be the identical chat ID.');
      return;
    }
    setMergeError(null);
    setMerging(true);
    try {
      const res: any = await api.mergeAdminTelegramUsers(mergeSourceChatId.trim(), mergeTargetChatId.trim());
      setActionNotice(res.message || 'Telegram accounts merged successfully!');
      setMergeModalOpen(false);
      setMergeSourceChatId('');
      setMergeTargetChatId('');
      loadTelegramUsers();
      loadCodes(true);
    } catch (err: any) {
      setMergeError(err.message || 'Failed to merge Telegram accounts');
    } finally {
      setMerging(false);
    }
  };

  const handleGrantCodes = async (chatId: string, amount: number) => {
    setGrantingChatId(chatId);
    try {
      const res: any = await api.grantTelegramUserCodes(chatId, amount);
      if (res.user) {
        setTelegramUsers((prev) =>
          prev.map((u) => (String(u.chatId) === String(chatId) ? res.user : u))
        );
      }
      setActionNotice(
        res.message || `Granted +${amount} referral codes to Telegram client (Chat ID: ${chatId})! Client has been notified via bot.`
      );
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to grant codes');
    } finally {
      setGrantingChatId(null);
    }
  };

  const handleDeductCodes = async (chatId: string, amount: number) => {
    setGrantingChatId(chatId);
    try {
      const res: any = await api.deductTelegramUserCodes(chatId, amount);
      if (res.user) {
        setTelegramUsers((prev) =>
          prev.map((u) => (String(u.chatId) === String(chatId) ? res.user : u))
        );
      }
      setActionNotice(
        res.message || `Decreased quota by -${amount} codes for Telegram client (Chat ID: ${chatId})! Client has been notified via bot.`
      );
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to decrease quota');
    } finally {
      setGrantingChatId(null);
    }
  };

  const availableList = (data?.availableCodes || []).filter((item: any) => {
    // Strictly isolate: Assigned codes belong exclusively to their respective users and are never shown in Admin Available codes
    if (item.notes && item.notes.startsWith('TG:')) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return item.code.toLowerCase().includes(q) || (item.notes && item.notes.toLowerCase().includes(q));
  });

  const usedList = (data?.usedCodes || []).filter((item: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const codeMatch = item.code.toLowerCase().includes(q);
    const nameMatch = item.usedByName && item.usedByName.toLowerCase().includes(q);
    const phoneMatch = item.usedByPhone && item.usedByPhone.toLowerCase().includes(q);
    return codeMatch || nameMatch || phoneMatch;
  });

  const tgList = telegramUsers.filter((u: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (u.firstName && u.firstName.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      String(u.chatId).includes(q)
    );
  });

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-[#2563EB] animate-spin" />
        <p className="text-xs text-[#6B7280]">Loading official referral code pool...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Invitation Codes &amp; Telegram Bot Clients
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Admin-only single-use 6-letter referral codes. View registered Telegram bot clients and grant invitation code quotas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMergeError(null);
              setMergeModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Merge old/lost Telegram account data into a new account"
          >
            <GitMerge className="w-4 h-4" />
            <span>Merge Telegram (Murj)</span>
          </button>
          <button
            onClick={handleQuickCopyNext}
            disabled={!data?.availableCodes?.length}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {quickCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>Copy Next Available Code</span>
          </button>
          <button
            onClick={() => handleGenerateMore(10)}
            disabled={generating}
            className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{generating ? 'Generating...' : '+10 Codes'}</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="admin-card p-4 sm:p-5 flex items-center gap-4 border-l-4 border-l-sky-500">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-sky-700">{telegramUsers.length}</div>
            <div className="text-xs text-[#6B7280]">Registered Telegram Clients</div>
          </div>
        </div>

        <div className="admin-card p-4 sm:p-5 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-700">{data?.stats?.available || 0}</div>
            <div className="text-xs text-[#6B7280]">Available 6-Letter Codes</div>
          </div>
        </div>

        <div className="admin-card p-4 sm:p-5 flex items-center gap-4 border-l-4 border-l-slate-400">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{data?.stats?.used || 0}</div>
            <div className="text-xs text-[#6B7280]">Used &amp; Redeemed Codes</div>
          </div>
        </div>

        <div className="admin-card p-4 sm:p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#111827]">{data?.stats?.total || 0}</div>
            <div className="text-xs text-[#6B7280]">Total Code Pool</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="admin-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E4F2] pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('telegram');
                loadTelegramUsers();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'telegram'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Registered Telegram Clients</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'telegram' ? 'bg-white/20 text-white' : 'bg-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                {telegramUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'available'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              <span>Available Codes</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'available' ? 'bg-white/20 text-white' : 'bg-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                {data?.stats?.available || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('used')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'used'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              <span>Used Codes</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'used' ? 'bg-white/20 text-white' : 'bg-[#E5E7EB] text-[#4B5563]'
                }`}
              >
                {data?.stats?.used || 0}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={
                activeTab === 'telegram'
                  ? 'Search telegram name, @username, or chat ID...'
                  : activeTab === 'available'
                  ? 'Search available 6-letter codes...'
                  : 'Search code, name or phone...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg text-xs text-[#111827] focus:outline-none"
            />
          </div>
        </div>

        {/* Tab 1: Available Codes */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {/* Batch actions toolbar */}
            {availableList.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={availableList.length > 0 && selectedCodes.length === availableList.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCodes(availableList.map((item: any) => item.id));
                        } else {
                          setSelectedCodes([]);
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                    />
                    <span>Select All ({availableList.length})</span>
                  </label>
                  {selectedCodes.length > 0 && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      {selectedCodes.length} code{selectedCodes.length > 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>

                {selectedCodes.length > 0 && (
                  <button
                    onClick={handleBatchDelete}
                    disabled={batchDeleting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{batchDeleting ? 'Deleting...' : `Delete Selected (${selectedCodes.length})`}</span>
                  </button>
                )}
              </div>
            )}

            {availableList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {availableList.map((item: any) => {
                  const isCopied = copiedCode === item.code;
                  const isSelected = selectedCodes.includes(item.id);
                  const isDeleting = deletingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 bg-[#F8FAFD] border rounded-xl flex items-center justify-between transition-all group ${
                        isSelected
                          ? 'border-[#2563EB] bg-blue-50/40 ring-1 ring-[#2563EB]/30'
                          : 'border-[#D9E4F2] hover:border-[#2563EB]/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCodes((prev) => [...prev, item.id]);
                            } else {
                              setSelectedCodes((prev) => prev.filter((id) => id !== item.id));
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <strong className="font-mono text-base text-[#111827] tracking-widest">
                              {item.code}
                            </strong>
                            <span className="text-[10px] font-mono text-[#6B7280] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                              {String(item.code).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-emerald-700 font-semibold uppercase">Single-Use</span>
                            <span>•</span>
                            <span>Case-Insensitive</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(item.code)}
                          className={`p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                            isCopied
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white border border-[#D9E4F2] text-[#4B5563] hover:text-[#2563EB] hover:border-[#2563EB]'
                          }`}
                          title="Copy Code"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCode(item.id, item.code)}
                          disabled={isDeleting}
                          className="p-2 rounded-lg text-xs font-semibold bg-white border border-[#D9E4F2] text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-all cursor-pointer disabled:opacity-50"
                          title="Delete Code"
                        >
                          {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-[#6B7280] space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-medium">
                  {searchQuery ? 'No available referral codes matched your search query.' : 'All referral codes have been used!'}
                </p>
                <button
                  onClick={() => handleGenerateMore(10)}
                  className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-lg cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate +10 New Codes</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Used Codes */}
        {activeTab === 'used' && (
          <div className="overflow-x-auto">
            {usedList.length > 0 ? (
              <table className="admin-table w-full text-xs">
                <thead>
                  <tr>
                    <th>Referral Code</th>
                    <th>Status</th>
                    <th>Redeemed By Member</th>
                    <th>Phone Number</th>
                    <th>Date &amp; Time Redeemed</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usedList.map((item: any) => {
                    const isDeleting = deletingId === item.id;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td>
                          <strong className="font-mono text-xs text-[#111827] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 tracking-wider">
                            {item.code}
                          </strong>
                        </td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 w-fit">
                              <Users className="w-3 h-3 text-slate-500" />
                              <span>USED</span>
                            </span>
                            {item.notes && item.notes.startsWith('TG:') && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded w-fit font-medium">
                                <Send className="w-2.5 h-2.5 text-sky-600" />
                                <span>Invited by: {item.notes.replace(/^TG:[^|]+\|?/, '') || 'Client'}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong className="text-[#111827]">{item.usedByName || 'Registered User'}</strong>
                          {item.usedById && (
                            <span className="block text-[10px] text-[#9CA3AF] font-mono">
                              ID: {item.usedById}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="font-mono text-[#374151]">{item.usedByPhone || '—'}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 text-[#4B5563]">
                            <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                            <span>
                              {item.usedAt ? new Date(item.usedAt).toLocaleString() : new Date(item.updatedAt).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleDeleteCode(item.id, item.code)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                            title="Delete Code"
                          >
                            {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            <span className="text-[10px]">Delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-[#6B7280] space-y-2">
                <Users className="w-8 h-8 text-[#9CA3AF] mx-auto" />
                <p className="text-xs font-medium">
                  {searchQuery ? 'No used codes match your search query.' : 'No referral codes have been used yet. Newly registered members will appear here.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Telegram Bot Clients & Quota Management */}
        {activeTab === 'telegram' && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-sky-600" /> Telegram Invitation Bot Management
                </span>
                <p className="text-[11px] text-sky-800">
                  Clients register by entering the access password (<code>9989GHYRT89</code>) in the Telegram bot. Each registered client gets an initial quota of <strong>10 codes</strong>. You can grant more codes below at any time, or merge (Murj) accounts if access was lost.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setMergeError(null);
                    setMergeModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Merge old/lost account data into new account"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Merge Account (Murj)</span>
                </button>
                <button
                  onClick={() => loadTelegramUsers()}
                  className="px-3 py-1.5 bg-white border border-sky-300 hover:bg-sky-100 text-sky-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTg ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {tgList.length > 0 ? (
                <table className="admin-table w-full text-xs">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Telegram Chat ID</th>
                      <th>Codes Generated</th>
                      <th>Remaining Quota (Max 50)</th>
                      <th>Registered On</th>
                      <th className="text-right">Adjust Quota (Max 50)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tgList.map((client: any) => {
                      const isGranting = grantingChatId === String(client.chatId);
                      const isExhausted = client.remainingQuota <= 0;
                      const isMax = client.remainingQuota >= 50;
                      const customQty = parseInt(customAmounts[String(client.chatId)] || '0', 10);
                      return (
                        <tr key={client.id} className="hover:bg-slate-50/70">
                          <td>
                            <div className="font-bold text-[#111827]">
                              {client.firstName || 'Client'}
                            </div>
                            {client.username && (
                              <div className="text-[10px] text-sky-600 font-mono">
                                @{client.username}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-[#374151] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {client.chatId}
                              </span>
                              <button
                                onClick={() => handleCopyChatId(client.chatId)}
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                title="Copy Chat ID"
                              >
                                {copiedChatId === String(client.chatId) ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className="font-bold text-[#111827]">
                              {client.codesGenerated || 0}
                            </span>
                            <span className="text-[10px] text-[#6B7280]"> generated</span>
                          </td>
                          <td>
                            {isMax ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                <ShieldCheck className="w-3 h-3 text-blue-600" />
                                <span>50 / 50 (MAX)</span>
                              </span>
                            ) : isExhausted ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>0 / 50 Left (Exhausted)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{client.remainingQuota} / 50 Available</span>
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center gap-1 text-[#4B5563]">
                              <Clock className="w-3.5 h-3.5 text-[#9CA3AF]" />
                              <span>{new Date(client.createdAt).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="text-right">
                            <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                              <button
                                onClick={() => {
                                  setMergeSourceChatId(String(client.chatId));
                                  setMergeError(null);
                                  setMergeModalOpen(true);
                                }}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold rounded shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                title="Merge this account into a new account"
                              >
                                <GitMerge className="w-3 h-3 text-indigo-600" />
                                <span>Murj</span>
                              </button>

                              {/* Decrease Quota Buttons */}
                              <button
                                disabled={isGranting || isExhausted}
                                onClick={() => handleDeductCodes(client.chatId, 5)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded border border-rose-200 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-0.5"
                                title="Decrease quota by 5 codes"
                              >
                                <Minus className="w-3 h-3" />
                                <span>5</span>
                              </button>
                              <button
                                disabled={isGranting || isExhausted}
                                onClick={() => handleDeductCodes(client.chatId, 10)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded border border-rose-200 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-0.5"
                                title="Decrease quota by 10 codes"
                              >
                                <Minus className="w-3 h-3" />
                                <span>10</span>
                              </button>

                              {/* Increase Quota Buttons */}
                              <button
                                disabled={isGranting || isMax}
                                onClick={() => handleGrantCodes(client.chatId, 5)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded border border-emerald-200 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-0.5"
                                title="Grant 5 more codes (Max 50)"
                              >
                                <Plus className="w-3 h-3" />
                                <span>5</span>
                              </button>
                              <button
                                disabled={isGranting || isMax}
                                onClick={() => handleGrantCodes(client.chatId, 10)}
                                className="px-2 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold rounded shadow-sm disabled:opacity-40 transition-all cursor-pointer flex items-center gap-0.5"
                                title="Grant 10 more codes (Max 50)"
                              >
                                {isGranting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                <span>10</span>
                              </button>

                              {/* Custom Quantity Adjustment */}
                              <div className="inline-flex items-center gap-1 pl-1 border-l border-slate-200">
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  placeholder="Qty"
                                  value={customAmounts[String(client.chatId)] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomAmounts((prev) => ({
                                      ...prev,
                                      [String(client.chatId)]: val,
                                    }));
                                  }}
                                  className="w-12 px-1 py-1 bg-white border border-[#D9E4F2] focus:border-[#2563EB] rounded text-xs text-center font-bold text-[#111827] focus:outline-none"
                                />
                                <button
                                  disabled={isGranting || isMax || !customQty}
                                  onClick={() => {
                                    if (customQty > 0) {
                                      handleGrantCodes(client.chatId, customQty);
                                      setCustomAmounts((prev) => ({
                                        ...prev,
                                        [String(client.chatId)]: '',
                                      }));
                                    }
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded shadow-sm disabled:opacity-30 transition-all cursor-pointer"
                                  title="Grant custom quota"
                                >
                                  +Grant
                                </button>
                                <button
                                  disabled={isGranting || isExhausted || !customQty}
                                  onClick={() => {
                                    if (customQty > 0) {
                                      handleDeductCodes(client.chatId, customQty);
                                      setCustomAmounts((prev) => ({
                                        ...prev,
                                        [String(client.chatId)]: '',
                                      }));
                                    }
                                  }}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded shadow-sm disabled:opacity-30 transition-all cursor-pointer"
                                  title="Deduct custom quota"
                                >
                                  -Deduct
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12 text-[#6B7280] space-y-2">
                  <Send className="w-8 h-8 text-sky-400 mx-auto" />
                  <p className="text-xs font-medium">
                    No clients have started the Telegram Bot yet.
                  </p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    When your clients start the bot and send <code>9989GHYRT89</code>, they will appear here with an initial 10-code quota.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* ======================================================== */}
      {/* MURJ (MERGE) TELEGRAM ACCOUNT MODAL                      */}
      {/* ======================================================== */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <GitMerge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Merge Telegram Account (Murj Data)</h3>
                  <p className="text-[11px] text-slate-500">Transfer data from a lost Telegram account to a new account.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMergeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleMergeSubmit} className="p-5 space-y-4">
              {mergeError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{mergeError}</span>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <strong>How Murj (Merge) Works:</strong> If a Mini Admin or client lost access to their Telegram account, have them register a new Telegram account in the bot first. Then select their old account below as the <em>Source</em> and their new account as the <em>Target</em>. All generated referral codes, registered members, remaining quota, and Mini Admin connections will be safely merged into the new account.
              </div>

              {/* Source Account */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  1. Old / Lost Telegram Account (Source)
                </label>
                <select
                  value={mergeSourceChatId}
                  onChange={(e) => setMergeSourceChatId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                >
                  <option value="">-- Select Old / Lost Account --</option>
                  {telegramUsers.map((u) => (
                    <option key={u.id} value={String(u.chatId)}>
                      {u.firstName || 'User'} {u.username ? `(@${u.username})` : ''} — Chat ID: {u.chatId} (Quota: {u.remainingQuota})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter Chat ID manually (e.g. 123456789)"
                  value={mergeSourceChatId}
                  onChange={(e) => setMergeSourceChatId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600 mt-1"
                />
              </div>

              {/* Target Account */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  2. New Telegram Account (Target)
                </label>
                <select
                  value={mergeTargetChatId}
                  onChange={(e) => setMergeTargetChatId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
                >
                  <option value="">-- Select New Account to Receive Data --</option>
                  {telegramUsers
                    .filter((u) => String(u.chatId) !== String(mergeSourceChatId))
                    .map((u) => (
                      <option key={u.id} value={String(u.chatId)}>
                        {u.firstName || 'User'} {u.username ? `(@${u.username})` : ''} — Chat ID: {u.chatId}
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  placeholder="Or enter new Chat ID manually (e.g. 987654321)"
                  value={mergeTargetChatId}
                  onChange={(e) => setMergeTargetChatId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600 mt-1"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMergeModalOpen(false)}
                  disabled={merging}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={merging || !mergeSourceChatId.trim() || !mergeTargetChatId.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {merging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitMerge className="w-3.5 h-3.5" />}
                  <span>{merging ? 'Merging Data...' : 'Confirm & Murj Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
