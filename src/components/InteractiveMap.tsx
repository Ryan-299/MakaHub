import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
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
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
setOptions({
  key: GOOGLE_MAPS_API_KEY,
  v: 'weekly',
});

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
  const { filters, seekerLocation, setSeekerLocation, mapTarget, setSelectedPropertyId, resolvedTheme } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const googleMapInstanceRef = useRef<google.maps.Map | null>(null);
  const googleMarkersRef = useRef<Record<string, google.maps.marker.AdvancedMarkerElement>>({});

  const googleUserMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const savedGoogleViewRef = useRef<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  const restoringGoogleThemeRef = useRef(false);


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

  const [googleMapReady, setGoogleMapReady] = useState(false);
  const [googleMapGeneration, setGoogleMapGeneration] = useState(0);

  const [travelInfo, setTravelInfo] = useState<{
    drivingMinutes: number | null;
    walkingMinutes: number | null;
    distanceKm: number | null;
    walkingWarning: string | null;
  } | null>(null);

  const [travelInfoLoading, setTravelInfoLoading] = useState(false);

  // Authoritative current active property derived reactively
  const activeProperty = useMemo(() => {
    const currentId = selectedPropertyId || activePropertyId;
    if (!currentId) return null;
    const found = properties.find((p) => p.id === currentId);
    if (!found) return null;
    if (properties.length > 1 && found.vacancies <= 0) return null;
    return found;
  }, [properties, selectedPropertyId, activePropertyId]);

  useEffect(() => {
    let cancelled = false;

    const calculateTravelInfo = async () => {
      if (!googleMapReady || !seekerLocation || !activeProperty) {
        setTravelInfo(null);
        setTravelInfoLoading(false);
        return;
      }

      const destination = resolvePropertyCoordinates(activeProperty.location);

      if (
        typeof destination.lat !== 'number' ||
        typeof destination.lng !== 'number' ||
        isNaN(destination.lat) ||
        isNaN(destination.lng)
      ) {
        setTravelInfo(null);
        setTravelInfoLoading(false);
        return;
      }

      setTravelInfoLoading(true);
      setTravelInfo(null);

      try {
        const { Route } =
          await importLibrary('routes') as google.maps.RoutesLibrary;

        const origin = {
          lat: seekerLocation.lat,
          lng: seekerLocation.lng,
        };

        const destinationPoint = {
          lat: destination.lat,
          lng: destination.lng,
        };

        const [drivingResult, walkingResult] = await Promise.all([
          Route.computeRoutes({
            origin,
            destination: destinationPoint,
            travelMode: 'DRIVING',
            fields: ['distanceMeters', 'durationMillis'],
          }),

          Route.computeRoutes({
            origin,
            destination: destinationPoint,
            travelMode: 'WALKING',
            fields: ['distanceMeters', 'durationMillis', 'warnings'],
          }),
        ]);

        if (cancelled) return;

        const drivingRoute = drivingResult.routes?.[0];
        const walkingRoute = walkingResult.routes?.[0];

        const distanceMeters =
          drivingRoute?.distanceMeters ??
          walkingRoute?.distanceMeters ??
          null;

        setTravelInfo({
          drivingMinutes:
            drivingRoute?.durationMillis != null
              ? Math.max(1, Math.ceil(drivingRoute.durationMillis / 60000))
              : null,

          walkingMinutes:
            walkingRoute?.durationMillis != null
              ? Math.max(1, Math.ceil(walkingRoute.durationMillis / 60000))
              : null,

          distanceKm:
            distanceMeters != null
              ? Math.round((distanceMeters / 1000) * 10) / 10
              : null,

          walkingWarning:
            walkingRoute?.warnings?.[0] ?? null,
        });
      } catch (error) {
        if (!cancelled) {
          console.warn('Unable to calculate travel time:', error);
          setTravelInfo(null);
        }
      } finally {
        if (!cancelled) {
          setTravelInfoLoading(false);
        }
      }
    };

    void calculateTravelInfo();

    return () => {
      cancelled = true;
    };
  }, [googleMapReady, seekerLocation, activeProperty]);

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


  // 1. Initialize Google Map Instance and synchronize its theme
  useEffect(() => {
    let cancelled = false;
    let createdMap: google.maps.Map | null = null;

    const initializeGoogleMap = async () => {
      if (!mapContainerRef.current) return;

      const { Map } =
        await importLibrary('maps') as google.maps.MapsLibrary;

      if (cancelled || !mapContainerRef.current) return;

      const [defaultLat, defaultLng] = getInitialCenter();

      const savedView = savedGoogleViewRef.current;

      const lat = savedView?.lat ?? defaultLat;
      const lng = savedView?.lng ?? defaultLng;
      const initialZoom =
        savedView?.zoom ?? mapTarget?.zoom ?? zoom;

      const map = new Map(mapContainerRef.current, {
        center: { lat, lng },
        zoom: initialZoom,
        minZoom: 5,
        maxZoom: 19,
        mapId: GOOGLE_MAPS_MAP_ID,
        colorScheme:
          resolvedTheme === 'dark'
            ? google.maps.ColorScheme.DARK
            : google.maps.ColorScheme.LIGHT,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        rotateControl: false,
        tilt: 0,
        gestureHandling: 'greedy',
        keyboardShortcuts: true,
      });

      createdMap = map;
      lastProgrammaticCenterRef.current = [lat, lng];

      map.addListener('click', () => {
        setActivePropertyId(null);

        if (onSelectProperty) {
          onSelectProperty(null);
        }

        setSelectedPropertyId(null);
      });

      map.addListener('dragend', () => {
        if (programmaticallyMovingRef.current) return;

        const currentCenter = map.getCenter();
        if (!currentCenter) return;

        if (lastProgrammaticCenterRef.current) {
          const distance = calculateDistanceInKm(
            currentCenter.lat(),
            currentCenter.lng(),
            lastProgrammaticCenterRef.current[0],
            lastProgrammaticCenterRef.current[1]
          );

          if (distance > 1.2) {
            setShowSearchThisArea(true);
          }
        } else {
          setShowSearchThisArea(true);
        }
      });

      map.addListener('idle', () => {
        programmaticallyMovingRef.current = false;
      });


      googleMapInstanceRef.current = map;
      setGoogleMapReady(true);
      setGoogleMapGeneration(prev => prev + 1);

    };

    void initializeGoogleMap();

    return () => {
      cancelled = true;

      if (createdMap) {
        const center = createdMap.getCenter();
        const currentZoom = createdMap.getZoom();

        if (center && currentZoom !== undefined) {
          savedGoogleViewRef.current = {
            lat: center.lat(),
            lng: center.lng(),
            zoom: currentZoom,
          };

          restoringGoogleThemeRef.current = true;
        }


        Object.keys(googleMarkersRef.current).forEach((id) => {
          googleMarkersRef.current[id].map = null;
        });

        googleMarkersRef.current = {};

        if (googleUserMarkerRef.current) {
          googleUserMarkerRef.current.map = null;
          googleUserMarkerRef.current = null;
        }

        google.maps.event.clearInstanceListeners(createdMap);

        if (googleMapInstanceRef.current === createdMap) {
          googleMapInstanceRef.current = null;
        }

        setGoogleMapReady(false);
      }
    };
  }, [resolvedTheme]);

  // 2. Google Map Target Synchronization
  useEffect(() => {
    const map = googleMapInstanceRef.current;

    if (!googleMapReady || !map || !mapTarget) return;

    // Only respond once to each new target
    if (mapTarget.id === lastTargetIdRef.current) return;

    lastTargetIdRef.current = mapTarget.id;
    programmaticallyMovingRef.current = true;
    lastProgrammaticCenterRef.current = [mapTarget.lat, mapTarget.lng];
    setShowSearchThisArea(false);

    // 1. A specific property was selected
    if (mapTarget.propertyId) {
      map.panTo({
        lat: mapTarget.lat,
        lng: mapTarget.lng,
      });

      map.setZoom(16);

      setActivePropertyId(mapTarget.propertyId);

      const prop = properties.find(
        (p) => p.id === mapTarget.propertyId
      );

      if (prop && onSelectProperty) {
        onSelectProperty(prop);
      }

      if (mapTarget.locationName) {
        showToast(`Viewing ${mapTarget.locationName}`);
      }

      return;
    }

    // 2. Geographic filter/search selected
    if (
      mapTarget.reason === 'selection' ||
      mapTarget.reason === 'search'
    ) {
      const validListings =
        properties.length === 1
          ? properties
          : properties.filter((p) => p.vacancies > 0);

      const coordsList: [number, number][] = validListings
        .map((p) => {
          const coords = resolvePropertyCoordinates(p.location);
          return [coords.lat, coords.lng] as [number, number];
        })
        .filter(
          ([lat, lng]) =>
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            !isNaN(lat) &&
            !isNaN(lng)
        );

      // Several matching properties
      if (coordsList.length > 1) {
        const bounds = new google.maps.LatLngBounds();

        coordsList.forEach(([lat, lng]) => {
          bounds.extend({ lat, lng });
        });

        map.fitBounds(bounds, 55);

        google.maps.event.addListenerOnce(map, 'idle', () => {
          const fittedZoom = map.getZoom();

          if (fittedZoom !== undefined && fittedZoom > 16) {
            map.setZoom(16);
          }
        });

        if (mapTarget.locationName) {
          showToast(
            `Showing ${coordsList.length} properties in ${mapTarget.locationName}`
          );
        }
      }

      // One matching property
      else if (coordsList.length === 1) {
        const [singleLat, singleLng] = coordsList[0];

        map.panTo({
          lat: singleLat,
          lng: singleLng,
        });

        map.setZoom(15);

        if (mapTarget.locationName) {
          showToast(
            `Showing 1 property in ${mapTarget.locationName}`
          );
        }
      }

      // No matching properties — still move to selected area
      else {
        map.panTo({
          lat: mapTarget.lat,
          lng: mapTarget.lng,
        });

        map.setZoom(mapTarget.zoom || 12);

        showToast('No Rentike listings in this area yet.');
      }

      return;
    }

    // 3. General recenter/manual coordinate navigation
    map.panTo({
      lat: mapTarget.lat,
      lng: mapTarget.lng,
    });

    map.setZoom(mapTarget.zoom || 13);
  }, [
    mapTarget,
    properties,
    onSelectProperty,
    googleMapReady,
  ]);
  // 3. Render Property Pins
  useEffect(() => {
    let cancelled = false;

    const renderGooglePropertyPins = async () => {
      const map = googleMapInstanceRef.current;
      if (!googleMapReady || !map) return;

      const { AdvancedMarkerElement } =
        await importLibrary('marker') as google.maps.MarkerLibrary;

      if (cancelled) return;

      // Remove previous Google property markers
      Object.values(googleMarkersRef.current).forEach((marker) => {
        Object.keys(googleMarkersRef.current).forEach((id) => {
          googleMarkersRef.current[id].map = null;
        });
      });
      googleMarkersRef.current = {};

      // Filter to listings with vacancies > 0
      // (or single property if passed in detail view)
      const validListings =
        properties.length === 1
          ? properties
          : properties.filter((p) => p.vacancies > 0);

      const bounds = new google.maps.LatLngBounds();

      validListings.forEach((prop) => {
        const { lat, lng } = resolvePropertyCoordinates(prop.location);

        if (
          typeof lat !== 'number' ||
          typeof lng !== 'number' ||
          isNaN(lat) ||
          isNaN(lng)
        ) {
          return;
        }

        const isSelected =
          selectedPropertyId === prop.id ||
          activeProperty?.id === prop.id;

        // Rentike teardrop property pin
        const markerContent = document.createElement('div');

        markerContent.style.width = isSelected ? '44px' : '40px';
        markerContent.style.height = isSelected ? '44px' : '40px';
        markerContent.style.transformOrigin = 'bottom center';
        markerContent.style.transition = 'transform 0.2s ease';
        markerContent.style.filter = isSelected
          ? 'drop-shadow(0 7px 14px rgba(139, 107, 67, 0.32))'
          : 'drop-shadow(0 5px 10px rgba(0, 0, 0, 0.22))';

        const pinColor = 'var(--rentike-bronze)';
        const propertyLabel =
          prop.type ||
          prop.propertyType ||
          prop.unitType ||
          prop.listingType ||
          'Property';

        markerContent.innerHTML = `
<div
  title="${prop.name}"
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
      background: ${isSelected ? '#B9835A' : '#F8F5EF'};
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
        stroke="${isSelected ? '#FFFFFF' : '#8B6B43'}"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.5 10V20H18.5V10"
        stroke="${isSelected ? '#FFFFFF' : '#8B6B43'}"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.5 20V14H14.5V20"
        stroke="${isSelected ? '#FFFFFF' : '#8B6B43'}"
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
      background: ${isSelected ? '#B9835A' : '#F8F5EF'};
      border-right: 1px solid rgba(139,107,67,0.18);
      border-bottom: 1px solid rgba(139,107,67,0.18);
      transform: translateX(-50%) rotate(45deg);
      z-index: 1;
    "
  ></div>

  <!-- Property type label -->
  <div
    style="
      position: absolute;
      top: 51px;
      left: 50%;
      transform: translateX(-50%);
      padding: 4px 8px;
      border-radius: 999px;
      white-space: nowrap;
      font-size: 10px;
      line-height: 1;
      font-weight: 700;
      font-family: sans-serif;
      background: ${isSelected ? '#B9835A' : '#F8F5EF'};
      color: ${isSelected ? '#FFFFFF' : '#8B6B43'};
      border: 1px solid rgba(139,107,67,0.18);
      box-shadow: 0 3px 8px rgba(0,0,0,0.13);
      pointer-events: none;
    "
  >
    ${propertyLabel}
  </div>
</div>
`;

        const marker = new AdvancedMarkerElement({
          map,
          position: { lat, lng },
          content: markerContent,
          title: prop.name,
          zIndex: isSelected ? 1000 : 100,
        });

        marker.addListener('click', () => {
          setActivePropertyId(prop.id);

          if (onSelectProperty) {
            onSelectProperty(prop);
          }

          setSelectedPropertyId(prop.id);

          // Smoothly move the Google map toward the selected property
          map.panTo({ lat, lng });
        });

        googleMarkersRef.current[prop.id] = marker;
        bounds.extend({ lat, lng });
      });

      // Initial map framing
      if (
        !initialFitDoneRef.current &&
        !mapTarget &&
        !selectedPropertyId
      ) {
        initialFitDoneRef.current = true;

        if (validListings.length > 1 && !bounds.isEmpty()) {
          map.fitBounds(bounds, 55);

          google.maps.event.addListenerOnce(map, 'idle', () => {
            const fittedZoom = map.getZoom();

            if (fittedZoom !== undefined && fittedZoom > 15) {
              map.setZoom(15);
            }
          });
        } else if (validListings.length === 1) {
          const { lat, lng } = resolvePropertyCoordinates(
            validListings[0].location
          );

          map.setCenter({ lat, lng });
          map.setZoom(15);
        }
      }
    };

    void renderGooglePropertyPins();

    return () => {
      cancelled = true;

      Object.keys(googleMarkersRef.current).forEach((id) => {
        googleMarkersRef.current[id].map = null;
      });

      googleMarkersRef.current = {};
    };
  }, [
    properties,
    selectedPropertyId,
    activeProperty?.id,
    onSelectProperty,

    setSelectedPropertyId,
    googleMapReady,
    googleMapGeneration,
  ]);


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
      async (position) => {
        setIsLocating(false);

        const { latitude, longitude } = position.coords;
        const userPos: [number, number] = [latitude, longitude];

        setUserLocation(userPos);
        setSeekerLocation({
          lat: latitude,
          lng: longitude,
        });

        const map = googleMapInstanceRef.current;

        if (!map) {
          showToast('Map is still loading.');
          return;
        }

        programmaticallyMovingRef.current = true;
        initialFitDoneRef.current = true;
        lastProgrammaticCenterRef.current = userPos;
        setShowSearchThisArea(false);

        map.panTo({
          lat: latitude,
          lng: longitude,
        });

        map.setZoom(13);

        if (googleUserMarkerRef.current) {
          googleUserMarkerRef.current.position = {
            lat: latitude,
            lng: longitude,
          };
        } else {
          const { AdvancedMarkerElement } =
            (await importLibrary('marker')) as google.maps.MarkerLibrary;

          const markerContent = document.createElement('div');

          markerContent.innerHTML = `
  <div
    title="Your Current Location"
    style="
      position: relative;
      width: 24px;
      height: 24px;
      overflow: visible;
    "
  >
    <div
      style="
        position: absolute;
        left: 50%;
        top: 50%;
        width: 48px;
        height: 48px;
        border-radius: 9999px;
        transform: translate(-50%, -50%);
        background: rgba(66, 133, 244, 0.12);
        border: 1px solid rgba(66, 133, 244, 0.28);
      "
    ></div>

    <div
      class="rentike-location-pulse"
      style="
        position: absolute;
        left: 50%;
        top: 50%;
        width: 48px;
        height: 48px;
        border-radius: 9999px;
        transform: translate(-50%, -50%) scale(0.8);
        background: rgba(66, 133, 244, 0.28);
        opacity: 0.55;
        pointer-events: none;
      "
    ></div>

    <div
      style="
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        box-sizing: border-box;
        background: #4285F4;
        border: 4px solid white;
        box-shadow:
          0 0 0 3px rgba(66, 133, 244, 0.22),
          0 3px 10px rgba(0, 0, 0, 0.28);
      "
    ></div>
  </div>
`;

          const pulseRing =
            markerContent.querySelector<HTMLElement>('.rentike-location-pulse');

          pulseRing?.animate(
            [
              {
                transform: 'translate(-50%, -50%) scale(0.8)',
                opacity: 0.55,
              },
              {
                transform: 'translate(-50%, -50%) scale(1.55)',
                opacity: 0,
              },
            ],
            {
              duration: 1800,
              iterations: Infinity,
              easing: 'ease-out',
            }
          );
          googleUserMarkerRef.current = new AdvancedMarkerElement({
            map,
            position: {
              lat: latitude,
              lng: longitude,
            },
            content: markerContent,
            title: 'Your Current Location',
            zIndex: 2000,
          });
        }

        showToast('Centered on your current location.');
      },

      () => {
        setIsLocating(false);

        showToast(
          'Location access was not enabled. You can browse listings on the map freely.'
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    if (!googleMapReady) return;

    const map = googleMapInstanceRef.current;
    if (!map) return;

    // Keep the current map position when switching themes.
    if (restoringGoogleThemeRef.current) {
      restoringGoogleThemeRef.current = false;

      // Restore the blue current-location marker.
      if (seekerLocation) {
        void importLibrary('marker').then(({ AdvancedMarkerElement }) => {
          if (googleMapInstanceRef.current !== map) return;

          if (googleUserMarkerRef.current) {
            googleUserMarkerRef.current.map = null;
          }

          const dot = document.createElement('div');

          dot.style.cssText = `
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: #4285F4;
          border: 4px solid white;
          box-shadow:
            0 0 0 6px rgba(66,133,244,0.18),
            0 2px 8px rgba(0,0,0,0.28);
        `;

          googleUserMarkerRef.current = new AdvancedMarkerElement({
            map,
            position: {
              lat: seekerLocation.lat,
              lng: seekerLocation.lng,
            },
            content: dot,
            title: 'Your Current Location',
            zIndex: 2000,
          });
        });
      }

      return;
    }

    let cancelled = false;


    const applyKnownLocation = async () => {
      if (mapTarget) return;

      if (seekerLocation) {
        programmaticallyMovingRef.current = true;
        initialFitDoneRef.current = true;
        lastProgrammaticCenterRef.current = [
          seekerLocation.lat,
          seekerLocation.lng,
        ];
        setShowSearchThisArea(false);

        map.panTo({
          lat: seekerLocation.lat,
          lng: seekerLocation.lng,
        });

        map.setZoom(13);

        if (googleUserMarkerRef.current) {
          googleUserMarkerRef.current.position = {
            lat: seekerLocation.lat,
            lng: seekerLocation.lng,
          };
        } else {
          const { AdvancedMarkerElement } =
            (await importLibrary('marker')) as google.maps.MarkerLibrary;

          if (cancelled) return;

          const markerContent = document.createElement('div');

          markerContent.innerHTML = `
          <div
            title="Your Current Location"
            style="
              width: 22px;
              height: 22px;
              border-radius: 9999px;
              background: #4285F4;
              border: 4px solid white;
              box-shadow:
                0 0 0 6px rgba(66, 133, 244, 0.18),
                0 2px 8px rgba(0,0,0,0.28);
            "
          ></div>
        `;

          googleUserMarkerRef.current = new AdvancedMarkerElement({
            map,
            position: {
              lat: seekerLocation.lat,
              lng: seekerLocation.lng,
            },
            content: markerContent,
            title: 'Your Current Location',
            zIndex: 2000,
          });
        }

        return;
      }

      if (!navigator.geolocation || !navigator.permissions) return;

      try {
        const permission = await navigator.permissions.query({
          name: 'geolocation',
        });

        if (!cancelled && permission.state === 'granted') {
          handleUseMyLocation();
        }
      } catch {
        // Keep the normal map view.
      }
    };

    void applyKnownLocation();

    return () => {
      cancelled = true;
    };
  }, [googleMapReady, seekerLocation, mapTarget]);
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



      {/* Floating Status Notification Toast */}
      {locationToast && !showSearchThisArea && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-neutral-950/90 dark:bg-[#111111]/95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 border border-transparent dark:border-[#303030] animate-in fade-in duration-200 pointer-events-none">
          <span>{locationToast}</span>
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
          className={`w-10 h-10 rounded-xl shadow-md border flex items-center justify-center transition-transform active:scale-95 ${isLocating || seekerLocation ? 'bg-blue-600 text-white border-blue-700' : 'bg-white dark:bg-[#111111] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] text-neutral-900 dark:text-[#F5F5F5]'}`}
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
            travelInfo={travelInfo}
            travelInfoLoading={travelInfoLoading}
          />
        </div>
      )}
    </div>
  );
};
