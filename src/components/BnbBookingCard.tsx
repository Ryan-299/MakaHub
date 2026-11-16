import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Minus, Plus, Send, ShieldCheck } from 'lucide-react';
import type { BnbDetails } from '../types';

// ---------------------------------------------------------------------------
// BnB "Check dates" card for the property detail page.
// Dates are "YYYY-MM-DD". Each date in the calendar stands for the NIGHT that
// starts on it, the same way the host form and convex/properties.ts count them:
//   first night = availableFrom
//   last night  = availableFrom + hostingDurationNights - 1
//   final check-out morning = availableFrom + hostingDurationNights
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
const KENYA_OFFSET_MS = 3 * 60 * 60 * 1000;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** "YYYY-MM-DD" -> day number, or null if the date is not real (e.g. 2026-02-30). */
export const toDayNumber = (date: string | undefined): number | null => {
    if (!date) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const ms = Date.UTC(year, month - 1, day);
    const check = new Date(ms);
    if (
        check.getUTCFullYear() !== year ||
        check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day
    ) {
        return null;
    }
    return ms / DAY_MS;
};

/** Today's date in Kenya (UTC+3) as a day number. */
export const kenyaToday = (): number =>
    Math.floor((Date.now() + KENYA_OFFSET_MS) / DAY_MS);

const dayDate = (day: number) => new Date(day * DAY_MS);

export const formatDay = (day: number, withYear = false): string =>
    dayDate(day).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        ...(withYear ? { year: 'numeric' } : {}),
        timeZone: 'UTC',
    });

/** "14:00" -> "2:00 PM". Anything else is shown as typed. */
export const formatTime = (time: string | undefined): string | null => {
    if (!time) return null;
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
    if (!match) return time;
    const hours = Number(match[1]);
    const minutes = match[2];
    if (hours > 23 || Number(minutes) > 59) return time;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const twelve = hours % 12 === 0 ? 12 : hours % 12;
    return `${twelve}:${minutes} ${suffix}`;
};

const ksh = (amount: number) => `KSh ${amount.toLocaleString()}`;

