'use client';

import { useState, useEffect } from 'react';
import type { Coordinates } from '@/lib/types';

interface GeolocationState {
  coordinates: Coordinates | null;
  error: GeolocationPositionError | Error | null;
  loading: boolean;
}

const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        error: new Error('Geolocation is not supported by your browser.'),
        loading: false,
      });
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        coordinates: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        coordinates: null,
        error,
        loading: false,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    
    // Cleanup function is not strictly necessary here as getCurrentPosition
    // doesn't set up a persistent watcher. However, if using watchPosition,
    // a cleanup function returning navigator.geolocation.clearWatch(watchId) would be needed.
  }, []);

  return state;
};

export default useGeolocation;
