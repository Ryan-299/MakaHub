import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});
export const listUsersForAdmin = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User must be signed in.");
    }

    const requester = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!requester || requester.role !== "admin") {
      throw new Error("Admin access required.");
    }

    return await ctx.db.query("users").collect();
  },
});
export const upsertUser = mutation({
  args: {
    userId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    listerSubtype: v.optional(v.string()),
    joinedAt: v.optional(v.string()),
    avatar: v.optional(v.string()),
    savedPropertyIds: v.optional(v.array(v.string())),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    const effectiveUserId = identity?.subject || args.userId;

    if (!effectiveUserId) {
      throw new Error("User must be signed in.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", effectiveUserId))
      .first();
    const requestedPhone = args.phone?.replace(/[\s-]/g, '');
    const existingPhone = existing?.phone?.replace(/[\s-]/g, '') || '';

    const existingHasRealPhone =
      /^\+254[71]\d{8}$/.test(existingPhone) &&
      existingPhone !== '+254700000000';

    if (
      existingHasRealPhone &&
      requestedPhone &&
      requestedPhone !== existingPhone
    ) {
      throw new Error(
        "Your MakaoHub account phone number cannot be changed here."
      );
    }
    if (
      requestedPhone &&
      requestedPhone !== '+254700000000' &&
      !/^\+254[71]\d{8}$/.test(requestedPhone)
    ) {
      throw new Error("Please enter a valid Kenyan phone number.");
    }
    if (
      requestedPhone &&
      requestedPhone !== '+254700000000'
    ) {
      const phoneOwner = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phone", requestedPhone))
        .first();

      if (phoneOwner && phoneOwner.userId !== effectiveUserId) {
        throw new Error(
          "This phone number is already linked to another MakaoHub account."
        );
      }
    }
    const userData = {
      userId: effectiveUserId,
      name: args.name ?? existing?.name ?? "MakaoHub User",
      email: args.email ?? existing?.email ?? "",
      phone: requestedPhone || existingPhone || "",
      role: args.role ?? existing?.role ?? "unassigned",
      listerSubtype:
        args.listerSubtype !== undefined
          ? args.listerSubtype
          : existing?.listerSubtype,
      joinedAt:
        existing?.joinedAt ??
        new Date().toISOString(),
      avatar: args.avatar ?? existing?.avatar ?? "",
      savedPropertyIds:
        args.savedPropertyIds ??
        existing?.savedPropertyIds ??
        [],
    };

    if (existing) {
      await ctx.db.patch(existing._id, userData);
      return existing._id;
    }

    const newUserId = await ctx.db.insert("users", userData);


    /*
    await ctx.scheduler.runAfter(
      0,
      internal.emails.notifyNewUserWelcome,
      {
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        joinedAt: userData.joinedAt,
      }
    );
*/
    return newUserId;
  },
});

