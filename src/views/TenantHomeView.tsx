import React, { useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { BnbCard } from '../components/BnbCard';
import { useApp, type HomeCategory } from '../context/AppContext';
import {
  Map,
  SlidersHorizontal,
  ArrowRight,
  X,
  Sun,
  Moon,
  LayoutGrid,
  House,
  BedDouble,
  Store
} from 'lucide-react';
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
// The home tabs and the filter drawer share one setting in AppContext (homeCategory).
type HomeTab = 'All' | 'Rentals' | 'BnBs' | 'Commercial';
const TAB_TO_CATEGORY: Record<HomeTab, HomeCategory> = {
  All: 'all',
  Rentals: 'rentals',
  BnBs: 'bnbs',
  Commercial: 'commercial',
};
const CATEGORY_TO_TAB: Record<HomeCategory, HomeTab> = {
  all: 'All',
  rentals: 'Rentals',
  bnbs: 'BnBs',
  commercial: 'Commercial',
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
    filteredBnbs,
    homeCategory,
    setHomeCategory,
    bnbFilters,
    isBnbFilterActive,
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
  const activeTab = CATEGORY_TO_TAB[homeCategory];
  const setActiveTab = (tab: HomeTab) => setHomeCategory(TAB_TO_CATEGORY[tab]);
  // BnBs follow the search box, the location filters and the BnB filters.
  const availableBnbs = filteredBnbs;
  const showBnbFilterPill = activeTab === 'BnBs' && isBnbFilterActive;
  const isDark = resolvedTheme === 'dark';
  const hasLocationFilter = Boolean(
    filters.county ||
    filters.subCounty ||
    filters.ward ||
    filters.estate
  );

  // 5. Dynamic Greeting Calculation based on device/local time
  const dynamicGreeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 18) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 18) {
      timeGreeting = 'Good evening';
    }

    const displayName = currentUser?.name?.trim() || 'Seeker';

    return `${timeGreeting}, ${displayName}`;
  }, [currentUser]);

  // Newly listed listings (using verified active filtered properties)

  const newlyListed = useMemo(() => {
    const rentals = filteredProperties.filter(
      (p) => p.type !== 'Commercial / Shop'
    );

    const commercial = filteredProperties.filter(
      (p) => p.type === 'Commercial / Shop'
    );

    switch (activeTab) {
      case 'Rentals':
        return rentals;

      case 'BnBs':
        return availableBnbs;

      case 'Commercial':
        return commercial;

      case 'All':
      default:
        return filteredProperties;
    }
  }, [filteredProperties, availableBnbs, activeTab]);


  // Properties Near You (real geolocation/proximity ordering)
  const propertiesNearYou = useMemo(() => {
    if (!seekerLocation) return [];


    const nearbyCandidates =
      activeTab === 'BnBs'
        ? availableBnbs
        : activeTab === 'Commercial'
          ? filteredProperties.filter(
            (p) => p.type === 'Commercial / Shop'
          )
          : activeTab === 'Rentals'
            ? filteredProperties.filter(
              (p) => p.type !== 'Commercial / Shop'
            )
            : [...filteredProperties, ...availableBnbs];

    return [...nearbyCandidates]

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
  }, [filteredProperties, availableBnbs, seekerLocation, activeTab]);
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
              mode="home"
              showFiltersButton={true}
              placeholder="Search by location or property name"
              onSearchSubmit={() => {
                // Keep the search focused on current page or allow exploration
              }}
            />
          </div>


          {/* Property Category Tabs */}
          <div className="mt-4 flex w-full gap-2 overflow-x-auto pb-1">
            {(['All', 'Rentals', 'BnBs', 'Commercial'] as const).map((tab) => {
              const TabIcon = {
                All: LayoutGrid,
                Rentals: House,
                BnBs: BedDouble,
                Commercial: Store,
              }[tab];

              const iconColor = {
                All: 'text-[#6B6259]',
                Rentals: 'text-[#C49A6C]',
                BnBs: 'text-[#2563EB]',
                Commercial: 'text-[#16A34A]',
              }[tab];

              const activeColor = {
                All: 'bg-[#C49A6C] text-black shadow-sm',
                Rentals: 'bg-[#242424] text-white shadow-sm',
                BnBs: 'bg-[#2563EB] text-white shadow-sm',
                Commercial: 'bg-[#16A34A] text-white shadow-sm',
              }[tab];

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={activeTab === tab}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${activeTab === tab
                    ? activeColor
                    : 'border border-[#E2D3C2] bg-transparent text-[#6B6259] hover:bg-[#F0E8DD] dark:border-[#38312A] dark:text-[#D6C8B7] dark:hover:bg-[#252525]'
                    }`}
                >

                  <TabIcon className={`h-4 w-4 ${activeTab === tab && tab !== 'All'
                    ? 'text-white'
                    : iconColor
                    }`} />

                  {tab}
                </button>
              );
            })}
          </div>


        </section>


        {/* Active Filters Notification Pill */}
        {(isFilterActive || showBnbFilterPill) && (
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
              {filters.propertyType && activeTab !== 'BnBs' && (
                <span className="bg-black text-white dark:bg-white dark:text-black px-2.5 py-1 rounded-md font-semibold">
                  {filters.propertyType}
                </span>
              )}
              {filters.maxRent !== '' && activeTab !== 'BnBs' && (
                <span className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded-md font-semibold">
                  Up to KSh {Number(filters.maxRent).toLocaleString()}
                </span>
              )}
              {activeTab === 'BnBs' &&
                [
                  filters.county || null,
                  bnbFilters.minGuests > 0 ? `${bnbFilters.minGuests}+ guests` : null,
                  bnbFilters.minBedrooms > 0
                    ? `${bnbFilters.minBedrooms}+ ${bnbFilters.minBedrooms === 1 ? 'bedroom' : 'bedrooms'}`
                    : null,
                  bnbFilters.minPrice !== '' || bnbFilters.maxPrice !== ''
                    ? bnbFilters.maxPrice === ''
                      ? `From KSh ${Number(bnbFilters.minPrice).toLocaleString()}/night`
                      : bnbFilters.minPrice === ''
                        ? `Up to KSh ${Number(bnbFilters.maxPrice).toLocaleString()}/night`
                        : `KSh ${Number(bnbFilters.minPrice).toLocaleString()}–${Number(bnbFilters.maxPrice).toLocaleString()}/night`
                    : null,
                  bnbFilters.freeTonight ? 'Free tonight' : null,
                  bnbFilters.checkIn
                    ? bnbFilters.checkOut
                      ? `${bnbFilters.checkIn} → ${bnbFilters.checkOut}`
                      : `From ${bnbFilters.checkIn}`
                    : null,
                  bnbFilters.amenities.length > 0
                    ? `${bnbFilters.amenities.length} ${bnbFilters.amenities.length === 1 ? 'amenity' : 'amenities'}`
                    : null,
                ]
                  .filter((label): label is string => Boolean(label))
                  .map((label) => (
                    <span
                      key={label}
                      className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-2.5 py-1 rounded-md font-semibold"
                    >
                      {label}
                    </span>
                  ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-bold">
                {activeTab === 'BnBs'
                  ? `${availableBnbs.length} ${availableBnbs.length === 1 ? 'BnB found' : 'BnBs found'}`
                  : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'home found' : 'homes found'}`}
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
        {!hasLocationFilter && (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white">
                    Explore Nearby
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
                    {prop.type === 'BnB' ? (
                      <BnbCard
                        property={prop}
                        onOpen={() => {
                          setSelectedPropertyId(prop.id);
                          setCurrentView('property-detail');
                        }}
                      />
                    ) : (
                      <PropertyCard property={prop} />
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center">
                  <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">

                    {{
                      All: 'No available spaces within 50 km.',
                      Rentals: 'No available rentals within 50 km.',
                      BnBs: 'No available BnBs within 50 km.',
                      Commercial: 'No available commercial spaces within 50 km.',
                    }[activeTab]}

                  </p>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                    {activeTab === 'BnBs'
                      ? 'See the newest BnBs below.'
                      : 'Turn on Location Services on your device or Explore the Map'}
                  </p>
                </div>
              )}
            </div>

            <div className="my-5 border-t border-neutral-200 dark:border-neutral-800" />
          </>
        )}
        {/* 9. NEWLY LISTED SECTION */}
        {activeTab !== 'BnBs' && (
          <section id="newly-listed-section" className="space-y-5">
            <div className="flex items-end justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex flex-1 items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">

                  {isFilterActive
                    ? 'Filtered Results'
                    : activeTab === 'Rentals'
                      ? 'New Rentals'
                      : activeTab === 'All'
                        ? 'New Rentals'
                        : 'Newly Listed'}

                </h2>

                {newlyListed.length > 1 && (
                  <p className="shrink-0 text-xs font-medium text-[#B8792B] sm:hidden">
                    Swipe to explore →
                  </p>
                )}

              </div>


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
        )}

        {/* NEW BNBS SECTION */}
        {(activeTab === 'All' || activeTab === 'BnBs') && (
          <section id="new-bnbs-section" className="space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2 dark:border-neutral-800">

              <div>
                <h2 className="text-xl font-bold text-neutral-950 dark:text-white sm:text-2xl">
                  New BnBs
                </h2>

                {availableBnbs.length > 1 && (
                  <p className="mt-1 text-xs font-medium text-[#2563EB] sm:hidden">
                    Swipe to explore →
                  </p>
                )}
              </div>


            </div>

            {availableBnbs.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
                {availableBnbs.map((bnb) => (
                  <div
                    key={bnb.id}
                    className="flex-none w-[64%] sm:w-[280px] snap-start"
                  >
                    <BnbCard
                      property={bnb}
                      onOpen={() => {
                        setSelectedPropertyId(bnb.id);
                        setCurrentView('property-detail');
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-sm text-neutral-500">
                  {isFilterActive || isBnbFilterActive
                    ? 'No BnBs match your search or filters.'
                    : 'No BnBs available at the moment.'}
                </p>
                {(isFilterActive || isBnbFilterActive) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </section>
        )}



      </main>
    </div>
  );
};
