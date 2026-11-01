import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title & Action Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-[#FFD45A]" /> Wallet
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your wallet balance, deposits, and withdrawal payouts.
          </p>
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

      {/* Available Balance Card */}
      <div className="royal-card p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-gradient-to-b from-[#0B2248]/90 via-[#04132F] to-[#020B20] border border-[#214B91]/60 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs sm:text-sm font-semibold text-slate-400 block uppercase tracking-wider">
              Available Balance
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#FFD45A] tracking-tight">
                PKR {(wallet?.availableBalance || 0).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Ready for withdrawal or platform activities.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <Link
              to="/app/deposits"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1459E8] hover:bg-[#2478FF] text-white text-sm font-bold transition-all shadow-lg shadow-[#1459E8]/30 active:scale-[0.98]"
            >
              <ArrowDownLeft className="w-4 h-4" /> Deposit
            </Link>
            <Link
              to="/app/withdrawals"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFD45A] to-amber-400 hover:from-amber-400 hover:to-[#FFD45A] text-[#020B20] text-sm font-black transition-all shadow-lg shadow-[#FFD45A]/25 active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
