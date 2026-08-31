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
  AlertTriangle,
  Users,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import darkLogo from '../assets/MAKAOHUB LOGO NO BACKGROUND (Dark Mode).png';
import lightLogo from '../assets/official no white background image.png';
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
    isAdmin
  } = useApp();

  const [activeLegalModal, setActiveLegalModal] = useState<HelpLegalModalType>(null);
  const isDark = resolvedTheme === 'dark';
  const openReportsCount = reports.filter((r) => r.status === 'open').length;

  if (!isOpen && !activeLegalModal) return null;

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

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Subtle Backdrop Overlay */}
          <div
            id="sidebar-backdrop-overlay"
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <aside
            id="seeker-sidebar-drawer"
            className="absolute inset-y-0 left-0 max-w-full flex"
            aria-label="Sidebar Navigation"
          >
            <div className="w-80 max-w-[85vw] bg-white dark:bg-[#000000] text-neutral-900 dark:text-[#F5F5F5] border-r border-neutral-200 dark:border-[#292929] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 font-sans">
              {/* 12. SIDEBAR HEADER */}
              <div className="px-5 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-neutral-100 dark:border-[#262626] flex flex-col gap-3 sm:gap-3.5">
                <div className="flex items-start justify-between">
                  {/* Theme-Aware Transparent MakaoHub Logo */}
                  <button
                    type="button"
                    onClick={handleHomeClick}
                    className="flex items-center cursor-pointer focus:outline-none"
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

                  <button
                    type="button"
                    id="sidebar-close-btn"
                    onClick={onClose}
                    className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'overview'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'pending-properties'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'all-properties'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'users'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'reports'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'locations'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'activity'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'settings'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'lister-dashboard'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'my-listings' || currentView === 'add-property'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'lister-enquiries'
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

                    {/* Messages */}
                    <button
                      type="button"
                      id="sidebar-nav-messages"
                      onClick={() => {
                        setTargetEnquiryId(null);
                        navigateTo('lister-enquiries');
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'lister-enquiries' && targetEnquiryId
                          ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                          : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span>Messages</span>
                      </div>
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'tenant-home'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'map-explore'
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'saved'
                          ? 'bg-[#F0F0F0] dark:bg-[#181818] text-[#111111] dark:text-[#FFFFFF] font-extrabold shadow-2xs'
                          : 'text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span>Saved Properties</span>
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'seeker-enquiries' || currentView === 'my-enquiries'
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

                    {/* Messages */}
                    <button
                      type="button"
                      id="sidebar-nav-messages"
                      onClick={() => {
                        setTargetEnquiryId(null);
                        navigateTo('seeker-enquiries');
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-[#555555] dark:text-[#A3A3A3] hover:bg-neutral-100 dark:hover:bg-[#161616] hover:text-[#111111] dark:hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span>Messages</span>
                      </div>
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
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' && adminActiveTab === 'activity'
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
                      onClick={() => navigateTo('profile')}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer font-sans ${
                        currentView === 'profile'
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
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          theme === 'light'
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
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          theme === 'dark'
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
                        className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          theme === 'system'
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
                        navigateTo('profile');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      (currentView === 'profile' && !isListerMode && !isAdmin) ||
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
          </aside>
        </div>
      )}
    </>
  );
};
