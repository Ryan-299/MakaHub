import React, { useState } from 'react';
import { BedDouble, Bath, Building, Check, Users } from 'lucide-react';
import type { BnbDetails } from '../types';
import { BnbBookingCard, type BnbBookingRequest } from './BnbBookingCard';

// ---------------------------------------------------------------------------
// BnBs with several room types (e.g. Standard and Deluxe): the guest picks a
// room, and the Check Dates card below shows THAT room's price, guests,
// dates, minimum/maximum nights and booked nights.
// Matches bnbUnitTypeValidator in convex/validators.ts.
// ---------------------------------------------------------------------------

export type BnbRoomType = {
    id: string;
    name: string;
    pricePerNight: number;
    cleaningFee?: number;
    maxGuests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    unitCount?: number;
    blockedDates?: string[];
    accepting?: boolean;
    availableFrom?: string;
    hostingDurationNights?: number;
    openEnded?: boolean;
    minNights?: number;
    maxNights?: number;
};

// Fields the shared BnbDetails type doesn't list yet.
type BnbWithRooms = BnbDetails & {
    unitTypes?: BnbRoomType[];
    buildingAccepting?: boolean;
    openEnded?: boolean;
};

/** The room types of a BnB (empty for a single-price BnB). */
export const bnbRoomTypes = (bnb: BnbDetails | undefined): BnbRoomType[] =>
    (bnb as BnbWithRooms | undefined)?.unitTypes ?? [];

/** One room type shown as if it were its own BnB, for the Check Dates card. */
export const roomAsBnb = (bnb: BnbDetails, room: BnbRoomType): BnbDetails => {
    const building = bnb as BnbWithRooms;
    const ownDates = room.availableFrom !== undefined;
    const ownStay = room.minNights !== undefined;
    const buildingOn = building.buildingAccepting ?? building.accepting;

    const details: BnbWithRooms = {
        ...building,
        pricePerNight: room.pricePerNight,
        cleaningFee: room.cleaningFee,
        maxGuests: room.maxGuests,
        bedrooms: room.bedrooms,
        beds: room.beds,
        bathrooms: room.bathrooms,
        availableFrom: ownDates ? room.availableFrom : building.availableFrom,
        hostingDurationNights: ownDates ? room.hostingDurationNights : building.hostingDurationNights,
        openEnded: ownDates ? room.openEnded === true : building.openEnded,
        minNights: ownStay ? room.minNights : building.minNights,
        maxNights: ownStay ? room.maxNights : building.maxNights,
        blockedDates: room.blockedDates ?? [],
        accepting: buildingOn !== false && room.accepting !== false,
        unitTypes: undefined,
    };

    return details;
};

const plural = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`;

const cardClass =
    'bg-[#F7F3EC] dark:bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)] space-y-4';

type BnbRoomChooserProps = {
    bnb: BnbDetails;
    propertyName: string;
    hostName: string;
    isOwner: boolean;
    onAskHost: (request: BnbBookingRequest) => Promise<void>;
};

export const BnbRoomChooser: React.FC<BnbRoomChooserProps> = ({
    bnb,
    propertyName,
    hostName,
    isOwner,
    onAskHost,
}) => {
    const rooms = bnbRoomTypes(bnb);
    const bookable = (room: BnbRoomType) => roomAsBnb(bnb, room).accepting;

    // Start with the first room that is taking bookings.
    const [selectedId, setSelectedId] = useState<string | null>(
        () => (rooms.find(bookable) ?? rooms[0])?.id ?? null
    );
    const selected = rooms.find((room) => room.id === selectedId) ?? rooms[0];

    if (!selected) return null;

    return (
        <>
            <section className={cardClass}>
                <div>
                    <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold tracking-tight">
                        <span className="text-neutral-950 dark:text-[#F5F5F5]">Choose </span>
                        <span className="text-[var(--rentike-bronze)]">Your Room</span>
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-[#8A8A8A]">
                        {plural(rooms.length, 'room type', 'room types')}. Tap one to see its dates and price.
                    </p>
                </div>

                <div className="space-y-3">
                    {rooms.map((room) => {
                        const isSelected = room.id === selected.id;
                        const open = bookable(room);
                        const minNights = room.minNights ?? bnb.minNights ?? 1;

                        return (
                            <button
                                key={room.id}
                                type="button"
                                onClick={() => setSelectedId(room.id)}
                                aria-pressed={isSelected}
                                className={`w-full text-left rounded-2xl border p-4 transition-colors cursor-pointer ${isSelected
                                    ? 'border-2 border-[var(--rentike-bronze)] bg-[#F2E7D8] dark:bg-[#24201C]'
                                    : 'border-[#E7DED2] dark:border-neutral-800 bg-[#FBF8F2] dark:bg-[#1B1B1B] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C]'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-base font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                                            {room.name}
                                        </p>
                                        <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
                                            <strong className="font-semibold">KSh {room.pricePerNight.toLocaleString()}</strong>
                                            <span className="text-xs text-neutral-500 dark:text-[#8A8A8A]"> / night</span>
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${isSelected
                                            ? 'bg-[var(--rentike-bronze)] border-[var(--rentike-bronze)] text-white'
                                            : 'border-[#D9CBB8] dark:border-neutral-600'
                                            }`}
                                    >
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                                    <span className="inline-flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5 text-[var(--rentike-bronze)]" />
                                        {plural(room.maxGuests, 'guest', 'guests')}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Building className="w-3.5 h-3.5 text-[var(--rentike-bronze)]" />
                                        {plural(room.bedrooms, 'bedroom', 'bedrooms')}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <BedDouble className="w-3.5 h-3.5 text-[var(--rentike-bronze)]" />
                                        {plural(room.beds, 'bed', 'beds')}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Bath className="w-3.5 h-3.5 text-[var(--rentike-bronze)]" />
                                        {plural(room.bathrooms, 'bathroom', 'bathrooms')}
                                    </span>
                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                                    {minNights > 1 && (
                                        <span className="text-neutral-500 dark:text-[#8A8A8A]">
                                            Minimum {minNights} nights
                                        </span>
                                    )}
                                    {(room.unitCount ?? 1) > 1 && (
                                        <span className="text-neutral-500 dark:text-[#8A8A8A]">
                                            {room.unitCount} rooms like this
                                        </span>
                                    )}
                                    {!open && (
                                        <span className="font-semibold text-red-600 dark:text-red-400">
                                            Not taking bookings
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Check Dates for the chosen room (starts fresh when the room changes) */}
            <BnbBookingCard
                key={selected.id}
                bnb={roomAsBnb(bnb, selected)}
                propertyName={`${propertyName} · ${selected.name}`}
                hostName={hostName}
                isOwner={isOwner}
                onAskHost={onAskHost}
            />
        </>
    );
};
