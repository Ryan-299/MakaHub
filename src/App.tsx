import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useUser } from '@clerk/react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileNavbar } from './components/MobileNavbar';
import { Footer } from './components/Footer';
import { FilterDrawer } from './components/FilterDrawer';
import { SplashScreen } from './components/SplashScreen';
import { OfflineScreen } from './components/OfflineScreen';
import { SsoCallback } from './components/SsoCallback';
import {
  SignInPrompt,
  openSignInPrompt,
  isPublicView,
  signInReasonFor,
} from './components/SignInPrompt';
import { EnableNotificationsCard } from './components/EnableNotificationsCard';
// Views
import { WelcomeView } from './views/WelcomeView';
import { SignupView } from './views/SignupView';
import { LoginView } from './views/LoginView';
import { RoleSelectionView } from './views/RoleSelectionView';
import { ListerSubtypeView } from './views/ListerSubtypeView';
import { ListerAboutView } from './views/ListerAboutView';
import { ListerPhoneView } from './views/ListerPhoneView';
import { TenantHomeView } from './views/TenantHomeView';
import { MapExploreView } from './views/MapExploreView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { PublicListerProfileView } from './views/PublicListerProfileView';
import { SavedPropertiesView } from './views/SavedPropertiesView';
import { UserProfileView } from './views/UserProfileView';
import { MyProfileView } from './views/MyProfileView';
import { ListerDashboardView } from './views/ListerDashboardView';
import { MyListingsView } from './views/MyListingsView';
import { AddPropertyView } from './views/AddPropertyView';
import { ListerEnquiriesView } from './views/ListerEnquiriesView';
import { SeekerEnquiriesView } from './views/SeekerEnquiriesView';
import { ListerReviewsView } from './views/ListerReviewsView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { NotificationsView } from './views/NotificationsView';

// FIX: a visible loading screen used wherever the app used to show a plain
// blank (black) screen, so "waiting" can be told apart from "crashed".
const LoadingScreen = ({
  theme,
  message,
}: {
  theme: string;
  message?: string;
}) => (
  <div
    className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-4"
    style={{
      backgroundColor: theme === 'dark' ? '#000000' : '#F7F5F1',
      color: theme === 'dark' ? '#F7F5F1' : '#111111',
    }}
  >
    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#C49A6C]/25 border-t-[#C49A6C]" />
    {message && <p className="text-sm">{message}</p>}
  </div>
);

