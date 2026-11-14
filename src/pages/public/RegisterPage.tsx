import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Phone, User, Ticket, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setFormData((prev) => ({ ...prev, referralCode: refParam.trim() }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.referralCode.trim()) {
      setError('Referral code is required. Registration requires an official 6-letter code provided by administration.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms and Conditions to register.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        ...formData,
        referralCode: formData.referralCode.trim(),
      });
      login(res.token, res.user);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#08080B] text-zinc-100 flex flex-col justify-center items-center px-4 py-2 sm:py-4 relative overflow-hidden selection:bg-red-600/30 selection:text-red-200">
      {/* Ambient Crimson Lighting Layers */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-red-600/15 via-rose-700/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-red-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Subtle Carbon Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#dc2626_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />

      {/* Card Container */}
      <div className="w-full max-w-md relative z-10 my-auto">
        <div className="relative bg-[#110E12]/90 backdrop-blur-2xl border border-red-500/30 p-4 sm:p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-red-500/60 before:to-transparent">
          {error && (
            <div className="mb-3 p-2.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="w-4 h-4 text-zinc-500 group-focus-within:text-red-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#07070A] border border-zinc-800/90 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">
                Mobile Number
              </label>
              <div className="relative group">
                <Phone className="w-4 h-4 text-zinc-500 group-focus-within:text-red-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Mobile Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#07070A] border border-zinc-800/90 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-red-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#07070A] border border-zinc-800/90 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-red-400 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-zinc-500 group-focus-within:text-red-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-[#07070A] border border-zinc-800/90 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-red-400 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">
                Official Referral Code *
              </label>
              <div className="relative group">
                <Ticket className="w-4 h-4 text-red-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="referralCode"
                  required
                  maxLength={6}
                  placeholder="Referral Code"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full bg-[#07070A] border border-zinc-800/90 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-red-400 font-mono font-bold tracking-wider placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (error && error.includes('Terms and Conditions')) setError(null);
                }}
                required
                className="w-3.5 h-3.5 rounded border-zinc-700 text-red-600 focus:ring-red-500/20 bg-[#07070A] cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-[11px] sm:text-xs text-zinc-300 select-none cursor-pointer">
                I have read and agree to the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 font-bold underline underline-offset-2 transition-colors inline-flex items-center gap-1"
                >
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-red-600 text-white font-black py-2.5 px-4 rounded-xl shadow-lg shadow-red-600/25 hover:shadow-red-600/40 active:scale-[0.99] flex items-center justify-center gap-2 transition-all disabled:opacity-50 tracking-wide text-xs sm:text-sm cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-center text-[11px] sm:text-xs text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-bold transition-colors">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
