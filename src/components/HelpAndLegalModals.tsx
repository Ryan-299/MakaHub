import React from 'react';
import { X, HelpCircle, Phone, Mail, Info, Shield, FileText, CheckCircle2 } from 'lucide-react';

export type HelpLegalModalType = 'faq' | 'contact' | 'about' | 'privacy' | 'terms' | null;

interface HelpAndLegalModalsProps {
  activeModal: HelpLegalModalType;
  onClose: () => void;
}

export const HelpAndLegalModals: React.FC<HelpAndLegalModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            {activeModal === 'faq' && <HelpCircle className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'contact' && <Phone className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'about' && <Info className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'privacy' && <Shield className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            <h3 className="font-bold text-base sm:text-lg">
              {activeModal === 'faq' && 'FAQ / Help Centre'}
              {activeModal === 'contact' && 'Contact Us'}
              {activeModal === 'about' && 'About MakaoHub'}
              {activeModal === 'privacy' && 'Privacy Policy'}
              {activeModal === 'terms' && 'Terms of Service'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {activeModal === 'faq' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white">How do I search for verified rental homes?</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Use the search bar on the homepage or open the Map Explore view to find available properties filtered by location, estate, rent, and amenities.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white">What does the live vacancy count mean?</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Listers update real-time unit vacancies. If a property reaches zero vacancies, it is marked as Fully Occupied to ensure you only browse genuinely available homes.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <h4 className="font-bold text-neutral-900 dark:text-white">How do I enquire about a property?</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Open any property details page and click "Contact Lister" to send a direct message or enquiry with your preferred move-in date.
                </p>
              </div>
              <p className="text-xs text-neutral-400 text-center pt-2">
                Help Centre content will be continually expanded as new features roll out.
              </p>
            </div>
          )}

          {activeModal === 'contact' && (
            <div className="space-y-4">
              <p>
                Have questions or need assistance with finding or listing a rental home?
              </p>
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
                  <span>Support messages can be submitted directly through your active user enquiries.</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
                  <span>Our support team actively monitors listing verification and user feedback.</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 text-center pt-2">
                Contact information and automated ticketing integration will be available here.
              </p>
            </div>
          )}

          {activeModal === 'about' && (
            <div className="space-y-3">
              <p className="font-medium text-neutral-900 dark:text-white">
                MakaoHub is Kenya’s dedicated rental property discovery marketplace.
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Our platform connects property seekers with verified landlords, caretakers, property managers, and developers across Nairobi and major towns throughout Kenya.
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                  <span>Verified Kenyan Rental Listings</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                  <span>Live Vacancy Tracking & Direct Enquiries</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                  <span>Transparent Move-In Costs & Genuine Reviews</span>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'privacy' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <p className="font-semibold text-neutral-900 dark:text-white">
                MakaoHub Privacy Policy
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                We value your privacy and are committed to safeguarding personal information collected when you browse, save listings, or enquire about properties on MakaoHub.
              </p>
              <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                <p>• <strong>Location Data:</strong> Used strictly to present properties near you when location permissions are granted.</p>
                <p>• <strong>Contact Details:</strong> Shared with property listers only when you explicitly submit an enquiry for a listing.</p>
                <p>• <strong>Preferences:</strong> Theme choices and saved properties are stored locally for seamless browsing.</p>
              </div>
            </div>
          )}

          {activeModal === 'terms' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <p className="font-semibold text-neutral-900 dark:text-white">
                MakaoHub Terms of Service
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                By accessing or using MakaoHub, you agree to comply with our platform terms and community guidelines.
              </p>
              <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                <p>• <strong>Accuracy:</strong> Listers must provide accurate monthly rent, deposit figures, and real vacancy numbers.</p>
                <p>• <strong>Safety:</strong> Seekers should verify properties in person before making off-platform financial commitments.</p>
                <p>• <strong>Conduct:</strong> Spam, fraudulent listings, and harassment are strictly prohibited.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
