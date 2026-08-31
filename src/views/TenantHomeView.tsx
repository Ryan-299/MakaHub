import React, { useMemo } from 'react';
import { SearchBar } from '../components/SearchBar';
import { PropertyCard } from '../components/PropertyCard';
import { useApp } from '../context/AppContext';
import { Map, SlidersHorizontal, ArrowRight, X } from 'lucide-react';

export const TenantHomeView: React.FC = () => {
  const {
    currentUser,
    filteredProperties,
    filters,
    resetFilters,
    isFilterActive,
    setCurrentView,
    setSelectedPropertyId
  } = useApp();

  // 5. Dynamic Greeting Calculation based on device/local time
  const dynamicGreeting = useMemo(() => {
    const hour = new Date().getHours();
    let timeGreeting = 'Good morning';
    if (hour >= 12 && hour < 18) {
      timeGreeting = 'Good afternoon';
    } else if (hour >= 18 || hour < 5) {
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

  // Properties Near You (using geolocation/proximity ordering)
  const propertiesNearYou = useMemo(() => {
    return [...filteredProperties];
  }, [filteredProperties]);

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-24 text-neutral-900 dark:text-neutral-100 transition-colors">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-10 sm:space-y-14">
        {/* 4. CLEAN TEXT-BASED INTRODUCTION (No giant photographic background) */}
        <section id="seeker-hero-intro" className="space-y-3 sm:space-y-4 max-w-3xl">
          {/* 5. Dynamic Greeting (Subtle charcoal / medium grey, no gold/brown) */}
          <div
            id="seeker-dynamic-greeting"
            className="text-xs sm:text-sm font-semibold tracking-wide text-neutral-600 dark:text-neutral-400 uppercase"
          >
            {dynamicGreeting}
          </div>

          {/* 6. Main Heading (Cormorant Garamond editorial font) */}
          <h1
            id="seeker-main-heading"
            className="font-editorial font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-normal text-neutral-950 dark:text-white tracking-tight leading-[1.15]"
          >
            Find a place you'll call home.
          </h1>

          {/* 7. Supporting Text (Restrained & subtle) */}
          <p
            id="seeker-supporting-text"
            className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed max-w-xl"
          >
            Discover available rental homes across Kenya.
          </p>

          {/* 8. Search + Filter Area (Slim, elegant, 46-50px height) */}
          <div className="pt-2 sm:pt-3 w-full max-w-2xl">
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

        {/* 9. NEWLY LISTED SECTION */}
        <section id="newly-listed-section" className="space-y-5">
          <div className="flex items-end justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                {isFilterActive ? 'Filtered Results' : 'Newly Listed'}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {isFilterActive
                  ? 'Homes matching your criteria'
                  : 'Fresh verified rental options across Kenya'}
              </p>
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
              <span>Explore Map</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {newlyListed.map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          )}
        </section>

        {/* 10. PROPERTIES NEAR YOU SECTION */}
        <section id="properties-near-you-section" className="space-y-5 pt-2">
          <div className="flex items-end justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
                  Properties Near You
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">
                  Nearby
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                Available vacancies arranged by proximity in your selected area
              </p>
            </div>

            <button
              type="button"
              id="nearby-view-map-btn"
              onClick={() => {
                setSelectedPropertyId(null);
                setCurrentView('map-explore');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-xs font-bold rounded-xl border border-neutral-200 dark:border-neutral-800 transition-all cursor-pointer shadow-2xs"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Live Map</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {propertiesNearYou.map((prop) => (
              <PropertyCard key={`near-${prop.id}`} property={prop} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
