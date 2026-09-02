import React, { useEffect, useCallback } from 'react';
import { useUser } from '@clerk/react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FilterDrawer } from './components/FilterDrawer';
import { SplashScreen } from './components/SplashScreen';

// Views
import { WelcomeView } from './views/WelcomeView';
import { SignupView } from './views/SignupView';
import { LoginView } from './views/LoginView';
import { RoleSelectionView } from './views/RoleSelectionView';
import { ListerSubtypeView } from './views/ListerSubtypeView';
import { TenantHomeView } from './views/TenantHomeView';
import { MapExploreView } from './views/MapExploreView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { SavedPropertiesView } from './views/SavedPropertiesView';
import { UserProfileView } from './views/UserProfileView';
import { ListerDashboardView } from './views/ListerDashboardView';
import { MyListingsView } from './views/MyListingsView';
import { AddPropertyView } from './views/AddPropertyView';
import { ListerEnquiriesView } from './views/ListerEnquiriesView';
import { SeekerEnquiriesView } from './views/SeekerEnquiriesView';
import { ListerReviewsView } from './views/ListerReviewsView';
import { AdminDashboardView } from './views/AdminDashboardView';

export default function App() {
  const { isLoaded, isSignedIn } = useUser();
  const {
    currentView,
    filterDrawerOpen,
    setFilterDrawerOpen,
    showSplashScreen,
    setShowSplashScreen,
    resolvedTheme,
    runAdminDemo,
    setAdminActiveTab
  } = useApp();

  // Listen for private admin route triggers (e.g. #admin, /admin, ?view=admin)
  useEffect(() => {
    const handleUrlRoute = () => {
      if (typeof window === 'undefined') return;
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
        setShowSplashScreen(false);
        runAdminDemo();

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
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    window.addEventListener('popstate', handleUrlRoute);
    return () => {
      window.removeEventListener('hashchange', handleUrlRoute);
      window.removeEventListener('popstate', handleUrlRoute);
    };
  }, [runAdminDemo, setAdminActiveTab, setShowSplashScreen]);

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
      case 'tenant-home':
        return <TenantHomeView />;
      case 'map-explore':
        return <MapExploreView />;
      case 'property-detail':
        return <PropertyDetailView />;
      case 'saved':
        return <SavedPropertiesView />;
      case 'profile':
        return <UserProfileView />;
      case 'lister-dashboard':
        return <ListerDashboardView />;
      case 'my-listings':
        return <MyListingsView />;
      case 'add-property':
        return <AddPropertyView />;
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
  if (!isLoaded || (isSignedIn && currentView === 'welcome')) {
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-black font-sans antialiased text-neutral-900 dark:text-neutral-100 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 transition-colors duration-200">
      {/* Theme-Aware Opening Splash Screen */}
      <SplashScreen

        isOpen={showSplashScreen && isLoaded && !isSignedIn}
        theme={resolvedTheme}
        onComplete={handleSplashComplete}
      />

      {/* Main Top Header - hidden on Auth pages */}
      {!['welcome', 'signup', 'login', 'role-selection', 'lister-subtype'].includes(currentView) && <Navbar />}

      {/* Slide-over Filter Drawer for Kenyan Hierarchy */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />

      {/* Main Dynamic View Screen */}
      <div className="flex-1 w-full min-w-0">
        {renderView()}
      </div>

      {/* Footer with credit - hidden on Auth pages */}
      {!['welcome', 'signup', 'login', 'role-selection', 'lister-subtype'].includes(currentView) && <Footer />}
    </div>
  );
}
