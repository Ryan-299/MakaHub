import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// Admin-only announcement to many users at once (e.g. "New BnBs in Nyahururu").
//
// This is an INTERNAL function: the app and the public internet cannot call it.
// Only someone with access to the Convex dashboard can run it
// (Dashboard -> Functions -> broadcasts:send -> Run).
//
// Every chosen user gets an in-app notification (the bell / Notifications page).
// Users who have phone notifications turned on also get a push.
//
// Always run with dryRun: true first. It changes nothing and only reports
// how many people would receive the message.
export const send = internalMutation({
    args: {
        audience: v.union(
            v.literal("all"),
            v.literal("seekers"),
            v.literal("listers")
        ),
        title: v.string(),
        message: v.string(),
        // Where tapping the push opens, e.g. "/" (must start with "/").
        url: v.optional(v.string()),
        dryRun: v.boolean(),
    },

    handler: async (ctx, args) => {
        const title = args.title.trim();
        const message = args.message.trim();

        if (!title || title.length > 80) {
            throw new Error("Title must be 1-80 characters.");
        }
        if (!message || message.length > 300) {
            throw new Error("Message must be 1-300 characters.");
        }

        const url =
            args.url && args.url.startsWith("/") && !args.url.startsWith("//")
                ? args.url
                : "/";

        const users = await ctx.db.query("users").collect();

        const recipients = users.filter((user) => {
            if (user.isSuspended) return false;
            if (user.role === "admin") return false;
            if (args.audience === "seekers") return user.role === "seeker";
            if (args.audience === "listers") return user.role === "lister";
            return true;
        });

        // Only schedule pushes for people who have at least one registered device.
        const subscriptions = await ctx.db.query("pushSubscriptions").collect();
        const hasDevice = new Set(subscriptions.map((s) => s.userId));

        const pushRecipients = recipients.filter((user) =>
            hasDevice.has(user.userId)
        );

        if (args.dryRun) {
            return {
                dryRun: true,
                inAppNotifications: recipients.length,
                pushRecipients: pushRecipients.length,
            };
        }

        const time = new Date().toISOString();

        for (const user of recipients) {
            await ctx.db.insert("notifications", {
                recipientUserId: user.userId,
                title,
                message,
                time,
                type: "announcement",
                read: false,
            });
        }

        // Spread pushes out slightly so they are not all sent at the same instant.
        let delay = 0;
        for (const user of pushRecipients) {
            await ctx.scheduler.runAfter(delay, internal.pushSender.sendToRecipient, {
                recipientUserId: user.userId,
                title,
                message,
                url,
            });
            delay += 200;
        }

        return {
            dryRun: false,
            inAppNotifications: recipients.length,
            pushRecipients: pushRecipients.length,
        };
    },
});