"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const notifyAdminNewProperty = internalAction({
    args: {
        propertyName: v.string(),
        propertyType: v.string(),
        monthlyRent: v.number(),
        county: v.string(),
        subCounty: v.string(),
        estate: v.string(),
    },

    handler: async (_ctx, args) => {
        const apiKey = process.env.RESEND_API_KEY;
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

        if (!apiKey) {
            throw new Error("RESEND_API_KEY is not configured");
        }

        if (!adminEmail) {
            throw new Error("ADMIN_NOTIFICATION_EMAIL is not configured");
        }

        const resend = new Resend(apiKey);

        const { error } = await resend.emails.send({
            from: "MakaoHub <onboarding@resend.dev>",
            to: adminEmail,
            subject: `New property awaiting approval — ${args.propertyName}`,
            html: `
        <h2>New Property Awaiting Approval</h2>

        <p>A new property has been submitted on MakaoHub.</p>

        <p><strong>Property:</strong> ${args.propertyName}</p>
        <p><strong>Type:</strong> ${args.propertyType}</p>
        <p><strong>Monthly Rent:</strong> KES ${args.monthlyRent.toLocaleString()}</p>
        <p><strong>Location:</strong> ${args.estate}, ${args.subCounty}, ${args.county}</p>

        <p>Please open the MakaoHub Admin Dashboard to review and approve or reject the listing.</p>
      `,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true };
    },
});