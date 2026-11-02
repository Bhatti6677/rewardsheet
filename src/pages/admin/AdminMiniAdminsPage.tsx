import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  Trash2,
  Lock,
  Mail,
  User,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { api } from '../../api/client';

interface MiniAdminItem {
  id: string;
  username: string;
  email: string | null;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
  currentOtp: string;
  otpSecondsRemaining: number;
  createdAt: string;
  updatedAt?: string;
}

export const AdminMiniAdminsPage: React.FC = () => {
  const [miniAdmins, setMiniAdmins] = useState<MiniAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resetModalAdmin, setResetModalAdmin] = useState<MiniAdminItem | null>(null);
  const [deleteModalAdmin, setDeleteModalAdmin] = useState<MiniAdminItem | null>(null);

  // Create form state
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Action feedback alert
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  const loadMiniAdmins = (silent = false) => {
    if (!silent) setLoading(true);
    api
      .getAdminMiniAdmins()
      .then((res: any) => {
        setMiniAdmins(res.miniAdmins || []);
      })
      .catch((err) => {
        console.error('Failed to load mini admins:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMiniAdmins();
  }, []);

  // Live seconds countdown ticker (decrements every 1s, refetches when cycle reaches 0)
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setMiniAdmins((prev) => {
        let shouldRefetch = false;
        const updated = prev.map((item) => {
          const nextSec = item.otpSecondsRemaining - 1;
          if (nextSec <= 0) {
            shouldRefetch = true;
            return { ...item, otpSecondsRemaining: 0 };
          }
          return { ...item, otpSecondsRemaining: nextSec };
        });

        if (shouldRefetch) {
          loadMiniAdmins(true);
        }
        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleCopyOtp = (otp: string, id: string) => {
    if (!otp || otp === '------') return;
    navigator.clipboard.writeText(otp);
    setCopiedOtpId(id);
    setTimeout(() => setCopiedOtpId(null), 2000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);

    try {
      const res = await api.createAdminMiniAdmin({
        email: createEmail.trim(),
        password: createPassword,
        username: createUsername.trim() || undefined,
      });

      showNotification(`Mini Admin account ${res.miniAdmin?.email || createEmail} created successfully!`);
      setCreateModalOpen(false);
      setCreateEmail('');
      setCreatePassword('');
      setCreateUsername('');
      loadMiniAdmins();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create Mini Admin account');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (admin: MiniAdminItem) => {
    const nextStatus = admin.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateAdminMiniAdminStatus(admin.id, nextStatus);
      showNotification(`Mini Admin account ${admin.email || admin.username} marked as ${nextStatus}.`);
      loadMiniAdmins(true);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAdmin) return;
    setResetError(null);
    setResetting(true);

    try {
      await api.updateAdminMiniAdminPassword(resetModalAdmin.id, newPassword);
      showNotification(`Password for ${resetModalAdmin.email || resetModalAdmin.username} updated successfully.`);
      setResetModalAdmin(null);
      setNewPassword('');
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleRegenerateOtp = async (admin: MiniAdminItem) => {
    if (!confirm(`Are you sure you want to regenerate the dynamic OTP secret for ${admin.email || admin.username}? The current OTP will immediately change.`)) {
      return;
    }
    try {
      await api.regenerateAdminMiniAdminOtp(admin.id);
      showNotification(`Dynamic OTP secret rotated for ${admin.email || admin.username}.`);
      loadMiniAdmins(true);
    } catch (err: any) {
      alert(err.message || 'Failed to rotate OTP');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteModalAdmin) return;
    try {
      await api.deleteAdminMiniAdmin(deleteModalAdmin.id);
      showNotification(`Mini Admin account ${deleteModalAdmin.email || deleteModalAdmin.username} permanently deleted.`);
      setDeleteModalAdmin(null);
      loadMiniAdmins();
    } catch (err: any) {
      alert(err.message || 'Failed to delete Mini Admin');
    }
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredAdmins = miniAdmins.filter((a) => {
    const query = searchQuery.toLowerCase();
    return (
      (a.email && a.email.toLowerCase().includes(query)) ||
      (a.username && a.username.toLowerCase().includes(query)) ||
      a.id.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header Cards with Stats & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D9E4F2] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-[#2563EB] rounded-xl border border-blue-100">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Mini Admin Management
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  Master Admin Exclusive
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create and control delegated Level 1 administrators with dynamic 10-minute rotating OTP security.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadMiniAdmins()}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              setCreateError(null);
              setCreateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Mini Admin</span>
          </button>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-amber-50/40 border border-blue-200/80 rounded-2xl p-4.5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
            <Lock className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-900 flex items-center gap-2">
              Strict Level 1 Sandbox & Rotating 10-Minute TOTP Architecture
            </p>
            <p className="text-slate-600 leading-relaxed text-[11.5px]">
              Mini Admins are strictly scoped: they can <strong>only</strong> view and manage users on <strong>Level 1</strong> and review <strong>Level 1 submitted tasks</strong>. They are strictly blocked from financial withdrawals, deposits, wallets, settings, spin wheel, or tiers beyond Level 1.
              Each Mini Admin is assigned a dynamic 6-digit OTP that changes automatically every <strong>10 minutes</strong>. The current OTP is displayed <strong>exclusively</strong> in this Master Admin panel. Mini Admins must request their active OTP from you to log in.
            </p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-[#D9E4F2] shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <div className="relative w-full max-w-sm">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Gmail or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Mini Admins: <span className="font-bold text-slate-900">{filteredAdmins.length}</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading Mini Admin accounts...
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Mini Admin Accounts Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'No accounts matched your search keyword.'
                : 'You have not created any Mini Admin accounts yet. Click "Create Mini Admin" above to add your first delegated administrator.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFD] border-b border-[#E2E8F0] text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Mini Admin</th>
                  <th className="py-3 px-4">Assigned Permission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active 10-Min OTP</th>
                  <th className="py-3 px-4">Rotation Timer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs">
                {filteredAdmins.map((admin) => {
                  const isCopied = copiedOtpId === admin.id;

                  return (
                    <tr key={admin.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{admin.email || admin.username}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Username: <span className="text-slate-600 font-medium">{admin.username}</span> • Created {new Date(admin.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Layers className="w-3 h-3" />
                          Level 1 Tasks & Users Only
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(admin)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold cursor-pointer transition-all ${
                            admin.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle status"
                        >
                          {admin.status === 'ACTIVE' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>Suspended</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Prominent Live 10-Minute OTP Badge */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-2 bg-[#0A101D] text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-sm font-mono font-black text-sm tracking-widest">
                          <span>{admin.currentOtp}</span>
                          <button
                            onClick={() => handleCopyOtp(admin.currentOtp, admin.id)}
                            className="p-1 hover:bg-amber-400/20 text-amber-300 rounded-md transition-colors cursor-pointer"
                            title="Copy active OTP"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Countdown Timer */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span className="font-mono font-bold text-slate-800">
                            {formatCountdown(admin.otpSecondsRemaining)}
                          </span>
                          <span className="text-[10px] text-slate-400">remaining</span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleRegenerateOtp(admin)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Rotate OTP Secret"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setResetModalAdmin(admin);
                              setNewPassword('');
                              setResetError(null);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteModalAdmin(admin)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Mini Admin Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. CREATE MINI ADMIN MODAL */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Create Mini Admin</h3>
                  <p className="text-[11px] text-slate-500">Provide Gmail address and secure password</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="miniadmin@gmail.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-500">* (min 6 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Username <span className="text-slate-400 text-[10px]">(Optional, defaults to Gmail)</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. mini_john"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  Dynamic OTP Assigned Automatically
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Upon creation, a unique secret will be generated. The Mini Admin will only be able to log in by entering the current active 10-minute OTP that appears here on your Master Admin page.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {creating ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. RESET PASSWORD MODAL */}
      {/* ======================================================== */}
      {resetModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Reset Password</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {resetModalAdmin.email || resetModalAdmin.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetModalAdmin(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">* (min 6 characters)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F8FAFD] border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalAdmin(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {resetting ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Save Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteModalAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl border border-slate-200 shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Mini Admin?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permanently remove account for <strong className="text-slate-800">{deleteModalAdmin.email || deleteModalAdmin.username}</strong>.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              This action is permanent and cannot be undone. The Mini Admin will immediately lose all access to Level 1 management and the system.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModalAdmin(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
