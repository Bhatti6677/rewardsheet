import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Crown,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Wallet,
  Layers,
  FileCheck2,
  Lock,
  Disc,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TermsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (user) {
      navigate('/app/profile');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-[#040D1E] text-slate-100 py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-[#1459E8]/20 via-[#22D3EE]/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header / Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#FFD45A] hover:text-[#FFE388] transition-colors py-2 px-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/40 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{user ? 'Back to Portal' : 'Back to Registration'}</span>
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Last Updated: November 2026</span>
          </div>
        </div>

        {/* Hero Title Card */}
        <div className="royal-card p-6 sm:p-8 rounded-3xl border border-amber-500/25 bg-gradient-to-r from-[#071738] via-[#0D2452] to-[#071738] shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#214B91]/40 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFD45A]/25 to-amber-500/10 border border-[#FFD45A]/40 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Crown className="w-8 h-8 text-[#FFD45A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    Terms & Conditions
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
                    <ShieldCheck className="w-3 h-3" /> Official
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Earn Street Operational Guidelines, Member Responsibilities & Financial Disbursement Policies
                </p>
              </div>
            </div>

            {user ? (
              <Link
                to="/app/profile"
                className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 text-blue-200 text-xs font-bold transition-all"
              >
                My Profile
              </Link>
            ) : (
              <Link
                to="/register"
                className="self-start sm:self-center px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black transition-all shadow-md"
              >
                Register Now
              </Link>
            )}
          </div>

          <p className="text-xs text-slate-300 pt-4 leading-relaxed">
            Please read these Terms and Conditions carefully before registering or engaging in platform assignments on Earn Street. By checking the agreement box during registration or using the platform, you acknowledge that you have read, understood, and agreed to be bound by all platform policies, quality standards, and withdrawal terms outlined herein.
          </p>
        </div>

        {/* Highlight Callout: Crucial Withdrawal & Progression Rules */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#182138] to-blue-500/15 border-2 border-amber-400/60 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>CRITICAL WITHDRAWAL & COMPLIANCE SUMMARY</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-[#040F26] border border-amber-500/30">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Level 1 Clearance</span>
              <p className="text-xs text-slate-200 mt-1">
                <strong>100% total balance withdrawal</strong> is mandatory upon completing Level 1 before Level 2 unlocks.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#040F26] border border-amber-500/30">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Level 2 Payout</span>
              <p className="text-xs text-slate-200 mt-1">
                Upon completing Level 2, members are eligible for a <strong>20% payout</strong> of their withdrawal request.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#040F26] border border-amber-500/30">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Level 3 Onwards (100%)</span>
              <p className="text-xs text-slate-200 mt-1">
                From Level 3 through Level 10, members can request and receive <strong>100% full withdrawals</strong>.
              </p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-xs text-red-200 flex items-start gap-2.5 mt-2">
            <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Rule Violation & Penalty Lock:</strong> If any platform rule is violated or assignment instructions are not followed, your withdrawal will be <strong>locked immediately</strong> and will <strong>only be processed after successfully completing the next level</strong>.
            </span>
          </div>
        </div>

        {/* Detailed Sections List */}
        <div className="space-y-4">
          {/* Article 1 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">1</span>
              <span>Account Registration, Security & Single-Account Policy</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>1.1 Age Requirement:</strong> Members must be at least eighteen (18) years of age or the age of legal majority in their territory to register and participate.
              </p>
              <p>
                <strong>1.2 Strict Single-Account Rule:</strong> Each member is permitted to create and operate exactly one (1) account. The registration of duplicate, alternative, or auxiliary accounts using multiple SIMs or VoIP numbers is strictly prohibited. Detection of multiple accounts operated by the same individual will trigger immediate termination of all related accounts and forfeiture of unapproved balances.
              </p>
              <p>
                <strong>1.3 Verification of Details:</strong> The member’s registered name and mobile number must match their registered banking/mobile wallet identity (Easypaisa, JazzCash, or bank account).
              </p>
              <p>
                <strong>1.4 Credential Responsibility:</strong> You are responsible for safeguarding your password. The platform administration will never ask for your password, wallet PIN, or personal OTP codes.
              </p>
            </div>
          </div>

          {/* Article 2 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">2</span>
              <span>Anti-Fraud, IP Tracking & Device Integrity</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>2.1 VPN and Proxy Prohibition:</strong> Operating through VPNs, proxies, Tor networks, automated emulators, virtual environments, or multi-instance browsers is strictly prohibited and automatically detected by our system security.
              </p>
              <p>
                <strong>2.2 Automated Scripts & Bots:</strong> Any use of automated scripts, macros, auto-clickers, or scraping tools will result in instant blacklisting.
              </p>
              <p>
                <strong>2.3 Zero Tolerance for Falsified Evidence:</strong> Submitting fake, altered, reused, or stolen screenshots as task proof or deposit receipts is treated as fraud and will result in the immediate permanent freezing of your account.
              </p>
            </div>
          </div>

          {/* Article 3 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">3</span>
              <span>Task Execution, Quality Standards & Administrative Review</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>3.1 Strict Sequential Progression:</strong> Assignments must be completed in exact sequential order (Task 1, then Task 2, etc.). Tasks cannot be skipped or unlocked out of order.
              </p>
              <p>
                <strong>3.2 Genuine & Permanent Engagement:</strong> For video watch, like, comment, and subscription assignments:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Videos must be viewed for the complete required duration (e.g. 30s, 45s, 60s) before taking verification proof.</li>
                <li>Subscriptions, likes, and comments must remain active and permanent. Unsubscribing or deleting engagement after reward approval will trigger retroactive deductions and account freezing.</li>
              </ul>
              <p>
                <strong>3.3 Administrative Review:</strong> All submissions are checked manually by administrators. The administration reserves the right to reject proofs that do not meet quality criteria or request re-submission.
              </p>
            </div>
          </div>

          {/* Article 4 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">4</span>
              <span>VIP Level Progression & Approval Requirements</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>4.1 Level Progression:</strong> Members begin at Level 1 and advance through subsequent levels upon fulfilling required task criteria.
              </p>
              <p>
                <strong>4.2 Level 4 Assignments:</strong> Completing the required tasks in Level 4 unlocks progression towards upper tiers.
              </p>
              <p>
                <strong>4.3 VIP Levels 5 through 10 (Approval Required):</strong> To maintain platform quotas and quality integrity, VIP Levels 5, 6, 7, 8, 9, and 10 require formal <strong>administrative review and approval</strong> before unlocking. Tasks in these upper tiers remain locked until approved by the administration.
              </p>
              <p>
                <strong>4.4 Non-Transferability:</strong> VIP tiers, privileges, and progress belong solely to the registered account and cannot be sold, rented, or transferred to any third party.
              </p>
            </div>
          </div>

          {/* Article 5 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">5</span>
              <span>Deposit Policy & Wallet Management</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>5.1 Official Accounts Only:</strong> Deposits must be sent exclusively to the active accounts displayed on the platform’s deposit page at the time of transfer (Easypaisa, JazzCash, or Bank). Deposits sent to old or unlisted numbers cannot be credited.
              </p>
              <p>
                <strong>5.2 Single TxID Use:</strong> Each Transaction ID (TxID) can only be submitted once. Duplicate or fraudulent TxID entries will trigger an automatic security lock.
              </p>
              <p>
                <strong>5.3 Non-Refundable Task Fees:</strong> Unlock fees for prepaid VIP assignments are non-refundable once initiated, as they activate operational resources and reward allocations.
              </p>
            </div>
          </div>

          {/* Article 6 - Crucial Withdrawal Rules */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3 border border-amber-500/40 bg-gradient-to-br from-[#061433] via-[#0B1E4A] to-[#061433]">
            <h2 className="text-sm sm:text-base font-bold text-[#FFD45A] flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-amber-500/30 text-amber-300 border border-amber-500/50 flex items-center justify-center text-xs font-black">6</span>
              <span className="flex items-center gap-2">
                <span>Withdrawal Policy, Payout Tiers & Penalty Locks</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">Crucial</span>
              </span>
            </h2>
            <div className="text-xs text-slate-200 space-y-3 leading-relaxed pl-8">
              <p>
                <strong>6.1 Level 1 Mandatory Total Balance Withdrawal:</strong> Upon completing all assignments in Level 1, members <strong>must withdraw their complete wallet balance</strong>. Level 2 tasks remain locked until the Level 1 balance payout has been reviewed and disbursed.
              </p>
              <p>
                <strong>6.2 Level 2 Payout (20% Disbursed):</strong> Upon completing Level 2, members are eligible for a <strong>20% withdrawal payout</strong> of their requested withdrawal amount.
              </p>
              <p>
                <strong>6.3 Level 3 Onwards Payout (100% Disbursed):</strong> From Level 3 and all higher levels (Level 3 through Level 10), members can request and receive <strong>100% full withdrawals</strong> of their earnings.
              </p>
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200">
                <p className="font-bold text-red-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span>6.4 Rule Violation & Instruction Non-Compliance Lock:</span>
                </p>
                <p>
                  Strict adherence to all assignment instructions, timeframes, and platform rules is mandatory. <strong>If any platform rule is violated or assignment instructions are not followed, the member’s withdrawal will be locked immediately and will only be processed after successfully completing the next level.</strong>
                </p>
              </div>
              <p>
                <strong>6.5 Account Details Accuracy:</strong> Disbursements are made strictly to the recipient account number and title specified by the user. The platform bears no responsibility for funds disbursed to an incorrect account number entered by the member.
              </p>
              <p>
                <strong>6.6 Single Active Request:</strong> Members may only submit one withdrawal request at a time. Consecutive withdrawal requests cannot be queued while a prior request is pending.
              </p>
              <p>
                <strong>6.7 Processing Window:</strong> Withdrawals are processed during administrative review hours (typically 24 to 48 hours). Telecom network maintenance or banking delays are beyond platform jurisdiction.
              </p>
            </div>
          </div>

          {/* Article 7 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">7</span>
              <span>Lucky Spin Wheel & Milestone Rewards</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>7.1 Entitlement Grants:</strong> Spin entitlements are granted upon reaching specific task milestones or via administrative entitlement allocation.
              </p>
              <p>
                <strong>7.2 High-Tier / Physical Gifts:</strong> Claims for high-value prizes (e.g. mobile phones, luxury watches, vehicles, or major cash milestones) are subject to identity verification (CNIC / phone proof) prior to handover.
              </p>
              <p>
                <strong>7.3 Cash Alternative:</strong> At the platform’s discretion, physical prizes may be redeemed for an equivalent cash balance credited directly to the member's wallet.
              </p>
            </div>
          </div>

          {/* Article 8 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">8</span>
              <span>Support, Communication & Anti-Defamation</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>8.1 Official Communication Channels:</strong> Official customer assistance is provided exclusively through platform support tickets and verified official Telegram channels. The platform is not responsible for unofficial groups or third-party impersonators.
              </p>
              <p>
                <strong>8.2 Respectful Communication:</strong> Abusive language, harassment, threats, or deliberate public defamation directed at platform staff or administrators will result in immediate permanent account termination and forfeiture of wallet balances.
              </p>
            </div>
          </div>

          {/* Article 9 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">9</span>
              <span>Account Suspension, Freezing & Termination</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                The administration reserves the right to restrict, suspend, or terminate member accounts if any of the following occur:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Automated botting, script execution, or emulator detection.</li>
                <li>Submission of forged, stolen, or manipulated payment/task proofs.</li>
                <li>Breach of withdrawal rules or task execution standards.</li>
                <li>Prolonged account inactivity exceeding platform guidelines.</li>
              </ul>
              <p>
                Balances frozen due to confirmed fraud or policy violations are permanently forfeited.
              </p>
            </div>
          </div>

          {/* Article 10 */}
          <div className="royal-card p-6 sm:p-7 rounded-3xl space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-black">10</span>
              <span>Platform Rights, Maintenance & Amendments to Terms</span>
            </h2>
            <div className="text-xs text-slate-300 space-y-2.5 leading-relaxed pl-8">
              <p>
                <strong>10.1 System Maintenance:</strong> Earn Street reserves the right to perform scheduled or emergency maintenance. During maintenance, active task timers and submissions are temporarily paused.
              </p>
              <p>
                <strong>10.2 Modification Rights:</strong> The platform reserves the right to amend these Terms and Conditions or adjust assignment rewards as operational requirements evolve. Material updates will be announced via Platform Announcements. Continued participation on the platform signifies full acceptance of any updated terms.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="royal-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-[#06132D] via-[#091D45] to-[#06132D] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Have questions regarding our terms?</h3>
            <p className="text-xs text-slate-400 mt-0.5">Contact official administration support through your verified member desk.</p>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            {user ? 'Return to Member Dashboard' : 'I Understand & Return to Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
