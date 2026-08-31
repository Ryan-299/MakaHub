import { PropertyListing, PropertyReview, UserAccount, PlatformReport, UserNotification, ListerEnquiry, AdminActivityItem } from '../types';

export const INITIAL_PROPERTIES: PropertyListing[] = [
  {
    id: 'prop-greenview-01',
    name: 'Greenview Apartments',
    type: 'Bedsitter',
    monthlyRent: 9500,
    deposit: 9500,
    serviceCharge: 1000,
    agentFee: 0,
    waterDeposit: 1500,
    otherFees: 500, // Garbage & security badge
    location: {
      county: 'Nairobi',
      subCounty: 'Kasarani',
      ward: 'Claycity',
      estate: 'Seasons',
      address: 'Off Seasons Road, behind Equity Bank',
      lat: -1.2223,
      lng: 36.9015,
      distanceMock: 1.2
    },
    vacancies: 3, // Meets demo flow: 3 vacancies
    occupied: 19,
    underRepair: 2,
    unitGroups: [
      { type: 'Bedsitter', rent: 9500, vacant: 3 },
      { type: '1 Bedroom', rent: 14000, vacant: 1 },
      { type: '2 Bedroom', rent: 20000, vacant: 0 }
    ],
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Balcony', 'Prepaid Electricity', 'Parking'],
    rating: 4.8,
    reviewCount: 1,
    timePosted: 'Added 2 hours ago',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Modern, well-lit studio/bedsitter situated along Seasons Road in Kasarani. Features an instant hot shower, fitted kitchen cabinets, tiled floors, continuous borehole + county water backup, Safaricom & Zuku fibre connectivity, CCTV surveillance, 24/7 security guard, and a designated rooftop hanging line area.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Approved',
    featured: true,
    createdAt: '2026-08-24T05:00:00.000Z',
    viewsCount: 846,
    enquiriesCount: 17
  },
  {
    id: 'prop-mwiki-heights',
    name: 'Mwiki Heights Suites',
    type: 'Bedsitter',
    monthlyRent: 8000,
    deposit: 8000,
    serviceCharge: 800,
    agentFee: 0,
    waterDeposit: 1000,
    otherFees: 400,
    location: {
      county: 'Nairobi',
      subCounty: 'Kasarani',
      ward: 'Mwiki',
      estate: 'Mwiki Phase 3',
      address: 'Near Mwiki Terminus',
      lat: -1.2312,
      lng: 36.9241,
      distanceMock: 2.7
    },
    vacancies: 4,
    occupied: 22,
    underRepair: 0,
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Prepaid Electricity'],
    rating: 4.5,
    reviewCount: 0,
    timePosted: 'Added yesterday',
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Affordable modern studio units in Mwiki with token meters, perimeter electric fence, constant solar water heating, high-speed fibre ready, and walking distance to commuter transport.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Approved',
    createdAt: '2026-08-23T10:00:00.000Z',
    viewsCount: 310,
    enquiriesCount: 6
  },
  {
    id: 'prop-ruaka-joyland',
    name: 'Joyland Heights',
    type: '2 Bedroom',
    monthlyRent: 25000,
    deposit: 25000,
    serviceCharge: 2000,
    agentFee: 0,
    waterDeposit: 2000,
    otherFees: 600,
    location: {
      county: 'Kiambu',
      subCounty: 'Kiambaa',
      ward: 'Muchatha',
      estate: 'Joyland',
      address: 'Joyland, Ruaka near Quickmart',
      lat: -1.2050,
      lng: 36.7745,
      distanceMock: 11.2
    },
    vacancies: 3,
    occupied: 25,
    underRepair: 1,
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Parking', 'Balcony', 'Prepaid Electricity'],
    rating: 4.8,
    reviewCount: 0,
    timePosted: 'Added 6 hours ago',
    images: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Spacious 2-bedroom with separate dining area, ensuite master bedroom, large balcony, solar water heating, high-speed elevator, and direct access to Limuru Road & Western Bypass.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Approved',
    createdAt: '2026-08-24T01:00:00.000Z',
    viewsCount: 780,
    enquiriesCount: 19
  },
  {
    id: 'prop-nairobi-heights',
    name: 'Nairobi Heights Apartments',
    type: 'Bedsitter',
    monthlyRent: 12000,
    deposit: 12000,
    serviceCharge: 1200,
    agentFee: 0,
    waterDeposit: 1500,
    otherFees: 500,
    location: {
      county: 'Nairobi',
      subCounty: 'Westlands',
      ward: 'Parklands/Highridge',
      estate: 'Parklands',
      address: '3rd Parklands Avenue, near Aga Khan Hospital',
      lat: -1.2614,
      lng: 36.8153,
      distanceMock: 3.5
    },
    vacancies: 2,
    occupied: 18,
    underRepair: 0,
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Balcony', 'Prepaid Electricity', 'Parking'],
    rating: 4.9,
    reviewCount: 3,
    timePosted: 'Added 4 hours ago',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Executive bedsitter and studio apartments in Parklands Westlands. Featuring modern granite tops, instant shower, secure biometric access, elevator, and ample basement parking.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Approved',
    featured: true,
    createdAt: '2026-08-24T03:00:00.000Z',
    viewsCount: 620,
    enquiriesCount: 14
  },
  {
    id: 'prop-nakuru-milimani',
    name: 'Milimani Ridge Suites',
    type: 'Bedsitter',
    monthlyRent: 9500,
    deposit: 9500,
    serviceCharge: 800,
    agentFee: 0,
    waterDeposit: 1000,
    otherFees: 300,
    location: {
      county: 'Nakuru',
      subCounty: 'Nakuru Town East',
      ward: 'Biashara',
      estate: 'Milimani',
      address: 'Milimani Road, near State House Nakuru',
      lat: -0.2785,
      lng: 36.0720,
      distanceMock: 0.9
    },
    vacancies: 3,
    occupied: 14,
    underRepair: 1,
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Balcony', 'Prepaid Electricity', 'Parking'],
    rating: 4.7,
    reviewCount: 2,
    timePosted: 'Added 5 hours ago',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Serene bedsitter units located in upscale Milimani, Nakuru. Constant solar water heating, high-speed fibre ready, electric boundary fence, and manicured green compound.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Approved',
    featured: true,
    createdAt: '2026-08-24T02:30:00.000Z',
    viewsCount: 430,
    enquiriesCount: 9
  },
  {
    id: 'prop-nakuru-lakeview',
    name: 'Lakeview Heights Nakuru',
    type: '1 Bedroom',
    monthlyRent: 14000,
    deposit: 14000,
    serviceCharge: 1000,
    agentFee: 0,
    waterDeposit: 1500,
    otherFees: 400,
    location: {
      county: 'Nakuru',
      subCounty: 'Nakuru Town West',
      ward: 'Freehold',
      estate: 'Section 58',
      address: 'Section 58, off Nairobi-Nakuru Highway',
      lat: -0.2890,
      lng: 36.0850,
      distanceMock: 1.5
    },
    vacancies: 2,
    occupied: 20,
    underRepair: 0,
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Balcony', 'Parking', 'Prepaid Electricity'],
    rating: 4.6,
    reviewCount: 1,
    timePosted: 'Added 1 day ago',
    images: [
      'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Charming 1-bedroom apartment in Section 58 Nakuru with scenic views of Lake Nakuru National Park. Features wide balconies, 24/7 security guard, and dedicated parking bay.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Approved',
    createdAt: '2026-08-23T08:00:00.000Z',
    viewsCount: 380,
    enquiriesCount: 8
  },
  {
    id: 'prop-fully-occupied-demo',
    name: 'Kasarani Oasis Court',
    type: '1 Bedroom',
    monthlyRent: 12000,
    deposit: 12000,
    serviceCharge: 1000,
    agentFee: 0,
    waterDeposit: 1500,
    otherFees: 500,
    location: {
      county: 'Nairobi',
      subCounty: 'Kasarani',
      ward: 'Claycity',
      estate: 'Clay Works',
      lat: -1.2185,
      lng: 36.8988,
      distanceMock: 1.5
    },
    vacancies: 0, // Fully occupied demonstration
    occupied: 24,
    underRepair: 1,
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Balcony'],
    rating: 4.4,
    reviewCount: 0,
    timePosted: '1 week ago',
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'],
    description: 'Fully occupied rental property in Kasarani Clay Works with zero vacancies currently.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Approved',
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'prop-pending-demo-01',
    name: 'Ridgeview Heights Kasarani',
    type: 'Bedsitter',
    monthlyRent: 8500,
    deposit: 8500,
    serviceCharge: 800,
    agentFee: 0,
    waterDeposit: 1200,
    otherFees: 300,
    location: {
      county: 'Nairobi',
      subCounty: 'Kasarani',
      ward: 'Claycity',
      estate: 'Hunters',
      address: 'Hunters Phase 2, near Chief Camp',
      lat: -1.2201,
      lng: 36.9052,
      distanceMock: 1.8
    },
    vacancies: 5,
    occupied: 15,
    underRepair: 0,
    amenities: ['Reliable Water', 'Fibre Internet', 'Security', 'Balcony', 'Prepaid Electricity'],
    rating: 0,
    reviewCount: 0,
    timePosted: 'Submitted 15 mins ago',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Newly constructed studio and bedsitter complex in Hunters Kasarani. Modern ceramic tiling, high water pressure system, electric fence, and dedicated caretaker.',
    lister: {
      id: 'demo-lister-001',
      name: 'Mary Wanjiku (Verified Landlord)',
      type: 'Landlord / Property Owner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: '+254 712 345 678',
      email: 'lister@makaohub.test',
      verified: true
    },
    status: 'Pending', // Pending admin approval
    createdAt: '2026-08-24T06:50:00.000Z'
  }
];

export const INITIAL_REVIEWS: PropertyReview[] = [
  {
    id: 'rev-01',
    propertyId: 'prop-greenview-01',
    authorId: 'demo-seeker-001',
    authorName: 'Kevin Otieno',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '12 August 2026',
    comment: 'Lived here for 8 months now. Water has never failed even once because of their borehole. The caretaker is very prompt whenever you need a quick repair. Internet speeds via Safaricom fibre are solid.',
    wouldRecommend: true,
    reply: {
      id: 'reply-kevin-01',
      reviewId: 'rev-01',
      propertyId: 'prop-greenview-01',
      listerId: 'demo-lister-001',
      listerName: 'Mary Wanjiku',
      listerSubtype: 'Landlord / Property Owner',
      listerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      replyText: 'Thank you Kevin! We are delighted that you are enjoying your stay at Greenview Apartments and appreciate your kind feedback regarding the borehole and caretaker services.',
      createdAt: '13 August 2026'
    }
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'demo-seeker-001',
    name: 'Kevin Otieno',
    email: 'seeker@makaohub.test',
    phone: '+254 711 223 344',
    role: 'seeker',
    joinedAt: '32 minutes ago',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    savedPropertyIds: ['prop-greenview-01']
  },
  {
    id: 'demo-lister-001',
    name: 'Mary Wanjiku',
    email: 'lister@makaohub.test',
    phone: '+254 712 345 678',
    role: 'lister',
    listerSubtype: 'Landlord / Property Owner',
    joinedAt: '10 minutes ago',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    savedPropertyIds: []
  },
  {
    id: 'demo-admin-001',
    name: 'MakaoHub Admin',
    email: 'admin@makaohub.test',
    phone: '+254 700 000 001',
    role: 'admin',
    joinedAt: '1 month ago',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    savedPropertyIds: []
  }
];

export const INITIAL_REPORTS: PlatformReport[] = [
  {
    id: 'rep-01',
    type: 'property',
    targetId: 'prop-pending-demo-01',
    targetTitle: 'Ridgeview Heights Kasarani',
    targetSubtitle: 'Hunters, Kasarani',
    reason: 'New building submitted for registration verification',
    reporterCount: 1,
    status: 'open',
    createdAt: '20 mins ago'
  },
  {
    id: 'rep-02',
    type: 'review',
    targetId: 'rev-01',
    targetTitle: 'Feedback audit on Greenview Apartments',
    targetSubtitle: 'Verified tenant review by Kevin Otieno',
    reason: 'Periodic quality review audit',
    reporterCount: 1,
    status: 'investigated',
    createdAt: '1 day ago'
  }
];

export const INITIAL_NOTIFICATIONS: UserNotification[] = [
  {
    id: 'notif-seeker-01',
    recipientUserId: 'demo-seeker-001',
    userId: 'demo-seeker-001',
    title: 'Lister Replied to Your Review',
    message: 'Mary Wanjiku replied to your review of Greenview Apartments.',
    time: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    read: false,
    type: 'review',
    targetPropertyId: 'prop-greenview-01',
    targetReviewId: 'rev-01'
  },
  {
    id: 'notif-seeker-enquiry-01',
    recipientUserId: 'demo-seeker-001',
    userId: 'demo-seeker-001',
    title: 'Lister Replied to Your Enquiry',
    message: 'Mary Wanjiku replied to your enquiry about Greenview Apartments.',
    time: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    read: false,
    type: 'enquiry',
    targetPropertyId: 'prop-greenview-01',
    targetEnquiryId: 'enq-01',
    targetMessageId: 'msg-enq-01-2'
  },
  {
    id: 'notif-01',
    recipientUserId: 'demo-lister-001',
    userId: 'demo-lister-001',
    title: 'Listing Approved',
    message: 'Your listing "Greenview Apartments" has been approved and is now live on MakaoHub.',
    time: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    read: false,
    type: 'approval',
    targetPropertyId: 'prop-greenview-01'
  },
  {
    id: 'notif-02',
    recipientUserId: 'demo-lister-001',
    userId: 'demo-lister-001',
    title: 'New Enquiry Received',
    message: 'Kevin Otieno sent an enquiry for Greenview Apartments.',
    time: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: false,
    type: 'enquiry',
    targetPropertyId: 'prop-greenview-01',
    targetEnquiryId: 'enq-01'
  },
  {
    id: 'notif-rating-01',
    recipientUserId: 'demo-lister-001',
    userId: 'demo-lister-001',
    title: 'New Property Rating',
    message: 'Kevin Otieno rated Greenview Apartments 5 stars.',
    time: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    read: false,
    type: 'review',
    targetPropertyId: 'prop-greenview-01',
    targetReviewId: 'rev-01'
  },
  {
    id: 'notif-comment-01',
    recipientUserId: 'demo-lister-001',
    userId: 'demo-lister-001',
    title: 'New Property Comment',
    message: 'Kevin Otieno commented on Greenview Apartments:\n"Lived here for 8 months now. Water has never failed even once because of their borehole. Caretaker is..."',
    time: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    read: false,
    type: 'review',
    targetPropertyId: 'prop-greenview-01',
    targetReviewId: 'rev-01'
  }
];

export const INITIAL_ENQUIRIES: ListerEnquiry[] = [
  {
    id: 'enq-01',
    propertyId: 'prop-greenview-01',
    propertyName: 'Greenview Apartments',
    seekerId: 'demo-seeker-001',
    seekerName: 'Kevin Otieno',
    seekerPhone: '+254 711 223 344',
    seekerEmail: 'seeker@makaohub.test',
    seekerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    listerId: 'demo-lister-001',
    message: 'Hello Mary, I am looking to move in this coming weekend. Are the 3 bedsitter units still available for viewing tomorrow around 2 PM?',
    date: 'Today, 9:15 AM',
    createdAt: 'Today, 9:15 AM',
    status: 'Replied',
    readByLister: false,
    readBySeeker: true,
    messages: [
      {
        id: 'msg-enq-01-1',
        enquiryId: 'enq-01',
        senderId: 'demo-seeker-001',
        senderName: 'Kevin Otieno',
        senderRole: 'seeker',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        message: 'Hello Mary, I am looking to move in this coming weekend. Are the 3 bedsitter units still available for viewing tomorrow around 2 PM?',
        createdAt: 'Today, 9:15 AM'
      },
      {
        id: 'msg-enq-01-2',
        enquiryId: 'enq-01',
        senderId: 'demo-lister-001',
        senderName: 'Mary Wanjiku',
        senderRole: 'lister',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        message: 'Hello Kevin! Yes, we have 2 vacant 2nd-floor bedsitters ready for physical walkthrough tomorrow at 2:00 PM. Our caretaker Daniel will meet you at the main gate.',
        createdAt: 'Today, 10:30 AM'
      }
    ],
    replies: [
      {
        id: 'msg-enq-01-1',
        enquiryId: 'enq-01',
        senderId: 'demo-seeker-001',
        senderName: 'Kevin Otieno',
        senderRole: 'seeker',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        message: 'Hello Mary, I am looking to move in this coming weekend. Are the 3 bedsitter units still available for viewing tomorrow around 2 PM?',
        createdAt: 'Today, 9:15 AM'
      },
      {
        id: 'msg-enq-01-2',
        enquiryId: 'enq-01',
        senderId: 'demo-lister-001',
        senderName: 'Mary Wanjiku',
        senderRole: 'lister',
        senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        message: 'Hello Kevin! Yes, we have 2 vacant 2nd-floor bedsitters ready for physical walkthrough tomorrow at 2:00 PM. Our caretaker Daniel will meet you at the main gate.',
        createdAt: 'Today, 10:30 AM'
      }
    ]
  }
];

export const INITIAL_ADMIN_ACTIVITY: AdminActivityItem[] = [
  {
    id: 'act-101',
    action: 'approved',
    title: 'Listing Approved',
    details: 'Approved "Greenview Apartments" submitted by Mary Wanjiku',
    targetId: 'prop-greenview-01',
    timestamp: 'Today, 11:20 AM'
  },
  {
    id: 'act-102',
    action: 'investigated',
    title: 'Report Investigated',
    details: 'Investigated report #rep-01 regarding unregistered viewing fee claim',
    targetId: 'rep-01',
    timestamp: 'Yesterday, 4:45 PM'
  },
  {
    id: 'act-103',
    action: 'approved',
    title: 'Listing Approved',
    details: 'Approved "TRM Drive Residency" submitted by David Ndung\'u',
    targetId: 'prop-trm-02',
    timestamp: '2 days ago'
  },
  {
    id: 'act-104',
    action: 'rejected',
    title: 'Listing Rejected',
    details: 'Rejected submission with incomplete proof of ownership and blurred photos',
    targetId: 'prop-rej-demo',
    timestamp: '3 days ago'
  }
];

