import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle, KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '../../api/client';
import { useAdminAuth } from '../../context/AdminAuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const [step, setStep] = useState<'credentials' | 'security_code'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 'security_code') {
      const cleanOtp = otp.trim();
      if (!cleanOtp || cleanOtp.length !== 6) {
        setError('Please enter the 6-digit security code');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await api.adminLogin({
        username: username.trim(),
        password,
        otp: step === 'security_code' ? otp.trim() : undefined,
      });

      if (res?.requiresOtp) {
        setStep('security_code');
        setError(null);
        return;
      }

      adminLogin(res.token, res.admin);
      navigate('/adminpanal/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtp('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Ambient Lighting Layers */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/15 via-amber-600/5 to-transparent blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-amber-400/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Luxury Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Sleek Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D97706] via-[#F59E0B] to-[#FDE68A] p-[1.5px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#0A0F1D] rounded-[10px] flex items-center justify-center">
                {step === 'security_code' ? (
                  <KeyRound className="w-5 h-5 text-[#F59E0B]" />
                ) : (
                  <Shield className="w-5 h-5 text-[#F59E0B]" />
                )}
              </div>
            </div>
            <span className="text-xl font-black tracking-wider text-white">EARN STREET</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90">
            {step === 'security_code' ? 'Security Verification' : 'Administration Portal'}
          </p>
        </div>

        {/* Minimalist Card */}
        <div className="relative bg-[#0D1324]/90 backdrop-blur-2xl border border-amber-500/25 p-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/50 before:to-transparent">
          {error && (
            <div className="mb-4 p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'credentials' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username or Email
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Username or Email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#060A14] border border-slate-800/90 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner h-11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#060A14] border border-slate-800/90 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/20 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 transition-colors focus:outline-none cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] hover:from-[#B45309] hover:via-[#D97706] hover:to-[#F59E0B] text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 h-11 transition-all disabled:opacity-50 tracking-wide text-sm cursor-pointer"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Security Code
                  </label>
                  <div className="relative group">
                    <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      autoFocus
                      required
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#060A14] border border-slate-800/90 focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/20 rounded-xl pl-10 pr-4 py-2.5 text-base text-amber-300 font-mono tracking-[0.4em] text-center placeholder:tracking-normal placeholder-slate-600 focus:outline-none transition-all shadow-inner h-11 font-bold"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed text-center">
                    Enter the 6-digit dynamic code from Master Admin panel (or test code <span className="text-amber-400 font-mono font-bold tracking-wider">000000</span>).
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-[#D97706] via-[#F59E0B] to-[#FBBF24] hover:from-[#B45309] hover:via-[#D97706] hover:to-[#F59E0B] text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 h-11 transition-all disabled:opacity-50 tracking-wide text-sm cursor-pointer"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
