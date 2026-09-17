import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByLister = query({
  args: { listerId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (args.listerId !== identity.subject) {
      throw new Error("You can only view your own enquiries.");
    }

    return await ctx.db
      .query("enquiries")
      .withIndex("by_lister", (q) => q.eq("listerId", identity.subject))
      .collect();
  },
});

export const listBySeeker = query({
  args: { seekerId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (args.seekerId !== identity.subject) {
      throw new Error("You can only view your own enquiries.");
    }


    return await ctx.db
      .query("enquiries")
      .withIndex("by_seeker", (q) => q.eq("seekerId", identity.subject))
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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (args.seekerId !== identity.subject) {
      throw new Error("You can only send enquiries as yourself.");
    }
    const propertyDocId = ctx.db.normalizeId("properties", args.propertyId);

    if (!propertyDocId) {
      throw new Error("Invalid property.");
    }

    const property = await ctx.db.get("properties", propertyDocId);

    if (!property) {
      throw new Error("Property not found.");
    }

    if (args.listerId !== property.lister.id) {
      throw new Error("Invalid property owner.");
    }
    const seeker = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!seeker) {
      throw new Error("User profile not found.");
    }
    const newEnquiryId = await ctx.db.insert("enquiries", {
      ...args,
      seekerId: identity.subject,
      seekerName: seeker.name,
      seekerPhone: seeker.phone,
      seekerEmail: seeker.email,
      seekerAvatar: seeker.avatar,
      listerId: property.lister.id,
      propertyName: property.name,
      status: "New",
      readByLister: false,
      readBySeeker: true,
      messages: [],
    });

    const initialMessage = {
      id: `msg-${Date.now()}`,
      enquiryId: newEnquiryId,
      senderId: identity.subject,
      senderName: seeker.name,
      senderRole: "seeker",
      senderAvatar: seeker.avatar,
      message: args.message,
      createdAt: args.createdAt,
    };

    await ctx.db.patch(newEnquiryId, {
      messages: [initialMessage],
    });

    return newEnquiryId;
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
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const enquiry = await ctx.db.get(args.enquiryId);

    if (!enquiry) {
      throw new Error("Enquiry not found");
    }

    const isLister = enquiry.listerId === identity.subject;
    const isSeeker = enquiry.seekerId === identity.subject;

    if (!isLister && !isSeeker) {
      throw new Error("You are not allowed to reply to this enquiry.");
    }

    const actualRole = isLister ? "lister" : "seeker";
    const sender = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (!sender) {
      throw new Error("User profile not found.");
    }
    const currentMessages = enquiry.messages || [];

    const newMessage = {
      id: `msg-${Date.now()}`,
      enquiryId: args.enquiryId,
      senderId: identity.subject,
      senderName: sender.name,
      senderRole: actualRole,
      senderAvatar: sender.avatar,
      message: args.message,
      createdAt: args.createdAt,
    };

    await ctx.db.patch(args.enquiryId, {
      messages: [...currentMessages, newMessage],
      status: isLister ? "Replied" : "New",
      readByLister: isLister,
      readBySeeker: !isLister,
    });
  },
});
