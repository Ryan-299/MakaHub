import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
// Generate an upload URL for uploading files (images, videos) to Convex File Storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Helper function to resolve storage IDs to real permanent URLs
async function resolvePropertyMedia(ctx: any, doc: any) {
  if (!doc) return doc;

  // Resolve imageStorageIds if present
  let resolvedImages: string[] = Array.isArray(doc.images) ? [...doc.images] : [];
  if (doc.imageStorageIds && Array.isArray(doc.imageStorageIds) && doc.imageStorageIds.length > 0) {
    const urls = await Promise.all(
      doc.imageStorageIds.map(async (storageId: any) => {
        try {
          return await ctx.storage.getUrl(storageId);
        } catch {
          return null;
        }
      })
    );
    const validUrls = urls.filter((url): url is string => Boolean(url));
    if (validUrls.length > 0) {
      resolvedImages = validUrls;
    }
  }

  // Resolve coverPhotoStorageId if present
  let resolvedCoverPhoto: string = doc.coverPhoto || resolvedImages[0] || "";
  if (doc.coverPhotoStorageId) {
    try {
      const url = await ctx.storage.getUrl(doc.coverPhotoStorageId);
      if (url) resolvedCoverPhoto = url;
    } catch {
      // Keep existing
    }
  }

  // Resolve videoStorageId if present
  let resolvedVideo: string | undefined = doc.video;
  if (doc.videoStorageId) {
    try {
      const url = await ctx.storage.getUrl(doc.videoStorageId);
      if (url) resolvedVideo = url;
    } catch {
      // Keep existing
    }
  }

  return {
    ...doc,
    id: doc._id,
    images: resolvedImages,
    coverPhoto: resolvedCoverPhoto,
    video: resolvedVideo,
  };
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    const docs = await ctx.db
      .query("properties")
      .order("desc")
      .collect();

    // Not signed in: only public approved listings
    if (!identity) {
      const approvedDocs = docs.filter((doc) => doc.status === "Approved");

      return await Promise.all(
        approvedDocs.map((doc) => resolvePropertyMedia(ctx, doc))
      );
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    // Admin can see everything
    if (caller?.role === "admin") {
      return await Promise.all(
        docs.map((doc) => resolvePropertyMedia(ctx, doc))
      );
    }

    // Lister can see public listings + all of their own listings
    if (caller?.role === "lister") {
      const visibleDocs = docs.filter(
        (doc) =>
          doc.status === "Approved" ||
          doc.lister.id === identity.subject
      );

      return await Promise.all(
        visibleDocs.map((doc) => resolvePropertyMedia(ctx, doc))
      );
    }

    // Seekers and everyone else only see approved listings
    const approvedDocs = docs.filter((doc) => doc.status === "Approved");

    return await Promise.all(
      approvedDocs.map((doc) => resolvePropertyMedia(ctx, doc))
    );
  },
});

export const listApproved = query({
  args: {},
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "Approved"))
      .order("desc")
      .collect();
    return await Promise.all(docs.map((doc) => resolvePropertyMedia(ctx, doc)));
  },
});

