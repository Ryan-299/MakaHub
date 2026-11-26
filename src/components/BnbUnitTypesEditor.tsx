import React, { useState } from 'react';
import { DayPicker, DayButton, type DayButtonProps } from 'react-day-picker';
import { Plus, Trash2, BedDouble, CalendarDays, ChevronDown } from 'lucide-react';

// ---------------------------------------------------------------
// BnB unit types (one building, several bookable types such as
// "Standard Room", "Deluxe Room", "2-Bedroom Apartment").
// Matches bnbUnitTypeValidator in convex/validators.ts.
// ---------------------------------------------------------------

// A unit type as stored on the listing (bnb.unitTypes).
export type SavedBnbUnitType = {
    id: string;
    name: string;
    pricePerNight: number;
    cleaningFee?: number;
    maxGuests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    unitCount?: number;
    imageStorageIds?: string[];
    blockedDates?: string[];
    accepting?: boolean;
    // This unit type's own availability.
    availableFrom?: string;
    hostingDurationNights?: number;
    openEnded?: boolean;
    // This unit type's own stay rules.
    minNights?: number;
    maxNights?: number;
};

// A unit type while the host is typing (numbers kept as text).
export type BnbUnitTypeDraft = {
    id: string;
    name: string;
    pricePerNight: string;
    cleaningFee: string;
    maxGuests: string;
    bedrooms: string;
    beds: string;
    bathrooms: string;
    unitCount: string;
    // This room type's own availability ("" until chosen).
    availableFrom: string;
    hostingDurationNights: string;
    // "No end date": guests can book up to 12 months ahead, rolling.
    openEnded: boolean;
    // This room type's own stay rules ("" maximum = no limit).
    minNights: string;
    maxNights: string;
    // This room type's own calendar (blocked nights, "YYYY-MM-DD").
    blockedDates?: string[];
    // Carried over unchanged from an existing listing.
    imageStorageIds?: string[];
    accepting?: boolean;
    // Form-only: true for room types already saved on the listing.
    isSaved?: boolean;
    // Form-only: the start date saved on the listing. An unchanged older
    // start date may be in the past; a new or changed one may not.
    savedAvailableFrom?: string;
};

// A hosting period as the form keeps it (duration as text).
export type HostingPeriod = {
    availableFrom: string;
    hostingDurationNights: string;
    openEnded: boolean;
};

// Minimum / maximum nights per guest as the form keeps them.
export type StayRules = {
    minNights: string;
    maxNights: string;
};

export const MAX_BNB_UNIT_TYPES = 30;

// "No end date": guests can book up to this many nights ahead of today.
export const ROLLING_WINDOW_NIGHTS = 365;

// ---------------------------------------------------------------
// Dates ("YYYY-MM-DD")
// ---------------------------------------------------------------

export function addDays(date: string, days: number): string {
    const current = new Date(`${date}T00:00:00Z`);
    current.setUTCDate(current.getUTCDate() + days);
    return current.toISOString().slice(0, 10);
}

