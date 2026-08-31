import React from 'react';
import { MapPin, ArrowRight, X, Building } from 'lucide-react';
import { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';

interface PropertyPreviewCardProps {
  property: PropertyListing;
  onClose?: () => void;
  showViewButton?: boolean;
}

export const PropertyPreviewCard: React.FC<PropertyPreviewCardProps> = ({
  property,
  onClose,
  showViewButton = true
}) => {
  const { setSelectedPropertyId, setCurrentView } = useApp();

  const handleView = (e?: React.MouseEvent) => {
    if (!showViewButton) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedPropertyId(property.id);
    setCurrentView('property-detail');
  };

  const formattedRent = `KSh ${property.monthlyRent.toLocaleString()}/month`;

  const locationText = property.location.estate
    ? `${property.location.estate}, ${property.location.subCounty || property.location.county}`
    : `${property.location.subCounty || property.location.county}, ${property.location.county}`;

  return (
    <div
      id={`map-preview-${property.id}`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="w-72 sm:w-80 bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-[#303030] overflow-hidden text-neutral-900 dark:text-[#F5F5F5] select-none transition-all font-sans"
    >
      {/* Property Image & Badges */}
      <div
        className={`relative h-36 w-full bg-neutral-100 dark:bg-[#1A1A1A] overflow-hidden ${
          showViewButton ? 'cursor-pointer group' : ''
        }`}
        onClick={showViewButton ? handleView : undefined}
      >
        <img
          src={
            property.coverPhoto ||
            property.images?.[0] ||
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'
          }
          alt={property.name}
          className={`w-full h-full object-cover ${
            showViewButton ? 'group-hover:scale-105 transition-transform duration-300' : ''
          }`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Close Button */}
        {onClose && (
          <button
            type="button"
            id={`close-map-preview-${property.id}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors z-10 shadow-sm"
            aria-label="Close Preview"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Type Badge */}
        <div className="absolute top-2.5 left-2.5 bg-black dark:bg-[#202020] text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase shadow-xs">
          {property.type}
        </div>

        {/* Vacancies Pill */}
        <div className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-[#151515]/95 text-neutral-900 dark:text-[#F5F5F5] text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs backdrop-blur-xs flex items-center gap-1 border border-neutral-200/60 dark:border-[#303030]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>
            {property.vacancies} {property.vacancies === 1 ? 'vacancy' : 'vacancies'}
          </span>
        </div>
      </div>

      {/* Property Details Content */}
      <div className="p-4 space-y-2.5">
        <div
          className={showViewButton ? 'cursor-pointer' : ''}
          onClick={showViewButton ? handleView : undefined}
        >
          <h4
            className={`font-bold text-base text-neutral-950 dark:text-[#F5F5F5] line-clamp-1 leading-snug ${
              showViewButton ? 'hover:text-neutral-700 dark:hover:text-[#D5D5D5] transition-colors' : ''
            }`}
          >
            {property.name}
          </h4>

          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-[#A3A3A3] font-medium mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 dark:text-[#7D7D7D] shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        </div>

        {/* Price & Unit Breakdown */}
        <div className="pt-2 border-t border-neutral-100 dark:border-[#262626] flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-[#7D7D7D] block">Monthly Rent</span>
            <span className="text-base font-black text-neutral-950 dark:text-[#F5F5F5] tracking-tight">
              {formattedRent}
            </span>
          </div>
          <span className="text-[11px] font-bold text-neutral-600 dark:text-[#D5D5D5] bg-neutral-100 dark:bg-[#181818] px-2 py-0.5 rounded-md border border-neutral-200/60 dark:border-[#2A2A2A]">
            {property.type}
          </span>
        </div>

        {/* View Property Action Button */}
        {showViewButton && (
          <button
            type="button"
            id={`view-property-btn-${property.id}`}
            onClick={handleView}
            className="w-full mt-1 bg-black dark:bg-[#F5F5F5] hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-[#111111] py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <span>View Property</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
