
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { FacilitySheet } from '@/components/facility/facility-sheet';
import { EmergencyDialog } from '@/components/emergency/emergency-dialog';
import type { Facility, Coordinates } from '@/lib/types';
import { allFacilities } from '@/lib/data';
import useGeolocation from '@/hooks/use-geolocation';
import { Button } from '@/components/ui/button';
import { LocateFixed, Loader2, X as XIcon, Layers } from 'lucide-react';
import { useEmergencyHandler } from '@/hooks/use-emergency-handler';
import { MapViewSkeleton, MapView } from '@/components/map/map-view';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Default center for Nigeria (Abuja)
const DEFAULT_CENTER: Coordinates = { lat: 9.0820, lng: 7.3986 };
const DEFAULT_ZOOM = 6;
export type MapViewMode = 'map' | 'earth' | 'satellite' | 'streetview';

const viewModes: MapViewMode[] = ['map', 'satellite', 'earth', 'streetview'];
const viewModeNames = {
  map: '2D Map',
  satellite: 'Satellite',
  earth: '3D Earth',
  streetview: 'Street View',
};

export default function HomePage() {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isFacilitySheetOpen, setIsFacilitySheetOpen] = useState(false);
  
  const { coordinates: userLocation, error: geolocationError, loading: geolocationLoading } = useGeolocation();
  const { handleEmergencyClick, emergencyDialogProps } = useEmergencyHandler();

  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM);
  const [directionsRequest, setDirectionsRequest] = useState<{
    origin: Coordinates;
    destination: Coordinates;
  } | null>(null);

  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('map');
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(13);
    }
  }, [userLocation]);

  useEffect(() => {
    if (geolocationError) {
      // Toast has been removed from this page. Error is handled gracefully.
      console.error(geolocationError);
    }
  }, [geolocationError]);

  const handleGetDirections = (facility: Facility) => {
    if (!userLocation) {
      toast({
        title: 'Location Needed',
        description: 'Cannot get directions without your current location. Please enable location services.',
        variant: 'destructive',
      });
      return;
    }
    if (!facility.coordinates) {
      toast({
        title: 'Location Missing',
        description: 'This facility does not have coordinate data for directions.',
        variant: 'destructive',
      });
      return;
    }
    setDirectionsRequest({
      origin: userLocation,
      destination: facility.coordinates,
    });
    setMapCenter(userLocation); // Recenter map on user
    setMapZoom(14);
    setIsFacilitySheetOpen(false); // Close the sheet to show the map
    setMapViewMode('map'); // Ensure we are in map mode to show directions
  };

  // Effect to handle directions requests from URL
  useEffect(() => {
    const facilityId = searchParams.get('directions_to_id');
    if (facilityId && userLocation) {
        const facilityToFind = allFacilities.find(f => f.id === facilityId);
        if (facilityToFind) {
            handleGetDirections(facilityToFind);
            // Clean the URL query param after handling it
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.delete('directions_to_id');
            router.replace(`/?${newSearchParams.toString()}`, { scroll: false });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, userLocation, router]);

  const handleFacilitySelect = (facility: Facility) => {
    setDirectionsRequest(null);
    setSelectedFacility(facility);
    setIsFacilitySheetOpen(true);
    if(facility.coordinates) {
        setMapCenter(facility.coordinates);
        setMapZoom(16);
    }
  };

  const handleRecenterMap = () => {
    if (geolocationLoading) {
      return;
    }
    if (geolocationError) {
       toast({
        title: 'Location Unavailable',
        description: `Could not get your location: ${geolocationError.message}.`,
        variant: 'destructive',
      });
      return;
    }
    if (userLocation) {
      setMapCenter(userLocation);
      setMapZoom(15); // Zoom in to a more local view
    } else {
       toast({
        title: 'Location Not Found',
        description: 'Your location is not currently available.',
        variant: 'destructive',
      });
    }
  };

  const handleClearDirections = () => {
    setDirectionsRequest(null);
  }

  const handleCycleMapView = () => {
    const currentIndex = viewModes.indexOf(mapViewMode);
    const nextIndex = (currentIndex + 1) % viewModes.length;
    const nextViewMode = viewModes[nextIndex];
    setMapViewMode(nextViewMode);
    
    if (nextViewMode === 'earth' && userLocation) {
      setMapCenter(userLocation);
      setMapZoom(18); // Zoom in for a better 3D effect
    } else if (nextViewMode === 'earth' && !userLocation) {
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(16);
    }

    toast({
      title: `View Changed`,
      description: `Switched to ${viewModeNames[nextViewMode]} view.`,
    });
  };

  if (!isClient) {
    return <MapViewSkeleton />;
  }

  return (
    <TooltipProvider>
    <div className="relative h-screen w-screen flex flex-col overflow-hidden">
      <Header onEmergencyClick={handleEmergencyClick} onTitleClick={handleRecenterMap} />
      <main className="flex-grow pt-16 pb-20">
        <MapView
          key={mapViewMode}
          center={mapCenter}
          zoom={mapZoom}
          facilities={allFacilities}
          onFacilitySelect={handleFacilitySelect}
          selectedFacility={selectedFacility}
          userLocation={userLocation}
          directionsRequest={directionsRequest}
          mapViewMode={mapViewMode}
        />
      </main>
      
      <div className="absolute bottom-28 left-6 z-50 flex flex-col gap-2">
        {directionsRequest && (
           <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="bg-destructive/90 rounded-full p-2 shadow-lg hover:bg-destructive w-10 h-10"
                onClick={handleClearDirections}
                aria-label="Clear directions"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right"><p>Clear Directions</p></TooltipContent>
          </Tooltip>
        )}
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
                variant='default' 
                size="icon" 
                className="w-10 h-10 rounded-full shadow-lg" 
                onClick={handleCycleMapView}>
                <Layers className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right"><p>Change Map View</p></TooltipContent>
        </Tooltip>

         <Tooltip>
          <TooltipTrigger asChild>
             <Button
                variant="outline"
                size="icon"
                className="bg-background rounded-full p-2 shadow-lg hover:bg-muted/80 w-10 h-10"
                onClick={handleRecenterMap}
                aria-label="Center map on your location"
                disabled={geolocationLoading}
              >
                {geolocationLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LocateFixed className="h-5 w-5" />
                )}
              </Button>
          </TooltipTrigger>
           <TooltipContent side="right"><p>Center on My Location</p></TooltipContent>
        </Tooltip>
      </div>

      <FacilitySheet
        facility={selectedFacility}
        isOpen={isFacilitySheetOpen}
        onOpenChange={(open) => {
          setIsFacilitySheetOpen(open);
          if (!open) setSelectedFacility(null);
        }}
        onGetDirections={handleGetDirections}
      />
      <EmergencyDialog {...emergencyDialogProps} />
    </div>
    </TooltipProvider>
  );
}
