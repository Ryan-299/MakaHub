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
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
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
export const editReply = mutation({
  args: {
    reviewId: v.id("reviews"),
    replyText: v.string(),
    updatedAt: v.string(),
  },

  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    if (!review.reply) {
      throw new Error("This review does not have a reply to edit");
    }

    await ctx.db.patch(args.reviewId, {
      reply: {
        ...review.reply,
        replyText: args.replyText,
        updatedAt: args.updatedAt,
      },
    });
  },
});
export const editReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.number(),
    comment: v.optional(v.string()),
    wouldRecommend: v.optional(v.boolean()),
    updatedAt: v.string(),
  },

  handler: async (ctx, args) => {
    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found");
    }

    await ctx.db.patch(args.reviewId, {
      rating: args.rating,
      comment: args.comment,
      wouldRecommend: args.wouldRecommend,
      updatedAt: args.updatedAt,
    });
  },
});