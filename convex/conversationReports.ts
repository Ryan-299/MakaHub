
import { mutation } from "./_generated/server";
import { v } from "convex/values";


const REPORT_REASONS = [
    "Inappropriate or offensive messages",
    "Fraud or scam",
    "Spam or unsolicited messages",
    "Harassment or threats",
    "Other",
];

export const submit = mutation({
    args: {
        enquiryId: v.string(),
        reason: v.string(),
        details: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Please sign in to report a conversation.");
        }

        const enquiryId = ctx.db.normalizeId(
            "enquiries",
            args.enquiryId
        );

        if (!enquiryId) {
            throw new Error("Invalid conversation.");
        }

        const enquiry = await ctx.db.get(enquiryId);

        if (!enquiry) {
            throw new Error("Conversation not found.");
        }

        // Only conversation participants can submit reports.
        const isSeeker = enquiry.seekerId === identity.subject;
        const isLister = enquiry.listerId === identity.subject;

        if (!isSeeker && !isLister) {
            throw new Error("You cannot report this conversation.");
        }

        // Identify the other participant on the server.
        const reportedUserId = isSeeker
            ? enquiry.listerId
            : enquiry.seekerId;

        if (reportedUserId === identity.subject) {
            throw new Error("You cannot report yourself.");
        }

        const reason = args.reason.trim();
        const details = args.details?.trim() ?? "";

        if (!REPORT_REASONS.includes(reason)) {
            throw new Error("Please select a valid report reason.");
        }

        if (details.length > 500) {
            throw new Error("Additional details cannot exceed 500 characters.");
        }

        // Prevent duplicate open reports from the same person.
        const existingReports = await ctx.db
            .query("reports")
            .withIndex("by_target", (q) =>
                q.eq("targetId", args.enquiryId)
            )
            .collect();

        const existingReport = existingReports.find(
            (report) =>
                report.type === "conversation" &&
                report.reporterUserId === identity.subject &&
                report.status === "open"
        );

        if (existingReport) {
            return existingReport._id;
        }

        const reportedUser = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) =>
                q.eq("userId", reportedUserId)
            )
            .first();

        const reportedName = reportedUser?.name || "Rentike user";
        const now = new Date().toISOString();

        // Save the conversation report.
        const reportId = await ctx.db.insert("reports", {
            type: "conversation",
            targetId: args.enquiryId,
            targetTitle: `Conversation with ${reportedName}`,
            targetSubtitle: `Property: ${enquiry.propertyName}`,
            reason,
            details: details || undefined,
            reporterCount: 1,
            status: "open",
            createdAt: now,
            reporterUserId: identity.subject,
            reportedUserId,
            propertyId: enquiry.propertyId,
        });





        return reportId;
    },
});
