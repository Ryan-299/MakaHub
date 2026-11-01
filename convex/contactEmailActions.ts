
"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { createHmac, randomInt } from "node:crypto";

const getCodeHash = (
    secret: string,
    userId: string,
    email: string,
    code: string
) => {
    return createHmac("sha256", secret)
        .update(JSON.stringify([userId, email, code]))
        .digest("hex");
};

// Generate and email a six-digit verification code.
export const requestContactEmailVerification = action({
    args: {
        email: v.string(),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        const secret = process.env.CONTACT_EMAIL_VERIFICATION_SECRET;

        if (!secret) {
            throw new Error("Contact email verification is not configured.");
        }

        const email = args.email.trim().toLowerCase();

        if (
            !email ||
            email.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            throw new Error("Please enter a valid email address.");
        }

        const code = randomInt(0, 1000000)
            .toString()
            .padStart(6, "0");

        const codeHash = getCodeHash(
            secret,
            identity.subject,
            email,
            code
        );

        await ctx.runMutation(
            internal.contactEmailVerification.storePendingCode,
            {
                email,
                codeHash,
            }
        );

        await ctx.runAction(
            internal.emails.sendContactEmailVerificationCode,
            {
                email,
                code,
            }
        );

        return { success: true };
    },
});

// Verify the code entered by the user.
export const verifyContactEmailCode = action({
    args: {
        email: v.string(),
        code: v.string(),
    },

    handler: async (ctx, args): Promise<{ status: string }> => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("You must be signed in.");
        }

        const secret = process.env.CONTACT_EMAIL_VERIFICATION_SECRET;

        if (!secret) {
            throw new Error("Contact email verification is not configured.");
        }

        const email = args.email.trim().toLowerCase();
        const code = args.code.trim();

        if (!/^\d{6}$/.test(code)) {
            throw new Error("Enter the six-digit verification code.");
        }

        const codeHash = getCodeHash(
            secret,
            identity.subject,
            email,
            code
        );

        return await ctx.runMutation(
            internal.contactEmailVerification.completeVerification,
            {
                email,
                codeHash,
            }
        );
    },
});
