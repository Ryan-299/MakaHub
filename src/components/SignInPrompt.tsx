
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

import rentikeDarkThemeIcon from '../assets/2D dark (1).webp';
import rentikeLightThemeIcon from '../assets/2D light mode.webp';

// ------------------------------------------------------------
// Sign In Prompt
// Displays a centred popup over a blurred Rentike page.
// ------------------------------------------------------------

type PromptListener = (reason: string | null) => void;

let promptListeners: PromptListener[] = [];

export const openSignInPrompt = (
    reason = 'Sign in to continue'
) => {
    promptListeners.forEach((listener) => listener(reason));
};

export const closeSignInPrompt = () => {
    promptListeners.forEach((listener) => listener(null));
};

// Pages that visitors can browse without signing in.

const PUBLIC_VIEWS = new Set([
    'welcome',
    'signup',
    'login',
    'tenant-home',
    'map-explore',
    'property-detail',
    'public-lister-profile',
]);

export const isPublicView = (view: string) => {
    return PUBLIC_VIEWS.has(view);
};

// Choose the message depending on the requested action.

export const signInReasonFor = (view: string) => {
    if (view === 'saved') {
        return 'Sign in to see your saved homes';
    }

    if (view.includes('enquiries')) {
        return 'Sign in to see your messages';
    }

    if (view === 'notifications') {
        return 'Sign in to see your notifications';
    }

    if (
        view === 'add-property' ||
        view.startsWith('lister') ||
        view === 'my-listings'
    ) {
        return 'Sign in to list your property';
    }

    if (view === 'profile' || view === 'my-profile') {
        return 'Sign in to your account';
    }

    return 'Sign in to continue';
};

// ------------------------------------------------------------
// Popup Component
// ------------------------------------------------------------

export const SignInPrompt: React.FC = () => {
    const { setCurrentView, resolvedTheme } = useApp();

    const isDark = resolvedTheme === 'dark';

    const [reason, setReason] = useState<string | null>(null);

    // Listen for requests to open or close the popup.

    useEffect(() => {
        const listener: PromptListener = (next) => {
            setReason(next);
        };

        promptListeners.push(listener);

        return () => {
            promptListeners = promptListeners.filter(
                (item) => item !== listener
            );
        };
    }, []);

    // Close with Escape and prevent background scrolling.

    useEffect(() => {
        if (!reason) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setReason(null);
            }
        };

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [reason]);

    if (!reason) {
        return null;
    }

    // Open the existing Rentike signup or login page.

    const goTo = (view: 'signup' | 'login') => {
        setReason(null);
        setCurrentView(view);
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label={reason}
        >
            {/* Blurred and darkened background */}

            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setReason(null)}
            />

            {/* Centred Rentike card */}

            <div
                className="relative mx-auto flex w-full max-w-[460px] flex-col items-center rounded-[28px] border px-6 py-8 sm:px-10 sm:py-10"
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
                {/* Close button */}

                <button
                    type="button"
                    onClick={() => setReason(null)}
                    aria-label="Close"
                    className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${isDark
                        ? 'text-neutral-400 hover:bg-white/5 hover:text-white'
                        : 'text-neutral-500 hover:bg-black/5 hover:text-black'
                        }`}
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex w-full flex-col items-center text-center">
                    {/* Rentike logo */}

                    <img
                        src={
                            isDark
                                ? rentikeDarkThemeIcon
                                : rentikeLightThemeIcon
                        }
                        alt="Rentike"
                        draggable={false}
                        className="h-auto w-16 object-contain sm:w-20"
                    />

                    {/* Rentike wordmark */}

                    <div
                        className="mt-3"
                        style={{
                            fontFamily: "'Anurati', sans-serif",
                            fontSize: '1.2rem',
                            letterSpacing: '0.16em',
                            color: isDark ? '#F7F5F1' : '#111111',
                        }}
                    >
                        RENTIKE
                    </div>

                    {/* Dynamic heading */}

                    <h2
                        className="mt-5 text-[26px] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[30px]"
                        style={{
                            fontFamily:
                                "'Cormorant Garamond', Georgia, Cambria, 'Times New Roman', serif",
                            color: isDark ? '#F7F5F1' : '#171512',
                        }}
                    >
                        {reason}
                    </h2>

                    {/* Description */}

                    <p
                        className="mt-3 text-[13px] leading-[1.6] sm:text-[15px]"
                        style={{
                            fontFamily:
                                "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif",
                            color: isDark ? '#A39D96' : '#6F6A63',
                        }}
                    >
                        Create a free account or log in to continue.
                    </p>

                    {/* Authentication buttons */}

                    <div
                        className="mt-6 w-full space-y-3"
                        style={{
                            fontFamily:
                                "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif",
                        }}
                    >
                        {/* Create Account */}

                        <button
                            type="button"
                            onClick={() => goTo('signup')}
                            className="h-[52px] w-full rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.99] sm:h-14 sm:text-base"
                            style={{
                                backgroundColor: '#C49A6C',
                                color: '#111111',
                                border: '1px solid #C49A6C',
                            }}
                        >
                            Create Account
                        </button>

                        {/* Log In */}

                        <button
                            type="button"
                            onClick={() => goTo('login')}
                            className="h-[52px] w-full rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.99] sm:h-14 sm:text-base"
                            style={{
                                backgroundColor: 'transparent',
                                color: isDark ? '#F7F5F1' : '#171512',
                                border: isDark
                                    ? '1px solid rgba(196, 154, 108, 0.8)'
                                    : '1px solid rgba(196, 154, 108, 0.7)',
                            }}
                        >
                            Log In
                        </button>
                    </div>

                    {/* Brand tagline */}

                    <span
                        className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] sm:text-xs ${isDark ? 'text-neutral-500' : 'text-neutral-400'
                            }`}
                        style={{
                            fontFamily:
                                "'Manrope', 'Plus Jakarta Sans', system-ui, sans-serif",
                        }}
                    >
                        FIND &middot; CONNECT &middot; MOVE IN
                    </span>
                </div>
            </div>
        </div>
    );
};
