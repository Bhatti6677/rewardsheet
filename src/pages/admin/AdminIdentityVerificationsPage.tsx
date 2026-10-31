import React, { useState, useEffect } from 'react';
import {
  IdCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Eye,
  X,
  RefreshCw,
  UserCheck,
  Calendar,
  User,
  Hash,
} from 'lucide-react';
import { api } from '../../api/client';

export const AdminIdentityVerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review Modal State
  const [reviewingItem, setReviewingItem] = useState<any | null>(null);
  const [activeImageTab, setActiveImageTab] = useState<'FRONT' | 'BACK'>('FRONT');
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [cnicNumber, setCnicNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Full-screen Image Viewer
  const [fullViewImage, setFullViewImage] = useState<string | null>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = (p = 1, isManual = false) => {
    if (isManual) {
      setReloading(true);
    } else if (verifications.length === 0) {
      setLoading(true);
    }

    api.getAdminIdentityVerifications({
      status: statusFilter || undefined,
      search: searchTerm.trim() || undefined,
      page: p,
      limit: 15,
    })
      .then((res: any) => {
        setVerifications(res.verifications || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setPage(p);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
        setReloading(false);
      });
  };

  useEffect(() => {
    loadData(1);
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  const openReviewModal = (item: any) => {
    setReviewingItem(item);
    setActiveImageTab('FRONT');
    setAction('APPROVE');
    setCnicNumber(item.cnicNumber || '');
    setFullName(item.fullName || item.user?.name || '');
    setGender(item.gender || 'Male');
    if (item.dateOfBirth) {
      const d = new Date(item.dateOfBirth);
      setDateOfBirth(d.toISOString().split('T')[0]);
    } else {
      setDateOfBirth('2000-01-01');
    }
    setReviewNotes(item.reviewNotes || '');
    setRejectionReason(item.rejectionReason || '');
    setMessage(null);
  };

  const handleExecuteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingItem) return;

    if (action === 'APPROVE') {
      if (!cnicNumber.trim()) {
        setMessage({ type: 'error', text: 'ID Card / CNIC Number is required for approval' });
        return;
      }
      if (!fullName.trim()) {
        setMessage({ type: 'error', text: 'Full Legal Name on ID Card is required for approval' });
        return;
      }
      if (!dateOfBirth) {
        setMessage({ type: 'error', text: 'Date of Birth is required for approval' });
        return;
      }
    } else {
      if (!rejectionReason.trim()) {
        setMessage({ type: 'error', text: 'Please provide a rejection reason so the user knows what to fix' });
        return;
      }
    }

    setSubmittingReview(true);
    setMessage(null);

    try {
      const res = await api.reviewIdentityVerification(reviewingItem.id, {
        action,
        cnicNumber: action === 'APPROVE' ? cnicNumber.trim() : undefined,
        fullName: action === 'APPROVE' ? fullName.trim() : undefined,
        gender: action === 'APPROVE' ? gender : undefined,
        dateOfBirth: action === 'APPROVE' ? dateOfBirth : undefined,
        reviewNotes: reviewNotes.trim() || undefined,
        rejectionReason: action === 'REJECT' ? rejectionReason.trim() : undefined,
      });

      // Update state in table
      if (res.verification) {
        setVerifications((prev) =>
          prev.map((v) => (v.id === reviewingItem.id ? { ...v, ...res.verification } : v))
        );
      } else {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        setVerifications((prev) =>
          prev.map((v) => (v.id === reviewingItem.id ? { ...v, status: newStatus } : v))
        );
      }

      setMessage({ type: 'success', text: res.message });
      setReviewingItem(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Review submission failed' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] flex items-center gap-2.5">
          <IdCard className="w-6 h-6 text-[#2563EB]" /> Identity Verification Desk (KYC)
        </h1>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Review member ID card front & back photos, record CNIC numbers, name, gender and date of birth to complete identity verification.
        </p>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="admin-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#D9E4F2] rounded-lg px-3 py-1.5 text-xs text-[#111827] focus:outline-none h-9 font-semibold"
          >
            <option value="PENDING">Pending Review (Awaiting Action)</option>
            <option value="APPROVED">Verified Members (Approved)</option>
            <option value="REJECTED">Rejected Submissions</option>
            <option value="">All Verification Records</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search member, phone, CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-[#D9E4F2] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111827] focus:outline-none h-9 w-48 sm:w-64"
            />
            <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-bold hover:bg-[#1D4ED8] transition-all h-9"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => loadData(page, true)}
            disabled={reloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E4F2] bg-white hover:bg-[#F8FAFD] text-[#2563EB] font-bold text-xs transition-all h-9 disabled:opacity-60 shadow-xs"
            title="Reload from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
            <span>{reloading ? '...' : 'Reload'}</span>
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        {loading && verifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6B7280]">Loading identity verification records...</div>
        ) : verifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs admin-table">
              <thead>
                <tr>
                  <th>Submitted At</th>
                  <th>Member</th>
                  <th>ID Card Photos</th>
                  <th>CNIC Number</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {verifications.map((item) => (
                  <tr key={item.id}>
                    <td className="text-[#6B7280] whitespace-nowrap">
                      {new Date(item.submittedAt || item.createdAt).toLocaleDateString()}
                      <span className="block text-[10px] text-[#9CA3AF]">
                        {new Date(item.submittedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="font-semibold text-[#111827]">
                      {item.user?.name}
                      <span className="block text-[10px] text-[#6B7280] font-mono">{item.user?.phone}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setFullViewImage(item.idFrontImage)}
                          className="w-10 h-7 rounded border border-[#D9E4F2] overflow-hidden bg-slate-100 hover:border-[#2563EB] transition-colors relative group"
                          title="View ID Front"
                        >
                          <img src={item.idFrontImage} alt="Front" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                            <Eye className="w-3 h-3" />
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFullViewImage(item.idBackImage)}
                          className="w-10 h-7 rounded border border-[#D9E4F2] overflow-hidden bg-slate-100 hover:border-[#2563EB] transition-colors relative group"
                          title="View ID Back"
                        >
                          <img src={item.idBackImage} alt="Back" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                            <Eye className="w-3 h-3" />
                          </div>
                        </button>
                      </div>
                    </td>
                    <td className="font-mono text-xs">
                      {item.cnicNumber ? (
                        <span className="font-bold text-[#111827]">{item.cnicNumber}</span>
                      ) : (
                        <span className="text-[#9CA3AF] italic text-[11px]">Pending Entry</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`font-semibold text-[10px] px-2 py-0.5 rounded-full ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                            : item.status === 'PENDING'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-[11px] text-[#4B5563]">
                      {item.reviewerName ? (
                        <>
                          <span className="font-semibold block text-[#111827]">{item.reviewerName}</span>
                          <span className="text-[10px] text-[#6B7280]">
                            {item.reviewedAt ? new Date(item.reviewedAt).toLocaleDateString() : ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#9CA3AF] italic">—</span>
                      )}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => openReviewModal(item)}
                        className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                          item.status === 'PENDING'
                            ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm'
                            : 'bg-slate-100 text-[#374151] hover:bg-slate-200'
                        }`}
                      >
                        {item.status === 'PENDING' ? 'Review & Complete' : 'View / Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-[#6B7280]">
            No identity verification requests found for this filter.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#D9E4F2] flex items-center justify-between text-xs text-[#4B5563]">
            <button
              onClick={() => loadData(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded bg-[#F8FAFD] border border-[#D9E4F2] disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => loadData(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded bg-[#F8FAFD] border border-[#D9E4F2] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* REVIEW & SUBMIT MODAL                                     */}
      {/* ========================================================= */}
      {reviewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="admin-card p-6 w-full max-w-2xl bg-white space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9E4F2]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold">
                  <IdCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">
                    Review Identity: {reviewingItem.user?.name}
                  </h2>
                  <p className="text-[11px] text-[#6B7280]">
                    Phone: {reviewingItem.user?.phone} • Submitted: {new Date(reviewingItem.submittedAt || reviewingItem.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setReviewingItem(null)} className="p-1 text-[#6B7280] hover:text-[#111827]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Preview Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setActiveImageTab('FRONT')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      activeImageTab === 'FRONT'
                        ? 'bg-white text-[#2563EB] shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    ID Card Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageTab('BACK')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      activeImageTab === 'BACK'
                        ? 'bg-white text-[#2563EB] shadow-xs'
                        : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    ID Card Back
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFullViewImage(
                      activeImageTab === 'FRONT' ? reviewingItem.idFrontImage : reviewingItem.idBackImage
                    )
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> Fullscreen View
                </button>
              </div>

              {/* Display Box */}
              <div className="relative border border-[#D9E4F2] rounded-xl bg-slate-950 overflow-hidden aspect-[16/9] flex items-center justify-center max-h-72">
                <img
                  src={activeImageTab === 'FRONT' ? reviewingItem.idFrontImage : reviewingItem.idBackImage}
                  alt={activeImageTab}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() =>
                    setFullViewImage(
                      activeImageTab === 'FRONT' ? reviewingItem.idFrontImage : reviewingItem.idBackImage
                    )
                  }
                />
              </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleExecuteReview} className="space-y-4 pt-2 border-t border-[#D9E4F2] text-xs">
              <div>
                <label className="block font-semibold text-[#374151] mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAction('APPROVE')}
                    className={`py-2 rounded-lg font-bold border text-xs transition-all ${
                      action === 'APPROVE'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-[#D9E4F2] text-[#4B5563]'
                    }`}
                  >
                    ✓ Approve & Complete Identity
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction('REJECT')}
                    className={`py-2 rounded-lg font-bold border text-xs transition-all ${
                      action === 'REJECT'
                        ? 'bg-red-50 border-red-300 text-red-800 ring-2 ring-red-500/20'
                        : 'border-[#D9E4F2] text-[#4B5563]'
                    }`}
                  >
                    ✗ Reject Submission
                  </button>
                </div>
              </div>

              {action === 'APPROVE' ? (
                <div className="space-y-3 bg-[#F8FAFD] p-3.5 rounded-xl border border-[#D9E4F2]">
                  <p className="font-bold text-[#111827] text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#2563EB]" /> Verified ID Details (from Card Photo)
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        ID Card Number / CNIC *
                      </label>
                      <input
                        type="text"
                        required
                        value={cnicNumber}
                        onChange={(e) => setCnicNumber(e.target.value)}
                        placeholder="e.g. 42101-1234567-1"
                        className="w-full border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg p-2 text-xs text-[#111827] font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Full Legal Name (as on ID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Shahid Khan"
                        className="w-full border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg p-2 text-xs text-[#111827] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg p-2 text-xs text-[#111827] focus:outline-none bg-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#374151] mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg p-2 text-xs text-[#111827] focus:outline-none bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#374151] mb-1">
                      Internal Admin Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Notes for compliance records"
                      className="w-full border border-[#D9E4F2] focus:border-[#2563EB] rounded-lg p-2 text-xs text-[#111827] focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-red-50/50 p-3.5 rounded-xl border border-red-200">
                  <label className="block font-semibold text-red-900 mb-1">
                    Rejection Reason (Shown to User) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. ID card photos are blurry and CNIC number is not readable. Please upload clear photos in good lighting."
                    className="w-full border border-red-200 focus:border-red-500 rounded-lg p-2 text-xs text-[#111827] focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingItem(null)}
                  className="px-4 py-2 border border-[#D9E4F2] rounded-lg text-[#4B5563] font-semibold hover:bg-[#F8FAFD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`px-5 py-2 text-white font-bold rounded-lg transition-all shadow-sm ${
                    action === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submittingReview
                    ? 'Submitting...'
                    : action === 'APPROVE'
                    ? 'Confirm & Complete Verification'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen Image Modal */}
      {fullViewImage && (
        <div
          onClick={() => setFullViewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm cursor-zoom-out"
        >
          <div className="relative max-w-4xl w-full bg-slate-950 border border-slate-800 rounded-2xl p-2 overflow-hidden shadow-2xl">
            <button
              onClick={() => setFullViewImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={fullViewImage} alt="ID Document Fullscreen" className="w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
