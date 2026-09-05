import React, { useMemo } from 'react';
import { Heart, MapPin, Star, Clock, AlertCircle, Video } from 'lucide-react';
import { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';
import { resolvePropertyCoordinates, calculateDistanceInKm } from '../utils/kenyaGeocoding';

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
  const isSaved = isPropertySaved(property.id);

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
  const formattedRent = `KSh ${property.monthlyRent.toLocaleString()}`;

  // Amenities preview (top 3)
  const topAmenities = property.amenities.slice(0, 3).map((a) => {
    if (a.includes('Water')) return 'Water';
    if (a.includes('Fibre')) return 'Fibre';
    if (a.includes('Security')) return 'Security';
    if (a.includes('Electricity')) return 'Prepaid';
    return a;
  });

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={handleClick}
      className={`group bg-white dark:bg-[#111111] rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer flex flex-col justify-between font-sans ${highlighted
          ? 'border-black dark:border-white ring-2 ring-black dark:ring-white shadow-lg scale-[1.01]'
          : 'border-neutral-200 dark:border-[#2A2A2A] hover:border-neutral-400 dark:hover:border-[#444444] hover:shadow-xl'
        }`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden bg-neutral-100 dark:bg-[#181818]">
        <img
          src={property.coverPhoto || property.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
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
          {property.video && (
            <span className="bg-white/95 text-black text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs border border-neutral-200 flex items-center gap-1 font-sans">
              <Video className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-800" />
              <span>Video</span>
            </span>
          )}
        </div>

        {/* Heart / Save Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer ${isSaved
              ? 'bg-black dark:bg-[#F5F5F5] text-white dark:text-[#111111] shadow-md scale-105 sm:scale-110'
              : 'bg-white/90 dark:bg-[#181818]/90 text-neutral-700 dark:text-[#F5F5F5] hover:bg-white dark:hover:bg-[#222222] hover:text-black dark:hover:text-white border border-neutral-200/60 dark:border-[#303030] shadow-xs'
            }`}
          aria-label={isSaved ? 'Remove from saved' : 'Save property'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current text-white dark:text-[#111111]' : ''}`} />
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
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rent & Name */}
          <div className="mb-1 sm:mb-1.5">
            <h3 className="font-bold text-neutral-900 dark:text-[#F5F5F5] text-xs sm:text-base md:text-lg group-hover:text-black dark:group-hover:text-white line-clamp-2 leading-snug font-sans">
              {property.name}
            </h3>
          </div>

          <div className="flex items-baseline gap-1 mb-1.5 sm:mb-2.5">
            <span className="text-sm sm:text-lg md:text-xl font-extrabold text-neutral-950 dark:text-[#F5F5F5] tracking-tight font-sans">
              {formattedRent}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-neutral-500 dark:text-[#A3A3A3] font-sans">/ mo</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-neutral-600 dark:text-[#A3A3A3] font-medium mb-2 sm:mb-3 font-sans">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 dark:text-[#7D7D7D] shrink-0" />
            <span className="truncate">
              {property.location.estate}, {property.location.subCounty}
            </span>
          </div>

          {/* Amenities Pills */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-[9px] sm:text-[11px] font-medium mb-2.5 sm:mb-4">
              {topAmenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="bg-neutral-100 dark:bg-[#181818] px-1.5 py-0.5 rounded text-neutral-700 dark:text-[#D5D5D5] border border-neutral-200/60 dark:border-[#303030] font-sans"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer: Rating + Time Posted */}
        <div className="pt-2 sm:pt-3 border-t border-neutral-100 dark:border-[#262626] flex items-center justify-between text-[10px] sm:text-xs text-neutral-500 dark:text-[#A3A3A3]">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-neutral-900 dark:text-[#F5F5F5] font-sans">
              {property.rating > 0 ? property.rating.toFixed(1) : 'New'}
            </span>
            {property.reviewCount > 0 && (
              <span className="text-neutral-400 dark:text-[#7D7D7D] text-[10px] sm:text-xs font-sans">
                ({property.reviewCount})
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[9px] sm:text-[11px] text-neutral-400 dark:text-[#7D7D7D] font-sans">

            <span className="flex items-center gap-1 mr-2">
              <Heart className="w-2.5 h-2.5" />
              <span>
                {(property as any).saveCount ?? 0} {((property as any).saveCount ?? 0) === 1 ? 'save' : 'saves'}
              </span>
            </span> <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>{property.timePosted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
