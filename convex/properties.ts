import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate an upload URL for uploading files (images, videos) to Convex File Storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
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
    const docs = await ctx.db.query("properties").order("desc").collect();
    return await Promise.all(docs.map((doc) => resolvePropertyMedia(ctx, doc)));
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
    const docs = await ctx.db
      .query("properties")
      .withIndex("by_lister", (q) => q.eq("lister.id", args.listerId))
      .order("desc")
      .collect();
    return await Promise.all(docs.map((doc) => resolvePropertyMedia(ctx, doc)));
  },
});

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return null;
    return await resolvePropertyMedia(ctx, doc);
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
    return await ctx.db.insert("properties", {
      ...args,
      agentFee: args.agentFee ?? 0,
      viewingFee: args.viewingFee ?? 0,
      deposit: args.deposit ?? 0,
      serviceCharge: args.serviceCharge ?? 0,
      waterDeposit: args.waterDeposit ?? 0,
      electricityDeposit: args.electricityDeposit ?? 0,
      garbageFee: args.garbageFee ?? 0,
      otherFees: args.otherFees ?? 0,
      status: args.status || "Pending",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.string(),
    status: v.string(),
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
  args: { id: v.string() },
  handler: async (ctx, args) => {
    try {
      const doc = await ctx.db.get(args.id as any);
      if (doc) {
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
    } catch {
      // Handle gracefully
    }
  },
});
