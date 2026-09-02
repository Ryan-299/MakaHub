import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
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

    const userData = {
      userId: effectiveUserId,
      name: args.name ?? existing?.name ?? "MakaoHub User",
      email: args.email ?? existing?.email ?? "",
      phone: args.phone ?? existing?.phone ?? "",
      role: args.role ?? existing?.role ?? "unassigned",
      listerSubtype:
        args.listerSubtype !== undefined
          ? args.listerSubtype
          : existing?.listerSubtype,
      joinedAt:
        existing?.joinedAt ??
        args.joinedAt ??
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

    return await ctx.db.insert("users", userData);
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