// Whole days from one date to another.
export function daysBetween(from: string, to: string): number {
    return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

// Today in Kenya (UTC+3): the same "today" the server uses.
export function kenyaTodayIso(now: number = Date.now()): string {
    return new Date(now + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// The first night AFTER a hosting period, or "" if it isn't complete.
// "No end date" ends 12 months from today (the server works it out the
// same way, and moves it forward every day).
export function periodEndDate(
    availableFrom: string,
    hostingDurationNights: string,
    openEnded: boolean,
    today: string
): string {
    if (!availableFrom) return '';

    if (openEnded) {
        const end = addDays(today, ROLLING_WINDOW_NIGHTS);
        return end > availableFrom ? end : addDays(availableFrom, 1);
    }

    const nights = hostingDurationNights.trim() === '' ? NaN : Number(hostingDurationNights);
    if (!Number.isInteger(nights) || nights < 1 || nights > 365) return '';

    return addDays(availableFrom, nights);
}

// The period a NEW room type starts with: a copy of `source`, but never
// starting before today (an older listing's start date may have passed).
export function startingPeriod(source: HostingPeriod | undefined, today: string): HostingPeriod {
    if (!source || !source.availableFrom) {
        return { availableFrom: '', hostingDurationNights: '', openEnded: source?.openEnded ?? false };
    }

    // Copy only the dates (`source` may be a whole room type).
    if (source.availableFrom >= today) {
        return {
            availableFrom: source.availableFrom,
            hostingDurationNights: source.hostingDurationNights,
            openEnded: source.openEnded,
        };
    }

    if (source.openEnded) {
        return { availableFrom: today, hostingDurationNights: '', openEnded: true };
    }

    // Started in the past: start today and keep the same last night.
    const end = periodEndDate(source.availableFrom, source.hostingDurationNights, false, today);
    const nightsLeft = end ? daysBetween(today, end) : 0;

    return nightsLeft >= 1
        ? { availableFrom: today, hostingDurationNights: String(nightsLeft), openEnded: false }
        : { availableFrom: '', hostingDurationNights: '', openEnded: false };
}

// One period covering every room type (earliest start to latest end).
// Used when the host turns room types off. Null if no room type has dates.
export function combinedPeriod(drafts: BnbUnitTypeDraft[], today: string): HostingPeriod | null {
    const withDates = drafts.filter((draft) =>
        periodEndDate(draft.availableFrom, draft.hostingDurationNights, draft.openEnded, today)
    );

    if (withDates.length === 0) return null;

    const start = withDates.map((draft) => draft.availableFrom).sort()[0];

    if (withDates.some((draft) => draft.openEnded)) {
        return { availableFrom: start, hostingDurationNights: '', openEnded: true };
    }

    const end = withDates
        .map((draft) => periodEndDate(draft.availableFrom, draft.hostingDurationNights, false, today))
        .sort()
        .slice(-1)[0];
    const nights = daysBetween(start, end);

    return {
        availableFrom: start,
        hostingDurationNights: nights >= 1 && nights <= 365 ? String(nights) : '',
        openEnded: false,
    };
}

// Stay rules covering every room type (smallest minimum, largest
// maximum, no limit if any room type has none). Used when the host
// turns room types off.
export function combinedStay(drafts: BnbUnitTypeDraft[]): StayRules | null {
    const mins = drafts.map((draft) => Number(draft.minNights)).filter((n) => Number.isInteger(n) && n >= 1);
    if (mins.length === 0) return null;

    const noLimit = drafts.some((draft) => draft.maxNights.trim() === '');
    const maxes = drafts.map((draft) => Number(draft.maxNights)).filter((n) => Number.isInteger(n) && n >= 1);

    return {
        minNights: String(Math.min(...mins)),
        maxNights: noLimit || maxes.length === 0 ? '' : String(Math.max(...maxes)),
    };
}

const newUnitTypeId = () =>
    `ut_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// A new room type starts with the building's blocked nights, so turning
// room types on never reopens nights the host had already blocked. Its
// dates and minimum/maximum nights start as a copy of the building's, or
// of the room type above it.
export const emptyUnitTypeDraft = (
    startingBlocked: string[] = [],
    period?: HostingPeriod,
    today: string = kenyaTodayIso(),
    stay?: StayRules
): BnbUnitTypeDraft => ({
    id: newUnitTypeId(),
    blockedDates: [...startingBlocked],
    name: '',
    pricePerNight: '',
    cleaningFee: '',
    maxGuests: '2',
    bedrooms: '1',
    beds: '1',
    bathrooms: '1',
    unitCount: '1',
    accepting: true,
    minNights: stay?.minNights.trim() ? stay.minNights : '1',
    maxNights: stay?.maxNights ?? '',
    ...startingPeriod(period, today),
});

// `fallback` is the building's period, for room types saved before they
// had their own dates.
export const draftFromSaved = (
    type: SavedBnbUnitType,
    fallback: {
        availableFrom?: string;
        hostingDurationNights?: number;
        openEnded?: boolean;
        minNights?: number;
        maxNights?: number;
    } = {}
): BnbUnitTypeDraft => {
    const ownPeriod = type.availableFrom !== undefined;
    // Room types saved before they had their own stay rules use the BnB's.
    const ownStay = type.minNights !== undefined;
    const minNights = ownStay ? type.minNights : fallback.minNights ?? 1;
    const maxNights = ownStay ? type.maxNights : fallback.maxNights;
    const availableFrom = (ownPeriod ? type.availableFrom : fallback.availableFrom) ?? '';
    const openEnded = (ownPeriod ? type.openEnded : fallback.openEnded) === true;
    const duration = ownPeriod ? type.hostingDurationNights : fallback.hostingDurationNights;

    return {
        id: type.id,
        name: type.name,
        pricePerNight: String(type.pricePerNight),
        cleaningFee: type.cleaningFee !== undefined ? String(type.cleaningFee) : '',
        maxGuests: String(type.maxGuests),
        bedrooms: String(type.bedrooms),
        beds: String(type.beds),
        bathrooms: String(type.bathrooms),
        unitCount: String(type.unitCount ?? 1),
        availableFrom,
        // With "No end date" the stored number is only the rolling window.
        hostingDurationNights: !openEnded && duration !== undefined ? String(duration) : '',
        openEnded,
        minNights: String(minNights),
        maxNights: maxNights !== undefined ? String(maxNights) : '',
        imageStorageIds: type.imageStorageIds,
        blockedDates: type.blockedDates ?? [],
        accepting: type.accepting,
        isSaved: true,
        savedAvailableFrom: availableFrom || undefined,
    };
};

// Same checks as the server (prepareBnbUnitTypes), with friendly messages.
export function buildUnitTypesPayload(
    drafts: BnbUnitTypeDraft[],
    options: { today?: string } = {}
): { ok: true; unitTypes: SavedBnbUnitType[] } | { ok: false; error: string } {
    if (drafts.length === 0) {
        return { ok: false, error: 'Add at least one room type.' };
    }

    if (drafts.length > MAX_BNB_UNIT_TYPES) {
        return { ok: false, error: `A BnB can have up to ${MAX_BNB_UNIT_TYPES} room types.` };
    }

    const today = options.today ?? kenyaTodayIso();
    const latestStart = addDays(today, 365);

    const names = new Set<string>();
    const unitTypes: SavedBnbUnitType[] = [];

    for (const [index, draft] of drafts.entries()) {
        const name = draft.name.trim();
        const label = name || `Room type ${index + 1}`;

        if (!name || name.length > 80) {
            return { ok: false, error: `Give room type ${index + 1} a name (up to 80 characters).` };
        }

        const key = name.toLowerCase();
        if (names.has(key)) {
            return { ok: false, error: `Two room types are called "${name}".` };
        }
        names.add(key);

        const whole = (value: string) => (value.trim() === '' ? NaN : Number(value));

        const price = whole(draft.pricePerNight);
        const cleaning = draft.cleaningFee.trim() === '' ? undefined : Number(draft.cleaningFee);
        const guests = whole(draft.maxGuests);
        const bedrooms = whole(draft.bedrooms);
        const beds = whole(draft.beds);
        const bathrooms = whole(draft.bathrooms);
        const unitCount = whole(draft.unitCount);

        if (!Number.isFinite(price) || price <= 0) {
            return { ok: false, error: `Enter the nightly rate for "${label}".` };
        }

        if (cleaning !== undefined && (!Number.isFinite(cleaning) || cleaning < 0)) {
            return { ok: false, error: `The cleaning fee for "${label}" must be 0 or more.` };
        }

        if (!Number.isInteger(guests) || guests < 1) {
            return { ok: false, error: `Maximum guests for "${label}" must be at least 1.` };
        }

        if ([bedrooms, beds, bathrooms].some((value) => !Number.isInteger(value) || value < 0)) {
            return { ok: false, error: `Bedrooms, beds and bathrooms for "${label}" must be whole numbers.` };
        }

        if (!Number.isInteger(unitCount) || unitCount < 1 || unitCount > 500) {
            return { ok: false, error: `Number of identical rooms for "${label}" must be between 1 and 500.` };
        }

        // This room type's own availability.
        if (!draft.availableFrom) {
            return { ok: false, error: `Choose the "Available From" date for "${label}".` };
        }

        if (
            draft.availableFrom !== draft.savedAvailableFrom &&
            (draft.availableFrom < today || draft.availableFrom > latestStart)
        ) {
            return {
                ok: false,
                error: `Choose an available-from date for "${label}" between today and one year from now.`,
            };
        }

        let duration: number;

        if (draft.openEnded) {
            // Stored as "today + 12 months"; the server keeps it rolling.
            duration = daysBetween(draft.availableFrom, periodEndDate(draft.availableFrom, '', true, today));
        } else {
            duration = whole(draft.hostingDurationNights);

            if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
                return {
                    ok: false,
                    error: `Enter the hosting duration for "${label}" (1-365 nights) or turn on "Always open".`,
                };
            }

        }

        // This room type's own minimum / maximum nights per guest.
        const minNights = whole(draft.minNights);
        const maxNights = draft.maxNights.trim() === '' ? undefined : Number(draft.maxNights);

        if (!Number.isInteger(minNights) || minNights < 1) {
            return { ok: false, error: `Minimum nights for "${label}" must be at least 1.` };
        }

        if (maxNights !== undefined && (!Number.isInteger(maxNights) || maxNights < minNights || maxNights > 365)) {
            return { ok: false, error: `Maximum nights for "${label}" must be between its minimum nights and 365.` };
        }

        if (!draft.openEnded && minNights > duration) {
            return { ok: false, error: `Minimum nights must be within the hosting duration of "${label}".` };
        }

        if (!draft.openEnded && maxNights !== undefined && maxNights > duration) {
            return { ok: false, error: `Maximum nights for "${label}" cannot exceed its hosting duration.` };
        }

        unitTypes.push({
            id: draft.id,
            name,
            pricePerNight: price,
            cleaningFee: cleaning,
            maxGuests: guests,
            bedrooms,
            beds,
            bathrooms,
            unitCount,
            availableFrom: draft.availableFrom,
            hostingDurationNights: duration,
            ...(draft.openEnded ? { openEnded: true } : {}),
            minNights,
            ...(maxNights !== undefined ? { maxNights } : {}),
            ...(draft.imageStorageIds ? { imageStorageIds: draft.imageStorageIds } : {}),
            ...(draft.blockedDates ? { blockedDates: draft.blockedDates } : {}),
            ...(draft.accepting !== undefined ? { accepting: draft.accepting } : {}),
        });
    }

    return { ok: true, unitTypes };
}

// Calendars when saving (pure, so it can be tested on its own):
// - A NEW unit type (no calendar yet) starts with the building's
//   currently blocked nights, so converting a single-price BnB into
//   unit types never reopens nights the host had blocked.
// - Blocked nights are kept only inside the hosting period (the server
//   requires that): the building's period for the building, and each
//   unit type's own period for that unit type. Upcoming blocked nights
//   that fall OUTSIDE a changed period are returned in `droppedDates`,
//   so the form can warn the host before saving instead of removing
//   them silently.
export function prepareBlockedNights(options: {
    buildingBlocked: string[];
    unitTypes?: SavedBnbUnitType[];
    availableFrom: string;
    hostingEndDate: string; // first night AFTER the period
    today: string;
}): { buildingBlocked: string[]; unitTypes?: SavedBnbUnitType[]; droppedDates: string[] } {
    const { availableFrom, hostingEndDate, today } = options;
    const inPeriod = (date: string) => date >= availableFrom && date < hostingEndDate;
    const droppedUpcoming = (dates: string[]) => dates.filter((date) => date >= today && !inPeriod(date));

    const buildingBlocked = options.buildingBlocked.filter(inPeriod);

    if (!options.unitTypes) {
        return {
            buildingBlocked,
            droppedDates: [...new Set(droppedUpcoming(options.buildingBlocked))].sort(),
        };
    }

    const dropped = new Set<string>();

    const unitTypes = options.unitTypes.map((type) => {
        // This unit type's own period (or the building's, if it has none).
        const ownPeriod = type.availableFrom !== undefined && type.hostingDurationNights !== undefined;
        const from = ownPeriod ? (type.availableFrom as string) : availableFrom;
        const end = ownPeriod
            ? addDays(type.availableFrom as string, type.hostingDurationNights as number)
            : hostingEndDate;
        const inTypePeriod = (date: string) => date >= from && date < end;

        // New unit type: inherit the building's blocked nights.
        const source = type.blockedDates ?? options.buildingBlocked;

        for (const date of source) {
            if (date >= today && !inTypePeriod(date)) dropped.add(date);
        }

        return { ...type, blockedDates: [...new Set(source.filter(inTypePeriod))].sort() };
    });

    return { buildingBlocked, unitTypes, droppedDates: [...dropped].sort() };
}

// Building-level summary the server also computes: the "from" price is
// the cheapest type; capacity is the largest type; the hosting period
// runs from the earliest start to the latest end ("No end date" if any
// type has no end date).
export function summarizeUnitTypes(unitTypes: SavedBnbUnitType[]) {
    const cheapest = unitTypes.reduce((low, type) =>
        type.pricePerNight < low.pricePerNight ? type : low
    );

    const periods = unitTypes
        .filter((type) => type.availableFrom !== undefined && type.hostingDurationNights !== undefined)
        .map((type) => ({
            start: type.availableFrom as string,
            end: addDays(type.availableFrom as string, type.hostingDurationNights as number),
        }));

    const start = periods.length > 0 ? periods.map((period) => period.start).sort()[0] : undefined;
    const end = periods.length > 0 ? periods.map((period) => period.end).sort().slice(-1)[0] : undefined;

    return {
        pricePerNight: cheapest.pricePerNight,
        cleaningFee: cheapest.cleaningFee,
        minNights: Math.min(...unitTypes.map((type) => type.minNights ?? 1)),
        maxNights: unitTypes.some((type) => type.maxNights === undefined)
            ? undefined
            : Math.max(...unitTypes.map((type) => type.maxNights as number)),
        maxGuests: Math.max(...unitTypes.map((type) => type.maxGuests)),
        bedrooms: Math.max(...unitTypes.map((type) => type.bedrooms)),
        beds: Math.max(...unitTypes.map((type) => type.beds)),
        bathrooms: Math.max(...unitTypes.map((type) => type.bathrooms)),
        availableFrom: start,
        hostingDurationNights: start !== undefined && end !== undefined ? daysBetween(start, end) : undefined,
        openEnded: unitTypes.some((type) => type.openEnded === true),
    };
}

const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[#E2D3C2] dark:border-[#38322D] bg-white dark:bg-[#202020]';

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');

interface BnbUnitTypesEditorProps {
    value: BnbUnitTypeDraft[];
    onChange: (next: BnbUnitTypeDraft[]) => void;
    // The building's hosting period and blocked nights: room types created
    // when the switch is turned on start with these.
    buildingPeriod?: HostingPeriod;
    buildingBlocked?: string[];
    buildingStay?: StayRules;
    // "YYYY-MM-DD" in Kenya (defaults to now; tests pass a fixed day).
    today?: string;
}

// Room types already saved on the listing. Only removing these asks
// first; cards still being typed are removed at once.
const hasContent = (draft: BnbUnitTypeDraft) =>
    Boolean(draft.isSaved) || Boolean(draft.imageStorageIds?.length);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Nights from check-in up to (not including) check-out, kept inside the
// hosting period, added to a room type's blocked nights.
export function blockNightRange(
    blocked: string[],
    from: string,
    to: string,
    availableFrom: string,
    hostingEndDate: string
): string[] {
    if (!from || !to || to <= from) return blocked;

    const added: string[] = [];
    const current = new Date(`${from}T00:00:00Z`);

    while (current.toISOString().slice(0, 10) < to && added.length < 400) {
        const date = current.toISOString().slice(0, 10);
        if (date >= availableFrom && date < hostingEndDate) added.push(date);
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return [...new Set([...blocked, ...added])].sort();
}

const toIsoDay = (date: Date) =>
    [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

const shortDate = (date: string) => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
};

const pickerStyle = {
    '--rdp-accent-color': '#B48353',
    '--rdp-day-width': '34px',
    '--rdp-day-height': '34px',
    '--rdp-day_button-width': '30px',
    '--rdp-day_button-height': '30px',
} as React.CSSProperties;

// On/off switch, same look as the form's other switches.
const Switch: React.FC<{
    on: boolean;
    onToggle: () => void;
    label: string;
    onColor?: string;
}> = ({ on, onToggle, label, onColor = 'bg-green-600' }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${on ? onColor : 'bg-gray-500'}`}
    >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
    </button>
);

// "No end date" switch, used for each room type and for a single-price BnB.
export const NoEndDateSwitch: React.FC<{
    value: boolean;
    onChange: (next: boolean) => void;
}> = ({ value, onChange }) => (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E2D3C2] dark:border-[#38322D] p-3">
        <div className="min-w-0">
            <p className="text-sm font-semibold text-[#242424] dark:text-[#F5F1E8]">Always open</p>
            <p className="text-xs text-[#77716C] dark:text-[#A3A3A3] mt-1">
                Guests can book up to 12 months ahead. Block nights you're not available.
            </p>
        </div>
        <Switch on={value} onToggle={() => onChange(!value)} label="Always open" />
    </div>
);

// "From" / "To (Check-out)" date field, same look as the building's
// Block Specific Dates in the BnB form.
const DateField: React.FC<{
    label: string;
    value: string;
    onPick: (date: string) => void;
    isDisabled: (date: string) => boolean;
    // Month the calendar opens on (e.g. the start of the hosting period).
    openMonth?: string;
    strongLabel?: boolean;
}> = ({ label, value, onPick, isDisabled, openMonth, strongLabel }) => (
    <div>
        <label className={`block text-xs mb-2 ${strongLabel ? 'font-bold' : 'font-semibold'}`}>{label}</label>
        <details className="relative">
            <summary className="flex items-center justify-between cursor-pointer rounded-lg border border-[#B48353]/40 p-3 text-sm list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#B48353]" />
                    {value ? shortDate(value) : 'Select date'}
                </span>
                <ChevronDown className="w-4 h-4 text-[#B48353]" />
            </summary>

            <div className="absolute left-0 top-full z-50 mt-2 max-w-[calc(100vw-3rem)] rounded-xl border border-[#B48353]/40 bg-[#F8F5EF] dark:bg-[#202020] p-2 shadow-2xl">
                <DayPicker
                    mode="single"
                    weekStartsOn={0}
                    selected={value ? new Date(`${value}T12:00:00`) : undefined}
                    defaultMonth={
                        value || openMonth ? new Date(`${value || openMonth}T12:00:00`) : undefined
                    }
                    onSelect={(date: Date | undefined) => {
                        if (date) onPick(toIsoDay(date));
                    }}
                    disabled={(date: Date) => isDisabled(toIsoDay(date))}
                    style={pickerStyle}
                />

                <button
                    type="button"
                    disabled={!value}
                    onClick={(event) => {
                        event.currentTarget.closest('details')?.removeAttribute('open');
                    }}
                    className="mt-2 mx-auto block w-16 rounded-lg bg-[#B48353] px-3 py-1.5 text-xs font-bold text-white shadow-md disabled:bg-[#9B9086] disabled:opacity-80 disabled:cursor-not-allowed"
                >
                    OK
                </button>
            </div>
        </details>
    </div>
);

// Block a range of nights for one room type: From -> To (Check-out).
// Collapsed by default, like the building's Block Specific Dates.
const BlockRange: React.FC<{
    availableFrom: string;
    hostingEndDate: string;
    blockedCount: number;
    onBlock: (from: string, to: string) => void;
}> = ({ availableFrom, hostingEndDate, blockedCount, onBlock }) => {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    return (
        <details className="rounded-xl border border-[#E2D3C2] dark:border-[#38322D]">
            <summary className="flex items-center justify-between gap-3 cursor-pointer p-3 list-none [&::-webkit-details-marker]:hidden">
                <div>
                    <p className="text-sm font-semibold">Block Specific Dates</p>
                    <p className="text-xs text-[#A3A3A3] mt-1">{blockedCount} blocked nights - Optional</p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#B48353]" />
            </summary>

            <div className="p-3 space-y-3">
                <p className="text-xs text-[#A3A3A3]">Choose dates within this room type's hosting period.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DateField
                        label="From"
                        value={from}
                        onPick={(date) => {
                            setFrom(date);
                            setTo('');
                        }}
                        isDisabled={(date) => date < availableFrom || date >= hostingEndDate}
                        openMonth={availableFrom}
                    />
                    <DateField
                        label="To (Check-out)"
                        value={to}
                        onPick={setTo}
                        isDisabled={(date) => !from || date <= from || date > hostingEndDate}
                        openMonth={from || availableFrom}
                    />
                </div>

                <button
                    type="button"
                    disabled={!from || !to}
                    onClick={() => {
                        onBlock(from, to);
                        setFrom('');
                        setTo('');
                    }}
                    className="w-full rounded-xl bg-[#B48353] px-4 py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Block Dates
                </button>
            </div>
        </details>
    );
};

// Every night of the hosting period, with a heading at each new month.
export function nightsInPeriod(availableFrom?: string, hostingEndDate?: string) {
    if (!availableFrom || !hostingEndDate || hostingEndDate <= availableFrom) return [];

    const nights: { date: string; day: number; month: string; monthHeading?: string }[] = [];
    const current = new Date(`${availableFrom}T00:00:00Z`);
    let lastMonth = -1;

    while (nights.length < 366) {
        const date = current.toISOString().slice(0, 10);
        if (date >= hostingEndDate) break;

        const month = current.getUTCMonth();
        nights.push({
            date,
            day: current.getUTCDate(),
            month: MONTHS[month],
            monthHeading: month !== lastMonth ? `${MONTH_NAMES[month]} ${current.getUTCFullYear()}` : undefined,
        });
        lastMonth = month;
        current.setUTCDate(current.getUTCDate() + 1);
    }

    return nights;
}

const calendarStyle = {
    '--rdp-accent-color': '#B48353',
    '--rdp-day-width': 'auto',
    '--rdp-day-height': '38px',
    '--rdp-day_button-width': '34px',
    '--rdp-day_button-height': '34px',
} as React.CSSProperties;

// Green = open, grey = blocked. Set on the button itself, because the
// calendar's own stylesheet overrides Tailwind colour classes on days.
const OPEN_NIGHT: React.CSSProperties = { backgroundColor: '#047857', color: '#FFFFFF' };
const BLOCKED_NIGHT: React.CSSProperties = {
    backgroundColor: '#6B7280',
    color: '#FFFFFF',
    textDecoration: 'line-through',
};

const NightButton = (props: DayButtonProps) => (
    <DayButton
        {...props}
        style={{
            ...props.style,
            ...(props.modifiers.blocked ? BLOCKED_NIGHT : props.modifiers.open ? OPEN_NIGHT : {}),
        }}
    />
);

// Stretch the month to the full width of its box (the calendar's own
// stylesheet keeps it small and centred).
const fullWidthCalendar = {
    root: { width: '100%' },
    months: { width: '100%', maxWidth: 'none' },
    month: { width: '100%' },
    month_grid: { width: '100%' },
    day_button: { margin: '0 auto' },
};

// First day of a date's month (for the calendar's month limits).
const monthOf = (date: string) => new Date(`${date.slice(0, 8)}01T12:00:00`);

// One month at a time, like Airbnb's calendar: tap a night to block or
// unblock it. Nights outside the bookable period are greyed out.
// `from` = first night guests can book, `end` = first night AFTER the period.
export const BlockNightsCalendar: React.FC<{
    from: string;
    end: string;
    blocked: string[];
    onToggle: (date: string) => void;
    hint?: string;
}> = ({ from, end, blocked, onToggle, hint = 'Tap a night to block or unblock it.' }) => {
    const nights = nightsInPeriod(from, end);
    if (nights.length === 0) return null;

    const blockedSet = new Set(blocked);
    const openCount = nights.filter((night) => !blockedSet.has(night.date)).length;
    const lastNight = nights[nights.length - 1].date;
    const inPeriod = (date: string) => date >= from && date < end;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Availability Preview</p>
                <span className="text-xs text-green-600">
                    {openCount} of {nights.length} nights available
                </span>
            </div>

            <div className="rounded-xl border border-[#E2D3C2] dark:border-[#38322D] p-2">
                {/* New start date: show that month (the key on this div makes
                    the calendar start again on the new month). */}
                <div key={from} className="w-full">
                    <DayPicker
                        weekStartsOn={0}
                        defaultMonth={monthOf(from)}
                        startMonth={monthOf(from)}
                        endMonth={monthOf(lastNight)}
                        disabled={(date: Date) => !inPeriod(toIsoDay(date))}
                        modifiers={{
                            open: (date: Date) => inPeriod(toIsoDay(date)) && !blockedSet.has(toIsoDay(date)),
                            blocked: (date: Date) => inPeriod(toIsoDay(date)) && blockedSet.has(toIsoDay(date)),
                        }}
                        components={{ DayButton: NightButton }}
                        onDayClick={(date: Date, modifiers: { disabled?: boolean }) => {
                            if (!modifiers.disabled) onToggle(toIsoDay(date));
                        }}
                        style={calendarStyle}
                        styles={fullWidthCalendar}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#A3A3A3]">
                <span>{'\u{1F7E2}'} Available</span>
                <span>{'\u26AA'} Blocked</span>
            </div>
            <p className="text-xs text-[#77716C] dark:text-[#A3A3A3]">{hint}</p>
        </div>
    );
};

