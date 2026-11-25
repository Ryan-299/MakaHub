import { query, mutation } from "./_generated/server";
import { v, type Infer } from "convex/values";

import { internal } from "./_generated/api";
import { bnbDetailsValidator } from "./validators";

// ---------------------------------------------------------------
// BnB schedule checks: hosting period, stay rules and blocked nights.
// Dates are "YYYY-MM-DD". A "day number" is whole days since 1970.
// ---------------------------------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000;

// Returns the day number, or null if the text isn't a real calendar
// date (e.g. "2026-02-30" or "18/11/26").
function toDayNumber(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const time = Date.parse(`${date}T00:00:00Z`);

  if (Number.isNaN(time)) return null;
  if (new Date(time).toISOString().slice(0, 10) !== date) return null;

  return Math.round(time / DAY_MS);
}

// Today's date in Kenya (UTC+3), as a day number.
function kenyaToday(): number {
  return Math.floor((Date.now() + 3 * 60 * 60 * 1000) / DAY_MS);
}

type BnbSchedule = {
  minNights?: number;
  maxNights?: number;
  availableFrom?: string;
  hostingDurationNights?: number;
  blockedDates?: string[];
};

// Throws a clear error if the BnB schedule doesn't make sense.
// For a NEW listing it also checks that the start date is within the
// next year, and that not every night is blocked. Updates skip those
// two checks: an older BnB's start date is naturally in the past, and
// a fully booked host may block every remaining night.
function validateBnbSchedule(bnb: BnbSchedule, isNewListing: boolean) {
  const minNights = bnb.minNights ?? 1;
  const duration = bnb.hostingDurationNights;
  const startDay = bnb.availableFrom ? toDayNumber(bnb.availableFrom) : null;

  if (startDay === null || duration === undefined) {
    throw new Error("Set the date your BnB is available from and how many nights.");
  }

  if (isNewListing) {
    const today = kenyaToday();

    if (startDay < today || startDay > today + 365) {
      throw new Error("The available-from date must be within the next year.");
    }
  }

  if (!Number.isSafeInteger(duration) || duration < 1 || duration > 365) {
    throw new Error("Hosting duration must be between 1 and 365 nights.");
  }

  if (
    bnb.maxNights !== undefined &&
    (!Number.isSafeInteger(bnb.maxNights) ||
      bnb.maxNights < minNights ||
      bnb.maxNights > 365)
  ) {
    throw new Error("Maximum nights must be at least the minimum nights.");
  }

  if (minNights > duration) {
    throw new Error("The minimum stay is longer than your hosting period.");
  }

  const blocked = bnb.blockedDates ?? [];
  const blockedDays = new Set<number>();

  for (const date of blocked) {
    const day = toDayNumber(date);

    if (day === null) {
      throw new Error("Invalid blocked date.");
    }

    if (day < startDay || day >= startDay + duration) {
      throw new Error("Blocked dates must be inside your hosting period.");
    }

    blockedDays.add(day);
  }

  if (blockedDays.size !== blocked.length) {
    throw new Error("A blocked date was added twice.");
  }

  if (isNewListing && blockedDays.size >= duration) {
    throw new Error("Every night in your hosting period is blocked.");
  }
}

// ---------------------------------------------------------------
// BnB unit types: one building, several bookable types (e.g. Standard
// Room, Deluxe, 2-Bedroom Apartment), each with its own price and
// calendar. A BnB without unit types works exactly as before.
// ---------------------------------------------------------------
type BnbDetails = Infer<typeof bnbDetailsValidator>;

const MAX_BNB_UNIT_TYPES = 30;

