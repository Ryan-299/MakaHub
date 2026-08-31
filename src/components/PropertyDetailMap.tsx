import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, ZoomIn, ZoomOut, ExternalLink, Plus, Minus } from 'lucide-react';
import { PropertyListing } from '../types';
import { resolvePropertyCoordinates } from '../utils/kenyaGeocoding';

interface PropertyDetailMapProps {
  property: PropertyListing;
  className?: string;
}

export const PropertyDetailMap: React.FC<PropertyDetailMapProps> = ({
  property,
  className = 'h-80 w-full'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  // Resolve exact coordinates saved by the lister, with fallback for edge cases
  const { lat: propertyLat, lng: propertyLng, isFallback } = useMemo(() => {
    return resolvePropertyCoordinates(property.location);
  }, [property.location]);

  // Format currency
  const formattedRent = property.monthlyRent
    ? `KSh ${property.monthlyRent.toLocaleString()}/mo`
    : '';

  // Prevent map gestures from interfering with floating controls
  useEffect(() => {
    if (controlsRef.current) {
      L.DomEvent.disableClickPropagation(controlsRef.current);
      L.DomEvent.disableScrollPropagation(controlsRef.current);
    }
  }, []);

  // Initialize or re-center the map whenever the property or coordinates change
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create new Leaflet Map instance with FULL navigation and zoom capabilities for seekers
      const map = L.map(mapContainerRef.current, {
        center: [propertyLat, propertyLng],
        zoom: 16,
        minZoom: 4,
        maxZoom: 19,
        zoomControl: false,
        scrollWheelZoom: true,
        touchZoom: true,
        dragging: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true
      });

      // Ensure all navigation handlers are active
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();

      // Standard OSM Tile Layer with high-contrast crisp rendering
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 4
      }).addTo(map);

      // Custom Black & White Property Marker Pin (STRICTLY LOCKED & READ-ONLY)
      const propertyPinIcon = L.divIcon({
        className: 'custom-property-detail-pin',
        html: `
          <div class="flex flex-col items-center select-none cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="px-2.5 py-1 bg-black text-white text-[11px] font-bold rounded-lg shadow-xl border border-neutral-800 flex items-center gap-1.5 whitespace-nowrap mb-1">
              <span class="max-w-[150px] truncate">${property.name}</span>
            </div>
            <div class="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shadow-2xl border-2 border-white ring-2 ring-black/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 60],
        iconAnchor: [18, 60],
        popupAnchor: [0, -60]
      });

      // Strict LOCKED marker: draggable is false, coordinates are fixed to lister values
      const marker = L.marker([propertyLat, propertyLng], {
        draggable: false,
        icon: propertyPinIcon,
        zIndexOffset: 1000
      }).addTo(map);

      // Informative Popup for the seeker
      const locationText = [
        property.location.estate,
        property.location.ward,
        property.location.subCounty,
        property.location.county
      ]
        .filter(Boolean)
        .join(', ');

      const popupHtml = `
        <div class="p-3 text-neutral-900 min-w-[200px]">
          <div class="text-xs font-extrabold text-neutral-950">${property.name}</div>
          <div class="text-[11px] text-neutral-500 font-medium mt-0.5">
            ${locationText}
          </div>
          ${
            property.location.address
              ? `<div class="text-[10px] text-neutral-400 mt-1 italic">${property.location.address}</div>`
              : ''
          }
          <div class="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold">
            <span class="text-black">${formattedRent}</span>
            <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">${property.vacancies > 0 ? `${property.vacancies} Vacant` : 'View Details'}</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml, { closeButton: true });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setMapReady(true);

      // Invalidate size after layout completes
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
      setTimeout(() => {
        map.invalidateSize();
      }, 350);
    } else {
      // Map is already created, center on the new property coordinates
      const map = mapInstanceRef.current;
      const marker = markerRef.current;

      map.setView([propertyLat, propertyLng], 16, { animate: true });

      if (marker) {
        marker.setLatLng([propertyLat, propertyLng]);
        const locationText = [
          property.location.estate,
          property.location.ward,
          property.location.subCounty,
          property.location.county
        ]
          .filter(Boolean)
          .join(', ');

        const popupHtml = `
          <div class="p-3 text-neutral-900 min-w-[200px]">
            <div class="text-xs font-extrabold text-neutral-950">${property.name}</div>
            <div class="text-[11px] text-neutral-500 font-medium mt-0.5">
              ${locationText}
            </div>
            ${
              property.location.address
                ? `<div class="text-[10px] text-neutral-400 mt-1 italic">${property.location.address}</div>`
                : ''
            }
            <div class="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-bold">
              <span class="text-black">${formattedRent}</span>
              <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">${property.vacancies > 0 ? `${property.vacancies} Vacant` : 'View Details'}</span>
            </div>
          </div>
        `;
        marker.setPopupContent(popupHtml);
      }

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [property.id, propertyLat, propertyLng]);

  // Responsive dynamic resize observer to keep map container geometry accurate
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([propertyLat, propertyLng], 16, {
        animate: true
      });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${propertyLat},${propertyLng}`;

  return (
    <div className="space-y-3 font-sans">
      {/* Map Card Canvas */}
      <div className={`relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-[#292929] shadow-sm bg-neutral-100 dark:bg-[#111111] ${className}`}>
        {/* Leaflet DOM container */}
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-grab active:cursor-grabbing" />

        {/* Floating Seeker Navigation & Zoom Controls */}
        <div
          ref={controlsRef}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-auto"
        >
          <button
            type="button"
            id="property-detail-zoom-in-btn"
            onClick={handleZoomIn}
            className="w-9 h-9 bg-white dark:bg-[#151515] hover:bg-neutral-50 dark:hover:bg-[#1E1E1E] active:bg-neutral-100 dark:active:bg-[#252525] text-neutral-900 dark:text-[#F5F5F5] rounded-xl shadow-md border border-neutral-200 dark:border-[#383838] flex items-center justify-center transition-all active:scale-95 cursor-pointer font-bold select-none"
            aria-label="Zoom In (+)"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            id="property-detail-zoom-out-btn"
            onClick={handleZoomOut}
            className="w-9 h-9 bg-white dark:bg-[#151515] hover:bg-neutral-50 dark:hover:bg-[#1E1E1E] active:bg-neutral-100 dark:active:bg-[#252525] text-neutral-900 dark:text-[#F5F5F5] rounded-xl shadow-md border border-neutral-200 dark:border-[#383838] flex items-center justify-center transition-all active:scale-95 cursor-pointer font-bold select-none"
            aria-label="Zoom Out (-)"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            id="property-detail-recenter-btn"
            onClick={handleRecenter}
            className="w-9 h-9 bg-white dark:bg-[#151515] hover:bg-neutral-50 dark:hover:bg-[#1E1E1E] active:bg-neutral-100 dark:active:bg-[#252525] text-neutral-900 dark:text-[#F5F5F5] rounded-xl shadow-md border border-neutral-200 dark:border-[#383838] flex items-center justify-center transition-all active:scale-95 cursor-pointer select-none"
            aria-label="Center on Property"
            title="Re-center on Property Location"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Exact Location Status Pill */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-[#111111]/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-neutral-200/80 dark:border-[#333333] shadow-md flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-[#E5E5E5] pointer-events-none select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {isFallback ? 'Approximate Area Location' : 'Exact Lister Building Pin'}
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] font-mono hidden sm:inline">
            ({propertyLat.toFixed(4)}, {propertyLng.toFixed(4)})
          </span>
        </div>
      </div>

      {/* Map Sub-Bar: Address + Google Maps Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs text-neutral-600 dark:text-[#A3A3A3]">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <MapPin className="w-3.5 h-3.5 text-neutral-500 dark:text-[#7D7D7D] shrink-0" />
          <span className="truncate">
            {property.location.address ? `${property.location.address} • ` : ''}
            {[
              property.location.estate,
              property.location.ward,
              property.location.subCounty,
              property.location.county
            ]
              .filter(Boolean)
              .join(', ')}
          </span>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 dark:text-[#F5F5F5] hover:text-neutral-600 dark:hover:text-[#D5D5D5] underline underline-offset-2 transition-colors cursor-pointer shrink-0"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
