
import React, { useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Building,
    Building2,
    Briefcase,
    HardHat,
    ShieldCheck,
    User,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useApp } from '../context/AppContext';
import type { ListerSubtype } from '../types';

const roleStyles: Record<
    ListerSubtype,
    { Icon: LucideIcon; color: string }
> = {
    'Landlord / Property Owner': {
        Icon: User,
        color: '#B8895E',
    },
    'Caretaker': {
        Icon: HardHat,
        color: '#438D80',
    },
    'Property Manager': {
        Icon: Briefcase,
        color: '#547AB0',
    },
    'Real Estate Agent': {
        Icon: Users,
        color: '#8E70AB',
    },
    'Property Agency': {
        Icon: Building2,
        color: '#BD8550',
    },
    'Property Company': {
        Icon: Building,
        color: '#718397',
    },
    'Property Developer': {
        Icon: ShieldCheck,
        color: '#B07A87',
    },
};

export const ListerAboutView: React.FC = () => {
    const { currentUser, setCurrentUser, setCurrentView, resolvedTheme } = useApp();

    const isDark = resolvedTheme === 'dark';
    const [bio, setBio] = useState(currentUser?.bio ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const updateListerProfile = useMutation(api.users.updateListerProfile);

    const subtype = currentUser?.listerSubtype as ListerSubtype | undefined;
    const roleStyle = subtype ? roleStyles[subtype] : undefined;
    const RoleIcon = roleStyle?.Icon;

    const handleContinue = async () => {
        if (isSaving) return;

        setError('');

        if (!currentUser || currentUser.role !== 'lister' || !subtype) {
            setError('Your lister profile is unavailable. Please try again.');
            return;
        }

        const trimmedBio = bio.trim();

        if (!trimmedBio) {
            setCurrentView('lister-dashboard');
            return;
        }

        try {
            setIsSaving(true);

            await updateListerProfile({
                listerSubtype: subtype,
                bio: trimmedBio,
            });

            setCurrentUser({
                ...currentUser,
                bio: trimmedBio,
            });

            setCurrentView('lister-dashboard');
        } catch (err) {
            console.error('Failed to save lister bio:', err);
            setError('Unable to save your introduction. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = () => {
        if (isSaving) return;
        setCurrentView('lister-dashboard');
    };

    return (
        <main
            className={`min-h-[100dvh] w-full px-5 py-6 sm:px-8 sm:py-10 ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-950'
                }`}
        >

            <div
                className={`mx-auto flex w-full max-w-[780px] flex-col rounded-[28px] border px-6 py-8 sm:px-10 sm:py-10 ${isDark
                    ? 'border-[#7A5B3C] bg-[#111111]'
                    : 'border-[#E5C8A6] bg-[#FFFCF8]'
                    }`}
            >


                {/* Header */}
                <header className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrentView('lister-subtype')}
                        className="flex items-center gap-2 text-sm font-medium"
                    >
                        <ArrowLeft size={19} />
                        <span>Lister Setup</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleSkip}
                        disabled={isSaving}
                        className="text-sm font-semibold hover:underline disabled:opacity-50"
                        style={{ color: '#C49A6C' }}
                    >
                        Skip for now
                    </button>
                </header>

                {/* Main content */}
                <section className="mt-12 sm:mt-16">
                    <h1
                        className="font-editorial text-4xl sm:text-5xl font-normal leading-tight"
                        style={{
                            fontFamily:
                                "'Cormorant Garamond', Georgia, serif",
                        }}
                    >
                        Introduce Yourself
                    </h1>

                    <p
                        className={`mt-3 text-sm sm:text-base ${isDark ? 'text-neutral-400' : 'text-neutral-600'
                            }`}
                    >
                        Help potential tenants get to know you.
                    </p>

                    {/* Selected role */}
                    {subtype && roleStyle && RoleIcon && (
                        <div
                            className="mt-8 inline-flex items-center gap-3 rounded-2xl border px-4 py-3"
                            style={{
                                borderColor: `${roleStyle.color}70`,
                                backgroundColor: isDark ? '#171717' : '#FCFAF7',
                            }}
                        >
                            <RoleIcon
                                size={21}
                                strokeWidth={2}
                                style={{ color: roleStyle.color }}
                            />
                            <span className="text-sm font-semibold">
                                {subtype}
                            </span>
                        </div>
                    )}

                    {/* About You */}
                    <div className="mt-10">
                        <label
                            htmlFor="lister-about"
                            className="block text-base font-semibold mb-3"
                        >
                            About You
                        </label>

                        <textarea
                            id="lister-about"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={500}
                            rows={6}
                            placeholder="Share a little about yourself, your experience, and the properties you manage..."
                            className={`w-full resize-none rounded-2xl border p-4 text-sm sm:text-base leading-relaxed outline-none transition-colors focus:border-[#C49A6C] ${isDark
                                ? 'bg-[#171717] border-neutral-700 text-white placeholder:text-neutral-500'
                                : 'bg-[#FCFAF7] border-neutral-300 text-neutral-950 placeholder:text-neutral-400'
                                }`}
                        />

                        {error && (
                            <p className="mt-3 text-sm text-red-500">
                                {error}
                            </p>
                        )}
                    </div>
                </section>

                {/* Continue */}
                <div className="mt-auto pt-10 pb-4">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={isSaving}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                        style={{
                            backgroundColor: '#C49A6C',
                            color: '#111111',
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Continue'}
                        {!isSaving && <ArrowRight size={20} />}
                    </button>
                </div>
            </div>
        </main>
    );
};
