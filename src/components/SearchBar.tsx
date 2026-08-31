import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  ArrowRight,
  Building,
  Map as MapIcon,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  searchKenyanLocationsAndProperties,
  resolveSearchToLocation,
  AutocompleteSuggestion
} from '../utils/kenyaGeocoding';

interface SearchBarProps {
  onSearchSubmit?: () => void;
  showFiltersButton?: boolean;
  className?: string;
  size?: 'normal' | 'large' | 'slim';
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchSubmit,
  showFiltersButton = true,
  className = '',
  placeholder = 'Search by location or property name'
}) => {
  const {
    filters,
    setFilters,
    setFilterDrawerOpen,
    isFilterActive,
    properties,
    setSelectedPropertyId,
    setCurrentView,
    triggerMapNavigation
  } = useApp();

  const [inputValue, setInputValue] = useState(filters.searchQuery || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external filter changes
  useEffect(() => {
    setInputValue(filters.searchQuery || '');
  }, [filters.searchQuery]);

  // Autocomplete matching across verified Properties, Estates, Wards, Sub-Counties, Counties
  const matchingSuggestions = useMemo(() => {
    if (!inputValue || !inputValue.trim()) return [];
    return searchKenyanLocationsAndProperties(inputValue, properties, filters);
  }, [inputValue, properties, filters]);

  // Group suggestions into LOCATIONS and PROPERTIES as required
  const locationSuggestions = useMemo(() => {
    return matchingSuggestions.filter((s) => s.category !== 'property');
  }, [matchingSuggestions]);

  const propertySuggestions = useMemo(() => {
    return matchingSuggestions.filter((s) => s.category === 'property');
  }, [matchingSuggestions]);

  const flatSuggestions = useMemo(() => {
    return [...locationSuggestions, ...propertySuggestions];
  }, [locationSuggestions, propertySuggestions]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [flatSuggestions]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    if (suggestion.category === 'property' && suggestion.propertyId) {
      // 1. Specific Property Selected -> Move directly to property's map marker and highlight it
      setInputValue(suggestion.label);
      setFilters((prev) => ({
        ...prev,
        searchQuery: suggestion.label
      }));
      setSelectedPropertyId(suggestion.propertyId);
      setCurrentView('map-explore');
      triggerMapNavigation(
        suggestion.lat,
        suggestion.lng,
        16,
        'property',
        suggestion.label,
        suggestion.propertyId
      );
    } else if (suggestion.category === 'estate') {
      // 2. Estate Selected (Zoom ~15)
      const cleanName = suggestion.estate || suggestion.label.split(' — ')[0];
      setInputValue(cleanName);
      setFilters((prev) => ({
        ...prev,
        searchQuery: '',
        estate: suggestion.estate || cleanName,
        subCounty: suggestion.subCounty || '',
        county: suggestion.county || '',
        ward: suggestion.ward || ''
      }));
      setSelectedPropertyId(null);
      setCurrentView('map-explore');
      triggerMapNavigation(
        suggestion.lat,
        suggestion.lng,
        15,
        'selection',
        `${cleanName} Estate`
      );
    } else if (suggestion.category === 'ward') {
      // 3. Ward Selected (Zoom ~14)
      const cleanName = suggestion.ward || suggestion.label.split(' — ')[0];
      setInputValue(cleanName);
      setFilters((prev) => ({
        ...prev,
        searchQuery: '',
        ward: suggestion.ward || cleanName,
        subCounty: suggestion.subCounty || '',
        county: suggestion.county || '',
        estate: ''
      }));
      setSelectedPropertyId(null);
      setCurrentView('map-explore');
      triggerMapNavigation(
        suggestion.lat,
        suggestion.lng,
        14,
        'selection',
        `${cleanName} Ward`
      );
    } else if (suggestion.category === 'subCounty') {
      // 4. Sub-County Selected (Zoom ~12)
      const cleanName = suggestion.subCounty || suggestion.label.split(' — ')[0];
      setInputValue(cleanName);
      setFilters((prev) => ({
        ...prev,
        searchQuery: '',
        subCounty: suggestion.subCounty || cleanName,
        county: suggestion.county || '',
        ward: '',
        estate: ''
      }));
      setSelectedPropertyId(null);
      setCurrentView('map-explore');
      triggerMapNavigation(
        suggestion.lat,
        suggestion.lng,
        12,
        'selection',
        `${cleanName}, ${suggestion.county || 'Kenya'}`
      );
    } else if (suggestion.category === 'county') {
      // 5. County Selected (Zoom ~10)
      const cleanName = suggestion.county || suggestion.label.split(' — ')[0];
      setInputValue(cleanName);
      setFilters((prev) => ({
        ...prev,
        searchQuery: '',
        county: suggestion.county || cleanName,
        subCounty: '',
        ward: '',
        estate: ''
      }));
      setSelectedPropertyId(null);
      setCurrentView('map-explore');
      triggerMapNavigation(
        suggestion.lat,
        suggestion.lng,
        10,
        'selection',
        `${cleanName} County`
      );
    }

    setIsOpen(false);

    // Automatically focus/scroll the user to the interactive property map
    setTimeout(() => {
      const mapContainer =
        document.getElementById('live-property-map-view') ||
        document.getElementById('makaohub-live-map-container') ||
        document.getElementById('live-map-section');
      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    if (onSearchSubmit) onSearchSubmit();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
      handleSelectSuggestion(flatSuggestions[highlightedIndex]);
      return;
    }

    // Try to resolve freeform query to best Kenyan geographic location or property
    const match = resolveSearchToLocation(query, properties);
    if (match) {
      handleSelectSuggestion(match);
      return;
    }

    // Freeform search query fallback
    setFilters((prev) => ({
      ...prev,
      searchQuery: query
    }));
    setSelectedPropertyId(null);
    setCurrentView('map-explore');
    setIsOpen(false);

    setTimeout(() => {
      const mapContainer =
        document.getElementById('live-property-map-view') ||
        document.getElementById('makaohub-live-map-container') ||
        document.getElementById('live-map-section');
      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    if (onSearchSubmit) onSearchSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || flatSuggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < flatSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : flatSuggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setFilters((prev) => ({
      ...prev,
      searchQuery: '',
      estate: '',
      ward: '',
      subCounty: '',
      county: ''
    }));
    setSelectedPropertyId(null);
    triggerMapNavigation(-1.286389, 36.817223, 7, 'recenter', 'Kenya');
    inputRef.current?.focus();
  };

  const getCategoryBadge = (category: AutocompleteSuggestion['category']) => {
    switch (category) {
      case 'property':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
            Property
          </span>
        );
      case 'estate':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
            Estate
          </span>
        );
      case 'ward':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
            Ward
          </span>
        );
      case 'subCounty':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
            Sub-County
          </span>
        );
      case 'county':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 shrink-0">
            County
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: AutocompleteSuggestion['category']) => {
    switch (category) {
      case 'property':
        return <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
      case 'estate':
        return <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />;
      case 'ward':
        return <MapIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />;
      case 'subCounty':
        return <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
      case 'county':
        return <MapPin className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div id="makaohub-search-container" className={`relative w-full ${className}`} ref={dropdownRef}>
      <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Slim premium search field (46-50px high) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-neutral-500 dark:text-neutral-400">
            <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-600 dark:text-neutral-400" />
          </div>

          <input
            ref={inputRef}
            id="hero-search-input"
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (inputValue.trim()) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full h-11 sm:h-12 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-800 rounded-xl font-medium text-xs sm:text-sm tracking-tight placeholder:text-neutral-400 dark:placeholder:text-neutral-500 pl-10 sm:pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white transition-all shadow-2xs"
          />

          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filters Button */}
          {showFiltersButton && (
            <button
              id="search-filter-button"
              type="button"
              onClick={() => setFilterDrawerOpen(true)}
              className={`h-11 sm:h-12 flex items-center justify-center gap-2 px-4 font-bold text-xs sm:text-sm rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                isFilterActive
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                  : 'bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-800 shadow-2xs hover:border-neutral-400'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Filters</span>
              {isFilterActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black ml-0.5 animate-pulse"></span>
              )}
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            className="h-11 sm:h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 font-bold text-xs sm:text-sm px-4 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
            aria-label="Submit search"
          >
            <span className="hidden sm:inline mr-1.5">Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown with Distinct LOCATIONS and PROPERTIES Sections */}
      {isOpen && flatSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 sm:right-auto sm:w-[480px] mt-1.5 bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in-95 overflow-hidden text-xs max-h-[420px] overflow-y-auto font-sans">
          {/* 1. LOCATIONS SECTION */}
          {locationSuggestions.length > 0 && (
            <div>
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider bg-neutral-50/80 dark:bg-neutral-900/60 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span>Locations</span>
                <span className="text-[10px] lowercase text-neutral-400">interactive map navigation</span>
              </div>

              {locationSuggestions.map((item) => {
                const globalIndex = flatSuggestions.findIndex((s) => s.id === item.id);
                const isHighlighted = globalIndex === highlightedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setHighlightedIndex(globalIndex)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer border-b border-neutral-100/60 dark:border-neutral-900 last:border-0 ${
                      isHighlighted
                        ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-white'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {getCategoryIcon(item.category)}
                      <div className="min-w-0">
                        <div className="font-bold text-neutral-900 dark:text-white truncate">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {item.subLabel}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      {getCategoryBadge(item.category)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. PROPERTIES SECTION */}
          {propertySuggestions.length > 0 && (
            <div className={locationSuggestions.length > 0 ? 'mt-1 pt-1' : ''}>
              <div className="px-3.5 py-1.5 text-[10px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider bg-neutral-50/80 dark:bg-neutral-900/60 border-y border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span>Properties</span>
                <span className="text-[10px] lowercase text-neutral-400">direct pin focus</span>
              </div>

              {propertySuggestions.map((item) => {
                const globalIndex = flatSuggestions.findIndex((s) => s.id === item.id);
                const isHighlighted = globalIndex === highlightedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    onMouseEnter={() => setHighlightedIndex(globalIndex)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-start justify-between gap-3 transition-colors cursor-pointer border-b border-neutral-100/60 dark:border-neutral-900 last:border-0 ${
                      isHighlighted
                        ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-white'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/60 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      {getCategoryIcon(item.category)}
                      <div className="min-w-0">
                        <div className="font-bold text-neutral-900 dark:text-white truncate">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                          {item.subLabel}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      {getCategoryBadge(item.category)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
