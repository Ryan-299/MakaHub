import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

const CODE_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

// Store a pending verification request.
// The verification code itself is never stored here.
export const storePendingCode = internalMutation({
    args: {
        email: v.string(),
        codeHash: v.string(),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) =>
                q.eq("userId", identity.subject)
            )
            .first();

        if (!user || user.role !== "lister") {
            throw new Error("Only listers can verify contact emails.");
        }

        const email = args.email.trim().toLowerCase();

        if (
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            throw new Error("Please enter a valid email address.");
        }

        if (!/^[a-f0-9]{64}$/.test(args.codeHash)) {
            throw new Error("Invalid verification request.");
        }

        if (user.contactEmail?.toLowerCase() === email) {
            throw new Error("This is already your contact email.");
        }

        const now = Date.now();

        const previous = await ctx.db
            .query("contactEmailVerifications")
            .withIndex("by_userId", (q) =>
                q.eq("userId", identity.subject)
            )
            .collect();

        if (
            previous.some(
                (entry) => now - entry.lastSentAt < RESEND_COOLDOWN_MS
            )
        ) {
            throw new Error(
                "Please wait one minute before requesting another code."
            );
        }

        for (const entry of previous) {
            await ctx.db.delete(entry._id);
        }

        await ctx.db.insert("contactEmailVerifications", {
            userId: identity.subject,
            email,
            codeHash: args.codeHash,
            expiresAt: now + CODE_EXPIRY_MS,
            attempts: 0,
            createdAt: now,
            lastSentAt: now,
        });

        return { success: true };
    },
});

// Validate the submitted code hash and save the contact email.
export const completeVerification = internalMutation({
    args: {
        email: v.string(),
        codeHash: v.string(),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) =>
                q.eq("userId", identity.subject)
            )
            .first();

        if (!user || user.role !== "lister") {
            throw new Error("Only listers can verify contact emails.");
        }

        const pending = await ctx.db
            .query("contactEmailVerifications")
            .withIndex("by_userId", (q) =>
                q.eq("userId", identity.subject)
            )
            .first();

        if (!pending) {
            return { status: "missing" };
        }

        const now = Date.now();

        if (now > pending.expiresAt) {
            await ctx.db.delete(pending._id);
            return { status: "expired" };
        }

        if (pending.attempts >= MAX_ATTEMPTS) {
            return { status: "locked" };
        }

        if (
            pending.email !== args.email.trim().toLowerCase() ||
            pending.codeHash !== args.codeHash
        ) {
            const attempts = pending.attempts + 1;

            await ctx.db.patch(pending._id, { attempts });

            return {
                status: attempts >= MAX_ATTEMPTS ? "locked" : "invalid",
            };
        }

        await ctx.db.patch(user._id, {
            contactEmail: pending.email,
        });

        await ctx.db.delete(pending._id);

        await ctx.db.insert("notifications", {
            recipientUserId: identity.subject,
            title: "Contact Email Updated",
            message:
                "Your contact email has been successfully updated. Seekers can now use this email to contact you through your public profile.",
            time: new Date(now).toISOString(),
            type: "system",
            read: false,
        });
        await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
            recipientUserId: identity.subject,
            title: "📧 Contact Email Updated",
            message:
                "Your contact email has been successfully updated. Seekers can now use this email to contact you through your public profile.",
        });
        return { status: "verified" };
    },
});
