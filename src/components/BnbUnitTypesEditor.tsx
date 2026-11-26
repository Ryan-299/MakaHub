import React from 'react';
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
    // This room type's own calendar (blocked nights, "YYYY-MM-DD").
    blockedDates?: string[];
    // Carried over unchanged from an existing listing.
    imageStorageIds?: string[];
    accepting?: boolean;
    // Form-only: true for room types already saved on the listing.
    isSaved?: boolean;
};

export const MAX_BNB_UNIT_TYPES = 30;

const newUnitTypeId = () =>
    `ut_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// A new room type starts with the building's blocked nights, so turning
// room types on never reopens nights the host had already blocked.
export const emptyUnitTypeDraft = (startingBlocked: string[] = []): BnbUnitTypeDraft => ({
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
});

export const draftFromSaved = (type: SavedBnbUnitType): BnbUnitTypeDraft => ({
    id: type.id,
    name: type.name,
    pricePerNight: String(type.pricePerNight),
    cleaningFee: type.cleaningFee !== undefined ? String(type.cleaningFee) : '',
    maxGuests: String(type.maxGuests),
    bedrooms: String(type.bedrooms),
    beds: String(type.beds),
    bathrooms: String(type.bathrooms),
    unitCount: String(type.unitCount ?? 1),
    imageStorageIds: type.imageStorageIds,
    blockedDates: type.blockedDates ?? [],
    accepting: type.accepting,
    isSaved: true,
});

// Same checks as the server (prepareBnbUnitTypes), with friendly messages.
export function buildUnitTypesPayload(
    drafts: BnbUnitTypeDraft[]
): { ok: true; unitTypes: SavedBnbUnitType[] } | { ok: false; error: string } {
    if (drafts.length === 0) {
        return { ok: false, error: 'Add at least one room type.' };
    }

    if (drafts.length > MAX_BNB_UNIT_TYPES) {
        return { ok: false, error: `A BnB can have up to ${MAX_BNB_UNIT_TYPES} room types.` };
    }

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
            return { ok: false, error: `"How many of this type" for "${label}" must be between 1 and 500.` };
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
//   requires that). Upcoming blocked nights that fall OUTSIDE a changed
//   period are returned in `droppedDates`, so the form can warn the host
//   before saving instead of removing them silently.
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
        // New unit type: inherit the building's blocked nights.
        const source = type.blockedDates ?? options.buildingBlocked;

        for (const date of droppedUpcoming(source)) dropped.add(date);

        return { ...type, blockedDates: [...new Set(source.filter(inPeriod))].sort() };
    });

    return { buildingBlocked, unitTypes, droppedDates: [...dropped].sort() };
}

// Building-level summary the server also computes: the "from" price is
// the cheapest type; capacity is the largest type.
export function summarizeUnitTypes(unitTypes: SavedBnbUnitType[]) {
    const cheapest = unitTypes.reduce((low, type) =>
        type.pricePerNight < low.pricePerNight ? type : low
    );

    return {
        pricePerNight: cheapest.pricePerNight,
        cleaningFee: cheapest.cleaningFee,
        maxGuests: Math.max(...unitTypes.map((type) => type.maxGuests)),
        bedrooms: Math.max(...unitTypes.map((type) => type.bedrooms)),
        beds: Math.max(...unitTypes.map((type) => type.beds)),
        bathrooms: Math.max(...unitTypes.map((type) => type.bathrooms)),
    };
}

const inputClass =
    'w-full px-4 py-3 rounded-xl border border-[#E2D3C2] dark:border-[#38322D] bg-white dark:bg-[#202020]';

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');

interface BnbUnitTypesEditorProps {
    value: BnbUnitTypeDraft[];
    onChange: (next: BnbUnitTypeDraft[]) => void;
    // Hosting period ("YYYY-MM-DD"; end = first night AFTER the period).
    availableFrom?: string;
    hostingEndDate?: string;
    // The building's blocked nights: new room types start with these.
    buildingBlocked?: string[];
}

// Room types already saved on the listing. Only removing these asks
// first; cards still being typed are removed at once.
const hasContent = (draft: BnbUnitTypeDraft) =>
    Boolean(draft.isSaved) || Boolean(draft.imageStorageIds?.length);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

export const BnbUnitTypesEditor: React.FC<BnbUnitTypesEditorProps> = ({
    value,
    onChange,
    availableFrom,
    hostingEndDate,
    buildingBlocked = [],
}) => {
    const enabled = value.length > 0;
    const nights = nightsInPeriod(availableFrom, hostingEndDate);

    const toggleNight = (id: string, date: string) => {
        onChange(
            value.map((draft) => {
                if (draft.id !== id) return draft;
                const blocked = new Set(draft.blockedDates ?? []);
                if (blocked.has(date)) blocked.delete(date);
                else blocked.add(date);
                return { ...draft, blockedDates: [...blocked].sort() };
            })
        );
    };

    const update = (id: string, field: keyof BnbUnitTypeDraft, text: string) => {
        onChange(value.map((draft) => (draft.id === id ? { ...draft, [field]: text } : draft)));
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
            onChange([emptyUnitTypeDraft(buildingBlocked), emptyUnitTypeDraft(buildingBlocked)]);
        }
    };

    const numberField = (draft: BnbUnitTypeDraft, field: keyof BnbUnitTypeDraft, label: string, placeholder?: string) => (
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
        </div>
    );

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

                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label="Rooms with different prices"
                    onClick={toggle}
                    className={`relative shrink-0 w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-[#2563EB]' : 'bg-gray-500'}`}
                >
                    <span
                        className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${enabled ? 'left-6' : 'left-1'}`}
                    />
                </button>
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
                                {numberField(draft, 'unitCount', 'How many of this type? *', '1')}
                            </div>

                            {(() => {
                                const blocked = new Set(draft.blockedDates ?? []);
                                const openCount = nights.filter((night) => !blocked.has(night.date)).length;

                                return (
                                    <details className="mt-4 rounded-xl border border-[#E2D3C2] dark:border-[#38322D]">
                                        <summary className="flex items-center justify-between gap-3 cursor-pointer p-3 list-none [&::-webkit-details-marker]:hidden">
                                            <span className="flex items-center gap-2 text-sm font-semibold">
                                                <CalendarDays className="w-4 h-4 text-[#B48353]" />
                                                Calendar
                                            </span>
                                            <span className="flex items-center gap-2 text-xs text-[#77716C] dark:text-[#A3A3A3]">
                                                {nights.length > 0
                                                    ? `${openCount} of ${nights.length} nights available`
                                                    : 'Set your hosting period first'}
                                                <ChevronDown className="w-4 h-4 text-[#B48353]" />
                                            </span>
                                        </summary>

                                        <div className="p-3 pt-0 space-y-3">
                                            {nights.length === 0 ? (
                                                <p className="text-xs text-[#77716C] dark:text-[#A3A3A3]">
                                                    Choose "Available From" and the number of nights below, then come back here.
                                                </p>
                                            ) : (
                                                <>
                                                    <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pb-2 pr-1">
                                                        {nights.map((night) => {
                                                            const isBlocked = blocked.has(night.date);

                                                            return (
                                                                <React.Fragment key={night.date}>
                                                                    {night.monthHeading && (
                                                                        <p className="basis-full pt-1 text-xs font-semibold text-[#77716C] dark:text-[#A3A3A3]">
                                                                            {night.monthHeading}
                                                                        </p>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleNight(draft.id, night.date)}
                                                                        aria-pressed={isBlocked}
                                                                        aria-label={`${night.day} ${night.month}: ${isBlocked ? 'blocked' : 'available'}`}
                                                                        className={`flex min-w-[42px] h-[48px] shrink-0 flex-col items-center justify-center rounded-lg text-white ${isBlocked ? 'bg-gray-500' : 'bg-emerald-700'}`}
                                                                    >
                                                                        <span className="text-sm font-bold">{night.day}</span>
                                                                        <span className="text-[10px]">{night.month}</span>
                                                                    </button>
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="text-xs text-[#77716C] dark:text-[#A3A3A3]">
                                                        Tap a night to block or unblock it for this room type.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </details>
                                );
                            })()}
                        </div>
                    ))}

                    {value.length < MAX_BNB_UNIT_TYPES && (
                        <button
                            type="button"
                            onClick={() => onChange([...value, emptyUnitTypeDraft(buildingBlocked)])}
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