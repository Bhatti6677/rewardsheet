import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './context/AdminAuthContext';
import { AdminLayout } from './components/admin/AdminLayout';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLevelApprovalsPage } from './pages/admin/AdminLevelApprovalsPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminLevelsPage } from './pages/admin/AdminLevelsPage';
import { AdminTasksPage } from './pages/admin/AdminTasksPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminDepositsPage } from './pages/admin/AdminDepositsPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminWalletsPage } from './pages/admin/AdminWalletsPage';
import { AdminSpinPage } from './pages/admin/AdminSpinPage';
import { AdminReferralsPage } from './pages/admin/AdminReferralsPage';
import { AdminReferralCodesPage } from './pages/admin/AdminReferralCodesPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminActivityLogsPage } from './pages/admin/AdminActivityLogsPage';
import { AdminMiniAdminsPage } from './pages/admin/AdminMiniAdminsPage';

const ProtectedAdminRoute: React.FC = () => {
  const { admin, loading: isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020712] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1459E8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/adminpanal/login" replace />;
  }

  return <AdminLayout />;
};

export const AdminApp: React.FC = () => {
  const { admin } = useAdminAuth();

  const adminRoutes = (
    <>
      <Route path="login" element={admin ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminLoginPage />} />
      <Route index element={admin ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminLoginPage />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedAdminRoute />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="submissions" element={<AdminSubmissionsPage />} />
        <Route path="users/:userId" element={<AdminUserDetailPage />} />

        {/* Master Admin Only Routes (Restricted from Mini Admins) */}
        <Route
          path="mini-admins"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminMiniAdminsPage />}
        />
        <Route
          path="level-approvals"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminLevelApprovalsPage />}
        />
        <Route
          path="levels"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminLevelsPage />}
        />
        <Route
          path="tasks"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminTasksPage />}
        />
        <Route
          path="deposits"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminDepositsPage />}
        />
        <Route
          path="withdrawals"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminWithdrawalsPage />}
        />
        <Route
          path="wallets"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminWalletsPage />}
        />
        <Route
          path="spin"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminSpinPage />}
        />
        <Route
          path="referrals"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminReferralsPage />}
        />
        <Route
          path="referral-codes"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminReferralCodesPage />}
        />
        <Route
          path="transactions"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminTransactionsPage />}
        />
        <Route
          path="announcements"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminAnnouncementsPage />}
        />
        <Route
          path="reports"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminReportsPage />}
        />
        <Route
          path="settings"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminSettingsPage />}
        />
        <Route
          path="activity-logs"
          element={admin?.role === 'MINI_ADMIN' ? <Navigate to="/adminpanal/dashboard" replace /> : <AdminActivityLogsPage />}
        />
      </Route>
    </>
  );

  return (
    <Routes>
      {/* If mounted at root in standalone mode */}
      <Route path="/adminpanal/*">
        {adminRoutes}
      </Route>
      <Route path="/adminpanal">
        {adminRoutes}
      </Route>

      {/* Direct relative routes (when mounted inside App.tsx at /adminpanal/*) */}
      {adminRoutes}

      {/* Top-level aliases for direct navigation */}
      <Route path="/dashboard" element={<Navigate to="/adminpanal/dashboard" replace />} />
      <Route path="/mini-admins" element={<Navigate to="/adminpanal/mini-admins" replace />} />
      <Route path="/users" element={<Navigate to="/adminpanal/users" replace />} />
      <Route path="/level-approvals" element={<Navigate to="/adminpanal/level-approvals" replace />} />
      <Route path="/referral-codes" element={<Navigate to="/adminpanal/referral-codes" replace />} />
      <Route path="/tasks" element={<Navigate to="/adminpanal/tasks" replace />} />
      <Route path="/submissions" element={<Navigate to="/adminpanal/submissions" replace />} />
      <Route path="/deposits" element={<Navigate to="/adminpanal/deposits" replace />} />
      <Route path="/withdrawals" element={<Navigate to="/adminpanal/withdrawals" replace />} />
      <Route path="/wallets" element={<Navigate to="/adminpanal/wallets" replace />} />
      <Route path="/spin" element={<Navigate to="/adminpanal/spin" replace />} />
      <Route path="/referrals" element={<Navigate to="/adminpanal/referrals" replace />} />
      <Route path="/transactions" element={<Navigate to="/adminpanal/transactions" replace />} />
      <Route path="/settings" element={<Navigate to="/adminpanal/settings" replace />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/adminpanal/dashboard" replace />} />
    </Routes>
  );
};
