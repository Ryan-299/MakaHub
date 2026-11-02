import React, { useEffect, useRef, useState } from 'react';
import { useReverification, useSession, useUser } from '@clerk/react';
import { Eye, EyeOff, Lock, Mail, Phone, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { convexClient, isConvexConfigured } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export type AccountSecurityModal = 'email' | 'phone' | 'password' | null;

interface AccountSecurityModalsProps {
    active: AccountSecurityModal;
    onClose: () => void;
    contactEmail: string;
    onContactEmailSaved?: (email: string) => void;
    currentPhone?: string;
    onPhoneSaved?: (phone: string) => void;
}
const ContactEmailModal: React.FC<{
    onClose: () => void;
    currentContactEmail: string;
    onSaved?: (email: string) => void;
}> = ({ onClose, currentContactEmail, onSaved }) => {
    const { user: clerkUser } = useUser();
    const { currentUser } = useApp();

    const [email, setEmail] = useState(currentContactEmail);
    const [busy, setBusy] = useState(false);
    const [verificationStep, setVerificationStep] = useState<'email' | 'code'>('email');
    const [verificationCode, setVerificationCode] = useState('');
    const [emailBeingVerified, setEmailBeingVerified] = useState('');
    const [error, setError] = useState('');

    const [resendSeconds, setResendSeconds] = useState(0);

    React.useEffect(() => {
        if (resendSeconds <= 0) return;

        const timer = setTimeout(() => {
            setResendSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendSeconds]);


    const loginEmail =
        clerkUser?.primaryEmailAddress?.emailAddress ||
        currentUser?.email ||
        '';

    const save = async (value: string) => {
        const cleaned = value.trim().toLowerCase();

        if (
            cleaned &&
            (cleaned.length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned))
        ) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!isConvexConfigured || !convexClient) {
            setError('Unable to connect right now. Please try again.');
            return;
        }

        try {
            setBusy(true);
            setError('');

            // Removing a contact email does not require verification.
            if (!cleaned) {
                const saved = await convexClient.mutation(
                    api.users.updateMyContactEmail,
                    { email: '' }
                );

                onSaved?.(saved);
                onClose();
                return;
            }

            // Adding or changing a contact email requires verification.
            await convexClient.action(
                api.contactEmailActions.requestContactEmailVerification,
                { email: cleaned }
            );

            setEmailBeingVerified(cleaned);
            setVerificationCode('');
            setVerificationStep('code');
            setResendSeconds(60);
        } catch (err) {
            console.error('Failed to save contact email:', err);
            setError('Could not save your contact email. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const verifyCode = async () => {
        const code = verificationCode.trim();

        if (!/^\d{6}$/.test(code)) {
            setError('Please enter the six-digit verification code.');
            return;
        }

        if (!isConvexConfigured || !convexClient) {
            setError('Unable to connect right now. Please try again.');
            return;
        }

        try {
            setBusy(true);
            setError('');

            const result = await convexClient.action(
                api.contactEmailActions.verifyContactEmailCode,
                {
                    email: emailBeingVerified,
                    code,
                }
            );

            if (result.status === 'verified') {
                onSaved?.(emailBeingVerified);
                onClose();
                return;
            }

            if (result.status === 'expired') {
                setError('This code has expired. Please request a new one.');
            } else if (result.status === 'locked') {
                setError('Too many incorrect attempts. Please request a new code.');
            } else if (result.status === 'missing') {
                setError('No verification request found. Please request a new code.');
            } else {
                setError('Incorrect verification code. Please try again.');
            }
        } catch (err) {
            console.error('Contact email verification failed:', err);
            setError('Could not verify your contact email. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => {
                    if (!busy) onClose();
                }}
            />

            <div className="relative w-full max-w-md rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#F7F3EC] dark:bg-[#151515] p-6 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    aria-label="Close"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B]">
                    <Mail className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-white">
                    {currentContactEmail
                        ? 'Change Contact Email'
                        : 'Add Contact Email'}
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Choose an email to display on your lister profile.
                    This does not change your login email.
                </p>

                <div className="mt-5">
                    <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                        }}
                        placeholder="e.g. bookings@youragency.co.ke"
                        autoFocus
                        disabled={busy || verificationStep === 'code'}
                        className="w-full rounded-xl border border-[#D9C5AE] dark:border-[#3A3027] bg-white dark:bg-[#1B1B1B] px-4 py-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-[#B88653] disabled:opacity-60"
                    />

                    {loginEmail &&
                        email.trim().toLowerCase() !== loginEmail.toLowerCase() && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEmail(loginEmail);
                                    setError('');
                                }}
                                disabled={busy || verificationStep === 'code'}
                                className="mt-2 text-xs font-semibold text-[#A77745] dark:text-[#CCA177] break-all text-left"
                            >
                                Use my login email ({loginEmail})
                            </button>
                        )}

                    {verificationStep === 'code' && (
                        <div className="mt-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                Enter the six-digit verification code sent to{' '}
                                <span className="font-semibold">{emailBeingVerified}</span>.
                            </p>

                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => {
                                    setVerificationCode(
                                        e.target.value.replace(/\D/g, '').slice(0, 6)
                                    );
                                    setError('');
                                }}
                                placeholder="000000"
                                aria-label="Six-digit verification code"
                                disabled={busy}
                                className="mt-3 w-full rounded-xl border border-[#D9C5AE] bg-transparent px-4 py-3 text-center text-lg tracking-widest text-neutral-900 dark:text-white"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (verificationStep === 'code') {
                                    setVerificationStep('email');
                                    setVerificationCode('');
                                    setError('');
                                } else {
                                    onClose();
                                }
                            }}
                            disabled={busy}
                            className="flex-1 rounded-xl border border-[#D9C5AE] dark:border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                        >
                            {verificationStep === 'code' ? 'Back' : 'Cancel'}
                        </button>

                        <button
                            type="button"
                            onClick={() => verificationStep === 'code' ? verifyCode() : save(email)}
                            disabled={busy}
                            className="flex-1 rounded-xl bg-[#B8792B] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {busy
                                ? (verificationStep === 'code' ? 'Verifying...' : 'Sending...')
                                : (verificationStep === 'code' ? 'Verify Email' : 'Send Code')}
                        </button>
                    </div>

                    {verificationStep === 'code' && (
                        <button
                            type="button"
                            onClick={() => save(emailBeingVerified)}
                            disabled={busy || resendSeconds > 0}
                            className="mt-4 w-full text-center text-sm font-semibold text-[#A77745] dark:text-[#CCA177] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {resendSeconds > 0
                                ? `Resend code in ${resendSeconds}s`
                                : 'Resend code'}
                        </button>
                    )}

                    {currentContactEmail && (
                        <button
                            type="button"
                            onClick={() => save('')}
                            disabled={busy}
                            className="mt-4 w-full text-center text-sm font-semibold text-red-600 dark:text-red-400 disabled:opacity-50"
                        >
                            Remove from my profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const PhoneNumberModal: React.FC<{
    onClose: () => void;
    currentPhone: string;
    onSaved?: (phone: string) => void;
}> = ({ onClose, currentPhone, onSaved }) => {
    const [phone, setPhone] = useState(
        currentPhone === '+254700000000' ? '' : currentPhone
    );
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const save = async () => {
        if (!phone.trim()) {
            setError('Please enter your Kenyan phone number.');
            return;
        }

        if (!isConvexConfigured || !convexClient) {
            setError('Unable to connect right now. Please try again.');
            return;
        }

        try {
            setBusy(true);
            setError('');

            const result = await convexClient.mutation(
                api.users.updateMyPhone,
                { phone: phone.trim() }
            );

            if (result.status === 'saved' || result.status === 'unchanged') {
                onSaved?.(result.phone);
                onClose();
                return;
            }

            if (result.status === 'taken') {
                setError('This phone number is already used by another account.');
            } else if (result.status === 'invalid') {
                setError('Enter a valid Kenyan mobile number, e.g. 0712 345 678.');
            }
        } catch (err) {
            console.error('Failed to update phone number:', err);
            setError('Could not save your phone number. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => {
                    if (!busy) onClose();
                }}
            />

            <div className="relative w-full max-w-md rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#F7F3EC] dark:bg-[#151515] p-6 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    aria-label="Close"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B]">
                    <Phone className="h-5 w-5" />
                </div>

                <h2 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-white">
                    {currentPhone && currentPhone !== '+254700000000'
                        ? 'Change Phone Number'
                        : 'Add Phone Number'}
                </h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Enter your Kenyan mobile number. No SMS verification is required.
                </p>

                <div className="mt-5">
                    <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => {
                            setPhone(e.target.value);
                            setError('');
                        }}
                        placeholder="e.g. 0712 345 678"
                        autoFocus
                        disabled={busy}
                        className="w-full rounded-xl border border-[#D9C5AE] dark:border-[#3A3027] bg-white dark:bg-[#1B1B1B] px-4 py-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-[#B88653] disabled:opacity-60"
                    />

                    {error && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            className="flex-1 rounded-xl border border-[#D9C5AE] dark:border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={save}
                            disabled={busy}
                            className="flex-1 rounded-xl bg-[#B8792B] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {busy ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { user: clerkUser } = useUser();
    const hasPassword = clerkUser?.passwordEnabled ?? false;

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [busy, setBusy] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [notificationWarning, setNotificationWarning] = useState(false);
    const [error, setError] = useState('');

    const { session } = useSession();

    const currentPasswordRef = useRef('');
    const reverifyFailureRef = useRef('');
    const pendingCancelRef = useRef<(() => void) | null>(null);

    const [reverify, setReverify] = useState<{
        complete: () => void;
        cancel: () => void;
        email: string;
        emailAddressId: string;
    } | null>(null);

    const [reverifyCode, setReverifyCode] = useState('');
    const [reverifyBusy, setReverifyBusy] = useState(false);
    const [reverifyError, setReverifyError] = useState('');
    const [reverifyNotice, setReverifyNotice] = useState('');
    const [resendSeconds, setResendSeconds] = useState(0);

    useEffect(() => {
        return () => {
            pendingCancelRef.current?.();
        };
    }, []);

    useEffect(() => {
        if (resendSeconds <= 0) return;

        const timer = setTimeout(() => {
            setResendSeconds((seconds) => Math.max(0, seconds - 1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [resendSeconds]);

    const clerkErrorCode = (err: unknown) =>
        (err as { errors?: { code?: string }[] })?.errors?.[0]?.code || '';

    const handleNeedsReverification = async (
        complete: () => void,
        cancel: () => void,
        level: string | undefined
    ) => {
        pendingCancelRef.current = cancel;

        const fail = (message: string) => {
            reverifyFailureRef.current = message;
            pendingCancelRef.current = null;
            cancel();
        };

        const finish = () => {
            pendingCancelRef.current = null;
            complete();
        };

        try {
            if (!session) {
                fail('Unable to verify your session. Please try again.');
                return;
            }

            if (level && level !== 'first_factor') {
                fail('This verification method is not available here.');
                return;
            }

            const verification = await session.startVerification({
                level: 'first_factor',
            });

            if (verification.status === 'complete') {
                finish();
                return;
            }

            const factors = verification.supportedFirstFactors ?? [];
            const password = currentPasswordRef.current;

            // Existing password accounts
            if (password && factors.some((f) => f.strategy === 'password')) {
                try {
                    const result = await session.attemptFirstFactorVerification({
                        strategy: 'password',
                        password,
                    });

                    if (result.status === 'complete') {
                        finish();
                    } else {
                        fail('Unable to verify your current password.');
                    }
                } catch (err) {
                    fail(
                        clerkErrorCode(err) === 'form_password_incorrect'
                            ? 'Your current password is incorrect.'
                            : 'Unable to confirm your identity. Please try again.'
                    );
                }
                return;
            }

            // Accounts without a password: email verification
            const emailFactor = factors.find(
                (f) => f.strategy === 'email_code'
            ) as
                | {
                    strategy: 'email_code';
                    emailAddressId: string;
                    safeIdentifier?: string;
                }
                | undefined;

            if (!emailFactor) {
                fail('Email verification is unavailable for this account.');
                return;
            }

            await session.prepareFirstFactorVerification({
                strategy: 'email_code',
                emailAddressId: emailFactor.emailAddressId,
            });

            setReverifyCode('');
            setReverifyError('');
            setReverifyNotice('');
            setResendSeconds(60);

            setReverify({
                complete,
                cancel,
                email: emailFactor.safeIdentifier || 'your email',
                emailAddressId: emailFactor.emailAddressId,
            });
        } catch (err) {
            console.error('Security verification failed:', err);
            fail('Unable to complete verification. Please try again.');
        }
    };


    const updatePassword = useReverification(
        async (params: { currentPassword?: string; newPassword: string }) => {
            if (!clerkUser) throw new Error('Please sign in again.');

            return clerkUser.updatePassword({
                ...params,
                signOutOfOtherSessions: true,
            });
        },
        {
            onNeedsReverification: ({ complete, cancel, level }) => {
                void handleNeedsReverification(complete, cancel, level);
            },
        }
    );

    const submitReverifyCode = async () => {
        if (!session || !reverify) return;

        const code = reverifyCode.trim();

        if (!/^\d{6}$/.test(code)) {
            setReverifyError('Please enter the six-digit code.');
            return;
        }

        try {
            setReverifyBusy(true);
            setReverifyError('');
            setReverifyNotice('');

            const result = await session.attemptFirstFactorVerification({
                strategy: 'email_code',
                code,
            });

            if (result.status === 'complete') {
                const { complete } = reverify;
                setReverify(null);
                pendingCancelRef.current = null;
                complete();
                return;
            }

            setReverifyError('That code is not correct. Please try again.');
        } catch (err) {
            const code = clerkErrorCode(err);

            setReverifyError(
                code === 'verification_expired'
                    ? 'This code has expired. Please request a new one.'
                    : 'That code is not correct. Please try again.'
            );
        } finally {
            setReverifyBusy(false);
        }
    };


    const resendReverifyCode = async () => {
        if (!session || !reverify) return;

        try {
            setReverifyBusy(true);
            setReverifyError('');

            await session.prepareFirstFactorVerification({
                strategy: 'email_code',
                emailAddressId: reverify.emailAddressId,
            });

            setResendSeconds(60);
            setReverifyNotice('A new code has been sent.');
        } catch (err) {
            console.error('Could not resend security code:', err);
            setReverifyError(
                'Could not send a new code. Please try again in a minute.'
            );
        } finally {
            setReverifyBusy(false);
        }
    };

    const cancelReverify = () => {
        if (!reverify) return;

        const { cancel } = reverify;
        reverifyFailureRef.current = 'Your password was not changed.';
        setReverify(null);
        pendingCancelRef.current = null;
        cancel();
    };

    const save = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (busy || completed) return;

        if (hasPassword && !currentPassword) {
            setError('Please enter your current password.');
            return;
        }

        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }

        if (hasPassword && currentPassword === newPassword) {
            setError('Choose a password different from your current one.');
            return;
        }

        try {
            setBusy(true);
            setError('');

            const passwordWasSet = !hasPassword;

            await updatePassword({
                ...(hasPassword ? { currentPassword } : {}),
                newPassword,
            });


            setCompleted(true);
            setCurrentPassword('');
            currentPasswordRef.current = '';
            setNewPassword('');
            setConfirmPassword('');

            try {
                if (!isConvexConfigured || !convexClient) {
                    throw new Error('Convex is unavailable.');
                }

                await convexClient.mutation(
                    api.users.notifyMyPasswordChanged,
                    { passwordWasSet }
                );
            } catch (notificationError) {
                console.error(
                    'Password updated, but notification failed:',
                    notificationError
                );
                setNotificationWarning(true);
            }

        } catch (err: unknown) {
            if (reverifyFailureRef.current) {
                setError(reverifyFailureRef.current);
                reverifyFailureRef.current = '';
                return;
            }

            const clerkError = err as {

                errors?: { longMessage?: string; message?: string }[];
                message?: string;
            };

            setError(
                clerkError.errors?.[0]?.longMessage ||
                clerkError.errors?.[0]?.message ||
                clerkError.message ||
                'Could not update your password. Please try again.'
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => {
                    if (reverify && !reverifyBusy) {
                        cancelReverify();
                        onClose();
                    } else if (!busy) {
                        onClose();
                    }
                }}
            />


            <div className="relative w-full max-w-md rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#F7F3EC] dark:bg-[#151515] p-6 shadow-2xl">
                <button
                    type="button"
                    onClick={() => {
                        if (reverify && !reverifyBusy) {
                            cancelReverify();
                            onClose();
                        } else if (!busy) {
                            onClose();
                        }
                    }}
                    disabled={reverifyBusy || (busy && !reverify)}
                    aria-label="Close"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF6D6] text-[#D6A10C] dark:bg-[#332B15] dark:text-[#F2C94C]">
                    <Lock className="h-5 w-5" />
                </div>


                <h2 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-white">
                    {reverify
                        ? "Confirm It's You"
                        : completed
                            ? 'Password Updated'
                            : hasPassword
                                ? 'Change Password'
                                : 'Set Password'}
                </h2>



                {reverify ? (
                    <div className="mt-4">
                        <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            To keep your account secure, we sent a 6-digit
                            verification code to{' '}
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                                {reverify.email}
                            </span>.
                        </p>

                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={reverifyCode}
                            onChange={(e) => {
                                setReverifyCode(
                                    e.target.value.replace(/\D/g, '').slice(0, 6)
                                );
                                setReverifyError('');
                            }}
                            placeholder="000000"
                            aria-label="Six-digit verification code"
                            autoFocus
                            disabled={reverifyBusy}
                            className="mt-5 w-full rounded-xl border border-[#D9C5AE] dark:border-[#3A3027] bg-white dark:bg-[#1B1B1B] px-4 py-3 text-center text-lg tracking-widest text-neutral-900 dark:text-white outline-none focus:border-[#D6A10C]"
                        />

                        {reverifyError && (
                            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                                {reverifyError}
                            </p>
                        )}

                        {reverifyNotice && !reverifyError && (
                            <p className="mt-3 text-sm text-green-700 dark:text-green-400">
                                {reverifyNotice}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={cancelReverify}
                                disabled={reverifyBusy}
                                className="flex-1 rounded-xl border border-[#D9C5AE] dark:border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-white disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={submitReverifyCode}
                                disabled={reverifyBusy}
                                className="flex-1 rounded-xl bg-[#B8792B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {reverifyBusy ? 'Checking...' : 'Confirm'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={resendReverifyCode}
                            disabled={reverifyBusy || resendSeconds > 0}
                            className="mt-4 w-full text-center text-sm font-semibold text-[#A77745] dark:text-[#CCA177] disabled:opacity-50"
                        >
                            {resendSeconds > 0
                                ? `Resend code in ${resendSeconds}s`
                                : 'Resend code'}
                        </button>
                    </div>
                ) : completed ? (

                    <div className="mt-4">
                        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                            Your password has been successfully updated.
                        </p>

                        {notificationWarning && (
                            <p className="mt-3 text-sm text-amber-700 dark:text-amber-400">
                                Your password was updated, but the System notification could not be created.
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-6 w-full rounded-xl bg-[#B8792B] px-4 py-3 text-sm font-semibold text-white"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={save} className="mt-4">
                        <p className="text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                            {hasPassword
                                ? 'Enter your current password and choose a new one.'
                                : 'Add a password so you can also sign in using your email and password.'}
                        </p>

                        <div className="mt-5 space-y-4">
                            {hasPassword && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                        Current Password
                                    </label>

                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            value={currentPassword}

                                            onChange={(e) => {
                                                setCurrentPassword(e.target.value);
                                                currentPasswordRef.current = e.target.value;
                                                setError('');
                                            }}

                                            disabled={busy}
                                            className="w-full rounded-xl border border-[#D9C5AE] dark:border-[#3A3027] bg-white dark:bg-[#1B1B1B] px-4 pr-12 py-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-[#D6A10C]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            disabled={busy}
                                            aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-500 dark:text-neutral-400 hover:text-[#D6A10C] dark:hover:text-[#F2C94C]"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setError('');
                                        }}
                                        disabled={busy}
                                        className="w-full rounded-xl border border-[#D9C5AE] dark:border-[#3A3027] bg-white dark:bg-[#1B1B1B] px-4 pr-12 py-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-[#D6A10C]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        disabled={busy}
                                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-500 dark:text-neutral-400 hover:text-[#D6A10C] dark:hover:text-[#F2C94C]"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>



                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                                    Confirm New Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setError('');
                                        }}
                                        disabled={busy}
                                        className="w-full rounded-xl border border-[#D9C5AE] dark:border-[#3A3027] bg-white dark:bg-[#1B1B1B] px-4 pr-12 py-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-[#D6A10C]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={busy}
                                        aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-neutral-500 dark:text-neutral-400 hover:text-[#D6A10C] dark:hover:text-[#F2C94C]"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                            </div>
                        </div>

                        {error && (
                            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={busy}
                                className="flex-1 rounded-xl border border-[#D9C5AE] dark:border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-800 dark:text-white disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={busy}
                                className="flex-1 rounded-xl bg-[#B8792B] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {busy
                                    ? 'Saving...'
                                    : hasPassword
                                        ? 'Change Password'
                                        : 'Set Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export const AccountSecurityModals: React.FC<
    AccountSecurityModalsProps
> = ({
    active,
    onClose,
    contactEmail = '',
    onContactEmailSaved,
    currentPhone = '',
    onPhoneSaved,
}) => {
        if (active === 'email') {
            return (
                <ContactEmailModal
                    onClose={onClose}
                    currentContactEmail={contactEmail}
                    onSaved={onContactEmailSaved}
                />
            );
        }

        if (active === 'phone') {
            return (
                <PhoneNumberModal
                    onClose={onClose}
                    currentPhone={currentPhone}
                    onSaved={onPhoneSaved}
                />
            );
        }
        if (active === 'password') {
            return <PasswordModal onClose={onClose} />;
        }
        return null;
    };
