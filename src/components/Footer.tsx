
import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  HelpAndLegalModals,
  HelpLegalModalType
} from './HelpAndLegalModals';

// IMPORTANT:
// Your logo filenames are reversed.
// The file labelled Dark Mode is used in light mode,
// and the file labelled Light Mode is used in dark mode.
import rentikeLightLogo from '../assets/2D light mode.png';
import rentikeDarkLogo from '../assets/2D dark.png';

import peacockLogo from '../assets/peacock.png';

export const Footer: React.FC = () => {
  const {
    setCurrentView,
    resolvedTheme
  } = useApp();

  const [activeModal, setActiveModal] =
    useState<HelpLegalModalType>(null);

  const isDark = resolvedTheme === 'dark';

  const handleHomeClick = () => {
    setCurrentView('tenant-home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkClass = `
    w-fit text-left
    text-[13px] sm:text-sm
    font-manrope font-medium
    text-[#66615B] dark:text-[#A8A8A8]
    hover:text-[#9B704C]
    dark:hover:text-[#D4A77C]
    transition-colors duration-200
    cursor-pointer
  `;

  return (
    <>
      <footer
        id="rentike-footer"
        className="
          hidden md:block
          w-full min-w-0
          bg-[#F7F3EC] dark:bg-[#111111]
          text-[#171717] dark:text-[#F5F5F5]
          border-t border-[#E5DDD2]
          dark:border-[#292929]
          transition-colors duration-200
        "
      >
        <div className="w-full px-6 lg:px-8 xl:px-12 pt-10 lg:pt-12 pb-7">

          {/* Main footer */}
          <div
            className="
              grid grid-cols-1
              lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]
              gap-10 lg:gap-12 xl:gap-16
              items-start
            "
          >
            {/* RENTIKE BRANDING */}
            <div className="min-w-0 flex flex-col items-start gap-4">

              <button
                type="button"
                onClick={handleHomeClick}
                aria-label="Rentike Home"
                className="
    inline-flex items-center gap-3
    w-fit max-w-full
    cursor-pointer
    focus:outline-none
  "
              >
                {/* Rentike logo — no cropping */}
                <img
                  src={isDark ? rentikeDarkLogo : rentikeLightLogo}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="
      w-16 h-16
      sm:w-20 sm:h-20
      object-contain
      shrink-0
      pointer-events-none
      select-none
    "
                />

                {/* Rentike brand name in Anurati */}
                <span
                  className="
      font-anurati
      text-[24px] sm:text-[30px]
      tracking-[0.12em]
      text-[#242424]
      dark:text-[#F5F1E8]
      whitespace-nowrap
    "
                >
                  RENTIKE
                </span>
              </button>


              <p
                className="
                  max-w-[510px]
                  text-[13px] sm:text-sm
                  leading-[1.8]
                  font-manrope font-normal
                  text-[#68635D]
                  dark:text-[#A7A7A7]
                "
              >
                Kenya’s premier rental-property discovery marketplace.
                Connecting property seekers with verified landlords,
                caretakers, and property managers across Kenya.
              </p>

              <div
                className="
                  inline-flex items-center gap-2
                  text-xs font-manrope
                  text-[#817A72] dark:text-[#999999]
                "
              >
                <MapPin
                  className="w-3.5 h-3.5 text-[#A47145]"
                />
                <span>Nakuru, Kenya</span>
              </div>
            </div>

            {/* QUICK LINKS */}
            <div className="min-w-0">
              <h4
                className="
                  font-manrope
                  text-xs sm:text-sm font-bold
                  uppercase tracking-[0.12em]
                  text-[#24211E] dark:text-[#F5F5F5]
                  mb-5
                "
              >
                Quick Links
              </h4>

              <div
                className="
                  grid grid-cols-2
                  gap-x-5 sm:gap-x-8
                  gap-y-3.5
                "
              >
                <button
                  type="button"
                  onClick={() => setActiveModal('about')}
                  className={linkClass}
                >
                  About Us
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal('contact')}
                  className={linkClass}
                >
                  Contact Us
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal('faq')}
                  className={linkClass}
                >
                  Help Center
                </button>

                <a href="/terms" className={linkClass}>
                  Terms of Service
                </a>

                <button
                  type="button"
                  onClick={() => setActiveModal('faq')}
                  className={linkClass}
                >
                  FAQ
                </button>

                <a href="/privacy" className={linkClass}>
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="
              w-full h-px
              bg-[#E0D8CE] dark:bg-[#303030]
              mt-10 mb-6
            "
          />

          {/* BOTTOM BRAND CREDITS */}
          <div
            className="
              flex flex-col lg:flex-row
              items-start lg:items-center
              justify-between
              gap-5 lg:gap-8
            "
          >
            <p
              className="
                font-manrope
                text-[11px] sm:text-xs
                font-medium
                text-[#817A72] dark:text-[#999999]
              "
            >
              © {new Date().getFullYear()} Rentike. All rights reserved.
            </p>

            {/* Powered by Shen Studios */}
            <div
              className="
                flex flex-col
                items-start lg:items-end
                gap-2
              "
            >
              <span
                className="
                  font-manrope
                  text-[9px] font-semibold
                  uppercase tracking-[0.22em]
                  text-[#938A81] dark:text-[#9A9A9A]
                "
              >
                Powered by
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={peacockLogo}
                  alt="Shen Studios Peacock"
                  draggable={false}
                  className="
                    w-8 h-8 object-contain
                    select-none
                  "
                />

                <span
                  aria-hidden="true"
                  className="
                    h-7 w-px
                    bg-[#B98B64]
                  "
                />

                <span
                  className="
                    font-anurati
                    text-[16px] sm:text-[18px]
                    tracking-[0.12em]
                    text-[#26211E] dark:text-[#F0EAE3]
                    whitespace-nowrap
                  "
                >
                  SHEN STUDIOS
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Existing Help & Legal modals */}
      <HelpAndLegalModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};
