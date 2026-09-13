import React, { useEffect, useRef } from 'react';
import { useClerk, useSignIn, useSignUp } from '@clerk/react';

export const SsoCallback: React.FC = () => {
    const clerk = useClerk();
    const { signIn } = useSignIn();
    const { signUp } = useSignUp();
    const hasRun = useRef(false);

    const finishSignIn = async () => {
        await signIn.finalize({
            navigate: async ({ session, decorateUrl }) => {
                if (session?.currentTask) {
                    console.log('Clerk session task:', session.currentTask);
                    return;
                }

                window.location.href = decorateUrl('/');
            },
        });
    };

    const finishSignUp = async () => {
        await signUp.finalize({
            navigate: async ({ session, decorateUrl }) => {
                if (session?.currentTask) {
                    console.log('Clerk session task:', session.currentTask);
                    return;
                }

                window.location.href = decorateUrl('/');
            },
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
                        navigate: async ({ session, decorateUrl }) => {
                            if (session?.currentTask) {
                                console.log('Clerk session task:', session.currentTask);
                                return;
                            }

                            window.location.href = decorateUrl('/');
                        },
                    });
                    return;
                }

                console.error('OAuth callback could not be completed.', {
                    signInStatus: signIn.status,
                    signUpStatus: signUp.status,
                    missingFields: signUp.missingFields,
                });
            } catch (error) {
                console.error('OAuth callback failed:', error);
            }
        };

        void finishOAuth();
    }, [clerk, signIn, signUp]);

    return <div id="clerk-captcha" />;
};