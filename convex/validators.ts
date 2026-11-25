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
});

// Details that only BnB listings have. Rental listings never use this.
export const bnbDetailsValidator = v.object({
    pricePerNight: v.number(),
    cleaningFee: v.optional(v.number()),
    minNights: v.optional(v.number()),

    maxNights: v.optional(v.number()),
    availableFrom: v.optional(v.string()),
    hostingDurationNights: v.optional(v.number()),

    maxGuests: v.number(),
    bedrooms: v.number(),
    beds: v.number(),
    bathrooms: v.number(),
    checkInTime: v.optional(v.string()),
    checkOutTime: v.optional(v.string()),
    houseRules: v.optional(v.string()),

    blockedDates: v.optional(v.array(v.string())),

    accepting: v.boolean(),

    // Optional: several unit types with different prices in one building.
    // BnBs without this keep working exactly as before (one price, one calendar).
    unitTypes: v.optional(v.array(bnbUnitTypeValidator)),
});
