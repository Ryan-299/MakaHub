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
export const listReportsForAdmin = query({
  args: {},

  handler: async (ctx) => {
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

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required.");
    }

    return await ctx.db
      .query("reports")
      .collect();
  },
});

export const add = mutation({

  args: {
    propertyId: v.string(),
    authorId: v.optional(v.string()),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    rating: v.optional(v.number()),
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
    rating: v.optional(v.number()),
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
export const reportReview = mutation({
  args: {
    reviewId: v.id("reviews"),
    reason: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in to report a review.");
    }

    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found.");
    }

    const cleanReason =
      args.reason.trim() || "Inappropriate review content";

    // Check whether this review already has an open report
    const existingReports = await ctx.db
      .query("reports")
      .withIndex("by_target", (q) =>
        q.eq("targetId", args.reviewId.toString())
      )
      .collect();

    const existingOpenReport = existingReports.find(
      (report) => report.status === "open"
    );

    if (existingOpenReport) {
      return existingOpenReport._id;
    }

    // Mark review as reported
    await ctx.db.patch(args.reviewId, {
      reported: true,
    });

    // Create persistent moderation report
    const reportId = await ctx.db.insert("reports", {
      type: "review",
      targetId: args.reviewId.toString(),
      targetTitle: `Review by ${review.authorName}`,
      targetSubtitle: "Reported review awaiting moderation",
      reason: cleanReason,
      reporterCount: 1,
      status: "open",
      createdAt: new Date().toISOString(),
      reporterUserId: identity.subject,
      propertyId: review.propertyId,
    });

    // Notify all admins
    const users = await ctx.db.query("users").collect();
    const admins = users.filter((user) => user.role === "admin");

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        recipientUserId: admin.userId,
        userId: identity.subject,
        title: "New Review Report",
        message: `A report has been submitted against a review by ${review.authorName}. Reason: ${args.reason}`,
        time: new Date().toISOString(),
        read: false,
        type: "report",
        targetReviewId: args.reviewId.toString(),
        targetPropertyId: review.propertyId,
      });
    }

    return reportId;
  },
});
export const deleteReviewByAdmin = mutation({
  args: {
    reviewId: v.id("reviews"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required.");
    }

    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found.");
    }

    await ctx.db.delete(args.reviewId);

    return {
      success: true,
      propertyId: review.propertyId,
    };
  },
});
export const updateReportStatusByAdmin = mutation({
  args: {
    reportId: v.id("reports"),
    status: v.union(
      v.literal("investigated"),
      v.literal("dismissed")
    ),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!admin || admin.role !== "admin") {
      throw new Error("Admin access required.");
    }

    const report = await ctx.db.get(args.reportId);

    if (!report) {
      throw new Error("Report not found.");
    }

    await ctx.db.patch(args.reportId, {
      status: args.status,
    });

    return { success: true };
  },
});
export const deleteOwnReview = mutation({
  args: {
    reviewId: v.id("reviews"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found.");
    }

    if (!review.authorId || review.authorId !== identity.subject) {
      throw new Error("You can only delete your own review.");
    }

    await ctx.db.delete(args.reviewId);

    return {
      success: true,
      propertyId: review.propertyId,
    };
  },
});