import React, { useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { useApp } from '../context/AppContext';
import { Map, SlidersHorizontal, ArrowRight, X, Sun, Moon } from 'lucide-react';
const calculateDistanceKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const earthRadiusKm = 6371;

  const toRadians = (degrees: number) =>
    degrees * (Math.PI / 180);

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};
const PropertyCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 animate-pulse">
    {/* Image */}
    <div className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-800" />

    {/* Property details */}
    <div className="p-3 space-y-2">
      <div className="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />

      <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />

      <div className="h-3 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />

      <div className="flex gap-2 pt-1">
        <div className="h-5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-5 w-14 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>
    </div>
  </div>
);
export const TenantHomeView: React.FC = () => {
  const {
    currentUser,
    filteredProperties,
    isPropertiesLoading,
    filters,
    resetFilters,
    isFilterActive,
    setCurrentView,
    setSelectedPropertyId,
    seekerLocation,
    resolvedTheme,
    toggleTheme,
  } = useApp();
  const isDark = resolvedTheme === 'dark';

  // 5. Dynamic Greeting Calculation based on device/local time
  const dynamicGreeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 18) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 18) {
      timeGreeting = 'Good evening';
    }

    const firstName = currentUser?.name
      ? currentUser.name.trim().split(' ')[0]
      : 'Seeker';

    return `${timeGreeting}, ${firstName}`;
  }, [currentUser]);

  // Newly listed listings (using verified active filtered properties)
  const newlyListed = useMemo(() => {
    return [...filteredProperties];
  }, [filteredProperties]);

  // Properties Near You (real geolocation/proximity ordering)
  const propertiesNearYou = useMemo(() => {
    if (!seekerLocation) return [];

    return [...filteredProperties]
      .filter(
        (property) =>
          Number.isFinite(property.location?.lat) &&
          Number.isFinite(property.location?.lng)
      )
      .map((property) => ({
        property,
        distanceKm: calculateDistanceKm(
          seekerLocation.lat,
          seekerLocation.lng,
          property.location.lat,
          property.location.lng
        ),
      }))
      .filter((item) => item.distanceKm <= 50)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 6)
      .map((item) => item.property);
  }, [filteredProperties, seekerLocation]);
  return (
    <div className="min-h-screen w-full max-w-full min-w-0 overflow-x-clip overscroll-x-none touch-pan-y pb-24 text-neutral-900 dark:text-neutral-100 transition-colors">
      <main className="w-full min-w-0 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-2 sm:space-y-3">
        {/* 4. CLEAN TEXT-BASED INTRODUCTION (No giant photographic background) */}

        <section
          id="seeker-hero-intro"
          className="
    sticky top-0 z-40
    w-full
    space-y-3 sm:space-y-4
    bg-[var(--rentike-bg)]
    py-3
    border-b border-transparent
  "
        >

          {/* 5. Dynamic Greeting (Subtle charcoal / medium grey, no gold/brown) */}
          <div className="flex items-center justify-between gap-3">
            <div
              id="seeker-dynamic-greeting"
              className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
            >
              {dynamicGreeting}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="sm:hidden flex items-center rounded-full border border-[#E2D3C2] dark:border-neutral-700 bg-[#F7F3EC] dark:bg-[#181818] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
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
                  : 'text-[#B8792B]'
                  }`}
              >
                <Moon className="w-4 h-4" />
              </span>
            </button>
          </div>

          {/* 6. Main Heading (Cormorant Garamond editorial font) */}
          <h1
            id="seeker-main-heading"
            className="font-editorial font-serif text-3xl sm:text-4xl lg:text-[44px] leading-[1.05] tracking-[-0.02em] font-normal"
          >
            Find your <span className="text-[var(--rentike-bronze)] font-bold">Next Home</span>
          </h1>




          {/* 8. Search + Filter Area (Slim, elegant, 46-50px height) */}
          <div className="mt-5 w-full max-w-5xl">
            <SearchBar
              showFiltersButton={true}
              placeholder="Search by location or property name"
              onSearchSubmit={() => {
                // Keep the search focused on current page or allow exploration
              }}
            />
          </div>
        </section>


        {/* Active Filters Notification Pill */}
        {isFilterActive && (
          <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 sm:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-neutral-900 dark:text-white">Active Filters:</span>
              {filters.searchQuery && (
                <span className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded-md font-semibold">
                  "{filters.searchQuery}"
                </span>
              )}
              {filters.estate && (
                <span className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded-md font-semibold">
                  {filters.estate}
                </span>
              )}
              {filters.propertyType && (
                <span className="bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 rounded-md font-semibold">
                  {filters.propertyType}
                </span>
              )}
              {filters.maxRent !== '' && (
                <span className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded-md font-semibold">
                  Up to KSh {Number(filters.maxRent).toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'home found' : 'homes found'}
              </span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
                Properties Near You
              </h2>


            </div>


          </div>
          <button
            type="button"
            aria-label="View all nearby properties"
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--rentike-bronze)] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C] transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </button>


        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-5 md:overflow-visible md:snap-none md:pb-0">
          {isPropertiesLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <PropertyCardSkeleton key={`near-skeleton-${index}`} />
            ))
          ) : propertiesNearYou.length > 0 ? (
            propertiesNearYou.map((prop) => (
              <div
                key={`near-${prop.id}`}
                className="flex-none w-[64%] sm:w-[280px] snap-start md:w-auto md:min-w-0 md:snap-none"
              >
                <PropertyCard property={prop} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                No properties within 50 km of your current location.
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                Try exploring the map or enable location access to see nearby rentals.
              </p>
            </div>
          )}
        </div>
        {/* 9. NEWLY LISTED SECTION */}
        <section id="newly-listed-section" className="space-y-5">
          <div className="flex items-end justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                {isFilterActive ? 'Filtered Results' : 'Newly Listed'}
              </h2>

            </div>

            <button
              type="button"
              id="newly-listed-view-map-btn"
              onClick={() => {
                setSelectedPropertyId(null);
                setCurrentView('map-explore');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100 hover:text-black dark:hover:text-white cursor-pointer group"
            >

              <ArrowRight className="w-3.5 h-3.5 text-[var(--rentike-bronze)] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {newlyListed.length === 0 ? (
            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-10 text-center border border-neutral-200 dark:border-neutral-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto border border-neutral-200 dark:border-neutral-700">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">No rental properties match your search</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try widening your price range, choosing a different estate or resetting your filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
              {isPropertiesLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div

                    className="flex-none w-[64%] sm:w-[280px] snap-start"
                  >
                    <PropertyCardSkeleton />
                  </div>
                ))
              ) : (
                newlyListed.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex-none w-[64%] sm:w-[280px] snap-start"
                  >
                    <PropertyCard property={prop} />
                  </div>
                ))
              )}
            </div>
          )}
        </section>


      </main>
    </div>
  );
};
