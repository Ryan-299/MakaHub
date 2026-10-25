import React, { useEffect, useMemo, useState } from 'react';
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
  Star,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const AnimatedCount: React.FC<{ value: number; duration?: number }> = ({
  value,
  duration = 1200,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Number(value) || 0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(target);
      return;
    }

    let animationFrame: number;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Smooth ease-out animation
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(target * easedProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
};


export const ListerDashboardView: React.FC = () => {
  const {
    currentUser,
    listerListings = [],
    listerTotalVacancies = 0,
    listerEnquiries = [],
    setCurrentView,
    setSelectedPropertyId,
    setTargetEnquiryId,
    setListerListingsFilter,
    resolvedTheme,
    toggleTheme
  } = useApp();

  const isDark = resolvedTheme === 'dark';
  const viewsThisMonth = useQuery(api.properties.getViewsThisMonth);
  const viewsBreakdown = useQuery(api.properties.getViewsBreakdownThisMonth);
  const [viewsBreakdownOpen, setViewsBreakdownOpen] = useState(false);

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
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--rentike-bg)] pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* 33. RENTIKE LISTER DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 pb-6 border-b border-[#E5DCD0] dark:border-neutral-800">

          {/* Greeting and dashboard title */}
          <div className="min-w-0 flex flex-col items-start">

            <div className="w-full flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                {getGreeting()}, {currentUser?.name || 'there'}
              </span>


              <span className="px-2 py-1 rounded-full bg-[#EBDFD1] dark:bg-[#30271F] text-[#946B46] dark:text-[#C49A6C] text-[9px] font-bold uppercase tracking-wider">
                {currentUser?.listerSubtype || 'Lister'}
              </span>

              {/* Mobile theme toggle — matches seeker homepage */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="
    sm:hidden ml-auto shrink-0
    flex items-center
    rounded-full p-1
    border border-[#E2D3C2] dark:border-neutral-700
    bg-[#F7F3EC] dark:bg-[#181818]
    shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_9px_rgba(255,255,255,0.85)]
    dark:shadow-[4px_4px_10px_rgba(0,0,0,0.6)]
    transition-colors
  "
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${!isDark
                    ? 'bg-white text-neutral-600 shadow-sm'
                    : 'text-neutral-500'
                    }`}
                >
                  <Sun className="w-4 h-4" />
                </span>

                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark
                    ? 'bg-[#C49A6C] text-white shadow-sm'
                    : 'text-[#B88792]'
                    }`}
                >
                  <Moon className="w-4 h-4" />
                </span>
              </button>

            </div>

            <h1
              className="
        font-editorial font-semibold
        text-[34px] sm:text-[42px] lg:text-[48px]
        leading-[1.05] tracking-tight
        text-[#111111] dark:text-[#F5F5F5]
      "
            >
              Your{' '}
              <span className="text-[var(--rentike-bronze)]">
                Dashboard
              </span>
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              Manage your properties, vacancies and enquiries.
            </p>
          </div>


          {/* Compact neumorphic Add New Listing button */}
          <div className="w-fit shrink-0">
            <button
              type="button"
              id="btn-lister-add-property-primary"
              onClick={() => setCurrentView('add-property')}
              className="
      inline-flex items-center justify-center gap-2.5
      w-auto px-3 py-2
      rounded-xl
      bg-[#F7F3EC] dark:bg-[#181818]
      text-[#242424] dark:text-[#F5F1E8]
      border border-[#E2D3C2] dark:border-[#34302B]
      shadow-[4px_4px_10px_rgba(0,0,0,0.10),-3px_-3px_8px_rgba(255,255,255,0.85)]
      dark:shadow-[4px_4px_12px_rgba(0,0,0,0.55)]
      hover:border-[#C49A6C]
      transition-all duration-200
      active:scale-[0.97]
      cursor-pointer
    "
            >
              <span
                className="
        flex items-center justify-center
        w-8 h-8 rounded-lg
        bg-[#EBDFD0] dark:bg-[#352A21]
        text-[#946B46] dark:text-[#C49A6C]
      "
              >
                <PlusCircle className="w-4 h-4" />
              </span>

              <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                Add New Listing
              </span>

              <ArrowRight className="w-3.5 h-3.5 text-[#A67C52] dark:text-[#C49A6C]" />
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
              <AnimatedCount value={activeListingsCount} />
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
              <AnimatedCount value={totalVacancies} />
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Available for rent</p>
          </button>

          {/* Tile 3: Views This Month (Disabled / Non-clickable until real analytics exist) */}
          <button
            id="lister-stat-views-month"
            type="button"
            onClick={() => setViewsBreakdownOpen(true)}
            className="w-full text-left bg-white dark:bg-[#111111] opacity-80 p-5 sm:p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800"
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
              {viewsThisMonth === undefined
                ? '—'
                : <AnimatedCount value={viewsThisMonth} />
              }
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">
              Unique seeker views this month
            </p>
          </button>
          {viewsBreakdownOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
              onClick={() => setViewsBreakdownOpen(false)}
            >
              <div
                className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#111111]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                      Views This Month
                    </p>

                    <p className="mt-1 text-3xl font-extrabold text-neutral-950 dark:text-white">
                      {viewsThisMonth ?? 0}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      Unique seeker views
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewsBreakdownOpen(false)}
                    className="text-sm font-medium text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3">
                  {activeListings.map((property) => {
                    const propertyViews =
                      viewsBreakdown?.find(
                        (item) => String(item.propertyId) === String(property.id)
                      )?.views ?? 0;

                    return (
                      <div
                        key={property.id}
                        className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800"
                      >
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {property.name}
                        </span>

                        <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                          {propertyViews} {propertyViews === 1 ? 'view' : 'views'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
              <AnimatedCount value={listerEnquiries.length} />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-[#8A8A8A]">Direct tenant leads</p>
          </button>
        </div>


      </div>
    </div>
  );
};
