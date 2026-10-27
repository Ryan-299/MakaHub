import React, { useState } from 'react';
import {
  Home,
  Map,
  MapPin,
  Heart,
  Mail,
  MessageSquare,
  Building2,
  Sun,
  Moon,
  Laptop,
  Settings,
  HelpCircle,
  Phone,
  Info,
  Shield,
  FileText,
  LogOut,
  X,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  AlertTriangle,
  User,
  Users,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import lightLogo from '../assets/2D light mode.png';
import darkLogo from '../assets/2D dark.png';
import { HelpAndLegalModals, HelpLegalModalType } from './HelpAndLegalModals';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    currentView,
    setCurrentView,
    setSelectedPropertyId,
    targetEnquiryId,
    setTargetEnquiryId,
    messageTab,
    setMessageTab,
    desktopSidebarExpanded: desktopExpanded,
    setDesktopSidebarExpanded: setDesktopExpanded,
    savedProperties = [],
    seekerEnquiries = [],
    listerEnquiries = [],
    listerListings = [],
    setListerListingsFilter,
    pendingProperties = [],
    properties = [],
    users = [],
    reports = [],
    adminActiveTab,
    setAdminActiveTab,
    theme,
    resolvedTheme,
    setTheme,
    logoutUser,
    isSeekerMode,
    isListerMode,
    isAdmin,
    notifications = [], setMapTarget,
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
        (
          notification.type === 'review' &&
          ['Property Saved', 'New Property Rating', 'New Property Comment'].includes(notification.title)
        )
      )
  ).length;

  const unreadListerSystemCount = notifications.filter(
    (notification) =>
      (notification.recipientUserId || notification.userId) === currentUser?.id &&
      ['system', 'approval', 'rejection', 'flag'].includes(notification.type) &&
      !notification.read
  ).length;

  const totalListerUnreadCount =
    unreadListerInboxCount +
    unreadListerActivityCount +
    unreadListerSystemCount;


  const [messagesOpen, setMessagesOpen] = React.useState(false);

  const [activeLegalModal, setActiveLegalModal] = useState<HelpLegalModalType>(null);
  const isDark = resolvedTheme === 'dark';
  const openReportsCount = reports.filter((r) => r.status === 'open').length;



  const navigateTo = (view: any) => {
    setCurrentView(view);
    onClose();
  };

  const handleHomeClick = () => {
    if (isAdmin) {
      setAdminActiveTab('overview');
      navigateTo('admin-dashboard');
    } else if (isListerMode) {
      navigateTo('lister-dashboard');
    } else {
      navigateTo('tenant-home');
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  // Derive readable role name
  const userRoleDisplay = currentUser
    ? currentUser.role === 'lister'
      ? currentUser.listerSubtype || 'Landlord / Property Owner'
      : currentUser.role === 'admin'
        ? 'Administrator'
        : 'Seeker'
    : 'Seeker';

  return (
    <>
      {/* Help & Legal Modals */}
      <HelpAndLegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      <div


        className={`${isOpen
          ? 'fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200'
          : 'hidden md:block'
          } md:!fixed md:inset-y-0 md:left-0 md:w-20 md:z-[60] md:overflow-visible`}


      >
        {/* Subtle Backdrop Overlay */}
        <div
          id="sidebar-backdrop-overlay"

          className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity md:hidden"

          onClick={onClose}
        />

        {/* Drawer Panel */}
        <aside
          id="seeker-sidebar-drawer"
          className="absolute inset-y-0 left-0 max-w-full flex"
          aria-label="Sidebar Navigation"
        >
          {/* NEW DESKTOP SIDEBAR */}
          <div
            className={`hidden md:flex fixed top-4 bottom-4 left-4 z-[110] flex-col rounded-[28px] border border-white/60 bg-[#F7F3EC]/[0.92] backdrop-blur-xl shadow-[0_18px_50px_rgba(28,22,16,0.12)] dark:border-white/10 dark:bg-[#151515]/[0.90] dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)] transition-all duration-300 overflow-visible ${desktopExpanded ? 'w-64' : 'w-20'

              }`}
          >
            {/* Desktop sidebar toggle - visually sits on the top navbar */}
            <button
              type="button"
              onClick={() => setDesktopExpanded((prev) => !prev)}
              aria-label={desktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              className="hidden md:flex absolute top-4 right-0 translate-x-1/2 z-[70] w-9 h-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111111] text-neutral-700 dark:text-neutral-200 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-300"

            >
              <span className="text-xl leading-none">
                {desktopExpanded ? '‹' : '›'}
              </span>
            </button>
            {/* Rentike Branding */}
            {/* Rentike Branding */}
            <div
              className={
                "shrink-0 border-b border-neutral-200 dark:border-neutral-800 transition-all duration-300 " +
                (desktopExpanded ? "h-24 px-4" : "h-20")
              }
            >
              {desktopExpanded ? (
                <div className="h-full flex items-center gap-3">
                  <img
                    src={isDark ? darkLogo : lightLogo}
                    alt="Rentike"
                    draggable={false}
                    className="w-12 h-12 object-contain shrink-0"
                  />

                  <div className="min-w-0">
                    <div
                      className="text-[20px] tracking-[0.13em] text-neutral-950 dark:text-white whitespace-nowrap"
                      style={{ fontFamily: "'Anurati', sans-serif" }}
                    >
                      RENTIKE
                    </div>

                    <div className="mt-1 text-[7px] font-semibold tracking-[0.18em] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                      FIND · CONNECT · MOVE IN
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <img
                    src={isDark ? darkLogo : lightLogo}
                    alt="Rentike"
                    draggable={false}
                    className="w-11 h-11 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Lister-specific desktop and tablet navigation */}
            {isListerMode ? (
              <div className="pt-5">
                {[
                  {
                    label: 'Dashboard',
                    view: 'lister-dashboard',
                    Icon: LayoutDashboard,
                  },
                  {
                    label: 'My Listings',
                    view: 'my-listings',
                    Icon: Building2,
                  },
                  {
                    label: 'Add Listing',
                    view: 'add-property',
                    Icon: PlusCircle,
                  },
                  {
                    label: 'Messages',
                    view: 'lister-enquiries',
                    Icon: MessageSquare,
                  },
                ].map(({ label, view, Icon }) => (
                  <div key={view} className="px-3 pb-2">
                    <button
                      type="button"
                      onClick={() => navigateTo(view)}
                      aria-label={label}
                      title={!desktopExpanded ? label : undefined}
                      className={
                        "relative w-full h-11 flex items-center rounded-2xl transition-all duration-200 " +
                        (desktopExpanded
                          ? "justify-start gap-3 px-3 "
                          : "justify-center ") +
                        (currentView === view
                          ? "bg-[#F2E7D8]/80 text-[var(--rentike-bronze)] shadow-[3px_3px_8px_rgba(28,22,16,0.08),-3px_-3px_8px_rgba(255,255,255,0.75)] dark:bg-[#1B1B1B] dark:shadow-none"
                          : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05]")
                      }
                    >

                      <span className="relative inline-flex shrink-0 items-center justify-center">
                        <Icon
                          className="w-5 h-5 shrink-0"
                          strokeWidth={1.8}
                        />

                        {view === 'lister-enquiries' && totalListerUnreadCount > 0 && (
                          <span className="absolute -top-2 -right-3 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                            {totalListerUnreadCount}
                          </span>
                        )}
                      </span>

                      {desktopExpanded && (
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          {label}
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Home */}

                <div className="px-3 pt-5">
                  <button
                    type="button"
                    onClick={handleHomeClick}
                    aria-label="Home"
                    className={
                      "relative w-full h-11 flex items-center rounded-2xl transition-all duration-200 " +
                      (desktopExpanded
                        ? "justify-start gap-3 px-3 "
                        : "justify-center ") +
                      (currentView === "tenant-home"
                        ? "bg-[#F2E7D8]/80 text-[var(--rentike-bronze)] shadow-[3px_3px_8px_rgba(28,22,16,0.08),-3px_-3px_8px_rgba(255,255,255,0.75)] dark:bg-[#1B1B1B] dark:shadow-none"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05]")
                    }
                  >
                    <Home className="w-5 h-5 shrink-0" strokeWidth={1.8} />

                    {desktopExpanded && (
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Home
                      </span>
                    )}
                  </button>
                </div>
                {/* Map */}
                <div className="px-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPropertyId(null); setMapTarget(null);
                      navigateTo('map-explore');
                    }}
                    aria-label="Map"
                    className={
                      "w-full h-11 flex items-center rounded-2xl transition-all duration-200 " +
                      (desktopExpanded
                        ? "justify-start gap-3 px-3 "
                        : "justify-center ") +
                      (currentView === "map-explore"
                        ? "bg-[#F2E7D8]/80 text-[var(--rentike-bronze)] shadow-[3px_3px_8px_rgba(28,22,16,0.08),-3px_-3px_8px_rgba(255,255,255,0.75)] dark:bg-[#1B1B1B] dark:shadow-none"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05]")
                    }
                  >
                    <Map
                      className="w-5 h-5 shrink-0"
                      strokeWidth={1.8}
                    />

                    {desktopExpanded && (
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        Map
                      </span>
                    )}
                  </button>
                </div>
                {/* Saved Properties */}
                <div className="px-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('saved')}
                    aria-label="Saved Properties"
                    className={
                      "w-full h-11 flex items-center rounded-2xl transition-all duration-200 " +
                      (desktopExpanded
                        ? "justify-between px-3 "
                        : "justify-center ") +
                      (currentView === "saved"
                        ? "bg-[#F2E7D8]/80 text-[var(--rentike-bronze)] shadow-[3px_3px_8px_rgba(28,22,16,0.08),-3px_-3px_8px_rgba(255,255,255,0.75)] dark:bg-[#1B1B1B] dark:shadow-none"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05]")
                    }
                  >
                    <div className={`flex items-center ${desktopExpanded ? 'gap-3' : ''}`}>
                      <div className={`flex items-center ${desktopExpanded ? 'gap-3' : ''}`}>
                        <span className="relative inline-flex items-center justify-center">
                          <Heart
                            className="w-5 h-5 shrink-0"
                            strokeWidth={1.8}
                          />

                          {!desktopExpanded && savedProperties.length > 0 && (
                            <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                              {savedProperties.length}
                            </span>
                          )}
                        </span>

                        {desktopExpanded && (
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            Saved Properties
                          </span>
                        )}
                      </div>

                      {desktopExpanded && savedProperties.length > 0 && (
                        <span className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                          {savedProperties.length}
                        </span>
                      )}


                    </div>


                  </button>
                </div>


                {/* Close NEW DESKTOP SIDEBAR */}
                {/* Messages */}
                <div className="px-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetEnquiryId(null);
                      setMessageTab('inbox');
                      navigateTo('seeker-enquiries');
                    }}
                    aria-label="Messages"
                    className={
                      "relative w-full h-11 flex items-center rounded-2xl transition-all duration-200 " +
                      (desktopExpanded
                        ? "justify-between px-3 "
                        : "justify-center ") +
                      (currentView === "seeker-enquiries"
                        ? "bg-[#F2E7D8]/80 text-[var(--rentike-bronze)] shadow-[3px_3px_8px_rgba(28,22,16,0.08),-3px_-3px_8px_rgba(255,255,255,0.75)] dark:bg-[#1B1B1B] dark:shadow-none"
                        : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05]")
                    }
                  >
                    <div className={`flex items-center ${desktopExpanded ? "gap-3" : ""}`}>
                      <span className="relative inline-flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 shrink-0" strokeWidth={1.8} />

                        {!desktopExpanded && totalMessageUnreadCount > 0 && (
                          <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                            {totalMessageUnreadCount}
                          </span>
                        )}
                      </span>

                      {desktopExpanded && (
                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                          Messages
                        </span>
                      )}
                    </div>

                    {desktopExpanded && (
                      <div className="flex items-center gap-2 mr-6">
                        {totalMessageUnreadCount > 0 && (
                          <span className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                            {totalMessageUnreadCount}
                          </span>
                        )}


                      </div>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Profile / Account — shared by seeker and lister */}
            <div className="mt-auto px-3 pb-5 pt-3">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('makaohub-profile-tab');
                  navigateTo('profile');
                }}
                aria-label="Profile"
                className={
                  "w-full h-11 flex items-center rounded-2xl transition-all duration-200 " +
                  (desktopExpanded
                    ? "justify-start gap-3 px-3 "
                    : "justify-center ") +
                  (currentView === "profile"
                    ? "bg-[#F2E7D8]/80 text-[var(--rentike-bronze)] shadow-[3px_3px_8px_rgba(28,22,16,0.08),-3px_-3px_8px_rgba(255,255,255,0.75)] dark:bg-[#1B1B1B] dark:shadow-none"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-white/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.05]")
                }
              >
                <User className="w-5 h-5 shrink-0" strokeWidth={1.8} />

                {desktopExpanded && (
                  <span className="text-sm font-medium text-neutral-900 dark:text-white">
                    Profile
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className={`relative w-80 max-w-[85vw] md:hidden lg:max-w-none overflow-hidden transition-all duration-300 bg-white dark:bg-[#000000] text-neutral-900 dark:text-[#F5F5F5] border-r border-neutral-200 dark:border-[#292929] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left font-sans`}>
            {/* 12. SIDEBAR HEADER */}
            <div className="px-5 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-neutral-100 dark:border-[#262626] flex flex-col gap-3 sm:gap-3.5">
              <div className={`flex items-start justify-between ${desktopExpanded ? '' : 'lg:justify-center'}`}>
                {/* Theme-Aware Transparent MakaoHub Logo */}
                <button
                  type="button"
                  onClick={handleHomeClick}
                  className={`flex items-center cursor-pointer focus:outline-none ${desktopExpanded ? '' : 'lg:hidden'}`}
                  aria-label="MakaoHub Home"
                >
                  <div className="w-[125px] h-[78px] sm:w-[136px] sm:h-[84px] relative overflow-hidden flex items-center shrink-0">
                    {isDark ? (
                      <img
                        src={darkLogo}
                        alt="MakaoHub"
                        className="w-[177px] h-[177px] sm:w-[193px] sm:h-[193px] max-w-none absolute top-1/2 left-1/2 -translate-x-[50.6%] -translate-y-[45.7%] pointer-events-none select-none"
                        draggable={false}
                      />
                    ) : (
                      <img
                        src={lightLogo}
                        alt="MakaoHub"
                        className="w-[252px] h-[252px] sm:w-[274px] sm:h-[274px] max-w-none absolute top-1/2 left-1/2 -translate-x-[50.5%] -translate-y-[47.0%] pointer-events-none select-none"
                        draggable={false}
                      />
                    )}
                  </div>
                </button>

                {/* Mobile / tablet close button */}
                <button
                  type="button"
                  id="sidebar-close-btn"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Desktop expand / collapse button */}
                <button
                  type="button"
                  onClick={() => setDesktopExpanded((prev) => !prev)}
                  className={`hidden lg:flex absolute top-4 z-50 w-9 h-9 items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all ${desktopExpanded ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}
                  aria-label={desktopExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  <span className="text-xl leading-none">
                    {desktopExpanded ? '‹' : '›'}
                  </span>
                </button>
              </div>

              {/* User Identity Info */}
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-[#292929] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5] truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-[#A3A3A3] font-medium truncate">
                      {userRoleDisplay}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-neutral-900 dark:text-white">Welcome Seeker</div>
                    <div className="text-xs text-neutral-500">Sign in to sync saved homes</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('login')}
                    className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
              {isAdmin ? (
                /* ==================================================
                   ADMIN SIDEBAR NAVIGATION (DEDICATED PRIVATE ADMIN)
                   Structure:
                   - Dashboard
                   - Pending Listings
                   - All Listings
                   - Users
                   - Reviews & Reports
                   ================================================== */
                <div className="space-y-1">
                  {/* Dashboard */}
                  <button
                    type="button"
                    id="sidebar-admin-dashboard"
                    onClick={() => {
                      setAdminActiveTab('overview');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'overview'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutDashboard className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Dashboard</span>
                    </div>
                  </button>

                  {/* Pending Listings */}
                  <button
                    type="button"
                    id="sidebar-admin-pending"
                    onClick={() => {
                      setAdminActiveTab('pending-properties');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'pending-properties'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Pending Listings</span>
                    </div>
                    {pendingProperties.length > 0 && (
                      <span className="text-[10px] font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black px-2 py-0.5 rounded-full">
                        {pendingProperties.length}
                      </span>
                    )}
                  </button>

                  {/* All Listings */}
                  <button
                    type="button"
                    id="sidebar-admin-all-listings"
                    onClick={() => {
                      setAdminActiveTab('all-properties');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'all-properties'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>All Listings</span>
                    </div>
                    <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                      {properties.length}
                    </span>
                  </button>

                  {/* Users */}
                  <button
                    type="button"
                    id="sidebar-admin-users"
                    onClick={() => {
                      setAdminActiveTab('users');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'users'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Users</span>
                    </div>
                    <span className="text-[10px] font-bold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                      {users.length}
                    </span>
                  </button>

                  {/* Reviews & Reports */}
                  <button
                    type="button"
                    id="sidebar-admin-reports"
                    onClick={() => {
                      setAdminActiveTab('reports');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'reports'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Dispute Reports</span>
                    </div>
                    {openReportsCount > 0 && (
                      <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                        {openReportsCount}
                      </span>
                    )}
                  </button>

                  {/* Kenya Locations */}
                  <button
                    type="button"
                    id="sidebar-admin-locations"
                    onClick={() => {
                      setAdminActiveTab('locations');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'locations'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Kenya Locations</span>
                    </div>
                  </button>

                  {/* Activity Log */}
                  <button
                    type="button"
                    id="sidebar-admin-activity"
                    onClick={() => {
                      setAdminActiveTab('activity');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'activity'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Activity Log</span>
                    </div>
                  </button>

                  {/* Moderation Settings */}
                  <button
                    type="button"
                    id="sidebar-admin-settings"
                    onClick={() => {
                      setAdminActiveTab('settings');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'settings'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Moderation Settings</span>
                    </div>
                  </button>
                </div>
              ) : isListerMode ? (
                /* ==================================================
                   LISTER SIDEBAR NAVIGATION (STREAMLINED STRUCTURE)
                   Structure:
                   - Home
                   - My Listings
                   - Enquiries
                   - Messages
                   - Divider
                   - Appearance
                   - Settings
                   ================================================== */
                <div className="space-y-1">
                  {/* Home */}
                  <button
                    type="button"
                    id="sidebar-nav-home"
                    onClick={handleHomeClick}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'lister-dashboard'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Home</span>
                    </div>
                  </button>

                  {/* My Listings */}
                  <button
                    type="button"
                    id="sidebar-nav-my-listings"
                    onClick={() => {
                      setListerListingsFilter('all');
                      navigateTo('my-listings');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'my-listings' || currentView === 'add-property'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>My Listings</span>
                    </div>
                    {listerListings.length > 0 && (
                      <span className="text-[10px] font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black px-2 py-0.5 rounded-full">
                        {listerListings.length}
                      </span>
                    )}
                  </button>

                  {/* Enquiries */}
                  <button
                    type="button"
                    id="sidebar-nav-enquiries"
                    onClick={() => {
                      setTargetEnquiryId(null);
                      navigateTo('lister-enquiries');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'lister-enquiries'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Enquiries</span>
                    </div>
                    {listerEnquiries.length > 0 && (
                      <span className="text-[10px] font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black px-2 py-0.5 rounded-full">
                        {listerEnquiries.length}
                      </span>
                    )}
                  </button>


                </div>
              ) : (
                /* ==================================================
                   SEEKER / VISITOR SIDEBAR MAIN NAVIGATION
                   Preserves Map, Saved Properties, Enquiries, Messages
                   ================================================== */
                <div className="space-y-1">
                  {/* Home */}
                  <button
                    type="button"
                    id="sidebar-nav-home"
                    onClick={handleHomeClick}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'tenant-home'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Home</span>
                    </div>
                  </button>

                  {/* Map */}
                  <button
                    type="button"
                    id="sidebar-nav-map"
                    onClick={() => {
                      setSelectedPropertyId(null);
                      navigateTo('map-explore');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'map-explore'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Map className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Map</span>
                    </div>
                  </button>

                  {/* Saved Properties */}
                  <button
                    type="button"
                    id="sidebar-nav-saved"
                    onClick={() => navigateTo('saved')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'saved'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className={`flex items-center gap-3 ${desktopExpanded ? '' : 'lg:w-full lg:justify-center'}`}>
                      <Heart className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span className={desktopExpanded ? '' : 'lg:hidden'}>Saved Properties</span>
                    </div>
                    {savedProperties.length > 0 && (
                      <span className="text-[10px] font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black px-2 py-0.5 rounded-full">
                        {savedProperties.length}
                      </span>
                    )}
                  </button>

                  {/* Enquiries */}
                  <button
                    type="button"
                    id="sidebar-nav-enquiries"
                    onClick={() => {
                      setTargetEnquiryId(null);
                      navigateTo('seeker-enquiries');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'seeker-enquiries' || currentView === 'my-enquiries'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Enquiries</span>
                    </div>
                    {seekerEnquiries.length > 0 && (
                      <span className="text-[10px] font-bold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black px-2 py-0.5 rounded-full">
                        {seekerEnquiries.length}
                      </span>
                    )}
                  </button>


                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-neutral-200 dark:border-[#262626] my-2" />

              {/* 14. SIDEBAR SECONDARY NAVIGATION */}
              <div className="space-y-1">
                {!isListerMode && (
                  <div className="px-3.5 py-1 text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider">
                    Preferences
                  </div>
                )}

                {/* Activity (Admin Only) */}
                {isAdmin && (
                  <button
                    type="button"
                    id="sidebar-admin-activity"
                    onClick={() => {
                      setAdminActiveTab('activity');
                      navigateTo('admin-dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${currentView === 'admin-dashboard' && adminActiveTab === 'activity'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Activity Log</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D]" />
                  </button>
                )}

                {/* Billing & Plan (Lister Only) */}
                {isListerMode && (
                  <button
                    type="button"
                    id="sidebar-nav-billing"
                    onClick={() => {
                      sessionStorage.setItem('makaohub-profile-tab', 'billing');
                      navigateTo('profile');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer font-sans ${currentView === 'profile'
                      ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                      : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                      <span>Billing & Plan</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D]" />
                  </button>
                )}

                {/* Appearance Theme Selector */}
                <div className="px-3.5 py-2 bg-neutral-50 dark:bg-[#0D0D0D] rounded-2xl border border-neutral-200 dark:border-[#292929] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-[#E0E0E0]">
                    <span>Appearance</span>
                    <span className="text-[10px] font-medium text-neutral-500 dark:text-[#A3A3A3] capitalize">
                      {theme === 'system' ? 'System' : resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-neutral-200 dark:bg-[#181818] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleThemeChange('light')}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${theme === 'light'
                        ? 'bg-white text-black shadow-xs'
                        : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
                        }`}
                      title="Light Mode"
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange('dark')}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${theme === 'dark'
                        ? 'bg-black text-white dark:bg-[#111111] shadow-xs'
                        : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
                        }`}
                      title="Dark Mode"
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange('system')}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${theme === 'system'
                        ? 'bg-white dark:bg-[#111111] text-black dark:text-white shadow-xs'
                        : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
                        }`}
                      title="System Preference"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>

                {/* Settings */}
                <button
                  type="button"
                  id="sidebar-nav-settings"
                  onClick={() => {
                    if (isAdmin) {
                      setAdminActiveTab('settings');
                      navigateTo('admin-dashboard');
                    } else {
                      sessionStorage.setItem('makaohub-profile-tab', 'settings');
                      navigateTo('profile');

                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${(currentView === 'profile' && !isListerMode && !isAdmin) ||
                    (isAdmin && currentView === 'admin-dashboard' && adminActiveTab === 'settings')
                    ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                    : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    <span>Settings</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D]" />
                </button>
              </div>

              {/* Seeker-only Help Section & Legal */}
              {!isListerMode && !isAdmin && (
                <>
                  {/* Divider */}
                  <div className="h-px bg-neutral-200 dark:border-[#262626] my-2" />

                  {/* 15. SIDEBAR HELP SECTION */}
                  <div className="space-y-1">
                    <div className="px-3.5 py-1 text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider">
                      Help & Support
                    </div>

                    {/* FAQ / Help Centre */}
                    <button
                      type="button"
                      id="sidebar-nav-faq"
                      onClick={() => setActiveLegalModal('faq')}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-[#A3A3A3] hover:bg-neutral-50 dark:hover:bg-[#161616] hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-neutral-500" />
                        <span>FAQ / Help Centre</span>
                      </div>
                    </button>

                    {/* Contact Us */}
                    <button
                      type="button"
                      id="sidebar-nav-contact"
                      onClick={() => setActiveLegalModal('contact')}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-[#A3A3A3] hover:bg-neutral-50 dark:hover:bg-[#161616] hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-neutral-500" />
                        <span>Contact Us</span>
                      </div>
                    </button>

                    {/* About MakaoHub */}
                    <button
                      type="button"
                      id="sidebar-nav-about"
                      onClick={() => setActiveLegalModal('about')}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-[#A3A3A3] hover:bg-neutral-50 dark:hover:bg-[#161616] hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Info className="w-4 h-4 text-neutral-500" />
                        <span>About MakaoHub</span>
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-neutral-200 dark:border-[#262626] my-2" />

                  {/* 16. PRIVACY + LEGAL LINKS */}
                  <div className="space-y-1">
                    <button
                      type="button"
                      id="sidebar-nav-privacy"
                      onClick={() => setActiveLegalModal('privacy')}
                      className="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11px] font-medium text-neutral-500 dark:text-[#7D7D7D] hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      <Shield className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Privacy Policy</span>
                    </button>

                    <button
                      type="button"
                      id="sidebar-nav-terms"
                      onClick={() => setActiveLegalModal('terms')}
                      className="w-full flex items-center gap-3 px-3.5 py-1.5 rounded-lg text-[11px] font-medium text-neutral-500 dark:text-[#7D7D7D] hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Terms of Service</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* 17. LOG OUT */}
            <div className="p-4 border-t border-neutral-200 dark:border-[#262626]">
              {currentUser ? (
                <button
                  type="button"
                  id="sidebar-logout-btn"
                  onClick={() => {
                    logoutUser();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo('login')}
                  className="w-full py-2.5 px-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs text-center"
                >
                  Sign In to MakaoHub
                </button>
              )}
            </div>
          </div>
        </aside >
      </div >

    </>
  );
};