export const toggleSaveProperty = mutation({
  args: {
    userId: v.string(),
    propertyId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) return;

    const currentSaved = existing.savedPropertyIds || [];
    const updated = currentSaved.includes(args.propertyId)
      ? currentSaved.filter((id) => id !== args.propertyId)
      : [...currentSaved, args.propertyId];

    await ctx.db.patch(existing._id, { savedPropertyIds: updated });
  },
});
export const getPropertySaveCounts = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const counts: Record<string, number> = {};

    for (const user of users) {
      const savedIds = user.savedPropertyIds || [];

      for (const propertyId of savedIds) {
        counts[propertyId] = (counts[propertyId] || 0) + 1;
      }
    }

    return counts;
  },
});
export const repairJoinedAt = mutation({
  args: {},

  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    let repaired = 0;

    for (const user of users) {
      if (user.joinedAt === "Just now") {
        await ctx.db.patch(user._id, {
          joinedAt: new Date(user._creationTime).toISOString(),
        });

        repaired++;
      }
    }

    return { repaired };
  },
});
export const deleteMyAccount = mutation({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User must be signed in.");
    }

    const userId = identity.subject;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!currentUser) {
      throw new Error("User account not found.");
    }

    if (currentUser.role === "admin") {
      throw new Error("Admin accounts cannot be deleted here.");
    }
    const seekerEnquiries = await ctx.db
      .query("enquiries")
      .withIndex("by_seeker", (q) => q.eq("seekerId", userId))
      .collect();

    for (const enquiry of seekerEnquiries) {
      const anonymizedSeekerId = `deleted-${enquiry._id}`;

      const anonymizedMessages = enquiry.messages?.map((message) =>
        message.senderId === userId
          ? {
            ...message,
            senderId: anonymizedSeekerId,
            senderName: "Deleted User",
            senderAvatar: undefined,
          }
          : message
      );

      await ctx.db.patch(enquiry._id, {
        seekerId: anonymizedSeekerId,
        seekerName: "Deleted User",
        seekerPhone: "Deleted",
        seekerEmail: undefined,
        seekerAvatar: undefined,
        messages: anonymizedMessages,
      });
    }
    const userReviews = await ctx.db
      .query("reviews")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();

    for (const review of userReviews) {
      await ctx.db.patch(review._id, {
        authorId: undefined,
        authorName: "Deleted User",
        authorAvatar: undefined,
      });

    }
    const userViews = await ctx.db
      .query("propertyViews")
      .withIndex("by_viewer_property_month", (q) =>
        q.eq("viewerId", userId)
      )
      .collect();
    for (const view of userViews) {
      await ctx.db.patch(view._id, {
        viewerId: `deleted-${view._id}`,
      });
    }
    const userReports = await ctx.db
      .query("reports")
      .withIndex("by_reporter", (q) => q.eq("reporterUserId", userId))
      .collect();

    for (const report of userReports) {
      await ctx.db.patch(report._id, {
        reporterUserId: undefined,
      });
    }
    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientUserId", userId)
      )
      .collect();

    for (const notification of userNotifications) {
      await ctx.db.delete(notification._id);
    }
    const ownedProperties =
      currentUser.role === "lister"
        ? await ctx.db
          .query("properties")
          .withIndex("by_lister", (q) => q.eq("lister.id", userId))
          .collect()
        : [];
    const listerEnquiries =
      currentUser.role === "lister"
        ? await ctx.db
          .query("enquiries")
          .withIndex("by_lister", (q) => q.eq("listerId", userId))
          .collect()
        : [];

    for (const enquiry of listerEnquiries) {
      const anonymizedListerId = `deleted-${enquiry._id}`;

      const anonymizedMessages = enquiry.messages?.map((message) =>
        message.senderId === userId
          ? {
            ...message,
            senderId: anonymizedListerId,
            senderName: "Deleted User",
            senderAvatar: undefined,
          }
          : message
      );

      await ctx.db.patch(enquiry._id, {
        listerId: anonymizedListerId,
        messages: anonymizedMessages,
      });
    }
    const ownedPropertyIds = new Set(
      ownedProperties.map((property) => property._id.toString())
    );

    if (ownedPropertyIds.size > 0) {
      const allUsers = await ctx.db.query("users").collect();

      for (const user of allUsers) {
        if (user._id === currentUser._id) continue;

        const cleanedSavedPropertyIds = user.savedPropertyIds.filter(
          (savedId) => !ownedPropertyIds.has(savedId)
        );

        if (cleanedSavedPropertyIds.length !== user.savedPropertyIds.length) {
          await ctx.db.patch(user._id, {
            savedPropertyIds: cleanedSavedPropertyIds,
          });
        }
      }
    }
    for (const property of ownedProperties) {
      const propertyReviews = await ctx.db
        .query("reviews")
        .withIndex("by_property", (q) =>
          q.eq("propertyId", property._id.toString())
        )
        .collect();

      for (const review of propertyReviews) {
        await ctx.db.delete(review._id);
      }

      const propertyViews = await ctx.db
        .query("propertyViews")
        .withIndex("by_property_month", (q) =>
          q.eq("propertyId", property._id)
        )
        .collect();

      for (const view of propertyViews) {
        await ctx.db.delete(view._id);
      }

      if (property.imageStorageIds) {
        for (const storageId of property.imageStorageIds) {
          try {
            await ctx.storage.delete(storageId);
          } catch {
            // Ignore missing storage files
          }
        }
      }

      if (property.coverPhotoStorageId) {
        try {
          await ctx.storage.delete(property.coverPhotoStorageId);
        } catch {
          // Ignore missing storage file
        }
      }

      if (property.videoStorageId) {
        try {
          await ctx.storage.delete(property.videoStorageId);
        } catch {
          // Ignore missing storage file
        }
      }

      await ctx.db.delete(property._id);
    }
    await ctx.db.delete(currentUser._id);
    return {

      success: true,
      userId,
      role: currentUser.role,
    };
  },
});

export const updateListerProfile = mutation({
  args: {
    listerSubtype: v.union(
      v.literal("Landlord / Property Owner"),
      v.literal("Caretaker"),
      v.literal("Property Manager"),
      v.literal("Real Estate Agent"),
      v.literal("Property Agency"),
      v.literal("Property Company"),
      v.literal("Property Developer")
    ),
    bio: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in to update your profile.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!user) {
      throw new Error("Your Rentike account could not be found.");
    }

    if (user.role !== "lister") {
      throw new Error("Only listers can update a public lister profile.");
    }

    const bio = args.bio.trim();

    if (bio.length > 500) {
      throw new Error("About Me cannot exceed 500 characters.");
    }

    await ctx.db.patch(user._id, {
      listerSubtype: args.listerSubtype,
      bio,
    });

    return {
      listerSubtype: args.listerSubtype,
      bio,
    };
  },
});
// Public information shown to seekers viewing a lister's profile.
export const getPublicListerProfile = query({
  args: {
    userId: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", args.userId)
      )
      .first();

    if (!user || user.role !== "lister" || user.isSuspended) {
      return null;
    }

    return {
      id: user.userId,
      name: user.name,
      avatar: user.avatar,
      listerSubtype: user.listerSubtype ?? "Landlord / Property Owner",
      bio: user.bio ?? "",
    };
  },
});