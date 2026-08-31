import React, { useState } from 'react';
import { Mail, Phone, CheckCircle2, X, Send, ShieldCheck, User } from 'lucide-react';
import { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';

interface ContactListerModalProps {
  property: PropertyListing;
  onClose: () => void;
}

export const ContactListerModal: React.FC<ContactListerModalProps> = ({
  property,
  onClose
}) => {
  const { sendEnquiry, currentUser, setCurrentView, setTargetEnquiryId } = useApp();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+254 7');
  const [email, setEmail] = useState(currentUser?.email || '');
  const listerName = property.lister?.name || 'Property Lister';
  const listerAvatar = property.lister?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80';
  const listerType = property.lister?.type || 'Landlord / Property Owner';

  const [message, setMessage] = useState(
    `Hello ${listerName}, I am interested in viewing the available ${property.type} at ${property.name} (${property.location.estate}). When can we schedule a walkthrough?`
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendEnquiry(property.id, name, phone, email, message);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-neutral-200 dark:border-[#292929] animate-in zoom-in-95 duration-150 text-neutral-900 dark:text-[#F5F5F5]">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <img
              src={listerAvatar}
              alt={listerName}
              className="w-11 h-11 rounded-full object-cover border-2 border-neutral-200 dark:border-[#383838]"
            />
            <div>
              <h3 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] leading-tight">
                Contact {listerName}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-medium font-sans">{listerType}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4 font-sans">
            <div className="w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 dark:text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-editorial font-semibold text-neutral-900 dark:text-[#F5F5F5]">Enquiry Sent Successfully!</h4>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] max-w-xs mx-auto leading-relaxed">
                Your private inquiry has been delivered directly to {listerName}. You can track replies in your Enquiries inbox.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white border border-neutral-200 dark:border-[#383838] rounded-xl hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTargetEnquiryId(null);
                  setCurrentView('seeker-enquiries');
                }}
                className="px-5 py-2.5 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>View In My Enquiries</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 font-sans">
            <div className="bg-neutral-50 dark:bg-[#151515] p-3.5 rounded-xl border border-neutral-200 dark:border-[#292929] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-neutral-900 dark:text-[#F5F5F5]">{property.name}</span>
                <span className="text-neutral-500 dark:text-[#8A8A8A] block">KSh {property.monthlyRent.toLocaleString()} / month • {property.vacancies} vacancies</span>
              </div>
              <span className="bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded-md font-semibold text-[10px]">
                {property.type}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#D5D5D5] mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kevin Odhiambo"
                  className="w-full px-3 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-lg text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-[#D5D5D5] mb-1">Phone Number (M-Pesa/SMS)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-lg text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-[#D5D5D5] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kevin@example.com"
                className="w-full px-3 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-lg text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-[#D5D5D5] mb-1">Message</label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#151515] border border-neutral-300 dark:border-[#383838] text-neutral-900 dark:text-[#F5F5F5] rounded-lg text-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                required
              />
            </div>

            <div className="bg-neutral-50 dark:bg-[#151515] p-2.5 rounded-lg border border-neutral-200 dark:border-[#292929] flex items-center gap-2 text-[11px] text-neutral-600 dark:text-[#A3A3A3]">
              <ShieldCheck className="w-4 h-4 text-black dark:text-white shrink-0" />
              <span>Direct landlord connection. Do NOT send unverified viewing fees via phone.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Enquiry</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
