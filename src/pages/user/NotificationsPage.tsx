import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  ArrowDownLeft,
  ArrowUpRight,
  XCircle,
  AlertCircle,
  Megaphone,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { api } from '../../api/client';

const getReadAnnouncements = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('royal_read_announcements') || '[]');
  } catch {
    return [];
  }
};

const addReadAnnouncement = (id: string) => {
  try {
    const current = getReadAnnouncements();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem('royal_read_announcements', JSON.stringify(current));
    }
  } catch {}
};

const addReadAnnouncements = (ids: string[]) => {
  try {
    const current = getReadAnnouncements();
    let changed = false;
    for (const id of ids) {
      if (!current.includes(id)) {
        current.push(id);
        changed = true;
      }
    }
    if (changed) {
      localStorage.setItem('royal_read_announcements', JSON.stringify(current));
    }
  } catch {}
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DEPOSITS' | 'WITHDRAWALS' | 'ANNOUNCEMENTS'>('ALL');

  const loadNotifications = () => {
    setLoading(true);
    api.getNotifications({ bypassCache: true })
      .then((res) => {
        const rawNotifs: any[] = res.notifications || [];
        const readAnnounce = getReadAnnouncements();
        const normalized = rawNotifs.map((n) => {
          if (n.isAnnouncement || n.id?.startsWith('announcement_')) {
            return { ...n, isRead: n.isRead || readAnnounce.includes(n.id) };
          }
          return n;
        });
        setNotifications(normalized);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();

    // Automatically mark notifications as read on view so unread badge clears
    const markVisitedAsRead = async () => {
      try {
        await api.markAllNotificationsRead();
        api.invalidateCache('/notifications');
        window.dispatchEvent(
          new CustomEvent('royal_live_update', {
            detail: { type: 'notification', unreadCount: 0 },
          })
        );
      } catch {}
    };
    markVisitedAsRead();

    const handleLiveEvent = (e: any) => {
      if (e.detail?.type === 'notification' || e.detail?.type === 'refresh') {
        loadNotifications();
      }
    };
    window.addEventListener('royal_live_update', handleLiveEvent);
    return () => window.removeEventListener('royal_live_update', handleLiveEvent);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      if (id.startsWith('announcement_')) {
        addReadAnnouncement(id);
      } else {
        await api.markNotificationRead(id);
      }
      api.invalidateCache('/notifications');
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
        const newUnread = updated.filter((n) => !n.isRead && isAllowedNotification(n)).length;
        window.dispatchEvent(
          new CustomEvent('royal_live_update', {
            detail: { type: 'notification', unreadCount: newUnread },
          })
        );
        return updated;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const announceIds = notifications
        .filter((n) => n.isAnnouncement || n.id?.startsWith('announcement_'))
        .map((n) => n.id);
      addReadAnnouncements(announceIds);
      await api.markAllNotificationsRead();
      api.invalidateCache('/notifications');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(
        new CustomEvent('royal_live_update', {
          detail: { type: 'notification', unreadCount: 0 },
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to strictly allow ONLY deposit & withdrawal approved/rejected and announcements
  const isAllowedNotification = (n: any) => {
    if (n.notificationType === 'ANNOUNCEMENT' || n.isAnnouncement) return true;
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();
    if (n.notificationType === 'DEPOSIT_STATUS') {
      return (
        title.includes('approved') ||
        title.includes('rejected') ||
        msg.includes('approved') ||
        msg.includes('rejected')
      );
    }
    if (n.notificationType === 'WITHDRAWAL_STATUS') {
      return (
        title.includes('approved') ||
        title.includes('rejected') ||
        title.includes('disbursed') ||
        title.includes('paid') ||
        msg.includes('approved') ||
        msg.includes('rejected') ||
        msg.includes('disbursed') ||
        msg.includes('paid')
      );
    }
    return false;
  };

  // Helper to extract admin comment from notification message
  const parseNotificationMessage = (rawMessage: string) => {
    const markers = ['Admin Comment:', 'admin comment:', 'Reason:', 'reason:'];
    for (const marker of markers) {
      const idx = rawMessage.indexOf(marker);
      if (idx !== -1) {
        const mainText = rawMessage.slice(0, idx).replace(/[\r\n]+$/, '').trim();
        const comment = rawMessage.slice(idx + marker.length).trim();
        return { mainText: mainText || rawMessage, adminComment: comment || null };
      }
    }
    return { mainText: rawMessage, adminComment: null };
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (!isAllowedNotification(n)) return false;
      if (activeTab === 'DEPOSITS') return n.notificationType === 'DEPOSIT_STATUS';
      if (activeTab === 'WITHDRAWALS') return n.notificationType === 'WITHDRAWAL_STATUS';
      if (activeTab === 'ANNOUNCEMENTS') return n.notificationType === 'ANNOUNCEMENT' || n.isAnnouncement;
      return true;
    });
  }, [notifications, activeTab]);

  const counts = useMemo(() => {
    const allowed = notifications.filter(isAllowedNotification);
    return {
      all: allowed.length,
      deposits: allowed.filter((n) => n.notificationType === 'DEPOSIT_STATUS').length,
      withdrawals: allowed.filter((n) => n.notificationType === 'WITHDRAWAL_STATUS').length,
      announcements: allowed.filter((n) => n.notificationType === 'ANNOUNCEMENT' || n.isAnnouncement).length,
    };
  }, [notifications]);

  // Determine badge style and icon based on notification type and status
  const getNotificationDetails = (n: any) => {
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();

    if (n.notificationType === 'ANNOUNCEMENT' || n.isAnnouncement) {
      return {
        badgeText: 'Official Announcement',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        iconBg: 'bg-amber-500/20 text-[#FFD45A]',
        icon: Megaphone,
      };
    }

    if (n.notificationType === 'DEPOSIT_STATUS') {
      const isApproved = title.includes('approved') || msg.includes('approved');
      if (isApproved) {
        return {
          badgeText: 'Deposit Approved',
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          iconBg: 'bg-emerald-500/20 text-emerald-400',
          icon: ArrowDownLeft,
        };
      }
      return {
        badgeText: 'Deposit Rejected',
        badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
        iconBg: 'bg-red-500/20 text-red-400',
        icon: XCircle,
      };
    }

    if (n.notificationType === 'WITHDRAWAL_STATUS') {
      const isApproved =
        title.includes('approved') ||
        title.includes('disbursed') ||
        title.includes('paid') ||
        msg.includes('approved') ||
        msg.includes('disbursed') ||
        msg.includes('paid');

      if (isApproved) {
        return {
          badgeText: title.includes('disbursed') ? 'Withdrawal Disbursed' : 'Withdrawal Approved',
          badgeClass: 'bg-[#10D6A0]/15 text-[#10D6A0] border-[#10D6A0]/30',
          iconBg: 'bg-[#10D6A0]/20 text-[#10D6A0]',
          icon: ArrowUpRight,
        };
      }
      return {
        badgeText: 'Withdrawal Rejected',
        badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
        iconBg: 'bg-red-500/20 text-red-400',
        icon: AlertCircle,
      };
    }

    return {
      badgeText: 'Notice',
      badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      iconBg: 'bg-[#1459E8]/20 text-[#22D3EE]',
      icon: Bell,
    };
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-[#FFD45A]" /> Notifications
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Official updates regarding your deposit approvals, withdrawals, and platform announcements.
          </p>
        </div>

        {notifications.some((n) => !n.isRead && isAllowedNotification(n)) && (
          <button
            onClick={handleMarkAllRead}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#214B91] text-xs font-semibold text-slate-200 transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-[#22D3EE]" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ALL'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
          }`}
        >
          <span>All</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
            {counts.all}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DEPOSITS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'DEPOSITS'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
          }`}
        >
          <span>Deposits</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
            {counts.deposits}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('WITHDRAWALS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'WITHDRAWALS'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
          }`}
        >
          <span>Withdrawals</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
            {counts.withdrawals}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ANNOUNCEMENTS')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ANNOUNCEMENTS'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
          }`}
        >
          <span>Announcements</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
            {counts.announcements}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading notifications...</div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const { badgeText, badgeClass, iconBg, icon: IconComponent } = getNotificationDetails(n);
            const { mainText, adminComment } = parseNotificationMessage(n.message);

            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`royal-card p-4 sm:p-5 rounded-2xl flex flex-col gap-3 transition-all cursor-pointer ${
                  !n.isRead ? 'border-[#2478FF] bg-[#1459E8]/10' : 'opacity-85'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBg}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-white tracking-tight">{n.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                          {badgeText}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#FFD45A]" title="Unread" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pt-0.5 whitespace-pre-line">
                        {mainText}
                      </p>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(n.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#22D3EE]" />
                    </button>
                  )}
                </div>

                {/* Admin Comment Highlight Box */}
                {adminComment && (
                  <div className="ml-0 sm:ml-13 p-3 rounded-xl bg-black/40 border border-[#2563EB]/30 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#FFD45A]">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Admin Comment:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans bg-white/[0.03] p-2.5 rounded-lg border border-white/5">
                      {adminComment}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1 ml-0 sm:ml-13">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="royal-card p-12 text-center rounded-3xl space-y-2">
          <Bell className="w-8 h-8 text-slate-500 mx-auto opacity-40" />
          <p className="text-xs text-slate-400">You don't have any notifications right now.</p>
        </div>
      )}
    </div>
  );
};
