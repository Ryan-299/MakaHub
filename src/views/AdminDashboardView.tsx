import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  User,
  Shield,
  Activity,
  Settings as SettingsIcon,
  Clock,
  Check,
  FileText,
  Lock,
  Bell
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyListing, PlatformReport, UserAccount, AdminTab } from '../types';
import { AdminPropertyReviewModal } from '../components/AdminPropertyReviewModal';
import { InvestigateReportModal } from '../components/InvestigateReportModal';
import { AdminUserDetailModal } from '../components/AdminUserDetailModal';
import { getCounties, getSubCountiesInCounty, getWardsInSubCounty } from '../utils/kenyaLocations';
import { formatRelativeTime } from '../utils/formatTime';

export const AdminDashboardView: React.FC = () => {
  const {
    properties = [],
    reports = [],
    users = [],
    adminActivity = [],
    adminActiveTab = 'overview',
    setAdminActiveTab,
    approveProperty,
    rejectProperty,
    setCurrentView
  } = useApp();

  const activeTab: AdminTab = adminActiveTab || 'overview';
  const setActiveTab = (tab: AdminTab) => {
    if (setAdminActiveTab) {
      setAdminActiveTab(tab);
    }
  };

  const [selectedReviewProperty, setSelectedReviewProperty] = useState<PropertyListing | null>(null);
  const [selectedInvestigateReport, setSelectedInvestigateReport] = useState<PlatformReport | null>(null);
  const [selectedAdminUser, setSelectedAdminUser] = useState<UserAccount | null>(null);
  const [locationCountyFilter, setLocationCountyFilter] = useState('Nairobi');

  // Ref to the active section container for direct smooth scrolling
  const sectionContentRef = useRef<HTMLDivElement | null>(null);

  // Smooth navigation handler to switch tab and scroll to section top
  const handleNavigateTab = (
    tab: AdminTab,
    statusFilter?: 'All' | 'Approved' | 'Pending' | 'Rejected' | 'Vacant',
    smoothScroll = true
  ) => {
    if (tab === 'all-properties') {
      setPropertyStatusFilter(statusFilter || 'All');
    } else if (statusFilter) {
      setPropertyStatusFilter(statusFilter);
    }
    setActiveTab(tab);
    if (setAdminActiveTab) {
      setAdminActiveTab(tab);
    }
    if (smoothScroll) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }, 100);
      });
    }
  };

  // Properties tab search and filter
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [propertyStatusFilter, setPropertyStatusFilter] =
    useState<'All' | 'Approved' | 'Pending' | 'Rejected' | 'Vacant'>('All');

  // Stats calculation
  const pendingProperties = (properties || []).filter((p) => p.status === 'Pending');
  const openReports = (reports || []).filter((r) => r.status === 'open');
  const activeProperties = (properties || []).filter((p) => p.status === 'Approved');
  const rejectedProperties = (properties || []).filter((p) => p.status === 'Rejected');
  const totalVacancies = (properties || []).reduce((acc, p) => acc + (p.vacancies || 0), 0);
  const platformUsersCount = (users || []).filter((u) => u.role !== 'admin').length;
  const adminUsersCount = (users || []).filter((u) => u.role === 'admin').length;

  const allCounties = getCounties();
  const selectedCountySubCounties = getSubCountiesInCounty(locationCountyFilter);

  // Filtered properties for All Properties tab
  const filteredAllProperties = (properties || []).filter((p) => {
    const matchesSearch =
      !propertySearchQuery ||
      p.name.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
      p.location.estate.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
      p.location.county.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
      (p.lister?.name || '').toLowerCase().includes(propertySearchQuery.toLowerCase());

    const matchesStatus =
      propertyStatusFilter === 'All'
        ? true
        : propertyStatusFilter === 'Vacant'
          ? (p.vacancies ?? 0) > 0
          : p.status === propertyStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-black pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#292929]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded">
                Super Admin
              </span>
              <span className="text-xs text-neutral-500 dark:text-[#A3A3A3] font-semibold">
                MakaoHub Kenya Moderation Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight mt-1">
              Platform Administration
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
              Audit pending listings, inspect all active properties, resolve dispute reports, and manage registered users.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView('tenant-home')}
              className="px-4 py-2 bg-white dark:bg-[#111111] hover:bg-neutral-100 dark:hover:bg-[#181818] border border-neutral-200 dark:border-[#292929] text-neutral-800 dark:text-[#F5F5F5] text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Back to App View
            </button>
          </div>
        </div>

        {/* SUMMARY STATISTICS (Total Properties, Pending Approvals, Total Users, Open Reports) - All Clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Properties */}
          <button
            type="button"
            id="admin-card-all-properties"
            onClick={() => handleNavigateTab('all-properties', 'All')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-2xs ${activeTab === 'all-properties' && propertyStatusFilter === 'All'
              ? 'bg-white dark:bg-[#181818] border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10'
              : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-white hover:shadow-md'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-[#A3A3A3] uppercase tracking-wider group-hover:text-black dark:group-hover:text-white transition-colors">
                Total Properties
              </span>
              <Building2 className="w-4 h-4 text-neutral-600 dark:text-[#888888] group-hover:text-black dark:group-hover:text-white transition-colors" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5] my-1">
              {properties.length}
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#A3A3A3]">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateTab('all-properties', 'Approved');
                }}
                className="hover:underline hover:text-black dark:hover:text-white font-medium"
              >
                {activeProperties.length} live on search
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D] group-hover:text-black dark:group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Card 2: Pending Approvals */}
          <button
            type="button"
            id="admin-card-pending-properties"
            onClick={() => handleNavigateTab('all-properties', 'Pending')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-2xs ${activeTab === 'all-properties' && propertyStatusFilter === 'Pending'
              ? 'bg-neutral-100 dark:bg-[#181818] border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10'
              : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-white hover:shadow-md'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">
                Pending Approvals
              </span>
              <AlertTriangle className="w-4 h-4 text-neutral-800 dark:text-[#E0E0E0]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5] my-1">
              {pendingProperties.length}
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-600 dark:text-[#A3A3A3] font-semibold">
              <span>{pendingProperties.length === 0 ? 'Queue cleared' : 'Requires verification'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500 dark:text-[#7D7D7D] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* Card 3: Total Users */}
          <button
            type="button"
            id="admin-card-users"
            onClick={() => handleNavigateTab('users')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-2xs ${activeTab === 'users'
              ? 'bg-white dark:bg-[#181818] border-black dark:border-white ring-2 ring-black/10 dark:ring-white/10'
              : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-white hover:shadow-md'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-[#A3A3A3] uppercase tracking-wider group-hover:text-black dark:group-hover:text-white transition-colors">
                Total Users
              </span>
              <Users className="w-4 h-4 text-neutral-600 dark:text-[#888888] group-hover:text-black dark:group-hover:text-white transition-colors" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5] my-1">
              {users.length}
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-[#A3A3A3]">
              <span className="truncate">{platformUsersCount} Platform • {adminUsersCount} Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D] group-hover:text-black dark:group-hover:text-white transition-transform group-hover:translate-x-0.5 shrink-0" />
            </div>
          </button>

          {/* Card 4: Open Reports */}
          <button
            type="button"
            id="admin-card-reports"
            onClick={() => handleNavigateTab('reports')}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-2xs ${activeTab === 'reports'
              ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#292929] hover:border-rose-500 hover:shadow-md'
              }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                Open Reports
              </span>
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-800 dark:text-rose-400 my-1">
              {openReports.length}
            </div>
            <div className="flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300 font-semibold">
              <span>{openReports.length === 0 ? 'No active reports' : 'Active investigations'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="bg-neutral-100 dark:bg-[#111111] border border-neutral-200/80 dark:border-[#292929] p-1.5 rounded-2xl flex flex-wrap items-center gap-1 sticky top-20 z-30 overflow-x-auto">
          <button
            type="button"
            id="admin-tab-overview"
            onClick={() => handleNavigateTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Dashboard Overview
          </button>

          <button
            type="button"
            id="admin-tab-all-properties"
            onClick={() => handleNavigateTab('all-properties')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'all-properties'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            All Properties ({properties.length})
          </button>


          <button
            type="button"
            onClick={() => handleNavigateTab('all-properties', 'Approved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'all-properties' && propertyStatusFilter === 'Approved'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Approved Listings ({activeProperties.length})
          </button>
          <button
            type="button"
            onClick={() => handleNavigateTab('all-properties', 'Vacant')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'all-properties' && propertyStatusFilter === 'Vacant'
                ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Vacant Units ({totalVacancies})
          </button>

          <button
            type="button"
            id="admin-tab-pending-properties"
            onClick={() => handleNavigateTab('pending-properties')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'pending-properties'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Pending Listings ({pendingProperties.length})
            {pendingProperties.length > 0 && (
              <span className="ml-1.5 bg-neutral-800 dark:bg-[#333333] text-white text-[9px] px-1.5 py-0.2 rounded-full">
                {pendingProperties.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="admin-tab-reports"
            onClick={() => handleNavigateTab('reports')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'reports'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Dispute Reports ({openReports.length})
            {openReports.length > 0 && (
              <span className="ml-1.5 bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full">
                {openReports.length}
              </span>
            )}
          </button>

          <button
            type="button"
            id="admin-tab-users"
            onClick={() => handleNavigateTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'users'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Registered Users ({users.length})
          </button>

          <button
            type="button"
            id="admin-tab-locations"
            onClick={() => handleNavigateTab('locations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'locations'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Kenya Locations Hierarchy
          </button>

          <button
            type="button"
            id="admin-tab-activity"
            onClick={() => handleNavigateTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'activity'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Activity Log ({adminActivity.length})
          </button>

          <button
            type="button"
            id="admin-tab-settings"
            onClick={() => handleNavigateTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'settings'
              ? 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
              }`}
          >
            Settings
          </button>
        </div>

        {/* Dynamic Active Section Container with ref and scroll margin */}
        <div
          ref={sectionContentRef}
          id="admin-section-content"
          className="scroll-mt-20 sm:scroll-mt-24 focus:outline-none"
          tabIndex={-1}
        >
          {/* Tab 1: Overview & Needs Your Attention */}
          {activeTab === 'overview' && (
            <div id="admin-section-overview" className="space-y-8 scroll-mt-20 sm:scroll-mt-24">
              {/* Needs Your Attention Section */}
              <div className="bg-neutral-50 dark:bg-[#111111] border border-neutral-200 dark:border-[#292929] rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-950 dark:text-[#F5F5F5] font-bold text-base">
                    <AlertTriangle className="w-5 h-5 text-neutral-800 dark:text-neutral-300" />
                    <span>Needs Your Attention</span>
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-[#A3A3A3] font-semibold">
                    {pendingProperties.length + openReports.length} Action Items Pending
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pending listing card */}
                  {pendingProperties[0] ? (
                    <div className="bg-white dark:bg-[#151515] p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-2xs flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-600 dark:text-[#A3A3A3] uppercase tracking-wider block">
                          New Listing Approval
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5F5F5]">{pendingProperties[0].name}</h4>
                        <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                          {pendingProperties[0].location.estate} • Listed by {pendingProperties[0].lister?.name || 'Lister'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedReviewProperty(pendingProperties[0])}
                        className="px-3.5 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer shrink-0"
                      >
                        Review
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#151515] p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] text-xs text-neutral-500 dark:text-[#8A8A8A] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>No pending listings waiting for review.</span>
                    </div>
                  )}

                  {/* Open report card */}
                  {openReports[0] ? (
                    <div className="bg-white dark:bg-[#151515] p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-2xs flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider block">
                          Report Investigation
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5F5F5]">{openReports[0].targetTitle}</h4>
                        <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                          {openReports[0].reason}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedInvestigateReport(openReports[0])}
                        className="px-3.5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 cursor-pointer shrink-0"
                      >
                        Investigate
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-[#151515] p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] text-xs text-neutral-500 dark:text-[#8A8A8A] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>No active dispute reports.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick overview grids */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Listings Quick Preview */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-neutral-950 dark:text-[#F5F5F5]">Pending Listings ({pendingProperties.length})</h3>
                    <button
                      type="button"
                      onClick={() => handleNavigateTab('pending-properties')}
                      className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-[#262626]">
                    {pendingProperties.length === 0 ? (
                      <div className="py-8 text-center text-xs text-neutral-400 dark:text-[#7D7D7D]">
                        All submitted listings are reviewed and cleared.
                      </div>
                    ) : (
                      pendingProperties.slice(0, 3).map((prop) => (
                        <div key={prop.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prop.coverPhoto || prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                              alt={prop.name}
                              className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-[#333333] shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <div>
                              <h4 className="font-bold text-xs text-neutral-900 dark:text-[#F5F5F5]">{prop.name}</h4>
                              <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
                                {prop.location.estate} • KSh {prop.monthlyRent.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedReviewProperty(prop)}
                            className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer shrink-0"
                          >
                            Inspect & Review
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Reports Quick Preview */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-neutral-950 dark:text-[#F5F5F5]">Dispute Reports ({openReports.length})</h3>
                    <button
                      type="button"
                      onClick={() => handleNavigateTab('reports')}
                      className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-neutral-100 dark:divide-[#262626]">
                    {openReports.length === 0 ? (
                      <div className="py-8 text-center text-xs text-neutral-400 dark:text-[#7D7D7D]">
                        No active violation reports.
                      </div>
                    ) : (
                      openReports.slice(0, 3).map((rep) => (
                        <div key={rep.id} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded shrink-0">
                                {rep.type}
                              </span>
                              <span className="font-bold text-xs text-neutral-900 dark:text-[#F5F5F5] truncate">{rep.targetTitle}</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] mt-1 truncate max-w-xs">{rep.reason}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedInvestigateReport(rep)}
                            className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-neutral-200 text-xs font-bold rounded-lg cursor-pointer shrink-0"
                          >
                            Investigate
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Tab: All Properties (Clickable Property Inspector) */}
          {activeTab === 'all-properties' && (
            <div id="admin-section-all-properties" className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-6 scroll-mt-20 sm:scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                    All Properties Inventory ({properties.length})
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
                    Audit and manage verified property listings, vacancies, and ownership records across Kenya.
                  </p>
                </div>

                {/* Status Filter buttons */}
                <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 dark:bg-[#181818] p-1 rounded-xl">
                  {(['All', 'Approved', 'Pending', 'Rejected'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPropertyStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${propertyStatusFilter === status
                        ? 'bg-black dark:bg-white text-white dark:text-black shadow-xs'
                        : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search filter input */}
              <div className="relative max-w-md">
                <Search className="w-4 h-4 text-neutral-400 dark:text-[#7D7D7D] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={propertySearchQuery}
                  onChange={(e) => setPropertySearchQuery(e.target.value)}
                  placeholder="Search by property name, estate, county, or owner..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-[#151515] border border-neutral-200 dark:border-[#292929] text-neutral-900 dark:text-[#F5F5F5] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded-xl text-xs font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                />
              </div>

              {filteredAllProperties.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 dark:text-[#7D7D7D]">
                  No property listings matched your current filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAllProperties.map((prop) => (
                    <div
                      key={prop.id}
                      onClick={() => setSelectedReviewProperty(prop)}
                      className="p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] bg-neutral-50 dark:bg-[#151515] hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={prop.coverPhoto || prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                            alt={prop.name}
                            className="w-full h-36 rounded-xl object-cover border border-neutral-200 dark:border-[#333333]"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <span
                            className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs ${prop.status === 'Approved'
                              ? 'bg-emerald-500 text-white'
                              : prop.status === 'Pending'
                                ? 'bg-neutral-800 text-white'
                                : 'bg-rose-500 text-white'
                              }`}
                          >
                            {prop.status}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-neutral-900 dark:text-[#F5F5F5] group-hover:text-black dark:group-hover:text-white">
                              {prop.name}
                            </h4>
                            <span className="text-[10px] font-bold uppercase bg-neutral-200 dark:bg-[#262626] text-neutral-800 dark:text-[#E0E0E0] px-2 py-0.5 rounded">
                              {prop.type}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] mt-0.5">
                            {prop.location.estate}, {prop.location.county}
                          </p>
                        </div>

                        <div className="bg-white dark:bg-[#111111] p-2.5 rounded-xl border border-neutral-200 dark:border-[#292929] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500 dark:text-[#8A8A8A]">Monthly Rent:</span>
                            <span className="font-bold text-neutral-900 dark:text-[#F5F5F5]">KSh {prop.monthlyRent.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-neutral-500 dark:text-[#8A8A8A]">Occupancy:</span>
                            <span className="font-semibold text-neutral-700 dark:text-[#C5C5C5]">
                              {prop.occupied || 0} occupied • <strong className="text-emerald-700 dark:text-emerald-400">{prop.vacancies} vacant</strong>
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-100 dark:border-[#222222]">
                            <span className="text-neutral-500 dark:text-[#8A8A8A]">Lister:</span>
                            <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] truncate max-w-[140px]">
                              {prop.lister?.name || 'Mary Wanjiku'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-black dark:text-white border-t border-neutral-200 dark:border-[#292929]">
                        <span>Inspect Details & Manage</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Pending Listings Inspection Table */}
          {activeTab === 'pending-properties' && (
            <div id="admin-section-pending-properties" className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4 scroll-mt-20 sm:scroll-mt-24">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                  Pending Property Moderation Queue ({pendingProperties.length})
                </h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
                  Verify location accuracy, pricing reasonableness, and photo quality before publishing.
                </p>
              </div>

              {pendingProperties.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400 dark:text-[#7D7D7D]">
                  Queue is clear. No pending properties waiting for moderation.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingProperties.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] bg-neutral-50/50 dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={prop.coverPhoto || prop.images?.[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'}
                          alt={prop.name}
                          className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-[#333333] shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5F5F5]">{prop.name}</h4>
                            <span className="text-[10px] font-bold bg-neutral-200 dark:bg-[#262626] text-neutral-900 dark:text-[#E0E0E0] px-2 py-0.5 rounded">
                              {prop.type}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-[#8A8A8A]">
                            {prop.location.estate}, {prop.location.subCounty}, {prop.location.county}
                          </p>
                          <p className="text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] mt-1">
                            KSh {prop.monthlyRent.toLocaleString()} / mo • Listed by {prop.lister?.name || 'Lister'} ({prop.lister?.type || 'Owner'})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedReviewProperty(prop)}
                          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer shadow-xs"
                        >
                          Inspect & Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Dispute Reports Table */}
          {activeTab === 'reports' && (
            <div id="admin-section-reports" className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-4 scroll-mt-20 sm:scroll-mt-24">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                  User Violation & Dispute Reports ({reports.length})
                </h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
                  Investigate user complaints regarding unverified viewing fees, fake listings, or unresponsive listers.
                </p>
              </div>

              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] bg-neutral-50 dark:bg-[#151515] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${rep.status === 'open'
                          ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                          : 'bg-neutral-200 dark:bg-[#262626] text-neutral-700 dark:text-[#C5C5C5]'
                          }`}>
                          {rep.status}
                        </span>
                        <span className="font-bold text-sm text-neutral-900 dark:text-[#F5F5F5]">{rep.targetTitle}</span>
                        <span className="text-xs text-neutral-400 dark:text-[#7D7D7D]">• {rep.type}</span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-[#A3A3A3]">{rep.reason}</p>
                      <p className="text-[11px] text-neutral-400 dark:text-[#7D7D7D]">
                        Reported by {rep.reporterCount} users • {formatRelativeTime(rep.createdAt)}
                      </p>
                    </div>

                    {rep.status === 'open' && (
                      <button
                        type="button"
                        onClick={() => setSelectedInvestigateReport(rep)}
                        className="px-4 py-2 bg-neutral-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Investigate Report
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Registered Users (Clickable User Cards with Details Modal) */}
          {activeTab === 'users' && (
            <div id="admin-section-users" className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-6 scroll-mt-20 sm:scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">
                    Registered Users ({users.length})
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
                    Active prototype demo accounts: <strong>{platformUsersCount} Platform Users</strong> (Seeker & Lister) and <strong>{adminUsersCount} Super Admin</strong>. Click any user card to inspect details.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedAdminUser(u)}
                    className="p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] bg-neutral-50 dark:bg-[#151515] hover:border-black dark:hover:border-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-neutral-300 dark:border-[#383838] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-neutral-900 dark:text-[#F5F5F5] truncate group-hover:text-black dark:group-hover:text-white">
                            {u.name}
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] truncate mt-0.5">{u.email}</p>
                        <span
                          className={`inline-block mt-2 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${u.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50'
                            : u.role === 'lister'
                              ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
                              : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                            }`}
                        >
                          {u.role} {u.listerSubtype ? `• ${u.listerSubtype}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-200 dark:border-[#292929] flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-[#C5C5C5] group-hover:text-black dark:group-hover:text-white">
                      <span className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] font-normal">
                        {u.role === 'lister'
                          ? `${properties.filter((p) => p.lister?.id === u.id).length} listings`
                          : u.role === 'seeker'
                            ? '1 saved property'
                            : 'System Admin'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>View Profile</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Kenyan Location Management */}
          {activeTab === 'locations' && (
            <div id="admin-section-locations" className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-6 scroll-mt-20 sm:scroll-mt-24">
              <div>
                <h3 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">Kenya Location Hierarchy Explorer</h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3]">
                  County → Sub-County → Ward → Estate data taxonomy structure
                </p>
              </div>

              {/* County selector */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {allCounties.map((c) => (
                  <button
                    key={c.code || c.name}
                    type="button"
                    onClick={() => setLocationCountyFilter(c.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${locationCountyFilter === c.name
                      ? 'bg-black dark:bg-white text-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-[#181818] hover:bg-neutral-200 dark:hover:bg-[#222222] text-neutral-800 dark:text-[#D5D5D5]'
                      }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Sub-counties and wards breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedCountySubCounties.map((sub) => {
                  const wards = getWardsInSubCounty(sub.name, locationCountyFilter);
                  return (
                    <div key={sub.code || sub.name} className="p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] bg-neutral-50 dark:bg-[#151515] space-y-2">
                      <div className="flex items-center justify-between font-bold text-sm text-neutral-900 dark:text-[#F5F5F5]">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-black dark:text-white shrink-0" />
                          <span>{sub.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-neutral-500 dark:text-[#A3A3A3] bg-neutral-200 dark:bg-[#262626] px-2 py-0.5 rounded-full">
                          {wards.length} Wards
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-neutral-200 dark:border-[#292929] text-xs">
                        {wards.map((w) => (
                          <div key={w.code || w.name} className="bg-white dark:bg-[#111111] p-2 rounded-lg border border-neutral-200 dark:border-[#292929] text-neutral-800 dark:text-[#E0E0E0]">
                            <div className="font-semibold">{w.name} Ward</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 6: Admin Activity Audit Log */}
          {activeTab === 'activity' && (
            <div id="admin-section-activity" className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-6 scroll-mt-20 sm:scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-[#292929]">
                <div>
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5] flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neutral-900 dark:text-[#F5F5F5]" />
                    <span>Administrator Activity Log</span>
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                    Chronological audit trail of listings moderated, accounts suspended/reinstated, and dispute actions.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-[#A3A3A3]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Immutable Audit Trail</span>
                </div>
              </div>

              {adminActivity.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-2xl bg-neutral-50 dark:bg-[#151515] border border-dashed border-neutral-300 dark:border-[#333333]">
                  <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-700 dark:text-[#CCCCCC]">No administrator actions recorded yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Actions taken across approvals, moderation, and user audits will be recorded here.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 dark:divide-[#222222]">
                  {adminActivity.map((act) => {
                    const isApproval = act.action.toLowerCase().includes('approved');
                    const isRejection = act.action.toLowerCase().includes('rejected');
                    const isSuspension = act.action.toLowerCase().includes('suspended') || act.action.toLowerCase().includes('deleted');
                    const isResolution = act.action.toLowerCase().includes('resolved') || act.action.toLowerCase().includes('reinstated');

                    return (
                      <div key={act.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-[#161616] px-3 rounded-xl transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${isApproval ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' :
                            isRejection || isSuspension ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400' :
                              isResolution ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400' :
                                'bg-neutral-100 dark:bg-[#252525] text-neutral-700 dark:text-[#DDDDDD]'
                            }`}>
                            {isApproval ? <CheckCircle2 className="w-4 h-4" /> :
                              isRejection || isSuspension ? <XCircle className="w-4 h-4" /> :
                                isResolution ? <ShieldCheck className="w-4 h-4" /> :
                                  <Activity className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5]">{act.action}</span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-[#262626] text-neutral-700 dark:text-[#CCCCCC]">
                                {act.targetName}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                              {act.details}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-[#777777] shrink-0 sm:text-right">
                          <div>
                            <div className="font-medium text-neutral-600 dark:text-[#A3A3A3]">{act.adminName}</div>
                            <div>{formatRelativeTime(act.timestamp)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 7: Admin Moderation & Security Settings */}
          {activeTab === 'settings' && (
            <div id="admin-section-settings" className="bg-white dark:bg-[#111111] rounded-3xl p-6 border border-neutral-200 dark:border-[#292929] shadow-xs space-y-6 scroll-mt-20 sm:scroll-mt-24">
              <div className="pb-4 border-b border-neutral-200 dark:border-[#292929]">
                <h3 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5] flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-neutral-900 dark:text-[#F5F5F5]" />
                  <span>Platform Moderation & Security Settings</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
                  Configure moderation thresholds, review checklists, Kenyan regulatory compliance rules, and automated safeguards.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel 1: Moderation Controls */}
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] bg-neutral-50 dark:bg-[#151515] space-y-4">
                  <h4 className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Listing Verification Rules</span>
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-[#292929]">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">Mandatory Admin Approval</div>
                        <div className="text-neutral-500 dark:text-[#888888]">New listings require explicit manual verification before search indexing</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-[#292929]">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">Strict Vacancy Enforcement</div>
                        <div className="text-neutral-500 dark:text-[#888888]">Approved listings with 0 vacant units are automatically hidden from Seekers</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        Active
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-[#292929]">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">Title Deed & Utility Bill Audit</div>
                        <div className="text-neutral-500 dark:text-[#888888]">Prompt landlords to supply proof of ownership or agent authorization</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Anti-Spam & Fraud Protection */}
                <div className="p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] bg-neutral-50 dark:bg-[#151515] space-y-4">
                  <h4 className="font-bold text-sm text-neutral-950 dark:text-[#F5F5F5] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neutral-900 dark:text-[#F5F5F5]" />
                    <span>Safety & Anti-Fraud Engine</span>
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-[#292929]">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">Phone & ID Verification</div>
                        <div className="text-neutral-500 dark:text-[#888888]">Kenyan mobile (+254) OTP confirmation on lister onboarding</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-200 dark:bg-[#262626] text-neutral-800 dark:text-[#CCCCCC]">
                        Enforced
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-[#292929]">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">Dispute Flagging Threshold</div>
                        <div className="text-neutral-500 dark:text-[#888888]">Auto-quarantine listings receiving 2 or more unresolved dispute flags</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-200 dark:bg-[#262626] text-neutral-800 dark:text-[#CCCCCC]">
                        2 Reports
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111111] rounded-xl border border-neutral-200 dark:border-[#292929]">
                      <div>
                        <div className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">Private Admin Access</div>
                        <div className="text-neutral-500 dark:text-[#888888]">Administrative portal isolated from public seeker/lister onboarding flows</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        Secure
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Property Review / Inspection Modal */}
      {selectedReviewProperty && (
        <AdminPropertyReviewModal
          property={selectedReviewProperty}
          onClose={() => setSelectedReviewProperty(null)}
        />
      )}

      {/* Dispute Investigation Modal */}
      {selectedInvestigateReport && (
        <InvestigateReportModal
          report={selectedInvestigateReport}
          onClose={() => setSelectedInvestigateReport(null)}
        />
      )}

      {/* User Detail Inspection Modal */}
      {selectedAdminUser && (
        <AdminUserDetailModal
          user={selectedAdminUser}
          properties={properties}
          onClose={() => setSelectedAdminUser(null)}
          onSelectProperty={(prop) => {
            setSelectedAdminUser(null);
            setSelectedReviewProperty(prop);
          }}
          onViewListerProperties={(listerId) => {
            setSelectedAdminUser(null);
            handleNavigateTab('all-properties');
          }}
        />
      )}
    </div>
  );
};
