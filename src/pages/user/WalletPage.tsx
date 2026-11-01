import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Crown,
  Clock,
  TrendingUp,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const WalletPage: React.FC = () => {
  const { wallet: authWallet, updateWallet } = useAuth();
  const cachedWallet = api.getCachedData<any>('/wallet')?.wallet || authWallet;
  const [wallet, setWallet] = useState<any>(cachedWallet);
  const [loading, setLoading] = useState(!cachedWallet);

  const loadData = () => {
    if (!wallet) setLoading(true);
    api.getWallet()
      .then((walletRes) => {
        setWallet(walletRes.wallet);
        if (walletRes?.wallet) {
          updateWallet(walletRes.wallet);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Realtime Live Update Listener (Zero Reload Strategy)
  useEffect(() => {
    const handleLiveEvent = (e: any) => {
      const type = e.detail?.type;
      const payload = e.detail?.payload;
      if (type === 'wallet' && payload) {
        setWallet((prev: any) => (prev ? { ...prev, ...payload } : prev));
        updateWallet(payload);
      }
      if (type === 'wallet' || type === 'all' || type === 'refresh') {
        api.invalidateCache('/wallet');
        loadData();
      }
    };

    window.addEventListener('royal_live_update', handleLiveEvent);
    return () => {
      window.removeEventListener('royal_live_update', handleLiveEvent);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-[#FFD45A]" /> Wallet
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/deposits"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1459E8] hover:bg-[#2478FF] text-white text-xs font-bold transition-all shadow-md shadow-[#1459E8]/30"
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposit
          </Link>
          <Link
            to="/app/withdrawals"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD45A] to-amber-400 text-[#020B20] text-xs font-black transition-all shadow-md shadow-[#FFD45A]/20"
          >
            <ArrowUpRight className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      {/* Balance Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="royal-card p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 block font-medium">Available</span>
          <span className="text-lg font-black text-[#FFD45A] block mt-1">
            PKR {(wallet?.availableBalance || 0).toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-500">Ready to withdraw</span>
        </div>

        <div className="royal-card p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 block font-medium">Reserved</span>
          <span className="text-lg font-black text-white block mt-1">
            PKR {(wallet?.pendingBalance || 0).toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-500">In pending review</span>
        </div>

        <div className="royal-card p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 block font-medium">Total Earned</span>
          <span className="text-lg font-black text-emerald-400 block mt-1">
            PKR {(wallet?.totalEarned || 0).toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-500">Rewards + bonuses</span>
        </div>

        <div className="royal-card p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 block font-medium">Total Deposited</span>
          <span className="text-lg font-black text-[#22D3EE] block mt-1">
            PKR {(wallet?.totalDeposited || 0).toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-500">Credited deposits</span>
        </div>

        <div className="royal-card p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 block font-medium">Total Withdrawn</span>
          <span className="text-lg font-black text-blue-400 block mt-1">
            PKR {(wallet?.totalWithdrawn || 0).toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-500">Completed payouts</span>
        </div>

        <div className="royal-card p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 block font-medium">Unlock Fees</span>
          <span className="text-lg font-black text-amber-300 block mt-1">
            PKR {(wallet?.totalUnlockFees || 0).toLocaleString()}
          </span>
          <span className="text-[9px] text-slate-500">VIP task fees</span>
        </div>
      </div>
    </div>
  );
};
