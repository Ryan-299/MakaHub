import React, { useState, useEffect } from 'react';
import { useSignIn } from '@clerk/react';
import { Eye, EyeOff, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import rentikeDarkThemeIcon from '../assets/2D dark (1).webp';
import rentikeLightThemeIcon from '../assets/2D light mode.webp';
export const LoginView: React.FC = () => {
  const { loginUser, setCurrentView, resolvedTheme, setTheme } = useApp();
  const { signIn, fetchStatus } = useSignIn();
  const isDark = resolvedTheme === 'dark';

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isSubmitting =
    fetchStatus === 'fetching' && !isGoogleLoading;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [lockedEmail, setLockedEmail] = useState('');
  const [lockoutExpiresAt, setLockoutExpiresAt] = useState<number | null>(null);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);
  useEffect(() => {
    if (!lockoutExpiresAt) {
      setLockoutSecondsLeft(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((lockoutExpiresAt - Date.now()) / 1000)
      );

      setLockoutSecondsLeft(remaining);

      if (remaining === 0) {
        setLockoutExpiresAt(null);
        setLockedEmail('');
      }
    };

    updateCountdown();

    const timer = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(timer);
  }, [lockoutExpiresAt]);
  const startLockoutCountdown = (accountEmail: string) => {
    const normalizedEmail = accountEmail.trim().toLowerCase();

    const storageKey = `rentike-lockout-${normalizedEmail}`;
    const savedExpiry = Number(localStorage.getItem(storageKey));

    const expiresAt =
      savedExpiry > Date.now()
        ? savedExpiry
        : Date.now() + 30 * 60 * 1000;

    localStorage.setItem(storageKey, String(expiresAt));

    setLockedEmail(normalizedEmail);
    setLockoutExpiresAt(expiresAt);
  };
  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setLockedEmail('');
      setLockoutExpiresAt(null);
      return;
    }

    const storageKey = `rentike-lockout-${normalizedEmail}`;
    const savedExpiry = Number(localStorage.getItem(storageKey));

    if (savedExpiry > Date.now()) {
      setLockedEmail(normalizedEmail);
      setLockoutExpiresAt(savedExpiry);
    } else {
      localStorage.removeItem(storageKey);
      setLockedEmail('');
      setLockoutExpiresAt(null);
    }
  }, [email]);
  const [googleNotice, setGoogleNotice] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);
  const [resetCodeVerified, setResetCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  useEffect(() => {
    if (!resetCodeSent || resetCodeVerified || resendCountdown <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resetCodeSent, resetCodeVerified, resendCountdown]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleNotice(false);

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setErrorMessage('');

    try {
      const { error } = await signIn.password({
        emailAddress: trimmedEmail,
        password,
      });


      if (error) {
        const clerkError = error as {
          code?: string;
          message?: string;
          longMessage?: string;
          errors?: Array<{
            code?: string;
            message?: string;
            longMessage?: string;
          }>;
        };

        const details =
          clerkError.errors?.find((item) => item.code === 'user_locked') ??
          clerkError;

        if (details.code === 'user_locked') {
          startLockoutCountdown(trimmedEmail);
          setErrorMessage(
            details.longMessage ||
            'Your account is temporarily locked. Please try again later or contact support@rentike.co.ke.'
          );
          return;
        }

        setErrorMessage(
          clerkError.message ||
          'Incorrect email address or password.'
        );
        return;
      }


      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: () => {
            setCurrentView('tenant-home');
          },
        });
        return;
      }

      if (signIn.status === 'needs_client_trust') {
        setErrorMessage(
          'This sign-in requires an extra verification step.'
        );
        return;
      }

      if (signIn.status === 'needs_second_factor') {
        setErrorMessage(
          'This account requires additional verification.'
        );
        return;
      }

      setErrorMessage('Sign-in could not be completed.');

    } catch (err: any) {
      const clerkError =
        err?.errors?.find((item: any) => item.code === 'user_locked') ??
        err?.errors?.[0] ??
        err;

      if (clerkError?.code === 'user_locked') {
        startLockoutCountdown(email);
        setErrorMessage(
          clerkError.longMessage ||
          clerkError.message ||
          'Your account is temporarily locked. Please try again later or contact support@rentike.co.ke.'
        );
        return;
      }

      setErrorMessage(
        clerkError?.longMessage ||
        clerkError?.message ||
        'Incorrect email address or password.'
      );
    }

  };


  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    setErrorMessage('');

    // Open Google sign-in separately from Rentike.
    const popup = window.open(
      '',
      'rentike-google-signin',
      'width=500,height=650'
    );

    // Reset the button if the sign-in window is closed.
    let closedWatcher: number | undefined;

    if (popup) {
      closedWatcher = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(closedWatcher);
          setIsGoogleLoading(false);
        }
      }, 800);
    }

    try {
      const { error } = await signIn.sso({
        strategy: 'oauth_google',
        redirectCallbackUrl: `${window.location.origin}/sso-callback`,
        redirectUrl: window.location.origin,
        ...(popup ? { popup } : {}),
      });

      if (error) {
        if (closedWatcher !== undefined) {
          window.clearInterval(closedWatcher);
        }

        popup?.close();
        setIsGoogleLoading(false);
        setErrorMessage(
          error.message ||
          'Google sign-in could not be started. Please try again.'
        );
        return;
      }

      if (signIn.status === 'complete') {
        if (closedWatcher !== undefined) {
          window.clearInterval(closedWatcher);
        }

        const { error: finalizeError } = await signIn.finalize({
          navigate: async ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              setIsGoogleLoading(false);
              setErrorMessage(
                'Additional account verification is required.'
              );
              return;
            }

            window.location.replace(decorateUrl('/'));
          },
        });

        if (finalizeError) {
          setIsGoogleLoading(false);
          setErrorMessage(
            finalizeError.message ||
            'Google sign-in could not be completed.'
          );
        }
      }
    } catch (err: any) {
      if (closedWatcher !== undefined) {
        window.clearInterval(closedWatcher);
      }

      popup?.close();
      setIsGoogleLoading(false);
      setErrorMessage(
        err?.errors?.[0]?.message ||
        err?.message ||
        'Google sign-in could not be started. Please try again.'
      );
    }
  };

  const handleSendResetCode = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage('');

    try {
      const { error: createError } = await signIn.create({
        identifier: trimmedEmail,
      });

      if (createError) {
        setErrorMessage(
          createError.message || 'Could not find that account.'
        );
        return;
      }

      const { error: sendCodeError } =
        await signIn.resetPasswordEmailCode.sendCode();

      if (sendCodeError) {
        setErrorMessage(
          sendCodeError.message ||
          'Could not send the reset code. Please try again.'
        );
        return;
      }

      setResetCodeSent(true);
    } catch (err: any) {
      setErrorMessage(
        err?.errors?.[0]?.message ||
        err?.message ||
        'Could not send the reset code. Please try again.'
      );
    }
  };
  const handleVerifyResetCode = async () => {
    if (!resetCode.trim()) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setErrorMessage('');

    try {
      const { error } =
        await signIn.resetPasswordEmailCode.verifyCode({
          code: resetCode.trim(),
        });

      if (error) {
        setErrorMessage(
          error.message || 'The verification code is incorrect.'
        );
        return;
      }

      setResetCodeVerified(true);
    } catch (err: any) {
      setErrorMessage(
        err?.errors?.[0]?.message ||
        err?.message ||
        'The verification code is incorrect.'
      );
    }
  };
  const handleResetPassword = async () => {
    if (!newPassword || !confirmNewPassword) {
      setErrorMessage('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    setErrorMessage('');

    try {
      const { error } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
          signOutOfOtherSessions: true,
        });

      if (error) {
        setErrorMessage(
          error.message || 'Could not reset your password. Please try again.'
        );
        return;
      }

      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize({
          navigate: async ({ decorateUrl }) => {
            window.location.href = decorateUrl('/');
          },
        });

        if (finalizeError) {
          setErrorMessage(
            finalizeError.message || 'Password changed, but sign-in could not be completed.'
          );
        }
      }
    } catch (err: any) {
      setErrorMessage(
        err?.errors?.[0]?.message ||
        err?.message ||
        'Could not reset your password. Please try again.'
      );
    }
  };
  const toggleThemeMode = () => {

    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  if (forgotPasswordMode) {

    if (resetCodeVerified) {
      return (
        <main
          className={`min-h-screen w-full flex items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
            }`}
        >
          <div className="w-full max-w-[460px]">
            <h1
              className="text-4xl text-center mb-3"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Create a new password
            </h1>

            <p
              className={`text-center text-sm mb-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
            >
              Choose a new password for your MakaoHub account.
            </p>

            <label className="block text-xs font-semibold mb-2">
              New Password
            </label>

            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={`w-full h-[52px] px-4 pr-12 rounded-2xl border text-sm ${isDark
                  ? 'bg-neutral-950 border-neutral-800 text-white'
                  : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
              />

              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <label className="block text-xs font-semibold mt-5 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                className={`w-full h-[52px] px-4 pr-12 rounded-2xl border text-sm ${isDark
                  ? 'bg-neutral-950 border-neutral-800 text-white'
                  : 'bg-white border-neutral-300 text-neutral-900'
                  }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100"
                aria-label={
                  showConfirmNewPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              className={`w-full h-[52px] mt-6 rounded-2xl text-sm font-semibold transition-all duration-100 active:scale-[0.98] ${isDark
                ? 'bg-white text-black active:bg-neutral-300'
                : 'bg-black text-white active:bg-neutral-700'
                }`}
            >
              {errorMessage && (
                <div className="mt-4 text-center text-sm text-red-500">
                  {errorMessage}
                </div>
              )}
              RESET PASSWORD
            </button>
          </div>
        </main>
      );
    }
    if (resetCodeSent) {
      return (
        <main
          className={`min-h-screen w-full flex items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
            }`}
        >
          <div className="w-full max-w-[460px]">
            <h1
              className="text-4xl text-center mb-3"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              Enter verification code
            </h1>

            <p
              className={`text-center text-sm mb-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'
                }`}
            >
              We sent a verification code to {email}.
            </p>

            <input
              type="text"
              value={resetCode}
              onChange={(e) => {
                setResetCode(e.target.value);
                setErrorMessage('');
              }}
              placeholder="Enter verification code"
              className={`w-full h-[52px] px-4 rounded-2xl border text-center text-sm ${isDark
                ? 'bg-neutral-950 border-neutral-800 text-white'
                : 'bg-white border-neutral-300 text-neutral-900'
                }`}
            />

            <button
              type="button"
              onClick={handleVerifyResetCode}
              className={`w-full h-[52px] mt-6 rounded-2xl text-sm font-semibold transition-all duration-100 active:scale-[0.98] ${isDark
                ? 'bg-white text-black hover:bg-neutral-100 active:bg-neutral-300'
                : 'bg-black text-white hover:bg-neutral-800 active:bg-neutral-700'
                }`}
            >
              VERIFY CODE
            </button>

            <div className="text-center mt-5 text-sm">
              Resend code in {resendCountdown}s
            </div>
          </div>
        </main>
      );
    }


    return (
      <main
        className={`min-h-screen w-full flex items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
          }`}
      >
        <div
          className="w-[calc(100%-32px)] sm:w-full max-w-[560px] mx-auto flex flex-col rounded-[28px] px-6 sm:px-10 py-8 sm:py-10 border"
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
          <div className="mb-5 flex flex-col items-center">
            <img
              src={isDark ? rentikeDarkThemeIcon : rentikeLightThemeIcon}
              alt="Rentike"
              draggable={false}
              className="w-20 sm:w-24 h-auto object-contain"
            />

            <div
              className="mt-3"
              style={{
                fontFamily: '"Anurati", sans-serif',
                fontSize: '1.45rem',
                letterSpacing: '0.16em',
                color: isDark ? '#F7F5F1' : '#171512',
              }}
            >
              RENTIKE
            </div>
          </div>
          <h1
            className="text-4xl text-center mb-3"
            style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
          >
            Reset your password
          </h1>

          <p
            className={`text-center text-sm mb-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'
              }`}
          >
            Enter the email address linked to your Renike account.
          </p>

          <label className="block text-xs font-semibold mb-2">
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}
            placeholder="you@example.com"
            className={`w-full h-[52px] px-4 rounded-2xl border text-sm ${isDark
              ? 'bg-neutral-950 border-neutral-800 text-white'
              : 'bg-white border-neutral-300 text-neutral-900'
              }`}
          />

          {errorMessage && (
            <div className="mt-4 text-center text-sm text-red-500">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleSendResetCode}
            disabled={isSubmitting}
            className={`w-full h-[52px] mt-6 rounded-2xl text-sm font-semibold ${isDark
              ? 'bg-white text-black'
              : 'bg-black text-white'
              }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </span>
            ) : (
              <span>SEND RESET CODE</span>
            )}
          </button>

          <button
            type="button"

            onClick={() => {
              setForgotPasswordMode(false);
              setErrorMessage('');
            }}
            className={`w-full mt-5 text-sm underline underline-offset-4 ${isDark ? 'text-neutral-300' : 'text-neutral-700'
              }`}
          >
            Back to Log In
          </button>
        </div>
      </main>
    );
  }
  return (
    <main
      id="makaohub-login-screen"
      className={`min-h-screen w-full flex flex-col justify-between items-center px-6 py-6 sm:py-10 transition-colors duration-200 relative ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
        }`}
      style={{
        backgroundColor: isDark ? '#000000' : '#F7F5F1'
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
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${isDark
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

      {/* Main Centered Login Column (Max-width 440px - 480px on desktop) */}
      <div
        className="w-[calc(100%-32px)] sm:w-full max-w-[560px] sm:max-w-[600px] md:max-w-[640px] mx-auto flex flex-col items-center rounded-[28px] px-4 sm:px-10 py-7 sm:py-10 border"
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
        {/* 1. Large MakaoHub Logo */}

        <div className="mb-5 flex flex-col items-center">
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
              color: isDark ? '#F7F5F1' : '#171512',
            }}
          >
            RENTIKE
          </div>
        </div>

        {/* 2. Page Title with Cormorant Garamond */}
        <h1
          className={`font-editorial text-3xl sm:text-4xl font-normal leading-tight tracking-tight mb-2 ${isDark ? 'text-white' : 'text-neutral-950'
            }`}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', Times, serif"
          }}
        >
          Log In to Rentike
        </h1>

        {/* 3. Supporting Text */}
        <p
          className={`font-body text-sm sm:text-base font-normal leading-relaxed max-w-[360px] mb-6 sm:mb-8 ${isDark ? 'text-neutral-400' : 'text-neutral-600'
            }`}
          style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif"
          }}
        >
          Access your saved homes, inquiries, and property listings
        </p>

        {/* Login Error / Account Lockout Display */}
        {lockedEmail && lockedEmail === email.trim().toLowerCase() ? (
          <div
            id="login-error-message"
            role="alert"
            className={`w-full mb-4 rounded-2xl border p-4 ${isDark
              ? 'border-red-900/50 bg-red-950/20'
              : 'border-red-200 bg-red-50'
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔒</span>
              <span
                className={`text-sm font-bold ${isDark ? 'text-red-300' : 'text-red-800'
                  }`}
              >
                Account temporarily locked
              </span>
            </div>

            <p
              className={`text-xs leading-relaxed ${isDark ? 'text-neutral-300' : 'text-neutral-600'
                }`}
            >
              Too many unsuccessful sign-in attempts.
              For your security, access to this account
              has been temporarily restricted.
            </p>

            {lockoutSecondsLeft > 0 && (
              <div className="mt-4 text-center">
                <div
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: '#B68B5A' }}
                >
                  {String(Math.floor(lockoutSecondsLeft / 60)).padStart(2, '0')}:
                  {String(lockoutSecondsLeft % 60).padStart(2, '0')}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Estimated time before you can try again
                </p>
              </div>
            )}

            <p className="mt-4 text-xs text-center text-neutral-500">
              Need assistance?{' '}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support%40rentike.co.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
                style={{ color: '#B68B5A' }}
              >
                Contact Rentike Support
              </a>
            </p>
          </div>
        ) : errorMessage ? (
          <div
            id="login-error-message"
            role="alert"
            className="w-full mb-4 px-4 py-3 rounded-2xl text-xs font-semibold text-red-500 dark:text-red-400"
          >
            {errorMessage}
          </div>
        ) : null}
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
              className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'
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
              className={`w-full h-12 sm:h-[50px] px-4 rounded-2xl text-sm font-medium transition-colors border focus:outline-none ${isDark
                ? 'bg-neutral-950 border-neutral-800 text-white placeholder:text-neutral-600 focus:border-white'
                : 'bg-neutral-50/60 border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-black'
                }`}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-300' : 'text-neutral-700'
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
                className={`w-full h-12 sm:h-[50px] pl-4 pr-11 rounded-2xl text-sm font-medium transition-colors border focus:outline-none ${isDark
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
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => setForgotPasswordMode(true)}
              className={`text-xs font-semibold underline underline-offset-4 ${isDark ? 'text-neutral-300' : 'text-neutral-700'
                }`}
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Action: LOG IN */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isSubmitting}
            className={`w-full h-[52px] sm:h-14 mt-2 rounded-2xl text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center transition-all duration-200 ease-out active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDark
              ? 'bg-white hover:bg-neutral-100 active:bg-neutral-200 text-black focus:ring-white focus:ring-offset-black'
              : 'bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white focus:ring-black focus:ring-offset-white'
              }`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </span>
            ) : (
              <span>LOG IN</span>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative my-6 flex items-center justify-center w-full">
          <div
            className={`border-t w-full ${isDark ? 'border-neutral-800' : 'border-neutral-200'
              }`}
          />
          <span
            className={`absolute px-3 text-[11px] font-semibold tracking-wider uppercase font-body ${isDark ? 'bg-black text-neutral-500' : 'bg-white text-neutral-400'
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
          disabled={isGoogleLoading}
          className={`relative w-full h-[52px] sm:h-14 flex items-center justify-center gap-3 transition-all duration-200 ease-out active:scale-[0.99] cursor-pointer border focus:outline-none focus:ring-2 ${isDark
            ? 'bg-transparent hover:bg-white/5 active:bg-white/10 border-neutral-800 text-white focus:ring-white focus:ring-offset-black'
            : 'bg-white hover:bg-neutral-50 active:bg-neutral-100 border-neutral-300 text-neutral-900 focus:ring-black focus:ring-offset-white'
            }`}
        >
          {isGoogleLoading && (
            <span className="absolute inset-0 flex items-center justify-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: '#4285F4', animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: '#EA4335', animationDelay: '150ms' }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: '#FBBC05', animationDelay: '300ms' }}
              />
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: '#34A853', animationDelay: '450ms' }}
              />
            </span>
          )}
          {/* Official multicolor Google "G" icon */}
          <svg
            className={`w-5 h-5 ${isGoogleLoading ? 'opacity-0' : 'opacity-100'}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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
          <span
            className={`font-body ${isGoogleLoading ? 'opacity-0' : 'opacity-100'
              }`}
          >
            Continue with Google
          </span>
        </button>

        {/* 5. Create Account Link */}
        <div
          className={`mt-8 text-xs font-body ${isDark ? 'text-neutral-400' : 'text-neutral-500'
            }`}
        >
          <span>New to Rentike? </span>
          <button
            type="button"
            id="login-to-signup-btn"
            onClick={() => setCurrentView('signup')}
            className={`font-semibold underline underline-offset-4 cursor-pointer transition-colors ${isDark ? 'text-white hover:text-neutral-200' : 'text-black hover:text-neutral-700'
              }`}
          >
            Create an Account
          </button>
        </div>
      </div>

      {/* Bottom spacer for optical balance */}
      <footer className="w-full py-2 flex justify-center opacity-0 pointer-events-none">
        <span className="text-[10px]">Rentike</span>
      </footer>
    </main>
  );
};
