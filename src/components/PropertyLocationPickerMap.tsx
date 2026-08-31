import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, CheckCircle2, Crosshair, Loader2 } from 'lucide-react';
import { geocodeKenyanHierarchy, GeocodedLocation } from '../utils/kenyaGeocoding';

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
}

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
  selectedEstateName
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [hasSelected, setHasSelected] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [activeAreaLabel, setActiveAreaLabel] = useState<string>('');
  const lastGeocodedKeyRef = useRef<string>('');

  const effectiveLat = initialLat ?? lat ?? -1.2223;
  const effectiveLng = initialLng ?? lng ?? 36.9015;

  const notifyLocationChange = (newLat: number, newLng: number) => {
    if (typeof onLocationSelect === 'function') {
      onLocationSelect({ lat: newLat, lng: newLng });
    }
    if (typeof onChange === 'function') {
      onChange(newLat, newLng);
    }
    setHasSelected(true);
  };

  // Initialize interactive pin dropper map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [effectiveLat, effectiveLng],
        zoom: 14,
        maxZoom: 19,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Custom black pin icon matching MakaoHub styling
      const pinIcon = L.divIcon({
        className: 'custom-pin-icon',
        html: `
          <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-2xl border-2 border-white transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const marker = L.marker([effectiveLat, effectiveLng], {
        draggable: true,
        icon: pinIcon
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        notifyLocationChange(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        notifyLocationChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      // Keep map instance during typical lifecycle or cleanup on unmount
    };
  }, []);

  // Automatically follow the selected Kenyan location hierarchy:
  // County -> zoom ~8
  // Sub-County -> zoom ~11
  // Ward -> zoom ~14
  useEffect(() => {
    if (!county) return;

    const currentKey = `${county}::${subCounty || ''}::${ward || ''}`;
    if (currentKey === lastGeocodedKeyRef.current) return;
    lastGeocodedKeyRef.current = currentKey;

    let isMounted = true;
    const abortController = new AbortController();

    const targetLabel = ward || subCounty || county;
    setActiveAreaLabel(targetLabel);
    setIsLocating(true);

    geocodeKenyanHierarchy(county, subCounty, ward, abortController.signal)
      .then((geocoded: GeocodedLocation) => {
        if (!isMounted) return;
        setIsLocating(false);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([geocoded.lat, geocoded.lng], geocoded.zoom, {
            duration: 1.2,
            easeLinearity: 0.25
          });

          markerRef.current.setLatLng([geocoded.lat, geocoded.lng]);
          notifyLocationChange(geocoded.lat, geocoded.lng);
        }
      })
      .catch(() => {
        if (isMounted) setIsLocating(false);
      });

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [county, subCounty, ward]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Your browser does not support location services.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([currentLat, currentLng], 17, {
            duration: 1.2
          });

          markerRef.current.setLatLng([currentLat, currentLng]);
        }

        notifyLocationChange(currentLat, currentLng);
      },
      () => {
        setIsLocating(false);
        alert(
          'MakaoHub could not get your location. Please allow location access or move the pin manually.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const displayLocationSummary = selectedEstateName || ward || subCounty || county || 'Property Location';

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-sm font-bold text-neutral-900 block">
            Set Exact Building Location on Map
          </label>
          <p className="text-xs text-neutral-500">
            Map automatically centers on your selected area. Click anywhere or drag the black pin to position the exact building.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer self-start sm:self-auto border border-neutral-200"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Use My Current Location</span>
        </button>
      </div>

      {/* Map Element */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-neutral-300 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-neutral-100" />

        {/* Loading overlay indicator while centering/geocoding */}
        {isLocating && (
          <div className="absolute top-3 right-3 z-10 bg-white/90 text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-md border border-neutral-200 flex items-center gap-2 backdrop-blur-md animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
            <span>Centering map on {activeAreaLabel || 'selected area'}...</span>
          </div>
        )}

        {/* Selected confirmation badge (strictly NO raw lat/long exposed) */}
        {hasSelected && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-black/90 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold">Pin position:</span>{' '}
              <span className="text-neutral-200">{displayLocationSummary}</span>
              <span className="text-[10px] text-neutral-400 ml-2 hidden sm:inline">(Drag pin to refine)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
