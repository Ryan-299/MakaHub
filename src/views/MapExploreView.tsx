
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Sun,
  Moon,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Home,
  Heart
} from 'lucide-react';

import { InteractiveMap } from '../components/InteractiveMap';
import { SearchBar } from '../components/SearchBar';
import { useApp } from '../context/AppContext';
import { PropertyListing } from '../types';

import {
  resolvePropertyCoordinates,
  calculateDistanceInKm
} from '../utils/kenyaGeocoding';

const NEARBY_RADIUS_KM = 50;
const MAX_CAROUSEL_PROPERTIES = 12;

export const MapExploreView: React.FC = () => {
  const {
    filteredProperties,
    selectedPropertyId,
    setSelectedPropertyId,
    filters,
    setFilters,
    isFilterActive,
    resetFilters,
    resolvedTheme,
    toggleTheme,
    seekerLocation,
    mapTarget,
    triggerMapNavigation
  } = useApp();

  const [carouselOpen, setCarouselOpen] = useState(true);

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setSelectedPropertyId(null);
  }, [setSelectedPropertyId]);

  // Keep this callback stable so changing carousel state
  // doesn't unnecessarily rebuild Google Maps property pins.
  const handleSelectProperty = useCallback(
    (property: PropertyListing | null) => {
      setSelectedPropertyId(property ? property.id : null);
    },
    [setSelectedPropertyId]
  );
  useEffect(() => {
    if (selectedPropertyId) {
      setCarouselOpen(false);
    }
  }, [selectedPropertyId]);
  // A geographic search takes priority over GPS.
  // Selecting an individual property does not change the
  // discovery area used by the carousel.
  const isAreaSearch = Boolean(
    mapTarget &&
    (mapTarget.reason === 'selection' ||
      mapTarget.reason === 'search')
  );

  const hasGeographicFilters = Boolean(
    filters.county ||
    filters.subCounty ||
    filters.ward ||
    filters.estate
  );

  const geographicLabel = [
    filters.estate,
    filters.ward,
    filters.subCounty,
    filters.county
  ].filter(Boolean).join(', ');

  const areaCenter = useMemo(() => {
    if (isAreaSearch && mapTarget) {
      return { lat: mapTarget.lat, lng: mapTarget.lng };
    }

    if (seekerLocation) {
      return {
        lat: seekerLocation.lat,
        lng: seekerLocation.lng
      };
    }

    return null;
  }, [
    isAreaSearch,
    mapTarget?.lat,
    mapTarget?.lng,
    seekerLocation?.lat,
    seekerLocation?.lng
  ]);

  const discoveryProperties = useMemo(() => {
    const available = filteredProperties
      .filter(property => property.vacancies > 0)
      .map(property => {
        const coords = resolvePropertyCoordinates(property.location);

        const validCoords =
          Number.isFinite(coords.lat) &&
          Number.isFinite(coords.lng);

        const distanceKm =
          areaCenter && validCoords
            ? calculateDistanceInKm(
              areaCenter.lat,
              areaCenter.lng,
              coords.lat,
              coords.lng
            )
            : null;

        return {
          property,
          lat: coords.lat,
          lng: coords.lng,
          validCoords,
          distanceKm
        };
      })
      .filter(item => item.validCoords);

    // When an area is actively selected, the existing
    // filteredProperties list determines what belongs there.
    if (isAreaSearch || hasGeographicFilters) {
      return available
        .sort(
          (a, b) =>
            (a.distanceKm ?? Infinity) -
            (b.distanceKm ?? Infinity)
        )
        .slice(0, MAX_CAROUSEL_PROPERTIES);
    }

    // Default: only homes reasonably close to the seeker.
    if (areaCenter) {
      return available
        .filter(
          item =>
            item.distanceKm !== null &&
            item.distanceKm <= NEARBY_RADIUS_KM
        )
        .sort(
          (a, b) =>
            (a.distanceKm ?? Infinity) -
            (b.distanceKm ?? Infinity)
        )
        .slice(0, MAX_CAROUSEL_PROPERTIES);
    }

    // GPS may not be available or permitted.
    // Never pretend we know the person's location.
    return available.slice(0, MAX_CAROUSEL_PROPERTIES);
  }, [
    filteredProperties,
    areaCenter,
    isAreaSearch,
    hasGeographicFilters
  ]);

  const carouselTitle =
    isAreaSearch || hasGeographicFilters
      ? 'Homes in this area'
      : areaCenter
        ? 'Homes near you'
        : 'Explore available homes';

  const carouselSubtitle =
    geographicLabel ||
    (isAreaSearch ? mapTarget?.locationName : '') ||
    (areaCenter && !isAreaSearch ? 'Within 50 km' : 'Rentike listings');

  const selectCarouselProperty = (
    property: PropertyListing,
    lat: number,
    lng: number
  ) => {
    setSelectedPropertyId(property.id);

    triggerMapNavigation(
      lat,
      lng,
      16,
      'property',
      property.name,
      property.id
    );
  };

  const activeChips: {
    key: string;
    label: string;
    remove: () => void;
  }[] = [];

  if (filters.searchQuery) {
    activeChips.push({
      key: 'search',
      label: `"${filters.searchQuery}"`,
      remove: () =>
        setFilters(prev => ({ ...prev, searchQuery: '' }))
    });
  }

  if (filters.county) {
    activeChips.push({
      key: 'county',
      label: `County: ${filters.county}`,
      remove: () =>
        setFilters(prev => ({
          ...prev,
          county: '',
          subCounty: '',
          ward: '',
          estate: ''
        }))
    });
  }

  if (filters.subCounty) {
    activeChips.push({
      key: 'subCounty',
      label: `Sub-County: ${filters.subCounty}`,
      remove: () =>
        setFilters(prev => ({
          ...prev,
          subCounty: '',
          ward: '',
          estate: ''
        }))
    });
  }

  if (filters.ward) {
    activeChips.push({
      key: 'ward',
      label: `Ward: ${filters.ward}`,
      remove: () =>
        setFilters(prev => ({ ...prev, ward: '' }))
    });
  }

  if (filters.estate) {
    activeChips.push({
      key: 'estate',
      label: `Estate: ${filters.estate}`,
      remove: () =>
        setFilters(prev => ({ ...prev, estate: '' }))
    });
  }

  if (filters.propertyType) {
    activeChips.push({
      key: 'propertyType',
      label: filters.propertyType,
      remove: () =>
        setFilters(prev => ({ ...prev, propertyType: '' }))
    });
  }

  if (filters.minRent !== '' || filters.maxRent !== '') {
    activeChips.push({
      key: 'rent',
      label: `Rent: ${filters.minRent
        ? `KSh ${Number(filters.minRent).toLocaleString()}`
        : 'KSh 0'
        } – ${filters.maxRent
          ? `KSh ${Number(filters.maxRent).toLocaleString()}`
          : 'Any'
        }`,
      remove: () =>
        setFilters(prev => ({
          ...prev,
          minRent: '',
          maxRent: ''
        }))
    });
  }

  filters.amenities.forEach(amenity => {
    activeChips.push({
      key: `amenity-${amenity}`,
      label: amenity,
      remove: () =>
        setFilters(prev => ({
          ...prev,
          amenities: prev.amenities.filter(a => a !== amenity)
        }))
    });
  });

  return (
    <div
      id="live-property-map-view"
      className="
        relative w-full min-w-0 overflow-hidden
        h-[calc(100dvh-4.75rem)]
        sm:h-[calc(100dvh-4.25rem)]
        bg-[#F7F3EC] dark:bg-[#111111]
        text-neutral-900 dark:text-white
        font-sans
      "
    >
      {/* Existing working Google Map */}
      <main
        id="live-map-section"
        className="absolute inset-0 z-0"
      >
        <InteractiveMap
          properties={filteredProperties}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={handleSelectProperty}
          className="w-full h-full rounded-none border-0"
          showViewButton={true}
        />
      </main>

      {/* Top floating search controls */}
      <div
        className="
          absolute z-30
          top-3 left-3 right-3
          sm:top-4 sm:left-4 sm:right-4
          lg:top-5 lg:left-6 lg:right-6
          pointer-events-none
        "
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="pointer-events-auto flex-1 min-w-0 max-w-[650px]">
              <SearchBar
                showFiltersButton={true}
                placeholder="Search location or property"
              />
            </div>

            {/* Existing mobile theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                isDark
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="
                pointer-events-auto
                sm:hidden shrink-0
                flex items-center rounded-full
                border border-[#E2D3C2]
                dark:border-neutral-700
                bg-[#F7F3EC] dark:bg-[#181818]
                p-1
                shadow-[4px_4px_10px_rgba(0,0,0,0.12),-3px_-3px_9px_rgba(255,255,255,0.85)]
                dark:shadow-[4px_4px_10px_rgba(0,0,0,0.6)]
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
                  : 'text-[#B88792B]'
                  }`}
              >
                <Moon className="w-4 h-4" />
              </span>
            </button>
          </div>

          {/* Available homes count */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="
                pointer-events-auto
                inline-flex items-center gap-2
                px-3 py-2 rounded-xl
                bg-[#F7F4EE]/95 dark:bg-[#181818]/95
                text-neutral-800 dark:text-neutral-100
                text-xs font-bold
                shadow-[3px_3px_9px_rgba(0,0,0,0.10)]
                dark:shadow-[3px_3px_9px_rgba(0,0,0,0.5)]
              "
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              {filteredProperties.length}{' '}
              {filteredProperties.length === 1 ? 'Home' : 'Homes'}{' '}
              Available
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={resetFilters}
                className="
                  pointer-events-auto
                  inline-flex items-center gap-1.5
                  px-3 py-2 rounded-xl
                  bg-[#F7F4EE]/95 dark:bg-[#181818]/95
                  text-neutral-800 dark:text-neutral-100
                  text-xs font-bold shadow-sm
                "
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Existing removable filter chips */}
          {activeChips.length > 0 && (
            <div
              className="
                pointer-events-auto
                flex items-center gap-2
                max-w-full overflow-x-auto pb-2
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {activeChips.map(chip => (
                <span
                  key={chip.key}
                  className="
                    shrink-0 inline-flex items-center gap-2
                    px-3 py-1.5 rounded-xl
                    text-xs font-semibold
                    bg-[#F7F4EE]/95 dark:bg-[#181818]/95
                    text-neutral-800 dark:text-neutral-100
                    border border-[#E2D3C2]/70
                    dark:border-neutral-700 shadow-sm
                  "
                >
                  {chip.label}

                  <button
                    type="button"
                    onClick={chip.remove}
                    aria-label={`Remove ${chip.label} filter`}
                    className="
                      text-neutral-500
                      hover:text-red-600
                      dark:hover:text-red-400
                    "
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Nearby-property discovery carousel */}

      <section
        aria-label="Nearby rental properties"
        className={`
    absolute bottom-2 sm:bottom-4
${selectedPropertyId ? 'max-sm:bottom-[19rem]' : ''}
    z-20 pointer-events-none
    ${selectedPropertyId
            ? 'right-2 sm:right-4 lg:right-6 left-auto'
            : 'left-2 right-2 sm:left-4 sm:right-4 lg:left-6 lg:right-6'}
  `}
      >

        <div
          className={`
    pointer-events-auto
    ${selectedPropertyId ? 'w-auto inline-block' : 'w-full'}
 
${selectedPropertyId
              ? ''
              : discoveryProperties.length === 1
                ? 'sm:max-w-[280px]'
                : discoveryProperties.length === 2
                  ? 'sm:max-w-[540px]'
                  : 'sm:max-w-[640px] lg:max-w-[740px]'}

  
${selectedPropertyId
              ? ''
              : `rounded-[22px]
     border border-[#E8E0D5]/90 dark:border-neutral-800
     bg-[#F8F5EF]/95 dark:bg-[#171717]/95
     shadow-[0_8px_28px_rgba(0,0,0,0.14)]
     dark:shadow-[0_8px_28px_rgba(0,0,0,0.55)]
     backdrop-blur-md overflow-hidden`}

  `}
        >


          {selectedPropertyId && (
            <button
              type="button"
              onClick={() => {
                setSelectedPropertyId(null);
                setCarouselOpen(true);
              }}
              aria-label="Open nearby homes"
              title="Open nearby homes"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C49A6C] text-[#171717] shadow-md hover:bg-[#B88959] transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}


          {/* Header stays visible when collapsed */}
          <div className={`flex items-center justify-between gap-3 px-4 py-3 ${selectedPropertyId ? 'hidden' : ''}`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-[#A47145]" />
                <h2 className="text-sm sm:text-base font-bold truncate">
                  {carouselTitle}
                </h2>
              </div>

              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                {carouselSubtitle}
                {' · '}
                {discoveryProperties.length}{' '}
                {discoveryProperties.length === 1
                  ? 'home'
                  : 'homes'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedPropertyId) {
                  setSelectedPropertyId(null);
                  setCarouselOpen(true);
                } else {
                  setCarouselOpen(open => !open);
                }
              }}
              aria-expanded={carouselOpen}
              aria-label={
                carouselOpen
                  ? 'Collapse nearby homes'
                  : 'Expand nearby homes'
              }
              className="
                shrink-0 w-9 h-9
                flex items-center justify-center
                rounded-xl
                bg-[#EEEAE2] dark:bg-[#292929]
                text-neutral-700 dark:text-neutral-200
                shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08)]
                dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.35)]
              "
            >
              {carouselOpen
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronUp className="w-4 h-4" />
              }
            </button>
          </div>

          {carouselOpen && (
            <div className="pb-3">
              {discoveryProperties.length > 0 ? (
                <div
                  className="
                    flex gap-3
                    overflow-x-auto
                    overscroll-x-contain
                    snap-x snap-mandatory
                    px-3 pb-1
                    [scrollbar-width:none]
                    [&::-webkit-scrollbar]:hidden
                  "
                >
                  {discoveryProperties.map((item) => {
                    const property = item.property;

                    const photo =
                      property.coverPhoto ||
                      property.images?.[0] ||
                      '';

                    const isSelected =
                      selectedPropertyId === property.id;

                    return (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() =>
                          selectCarouselProperty(
                            property,
                            item.lat,
                            item.lng
                          )
                        }
                        className={`
                          snap-start shrink-0
                          w-[190px] sm:w-[225px]
                          rounded-2xl overflow-hidden
                          text-left
                          bg-white dark:bg-[#222222]
                          border transition-colors
                          ${isSelected
                            ? 'border-[#C49A6C]'
                            : 'border-[#E9E2D9] dark:border-neutral-700'
                          }
                        `}
                      >
                        <div className="relative h-[100px] sm:h-[120px] bg-[#E8E2DA] dark:bg-neutral-800">
                          {photo ? (
                            <img
                              src={photo}
                              alt={property.name}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="w-8 h-8 text-neutral-400" />
                            </div>
                          )}

                          {isSelected && (
                            <span
                              className="
                                absolute top-2 left-2
                                rounded-full
                                px-2 py-1
                                text-[10px] font-bold
                                bg-[#C49A6C] text-white
                              "
                            >
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="px-3 py-2.5 space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                            {property.name}
                          </p>

                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                            {property.type}
                          </p>

                          <p className="text-sm font-bold text-[#A47145] dark:text-[#D4A77C]">
                            KSh {property.monthlyRent.toLocaleString()}
                            <span className="text-[10px] font-medium">/mo</span>
                          </p>

                          {item.distanceKm !== null && (
                            <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>
                                {item.distanceKm < 1
                                  ? `${Math.round(item.distanceKm * 1000)} m`
                                  : `${item.distanceKm.toFixed(1)} km`}{' '}
                                away
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 pb-3">
                  <div className="rounded-xl bg-white/75 dark:bg-neutral-800/60 px-3 py-4 text-center">
                    <MapPin className="w-5 h-5 mx-auto mb-2 text-[#A47145]" />
                    <p className="text-xs font-semibold">
                      No available homes found nearby
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                      Try another location or adjust your filters.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
