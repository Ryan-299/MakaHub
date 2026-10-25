
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Retrieve all unit categories belonging to one property/building.

export const getByProperty = query({
    args: {
        propertyId: v.id("properties"),
    },

    handler: async (ctx, args) => {
        const units = await ctx.db
            .query("propertyUnitTypes")
            .withIndex("by_property", (q) =>
                q.eq("propertyId", args.propertyId)
            )
            .collect();

        return await Promise.all(
            units.map(async (unit) => {
                const resolvedImages = unit.imageStorageIds?.length
                    ? await Promise.all(
                        unit.imageStorageIds.map((id) => ctx.storage.getUrl(id))
                    )
                    : unit.images ?? [];

                const resolvedVideo = unit.videoStorageId
                    ? await ctx.storage.getUrl(unit.videoStorageId)
                    : unit.video ?? null;

                return {
                    ...unit,
                    resolvedImages: resolvedImages.filter(
                        (url): url is string => Boolean(url)
                    ),
                    resolvedVideo,
                };
            })
        );
    },
});



export const addUnitType = mutation({
    args: {
        propertyId: v.id("properties"),
        type: v.string(),

        monthlyRent: v.number(),
        deposit: v.number(),

        vacancies: v.number(),
        occupied: v.number(),
        underRepair: v.number(),

        serviceCharge: v.optional(v.number()),
        agentFee: v.optional(v.number()),
        viewingFee: v.optional(v.number()),
        waterDeposit: v.optional(v.number()),
        electricityDeposit: v.optional(v.number()),
        otherFees: v.optional(v.number()),

        amenities: v.optional(v.array(v.string())),
        description: v.optional(v.string()),

        // Photos belonging to this particular unit type
        images: v.optional(v.array(v.string())),
        coverPhoto: v.optional(v.string()),

        // Video belonging to this particular unit type
        video: v.optional(v.string()),
        videoName: v.optional(v.string()),
        videoSize: v.optional(v.number()),

        // Convex Storage references
        imageStorageIds: v.optional(
            v.array(v.id("_storage"))
        ),
        coverPhotoStorageId: v.optional(
            v.id("_storage")
        ),
        videoStorageId: v.optional(
            v.id("_storage")
        ),

        // Water and electricity billing information
        waterBillingMethod: v.optional(v.string()),
        waterMonthlyCharge: v.optional(v.number()),
        electricityBillingMethod: v.optional(v.string()),
        electricityRate: v.optional(v.number()),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        // Confirm the building exists
        const property = await ctx.db.get(args.propertyId);

        if (!property) {
            throw new Error("Property not found.");
        }

        // Only the building owner can add unit types
        if (property.lister.id !== identity.subject) {
            throw new Error(
                "You can only manage unit types for your own property."
            );
        }

        const unitType = args.type.trim();

        if (!unitType) {
            throw new Error("Please select a unit type.");
        }

        // Prevent duplicate types within the same building
        const existing = await ctx.db
            .query("propertyUnitTypes")
            .withIndex("by_property_type", (q) =>
                q
                    .eq("propertyId", args.propertyId)
                    .eq("type", unitType)
            )
            .first();

        if (existing) {
            throw new Error(
                "This unit type already exists for this property."
            );
        }

        // Validate financial values
        const amounts = [
            args.monthlyRent,
            args.deposit,
            args.serviceCharge,
            args.agentFee,
            args.viewingFee,
            args.waterDeposit,
            args.electricityDeposit,
            args.otherFees,
            args.waterMonthlyCharge,
            args.electricityRate,
        ];

        if (
            amounts.some(
                (amount) =>
                    amount !== undefined &&
                    (!Number.isFinite(amount) || amount < 0)
            )
        ) {
            throw new Error(
                "Charges must be valid, non-negative amounts."
            );
        }

        // Validate availability counts
        const counts = [
            args.vacancies,
            args.occupied,
            args.underRepair,
        ];

        if (
            counts.some(
                (count) =>
                    !Number.isSafeInteger(count) || count < 0
            )
        ) {
            throw new Error(
                "Unit counts must be non-negative whole numbers."
            );
        }

        // Validate video size if supplied
        if (
            args.videoSize !== undefined &&
            (!Number.isSafeInteger(args.videoSize) ||
                args.videoSize < 0)
        ) {
            throw new Error("Invalid video size.");
        }

        // Create unit category under its parent building
        return await ctx.db.insert("propertyUnitTypes", {
            ...args,
            type: unitType,
            createdAt: new Date().toISOString(),
        });
    },
});

