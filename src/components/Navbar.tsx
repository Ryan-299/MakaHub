import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
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
import { useApp } from '../context/AppContext';
import { UserNotification } from '../types';
import { SidebarDrawer } from './SidebarDrawer';
import { formatRelativeTime } from '../utils/formatTime';

export const Navbar: React.FC = () => {
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
    resolvedTheme
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
      if (notif.type === 'approval' || notif.title.toLowerCase().includes('submitted') || notif.title.toLowerCase().includes('review')) {
        setCurrentView('admin-pending');
        return;
      }
      if (notif.targetPropertyId) {
        setSelectedPropertyId(notif.targetPropertyId);
        setCurrentView('admin-properties');
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
      {/* Slide-out Left Sidebar Drawer */}
      <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 3. NEW SEEKER TOP BAR */}
      <header
        id="makaohub-topbar"
        className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-40 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-17">
            {/* LEFT SIDE: Hamburger menu icon only */}
            <div className="flex items-center">
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
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Notification Bell */}
              {currentUser && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    id="topbar-notification-btn"
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all cursor-pointer"
                    title="Notifications"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    {/* Small RED badge with WHITE number */}
                    {unreadNotificationCount > 0 && (
                      <span
                        id="topbar-unread-badge"
                        className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-4.5 h-4.5 min-w-[18px] rounded-full flex items-center justify-center shadow-xs border-2 border-white dark:border-black animate-pulse"
                      >
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Menu Popup */}
                  {notifOpen && (
                    <div
                      id="topbar-notifications-dropdown"
                      className="fixed sm:absolute top-16 sm:top-full left-3 right-3 sm:left-auto sm:right-0 mt-2 w-auto sm:w-[380px] max-w-[calc(100vw-24px)] sm:max-w-[calc(100vw-32px)] flex flex-col bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 z-50 animate-in fade-in zoom-in-95 overflow-hidden"
                    >
                      <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                          Notifications ({notifications.length})
                        </h4>
                        {unreadNotificationCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-[11px] text-neutral-500 hover:text-black dark:hover:text-white font-semibold cursor-pointer transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-neutral-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 3).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer transition-colors ${
                                !notif.read ? 'bg-neutral-50/90 dark:bg-neutral-900/60 font-medium' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-bold text-neutral-900 dark:text-white truncate">{notif.title}</span>
                                <span className="text-[10px] text-neutral-400 shrink-0">{formatRelativeTime(notif.createdAt || notif.time)}</span>
                              </div>
                              <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed text-[11px] whitespace-pre-line break-words line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer: See all notifications */}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          id="btn-see-all-notifications"
                          onClick={() => {
                            setNotifOpen(false);
                            if (currentUser?.role === 'lister') {
                              setCurrentView('lister-enquiries');
                            } else if (currentUser?.role === 'admin') {
                              setCurrentView('admin-reports');
                            } else {
                              setCurrentView('seeker-enquiries');
                            }
                          }}
                          className="w-full px-4 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold text-neutral-900 dark:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>See all notifications</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

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

                      {/* Role Switcher if applicable */}
                      {(currentUser.role !== 'seeker' || isListerMode) && (
                        <div className="px-2 pt-1 pb-1 border-t border-neutral-100 dark:border-neutral-800">
                          {currentUser.role !== 'seeker' && (
                            <button
                              type="button"
                              onClick={() => {
                                switchUserMode('seeker');
                                setProfileMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>Switch to Seeker View</span>
                            </button>
                          )}
                          {currentUser.role !== 'lister' && (
                            <button
                              type="button"
                              onClick={() => {
                                switchUserMode('lister');
                                setProfileMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-left"
                            >
                              <Building className="w-3.5 h-3.5" />
                              <span>Switch to Lister View</span>
                            </button>
                          )}
                        </div>
                      )}

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
      </header>
    </>
  );
};
