import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByLister = query({
  args: { listerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enquiries")
      .withIndex("by_lister", (q) => q.eq("listerId", args.listerId))
      .collect();
  },
});

export const listBySeeker = query({
  args: { seekerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("enquiries")
      .withIndex("by_seeker", (q) => q.eq("seekerId", args.seekerId))
      .collect();
  },
});

export const create = mutation({
  args: {
    propertyId: v.string(),
    propertyName: v.string(),
    seekerId: v.string(),
    seekerName: v.string(),
    seekerPhone: v.string(),
    seekerEmail: v.optional(v.string()),
    seekerAvatar: v.optional(v.string()),
    listerId: v.string(),
    message: v.string(),
    date: v.string(),
    createdAt: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("enquiries", {
      ...args,
      readByLister: false,
      readBySeeker: true,
      messages: [
        {
          id: `msg-${Date.now()}`,
          enquiryId: "",
          senderId: args.seekerId,
          senderName: args.seekerName,
          senderRole: "seeker",
          senderAvatar: args.seekerAvatar,
          message: args.message,
          createdAt: args.createdAt,
        },
      ],
    });
  },
});

export const sendMessage = mutation({
  args: {
    enquiryId: v.id("enquiries"),
    senderId: v.string(),
    senderName: v.string(),
    senderRole: v.string(),
    senderAvatar: v.optional(v.string()),
    message: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const enquiry = await ctx.db.get(args.enquiryId);
    if (!enquiry) throw new Error("Enquiry not found");

    const currentMessages = enquiry.messages || [];
    const newMessage = {
      id: `msg-${Date.now()}`,
      enquiryId: args.enquiryId,
      senderId: args.senderId,
      senderName: args.senderName,
      senderRole: args.senderRole,
      senderAvatar: args.senderAvatar,
      message: args.message,
      createdAt: args.createdAt,
    };

    const isLister = args.senderRole === "lister";

    await ctx.db.patch(args.enquiryId, {
      messages: [...currentMessages, newMessage],
      status: isLister ? "Replied" : "New",
      readByLister: isLister,
      readBySeeker: !isLister,
    });
  },
});
