import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByProperty = query({
  args: { propertyId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const add = mutation({
  args: {
    propertyId: v.string(),
    authorId: v.optional(v.string()),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    rating: v.number(),
    date: v.string(),
    comment: v.optional(v.string()),
    wouldRecommend: v.optional(v.boolean()),
    reported: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", {
      ...args,
      reported: false,
    });
  },
});

export const addReply = mutation({
  args: {
    reviewId: v.id("reviews"),
    propertyId: v.string(),
    listerId: v.string(),
    listerName: v.string(),
    listerSubtype: v.optional(v.string()),
    listerAvatar: v.optional(v.string()),
    replyText: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reviewId, {
      reply: {
        id: `reply-${Date.now()}`,
        reviewId: args.reviewId,
        propertyId: args.propertyId,
        listerId: args.listerId,
        listerName: args.listerName,
        listerSubtype: args.listerSubtype,
        listerAvatar: args.listerAvatar,
        replyText: args.replyText,
        createdAt: args.createdAt,
      },
    });
  },
});
