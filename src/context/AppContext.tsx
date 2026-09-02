import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { useConvexAuth } from 'convex/react';
import {

  UserRole,
  ListerSubtype,
  PropertyListing,
  PropertyReview,
  ListerReviewReply,
  UserAccount,
  PlatformReport,
  UserNotification,
  MapNavigationTarget,
  FilterCriteria,
  ListerEnquiry,
  EnquiryMessage,
  ThemeMode,
  ResolvedTheme,
  AdminTab,
  AdminActivityItem
} from '../types';
import {
  INITIAL_PROPERTIES,
  INITIAL_REVIEWS,
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ENQUIRIES,
  INITIAL_ADMIN_ACTIVITY
} from '../data/mockData';
import { registerSubmittedMedia, cleanupDeletedPropertyMedia } from '../utils/mediaRegistry';
import { convexClient, isConvexConfigured } from '../lib/convex';
import { api } from '../../convex/_generated/api';

export type AppView =
  | 'welcome'
  | 'login'
  | 'signup'
  | 'role-selection'
  | 'lister-subtype'
  | 'tenant-home'
  | 'search-results'
  | 'map-explore'
  | 'property-detail'
  | 'saved'
  | 'notifications'
  | 'profile'
  | 'lister-dashboard'
  | 'my-listings'
  | 'add-property'
  | 'lister-enquiries'
  | 'seeker-enquiries'
  | 'my-enquiries'
  | 'lister-reviews'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-properties'
  | 'admin-pending'
  | 'admin-reports'
  | 'admin-reviews'
  | 'admin-locations'
  | 'admin-settings'
  | 'admin-activity';

interface AppContextType {
  // Navigation & User
  currentView: AppView;
  previousView: AppView | null;
  setCurrentView: (view: AppView) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  targetReviewId: string | null;
  setTargetReviewId: (id: string | null) => void;
  targetEnquiryId: string | null;
  setTargetEnquiryId: (id: string | null) => void;
  targetMessageId: string | null;
  setTargetMessageId: (id: string | null) => void;

  // Role & Mode switching
  isSeekerMode: boolean;
  isListerMode: boolean;
  isAdmin: boolean;
  switchUserMode: (targetMode: 'seeker' | 'lister' | 'admin') => void;

  // Auth simulation
  signupNewUser: (name: string, email: string, phone: string) => void;
  assignRole: (role: UserRole) => void;
  assignListerSubtype: (subtype: ListerSubtype) => void;
  loginUser: (role: UserRole) => void;
  logoutUser: () => void;

  // Property management
  properties: PropertyListing[];
  availableProperties: PropertyListing[]; // Vacancies > 0 & Status === 'Approved'
  filteredProperties: PropertyListing[]; // Matching current search & filter criteria
  savedProperties: PropertyListing[];
  toggleSaveProperty: (id: string) => void;
  isPropertySaved: (id: string) => boolean;

  // Lister operations
  listerListings: PropertyListing[];
  listerTotalVacancies: number;
  listerEnquiries: ListerEnquiry[];
  seekerEnquiries: ListerEnquiry[];
  listerListingsFilter: 'all' | 'active' | 'vacancies';
  setListerListingsFilter: (filter: 'all' | 'active' | 'vacancies') => void;
  editingPropertyId: string | null;
  setEditingPropertyId: (id: string | null) => void;
  addProperty: (propertyData: Omit<PropertyListing, 'id' | 'createdAt' | 'status' | 'rating' | 'reviewCount' | 'timePosted'>) => Promise<string> | string;
  addPropertyListing: (propertyData: Omit<PropertyListing, 'id' | 'createdAt' | 'status' | 'rating' | 'reviewCount' | 'timePosted'>) => Promise<string> | string;
  updatePropertyListing: (propertyId: string, propertyData: Partial<PropertyListing>) => void;
  deletePropertyListing: (propertyId: string) => void;
  deleteAllMyListings: () => void;
  updatePropertyVacancies: (propertyId: string, vacant: number, occupied: number, underRepair: number) => Promise<void> | void;

  // Users
  users: UserAccount[];

  // Admin operations
  adminActiveTab: AdminTab;
  setAdminActiveTab: (tab: AdminTab) => void;
  adminActivity: AdminActivityItem[];
  logAdminActivity: (item: Omit<AdminActivityItem, 'id' | 'timestamp'>) => void;
  pendingProperties: PropertyListing[];
  approveProperty: (propertyId: string) => void;
  rejectProperty: (propertyId: string, reason?: string) => void;
  flagProperty: (propertyId: string) => void;
  archiveProperty: (propertyId: string) => void;
  suspendProperty: (propertyId: string, reason?: string) => void;
  reinstateProperty: (propertyId: string) => void;
  suspendUserAccount: (userId: string) => void;
  reinstateUserAccount: (userId: string) => void;

  // Reports & moderation
  reports: PlatformReport[];
  dismissReport: (reportId: string) => void;
  hideListingReport: (reportId: string, propertyId: string) => void;
  suspendUserReport: (reportId: string, userId: string) => void;

  // Reviews
  reviews: PropertyReview[];
  listerReviews: PropertyReview[];
  getPropertyReviews: (propertyId: string) => PropertyReview[];
  addReview: (propertyId: string, reviewData: Omit<PropertyReview, 'id' | 'propertyId' | 'date'>) => void;
  addReviewReply: (reviewId: string, replyText: string) => void;
  editReviewReply: (reviewId: string, replyText: string) => void;
  deleteReviewReply: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  reportReview: (reviewId: string, reason?: string) => void;

  // Enquiries
  enquiries: ListerEnquiry[];
  sendEnquiry: (propertyId: string, seekerName: string, seekerPhone: string, seekerEmail: string, message: string) => void;
  sendEnquiryReply: (enquiryId: string, replyText: string) => void;
  markEnquiryAsRead: (enquiryId: string) => void;

  // Notifications
  notifications: UserNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Search & Filter state
  filters: FilterCriteria;
  setFilters: React.Dispatch<React.SetStateAction<FilterCriteria>>;
  resetFilters: () => void;
  isFilterActive: boolean;
  filterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;
  seekerLocation: { lat: number; lng: number } | null;
  setSeekerLocation: (loc: { lat: number; lng: number } | null) => void;
  mapTarget: MapNavigationTarget | null;
  setMapTarget: React.Dispatch<React.SetStateAction<MapNavigationTarget | null>>;
  triggerMapNavigation: (
    lat: number,
    lng: number,
    zoom: number,
    reason?: MapNavigationTarget['reason'],
    locationName?: string,
    propertyId?: string
  ) => void;

  // Quick Demo Jumpers
  runSeekerDemo: () => void;
  runListerDemo: () => void;
  runAdminDemo: () => void;

  // Theme & Splash Screen
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  showSplashScreen: boolean;
  setShowSplashScreen: (show: boolean) => void;
}

