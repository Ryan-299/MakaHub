
import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, CheckCircle2, Crosshair, Loader2 } from 'lucide-react';
import {
  geocodeKenyanHierarchy,
  GeocodedLocation
} from '../utils/kenyaGeocoding';

interface PropertyLocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  lat?: number;
  lng?: number;
  county?: string;
  subCounty?: string;
  ward?: string;
  estate?: string;
  onLocationSelect?: (coords: { lat: number; lng: number }) => void;
  onChange?: (lat: number, lng: number) => void;
  selectedEstateName?: string;
  unitTypeLabel?: string;
}

const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;

export const PropertyLocationPickerMap: React.FC<PropertyLocationPickerMapProps> = ({
  initialLat,
  initialLng,
  lat = -1.2223,
  lng = 36.9015,
  county,
  subCounty,
  ward,
  estate,
  onLocationSelect,
  onChange,
  selectedEstateName,
  unitTypeLabel = 'Building Location'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useApp();
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const unitTypeLabelRef = useRef<HTMLDivElement | null>(null);
  const listenersRef = useRef<google.maps.MapsEventListener[]>([]);
  const callbacksRef = useRef({ onLocationSelect, onChange });

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [activeAreaLabel, setActiveAreaLabel] = useState('');

  const effectiveLat = initialLat ?? lat ?? -1.2223;
  const effectiveLng = initialLng ?? lng ?? 36.9015;




  // Keep callback references current without rebuilding the map.
  callbacksRef.current = { onLocationSelect, onChange };
  // Update the building marker label when property types change.
  useEffect(() => {
    if (unitTypeLabelRef.current) {
      unitTypeLabelRef.current.textContent = unitTypeLabel;
    }
  }, [unitTypeLabel]);

  const notifyLocationChange = (newLat: number, newLng: number) => {
    callbacksRef.current.onLocationSelect?.({
      lat: newLat,
      lng: newLng
    });

    callbacksRef.current.onChange?.(newLat, newLng);

    setHasSelected(true);
  };

  const notifyRef = useRef(notifyLocationChange);
  notifyRef.current = notifyLocationChange;

  // Initialize Google Maps once for this component instance.
  useEffect(() => {
    let cancelled = false;
    let createdMap: google.maps.Map | null = null;
    let createdMarker: google.maps.marker.AdvancedMarkerElement | null = null;
    const listeners: google.maps.MapsEventListener[] = [];

    const initializeMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key is not configured.');
        }

        if (!GOOGLE_MAPS_MAP_ID) {
          throw new Error('Google Maps Map ID is not configured.');
        }

        const { Map } =
          await importLibrary('maps') as google.maps.MapsLibrary;

        const { AdvancedMarkerElement } =
          await importLibrary('marker') as google.maps.MarkerLibrary;

        if (cancelled || !mapContainerRef.current) return;

        const isDark = document.documentElement.classList.contains('dark');

        const map = new Map(mapContainerRef.current, {
          center: {
            lat: effectiveLat,
            lng: effectiveLng
          },
          zoom: 14,
          minZoom: 5,
          maxZoom: 19,
          mapId: GOOGLE_MAPS_MAP_ID,
          colorScheme: isDark
            ? google.maps.ColorScheme.DARK
            : google.maps.ColorScheme.LIGHT,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: false,
          clickableIcons: false,
          gestureHandling: 'greedy'
        });

        createdMap = map;

        // Rentike bronze building pin.


        const pinElement = document.createElement('div');

        // Match the seeker-side Rentike house marker.
        pinElement.style.cssText = `
  width: 40px;
  height: 46px;
  position: relative;
  overflow: visible;
  cursor: grab;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.22));
`;

        pinElement.innerHTML = `
  <div
    style="
      position: relative;
      width: 40px;
      height: 46px;
      display: flex;
      justify-content: center;
      overflow: visible;
    "
  >
    <!-- Neumorphic house marker -->
    <div
      style="
        width: 40px;
        height: 40px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #F8F5EF;
        border: 1px solid rgba(139,107,67,0.18);
        box-shadow:
          inset 2px 2px 4px rgba(255,255,255,0.9),
          inset -3px -3px 6px rgba(139,107,67,0.10),
          0 6px 14px rgba(0,0,0,0.18);
        z-index: 2;
      "
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 11.5L12 4L21 11.5"
          stroke="#8B6B43"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M5.5 10V20H18.5V10"
          stroke="#8B6B43"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M9.5 20V14H14.5V20"
          stroke="#8B6B43"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Pointer -->
    <div
      style="
        position: absolute;
        bottom: 1px;
        left: 50%;
        width: 10px;
        height: 10px;
        background: #F8F5EF;
        border-right: 1px solid rgba(139,107,67,0.18);
        border-bottom: 1px solid rgba(139,107,67,0.18);
        transform: translateX(-50%) rotate(45deg);
        z-index: 1;
      "
    ></div>
    
    <!-- Dynamic property type label -->
<div data-unit-type-label="true"
      style="
       position: absolute;
top: 44px;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 8px;
        border-radius: 999px;
        white-space: nowrap;
        font-size: 10px;
        line-height: 1;
        font-weight: 700;
        font-family: sans-serif;
        background: #F8F5EF;
        color: #8B6B43;
        border: 1px solid rgba(139,107,67,0.18);
        box-shadow: 0 3px 8px rgba(0,0,0,0.13);
        pointer-events: none;
      "
    >
      ${unitTypeLabel}
    </div>

  </div>
`;

        unitTypeLabelRef.current = pinElement.querySelector(
          '[data-unit-type-label]'
        ) as HTMLDivElement | null;




        // Marker is created but not displayed until location selection.
        const marker = new AdvancedMarkerElement({
          position: {
            lat: effectiveLat,
            lng: effectiveLng
          },
          content: pinElement,
          gmpDraggable: true,
          title: 'Building location'
        });

        createdMarker = marker;

        const selectLocation = (newLat: number, newLng: number) => {
          marker.position = {
            lat: newLat,
            lng: newLng
          };

          marker.map = map;
          notifyRef.current(newLat, newLng);
        };

        // Tap anywhere to place the building pin.
        listeners.push(
          map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (!event.latLng) return;

            selectLocation(
              event.latLng.lat(),
              event.latLng.lng()
            );
          })
        );

        // Drag the pin to refine the building location.
        listeners.push(
          marker.addListener('dragend', () => {
            const position = marker.position;

            if (!position) return;

            const newLat =
              typeof position.lat === 'function'
                ? position.lat()
                : position.lat;

            const newLng =
              typeof position.lng === 'function'
                ? position.lng()
                : position.lng;

            if (
              typeof newLat === 'number' &&
              typeof newLng === 'number'
            ) {
              selectLocation(newLat, newLng);
            }
          })
        );

        if (cancelled) {
          listeners.forEach((listener) => listener.remove());
          marker.map = null;
          return;
        }


        mapInstanceRef.current = map;

        map.setOptions({
          colorScheme:
            document.documentElement.classList.contains('dark')
              ? google.maps.ColorScheme.DARK
              : google.maps.ColorScheme.LIGHT,
        });

        markerRef.current = marker;
        listenersRef.current = listeners;

        setMapReady(true);
        setMapError(null);
      } catch (error) {
        if (!cancelled) {
          console.error('Google Maps initialization failed:', error);
          setMapError('Unable to load Google Maps. Please try again.');
        }
      }
    };

    void initializeMap();

    return () => {
      cancelled = true;

      listeners.forEach((listener) => listener.remove());

      if (createdMarker) {
        createdMarker.map = null;
      }

      if (mapInstanceRef.current === createdMap) {
        mapInstanceRef.current = null;
      }

      if (markerRef.current === createdMarker) {
        markerRef.current = null;
      }

      listenersRef.current = [];
    };
  }, [resolvedTheme]);

  // Automatically navigate the selected Kenyan location hierarchy.
  // County approximately zoom 8
  // Sub-County approximately zoom 11
  // Ward approximately zoom 14
  // This does NOT confirm or save building coordinates.
  useEffect(() => {
    if (!mapReady || !county || !mapInstanceRef.current) return;

    let cancelled = false;
    const abortController = new AbortController();

    const targetLabel = ward || subCounty || county;
    // Clear the previous building pin when the selected area changes.
    if (markerRef.current) {
      markerRef.current.map = null;
    }

    setHasSelected(false);

    setActiveAreaLabel(targetLabel);
    setIsLocating(true);

    geocodeKenyanHierarchy(
      county,
      subCounty,
      ward,
      abortController.signal
    )
      .then((geocoded: GeocodedLocation) => {
        if (cancelled) return;

        setIsLocating(false);

        if (!mapInstanceRef.current) return;

        // Navigate only. Do not change the confirmed building pin.
        mapInstanceRef.current.panTo({
          lat: geocoded.lat,
          lng: geocoded.lng
        });

        mapInstanceRef.current.setZoom(geocoded.zoom);
      })
      .catch((error) => {
        if (cancelled) return;

        setIsLocating(false);

        if (error?.name !== 'AbortError') {
          console.warn('Could not centre selected area:', error);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [mapReady, county, subCounty, ward]);

  // Find and select the lister's physical GPS location.
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Your browser does not support location services.');
      return;
    }

    setIsLocating(true);
    setActiveAreaLabel('your current location');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);

        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        const map = mapInstanceRef.current;
        const marker = markerRef.current;

        if (!map || !marker) return;

        map.panTo({
          lat: currentLat,
          lng: currentLng
        });

        map.setZoom(17);

        marker.position = {
          lat: currentLat,
          lng: currentLng
        };

        marker.map = map;

        notifyRef.current(currentLat, currentLng);
      },
      () => {
        setIsLocating(false);

        alert(
          'Rentike could not get your location. Please allow location access or place the pin manually.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const displayLocationSummary =
    selectedEstateName ||
    estate ||
    ward ||
    subCounty ||
    county ||
    'Property Location';

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-sm font-bold text-[#242424] dark:text-[#F5F1E8] block">
            Set Exact Building Location on Map
          </label>

          <p className="text-xs text-[#766B60] dark:text-[#A3A3A3] mt-1">
            Select your area, then tap the map or drag the pin to mark your building.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={!mapReady || isLocating}

          className="
  flex items-center justify-center gap-2
  px-4 py-2.5
  bg-[#F7F3EC] dark:bg-[#24201C]
  hover:bg-[#F0E5D8] dark:hover:bg-[#34291F]
  text-[#946B46] dark:text-[#E8BE92]
  border border-[#E2D3C2] dark:border-[#40362E]
  rounded-xl text-xs font-semibold
  shadow-[3px_3px_8px_rgba(104,73,43,0.12),-3px_-3px_8px_rgba(255,255,255,0.85)]
  dark:shadow-[3px_3px_8px_rgba(0,0,0,0.45),-2px_-2px_6px_rgba(255,255,255,0.03)]
  active:shadow-[inset_2px_2px_5px_rgba(104,73,43,0.18)]
  transition-all duration-200
  cursor-pointer
  disabled:opacity-50 disabled:cursor-not-allowed
  self-start sm:self-auto
"

        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Use My Current Location</span>
        </button>
      </div>

      {/* Interactive Google Map */}
      <div className="
        relative w-full h-72 sm:h-80
        rounded-2xl overflow-hidden
        border border-[#E2D3C2] dark:border-[#40362E]
        shadow-[inset_2px_2px_5px_rgba(104,73,43,0.08)]
        dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4)]
      ">
        <div
          ref={mapContainerRef}
          className="w-full h-full bg-[#F7F3EC] dark:bg-[#181818]"
        />

        {mapError && (
          <div className="
            absolute inset-0 z-20
            flex items-center justify-center p-5
            bg-[#F7F3EC] dark:bg-[#181818]
            text-center text-xs font-medium
            text-[#946B46] dark:text-[#E8BE92]
          ">
            {mapError}
          </div>
        )}

        {isLocating && (
          <div className="
            absolute top-3 right-3 z-10
            bg-[#F7F3EC]/95 dark:bg-[#181818]/95
            text-[#242424] dark:text-[#F5F1E8]
            text-xs font-semibold px-3 py-2 rounded-xl
            shadow-md border border-[#E2D3C2] dark:border-[#40362E]
            flex items-center gap-2 backdrop-blur-md
          ">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#946B46]" />
            <span>
              Centering on {activeAreaLabel || 'selected area'}...
            </span>
          </div>
        )}


        {hasSelected && (
          <div
            className="
      absolute bottom-3 left-3 right-3 sm:right-auto z-10
      bg-[#181818]/95 text-white
      text-xs font-semibold px-3.5 py-2 rounded-xl
      shadow-lg flex items-center gap-2
      pointer-events-none
    "
          >
            <CheckCircle2
              className="w-4 h-4 text-[#C49A6C] shrink-0"
            />

            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">
                Building Location Pinned
              </span>

              <span className="text-[10px] font-normal text-[#CFC5B9]">
                Drag the marker to refine its position
              </span>
            </div>
          </div>
        )}


        {!hasSelected && mapReady && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center pointer-events-none px-3">
            <div
              className="
        flex items-center gap-2
        w-fit max-w-full
        px-3.5 py-2
        bg-[#181818]/95
        text-white
        rounded-full
        border border-[#C49A6C]/30
        shadow-[0_3px_10px_rgba(0,0,0,0.16)]
        backdrop-blur-sm
      "
            >
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C49A6C]" />
              <span className="text-[11px] font-medium whitespace-nowrap">
                Tap map to place pin
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
