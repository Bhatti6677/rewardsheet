import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-2 px-3 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>{user ? 'Back to Dashboard' : 'Back to Registration'}</span>
          </button>

          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Earn Street • Legal Documentation
          </span>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto my-6 sm:my-10 bg-white border border-slate-200 sm:rounded-xl shadow-xs px-6 py-8 sm:px-12 sm:py-14">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-8 mb-8">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">
            Platform Operational Guidelines
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms and Conditions of Use
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated & Effective: November 2026 &nbsp;|&nbsp; Document Version: 2.1
          </p>
        </div>

        {/* Preamble */}
        <div className="text-sm text-slate-700 leading-relaxed mb-8">
          <p>
            Please read these Terms and Conditions (&ldquo;Terms&rdquo;) carefully before creating an account or participating in any assignments on Earn Street (&ldquo;the Platform&rdquo;). By registering an account, submitting task deliverables, initiating financial transactions, or otherwise accessing platform services, you acknowledge that you have read, understood, and agreed to be legally bound by all policies, guidelines, and terms set forth below.
          </p>
        </div>

        {/* Articles */}
        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
          {/* Article 1 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              1. Account Registration, Security & Single-Account Policy
            </h2>
            <div className="space-y-2">
              <p>
                <strong>1.1 Legal Age Requirement:</strong> Members must be at least eighteen (18) years of age or the age of legal majority in their jurisdiction to register and use platform facilities.
              </p>
              <p>
                <strong>1.2 Strict Single-Account Policy:</strong> Each user is permitted to hold and operate exactly one (1) account. Registering or operating multiple accounts using different mobile numbers, SIM cards, or identity details is strictly prohibited. Detection of duplicate or auxiliary accounts operated by the same individual will lead to the immediate termination of all associated accounts and forfeiture of unpaid balances.
              </p>
              <p>
                <strong>1.3 Verification of Identity and Payment Channels:</strong> The member&rsquo;s registered name and mobile number must match the identity on their registered payment account (Easypaisa, JazzCash, or bank account). Discrepancies between member registration and payout recipient records may result in transaction delays or cancellation.
              </p>
              <p>
                <strong>1.4 Credential Responsibility:</strong> Members are solely responsible for maintaining the confidentiality of their login credentials. The platform administration will never ask for your password or payment PINs.
              </p>
            </div>
          </section>

          {/* Article 2 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              2. Anti-Fraud, IP Tracking & Device Integrity
            </h2>
            <div className="space-y-2">
              <p>
                <strong>2.1 VPN and Proxy Prohibition:</strong> The use of Virtual Private Networks (VPNs), proxy servers, Tor networks, hosting networks, emulators, or multi-instance browsers is strictly prohibited. The system utilizes automated detection to monitor network routing and connection integrity.
              </p>
              <p>
                <strong>2.2 Automated Scripts and Bots:</strong> Any deployment of automated scripts, macros, auto-clickers, bots, or scraping tools will lead to immediate permanent blacklisting.
              </p>
              <p>
                <strong>2.3 Authenticity of Submission Evidence:</strong> Submitting falsified, manipulated, duplicated, or third-party screenshots as task proof or deposit confirmation is considered fraudulent activity and will result in the immediate and permanent freezing of the user account.
              </p>
            </div>
          </section>

          {/* Article 3 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              3. Task Execution, Quality Standards & Administrative Review
            </h2>
            <div className="space-y-2">
              <p>
                <strong>3.1 Strict Sequential Progression:</strong> Assignments must be completed in sequential order (Task 1, followed by Task 2, and so forth). Subsequent tasks remain locked until the preceding task has been verified.
              </p>
              <p>
                <strong>3.2 Genuine & Permanent Engagement:</strong> For video watch, subscription, like, and comment assignments:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Videos must be viewed for the complete required duration before capture of verification proof.</li>
                <li>Channel subscriptions, likes, and comments must remain active permanently. Cancelling engagement after reward approval will trigger retroactive deductions and account freezing.</li>
              </ul>
              <p>
                <strong>3.3 Administrative Review:</strong> All submissions are reviewed by platform administrators. The administration reserves the right to reject proofs that do not meet quality criteria and require re-submission.
              </p>
            </div>
          </section>

          {/* Article 4 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              4. VIP Level Progression & Administrative Approval
            </h2>
            <div className="space-y-2">
              <p>
                <strong>4.1 Level Progression:</strong> Members commence at Level 1 and advance through subsequent tiers upon fulfilling required criteria and tasks.
              </p>
              <p>
                <strong>4.2 Level 4 Assignments:</strong> Completing the designated assignments in Level 4 unlocks progression toward upper tiers.
              </p>
              <p>
                <strong>4.3 VIP Levels 5 Through 10 Administrative Approval:</strong> To ensure platform quota balancing and quality control, VIP Levels 5, 6, 7, 8, 9, and 10 require formal administrative review and approval before unlocking. Assignments in these upper tiers remain locked until approved by platform administration.
              </p>
              <p>
                <strong>4.4 Non-Transferability:</strong> VIP tiers, privileges, and progress belong exclusively to the registered account and cannot be sold, assigned, or transferred.
              </p>
            </div>
          </section>

          {/* Article 5 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              5. Deposit Policy & Wallet Management
            </h2>
            <div className="space-y-2">
              <p>
                <strong>5.1 Official Accounts Only:</strong> Deposits must be made exclusively to the active accounts listed on the platform deposit screen at the time of transfer. Deposits sent to past, inactive, or unlisted numbers cannot be credited.
              </p>
              <p>
                <strong>5.2 Single Transaction ID Usage:</strong> Each Transaction ID (TxID) may only be submitted once. Duplicate or falsified TxID submissions will result in an immediate security lock.
              </p>
              <p>
                <strong>5.3 Non-Refundable Assignment Fees:</strong> Assignment unlock fees for prepaid VIP tasks are non-refundable once activated, as they trigger operational resource allocation.
              </p>
            </div>
          </section>

          {/* Article 6 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              6. Withdrawal Policy, Payout Tiers & Penalty Locks
            </h2>
            <div className="space-y-2">
              <p>
                <strong>6.1 Level 1 Mandatory Total Balance Withdrawal:</strong> Upon completing all tasks in Level 1, members must withdraw their complete wallet balance. Level 2 tasks remain locked until the Level 1 balance payout has been reviewed and disbursed.
              </p>
              <p>
                <strong>6.2 Level 2 Payout (10% Disbursed):</strong> Upon completing Level 2, members are eligible for a 10% withdrawal payout of their requested withdrawal amount.
              </p>
              <p>
                <strong>6.3 Level 3 Through Level 10 Payout (100% Disbursed):</strong> From Level 3 through Level 10, members can request and receive 100% full withdrawals of their eligible earnings.
              </p>
              <p>
                <strong>6.4 Rule Violation & Instruction Non-Compliance Lock:</strong> Strict compliance with all assignment instructions, timeframes, and platform rules is mandatory. If any platform rule is violated or assignment instructions are not followed, the member&rsquo;s withdrawal will be locked immediately and will only be processed after successfully completing the next level.
              </p>
              <p>
                <strong>6.5 Account Details Accuracy:</strong> Disbursements are sent strictly to the recipient account number and title entered by the user. The platform bears no responsibility for funds sent to incorrect account credentials submitted by the user.
              </p>
              <p>
                <strong>6.6 Single Active Request:</strong> Members may only submit one withdrawal request at a time. Consecutive withdrawal requests cannot be submitted while an existing request is pending.
              </p>
              <p>
                <strong>6.7 Processing Window:</strong> Withdrawals are processed during standard administrative review hours (typically 24 to 48 hours). Banking and telecom delays are beyond platform jurisdiction.
              </p>
            </div>
          </section>

          {/* Article 7 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              7. Lucky Spin Wheel & Milestone Rewards
            </h2>
            <div className="space-y-2">
              <p>
                <strong>7.1 Entitlement Grants:</strong> Spin entitlements are granted upon achieving specific task milestones or through administrative allocation.
              </p>
              <p>
                <strong>7.2 Prize Claims & Identity Verification:</strong> Claims for high-value prizes (such as mobile devices, electronics, or vehicle milestones) are subject to identity verification prior to handover.
              </p>
              <p>
                <strong>7.3 Cash Alternatives:</strong> At the platform&rsquo;s discretion, physical prizes may be redeemed for equivalent wallet cash balance credited directly to the member.
              </p>
            </div>
          </section>

          {/* Article 8 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              8. Support, Communication & Conduct Standards
            </h2>
            <div className="space-y-2">
              <p>
                <strong>8.1 Official Communication Channels:</strong> Official customer support is provided exclusively via platform support tickets and verified official Telegram channels. The platform accepts no responsibility for third-party groups or unauthorized representatives.
              </p>
              <p>
                <strong>8.2 Respectful Conduct:</strong> Abusive language, harassment, threats, or defamation directed toward platform staff or administrators will result in immediate permanent account termination and forfeiture of account balance.
              </p>
            </div>
          </section>

          {/* Article 9 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              9. Account Suspension, Freezing & Termination
            </h2>
            <div className="space-y-2">
              <p>
                The platform administration reserves the right to restrict, suspend, or terminate member accounts in instances including, but not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Automated botting, script execution, or emulator usage.</li>
                <li>Submission of forged, stolen, or manipulated payment or task proofs.</li>
                <li>Breach of withdrawal policies or task execution instructions.</li>
                <li>Prolonged account inactivity exceeding platform guidelines.</li>
              </ul>
              <p>
                Balances associated with confirmed fraudulent activity or policy violations will be permanently forfeited.
              </p>
            </div>
          </section>

          {/* Article 10 */}
          <section>
            <h2 className="text-base font-bold text-slate-900 mb-2">
              10. Platform Rights, Maintenance & Amendments to Terms
            </h2>
            <div className="space-y-2">
              <p>
                <strong>10.1 System Maintenance:</strong> Earn Street reserves the right to conduct scheduled or emergency system maintenance. During maintenance periods, active task timers and submissions are temporarily paused.
              </p>
              <p>
                <strong>10.2 Modification Rights:</strong> The platform reserves the right to amend these Terms and Conditions or revise assignment reward rates as operational needs require. Material changes will be published via platform announcements. Continued use of the platform after updates constitutes agreement to the amended terms.
              </p>
            </div>
          </section>
        </div>

        {/* Document Footer */}
        <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Earn Street. All rights reserved.</p>
          <button
            type="button"
            onClick={handleBack}
            className="text-slate-800 font-semibold hover:underline cursor-pointer"
          >
            {user ? 'Return to Dashboard' : 'Return to Registration'}
          </button>
        </div>
      </main>
    </div>
  );
};
