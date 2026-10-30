
"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import * as webPush from "web-push";

export const sendToRecipient = internalAction({

    args: {
        recipientUserId: v.string(),
        title: v.string(),
        message: v.string(),
        url: v.optional(v.string()),
    },


    handler: async (ctx, args) => {
        const publicKey = process.env.VAPID_PUBLIC_KEY;
        const privateKey = process.env.VAPID_PRIVATE_KEY;

        if (!publicKey || !privateKey) {
            throw new Error("Rentike VAPID keys are not configured.");
        }

        const subscriptions = await ctx.runQuery(
            internal.pushSubscriptions.listForRecipient,
            { userId: args.recipientUserId }
        );

        const allowedHosts = new Set([
            "fcm.googleapis.com",
            "updates.push.services.mozilla.com",
            "web.push.apple.com",
        ]);

        let delivered = 0;

        for (const device of subscriptions) {
            try {
                const endpoint = new URL(device.endpoint);

                if (
                    endpoint.protocol !== "https:" ||
                    !allowedHosts.has(endpoint.hostname)
                ) {
                    console.warn("Unsupported push service endpoint.");
                    continue;
                }

                await webPush.sendNotification(
                    {
                        endpoint: device.endpoint,
                        keys: {
                            p256dh: device.p256dh,
                            auth: device.auth,
                        },
                    },
                    JSON.stringify({
                        title: args.title,
                        body: args.message,
                        url: args.url?.startsWith("/") && !args.url.startsWith("//")
                            ? args.url
                            : "/",
                    }),
                    {
                        vapidDetails: {
                            subject: "mailto:support@rentike.co.ke",
                            publicKey,
                            privateKey,
                        },
                        TTL: 3600,
                        timeout: 10000,
                    }
                );

                delivered++;
            } catch (error) {
                console.warn(
                    "Rentike push delivery failed:",
                    error instanceof Error ? error.message : "Unknown error"
                );
            }
        }

        return { delivered };
    },
});