export const listByLister = query({
  args: { listerId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (args.listerId !== identity.subject) {
      throw new Error("You can only view your own listings.");
    }
    const docs = await ctx.db
      .query("properties")
      .withIndex("by_lister", (q) => q.eq("lister.id", identity.subject))
      .order("desc")
      .collect();
    return await Promise.all(docs.map((doc) => resolvePropertyMedia(ctx, doc)));
  },
});

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);

    if (!doc) {
      return null;
    }

    // Approved properties are public
    if (doc.status === "Approved") {
      return await resolvePropertyMedia(ctx, doc);
    }

    const identity = await ctx.auth.getUserIdentity();

    // Logged-out users cannot view private listings
    if (!identity) {
      return null;
    }

    // The lister can view their own Pending/Rejected property
    if (doc.lister.id === identity.subject) {
      return await resolvePropertyMedia(ctx, doc);
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    // Admin can view everything
    if (caller?.role === "admin") {
      return await resolvePropertyMedia(ctx, doc);
    }

    return null;
  },
});
export const add = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    monthlyRent: v.number(),
    deposit: v.number(),
    serviceCharge: v.number(),
    agentFee: v.number(),
    viewingFee: v.optional(v.number()),
    waterDeposit: v.number(),
    electricityDeposit: v.optional(v.number()),
    garbageFee: v.optional(v.number()),
    otherFees: v.number(),
    location: v.object({
      county: v.string(),
      subCounty: v.string(),
      ward: v.string(),
      estate: v.string(),
      address: v.optional(v.string()),
      lat: v.number(),
      lng: v.number(),
      distanceMock: v.optional(v.number()),
    }),
    vacancies: v.number(),
    occupied: v.number(),
    underRepair: v.number(),
    amenities: v.array(v.string()),
    rating: v.number(),
    reviewCount: v.number(),
    timePosted: v.string(),
    images: v.array(v.string()),
    coverPhoto: v.optional(v.string()),
    video: v.optional(v.string()),
    videoName: v.optional(v.string()),
    videoSize: v.optional(v.number()),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    coverPhotoStorageId: v.optional(v.id("_storage")),
    videoStorageId: v.optional(v.id("_storage")),
    description: v.string(),
    lister: v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      avatar: v.string(),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      verified: v.boolean(),
    }),
    status: v.string(),
    rejectionReason: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    createdAt: v.string(),
    viewsCount: v.optional(v.number()),
    enquiriesCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }


    if (args.lister.id !== identity.subject) {
      throw new Error("You can only create listings as yourself.");
    }

    // Require a valid contact phone number for this property
    const contactPhone = args.lister.phone?.trim().replace(/[\s()-]/g, '') ?? '';

    if (!/^(?:0[17]\d{8}|\+254[17]\d{8})$/.test(contactPhone)) {
      throw new Error("A valid Kenyan contact phone number is required.");
    }

    const propertyId = await ctx.db.insert("properties", {

      ...args,
      agentFee: args.agentFee ?? 0,
      viewingFee: args.viewingFee ?? 0,
      deposit: args.deposit ?? 0,
      serviceCharge: args.serviceCharge ?? 0,
      waterDeposit: args.waterDeposit ?? 0,
      electricityDeposit: args.electricityDeposit ?? 0,
      garbageFee: args.garbageFee ?? 0,
      otherFees: args.otherFees ?? 0,
      status: "Pending",
    });

    await ctx.scheduler.runAfter(
      0,
      internal.emails.notifyAdminNewProperty,
      {
        propertyName: args.name,
        propertyType: args.type,
        monthlyRent: args.monthlyRent,
        county: args.location.county,
        subCounty: args.location.subCounty,
        estate: args.location.estate,
      }
    );
    const users = await ctx.db.query("users").collect();
    const admins = users.filter((user) => user.role === "admin");

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        recipientUserId: admin.userId,
        userId: args.lister.id,
        title: "New Property Awaiting Approval",
        message: `"${args.name}" has been submitted and is waiting for your review.`,
        time: new Date().toISOString(),
        type: "approval",
        targetPropertyId: propertyId.toString(),
        read: false,
      });
    }

    return propertyId;
  },
});


