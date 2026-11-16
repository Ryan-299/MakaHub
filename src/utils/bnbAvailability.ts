
import type { BnbDetails } from '../types';

const DAY_MS = 86400000;

export const toDayNumber = (value: string): number | null => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

    const ms = Date.parse(`${value}T00:00:00Z`);
    if (Number.isNaN(ms)) return null;

    if (new Date(ms).toISOString().slice(0, 10) !== value) {
        return null;
    }

    return ms / DAY_MS;
};

export const kenyaToday = (): number => {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Nairobi',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());

    const get = (type: string) =>
        parts.find((part) => part.type === type)?.value ?? '';

    return toDayNumber(
        `${get('year')}-${get('month')}-${get('day')}`
    )!;
};

type Schedule = {
    start: number;
    end: number;
    today: number;
    blocked: Set<number>;
    minNights: number;
    maxNights: number | null;
};

export const readSchedule = (
    bnb: BnbDetails,
    today: number
): Schedule | null => {
    const start = toDayNumber(bnb.availableFrom ?? '');
    const duration = bnb.hostingDurationNights;

    if (start === null || !duration || duration <= 0) {
        return null;
    }

    const blocked = new Set(
        (bnb.blockedDates ?? [])
            .map(toDayNumber)
            .filter((day): day is number => day !== null)
    );

    return {
        start,
        end: start + duration,
        today,
        blocked,
        minNights: bnb.minNights || 1,
        maxNights: bnb.maxNights || null,
    };
};

export const isNightOpen = (
    schedule: Schedule,
    night: number
): boolean =>
    night >= schedule.today &&
    night >= schedule.start &&
    night < schedule.end &&
    !schedule.blocked.has(night);

export const stayProblem = (
    schedule: Schedule,
    checkIn: number,
    checkOut: number
): string | null => {
    const nights = checkOut - checkIn;

    if (nights <= 0) return 'Invalid stay dates';

    if (nights < schedule.minNights) {
        return 'Stay is shorter than the minimum nights';
    }

    if (
        schedule.maxNights !== null &&
        nights > schedule.maxNights
    ) {
        return 'Stay exceeds the maximum nights';
    }

    for (let night = checkIn; night < checkOut; night++) {
        if (!isNightOpen(schedule, night)) {
            return 'One or more nights are unavailable';
        }
    }

    return null;
};
