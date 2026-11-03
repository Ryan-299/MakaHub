import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const getByUserId = query({
  args: { userId: v.string() },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (identity.subject !== args.userId) {
      return null;
    }

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

    if (!identity) {
      throw new Error("User must be signed in.");
    }

    const effectiveUserId = identity.subject;

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
    const currentRole = existing?.role ?? "unassigned";
    const requestedRole = args.role ?? currentRole;

    const allowedRoleChange =
      requestedRole === currentRole ||
      (currentRole === "unassigned" &&
        (requestedRole === "seeker" || requestedRole === "lister")) ||
      (currentRole === "seeker" && requestedRole === "lister");

    if (!allowedRoleChange) {
      throw new Error("This account role change is not allowed.");
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

    // Welcome new Seekers and Listers only on their first role assignment.
    if (
      currentRole === "unassigned" &&
      (requestedRole === "seeker" || requestedRole === "lister")
    ) {
      const welcomeTitle = "Welcome to Rentike 👋";
      const welcomeMessage =
        "Welcome to Rentike. Discover homes, list properties, and connect directly — all in one place";

      await ctx.db.insert("notifications", {
        recipientUserId: effectiveUserId,
        userId: effectiveUserId,
        title: welcomeTitle,
        message: welcomeMessage,
        time: new Date().toISOString(),
        type: "system",
        read: false,
      });

      await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
        recipientUserId: effectiveUserId,
        title: welcomeTitle,
        message: welcomeMessage,
      });
    }
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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity || identity.subject !== args.userId) {
      throw new Error("You must be signed in to save a property.");
    }

    const saver = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!saver) {
      throw new Error("User account not found.");
    }

    const propertyId = ctx.db.normalizeId(
      "properties",
      args.propertyId
    );

    if (!propertyId) {
      throw new Error("Invalid property ID.");
    }

    const property = await ctx.db.get("properties", propertyId);

    if (!property) {
      throw new Error("Property not found.");
    }

    const currentSaved = saver.savedPropertyIds || [];
    const wasSaved = currentSaved.includes(args.propertyId);

    const updated = wasSaved
      ? currentSaved.filter((id) => id !== args.propertyId)
      : [...currentSaved, args.propertyId];

    await ctx.db.patch(saver._id, {
      savedPropertyIds: updated,
    });

    // No notification for unsaving or saving your own listing.
    if (wasSaved || property.lister.id === identity.subject) {
      return;
    }

    const recipientUserId = property.lister.id;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Avoid notifying the same lister repeatedly when somebody
    // saves, unsaves, and saves the same property within 24 hours.
    const recentNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientUserId", recipientUserId)
      )
      .filter((q) =>
        q.gte(q.field("_creationTime"), oneDayAgo)
      )
      .collect();

    const alreadyNotified = recentNotifications.some(
      (notification) =>
        notification.title === "Property Saved" &&
        notification.actorUserId === identity.subject &&
        notification.targetPropertyId === args.propertyId
    );

    if (alreadyNotified) {
      return;
    }

    const saverName = saver.name || "Someone";
    const propertyName = property.name;

    // Create the notification inside Rentike.
    await ctx.db.insert("notifications", {
      recipientUserId,
      userId: recipientUserId,
      actorUserId: identity.subject,
      title: "Property Saved",
      message: `${saverName} saved your property ${propertyName}.`,
      time: new Date(now).toISOString(),
      read: false,
      type: "review",
      targetPropertyId: args.propertyId,
    });

    // Send the matching phone push notification.
    await ctx.scheduler.runAfter(
      0,
      internal.pushSender.sendToRecipient,
      {
        recipientUserId,
        title: "❤️ Property Saved",
        message: `${saverName} saved ${propertyName}`,
        url: "/",
      }
    );
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

// Public information shown to people viewing a lister's profile.
// Contact details are only shared with signed-in viewers.
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

    const identity = await ctx.auth.getUserIdentity();
    const canSeeContact = Boolean(identity);

    const phone = (user.phone ?? "").replace(/[\s-]/g, "");
    const hasRealPhone =
      /^\+254[71]\d{8}$/.test(phone) &&
      phone !== "+254700000000";

    return {
      id: user.userId,
      name: user.name,
      avatar: user.avatar,
      listerSubtype: user.listerSubtype ?? "Landlord / Property Owner",
      bio: user.bio ?? "",
      phone: canSeeContact && hasRealPhone ? phone : undefined,
      email: canSeeContact && user.contactEmail
        ? user.contactEmail
        : undefined,
      contactHidden: !canSeeContact,
    };
  },
});

