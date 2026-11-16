import { v } from "convex/values";

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
});