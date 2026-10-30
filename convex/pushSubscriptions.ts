
import { internalQuery, mutation } from "./_generated/server";
import { v } from "convex/values";

// Register a device for the currently signed-in user.
export const register = mutation({
    args: {
        endpoint: v.string(),
        p256dh: v.string(),
        auth: v.string(),
        expirationTime: v.optional(v.number()),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        // Reject malformed subscription information.
        if (
            args.endpoint.length > 4096 ||
            !args.p256dh ||
            !args.auth
        ) {
            throw new Error("Invalid push subscription.");
        }

        try {
            const url = new URL(args.endpoint);

            if (
                url.protocol !== "https:" ||
                url.username ||
                url.password
            ) {
                throw new Error("Invalid endpoint.");
            }
        } catch {
            throw new Error("Invalid push endpoint.");
        }

        const now = Date.now();

        // Avoid duplicate subscriptions for the same device.
        const existing = await ctx.db
            .query("pushSubscriptions")
            .withIndex("by_endpoint", (q) =>
                q.eq("endpoint", args.endpoint)
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                userId: identity.subject,
                p256dh: args.p256dh,
                auth: args.auth,
                expirationTime: args.expirationTime,
                updatedAt: now,
            });

            return existing._id;
        }

        return await ctx.db.insert("pushSubscriptions", {
            userId: identity.subject,
            endpoint: args.endpoint,
            p256dh: args.p256dh,
            auth: args.auth,
            expirationTime: args.expirationTime,
            createdAt: now,
            updatedAt: now,
        });
    },
});

// Remove the current user's registered device.
export const unregister = mutation({
    args: {
        endpoint: v.string(),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        const existing = await ctx.db
            .query("pushSubscriptions")
            .withIndex("by_endpoint", (q) =>
                q.eq("endpoint", args.endpoint)
            )
            .first();

        if (!existing || existing.userId !== identity.subject) {
            return false;
        }

        await ctx.db.delete(existing._id);
        return true;
    },
});

export const listForRecipient = internalQuery({
    args: {
        userId: v.string(),
    },

    handler: async (ctx, args) => {
        return await ctx.db
            .query("pushSubscriptions")
            .withIndex("by_user", (q) =>
                q.eq("userId", args.userId)
            )
            .collect();
    },
});