// Get the signed-in user's contact email.
export const getMyAccountDetails = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!user) return null;

    return {
      contactEmail: user.contactEmail ?? "",
      phone: user.phone ?? "",
    };
  },
});

// Add, change, or remove a lister's contact email.

export const updateMyContactEmail = mutation({
  args: { email: v.string() },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (args.email.trim() !== "") {
      throw new Error("Contact emails must be verified with a code first.");
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

    await ctx.db.patch(user._id, { contactEmail: undefined });

    return "";
  },
});

// Change the signed-in user's own phone number.
// No SMS code (to avoid costs), but the number must be a valid Kenyan
// number, is stored as +2547XXXXXXXX / +2541XXXXXXXX (the same format
// upsertUser uses), and is refused if another account already has it.
// Returns a status instead of throwing, so the app can show the right
// message on the live site (Convex hides thrown error text in Production).
export const updateMyPhone = mutation({
  args: { phone: v.string() },

  handler: async (
    ctx,
    args
  ): Promise<{
    status: "saved" | "unchanged" | "invalid" | "taken";
    phone: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!user) {
      throw new Error("Your Rentike account could not be found.");
    }

    // Accept 0712…, 712…, 254712…, +254712… with spaces, dashes or brackets.
    const typed = args.phone.replace(/[\s()-]/g, "");
    let phone = typed;

    if (/^0[71]\d{8}$/.test(typed)) phone = "+254" + typed.slice(1);
    else if (/^[71]\d{8}$/.test(typed)) phone = "+254" + typed;
    else if (/^254[71]\d{8}$/.test(typed)) phone = "+" + typed;

    if (!/^\+254[71]\d{8}$/.test(phone) || phone === "+254700000000") {
      return { status: "invalid", phone: "" };
    }

    const currentPhone = (user.phone ?? "").replace(/[\s-]/g, "");

    if (phone === currentPhone) {
      return { status: "unchanged", phone };
    }

    const phoneOwner = await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phone", phone))
      .first();

    if (phoneOwner && phoneOwner.userId !== identity.subject) {
      return { status: "taken", phone: "" };
    }

    await ctx.db.patch(user._id, { phone });

    // Exactly one System notification per successful change.
    await ctx.db.insert("notifications", {
      recipientUserId: identity.subject,
      title: "Phone Number Updated",
      message: `Your phone number has been changed to ${phone}. If you did not make this change, please contact Rentike support.`,
      time: new Date().toISOString(),
      type: "system",
      read: false,
    });
    await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
      recipientUserId: identity.subject,
      title: "📞 Phone Number Updated",
      message: `Your phone number has been changed to ${phone}. If you did not make this change, please contact Rentike support.`,
    });
    return { status: "saved", phone };
  },
});

// Adds one "Password Changed" (or "Password Set") System notification for
// the signed-in user. Passwords themselves are handled by Clerk; the app
// calls this right after Clerk confirms the change. It can only ever
// notify the caller, and it skips a duplicate made in the last 30 seconds
// (e.g. a double tap), so each change gives exactly one notification.
export const notifyMyPasswordChanged = mutation({
  args: { passwordWasSet: v.optional(v.boolean()) },

  handler: async (
    ctx,
    args
  ): Promise<{ status: "created" | "duplicate" }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const title = args.passwordWasSet ? "Password Set" : "Password Changed";

    const recent = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) =>
        q.eq("recipientUserId", identity.subject)
      )
      .order("desc")
      .take(10);

    const now = Date.now();

    if (
      recent.some(
        (n) => n.title === title && now - n._creationTime < 30 * 1000
      )
    ) {
      return { status: "duplicate" };
    }

    await ctx.db.insert("notifications", {
      recipientUserId: identity.subject,
      title,
      message: args.passwordWasSet
        ? "A password was added to your account. If this wasn't you, please contact Rentike support."
        : "Your password was changed. If this wasn't you, please contact Rentike support.",
      time: new Date(now).toISOString(),
      type: "system",
      read: false,
    });
    await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
      recipientUserId: identity.subject,
      title: `🔒 ${title}`,
      message: args.passwordWasSet
        ? "A password was added to your account. If this wasn't you, please contact Rentike support."
        : "Your password was changed. If this wasn't you, please contact Rentike support.",
    });
    return { status: "created" };
  },
});
