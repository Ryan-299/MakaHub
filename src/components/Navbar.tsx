import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  ExternalLink,
  Shield,
  Building,
  Compass,
  Check,
  ArrowRight
} from 'lucide-react';
import { useUser } from '@clerk/react';
import { useApp } from '../context/AppContext';
import { UserNotification } from '../types';
import { SidebarDrawer } from './SidebarDrawer';
import { formatRelativeTime } from '../utils/formatTime';

export const Navbar: React.FC = () => {
  const { user: clerkUser } = useUser();
  const [navError, setNavError] = React.useState<string | null>(null);
  const {
    currentUser,
    currentView,
    setCurrentView,
    selectedPropertyId,
    setSelectedPropertyId,
    setTargetReviewId,
    targetEnquiryId,
    setTargetEnquiryId,
    targetMessageId,
    setTargetMessageId,
    properties = [],
    unreadNotificationCount = 0,
    switchUserMode,
    logoutUser,
    isSeekerMode,
    isListerMode,
    isAdmin,
    notifications = [],
    markNotificationRead,
    markAllNotificationsRead,
    resolvedTheme,
    toggleTheme
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [, setTick] = useState(0);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Live timer to re-evaluate relative timestamps without page refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const handleNotificationClick = (notif: UserNotification) => {
    markNotificationRead(notif.id);
    setNotifOpen(false);

    if (currentUser?.role === 'admin' || isAdmin) {
      if (notif.type === 'flag' || notif.title.toLowerCase().includes('report') || notif.title.toLowerCase().includes('flag')) {
        setCurrentView('admin-reports');
        return;
      }
      if (
        notif.type === 'approval' ||
        notif.title.toLowerCase().includes('awaiting approval')
      ) {
        if (notif.targetPropertyId) {
          const propExists = properties.some(
            (p) =>
              p.id.toLowerCase() === notif.targetPropertyId?.toLowerCase()
          );

          if (!propExists) {
            setNavError(
              'Property not found. This property may have been deleted or is no longer available.'
            );

            setTimeout(() => {
              setNavError(null);
            }, 4000);

            return;
          }
        }

        setCurrentView('admin-pending');
        return;
      }
      if (notif.targetPropertyId) {
        const propExists = properties.some(
          (p) =>
            p.id.toLowerCase() === notif.targetPropertyId?.toLowerCase()
        );

        if (propExists) {
          setSelectedPropertyId(notif.targetPropertyId);
          setCurrentView('admin-properties');
          return;
        }

        setNavError(
          'Property not found. This property may have been deleted or is no longer available.'
        );

        setTimeout(() => {
          setNavError(null);
        }, 4000);

        return;
      }
      setCurrentView('admin-dashboard');
      return;
    }

    if (notif.type === 'review') {
      if (
        currentUser?.role === 'lister' ||
        isListerMode ||
        notif.title === 'New Property Rating' ||
        notif.title === 'New Property Comment' ||
        notif.title === 'New Review Posted'
      ) {
        setSelectedPropertyId(notif.targetPropertyId || null);
        setTargetReviewId(notif.targetReviewId || null);
        setCurrentView('lister-reviews');
        return;
      }

      if (notif.targetPropertyId) {
        const propExists = properties.some(
          (p) => p.id.toLowerCase() === notif.targetPropertyId?.toLowerCase()
        );
        if (propExists) {
          setSelectedPropertyId(notif.targetPropertyId);
          setTargetReviewId(notif.targetReviewId || null);
          setCurrentView('property-detail');
        } else {
          setSelectedPropertyId(null);
          setTargetReviewId(null);
          setCurrentView('tenant-home');
        }
      } else {
        setCurrentView('tenant-home');
      }
      return;
    }

    if (notif.type === 'approval') {
      if (notif.targetPropertyId) {
        const propExists = properties.some(
          (p) => p.id.toLowerCase() === notif.targetPropertyId?.toLowerCase()
        );
        if (propExists) {
          setSelectedPropertyId(notif.targetPropertyId);
          setTargetReviewId(null);
          setCurrentView('property-detail');
          return;
        }


        setNavError(
          'Property not found. This property may have been deleted or is no longer available.'
        );

        setTimeout(() => {
          setNavError(null);
        }, 4000);

        return;
      }
      setCurrentView(currentUser?.role === 'lister' ? 'my-listings' : 'tenant-home');
      return;
    }

    if (notif.type === 'rejection') {
      setCurrentView(currentUser?.role === 'lister' ? 'my-listings' : 'tenant-home');
      return;
    }

    if (notif.type === 'enquiry') {
      if (notif.targetEnquiryId) {
        setTargetEnquiryId(notif.targetEnquiryId);
      }
      if (notif.targetMessageId) {
        setTargetMessageId(notif.targetMessageId);
      } else {
        setTargetMessageId(null);
      }
      if (notif.targetPropertyId) {
        setSelectedPropertyId(notif.targetPropertyId);
      }
      setTargetReviewId(null);

      if (currentUser?.role === 'lister') {
        setCurrentView('lister-enquiries');
      } else {
        setCurrentView('seeker-enquiries');
      }
      return;
    }

    if (notif.targetPropertyId) {
      const propExists = properties.some(
        (p) => p.id.toLowerCase() === notif.targetPropertyId?.toLowerCase()
      );
      if (propExists) {
        setSelectedPropertyId(notif.targetPropertyId);
        setTargetReviewId(notif.targetReviewId || null);
        setCurrentView('property-detail');
      }
    }
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    if (!currentUser) {
      setCurrentView('welcome');
    } else if (currentUser.role === 'seeker') {
      setCurrentView('tenant-home');
    } else if (currentUser.role === 'lister') {
      setCurrentView('lister-dashboard');
    } else if (currentUser.role === 'admin') {
      setCurrentView('admin-dashboard');
    }
  };

  return (
    <>
      {navError && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          {navError}
        </div>
      )}
      {/* Slide-out Left Sidebar Drawer */}
      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 3. NEW SEEKER TOP BAR */}
      <header
        id="makaohub-topbar"
        className="hidden sm:block bg-[var(--rentike-bg)] border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between md:justify-end h-16 sm:h-17">
            {/* LEFT SIDE: Hamburger menu icon only */}
            <div className="hidden sm:flex md:hidden items-center">
              <button
                type="button"
                id="topbar-hamburger-btn"
                onClick={() => setSidebarOpen(true)}
                className="p-2 sm:p-2.5 rounded-xl text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-colors cursor-pointer"
                aria-label="Open navigation menu"
                title="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* RIGHT SIDE: Notification bell + Profile avatar */}

            <div className="hidden sm:flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                id="topbar-theme-toggle-btn"
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-[#151515] text-neutral-700 dark:text-neutral-300 hover:text-[var(--rentike-bronze)] transition-all"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                )}
              </button>



              {/* Profile Photo / Avatar with Compact Profile Menu (Section 18) */}
              {!currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentView('login')}
                    className="px-3 py-2 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView('signup')}
                    className="px-3.5 py-2 text-xs font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    id="topbar-profile-avatar-btn"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 bg-white dark:bg-neutral-950 transition-all cursor-pointer"
                    aria-label="User profile menu"
                    title={currentUser.name}
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>

                  {/* 18. COMPACT PROFILE MENU */}
                  {profileMenuOpen && (
                    <div
                      id="topbar-compact-profile-menu"
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 py-3 z-50 animate-in fade-in zoom-in-95 text-xs text-neutral-800 dark:text-neutral-200"
                    >
                      {/* Full Name, Email, Role */}
                      <div className="px-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-neutral-500 dark:text-neutral-400 text-[11px] truncate mt-0.5">
                          {currentUser.email}
                        </div>
                        <div className="mt-2 inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 px-2 py-0.5 rounded">
                          {currentUser.role === 'lister'
                            ? (currentUser.listerSubtype || 'Lister')
                            : currentUser.role === 'admin'
                              ? 'Administrator'
                              : 'Seeker'}
                        </div>
                      </div>

                      {/* View Account / Profile */}
                      <div className="p-2 space-y-1">
                        <button
                          type="button"
                          id="compact-profile-view-account-btn"
                          onClick={() => {
                            setCurrentView('profile');
                            setProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 font-bold text-neutral-900 dark:text-white transition-colors cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <User className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                            <span>View Account / Profile</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                        </button>
                      </div>

                      {/* Role Switcher — listers can move between Seeker and Lister sides */}
                      {currentUser.role === 'lister' && (() => {
                        const isOnListerSide =
                          currentView.startsWith('lister-') ||
                          currentView === 'my-listings' ||
                          currentView === 'add-property';

                        return (
                          <div className="px-2 pt-1 pb-1 border-t border-neutral-100 dark:border-neutral-800">
                            {isOnListerSide ? (
                              <button
                                type="button"
                                onClick={() => {
                                  switchUserMode('seeker');
                                  setProfileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
                              >
                                <Compass className="w-3.5 h-3.5" />
                                <span>Switch to Seeker View</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  switchUserMode('lister');
                                  setProfileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px]"
                              >
                                <Building className="w-3.5 h-3.5" />
                                <span>Switch to Lister View</span>
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* Sign Out */}
                      <div className="p-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="button"
                          id="compact-profile-logout-btn"
                          onClick={() => {
                            logoutUser();
                            setProfileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-bold transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header >
    </>
  );
};
