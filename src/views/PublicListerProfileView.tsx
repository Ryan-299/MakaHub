import React from 'react';
import { useQuery } from 'convex/react';
import { ArrowLeft } from 'lucide-react';

import { api } from '../../convex/_generated/api';
import { useApp } from '../context/AppContext';

export const PublicListerProfileView: React.FC = () => {
    const {
        selectedListerId,
        selectedPropertyId,
        setSelectedPropertyId,
        setCurrentView,
        properties,
    } = useApp();

    const listerProperties = properties.filter(
        (property) =>
            property.lister?.id === selectedListerId &&
            property.status === 'Approved' &&
            property.vacancies > 0
    );

    const openProperty = (propertyId: string) => {
        setSelectedPropertyId(propertyId);
        setCurrentView('property-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const profile = useQuery(
        api.users.getPublicListerProfile,
        selectedListerId ? { userId: selectedListerId } : 'skip'
    );

    return (
        <div className="min-h-screen bg-[#F7F3EC] px-4 py-8 text-neutral-900 dark:bg-[#151515] dark:text-white">
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() => setCurrentView('property-detail')}
                    className="mb-6 flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Property
                </button>

                {!selectedListerId || profile === null ? (
                    <p className="text-sm text-neutral-500">
                        This lister profile is unavailable.
                    </p>
                ) : profile === undefined ? (
                    <p className="text-sm text-neutral-500">
                        Loading lister profile...
                    </p>
                ) : (
                    <div className="min-w-0">
                        <div className="rounded-3xl border border-[#E7DED2] bg-[#F8F3EB] p-4 sm:p-6 dark:border-neutral-800 dark:bg-[#202020]">
                            <div className="flex items-center gap-4">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt=""
                                        className="h-16 w-16 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#E7DED2] text-2xl font-semibold text-neutral-700">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <h1 className="text-xl font-semibold">{profile.name}</h1>
                                    <p className="mt-1 text-sm text-[#B8895E]">
                                        {profile.listerSubtype}
                                    </p>
                                </div>
                            </div>

                            {profile.bio?.trim() && (
                                <div className="mt-6 border-t border-[#E7DED2] pt-5 dark:border-neutral-700">
                                    <h2 className="mb-2 text-base font-semibold">About</h2>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-5 min-w-0 rounded-3xl border border-[#E7DED2] bg-[#F8F3EB] p-4 sm:p-6 dark:border-neutral-800 dark:bg-[#202020]">
                            <div className="mb-5">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Available Properties
                                </h2>
                                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                    {listerProperties.length} available {listerProperties.length === 1 ? 'property' : 'properties'}
                                </p>
                            </div>

                            {listerProperties.length === 0 ? (
                                <p className="rounded-2xl border border-[#E7DED2] p-5 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                    This lister has no available properties at the moment.
                                </p>
                            ) : (<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 overscroll-x-contain md:grid md:grid-cols-2 md:overflow-visible md:pb-0">

                                {listerProperties.map((listing) => (
                                    <button
                                        key={listing.id}
                                        type="button"
                                        onClick={() => openProperty(listing.id)}
                                        className="w-[83%] flex-none snap-start overflow-hidden rounded-2xl border border-[#E7DED2] bg-white text-left transition-shadow hover:shadow-lg dark:border-neutral-700 dark:bg-[#242424] md:w-auto md:min-w-0"
                                    >
                                        <div className="aspect-[16/10] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                                            {listing.coverPhoto || listing.images?.[0] ? (
                                                <img
                                                    src={listing.coverPhoto || listing.images[0]}
                                                    alt={listing.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                                                    No photo available
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 p-4">
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                {listing.name}
                                            </h3>

                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {listing.type} · {listing.location.estate}
                                            </p>

                                            <p className="text-base font-semibold text-neutral-900 dark:text-white">
                                                KSh {listing.monthlyRent.toLocaleString()}
                                                <span className="ml-1 text-xs font-normal text-neutral-500">
                                                    / month
                                                </span>
                                            </p>

                                            <p className="text-xs font-medium text-[#B8895E]">
                                                {listing.vacancies} {listing.vacancies === 1 ? 'unit' : 'units'} available
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};