import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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
  | 'lister-about'
  | 'lister-phone'
  | 'tenant-home'
  | 'tenant-home'
  | 'search-results'
  | 'map-explore'
  | 'property-detail'
  | 'public-lister-profile'
  | 'saved'
  | 'notifications'
  | 'profile'
  | 'my-profile'
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
  | 'notifications'
  | 'admin-activity';

interface AppContextType {
  isLoggingOut: boolean;
  // Navigation & User
  currentView: AppView;
  previousView: AppView | null;
  setCurrentView: (view: AppView) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  selectedListerId: string | null;
  setSelectedListerId: (id: string | null) => void;
  targetReviewId: string | null;
  setTargetReviewId: (id: string | null) => void;
  targetEnquiryId: string | null;
  setTargetEnquiryId: (id: string | null) => void;
  messageTab: 'inbox' | 'activity' | 'system';
  setMessageTab: (tab: 'inbox' | 'activity' | 'system') => void;
  desktopSidebarExpanded: boolean;
  setDesktopSidebarExpanded: (expanded: boolean) => void;
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
  assignListerSubtype: (subtype: ListerSubtype) => Promise<void>;
  loginUser: (role: UserRole) => void;
  logoutUser: () => void;
  updateCurrentUserName: (name: string) => Promise<void>;

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
  listerListingsFilter: 'all' | 'active' | 'vacancies' | 'rejected';
  setListerListingsFilter: (filter: 'all' | 'active' | 'vacancies' | 'rejected') => void;
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
  removeReviewReport: (reportId: string, reviewId: string) => void;
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
  editReview: (
    reviewId: string,
    rating?: number,
    comment?: string,
    wouldRecommend?: boolean
  ) => void;
  deleteReview: (reviewId: string) => void;
  deleteOwnReview: (reviewId: string) => void;
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

const formatTimeAgo = (timestamp?: number | string) => {
  if (!timestamp) return 'Recently';

  const created = new Date(timestamp).getTime();
  const now = Date.now();
  const diffMs = now - created;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return new Date(created).toLocaleDateString();
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  // Start on Welcome screen as mandated
  const [currentView, setCurrentViewState] = useState<AppView>('welcome');
  const [previousView, setPreviousView] = useState<AppView | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isBrowsingAsSeeker, setIsBrowsingAsSeeker] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedListerId, setSelectedListerId] = useState<string | null>(null);
  const [targetReviewId, setTargetReviewId] = useState<string | null>(null);
  const [targetEnquiryId, setTargetEnquiryId] = useState<string | null>(null);
  const [messageTab, setMessageTab] =
    useState<'inbox' | 'activity' | 'system'>('inbox');
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] =
    useState(false);
  const [targetMessageId, setTargetMessageId] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [listerListingsFilter, setListerListingsFilter] = useState<'all' | 'active' | 'vacancies' | 'rejected'>('all');
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
      role: 'unassigned',
      joinedAt: new Date().toISOString(),
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
      (clerkUser.hasImage ? clerkUser.imageUrl : '') ||
      googleAccount?.imageUrl ||
      '';

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
      currentUser.role === 'unassigned' ||
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
          (clerkUser.hasImage ? clerkUser.imageUrl : '') ||
          googleAccount?.imageUrl ||
          currentUser.avatar;

        const correctedUser: UserAccount = {
          ...currentUser,
          name: currentUser.name || clerkName,
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
          name: currentUser.name || clerkName,
          email: clerkEmail,
          phone: clerkPhone,

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

          name: savedUser.name || clerkUser.fullName || 'Rentike User',

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
          bio: savedUser.bio ?? '',
          joinedAt: savedUser.joinedAt || new Date().toISOString(),
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
          setIsBrowsingAsSeeker(false);
          setCurrentViewState('tenant-home');
        } else if (savedRole === 'lister') {
          const savedMode = localStorage.getItem(
            `rentike_active_mode_${restoredUser.id}`
          );

          const browseAsSeeker = savedMode === 'seeker';
          setIsBrowsingAsSeeker(browseAsSeeker);

          if (browseAsSeeker) {
            setCurrentViewState('tenant-home');
          } else if (!restoredUser.listerSubtype) {
            setCurrentViewState('lister-subtype');
          } else {
            setCurrentViewState('lister-dashboard');
          }
        } else if (savedRole === 'admin') {
          window.history.replaceState({}, '', '/admin');
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
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(true);

  const [reviews, setReviews] = useState<PropertyReview[]>([]);

  const [reports, setReports] = useState<PlatformReport[]>([]);
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

  // Desktop notifications: prevent old and duplicate popups.
  const desktopNotificationIdsRef = useRef<Set<string>>(new Set());
  const desktopNotificationUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !currentUser ||
      typeof window === 'undefined' ||
      !('Notification' in window)
    ) {
      desktopNotificationUserRef.current = null;
      desktopNotificationIdsRef.current.clear();
      return;
    }

    const currentUserId = currentUser.id;
    const storageKey = `rentike-desktop-notifications-${currentUserId}`;
    const initializedKey = `${storageKey}-initialized`;

    const myNotifications = notifications.filter((notification) => {
      const recipientId =
        notification.recipientUserId || notification.userId;

      return recipientId === currentUserId;
    });

    // Restore displayed IDs for this account.
    if (desktopNotificationUserRef.current !== currentUserId) {
      desktopNotificationUserRef.current = currentUserId;

      let storedIds: string[] = [];

      try {
        storedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!Array.isArray(storedIds)) storedIds = [];
      } catch {
        storedIds = [];
      }

      desktopNotificationIdsRef.current = new Set(storedIds);
    }

    // On first initialization, record existing notifications
    // without displaying desktop popups.
    if (!localStorage.getItem(initializedKey)) {
      const existingIds = myNotifications.map((notification) =>
        String(notification.id)
      );

      const allIds = new Set([
        ...desktopNotificationIdsRef.current,
        ...existingIds,
      ]);

      desktopNotificationIdsRef.current = allIds;

      try {
        localStorage.setItem(storageKey, JSON.stringify([...allIds]));
        localStorage.setItem(initializedKey, 'true');
      } catch (error) {
        console.warn('Unable to save notification history:', error);
      }

      return;
    }

    const displayedIds = desktopNotificationIdsRef.current;

    myNotifications.forEach((notification) => {
      const notificationId = String(notification.id);

      if (notification.read || displayedIds.has(notificationId)) {
        return;
      }

      // Re-check shared storage to reduce duplicate popups
      // when another browser tab has already displayed this ID.
      let sharedIds: string[] = [];

      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) || '[]');
        sharedIds = Array.isArray(parsed) ? parsed : [];
      } catch {
        sharedIds = [];
      }

      if (sharedIds.includes(notificationId)) {
        displayedIds.add(notificationId);
        return;
      }

      displayedIds.add(notificationId);

      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify([...new Set([...sharedIds, notificationId])])
        );
      } catch (error) {
        console.warn('Unable to save notification ID:', error);
      }

      if (Notification.permission === 'granted') {
        new Notification(notification.title || 'Rentike', {
          body: notification.message,
          icon: '/favicon3.png',
        });
      }
    });
  }, [notifications, currentUser]);


  // Ask for desktop notification permission on the user's next click
  useEffect(() => {
    if (
      !currentUser ||
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'default'
    ) {
      return;
    }

    const requestPermission = () => {
      void Notification.requestPermission();
    };

    window.addEventListener('click', requestPermission, { once: true });

    return () => {
      window.removeEventListener('click', requestPermission);
    };
  }, [currentUser?.id]);
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
  const [users, setUsers] = useState<UserAccount[]>([]);
  useEffect(() => {
    if (
      !isConvexConfigured ||
      !convexClient ||
      !isConvexAuthenticated ||
      currentUser?.role !== 'admin'
    ) {
      return;
    }

    const loadUsersFromConvex = async () => {
      try {
        const convexUsers = await convexClient.query(
          api.users.listUsersForAdmin,
          {}
        );

        const realUsers: UserAccount[] = convexUsers.map((user) => ({
          id: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role as UserAccount['role'],
          listerSubtype:
            user.listerSubtype as UserAccount['listerSubtype'],
          joinedAt: user.joinedAt,
          avatar: user.avatar,
          savedPropertyIds: user.savedPropertyIds,
        }));

        setUsers(realUsers);
      } catch (error) {
        console.error('Failed to load users from Convex:', error);
      }
    };

    void loadUsersFromConvex();
  }, [isConvexAuthenticated, currentUser?.role]);
  // Load shared property reviews from Convex for all users
  // Load shared property reviews from Convex and keep them live
  useEffect(() => {
    if (!isConvexConfigured || !convexClient) return;

    const applyReviews = (convexReviews: any[]) => {
      const realReviews: PropertyReview[] = convexReviews.map(
        (review: any) => ({
          ...review,
          id: review._id,
        })
      );

      setReviews(realReviews);
    };

    // Load the current reviews immediately
    convexClient
      .query(api.reviews.listAll, {})
      .then(applyReviews)
      .catch((error) => {
        console.error('Failed to load reviews from Convex:', error);
      });

    // Then listen for future changes
    const watch = convexClient.watchQuery(api.reviews.listAll, {});

    const unsubscribe = watch.onUpdate(() => {
      try {
        const latestReviews = watch.localQueryResult();

        if (latestReviews) {
          applyReviews(latestReviews);
        }
      } catch (error) {
        console.error('Failed to receive live review update:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConvexAuthenticated]);
  // Live Convex admin reports listener
  useEffect(() => {
    if (
      !isConvexAuthenticated ||
      !convexClient ||
      !currentUser ||
      currentUser.role !== 'admin'
    ) {
      return;
    }

    const applyReports = (docs: any[]) => {
      const liveReports: PlatformReport[] = docs.map((doc: any) => ({
        id: doc._id.toString(),
        type: doc.type,
        targetId: doc.targetId,
        targetTitle: doc.targetTitle,
        targetSubtitle: doc.targetSubtitle,
        reason: doc.reason,
        reporterCount: doc.reporterCount,
        status: doc.status,
        createdAt: doc.createdAt,
      }));

      setReports(liveReports);
    };

    // Load existing reports immediately
    convexClient
      .query(api.reviews.listReportsForAdmin, {})
      .then(applyReports)
      .catch((error) => {
        console.error('Failed to load admin reports from Convex:', error);
      });

    // Listen for future reports
    const watch = convexClient.watchQuery(
      api.reviews.listReportsForAdmin,
      {}
    );

    const unsubscribe = watch.onUpdate(() => {
      try {
        const latestReports = watch.localQueryResult();

        if (latestReports) {
          applyReports(latestReports);
        }
      } catch (error) {
        console.error('Failed to receive live report update:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConvexAuthenticated, convexClient, currentUser]);
  // Live Convex enquiries listener
  useEffect(() => {
    if (!isConvexAuthenticated || !convexClient || !currentUser) return;

    if (currentUser.role !== 'lister' && currentUser.role !== 'seeker') {
      return;
    }

    const applyEnquiries = (docs: any[]) => {
      const liveEnquiries: ListerEnquiry[] = docs.map((doc: any) => ({
        id: doc._id.toString(),
        propertyId: doc.propertyId,
        propertyName: doc.propertyName,
        seekerId: doc.seekerId,
        seekerName: doc.seekerName,
        seekerPhone: doc.seekerPhone,
        seekerEmail: doc.seekerEmail || '',
        seekerAvatar: doc.seekerAvatar,
        listerId: doc.listerId,
        message: doc.message,
        date: doc.date,
        createdAt: doc.createdAt,
        status: doc.status,
        readByLister: doc.readByLister ?? false,
        readBySeeker: doc.readBySeeker ?? true,
        messages: doc.messages || [],
        replies: doc.messages || [],
      }));

      setEnquiries(liveEnquiries);
    };

    let watch: any;

    if (currentUser.role === 'lister') {
      convexClient
        .query(api.enquiries.listByLister, {
          listerId: currentUser.id,
        })
        .then(applyEnquiries)
        .catch((error) =>
          console.error('Failed to load lister enquiries:', error)
        );

      watch = (convexClient as any).watchQuery(
        api.enquiries.listByLister,
        { listerId: currentUser.id }
      );
    } else {
      convexClient
        .query(api.enquiries.listBySeeker, {
          seekerId: currentUser.id,
        })
        .then(applyEnquiries)
        .catch((error) =>
          console.error('Failed to load seeker enquiries:', error)
        );

      watch = (convexClient as any).watchQuery(
        api.enquiries.listBySeeker,
        { seekerId: currentUser.id }
      );
    }

    const unsubscribe = watch.onUpdate(() => {
      try {
        const result = watch.localQueryResult();

        if (result) {
          applyEnquiries(result);
        }
      } catch (error) {
        console.error('Failed to receive live enquiry update:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [
    isConvexAuthenticated,
    currentUser?.id,
    currentUser?.role,
  ]);
  const [filters, setFilters] = useState<FilterCriteria>(DEFAULT_FILTERS);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [seekerLocation, setSeekerLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (currentUser?.role !== 'seeker') return;
    if (seekerLocation) return;

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSeekerLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('Location permission unavailable or denied:', error);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [currentUser?.role, seekerLocation]);
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
    localStorage.setItem('makaohub_reviews', JSON.stringify(reviews));
  }, [reviews]);


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

    let latestSaveCounts: Record<string, number> = {};
    const processDocs = (convexDocs: any) => {
      if (Array.isArray(convexDocs)) {
        setIsPropertiesLoading(false);
      }
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
            saveCount: latestSaveCounts[doc._id || doc.id] ?? 0,
            timePosted: formatTimeAgo(doc._creationTime ?? doc.createdAt),
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
            createdAt: doc.createdAt || (
              doc._creationTime
                ? new Date(doc._creationTime).toISOString()
                : new Date().toISOString()
            ),
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
      const applySaveCounts = (counts: Record<string, number>) => {
        latestSaveCounts = counts || {};

        setProperties((prev) =>
          prev.map((property) => ({
            ...property,
            saveCount: latestSaveCounts[property.id] ?? 0,
          }))
        );
      };

      convexClient
        .query(api.users.getPropertySaveCounts, {})
        .then((counts) => applySaveCounts(counts))
        .catch((err) =>
          console.warn('Convex save counts fetch notice:', err)
        );

      const saveCountWatch = (convexClient as any).watchQuery(
        api.users.getPropertySaveCounts,
        {}
      );

      const unsubscribeSaveCounts = saveCountWatch.onUpdate(() => {
        const result = saveCountWatch.localQueryResult();

        if (result) {
          applySaveCounts(result);
        }
      });


      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }

        if (typeof unsubscribeSaveCounts === 'function') {
          unsubscribeSaveCounts();
        }
      };
    } catch (e) {
      console.warn('Could not initialize Convex subscription:', e);
    }
  }, []);

  // Convex real-time synchronization for User Notifications

  useEffect(() => {
    if (
      !isConvexConfigured ||
      !convexClient ||
      !isConvexAuthenticated ||
      !currentUser?.id
    ) return;


    const processConvexNotifs = (convexDocs: any) => {
      const docs = Array.isArray(convexDocs) ? convexDocs : [];

      const formatted: UserNotification[] = docs.map((doc: any) => ({
        id: doc._id || doc.id,
        recipientUserId: doc.recipientUserId,
        userId: doc.userId || doc.recipientUserId,
        actorUserId: doc.actorUserId,
        title: doc.title,
        message: doc.message,
        time: doc.time || new Date().toISOString(),
        createdAt: doc.time || new Date().toISOString(),
        read: Boolean(doc.read),
        type: doc.type,
        targetPropertyId: doc.targetPropertyId,
        targetReviewId: doc.targetReviewId,
        targetEnquiryId: doc.targetEnquiryId,
        targetMessageId: doc.targetMessageId,
      }));

      setNotifications(formatted);
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
  }, [currentUser?.id, isConvexAuthenticated]);

  // Roles determination

  const isSeekerMode =
    currentUser?.role === 'seeker' ||
    (currentUser?.role === 'lister' && isBrowsingAsSeeker);

  const isListerMode =
    currentUser?.role === 'lister' && !isBrowsingAsSeeker;

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

  const toggleSaveProperty = async (id: string) => {
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
    if (isConvexConfigured && convexClient) {
      try {
        await convexClient.mutation(api.users.toggleSaveProperty, {
          userId: currentUser.id,
          propertyId: id,
        });
        // Notify the lister only when the property is being SAVED
        if (!isSaved) {
          const prop = properties.find((p) => p.id === id);

          if (prop?.lister?.id) {
            const now = new Date().toISOString();

            const saveNotif: UserNotification = {
              id: `notif-save-${Date.now()}`,
              recipientUserId: prop.lister.id,
              userId: prop.lister.id,
              actorUserId: currentUser.id,
              title: 'Property Saved',
              message: `${currentUser.name} saved your property ${prop.name}.`,
              time: now,
              createdAt: now,
              read: false,
              type: 'review',
              targetPropertyId: id,
            };

            setNotifications((prev) => [saveNotif, ...prev]);

            await convexClient.mutation(api.notifications.send, {
              recipientUserId: saveNotif.recipientUserId,
              userId: saveNotif.userId,
              actorUserId: saveNotif.actorUserId,
              title: saveNotif.title,
              message: saveNotif.message,
              time: saveNotif.time,
              type: saveNotif.type,
              targetPropertyId: saveNotif.targetPropertyId,
            });
          }
        }
      } catch (error) {
        console.error('Failed to sync saved property to Convex:', error);
      }
    }
  };

  // Auth helper flows
  const signupNewUser = (name: string, email: string, phone: string) => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: name || 'New User',
      email: email || 'user@makaohub.test',
      phone: phone || '+254 700 000 000',
      role: 'unassigned', // default until assigned
      joinedAt: new Date().toISOString(),
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
      const welcomeTime = new Date().toISOString();

      const welcomeNotification: UserNotification = {
        id: `notif-welcome-${updated.id}`,
        recipientUserId: updated.id,
        userId: updated.id,
        title: 'Welcome to Rentike 👋',
        message:
          'Welcome to Rentike. Discover homes, list properties, and connect directly — all in one place',
        time: welcomeTime,
        createdAt: welcomeTime,
        read: false,
        type: 'system',
      };

      setNotifications((prev) => {
        const alreadyExists = prev.some(
          (notification) =>
            notification.type === 'system' &&
            notification.title === 'Welcome to Rentike 👋' &&
            (notification.recipientUserId === updated.id ||
              notification.userId === updated.id)
        );

        return alreadyExists
          ? prev
          : [welcomeNotification, ...prev];
      });

      if (isConvexConfigured && convexClient) {
        convexClient
          .mutation(api.notifications.send, {
            recipientUserId: welcomeNotification.recipientUserId,
            userId: welcomeNotification.userId,
            title: welcomeNotification.title,
            message: welcomeNotification.message,
            time: welcomeNotification.time,
            type: welcomeNotification.type,
          })
          .catch((error) => {
            console.error('Failed to send welcome notification:', error);
          });
      }
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

    try {
      if (isConvexConfigured && convexClient) {
        await convexClient.mutation(api.users.upsertUser, {
          userId: updated.id,
          name: updated.name,
          email: updated.email,
          role: 'lister',
          listerSubtype: subtype,
          joinedAt: updated.joinedAt,
          avatar: updated.avatar,
          savedPropertyIds: updated.savedPropertyIds,
        });
      }

      setCurrentUser(updated);

      setUsers((prev) => {
        const exists = prev.some((u) => u.id === updated.id);

        if (exists) {
          return prev.map((u) =>
            u.id === updated.id ? updated : u
          );
        }

        return [...prev, updated];
      });

      setCurrentView('lister-about');
    } catch (error) {
      console.error('Failed to save lister subtype to Convex:', error);
      throw new Error('Unable to save your lister category. Please try again.');
    }
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
      if (found.role === 'admin') {
        setCurrentView('admin-dashboard');

      } else if (found.role === 'lister') {
        if (!found.listerSubtype) {
          setCurrentView('lister-subtype');
        } else {
          setCurrentView('lister-dashboard');
        }

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
        role: 'unassigned',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        joinedAt: new Date().toISOString(),
        savedPropertyIds: []
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      setCurrentView('role-selection');
    }
  };




  const logoutUser = async () => {
    setIsLoggingOut(true);

    try {
      // Disconnect this browser from push notifications before signing out.
      if ('serviceWorker' in navigator) {
        try {
          const registration =
            await navigator.serviceWorker.getRegistration();

          const subscription =
            await registration?.pushManager.getSubscription();

          if (subscription) {
            const endpoint = subscription.endpoint;

            // Stop this browser receiving further pushes.
            const unsubscribed = await subscription.unsubscribe();

            if (!unsubscribed) {
              console.warn('Browser push subscription could not be removed.');
            }

            // Remove the saved subscription from Convex while signed in.
            if (isConvexConfigured && convexClient) {
              try {
                await Promise.race([
                  convexClient.mutation(
                    api.pushSubscriptions.unregister,
                    { endpoint }
                  ),
                  new Promise<void>((resolve) =>
                    setTimeout(resolve, 2000)
                  ),
                ]);
              } catch (error) {
                console.warn('Push subscription cleanup failed:', error);
              }
            }
          }
        } catch (error) {
          console.warn('Could not clean up phone notifications:', error);
        }
      }

      // Preserve the existing Rentike logout behaviour.
      await signOut();
      setIsBrowsingAsSeeker(false);
      setCurrentUser(null);
      setCurrentView('welcome');

    } catch (error) {
      setIsLoggingOut(false);
      throw error;
    }
  };

  useEffect(() => {
    if (isLoggingOut && isLoaded && !isSignedIn) {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, isLoaded, isSignedIn]);


  const deleteAccount = async () => {
    if (!clerkUser) {
      throw new Error("No signed-in user.");
    }

    if (!isConvexConfigured || !convexClient) {
      throw new Error("MakaoHub database is not available.");
    }

    // First clean/anonymise MakaoHub data and delete the Convex user record.
    await convexClient.mutation(api.users.deleteMyAccount, {});

    // Then permanently delete the Clerk authentication account.
    await clerkUser.delete();
    await signOut();

    // Clear MakaoHub's local signed-in state.
    setCurrentUser(null);
    setCurrentView('welcome');
  };
  const updateCurrentUserName = async (name: string) => {
    if (!currentUser) {
      throw new Error('No signed-in user.');
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new Error('Name cannot be empty.');
    }

    if (isConvexConfigured && convexClient) {
      await convexClient.mutation(api.users.upsertUser, {
        userId: currentUser.id,
        name: trimmedName,
      });
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      name: trimmedName,
    };

    setCurrentUser(updatedUser);

    setUsers((prev) =>
      prev.map((user) =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
  };

  // Mode switching — keep the same signed-in user
  const switchUserMode = (
    targetMode: 'seeker' | 'lister' | 'admin'
  ) => {
    if (!currentUser) return;

    if (targetMode === 'seeker') {
      localStorage.setItem(
        `rentike_active_mode_${currentUser.id}`,
        'seeker'
      );

      setIsBrowsingAsSeeker(true);
      setCurrentView('tenant-home');
      return;
    }



    if (targetMode === 'lister') {
      if (currentUser.role === 'lister') {
        localStorage.setItem(
          `rentike_active_mode_${currentUser.id}`,
          'lister'
        );

        setIsBrowsingAsSeeker(false);
        if (!currentUser.listerSubtype) {
          setCurrentView('lister-subtype');
        } else {
          setCurrentView('lister-dashboard');
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
      type: 'system',
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
      type: 'system',
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
          type: 'system',
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
  const updatePropertyListing = async (
    propertyId: string,
    updatedData: Partial<PropertyListing>
  ) => {
    const imagesArray = Array.isArray(updatedData.images) ? [...updatedData.images] : [];
    const coverPhoto = updatedData.coverPhoto || imagesArray[0] || '';

    // Register updated media in session registry
    registerSubmittedMedia([...imagesArray, coverPhoto, updatedData.video]);
    if (isConvexConfigured && convexClient) {
      const convexUpdate = Object.fromEntries(
        Object.entries({
          id: propertyId,
          name: updatedData.name,
          type: updatedData.type,
          status: updatedData.status,
          monthlyRent: updatedData.monthlyRent,
          deposit: updatedData.deposit,
          serviceCharge: updatedData.serviceCharge,
          agentFee: updatedData.agentFee,
          viewingFee: updatedData.viewingFee,
          waterDeposit: updatedData.waterDeposit,
          electricityDeposit: updatedData.electricityDeposit,
          otherFees: updatedData.otherFees,
          location: updatedData.location,
          vacancies: updatedData.vacancies,
          occupied: updatedData.occupied,
          underRepair: updatedData.underRepair,
          amenities: updatedData.amenities,
          images: imagesArray.length > 0 ? imagesArray : undefined,
          coverPhoto: coverPhoto || undefined,
          video: updatedData.video,
          videoName: updatedData.videoName,
          videoSize: updatedData.videoSize,
          imageStorageIds: updatedData.imageStorageIds,
          coverPhotoStorageId: updatedData.coverPhotoStorageId,
          videoStorageId: updatedData.videoStorageId,
          description: updatedData.description,
          contactPhone: updatedData.lister?.phone,
          timePosted: 'Updated just now',
        }).filter(([, value]) => value !== undefined)
      ) as any;

      await convexClient.mutation(
        api.properties.updateProperty,
        convexUpdate
      );
    }

    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== propertyId) return p;
        return {
          ...p,
          ...updatedData,
          images: imagesArray.length > 0 ? imagesArray : p.images,
          coverPhoto: coverPhoto || p.coverPhoto,
          // Preserve existing status when property is updated
          status: p.status,
          timePosted: 'Updated just now'
        };
      })
    );

    // Notify lister of updated listing status
    const existing = properties.find((p) => p.id === propertyId);
    const isResubmission =
      existing?.status === 'Rejected' && updatedData.status === 'Pending';
    const recipientId = existing?.lister?.id || currentUser?.id || 'demo-lister-001';
    const nowIso = new Date().toISOString();
    const newNotif: UserNotification = {
      id: `notif-${Date.now()}`,
      recipientUserId: recipientId,
      userId: recipientId,
      title: isResubmission
        ? 'Listing Resubmitted for Review'
        : 'Listing Updated',

      message: isResubmission
        ? `"${updatedData.name || existing?.name || 'Your property'}" has been resubmitted to MakaoHub for review and is pending admin approval.`
        : `Changes to "${updatedData.name || existing?.name || 'your property'}" have been saved successfully and are now live.`,
      time: nowIso,
      createdAt: nowIso,
      read: false,
      type: 'approval',
      targetPropertyId: propertyId
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Lister: Delete One Property Listing
  const deletePropertyListing = async (propertyId: string) => {
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
    if (isConvexConfigured && convexClient) {
      try {
        await convexClient.mutation(api.properties.remove, {
          id: propertyId as any,
        });
      } catch (error) {
        console.error('Failed to delete property from Convex:', error);
        return;
      }
    }

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

  const deleteAllMyListings = async () => {
    if (!currentUser || currentUser.role !== 'lister') return;

    const myProps = properties.filter(
      (p) => p.lister?.id === currentUser.id
    );

    if (myProps.length === 0) return;

    if (!isConvexConfigured || !convexClient) {
      console.error('Cannot delete listings: Convex is not connected.');
      window.alert('Unable to connect to the database. Please try again.');
      return;
    }

    const deletedIds = new Set<string>();
    let failedCount = 0;

    // Delete each listing from Convex before removing it from the UI.
    for (const property of myProps) {
      try {
        await convexClient.mutation(api.properties.remove, {
          id: property.id as any,
        });

        deletedIds.add(property.id);
      } catch (error) {
        failedCount += 1;
        console.error(
          `Failed to delete property ${property.id} from Convex:`,
          error
        );
      }
    }

    // Do not remove listings locally if no database deletion succeeded.
    if (deletedIds.size === 0) {
      window.alert('No listings were deleted. Please try again.');
      return;
    }

    const deletedProps = myProps.filter(
      (p) => deletedIds.has(p.id)
    );

    const remaining = properties.filter(
      (p) => !deletedIds.has(p.id)
    );

    // Clean up media belonging only to successfully deleted listings.
    const deletedMedia: (string | undefined | null)[] = [];

    deletedProps.forEach((p) => {
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

    // Update local state only for confirmed database deletions.
    setProperties((prev) =>
      prev.filter((p) => !deletedIds.has(p.id))
    );

    setEnquiries((prev) =>
      prev.filter((e) => !deletedIds.has(e.propertyId))
    );

    if (
      currentUser.savedPropertyIds?.some((id) => deletedIds.has(id))
    ) {
      setCurrentUser({
        ...currentUser,
        savedPropertyIds: currentUser.savedPropertyIds.filter(
          (id) => !deletedIds.has(id)
        ),
      });
    }

    if (failedCount > 0) {
      window.alert(
        `${deletedIds.size} listing(s) deleted. ${failedCount} could not be deleted. Please try again for the remaining listings.`
      );
    }
  };


  // Admin: Approve / Reject / Flag / Archive / Suspend / Reinstate

  const approveProperty = async (propertyId: string) => {
    if (!isConvexConfigured || !convexClient) {
      console.error('Cannot approve listing: Convex is unavailable.');
      window.alert('Unable to approve the listing right now.');
      return;
    }

    try {
      await convexClient.mutation(api.properties.updateStatus, {
        id: propertyId,
        status: 'Approved',
      });
    } catch (error) {
      console.error('Listing approval failed:', error);
      window.alert('Approval failed. Please try again.');
      return;
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

    }
  };


  const rejectProperty = async (propertyId: string, reason?: string) => {
    if (!isConvexConfigured || !convexClient) {
      console.error('Cannot reject listing: Convex is unavailable.');
      window.alert('Unable to reject the listing right now.');
      return;
    }

    try {
      await convexClient.mutation(api.properties.updateStatus, {
        id: propertyId,
        status: 'Rejected',
        rejectionReason: reason || 'Does not meet verification guidelines',
      });
    } catch (error) {
      console.error('Listing rejection failed:', error);
      window.alert('Rejection failed. Please try again.');
      return;
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

    // Update the screen immediately
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: 'dismissed' } : r
      )
    );

    // Save the dismissal permanently in Convex
    if (isConvexConfigured && convexClient) {
      void convexClient
        .mutation(api.reviews.updateReportStatusByAdmin, {
          reportId: reportId as any,
          status: 'dismissed',
        })
        .catch((error) => {
          console.error('Failed to dismiss report in Convex:', error);
        });
    }

    logAdminActivity({
      action: 'investigated',
      title: 'Report Dismissed',
      details: `Dismissed report #${reportId} (${report?.targetTitle || 'Unknown'})`,
      targetId: reportId,
    });
  };
  const removeReviewReport = (reportId: string, reviewId: string) => {
    const report = reports.find((r) => r.id === reportId);

    // Use existing local review deletion logic
    deleteReview(reviewId);

    // Mark the report as investigated immediately
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: 'investigated' } : r
      )
    );

    if (isConvexConfigured && convexClient) {
      void Promise.all([
        convexClient.mutation(api.reviews.deleteReviewByAdmin, {
          reviewId: reviewId as any,
        }),
        convexClient.mutation(api.reviews.updateReportStatusByAdmin, {
          reportId: reportId as any,
          status: 'investigated',
        }),
      ]).catch((error) => {
        console.error('Failed to remove reported review:', error);
      });
    }

    logAdminActivity({
      action: 'investigated',
      title: 'Reported Review Removed',
      details: `Removed reported review from ${report?.targetTitle || 'review'}`,
      targetId: reviewId,
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
    // Persist the review to Convex so every account can see it
    if (isConvexConfigured && convexClient) {
      convexClient
        .mutation(api.reviews.add, {
          propertyId,
          authorId,
          authorName: reviewData.authorName,
          authorAvatar: reviewData.authorAvatar,
          rating: reviewData.rating,
          date: new Date().toISOString(),
          comment: reviewData.comment,
          wouldRecommend: reviewData.wouldRecommend,
        })
        .catch((error) => {
          console.error('Failed to save review to Convex:', error);
        });
    }

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
      const createdNotifications: UserNotification[] = [];

      // 1. STAR RATING NOTIFICATION — only when the seeker actually rated
      if (typeof reviewData.rating === 'number') {
        const starsLabel =
          reviewData.rating === 1 ? '1 star' : `${reviewData.rating} stars`;

        const ratingNotif: UserNotification = {
          id: `notif-rating-${now}`,
          recipientUserId: prop.lister.id,
          userId: prop.lister.id,
          actorUserId: authorId,
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
      }
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
          actorUserId: authorId,
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
      // Persist review notifications to Convex so the lister receives them

      if (isConvexConfigured && convexClient) {
        createdNotifications.forEach((notif) => {
          convexClient
            .mutation(api.notifications.send, {
              recipientUserId: notif.recipientUserId,
              userId: notif.userId,
              actorUserId: notif.actorUserId,
              title: notif.title,
              message: notif.message,
              time: notif.time,
              type: notif.type,
              targetPropertyId: notif.targetPropertyId,
              targetReviewId: notif.targetReviewId,
            })
            .catch((error) => {
              console.error('Failed to send review notification:', error);
            });
        });
      }

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
    if (targetRev.authorId) {
      const notificationTime = new Date().toISOString();

      const replyNotification: UserNotification = {
        id: `notif-review-reply-${Date.now()}`,
        recipientUserId: targetRev.authorId,
        userId: targetRev.authorId,
        title: 'New Review Reply',
        message: `${currentUser.name || 'Property Lister'} replied to your comment on ${prop.name}`,
        time: notificationTime,
        createdAt: notificationTime,
        read: false,
        type: 'review',
        targetPropertyId: prop.id,
        targetReviewId: reviewId,
      };

      setNotifications((prev) => [replyNotification, ...prev]);

      if (isConvexConfigured && convexClient) {
        convexClient
          .mutation(api.notifications.send, {
            recipientUserId: replyNotification.recipientUserId,
            userId: replyNotification.userId,
            title: replyNotification.title,
            message: replyNotification.message,
            time: replyNotification.time,
            type: replyNotification.type,
            targetPropertyId: replyNotification.targetPropertyId,
            targetReviewId: replyNotification.targetReviewId,
          })
          .catch((error) => {
            console.error('Failed to send review reply notification:', error);
          });
      }
    }

    // PASTE HERE — line 2168
    if (isConvexConfigured && convexClient) {
      convexClient
        .mutation(api.reviews.addReply, {
          reviewId: reviewId as any,
          propertyId: prop.id,
          listerId: currentUser.id,
          listerName: currentUser.name || 'Property Lister',
          listerSubtype: currentUser.listerSubtype,
          listerAvatar: currentUser.avatar,
          replyText: replyText.trim(),
          createdAt: new Date().toISOString(),
        })
        .catch((error) => {
          console.error('Failed to save review reply to Convex:', error);
        });
    }

    // Requirement 8: Send Seeker notification
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
    // Save seeker notification to Convex
    if (isConvexConfigured && convexClient) {
      convexClient
        .mutation(api.notifications.send, {
          recipientUserId: seekerId,
          userId: seekerId,
          title: 'Lister Replied to Your Review',
          message: `${currentUser.name || 'Property Lister'} replied to your review of ${prop.name}.`,
          time: nowIso,
          type: 'review',
          targetPropertyId: prop.id,
          targetReviewId: reviewId,
        })
        .catch((error) => {
          console.error('Failed to save reply notification to Convex:', error);
        });
    }
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
    const updatedAt = new Date().toISOString();
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId && r.reply) {
          return {
            ...r,
            reply: {
              ...r.reply,
              replyText: replyText.trim(),
              updatedAt,
            }
          };
        }
        return r;
      })
    );
    // Save edited reply permanently to Convex
    if (isConvexConfigured && convexClient) {
      convexClient
        .mutation(api.reviews.editReply, {
          reviewId: reviewId as any,
          replyText: replyText.trim(),
          updatedAt,
        })
        .catch((error) => {
          console.error('Failed to edit review reply in Convex:', error);
        });
    }
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
  const editReview = (
    reviewId: string,
    rating?: number,
    comment?: string,
    wouldRecommend?: boolean
  ) => {
    const targetReview = reviews.find((r) => r.id === reviewId);
    if (!targetReview) return;

    // Only the person who wrote the review can edit it
    if (!currentUser || targetReview.authorId !== currentUser.id) {
      console.warn('Unauthorized: Only the review author can edit this review.');
      return;
    }

    const updatedAt = new Date().toISOString();
    const cleanedComment = comment?.trim();

    // Update this account immediately
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
            ...r,
            rating,
            comment: cleanedComment,
            wouldRecommend,
            updatedAt,
          }
          : r
      )
    );

    // Save the edited review permanently to Convex
    if (isConvexConfigured && convexClient) {
      convexClient
        .mutation(api.reviews.editReview, {
          reviewId: reviewId as any,
          rating,
          comment: cleanedComment,
          wouldRecommend,
          updatedAt,
        })
        .catch((error) => {
          console.error('Failed to edit review in Convex:', error);
        });
    }
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
  const deleteOwnReview = (reviewId: string) => {
    const targetReview = reviews.find((r) => r.id === reviewId);
    if (!targetReview) return;

    const remainingReviews = reviews.filter((r) => r.id !== reviewId);
    setReviews(remainingReviews);

    if (isConvexConfigured && convexClient) {
      void convexClient
        .mutation(api.reviews.deleteOwnReview, {
          reviewId: reviewId as any,
        })
        .catch((error) => {
          console.error('Failed to delete own review in Convex:', error);
        });
    }
  };
  const reportReview = (
    reviewId: string,
    reason: string = 'Inappropriate review content'
  ) => {
    const targetRev = reviews.find((r) => r.id === reviewId);
    if (!targetRev) return;

    const prop = properties.find((p) => p.id === targetRev.propertyId);
    const cleanReason =
      reason.trim() || 'Inappropriate review content';

    // Update immediately on the lister's screen
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, reported: true } : r
      )
    );

    // Save the report permanently to Convex.
    // The Convex mutation also notifies every admin.
    if (isConvexConfigured && convexClient) {
      void convexClient
        .mutation(api.reviews.reportReview, {
          reviewId: reviewId as any,
          reason: cleanReason,
        })
        .catch((error) => {
          console.error('Failed to report review:', error);
        });
    }

    // Keep the current local admin-report state updated too
    const newReport: PlatformReport = {
      id: `rep-${Date.now()}`,
      type: 'review',
      targetId: reviewId,
      targetTitle: `Review on ${prop?.name || 'Property'}`,
      targetSubtitle: `Author: ${targetRev.authorName}`,
      reason: cleanReason,
      reporterCount: 1,
      status: 'open',
      createdAt: 'Just now',
    };

    setReports((prev) => [newReport, ...prev]);
  };

  // Enquiries
  const sendEnquiry = async (
    propertyId: string,
    seekerName: string,
    seekerPhone: string,
    seekerEmail: string,
    message: string
  ) => {
    const prop = properties.find((p) => p.id === propertyId);
    const seekerId = currentUser?.id || 'demo-seeker-001';
    const listerId = prop?.lister?.id || 'demo-lister-001';
    let enquiryId = `enq-${Date.now()}`;
    const nowStr = new Date().toISOString();
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
    if (isConvexConfigured && convexClient) {
      try {
        enquiryId = await convexClient.mutation(api.enquiries.create, {
          propertyId,
          propertyName: prop?.name || 'Property',
          seekerId,
          seekerName,
          seekerPhone,
          seekerEmail: seekerEmail || undefined,
          seekerAvatar: currentUser?.avatar || undefined,
          listerId,
          message: cleanMsg,
          date: nowStr,
          createdAt: nowStr,
          status: 'New',
        });
      } catch (error) {
        console.error('Failed to save enquiry to Convex:', error);
        throw error;
      }
    }
    newEnq.id = enquiryId;
    initialMsg.enquiryId = enquiryId;
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
      if (isConvexConfigured && convexClient) {
        try {
          await convexClient.mutation(api.notifications.send, {
            recipientUserId: newNotif.recipientUserId,
            userId: newNotif.userId,
            title: newNotif.title,
            message: newNotif.message,
            time: newNotif.time,
            type: newNotif.type,
            targetPropertyId: newNotif.targetPropertyId,
            targetEnquiryId: newNotif.targetEnquiryId,
          });
        } catch (error) {
          console.error('Failed to send enquiry notification to Convex:', error);
        }
      }
    }
    return enquiryId;
  };

  const sendEnquiryReply = async (enquiryId: string, replyText: string) => {
    if (!replyText.trim()) return;
    const enq = enquiries.find((e) => e.id === enquiryId);
    if (!enq) return;
    const prop = properties.find((p) => p.id === enq.propertyId);

    const isLister = currentUser?.role === 'lister' || (currentUser && currentUser.id === enq.listerId);
    const senderId = currentUser?.id || (isLister ? enq.listerId : enq.seekerId);
    const senderName = currentUser?.name || (isLister ? (prop?.lister?.name || 'Mary Wanjiku') : enq.seekerName);
    const senderRole: 'seeker' | 'lister' = isLister ? 'lister' : 'seeker';
    const senderAvatar = currentUser?.avatar || (isLister ? (prop?.lister?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80') : enq.seekerAvatar);

    const nowStr = new Date().toISOString();
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
    if (isConvexConfigured && convexClient) {
      try {
        await convexClient.mutation(api.enquiries.sendMessage, {
          enquiryId: enquiryId as any,
          senderId,
          senderName,
          senderRole,
          senderAvatar: senderAvatar || undefined,
          message: replyText.trim(),
          createdAt: nowStr,
        });
      } catch (error) {
        console.error('Failed to save enquiry reply to Convex:', error);
        throw error;
      }
    }
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
      if (isConvexConfigured && convexClient) {
        try {
          await convexClient.mutation(api.notifications.send, {
            recipientUserId: seekerNotif.recipientUserId,
            userId: seekerNotif.userId,
            title: seekerNotif.title,
            message: seekerNotif.message,
            time: seekerNotif.time,
            type: seekerNotif.type,
            targetPropertyId: seekerNotif.targetPropertyId,
            targetEnquiryId: seekerNotif.targetEnquiryId,
            targetMessageId: seekerNotif.targetMessageId,
          });
        } catch (error) {
          console.error('Failed to send reply notification to seeker:', error);
        }
      }
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
      if (isConvexConfigured && convexClient) {
        try {
          await convexClient.mutation(api.notifications.send, {
            recipientUserId: listerNotif.recipientUserId,
            userId: listerNotif.userId,
            title: listerNotif.title,
            message: listerNotif.message,
            time: listerNotif.time,
            type: listerNotif.type,
            targetPropertyId: listerNotif.targetPropertyId,
            targetEnquiryId: listerNotif.targetEnquiryId,
            targetMessageId: listerNotif.targetMessageId,
          });
        } catch (error) {
          console.error('Failed to send reply notification to lister:', error);
        }
      }
    }
  };

  const markEnquiryAsRead = async (enquiryId: string) => {
    const isLister = currentUser?.role === 'lister';

    if (isConvexConfigured && convexClient) {
      try {
        await convexClient.mutation(api.enquiries.markAsRead, {
          enquiryId: enquiryId as any,
        });
      } catch (error) {
        console.error('Failed to mark enquiry as read in Convex:', error);
        return;
      }
    }

    setEnquiries((prev) =>
      prev.map((e) => {
        if (e.id !== enquiryId) return e;

        return {
          ...e,
          readByLister: isLister ? true : e.readByLister,
          readBySeeker: !isLister ? true : e.readBySeeker,
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
        selectedListerId,
        setSelectedListerId,
        targetReviewId,
        setTargetReviewId,
        targetEnquiryId,
        setTargetEnquiryId,
        messageTab,
        setMessageTab,
        desktopSidebarExpanded,
        setDesktopSidebarExpanded,
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
        isLoggingOut,
        deleteAccount,
        updateCurrentUserName,
        properties,
        availableProperties,
        filteredProperties,
        isPropertiesLoading,
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
        removeReviewReport,
        hideListingReport,
        suspendUserReport,
        reviews,
        listerReviews,
        getPropertyReviews,
        addReview,
        editReview,
        addReviewReply,
        editReviewReply,
        deleteReviewReply,
        deleteReview,
        deleteOwnReview,
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
