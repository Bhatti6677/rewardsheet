import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Disc,
  Layers,
  Flame,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';

export const LandingPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    api.getPublicSettings().then(setSettings).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#08080B] text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white relative overflow-hidden">
      {/* Subtle Carbon Grid & Crimson Ambient Glows */}
      <div className="fixed inset-0 bg-[radial-gradient(#dc2626_0.6px,transparent_0.6px)] [background-size:28px_28px] opacity-[0.04] pointer-events-none" />
      <div className="fixed -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[340px] bg-red-600/15 blur-[140px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#050507]/90 backdrop-blur-xl border-b border-red-950/60 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="border-l-2 border-red-600 pl-3">
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-zinc-100 to-red-500 bg-clip-text text-transparent block leading-none">
                EARN STREET
              </span>
              <span className="block text-[10px] text-red-400 font-bold tracking-[0.2em] uppercase mt-1">
                Executive Rewards Network
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 rounded-xl border border-zinc-800 hover:border-red-500/40 bg-zinc-900/60 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-red-600 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 border border-red-400/30 transition-all hover:scale-[1.03]"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-red-950/40 border border-red-500/30 px-4 py-1.5 rounded-full text-xs text-red-300 font-semibold shadow-inner">
                <Flame className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Next-Gen Sequential PKR Rewards & Fortune Wheel</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-white">
                Command Your Earnings On{' '}
                <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                  Earn Street
                </span>
              </h1>

              <p className="text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Pakistan’s premier 10-level sequential task ecosystem. Complete verified assignments, unlock high-commission VIP tiers, spin the crimson wheel, and withdraw directly to Easypaisa & JazzCash.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:brightness-110 text-white font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-red-600/25 border border-red-400/30 transition-all"
                >
                  <span>Start Earning Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#111116] hover:bg-[#18181F] border border-zinc-800 hover:border-red-500/40 text-zinc-100 font-bold text-sm sm:text-base px-8 py-4 rounded-2xl transition-all"
                >
                  <span>Member Login</span>
                </Link>
              </div>
            </div>

            {/* Right Hero Stats Showcase Panel */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#161014] to-[#0B0B0F] border border-red-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] space-y-5 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block">
                      Live Platform Architecture
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">Performance Metrics</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#09090D] border border-zinc-800/90 hover:border-red-500/40 transition-colors">
                    <span className="text-2xl sm:text-3xl font-black text-red-500 block">10</span>
                    <span className="text-xs text-zinc-400 font-medium mt-0.5 block">Progressive Tiers</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#09090D] border border-zinc-800/90 hover:border-red-500/40 transition-colors">
                    <span className="text-2xl sm:text-3xl font-black text-white block">100</span>
                    <span className="text-xs text-zinc-400 font-medium mt-0.5 block">Sequential Tasks</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#09090D] border border-zinc-800/90 hover:border-red-500/40 transition-colors">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 block">PKR 50k+</span>
                    <span className="text-xs text-zinc-400 font-medium mt-0.5 block">Tier 10 Rewards</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#09090D] border border-zinc-800/90 hover:border-red-500/40 transition-colors">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">100%</span>
                    <span className="text-xs text-zinc-400 font-medium mt-0.5 block">Verified Payouts</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Level System Showcase */}
      <section className="py-14 bg-[#050507] border-y border-red-950/50 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest px-3 py-1 rounded-full bg-red-950/40 border border-red-500/20">
              <Layers className="w-3.5 h-3.5" /> 10 Levels & 100 Standard Tasks
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Strict Sequential Tier Progression
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto">
              Every level contains 10 structured assignments. Complete Task 1 to unlock Task 2, and clear the level to ascend to higher reward tiers.
            </p>
          </div>
        </div>
      </section>

      {/* Crimson Spin Feature */}
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-[#1A0B0E] via-[#0F0C10] to-[#08080B] border border-red-500/35 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-red-600/15 blur-3xl rounded-full pointer-events-none" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                <Disc className="w-4 h-4 text-red-500 animate-spin" /> Daily Fortune Wheel
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 leading-tight">
                Spin & Win Up To <br />
                <span className="text-red-500">PKR 5,000 & Gadgets</span>
              </h2>
              <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
                Eligible members receive spin entitlements upon completing levels. Spin the wheel to claim instant wallet cash, luxury watches, and smartphones!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app/spin"
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-red-600/25 transition-all"
                >
                  Explore Spin Wheel
                </Link>
                <Link
                  to="/register"
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all"
                >
                  Create Account
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-60 h-60 sm:w-68 sm:h-68 rounded-full border-4 border-red-500 shadow-[0_0_50px_rgba(220,38,38,0.3)] flex items-center justify-center bg-gradient-to-tr from-[#2A080E] via-[#12090D] to-[#050507] p-4 text-center relative">
                <div className="w-full h-full rounded-full border border-amber-500/30 flex items-center justify-center">
                  <div>
                    <Crown className="w-11 h-11 text-amber-400 mx-auto mb-2 animate-bounce" />
                    <span className="text-lg font-black text-white tracking-wider block">FORTUNE WHEEL</span>
                    <span className="text-xs text-red-400 font-bold">100% Instant Wallet Credit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="py-12 bg-[#050507] border-t border-red-950/50 px-4 sm:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-5">
            Supported Deposit & Withdrawal Channels
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2.5 bg-[#0E0E13] px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-red-500/40 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold text-sm text-white">Easypaisa</span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#0E0E13] px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-red-500/40 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="font-bold text-sm text-white">JazzCash</span>
            </div>
            <div className="flex items-center gap-2.5 bg-[#0E0E13] px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-red-500/40 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="font-bold text-sm text-white">All Pakistan Banks</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-[#050507] border-t border-zinc-900 px-4 sm:px-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span className="font-bold text-zinc-200">Earn Street Platform</span>
            <span>© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-red-400 transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-red-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
