import React, { useState, useEffect } from 'react';
import { InteractiveMap } from '../components/InteractiveMap';
import { PropertyCard } from '../components/PropertyCard';
import { SearchBar } from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import {
  LayoutList,
  Map as MapIcon,
  SlidersHorizontal,
  ArrowLeft,
  RotateCcw,
  X,
  Building,
  MapPin,
  Sparkles,
  Search
} from 'lucide-react';
import { PropertyListing } from '../types';

export const MapExploreView: React.FC = () => {
  const {
    filteredProperties,
    selectedPropertyId,
    setSelectedPropertyId,
    setFilterDrawerOpen,
    setCurrentView,
    filters,
    setFilters,
    isFilterActive,
    resetFilters
  } = useApp();

  // Mode: 'split' (Map on top + Results below, the default required seeker experience),
  // 'map' (Full map only), or 'list' (List cards only)
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Ensure clean state on entering
  useEffect(() => {
    setSelectedPropertyId(null);
  }, []);

  const handleSelectProperty = (prop: PropertyListing | null) => {
    setSelectedPropertyId(prop ? prop.id : null);
  };

  // Handlers to remove individual active filter chips
  const removeSearchQuery = () => {
    setFilters((prev) => ({ ...prev, searchQuery: '' }));
  };

  const removeCounty = () => {
    setFilters((prev) => ({ ...prev, county: '', subCounty: '', ward: '', estate: '' }));
  };

  const removeSubCounty = () => {
    setFilters((prev) => ({ ...prev, subCounty: '', ward: '', estate: '' }));
  };

  const removeWard = () => {
    setFilters((prev) => ({ ...prev, ward: '' }));
  };

  const removeEstate = () => {
    setFilters((prev) => ({ ...prev, estate: '' }));
  };

  const removePropertyType = () => {
    setFilters((prev) => ({ ...prev, propertyType: '' }));
  };

  const removeRent = () => {
    setFilters((prev) => ({ ...prev, minRent: '', maxRent: '' }));
  };

  const removeAmenity = (amenity: string) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity)
    }));
  };

  // Location summary phrase for the results heading
  const locationLabel = [filters.estate, filters.ward, filters.subCounty, filters.county]
    .filter(Boolean)
    .join(', ');

  const resultTitle = isFilterActive
    ? filteredProperties.length === 1
      ? locationLabel
        ? `1 Home Found in ${locationLabel}`
        : '1 Home Found'
      : locationLabel
        ? `${filteredProperties.length} Homes Found in ${locationLabel}`
        : `${filteredProperties.length} Homes Found`
    : `All Available Homes (${filteredProperties.length})`;

  return (
    <div id="live-property-map-view" className="min-h-screen bg-white dark:bg-black pb-20 flex flex-col text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      {/* Top Map Header & Controls */}
      <div className="bg-white dark:bg-[#0D0D0D] border-b border-neutral-200 dark:border-[#262626] sticky top-16 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Back Button & Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="map-back-to-discovery-btn"
                onClick={() => setCurrentView('tenant-home')}
                className="p-2 rounded-xl border border-neutral-200 dark:border-[#303030] hover:border-black dark:hover:border-white text-neutral-600 dark:text-[#F5F5F5] hover:text-black bg-white dark:bg-[#111111] transition-colors cursor-pointer"
                title="Back to Discovery"
                aria-label="Back to Discovery"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold font-editorial text-neutral-950 dark:text-[#F5F5F5] leading-tight">
                    Live Property Map
                  </h1>
                  <span className="bg-neutral-100 dark:bg-[#181818] text-neutral-800 dark:text-[#D5D5D5] text-[11px] font-bold px-2 py-0.5 rounded-full border border-neutral-200 dark:border-[#303030] font-sans">
                    {filteredProperties.length} {filteredProperties.length === 1 ? 'Home' : 'Homes'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-[#A3A3A3] font-medium font-sans">
                  {isFilterActive
                    ? `Filtered results with live vacancies across Kenya`
                    : `Real-time map view of verified available rental properties`}
                </p>
              </div>
            </div>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap font-sans">
              {/* Reset All Filters button */}
              {isFilterActive && (
                <button
                  type="button"
                  id="map-reset-filters-btn"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-600 dark:text-[#C5C5C5] hover:text-black dark:hover:text-white rounded-xl bg-white dark:bg-[#111111] hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] border border-neutral-200 dark:border-[#303030] transition-colors cursor-pointer"
                  title="Reset all active filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}

              {/* Filters Drawer Trigger */}
              <button
                type="button"
                id="map-filters-drawer-btn"
                onClick={() => setFilterDrawerOpen(true)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
                  isFilterActive
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200'
                    : 'bg-white dark:bg-[#111111] text-neutral-800 dark:text-[#F5F5F5] border-neutral-200 dark:border-[#303030] hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-[#181818]'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {isFilterActive && (
                  <span className="w-2 h-2 rounded-full bg-white dark:bg-black ml-0.5" />
                )}
              </button>

              {/* View Mode Switcher: Split (Map + Results), Map Only, List Only */}
              <div
                id="map-view-toggle-container"
                className="bg-neutral-100 dark:bg-[#151515] p-1 rounded-xl flex items-center gap-1 border border-neutral-200 dark:border-[#303030]"
              >
                <button
                  type="button"
                  id="map-toggle-split-btn"
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-black text-white dark:bg-[#F5F5F5] dark:text-[#111111] shadow-xs'
                      : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[#202020]'
                  }`}
                  title="Map with Property Results below"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Map & Cards</span>
                  <span className="sm:hidden">Both</span>
                </button>

                <button
                  type="button"
                  id="map-toggle-map-btn"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'map'
                      ? 'bg-black text-white dark:bg-[#F5F5F5] dark:text-[#111111] shadow-xs'
                      : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[#202020]'
                  }`}
                  title="Full Screen Map"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map Only</span>
                </button>

                <button
                  type="button"
                  id="map-toggle-list-btn"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-black text-white dark:bg-[#F5F5F5] dark:text-[#111111] shadow-xs'
                      : 'text-neutral-600 dark:text-[#A3A3A3] hover:text-black dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-[#202020]'
                  }`}
                  title="Property Cards List Only"
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Cards Only</span>
                </button>
              </div>
            </div>
          </div>

          {/* Synchronized Location Search Bar */}
          <div className="w-full max-w-3xl">
            <SearchBar
              showFiltersButton={false}
              placeholder="Search by location or property name"
            />
          </div>
        </div>

        {/* Active Filter Chips Bar (Requirement 7) */}
        {isFilterActive && (
          <div className="bg-neutral-50/90 dark:bg-[#0D0D0D]/95 border-t border-neutral-200/70 dark:border-[#262626] px-4 sm:px-6 lg:px-8 py-2.5 font-sans">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-neutral-600 dark:text-[#A3A3A3] mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-black dark:text-[#F5F5F5]" />
                <span>Active Filters:</span>
              </span>

              {filters.searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] shadow-2xs">
                  <Search className="w-3 h-3 text-neutral-400 dark:text-[#7D7D7D]" />
                  <span>"{filters.searchQuery}"</span>
                  <button
                    type="button"
                    onClick={removeSearchQuery}
                    className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 cursor-pointer"
                    aria-label="Remove search filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.county && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] shadow-2xs">
                  <MapPin className="w-3 h-3 text-neutral-400 dark:text-[#7D7D7D]" />
                  <span>County: {filters.county}</span>
                  <button
                    type="button"
                    onClick={removeCounty}
                    className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 cursor-pointer"
                    aria-label="Remove county filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.subCounty && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] shadow-2xs">
                  <span>Sub-County: {filters.subCounty}</span>
                  <button
                    type="button"
                    onClick={removeSubCounty}
                    className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 cursor-pointer"
                    aria-label="Remove sub-county filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.ward && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] shadow-2xs">
                  <span>Ward: {filters.ward}</span>
                  <button
                    type="button"
                    onClick={removeWard}
                    className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 cursor-pointer"
                    aria-label="Remove ward filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.estate && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] shadow-2xs">
                  <span>Estate: {filters.estate}</span>
                  <button
                    type="button"
                    onClick={removeEstate}
                    className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 cursor-pointer"
                    aria-label="Remove estate filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.propertyType && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold shadow-2xs">
                  <Building className="w-3 h-3 text-neutral-300 dark:text-neutral-700" />
                  <span>{filters.propertyType}</span>
                  <button
                    type="button"
                    onClick={removePropertyType}
                    className="hover:text-neutral-300 dark:hover:text-neutral-600 ml-0.5 cursor-pointer"
                    aria-label="Remove property type filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(filters.minRent !== '' || filters.maxRent !== '') && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] shadow-2xs">
                  <span>
                    Rent: {filters.minRent ? `KSh ${Number(filters.minRent).toLocaleString()}` : 'KSh 0'} - {filters.maxRent ? `KSh ${Number(filters.maxRent).toLocaleString()}` : 'Any'}
                  </span>
                  <button
                    type="button"
                    onClick={removeRent}
                    className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 cursor-pointer"
                    aria-label="Remove rent filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {filters.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151515] border border-neutral-200 dark:border-[#303030] text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] shadow-2xs"
                >
                  <span>+ {amenity}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="hover:text-red-600 dark:hover:text-red-400 ml-0.5 cursor-pointer"
                    aria-label={`Remove ${amenity} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline underline-offset-2 ml-auto cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 space-y-8 flex-1">
        {/* MAP SECTION (Rendered in 'split' and 'map' modes) */}
        {viewMode !== 'list' && (
          <section id="live-map-section" className="space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-800 dark:text-[#F5F5F5]">
                  Live Property Map
                </h2>
              </div>
              <span className="text-xs text-neutral-500 dark:text-[#A3A3A3] font-medium hidden sm:inline">
                Click any property pin to view details & pricing
              </span>
            </div>

            {/* Map Container */}
            <div
              className={`w-full rounded-2xl overflow-hidden border border-neutral-200/90 dark:border-[#262626] shadow-sm relative ${
                viewMode === 'map'
                  ? 'h-[calc(100vh-12rem)]'
                  : 'h-[360px] sm:h-[440px] lg:h-[480px]'
              }`}
            >
              <InteractiveMap
                properties={filteredProperties}
                selectedPropertyId={selectedPropertyId}
                onSelectProperty={handleSelectProperty}
                className="w-full h-full rounded-none border-0"
                showViewButton={true}
              />
            </div>
          </section>
        )}

        {/* RESULTS CARDS SECTION (Rendered in 'split' and 'list' modes) */}
        {viewMode !== 'map' && (
          <section id="filtered-results-section" className="space-y-6 pt-2 font-sans">
            {/* Section Header (Requirement 6: DO NOT label filtered results 'Newly Listed') */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-[#262626]">
              <div>
                <h2 className="text-2xl sm:text-3xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
                  {resultTitle}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] mt-1">
                  {filteredProperties.length > 0
                    ? `Showing verified rental listings with live vacancies matching your search`
                    : `No available rental homes match the selected filter criteria`}
                </p>
              </div>

              {filteredProperties.length > 0 && (
                <div className="text-xs font-bold text-neutral-600 dark:text-[#E5E5E5] bg-white dark:bg-[#111111] px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-[#303030] shadow-2xs self-start sm:self-auto">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'Property Available' : 'Properties Available'}
                </div>
              )}
            </div>

            {/* Results Grid / Empty State */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white dark:bg-[#111111] rounded-3xl p-10 sm:p-14 text-center border border-neutral-200 dark:border-[#2A2A2A] shadow-xs space-y-4 max-w-lg mx-auto my-6">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-[#181818] text-neutral-500 dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030] flex items-center justify-center mx-auto">
                  <SlidersHorizontal className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-editorial font-semibold text-neutral-950 dark:text-[#F5F5F5]">
                  No properties found matching your search
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#A3A3A3] max-w-sm mx-auto leading-relaxed">
                  We couldn't find any verified rental listings matching all your selected criteria in {locationLabel || 'this area'}. Try clearing some filters or widening your price range.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-5 py-2.5 bg-black dark:bg-[#F5F5F5] text-white dark:text-[#111111] text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-white transition-colors cursor-pointer shadow-xs"
                  >
                    Reset All Filters
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterDrawerOpen(true)}
                    className="px-5 py-2.5 bg-white dark:bg-[#181818] border border-neutral-300 dark:border-[#303030] text-neutral-800 dark:text-[#F5F5F5] text-xs font-bold rounded-xl hover:bg-neutral-50 dark:hover:bg-[#222222] transition-colors cursor-pointer"
                  >
                    Adjust Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((prop) => (
                  <PropertyCard
                    key={prop.id}
                    property={prop}
                    highlighted={selectedPropertyId === prop.id}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};
