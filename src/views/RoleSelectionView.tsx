import React, { useState } from 'react';
import { Search, Building2, ArrowLeft, Sun, Moon, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import darkLogo from '../assets/MAKAOHUB LOGO NO BACKGROUND (Dark Mode).png';
import lightLogo from '../assets/official no white background image.png';

export const RoleSelectionView: React.FC = () => {
  const { assignRole, setCurrentView, resolvedTheme, setTheme } = useApp();
  const isDark = resolvedTheme === 'dark';

  const [selectedRole, setSelectedRole] = useState<'seeker' | 'lister' | null>(null);

  const handleContinue = () => {
    if (!selectedRole) return;
    assignRole(selectedRole);
  };

  const toggleThemeMode = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <main
      id="makaohub-role-selection-screen"
      className={`min-h-screen w-full flex flex-col justify-between items-center px-6 py-6 sm:py-10 transition-colors duration-200 relative ${
        isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
      }`}
      style={{
        backgroundColor: isDark ? '#000000' : '#FFFFFF'
      }}
    >
      {/* Top Bar Controls: Back Navigation (Left) and Theme Switch (Right) */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between z-20">
        {/* Subtle Back Button */}
        <button
          type="button"
          id="role-selection-back-btn"
          onClick={() => setCurrentView('login')}
          aria-label="Back to Log In screen"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
            isDark
              ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-body hidden sm:inline">Back</span>
        </button>

        {/* Small Light / Dark Mode Toggle Button in Top-Right */}
        <button
          type="button"
          id="role-selection-theme-toggle-btn"
          onClick={toggleThemeMode}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2.5 rounded-full transition-all cursor-pointer border focus:outline-none focus:ring-2 ${
            isDark
              ? 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-800 text-neutral-200 hover:text-white focus:ring-white'
              : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200 text-neutral-700 hover:text-black focus:ring-black'
          }`}
        >
          {isDark ? (
            <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          ) : (
            <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          )}
        </button>
      </header>

      {/* Main Centered Role Selection Column (Max-width 460px on desktop) */}
      <div className="w-full max-w-[460px] mx-auto flex flex-col items-center text-center my-auto py-4 sm:py-6 animate-in fade-in duration-300">
        {/* 1. Large MakaoHub Logo */}
        <div className="mb-3 sm:mb-4 flex items-center justify-center">
          <img
            src={isDark ? darkLogo : lightLogo}
            alt="MakaoHub"
            className="w-52 sm:w-60 md:w-72 h-auto object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* 2. Page Title with Cormorant Garamond */}
        <h1
          className={`font-editorial text-3xl sm:text-4xl font-normal leading-tight tracking-tight mb-2 ${
            isDark ? 'text-white' : 'text-neutral-950'
          }`}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', Times, serif"
          }}
        >
          How would you like to use MakaoHub?
        </h1>

        {/* 3. Supporting Text */}
        <p
          className={`font-body text-sm sm:text-base font-normal leading-relaxed max-w-[360px] mb-6 sm:mb-8 ${
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          }`}
          style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
          }}
        >
          Choose how you want to continue.
        </p>

        {/* 4. Two Premium Selectable Role Cards */}
        <div className="w-full space-y-3.5 text-left font-body">
          {/* Card 1: Find a Property (Seeker) */}
          <div
            id="role-option-seeker"
            role="radio"
            aria-checked={selectedRole === 'seeker'}
            tabIndex={0}
            onClick={() => setSelectedRole('seeker')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedRole('seeker');
              }
            }}
            className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-4 select-none relative ${
              selectedRole === 'seeker'
                ? isDark
                  ? 'bg-neutral-900 border-white text-white shadow-md'
                  : 'bg-white border-black text-black shadow-md'
                : isDark
                  ? 'bg-neutral-950/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-950'
                  : 'bg-neutral-50/70 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100/50'
            }`}
          >
            {/* Icon Container */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                selectedRole === 'seeker'
                  ? isDark
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : isDark
                    ? 'bg-neutral-900 text-neutral-300'
                    : 'bg-neutral-200/80 text-neutral-800'
              }`}
            >
              <Search className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 pr-6">
              <h2
                className={`text-base sm:text-lg font-bold leading-snug mb-1 ${
                  selectedRole === 'seeker'
                    ? isDark
                      ? 'text-white'
                      : 'text-black'
                    : isDark
                      ? 'text-neutral-100'
                      : 'text-neutral-900'
                }`}
              >
                Find a Property
              </h2>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  selectedRole === 'seeker'
                    ? isDark
                      ? 'text-neutral-300'
                      : 'text-neutral-700'
                    : isDark
                      ? 'text-neutral-400'
                      : 'text-neutral-500'
                }`}
              >
                Search, save and enquire about available rental homes.
              </p>
            </div>

            {/* Selection Check indicator */}
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                selectedRole === 'seeker'
                  ? isDark
                    ? 'border-white bg-white text-black'
                    : 'border-black bg-black text-white'
                  : isDark
                    ? 'border-neutral-700 bg-transparent text-transparent'
                    : 'border-neutral-300 bg-transparent text-transparent'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          {/* Card 2: List a Property (Lister) */}
          <div
            id="role-option-lister"
            role="radio"
            aria-checked={selectedRole === 'lister'}
            tabIndex={0}
            onClick={() => setSelectedRole('lister')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedRole('lister');
              }
            }}
            className={`p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-start gap-4 select-none relative ${
              selectedRole === 'lister'
                ? isDark
                  ? 'bg-neutral-900 border-white text-white shadow-md'
                  : 'bg-white border-black text-black shadow-md'
                : isDark
                  ? 'bg-neutral-950/80 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-950'
                  : 'bg-neutral-50/70 border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100/50'
            }`}
          >
            {/* Icon Container */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                selectedRole === 'lister'
                  ? isDark
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : isDark
                    ? 'bg-neutral-900 text-neutral-300'
                    : 'bg-neutral-200/80 text-neutral-800'
              }`}
            >
              <Building2 className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="flex-1 pr-6">
              <h2
                className={`text-base sm:text-lg font-bold leading-snug mb-1 ${
                  selectedRole === 'lister'
                    ? isDark
                      ? 'text-white'
                      : 'text-black'
                    : isDark
                      ? 'text-neutral-100'
                      : 'text-neutral-900'
                }`}
              >
                List a Property
              </h2>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  selectedRole === 'lister'
                    ? isDark
                      ? 'text-neutral-300'
                      : 'text-neutral-700'
                    : isDark
                      ? 'text-neutral-400'
                      : 'text-neutral-500'
                }`}
              >
                List and manage rental properties on MakaoHub.
              </p>
            </div>

            {/* Selection Check indicator */}
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                selectedRole === 'lister'
                  ? isDark
                    ? 'border-white bg-white text-black'
                    : 'border-black bg-black text-white'
                  : isDark
                    ? 'border-neutral-700 bg-transparent text-transparent'
                    : 'border-neutral-300 bg-transparent text-transparent'
              }`}
            >
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* 5. CONTINUE Button */}
        <button
          type="button"
          id="role-selection-continue-btn"
          disabled={!selectedRole}
          onClick={handleContinue}
          className={`w-full h-[52px] sm:h-14 mt-6 sm:mt-8 rounded-2xl text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 font-body ${
            !selectedRole
              ? isDark
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed opacity-60'
              : isDark
                ? 'bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black cursor-pointer focus:ring-white focus:ring-offset-black'
                : 'bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white cursor-pointer focus:ring-black focus:ring-offset-white'
          }`}
        >
          <span>CONTINUE</span>
        </button>
      </div>

      {/* Bottom spacer for optical balance */}
      <footer className="w-full py-2 flex justify-center opacity-0 pointer-events-none">
        <span className="text-[10px]">MakaoHub</span>
      </footer>
    </main>
  );
};
