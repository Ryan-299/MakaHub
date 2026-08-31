import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import darkLogo from '../assets/MAKAOHUB LOGO NO BACKGROUND (Dark Mode).png';
import lightLogo from '../assets/official no white background image.png';

export const LoginView: React.FC = () => {
  const { loginUser, setCurrentView, resolvedTheme, setTheme } = useApp();
  const isDark = resolvedTheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleNotice, setGoogleNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleNotice(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setErrorMessage('');
    // Log user in and route to the role-selection page ("How would you like to use MakaoHub?")
    loginUser(trimmedEmail, 'role-selection');
  };

  const handleGoogleClick = () => {
    setGoogleNotice(true);
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
      id="makaohub-login-screen"
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
          id="login-back-btn"
          onClick={() => setCurrentView('welcome')}
          aria-label="Back to Welcome screen"
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
          id="login-theme-toggle-btn"
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

      {/* Main Centered Login Column (Max-width 440px - 480px on desktop) */}
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
          Log In to MakaoHub
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
          Access your saved homes, inquiries, and property listings
        </p>

        {/* Inline Error Display */}
        {errorMessage && (
          <div
            id="login-error-message"
            role="alert"
            className="w-full mb-4 px-4 py-3 rounded-2xl text-xs font-semibold text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 text-center animate-in fade-in"
          >
            {errorMessage}
          </div>
        )}

        {/* Temporary Google notice */}
        {googleNotice && (
          <div
            role="status"
            className="w-full mb-4 px-4 py-3 rounded-2xl text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center animate-in fade-in"
          >
            Google authentication will be connected during backend development.
          </div>
        )}

        {/* 4. Login Form */}
        <form onSubmit={handleSubmit} className="w-full text-left space-y-4 font-body">
          {/* Email Address */}
          <div>
            <label
              htmlFor="login-email"
              className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              }`}
            >
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              placeholder="you@example.com"
              required
              className={`w-full h-12 sm:h-[50px] px-4 rounded-2xl text-sm font-medium transition-colors border focus:outline-none ${
                isDark
                  ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-white'
                  : 'bg-neutral-50/60 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-black'
              }`}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className={`block text-xs font-semibold mb-1.5 ${
                isDark ? 'text-neutral-300' : 'text-neutral-700'
              }`}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Enter password"
                required
                className={`w-full h-12 sm:h-[50px] pl-4 pr-11 rounded-2xl text-sm font-medium transition-colors border focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-white'
                    : 'bg-neutral-50/60 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-black'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-200 dark:hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Action: LOG IN */}
          <button
            type="submit"
            id="login-submit-btn"
            className={`w-full h-[52px] sm:h-14 mt-2 rounded-2xl text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark
                ? 'bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black focus:ring-white focus:ring-offset-black'
                : 'bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white focus:ring-black focus:ring-offset-white'
            }`}
          >
            <span>LOG IN</span>
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative my-6 flex items-center justify-center w-full">
          <div
            className={`border-t w-full ${
              isDark ? 'border-neutral-800' : 'border-neutral-200'
            }`}
          />
          <span
            className={`absolute px-3 text-[11px] font-semibold tracking-wider uppercase font-body ${
              isDark ? 'bg-black text-neutral-500' : 'bg-white text-neutral-400'
            }`}
          >
            OR
          </span>
        </div>

        {/* Google Sign-in Action */}
        <button
          type="button"
          id="login-google-btn"
          onClick={handleGoogleClick}
          className={`w-full h-[52px] sm:h-14 rounded-2xl text-sm font-semibold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 ease-out active:scale-[0.99] cursor-pointer border focus:outline-none focus:ring-2 ${
            isDark
              ? 'bg-transparent hover:bg-white/5 active:bg-white/10 border-neutral-800 text-white focus:ring-white focus:ring-offset-black'
              : 'bg-white hover:bg-neutral-50 active:bg-neutral-100 border-neutral-300 text-neutral-900 focus:ring-black focus:ring-offset-white'
          }`}
        >
          {/* Official multicolor Google "G" icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-body">Continue with Google</span>
        </button>

        {/* 5. Create Account Link */}
        <div
          className={`mt-8 text-xs font-body ${
            isDark ? 'text-neutral-400' : 'text-neutral-500'
          }`}
        >
          <span>New to MakaoHub? </span>
          <button
            type="button"
            id="login-to-signup-btn"
            onClick={() => setCurrentView('signup')}
            className={`font-semibold underline underline-offset-4 cursor-pointer transition-colors ${
              isDark ? 'text-white hover:text-neutral-200' : 'text-black hover:text-neutral-700'
            }`}
          >
            Create an Account
          </button>
        </div>
      </div>

      {/* Bottom spacer for optical balance */}
      <footer className="w-full py-2 flex justify-center opacity-0 pointer-events-none">
        <span className="text-[10px]">MakaoHub</span>
      </footer>
    </main>
  );
};
