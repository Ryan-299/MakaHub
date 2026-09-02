export type UserRole = 'seeker' | 'lister' | 'admin';

export type ListerSubtype =
  | 'Landlord / Property Owner'
  | 'Caretaker'
  | 'Property Manager'
  | 'Real Estate Agent'
  | 'Property Agency'
  | 'Property Company'
  | 'Property Developer';

export type PropertyType =
  | 'Single Room'
  | 'Bedsitter'
  | '1 Bedroom'
  | '2 Bedroom'
  | '3 Bedroom'
  | '4+ Bedroom'
  | 'Studio'
  | 'Entire House'
  | 'Own Compound House'
  | 'Commercial / Shop';

export type PropertyStatus = 'Pending' | 'Approved' | 'Rejected' | 'Flagged' | 'Archived';

export interface LocationHierarchy {
  county: string;
  subCounty: string;
  ward: string;
  estate: string;
  address?: string;
  lat: number;
  lng: number;
  distanceMock?: number; // e.g. 0.8, 1.2
}

export interface UnitGroupSummary {
  type: PropertyType;
  rent: number;
  vacant: number;
}

export interface PropertyListing {
  id: string;
  name: string;
  type: PropertyType;
  monthlyRent: number; // in KSh
  deposit: number;
  serviceCharge: number;
  agentFee: number;
  viewingFee?: number;
  waterDeposit: number;
  electricityDeposit?: number;
  garbageFee?: number;
  otherFees: number;
  location: LocationHierarchy;
  vacancies: number; // key rule: if vacancies === 0 -> Fully Occupied and hidden from seeker search/map
  occupied: number;
  underRepair: number;
  unitGroups?: UnitGroupSummary[];
  amenities: string[];
  rating: number;
  reviewCount: number;
  timePosted: string;
  images: string[];
  coverPhoto?: string;
  video?: string;
  videoName?: string;
  videoSize?: number;
  imageStorageIds?: string[];
  coverPhotoStorageId?: string;
  videoStorageId?: string;
  description: string;
  lister: {
    id: string;
    name: string;
    type: ListerSubtype;
    avatar: string;
    phone?: string;
    email?: string;
    verified: boolean;
  };
  status: PropertyStatus;
  rejectionReason?: string;
  featured?: boolean;
  createdAt: string;
  viewsCount?: number;
  enquiriesCount?: number;
}

export interface ListerReviewReply {
  id: string;
  reviewId: string;
  propertyId: string;
  listerId: string;
  listerName: string;
  listerSubtype?: ListerSubtype;
  listerAvatar?: string;
  replyText: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PropertyReview {
  id: string;
  propertyId: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  date: string;
  comment?: string;
  wouldRecommend?: boolean;
  reported?: boolean;
  reply?: ListerReviewReply;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  listerSubtype?: ListerSubtype;
  joinedAt: string;
  avatar: string;
  savedPropertyIds: string[];
  isSuspended?: boolean;
}

export interface PlatformReport {
  id: string;
  type: 'property' | 'user' | 'review';
  targetId: string;
  targetTitle: string;
  targetSubtitle?: string;
  reason: string;
  reporterCount: number;
  status: 'open' | 'investigated' | 'dismissed';
  createdAt: string;
  notes?: string;
}

export interface UserNotification {
  id: string;
  recipientUserId: string;
  userId?: string;
  title: string;
  message: string;
  time: string;
  createdAt?: string;
  timestamp?: number;
  read: boolean;
  type: 'approval' | 'rejection' | 'review' | 'enquiry' | 'system' | 'flag';
  targetPropertyId?: string;
  targetReviewId?: string;
  targetEnquiryId?: string;
  targetMessageId?: string;
}

export interface MapNavigationTarget {
  id: string;
  lat: number;
  lng: number;
  zoom: number;
  reason: 'search' | 'selection' | 'property' | 'recenter' | 'geolocation' | 'area_search' | 'manual';
  locationName?: string;
  propertyId?: string;
}

export interface FilterCriteria {
  searchQuery: string;
  county: string;
  subCounty: string;
  ward: string;
  estate: string;
  propertyType: string;
  minRent: number | '';
  maxRent: number | '';
  amenities: string[];
}

export interface EnquiryMessage {
  id: string;
  enquiryId: string;
  senderId: string;
  senderName: string;
  senderRole: 'seeker' | 'lister';
  senderAvatar?: string;
  message: string;
  createdAt: string;
}

export interface ListerEnquiry {
  id: string;
  propertyId: string;
  propertyName: string;
  seekerId: string;
  seekerName: string;
  seekerPhone: string;
  seekerEmail?: string;
  seekerAvatar?: string;
  listerId: string;
  message: string;
  date: string;
  createdAt?: string;
  status: 'New' | 'Replied' | 'Archived';
  readByLister?: boolean;
  readBySeeker?: boolean;
  messages?: EnquiryMessage[];
  replies?: EnquiryMessage[];
}

export type SubscriptionTier = 'starter' | 'growth' | 'business' | 'portfolio';

export type SubscriptionStatus = 'Active' | 'Payment Due' | 'Payment Failed' | 'Cancelled';

export type PaymentMethodOption = 'mpesa' | 'card' | 'google_pay';

export interface ListerSubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  minListings: number;
  maxListings: number;
  monthlyPrice: number; // in KSh
  popular?: boolean;
  suitableFor: string[];
  features: string[];
}

export interface ListerSubscription {
  planId: SubscriptionTier;
  status: SubscriptionStatus;
  monthlyPrice: number;
  maxListings: number;
  renewalDate: string;
  reminderDate: string;
  autoRenew: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export type AdminTab =
  | 'overview'
  | 'pending-properties'
  | 'all-properties'
  | 'users'
  | 'reports'
  | 'activity'
  | 'locations'
  | 'settings';

export interface AdminActivityItem {
  id: string;
  action:
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'reinstated'
  | 'investigated'
  | 'user_suspended'
  | 'user_reinstated'
  | 'review_deleted';
  title: string;
  details: string;
  targetId?: string;
  timestamp: string;
}

