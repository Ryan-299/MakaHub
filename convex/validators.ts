import { v } from "convex/values";

// One bookable unit type inside a BnB building
// (e.g. "Standard Room", "Deluxe Room", "2-Bedroom Apartment").
// Each type has its own price, size, photos and calendar.
export const bnbUnitTypeValidator = v.object({
    // Stable id for this unit type inside the listing (used by bookings and calendars).
    id: v.string(),
    name: v.string(),

    pricePerNight: v.number(),
    cleaningFee: v.optional(v.number()),

    maxGuests: v.number(),
    bedrooms: v.number(),
    beds: v.number(),
    bathrooms: v.number(),

    // How many identical units of this type the building has (defaults to 1).
    unitCount: v.optional(v.number()),

    // Photos specific to this unit type.
    imageStorageIds: v.optional(v.array(v.id("_storage"))),

    // Nights this unit type is fully booked/unavailable ("YYYY-MM-DD").
    blockedDates: v.optional(v.array(v.string())),

    // Host can pause one unit type without pausing the whole building.
    accepting: v.optional(v.boolean()),

    // Optional: this unit type's own availability. When availableFrom is
    // missing, the unit type uses the building's hosting period.
    availableFrom: v.optional(v.string()),
    hostingDurationNights: v.optional(v.number()),
    openEnded: v.optional(v.boolean()),

    // Optional: this unit type's own stay rules. When minNights is
    // missing, the unit type uses the building's minimum/maximum nights.
    minNights: v.optional(v.number()),
    maxNights: v.optional(v.number()),
});

// Details that only BnB listings have. Rental listings never use this.
export const bnbDetailsValidator = v.object({
    pricePerNight: v.number(),
    cleaningFee: v.optional(v.number()),
    minNights: v.optional(v.number()),

    maxNights: v.optional(v.number()),
    availableFrom: v.optional(v.string()),
    hostingDurationNights: v.optional(v.number()),
    // "No end date": guests can book up to 12 months ahead, rolling.
    // hostingDurationNights is still stored (up to today + 12 months) so
    // screens that only understand a fixed period keep working.
    openEnded: v.optional(v.boolean()),

    maxGuests: v.number(),
    bedrooms: v.number(),
    beds: v.number(),
    bathrooms: v.number(),
    checkInTime: v.optional(v.string()),
    checkOutTime: v.optional(v.string()),
    houseRules: v.optional(v.string()),

    blockedDates: v.optional(v.array(v.string())),

    // For BnBs with unit types this is worked out by the server:
    // the building switch is on AND at least one unit type is accepting.
    accepting: v.boolean(),

    // BnBs with unit types: the host's whole-BnB pause switch, kept
    // separate so pausing/resuming the building never changes the
    // individual unit types' own accepting settings.
    buildingAccepting: v.optional(v.boolean()),

    // Optional: several unit types with different prices in one building.
    // BnBs without this keep working exactly as before (one price, one calendar).
    unitTypes: v.optional(v.array(bnbUnitTypeValidator)),
});