const shortDay = (day: number) =>
    dayDate(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** "Available 10 Dec – 19 Dec · 15 Dec booked" (blocked nights still ahead of the guest). */
export const availabilitySummary = (schedule: BnbSchedule): string => {
    const from = schedule.firstBookable;
    const lastCheckOut = schedule.lastNight + 1;
    const booked = [...schedule.blocked]
        .filter((day) => day >= from && day <= schedule.lastNight)
        .sort((a, b) => a - b);

    let text = `Available ${shortDay(from)} – ${shortDay(lastCheckOut)}`;
    if (booked.length === 1) text += ` · ${shortDay(booked[0])} booked`;
    else if (booked.length === 2 || booked.length === 3) text += ` · ${booked.map(shortDay).join(', ')} booked`;
    else if (booked.length > 3) text += ` · ${booked.length} nights booked`;
    return text;
};

export type BnbSchedule = {
    firstNight: number; // first night of the hosting period
    lastNight: number; // last night of the hosting period
    firstBookable: number; // first night a guest can still book (not in the past)
    minNights: number;
    maxNights: number;
    blocked: Set<number>;
};

/** Reads the host's schedule. Returns null if the dates are missing or broken. */
export const readSchedule = (bnb: BnbDetails, today: number): BnbSchedule | null => {
    const firstNight = toDayNumber(bnb.availableFrom);
    const duration = bnb.hostingDurationNights;
    if (firstNight === null || !duration || duration < 1) return null;

    const lastNight = firstNight + duration - 1;
    const minNights = Math.max(1, bnb.minNights ?? 1);
    const maxNights = Math.max(minNights, bnb.maxNights ?? duration);

    const blocked = new Set<number>();
    for (const date of bnb.blockedDates ?? []) {
        const day = toDayNumber(date);
        if (day !== null) blocked.add(day);
    }

    return {
        firstNight,
        lastNight,
        firstBookable: Math.max(firstNight, today),
        minNights,
        maxNights,
        blocked,
    };
};

/** Can a guest sleep here on the night that starts on this day? */
export const isNightOpen = (schedule: BnbSchedule, day: number): boolean =>
    day >= schedule.firstBookable &&
    day <= schedule.lastNight &&
    !schedule.blocked.has(day);

/**
 * The latest check-out allowed for a stay starting on checkIn:
 * the stay must stop before the next unavailable night, and within max nights.
 */
export const latestCheckOut = (schedule: BnbSchedule, checkIn: number): number => {
    let day = checkIn + 1;
    while (day <= schedule.lastNight && isNightOpen(schedule, day)) day++;
    // `day` is now the first night that can't be booked (or the final check-out).
    return Math.min(day, checkIn + schedule.maxNights);
};

/** Explains why a stay is not allowed, or returns null if it is fine. */
export const stayProblem = (
    schedule: BnbSchedule,
    checkIn: number,
    checkOut: number
): string | null => {
    const nights = checkOut - checkIn;
    if (nights < 1) return 'Check-out must be after check-in.';
    for (let day = checkIn; day < checkOut; day++) {
        if (!isNightOpen(schedule, day)) return 'Your stay includes a night that is not available.';
    }
    if (nights < schedule.minNights) {
        return `The minimum stay is ${schedule.minNights} ${schedule.minNights === 1 ? 'night' : 'nights'}.`;
    }
    if (nights > schedule.maxNights) {
        return `The maximum stay is ${schedule.maxNights} ${schedule.maxNights === 1 ? 'night' : 'nights'}.`;
    }
    return null;
};

export type BnbBookingRequest = {
    checkIn: string; // "YYYY-MM-DD"
    checkOut: string;
    nights: number;
    guests: number;
    estimatedTotal: number;
    message: string;
};

const toDateString = (day: number) => dayDate(day).toISOString().slice(0, 10);

type BnbBookingCardProps = {
    bnb: BnbDetails;
    propertyName: string;
    hostName: string;
    isOwner: boolean;
    onAskHost: (request: BnbBookingRequest) => Promise<void>;
};

export const BnbBookingCard: React.FC<BnbBookingCardProps> = ({
    bnb,
    propertyName,
    hostName,
    isOwner,
    onAskHost,
}) => {
    const today = kenyaToday();
    const schedule = useMemo(
        () => readSchedule(bnb, today),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [bnb.availableFrom, bnb.hostingDurationNights, bnb.minNights, bnb.maxNights, bnb.blockedDates, today]
    );

    const [checkIn, setCheckIn] = useState<number | null>(null);
    const [checkOut, setCheckOut] = useState<number | null>(null);
    const [guests, setGuests] = useState(1);
    const [note, setNote] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    // Month on screen, as { year, month } in UTC.
    const startMonth = (() => {
        const d = dayDate(schedule ? schedule.firstBookable : today);
        return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    })();
    const endMonth = (() => {
        const d = dayDate(schedule ? schedule.lastNight + 1 : today);
        return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    })();
    const [viewMonth, setViewMonth] = useState(startMonth);

    const cardClass =
        'scroll-mt-24 bg-[#F7F3EC] dark:bg-[#151515] p-5 sm:p-6 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[5px_5px_12px_rgba(28,22,16,0.10),-5px_-5px_12px_rgba(255,255,255,0.92)] dark:shadow-[5px_5px_12px_rgba(0,0,0,0.45),-3px_-3px_8px_rgba(255,255,255,0.03)]';

    const header = (
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] flex items-center justify-center text-[var(--rentike-bronze)]">
                <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="text-2xl sm:text-[26px] font-editorial font-semibold tracking-tight">
                <span className="text-neutral-950 dark:text-[#F5F5F5]">Check </span>
                <span className="text-[var(--rentike-bronze)]">Dates</span>
            </h3>
        </div>
    );

    // ---- Cases where nobody can book --------------------------------------
    const closedMessage = !schedule
        ? "The host hasn't set their dates yet."
        : today > schedule.lastNight
            ? "This BnB's hosting period has ended."
            : !bnb.accepting
                ? "This host isn't taking bookings right now."
                : null;

    if (closedMessage || !schedule) {
        return (
            <section id="bnb-booking-section" className={cardClass}>
                {header}
                <p className="text-sm text-neutral-600 dark:text-[#A3A3A3]">{closedMessage}</p>
            </section>
        );
    }

    // ---- Calendar helpers ---------------------------------------------------
    const awaitingCheckOut = checkIn !== null && checkOut === null;
    const maxCheckOut = checkIn !== null ? latestCheckOut(schedule, checkIn) : null;

    const canBeCheckOut = (day: number) =>
        awaitingCheckOut && checkIn !== null && maxCheckOut !== null && day > checkIn && day <= maxCheckOut;

    const handleDayTap = (day: number) => {
        setSendError(null);

        if (awaitingCheckOut && checkIn !== null && canBeCheckOut(day)) {
            if (day - checkIn < schedule.minNights) {
                setNote(
                    `The minimum stay is ${schedule.minNights} ${schedule.minNights === 1 ? 'night' : 'nights'}.`
                );
                return;
            }
            setCheckOut(day);
            setNote(null);
            return;
        }

        if (isNightOpen(schedule, day)) {
            setCheckIn(day);
            setCheckOut(null);
            setNote(null);
            return;
        }

        if (day >= schedule.firstBookable && day <= schedule.lastNight) {
            setNote('That night is not available.');
        }
    };

    const clearDates = () => {
        setCheckIn(null);
        setCheckOut(null);
        setNote(null);
        setSendError(null);
    };

    const monthStartDay = Date.UTC(viewMonth.year, viewMonth.month, 1) / DAY_MS;
    const daysInMonth = new Date(Date.UTC(viewMonth.year, viewMonth.month + 1, 0)).getUTCDate();
    const leadingBlanks = (dayDate(monthStartDay).getUTCDay() + 6) % 7; // Monday first
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

    // ---- Stay summary -------------------------------------------------------
    const nights = checkIn !== null && checkOut !== null ? checkOut - checkIn : 0;
    const problem =
        checkIn !== null && checkOut !== null ? stayProblem(schedule, checkIn, checkOut) : null;
    const shortGapHint =
        awaitingCheckOut && checkIn !== null && maxCheckOut !== null && maxCheckOut - checkIn < schedule.minNights
            ? `Only ${maxCheckOut - checkIn} ${maxCheckOut - checkIn === 1 ? 'night is' : 'nights are'} free from this date, and the minimum stay is ${schedule.minNights} nights. Try another date.`
            : null;

    const cleaningFee = bnb.cleaningFee ?? 0;
    const nightsCost = nights * bnb.pricePerNight;
    const estimatedTotal = nightsCost + cleaningFee;
    const maxGuests = Math.max(1, bnb.maxGuests);
    const checkInTime = formatTime(bnb.checkInTime);
    const checkOutTime = formatTime(bnb.checkOutTime);

    const readyToSend = checkIn !== null && checkOut !== null && !problem && guests <= maxGuests;

    const handleAsk = async () => {
        if (!readyToSend || checkIn === null || checkOut === null || sending) return;

        const nightWord = nights === 1 ? 'night' : 'nights';
        const guestWord = guests === 1 ? 'guest' : 'guests';
        const priceParts =
            `${nights} ${nightWord} × ${ksh(bnb.pricePerNight)}` +
            (cleaningFee > 0 ? ` + ${ksh(cleaningFee)} cleaning fee` : '');
        const hostFirstName = hostName.trim().split(/\s+/)[0] || 'there';

        // One line per detail, so the host can read it at a glance. The chat
        // bubbles keep line breaks (whitespace-pre-wrap) on both sides.
        const message = [
            `🏖️ Booking request · ${propertyName}`,
            '',
            `📅 Check-in: ${formatDay(checkIn, true)}`,
            `📅 Check-out: ${formatDay(checkOut, true)}`,
            `🌙 ${nights} ${nightWord} · 👥 ${guests} ${guestWord}`,
            '',
            `💰 Estimated total: ${ksh(estimatedTotal)}`,
            priceParts,
            '',
            `Hi ${hostFirstName}, are these dates available? 😊`,
        ].join('\n');

        setSending(true);
        setSendError(null);
        try {
            await onAskHost({
                checkIn: toDateString(checkIn),
                checkOut: toDateString(checkOut),
                nights,
                guests,
                estimatedTotal,
                message,
            });
        } catch (error) {
            console.error('Failed to send BnB booking request:', error);
            setSendError("Couldn't send your request. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const stayRules = [
        schedule.minNights > 1 ? `Minimum ${schedule.minNights} nights` : null,
        schedule.maxNights < schedule.lastNight - schedule.firstNight + 1
            ? `maximum ${schedule.maxNights} nights`
            : null,
    ].filter(Boolean);

    return (
        <section id="bnb-booking-section" className={`${cardClass} space-y-5`}>
            <div>
                {header}
                <p className="-mt-2 text-sm text-neutral-500 dark:text-[#8A8A8A]">
                    {isOwner
                        ? 'This is how guests see your available dates.'
                        : awaitingCheckOut
                            ? 'Now tap your check-out date.'
                            : 'Tap your check-in date, then your check-out date.'}
                    {stayRules.length > 0 && (
                        <span className="block mt-1 text-xs">
                            {stayRules.join(', ').replace(/^./, (c) => c.toUpperCase())} per stay.
                        </span>
                    )}
                </p>
            </div>

            <p className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                {availabilitySummary(schedule)}
            </p>

            {/* Calendar */}
            <div className="rounded-2xl bg-[#FBF8F2] dark:bg-[#1B1B1B] border border-[#E7DED2] dark:border-neutral-800 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                    <button
                        type="button"
                        onClick={() => shiftMonth(-1)}
                        disabled={!canGoBack}
                        aria-label="Previous month"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--rentike-bronze)] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">{monthLabel}</span>
                    <button
                        type="button"
                        onClick={() => shiftMonth(1)}
                        disabled={!canGoForward}
                        aria-label="Next month"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--rentike-bronze)] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {WEEKDAYS.map((name) => (
                        <span key={name} className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#7D7D7D] py-1">
                            {name}
                        </span>
                    ))}

                    {Array.from({ length: leadingBlanks }).map((_, i) => (
                        <span key={`blank-${i}`} />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = monthStartDay + i;
                        const open = isNightOpen(schedule, day);
                        const inPeriod = day >= schedule.firstBookable && day <= schedule.lastNight;
                        const takenNight = inPeriod && !open;
                        const isStart = day === checkIn;
                        const isEnd = day === checkOut;
                        const inStay =
                            checkIn !== null && checkOut !== null && day > checkIn && day < checkOut;
                        const checkOutOption = canBeCheckOut(day);
                        const tappable = !isOwner && (open || checkOutOption);

                        let look =
                            'text-neutral-300 dark:text-neutral-700'; // outside the hosting period
                        if (open || checkOutOption) look = 'text-neutral-900 dark:text-[#F5F5F5] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C]';
                        if (takenNight && !checkOutOption) look = 'text-neutral-400 dark:text-neutral-600 line-through';

                        if (inStay) look = 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100';
                        if (isStart || isEnd) look = 'bg-green-600 text-white font-bold';

                        return (
                            <button
                                key={day}
                                type="button"
                                disabled={!tappable}
                                onClick={() => handleDayTap(day)}
                                aria-label={`${formatDay(day, true)}${takenNight ? ', not available' : ''}`}
                                aria-pressed={isStart || isEnd}
                                className={`h-10 rounded-xl text-sm transition-colors disabled:cursor-default ${tappable ? 'cursor-pointer' : ''} ${look}`}
                            >
                                {i + 1}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
                    <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-green-600" /> Your stay
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                        <span className="line-through">12</span> Not available
                    </span>
                </div>
            </div>

            {isOwner ? null : (
                <>

                    {/* Selected dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setCheckIn(null);
                                setCheckOut(null);
                                setNote(null);
                                document.getElementById('bnb-booking-section')?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }}
                            className="w-full text-left rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#FBF8F2] dark:bg-[#1B1B1B] p-3 cursor-pointer"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--rentike-bronze)]">
                                Check-in
                            </p>
                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                {checkIn !== null ? formatDay(checkIn) : 'Add date'}
                            </p>
                            {checkInTime && (
                                <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
                                    From {checkInTime}
                                </p>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setCheckOut(null);
                                setNote(null);
                                document.getElementById('bnb-booking-section')?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start'
                                });
                            }}
                            className="w-full text-left rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#FBF8F2] dark:bg-[#1B1B1B] p-3 cursor-pointer"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--rentike-bronze)]">
                                Check-out
                            </p>
                            <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">
                                {checkOut !== null ? formatDay(checkOut) : 'Add date'}
                            </p>
                            {checkOutTime && (
                                <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
                                    By {checkOutTime}
                                </p>
                            )}
                        </button>
                    </div>


                    {/* Guests */}
                    <div className="flex items-center justify-between rounded-2xl border border-[#E7DED2] dark:border-neutral-800 bg-[#FBF8F2] dark:bg-[#1B1B1B] p-3">
                        <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-[#F5F5F5]">Guests</p>
                            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">Up to {maxGuests}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setGuests((g) => Math.max(1, g - 1))}
                                disabled={guests <= 1}
                                aria-label="Fewer guests"
                                className="w-9 h-9 rounded-full border border-[#E7DED2] dark:border-neutral-700 flex items-center justify-center text-[var(--rentike-bronze)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-neutral-900 dark:text-[#F5F5F5]">{guests}</span>
                            <button
                                type="button"
                                onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
                                disabled={guests >= maxGuests}
                                aria-label="More guests"
                                className="w-9 h-9 rounded-full border border-[#E7DED2] dark:border-neutral-700 flex items-center justify-center text-[var(--rentike-bronze)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {(note || shortGapHint || problem) && (
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">
                            {problem || note || shortGapHint}
                        </p>
                    )}

                    {/* Estimate */}
                    {readyToSend && (
                        <div className="rounded-2xl border border-[#E7DED2] dark:border-neutral-700 bg-[#F2E7D8] dark:bg-[#24201C] p-4 space-y-2 text-sm">
                            <div className="flex justify-between gap-4 text-neutral-700 dark:text-neutral-300">
                                <span>{ksh(bnb.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                                <span>{ksh(nightsCost)}</span>
                            </div>
                            {cleaningFee > 0 && (
                                <div className="flex justify-between gap-4 text-neutral-700 dark:text-neutral-300">
                                    <span>Cleaning fee</span>
                                    <span>{ksh(cleaningFee)}</span>
                                </div>
                            )}
                            <div className="flex justify-between gap-4 pt-2 border-t border-[#E0D2BF] dark:border-neutral-700 font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                                <span>Estimated total</span>
                                <span>{ksh(estimatedTotal)}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                The host confirms the dates and final price. You don't pay anything on Rentike.
                            </p>
                        </div>
                    )}

                    <p className="flex items-start gap-2 rounded-xl bg-[#FBF8F2] dark:bg-[#1B1B1B] border border-[#E7DED2] dark:border-neutral-800 px-3 py-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                        <ShieldCheck className="w-4 h-4 shrink-0 text-[var(--rentike-bronze)]" />
                        <span>
                            <strong className="font-semibold text-[var(--rentike-bronze)]">Stay safe:</strong> Confirm the
                            property exists before paying.
                        </span>
                    </p>

                    {sendError && (
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">{sendError}</p>
                    )}

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => void handleAsk()}
                            disabled={!readyToSend || sending}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Send className="w-4 h-4" />
                            <span>{sending ? 'Sending…' : 'Request Stay'}</span>
                        </button>
                        {checkIn !== null && (
                            <button
                                type="button"
                                onClick={clearDates}
                                className="px-3 py-3 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};