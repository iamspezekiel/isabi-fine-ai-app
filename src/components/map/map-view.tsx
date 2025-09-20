
'use client';

import { APIProvider, Map, MapCameraChangedEvent, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Facility, Coordinates } from '@/lib/types';
import { FacilityMarker } from './facility-marker';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Directions } from './directions';
import type { MapViewMode } from '@/app/page';
import { useMapsLibrary } from '@vis.gl/react-google-maps';


interface MapViewProps {
  center: Coordinates;
  zoom: number;
  facilities: Facility[]; 
  onFacilitySelect: (facility: Facility) => void;
  selectedFacility: Facility | null;
  userLocation: Coordinates | null;
  directionsRequest: { origin: Coordinates; destination: Coordinates } | null;
  mapViewMode?: MapViewMode;
}

const MAP_ID = 'naija-health-finda-map';
const EARTH_MAP_ID = 'a71b1542de31c984'; // A map ID with 3D photorealistic tiles enabled


// A separate component for Street View to handle its own lifecycle and library loading.
function StreetView({position}: {position: Coordinates}) {
    const streetViewRef = useRef<HTMLDivElement>(null);
    const streetViewLibrary = useMapsLibrary('streetView');
    const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama | null>(null);

    useEffect(() => {
        if (streetViewLibrary && streetViewRef.current && !panorama) {
            const newPanorama = new streetViewLibrary.StreetViewPanorama(streetViewRef.current, {
                position,
                pov: {heading: 0, pitch: 0},
                zoom: 1,
                disableDefaultUI: true,
                linksControl: true,
                panControl: true,
                addressControl: false,
                enableCloseButton: false,
                motionTracking: false,
                motionTrackingControl: false,
                showRoadLabels: true,
            });
            setPanorama(newPanorama);
        }
    }, [streetViewLibrary, panorama, position]);
    
    // Update position if it changes
    useEffect(() => {
        if (panorama && position) {
            panorama.setPosition(position);
        }
    }, [panorama, position]);
    
    return <div ref={streetViewRef} className="w-full h-full" />;
}


export function MapView({ center, zoom, facilities, onFacilitySelect, selectedFacility, userLocation, directionsRequest, mapViewMode = 'map' }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  const [currentCenter, setCurrentCenter] = useState<Coordinates>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);

  useEffect(() => {
    setCurrentCenter(center);
  }, [center]);

  useEffect(() => {
    setCurrentZoom(zoom);
  }, [zoom]);
  
  const handleCameraChange = useCallback((event: MapCameraChangedEvent) => {
    const newCenter = event.detail.center;
    const newZoom = event.detail.zoom;
    setCurrentCenter({ lat: newCenter.lat, lng: newCenter.lng });
    setCurrentZoom(newZoom);
  }, []);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-destructive-foreground bg-destructive p-4 rounded-md">
          Google Maps API Key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
        </p>
      </div>
    );
  }

  const isStreetView = mapViewMode === 'streetview';
  const isEarthView = mapViewMode === 'earth';

  return (
    <APIProvider apiKey={apiKey}>
      {isStreetView ? (
        <StreetView position={selectedFacility?.coordinates || currentCenter} />
      ) : (
        <Map
          center={currentCenter}
          zoom={currentZoom}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={isEarthView ? EARTH_MAP_ID : MAP_ID}
          mapTypeId={mapViewMode === 'satellite' ? 'satellite' : 'roadmap'}
          tilt={isEarthView ? 75 : 0}
          heading={isEarthView ? 90 : 0}
          className="w-full h-full"
          onCameraChanged={handleCameraChange}
        >
          {!directionsRequest && facilities.map((facility) => (
            <FacilityMarker
              key={facility.id}
              facility={facility}
              onClick={onFacilitySelect}
              isSelected={selectedFacility?.id === facility.id}
            />
          ))}
          {userLocation && (
             <AdvancedMarker position={userLocation} title="Your Location">
              <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
            </AdvancedMarker>
          )}
          {directionsRequest && (
            <Directions
              origin={directionsRequest.origin}
              destination={directionsRequest.destination}
            />
          )}
        </Map>
      )}
    </APIProvider>
  );
}

export function MapViewSkeleton() {
  return <Skeleton className="w-full h-full" />;
}
