import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import darkLogo from '../assets/MAKAOHUB LOGO NO BACKGROUND (Dark Mode).png';
import lightLogo from '../assets/official no white background image.png';
import rentikeDarkThemeIcon from "../assets/rentike(light).png";
import rentikeLightThemeIcon from "../assets/rentike(dark).png";

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
      className={`min-h-screen w-full flex flex-col justify-center items-center px-6 py-6 sm:py-10 select-none transition-colors duration-300 relative ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
        }`}
      style={{
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: isDark ? '#000000' : '#F7F5F1',
      }}
    >
      {/* Top Bar with small Theme Switcher on the right */}
      <header className="absolute top-0 left-0 right-0 w-full max-w-5xl mx-auto flex items-center justify-end p-5 sm:p-6 z-20">
        <button
          type="button"
          id="welcome-theme-toggle-btn"
          onClick={toggleThemeMode}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`p-2.5 rounded-full transition-all cursor-pointer border focus:outline-none focus:ring-2 ${isDark
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
      <div
        className="w-[calc(100%-32px)] sm:w-full max-w-[560px] mx-auto flex flex-col items-center rounded-[28px] px-6 sm:px-10 py-8 sm:py-10 border"
        style={{
          backgroundColor: isDark ? '#0D0D0D' : '#FCFAF7',
          borderColor: isDark
            ? 'rgba(196, 154, 108, 0.65)'
            : 'rgba(196, 154, 108, 0.45)',
          boxShadow: isDark
            ? '0 18px 50px rgba(0, 0, 0, 0.35)'
            : '0 18px 50px rgba(28, 22, 16, 0.08)',
        }}
      >
        <div className="w-full max-w-[460px] mx-auto flex flex-col items-center text-center">

          <div className="mt-3 flex flex-col items-center">
            <img
              src={isDark ? rentikeDarkThemeIcon : rentikeLightThemeIcon}
              alt="Rentike"
              draggable={false}
              className="w-20 sm:w-24 h-auto object-contain"
            />

            <div
              className="mt-3"
              style={{
                fontFamily: "'Anurati', sans-serif",
                fontSize: '1.45rem',
                letterSpacing: '0.16em',
                color: isDark ? '#F7F5F1' : '#111111',
              }}
            >
              RENTIKE
            </div>
          </div>
          {/* 2. Headline with Cormorant Garamond / refined editorial serif */}
          <h1
            className="mt-5 text-[30px] sm:text-[36px] md:text-[40px] font-medium leading-[1.08] tracking-[-0.02em] text-center"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', serif",
              color: isDark ? '#F7F5F1' : '#171512',
            }}
          >
            Find a place you'll call home.
          </h1>

          {/* 3. Supporting Sentence with Manrope font */}
          <p
            className="mt-3 text-[13px] sm:text-[15px] font-normal leading-[1.6] text-center"
            style={{
              fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif",
              color: isDark ? '#A39D96' : '#6F6A63',
            }}
          >
            Discover available rental homes across Kenya.
          </p>

          {/* 4. Action Buttons Container */}
          <div
            className="w-full mt-5 sm:mt-6 space-y-3 sm:space-y-3.5"
            style={{
              fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
            }}
          >
            {/* Primary Action: CREATE ACCOUNT */}
            <button
              type="button"
              id="auth-create-account-btn"
              onClick={() => setCurrentView('signup')}
              className="w-full h-[52px] sm:h-14 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99]"
              style={{
                backgroundColor: '#C49A6C',
                color: '#111111',
                border: '1px solid #C49A6C',
              }}
            >
              <span>Create Account</span>
            </button>

            <button
              type="button"
              id="auth-login-btn"
              onClick={() => setCurrentView('login')}
              className="w-full h-[52px] sm:h-14 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.99]"
              style={{
                backgroundColor: 'transparent',
                color: isDark ? '#F7F5F1' : '#171512',
                border: isDark
                  ? '1px solid rgba(196, 154, 108, 0.8)'
                  : '1px solid rgba(196, 154, 108, 0.7)',
              }}
            >
              <span>Log In</span>
            </button>

          </div>
        </div>

        {/* 5. Bottom Tagline: FIND · CONNECT · MOVE IN */}
        <footer className="w-full mt-5 sm:mt-6 pb-2 flex justify-center">
          <span
            className={`font-body text-[11px] sm:text-xs font-semibold tracking-[0.24em] sm:tracking-[0.28em] uppercase ${isDark ? 'text-neutral-500' : 'text-neutral-400'
              }`}
            style={{
              fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
            }}
          >
            FIND &middot; CONNECT &middot; MOVE IN
          </span>
        </footer>
      </div>
    </main >
  );
};
