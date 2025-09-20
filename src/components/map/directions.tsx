'use client';

import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import type { Coordinates } from '@/lib/types';

interface DirectionsProps {
  origin: Coordinates;
  destination: Coordinates;
}

export function Directions({ origin, destination }: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);

  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Use directions service to fetch route
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin) return;

    directionsService
      .route({
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false, // Disabling this as it's a common cause for issues on standard API keys
      })
      .then(response => {
        // Check if renderer is still available when the promise resolves
        if (directionsRenderer) {
            directionsRenderer.setDirections(response);
            setRoutes(response.routes);
        }
      })
      .catch(e => {
        console.error('Directions request failed. This may be due to the "Directions API" not being enabled in your Google Cloud project. See the browser console for the full error from Google Maps.', e);
      });
    
    // Cleanup function to remove the route from the map
    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null); // This clears the directions from the map
      }
    };
  }, [directionsService, directionsRenderer, origin, destination]);
  
  // Update the displayed route when the route index changes
  useEffect(() => {
    if (!directionsRenderer) return;
    // The `routeIndex` is kept in case we re-enable `provideRouteAlternatives` later.
    // For now, it will always be 0.
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  // This component only renders the route on the map and has no visible JSX output.
  return null;
}
