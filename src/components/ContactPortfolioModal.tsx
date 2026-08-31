import React, { useState } from 'react';
import { X, Building2, CheckCircle2, Send, Info } from 'lucide-react';

interface ContactPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export const ContactPortfolioModal: React.FC<ContactPortfolioModalProps> = ({
  isOpen,
  onClose,
  userName = 'Mary Wanjiku',
  userEmail = 'lister@makaohub.test',
  userPhone = '+254 712 345 678'
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(userPhone);
  const [estimatedListings, setEstimatedListings] = useState('75');
  const [notes, setNotes] = useState('We manage multiple residential buildings in Kasarani and Kiambu and would like dedicated account management.');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      id="contact-portfolio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 dark:border-[#292929] relative my-8 text-neutral-900 dark:text-[#F5F5F5] animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 pb-4 border-b border-neutral-100 dark:border-[#222222] pr-8">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-[#1E1E1E] text-neutral-800 dark:text-[#D5D5D5] px-2.5 py-0.5 rounded-md border border-neutral-200 dark:border-[#303030]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Custom Portfolio Pricing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
            Managing 50+ Active Listings?
          </h2>
          <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
            Tailored enterprise plans for large landlords, real estate agencies, and property developers.
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-900/50">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">Inquiry Received (Prototype)</h3>
              <p className="text-xs text-neutral-600 dark:text-[#A3A3A3] max-w-xs mx-auto">
                Thank you! The MakaoHub partnership team will connect custom portfolio pricing during backend launch.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Contact Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Estimated Active Listings</label>
                <input
                  type="number"
                  min="51"
                  value={estimatedListings}
                  onChange={(e) => setEstimatedListings(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-700 dark:text-[#D5D5D5]">Portfolio Notes & Estates</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
              />
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-[#161616] rounded-xl border border-neutral-200 dark:border-[#292929] flex items-center gap-2 text-[11px] text-neutral-600 dark:text-[#A3A3A3]">
              <Info className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>Includes dedicated API exports, multi-user landlord sub-accounts, and custom SLA.</span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-neutral-200 dark:border-[#333333] hover:bg-neutral-100 dark:hover:bg-[#1C1C1C] rounded-xl text-xs font-bold text-neutral-700 dark:text-[#D5D5D5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-submit-portfolio-inquiry"
                className="px-5 py-2.5 bg-black dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-200 text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