export const BnbUnitTypesEditor: React.FC<BnbUnitTypesEditorProps> = ({
    value,
    onChange,
    buildingPeriod,
    buildingBlocked = [],
    buildingStay,
    today = kenyaTodayIso(),
}) => {
    const enabled = value.length > 0;
    const latestStart = addDays(today, 365);

    // The part of a room type's period guests can still book:
    // from today (or its start date, if later) to its end.
    const bookableWindow = (draft: BnbUnitTypeDraft) => {
        const end = periodEndDate(draft.availableFrom, draft.hostingDurationNights, draft.openEnded, today);
        const from = draft.availableFrom > today ? draft.availableFrom : today;
        return { end, from: end ? from : '' };
    };

    const patch = (id: string, changes: Partial<BnbUnitTypeDraft>) => {
        onChange(value.map((draft) => (draft.id === id ? { ...draft, ...changes } : draft)));
    };

    const update = (id: string, field: keyof BnbUnitTypeDraft, text: string) => {
        patch(id, { [field]: text } as Partial<BnbUnitTypeDraft>);
    };

    const blockRange = (draft: BnbUnitTypeDraft, from: string, to: string) => {
        const bookable = bookableWindow(draft);
        if (!bookable.end) return;
        patch(draft.id, {
            blockedDates: blockNightRange(draft.blockedDates ?? [], from, to, bookable.from, bookable.end),
        });
    };

    const toggleNight = (draft: BnbUnitTypeDraft, date: string) => {
        const blocked = new Set(draft.blockedDates ?? []);
        if (blocked.has(date)) blocked.delete(date);
        else blocked.add(date);
        patch(draft.id, { blockedDates: [...blocked].sort() });
    };

    const remove = (id: string) => {
        const draft = value.find((item) => item.id === id);
        const label = draft?.name.trim() || 'this room type';

        if (draft && !hasContent(draft)) {
            onChange(value.filter((item) => item.id !== id));
            return;
        }

        if (value.length === 1) {
            if (!window.confirm(`Remove ${label}? Your BnB will go back to a single nightly price.`)) return;
        } else if (!window.confirm(`Remove ${label}?`)) {
            return;
        }

        onChange(value.filter((item) => item.id !== id));
    };

    const toggle = () => {
        if (enabled) {
            if (
                value.some(hasContent) &&
                !window.confirm(
                    'Remove all room types? Your BnB will go back to a single nightly price.'
                )
            ) {
                return;
            }
            onChange([]);
        } else {
            onChange([
                emptyUnitTypeDraft(buildingBlocked, buildingPeriod, today, buildingStay),
                emptyUnitTypeDraft(buildingBlocked, buildingPeriod, today, buildingStay),
            ]);
        }
    };

    // A new room type starts with the same dates and minimum/maximum
    // nights as the one above it.
    const addRoomType = () => {
        const above = value[value.length - 1];
        const period = above && above.availableFrom ? above : buildingPeriod;
        const stay = above ? { minNights: above.minNights, maxNights: above.maxNights } : buildingStay;
        onChange([...value, emptyUnitTypeDraft(buildingBlocked, period, today, stay)]);
    };

    const numberField = (
        draft: BnbUnitTypeDraft,
        field: keyof BnbUnitTypeDraft,
        label: string,
        placeholder?: string,
        hint?: string
    ) => (
        <div>
            <label className="block text-xs font-bold mb-2">{label}</label>
            <input
                type="text"
                inputMode="numeric"
                value={draft[field] as string}
                onChange={(event) => update(draft.id, field, digitsOnly(event.target.value))}
                placeholder={placeholder}
                className={inputClass}
            />
            {hint && <p className="text-xs text-[#77716C] dark:text-[#A3A3A3] mt-1">{hint}</p>}
        </div>
    );

    // Availability & Booking for one room type, inside its card.
    const availabilitySection = (draft: BnbUnitTypeDraft) => {
        const accepting = draft.accepting !== false;
        const bookable = bookableWindow(draft);
        const end = bookable.end;
        const nights = nightsInPeriod(bookable.from, end);
        const blocked = new Set(draft.blockedDates ?? []);
        const openCount = nights.filter((night) => !blocked.has(night.date)).length;
        const blockedCount = nights.length - openCount;

        return (
            <div className="mt-5 space-y-4 border-t border-[#E2D3C2] dark:border-[#38322D] pt-4">
                <p className="flex items-center gap-2 text-sm font-bold text-[#242424] dark:text-[#F5F1E8]">
                    <CalendarDays className="w-4 h-4 text-[#B48353]" />
                    Availability & Booking
                </p>

                <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#242424] dark:text-[#F5F1E8]">
                            Accepting Enquiries
                        </p>
                        <p className={`text-xs mt-1 ${accepting ? 'text-green-600' : 'text-red-500'}`}>
                            {accepting ? '\u{1F7E2} Active' : '\u{1F534} Paused'}
                        </p>
                    </div>
                    <Switch
                        on={accepting}
                        onToggle={() => patch(draft.id, { accepting: !accepting })}
                        label={`Accepting Enquiries for ${draft.name.trim() || 'this room type'}`}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DateField
                        label="Available From *"
                        strongLabel
                        value={draft.availableFrom}
                        onPick={(date) => patch(draft.id, { availableFrom: date })}
                        isDisabled={(date) => date < today || date > latestStart}
                        openMonth={today}
                    />

                    <div>
                        <label className="block text-xs font-bold mb-2">Hosting Duration (Nights) *</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={draft.openEnded ? '' : draft.hostingDurationNights}
                            disabled={draft.openEnded}
                            onChange={(event) => update(draft.id, 'hostingDurationNights', digitsOnly(event.target.value))}
                            placeholder={draft.openEnded ? 'Always open' : 'e.g. 30'}
                            className={`${inputClass} disabled:opacity-60`}
                        />
                    </div>
                </div>

                <NoEndDateSwitch
                    value={draft.openEnded}
                    onChange={(next) => patch(draft.id, { openEnded: next })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {numberField(draft, 'minNights', 'Minimum Nights per Guest *', '1')}
                    {numberField(draft, 'maxNights', 'Maximum Nights per Guest', 'No limit')}
                </div>

                {end && (
                    <div className="flex justify-between gap-3 rounded-xl p-3 bg-[#F0EBE4] dark:bg-[#292521]">
                        <span className="text-sm font-semibold">Hosting period ends</span>
                        <span className="text-sm font-bold text-green-600">
                            {draft.openEnded ? 'Always open' : shortDate(end)}
                        </span>
                    </div>
                )}

                {nights.length === 0 ? (
                    <p className="text-xs text-[#77716C] dark:text-[#A3A3A3]">
                        {end
                            ? 'This hosting period has ended. Choose a new "Available From" date.'
                            : 'Choose "Available From" and the number of nights (or turn on Always open) to see this room type\'s calendar.'}
                    </p>
                ) : (
                    <>
                        <BlockNightsCalendar
                            from={bookable.from}
                            end={end}
                            blocked={draft.blockedDates ?? []}
                            onToggle={(date) => toggleNight(draft, date)}
                            hint="Tap a night to block or unblock it for this room type."
                        />

                        <BlockRange
                            availableFrom={bookable.from}
                            hostingEndDate={end}
                            blockedCount={blockedCount}
                            onBlock={(from, to) => blockRange(draft, from, to)}
                        />
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="mb-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-sm font-bold text-[#242424] dark:text-[#F5F1E8]">
                        Rooms with different prices?
                    </p>
                    <p className="text-xs text-[#77716C] dark:text-[#A3A3A3] mt-1">
                        Turn on if your rooms don't all cost the same, e.g. Standard and Deluxe.
                    </p>
                </div>

                <Switch
                    on={enabled}
                    onToggle={toggle}
                    label="Rooms with different prices"
                    onColor="bg-[#2563EB]"
                />
            </div>

            {enabled && (
                <div className="space-y-4">
                    {value.map((draft, index) => (
                        <div
                            key={draft.id}
                            className="rounded-2xl border border-[#E2D3C2] dark:border-[#38322D] bg-white/60 dark:bg-[#1B1B1B] p-4 sm:p-5"
                        >
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <p className="flex items-center gap-2 text-sm font-bold text-[#242424] dark:text-[#F5F1E8]">
                                    <BedDouble className="w-4 h-4 text-[#2563EB]" />
                                    Room type {index + 1}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => remove(draft.id)}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#B4534C]"
                                    aria-label={`Remove room type ${index + 1}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold mb-2">Name *</label>
                                    <input
                                        type="text"
                                        value={draft.name}
                                        maxLength={80}
                                        onChange={(event) => update(draft.id, 'name', event.target.value)}
                                        placeholder="e.g. Deluxe Room or 2-Bedroom Apartment"
                                        className={inputClass}
                                    />
                                </div>

                                {numberField(draft, 'pricePerNight', 'Nightly Rate (KSh) *', 'e.g. 5000')}
                                {numberField(draft, 'cleaningFee', 'Cleaning Fee (KSh) - Optional', 'e.g. 500')}
                                {numberField(draft, 'maxGuests', 'Maximum Guests *')}
                                {numberField(draft, 'bedrooms', 'Bedrooms *')}
                                {numberField(draft, 'beds', 'Beds *')}
                                {numberField(draft, 'bathrooms', 'Bathrooms *')}
                                {numberField(
                                    draft,
                                    'unitCount',
                                    'Number of identical rooms *',
                                    '1',
                                    'e.g. 5 if you have 5 Standard rooms that are the same'
                                )}
                            </div>

                            {availabilitySection(draft)}
                        </div>
                    ))}

                    {value.length < MAX_BNB_UNIT_TYPES && (
                        <button
                            type="button"
                            onClick={addRoomType}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#2563EB] px-4 py-3 text-sm font-semibold text-[#2563EB]"
                        >
                            <Plus className="w-4 h-4" />
                            Add room type
                        </button>
                    )}

                </div>
            )}
        </div>
    );
};