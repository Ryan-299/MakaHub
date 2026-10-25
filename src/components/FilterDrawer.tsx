import React, { useMemo, useState } from 'react';
import { X, SlidersHorizontal, MapPin, Check, RotateCcw, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCounties, getSubCountiesInCounty, getWardsInSubCounty } from '../utils/kenyaLocations';
import { KENYA_COUNTY_COORDS, KENYA_SUBCOUNTY_COORDS, KENYA_WARD_COORDS, KENYA_ESTATE_COORDS } from '../utils/kenyaGeocoding';
import { PropertyType } from '../types';

const PROPERTY_TYPES: PropertyType[] = [
  'Single Room',
  'Double Room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4+ Bedroom',
  'Studio',
  'Commercial / Shop',
];

const AMENITY_OPTIONS = [
  'Reliable Water',
  'Fibre Internet',
  'Parking',
  'Security',
  'Balcony',
  'Furnished',
  'Pet Friendly',
  'Prepaid Electricity'
];

const RENT_PRESETS = [
  { label: 'Any', value: '' },
  { label: 'Under 10k', min: 0, max: 10000 },
  { label: '10k - 20k', min: 10000, max: 20000 },
  { label: '20k - 40k', min: 20000, max: 40000 },
  { label: '40k - 70k', min: 40000, max: 70000 },
  { label: '70k+', min: 70000, max: 300000 }
];

