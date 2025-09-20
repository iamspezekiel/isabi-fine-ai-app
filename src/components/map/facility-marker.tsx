'use client';

import type { Facility } from '@/lib/types';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { Hospital, MapPin } from 'lucide-react';

interface FacilityMarkerProps {
  facility: Facility;
  onClick: (facility: Facility) => void;
  isSelected: boolean;
}

export function FacilityMarker({ facility, onClick, isSelected }: FacilityMarkerProps) {
  return (
    <AdvancedMarker
      position={facility.coordinates}
      onClick={() => onClick(facility)}
      title={facility.name}
    >
      <div className={`p-1 rounded-full shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110
        ${isSelected ? 'bg-accent animate-pulse' : 'bg-primary'}
      `}>
        <MapPin className={`h-6 w-6 fill-current
          ${isSelected ? 'text-accent-foreground' : 'text-primary-foreground'}
        `} />
      </div>
    </AdvancedMarker>
  );
}
