import React, { useState, useMemo } from 'react';

import {
  Building2,
  PlusCircle,
  Key,
  Eye,
  Edit,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  SlidersHorizontal,
  ExternalLink,
  Video,
  Trash2,
  AlertOctagon,
  AlertCircle,
  Sun,
  Moon,
  X,
  Clock,
  CircleAlert,
  Ban,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { PropertyListing } from '../types';
import { VacancyManagerModal } from '../components/VacancyManagerModal';

const ListingCardImage: React.FC<{
  src?: string;
  alt: string;
}> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const imageSrc = src || '';

  React.useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [imageSrc]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#EEE8DF] dark:bg-[#202020]">

      {/* Skeleton shown while image loads */}
      {!isLoaded && !hasError && (
        <div
          className="
            absolute inset-0 z-10
            flex items-center justify-center
            bg-[#EEE8DF] dark:bg-[#252525]
            animate-pulse
          "
          aria-hidden="true"
        >
          <Building2 className="w-8 h-8 text-[#C8BAA9] dark:text-neutral-600" />
        </div>
      )}

      {/* Property image */}
      {!hasError && imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`
            w-full h-full object-cover
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}

      {/* Fallback when image is unavailable */}
      {(hasError || !imageSrc) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#A99A88] dark:text-neutral-500">
          <Building2 className="w-8 h-8" />
          <span className="text-[10px] font-medium">No photo available</span>
        </div>
      )}
    </div>
  );
};


export const MyListingsView: React.FC = () => {
  const {
    listerListings = [],
    listerListingsFilter = 'all',
    setListerListingsFilter,
    setCurrentView,
    setSelectedPropertyId,
    setEditingPropertyId,
    deletePropertyListing,
    deleteAllMyListings,
    resolvedTheme,
    toggleTheme
  } = useApp();
  const isDark = resolvedTheme === 'dark';

  const [selectedForVacancy, setSelectedForVacancy] = useState<PropertyListing | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyListing | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const activeCount = useMemo(
    () => listerListings.filter((p) => p.status === 'Approved').length,
    [listerListings]
  );
  const vacantCount = useMemo(
    () => listerListings.filter((p) => p.vacancies > 0).length,
    [listerListings]
  );


  const displayedListings = useMemo(() => {
    if (listerListingsFilter === 'active') {
      return listerListings.filter(
        (p) => p.status === 'Approved'
      );
    }

    if (listerListingsFilter === 'vacancies') {
      return listerListings.filter(
        (p) => p.vacancies > 0
      );
    }

    if (listerListingsFilter === 'rejected') {
      return listerListings.filter(
        (p) => p.status === 'Rejected'
      );
    }

    return listerListings;
  }, [listerListings, listerListingsFilter]);


  const handleEdit = (propId: string) => {
    setEditingPropertyId(propId);
    setCurrentView('add-property');
  };

  const handleAddNew = () => {
    setEditingPropertyId(null);
    setCurrentView('add-property');
  };

  const confirmDeleteOne = () => {
    if (propertyToDelete) {
      deletePropertyListing(propertyToDelete.id);
      setPropertyToDelete(null);
    }
  };

  const confirmDeleteAll = () => {
    deleteAllMyListings();
    setShowDeleteAllConfirm(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--rentike-bg)] pb-24 text-neutral-900 dark:text-[#F5F5F5] font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Header (Section 36) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-[#262626]">

          {/* Mobile theme toggle — matches lister dashboard */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="
   sm:hidden absolute top-5 right-2.5 z-10
    shrink-0 flex items-center
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

          <div className="flex items-center gap-3">

            <div>

              <h1
                className="
    font-editorial font-semibold
    text-[34px] sm:text-[42px] lg:text-[48px]
    leading-[1.05] tracking-tight
    text-[#111111] dark:text-[#F5F5F5]
  "
              >
                My{' '}
                <span className="text-[var(--rentike-bronze)]">
                  Listings
                </span>
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                Manage your Properties ({listerListings.length}{' '}
                {listerListings.length === 1 ? 'property' : 'properties'})
              </p>
            </div>
          </div>


          <div className="flex items-center gap-2 self-start sm:self-auto">

            {/* Compact Add New Listing button */}
            <button
              type="button"
              onClick={handleAddNew}
              className="
      inline-flex items-center justify-center gap-2
      px-3 py-2
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
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#EBDFD0] dark:bg-[#352A21] text-[#946B46] dark:text-[#C49A6C]">
                <PlusCircle className="w-4 h-4" />
              </span>

              <span className="text-xs font-semibold whitespace-nowrap">
                Add New Listing
              </span>
            </button>

            {/* Additional management actions */}
            {listerListings.length > 0 && (
              <details className="relative group">
                <summary
                  aria-label="More listing management options"
                  title="Manage listings"
                  className="
          list-none [&::-webkit-details-marker]:hidden
          flex items-center justify-center
          w-11 h-11 rounded-xl
          bg-[#F7F3EC] dark:bg-[#181818]
          text-neutral-700 dark:text-neutral-200
          border border-[#E2D3C2] dark:border-[#34302B]
          shadow-[3px_3px_8px_rgba(0,0,0,0.09),-3px_-3px_8px_rgba(255,255,255,0.8)]
          dark:shadow-[3px_3px_9px_rgba(0,0,0,0.5)]
          hover:border-[#C49A6C]
          cursor-pointer select-none
        "
                >
                  <span className="text-xl leading-none">⋯</span>
                </summary>

                <div
                  className="
          absolute right-0 top-full mt-2 z-50
          w-56 p-2 rounded-xl
          bg-[#F7F3EC] dark:bg-[#181818]
          border border-[#E2D3C2] dark:border-[#34302B]
          shadow-[0_12px_30px_rgba(0,0,0,0.15)]
          dark:shadow-[0_12px_30px_rgba(0,0,0,0.5)]
        "
                >
                  <button
                    type="button"
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="
            w-full flex items-center gap-2
            px-3 py-2.5 rounded-lg
            text-xs font-semibold text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-950/40
            transition-colors cursor-pointer text-left
          "
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    Delete All My Listings
                  </button>
                </div>
              </details>
            )}
          </div>

        </div>


        {/* Filter Tabs — Rentike Neumorphic Design */}
        {listerListings.length > 0 && (
          <div
            className="
      flex items-center gap-2
      overflow-x-auto pb-3
      [scrollbar-width:none]
      [&::-webkit-scrollbar]:hidden
    "
          >
            {([
              {
                key: 'all',
                id: 'filter-tab-all',
                label: 'All Listings',
                count: listerListings.length,
              },
              {
                key: 'active',
                id: 'filter-tab-active',
                label: 'Active Listings',
                count: activeCount,
              },
              {
                key: 'rejected',
                id: 'filter-tab-rejected',
                label: 'Rejected Listings',
                count: listerListings.filter(
                  (p) => p.status === 'Rejected'
                ).length,
              },
            ] as const).map((filter) => {
              const isActive = listerListingsFilter === filter.key;
              const isRejected = filter.key === 'rejected';

              return (
                <button
                  key={filter.key}
                  type="button"
                  id={filter.id}
                  onClick={() => setListerListingsFilter(filter.key)}
                  aria-pressed={isActive}
                  className={`
            shrink-0 inline-flex items-center gap-1.5
            px-3.5 py-2 rounded-xl
            text-[11px] sm:text-xs font-semibold
            border
            transition-all duration-200
            cursor-pointer
            
${isRejected
                      ? isActive
                        ? `bg-[#FADDDD] dark:bg-[#451F1F]
       text-[#B42318] dark:text-[#FF8585]
       border-[#E9A8A8] dark:border-[#864040]
       shadow-[inset_2px_2px_5px_rgba(150,35,35,0.12)]`
                        : `bg-[#FFF1F1] dark:bg-[#291919]
       text-[#B42318] dark:text-[#FF8585]
       border-[#F0CACA] dark:border-[#543030]
       hover:bg-[#FBE6E6] dark:hover:bg-[#382020]`
                      : isActive
                        ? `bg-[#EBDFD0] dark:bg-[#352A21]
       text-[#946B46] dark:text-[#C49A6C]
       border-[#D8BFA5] dark:border-[#57402D]
       shadow-[inset_2px_2px_5px_rgba(104,73,43,0.12)]`
                        : `bg-[#F7F3EC] dark:bg-[#181818]
       text-neutral-600 dark:text-neutral-300
       border-[#E2D3C2] dark:border-[#34302B]
       shadow-[3px_3px_7px_rgba(0,0,0,0.07),-2px_-2px_6px_rgba(255,255,255,0.8)]
       dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45)]
       hover:border-[#C49A6C]`
                    }

          `}
                >
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    {isRejected && (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                    )}
                    {filter.label}
                  </span>

                  <span
                    className={`
              min-w-5 h-5 px-1
              inline-flex items-center justify-center
              rounded-full text-[10px] font-bold
             ${isRejected
                        ? 'bg-[#FADDDD] dark:bg-[#451F1F] text-[#B42318] dark:text-[#FF8585]'
                        : isActive
                          ? 'bg-[#C49A6C]/20 text-[#946B46] dark:text-[#C49A6C]'
                          : 'bg-[#EAE3D9] dark:bg-[#292929] text-neutral-600 dark:text-neutral-300'
                      }
            `}
                  >
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Listings 2-Column Grid */}
        <div>
          {listerListings.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 text-center border border-neutral-200 dark:border-[#292929] space-y-4">
              <Building2 className="w-12 h-12 text-neutral-400 dark:text-[#7D7D7D] mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-[#F5F5F5]">No properties listed yet</h3>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] max-w-sm mx-auto">
                You currently have 0 active listings. List your first residential property to start receiving verified tenant enquiries.
              </p>
              <button
                type="button"
                onClick={handleAddNew}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
              >
                Create First Listing
              </button>
            </div>
          ) : displayedListings.length === 0 ? (
            <div className="bg-white dark:bg-[#111111] rounded-3xl p-12 text-center border border-neutral-200 dark:border-[#292929] space-y-4">
              <Building2 className="w-12 h-12 text-neutral-400 dark:text-[#7D7D7D] mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-[#F5F5F5]">
                {listerListingsFilter === 'active' ? 'No active listings found' : 'No vacant listings found'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-[#8A8A8A] max-w-sm mx-auto">
                {listerListingsFilter === 'active'
                  ? 'None of your properties are currently in Approved status.'
                  : 'All of your properties are currently fully occupied (0 vacancies).'}
              </p>
              <button
                type="button"
                onClick={() => setListerListingsFilter('all')}
                className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 cursor-pointer"
              >
                Show All Listings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              {displayedListings.map((prop) => {
                const isAvailable = prop.vacancies > 0;

                return (
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

                    className="
  bg-[#F7F3EC] dark:bg-[#181818]
  rounded-2xl
  p-2.5 sm:p-4
  border border-[#E2D3C2] dark:border-[#34302B]
  shadow-[4px_4px_12px_rgba(0,0,0,0.08),-3px_-3px_10px_rgba(255,255,255,0.8)]
  dark:shadow-[5px_5px_14px_rgba(0,0,0,0.5)]
  hover:border-[#C49A6C]
  transition-all duration-200
  flex flex-col justify-between
  gap-3
  cursor-pointer group
  focus:outline-none
  focus:ring-2 focus:ring-[#C49A6C]
"

                  >
                    {/* Top: Property Media & Title */}
                    <div className="space-y-2.5 sm:space-y-3">
                      {/* Property Image with 4:3 aspect ratio */}
                      <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-4/3 w-full bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-[#292929]">
                        <ListingCardImage
                          src={prop.coverPhoto || prop.images?.[0]}
                          alt={prop.name}
                        />
                        <span className="absolute bottom-2 left-2 bg-black/80 dark:bg-black/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded shadow-xs">
                          {prop.type}
                        </span>
                        {prop.video && (
                          <span className="absolute top-2 right-2 bg-black/80 dark:bg-black/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                            <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="hidden sm:inline">Tour</span>
                          </span>
                        )}
                      </div>

                      {/* Name, Status, Location, Rent */}
                      <div className="space-y-1 sm:space-y-1.5">
                        <div className="flex items-start justify-between gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-base font-bold text-neutral-950 dark:text-[#F5F5F5] group-hover:text-neutral-700 dark:group-hover:text-white transition-colors line-clamp-2 leading-tight">
                            {prop.name}
                          </h3>


                          {prop.status === 'Approved' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E3F3E8] dark:bg-[#173B2B] text-[#267147] dark:text-[#79D6A2] border border-[#C8E7D1] dark:border-[#285C40] text-[9px] sm:text-[10px] font-bold tracking-wide shrink-0">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              Approved
                            </span>
                          )}

                          {prop.status === 'Pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FFF0D4] dark:bg-[#3C2D16] text-[#986615] dark:text-[#E8BE75] border border-[#F0DBB4] dark:border-[#66502B] text-[9px] sm:text-[10px] font-bold tracking-wide shrink-0">
                              <Clock className="w-3 h-3 shrink-0" />
                              Pending
                            </span>
                          )}

                          {prop.status === 'Rejected' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FCE5E5] dark:bg-[#451D25] text-[#B42332] dark:text-[#F18D97] border border-[#F4C8CC] dark:border-[#70303C] text-[9px] sm:text-[10px] font-bold tracking-wide shrink-0">
                              <CircleAlert className="w-3 h-3 shrink-0" />
                              Rejected
                            </span>
                          )}

                          {prop.status === 'Suspended' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#EEE8E5] dark:bg-[#302623] text-[#745A51] dark:text-[#D5A99A] border border-[#DCCFC8] dark:border-[#59423B] text-[9px] sm:text-[10px] font-bold tracking-wide shrink-0">
                              <Ban className="w-3 h-3 shrink-0" />
                              Suspended
                            </span>
                          )}


                        </div>
                        <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-[#8A8A8A] line-clamp-1">
                          {prop.location.estate}, {prop.location.ward}, {prop.location.subCounty}
                        </p>

                        <p className="text-xs sm:text-sm font-extrabold text-neutral-950 dark:text-[#F5F5F5] pt-0.5">
                          KSh {prop.monthlyRent.toLocaleString()}
                          <span className="text-[10px] sm:text-xs font-normal text-neutral-500 dark:text-[#8A8A8A] ml-1">/ mo</span>
                        </p>
                      </div>

                      {/* 37. UNIT VACANCY METRICS (Vacant, Occupied, Under Repair) */}
                      <div className="bg-neutral-50 dark:bg-[#151515] group-hover:bg-neutral-100/70 dark:group-hover:bg-[#1E1E1E] transition-colors p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#292929] grid grid-cols-3 gap-1 sm:gap-2 text-center">
                        <div>
                          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider block">
                            Vacant
                          </span>
                          <span
                            className={`text-xs sm:text-sm md:text-base font-extrabold ${isAvailable ? 'text-black dark:text-white font-bold' : 'text-neutral-400 dark:text-[#7D7D7D]'
                              }`}
                          >
                            {prop.vacancies}
                          </span>
                        </div>

                        <div className="border-x border-neutral-200 dark:border-[#292929]">
                          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider block">
                            Occupied
                          </span>
                          <span className="text-xs sm:text-sm md:text-base font-extrabold text-neutral-800 dark:text-[#F5F5F5]">
                            {prop.occupied}
                          </span>
                        </div>

                        <div>
                          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 dark:text-[#7D7D7D] uppercase tracking-wider block">
                            Repair
                          </span>
                          <span className="text-xs sm:text-sm md:text-base font-extrabold text-neutral-700 dark:text-[#A3A3A3]">
                            {prop.underRepair}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Action Controls */}
                    <div
                      className="pt-2 border-t border-neutral-100 dark:border-[#202020] space-y-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >

                      <div className="grid grid-cols-1 gap-2">

                        {/* Neumorphic Edit Listing button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(prop.id);
                          }}
                          className="
      w-full flex items-center justify-center gap-1.5
      px-2 py-2
      rounded-xl
      bg-[#F7F3EC] dark:bg-[#202020]
      text-[#242424] dark:text-[#F5F1E8]
      border border-[#E2D3C2] dark:border-[#38322D]
      shadow-[3px_3px_7px_rgba(0,0,0,0.08),-2px_-2px_6px_rgba(255,255,255,0.8)]
      dark:shadow-[3px_3px_8px_rgba(0,0,0,0.5)]
      hover:border-[#C49A6C]
      active:scale-[0.97]
      transition-all duration-200
      cursor-pointer
    "
                          title="Edit Listing"
                        >
                          <Edit className="w-3.5 h-3.5 shrink-0 text-[#946B46] dark:text-[#C49A6C]" />
                          <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                            Edit Listing
                          </span>
                        </button>

                        {/* Neumorphic Availability button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedForVacancy(prop);
                          }}

                          className="
  w-full flex items-center justify-center gap-1.5
  px-2 py-2
  rounded-xl
  bg-[#946B46] dark:bg-[#805B3B]
text-white dark:text-white
  border border-[#805B3C] dark:border-[#D8B48B]
  shadow-[3px_3px_8px_rgba(75,45,23,0.22),-1px_-1px_4px_rgba(255,255,255,0.45)]
  dark:shadow-[3px_3px_10px_rgba(0,0,0,0.5)]
  hover:bg-[#805B3B] dark:hover:bg-[#946B46]
  active:scale-[0.97]
  transition-all duration-200
  cursor-pointer
"

                          title="Update Availability"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                            Update Availability
                          </span>
                        </button>

                      </div>



                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPropertyId(prop.id);
                            setCurrentView('property-detail');
                          }}
                          className="flex items-center gap-1 text-[10px] sm:text-xs text-neutral-500 dark:text-[#8A8A8A] hover:text-black dark:hover:text-white font-bold cursor-pointer transition-colors"
                        >
                          <span>Public Preview</span>
                          <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPropertyToDelete(prop);
                          }}
                          className="flex items-center justify-center p-1.5 bg-white dark:bg-[#151515] hover:bg-red-50 dark:hover:bg-red-950/40 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-bold transition-all border border-neutral-200 dark:border-[#292929] hover:border-red-300 dark:hover:border-red-800 cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Vacancy Manager Modal */}
      {
        selectedForVacancy && (
          <VacancyManagerModal
            property={selectedForVacancy}
            onClose={() => setSelectedForVacancy(null)}
          />
        )
      }

      {/* Delete Single Property Confirmation Modal */}
      {
        propertyToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-[#292929] relative animate-in zoom-in-95">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="absolute top-5 right-5 text-neutral-400 dark:text-[#7D7D7D] hover:text-black dark:hover:text-white p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-950 dark:text-[#F5F5F5]">Delete this listing?</h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
                  This will remove <strong>"{propertyToDelete.name}"</strong> from your listings, lister dashboard, and public search.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPropertyToDelete(null)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#292929] text-neutral-700 dark:text-[#E0E0E0] text-xs font-bold hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteOne}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Listing</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete All Listings Confirmation Modal */}
      {
        showDeleteAllConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#111111] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-[#292929] relative animate-in zoom-in-95">
              <button
                type="button"
                onClick={() => setShowDeleteAllConfirm(false)}
                className="absolute top-5 right-5 text-neutral-400 dark:text-[#7D7D7D] hover:text-black dark:hover:text-white p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
                <AlertOctagon className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-950 dark:text-[#F5F5F5]">Delete all listings?</h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#A3A3A3] leading-relaxed">
                  This will permanently delete all <strong>{listerListings.length}</strong> listings belonging to your account. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-[#292929] text-neutral-700 dark:text-[#E0E0E0] text-xs font-bold hover:bg-neutral-100 dark:hover:bg-[#181818] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteAll}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Listings</span>
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};
