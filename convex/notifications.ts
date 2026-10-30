import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByRecipient = query({
  args: { recipientUserId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (args.recipientUserId !== identity.subject) {
      throw new Error("You can only view your own notifications.");
    }
    return await ctx.db

      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientUserId", identity.subject)
      )
      .collect();
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const notif = await ctx.db.get("notifications", args.id);

    if (!notif) {
      throw new Error("Notification not found.");
    }

    if (notif.recipientUserId !== identity.subject) {
      throw new Error("You can only modify your own notifications.");
    }

    await ctx.db.patch(args.id, { read: true });
  },
});
export const markAllAsRead = mutation({
  args: { recipientUserId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (args.recipientUserId !== identity.subject) {
      throw new Error("You can only modify your own notifications.");
    }
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientUserId", identity.subject))
      .collect();
    for (const notif of notifs) {
      if (!notif.read) {
        await ctx.db.patch(notif._id, { read: true });
      }
    }
  },
});

export const send = mutation({
  args: {
    recipientUserId: v.string(),
    userId: v.optional(v.string()),
    actorUserId: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    time: v.string(),
    type: v.string(),
    targetPropertyId: v.optional(v.string()),
    targetReviewId: v.optional(v.string()),
    targetEnquiryId: v.optional(v.string()),
    targetMessageId: v.optional(v.string()),
  },


  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to send notifications.");
    }

    if (
      args.type === "system" &&
      args.recipientUserId !== identity.subject
    ) {
      throw new Error(
        "System notifications can only be sent to your own account."
      );
    }

    if (args.type === "approval" || args.type === "rejection") {
      const admin = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) =>
          q.eq("userId", identity.subject)
        )
        .first();

      if (!admin || admin.role !== "admin") {
        throw new Error("Admin access required.");
      }

      const propertyId = args.targetPropertyId
        ? ctx.db.normalizeId("properties", args.targetPropertyId)
        : null;

      if (!propertyId) {
        throw new Error("Valid property ID required.");
      }

      const property = await ctx.db.get("properties", propertyId);

      const expectedStatus =
        args.type === "approval" ? "Approved" : "Rejected";

      if (
        !property ||
        property.status !== expectedStatus ||
        property.lister.id !== args.recipientUserId
      ) {
        throw new Error("Invalid listing moderation notification.");
      }
    }

    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
    });
  },

});