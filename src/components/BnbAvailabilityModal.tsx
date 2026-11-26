import React, { useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { PropertyListing } from '../types';
import { formatDay, kenyaToday, readSchedule, toDayNumber } from './BnbBookingCard';
import { bnbRoomTypes, roomAsBnb } from './BnbRoomChooser';

// ---------------------------------------------------------------------------
// BnB "Update Availability" for the host: pause/resume bookings and block or
// unblock nights. Saves through convex/properties.ts -> updateBnbAvailability.
// Each date stands for the NIGHT that starts on it (same as the guest calendar).
// BnBs with room types: the top switch pauses/resumes the whole BnB, and each
// room type has its own switch and calendar (pick the room with the tabs).
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dayDate = (day: number) => new Date(day * DAY_MS);
const toDateString = (day: number) => dayDate(day).toISOString().slice(0, 10);

// Upcoming blocked nights as day numbers (past nights no longer matter).
const upcomingBlocked = (dates: string[] | undefined, today: number) => {
    const set = new Set<number>();
    for (const date of dates ?? []) {
        const day = toDayNumber(date);
        if (day !== null && day >= today) set.add(day);
    }
    return set;
};

const sameNights = (a: Set<number>, b: Set<number>) =>
    a.size === b.size && [...a].every((day) => b.has(day));

type RoomEdit = { accepting: boolean; blocked: Set<number> };

interface BnbAvailabilityModalProps {
    property: PropertyListing;
    onClose: () => void;
}

export const BnbAvailabilityModal: React.FC<BnbAvailabilityModalProps> = ({ property, onClose }) => {
    const updateBnbAvailability = useMutation(api.properties.updateBnbAvailability);
    const bnb = property.bnb;
    const today = kenyaToday();
    const rooms = bnbRoomTypes(bnb);
    const hasRooms = rooms.length > 0;

    // With room types this is the whole-BnB switch (stored separately from
    // each room type's own switch).
    const startAccepting =
        (bnb as { buildingAccepting?: boolean } | undefined)?.buildingAccepting ?? bnb?.accepting ?? true;
    const [accepting, setAccepting] = useState<boolean>(startAccepting);

    // Single-price BnB: its calendar. Only nights from today onwards.
    const [buildingBlocked, setBuildingBlocked] = useState<Set<number>>(() =>
        upcomingBlocked(bnb?.blockedDates, today)
    );

    // Room types: each one's own switch and calendar, kept while switching tabs.
    const [roomId, setRoomId] = useState<string | null>(rooms[0]?.id ?? null);
    const [roomEdits, setRoomEdits] = useState<Record<string, RoomEdit>>(() =>
        Object.fromEntries(
            rooms.map((room) => [
                room.id,
                { accepting: room.accepting !== false, blocked: upcomingBlocked(room.blockedDates, today) },
            ])
        )
    );
    const room = rooms.find((item) => item.id === roomId) ?? rooms[0];

    const schedule = useMemo(
        () =>
            bnb
                ? readSchedule({ ...(room ? roomAsBnb(bnb, room) : bnb), blockedDates: [] }, today)
                : null,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [bnb?.availableFrom, bnb?.hostingDurationNights, room?.id, today]
    );

    const blocked = room ? roomEdits[room.id].blocked : buildingBlocked;
    const setBlocked = (update: (prev: Set<number>) => Set<number>) => {
        if (room) {
            setRoomEdits((prev) => ({
                ...prev,
                [room.id]: { ...prev[room.id], blocked: update(prev[room.id].blocked) },
            }));
        } else {
            setBuildingBlocked(update);
        }
    };

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startMonth = (() => {
        const d = dayDate(schedule ? schedule.firstBookable : today);
        return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    })();
    const endMonth = (() => {
        const d = dayDate(schedule ? schedule.lastNight : today);
        return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    })();
    const [viewMonth, setViewMonth] = useState(startMonth);

    // Switching room tabs: show that room's first month.
    const chooseRoom = (id: string) => {
        const next = rooms.find((item) => item.id === id);
        if (!bnb || !next) return;
        setRoomId(id);
        setError(null);
        const nextSchedule = readSchedule({ ...roomAsBnb(bnb, next), blockedDates: [] }, today);
        const d = dayDate(nextSchedule ? nextSchedule.firstBookable : today);
        setViewMonth({ year: d.getUTCFullYear(), month: d.getUTCMonth() });
    };

    const periodEnded = !schedule || today > schedule.lastNight;
    const canEditNight = (day: number) =>
        !!schedule && day >= schedule.firstBookable && day <= schedule.lastNight;

    const toggleNight = (day: number) => {
        if (!canEditNight(day)) return;
        setError(null);
        setBlocked((prev) => {
            const next = new Set(prev);
            if (next.has(day)) next.delete(day);
            else next.add(day);
            return next;
        });
    };

    const openNights = schedule
        ? schedule.lastNight - schedule.firstBookable + 1 - [...blocked].filter(canEditNight).length
        : 0;

    const handleSave = async () => {
        if (saving || !bnb) return;
        setSaving(true);
        setError(null);
        try {
            if (hasRooms) {
                // Save each room type the host changed, then the whole-BnB switch.
                for (const item of rooms) {
                    const edit = roomEdits[item.id];
                    const original = {
                        accepting: item.accepting !== false,
                        blocked: upcomingBlocked(item.blockedDates, today),
                    };
                    const itemSchedule = readSchedule({ ...roomAsBnb(bnb, item), blockedDates: [] }, today);
                    const inPeriod = (day: number) =>
                        !!itemSchedule && day >= itemSchedule.firstBookable && day <= itemSchedule.lastNight;
                    const nightsChanged = !sameNights(edit.blocked, original.blocked);

                    if (edit.accepting === original.accepting && !nightsChanged) continue;

                    await updateBnbAvailability({
                        id: property.id as Id<'properties'>,
                        unitTypeId: item.id,
                        accepting: edit.accepting,
                        ...(nightsChanged && itemSchedule
                            ? {
                                blockedDates: [...edit.blocked]
                                    .filter(inPeriod)
                                    .sort((a, b) => a - b)
                                    .map(toDateString),
                            }
                            : {}),
                    });
                }

                if (accepting !== startAccepting) {
                    await updateBnbAvailability({ id: property.id as Id<'properties'>, accepting });
                }

                onClose();
                return;
            }

            const blockedDates = [...blocked]
                .filter(canEditNight)
                .sort((a, b) => a - b)
                .map(toDateString);
            await updateBnbAvailability({
                id: property.id as Id<'properties'>,
                accepting,
                // When the period has ended there are no nights to change.
                ...(periodEnded ? {} : { blockedDates }),
            });
            onClose();
        } catch (err) {
            console.error('Failed to update BnB availability:', err);
            setError("Couldn't save your changes. Please check your connection and try again.");
        } finally {
            setSaving(false);
        }
    };

    // ---- Calendar month ----
    const monthStartDay = Date.UTC(viewMonth.year, viewMonth.month, 1) / DAY_MS;
    const daysInMonth = new Date(Date.UTC(viewMonth.year, viewMonth.month + 1, 0)).getUTCDate();
    const leadingBlanks = (dayDate(monthStartDay).getUTCDay() + 6) % 7;
    const monthLabel = dayDate(monthStartDay).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
    const monthKey = (m: { year: number; month: number }) => m.year * 12 + m.month;
    const canGoBack = monthKey(viewMonth) > monthKey(startMonth);
    const canGoForward = monthKey(viewMonth) < monthKey(endMonth);
    const shiftMonth = (by: number) => {
        const key = monthKey(viewMonth) + by;
        setViewMonth({ year: Math.floor(key / 12), month: key % 12 });
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Update BnB availability"
                className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F7F3EC] dark:bg-[#111111] border border-[#E7DED2] dark:border-neutral-800 shadow-2xl p-5 sm:p-6 space-y-5"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-neutral-950 dark:text-[#F5F5F5]">Update Availability</h2>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{property.name} · BnB</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-neutral-500 hover:bg-[#F2E7D8] dark:hover:bg-[#24201C] cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Accepting toggle */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#FBF8F2] dark:bg-[#1B1B1B] p-4">
                    <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                            {hasRooms ? 'Accepting bookings (whole BnB)' : 'Accepting bookings'}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {accepting
                                ? hasRooms
                                    ? 'Each room type below also has its own switch.'
                                    : 'Guests can find your BnB and send booking requests.'
                                : 'Paused: your BnB is hidden from guests.'}
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={accepting}
                        aria-label="Accepting bookings"
                        onClick={() => setAccepting((v) => !v)}
                        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer ${accepting ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                    >
                        <span
                            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${accepting ? 'left-6' : 'left-1'}`}
                        />
                    </button>
                </div>

                {/* Room types: pick a room, then its own switch and calendar */}
                {hasRooms && room && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Room types">
                            {rooms.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={item.id === room.id}
                                    onClick={() => chooseRoom(item.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${item.id === room.id
                                        ? 'bg-[var(--rentike-bronze)] border-[var(--rentike-bronze)] text-white'
                                        : 'border-[#E7DED2] dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-[#F2E7D8] dark:hover:bg-[#24201C]'
                                        }`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#FBF8F2] dark:bg-[#1B1B1B] p-4">
                            <div>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                    {room.name} accepting bookings
                                </p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    {roomEdits[room.id].accepting ? 'Guests can request this room.' : 'Paused: guests see this room as not taking bookings.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={roomEdits[room.id].accepting}
                                aria-label={`${room.name} accepting bookings`}
                                onClick={() =>
                                    setRoomEdits((prev) => ({
                                        ...prev,
                                        [room.id]: { ...prev[room.id], accepting: !prev[room.id].accepting },
                                    }))
                                }
                                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer ${roomEdits[room.id].accepting ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                            >
                                <span
                                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${roomEdits[room.id].accepting ? 'left-6' : 'left-1'}`}
                                />
                            </button>
                        </div>
                    </div>
                )}

                {/* Nights */}
                {periodEnded ? (
                    <p className="rounded-2xl border border-[#E7DED2] dark:border-neutral-800 p-4 text-sm text-neutral-600 dark:text-neutral-300">
                        {schedule
                            ? `Your hosting period ended on ${formatDay(schedule.lastNight + 1, true)}. Editing your dates comes with BnB editing.`
                            : "This BnB has no hosting dates set."}
                    </p>
                ) : (
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                {room ? `Block or unblock nights: ${room.name}` : 'Block or unblock nights'}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Tap a night when it's booked or you're not hosting. Tap again to open it.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-[#FBF8F2] dark:bg-[#1B1B1B] border border-[#E7DED2] dark:border-neutral-800 p-3">
                            <div className="flex items-center justify-between mb-2">
                                <button
                                    type="button"
                                    onClick={() => shiftMonth(-1)}
                                    disabled={!canGoBack}
                                    aria-label="Previous month"
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--rentike-bronze)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">{monthLabel}</span>
                                <button
                                    type="button"
                                    onClick={() => shiftMonth(1)}
                                    disabled={!canGoForward}
                                    aria-label="Next month"
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--rentike-bronze)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {WEEKDAYS.map((name) => (
                                    <span key={name} className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 py-1">
                                        {name}
                                    </span>
                                ))}
                                {Array.from({ length: leadingBlanks }).map((_, i) => (
                                    <span key={`blank-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = monthStartDay + i;
                                    const editable = canEditNight(day);
                                    const isBlocked = blocked.has(day);
                                    const look = !editable
                                        ? 'text-neutral-300 dark:text-neutral-700'
                                        : isBlocked
                                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 line-through font-semibold'
                                            : 'text-neutral-900 dark:text-[#F5F5F5] hover:bg-emerald-50 dark:hover:bg-emerald-950/30';
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            disabled={!editable}
                                            onClick={() => toggleNight(day)}
                                            aria-pressed={isBlocked}
                                            aria-label={`${formatDay(day, true)}${isBlocked ? ', blocked' : editable ? ', open' : ''}`}
                                            className={`h-10 rounded-xl text-sm transition-colors disabled:cursor-default ${editable ? 'cursor-pointer' : ''} ${look}`}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                <span>Normal = open for guests</span>
                                <span className="text-red-600 dark:text-red-400 line-through">12</span>
                                <span>= blocked</span>
                            </div>
                        </div>

                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                            {openNights} {openNights === 1 ? 'night' : 'nights'} open · {[...blocked].filter(canEditNight).length} blocked
                        </p>
                        {openNights === 0 && (
                            <p className="text-xs text-amber-700 dark:text-amber-400">
                                Every night is blocked, so guests can't book. You can also turn off "Accepting bookings".
                            </p>
                        )}
                    </div>
                )}

                {error && <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}

                <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl border border-[#E4D8C8] dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => void handleSave()}
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                    >
                        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};