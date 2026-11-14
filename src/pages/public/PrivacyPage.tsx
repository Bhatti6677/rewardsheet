import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#08080B] text-zinc-100 py-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-red-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="royal-card p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <Shield className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-black text-white">Privacy Policy</h1>
              <p className="text-xs text-red-400">Protection of Member Data & Ledger Records</p>
            </div>
          </div>

          <div className="text-xs text-zinc-300 space-y-4 leading-relaxed">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Data Collection & Protection</h2>
            <p>
              Earn Street encrypts all user credentials using modern hashing algorithms. Mobile numbers are used solely for identity verification, withdrawal routing, and transactional security.
            </p>

            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Financial Transaction Transparency</h2>
            <p>
              Transaction records are stored on immutable database ledgers. We do not sell or distribute personal information to external commercial brokers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