export const addWithUnits = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    monthlyRent: v.number(),
    deposit: v.number(),
    serviceCharge: v.number(),
    agentFee: v.number(),
    viewingFee: v.optional(v.number()),
    waterDeposit: v.number(),
    electricityDeposit: v.optional(v.number()),
    garbageFee: v.optional(v.number()),
    otherFees: v.number(),
    location: v.object({
      county: v.string(),
      subCounty: v.string(),
      ward: v.string(),
      estate: v.string(),
      address: v.optional(v.string()),
      lat: v.number(),
      lng: v.number(),
      distanceMock: v.optional(v.number()),
    }),
    vacancies: v.number(),
    occupied: v.number(),
    underRepair: v.number(),
    amenities: v.array(v.string()),
    rating: v.number(),
    reviewCount: v.number(),
    timePosted: v.string(),
    images: v.array(v.string()),
    coverPhoto: v.optional(v.string()),
    video: v.optional(v.string()),
    videoName: v.optional(v.string()),
    videoSize: v.optional(v.number()),
    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    coverPhotoStorageId: v.optional(v.id("_storage")),
    videoStorageId: v.optional(v.id("_storage")),
    description: v.string(),
    lister: v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      avatar: v.string(),
      phone: v.optional(v.string()),
      email: v.optional(v.string()),
      verified: v.boolean(),
    }),
    status: v.string(),
    rejectionReason: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    createdAt: v.string(),
    viewsCount: v.optional(v.number()),
    enquiriesCount: v.optional(v.number()),
    unitTypes: v.array(v.object({
      type: v.string(),
      monthlyRent: v.number(),
      deposit: v.number(),
      serviceCharge: v.number(),
      waterDeposit: v.number(),
      electricityDeposit: v.number(),
      agentFee: v.number(),
      viewingFee: v.number(),
      vacancies: v.number(),
      occupied: v.number(),
      underRepair: v.number(),
      amenities: v.array(v.string()),
      images: v.array(v.string()),
      imageStorageIds: v.array(v.id("_storage")),
      coverPhotoStorageId: v.id("_storage"),
      videoStorageId: v.optional(v.id("_storage")),
      videoName: v.optional(v.string()),
      videoSize: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();


    if (!identity || args.lister.id !== identity.subject) {
      throw new Error("You must be signed in as the listing owner.");
    }

    // Require a valid contact number for this property
    const contactPhone = args.lister.phone?.trim().replace(/[\s()-]/g, '') ?? '';


    if (!/^(?:0[17]\d{8}|\+254[17]\d{8})$/.test(contactPhone)) {
      throw new Error("A valid Kenyan contact phone number is required.");
    }

    const normalizedPhone = contactPhone.startsWith('0')
      ? `+254${contactPhone.slice(1)}`
      : contactPhone;


    if (args.unitTypes.length < 2) {

      throw new Error("Select at least two unit types.");
    }

    if (new Set(args.unitTypes.map((unit) => unit.type)).size !== args.unitTypes.length) {
      throw new Error("Duplicate unit types are not allowed.");
    }

    if (!args.coverPhotoStorageId) {
      throw new Error("A building cover photo is required.");
    }

    for (const unit of args.unitTypes) {
      const prices = [
        unit.monthlyRent,
        unit.deposit,
        unit.serviceCharge,
        unit.waterDeposit,
        unit.electricityDeposit,
        unit.agentFee,
        unit.viewingFee,
      ];

      const counts = [
        unit.vacancies,
        unit.occupied,
        unit.underRepair,
      ];

      if (
        unit.monthlyRent <= 0 ||
        prices.some((value) => !Number.isFinite(value) || value < 0) ||
        counts.some((value) => !Number.isSafeInteger(value) || value < 0) ||
        unit.imageStorageIds.length === 0 ||
        unit.imageStorageIds.length > 10 ||
        (unit.videoSize !== undefined &&
          (unit.videoSize < 0 || !Number.isSafeInteger(unit.videoSize)))
      ) {
        throw new Error(`Invalid pricing, availability or media for ${unit.type}.`);
      }
    }

    const { unitTypes, ...building } = args;

    const propertyId = await ctx.db.insert("properties", {
      ...building,
      status: "Pending",
    });

    for (const unit of unitTypes) {
      await ctx.db.insert("propertyUnitTypes", {
        propertyId,
        ...unit,
        createdAt: new Date().toISOString(),
      });
    }

    await ctx.scheduler.runAfter(
      0,
      internal.emails.notifyAdminNewProperty,
      {
        propertyName: args.name,
        propertyType: args.type,
        monthlyRent: args.monthlyRent,
        county: args.location.county,
        subCounty: args.location.subCounty,
        estate: args.location.estate,
      }
    );

    const admins = (await ctx.db.query("users").collect()).filter(
      (user) => user.role === "admin"
    );

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        recipientUserId: admin.userId,
        userId: args.lister.id,
        title: "New Property Awaiting Approval",
        message: `"${args.name}" has been submitted and is waiting for your review.`,
        time: new Date().toISOString(),
        type: "approval",
        targetPropertyId: propertyId.toString(),
        read: false,
      });
    }

    return propertyId;
  },
});
export const updateProperty = mutation({
  args: {
    id: v.id("properties"),

    name: v.optional(v.string()),
    type: v.optional(v.string()),
    monthlyRent: v.optional(v.number()),
    status: v.optional(v.string()),
    deposit: v.optional(v.number()),
    serviceCharge: v.optional(v.number()),
    agentFee: v.optional(v.number()),
    viewingFee: v.optional(v.number()),
    waterDeposit: v.optional(v.number()),
    electricityDeposit: v.optional(v.number()),
    otherFees: v.optional(v.number()),

    location: v.optional(
      v.object({
        county: v.string(),
        subCounty: v.string(),
        ward: v.string(),
        estate: v.string(),
        address: v.optional(v.string()),
        lat: v.number(),
        lng: v.number(),
        distanceMock: v.optional(v.number()),
      })
    ),

    vacancies: v.optional(v.number()),
    occupied: v.optional(v.number()),
    underRepair: v.optional(v.number()),
    amenities: v.optional(v.array(v.string())),

    images: v.optional(v.array(v.string())),
    coverPhoto: v.optional(v.string()),
    video: v.optional(v.string()),
    videoName: v.optional(v.string()),
    videoSize: v.optional(v.number()),

    imageStorageIds: v.optional(v.array(v.id("_storage"))),
    coverPhotoStorageId: v.optional(v.id("_storage")),
    videoStorageId: v.optional(v.id("_storage")),

    description: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    timePosted: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }
    const doc = await ctx.db.get(args.id);

    if (!doc) {
      throw new Error("Property not found.");
    }

    if (doc.lister?.id !== identity.subject) {
      throw new Error("You can only edit your own property.");
    }


    const { id, contactPhone, ...updates } = args;

    if (contactPhone !== undefined) {
      const phone = contactPhone.trim().replace(/[\s()-]/g, '');

      if (!/^(?:0[17]\d{8}|\+254[17]\d{8})$/.test(phone)) {
        throw new Error('Enter a valid Kenyan contact phone number.');
      }

      const normalizedPhone = phone.startsWith('0')
        ? `+254${phone.slice(1)}`
        : phone;

      await ctx.db.patch(doc._id, {
        ...updates,
        lister: {
          ...doc.lister,
          phone: normalizedPhone,
        },
      });
    } else {
      await ctx.db.patch(doc._id, updates);
    }

    const isResubmission =
      doc.status === "Rejected" && updates.status === "Pending";

    if (isResubmission) {
      const users = await ctx.db.query("users").collect();
      const admins = users.filter((user) => user.role === "admin");

      for (const admin of admins) {
        await ctx.db.insert("notifications", {
          recipientUserId: admin.userId,
          userId: identity.subject,
          title: "Listing Resubmitted for Approval",
          message: `"${updates.name || doc.name}" was updated after rejection and has been resubmitted for admin review.`,
          time: new Date().toISOString(),
          type: "approval",
          targetPropertyId: doc._id.toString(),
          read: false,
        });
      }
    }
    return doc._id;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.string(),
    status: v.string(),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!caller || caller.role !== "admin") {
      throw new Error("Admin access required.");
    }
    try {
      const doc = await ctx.db.get(args.id as any);
      if (doc) {
        await ctx.db.patch(doc._id, {
          status: args.status,
          rejectionReason: args.rejectionReason,
        });
      }
    } catch {
      // In case ID format doesn't match Convex document ID
    }
  },
});

