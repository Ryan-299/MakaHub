import React, { useState } from 'react';
import { X, AlertOctagon, CheckCircle2, EyeOff, UserX, ShieldAlert } from 'lucide-react';
import { PlatformReport } from '../types';
import { useApp } from '../context/AppContext';

interface InvestigateReportModalProps {
  report: PlatformReport;
  onClose: () => void;
}

export const InvestigateReportModal: React.FC<InvestigateReportModalProps> = ({
  report,
  onClose
}) => {
  const { dismissReport, hideListingReport, suspendUserReport } = useApp();
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDismiss = () => {
    dismissReport(report.id);
    setFeedback('Report has been dismissed without action.');
    setTimeout(onClose, 1200);
  };

  const handleHideListing = () => {
    hideListingReport(report.id, report.targetId);
    setFeedback('Listing has been flagged and hidden from tenant search.');
    setTimeout(onClose, 1200);
  };

  const handleSuspendUser = () => {
    suspendUserReport(report.id, report.targetId);
    setFeedback('User account suspended and flagged across the platform.');
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-[#111111] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 dark:border-[#292929] animate-in zoom-in-95 duration-150 text-neutral-900 dark:text-[#F5F5F5]">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 flex items-center justify-center border border-rose-200 dark:border-rose-900/40">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F5F5]">Investigate Report</h3>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">Moderation resolution</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] flex items-center justify-center text-neutral-400 dark:text-[#8A8A8A] hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-black dark:text-white mx-auto animate-bounce" />
            <p className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5]">{feedback}</p>
          </div>
        ) : (
          <div className="space-y-4 pt-4 text-sm">
            <div className="bg-neutral-50 dark:bg-[#161616] p-3.5 rounded-xl border border-neutral-200 dark:border-[#292929] space-y-1">
              <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider block">
                Target: {report.type}
              </span>
              <h4 className="font-bold text-neutral-900 dark:text-[#F5F5F5]">{report.targetTitle}</h4>
              {report.targetSubtitle && (
                <p className="text-xs text-neutral-600 dark:text-[#A3A3A3]">{report.targetSubtitle}</p>
              )}
              <div className="pt-2 border-t border-neutral-200 dark:border-[#2E2E2E] text-xs">
                <span className="font-semibold text-rose-700 dark:text-rose-400">Reason: </span>
                <span className="text-neutral-700 dark:text-[#D5D5D5]">{report.reason}</span>
              </div>
              <div className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] pt-1">
                Reported by {report.reporterCount} users • {report.createdAt}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] block">Take Moderation Action:</span>

              <button
                type="button"
                onClick={handleHideListing}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-amber-950 dark:text-amber-200 text-xs font-bold transition-colors cursor-pointer text-left"
              >
                <EyeOff className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <div>
                  <div>Hide / Flag Listing</div>
                  <div className="text-[11px] font-normal text-amber-800 dark:text-amber-300/80">
                    Immediately removes the listing from seeker discovery
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSuspendUser}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-950 dark:text-rose-200 text-xs font-bold transition-colors cursor-pointer text-left"
              >
                <UserX className="w-4 h-4 text-rose-700 dark:text-rose-400 shrink-0" />
                <div>
                  <div>Suspend User Account</div>
                  <div className="text-[11px] font-normal text-rose-800 dark:text-rose-300/80">
                    Deactivates login credentials and hides all linked listings
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full flex items-center justify-center py-2.5 rounded-xl border border-neutral-300 dark:border-[#383838] text-neutral-700 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1C1C1C] text-xs font-bold transition-colors cursor-pointer"
              >
                Dismiss Report (No Violation Found)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
