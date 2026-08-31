import { ListerSubscriptionPlan } from '../types';

export const SUBSCRIPTION_PLANS: ListerSubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: '1–5 Active Listings',
    minListings: 1,
    maxListings: 5,
    monthlyPrice: 500,
    suitableFor: [
      'Individual landlords',
      'Small property owners'
    ],
    features: [
      'Up to 5 active property listings',
      'Real-time vacancy tracking',
      'Seeker direct enquiry messaging',
      'Tenant review management',
      'Standard search & map placement'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    tagline: '6–15 Active Listings',
    minListings: 6,
    maxListings: 15,
    monthlyPrice: 1500,
    popular: true,
    suitableFor: [
      'Growing landlords',
      'Caretakers',
      'Property managers',
      'Small agents'
    ],
    features: [
      'Up to 15 active property listings',
      'Priority search & map indexing',
      'Instant vacancy updates & notifications',
      'Seeker enquiry direct replies',
      'Tenant reviews & public landlord responses',
      'Detailed views & engagement analytics'
    ]
  },
  {
    id: 'business',
    name: 'Business',
    tagline: '16–50 Active Listings',
    minListings: 16,
    maxListings: 50,
    monthlyPrice: 4500,
    suitableFor: [
      'Large landlords',
      'Real estate agents',
      'Property agencies',
      'Property managers',
      'Property companies'
    ],
    features: [
      'Up to 50 active property listings',
      'Featured badge & top search placement',
      'Multi-estate portfolio manager',
      'Unlimited tenant reviews & responses',
      'Dedicated MakaoHub account support',
      'Exportable vacancy & enquiry reports'
    ]
  }
];

export const DEFAULT_MARY_SUBSCRIPTION = {
  planId: 'growth' as const,
  status: 'Active' as const,
  monthlyPrice: 1500,
  maxListings: 15,
  renewalDate: '28 September 2026',
  reminderDate: '26 September 2026',
  autoRenew: true
};
