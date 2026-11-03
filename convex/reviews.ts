
import { query, mutation, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Create Activity notifications and one phone popup for a review.
const ratingLabel = (rating: number) =>
  rating === 1 ? "1 star" : `${rating} stars`;

const commentSnippet = (text: string) => {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 100
    ? `${clean.slice(0, 97).trim()}...`
    : clean;
};

async function notifyListerOfReview(
  ctx: MutationCtx,
  details: {
    propertyId: string;
    reviewId: string;
    actorUserId: string;
    actorName: string;
    rating?: number;
    comment?: string;
  }
) {
  const propertyId = ctx.db.normalizeId(
    "properties",
    details.propertyId
  );

  if (!propertyId) return;

  const property = await ctx.db.get("properties", propertyId);
  if (!property?.lister?.id) return;

  const recipientUserId = property.lister.id;

  // Don't notify someone about their own property.
  if (recipientUserId === details.actorUserId) return;

  const rating = details.rating;
  const comment = details.comment
    ? commentSnippet(details.comment)
    : "";

  if (rating === undefined && !comment) return;

  const now = Date.now();

  // Activity notification for a star rating.
  if (rating !== undefined) {
    await ctx.db.insert("notifications", {
      recipientUserId,
      userId: recipientUserId,
      actorUserId: details.actorUserId,
      title: "New Property Rating",
      message: `${details.actorName} rated ${property.name} ${ratingLabel(rating)}.`,
      time: new Date(now).toISOString(),
      read: false,
      type: "review",
      targetPropertyId: details.propertyId,
      targetReviewId: details.reviewId,
    });
  }

  // Separate Activity notification for a written review.
  if (comment) {
    await ctx.db.insert("notifications", {
      recipientUserId,
      userId: recipientUserId,
      actorUserId: details.actorUserId,
      title: "New Property Comment",
      message: `${details.actorName} commented on ${property.name}:\n"${comment}"`,
      time: new Date(now + 1).toISOString(),
      read: false,
      type: "review",
      targetPropertyId: details.propertyId,
      targetReviewId: details.reviewId,
    });
  }

  // One phone popup for this review action.
  await ctx.scheduler.runAfter(
    0,
    internal.pushSender.sendToRecipient,
    {
      recipientUserId,
      title:
        rating !== undefined
          ? `⭐ ${details.actorName} rated ${property.name}`
          : `💬 ${details.actorName} reviewed ${property.name}`,
      message: comment ? `"${comment}"` : ratingLabel(rating!),
      url: "/",
    }
  );
}


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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in to leave a review.");
    }

    const author = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!author) {
      throw new Error("Your Rentike account could not be found.");
    }

    const propertyId = ctx.db.normalizeId(
      "properties",
      args.propertyId
    );

    if (!propertyId || !(await ctx.db.get(propertyId))) {
      throw new Error("Property not found.");
    }

    if (
      args.rating !== undefined &&
      (!Number.isFinite(args.rating) ||
        args.rating < 0 ||
        args.rating > 5)
    ) {
      throw new Error("Ratings must be between 0 and 5.");
    }

    if ((args.comment ?? "").length > 2000) {
      throw new Error("Reviews cannot exceed 2000 characters.");
    }

    const authorName = author.name || "Rentike user";

    const reviewId = await ctx.db.insert("reviews", {
      ...args,
      authorId: identity.subject,
      authorName,
      authorAvatar: author.avatar,
      reported: false,
    });

    await notifyListerOfReview(ctx, {
      propertyId: args.propertyId,
      reviewId: reviewId.toString(),
      actorUserId: identity.subject,
      actorName: authorName,
      rating:
        typeof args.rating === "number" && args.rating >= 1
          ? args.rating
          : undefined,
      comment: args.comment,
    });

    return reviewId;
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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in to edit a review.");
    }

    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found.");
    }

    if (review.authorId !== identity.subject) {
      throw new Error("You can only edit your own review.");
    }

    const author = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!author) {
      throw new Error("User account not found.");
    }

    if (
      args.rating !== undefined &&
      (!Number.isFinite(args.rating) ||
        args.rating < 0 ||
        args.rating > 5)
    ) {
      throw new Error("Ratings must be between 0 and 5.");
    }

    if (args.comment !== undefined && args.comment.length > 2000) {
      throw new Error("Reviews cannot exceed 2000 characters.");
    }

    // Identify what actually changed.
    const ratingChanged =
      args.rating !== undefined &&
      args.rating >= 1 &&
      args.rating !== review.rating;

    const newComment = (args.comment ?? "").trim();
    const oldComment = (review.comment ?? "").trim();

    const commentChanged =
      args.comment !== undefined &&
      newComment.length > 0 &&
      newComment !== oldComment;

    // Preserve fields that were not provided.
    await ctx.db.patch(args.reviewId, {
      ...(args.rating !== undefined
        ? { rating: args.rating }
        : {}),
      ...(args.comment !== undefined
        ? { comment: args.comment }
        : {}),
      ...(args.wouldRecommend !== undefined
        ? { wouldRecommend: args.wouldRecommend }
        : {}),
      updatedAt: args.updatedAt,
    });

    // Notify the lister only when stars or written text changed.
    if (ratingChanged || commentChanged) {
      await notifyListerOfReview(ctx, {
        propertyId: review.propertyId,
        reviewId: args.reviewId.toString(),
        actorUserId: identity.subject,
        actorName: author.name || "Rentike user",
        rating: ratingChanged ? args.rating : undefined,
        comment: commentChanged ? newComment : undefined,
      });
    }
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