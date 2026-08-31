import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  properties: defineTable({
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
    status: v.string(), // "Pending" | "Approved" | "Rejected" | "Flagged" | "Archived" | "Suspended"
    rejectionReason: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    createdAt: v.string(),
    viewsCount: v.optional(v.number()),
    enquiriesCount: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_lister", ["lister.id"])
    .index("by_location", ["location.county", "location.subCounty"]),

  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.string(), // "seeker" | "lister" | "admin"
    listerSubtype: v.optional(v.string()),
    joinedAt: v.string(),
    avatar: v.string(),
    savedPropertyIds: v.array(v.string()),
    isSuspended: v.optional(v.boolean()),
  }).index("by_userId", ["userId"]),

  enquiries: defineTable({
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
    status: v.string(), // "New" | "Replied" | "Archived"
    readByLister: v.optional(v.boolean()),
    readBySeeker: v.optional(v.boolean()),
    messages: v.optional(
      v.array(
        v.object({
          id: v.string(),
          enquiryId: v.string(),
          senderId: v.string(),
          senderName: v.string(),
          senderRole: v.string(),
          senderAvatar: v.optional(v.string()),
          message: v.string(),
          createdAt: v.string(),
        })
      )
    ),
  })
    .index("by_lister", ["listerId"])
    .index("by_seeker", ["seekerId"])
    .index("by_property", ["propertyId"]),

  reviews: defineTable({
    propertyId: v.string(),
    authorId: v.optional(v.string()),
    authorName: v.string(),
    authorAvatar: v.optional(v.string()),
    rating: v.number(),
    date: v.string(),
    comment: v.optional(v.string()),
    wouldRecommend: v.optional(v.boolean()),
    reported: v.optional(v.boolean()),
    reply: v.optional(
      v.object({
        id: v.string(),
        reviewId: v.string(),
        propertyId: v.string(),
        listerId: v.string(),
        listerName: v.string(),
        listerSubtype: v.optional(v.string()),
        listerAvatar: v.optional(v.string()),
        replyText: v.string(),
        createdAt: v.string(),
        updatedAt: v.optional(v.string()),
      })
    ),
  }).index("by_property", ["propertyId"]),

  notifications: defineTable({
    recipientUserId: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    time: v.string(),
    read: v.boolean(),
    type: v.string(),
    targetPropertyId: v.optional(v.string()),
    targetReviewId: v.optional(v.string()),
    targetEnquiryId: v.optional(v.string()),
    targetMessageId: v.optional(v.string()),
  }).index("by_recipient", ["recipientUserId"]),
});