const DEFAULT_FILTERS: FilterCriteria = {
  searchQuery: '',
  county: '',
  subCounty: '',
  ward: '',
  estate: '',
  propertyType: '',
  minRent: '',
  maxRent: '',
  amenities: []
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  // Start on Welcome screen as mandated
  const [currentView, setCurrentViewState] = useState<AppView>('welcome');
  const [previousView, setPreviousView] = useState<AppView | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [targetReviewId, setTargetReviewId] = useState<string | null>(null);
  const [targetEnquiryId, setTargetEnquiryId] = useState<string | null>(null);
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [listerListingsFilter, setListerListingsFilter] = useState<'all' | 'active' | 'vacancies'>('all');
  const [adminActiveTab, setAdminActiveTab] = useState<AdminTab>('overview');
  const [adminActivity, setAdminActivity] = useState<AdminActivityItem[]>(() => {
    const local = localStorage.getItem('makaohub_admin_activity');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return INITIAL_ADMIN_ACTIVITY;
      }
    }
    return INITIAL_ADMIN_ACTIVITY;
  });
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser || currentUser) return;

    const clerkAccount: UserAccount = {
      id: clerkUser.id,
      name:
        clerkUser.fullName ||
        clerkUser.firstName ||
        'MakaoHub User',
      email:
        clerkUser.primaryEmailAddress?.emailAddress || '',
      phone:
        clerkUser.primaryPhoneNumber?.phoneNumber || '',
      role: 'seeker',
      joinedAt: 'Just now',
      avatar: clerkUser.imageUrl || '',
      savedPropertyIds: [],
    };

    setCurrentUser(clerkAccount);

    setUsers((prev) => {
      const alreadyExists = prev.some((user) => user.id === clerkAccount.id);

      if (alreadyExists) return prev;

      return [...prev, clerkAccount];
    });
  }, [isLoaded, isSignedIn, clerkUser, currentUser]);
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser || !currentUser) return;

    const googleAccount = clerkUser.externalAccounts?.find(
      (account) => account.provider === 'google'
    );

    const clerkAvatar =
      googleAccount?.imageUrl ||
      (clerkUser.hasImage ? clerkUser.imageUrl : '');

    if (!clerkAvatar || currentUser.avatar === clerkAvatar) return;

    const updatedUser: UserAccount = {
      ...currentUser,
      avatar: clerkAvatar,
    };

    setCurrentUser(updatedUser);

    setUsers((prev) =>
      prev.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  }, [isLoaded, isSignedIn, clerkUser, currentUser]);
  useEffect(() => {
    if (
      !isLoaded ||
      !isSignedIn ||
      !isConvexAuthenticated ||
      !clerkUser ||
      !currentUser ||
      !isConvexConfigured ||
      !convexClient
    ) {
      return;
    }

    const syncUserToConvex = async () => {
      try {
        const googleAccount = clerkUser.externalAccounts?.find(
          (account) => account.provider === 'google'
        );

        const clerkName =
          clerkUser.fullName ||
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
          currentUser.name;

        const clerkEmail =
          clerkUser.primaryEmailAddress?.emailAddress ||
          currentUser.email;

        const clerkPhone =
          clerkUser.primaryPhoneNumber?.phoneNumber ||
          currentUser.phone;

        const clerkAvatar =
          googleAccount?.imageUrl ||
          (clerkUser.hasImage ? clerkUser.imageUrl : currentUser.avatar);

        const correctedUser: UserAccount = {
          ...currentUser,
          name: clerkName,
          email: clerkEmail,
          phone: clerkPhone,
          avatar: clerkAvatar,
        };

        if (
          currentUser.name !== correctedUser.name ||
          currentUser.email !== correctedUser.email ||
          currentUser.phone !== correctedUser.phone ||
          currentUser.avatar !== correctedUser.avatar
        ) {
          setCurrentUser(correctedUser);

          setUsers((prev) =>
            prev.map((user) =>
              user.id === correctedUser.id ? correctedUser : user
            )
          );
        }

        await convexClient.mutation(api.users.upsertUser, {
          userId: clerkUser.id,
          name: clerkName,
          email: clerkEmail,
          phone: clerkPhone,
          role: currentUser.role,
          listerSubtype: currentUser.listerSubtype,
          joinedAt: currentUser.joinedAt,
          avatar: clerkAvatar,
          savedPropertyIds: currentUser.savedPropertyIds,
        });
      } catch (error) {
        console.error('Failed to sync Clerk user to Convex:', error);
      }
    };

    void syncUserToConvex();
  }, [
    isLoaded,
    isSignedIn,
    isConvexAuthenticated,
    clerkUser,
    currentUser,
  ]);
  useEffect(() => {
    if (
      !isLoaded ||
      !isSignedIn ||
      !isConvexAuthenticated ||
      !clerkUser ||
      !isConvexConfigured ||
      !convexClient
    ) {
      return;
    }

    let cancelled = false;

    const restoreUserFromConvex = async () => {
      try {
        const savedUser = await convexClient.query(api.users.getByUserId, {
          userId: clerkUser.id,
        });

        if (cancelled) return;

        if (!savedUser || savedUser.role === 'unassigned') {
          setCurrentViewState('role-selection');
          return;
        }

        const savedRole = savedUser.role;

        if (
          savedRole !== 'seeker' &&
          savedRole !== 'lister' &&
          savedRole !== 'admin'
        ) {
          setCurrentViewState('role-selection');
          return;
        }

        const restoredUser: UserAccount = {
          id: savedUser.userId,
          name: clerkUser.fullName || savedUser.name || 'MakaoHub User',
          email:
            clerkUser.primaryEmailAddress?.emailAddress ||
            savedUser.email ||
            '',
          phone:
            clerkUser.primaryPhoneNumber?.phoneNumber ||
            savedUser.phone ||
            '',
          role: savedRole,
          listerSubtype:
            savedUser.listerSubtype as ListerSubtype | undefined,
          joinedAt: savedUser.joinedAt || 'Just now',
          avatar: savedUser.avatar || clerkUser.imageUrl || '',
          savedPropertyIds: savedUser.savedPropertyIds || [],
        };

        setCurrentUser(restoredUser);

        setUsers((prev) => {
          const exists = prev.some((u) => u.id === restoredUser.id);

          if (exists) {
            return prev.map((u) =>
              u.id === restoredUser.id ? restoredUser : u
            );
          }

          return [...prev, restoredUser];
        });

        if (savedRole === 'seeker') {
          setCurrentViewState('tenant-home');
        } else if (savedRole === 'lister') {
          setCurrentViewState(
            savedUser.listerSubtype
              ? 'lister-dashboard'
              : 'lister-subtype'
          );
        } else if (savedRole === 'admin') {
          setCurrentViewState('admin-dashboard');
        }
      } catch (error) {
        console.error('Failed to restore MakaoHub user:', error);
      }
    };

    void restoreUserFromConvex();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    isSignedIn,
    isConvexAuthenticated,
    clerkUser?.id,
  ]);
  useEffect(() => {

    localStorage.setItem('makaohub_admin_activity', JSON.stringify(adminActivity));
  }, [adminActivity]);

  const logAdminActivity = (item: Omit<AdminActivityItem, 'id' | 'timestamp'>) => {
    const newItem: AdminActivityItem = {
      ...item,
      id: `act-${Date.now()}`,
      timestamp: 'Just now'
    };
    setAdminActivity((prev) => [newItem, ...prev]);
  };

  // Theme & Dark Mode State
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('makaohub_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Calculate resolved light or dark theme
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemPrefersDark ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemPrefersDark]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Update HTML element class when resolvedTheme changes
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [resolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('makaohub_theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Splash screen state (strictly shown on initial app launch / genuine page reload)
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true);

  const setCurrentView = (newView: AppView) => {
    setCurrentViewState((prev) => {
      if (prev !== newView) {
        setPreviousView(prev);
      }
      return newView;
    });
  };

  // Main Data States
  const [properties, setProperties] = useState<PropertyListing[]>(() => {
    const FAKE_PROPERTY_IDS = new Set([
      'prop-seasons-peak',
      'prop-roysambu-lumumba',
      'prop-kilimani-dennis',
      'prop-kileleshwa-oloitokitok',
      'prop-syokimau-haven',
      'prop-njoro-egerton'
    ]);
    const FAKE_LISTER_IDS = new Set([
      'demo-lister-john',
      'demo-lister-samuel',
      'demo-lister-prime'
    ]);

    const local = localStorage.getItem('makaohub_properties');
    if (local) {
      try {
        const parsed: PropertyListing[] = JSON.parse(local);
        const filtered = parsed
          .filter((p) => !FAKE_PROPERTY_IDS.has(p.id) && !FAKE_LISTER_IDS.has(p.lister?.id || ''))
          .map((p) => {
            if (
              p.lister?.id === 'user-mary-wanjiku' ||
              p.lister?.id === 'demo-lister-mary' ||
              p.lister?.email === 'mary.wanjiku@makaohub.ke'
            ) {
              return {
                ...p,
                lister: {
                  ...p.lister,
                  id: 'demo-lister-001',
                  email: 'lister@makaohub.test'
                }
              };
            }
            return p;
          });

        if (filtered.length > 0) {
          return filtered;
        }
        return INITIAL_PROPERTIES;
      } catch {
        return INITIAL_PROPERTIES;
      }
    }
    return INITIAL_PROPERTIES;
  });

  const [reviews, setReviews] = useState<PropertyReview[]>(() => {
    const local = localStorage.getItem('makaohub_reviews');
    if (local) {
      try {
        const parsed: PropertyReview[] = JSON.parse(local);
        const validPropIds = new Set(INITIAL_PROPERTIES.map(p => p.id));
        const filtered = parsed.filter(r => validPropIds.has(r.propertyId) || r.authorId === 'demo-seeker-001');
        return filtered.length > 0 ? filtered : INITIAL_REVIEWS;
      } catch {
        return INITIAL_REVIEWS;
      }
    }
    return INITIAL_REVIEWS;
  });

  const [reports, setReports] = useState<PlatformReport[]>(() => {
    const local = localStorage.getItem('makaohub_reports');
    if (local) {
      try {
        const parsed: PlatformReport[] = JSON.parse(local);
        const FAKE_REPORT_TARGETS = new Set(['prop-seasons-peak', 'rev-spam-01', 'user-flagged-09']);
        const filtered = parsed.filter(r => !FAKE_REPORT_TARGETS.has(r.targetId));
        return filtered.length > 0 ? filtered : INITIAL_REPORTS;
      } catch {
        return INITIAL_REPORTS;
      }
    }
    return INITIAL_REPORTS;
  });

  const [notifications, setNotifications] = useState<UserNotification[]>(() => {
    const local = localStorage.getItem('makaohub_notifications');
    if (local) {
      try {
        const parsed: UserNotification[] = JSON.parse(local);
        return parsed.map((n) => {
          let rec = n.recipientUserId || n.userId || 'demo-lister-001';
          if (rec === 'user-mary-wanjiku' || rec === 'demo-lister-mary') {
            rec = 'demo-lister-001';
          }
          return {
            ...n,
            recipientUserId: rec,
            userId: rec
          };
        });
      } catch (e) {
        console.error('Failed to parse notifications from localStorage', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [enquiries, setEnquiries] = useState<ListerEnquiry[]>(() => {
    const local = localStorage.getItem('makaohub_enquiries');
    if (local) {
      try {
        const parsed: ListerEnquiry[] = JSON.parse(local);
        const filtered = parsed.filter(e => e.seekerId === 'demo-seeker-001' || e.listerId === 'demo-lister-001');
        return filtered.length > 0 ? filtered : INITIAL_ENQUIRIES;
      } catch {
        return INITIAL_ENQUIRIES;
      }
    }
    return INITIAL_ENQUIRIES;
  });

  // Users Directory - Ensure stable demo accounts are always maintained without duplication or fake seed accounts
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const FAKE_SEED_USER_IDS = new Set([
      'demo-lister-john',
      'demo-lister-samuel',
      'demo-lister-prime',
      'user-seeker-grace',
      'user-seeker-brian',
      'user-seeker-faith',
      'user-seeker-david',
      'krvon',
      'user-flagged-09',
      'user-mary-wanjiku',
      'user-seeker-kevin',
      'user-admin-main'
    ]);

    const local = localStorage.getItem('makaohub_users');
    if (local) {
      try {
        const parsed: UserAccount[] = JSON.parse(local);
        const filtered = parsed.filter((u) => !FAKE_SEED_USER_IDS.has(u.id));
        const merged = [...filtered];

        INITIAL_USERS.forEach((demoUser) => {
          const idx = merged.findIndex((u) => u.id === demoUser.id || u.email === demoUser.email);
          if (idx === -1) {
            merged.push(demoUser);
          } else {
            merged[idx] = { ...demoUser, ...merged[idx], id: demoUser.id, role: demoUser.role };
          }
        });
        return merged;
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [filters, setFilters] = useState<FilterCriteria>(DEFAULT_FILTERS);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [seekerLocation, setSeekerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapTarget, setMapTarget] = useState<MapNavigationTarget | null>(null);

  const triggerMapNavigation = (
    lat: number,
    lng: number,
    zoom: number,
    reason: MapNavigationTarget['reason'] = 'search',
    locationName?: string,
    propertyId?: string
  ) => {
    setMapTarget({
      id: `map-nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      lat,
      lng,
      zoom,
      reason,
      locationName,
      propertyId
    });
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('makaohub_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('makaohub_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('makaohub_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('makaohub_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('makaohub_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    localStorage.setItem('makaohub_users', JSON.stringify(users));
  }, [users]);

  // Real-time synchronization of properties from Convex backend
  useEffect(() => {
    if (!isConvexConfigured || !convexClient) return;

    const processDocs = (convexDocs: any) => {
      if (Array.isArray(convexDocs) && convexDocs.length > 0) {
        setProperties((prev) => {
          const convexListings: PropertyListing[] = convexDocs.map((doc: any) => ({
            id: doc._id || doc.id,
            name: doc.name,
            type: doc.type,
            monthlyRent: doc.monthlyRent,
            deposit: doc.deposit ?? 0,
            serviceCharge: doc.serviceCharge ?? 0,
            agentFee: doc.agentFee ?? 0,
            viewingFee: doc.viewingFee ?? 0,
            waterDeposit: doc.waterDeposit ?? 0,
            electricityDeposit: doc.electricityDeposit ?? 0,
            garbageFee: doc.garbageFee ?? 0,
            otherFees: doc.otherFees ?? 0,
            location: doc.location,
            vacancies: doc.vacancies ?? 0,
            occupied: doc.occupied ?? 0,
            underRepair: doc.underRepair ?? 0,
            amenities: doc.amenities || [],
            rating: doc.rating ?? 0,
            reviewCount: doc.reviewCount ?? 0,
            timePosted: doc.timePosted || 'Recently',
            images: doc.images || [],
            coverPhoto: doc.coverPhoto || (doc.images && doc.images[0]) || '',
            video: doc.video || undefined,
            videoName: doc.videoName,
            videoSize: doc.videoSize,
            imageStorageIds: doc.imageStorageIds,
            coverPhotoStorageId: doc.coverPhotoStorageId,
            videoStorageId: doc.videoStorageId,
            description: doc.description || '',
            lister: doc.lister,
            status: doc.status || 'Pending',
            rejectionReason: doc.rejectionReason,
            featured: doc.featured,
            createdAt: doc.createdAt || new Date().toISOString(),
            viewsCount: doc.viewsCount ?? 0,
            enquiriesCount: doc.enquiriesCount ?? 0
          }));

          const convexIds = new Set(convexListings.map((p) => p.id));
          const remaining = prev.filter((p) => !convexIds.has(p.id));
          return [...convexListings, ...remaining];
        });
      }
    };

    try {
      // 1. Initial query fetch
      convexClient
        .query(api.properties.listAll, {})
        .then((docs) => processDocs(docs))
        .catch((err) => console.warn('Convex initial properties fetch notice:', err));

      // 2. Watch query for live real-time updates
      const watch = (convexClient as any).watchQuery(api.properties.listAll, {});
      const unsubscribe = watch.onUpdate(() => {
        const result = watch.localQueryResult();
        if (result) {
          processDocs(result);
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (e) {
      console.warn('Could not initialize Convex subscription:', e);
    }
  }, []);

  // Convex real-time synchronization for User Notifications
  useEffect(() => {
    if (!isConvexConfigured || !convexClient || !currentUser?.id) return;

    const processConvexNotifs = (convexDocs: any) => {
      if (Array.isArray(convexDocs) && convexDocs.length > 0) {
        setNotifications((prev) => {
          const formatted: UserNotification[] = convexDocs.map((doc: any) => ({
            id: doc._id || doc.id,
            recipientUserId: doc.recipientUserId,
            userId: doc.userId || doc.recipientUserId,
            title: doc.title,
            message: doc.message,
            time: doc.time || new Date().toISOString(),
            createdAt: doc.time || new Date().toISOString(),
            read: Boolean(doc.read),
            type: doc.type,
            targetPropertyId: doc.targetPropertyId,
            targetReviewId: doc.targetReviewId,
            targetEnquiryId: doc.targetEnquiryId,
            targetMessageId: doc.targetMessageId
          }));

          const convexIds = new Set(formatted.map((n) => n.id));
          const remaining = prev.filter((n) => !convexIds.has(n.id));
          return [...formatted, ...remaining];
        });
      }
    };

    try {
      convexClient
        .query(api.notifications.listByRecipient, { recipientUserId: currentUser.id })
        .then((docs) => processConvexNotifs(docs))
        .catch((err) => console.warn('Convex notifications query notice:', err));

      const watch = (convexClient as any).watchQuery(api.notifications.listByRecipient, {
        recipientUserId: currentUser.id
      });
      const unsubscribe = watch.onUpdate(() => {
        const result = watch.localQueryResult();
        if (result) {
          processConvexNotifs(result);
        }
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (e) {
      console.warn('Convex notifications subscription notice:', e);
    }
  }, [currentUser?.id]);

  // Roles determination
  const isSeekerMode = currentUser?.role === 'seeker';
  const isListerMode = currentUser?.role === 'lister';
  const isAdmin = currentUser?.role === 'admin';

  // Rule #22: Vacancies > 0 & Status === 'Approved' appear in Seeker availability & live map!
  const availableProperties = properties.filter(
    (p) => p.status === 'Approved' && p.vacancies > 0
  );

  // Synchronized search & filtered properties (used identically across Discovery, Map, and Lists)
  const filteredProperties = useMemo(() => {
    return availableProperties.filter((p) => {
      // Must have vacancies > 0
      if (p.vacancies <= 0) return false;

      // Text search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase().trim();
        const words = q.split(/[\s,]+/).filter((w) => w.length > 1);
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.location.estate.toLowerCase().includes(q) ||
          p.location.subCounty.toLowerCase().includes(q) ||
          p.location.county.toLowerCase().includes(q) ||
          (p.location.ward && p.location.ward.toLowerCase().includes(q)) ||
          p.type.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (words.length > 0 &&
            words.some(
              (w) =>
                p.location.estate.toLowerCase().includes(w) ||
                p.location.subCounty.toLowerCase().includes(w) ||
                p.location.county.toLowerCase().includes(w) ||
                (p.location.ward && p.location.ward.toLowerCase().includes(w)) ||
                p.name.toLowerCase().includes(w)
            ));
        if (!matchesQuery) return false;
      }

      // Location hierarchy filters (County -> Sub-County -> Ward -> Estate)
      if (filters.county) {
        const pCounty = p.location.county.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fCounty = filters.county.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pCounty !== fCounty) return false;
      }
      if (filters.subCounty) {
        const pSub = p.location.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fSub = filters.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pSub !== fSub && !pSub.includes(fSub) && !fSub.includes(pSub)) return false;
      }
      if (filters.ward) {
        const pWard = (p.location.ward || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fWard = filters.ward.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!pWard || (pWard !== fWard && !pWard.includes(fWard) && !fWard.includes(pWard))) return false;
      }
      if (filters.estate) {
        const pEstate = (p.location.estate || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fEstate = filters.estate.toLowerCase().replace(/[^a-z0-9]/g, '');
        const pAddr = (p.location.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const pName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchesEstate =
          pEstate === fEstate ||
          pEstate.includes(fEstate) ||
          fEstate.includes(pEstate) ||
          pAddr.includes(fEstate) ||
          pName.includes(fEstate);
        if (!matchesEstate) return false;
      }

      // Property type
      if (filters.propertyType && p.type.toLowerCase() !== filters.propertyType.toLowerCase()) return false;

      // Rent boundaries
      if (filters.minRent !== '' && p.monthlyRent < Number(filters.minRent)) return false;
      if (filters.maxRent !== '' && p.monthlyRent > Number(filters.maxRent)) return false;

      // Amenities (must have all selected)
      if (filters.amenities.length > 0) {
        const hasAll = filters.amenities.every((a) => p.amenities.includes(a));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [availableProperties, filters]);

  // Lister calculations: Strictly properties created by / owned by the current signed-in lister
  const listerListings = properties.filter((p) => {
    if (currentUser?.role === 'lister' && currentUser.id) {
      return p.lister?.id === currentUser.id;
    }
    return false;
  });

  const listerTotalVacancies = listerListings.reduce((sum, p) => sum + (p.vacancies || 0), 0);

  const listerPropertyIds = listerListings.map((p) => p.id);

  const listerEnquiries = enquiries.filter((e) => {
    if (currentUser?.role === 'lister' && currentUser.id) {
      return e.listerId === currentUser.id || listerPropertyIds.includes(e.propertyId);
    }
    return false;
  });

  const seekerEnquiries = enquiries.filter((e) => {
    const currentSeekerId = currentUser?.id || 'demo-seeker-001';
    return (
      e.seekerId === currentSeekerId ||
      (currentUser?.email && e.seekerEmail === currentUser.email)
    );
  });

  const listerReviews = reviews.filter(
    (r) => listerPropertyIds.length > 0 && listerPropertyIds.includes(r.propertyId)
  );

  const pendingProperties = properties.filter((p) => p.status === 'Pending');

  const savedProperties = properties.filter((p) =>
    currentUser?.savedPropertyIds?.includes(p.id)
  );

  const isPropertySaved = (id: string) => {
    return !!currentUser?.savedPropertyIds?.includes(id);
  };

  const toggleSaveProperty = (id: string) => {
    if (!currentUser) {
      // Default to demo seeker Kevin Otieno when not logged in
      const seeker = users.find((u) => u.id === 'demo-seeker-001') || INITIAL_USERS[0];
      const currentSaved = seeker.savedPropertyIds || [];
      const updated = currentSaved.includes(id)
        ? currentSaved.filter((item) => item !== id)
        : [...currentSaved, id];
      const updatedSeeker = { ...seeker, savedPropertyIds: updated };
      setCurrentUser(updatedSeeker);
      setUsers((prev) => prev.map((u) => (u.id === seeker.id ? updatedSeeker : u)));
      return;
    }

    const currentSaved = currentUser.savedPropertyIds || [];
    const isSaved = currentSaved.includes(id);
    const updated = isSaved
      ? currentSaved.filter((item) => item !== id)
      : [...currentSaved, id];

    const updatedUser = {
      ...currentUser,
      savedPropertyIds: updated
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Auth helper flows
  const signupNewUser = (name: string, email: string, phone: string) => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name || 'New User',
      email: email || 'user@makaohub.test',
      phone: phone || '+254 700 000 000',
      role: 'seeker', // default until assigned
      joinedAt: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      savedPropertyIds: []
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setCurrentView('role-selection');
  };

  const assignRole = async (role: UserRole) => {
    if (!currentUser) return;

    const updated: UserAccount = {
      ...currentUser,
      role,
    };

    setCurrentUser(updated);

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === updated.id);

      if (exists) {
        return prev.map((u) => (u.id === updated.id ? updated : u));
      }

      return [...prev, updated];
    });

    try {
      if (isConvexConfigured && convexClient) {
        await convexClient.mutation(api.users.upsertUser, {
          userId: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          role: role,
          joinedAt: new Date().toISOString(),
          avatar: updated.avatar,
          savedPropertyIds: updated.savedPropertyIds,
        });
      }
    } catch (error) {
      console.error('Failed to save MakaoHub user to Convex:', error);
    }

    if (role === 'seeker') {
      setCurrentView('tenant-home');
    } else if (role === 'lister') {
      setCurrentView('lister-subtype');
    } else if (role === 'admin') {
      setCurrentView('admin-dashboard');
    }
  };
  const assignListerSubtype = async (subtype: ListerSubtype) => {
    if (!currentUser) return;

    const updated: UserAccount = {
      ...currentUser,
      role: 'lister',
      listerSubtype: subtype,
    };

    setCurrentUser(updated);

    setUsers((prev) => {
      const exists = prev.some((u) => u.id === updated.id);

      if (exists) {
        return prev.map((u) => (u.id === updated.id ? updated : u));
      }

      return [...prev, updated];
    });

    try {
      if (isConvexConfigured && convexClient) {
        await convexClient.mutation(api.users.upsertUser, {
          userId: updated.id,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          role: 'lister',
          listerSubtype: subtype,
          joinedAt: updated.joinedAt,
          avatar: updated.avatar,
          savedPropertyIds: updated.savedPropertyIds,
        });
      }
    } catch (error) {
      console.error('Failed to save lister subtype to Convex:', error);
    }

    setCurrentView('lister-dashboard');
  };

  const loginUser = (roleOrEmailOrId: UserRole | string, targetView: AppView = 'role-selection') => {
    // Check by exact ID, email, or role
    const found =
      users.find(
        (u) =>
          u.id === roleOrEmailOrId ||
          u.email.toLowerCase() === roleOrEmailOrId.toLowerCase() ||
          u.role === roleOrEmailOrId
      ) ||
      INITIAL_USERS.find(
        (u) =>
          u.id === roleOrEmailOrId ||
          u.email.toLowerCase() === roleOrEmailOrId.toLowerCase() ||
          u.role === roleOrEmailOrId
      );

    if (found) {
      setCurrentUser(found);
      if (found.role === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView(targetView);
      }
    } else {
      const emailStr = String(roleOrEmailOrId).trim();
      const namePart = emailStr.includes('@') ? emailStr.split('@')[0] : emailStr;
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: formattedName || 'Makao User',
        email: emailStr.includes('@') ? emailStr : `${emailStr}@makaohub.test`,
        phone: '+254 700 000 000',
        role: 'seeker',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        joinedAt: 'Just now',
        savedPropertyIds: []
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setCurrentView(targetView);
    }
  };

  const logoutUser = async () => {
    await signOut();

    setCurrentUser(null);
    setCurrentView('welcome');
  };

  // Mode switching — keep the same signed-in user
  const switchUserMode = (
    targetMode: 'seeker' | 'lister' | 'admin'
  ) => {
    if (!currentUser) return;

    if (targetMode === 'seeker') {
      setCurrentView('tenant-home');
      return;
    }

    if (targetMode === 'lister') {
      if (currentUser.role === 'lister') {
        if (currentUser.listerSubtype) {
          setCurrentView('lister-dashboard');
        } else {
          setCurrentView('lister-subtype');
        }
      }
      return;
    }

    if (targetMode === 'admin' && currentUser.role === 'admin') {
      setCurrentView('admin-dashboard');
    }
  };
  // Lister: Add property (Rule #44 -> Pending Approval)
  const addProperty = async (
    propertyData: Omit<PropertyListing, 'id' | 'createdAt' | 'status' | 'rating' | 'reviewCount' | 'timePosted'>
  ): Promise<string> => {
    let convexId: string | null = null;
    const defaultLister = {
      id: currentUser?.id || 'demo-lister-001',
      name: currentUser?.name || 'Mary Wanjiku',
      type: (currentUser?.listerSubtype as ListerSubtype) || 'Landlord / Property Owner',
      avatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      phone: currentUser?.phone || '+254 712 345 678',
      email: currentUser?.email || 'lister@makaohub.test',
      verified: true
    };

    const imagesArray = Array.isArray(propertyData.images) ? [...propertyData.images] : [];
    const coverPhoto = propertyData.coverPhoto || imagesArray[0] || '';

    // Register submitted media to protect their object URLs from ever being revoked in this session
    registerSubmittedMedia([...imagesArray, coverPhoto, propertyData.video]);

    // If Convex is configured, insert property into Convex database
    if (isConvexConfigured && convexClient) {
      try {
        convexId = await convexClient.mutation(api.properties.add, {
          name: propertyData.name,
          type: propertyData.type,
          monthlyRent: propertyData.monthlyRent,
          deposit: propertyData.deposit ?? 0,
          serviceCharge: propertyData.serviceCharge ?? 0,
          agentFee: propertyData.agentFee ?? 0,
          viewingFee: propertyData.viewingFee ?? 0,
          waterDeposit: propertyData.waterDeposit ?? 0,
          electricityDeposit: propertyData.electricityDeposit ?? 0,
          garbageFee: propertyData.garbageFee ?? 0,
          otherFees: propertyData.otherFees ?? 0,
          location: {
            county: propertyData.location.county,
            subCounty: propertyData.location.subCounty,
            ward: propertyData.location.ward,
            estate: propertyData.location.estate,
            address: propertyData.location.address || undefined,
            lat: propertyData.location.lat,
            lng: propertyData.location.lng,
            distanceMock: propertyData.location.distanceMock
          },
          vacancies: propertyData.vacancies ?? 0,
          occupied: propertyData.occupied ?? 0,
          underRepair: propertyData.underRepair ?? 0,
          amenities: propertyData.amenities || [],
          rating: 0,
          reviewCount: 0,
          timePosted: 'Just now',
          images: imagesArray,
          coverPhoto,
          video: propertyData.video,
          videoName: propertyData.videoName,
          videoSize: propertyData.videoSize,
          imageStorageIds: propertyData.imageStorageIds as any,
          coverPhotoStorageId: propertyData.coverPhotoStorageId as any,
          videoStorageId: propertyData.videoStorageId as any,
          description: propertyData.description,
          lister: propertyData.lister || defaultLister,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          viewsCount: 0,
          enquiriesCount: 0
        });
      } catch (err) {
        console.error('Error inserting property into Convex:', err);
        throw err;
      }
    }

    const assignedId = convexId || `prop-${Date.now()}`;

    const newListing: PropertyListing = {
      agentFee: 0,
      viewingFee: 0,
      otherFees: 0,
      lister: defaultLister,
      ...propertyData,
      images: imagesArray,
      coverPhoto,
      id: assignedId,
      status: 'Pending',
      rating: 0,
      reviewCount: 0,
      timePosted: 'Just now',
      createdAt: new Date().toISOString(),
      viewsCount: 0,
      enquiriesCount: 0
    };

    setProperties((prev) => {
      const exists = prev.some((p) => p.id === assignedId);
      if (exists) {
        return prev.map((p) => (p.id === assignedId ? newListing : p));
      }
      return [newListing, ...prev];
    });

    // Add Lister notification
    const recipientId = currentUser?.id || newListing.lister?.id || 'demo-lister-001';
    const nowIso = new Date().toISOString();
    const listerNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      recipientUserId: recipientId,
      userId: recipientId,
      title: 'Listing Submitted',
      message: `Your listing "${newListing.name}" has been submitted for review.`,
      time: nowIso,
      createdAt: nowIso,
      read: false,
      type: 'approval',
      targetPropertyId: assignedId
    };

    // Add Admin notification
    const adminNotif: UserNotification = {
      id: `notif-admin-${Date.now()}`,
      recipientUserId: 'demo-admin-001',
      userId: 'demo-admin-001',
      title: 'New Listing Submitted',
      message: `"${newListing.name}" was submitted by ${newListing.lister?.name || 'a lister'} and is pending verification.`,
      time: nowIso,
      createdAt: nowIso,
      read: false,
      type: 'approval',
      targetPropertyId: assignedId
    };

    setNotifications((prev) => [adminNotif, listerNotif, ...prev]);

    if (isConvexConfigured && convexClient) {
      convexClient
        .mutation(api.notifications.send, {
          recipientUserId: recipientId,
          userId: recipientId,
          title: 'Listing Submitted',
          message: `Your listing "${newListing.name}" has been submitted for review.`,
          time: nowIso,
          type: 'approval',
          targetPropertyId: assignedId
        })
        .catch((err) => console.warn('Convex notification send notice:', err));
    }

    return assignedId;
  };

  // Lister: Update Vacancies (Availability & Vacancy Backend Synchronization)
  const updatePropertyVacancies = async (
    propertyId: string,
    vacant: number,
    occupied: number,
    underRepair: number
  ) => {
    const validVacant = Math.max(0, Math.floor(Number(vacant) || 0));
    const validOccupied = Math.max(0, Math.floor(Number(occupied) || 0));
    const validUnderRepair = Math.max(0, Math.floor(Number(underRepair) || 0));

    // Capture previous state for rollback if Convex mutation fails
    const existing = properties.find((p) => p.id === propertyId);
    const prevVacancies = existing?.vacancies ?? 0;
    const prevOccupied = existing?.occupied ?? 0;
    const prevUnderRepair = existing?.underRepair ?? 0;

    // Optimistically update local React state (status remains completely unchanged, e.g. Approved)
    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? {
            ...p,
            vacancies: validVacant,
            occupied: validOccupied,
            underRepair: validUnderRepair
          }
          : p
      )
    );

    // Directly persist to existing Convex document if configured
    if (isConvexConfigured && convexClient) {
      try {
        const res = await convexClient.mutation(api.properties.updateVacancies, {
          id: propertyId,
          vacancies: validVacant,
          occupied: validOccupied,
          underRepair: validUnderRepair
        });

        if (res && (res as any).success === false) {
          console.warn('Convex updateVacancies notice:', (res as any).reason);
        }
      } catch (err) {
        console.error(`Failed to persist availability changes to Convex for property ${propertyId}:`, err);
        // Rollback optimistic state on error
        setProperties((prev) =>
          prev.map((p) =>
            p.id === propertyId
              ? {
                ...p,
                vacancies: prevVacancies,
                occupied: prevOccupied,
                underRepair: prevUnderRepair
              }
              : p
          )
        );
        throw err;
      }
    }
  };

  // Lister: Update Property Listing (Save edited listing)
  const updatePropertyListing = (
    propertyId: string,
    updatedData: Partial<PropertyListing>
  ) => {
    const imagesArray = Array.isArray(updatedData.images) ? [...updatedData.images] : [];
    const coverPhoto = updatedData.coverPhoto || imagesArray[0] || '';

    // Register updated media in session registry
    registerSubmittedMedia([...imagesArray, coverPhoto, updatedData.video]);

    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        return {
          ...p,
          ...updatedData,
          images: imagesArray.length > 0 ? imagesArray : p.images,
          coverPhoto: coverPhoto || p.coverPhoto,
          // If substantially edited, set status back to Pending for review (Req #11)
          status: 'Pending',
          timePosted: 'Updated just now'
        };
      })
    );

    // Notify lister of updated listing status
    const existing = properties.find((p) => p.id === propertyId);
    const recipientId = existing?.lister?.id || currentUser?.id || 'demo-lister-001';
    const nowIso = new Date().toISOString();
    const newNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      recipientUserId: recipientId,
      userId: recipientId,
      title: 'Listing Updated',
      message: `Changes to "${updatedData.name || existing?.name || 'your property'}" have been saved and submitted for review.`,
      time: nowIso,
      createdAt: nowIso,
      read: false,
      type: 'approval',
      targetPropertyId: propertyId
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Lister: Delete One Property Listing
  const deletePropertyListing = (propertyId: string) => {
    const target = properties.find((p) => p.id === propertyId);
    if (!target) return;

    // Security check: Only allow lister to delete their own listing (or admin)
    if (currentUser?.role === 'lister' && target.lister?.id !== currentUser.id) {
      return;
    }

    const remaining = properties.filter((p) => p.id !== propertyId);

    // Safely cleanup blob media no longer used
    const deletedMedia = [...(target.images || []), target.coverPhoto, target.video];
    const remainingMedia: (string | undefined | null)[] = [];
    remaining.forEach((p) => {
      if (p.images) remainingMedia.push(...p.images);
      if (p.coverPhoto) remainingMedia.push(p.coverPhoto);
      if (p.video) remainingMedia.push(p.video);
    });

    cleanupDeletedPropertyMedia(deletedMedia, remainingMedia);

    setProperties(remaining);

    // Remove from saved property IDs if saved
    if (currentUser?.savedPropertyIds?.includes(propertyId)) {
      setCurrentUser({
        ...currentUser,
        savedPropertyIds: currentUser.savedPropertyIds.filter((id) => id !== propertyId)
      });
    }

    // Clean up enquiries for deleted property
    setEnquiries((prev) => prev.filter((e) => e.propertyId !== propertyId));
  };

  // Lister: Delete All My Listings (For testing/prototype reset)
  const deleteAllMyListings = () => {
    if (!currentUser || currentUser.role !== 'lister') return;

    const myProps = properties.filter((p) => p.lister?.id === currentUser.id);
    if (myProps.length === 0) return;

    const remaining = properties.filter((p) => p.lister?.id !== currentUser.id);

    const deletedMedia: (string | undefined | null)[] = [];
    myProps.forEach((p) => {
      if (p.images) deletedMedia.push(...p.images);
      if (p.coverPhoto) deletedMedia.push(p.coverPhoto);
      if (p.video) deletedMedia.push(p.video);
    });

    const remainingMedia: (string | undefined | null)[] = [];
    remaining.forEach((p) => {
      if (p.images) remainingMedia.push(...p.images);
      if (p.coverPhoto) remainingMedia.push(p.coverPhoto);
      if (p.video) remainingMedia.push(p.video);
    });

    cleanupDeletedPropertyMedia(deletedMedia, remainingMedia);

    setProperties(remaining);

    const deletedIds = new Set(myProps.map((p) => p.id));
    setEnquiries((prev) => prev.filter((e) => !deletedIds.has(e.propertyId)));

    if (currentUser.savedPropertyIds?.some((id) => deletedIds.has(id))) {
      setCurrentUser({
        ...currentUser,
        savedPropertyIds: currentUser.savedPropertyIds.filter((id) => !deletedIds.has(id))
      });
    }
  };

  // Admin: Approve / Reject / Flag / Archive / Suspend / Reinstate
  const approveProperty = (propertyId: string) => {
    if (isConvexConfigured && convexClient) {
      try {
        convexClient.mutation(api.properties.updateStatus, {
          id: propertyId,
          status: 'Approved'
        }).catch((err) => console.warn('Could not update status in Convex:', err));
      } catch (e) {
        console.warn('Convex updateStatus error:', e);
      }
    }

    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: 'Approved' } : p))
    );

    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      logAdminActivity({
        action: 'approved',
        title: 'Listing Approved',
        details: `Approved "${prop.name}" for live listing search`,
        targetId: propertyId
      });
      const listerId = prop.lister?.id || 'demo-lister-001';
      const nowIso = new Date().toISOString();
      const newNotif: UserNotification = {
        id: `notif-${Date.now()}`,
        recipientUserId: listerId,
        userId: listerId,
        title: 'Listing Approved',
        message: `Your listing "${prop.name}" has been approved and is now live on MakaoHub.`,
        time: nowIso,
        createdAt: nowIso,
        read: false,
        type: 'approval',
        targetPropertyId: propertyId
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (isConvexConfigured && convexClient) {
        convexClient
          .mutation(api.notifications.send, {
            recipientUserId: listerId,
            userId: listerId,
            title: 'Listing Approved',
            message: `Your listing "${prop.name}" has been approved and is now live on MakaoHub.`,
            time: nowIso,
            type: 'approval',
            targetPropertyId: propertyId
          })
          .catch((err) => console.warn('Convex notification notice:', err));
      }
    }
  };

  const rejectProperty = (propertyId: string, reason?: string) => {
    if (isConvexConfigured && convexClient) {
      try {
        convexClient.mutation(api.properties.updateStatus, {
          id: propertyId,
          status: 'Rejected',
          rejectionReason: reason || 'Does not meet verification guidelines'
        }).catch((err) => console.warn('Could not update status in Convex:', err));
      } catch (e) {
        console.warn('Convex updateStatus error:', e);
      }
    }

    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? { ...p, status: 'Rejected', rejectionReason: reason || 'Does not meet verification guidelines' }
          : p
      )
    );

    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      logAdminActivity({
        action: 'rejected',
        title: 'Listing Rejected',
        details: `Rejected "${prop.name}" — ${reason || 'Guidelines not met'}`,
        targetId: propertyId
      });
      const listerId = prop.lister?.id || 'demo-lister-001';
      const rejectionReasonText = reason ? `: ${reason}` : '.';
      const nowIso = new Date().toISOString();
      const newNotif: UserNotification = {
        id: `notif-${Date.now()}`,
        recipientUserId: listerId,
        userId: listerId,
        title: 'Listing Rejected',
        message: `Your listing "${prop.name}" was not approved${rejectionReasonText}`,
        time: nowIso,
        createdAt: nowIso,
        read: false,
        type: 'rejection',
        targetPropertyId: propertyId
      };
      setNotifications((prev) => [newNotif, ...prev]);

      if (isConvexConfigured && convexClient) {
        convexClient
          .mutation(api.notifications.send, {
            recipientUserId: listerId,
            userId: listerId,
            title: 'Listing Rejected',
            message: `Your listing "${prop.name}" was not approved${rejectionReasonText}`,
            time: nowIso,
            type: 'rejection',
            targetPropertyId: propertyId
          })
          .catch((err) => console.warn('Convex notification notice:', err));
      }
    }
  };

  const flagProperty = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: 'Flagged' } : p))
    );

    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      logAdminActivity({
        action: 'suspended',
        title: 'Listing Flagged',
        details: `Flagged "${prop.name}" for moderation review`,
        targetId: propertyId
      });
      if (prop.lister?.id) {
        const nowIso = new Date().toISOString();
        const newNotif: UserNotification = {
          id: `notif-${Date.now()}`,
          recipientUserId: prop.lister.id,
          userId: prop.lister.id,
          title: 'Listing Flagged',
          message: `Your listing "${prop.name}" has been flagged by moderators and hidden from public search pending review.`,
          time: nowIso,
          createdAt: nowIso,
          read: false,
          type: 'flag',
          targetPropertyId: propertyId
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }
  };

  const suspendProperty = (propertyId: string, reason?: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: 'Flagged' } : p))
    );

    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      logAdminActivity({
        action: 'suspended',
        title: 'Listing Suspended',
        details: `Suspended "${prop.name}" — ${reason || 'Flagged for moderation'}`,
        targetId: propertyId
      });
      if (prop.lister?.id) {
        const nowIso = new Date().toISOString();
        const newNotif: UserNotification = {
          id: `notif-${Date.now()}`,
          recipientUserId: prop.lister.id,
          userId: prop.lister.id,
          title: 'Listing Suspended',
          message: `Your listing "${prop.name}" has been suspended: ${reason || 'Contact MakaoHub support for details'}.`,
          time: nowIso,
          createdAt: nowIso,
          read: false,
          type: 'flag',
          targetPropertyId: propertyId
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }
  };

  const reinstateProperty = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: 'Approved' } : p))
    );

    const prop = properties.find((p) => p.id === propertyId);
    if (prop) {
      logAdminActivity({
        action: 'reinstated',
        title: 'Listing Reinstated',
        details: `Reinstated "${prop.name}" to live search`,
        targetId: propertyId
      });
      if (prop.lister?.id) {
        const nowIso = new Date().toISOString();
        const newNotif: UserNotification = {
          id: `notif-${Date.now()}`,
          recipientUserId: prop.lister.id,
          userId: prop.lister.id,
          title: 'Listing Reinstated',
          message: `Your listing "${prop.name}" has been reinstated and is now live on MakaoHub.`,
          time: nowIso,
          createdAt: nowIso,
          read: false,
          type: 'approval',
          targetPropertyId: propertyId
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }
  };

  const archiveProperty = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: 'Archived' } : p))
    );
  };

  const suspendUserAccount = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: true } : u))
    );
    const target = users.find((u) => u.id === userId);
    if (target) {
      logAdminActivity({
        action: 'user_suspended',
        title: 'User Account Suspended',
        details: `Suspended account for ${target.name} (${target.email})`,
        targetId: userId
      });
    }
  };

  const reinstateUserAccount = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: false } : u))
    );
    const target = users.find((u) => u.id === userId);
    if (target) {
      logAdminActivity({
        action: 'user_reinstated',
        title: 'User Account Reinstated',
        details: `Reinstated account for ${target.name} (${target.email})`,
        targetId: userId
      });
    }
  };

  // Moderation Reports
  const dismissReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'dismissed' } : r))
    );
    logAdminActivity({
      action: 'investigated',
      title: 'Report Dismissed',
      details: `Dismissed report #${reportId} (${report?.targetTitle || 'Report'})`,
      targetId: reportId
    });
  };

  const hideListingReport = (reportId: string, propertyId: string) => {
    flagProperty(propertyId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'investigated', notes: 'Listing hidden from search' } : r))
    );
  };

  const suspendUserReport = (reportId: string, userId: string) => {
    suspendUserAccount(userId);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'investigated', notes: 'User account suspended' } : r))
    );
    const nowIso = new Date().toISOString();
    const newNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      recipientUserId: userId,
      userId: userId,
      title: 'Account Suspended',
      message: 'Your MakaoHub account has been suspended following a moderation review.',
      time: nowIso,
      createdAt: nowIso,
      read: false,
      type: 'flag'
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Reviews
  const getPropertyReviews = (propertyId: string) => {
    return reviews.filter((r) => r.propertyId === propertyId);
  };

  const addReview = (
    propertyId: string,
    reviewData: Omit<PropertyReview, 'id' | 'propertyId' | 'date'>
  ) => {
    const authorId = reviewData.authorId || currentUser?.id || 'demo-seeker-001';
    const newRev: PropertyReview = {
      ...reviewData,
      authorId,
      id: `rev-${Date.now()}`,
      propertyId,
      date: 'Just now'
    };
    setReviews((prev) => [newRev, ...prev]);

    // Update property rating
    const existing = reviews.filter((r) => r.propertyId === propertyId);
    const allScores = [...existing.map((r) => r.rating), reviewData.rating];
    const avgRating = Number((allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1));

    setProperties((prev) =>
      prev.map((p) =>
        p.id === propertyId
          ? { ...p, rating: avgRating, reviewCount: p.reviewCount + 1 }
          : p
      )
    );

    // Notify lister with TWO distinct notifications (Rating + Comment)
    const prop = properties.find((p) => p.id === propertyId);
    if (prop && prop.lister?.id) {
      const now = Date.now();
      const nowIso = new Date(now).toISOString();
      const starsLabel = reviewData.rating === 1 ? '1 star' : `${reviewData.rating} stars`;
      const createdNotifications: UserNotification[] = [];

      // 1. STAR RATING NOTIFICATION
      const ratingNotif: UserNotification = {
        id: `notif-rating-${now}`,
        recipientUserId: prop.lister.id,
        userId: prop.lister.id,
        title: 'New Property Rating',
        message: `${reviewData.authorName} rated ${prop.name} ${starsLabel}.`,
        time: nowIso,
        createdAt: nowIso,
        read: false,
        type: 'review',
        targetPropertyId: propertyId,
        targetReviewId: newRev.id
      };
      createdNotifications.push(ratingNotif);

      // 2. COMMENT NOTIFICATION (Only if seeker wrote a text comment)
      const rawComment = (reviewData.comment || '').trim();
      if (rawComment) {
        const cleanComment = rawComment.replace(/\s+/g, ' ');
        let commentSnippet = `"${cleanComment}"`;
        if (cleanComment.length > 100) {
          commentSnippet = `"${cleanComment.slice(0, 97).trim()}..."`;
        }

        const commentNotif: UserNotification = {
          id: `notif-comment-${now + 1}`,
          recipientUserId: prop.lister.id,
          userId: prop.lister.id,
          title: 'New Property Comment',
          message: `${reviewData.authorName} commented on ${prop.name}:\n${commentSnippet}`,
          time: new Date(now + 1).toISOString(),
          createdAt: new Date(now + 1).toISOString(),
          read: false,
          type: 'review',
          targetPropertyId: propertyId,
          targetReviewId: newRev.id
        };
        createdNotifications.push(commentNotif);
      }

      setNotifications((prev) => [...createdNotifications, ...prev]);
    }
  };

  const addReviewReply = (reviewId: string, replyText: string) => {
    if (!replyText.trim()) return;
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (!targetRev) return;
    const prop = properties.find((p) => p.id === targetRev.propertyId);
    if (!prop) return;

    // Requirement 1: Only the lister who owns the reviewed property may reply
    if (currentUser?.role !== 'lister' || prop.lister?.id !== currentUser.id) {
      console.warn('Unauthorized: Only the property owner can reply to this review.');
      return;
    }

    const reply: ListerReviewReply = {
      id: `reply-${Date.now()}`,
      reviewId,
      propertyId: prop.id,
      listerId: currentUser.id,
      listerName: currentUser.name || 'Property Lister',
      listerSubtype: currentUser.listerSubtype || prop.lister?.type,
      listerAvatar: currentUser.avatar || prop.lister?.avatar,
      replyText: replyText.trim(),
      createdAt: 'Just now'
    };

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reply } : r))
    );

    // Requirement 8: Send Seeker notification
    // Title: "Lister Replied to Your Review"
    // Message: "[Lister Name] replied to your review of [Property Name]."
    // recipientUserId must be the review author's user ID.
    const seekerId = targetRev.authorId || 'demo-seeker-001';
    const nowIso = new Date().toISOString();
    const newNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      recipientUserId: seekerId,
      userId: seekerId,
      title: 'Lister Replied to Your Review',
      message: `${currentUser.name || 'Property Lister'} replied to your review of ${prop.name}.`,
      time: nowIso,
      createdAt: nowIso,
      read: false,
      type: 'review',
      targetPropertyId: prop.id,
      targetReviewId: reviewId,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const editReviewReply = (reviewId: string, replyText: string) => {
    if (!replyText.trim()) return;
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (!targetRev || !targetRev.reply) return;
    const prop = properties.find((p) => p.id === targetRev.propertyId);
    if (!prop) return;

    // Ensure owner
    if (currentUser?.role !== 'lister' || prop.lister?.id !== currentUser.id) {
      return;
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId && r.reply) {
          return {
            ...r,
            reply: {
              ...r.reply,
              replyText: replyText.trim(),
              updatedAt: 'Edited just now'
            }
          };
        }
        return r;
      })
    );
  };

  const deleteReviewReply = (reviewId: string) => {
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (!targetRev) return;
    const prop = properties.find((p) => p.id === targetRev.propertyId);
    if (!prop) return;

    // Ensure owner
    if (currentUser?.role !== 'lister' || prop.lister?.id !== currentUser.id) {
      return;
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const { reply, ...rest } = r;
          return rest;
        }
        return r;
      })
    );
  };

  const deleteReview = (reviewId: string) => {
    const targetReview = reviews.find((r) => r.id === reviewId);
    if (!targetReview) return;
    const remainingReviews = reviews.filter((r) => r.id !== reviewId);
    setReviews(remainingReviews);

    // Recalculate property score
    const propId = targetReview.propertyId;
    const propReviews = remainingReviews.filter((r) => r.propertyId === propId);
    const prop = properties.find((p) => p.id === propId);
    if (prop) {
      const avgRating =
        propReviews.length > 0
          ? Number((propReviews.reduce((a, b) => a + b.rating, 0) / propReviews.length).toFixed(1))
          : 0;
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propId
            ? { ...p, rating: avgRating, reviewCount: propReviews.length }
            : p
        )
      );
    }

    logAdminActivity({
      action: 'review_deleted',
      title: 'Review Deleted',
      details: `Removed review by ${targetReview.authorName} on property ${prop?.name || propId}`,
      targetId: reviewId
    });
  };

  const reportReview = (reviewId: string, reason: string = 'Inappropriate content') => {
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (!targetRev) return;
    const prop = properties.find((p) => p.id === targetRev.propertyId);

    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, reported: true } : r))
    );

    // Create a platform report for Admin
    const newReport: PlatformReport = {
      id: `rep-${Date.now()}`,
      type: 'review',
      targetId: reviewId,
      targetTitle: `Review on ${prop?.name || 'Property'}`,
      targetSubtitle: `Author: ${targetRev.authorName}`,
      reason: reason || 'Reported by user for moderation',
      reporterCount: 1,
      status: 'open',
      createdAt: 'Just now'
    };
    setReports((prev) => [newReport, ...prev]);
  };

  // Enquiries
  const sendEnquiry = (
    propertyId: string,
    seekerName: string,
    seekerPhone: string,
    seekerEmail: string,
    message: string
  ) => {
    const prop = properties.find((p) => p.id === propertyId);
    const seekerId = currentUser?.id || 'demo-seeker-001';
    const listerId = prop?.lister?.id || 'demo-lister-001';
    const enquiryId = `enq-${Date.now()}`;
    const nowStr = 'Just now';
    const cleanMsg = message.trim();

    const initialMsg: EnquiryMessage = {
      id: `msg-${Date.now()}`,
      enquiryId,
      senderId: seekerId,
      senderName: seekerName || currentUser?.name || 'Kevin Otieno',
      senderRole: 'seeker',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      message: cleanMsg,
      createdAt: nowStr
    };

    const newEnq: ListerEnquiry = {
      id: enquiryId,
      propertyId,
      propertyName: prop?.name || 'Property',
      seekerId,
      seekerName: seekerName || currentUser?.name || 'Kevin Otieno',
      seekerPhone: seekerPhone || currentUser?.phone || '+254 711 223 344',
      seekerEmail: seekerEmail || currentUser?.email || 'seeker@makaohub.test',
      seekerAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      listerId,
      message: cleanMsg,
      date: nowStr,
      createdAt: nowStr,
      status: 'New',
      readByLister: false,
      readBySeeker: true,
      messages: [initialMsg],
      replies: [initialMsg]
    };
    setEnquiries((prev) => [newEnq, ...prev]);

    // Update property enquiriesCount
    if (prop) {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? { ...p, enquiriesCount: (p.enquiriesCount || 0) + 1 }
            : p
        )
      );
    }

    // Notify lister
    if (prop && prop.lister?.id) {
      const nowIso = new Date().toISOString();
      const newNotif: UserNotification = {
        id: `notif-${Date.now()}`,
        recipientUserId: prop.lister.id,
        userId: prop.lister.id,
        title: 'New Enquiry Received',
        message: `${seekerName || currentUser?.name || 'Kevin Otieno'} sent an enquiry for ${prop.name}.`,
        time: nowIso,
        createdAt: nowIso,
        read: false,
        type: 'enquiry',
        targetPropertyId: propertyId,
        targetEnquiryId: enquiryId
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const sendEnquiryReply = (enquiryId: string, replyText: string) => {
    if (!replyText.trim()) return;
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;
    const prop = properties.find((p) => p.id === enq.propertyId);

    const isLister = currentUser?.role === 'lister' || (currentUser && currentUser.id === enq.listerId);
    const senderId = currentUser?.id || (isLister ? enq.listerId : enq.seekerId);
    const senderName = currentUser?.name || (isLister ? (prop?.lister?.name || 'Mary Wanjiku') : enq.seekerName);
    const senderRole: 'seeker' | 'lister' = isLister ? 'lister' : 'seeker';
    const senderAvatar = currentUser?.avatar || (isLister ? (prop?.lister?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80') : enq.seekerAvatar);

    const nowStr = 'Just now';
    const newMsg: EnquiryMessage = {
      id: `msg-${Date.now()}`,
      enquiryId,
      senderId,
      senderName,
      senderRole,
      senderAvatar,
      message: replyText.trim(),
      createdAt: nowStr
    };

    const existingMsgs = (enq.messages && enq.messages.length > 0)
      ? enq.messages
      : [
        {
          id: `msg-orig-${enq.id}`,
          enquiryId: enq.id,
          senderId: enq.seekerId,
          senderName: enq.seekerName,
          senderRole: 'seeker' as const,
          senderAvatar: enq.seekerAvatar,
          message: enq.message,
          createdAt: enq.date || 'Recently'
        }
      ];

    const updatedMessages = [...existingMsgs, newMsg];

    setEnquiries((prev) =>
      prev.map((e) => {
        if (e.id !== enquiryId) return e;
        return {
          ...e,
          status: isLister ? 'Replied' : e.status,
          readByLister: isLister ? true : false,
          readBySeeker: !isLister ? true : false,
          messages: updatedMessages,
          replies: updatedMessages
        };
      })
    );

    // Send Notification to recipient
    const nowIso = new Date().toISOString();
    if (isLister) {
      // Lister replied -> notify Seeker
      const seekerNotif: UserNotification = {
        id: `notif-${Date.now()}`,
        recipientUserId: enq.seekerId,
        userId: enq.seekerId,
        title: 'Lister Replied to Your Enquiry',
        message: `${senderName} replied to your enquiry about ${enq.propertyName}.`,
        time: nowIso,
        createdAt: nowIso,
        read: false,
        type: 'enquiry',
        targetPropertyId: enq.propertyId,
        targetEnquiryId: enquiryId,
        targetMessageId: newMsg.id
      };
      setNotifications((prev) => [seekerNotif, ...prev]);
    } else {
      // Seeker replied -> notify Lister
      const listerNotif: UserNotification = {
        id: `notif-${Date.now()}`,
        recipientUserId: enq.listerId,
        userId: enq.listerId,
        title: 'New Enquiry Message',
        message: `${senderName} sent a message regarding ${enq.propertyName}.`,
        time: nowIso,
        createdAt: nowIso,
        read: false,
        type: 'enquiry',
        targetPropertyId: enq.propertyId,
        targetEnquiryId: enquiryId,
        targetMessageId: newMsg.id
      };
      setNotifications((prev) => [listerNotif, ...prev]);
    }
  };

  const markEnquiryAsRead = (enquiryId: string) => {
    const isLister = currentUser?.role === 'lister';
    setEnquiries((prev) =>
      prev.map((e) => {
        if (e.id !== enquiryId) return e;
        return {
          ...e,
          readByLister: isLister ? true : e.readByLister,
          readBySeeker: !isLister ? true : e.readBySeeker
        };
      })
    );
  };

  // Notifications - strictly scoped to authenticated user
  const userNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter((n) => {
      const recipient = n.recipientUserId || n.userId;
      return recipient === currentUser.id;
    });
  }, [notifications, currentUser]);

  const unreadNotificationCount = useMemo(() => {
    return userNotifications.filter((n) => !n.read).length;
  }, [userNotifications]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (isConvexConfigured && convexClient && id) {
      try {
        convexClient.mutation(api.notifications.markAsRead, { id: id as any }).catch(() => { });
      } catch {
        // Safe catch
      }
    }
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => {
        const recipient = n.recipientUserId || n.userId;
        return recipient === currentUser.id ? { ...n, read: true } : n;
      })
    );
    if (isConvexConfigured && convexClient && currentUser.id) {
      try {
        convexClient.mutation(api.notifications.markAllAsRead, { recipientUserId: currentUser.id }).catch(() => { });
      } catch {
        // Safe catch
      }
    }
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSelectedPropertyId(null);
    triggerMapNavigation(-1.286389, 36.817223, 7, 'recenter', 'Kenya');
  };

  const isFilterActive =
    !!filters.searchQuery ||
    !!filters.county ||
    !!filters.subCounty ||
    !!filters.ward ||
    !!filters.estate ||
    !!filters.propertyType ||
    filters.minRent !== '' ||
    filters.maxRent !== '' ||
    filters.amenities.length > 0;

  // Quick Demo flows helpers for testers
  const runSeekerDemo = () => {
    loginUser('seeker');
    setCurrentView('tenant-home');
    setFilters({
      ...DEFAULT_FILTERS,
      searchQuery: 'Kasarani',
      estate: 'Seasons',
      propertyType: 'Bedsitter',
      maxRent: 12000
    });
  };

  const runListerDemo = () => {
    loginUser('lister');
    setCurrentView('lister-dashboard');
  };

  const runAdminDemo = () => {
    loginUser('admin');
    setAdminActiveTab('overview');
    setCurrentView('admin-dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        previousView,
        setCurrentView,
        currentUser,
        setCurrentUser,
        selectedPropertyId,
        setSelectedPropertyId,
        targetReviewId,
        setTargetReviewId,
        targetEnquiryId,
        setTargetEnquiryId,
        targetMessageId,
        setTargetMessageId,
        isSeekerMode,
        isListerMode,
        isAdmin,
        switchUserMode,
        signupNewUser,
        assignRole,
        assignListerSubtype,
        loginUser,
        logoutUser,
        properties,
        availableProperties,
        filteredProperties,
        savedProperties,
        toggleSaveProperty,
        isPropertySaved,
        listerListings,
        listerTotalVacancies,
        listerEnquiries,
        seekerEnquiries,
        listerListingsFilter,
        setListerListingsFilter,
        editingPropertyId,
        setEditingPropertyId,
        users,
        addProperty,
        addPropertyListing: addProperty,
        updatePropertyListing,
        deletePropertyListing,
        deleteAllMyListings,
        updatePropertyVacancies,
        adminActiveTab,
        setAdminActiveTab,
        adminActivity,
        logAdminActivity,
        pendingProperties,
        approveProperty,
        rejectProperty,
        flagProperty,
        archiveProperty,
        suspendProperty,
        reinstateProperty,
        suspendUserAccount,
        reinstateUserAccount,
        reports,
        dismissReport,
        hideListingReport,
        suspendUserReport,
        reviews,
        listerReviews,
        getPropertyReviews,
        addReview,
        addReviewReply,
        editReviewReply,
        deleteReviewReply,
        deleteReview,
        reportReview,
        enquiries,
        sendEnquiry,
        sendEnquiryReply,
        markEnquiryAsRead,
        notifications: userNotifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        filters,
        setFilters,
        resetFilters,
        isFilterActive,
        filterDrawerOpen,
        setFilterDrawerOpen,
        seekerLocation,
        setSeekerLocation,
        mapTarget,
        setMapTarget,
        triggerMapNavigation,
        runSeekerDemo,
        runListerDemo,
        runAdminDemo,
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        showSplashScreen,
        setShowSplashScreen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
