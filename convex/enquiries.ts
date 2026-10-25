import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const ENCRYPTED_PREFIX = "enc:v1:";

function getMessageEncryptionKey(): string {
  const key = process.env.RENTIKE_MESSAGE_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("RENTIKE_MESSAGE_ENCRYPTION_KEY is not configured.");
  }

  return key;
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function bytesToBase64(value: Uint8Array): string {
  let binary = "";

  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

async function getCryptoKey(): Promise<CryptoKey> {
  const rawKey = base64ToBytes(getMessageEncryptionKey());

  if (rawKey.length !== 32) {
    throw new Error("Message encryption key must be exactly 32 bytes.");
  }

  return await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptMessage(plaintext: string): Promise<string> {
  if (!plaintext || plaintext.startsWith(ENCRYPTED_PREFIX)) {
    return plaintext;
  }

  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return (
    ENCRYPTED_PREFIX +
    bytesToBase64(iv) +
    ":" +
    bytesToBase64(new Uint8Array(encrypted))
  );
}

async function decryptMessage(value: string): Promise<string> {
  if (!value || !value.startsWith(ENCRYPTED_PREFIX)) {
    return value;
  }

  const parts = value.split(":");

  if (parts.length !== 4) {
    throw new Error("Invalid encrypted message format.");
  }

  const iv = base64ToBytes(parts[2]);
  const ciphertext = base64ToBytes(parts[3]);
  const key = await getCryptoKey();

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}
async function decryptEnquiry(enquiry: any) {
  const decryptedMessages = enquiry.messages
    ? await Promise.all(
      enquiry.messages.map(async (msg: any) => ({
        ...msg,
        message: await decryptMessage(msg.message),
      }))
    )
    : enquiry.messages;

  return {
    ...enquiry,
    message: await decryptMessage(enquiry.message),
    messages: decryptedMessages,
  };
}
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

    const enquiries = await ctx.db
      .query("enquiries")
      .withIndex("by_lister", (q) => q.eq("listerId", identity.subject))
      .collect();

    return await Promise.all(enquiries.map(decryptEnquiry));
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


    const enquiries = await ctx.db
      .query("enquiries")
      .withIndex("by_seeker", (q) => q.eq("seekerId", identity.subject))
      .collect();

    return await Promise.all(enquiries.map(decryptEnquiry));
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
    const existingEnquiry = await ctx.db
      .query("enquiries")
      .withIndex("by_seeker", (q) =>
        q.eq("seekerId", identity.subject)
      )
      .filter((q) =>
        q.eq(q.field("propertyId"), args.propertyId)
      )
      .first();

    if (existingEnquiry) {
      return existingEnquiry._id;
    }
    const serverNow = new Date().toISOString();
    const encryptedInitialMessage = await encryptMessage(args.message);
    const newEnquiryId = await ctx.db.insert("enquiries", {
      ...args,
      seekerId: identity.subject,
      seekerName: seeker.name,
      seekerPhone: seeker.phone,
      seekerEmail: seeker.email,
      seekerAvatar: seeker.avatar,
      listerId: property.lister.id,
      propertyName: property.name,
      message: encryptedInitialMessage,

      date: serverNow,
      createdAt: serverNow,
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
      message: encryptedInitialMessage,
      createdAt: serverNow,
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
    const serverNow = new Date().toISOString();
    const encryptedMessage = await encryptMessage(args.message);
    const newMessage = {
      id: `msg-${Date.now()}`,
      enquiryId: args.enquiryId,
      senderId: identity.subject,
      senderName: sender.name,
      senderRole: actualRole,
      senderAvatar: sender.avatar,
      message: encryptedMessage,
      createdAt: serverNow,
    };

    await ctx.db.patch(args.enquiryId, {
      messages: [...currentMessages, newMessage],
      status: isLister ? "Replied" : "New",
      readByLister: isLister,
      readBySeeker: !isLister,
    });
  },
});
export const markAsRead = mutation({
  args: {
    enquiryId: v.id("enquiries"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const enquiry = await ctx.db.get(args.enquiryId);

    if (!enquiry) {
      throw new Error("Enquiry not found.");
    }

    const isLister = enquiry.listerId === identity.subject;
    const isSeeker = enquiry.seekerId === identity.subject;

    if (!isLister && !isSeeker) {
      throw new Error("You are not allowed to access this enquiry.");
    }

    if (isLister) {
      await ctx.db.patch(args.enquiryId, {
        readByLister: true,
      });
    } else {
      await ctx.db.patch(args.enquiryId, {
        readBySeeker: true,
      });
    }
  },
});