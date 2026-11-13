import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Database,
  BellRing,
  Wrench,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ArrowRightLeft,
  Save,
  Eye,
  Loader2,
  ShieldAlert,
  Server,
  Clock,
  Activity,
  Lock,
  Unlock,
  Settings,
  CreditCard,
} from 'lucide-react';
import { api } from '../../api/client';

export const AdminDeveloperPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Maintenance Mode State (Applies to Frontend AND Master/Mini Admin after login)
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState('Website is Under Maintenance');
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    'Website is under maintenance, you cannot work right now. Please wait until the developer completes maintenance.'
  );
  const [maintenanceExpectedEnd, setMaintenanceExpectedEnd] = useState('');

  // 2. Master Admin & Mini Admin Access Lock State
  const [masterAdminBlocked, setMasterAdminBlocked] = useState(false);
  const [miniAdminBlocked, setMiniAdminBlocked] = useState(false);
  const [adminBlockTitle, setAdminBlockTitle] = useState('Administrator Access Locked');
  const [adminBlockMessage, setAdminBlockMessage] = useState(
    'Your administrator panel has been temporarily locked by the Developer. Please clear any pending developer payment or contact the Developer to restore access.'
  );

  // 3. Master Admin Popup Notification State
  const [popupEnabled, setPopupEnabled] = useState(true);
  const [popupTitle, setPopupTitle] = useState('Payment Notice');
  const [popupMessage, setPopupMessage] = useState(
    'Payment needs to be updated. Kindly pay the payment to continue working.'
  );
  const [popupIntervalMinutes, setPopupIntervalMinutes] = useState(15);
  const [previewPopupOpen, setPreviewPopupOpen] = useState(false);

  // 4. Dual-Supabase Database State
  const [primaryUrlMasked, setPrimaryUrlMasked] = useState('');
  const [secondaryUrl, setSecondaryUrl] = useState('');
  const [dualSyncEnabled, setDualSyncEnabled] = useState(true);
  const [primaryStats, setPrimaryStats] = useState<any>(null);
  const [secondaryStats, setSecondaryStats] = useState<any>(null);
  const [wipeConfirmText, setWipeConfirmText] = useState('');
  const [showWipeModal, setShowWipeModal] = useState(false);

  const fetchDeveloperConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await api.getDeveloperConfig();
      if (res?.maintenance) {
        setMaintenanceEnabled(Boolean(res.maintenance.enabled));
        setMaintenanceTitle(res.maintenance.title || 'Website is Under Maintenance');
        setMaintenanceMessage(
          res.maintenance.message ||
            'Website is under maintenance, you cannot work right now. Please wait until the developer completes maintenance.'
        );
        setMaintenanceExpectedEnd(res.maintenance.expectedEnd || '');
      }
      if (res?.adminBlock) {
        setMasterAdminBlocked(Boolean(res.adminBlock.masterBlocked));
        setMiniAdminBlocked(Boolean(res.adminBlock.miniBlocked));
        setAdminBlockTitle(res.adminBlock.title || 'Administrator Access Locked');
        setAdminBlockMessage(
          res.adminBlock.message ||
            'Your administrator panel has been temporarily locked by the Developer. Please clear any pending developer payment or contact the Developer to restore access.'
        );
      }
      if (res?.masterAdminPopup) {
        setPopupEnabled(Boolean(res.masterAdminPopup.enabled));
        setPopupTitle(res.masterAdminPopup.title || 'Payment Notice');
        setPopupMessage(res.masterAdminPopup.message || '');
        setPopupIntervalMinutes(Number(res.masterAdminPopup.intervalMinutes) || 15);
      }
      if (res?.database) {
        setPrimaryUrlMasked(res.database.primaryDatabaseUrlMasked || '');
        setSecondaryUrl(res.database.secondaryDatabaseUrl || '');
        setDualSyncEnabled(Boolean(res.database.dualSyncEnabled));
        setPrimaryStats(res.database.primaryStats || null);
        setSecondaryStats(res.database.secondaryStats || null);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load Developer Control Panel settings' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeveloperConfig();
  }, [fetchDeveloperConfig]);

  const handleSaveAll = async (overrides?: {
    maintenanceEnabled?: boolean;
    masterAdminBlocked?: boolean;
    miniAdminBlocked?: boolean;
    popupEnabled?: boolean;
    dualSyncEnabled?: boolean;
  }) => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        maintenance: {
          enabled: overrides?.maintenanceEnabled ?? maintenanceEnabled,
          title: maintenanceTitle.trim(),
          message: maintenanceMessage.trim(),
          expectedEnd: maintenanceExpectedEnd.trim(),
        },
        adminBlock: {
          masterBlocked: overrides?.masterAdminBlocked ?? masterAdminBlocked,
          miniBlocked: overrides?.miniAdminBlocked ?? miniAdminBlocked,
          title: adminBlockTitle.trim(),
          message: adminBlockMessage.trim(),
        },
        masterAdminPopup: {
          enabled: overrides?.popupEnabled ?? popupEnabled,
          title: popupTitle.trim(),
          message: popupMessage.trim(),
          intervalMinutes: Math.max(1, Number(popupIntervalMinutes) || 15),
        },
        database: {
          secondaryDatabaseUrl: secondaryUrl.trim(),
          dualSyncEnabled: overrides?.dualSyncEnabled ?? dualSyncEnabled,
        },
      };

      const res: any = await api.updateDeveloperConfig(payload);
      api.invalidateCache('/settings/public');
      setMessage({ type: 'success', text: res?.message || 'Developer configuration saved!' });
      await fetchDeveloperConfig();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save Developer configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleFullSync = async (direction: 'PRIMARY_TO_SECONDARY' | 'SECONDARY_TO_PRIMARY') => {
    if (!secondaryUrl.trim()) {
      setMessage({
        type: 'error',
        text: 'Please paste the Secondary / Linked Supabase PostgreSQL Connection URL first.',
      });
      return;
    }
    setSyncing(true);
    setMessage(null);
    try {
      const res: any = await api.syncDeveloperDatabases({
        direction,
        secondaryDatabaseUrl: secondaryUrl.trim(),
      });
      if (res?.primaryStats) setPrimaryStats(res.primaryStats);
      if (res?.secondaryStats) setSecondaryStats(res.secondaryStats);
      setMessage({
        type: 'success',
        text: res?.message || 'All 25 tables synchronized across both Supabase databases!',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Database sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const handleWipeSecondary = async () => {
    if (wipeConfirmText.trim() !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm wiping the Secondary/Linked database.' });
      return;
    }
    setWiping(true);
    setMessage(null);
    try {
      const res: any = await api.wipeDeveloperDatabase({
        target: 'SECONDARY',
        confirmText: 'DELETE',
      });
      if (res?.secondaryStats) setSecondaryStats(res.secondaryStats);
      setDualSyncEnabled(false);
      setShowWipeModal(false);
      setWipeConfirmText('');
      setMessage({
        type: 'success',
        text: res?.message || 'Linked Supabase database wiped cleanly!',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to wipe database' });
    } finally {
      setWiping(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#2563EB]" />
        <p className="text-xs font-bold text-slate-500">Loading Developer Master Control Panel...</p>
      </div>
    );
  }

  const keyTables = [
    'User',
    'Wallet',
    'WalletTransaction',
    'DepositRequest',
    'WithdrawalRequest',
    'TaskSubmission',
    'UserTaskProgress',
    'UserLevelProgress',
    'AdminReferralCode',
    'TelegramUser',
    'Level',
    'Task',
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-2xl p-6 shadow-lg border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold tracking-tight">Developer Master Console</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                developer.com
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Exclusive Developer authority over Website & Admin Maintenance Mode, Master Admin / Mini Admin Access Blocking, Payment Reminder Popups, Payment Methods, and Live Dual-Supabase Sync.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
          <Link
            to="/adminpanal/settings"
            className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-400/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payment Methods & Site Settings
          </Link>
          <button
            type="button"
            onClick={fetchDeveloperConfig}
            disabled={saving || syncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs animate-in fade-in ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-[11px] font-bold underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CARD 0: ADMIN ACCESS LOCK / SAFETY BLOCK (BLOCK MASTER ADMIN & MINI ADMIN) */}
      <div className="bg-white rounded-2xl border border-[#D9E4F2] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5EBF4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-red-50/70 via-[#F8FAFD] to-[#F8FAFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Admin Safety Lock & Access Blocking</h3>
              <p className="text-[11px] text-[#6B7280]">
                Instantly block Master Admin or Mini Admins after login so they see your lock screen and cannot perform any actions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextVal = !masterAdminBlocked;
                setMasterAdminBlocked(nextVal);
                handleSaveAll({ masterAdminBlocked: nextVal });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                masterAdminBlocked
                  ? 'bg-red-600 text-white shadow-sm shadow-red-500/30'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {masterAdminBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {masterAdminBlocked ? 'MASTER ADMIN: BLOCKED' : 'MASTER ADMIN: ALLOWED'}
            </button>

            <button
              type="button"
              onClick={() => {
                const nextVal = !miniAdminBlocked;
                setMiniAdminBlocked(nextVal);
                handleSaveAll({ miniAdminBlocked: nextVal });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                miniAdminBlocked
                  ? 'bg-red-600 text-white shadow-sm shadow-red-500/30'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {miniAdminBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {miniAdminBlocked ? 'MINI ADMINS: BLOCKED' : 'MINI ADMINS: ALLOWED'}
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Admin Lock Screen Headline</label>
            <input
              type="text"
              value={adminBlockTitle}
              onChange={(e) => setAdminBlockTitle(e.target.value)}
              placeholder="Administrator Access Locked"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message Shown to Blocked Master / Mini Admin After Login
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={adminBlockMessage}
                onChange={(e) => setAdminBlockMessage(e.target.value)}
                placeholder="Website is under maintenance / Please clear developer payment to continue working..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Lock
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid for Maintenance Mode & Master Admin Popup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: WEBSITE & ADMIN MAINTENANCE MODE (DEVELOPER EXCLUSIVE) */}
        <div className="bg-white rounded-2xl border border-[#D9E4F2] shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E5EBF4] flex items-center justify-between bg-[#F8FAFD]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Global Maintenance Mode (Developer Only)</h3>
                <p className="text-[11px] text-[#6B7280]">
                  Locks user frontend AND blocks Master Admin after login ("Cannot work right now")
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !maintenanceEnabled;
                setMaintenanceEnabled(nextVal);
                handleSaveAll({ maintenanceEnabled: nextVal });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                maintenanceEnabled
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${maintenanceEnabled ? 'bg-white animate-ping' : 'bg-emerald-600'}`} />
              {maintenanceEnabled ? 'MAINTENANCE ON' : 'SITE LIVE (OFF)'}
            </button>
          </div>

          <div className="p-6 space-y-4 flex-1">
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 font-medium">
              <strong>Developer Exclusive:</strong> Master Admin cannot turn Maintenance Mode on or off. When ON, both public users and Master Admins (after logging in) see the maintenance screen and cannot work until you turn it off.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Maintenance Headline Title</label>
              <input
                type="text"
                value={maintenanceTitle}
                onChange={(e) => setMaintenanceTitle(e.target.value)}
                placeholder="Website is Under Maintenance"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maintenance Message (Shown to Users & Master Admin After Login)
              </label>
              <textarea
                rows={3}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Website is under maintenance, you cannot work right now."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Completion Note (Optional)</label>
              <input
                type="text"
                value={maintenanceExpectedEnd}
                onChange={(e) => setMaintenanceExpectedEnd(e.target.value)}
                placeholder="e.g. Back online at 6:00 PM PKT"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Maintenance Settings
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: MASTER ADMIN POPUP NOTIFICATION CONTROL */}
        <div className="bg-white rounded-2xl border border-[#D9E4F2] shadow-xs overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#E5EBF4] flex items-center justify-between bg-[#F8FAFD]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111827]">Master Admin Popup Reminder</h3>
                <p className="text-[11px] text-[#6B7280]">Control recurring popup shown exclusively to Master Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !popupEnabled;
                setPopupEnabled(nextVal);
                handleSaveAll({ popupEnabled: nextVal });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                popupEnabled
                  ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${popupEnabled ? 'bg-slate-950 animate-pulse' : 'bg-slate-500'}`} />
              {popupEnabled ? 'POPUP ENABLED' : 'POPUP DISABLED'}
            </button>
          </div>

          <div className="p-6 space-y-4 flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Popup Modal Title</label>
                <input
                  type="text"
                  value={popupTitle}
                  onChange={(e) => setPopupTitle(e.target.value)}
                  placeholder="Payment Notice"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" /> Repeat Every (Mins)
                </label>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={popupIntervalMinutes}
                  onChange={(e) => setPopupIntervalMinutes(Math.max(1, parseInt(e.target.value || '15', 10)))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Popup Reminder Message</label>
              <textarea
                rows={3}
                value={popupMessage}
                onChange={(e) => setPopupMessage(e.target.value)}
                placeholder="Payment needs to be updated. Kindly pay the payment to continue working."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPreviewPopupOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Popup
              </button>

              <button
                type="button"
                onClick={() => handleSaveAll()}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Popup Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: DUAL-SUPABASE LIVE SYNCHRONIZATION & CUTOVER MANAGER */}
      <div className="bg-white rounded-2xl border border-[#D9E4F2] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5EBF4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8FAFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Dual-Supabase Live Sync & Database Manager</h3>
              <p className="text-[11px] text-[#6B7280]">
                Mirror every create, update, and delete across both Old & New Supabase databases simultaneously
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextVal = !dualSyncEnabled;
                setDualSyncEnabled(nextVal);
                handleSaveAll({ dualSyncEnabled: nextVal });
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                dualSyncEnabled
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              {dualSyncEnabled ? 'LIVE DUAL-WRITE SYNC: ON' : 'LIVE DUAL-WRITE SYNC: PAUSED'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection URL Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600" />
                  Primary Supabase Database (Main Source of Truth)
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    primaryStats?.connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {primaryStats?.connected ? `Connected (${primaryStats.totalRows} rows)` : 'Disconnected'}
                </span>
              </div>
              <input
                type="text"
                readOnly
                value={primaryUrlMasked || 'postgresql://postgres.vzgjygtbdkezaerygjbp:****@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres'}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-600"
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600" />
                  Secondary / Mirror Supabase Database URL
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    secondaryStats?.connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {secondaryStats?.connected
                    ? `Connected (${secondaryStats.totalRows} rows)`
                    : secondaryUrl.trim()
                    ? 'Connection Error'
                    : 'Awaiting URL'}
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secondaryUrl}
                  onChange={(e) => setSecondaryUrl(e.target.value)}
                  placeholder="Paste Secondary Supabase postgresql:// connection string here..."
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 text-[11px] font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex-shrink-0 cursor-pointer"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar: Full Clone & Wipe Linked Database */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#F8FAFD] border border-[#E5EBF4]">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleFullSync('PRIMARY_TO_SECONDARY')}
                disabled={syncing || !secondaryUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                Clone All 25 Tables (Main → Secondary)
              </button>

              <button
                type="button"
                onClick={() => handleFullSync('SECONDARY_TO_PRIMARY')}
                disabled={syncing || !secondaryUrl.trim()}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-800 border border-slate-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                Pull All Data (Secondary → Main)
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowWipeModal(true)}
              disabled={!secondaryUrl.trim()}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Wipe / Reset Secondary Database
            </button>
          </div>

          {/* Live Row Count Comparison Table */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              Live Table Row Count Comparison
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {keyTables.map((table) => {
                const pCount = primaryStats?.tables?.[table] ?? 0;
                const sCount = secondaryStats?.tables?.[table] ?? 0;
                const isMatched = secondaryStats?.connected && pCount === sCount;

                return (
                  <div
                    key={table}
                    className={`p-3 rounded-xl border text-xs ${
                      isMatched
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="font-bold text-slate-800 truncate" title={table}>
                      {table}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Main:</span>
                      <span className="font-mono font-bold text-slate-900">{pCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Mirror:</span>
                      <span className="font-mono font-bold text-indigo-700">
                        {secondaryStats?.connected ? sCount : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Popup Modal */}
      {previewPopupOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setPreviewPopupOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{popupTitle || 'Payment Notice'}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Repeats every {popupIntervalMinutes} min(s) for Master Admin
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-6 text-center">
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">{popupMessage}</p>
            </div>
            <div className="px-6 pb-6 pt-1">
              <button
                type="button"
                onClick={() => setPreviewPopupOpen(false)}
                className="w-full py-2.5 px-5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer"
              >
                I Understand (Close Preview)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wipe Confirmation Modal */}
      {showWipeModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setShowWipeModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-red-200 max-w-md w-full overflow-hidden p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-700">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold">Wipe Linked Database?</h3>
                <p className="text-xs text-slate-500">
                  This will pause Dual-Sync and truncate all 25 tables in the Secondary database while keeping your Main database untouched.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Type <span className="font-mono text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={wipeConfirmText}
                onChange={(e) => setWipeConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowWipeModal(false);
                  setWipeConfirmText('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleWipeSecondary}
                disabled={wiping || wipeConfirmText.trim() !== 'DELETE'}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {wiping ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Wipe Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
