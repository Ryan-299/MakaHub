import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByRecipient = query({
  args: { recipientUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientUserId", args.recipientUserId))
      .collect();
  },
});

export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
  },
});

export const markAllAsRead = mutation({
  args: { recipientUserId: v.string() },
  handler: async (ctx, args) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientUserId", args.recipientUserId))
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
    return await ctx.db.insert("notifications", {
      ...args,
      read: false,
    });
  },
});