// Update an existing rental unit category.
export const updateUnitType = mutation({
    args: {
        id: v.id("propertyUnitTypes"),

        type: v.optional(v.string()),
        monthlyRent: v.optional(v.number()),
        deposit: v.optional(v.number()),

        vacancies: v.optional(v.number()),
        occupied: v.optional(v.number()),
        underRepair: v.optional(v.number()),

        serviceCharge: v.optional(v.number()),
        agentFee: v.optional(v.number()),
        viewingFee: v.optional(v.number()),
        waterDeposit: v.optional(v.number()),
        electricityDeposit: v.optional(v.number()),
        otherFees: v.optional(v.number()),

        amenities: v.optional(v.array(v.string())),
        description: v.optional(v.string()),

        // Unit-specific photos
        images: v.optional(v.array(v.string())),
        coverPhoto: v.optional(v.string()),

        // Unit-specific video
        video: v.optional(v.string()),
        videoName: v.optional(v.string()),
        videoSize: v.optional(v.number()),

        // Convex Storage references
        imageStorageIds: v.optional(
            v.array(v.id("_storage"))
        ),
        coverPhotoStorageId: v.optional(
            v.id("_storage")
        ),
        videoStorageId: v.optional(
            v.id("_storage")
        ),

        waterBillingMethod: v.optional(v.string()),
        waterMonthlyCharge: v.optional(v.number()),
        electricityBillingMethod: v.optional(v.string()),
        electricityRate: v.optional(v.number()),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        // Find the unit category.
        const unitType = await ctx.db.get(args.id);

        if (!unitType) {
            throw new Error("Unit type not found.");
        }

        // Find its parent building.
        const property = await ctx.db.get(unitType.propertyId);

        if (!property) {
            throw new Error("Parent property not found.");
        }

        // Only the building owner can edit the unit category.
        if (property.lister.id !== identity.subject) {
            throw new Error(
                "You can only edit unit types belonging to your property."
            );
        }

        const { id, ...updates } = args;

        // Validate financial values.
        const amounts = [
            updates.monthlyRent,
            updates.deposit,
            updates.serviceCharge,
            updates.agentFee,
            updates.viewingFee,
            updates.waterDeposit,
            updates.electricityDeposit,
            updates.otherFees,
            updates.waterMonthlyCharge,
            updates.electricityRate,
        ];

        if (
            amounts.some(
                (amount) =>
                    amount !== undefined &&
                    (!Number.isFinite(amount) || amount < 0)
            )
        ) {
            throw new Error(
                "Charges must be valid, non-negative amounts."
            );
        }

        // Validate vacancy counts.
        const counts = [
            updates.vacancies,
            updates.occupied,
            updates.underRepair,
        ];

        if (
            counts.some(
                (count) =>
                    count !== undefined &&
                    (!Number.isSafeInteger(count) || count < 0)
            )
        ) {
            throw new Error(
                "Unit counts must be non-negative whole numbers."
            );
        }
        // Validate video size when updating unit media
        if (
            updates.videoSize !== undefined &&
            (!Number.isSafeInteger(updates.videoSize) ||
                updates.videoSize < 0)
        ) {
            throw new Error("Invalid video size.");
        }
        // Validate and check for duplicate unit types.
        if (updates.type !== undefined) {
            const newType = updates.type.trim();

            if (!newType) {
                throw new Error("Unit type cannot be empty.");
            }

            const existing = await ctx.db
                .query("propertyUnitTypes")
                .withIndex("by_property_type", (q) =>
                    q
                        .eq("propertyId", unitType.propertyId)
                        .eq("type", newType)
                )
                .first();

            if (existing && existing._id !== unitType._id) {
                throw new Error(
                    "This unit type already exists for this property."
                );
            }

            updates.type = newType;
        }

        await ctx.db.patch(unitType._id, {
            ...updates,
            updatedAt: new Date().toISOString(),
        });

        return unitType._id;
    },
});

