import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import darkLogo from '../assets/MAKAOHUB LOGO NO BACKGROUND (Dark Mode).png';
import lightLogo from '../assets/official no white background image.png';

export const WelcomeView: React.FC = () => {
  const { setCurrentView, resolvedTheme, setTheme } = useApp();
  const isDark = resolvedTheme === 'dark';

  const toggleThemeMode = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <main
      id="makaohub-auth-welcome"
      className={`min-h-screen w-full flex flex-col justify-between items-center px-6 py-6 sm:py-10 select-none transition-colors duration-300 relative ${
        isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
      }`}
      style={{
        backgroundColor: isDark ? '#000000' : '#FFFFFF'
      }}
    >
      {/* Top Bar with small Theme Switcher on the right */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-end z-20">
        <button
          type="button"
          id="welcome-theme-toggle-btn"
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

      {/* Main Centered Authentication Column (Max width 440px - 480px on desktop) */}
      <div className="w-full max-w-[460px] mx-auto flex flex-col items-center text-center my-auto py-4 sm:py-8 animate-in fade-in duration-500">
        {/* 1. MakaoHub Logo (Theme-specific transparent asset) */}
        <div className="mb-3 sm:mb-4 flex items-center justify-center">
          <img
            src={isDark ? darkLogo : lightLogo}
            alt="MakaoHub"
            className="w-52 sm:w-60 md:w-72 lg:w-80 h-auto object-contain pointer-events-none select-none"
            draggable={false}
          />
        </div>

        {/* 2. Headline with Cormorant Garamond / refined editorial serif */}
        <h1
          className={`font-editorial text-3xl sm:text-4xl md:text-[42px] font-normal leading-[1.18] sm:leading-[1.16] tracking-tight mb-3 sm:mb-4 ${
            isDark ? 'text-white' : 'text-neutral-950'
          }`}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', Times, serif"
          }}
        >
          Find a place you'll call home.
        </h1>

        {/* 3. Supporting Sentence with Manrope font */}
        <p
          className={`font-body text-sm sm:text-base font-normal leading-relaxed max-w-[340px] sm:max-w-[380px] mb-8 sm:mb-10 ${
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          }`}
          style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
          }}
        >
          Discover available rental homes across Kenya.
        </p>

        {/* 4. Action Buttons Container */}
        <div
          className="w-full space-y-3 sm:space-y-3.5"
          style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
          }}
        >
          {/* Primary Action: CREATE ACCOUNT */}
          <button
            type="button"
            id="auth-create-account-btn"
            onClick={() => setCurrentView('signup')}
            className={`w-full h-[52px] sm:h-14 rounded-2xl text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark
                ? 'bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black focus:ring-white focus:ring-offset-black'
                : 'bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white focus:ring-black focus:ring-offset-white'
            }`}
          >
            <span>Create Account</span>
          </button>

          {/* Secondary Action: LOG IN */}
          <button
            type="button"
            id="auth-login-btn"
            onClick={() => setCurrentView('login')}
            className={`w-full h-[52px] sm:h-14 rounded-2xl text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.99] cursor-pointer border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark
                ? 'bg-transparent hover:bg-white/5 active:bg-white/10 border-neutral-700 hover:border-neutral-500 text-white focus:ring-white focus:ring-offset-black'
                : 'bg-transparent hover:bg-neutral-50 active:bg-neutral-100 border-neutral-300 hover:border-black text-neutral-950 focus:ring-black focus:ring-offset-white'
            }`}
          >
            <span>Log In</span>
          </button>
        </div>
      </div>

      {/* 5. Bottom Tagline: FIND · CONNECT · MOVE IN */}
      <footer className="w-full pb-2 sm:pb-4 flex justify-center">
        <span
          className={`font-body text-[11px] sm:text-xs font-semibold tracking-[0.24em] sm:tracking-[0.28em] uppercase ${
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          }`}
          style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
          }}
        >
          FIND &middot; CONNECT &middot; MOVE IN
        </span>
      </footer>
    </main>
  );
};
