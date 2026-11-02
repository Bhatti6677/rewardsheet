import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Lock, Phone, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(formData);
      login(res.token, res.user, res.user.wallet);
      navigate('/app');
    } catch (err: any) {
      if (err.isAdmin || err.message?.includes('Administrator') || err.message?.includes('adminpanal')) {
        setError('Administrator credentials detected. Please sign in via the Administrator Portal.');
      } else {
        setError(err.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient Lighting Layers */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#D97706] via-[#F59E0B] to-[#FDE68A] p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/30 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-[#0A0F1D] rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-wider text-white">
              EARN STREET
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight mt-5">Sign In</h1>
        </div>

        {/* Form Card */}
        <div className="relative bg-[#0D1324]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/70 overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent">
          {error && (
            <div className="mb-5 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>{error}</span>
                {error.includes('Administrator') && (
                  <Link
                    to="/adminpanal"
                    className="block mt-1.5 text-amber-400 font-bold underline hover:text-amber-300"
                  >
                    Open Administrator Control Portal →
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="e.g. 03001234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#060A14] border border-slate-800 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#060A14] border border-slate-800 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99] flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
