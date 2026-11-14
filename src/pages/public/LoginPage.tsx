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
    <div className="min-h-screen bg-[#08080B] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-red-600/30 selection:text-red-200">
      {/* Ambient Lighting Layers */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-gradient-to-b from-red-600/15 via-rose-700/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-red-800/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-700 via-red-500 to-rose-400 p-[1.5px] shadow-lg shadow-red-600/25 group-hover:shadow-red-600/40 group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-[#0C0C10] rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-wider text-white">
              EARN STREET
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-tight mt-5">Member Sign In</h1>
        </div>

        {/* Form Card */}
        <div className="relative bg-[#110E12]/90 backdrop-blur-xl border border-red-900/40 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-red-500/60 before:to-transparent">
          {error && (
            <div className="mb-5 p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>{error}</span>
                {error.includes('Administrator') && (
                  <Link
                    to="/adminpanal"
                    className="block mt-1.5 text-red-400 font-bold underline hover:text-red-300"
                  >
                    Open Administrator Control Portal →
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="w-4 h-4 text-zinc-500 group-focus-within:text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#07070A] border border-zinc-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#07070A] border border-zinc-800 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-red-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-[0.99] flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
