import React from 'react';
import {
    BedDouble,
    Users,
    Bath,
    MapPin,
    ImageOff,
    ShieldCheck,
    Heart,
} from 'lucide-react';
import type { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';
import {
    resolvePropertyCoordinates,
    calculateDistanceInKm,
} from '../utils/kenyaGeocoding';

interface BnbCardProps {
    property: PropertyListing;
    onOpen: () => void;
}

export const BnbCard: React.FC<BnbCardProps> = ({
    property,
    onOpen,
}) => {
    const {
        seekerLocation,
        isPropertySaved,
        toggleSaveProperty,
    } = useApp();

    const isSaved = isPropertySaved(property.id);

    const distanceKm = React.useMemo(() => {
        if (!seekerLocation) return null;

        const { lat, lng } = resolvePropertyCoordinates(property.location);

        return calculateDistanceInKm(
            seekerLocation.lat,
            seekerLocation.lng,
            lat,
            lng
        );
    }, [seekerLocation, property.location]);
    const bnb = property.bnb;
    const coverImage = property.coverPhoto || property.images?.[0];

    // BnBs with several room types: the price shown is the cheapest room.
    const roomTypeCount =
        (bnb as { unitTypes?: unknown[] } | undefined)?.unitTypes?.length ?? 0;

    const hasPrice =
        typeof bnb?.pricePerNight === 'number' &&
        Number.isFinite(bnb.pricePerNight) &&
        bnb.pricePerNight > 0;

    return (

        <div className="relative block w-full overflow-hidden rounded-2xl border border-[#E2D3C2] bg-[#F8F3EB] text-left shadow-sm transition-shadow hover:shadow-lg dark:border-[#38312A] dark:bg-[#1E1E1E]">
            <button
                type="button"
                onClick={onOpen}
                aria-label={`View ${property.name}`}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer"
            />

            {/* Cover photo */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={property.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
                        <ImageOff className="h-8 w-8" />
                        <span className="text-xs">No photo available</span>
                    </div>
                )}
                <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white shadow-sm pointer-events-none">
                    <BedDouble className="h-3.5 w-3.5" />
                    BnB
                </span>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveProperty(property.id);
                    }}
                    aria-label={isSaved ? 'Remove from saved' : 'Save BnB'}
                    className={`absolute top-3 right-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-neutral-200 shadow-md transition-all ${isSaved
                        ? 'bg-white text-red-500'
                        : 'bg-white/90 text-neutral-700 hover:bg-white'
                        }`}
                >
                    <Heart
                        className={`h-4 w-4 ${isSaved
                            ? 'fill-red-500 text-red-500'
                            : 'text-neutral-700'
                            }`}
                    />
                </button>


                {distanceKm !== null && Number.isFinite(distanceKm) && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        {distanceKm.toFixed(1)} km
                    </span>
                )}

            </div>

            {/* Property information */}
            <div className="space-y-3 p-4">
                <div className="space-y-1">
                    <h3 className="truncate text-base font-bold text-neutral-900 dark:text-white">
                        {property.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                            {property.location.estate}, {property.location.county}
                            {distanceKm !== null && Number.isFinite(distanceKm) &&
                                ` · ${distanceKm.toFixed(1)} km away`}
                        </span>
                    </div>
                </div>

                {/* Price per night */}
                <div className="flex items-baseline gap-1">
                    {hasPrice ? (
                        <>
                            {roomTypeCount > 0 && (
                                <span className="text-xs text-neutral-500">From</span>
                            )}
                            <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                KSh {bnb!.pricePerNight.toLocaleString()}
                            </span>
                            <span className="text-xs text-neutral-500">
                                / night
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-neutral-500">
                            Price unavailable
                        </span>
                    )}
                </div>

                {/* Guest capacity */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                    {bnb && (
                        <>
                            <span className="inline-flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {bnb.maxGuests} guests
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <BedDouble className="h-4 w-4" />
                                {bnb.bedrooms} bedrooms
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <Bath className="h-4 w-4" />
                                {bnb.bathrooms} bathrooms
                            </span>

                            {roomTypeCount > 0 && (
                                <span className="inline-flex items-center gap-1 font-semibold text-[#2563EB]">
                                    <BedDouble className="h-4 w-4" />
                                    {roomTypeCount} room types
                                </span>
                            )}
                        </>
                    )}
                </div>

                <div className="border-t border-[#E2D3C2] pt-3 dark:border-[#38312A]">
                    <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${bnb?.accepting
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-neutral-500'
                            }`}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        {bnb?.accepting
                            ? 'Accepting booking requests'
                            : 'Booking requests paused'}
                    </span>
                </div>
            </div>
        </div>
    );
};