export const updateVacancies = mutation({
  args: {
    id: v.string(),
    vacancies: v.number(),
    occupied: v.number(),
    underRepair: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const caller = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
    let doc = null;
    try {
      doc = await ctx.db.get(args.id as any);
    } catch {
      // In case ID format does not match native Convex ID
    }

    if (!doc) {
      const all = await ctx.db.query("properties").collect();
      doc = all.find((d) => d._id === args.id || (d as any).id === args.id) || null;
    }
    if (!doc) {
      throw new Error("Property not found.");
    }

    const isOwner = doc.lister.id === identity.subject;
    const isAdmin = caller?.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("You are not allowed to update this property's availability.");
    }
    if (doc) {
      const sanitizedVacancies = Math.max(0, Math.floor(args.vacancies));
      const sanitizedOccupied = Math.max(0, Math.floor(args.occupied));
      const sanitizedUnderRepair = Math.max(0, Math.floor(args.underRepair));

      await ctx.db.patch(doc._id, {
        vacancies: sanitizedVacancies,
        occupied: sanitizedOccupied,
        underRepair: sanitizedUnderRepair,
      });

      return {
        success: true,
        id: doc._id,
        vacancies: sanitizedVacancies,
        occupied: sanitizedOccupied,
        underRepair: sanitizedUnderRepair,
      };
    }

    return { success: false, reason: "Property not found" };
  },
});

