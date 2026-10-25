
import React, { useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Navigation,
  ExternalLink,
  Plus,
  Minus
} from 'lucide-react';

import {
  setOptions,
  importLibrary
} from '@googlemaps/js-api-loader';

import { PropertyListing } from '../types';
import { useApp } from '../context/AppContext';
import { resolvePropertyCoordinates } from '../utils/kenyaGeocoding';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

// Reuse the same Google Maps configuration as InteractiveMap.
// Only configure the loader if another map has not done so.
if (!globalThis.google?.maps?.importLibrary) {
  setOptions({
    key: GOOGLE_MAPS_API_KEY,
    v: 'weekly'
  });
}

interface PropertyDetailMapProps {
  property: PropertyListing;
  className?: string;
}

export const PropertyDetailMap: React.FC<PropertyDetailMapProps> = ({
  property,
  className = 'h-80 w-full'
}) => {
  const { resolvedTheme } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const isDark = resolvedTheme === 'dark';

  const { lat: propertyLat, lng: propertyLng, isFallback } =
    useMemo(
      () => resolvePropertyCoordinates(property.location),
      [property.location]
    );

  const locationText = [
    property.location.estate,
    property.location.ward,
    property.location.subCounty,
    property.location.county
  ]
    .filter(Boolean)
    .join(', ');

  const formattedRent = `KSh ${property.monthlyRent.toLocaleString()}/mo`;

  const validCoordinates =
    Number.isFinite(propertyLat) &&
    Number.isFinite(propertyLng);

  // Recreate Google Maps when its native colour scheme changes.
  useEffect(() => {
    if (!mapContainerRef.current || !validCoordinates) return;

    let cancelled = false;
    let createdMap: google.maps.Map | null = null;
    let createdMarker:
      | google.maps.marker.AdvancedMarkerElement
      | null = null;
    let createdInfoWindow: google.maps.InfoWindow | null = null;

    const initialize = async () => {
      try {
        const [mapsLibrary, markerLibrary] = await Promise.all([
          importLibrary('maps') as Promise<google.maps.MapsLibrary>,
          importLibrary('marker') as Promise<google.maps.MarkerLibrary>
        ]);

        if (cancelled || !mapContainerRef.current) return;

        const { Map, InfoWindow } = mapsLibrary;
        const { AdvancedMarkerElement } = markerLibrary;

        const map = new Map(mapContainerRef.current, {
          center: {
            lat: propertyLat,
            lng: propertyLng
          },
          zoom: 16,
          minZoom: 4,
          maxZoom: 19,
          mapId: GOOGLE_MAPS_MAP_ID,
          colorScheme: isDark
            ? google.maps.ColorScheme.DARK
            : google.maps.ColorScheme.LIGHT,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          rotateControl: false,
          gestureHandling: 'greedy',
          keyboardShortcuts: true,
          tilt: 0
        });

        createdMap = map;
        mapRef.current = map;

        // Build a labelled property marker without
        // inserting property names as raw HTML.
        const markerContent = document.createElement('div');
        markerContent.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transform: translateY(-12px);
        `;

        const nameLabel = document.createElement('div');
        nameLabel.textContent = property.type;


        nameLabel.style.cssText = `
  max-width: 150px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #F8F5EF;
  color: #8B6B43;
  border: 1px solid rgba(139,107,67,0.18);
  box-shadow: 0 3px 8px rgba(0,0,0,0.13);
  font-size: 10px;
  line-height: 1;
  font-weight: 700;
  font-family: sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
`;



        const pin = document.createElement('div');
        pin.style.cssText = `
         width: 48px;
height: 48px;
border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8F5EF;
          color: #8B6B43;
          border: 1px solid rgba(139,107,67,0.25);
          box-shadow:
            inset 2px 2px 4px rgba(255,255,255,0.9),
            inset -3px -3px 6px rgba(139,107,67,0.10),
            0 5px 12px rgba(0,0,0,0.22);
        `;

        const icon = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );

        icon.setAttribute('width', '22');
        icon.setAttribute('height', '22');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', '#8B6B43');
        icon.setAttribute('stroke-width', '2.2');
        icon.setAttribute('stroke-linecap', 'round');
        icon.setAttribute('stroke-linejoin', 'round');

        const roof = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        roof.setAttribute('d', 'M3 11.5L12 4L21 11.5');

        const walls = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        walls.setAttribute('d', 'M5.5 10V20H18.5V10');

        const door = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        door.setAttribute('d', 'M9.5 20V14H14.5V20');

        icon.append(roof, walls, door);
        pin.appendChild(icon);
        markerContent.append(pin, nameLabel);

        const marker = new AdvancedMarkerElement({
          map,
          position: {
            lat: propertyLat,
            lng: propertyLng
          },
          content: markerContent,
          title: property.name,
          gmpClickable: true,
          gmpDraggable: false,
          zIndex: 1000
        });

        createdMarker = marker;
        markerRef.current = marker;

        // The information window uses DOM text nodes,
        // so listing content is displayed safely.
        const infoContent = document.createElement('div');
        infoContent.style.cssText = `
          min-width: 190px;
          max-width: 250px;
          padding: 8px;
          font-family: sans-serif;
          color: #171717;
        `;

        const title = document.createElement('div');
        title.textContent = property.name;
        title.style.cssText = `
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 5px;
        `;

        const address = document.createElement('div');
        address.textContent = [
          property.location.address,
          locationText
        ].filter(Boolean).join(' · ');
        address.style.cssText = `
          font-size: 11px;
          color: #666666;
          line-height: 1.5;
          margin-bottom: 8px;
        `;

        const rent = document.createElement('div');
        rent.textContent = formattedRent;
        rent.style.cssText = `
          font-size: 13px;
          font-weight: 800;
          color: #8B6B43;
          margin-bottom: 5px;
        `;

        const vacancies = document.createElement('div');
        vacancies.textContent =
          property.vacancies > 0
            ? `${property.vacancies} vacant`
            : 'No current vacancies';

        vacancies.style.cssText = `
          font-size: 11px;
          font-weight: 700;
          color: #047857;
        `;

        infoContent.append(title, address, rent, vacancies);

        const infoWindow = new InfoWindow({
          content: infoContent,
          maxWidth: 280
        });

        createdInfoWindow = infoWindow;
        infoWindowRef.current = infoWindow;

        marker.addListener('click', () => {
          infoWindow.open({
            anchor: marker,
            map
          });
        });
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Unable to initialize property Google Map:',
            error
          );
        }
      }
    };

    void initialize();

    return () => {
      cancelled = true;

      if (createdInfoWindow) {
        createdInfoWindow.close();
      }

      if (createdMarker) {
        google.maps.event.clearInstanceListeners(createdMarker);
        createdMarker.map = null;
      }

      if (createdMap) {
        google.maps.event.clearInstanceListeners(createdMap);
      }

      if (mapRef.current === createdMap) {
        mapRef.current = null;
      }

      if (markerRef.current === createdMarker) {
        markerRef.current = null;
      }

      if (infoWindowRef.current === createdInfoWindow) {
        infoWindowRef.current = null;
      }
    };
  }, [
    property.id,
    property.name,
    propertyLat,
    propertyLng,
    resolvedTheme
  ]);

  const handleZoomIn = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const map = mapRef.current;
    if (!map) return;

    map.setZoom(Math.min((map.getZoom() ?? 16) + 1, 19));
  };

  const handleZoomOut = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const map = mapRef.current;
    if (!map) return;

    map.setZoom(Math.max((map.getZoom() ?? 16) - 1, 4));
  };

  const handleRecenter = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const map = mapRef.current;
    if (!map) return;

    map.panTo({
      lat: propertyLat,
      lng: propertyLng
    });

    map.setZoom(16);

    if (markerRef.current && infoWindowRef.current) {
      infoWindowRef.current.open({
        map,
        anchor: markerRef.current
      });
    }
  };


  const googleMapsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${propertyLat},${propertyLng}&travelmode=driving`;


  return (
    <div className="space-y-3 font-sans">
      {/* Property location map */}
      <div
        className={`
          relative rounded-2xl overflow-hidden
          border border-neutral-200
          dark:border-[#292929]
          shadow-sm
          bg-neutral-100 dark:bg-[#111111]
          ${className}
        `}
      >
        <div
          ref={mapContainerRef}
          className="w-full h-full"
        />

        {/* Floating zoom and recenter controls */}
        <div
          className="
            absolute top-3 right-3 z-20
            flex flex-col gap-2
            pointer-events-auto
          "
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          onDoubleClick={event => event.stopPropagation()}
        >
          <button
            type="button"
            id="property-detail-zoom-in-btn"
            onClick={handleZoomIn}
            className="
              w-9 h-9 rounded-xl
              bg-white dark:bg-[#151515]
              text-neutral-900 dark:text-[#F5F5F5]
              shadow-md
              border border-neutral-200 dark:border-[#383838]
              flex items-center justify-center
              transition-all active:scale-95
            "
            aria-label="Zoom In (+)"
            title="Zoom In (+)"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="property-detail-zoom-out-btn"
            onClick={handleZoomOut}
            className="
              w-9 h-9 rounded-xl
              bg-white dark:bg-[#151515]
              text-neutral-900 dark:text-[#F5F5F5]
              shadow-md
              border border-neutral-200 dark:border-[#383838]
              flex items-center justify-center
              transition-all active:scale-95
            "
            aria-label="Zoom Out (-)"
            title="Zoom Out (-)"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="property-detail-recenter-btn"
            onClick={handleRecenter}
            className="
              w-9 h-9 rounded-xl
              bg-white dark:bg-[#151515]
              text-neutral-900 dark:text-[#F5F5F5]
              shadow-md
              border border-neutral-200 dark:border-[#383838]
              flex items-center justify-center
              transition-all active:scale-95
            "
            aria-label="Center on Property"
            title="Re-center on Property Location"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Exact/approximate location status */}
        <div
          className="
            absolute bottom-3 left-3 z-20
            bg-white/95 dark:bg-[#111111]/95
            backdrop-blur-xs px-3 py-1.5
            rounded-xl
            border border-neutral-200/80
            dark:border-[#333333]
            shadow-md
            flex items-center gap-2
            text-xs font-semibold
            text-neutral-800 dark:text-[#E5E5E5]
            pointer-events-none select-none
          "
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />

          <span>
            {isFallback
              ? 'Approximate Area Location'
              : 'Exact Lister Building Pin'}
          </span>

          <span className="text-[11px] text-neutral-400 dark:text-[#7D7D7D] font-mono hidden sm:inline">
            ({propertyLat.toFixed(4)}, {propertyLng.toFixed(4)})
          </span>
        </div>
      </div>

      {/* Existing address and external Google Maps link */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs text-neutral-600 dark:text-[#A3A3A3]">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />

          <span className="truncate">
            {property.location.address
              ? `${property.location.address} • `
              : ''}
            {locationText}
          </span>
        </div>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-1
            text-xs font-bold
            text-neutral-900 dark:text-[#F5F5F5]
            hover:text-neutral-600 dark:hover:text-[#D5D5D5]
            underline underline-offset-2
            transition-colors shrink-0
          "
        >
          <span>Get Directions</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
