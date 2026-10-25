import React from 'react';
import { Home, Search, Map, Heart, User, LayoutDashboard, Building2, PlusCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileNavbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setSelectedPropertyId,
    setTargetEnquiryId,
    currentUser,
    savedProperties = [],
    seekerEnquiries = [],
    notifications = [],
    listerEnquiries = [],
    filterDrawerOpen,
    isListerMode
  } = useApp();
  const unreadInboxCount = seekerEnquiries.filter(
    (enq) => !enq.readBySeeker
  ).length;

  const unreadActivityCount = notifications.filter(
    (notification) =>
      notification.type === 'review' &&
      notification.title === 'New Review Reply' &&
      !notification.read
  ).length;
  const unreadSystemCount = notifications.filter(
    (notification) =>
      notification.type === 'system' &&
      !notification.read
  ).length;

  const totalMessageUnreadCount =
    unreadInboxCount + unreadActivityCount + unreadSystemCount;

  const unreadListerInboxCount = listerEnquiries.filter(
    (enq) => !enq.readByLister
  ).length;

  const unreadListerActivityCount = notifications.filter(
    (notification) =>
      (notification.recipientUserId || notification.userId) === currentUser?.id &&
      !notification.read &&
      (
        notification.type === 'activity' ||
        (notification.type === 'review' &&
          ['Property Saved', 'New Property Rating', 'New Property Comment'].includes(notification.title))
      )
  ).length;


  const unreadListerSystemCount = notifications.filter(
    (notification) =>
      (notification.recipientUserId || notification.userId) === currentUser?.id &&
      ['system', 'approval', 'rejection', 'flag'].includes(notification.type) &&
      !notification.read
  ).length;


  const unreadListerTotal =
    unreadListerInboxCount +
    unreadListerActivityCount +
    unreadListerSystemCount;

  if (filterDrawerOpen || currentView === 'welcome' || currentView === 'login' || currentView === 'signup' || currentView === 'role-selection') {
    return null;
  }

  return (
    <nav
      id="makaohub-mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-[#F8F3EB]/95 dark:bg-[#111111]/95 backdrop-blur-xl border-t border-[#E4D8C8] dark:border-[#2A2A2A] rounded-t-[22px] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {/* Seeker / Visitor Bottom Nav */}
        {!isListerMode ? (
          <>
            <button
              type="button"
              onClick={() => setCurrentView('tenant-home')}
              className={`flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl transition-all duration-200 ${currentView === 'tenant-home'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.10),-4px_-4px_10px_rgba(255,255,255,0.75)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.55),-3px_-3px_8px_rgba(255,255,255,0.04)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              type="button"
              id="mobile-nav-map-btn"
              onClick={() => {
                setSelectedPropertyId(null);
                setCurrentView('map-explore');
              }}
              className={`flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold transition-all ${currentView === 'map-explore'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.10)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <Map className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Map</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('saved')}
              className={`relative flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold transition-all ${currentView === 'saved'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.10)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <Heart className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Saved</span>
              {savedProperties.length > 0 && (
                <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {savedProperties.length}
                </span>
              )}
            </button>

            {currentUser && (
              <button
                type="button"
                id="mobile-nav-seeker-enquiries-btn"
                onClick={() => {
                  setTargetEnquiryId(null);
                  setCurrentView('seeker-enquiries');
                }}
                className={`relative flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold transition-all ${currentView === 'seeker-enquiries'
                  ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.10)]'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                  }`}
              >
                <MessageSquare className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Messages</span>
                {seekerEnquiries.filter((enq) => !enq.readBySeeker).length > 0 && (
                  <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {seekerEnquiries.filter((enq) => !enq.readBySeeker).length}
                  </span>
                )}
                {totalMessageUnreadCount > 0 && (
                  <span className="absolute top-1 right-2 min-w-[16px] h-4 px-1 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalMessageUnreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentView(currentUser ? 'profile' : 'login')}
              className={`flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold transition-all ${currentView === 'profile'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.10)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Account</span>
            </button>
          </>

        ) : (
          <>
            {/* Lister Bottom Nav — Rentike Neumorphic Style */}

            {/* Dashboard */}
            <button
              type="button"
              onClick={() => setCurrentView('lister-dashboard')}
              className={`flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all duration-200 ${currentView === 'lister-dashboard'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.55)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            {/* My Listings */}
            <button
              type="button"
              onClick={() => setCurrentView('my-listings')}
              className={`flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all duration-200 ${currentView === 'my-listings'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.55)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <Building2 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Listings</span>
            </button>

            {/* Add New Listing */}
            <button
              type="button"
              onClick={() => setCurrentView('add-property')}
              className={`flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all duration-200 ${currentView === 'add-property'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.55)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <PlusCircle className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Add</span>
            </button>

            {/* Enquiries */}
            <button
              type="button"
              onClick={() => setCurrentView('lister-enquiries')}
              className={`relative flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all duration-200 ${currentView === 'lister-enquiries'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.55)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Messages</span>

              {unreadListerTotal > 0 && (
                <span className="absolute top-0 right-1 min-w-[15px] h-[15px] px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadListerTotal}
                </span>
              )}
            </button>

            {/* My Account */}
            <button
              type="button"
              onClick={() => setCurrentView('profile')}
              className={`flex flex-col items-center justify-center min-w-[58px] px-2 py-1.5 rounded-2xl text-xs font-semibold cursor-pointer transition-all duration-200 ${currentView === 'profile'
                ? 'text-[var(--rentike-bronze)] bg-[#F8F3EB] dark:bg-[#181818] shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_8px_rgba(255,255,255,0.8)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.55)]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-[var(--rentike-bronze)]'
                }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Account</span>
            </button>
          </>

        )}
      </div>
    </nav>
  );
};
