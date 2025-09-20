
'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Facility, Coordinates } from '@/lib/types';
import { allFacilities } from '@/lib/data';
import { haversineDistance } from '@/lib/utils';
import type { EmergencyDialogProps, EmergencyType } from '@/components/emergency/emergency-dialog';

export const useEmergencyHandler = () => {
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [isEmergencyConfirmed, setIsEmergencyConfirmed] = useState(false);

  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [locationError, setLocationError] = useState<Error | null>(null);
  const [foundLocation, setFoundLocation] = useState<Coordinates | null>(null);
  const [emergencyType, setEmergencyType] = useState<EmergencyType>('general');

  const handleEmergencyClick = useCallback(() => {
    setIsEmergencyDialogOpen(true);
    // Reset states when the dialog is opened
    setIsEmergencyConfirmed(false);
    setFoundLocation(null);
    setLocationError(null);
    setIsFindingLocation(false);
  }, []);

  const handleEmergencyConfirm = useCallback((type: EmergencyType) => {
    setEmergencyType(type);
    setIsEmergencyConfirmed(true);
    setIsFindingLocation(true);
    setLocationError(null);
    setFoundLocation(null);

    // 1. Check for a user-saved location in localStorage
    const savedLocationRaw = localStorage.getItem('userSavedLocation');
    if (savedLocationRaw) {
      try {
        const savedLocation = JSON.parse(savedLocationRaw);
        setFoundLocation(savedLocation);
        setIsFindingLocation(false);
        return; // Exit if saved location is found and used
      } catch (e) {
        console.error('Failed to parse saved location', e);
        // If parsing fails, proceed to geolocation
      }
    }

    // 2. Fallback to live geolocation
    if (!navigator.geolocation) {
      setLocationError(new Error('Geolocation is not supported by your browser.'));
      setIsFindingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFoundLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsFindingLocation(false);
      },
      (error) => {
        setLocationError(new Error(error.message));
        setIsFindingLocation(false);
      }
    );
  }, []);

  const nearestFacilityForEmergency = useMemo(() => {
    if (!foundLocation) {
      return null;
    }

    const serviceKeywords: Record<EmergencyType, string> = {
      accident: 'emergency care',
      maternity: 'maternity',
      general: 'emergency care',
    };
    const targetService = serviceKeywords[emergencyType];

    const findClosestFacility = (facilities: Facility[]): Facility | null => {
        let closest: Facility | null = null;
        let minDistance = Infinity;

        facilities.forEach(facility => {
            if (facility?.coordinates && typeof facility.coordinates.lat === 'number' && typeof facility.coordinates.lng === 'number') {
                const distance = haversineDistance(foundLocation, facility.coordinates);
                if (typeof distance === 'number' && !isNaN(distance) && distance < minDistance) {
                minDistance = distance;
                closest = facility;
                }
            }
        });
        return closest;
    }

    // 1. Try to find a facility with the specific service.
    const specializedFacilities = allFacilities.filter(facility =>
      facility.services.some(service => service.toLowerCase().includes(targetService))
    );
    const closestSpecialized = findClosestFacility(specializedFacilities);
    
    // 2. If a specialized facility is found, return it.
    if(closestSpecialized) {
        return closestSpecialized;
    }

    // 3. Fallback: If no specialized facility is found, find the absolute closest of any type.
    console.warn(`No facilities found with service: "${targetService}". Falling back to nearest facility of any type.`);
    return findClosestFacility(allFacilities);

  }, [foundLocation, emergencyType]);

  const emergencyDialogProps: EmergencyDialogProps = useMemo(() => ({
    isOpen: isEmergencyDialogOpen,
    onOpenChange: (open: boolean) => {
      setIsEmergencyDialogOpen(open);
      if (!open) {
        // Reset all states if dialog is closed
        setIsEmergencyConfirmed(false);
        setFoundLocation(null);
        setLocationError(null);
        setIsFindingLocation(false);
      }
    },
    onConfirm: handleEmergencyConfirm,
    nearestFacility: nearestFacilityForEmergency,
    confirmed: isEmergencyConfirmed,
    geolocationLoading: isFindingLocation,
    geolocationError: locationError,
  }), [isEmergencyDialogOpen, handleEmergencyConfirm, nearestFacilityForEmergency, isEmergencyConfirmed, isFindingLocation, locationError]);

  return { handleEmergencyClick, emergencyDialogProps };
};
