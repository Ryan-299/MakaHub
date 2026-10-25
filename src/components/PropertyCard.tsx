import React, { useMemo, useState } from 'react';
import { Heart, MapPin, Star, Clock, AlertCircle, Video, Droplet, Zap, Wifi, ShieldCheck } from 'lucide-react';
import { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';
import { resolvePropertyCoordinates, calculateDistanceInKm } from '../utils/kenyaGeocoding';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface PropertyCardProps {
  property: PropertyListing;
  onSelect?: (property: PropertyListing) => void;
  highlighted?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  highlighted = false
}) => {
  const { setSelectedPropertyId, setCurrentView, isPropertySaved, toggleSaveProperty, seekerLocation } = useApp();
  const mixedUnitRecords = useQuery(
    api.propertyUnitTypes.getByProperty,
    property.type === 'Mixed Units'
      ? { propertyId: property.id as Id<'properties'> }
      : 'skip'
  );
  const isSaved = isPropertySaved(property.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  // Geographic distance calculated when seeker has granted location
  const realDistanceKm = useMemo(() => {
    if (!seekerLocation) return null;
    const { lat, lng } = resolvePropertyCoordinates(property.location);
    return calculateDistanceInKm(seekerLocation.lat, seekerLocation.lng, lat, lng);
  }, [seekerLocation, property.location]);

  const handleClick = () => {
    setSelectedPropertyId(property.id);
    setCurrentView('property-detail');
    if (onSelect) onSelect(property);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveProperty(property.id);
  };

  const isAvailable = property.vacancies > 0;

  // Format rent in Kenyan Shillings
  const availableUnitTypes = [...(mixedUnitRecords ?? [])]
    .filter((unit) => unit.vacancies > 0)
    .sort((a, b) => a.monthlyRent - b.monthlyRent);

  const previewUnitTypes = availableUnitTypes.slice(0, 2);

  const remainingUnitTypes = Math.max(
    0,
    availableUnitTypes.length - 2
  );
  const formattedRent = `KSh ${property.monthlyRent.toLocaleString()}`;

  // Amenities preview (top 3)
  const topAmenities = property.amenities.slice(0, 3).map((amenity) => {
    const a = amenity.toLowerCase();

    if (a.includes('water')) return 'Water';

    if (a.includes('electricity') || a.includes('prepaid')) {
      return 'Prepaid';
    }

    if (
      a.includes('fibre') ||
      a.includes('fiber') ||
      a.includes('wifi') ||
      a.includes('wi-fi')
    ) {
      return 'WiFi';
    }

    if (a.includes('security')) return 'Security';

    return amenity;
  });
  return (
    <div
      id={`property-card-${property.id}`}
      onClick={handleClick}
      className={`bg-[#F8F3EB] dark:bg-[#151515]rounded -[18px] border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between font-sans ${highlighted
        ? 'border-black dark:border-white ring-2 ring-black dark:ring-white shadow-lg scale-[1.01]'
        : 'border-[#E4D8C8] dark:border-[#2A2A2A] shadow-[6px_6px_14px_rgba(0,0,0,0.07),-5px_-5px_12px_rgba(255,255,255,0.65)] dark:shadow-[6px_6px_14px_rgba(0,0,0,0.4),-4px_-4px_10px_rgba(255,255,255,0.03)] hover:border-[#C49A6C]'
        }`}
      style={{ borderRadius: '22px' }}
    >
      {/* Top Image Section */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-t-[22px] bg-neutral-100 dark:bg-[#181818]">
        {!imageLoaded && (
          <div className="absolute inset-0 z-10 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        )}
        <img
          src={property.coverPhoto || property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}
          alt={property.name}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap items-center gap-1 sm:gap-1.5 z-10">
          <span className="bg-black text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-wider shadow-xs font-sans">
            {property.type}
          </span>
          {property.featured && (
            <span className="bg-white text-black text-[10px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs border border-neutral-200 font-sans">
              Featured
            </span>
          )}

        </div>

        {/* Heart / Save Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${isSaved
            ? 'bg-white text-red-500 shadow-md scale-105 sm:scale-110 border border-neutral-200'
            : 'bg-white/90 text-neutral-700 hover:bg-white shadow-md border border-neutral-200'
            }`}
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-neutral-700'}`} />
        </button>

        {/* Bottom Banner: Vacancy status */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex items-center justify-between pointer-events-none">
          <div
            className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1 sm:gap-1.5 font-sans ${isAvailable
              ? 'bg-white/95 dark:bg-[#111111]/90 text-black dark:text-[#F5F5F5] border border-neutral-200 dark:border-[#303030]'
              : 'bg-neutral-900/90 text-white'
              }`}
          >
            {isAvailable ? (
              <>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{property.vacancies} {property.vacancies === 1 ? 'vacancy' : 'vacancies'}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300" />
                <span>Occupied</span>
              </>
            )}
          </div>

          {realDistanceKm !== null && (
            <div className="text-[9px] sm:text-[11px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/80 dark:bg-[#F5F5F5]/90 text-white dark:text-[#111111] backdrop-blur-md font-sans">
              {realDistanceKm} km
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between bg-[#F8F3EB] dark:bg-[#151515] rounded-b-[22px]">
        <div>
          {/* Rent & Name */}
          <div className="mb-1 sm:mb-1.5">
            <h3 className="font-bold text-neutral-900 dark:text-[#F5F5F5] text-xs sm:text-base md:text-lg group-hover:text-black dark:group-hover:text-white line-clamp-2 leading-snug font-sans">
              {property.name}
            </h3>
          </div>


          {property.type === 'Mixed Units' ? (
            <div className="mb-2.5">
              {mixedUnitRecords === undefined ? (
                <p className="text-xs text-neutral-500">Loading unit prices...</p>
              ) : previewUnitTypes.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {previewUnitTypes.map((unit) => (
                      <div
                        key={unit._id}
                        className="min-w-0 border-r border-[#C49A6C]/30 last:border-r-0 px-2 first:pl-0 last:pr-0"
                      >
                        <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-300 truncate">
                          {unit.type}
                        </p>
                        <p className="text-sm sm:text-base font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
                          KSh {unit.monthlyRent.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {unit.vacancies} available
                        </p>
                      </div>
                    ))}
                  </div>

                  {remainingUnitTypes > 0 && (
                    <p className="mt-2 text-xs font-semibold text-[var(--rentike-bronze)]">
                      +{remainingUnitTypes} more unit types
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  No vacancies available
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-1 mb-1.5 sm:mb-2.5">
              <span className="text-sm sm:text-lg md:text-xl font-extrabold text-neutral-950 dark:text-[#F5F5F5]">
                {formattedRent}
              </span>
              <span className="text-[10px] sm:text-xs font-medium text-neutral-500 dark:text-[#A3A3A3]">
                /mo
              </span>
            </div>
          )}


          {/* Location */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-neutral-600 dark:text-[#A3A3A3] font-medium mb-2 sm:mb-3 font-sans">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 dark:text-[#7D7D7D] shrink-0" />
            <span className="truncate">
              {property.location.estate}, {property.location.subCounty}
            </span>
            {realDistanceKm !== null && Number.isFinite(realDistanceKm) && (
              <span className="shrink-0 font-semibold text-neutral-700 dark:text-neutral-300">
                · {realDistanceKm < 1
                  ? `${Math.round(realDistanceKm * 1000)} m away`
                  : `${realDistanceKm.toFixed(1)} km away`}
              </span>
            )}
          </div>

          {/* Amenities Pills */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[11px] font-medium mb-2.5 sm:mb-4">
              {topAmenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1 bg-[#F8F3EB] dark:bg-[#181818] border border-[#E4D8C8] dark:border-[#2A2A2A] px-2 py-1 rounded-lg text-neutral-700 dark:text-[#D5D5D5]"
                >
                  {amenity === 'Water' && <Droplet className="w-3 h-3 text-blue-500" />}
                  {amenity === 'Prepaid' && <Zap className="w-3 h-3 text-[var(--rentike-bronze)]" />}
                  {amenity === 'WiFi' && <Wifi className="w-3 h-3 text-violet-500" />}
                  {amenity === 'Security' && <ShieldCheck className="w-3 h-3 text-[var(--rentike-bronze)]" />}

                  <span>{amenity}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-[#E4D8C8] dark:border-[#2A2A2A] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-neutral-900 dark:text-[#F5F5F5]">
              New
            </span>
          </div>

          <div className="flex items-center gap-1 text-neutral-500 dark:text-[#A3A3A3]">
            <Heart className="w-3 h-3" />
            <span>
              {(property as any).saveCount ?? 0}{' '}
              {((property as any).saveCount ?? 0) === 1 ? 'save' : 'saves'}
            </span>
          </div>
        </div>
      </div>
    </div>

  );
};
