import React from 'react';

import { ResolvedTheme } from '../types';

interface OfflineScreenProps {
    theme: ResolvedTheme;
    onRetry?: () => void;
}

export const OfflineScreen: React.FC<OfflineScreenProps> = ({
    theme,
    onRetry,
}) => {
    const isDark = theme === 'dark';

    // Same logo mapping currently used by the splash screen


    const handleRetry = () => {
        if (onRetry) {
            onRetry();
            return;
        }

        window.location.reload();
    };

    return (
        <div
            className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{
                backgroundColor: isDark ? '#000000' : '#F7F5F1',
            }}
        >
            {/* Rentike logo */}
            <img
                src="/pwa-192x192.png"
                alt="Rentike"
                className="w-[120px] sm:w-[140px] md:w-[165px] h-auto object-contain select-none pointer-events-none"
                draggable={false}
            />

            {/* Heading */}
            <h1

                className="mt-7 font-sans"
                style={{
                    fontSize: 'clamp(1.35rem, 4vw, 2rem)',
                    letterSpacing: '0.16em',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                }}
            >
                YOU'RE OFFLINE
            </h1>

            {/* Explanation */}
            <p
                className="mt-4 max-w-[390px]"
                style={{
                    fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                    lineHeight: 1.7,
                    color: isDark ? '#A8A8A8' : '#666666',
                }}
            >
                Rentike can't connect right now. Check your internet connection and try
                again.
            </p>

            {/* Retry button */}
            <button
                type="button"
                onClick={handleRetry}
                className="mt-8 px-7 py-3 rounded-full transition-transform active:scale-95"
                style={{
                    backgroundColor: isDark ? '#C49A6C' : '#9B6A3D',
                    color: isDark ? '#000000' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.18em',
                }}
            >
                TRY AGAIN
            </button>

            {/* Small status indicator */}
            <div className="mt-7 flex items-center gap-2">
                <span
                    style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#C49A6C' : '#9B6A3D',
                    }}
                />

                <span
                    style={{
                        fontSize: '0.62rem',
                        letterSpacing: '0.16em',
                        color: isDark ? '#777777' : '#888888',
                    }}
                >
                    CONNECTION LOST
                </span>
            </div>
        </div>
    );
};