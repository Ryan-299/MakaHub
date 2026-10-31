
import React, { useEffect, useRef, useState } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/react';

type CallbackStatus = 'loading' | 'slow' | 'failed' | 'verification';

export const SsoCallback: React.FC = () => {
    const clerk = useClerk();
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();

    const hasRun = useRef(false);
    const [status, setStatus] = useState<CallbackStatus>('loading');

    const goHome = () => {
        window.location.replace('/');
    };

    const navigateHome = async ({
        session,
        decorateUrl,
    }: {
        session?: { currentTask?: unknown } | null;
        decorateUrl: (url: string) => string;
    }) => {
        if (session?.currentTask) {
            console.warn(
                'Clerk session task pending:',
                session.currentTask
            );
            setStatus('verification');
            return;
        }

        window.location.replace(decorateUrl('/'));
    };

    const finishSignIn = async () => {
        await signIn.finalize({
            navigate: navigateHome,
        });
    };

    const finishSignUp = async () => {
        await signUp.finalize({
            navigate: navigateHome,
        });
    };

    useEffect(() => {
        if (!clerk.loaded || hasRun.current) return;

        hasRun.current = true;

        const finishOAuth = async () => {
            try {
                if (signIn.status === 'complete') {
                    await finishSignIn();
                    return;
                }

                if (signUp.status === 'complete') {
                    await finishSignUp();
                    return;
                }


                if (signUp.isTransferable) {
                    await signIn.create({ transfer: true });

                    const status =
                        signIn.status as typeof signIn.status | 'complete';

                    if (status === 'complete') {
                        await finishSignIn();
                        return;
                    }
                }

                if (signIn.isTransferable) {
                    await signUp.create({ transfer: true });

                    const status =
                        signUp.status as typeof signUp.status | 'complete';

                    if (status === 'complete') {
                        await finishSignUp();
                        return;
                    }
                }


                const sessionId =
                    signIn.existingSession?.sessionId ||
                    signUp.existingSession?.sessionId;

                if (sessionId) {
                    await clerk.setActive({
                        session: sessionId,
                        navigate: navigateHome,
                    });
                    return;
                }

                // Returning to a callback with an existing session.
                // Only recover home if no verification task is pending.
                if (clerk.session) {
                    if (clerk.session.currentTask) {
                        setStatus('verification');
                    } else {
                        goHome();
                    }
                    return;
                }

                console.error('OAuth callback could not be completed.', {
                    signInStatus: signIn.status,
                    signUpStatus: signUp.status,
                    missingFields: signUp.missingFields,
                });

                setStatus('failed');
            } catch (error) {
                console.error('OAuth callback failed:', error);

                if (clerk.session && !clerk.session.currentTask) {
                    goHome();
                } else {
                    setStatus(
                        clerk.session?.currentTask
                            ? 'verification'
                            : 'failed'
                    );
                }
            }
        };

        void finishOAuth();
    }, [clerk, signIn, signUp]);

    // A slow connection should show an explanation,
    // not automatically cancel a legitimate sign-in.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setStatus((previous) =>
                previous === 'loading' ? 'slow' : previous
            );
        }, 15000);

        return () => window.clearTimeout(timer);
    }, []);

    const isLoading =
        status === 'loading' || status === 'slow';

    return (
        <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-6 text-center bg-[#F7F5F1] dark:bg-black text-[#111111] dark:text-[#F7F5F1]">
            {isLoading ? (
                <>
                    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#C49A6C]/25 border-t-[#C49A6C]" />

                    <p className="mt-4 text-sm">
                        {status === 'slow'
                            ? 'Taking longer than usual...'
                            : 'Signing you in...'}
                    </p>

                    {status === 'slow' && (
                        <p className="mt-3 max-w-[280px] text-xs text-neutral-500">
                            You can continue waiting or return to Rentike.
                        </p>
                    )}
                </>
            ) : (
                <>
                    <h1
                        className="font-semibold"
                        style={{
                            fontSize: '1.05rem',
                            letterSpacing: '0.12em',
                        }}
                    >
                        {status === 'verification'
                            ? 'VERIFICATION REQUIRED'
                            : "SIGN-IN DIDN'T FINISH"}
                    </h1>

                    <p className="mt-3 max-w-[280px] text-xs leading-relaxed text-neutral-500">
                        {status === 'verification'
                            ? 'Your account needs an additional verification step. Return to Rentike to continue signing in.'
                            : 'Something interrupted the sign-in. Please return to Rentike and try again.'}
                    </p>
                </>
            )}

            {status !== 'loading' && (
                <button
                    type="button"
                    onClick={goHome}
                    className="mt-7 rounded-full px-7 py-3 text-black"
                    style={{
                        backgroundColor: '#C49A6C',
                        fontSize: '0.65rem',
                        letterSpacing: '0.16em',
                        fontWeight: 600,
                    }}
                >
                    BACK TO RENTIKE
                </button>
            )}

            <div id="clerk-captcha" />
        </div>
    );
};
