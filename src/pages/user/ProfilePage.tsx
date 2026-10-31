import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Lock,
  Crown,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  UploadCloud,
  FileImage,
  RefreshCw,
  Clock,
  IdCard,
  Eye,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Identity Verification State
  const [identity, setIdentity] = useState<any>(user?.identityVerification || null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [frontFileName, setFrontFileName] = useState('');
  const [backFileName, setBackFileName] = useState('');
  const [submittingIdentity, setSubmittingIdentity] = useState(false);
  const [identitySuccess, setIdentitySuccess] = useState<string | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  // Fetch identity verification status
  const loadIdentity = () => {
    api.getUserIdentity()
      .then((res: any) => {
        if (res?.identityVerification) {
          setIdentity(res.identityVerification);
        } else {
          setIdentity(null);
        }
      })
      .catch((err) => console.error('Failed to load identity verification:', err))
      .finally(() => setIdentityLoading(false));
  };

  useEffect(() => {
    loadIdentity();
  }, []);

  // Realtime Live Update Listener (Zero Reload Strategy)
  useEffect(() => {
    const handleLiveEvent = (e: any) => {
      const type = e.detail?.type;
      if (type === 'identity_updated' || type === 'user_updated' || type === 'all' || type === 'refresh') {
        loadIdentity();
        refreshUser();
      }
    };
    window.addEventListener('royal_live_update', handleLiveEvent);
    return () => {
      window.removeEventListener('royal_live_update', handleLiveEvent);
    };
  }, []);

  // Client-side image compression to lightweight JPEG (~120KB-180KB)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressed);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFrontImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setFrontFileName(file.name);
      const compressed = await compressImage(file);
      setIdFront(compressed);
      setIdentityError(null);
    } catch (err) {
      setIdentityError('Failed to process front image. Please try another image.');
    }
  };

  const handleBackImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBackFileName(file.name);
      const compressed = await compressImage(file);
      setIdBack(compressed);
      setIdentityError(null);
    } catch (err) {
      setIdentityError('Failed to process back image. Please try another image.');
    }
  };

  const handleSubmitIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFront || !idBack) {
      setIdentityError('Both Front and Back photos of your ID card are required.');
      return;
    }

    setSubmittingIdentity(true);
    setIdentityError(null);
    setIdentitySuccess(null);

    try {
      const res = await api.submitUserIdentity({
        idFrontImage: idFront,
        idBackImage: idBack,
      });

      setIdentitySuccess(res.message);
      if (res.identityVerification) {
        setIdentity(res.identityVerification);
      }
      setIdFront(null);
      setIdBack(null);
      setFrontFileName('');
      setBackFileName('');
      loadIdentity();
      refreshUser();
    } catch (err: any) {
      setIdentityError(err.message || 'Identity submission failed');
    } finally {
      setSubmittingIdentity(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.updatePassword({ currentPassword, newPassword });
      setSuccess(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-[#FFD45A]" /> Member Profile & Security
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Review your account credentials, verify your government identity, and manage security settings.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-2xl text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Account Identity Card */}
      <div className="royal-card p-6 sm:p-8 rounded-3xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#22D3EE]" /> Verified Member Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-[#020B20] border border-[#214B91] rounded-2xl text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Full Name</span>
            <span className="font-bold text-white text-sm mt-0.5 block">{user?.name}</span>
          </div>

          <div className="p-3.5 bg-[#020B20] border border-[#214B91] rounded-2xl text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered Phone</span>
            <span className="font-bold text-[#22D3EE] font-mono text-sm mt-0.5 block">{user?.phone}</span>
          </div>

          <div className="p-3.5 bg-[#020B20] border border-[#214B91] rounded-2xl text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Identity Verification</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {identity?.status === 'APPROVED' ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified CNIC
                </span>
              ) : identity?.status === 'PENDING' ? (
                <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" /> Under Review
                </span>
              ) : identity?.status === 'REJECTED' ? (
                <span className="inline-flex items-center gap-1 text-red-400 font-bold text-xs">
                  <AlertCircle className="w-3.5 h-3.5" /> Rejected (Re-upload)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-xs">
                  <IdCard className="w-3.5 h-3.5" /> Unverified
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-[#020B20] border border-[#214B91] rounded-2xl text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Status</span>
            <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{user?.accountStatus}</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. IDENTITY VERIFICATION CARD (CNIC FRONT & BACK UPLOAD)       */}
      {/* ============================================================== */}
      <div className="royal-card p-6 sm:p-8 rounded-3xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#214B91]/40">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <IdCard className="w-5 h-5 text-[#FFD45A]" /> Verify Identity (CNIC / ID Card)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Government-issued ID card verification for account security and compliance.
            </p>
          </div>

          {identity?.status === 'APPROVED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
            </span>
          )}
          {identity?.status === 'PENDING' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 w-fit">
              <Clock className="w-3.5 h-3.5 animate-spin" /> UNDER REVIEW
            </span>
          )}
          {identity?.status === 'REJECTED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 border border-red-500/40 text-red-300 w-fit">
              <AlertCircle className="w-3.5 h-3.5" /> REJECTED
            </span>
          )}
        </div>

        {identitySuccess && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{identitySuccess}</span>
          </div>
        )}
        {identityError && (
          <div className="p-4 bg-red-500/15 border border-red-500/40 rounded-2xl text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{identityError}</span>
          </div>
        )}

        {/* STATE A: VERIFIED */}
        {identity?.status === 'APPROVED' ? (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Official Identity Verified</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your government identity documents have been authenticated and approved by administration.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-emerald-500/20 text-xs">
                <div className="p-3 bg-[#020B20]/80 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verified Legal Name</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{identity.fullName || user?.name}</span>
                </div>
                <div className="p-3 bg-[#020B20]/80 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">ID Card / CNIC Number</span>
                  <span className="font-bold text-[#FFD45A] font-mono text-sm mt-0.5 block">{identity.cnicNumber || 'Verified'}</span>
                </div>
                <div className="p-3 bg-[#020B20]/80 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Gender</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">{identity.gender || 'Not Specified'}</span>
                </div>
                <div className="p-3 bg-[#020B20]/80 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Date of Birth</span>
                  <span className="font-bold text-white text-sm mt-0.5 block">
                    {identity.dateOfBirth ? new Date(identity.dateOfBirth).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Images Review */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPreviewImage(identity.idFrontImage)}
                className="relative group rounded-xl overflow-hidden border border-[#214B91] bg-[#020B20] aspect-video cursor-pointer"
              >
                <img src={identity.idFrontImage} alt="ID Front" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                  <Eye className="w-4 h-4" /> View Front
                </div>
                <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">
                  Front Image
                </span>
              </div>
              <div
                onClick={() => setPreviewImage(identity.idBackImage)}
                className="relative group rounded-xl overflow-hidden border border-[#214B91] bg-[#020B20] aspect-video cursor-pointer"
              >
                <img src={identity.idBackImage} alt="ID Back" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
                  <Eye className="w-4 h-4" /> View Back
                </div>
                <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">
                  Back Image
                </span>
              </div>
            </div>
          </div>
        ) : identity?.status === 'PENDING' ? (
          /* STATE B: PENDING REVIEW */
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[#061633] border border-amber-500/30 text-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Verification in Progress</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your ID card front and back images have been uploaded and are awaiting review by an administrator.
                  </p>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 pt-2 border-t border-[#173C73]">
                Submitted on: <strong>{new Date(identity.submittedAt || identity.createdAt).toLocaleString()}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setPreviewImage(identity.idFrontImage)}
                className="relative group rounded-xl overflow-hidden border border-[#214B91] bg-[#020B20] aspect-video cursor-pointer"
              >
                <img src={identity.idFrontImage} alt="ID Front" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">
                  Front Image (Pending)
                </span>
              </div>
              <div
                onClick={() => setPreviewImage(identity.idBackImage)}
                className="relative group rounded-xl overflow-hidden border border-[#214B91] bg-[#020B20] aspect-video cursor-pointer"
              >
                <img src={identity.idBackImage} alt="ID Back" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-slate-200">
                  Back Image (Pending)
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* STATE C & D: UNVERIFIED OR REJECTED (SHOW UPLOAD FORM) */
          <div className="space-y-4">
            {identity?.status === 'REJECTED' && (
              <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-xs space-y-1.5 text-red-200">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>Previous Submission Was Rejected</span>
                </div>
                <p className="text-[11px] text-red-300/90 pl-6">
                  Reason: <strong>{identity.rejectionReason || 'Photos were unclear or invalid'}</strong>
                </p>
                <p className="text-[11px] text-slate-300 pl-6 pt-1">
                  Please upload clear, legible photos of your ID card below to resubmit.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitIdentity} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID Front Image Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    1. ID Card Front Image *
                  </label>
                  <input
                    type="file"
                    ref={frontInputRef}
                    accept="image/*"
                    onChange={handleFrontImageSelect}
                    className="hidden"
                  />
                  {idFront ? (
                    <div className="relative rounded-2xl border border-emerald-500/40 bg-[#020B20] p-2 aspect-[16/10] flex flex-col items-center justify-center overflow-hidden group">
                      <img src={idFront} alt="Front Preview" className="w-full h-full object-contain rounded-xl" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(idFront)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => frontInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-[#1459E8] hover:bg-[#2478FF] text-white text-xs font-bold"
                        >
                          Change
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-emerald-500/80 text-black font-black text-[9px] px-2 py-0.5 rounded-md">
                        Front Loaded
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => frontInputRef.current?.click()}
                      className="border-2 border-dashed border-[#214B91] hover:border-[#2478FF] bg-[#020B20]/60 hover:bg-[#020B20] rounded-2xl p-6 text-center cursor-pointer transition-all aspect-[16/10] flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#1459E8]/20 text-[#2478FF] flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white block">Upload ID Front</span>
                      <span className="text-[10px] text-slate-400 block">PNG, JPG or WEBP (Max 5MB)</span>
                    </div>
                  )}
                </div>

                {/* ID Back Image Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    2. ID Card Back Image *
                  </label>
                  <input
                    type="file"
                    ref={backInputRef}
                    accept="image/*"
                    onChange={handleBackImageSelect}
                    className="hidden"
                  />
                  {idBack ? (
                    <div className="relative rounded-2xl border border-emerald-500/40 bg-[#020B20] p-2 aspect-[16/10] flex flex-col items-center justify-center overflow-hidden group">
                      <img src={idBack} alt="Back Preview" className="w-full h-full object-contain rounded-xl" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(idBack)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-white"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => backInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-[#1459E8] hover:bg-[#2478FF] text-white text-xs font-bold"
                        >
                          Change
                        </button>
                      </div>
                      <span className="absolute bottom-2 left-2 bg-emerald-500/80 text-black font-black text-[9px] px-2 py-0.5 rounded-md">
                        Back Loaded
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => backInputRef.current?.click()}
                      className="border-2 border-dashed border-[#214B91] hover:border-[#2478FF] bg-[#020B20]/60 hover:bg-[#020B20] rounded-2xl p-6 text-center cursor-pointer transition-all aspect-[16/10] flex flex-col items-center justify-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#1459E8]/20 text-[#2478FF] flex items-center justify-center">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-white block">Upload ID Back</span>
                      <span className="text-[10px] text-slate-400 block">PNG, JPG or WEBP (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingIdentity || !idFront || !idBack}
                className="w-full py-3 bg-gradient-to-r from-[#FFD45A] to-amber-400 hover:from-amber-400 hover:to-[#FFD45A] text-[#020B20] font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submittingIdentity ? (
                  <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" /> Submit ID Card for Verification
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. CHANGE PASSWORD FORM                                        */}
      {/* ============================================================== */}
      <div className="royal-card p-6 sm:p-8 rounded-3xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#FFD45A]" /> Change Account Password
        </h2>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter existing password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#020B20] border border-[#214B91] focus:border-[#2478FF] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#020B20] border border-[#214B91] focus:border-[#2478FF] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full bg-[#020B20] border border-[#214B91] focus:border-[#2478FF] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#1459E8] to-[#2478FF] hover:from-[#2478FF] hover:to-[#1459E8] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>

      {/* Image Full-screen Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl w-full bg-[#020B20] border border-[#214B91] rounded-2xl p-2 overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="ID Document" className="w-full max-h-[80vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