interface FilterDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const {
    filterDrawerOpen,
    setFilterDrawerOpen,
    filters,
    setFilters,
    resetFilters,
    availableProperties,
    setCurrentView, triggerMapNavigation
  } = useApp();
  const [countyDropdownOpen, setCountyDropdownOpen] = useState(false);
  const [subCountyDropdownOpen, setSubCountyDropdownOpen] = useState(false);
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  const isDrawerOpen = isOpen !== undefined ? isOpen : filterDrawerOpen;
  const handleClose = onClose || (() => setFilterDrawerOpen(false));

  // 1. Derive all 47 Kenyan Counties
  const counties = useMemo(() => getCounties(), []);

  // 2. Derive Sub-Counties belonging strictly to the selected County
  const availableSubCounties = useMemo(() => {
    if (!filters.county) return [];
    return getSubCountiesInCounty(filters.county);
  }, [filters.county]);

  // 3. Derive Wards belonging strictly to the selected Sub-County
  const availableWards = useMemo(() => {
    if (!filters.subCounty) return [];
    return getWardsInSubCounty(filters.subCounty, filters.county);
  }, [filters.subCounty, filters.county]);

  // 4. Derive Estate / Area suggestions for autocomplete
  const availableEstates = useMemo(() => {
    const estateSet = new Set<string>();

    // Collect from matching listings
    availableProperties.forEach((p) => {
      if (filters.county) {
        const pCounty = (p.location.county || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fCounty = filters.county.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pCounty !== fCounty) return;
      }
      if (filters.subCounty) {
        const pSub = (p.location.subCounty || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fSub = filters.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pSub !== fSub && !pSub.includes(fSub) && !fSub.includes(pSub)) return;
      }
      if (filters.ward) {
        const pWard = (p.location.ward || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fWard = filters.ward.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pWard !== fWard && !pWard.includes(fWard) && !fWard.includes(pWard)) return;
      }
      if (p.location.estate && p.location.estate.trim()) {
        estateSet.add(p.location.estate.trim());
      }
    });

    // Collect from KENYA_ESTATE_COORDS matching scope
    Object.values(KENYA_ESTATE_COORDS).forEach((est) => {
      if (filters.county) {
        const estCounty = est.county.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fCounty = filters.county.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (estCounty !== fCounty) return;
      }
      if (filters.subCounty) {
        const estSub = est.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fSub = filters.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (estSub !== fSub && !estSub.includes(fSub) && !fSub.includes(estSub)) return;
      }
      if (filters.ward && est.ward) {
        const estWard = est.ward.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fWard = filters.ward.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (estWard !== fWard && !estWard.includes(fWard) && !fWard.includes(estWard)) return;
      }
      estateSet.add(est.estate);
    });

    return Array.from(estateSet).sort((a, b) => a.localeCompare(b));
  }, [availableProperties, filters.county, filters.subCounty, filters.ward]);

  // Live matching count for "Show X Homes" button
  const matchingCount = useMemo(() => {
    return availableProperties.filter((p) => {
      if (filters.county) {
        const pCounty = p.location.county.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fCounty = filters.county.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pCounty !== fCounty) return false;
      }
      if (filters.subCounty) {
        const pSub = p.location.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '');
        const fSub = filters.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (pSub !== fSub && !pSub.includes(fSub) && !fSub.includes(pSub)) return false;
      }
      if (filters.ward) {
        const pWard = (p.location.ward || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fWard = filters.ward.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!pWard || (pWard !== fWard && !pWard.includes(fWard) && !fWard.includes(pWard))) return false;
      }
      if (filters.estate) {
        const pEstate = (p.location.estate || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const fEstate = filters.estate.toLowerCase().replace(/[^a-z0-9]/g, '');
        const pAddr = (p.location.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const pName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchesEstate =
          pEstate === fEstate ||
          pEstate.includes(fEstate) ||
          fEstate.includes(pEstate) ||
          pAddr.includes(fEstate) ||
          pName.includes(fEstate);
        if (!matchesEstate) return false;
      }
      if (filters.propertyType && p.type.toLowerCase() !== filters.propertyType.toLowerCase()) return false;
      if (filters.minRent !== '' && p.monthlyRent < Number(filters.minRent)) return false;
      if (filters.maxRent !== '' && p.monthlyRent > Number(filters.maxRent)) return false;
      if (filters.amenities.length > 0) {
        const hasAll = filters.amenities.every((a) => p.amenities.includes(a));
        if (!hasAll) return false;
      }
      return true;
    }).length;
  }, [availableProperties, filters]);

  if (!isDrawerOpen) return null;

  // Dependent Reset Handlers
  const handleCountyChange = (countyName: string) => {
    setFilters((prev) => ({
      ...prev,
      county: countyName,
      subCounty: '',
      ward: '',
      estate: ''
    }));
  };

  const handleSubCountyChange = (subCountyName: string) => {
    setFilters((prev) => ({
      ...prev,
      subCounty: subCountyName,
      ward: '',
      estate: ''
    }));
  };

  const handleWardChange = (wardName: string) => {
    setFilters((prev) => ({
      ...prev,
      ward: wardName,
      estate: ''
    }));
  };

  const handleEstateChange = (estateName: string) => {
    setFilters((prev) => ({
      ...prev,
      estate: estateName
    }));
  };

  const togglePropertyType = (type: PropertyType) => {
    setFilters((prev) => ({
      ...prev,
      propertyType: prev.propertyType === type ? '' : type
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const applyPresetRent = (min: number | '', max: number | '') => {
    setFilters((prev) => ({
      ...prev,
      minRent: min,
      maxRent: max
    }));
  };

  const handleApply = () => {
    const normalize = (value: string) =>
      value.trim().toLowerCase().replace(/\s+/g, ' ');

    let target: {
      lat: number;
      lng: number;
      zoom: number;
      label: string;
    } | null = null;

    // 1. Estate / Area — most specific
    if (filters.estate?.trim()) {
      const estateMatch = Object.values(KENYA_ESTATE_COORDS).find((entry) => {
        const estateMatches =
          normalize(entry.estate) === normalize(filters.estate);

        const countyMatches =
          !filters.county ||
          normalize(entry.county) === normalize(filters.county);

        const subCountyMatches =
          !filters.subCounty ||
          normalize(entry.subCounty) === normalize(filters.subCounty);

        const wardMatches =
          !filters.ward ||
          normalize(entry.ward) === normalize(filters.ward);

        return (
          estateMatches &&
          countyMatches &&
          subCountyMatches &&
          wardMatches
        );
      });

      if (estateMatch) {
        target = {
          lat: estateMatch.lat,
          lng: estateMatch.lng,
          zoom: 16,
          label: estateMatch.estate,
        };
      }
    }

    // 2. Ward
    if (!target && filters.county && filters.subCounty && filters.ward) {
      const wardKey = `${normalize(filters.county)}:${normalize(
        filters.subCounty
      )}:${normalize(filters.ward)}`;

      const wardCoords = KENYA_WARD_COORDS[wardKey];

      if (wardCoords) {
        target = {
          lat: wardCoords.lat,
          lng: wardCoords.lng,
          zoom: 15,
          label: filters.ward,
        };
      }
    }

    // 3. Sub-county
    if (!target && filters.county && filters.subCounty) {
      const subCountyKey = `${normalize(filters.county)}:${normalize(
        filters.subCounty
      )}`;

      const subCountyCoords = KENYA_SUBCOUNTY_COORDS[subCountyKey];

      if (subCountyCoords) {
        target = {
          lat: subCountyCoords.lat,
          lng: subCountyCoords.lng,
          zoom: 13,
          label: filters.subCounty,
        };
      }
    }

    // 4. County
    if (!target && filters.county) {
      const countyCoords = KENYA_COUNTY_COORDS[normalize(filters.county)];

      if (countyCoords) {
        target = {
          lat: countyCoords.lat,
          lng: countyCoords.lng,
          zoom: 10,
          label: filters.county,
        };
      }
    }

    if (target) {
      triggerMapNavigation(
        target.lat,
        target.lng,
        target.zoom,
        'selection',
        target.label
      );
    }

    handleClose();
    setCurrentView('map-explore');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div
        id="filter-slide-over-panel"
        className="relative w-[92%] sm:w-full max-w-md h-full flex flex-col bg-[var(--rentike-bg)] text-[var(--rentike-text)] shadow-[-18px_0_45px_rgba(0,0,0,0.16)] rounded-l-[28px] transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="px-5 py-5 border-b border-[#E7DED2] dark:border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-[#F2E7D8] dark:bg-[#24201C] text-[#B8792B] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-semibold text-neutral-900 dark:text-[#F5F5F5] leading-tight">
                Filter Properties
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Refine your search to find the right home
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-[#F2E7D8] dark:hover:bg-[#24201C] hover:text-[#B8792B] transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
          {/* Category 1: Location Hierarchy (County -> Sub-county -> Ward -> Estate / Area) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-black dark:text-white" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">1. Location Hierarchy</h3>
            </div>

            <div className="space-y-3.5 bg-[#F4EFE7] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[6px_6px_14px_rgba(0,0,0,0.06),-6px_-6px_14px_rgba(255,255,255,0.75)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.45),-4px_-4px_10px_rgba(255,255,255,0.03)]">
              {/* 1. County */}
              <div>
                <label htmlFor="filter-county-select" className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">
                  County
                </label>
                <div className="relative">
                  <button
                    id="filter-county-select"
                    type="button"
                    onClick={() => setCountyDropdownOpen((open) => !open)}
                    aria-expanded={countyDropdownOpen}
                    className="w-full flex items-center justify-between rounded-xl bg-[#F8F3EB] dark:bg-[#181818] border border-[#E4D8C8] dark:border-[#2A2A2A] px-4 py-3 text-sm text-neutral-800 dark:text-neutral-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.75)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),inset_-2px_-2px_5px_rgba(255,255,255,0.03)] focus:outline-none focus:border-[#C49A6C] transition-all"
                  >
                    <span>{filters.county || 'All Counties (Kenya)'}</span>

                    <ChevronDown
                      className={`w-4 h-4 text-[#B8792B] transition-transform ${countyDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {countyDropdownOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-y-auto rounded-2xl border border-[#E4D8C8] dark:border-[#2A2A2A] bg-[#FBF7F1] dark:bg-[#181818] shadow-[0_14px_35px_rgba(0,0,0,0.16)]">
                      <button
                        type="button"
                        onClick={() => {
                          handleCountyChange('');
                          setCountyDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm ${!filters.county
                          ? 'bg-[#EAD7BF] text-[#9A5E1F] font-semibold'
                          : 'text-neutral-800 hover:bg-[#F2E7D8] dark:text-neutral-100 dark:hover:bg-[#24201C]'
                          }`}
                      >
                        All Counties (Kenya)
                      </button>

                      {counties.map((c) => (
                        <button
                          key={c.code || c.name}
                          type="button"
                          onClick={() => {
                            handleCountyChange(c.name);
                            setCountyDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm ${filters.county === c.name
                            ? 'bg-[#EAD7BF] text-[#9A5E1F] font-semibold'
                            : 'text-neutral-800 hover:bg-[#F2E7D8] dark:text-neutral-100 dark:hover:bg-[#24201C]'
                            }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Sub-county (Disabled or empty until County is selected) */}
              <div>
                <label htmlFor="filter-subcounty-select" className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">
                  Sub-county
                </label>
                <div className="relative">
                  <button
                    id="filter-subcounty-select"
                    type="button"
                    disabled={!filters.county}
                    onClick={() => {
                      if (filters.county) {
                        setSubCountyDropdownOpen((open) => !open);
                      }
                    }}
                    aria-expanded={subCountyDropdownOpen}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all
      ${filters.county
                        ? 'bg-[#F8F3EB] dark:bg-[#181818] border-[#E4D8C8] dark:border-[#2A2A2A] text-neutral-800 dark:text-neutral-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.75)]'
                        : 'bg-[#EFEAE3] dark:bg-[#141414] border-[#E4DED5] dark:border-[#242424] text-neutral-400 cursor-not-allowed'
                      }`}
                  >
                    <span>
                      {filters.subCounty ||
                        (filters.county
                          ? `All Sub-Counties in ${filters.county}`
                          : 'Select County first')}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${filters.county ? 'text-[#B8792B]' : 'text-neutral-400'
                        } ${subCountyDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {subCountyDropdownOpen && filters.county && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-y-auto rounded-2xl border border-[#E4D8C8] dark:border-[#2A2A2A] bg-[#FBF7F1] dark:bg-[#181818] shadow-[0_14px_35px_rgba(0,0,0,0.16)]">
                      <button
                        type="button"
                        onClick={() => {
                          handleSubCountyChange('');
                          setSubCountyDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm ${!filters.subCounty
                          ? 'bg-[#EAD7BF] text-[#9A5E1F] font-semibold'
                          : 'text-neutral-800 hover:bg-[#F2E7D8] dark:text-neutral-100 dark:hover:bg-[#24201C]'
                          }`}
                      >
                        All Sub-Counties in {filters.county}
                      </button>

                      {availableSubCounties.map((s) => (
                        <button
                          key={s.code || s.name}
                          type="button"
                          onClick={() => {
                            handleSubCountyChange(s.name);
                            setSubCountyDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm ${filters.subCounty === s.name
                            ? 'bg-[#EAD7BF] text-[#9A5E1F] font-semibold'
                            : 'text-neutral-800 hover:bg-[#F2E7D8] dark:text-neutral-100 dark:hover:bg-[#24201C]'
                            }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Ward (Disabled or empty until Sub-county is selected) */}
              <div>
                <label htmlFor="filter-ward-select" className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">
                  Ward
                </label>
                <div className="relative">
                  <button
                    id="filter-ward-select"
                    type="button"
                    disabled={!filters.subCounty}
                    onClick={() => {
                      if (filters.subCounty) {
                        setWardDropdownOpen((open) => !open);
                      }
                    }}
                    aria-expanded={wardDropdownOpen}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all
      ${filters.subCounty
                        ? 'bg-[#F8F3EB] dark:bg-[#181818] border-[#E4D8C8] dark:border-[#2A2A2A] text-neutral-800 dark:text-neutral-100 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.75)]'
                        : 'bg-[#EFEAE3] dark:bg-[#141414] border-[#E4DED5] dark:border-[#242424] text-neutral-400 cursor-not-allowed'
                      }`}
                  >
                    <span>
                      {filters.ward ||
                        (filters.subCounty
                          ? `All Wards in ${filters.subCounty}`
                          : 'Select Sub-county first')}
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${filters.subCounty ? 'text-[#B8792B]' : 'text-neutral-400'
                        } ${wardDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {wardDropdownOpen && filters.subCounty && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-64 overflow-y-auto rounded-2xl border border-[#E4D8C8] dark:border-[#2A2A2A] bg-[#FBF7F1] dark:bg-[#181818] shadow-[0_14px_35px_rgba(0,0,0,0.16)]">
                      <button
                        type="button"
                        onClick={() => {
                          handleWardChange('');
                          setWardDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left text-sm ${!filters.ward
                          ? 'bg-[#EAD7BF] text-[#9A5E1F] font-semibold'
                          : 'text-neutral-800 hover:bg-[#F2E7D8] dark:text-neutral-100 dark:hover:bg-[#24201C]'
                          }`}
                      >
                        All Wards in {filters.subCounty}
                      </button>

                      {availableWards.map((w) => (
                        <button
                          key={w.code || w.name}
                          type="button"
                          onClick={() => {
                            handleWardChange(w.name);
                            setWardDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-sm ${filters.ward === w.name
                            ? 'bg-[#EAD7BF] text-[#9A5E1F] font-semibold'
                            : 'text-neutral-800 hover:bg-[#F2E7D8] dark:text-neutral-100 dark:hover:bg-[#24201C]'
                            }`}
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Estate / Area */}
              <div>
                <label htmlFor="filter-estate-input" className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">
                  Estate / Area
                </label>
                <div className="relative">
                  <input
                    id="filter-estate-input"
                    type="text"

                    value={filters.estate}
                    onChange={(e) => handleEstateChange(e.target.value)}
                    placeholder="e.g. Seasons / Mirema / Kilimani"
                    className="w-full rounded-xl bg-[#F8F3EB] dark:bg-[#181818] border border-[#E4D8C8] dark:border-[#2A2A2A] px-4 py-3 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.75)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.45),inset_-2px_-2px_5px_rgba(255,255,255,0.03)] focus:outline-none focus:border-[#C49A6C] focus:ring-2 focus:ring-[#C49A6C]/20 transition-all"
                  />

                </div>
              </div>
            </div>
          </div>

          {/* Category 2: Property Type */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">2. Property Type</h3>
            <div className="grid grid-cols-2 gap-2 bg-[#F4EFE7] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[6px_6px_14px_rgba(0,0,0,0.06),-6px_-6px_14px_rgba(255,255,255,0.75)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.45),-4px_-4px_10px_rgba(255,255,255,0.03)]">
              {PROPERTY_TYPES.map((type) => {
                const active = filters.propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between ${active
                      ? 'bg-[var(--rentike-bronze)] border-[var(--rentike-bronze)] text-[#111111] shadow-[0_4px_12px_rgba(196,154,108,0.22)]'
                      : 'bg-[#F8F3EB] dark:bg-[#181818] text-neutral-800 dark:text-[#F5F5F5] border-[#E4D8C8] dark:border-[#2A2A2A] hover:border-[var(--rentike-bronze)] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C]'
                      }`}
                  >
                    <span>{type}</span>
                    {active && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category 3: Monthly Rent (KSh) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">3. Monthly Rent (KSh)</h3>
            <div className="space-y-4 bg-[#F4EFE7] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[6px_6px_14px_rgba(0,0,0,0.06),-6px_-6px_14px_rgba(255,255,255,0.75)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.45),-4px_-4px_10px_rgba(255,255,255,0.03)]">
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {RENT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPresetRent(preset.min ?? '', preset.max ?? '')}
                    className="px-3 py-2 text-xs rounded-xl border border-[#E4D8C8] dark:border-[#2A2A2A] bg-[#F8F3EB] dark:bg-[#181818] text-neutral-800 dark:text-[#F5F5F5] hover:border-[var(--rentike-bronze)] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C] transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">Min Rent (KSh)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400 dark:text-neutral-500">KSh</span>
                    <input
                      type="number"
                      value={filters.minRent}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, minRent: e.target.value ? Number(e.target.value) : '' }))
                      }
                      placeholder="e.g. 5,000"
                      className="w-full pl-11 pr-3 py-2 rounded-xl bg-[#F8F3EB] dark:bg-[#181818] border border-[#E4D8C8] dark:border-[#2A2A2A] text-sm text-neutral-800 dark:text-[#F5F5F5] placeholder:text-neutral-400 focus:outline-none focus:border-[var(--rentike-bronze)] focus:ring-2 focus:ring-[var(--rentike-bronze)]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">Max Rent (KSh)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-neutral-400 dark:text-neutral-500">KSh</span>
                    <input
                      type="number"
                      value={filters.maxRent}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, maxRent: e.target.value ? Number(e.target.value) : '' }))
                      }
                      placeholder="e.g. 25,000"
                      className="w-full pl-11 pr-3 py-2 rounded-xl bg-[#F8F3EB] dark:bg-[#181818] border border-[#E4D8C8] dark:border-[#2A2A2A] text-sm text-neutral-800 dark:text-[#F5F5F5] placeholder:text-neutral-400 focus:outline-none focus:border-[var(--rentike-bronze)] focus:ring-2 focus:ring-[var(--rentike-bronze)]/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category 4: Amenities */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">4. Amenities</h3>
            <div className="grid grid-cols-2 gap-2 bg-[#F4EFE7] dark:bg-[#151515] p-4 rounded-2xl border border-[#E7DED2] dark:border-neutral-800 shadow-[6px_6px_14px_rgba(0,0,0,0.06),-6px_-6px_14px_rgba(255,255,255,0.75)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.45),-4px_-4px_10px_rgba(255,255,255,0.03)]">
              {AMENITY_OPTIONS.map((amenity) => {
                const checked = filters.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${checked
                      ? 'bg-[var(--rentike-bronze)] border-[var(--rentike-bronze)] text-[#111111]'
                      : 'bg-[#F8F3EB] dark:bg-[#181818] border-[#E4D8C8] dark:border-[#2A2A2A] text-neutral-800 dark:text-[#F5F5F5] hover:border-[var(--rentike-bronze)] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C]'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-neutral-300 dark:border-neutral-700 accent-[var(--rentike-bronze)]"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-transparent flex items-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E4D8C8] dark:border-[#2A2A2A] bg-[#F8F3EB] dark:bg-[#181818] text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:border-[var(--rentike-bronze)] hover:bg-[#F2E7D8] dark:hover:bg-[#24201C] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--rentike-bronze)] border border-[var(--rentike-bronze)] text-[#111111] text-xs font-semibold shadow-[0_4px_12px_rgba(196,154,108,0.22)] hover:opacity-90 transition-all"
          >
            <span>Show {matchingCount} {matchingCount === 1 ? 'Home' : 'Homes'}</span>
          </button>
        </div>
      </div>
    </div >
  );
};
