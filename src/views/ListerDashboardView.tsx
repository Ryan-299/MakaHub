import React, { useMemo } from 'react';
import {
  Building2,
  Key,
  Eye,
  MessageSquare,
  PlusCircle,
  ArrowRight,
  User,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Star
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ListerDashboardView: React.FC = () => {
  const {
    currentUser,
    listerListings = [],
    listerTotalVacancies = 0,
    listerEnquiries = [],
    setCurrentView,
    setSelectedPropertyId,
    setTargetEnquiryId,
    setListerListingsFilter
  } = useApp();

  // 1. ACTIVE LISTINGS: Calculate active/live listings belonging strictly to the logged-in lister
  const activeListings = useMemo(
    () => listerListings.filter((p) => p.status === 'Approved'),
    [listerListings]
  );
  const activeListingsCount = activeListings.length;

  // 2. LOCATION SUBTITLE: Dynamically derive the counties represented by the lister's active listings
  const locationSubtitle = useMemo(() => {
    const counties = Array.from(
      new Set(
        activeListings
          .map((p) => p.location?.county?.trim())
          .filter((c): c is string => Boolean(c))
      )
    );

    if (counties.length === 0) {
      return listerListings.length > 0 ? 'Across your managed properties' : 'Across your managed properties';
    }
    if (counties.length === 1) {
      return `Across ${counties[0]}`;
    }
    if (counties.length === 2) {
      return `Across ${counties[0]} & ${counties[1]}`;
    }
    if (counties.length === 3) {
      return `Across ${counties[0]}, ${counties[1]} & ${counties[2]}`;
    }
    return `Across ${counties.length} counties`;
  }, [activeListings, listerListings.length]);

  // 3. TOTAL VACANCIES: Calculated dynamically from logged-in lister's properties
  const totalVacancies = useMemo(
    () => listerListings.reduce((sum, p) => sum + (Number(p.vacancies) || 0), 0),
    [listerListings]
  );

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-[#000000] pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* 33. Greeting & Quick Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#262626]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black px-2.5 py-0.5 rounded">
                Lister Portal
              </span>
              <span className="text-xs text-neutral-500 dark:text-[#8A8A8A] font-semibold">
                {currentUser?.listerSubtype || 'Landlord / Property Owner'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight mt-1">
              {getGreeting()}, {currentUser?.name || 'Mary'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] mt-0.5">
              Here is what is happening across your rental properties today.
            </p>
          </div>

          {/* Clean Lister Actions: Add New Listing */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              id="btn-lister-add-property-primary"
              onClick={() => setCurrentView('add-property')}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Listing</span>
            </button>
          </div>
        </div>

        {/* 34. SUMMARY STATISTICS TILES (Active Listings, Total Vacancies, Views This Month, Enquiries) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile 1: Active Listings (Clickable -> My Listings / Active) */}
          <button
            type="button"
            id="lister-stat-active-listings"
            onClick={() => {
              setListerListingsFilter('active');
              setCurrentView('my-listings');
            }}
            className="w-full text-left bg-white dark:bg-[#111111] hover:bg-[#F7F7F7] dark:hover:bg-[#181818] active:bg-neutral-100 dark:active:bg-[#202020] p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] hover:border-neutral-300 dark:hover:border-[#383838] shadow-xs space-y-2 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
                Active Listings
              </span>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#181818] flex items-center justify-center text-neutral-800 dark:text-[#E0E0E0]">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
              {activeListingsCount}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] truncate" title={locationSubtitle}>
              {locationSubtitle}
            </p>
          </button>

          {/* Tile 2: Total Vacancies (Clickable -> My Listings / Vacancies > 0) */}
          <button
            type="button"
            id="lister-stat-total-vacancies"
            onClick={() => {
              setListerListingsFilter('vacancies');
              setCurrentView('my-listings');
            }}
            className="w-full text-left bg-white dark:bg-[#111111] hover:bg-[#F7F7F7] dark:hover:bg-[#181818] active:bg-neutral-100 dark:active:bg-[#202020] p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] hover:border-neutral-300 dark:hover:border-[#383838] shadow-xs space-y-2 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
                Total Vacancies
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Key className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
              {totalVacancies}
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Available for rent</p>
          </button>

          {/* Tile 3: Views This Month (Disabled / Non-clickable until real analytics exist) */}
          <div
            id="lister-stat-views-month"
            aria-disabled="true"
            className="w-full text-left bg-white dark:bg-[#111111] opacity-80 p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] shadow-xs space-y-2 cursor-default select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
                Views This Month
              </span>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#181818] flex items-center justify-center text-neutral-800 dark:text-[#E0E0E0]">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
              —
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
              Analytics available after launch
            </p>
          </div>

          {/* Tile 4: Seeker Enquiries (Clickable -> Enquiries) */}
          <button
            type="button"
            id="lister-stat-seeker-enquiries"
            onClick={() => {
              setTargetEnquiryId(null);
              setCurrentView('lister-enquiries');
            }}
            className="w-full text-left bg-white dark:bg-[#111111] hover:bg-[#F7F7F7] dark:hover:bg-[#181818] active:bg-neutral-100 dark:active:bg-[#202020] p-5 rounded-2xl border border-neutral-200 dark:border-[#292929] hover:border-neutral-300 dark:hover:border-[#383838] shadow-xs space-y-2 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 dark:text-[#8A8A8A] uppercase tracking-wider">
                Seeker Enquiries
              </span>
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#181818] flex items-center justify-center text-neutral-800 dark:text-[#E0E0E0]">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
              {listerEnquiries.length}
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">Direct tenant leads</p>
          </button>
        </div>

        {/* Main Lister Content: Quick Listings & Recent Enquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Managed Properties (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">My Managed Properties</h2>
              <button
                type="button"
                onClick={() => {
                  setListerListingsFilter('all');
                  setCurrentView('my-listings');
                }}
                className="text-xs font-bold text-black dark:text-white hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Listings ({listerListings.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {listerListings.length === 0 ? (
                <div className="bg-white dark:bg-[#111111] p-8 rounded-2xl border border-neutral-200 dark:border-[#292929] text-center space-y-3 shadow-2xs">
                  <Building2 className="w-10 h-10 text-neutral-400 dark:text-[#7D7D7D] mx-auto" />
                  <p className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5]">No properties listed yet</p>
                  <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] max-w-xs mx-auto">
                    Create your first property listing to track vacancies and view analytics.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentView('add-property')}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
                  >
                    + Add New Listing
                  </button>
                </div>
              ) : (
                listerListings.slice(0, 3).map((prop) => (
                  <div
                    key={prop.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedPropertyId(prop.id);
                      setCurrentView('property-detail');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPropertyId(prop.id);
                        setCurrentView('property-detail');
                      }
                    }}
                    className="bg-white dark:bg-[#111111] p-4 rounded-2xl border border-neutral-200 dark:border-[#292929] hover:border-black dark:hover:border-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:shadow-md cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <img
                        src={
                          prop.coverPhoto ||
                          prop.images?.[0] ||
                          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={prop.name}
                        className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-[#292929] shrink-0 group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-900 dark:text-[#F5F5F5] group-hover:text-neutral-700 dark:group-hover:text-white transition-colors truncate">
                            {prop.name}
                          </span>
                          <span className="text-[10px] bg-neutral-100 dark:bg-[#181818] text-neutral-800 dark:text-[#E0E0E0] font-semibold px-2 py-0.5 rounded shrink-0">
                            {prop.type}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] truncate">
                          {prop.location.estate}, {prop.location.subCounty}
                        </p>
                        <p className="text-xs font-extrabold text-neutral-950 dark:text-[#F5F5F5] mt-1">
                          KSh {prop.monthlyRent.toLocaleString()} / mo
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-[#262626] gap-1.5 shrink-0">
                      <div className="text-xs font-bold">
                        {prop.vacancies > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                            {prop.vacancies} Vacant
                          </span>
                        ) : (
                          <span className="text-neutral-500 dark:text-[#8A8A8A] bg-neutral-100 dark:bg-[#181818] px-2.5 py-1 rounded-md">
                            Fully Occupied
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-neutral-500 dark:text-[#8A8A8A] group-hover:text-black dark:group-hover:text-white font-semibold flex items-center gap-1 transition-colors">
                        View Public Card →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 35. RECENT ENQUIRIES LIST (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-950 dark:text-[#F5F5F5]">Recent Enquiries</h2>
              <button
                type="button"
                onClick={() => setCurrentView('lister-enquiries')}
                className="text-xs font-bold text-black dark:text-white hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-3xl p-5 border border-neutral-200 dark:border-[#292929] shadow-xs divide-y divide-neutral-100 dark:divide-[#262626]">
              {listerEnquiries.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400 dark:text-[#7D7D7D]">
                  No enquiries yet.
                </div>
              ) : (
                listerEnquiries.slice(0, 4).map((enq) => (
                  <div key={enq.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
                          {enq.seekerName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] block leading-tight">{enq.seekerName}</span>
                          <span className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">{enq.propertyName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 dark:text-[#7D7D7D]">{enq.createdAt}</span>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-[#D4D4D4] bg-neutral-50 dark:bg-[#181818] p-2.5 rounded-xl border border-neutral-100 dark:border-[#262626] leading-relaxed italic">
                      "{enq.message}"
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${enq.seekerPhone}`}
                        className="flex-1 py-1.5 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call {enq.seekerPhone}</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

