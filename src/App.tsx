import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useUser, AuthenticateWithRedirectCallback } from '@clerk/react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileNavbar } from './components/MobileNavbar';
import { Footer } from './components/Footer';
import { FilterDrawer } from './components/FilterDrawer';
import { SplashScreen } from './components/SplashScreen';
import { OfflineScreen } from './components/OfflineScreen';
import { SsoCallback } from './components/SsoCallback';
// Views
import { WelcomeView } from './views/WelcomeView';
import { SignupView } from './views/SignupView';
import { LoginView } from './views/LoginView';
import { RoleSelectionView } from './views/RoleSelectionView';
import { ListerSubtypeView } from './views/ListerSubtypeView';
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
    }, 3200);
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
    setCurrentView,
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
      if (
        typeof window !== 'undefined' &&
        window.location.pathname === '/sso-callback'
      ) {
        return <AuthenticateWithRedirectCallback />;
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

  if (
    typeof window !== 'undefined' &&
    window.location.pathname === '/sso-callback'
  ) {
    return <SsoCallback />;
  }
  // Update the browser tab title whenever the active view changes.
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
    document.title = `${pageName} — Rentike`;
  }, [currentView]);
  const renderView = () => {
    switch (currentView) {
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

  const handleSplashComplete = useCallback(() => {
    setShowSplashScreen(false);
  }, [setShowSplashScreen]);
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
  if (isClerkHandshake) {
    return (
      <div
        className="min-h-[100dvh] w-full"
        style={{
          backgroundColor:
            resolvedTheme === 'dark' ? '#000000' : '#F7F5F1',
        }}
      />
    );
  }

  if (isSignedIn && currentView === 'welcome') {
    return (
      <div
        className="min-h-screen w-full"
        style={{
          backgroundColor: resolvedTheme === 'dark' ? '#000000' : '#FFFFFF',
        }}
      />
    );
  }
  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-neutral-900 dark:text-neutral-100 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 transition-colors duration-200">



      {/* Main Top Header - hidden on Auth pages */}
      {!['welcome', 'signup', 'login', 'role-selection', 'lister-subtype'].includes(currentView) && <Navbar />}

      {/* Slide-over Filter Drawer for Kenyan Hierarchy */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />

      {/* Main Dynamic View Screen */}

      <div
        className={`flex-1 w-full min-w-0 transition-[padding] duration-300 ${desktopSidebarExpanded ? 'md:pl-72' : 'md:pl-28'
          }`}
      >
        {renderView()}
      </div>


      <MobileNavbar />

      {/* Footer with sidebar-aware spacing */}
      {![
        'welcome',
        'signup',
        'login',
        'role-selection',
        'lister-subtype'
      ].includes(currentView) && (
          <div
            className={`w-full min-w-0 transition-[padding] duration-300 ${desktopSidebarExpanded ? 'md:pl-72' : 'md:pl-28'
              }`}
          >
            <Footer />
          </div>
        )}

    </div>
  );
}
