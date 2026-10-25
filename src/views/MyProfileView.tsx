
import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    User,
    HardHat,
    Briefcase,
    Users,
    Building2,
    Building,
    ShieldCheck,
    ChevronDown,
    Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../../convex/_generated/api';
import { convexClient, isConvexConfigured } from '../lib/convex';
import type { ListerSubtype } from '../types';

const LISTER_ROLES = [
    {
        title: 'Landlord / Property Owner',
        icon: User,
        color: '#B8895E',
        background: 'rgba(184,137,94,0.12)',
    },
    {
        title: 'Caretaker',
        icon: HardHat,
        color: '#438D80',
        background: 'rgba(67,141,128,0.12)',
    },
    {
        title: 'Property Manager',
        icon: Briefcase,
        color: '#547AB0',
        background: 'rgba(84,122,176,0.12)',
    },
    {
        title: 'Real Estate Agent',
        icon: Users,
        color: '#8E70AB',
        background: 'rgba(142,112,171,0.12)',
    },
    {
        title: 'Property Agency',
        icon: Building2,
        color: '#BD8550',
        background: 'rgba(189,133,80,0.12)',
    },
    {
        title: 'Property Company',
        icon: Building,
        color: '#718397',
        background: 'rgba(113,131,151,0.12)',
    },
    {
        title: 'Property Developer',
        icon: ShieldCheck,
        color: '#B07A87',
        background: 'rgba(176,122,135,0.12)',
    },
] as const;

export const MyProfileView: React.FC = () => {
    const { currentUser, setCurrentView, setCurrentUser } = useApp();

    const [selectedRole, setSelectedRole] = useState(
        currentUser?.listerSubtype || 'Landlord / Property Owner'
    );
    const [about, setAbout] = useState(currentUser?.bio ?? '');
    const [roleOpen, setRoleOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [saveError, setSaveError] = useState('');
    useEffect(() => {
        if (currentUser?.listerSubtype) {
            setSelectedRole(currentUser.listerSubtype);
        }

        setAbout(currentUser?.bio ?? '');
    }, [currentUser?.listerSubtype, currentUser?.bio]);
    const activeRole =
        LISTER_ROLES.find((role) => role.title === selectedRole) ||
        LISTER_ROLES[0];

    const ActiveIcon = activeRole.icon;
    const handleSave = async () => {
        if (!currentUser || currentUser.role !== 'lister') {
            setSaveError('Only listers can update this profile.');
            return;
        }

        setSaveMessage('');
        setSaveError('');
        setIsSaving(true);

        try {
            if (!isConvexConfigured || !convexClient) {
                throw new Error('Convex is not connected.');
            }

            const result = await convexClient.mutation(
                api.users.updateListerProfile,
                {
                    listerSubtype: selectedRole as ListerSubtype,
                    bio: about,
                }
            );

            setCurrentUser({
                ...currentUser,
                listerSubtype: result.listerSubtype,
                bio: result.bio,
            });

            setAbout(result.bio);
            setSaveMessage('Profile updated successfully.');
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : 'Unable to save your profile. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--rentike-bg)] text-neutral-950 dark:text-white pb-24">
            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">

                {/* Navigation */}
                <button
                    type="button"
                    onClick={() => setCurrentView('profile')}
                    className="mb-7 flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-[#B8895E] dark:text-neutral-300"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                {/* Heading */}
                <div className="mb-8">
                    <h1 className="font-editorial text-3xl sm:text-4xl text-neutral-950 dark:text-white">
                        My <span className="text-[#B8895E]">Profile</span>
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                        Manage the information seekers see about you.
                    </p>
                </div>

                {/* Role Selection */}
                <section className="mb-5 rounded-3xl border border-[#E7DED2] bg-[#F7F3EC] p-5 shadow-[6px_8px_18px_rgba(0,0,0,0.08)] sm:p-7 dark:border-neutral-800 dark:bg-[#151515]">
                    <h2 className="text-base font-semibold">
                        Role
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                        Choose how you would like to appear on your public profile.
                    </p>

                    <div className="relative mt-5">
                        <button
                            type="button"
                            onClick={() => setRoleOpen(!roleOpen)}
                            aria-expanded={roleOpen}
                            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E7DED2] bg-[#FAF8F4] p-3 text-left transition-colors hover:border-[#B8895E] sm:p-4 dark:border-neutral-700 dark:bg-[#202020]"
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                    style={{ backgroundColor: activeRole.background }}
                                >
                                    <ActiveIcon
                                        className="h-5 w-5"
                                        style={{ color: activeRole.color }}
                                    />
                                </div>
                                <span className="text-sm font-medium">
                                    {activeRole.title}
                                </span>
                            </div>

                            <ChevronDown
                                className={`h-4 w-4 shrink-0 text-[#B8895E] transition-transform ${roleOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {roleOpen && (
                            <div className="mt-2 overflow-hidden rounded-2xl border border-[#E7DED2] bg-[#FAF8F4] p-2 shadow-lg dark:border-neutral-700 dark:bg-[#202020]">
                                {LISTER_ROLES.map((role) => {
                                    const RoleIcon = role.icon;
                                    const isSelected = selectedRole === role.title;

                                    return (
                                        <button
                                            key={role.title}
                                            type="button"
                                            onClick={() => {
                                                setSelectedRole(role.title);
                                                setRoleOpen(false);
                                            }}
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${isSelected
                                                ? 'bg-[#B8895E]/10'
                                                : ''
                                                }`}
                                        >
                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                                                style={{ backgroundColor: role.background }}
                                            >
                                                <RoleIcon
                                                    className="h-5 w-5"
                                                    style={{ color: role.color }}
                                                />
                                            </div>

                                            <span className="min-w-0 flex-1 text-sm font-medium">
                                                {role.title}
                                            </span>

                                            {isSelected && (
                                                <span className="h-2 w-2 shrink-0 rounded-full bg-[#B8895E]" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* About Me */}
                <section className="rounded-3xl border border-[#E7DED2] bg-[#F7F3EC] p-5 shadow-[6px_8px_18px_rgba(0,0,0,0.08)] sm:p-7 dark:border-neutral-800 dark:bg-[#151515]">
                    <h2 className="text-base font-semibold">
                        About Me
                    </h2>

                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                        Tell seekers a bit about yourself and the properties you manage.
                    </p>

                    <textarea
                        value={about}
                        onChange={(event) => setAbout(event.target.value)}
                        maxLength={500}
                        rows={6}
                        placeholder="Write a short introduction about yourself and the rental properties you manage..."
                        className="mt-5 w-full resize-y rounded-2xl border border-[#E7DED2] bg-[#FAF8F4] p-4 text-sm leading-relaxed text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-[#B8895E] dark:border-neutral-700 dark:bg-[#202020] dark:text-white dark:placeholder:text-neutral-500"
                    />

                    <p className="mt-2 text-right text-xs text-neutral-400">
                        {about.length}/500
                    </p>

                    <div className="mt-5">
                        {saveError && (
                            <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
                                {saveError}
                            </p>
                        )}

                        {saveMessage && (
                            <p role="status" className="mb-3 text-sm text-green-700 dark:text-green-400">
                                {saveMessage}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#B8895E] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#A67950] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
};

export default MyProfileView;