export default function App() {
  const { isLoaded, isSignedIn } = useUser();
  const isClerkHandshake =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('__clerk_handshake');
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [startupStage, setStartupStage] = useState<0 | 1 | 2>(0);
  const [hasConnectionTrouble, setHasConnectionTrouble] = useState(false);
  const [startupFailed, setStartupFailed] = useState(false);
  const [minimumSplashDone, setMinimumSplashDone] = useState(() => {
    return sessionStorage.getItem('rentike-splash-shown') === 'true';
  });

  const startupWasOffline = useRef(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const clerkHasLoadedOnce = useRef(false);
  const splashWasAlreadyShownOnMount = useRef(
    sessionStorage.getItem('rentike-splash-shown') === 'true'
  );
  useEffect(() => {
    if (isLoaded) {
      clerkHasLoadedOnce.current = true;
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setStartupStage(0);
      return;
    }

    setStartupStage(0);

    const checkingTimer = window.setTimeout(() => {
      setStartupStage(1);
    }, 2000);

    const slowTimer = window.setTimeout(() => {
      setStartupStage(2);
    }, 5000);

    return () => {
      window.clearTimeout(checkingTimer);
      window.clearTimeout(slowTimer);
    };
  }, [isLoaded]);
  useEffect(() => {
    const minimumSplashTimer = window.setTimeout(() => {
      sessionStorage.setItem('rentike-splash-shown', 'true');
      setMinimumSplashDone(true);
    }, 2000);

    return () => {
      window.clearTimeout(minimumSplashTimer);
    };
  }, []);
  useEffect(() => {
    if (isLoaded) {
      setStartupFailed(false);
      return;
    }

    const failureTimer = window.setTimeout(() => {
      if (navigator.onLine && !hasConnectionTrouble) {
        setStartupFailed(true);
      }
    }, 20000);
    return () => {
      window.clearTimeout(failureTimer);
    };
  }, [isLoaded, hasConnectionTrouble]);
  useEffect(() => {
    const handleStartupOffline = () => {
      if (!isLoaded) {
        startupWasOffline.current = true;
      }
    };

    const handleStartupRecovery = () => {
      if (!isLoaded && startupWasOffline.current) {
        window.location.reload();
      }
    };

    window.addEventListener('offline', handleStartupOffline);
    window.addEventListener('online', handleStartupRecovery);

    return () => {
      window.removeEventListener('offline', handleStartupOffline);
      window.removeEventListener('online', handleStartupRecovery);
    };
  }, [isLoaded]);
  useEffect(() => {
    let cancelled = false;

    const checkConnection = async () => {
      if (!navigator.onLine) {
        if (!cancelled) {
          setIsOnline(false);
          setHasConnectionTrouble(false);
        }
        return;
      }

      const controller = new AbortController();

      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, 8000);

      try {
        await fetch(
          `https://www.gstatic.com/generate_204?rentike=${Date.now()}`,
          {
            mode: 'no-cors',
            cache: 'no-store',
            signal: controller.signal,
          }
        );

        window.clearTimeout(timeoutId);

        if (!cancelled) {
          setIsOnline(true);
          setHasConnectionTrouble(false);
        }
      } catch {
        window.clearTimeout(timeoutId);

        if (!cancelled) {
          if (!navigator.onLine) {
            setIsOnline(false);
            setHasConnectionTrouble(false);
          } else {
            setIsOnline(true);
            setHasConnectionTrouble(true);
          }
        }
      }
    };

    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasConnectionTrouble(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    checkConnection();

    const interval = window.setInterval(checkConnection, 5000);

    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(interval);
    };
  }, []);
  const {
    currentView,
    currentUser,
    isLoggingOut,
    setCurrentView,
    setTargetEnquiryId,
    listerEnquiries,
    seekerEnquiries,
    isListerMode,
    switchUserMode,
    filterDrawerOpen,
    setFilterDrawerOpen,
    showSplashScreen,
    setShowSplashScreen,
    resolvedTheme,
    desktopSidebarExpanded,
    runAdminDemo,
    setAdminActiveTab
  } = useApp();
  // Listen for private admin route triggers (e.g. #admin, /admin, ?view=admin)
  useEffect(() => {
    const handleUrlRoute = () => {
      if (typeof window === 'undefined') return;
      // FIX: this used to "return <AuthenticateWithRedirectCallback />" from
      // inside an event handler, which does nothing. The SSO callback page is
      // handled further down, after all hooks have run.
      if (window.location.pathname === '/sso-callback') {
        return;
      }
      const hash = window.location.hash;
      const search = window.location.search;
      const pathname = window.location.pathname;

      const isAdminTrigger =
        hash === '#admin' ||
        hash === '#/admin' ||
        hash.startsWith('#admin') ||
        hash.startsWith('#/admin') ||
        pathname === '/admin' ||
        pathname.startsWith('/admin') ||
        search.includes('view=admin') ||
        search.includes('role=admin');

      if (isAdminTrigger) {
        if (!isSignedIn) {
          setShowSplashScreen(false);
          setCurrentView('login');
          return;
        }

        if (!currentUser) return;

        if (currentUser.role !== 'admin') {
          window.history.replaceState({}, '', '/');
          setCurrentView(
            currentUser.role === 'lister' ? 'lister-dashboard' : 'tenant-home'
          );
          return;
        }

        setShowSplashScreen(false);
        setCurrentView('admin-dashboard');

        // Optional subtab routing if specified in hash or search query
        if (hash.includes('pending') || search.includes('tab=pending') || pathname.includes('pending')) {
          setAdminActiveTab?.('pending-properties');
        } else if (hash.includes('users') || search.includes('tab=users') || pathname.includes('users')) {
          setAdminActiveTab?.('users');
        } else if (hash.includes('reports') || search.includes('tab=reports') || pathname.includes('reports')) {
          setAdminActiveTab?.('reports');
        } else if (hash.includes('locations') || search.includes('tab=locations') || pathname.includes('locations')) {
          setAdminActiveTab?.('locations');
        } else if (hash.includes('activity') || search.includes('tab=activity') || pathname.includes('activity')) {
          setAdminActiveTab?.('activity');
        } else if (hash.includes('settings') || search.includes('tab=settings') || pathname.includes('settings')) {
          setAdminActiveTab?.('settings');
        } else if (hash.includes('all') || search.includes('tab=all') || pathname.includes('all')) {
          setAdminActiveTab?.('all-properties');
        }
      }
      else if (pathname === '/' && currentView.startsWith('admin-')) {
        setCurrentView('tenant-home');
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, [
    runAdminDemo,
    setAdminActiveTab,
    setShowSplashScreen,
    currentView,
    setCurrentView,
    isSignedIn,
    currentUser,
  ]);


  // Open the right enquiry when a phone notification is tapped.
  const [pendingEnquiryId, setPendingEnquiryId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;

    const fromLink = new URLSearchParams(window.location.search).get('enquiryId');

    if (fromLink) {
      try {
        sessionStorage.setItem('rentike_pending_enquiry', fromLink);
      } catch {
        // Keep the enquiry in memory if storage is unavailable.
      }
      return fromLink;
    }

    try {
      return sessionStorage.getItem('rentike_pending_enquiry');
    } catch {
      return null;
    }
  });

  // Start counting only after authentication is ready.
  const pendingSinceRef = useRef<number | null>(null);
  const [pendingRecheck, setPendingRecheck] = useState(0);

  // Remove the enquiry parameter without reloading Rentike.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('enquiryId')) return;

    params.delete('enquiryId');
    const remainingQuery = params.toString();

    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${remainingQuery ? `?${remainingQuery}` : ''}${window.location.hash}`
    );
  }, []);

  // Receive notification taps when Rentike is already open.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleWorkerMessage = (event: MessageEvent) => {
      const data = event.data as { type?: unknown; url?: unknown } | null;

      if (!data || data.type !== 'rentike-open' || typeof data.url !== 'string') {
        return;
      }

      try {
        const target = new URL(data.url, window.location.origin);
        if (target.origin !== window.location.origin) return;

        const enquiryId = target.searchParams.get('enquiryId');
        if (!enquiryId) return;

        try {
          sessionStorage.setItem('rentike_pending_enquiry', enquiryId);
        } catch {
          // Keep the enquiry in memory.
        }

        pendingSinceRef.current = null;
        setPendingEnquiryId(enquiryId);
      } catch {
        // Ignore invalid notification links.
      }
    };

    navigator.serviceWorker.addEventListener('message', handleWorkerMessage);
    navigator.serviceWorker.startMessages?.();

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleWorkerMessage);
    };
  }, []);

  // Open the conversation after the user and inboxes are available.
  useEffect(() => {
    if (!pendingEnquiryId) return;

    const finish = () => {
      try {
        sessionStorage.removeItem('rentike_pending_enquiry');
      } catch {
        // Nothing to clean up.
      }

      pendingSinceRef.current = null;
      setPendingEnquiryId(null);
    };

    // Preserve the destination while signed out.
    if (isSignedIn === false) {
      setShowSplashScreen(false);
      setCurrentView('login');
      return;
    }

    // Wait for authentication and the Rentike user profile.
    if (isSignedIn !== true || !currentUser) return;

    if (currentUser.role !== 'lister' && currentUser.role !== 'seeker') {
      finish();
      return;
    }

    // Find which inbox actually owns this conversation.
    const inListerInbox =
      currentUser.role === 'lister' &&
      listerEnquiries.some((enquiry) => enquiry.id === pendingEnquiryId);

    const inSeekerInbox = seekerEnquiries.some(
      (enquiry) => enquiry.id === pendingEnquiryId
    );

    if (!inListerInbox && !inSeekerInbox) {
      // Begin the timeout only after the account is ready.
      if (pendingSinceRef.current === null) {
        pendingSinceRef.current = Date.now();
      }

      const waited = Date.now() - pendingSinceRef.current;

      if (waited < 15000) {
        const timer = window.setTimeout(
          () => setPendingRecheck((count) => count + 1),
          1000
        );

        return () => window.clearTimeout(timer);
      }

      // Conversation unavailable: open the user's current inbox.
      setShowSplashScreen(false);
      setCurrentView(isListerMode ? 'lister-enquiries' : 'seeker-enquiries');
      finish();
      return;
    }

    setShowSplashScreen(false);

    if (inListerInbox) {
      if (!isListerMode) switchUserMode('lister');

      setTargetEnquiryId(pendingEnquiryId);
      setCurrentView('lister-enquiries');
    } else {
      if (isListerMode) switchUserMode('seeker');

      setTargetEnquiryId(pendingEnquiryId);
      setCurrentView('seeker-enquiries');
    }

    finish();
  }, [
    pendingEnquiryId,
    pendingRecheck,
    isSignedIn,
    currentUser,
    listerEnquiries,
    seekerEnquiries,
    isListerMode,
    switchUserMode,
    setTargetEnquiryId,
    setCurrentView,
    setShowSplashScreen,
  ]);
  // Scroll to top on view changes
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      const scrollableElements = document.querySelectorAll(
        'main, #root, #root > div, .overflow-y-auto, .overflow-auto'
      );
      scrollableElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.scrollTop = 0;
        }
      });
    };

    scrollToTop();
    const frameId = requestAnimationFrame(scrollToTop);
    const timerId = setTimeout(scrollToTop, 50);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timerId);
    };
  }, [currentView]);

  // Update the browser tab title whenever the active view changes.
  // FIX: moved ABOVE the /sso-callback early return. Hooks must always run
  // in the same order on every render, otherwise React crashes the whole
  // app (blank screen, no visible error).
  useEffect(() => {
    const pageTitles: Record<string, string> = {
      // Authentication
      'welcome': 'Welcome',
      'signup': 'Sign Up',
      'login': 'Sign In',
      'role-selection': 'Choose Your Role',
      'lister-subtype': 'Lister Setup',
      'lister-phone': 'Phone Verification',

      // Seeker
      'tenant-home': 'Home',
      'map-explore': 'Explore Map',
      'property-detail': 'Property Details',
      'public-lister-profile': 'Lister Profile',
      'saved': 'Saved Properties',
      'profile': 'My Profile',
      'seeker-enquiries': 'Messages',
      'my-enquiries': 'Messages',

      // Lister
      'my-profile': 'My Profile',
      'lister-dashboard': 'Dashboard',
      'my-listings': 'My Listings',
      'add-property': 'Add New Listing',
      'lister-enquiries': 'Enquiries',
      'lister-reviews': 'Reviews',

      // Shared
      'notifications': 'Notifications',

      // Administration
      'admin-dashboard': 'Admin Dashboard',
      'admin-properties': 'Admin Properties',
      'admin-pending': 'Pending Listings',
      'admin-users': 'Manage Users',
      'admin-reports': 'Reports',
      'admin-reviews': 'Manage Reviews',
      'admin-locations': 'Manage Locations',
      'admin-settings': 'Admin Settings',
      'admin-activity': 'Admin Activity',
    };

    const pageName = pageTitles[currentView] || 'Home';
    document.title = pageName === 'Home'
      ? 'Rentike 254 | Houses, Bedsitters & Apartments for Rent in Kenya'
      : `${pageName} — Rentike`;
  }, [currentView]);

  // FIX: also moved above the early return (useCallback is a hook too).
  const handleSplashComplete = useCallback(() => {
    setShowSplashScreen(false);
  }, [setShowSplashScreen]);

  // Allow unsigned-in visitors to browse Rentike.
  const isSignedOut = isLoaded && !isSignedIn;
  const lastPublicViewRef = useRef<typeof currentView>('tenant-home');

  // Open Home instead of Welcome for unsigned-in visitors.
  useEffect(() => {
    if (
      isSignedOut &&
      !isClerkHandshake &&
      currentView === 'welcome'
    ) {
      setCurrentView('tenant-home');
    }
  }, [isSignedOut, isClerkHandshake, currentView, setCurrentView]);

  // Personal screens require authentication.
  useEffect(() => {
    if (isPublicView(currentView)) {
      if (!['welcome', 'login', 'signup'].includes(currentView)) {
        lastPublicViewRef.current = currentView;
      }
      return;
    }

    if (
      isSignedOut &&
      !isClerkHandshake &&
      ![
        'login',
        'signup',
        'role-selection',
        'lister-subtype',
        'lister-about',
        'lister-phone',
      ].includes(currentView)
    ) {

      openSignInPrompt(signInReasonFor(currentView));
      setCurrentView(lastPublicViewRef.current);
    }
  }, [isSignedOut, isClerkHandshake, currentView, setCurrentView]);

  // Authentication and onboarding screens shown inside the popup.
  const authModalViews = [
    'login',
    'signup',
    'role-selection',
    'lister-subtype',
    'lister-about',
    'lister-phone',
  ];

  const isAuthModalView = authModalViews.includes(currentView);

  // Keep the browsing page behind the authentication popup.
  const viewToShow =
    isAuthModalView ||
      (isSignedOut && !isPublicView(currentView))
      ? lastPublicViewRef.current
      : currentView;

  // ---- All hooks are above this line. Early returns are only safe below. ----

  if (
    typeof window !== 'undefined' &&
    window.location.pathname === '/sso-callback'
  ) {
    return <SsoCallback />;
  }

  const renderView = (view: typeof currentView = viewToShow) => {
    switch (view) {
      case 'welcome':
        return <WelcomeView />;
      case 'signup':
        return <SignupView />;
      case 'login':
        return <LoginView />;
      case 'role-selection':
        return <RoleSelectionView />;

      case 'lister-subtype':
        return <ListerSubtypeView />;
      case 'lister-about':
        return <ListerAboutView />;
      case 'lister-phone':
        return <ListerPhoneView />;

      case 'tenant-home':
        return <TenantHomeView />;
      case 'map-explore':
        return <MapExploreView />;
      case 'property-detail':
        return <PropertyDetailView />;
      case 'public-lister-profile':
        return <PublicListerProfileView />;
      case 'saved':
        return <SavedPropertiesView />;
      case 'profile':
        return <UserProfileView />;

      case 'my-profile':
        return <MyProfileView />;
      case 'lister-dashboard':
        return <ListerDashboardView />;
      case 'my-listings':
        return <MyListingsView />;
      case 'add-property':
        return <AddPropertyView />;
      case 'notifications':
        return <NotificationsView />;
      case 'lister-enquiries':
        return <ListerEnquiriesView />;
      case 'seeker-enquiries':
      case 'my-enquiries':
        return <SeekerEnquiriesView />;
      case 'lister-reviews':
        return <ListerReviewsView />;
      case 'admin-dashboard':
      case 'admin-properties':
      case 'admin-pending':
      case 'admin-users':
      case 'admin-reports':
      case 'admin-reviews':
      case 'admin-locations':
      case 'admin-settings':
      case 'admin-activity':
        return <AdminDashboardView />;
      default:
        return <TenantHomeView />;
    }
  };

  if (!isOnline && showSplashScreen) {
    return (
      <>
        <SplashScreen
          isOpen={true}
          theme={resolvedTheme}
          durationMs={1500}
          onComplete={handleSplashComplete}
        />

        <div
          className="fixed z-[100000] left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ top: '67%' }}
        >
          <div
            className="w-7 h-7 rounded-full animate-spin"
            style={{
              border: '2px solid rgba(196, 154, 108, 0.22)',
              borderTopColor: '#C49A6C',
              borderRightColor: '#C49A6C',
            }}
          />

          <p
            style={{
              marginTop: '10px',
              fontSize: '0.55rem',
              letterSpacing: '0.22em',
              fontWeight: 500,
              color: '#C49A6C',
            }}
          >
            CHECKING CONNECTION
          </p>
        </div>
      </>
    );
  }

  if (!isOnline) {
    if (hasConnectionTrouble) {
      return (
        <div
          className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center px-6 text-center"
          style={{
            backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#F7F5F1',
          }}
        >
          <div
            className="w-8 h-8 rounded-full animate-spin"
            style={{
              border: '2px solid rgba(196, 154, 108, 0.22)',
              borderTopColor: '#C49A6C',
              borderRightColor: '#C49A6C',
            }}
          />

          <h1
            className="mt-7 font-semibold"
            style={{
              fontSize: '1.15rem',
              letterSpacing: '0.12em',
              color: resolvedTheme === 'dark' ? '#FFFFFF' : '#111111',
            }}
          >
            HAVING TROUBLE CONNECTING
          </h1>

          <p
            className="mt-3 max-w-[280px]"
            style={{
              fontSize: '0.72rem',
              lineHeight: 1.7,
              color: resolvedTheme === 'dark' ? '#A3A3A3' : '#666666',
            }}
          >
            Please check your internet connection.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-7 px-7 py-3 rounded-full"
            style={{
              backgroundColor: '#C49A6C',
              color: '#000000',
              fontSize: '0.65rem',
              letterSpacing: '0.16em',
              fontWeight: 600,
            }}
          >
            TRY AGAIN
          </button>
        </div>
      );
    }
    return (
      <OfflineScreen
        theme={resolvedTheme}
        onRetry={() => {
          if (navigator.onLine) {
            window.location.reload();
          }
        }}
      />
    );
  }
  if (startupFailed) {
    return (
      <div
        className="fixed inset-0 z-[99999] w-screen h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{
          backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#F7F5F1',
        }}
      >
        <h1
          className="font-semibold"
          style={{
            fontSize: '1.15rem',
            letterSpacing: '0.12em',
            color: resolvedTheme === 'dark' ? '#FFFFFF' : '#111111',
          }}
        >
          SOMETHING WENT WRONG
        </h1>

        <p
          className="mt-3 max-w-[280px]"
          style={{
            fontSize: '0.72rem',
            lineHeight: 1.7,
            color: resolvedTheme === 'dark' ? '#A3A3A3' : '#666666',
          }}
        >
          Rentike couldn&apos;t start properly.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-7 px-7 py-3 rounded-full"
          style={{
            backgroundColor: '#C49A6C',
            color: '#000000',
            fontSize: '0.65rem',
            letterSpacing: '0.16em',
            fontWeight: 600,
          }}
        >
          TRY AGAIN
        </button>
      </div>
    );
  }
  if (
    (!isLoaded &&
      !clerkHasLoadedOnce.current &&
      !splashWasAlreadyShownOnMount.current) ||
    !minimumSplashDone
  ) {
    return (
      <>
        <SplashScreen
          isOpen={true}
          theme={resolvedTheme}
          durationMs={60000}
          onComplete={() => { }}
        />

        {startupStage > 0 && (
          <div
            className="fixed z-[100000] left-1/2 -translate-x-1/2 flex flex-col items-center"
            style={{ top: '67%' }}
          >
            <div
              className="w-7 h-7 rounded-full animate-spin"
              style={{
                border: '2px solid rgba(196, 154, 108, 0.22)',
                borderTopColor: '#C49A6C',
                borderRightColor: '#C49A6C',
              }}
            />

            <p
              style={{
                marginTop: '10px',
                fontSize: '0.55rem',
                letterSpacing: '0.22em',
                fontWeight: 500,
                color: '#C49A6C',
              }}
            >
              {startupStage === 1
                ? 'CHECKING CONNECTION'
                : 'TAKING LONGER THAN USUAL'}
            </p>
          </div>
        )}
      </>
    );
  }

  // FIX: these two used to return an EMPTY black/white div with nothing on
  // it. Now they show a spinner with a short label, so if the phone gets
  // stuck here we know exactly which step it's stuck on.
  if (isClerkHandshake) {
    return <LoadingScreen theme={resolvedTheme} message="Signing you in..." />;
  }

  if (isSignedIn && currentView === 'welcome') {
    return (
      <LoadingScreen theme={resolvedTheme} message="Loading your account..." />
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-neutral-900 dark:text-neutral-100 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 transition-colors duration-200">

      {/* Main Top Header - hidden on Auth pages */}
      {!['welcome', 'signup', 'login', 'role-selection', 'lister-subtype', 'lister-about'].includes(viewToShow) && <Navbar />}

      {/* Slide-over Filter Drawer for Kenyan Hierarchy */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />

      {/* Main Dynamic View Screen */}
      <div
        className={`flex-1 w-full min-w-0 transition-[padding] duration-300 ${['welcome', 'login', 'signup', 'role-selection', 'lister-subtype', 'lister-about'].includes(viewToShow)
          ? ''
          : desktopSidebarExpanded ? 'md:pl-72' : 'md:pl-28'
          }`}
      >
        {(isLoggingOut || !isLoaded) ? (
          <LoadingScreen
            theme={resolvedTheme}
            message={isLoggingOut ? 'Logging out...' : undefined}
          />
        ) : (
          renderView()
        )}
      </div>

      {!currentView.startsWith('admin-') && <MobileNavbar />}
      <SignInPrompt />
      <EnableNotificationsCard />

      {isAuthModalView && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[700px]">


            <div className="max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-[28px] border border-[#C49A6C]/60 shadow-2xl [&>main]:!min-h-0">
              {renderView(currentView)}
            </div>
          </div>
        </div>
      )}


      {/* Footer with sidebar-aware spacing */}
      {![
        'welcome',
        'signup',
        'login',
        'role-selection',
        'lister-subtype',
        'lister-about'
      ].includes(viewToShow) && (
          <div
            className={`w-full min-w-0 transition-[padding] duration-300 ${['welcome', 'login', 'signup', 'role-selection', 'lister-subtype'].includes(viewToShow)
              ? ''
              : desktopSidebarExpanded ? 'md:pl-72' : 'md:pl-28'
              }`}
          >
            <Footer />
          </div>
        )}

    </div>
  );
}
