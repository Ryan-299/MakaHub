import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  renewalDate: string;
  onConfirmCancel: () => void;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  planName,
  renewalDate,
  onConfirmCancel
}) => {
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirmCancel();
    setConfirmed(true);
  };

  return (
    <div
      id="cancel-subscription-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-[#292929] relative my-8 text-neutral-900 dark:text-[#F5F5F5] animate-in zoom-in-95 duration-200 font-sans">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmed ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-900/50">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Subscription Cancelled (Prototype)</h3>
              <p className="text-xs text-neutral-600 dark:text-[#A3A3A3]">
                Your {planName} plan remains accessible until {renewalDate}. Auto-renew has been disabled.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-900/50">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                Cancel {planName} Plan?
              </h3>
              <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
                Your subscription will remain active until the end of your current billing period ({renewalDate}). After that date, your listings will revert to the starter limit (up to 5 listings).
              </p>
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-neutral-200 dark:border-[#292929] text-xs text-neutral-600 dark:text-[#A3A3A3] space-y-1.5">
              <div className="font-bold text-neutral-900 dark:text-[#F5F5F5]">What happens after cancellation:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-neutral-600 dark:text-[#A3A3A3]">
                <li>No automatic charges will occur on {renewalDate}.</li>
                <li>Your current active properties will remain online until the billing cycle ends.</li>
                <li>You can resume or change your subscription at any time.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-neutral-100 dark:bg-[#1C1C1C] hover:bg-neutral-200 dark:hover:bg-[#262626] text-neutral-900 dark:text-[#F5F5F5] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-neutral-200 dark:border-[#2C2C2C]"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                id="btn-confirm-cancel-subscription"
                onClick={handleConfirm}
                className="w-full sm:w-1/2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
