import React, { useState } from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import darkFooterLogo from '../assets/FOOTER DARKMODE.png';
import lightFooterLogo from '../assets/FOOTER LIGHTMODE.png';
import { HelpAndLegalModals, HelpLegalModalType } from './HelpAndLegalModals';

export const Footer: React.FC = () => {
  const { setCurrentView, setSelectedPropertyId, setFilters, resetFilters, resolvedTheme } = useApp();
  const [activeModal, setActiveModal] = useState<HelpLegalModalType>(null);

  const isDark = resolvedTheme === 'dark';

  const handleLocationClick = (estate: string, subCounty: string) => {
    resetFilters();
    setFilters((prev) => ({
      ...prev,
      searchQuery: estate,
      estate,
      subCounty
    }));
    setCurrentView('tenant-home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    setCurrentView('tenant-home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer
        id="makaohub-footer"
        className="bg-[#F7F7F7] dark:bg-[#111111] text-[#111111] dark:text-[#F5F5F5] pt-4 sm:pt-5 pb-10 border-t border-[#E5E5E5] dark:border-[#262626] transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-[#E5E5E5] dark:border-[#262626]">
            {/* Brand Col */}
            <div className="lg:col-span-2 flex flex-col gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleHomeClick}
                className="flex items-center cursor-pointer focus:outline-none w-fit"
                aria-label="MakaoHub Home"
              >
                {/* Visual crop container that cleanly hides the transparent top/bottom blank canvas of the 2000x2000 PNG */}
                <div className="w-[160px] sm:w-[185px] md:w-[210px] h-[36px] sm:h-[42px] md:h-[48px] relative overflow-hidden flex items-center">
                  <img
                    src={isDark ? darkFooterLogo : lightFooterLogo}
                    alt="MakaoHub"
                    className="w-full h-auto max-w-none absolute top-1/2 -translate-y-1/2 left-0 pointer-events-none select-none"
                    draggable={false}
                  />
                </div>
              </button>

              <p className="font-manrope text-sm text-[#666666] dark:text-[#A0A0A0] max-w-md font-normal leading-[1.65] text-left md:text-justify tracking-normal">
                Kenya’s premier rental-property discovery marketplace. Connecting property seekers with verified landlords, caretakers, and property managers across Nairobi and major Kenyan towns.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2 text-xs text-[#555555] dark:text-[#A0A0A0]">
                <span className="flex items-center gap-1.5 bg-white dark:bg-[#1C1C1C] px-3 py-1.5 rounded-full border border-[#E5E5E5] dark:border-[#2E2E2E] shadow-2xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111111] dark:text-white" /> Verified Listings
                </span>
                <span className="flex items-center gap-1.5 bg-white dark:bg-[#1C1C1C] px-3 py-1.5 rounded-full border border-[#E5E5E5] dark:border-[#2E2E2E] shadow-2xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#111111] dark:text-white" /> Live Property Maps
                </span>
              </div>
            </div>

            {/* Explore Areas (Renamed from Popular Estates) */}
            <div>
              <h4 className="font-manrope text-xs sm:text-sm font-semibold text-[#111111] dark:text-[#F5F5F5] uppercase tracking-wider mb-3.5 sm:mb-4">
                Explore Areas
              </h4>
              <ul className="space-y-2.5 sm:space-y-3 font-manrope text-sm text-[#555555] dark:text-[#A0A0A0]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleLocationClick('Seasons', 'Kasarani')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Seasons, Kasarani
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLocationClick('TRM Drive', 'Roysambu')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Roysambu / TRM
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLocationClick('Dennis Pritt Road', 'Kilimani')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Kilimani & Kileleshwa
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLocationClick('Joyland', 'Kiambaa (Ruaka)')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Ruaka, Kiambu
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleLocationClick('Community Road', 'Mavoko')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Syokimau, Machakos
                  </button>
                </li>
              </ul>
            </div>

            {/* Explore */}
            <div>
              <h4 className="font-manrope text-xs sm:text-sm font-semibold text-[#111111] dark:text-[#F5F5F5] uppercase tracking-wider mb-3.5 sm:mb-4">
                Explore
              </h4>
              <ul className="space-y-2.5 sm:space-y-3 font-manrope text-sm text-[#555555] dark:text-[#A0A0A0]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('tenant-home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Find a Rental Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPropertyId(null);
                      setCurrentView('map-explore');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Live Property Map
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('saved');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Saved Properties
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentView('role-selection');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    List Your Property
                  </button>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h4 className="font-manrope text-xs sm:text-sm font-semibold text-[#111111] dark:text-[#F5F5F5] uppercase tracking-wider mb-3.5 sm:mb-4">
                Support & Legal
              </h4>
              <ul className="space-y-2.5 sm:space-y-3 font-manrope text-sm text-[#555555] dark:text-[#A0A0A0]">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('about')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    About MakaoHub
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('faq')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Help Center & FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('contact')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Terms of Service
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Credit Mandate */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777] dark:text-[#888888] font-manrope">
            <p className="font-medium text-[#444444] dark:text-[#AAAAAA]">
              © 2026 MakaoHub. <span className="text-[#111111] dark:text-white font-semibold">Powered by SHEN Studios.</span>
            </p>
            <div className="flex items-center gap-5 sm:gap-6 text-[#666666] dark:text-[#888888]">
              <span>Nairobi, Kenya</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Dialogs for Help & Legal */}
      <HelpAndLegalModals activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
};