// Checks every unit type and keeps the building-level fields in step,
// so cards, map pins and filters keep working:
// - pricePerNight / cleaningFee = the cheapest unit type ("from" price)
// - guests, bedrooms, beds, bathrooms = the largest unit type
// - blockedDates = nights when every open unit type is unavailable
function prepareBnbUnitTypes(bnb: BnbDetails): BnbDetails {
  const types = bnb.unitTypes;

  if (!types || types.length === 0) {
    const { unitTypes: _unused, ...single } = bnb;
    return single;
  }

  if (types.length > MAX_BNB_UNIT_TYPES) {
    throw new Error(`A BnB can have up to ${MAX_BNB_UNIT_TYPES} unit types.`);
  }

  const today = kenyaToday();
  const ids = new Set<string>();
  const names = new Set<string>();

  const cleaned = types.map((type) => {
    const id = type.id.trim();
    const name = type.name.trim();

    if (!id || id.length > 64 || ids.has(id)) {
      throw new Error("Each unit type needs its own ID.");
    }
    ids.add(id);

    if (!name || name.length > 80) {
      throw new Error("Give each unit type a name (up to 80 characters).");
    }

    const nameKey = name.toLowerCase();
    if (names.has(nameKey)) {
      throw new Error(`Two unit types are called "${name}".`);
    }
    names.add(nameKey);

    const unitCount = type.unitCount ?? 1;
    const wholeNumbers = [type.maxGuests, type.bedrooms, type.beds, type.bathrooms, unitCount];

    if (
      !Number.isFinite(type.pricePerNight) ||
      type.pricePerNight <= 0 ||
      !Number.isFinite(type.cleaningFee ?? 0) ||
      (type.cleaningFee ?? 0) < 0 ||
      wholeNumbers.some((value) => !Number.isSafeInteger(value) || value < 0) ||
      type.maxGuests < 1 ||
      unitCount < 1 ||
      unitCount > 500
    ) {
      throw new Error(`Invalid price or details for "${name}".`);
    }

    const images = type.imageStorageIds ?? [];
    if (images.length > 10 || new Set(images).size !== images.length) {
      throw new Error(`Check the photos for "${name}" (up to 10, no duplicates).`);
    }

    // Nights that have already passed no longer matter.
    const blockedDates = (type.blockedDates ?? []).filter((date) => {
      const day = toDayNumber(date);
      return day === null || day >= today;
    });

    // Same calendar rules as the building: real dates, inside the
    // hosting period, no duplicates.
    validateBnbSchedule({ ...bnb, blockedDates }, false);

    return { ...type, id, name, unitCount, blockedDates };
  });

  const cheapest = cleaned.reduce((low, type) =>
    type.pricePerNight < low.pricePerNight ? type : low
  );

  const open = cleaned.filter((type) => type.accepting !== false);
  const calendars = (open.length > 0 ? open : cleaned).map(
    (type) => new Set(type.blockedDates)
  );
  const blockedEverywhere = [...calendars[0]]
    .filter((date) => calendars.every((set) => set.has(date)))
    .sort();

  return {
    ...bnb,
    pricePerNight: cheapest.pricePerNight,
    cleaningFee: cheapest.cleaningFee,
    maxGuests: Math.max(...cleaned.map((type) => type.maxGuests)),
    bedrooms: Math.max(...cleaned.map((type) => type.bedrooms)),
    beds: Math.max(...cleaned.map((type) => type.beds)),
    bathrooms: Math.max(...cleaned.map((type) => type.bathrooms)),
    blockedDates: blockedEverywhere,
    unitTypes: cleaned,
  };
}

