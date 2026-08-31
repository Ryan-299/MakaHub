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
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.string(),
    listerSubtype: v.optional(v.string()),
    joinedAt: v.string(),
    avatar: v.string(),
    savedPropertyIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("users", args);
    }
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
