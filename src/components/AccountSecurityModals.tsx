
import React, { useState } from 'react';
import { useUser } from '@clerk/react';
import { Mail, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { convexClient, isConvexConfigured } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export type AccountSecurityModal = 'email' | null;

interface AccountSecurityModalsProps {
    active: AccountSecurityModal;
    onClose: () => void;
    contactEmail?: string;
    onContactEmailSaved?: (email: string) => void;
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
    const [error, setError] = useState('');

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

            const saved = await convexClient.mutation(
                api.users.updateMyContactEmail,
                { email: cleaned }
            );

            onSaved?.(saved);
            onClose();
        } catch (err) {
            console.error('Failed to save contact email:', err);
            setError('Could not save your contact email. Please try again.');
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
                        disabled={busy}
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
                                disabled={busy}
                                className="mt-2 text-xs font-semibold text-[#A77745] dark:text-[#CCA177] break-all text-left"
                            >
                                Use my login email ({loginEmail})
                            </button>
                        )}

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
                            onClick={() => save(email)}
                            disabled={busy}
                            className="flex-1 rounded-xl bg-[#B8792B] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                            {busy ? 'Saving...' : 'Save'}
                        </button>
                    </div>

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

export const AccountSecurityModals: React.FC<
    AccountSecurityModalsProps
> = ({
    active,
    onClose,
    contactEmail = '',
    onContactEmailSaved,
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

        return null;
    };