export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User must be signed in.");
    }

    const requester = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!requester) {
      throw new Error("User account not found.");
    }
    try {
      const doc = await ctx.db.get(args.id);
      if (doc) {
        const isOwner = doc.lister.id === identity.subject;
        const isAdmin = requester.role === "admin";

        if (!isOwner && !isAdmin) {
          throw new Error("You are not authorized to delete this property.");
        }
        // Clean up storage items if present
        if (doc.imageStorageIds && Array.isArray(doc.imageStorageIds)) {
          for (const storageId of doc.imageStorageIds) {
            try {
              await ctx.storage.delete(storageId);
            } catch {
              // ignore
            }
          }
        }
        if (doc.coverPhotoStorageId) {
          try {
            await ctx.storage.delete(doc.coverPhotoStorageId);
          } catch {
            // ignore
          }
        }
        if (doc.videoStorageId) {
          try {
            await ctx.storage.delete(doc.videoStorageId);
          } catch {
            // ignore
          }
        }
        await ctx.db.delete(doc._id);
      }
    } catch (error) {
      throw error;
    }
  },
});
export const recordView = mutation({
  args: {
    propertyId: v.id("properties"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        counted: false,
        reason: "not-signed-in",
      };
    }

    const viewer = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!viewer || viewer.role !== "seeker") {
      return {
        counted: false,
        reason: "not-seeker",
      };
    }

    const property = await ctx.db.get(args.propertyId);

    if (!property) {
      throw new Error("Property not found.");
    }

    // Never count the property owner's own views.
    if (property.lister.id === identity.subject) {
      return {
        counted: false,
        reason: "own-property",
      };
    }

    // MakaoHub currently operates on Kenya time (UTC+3).
    const kenyaNow = new Date(
      Date.now() + 3 * 60 * 60 * 1000
    );

    const month = `${kenyaNow.getUTCFullYear()}-${String(
      kenyaNow.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    const existingView = await ctx.db
      .query("propertyViews")
      .withIndex("by_viewer_property_month", (q) =>
        q
          .eq("viewerId", identity.subject)
          .eq("propertyId", args.propertyId)
          .eq("month", month)
      )
      .first();

    if (existingView) {
      return {
        counted: false,
        reason: "already-viewed-this-month",
      };
    }

    await ctx.db.insert("propertyViews", {
      propertyId: args.propertyId,
      listerId: property.lister.id,
      viewerId: identity.subject,
      month,
      viewedAt: new Date().toISOString(),
    });

    return {
      counted: true,
      reason: "new-view",
    };
  },
});
export const getViewsThisMonth = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!user || user.role !== "lister") {
      return 0;
    }

    const kenyaNow = new Date(
      Date.now() + 3 * 60 * 60 * 1000
    );

    const month = `${kenyaNow.getUTCFullYear()}-${String(
      kenyaNow.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    const views = await ctx.db
      .query("propertyViews")
      .withIndex("by_lister_month", (q) =>
        q
          .eq("listerId", identity.subject)
          .eq("month", month)
      )
      .collect();

    return views.length;
  },
});
export const getViewsBreakdownThisMonth = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!user || user.role !== "lister") {
      return [];
    }

    const kenyaNow = new Date(
      Date.now() + 3 * 60 * 60 * 1000
    );

    const month = `${kenyaNow.getUTCFullYear()}-${String(
      kenyaNow.getUTCMonth() + 1
    ).padStart(2, "0")}`;

    const views = await ctx.db
      .query("propertyViews")
      .withIndex("by_lister_month", (q) =>
        q
          .eq("listerId", identity.subject)
          .eq("month", month)
      )
      .collect();

    const counts = new Map<string, number>();

    for (const view of views) {
      const propertyId = String(view.propertyId);

      counts.set(
        propertyId,
        (counts.get(propertyId) ?? 0) + 1
      );
    }

    return Array.from(counts.entries()).map(
      ([propertyId, views]) => ({
        propertyId,
        views,
      })
    );
  },
});