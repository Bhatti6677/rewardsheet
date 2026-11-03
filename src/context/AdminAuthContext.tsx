import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

export interface Admin {
  id: string;
  username: string;
  role: string;
}

interface AdminAuthContextType {
  admin: Admin | null;
  loading: boolean;
  adminLogin: (token: string, adminData: Admin) => void;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('royal_admin_token');
    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    api.adminGetMe()
      .then((res) => {
        setAdmin(res.admin);
      })
      .catch(() => {
        localStorage.removeItem('royal_admin_token');
        setAdmin(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleTerminated = (e: any) => {
      localStorage.removeItem('royal_admin_token');
      setAdmin(null);
      if (e?.detail?.error) {
        alert(e.detail.error);
      }
    };
    window.addEventListener('royal_admin_session_terminated', handleTerminated);
    return () => {
      window.removeEventListener('royal_admin_session_terminated', handleTerminated);
    };
  }, []);

  // Periodic session heartbeat for active admin sessions (detects revoked sessions promptly)
  useEffect(() => {
    if (!admin) return;
    const interval = setInterval(() => {
      api.adminGetMe().catch((err: any) => {
        if (err?.message?.includes('Session Terminated') || err?.message?.includes('401')) {
          localStorage.removeItem('royal_admin_token');
          setAdmin(null);
        }
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [admin]);

  const adminLogin = (token: string, adminData: Admin) => {
    localStorage.setItem('royal_admin_token', token);
    setAdmin(adminData);
  };

  const adminLogout = () => {
    api.adminLogout();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, adminLogin, adminLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
