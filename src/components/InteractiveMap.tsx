import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { PropertyListing } from '../types';
import { PropertyPreviewCard } from './PropertyPreviewCard';
import { Crosshair, ZoomIn, ZoomOut, RotateCcw, Loader2, Search } from 'lucide-react';
import {
  resolvePropertyCoordinates,
  calculateDistanceInKm,
  KENYA_COUNTY_COORDS,
  KENYA_SUBCOUNTY_COORDS,
  KENYA_WARD_COORDS
} from '../utils/kenyaGeocoding';
import { useApp } from '../context/AppContext';

interface InteractiveMapProps {
  properties: PropertyListing[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: PropertyListing | null) => void;
  className?: string;
  center?: [number, number];
  zoom?: number;
  showViewButton?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties,
  selectedPropertyId,
  onSelectProperty,
  className = 'h-[500px] w-full',
  center,
  zoom = 13,
  showViewButton = true
}) => {
  const { filters, setSeekerLocation, mapTarget, setSelectedPropertyId } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Refs to track last navigated target ID and previous center to avoid snapping back
  const lastTargetIdRef = useRef<string | null>(null);
  const initialFitDoneRef = useRef<boolean>(false);
  const programmaticallyMovingRef = useRef<boolean>(false);
  const lastProgrammaticCenterRef = useRef<[number, number] | null>(null);

  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState<boolean>(false);

  // Authoritative current active property derived reactively
  const activeProperty = useMemo(() => {
    const currentId = selectedPropertyId || activePropertyId;
    if (!currentId) return null;
    const found = properties.find((p) => p.id === currentId);
    if (!found) return null;
    if (properties.length > 1 && found.vacancies <= 0) return null;
    return found;
  }, [properties, selectedPropertyId, activePropertyId]);

  // Helper to show temporary toast messages on map
  const showToast = (msg: string) => {
    setLocationToast(msg);
    setTimeout(() => {
      setLocationToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Determine initial center
  const getInitialCenter = (): [number, number] => {
    if (center) return center;
    if (mapTarget) {
      return [mapTarget.lat, mapTarget.lng];
    }
    if (properties.length > 0) {
      const coords = resolvePropertyCoordinates(properties[0].location);
      if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
        return [coords.lat, coords.lng];
      }
    }
    // Nairobi / Kenya default
    return [-1.286389, 36.817223];
  };

  // Prevent overlay interactions from bubbling to Leaflet map
  useEffect(() => {
    if (overlayRef.current) {
      L.DomEvent.disableClickPropagation(overlayRef.current);
      L.DomEvent.disableScrollPropagation(overlayRef.current);
    }
  }, [activeProperty]);

  // 1. Initialize Map Instance (with OpenStreetMap tiles & event listeners)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialPos = getInitialCenter();
      const initialZoom = mapTarget?.zoom || zoom;
      
      const map = L.map(mapContainerRef.current, {
        center: initialPos,
        zoom: initialZoom,
        minZoom: 5,
        maxZoom: 19,
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        dragging: true,
        touchZoom: true,
        keyboard: true
      });

      lastProgrammaticCenterRef.current = initialPos;

      // Standard OSM tiles layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 5
      }).addTo(map);

      // Dismiss preview card when clicking empty map canvas
      map.on('click', () => {
        setActivePropertyId(null);
        if (onSelectProperty) onSelectProperty(null);
        setSelectedPropertyId(null);
      });

      // Detect manual user drag / zoom to offer "Search this area"
      map.on('dragend', () => {
        if (programmaticallyMovingRef.current) return;
        const currentCenter = map.getCenter();
        if (lastProgrammaticCenterRef.current) {
          const dist = calculateDistanceInKm(
            currentCenter.lat,
            currentCenter.lng,
            lastProgrammaticCenterRef.current[0],
            lastProgrammaticCenterRef.current[1]
          );
          if (dist > 1.2) {
            setShowSearchThisArea(true);
          }
        } else {
          setShowSearchThisArea(true);
        }
      });

      map.on('zoomend', () => {
        if (programmaticallyMovingRef.current) return;
      });

      map.on('moveend', () => {
        // Clear programmatic moving lock after flight ends
        programmaticallyMovingRef.current = false;
      });

      mapInstanceRef.current = map;

      // Invalidate size to ensure accurate rendering in dynamic containers
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }

    return () => {
      // Cleanup is handled gracefully
    };
  }, []);

  // 2. Map Target Synchronization (Triggered whenever location search or property selection occurs)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapTarget) return;

    // Check if this is a new map target trigger
    if (mapTarget.id !== lastTargetIdRef.current) {
      lastTargetIdRef.current = mapTarget.id;
      programmaticallyMovingRef.current = true;
      lastProgrammaticCenterRef.current = [mapTarget.lat, mapTarget.lng];
      setShowSearchThisArea(false);

      // 1. If a specific property was targeted:
      if (mapTarget.propertyId) {
        map.flyTo([mapTarget.lat, mapTarget.lng], 16, {
          animate: true,
          duration: 1.0
        });
        setActivePropertyId(mapTarget.propertyId);
        const prop = properties.find((p) => p.id === mapTarget.propertyId);
        if (prop && onSelectProperty) {
          onSelectProperty(prop);
        }
        if (mapTarget.locationName) {
          showToast(`Viewing ${mapTarget.locationName}`);
        }
      }
      // 2. If a geographic location was selected (County, Sub-County, Ward, Estate):
      else if (mapTarget.reason === 'selection' || mapTarget.reason === 'search') {
        const validListings = properties.length === 1
          ? properties
          : properties.filter((p) => p.vacancies > 0);

        const coordsList: [number, number][] = validListings
          .map((p) => {
            const coords = resolvePropertyCoordinates(p.location);
            return [coords.lat, coords.lng] as [number, number];
          })
          .filter(([lat, lng]) => typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng));

        if (coordsList.length > 1) {
          // If several matching properties exist, use Leaflet fitBounds() so all matching property markers are visible
          const bounds = L.latLngBounds(coordsList);
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [55, 55],
              maxZoom: 16,
              animate: true,
              duration: 1.0
            });
            if (mapTarget.locationName) {
              showToast(`Showing ${coordsList.length} properties in ${mapTarget.locationName}`);
            }
          }
        } else if (coordsList.length === 1) {
          // If only one matching property exists, center on that property and zoom appropriately
          const [singleLat, singleLng] = coordsList[0];
          map.flyTo([singleLat, singleLng], 15, {
            animate: true,
            duration: 1.0
          });
          if (mapTarget.locationName) {
            showToast(`Showing 1 property in ${mapTarget.locationName}`);
          }
        } else {
          // 0 matching properties: move map to selected geographic location
          map.flyTo([mapTarget.lat, mapTarget.lng], mapTarget.zoom || 12, {
            animate: true,
            duration: 1.0
          });
          showToast('No MakaoHub listings found in this area yet.');
        }
      } else {
        // General recenter or manual coordinate navigation
        map.flyTo([mapTarget.lat, mapTarget.lng], mapTarget.zoom, {
          animate: true,
          duration: 1.0
        });
      }
    }
  }, [mapTarget, properties, onSelectProperty]);

  // 3. Render Property Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous property markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => {
      if (marker && typeof marker.remove === 'function') {
        marker.remove();
      }
    });
    markersRef.current = {};

    // Filter to listings with vacancies > 0 (or single property if passed in detail view)
    const validListings = properties.length === 1
      ? properties
      : properties.filter((p) => p.vacancies > 0);

    const bounds = L.latLngBounds([]);

    validListings.forEach((prop) => {
      const { lat, lng } = resolvePropertyCoordinates(prop.location);
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        return;
      }

      const isSelected = selectedPropertyId === prop.id || activeProperty?.id === prop.id;

      // MakaoHub House Pin HTML
      const pinHtml = `
        <div id="property-pin-${prop.id}" class="makaohub-property-pin ${isSelected ? 'active' : ''}" title="${prop.name} (KSh ${prop.monthlyRent.toLocaleString()})">
          <div class="pin-head">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <div class="pin-tip"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'makaohub-property-pin-wrapper',
        html: pinHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -42]
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : 100
      }).addTo(map);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setActivePropertyId(prop.id);
        if (onSelectProperty) onSelectProperty(prop);
        setSelectedPropertyId(prop.id);
        
        // Pan smoothly to make sure pin and preview are comfortably visible
        map.panTo([lat, lng], { animate: true, duration: 0.5 });
      });

      markersRef.current[prop.id] = marker;
      bounds.extend([lat, lng]);
    });

    // 4. Initial Mount Bounds (Only done once if no mapTarget is set)
    if (!initialFitDoneRef.current && !mapTarget && !selectedPropertyId) {
      initialFitDoneRef.current = true;
      if (validListings.length > 1 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 15, animate: false });
      } else if (validListings.length === 1) {
        const { lat, lng } = resolvePropertyCoordinates(validListings[0].location);
        map.setView([lat, lng], 15, { animate: false });
      }
    }
  }, [properties, selectedPropertyId, activeProperty?.id, onSelectProperty, setSelectedPropertyId]);

  // 5. Center on externally selected property if changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPropertyId) return;
    const selected = properties.find((p) => p.id === selectedPropertyId);
    if (selected) {
      const { lat, lng } = resolvePropertyCoordinates(selected.location);
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      setActivePropertyId(selected.id);
    }
  }, [selectedPropertyId, properties]);

  // 6. User GPS Geolocation Flow
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const userPos: [number, number] = [latitude, longitude];
        setUserLocation(userPos);
        setSeekerLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        if (!map) return;

        programmaticallyMovingRef.current = true;
        lastProgrammaticCenterRef.current = userPos;
        setShowSearchThisArea(false);

        // Center on user position with neighbourhood-level zoom
        map.flyTo(userPos, 15, { animate: true, duration: 1.0 });

        // Update or create user location marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng(userPos);
        } else {
          const userIcon = L.divIcon({
            className: 'user-live-location-wrapper',
            html: `
              <div class="user-live-location-pin" title="Your Current Location">
                <div class="pulse"></div>
                <div class="dot"></div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          const uMarker = L.marker(userPos, { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
          userMarkerRef.current = uMarker;
        }

        showToast('Centered on your current location.');
      },
      (error) => {
        setIsLocating(false);
        showToast('Location access was not enabled. You can browse listings on the map freely.');
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000
      }
    );
  };

  // Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Reset / Recenter bounds on available properties or region
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const validListings = properties.length === 1
      ? properties
      : properties.filter((p) => p.vacancies > 0);

    setShowSearchThisArea(false);

    if (validListings.length > 0) {
      const validPoints = validListings.map((p) => {
        const { lat, lng } = resolvePropertyCoordinates(p.location);
        return [lat, lng] as [number, number];
      });
      const bounds = L.latLngBounds(validPoints);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16, animate: true });
        showToast('Fitted view to available listings.');
      }
    } else {
      // Center on current filter location or default Kenya
      handleFilterRegionCentering(map);
      showToast('Centered on region.');
    }
  };

  // Helper to center on filtered geographic location when no properties match
  const handleFilterRegionCentering = (map: L.Map) => {
    const cleanCounty = filters?.county?.toLowerCase().trim() || '';
    const cleanSub = filters?.subCounty?.toLowerCase().trim() || '';
    const cleanWard = filters?.ward?.toLowerCase().trim() || '';

    if (cleanWard && cleanSub && cleanCounty) {
      const wardKey = `${cleanCounty}:${cleanSub}:${cleanWard}`;
      if (KENYA_WARD_COORDS[wardKey]) {
        map.flyTo([KENYA_WARD_COORDS[wardKey].lat, KENYA_WARD_COORDS[wardKey].lng], 14, { animate: true });
        return;
      }
    }

    if (cleanSub && cleanCounty) {
      const subKey = `${cleanCounty}:${cleanSub}`;
      if (KENYA_SUBCOUNTY_COORDS[subKey]) {
        map.flyTo([KENYA_SUBCOUNTY_COORDS[subKey].lat, KENYA_SUBCOUNTY_COORDS[subKey].lng], 12, { animate: true });
        return;
      }
    }

    if (cleanCounty && KENYA_COUNTY_COORDS[cleanCounty]) {
      map.flyTo([KENYA_COUNTY_COORDS[cleanCounty].lat, KENYA_COUNTY_COORDS[cleanCounty].lng], 9, { animate: true });
      return;
    }

    map.flyTo([-1.286389, 36.817223], 7, { animate: true });
  };

  // "Search this area" handler
  const handleSearchThisArea = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    const visibleCount = properties.filter((p) => {
      if (p.vacancies <= 0) return false;
      const { lat, lng } = resolvePropertyCoordinates(p.location);
      return bounds.contains([lat, lng]);
    }).length;

    setShowSearchThisArea(false);
    lastProgrammaticCenterRef.current = [map.getCenter().lat, map.getCenter().lng];

    if (visibleCount > 0) {
      showToast(`Showing ${visibleCount} available ${visibleCount === 1 ? 'property' : 'properties'} in this area.`);
    } else {
      showToast('No available listings currently in this map view.');
    }
  };

  return (
    <div
      id="makaohub-live-map-container"
      className={`relative rounded-2xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800 shadow-xs ${className}`}
    >
      {/* Leaflet map DOM element */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-neutral-100 dark:bg-neutral-900" />

      {/* Floating "Search this area" Button (Requirement 4) */}
      {showSearchThisArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            id="map-search-this-area-btn"
            onClick={handleSearchThisArea}
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold rounded-full shadow-xl border border-neutral-800 dark:border-neutral-200 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search this area</span>
          </button>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {locationToast && !showSearchThisArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-neutral-950/90 dark:bg-[#111111]/95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 border border-transparent dark:border-[#303030] animate-in fade-in duration-200 pointer-events-none">
          <span>{locationToast}</span>
        </div>
      )}

      {/* No listings banner inside map container if area has 0 listings */}
      {properties.length === 0 && !locationToast && !showSearchThisArea && (
        <div
          id="no-listings-map-banner"
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-neutral-900/95 dark:bg-black/95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl border border-neutral-700/60 dark:border-neutral-800 flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-2 pointer-events-none"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>No MakaoHub listings found in this area yet.</span>
        </div>
      )}

      {/* Map Control Actions Toolbar (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 font-sans">
        {/* Zoom In */}
        <button
          type="button"
          id="map-zoom-in-btn"
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white dark:bg-[#111111] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] text-neutral-900 dark:text-[#F5F5F5] rounded-xl shadow-md border border-neutral-200 dark:border-[#303030] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          aria-label="Zoom In"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          id="map-zoom-out-btn"
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white dark:bg-[#111111] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] text-neutral-900 dark:text-[#F5F5F5] rounded-xl shadow-md border border-neutral-200 dark:border-[#303030] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          aria-label="Zoom Out"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset / Recenter Bounds */}
        <button
          type="button"
          id="map-recenter-btn"
          onClick={handleRecenter}
          className="w-10 h-10 bg-white dark:bg-[#111111] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] text-neutral-900 dark:text-[#F5F5F5] rounded-xl shadow-md border border-neutral-200 dark:border-[#303030] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          aria-label="Reset View"
          title="Center on available listings"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Explicit 'Use My Location' Button (Requirement 5 & 11) */}
        <button
          type="button"
          id="map-locate-me-btn"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className={`w-10 h-10 rounded-xl shadow-md border flex items-center justify-center transition-transform active:scale-95 cursor-pointer ${
            userLocation
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white dark:bg-[#111111] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] text-neutral-900 dark:text-[#F5F5F5] border-neutral-200 dark:border-[#303030]'
          }`}
          aria-label="Use My Location"
          title="Use My Location (GPS)"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 animate-spin text-neutral-600 dark:text-neutral-300" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Selected Property Preview Overlay (Bottom Left on Desktop, Center/Bottom on Mobile) */}
      {activeProperty && (
        <div
          ref={overlayRef}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 left-4 right-4 sm:right-auto z-[1000] flex justify-center sm:justify-start animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <PropertyPreviewCard
            property={activeProperty}
            onClose={() => {
              setActivePropertyId(null);
              if (onSelectProperty) onSelectProperty(null);
              setSelectedPropertyId(null);
            }}
            showViewButton={showViewButton}
          />
        </div>
      )}
    </div>
  );
};