// Every photo used by a BnB's unit types.
function unitTypeMediaIds(bnb: BnbDetails | undefined): string[] {
  return (bnb?.unitTypes ?? []).flatMap((type) => type.imageStorageIds ?? []);
}
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
      await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
        recipientUserId: admin.userId,
        title: "🏠 New Listing Awaiting Approval",
        message: `"${args.name}" has been submitted and is waiting for your review.`,
      });
    }
    // Notify the lister that their property is awaiting review.
    await ctx.db.insert("notifications", {
      recipientUserId: args.lister.id,
      userId: args.lister.id,
      title: "Listing Submitted",
      message: `Your listing "${args.name}" has been submitted and is awaiting review.`,
      time: new Date().toISOString(),
      type: "system",
      targetPropertyId: propertyId.toString(),
      read: false,
    });
    await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
      recipientUserId: args.lister.id,
      title: "📝 Listing Submitted",
      message: `Your listing "${args.name}" has been submitted and is awaiting review.`,
    });
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
    bnb: v.optional(bnbDetailsValidator),
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


    const isBnbListing = args.type === "BnB";

    if (!isBnbListing && args.unitTypes.length < 1) {
      throw new Error("Select at least one unit type.");
    }

    if (new Set(args.unitTypes.map((unit) => unit.type)).size !== args.unitTypes.length) {
      throw new Error("Duplicate unit types are not allowed.");
    }

    if (!args.coverPhotoStorageId) {
      throw new Error("A building cover photo is required.");
    }

    let bnbToSave = args.bnb;

    if (isBnbListing) {
      if (!args.bnb) {
        throw new Error("BnB details are required.");
      }

      // Unit types (if any) are checked here and the building-level
      // price/size fields are filled in from them.
      const bnb = prepareBnbUnitTypes(args.bnb);
      bnbToSave = bnb;

      if (args.unitTypes.length !== 0) {
        throw new Error("A BnB can't be combined with rental unit types.");
      }

      const wholeNumbers = [
        bnb.maxGuests,
        bnb.bedrooms,
        bnb.beds,
        bnb.bathrooms,
        bnb.minNights ?? 1,
      ];

      if (
        !Number.isFinite(bnb.pricePerNight) ||
        bnb.pricePerNight <= 0 ||
        !Number.isFinite(bnb.cleaningFee ?? 0) ||
        (bnb.cleaningFee ?? 0) < 0 ||
        wholeNumbers.some((value) => !Number.isSafeInteger(value) || value < 0) ||
        bnb.maxGuests < 1 ||
        (bnb.minNights ?? 1) < 1 ||
        (bnb.houseRules?.length ?? 0) > 2000
      ) {
        throw new Error("Invalid BnB price or details.");
      }

      // Hosting period, stay rules and blocked nights.
      validateBnbSchedule(bnb, true);

      if (
        (bnb.checkInTime?.length ?? 0) > 20 ||
        (bnb.checkOutTime?.length ?? 0) > 20
      ) {
        throw new Error("Invalid check-in or check-out time.");
      }

    } else if (
      args.bnb !== undefined ||
      args.unitTypes.some((unit) => unit.type === "BnB")
    ) {
      throw new Error("A BnB can't be combined with rental unit types.");
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
      ...(bnbToSave ? { bnb: bnbToSave } : {}),
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
        title: isBnbListing
          ? "New BnB Awaiting Approval"
          : "New Property Awaiting Approval",
        message: `"${args.name}" has been submitted and is waiting for your review.`,
        time: new Date().toISOString(),
        type: "approval",
        targetPropertyId: propertyId.toString(),
        read: false,
      });
      await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
        recipientUserId: admin.userId,
        title: isBnbListing
          ? "🏖️ New BnB Awaiting Approval"
          : "🏠 New Listing Awaiting Approval",
        message: `"${args.name}" has been submitted and is waiting for your review.`,
      });
    }
    // Notify the lister that their property is awaiting review.
    await ctx.db.insert("notifications", {
      recipientUserId: args.lister.id,
      userId: args.lister.id,
      title: isBnbListing
        ? "BnB Submitted"
        : "Listing Submitted",
      message: isBnbListing
        ? `Your BnB "${args.name}" has been submitted and is awaiting review.`
        : `Your listing "${args.name}" has been submitted and is awaiting review.`,
      time: new Date().toISOString(),
      type: "system",
      targetPropertyId: propertyId.toString(),
      read: false,
    });
    await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
      recipientUserId: args.lister.id,
      title: isBnbListing
        ? "📝 BnB Submitted"
        : "📝 Listing Submitted",
      message: isBnbListing
        ? `Your BnB "${args.name}" has been submitted and is awaiting review.`
        : `Your listing "${args.name}" has been submitted and is awaiting review.`,
    });
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
    // Prevent listers from changing their own approval status.
    // Only allow rejected listings to be resubmitted for review.
    if (updates.status !== undefined) {
      const isResubmitting =
        doc.status === "Rejected" && updates.status === "Pending";

      if (!isResubmitting) {
        delete updates.status;
      }
    }

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
        await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
          recipientUserId: admin.userId,
          title: "🔁 Listing Resubmitted",
          message: `"${updates.name || doc.name}" was updated after rejection and is waiting for your review.`,
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

      const propertyId = ctx.db.normalizeId("properties", args.id);


      if (!propertyId) {
        throw new Error("Invalid listing ID.");
      }


      const doc = await ctx.db.get("properties", propertyId);

      if (!doc) {
        throw new Error("Listing not found.");
      }



      if (doc) {
        await ctx.db.patch(doc._id, {
          status: args.status,
          rejectionReason: args.rejectionReason,
        });


        // Notify the lister only when the moderation status changes.
        if (
          doc.status !== args.status &&
          (args.status === "Approved" || args.status === "Rejected")
        ) {
          const approved = args.status === "Approved";
          const isBnb = doc.type === "BnB";
          const kind = isBnb ? "BnB" : "Listing";
          const kindLower = isBnb ? "BnB" : "listing";

          const title = approved
            ? `${kind} Approved`
            : `${kind} Rejected`;

          const message = approved
            ? isBnb
              ? `Your BnB "${doc.name}" has been approved and is now live on Rentike. Guests can find it and request a stay.`
              : `Your listing "${doc.name}" has been approved and is now live on Rentike.`
            : `Your ${kindLower} "${doc.name}" was not approved. Open Rentike to review its status.`;

          // Save the notification in Rentike.
          await ctx.db.insert("notifications", {
            recipientUserId: doc.lister.id,
            userId: doc.lister.id,
            actorUserId: identity.subject,
            title,
            message,
            time: new Date().toISOString(),
            type: approved ? "approval" : "rejection",
            targetPropertyId: doc._id.toString(),
            read: false,
          });

          // Send the Android phone notification.
          await ctx.scheduler.runAfter(
            0,
            internal.pushSender.sendToRecipient,
            {
              recipientUserId: doc.lister.id,
              title,
              message,
            }
          );
        }

      }


    } catch (error) {
      console.error("Failed to update listing status:", error);
      throw error;
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
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();

    if (!requester) {
      throw new Error("User account not found.");
    }

    const doc = await ctx.db.get(args.id);

    if (!doc) return;

    const isOwner = doc.lister.id === identity.subject;
    const isAdmin = requester.role === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error(
        "You are not authorized to delete this property."
      );
    }

    // Find unit types belonging ONLY to this property.
    const unitTypes = await ctx.db
      .query("propertyUnitTypes")
      .withIndex("by_property", (q) =>
        q.eq("propertyId", doc._id)
      )
      .collect();

    // Gather media IDs without duplicates.
    const storageIds = new Set(doc.imageStorageIds ?? []);

    if (doc.coverPhotoStorageId) {
      storageIds.add(doc.coverPhotoStorageId);
    }

    if (doc.videoStorageId) {
      storageIds.add(doc.videoStorageId);
    }

    for (const id of unitTypeMediaIds(doc.bnb)) {
      storageIds.add(id as any);
    }

    for (const unit of unitTypes) {
      for (const id of unit.imageStorageIds ?? []) {
        storageIds.add(id);
      }

      if (unit.coverPhotoStorageId) {
        storageIds.add(unit.coverPhotoStorageId);
      }

      if (unit.videoStorageId) {
        storageIds.add(unit.videoStorageId);
      }
    }

    // Remove every associated unit record.
    for (const unit of unitTypes) {
      await ctx.db.delete(unit._id);
    }

    // Remove the main property.
    await ctx.db.delete(doc._id);

    // Clean up associated storage files.
    for (const storageId of storageIds) {
      try {
        await ctx.storage.delete(storageId);
      } catch (error) {
        console.warn(
          "Unable to delete property media:",
          storageId,
          error
        );
      }
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

    if (
      !viewer ||
      (viewer.role !== "seeker" && viewer.role !== "lister")
    ) {
      return {
        counted: false,
        reason: "not-seeker-or-lister",
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

export const updateBnbAvailability = mutation({
  args: {
    id: v.id("properties"),
    blockedDates: v.optional(v.array(v.string())),
    accepting: v.optional(v.boolean()),
    // For BnBs with unit types: which unit type's calendar to change.
    unitTypeId: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const property = await ctx.db.get(args.id);

    if (!property || property.type !== "BnB" || !property.bnb) {
      throw new Error("BnB listing not found.");
    }

    if (property.lister.id !== identity.subject) {
      throw new Error("You can only update your own BnB.");
    }

    if (
      args.blockedDates === undefined &&
      args.accepting === undefined
    ) {
      throw new Error("No availability changes provided.");
    }

    let blockedDates = args.blockedDates;

    if (blockedDates !== undefined) {
      // Nights that have already passed no longer matter: drop them
      // instead of rejecting the whole update.
      const today = kenyaToday();

      blockedDates = blockedDates.filter((date) => {
        const day = toDayNumber(date);
        return day === null || day >= today;
      });

      // Same checks as new listings: real dates, inside the hosting
      // period, no duplicates.
      validateBnbSchedule({ ...property.bnb, blockedDates }, false);
    }

    const unitTypes = property.bnb.unitTypes ?? [];

    if (args.unitTypeId !== undefined) {
      if (!unitTypes.some((type) => type.id === args.unitTypeId)) {
        throw new Error("Unit type not found.");
      }

      const updatedTypes = unitTypes.map((type) =>
        type.id !== args.unitTypeId
          ? type
          : {
            ...type,
            ...(blockedDates !== undefined ? { blockedDates } : {}),
            ...(args.accepting !== undefined ? { accepting: args.accepting } : {}),
          }
      );

      await ctx.db.patch(args.id, {
        bnb: prepareBnbUnitTypes({ ...property.bnb, unitTypes: updatedTypes }),
      });

      return { success: true };
    }

    // With unit types, each type has its own calendar.
    if (unitTypes.length > 0 && blockedDates !== undefined) {
      throw new Error("Choose which unit type's calendar to update.");
    }

    await ctx.db.patch(args.id, {
      bnb: {
        ...property.bnb,
        ...(blockedDates !== undefined
          ? { blockedDates }
          : {}),
        ...(args.accepting !== undefined
          ? { accepting: args.accepting }
          : {}),
      },
    });

    return { success: true };
  },
});
// ---------------------------------------------------------------
// Edit a BnB the host owns. Edits go live straight away (only the
// first post needs approval). A rejected BnB is resubmitted for review.
// Rental editing (updateProperty) is unchanged.
// ---------------------------------------------------------------
export const updateBnb = mutation({
  args: {
    id: v.id("properties"),
    name: v.string(),
    description: v.string(),
    contactPhone: v.string(),
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
    amenities: v.array(v.string()),
    bnb: bnbDetailsValidator,
    // Cover photo first, then the other photos.
    imageStorageIds: v.array(v.id("_storage")),
    videoStorageId: v.optional(v.id("_storage")),
    videoName: v.optional(v.string()),
    videoSize: v.optional(v.number()),
    removeVideo: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const doc = await ctx.db.get(args.id);

    if (!doc || doc.type !== "BnB" || !doc.bnb) {
      throw new Error("BnB listing not found.");
    }

    if (doc.lister.id !== identity.subject) {
      throw new Error("You can only edit your own BnB.");
    }

    const name = args.name.trim();

    if (!name || name.length > 120) {
      throw new Error("Enter a BnB name (up to 120 characters).");
    }

    if (args.description.length > 5000) {
      throw new Error("The description is too long.");
    }

    const phone = args.contactPhone.trim().replace(/[\s()-]/g, "");

    if (!/^(?:0[17]\d{8}|\+254[17]\d{8})$/.test(phone)) {
      throw new Error("Enter a valid Kenyan contact phone number.");
    }

    const normalizedPhone = phone.startsWith("0") ? `+254${phone.slice(1)}` : phone;

    if (args.imageStorageIds.length < 2 || args.imageStorageIds.length > 11) {
      throw new Error("Keep a cover photo and at least one more photo (up to 11).");
    }

    if (new Set(args.imageStorageIds).size !== args.imageStorageIds.length) {
      throw new Error("A photo was added twice.");
    }

    if (
      args.videoSize !== undefined &&
      (args.videoSize < 0 || !Number.isSafeInteger(args.videoSize))
    ) {
      throw new Error("Invalid house tour video.");
    }

    // Unit types (if any) are checked and the building-level fields
    // filled in from them. Then the same checks as a new BnB.
    // If the form didn't send unitTypes at all (e.g. an older edit form),
    // keep the building's existing unit types. An explicit empty list
    // still removes them on purpose.
    const bnb = prepareBnbUnitTypes({
      ...args.bnb,
      unitTypes: args.bnb.unitTypes ?? doc.bnb.unitTypes,
    });
    const wholeNumbers = [
      bnb.maxGuests,
      bnb.bedrooms,
      bnb.beds,
      bnb.bathrooms,
      bnb.minNights ?? 1,
    ];

    if (
      !Number.isFinite(bnb.pricePerNight) ||
      bnb.pricePerNight <= 0 ||
      !Number.isFinite(bnb.cleaningFee ?? 0) ||
      (bnb.cleaningFee ?? 0) < 0 ||
      wholeNumbers.some((value) => !Number.isSafeInteger(value) || value < 0) ||
      bnb.maxGuests < 1 ||
      (bnb.minNights ?? 1) < 1 ||
      (bnb.houseRules?.length ?? 0) > 2000
    ) {
      throw new Error("Invalid BnB price or details.");
    }

    if (
      (bnb.checkInTime?.length ?? 0) > 20 ||
      (bnb.checkOutTime?.length ?? 0) > 20
    ) {
      throw new Error("Invalid check-in or check-out time.");
    }

    // Nights that have already passed no longer matter.
    const today = kenyaToday();
    const blockedDates = (bnb.blockedDates ?? []).filter((date) => {
      const day = toDayNumber(date);
      return day === null || day >= today;
    });

    // A new start date must be within the next year (same rule as new
    // listings). An unchanged start date may already be in the past.
    const startChanged = bnb.availableFrom !== doc.bnb.availableFrom;
    validateBnbSchedule({ ...bnb, blockedDates }, startChanged);

    // Media no longer used by this BnB, to clean up after saving.
    const keptIds = new Set<string>(args.imageStorageIds);
    const newVideoId = args.videoStorageId;
    const dropVideo = Boolean(newVideoId) || args.removeVideo === true;

    if (newVideoId) keptIds.add(newVideoId);
    if (!dropVideo && doc.videoStorageId) keptIds.add(doc.videoStorageId);
    for (const id of unitTypeMediaIds(bnb)) keptIds.add(id);

    const oldIds = new Set<string>(doc.imageStorageIds ?? []);
    for (const id of unitTypeMediaIds(doc.bnb)) oldIds.add(id);
    if (doc.coverPhotoStorageId) oldIds.add(doc.coverPhotoStorageId);
    if (doc.videoStorageId) oldIds.add(doc.videoStorageId);

    const unusedIds = [...oldIds].filter((id) => !keptIds.has(id));

    const isResubmission = doc.status === "Rejected";

    await ctx.db.patch(doc._id, {
      name,
      description: args.description,
      location: args.location,
      amenities: args.amenities,
      bnb: { ...bnb, blockedDates },
      images: [],
      imageStorageIds: args.imageStorageIds,
      coverPhotoStorageId: args.imageStorageIds[0],
      lister: { ...doc.lister, phone: normalizedPhone },
      ...(newVideoId
        ? {
          videoStorageId: newVideoId,
          video: undefined,
          videoName: args.videoName,
          videoSize: args.videoSize,
        }
        : args.removeVideo
          ? {
            videoStorageId: undefined,
            video: undefined,
            videoName: undefined,
            videoSize: undefined,
          }
          : {}),
      ...(isResubmission ? { status: "Pending", rejectionReason: undefined } : {}),
    });

    // Delete replaced photos/video, but only files no other listing uses.
    if (unusedIds.length > 0) {
      const usedElsewhere = new Set<string>();

      for (const other of await ctx.db.query("properties").collect()) {
        if (other._id === doc._id) continue;
        for (const id of other.imageStorageIds ?? []) usedElsewhere.add(id);
        if (other.coverPhotoStorageId) usedElsewhere.add(other.coverPhotoStorageId);
        if (other.videoStorageId) usedElsewhere.add(other.videoStorageId);
        for (const id of unitTypeMediaIds(other.bnb)) usedElsewhere.add(id);
      }

      for (const unit of await ctx.db.query("propertyUnitTypes").collect()) {
        for (const id of unit.imageStorageIds ?? []) usedElsewhere.add(id);
        if (unit.coverPhotoStorageId) usedElsewhere.add(unit.coverPhotoStorageId);
        if (unit.videoStorageId) usedElsewhere.add(unit.videoStorageId);
      }

      for (const id of unusedIds) {
        if (usedElsewhere.has(id)) continue;
        try {
          await ctx.storage.delete(id as any);
        } catch (error) {
          console.warn("Unable to delete replaced BnB media:", id, error);
        }
      }
    }

    if (isResubmission) {
      const admins = (await ctx.db.query("users").collect()).filter(
        (user) => user.role === "admin"
      );

      for (const admin of admins) {
        await ctx.db.insert("notifications", {
          recipientUserId: admin.userId,
          userId: identity.subject,
          title: "BnB Resubmitted for Approval",
          message: `"${name}" was updated after rejection and is waiting for your review.`,
          time: new Date().toISOString(),
          type: "approval",
          targetPropertyId: doc._id.toString(),
          read: false,
        });
        await ctx.scheduler.runAfter(0, internal.pushSender.sendToRecipient, {
          recipientUserId: admin.userId,
          title: "🔁 BnB Resubmitted",
          message: `"${name}" was updated after rejection and is waiting for your review.`,
        });
      }
    }

    return doc._id;
  },
});
