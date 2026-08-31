import React, { useMemo } from 'react';
import { X, SlidersHorizontal, MapPin, Check, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCounties, getSubCountiesInCounty, getWardsInSubCounty } from '../utils/kenyaLocations';
import { KENYA_ESTATE_COORDS } from '../utils/kenyaGeocoding';
import { PropertyType } from '../types';

const PROPERTY_TYPES: PropertyType[] = [
  'Single Room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4+ Bedroom',
  'Entire House'
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
    setCurrentView
  } = useApp();

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
    handleClose();
    setCurrentView('map-explore');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div
        id="filter-slide-over-panel"
        className="relative w-full max-w-md bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-neutral-200 dark:border-neutral-800"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-black sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-[#1F1F1F] dark:text-white flex items-center justify-center border border-transparent dark:border-neutral-700">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-[#F5F5F5] tracking-tight">Filter Properties</h2>
              <p className="text-xs text-neutral-500 dark:text-[#A0A0A0]">Refine search criteria across Kenya</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
          {/* Category 1: Location Hierarchy (County -> Sub-county -> Ward -> Estate / Area) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-black dark:text-white" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">1. Location Hierarchy</h3>
            </div>

            <div className="space-y-3.5 bg-neutral-50 dark:bg-[#151515] p-4 rounded-xl border border-neutral-200 dark:border-[#303030] text-sm">
              {/* 1. County */}
              <div>
                <label htmlFor="filter-county-select" className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">
                  County
                </label>
                <select
                  id="filter-county-select"
                  value={filters.county}
                  onChange={(e) => handleCountyChange(e.target.value)}
                  className="w-full bg-white dark:bg-[#111111] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F5F5F5]">
                    All Counties (Kenya)
                  </option>
                  {counties.map((c) => (
                    <option
                      key={c.code || c.name}
                      value={c.name}
                      className="bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F5F5F5]"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Sub-county (Disabled or empty until County is selected) */}
              <div>
                <label htmlFor="filter-subcounty-select" className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">
                  Sub-county
                </label>
                <select
                  id="filter-subcounty-select"
                  disabled={!filters.county}
                  value={filters.subCounty}
                  onChange={(e) => handleSubCountyChange(e.target.value)}
                  className={`w-full border text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors ${
                    !filters.county
                      ? 'bg-neutral-100 dark:bg-[#1A1A1A] border-neutral-200 dark:border-[#282828] text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                      : 'bg-white dark:bg-[#111111] border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] cursor-pointer'
                  }`}
                >
                  <option value="" className="bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F5F5F5]">
                    {filters.county ? `All Sub-counties in ${filters.county}` : 'Select County first'}
                  </option>
                  {availableSubCounties.map((s) => (
                    <option
                      key={s.code || s.name}
                      value={s.name}
                      className="bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F5F5F5]"
                    >
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Ward (Disabled or empty until Sub-county is selected) */}
              <div>
                <label htmlFor="filter-ward-select" className="block text-xs font-semibold text-neutral-600 dark:text-[#A0A0A0] mb-1">
                  Ward
                </label>
                <select
                  id="filter-ward-select"
                  disabled={!filters.subCounty}
                  value={filters.ward}
                  onChange={(e) => handleWardChange(e.target.value)}
                  className={`w-full border text-sm font-medium rounded-lg px-3 py-2 focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none transition-colors ${
                    !filters.subCounty
                      ? 'bg-neutral-100 dark:bg-[#1A1A1A] border-neutral-200 dark:border-[#282828] text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
                      : 'bg-white dark:bg-[#111111] border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] cursor-pointer'
                  }`}
                >
                  <option value="" className="bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F5F5F5]">
                    {filters.subCounty ? `All Wards in ${filters.subCounty}` : 'Select Sub-county first'}
                  </option>
                  {availableWards.map((w) => (
                    <option
                      key={w.code || w.name}
                      value={w.name}
                      className="bg-white dark:bg-[#111111] text-[#111111] dark:text-[#F5F5F5]"
                    >
                      {w.name}
                    </option>
                  ))}
                </select>
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
                    list="estate-suggestions-list"
                    value={filters.estate}
                    onChange={(e) => handleEstateChange(e.target.value)}
                    placeholder="e.g. Seasons / Mirema / Kilimani"
                    className="w-full bg-white dark:bg-[#111111] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] placeholder:text-neutral-400 dark:placeholder:text-neutral-500 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                  <datalist id="estate-suggestions-list">
                    {availableEstates.map((est) => (
                      <option key={est} value={est} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          {/* Category 2: Property Type */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">2. Property Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {PROPERTY_TYPES.map((type) => {
                const active = filters.propertyType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                      active
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                        : 'bg-white dark:bg-[#151515] text-neutral-800 dark:text-[#F5F5F5] border-neutral-200 dark:border-[#333333] hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-[#1C1C1C]'
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
            
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {RENT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPresetRent(preset.min ?? '', preset.max ?? '')}
                  className="px-2.5 py-1 text-xs rounded-full border border-neutral-200 dark:border-neutral-800 hover:border-black dark:hover:border-white text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white bg-white dark:bg-[#151515] font-medium transition-colors cursor-pointer"
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
                    className="w-full pl-11 pr-3 py-2 bg-white dark:bg-[#111111] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
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
                    className="w-full pl-11 pr-3 py-2 bg-white dark:bg-[#111111] border border-neutral-300 dark:border-[#333333] text-neutral-900 dark:text-[#F5F5F5] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 rounded-lg text-sm font-medium focus:ring-2 focus:ring-black dark:focus:ring-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category 4: Amenities */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F5F5] uppercase tracking-wider">4. Amenities</h3>
            <div className="grid grid-cols-2 gap-2">
              {AMENITY_OPTIONS.map((amenity) => {
                const checked = filters.amenities.includes(amenity);
                return (
                  <label
                    key={amenity}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                      checked
                        ? 'bg-neutral-100 dark:bg-[#222222] border-black dark:border-white text-black dark:text-white font-semibold'
                        : 'border-neutral-200 dark:border-[#2A2A2A] text-neutral-700 dark:text-[#A0A0A0] hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-[#151515]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(amenity)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-black dark:text-white focus:ring-black dark:focus:ring-white w-4 h-4 accent-black dark:accent-white"
                    />
                    <span>{amenity}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black flex items-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-3 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white dark:bg-[#151515] rounded-xl text-xs font-bold text-neutral-700 dark:text-[#A0A0A0] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Show {matchingCount} {matchingCount === 1 ? 'Home' : 'Homes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
