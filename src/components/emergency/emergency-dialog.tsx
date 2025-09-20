
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Facility } from '@/lib/types';
import { Phone, Navigation, Info, Loader2, TriangleAlert } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import type { SVGProps } from 'react';

// Inline SVG definitions for missing icons
const CarCrash = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.3 2.2c.2-.3.5-.4.8-.4s.6.1.8.4l1.6 2.9c.2.3.5.4.8.4H17c.6 0 1 .4 1 1v2c0 .3-.1.6-.4.8l-2.9 1.6c-.3.2-.4.5-.4.8v3.2c0 .3.1.6.4.8l2.9 1.6c.3.2.4.5.4.8v2c0 .6-.4 1-1 1h-2.7c-.3 0-.6.1-.8.4l-1.6 2.9c-.2.3-.5.4-.8.4s-.6-.1-.8-.4l-1.6-2.9c-.2-.3-.5-.4-.8-.4H7c-.6 0-1-.4-1-1v-2c0-.3.1-.6.4-.8l2.9-1.6c.3-.2.4-.5.4-.8V8.8c0-.3-.1-.6-.4-.8L5.4 6.4C5.1 6.2 5 5.9 5 5.6V3.6c0-.6.4-1 1-1h2.7c.3 0 .6-.1.8-.4z" /><path d="m14.2 8.8 3.4-3.4" /><path d="M9.8 8.8 6.4 5.4" /><path d="M14.2 15.2 3.4 4.6" /><path d="m9.8 15.2 10.8 10.8" /></svg>
);
const Baby = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 12.5a5 5 0 0 0 5 5" /><path d="M9 8.5a5 5 0 0 1 5 5" /><path d="M11.5 2a.5.5 0 0 0-1 0V3" /><path d="M12.5 2a.5.5 0 0 1 1 0V3" /><path d="M12 5a1 1 0 0 0-1 1v1" /><path d="M12 8a1 1 0 0 0 1-1V6" /><circle cx="12" cy="12" r="10" /><path d="m7.3 10.9.8-3.3" /><path d="m16.7 10.9-.8-3.3" /><path d="M12 17a2.5 2.5 0 0 0 2.5-2.5" /><path d="M12 17a2.5 2.5 0 0 1-2.5-2.5" /></svg>
);
const Siren = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2c1.8 0 3.6.4 5.2 1.2" /><path d="M18.8 5.2C21.6 7.6 22 12 22 12" /><path d="M12 2c-1.8 0-3.6.4-5.2 1.2" /><path d="M5.2 5.2C2.4 7.6 2 12 2 12" /><path d="M12 12v10" /><path d="M7 12a5 5 0 0 1 10 0" /><path d="M4 12h16" /><path d="M9 16h6" /></svg>
);


export type EmergencyType = 'accident' | 'maternity' | 'general';

export interface EmergencyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (emergencyType: EmergencyType) => void;
  nearestFacility: Facility | null;
  confirmed: boolean;
  geolocationLoading: boolean;
  geolocationError: GeolocationPositionError | Error | null;
}

export function EmergencyDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  nearestFacility,
  confirmed,
  geolocationLoading,
  geolocationError,
}: EmergencyDialogProps) {

  const renderConfirmedContent = () => {
    // State 1: Geolocation is in progress
    if (geolocationLoading) {
      return (
        <div className="flex flex-col items-center space-y-2 pt-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <AlertDialogDescription>Acquiring your location...</AlertDialogDescription>
        </div>
      );
    }

    // State 2: Geolocation failed
    if (geolocationError) {
      return (
        <div className="flex flex-col items-center space-y-2 pt-2 text-center">
          <TriangleAlert className="h-8 w-8 text-destructive mb-2" />
          <AlertDialogDescription className="text-destructive">
            Could not get your location: {geolocationError.message}.
          </AlertDialogDescription>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            Please enable location services in your browser/device settings and try again.
          </AlertDialogDescription>
        </div>
      );
    }

    // At this point, geolocation is successful (loading is false, error is null)

    // State 3: Geolocation successful, but no facility found (nearestFacility is null)
    if (!nearestFacility) {
      return (
        <div className="flex flex-col items-center space-y-2 pt-2 text-center">
          <Info className="h-8 w-8 text-muted-foreground mb-2" />
          <AlertDialogDescription>
            No suitable healthcare facilities found nearby based on your current location and our database.
          </AlertDialogDescription>
           <AlertDialogDescription className="text-muted-foreground text-sm">
            You may need to contact emergency services directly if this is a critical situation.
          </AlertDialogDescription>
        </div>
      );
    }

    // State 4: Geolocation successful, and a facility was found
    if (nearestFacility) {
      return (
        <div className="space-y-3 pt-2 text-left">
          {nearestFacility.imageUrl ? (
            <div className="relative w-full h-48 rounded-md overflow-hidden shadow-md">
              <Image
                src={nearestFacility.imageUrl}
                alt={nearestFacility.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint={nearestFacility.dataAiHint || "medical building"}
              />
            </div>
          ) : (
            <Skeleton className="w-full h-48 rounded-md" />
          )}
          <p className="text-sm text-muted-foreground">{nearestFacility.address}</p>
          <p className="text-sm"><Info className="inline mr-2 h-4 w-4" />Type: {nearestFacility.type}</p>
          {nearestFacility.phone && (
            <p className="text-sm"><Phone className="inline mr-2 h-4 w-4" />Phone: {nearestFacility.phone}</p>
          )}
          <p className="text-sm text-foreground font-semibold">Services: {nearestFacility.services.join(', ')}</p>
          {nearestFacility.openingHours && (
            <p className="text-sm text-muted-foreground">Hours: {nearestFacility.openingHours}</p>
          )}
        </div>
      );
    }
    
    // Fallback
    return (
      <div className="flex flex-col items-center space-y-2 pt-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <AlertDialogDescription>Processing your request...</AlertDialogDescription>
      </div>
    );
  };
  
  const confirmedTitle = geolocationLoading 
    ? 'Finding Help...' 
    : geolocationError 
    ? 'Location Error' 
    : nearestFacility 
    ? `Nearest Facility: ${nearestFacility.name}` 
    : 'No Facilities Found';

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        {!confirmed ? (
           <>
            <AlertDialogHeader className="text-center">
              <AlertDialogTitle className="text-2xl flex flex-col items-center gap-2">
                <TriangleAlert className="h-10 w-10 text-destructive" />
                Emergency Assistance
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-2 text-center">
                For immediate life-threatening situations, call the national emergency number. For other urgent needs, specify your emergency below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-3 pt-4">
                <Button
                    asChild
                    className="w-full h-12 text-lg"
                    variant="destructive"
                >
                    <a href="tel:112">
                        <Phone className="mr-2 h-5 w-5" /> Call 112 Directly
                    </a>
                </Button>
                <AlertDialogAction onClick={() => onConfirm('accident')} className="w-full h-12 text-lg bg-primary hover:bg-primary/90">
                    <CarCrash className="mr-2 h-5 w-5" /> Accident / Injury
                </AlertDialogAction>
                <AlertDialogAction onClick={() => onConfirm('maternity')} className="w-full h-12 text-lg bg-primary hover:bg-primary/90">
                    <Baby className="mr-2 h-5 w-5" /> Maternity / Labour
                </AlertDialogAction>
                 <AlertDialogAction onClick={() => onConfirm('general')} className="w-full h-12 text-lg bg-primary hover:bg-primary/90">
                    <Siren className="mr-2 h-5 w-5" /> Other Medical Emergency
                </AlertDialogAction>
            </div>
            <AlertDialogFooter className="pt-2">
                <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                {confirmedTitle}
              </AlertDialogTitle>
              {renderConfirmedContent()}
            </AlertDialogHeader>
            <AlertDialogFooter>
              {nearestFacility?.phone && (
                <Button
                  variant="outline"
                  asChild
                  className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                >
                  <a href={`tel:${nearestFacility.phone}`}>
                    <Phone className="mr-2 h-4 w-4" /> Call Facility
                  </a>
                </Button>
              )}
              {nearestFacility && (
                <Button
                  variant="default"
                  asChild
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link href={`/?directions_to_id=${nearestFacility.id}`}>
                    <Navigation className="mr-2 h-4 w-4" /> Directions
                  </Link>
                </Button>
              )}
              <AlertDialogCancel onClick={() => onOpenChange(false)}>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

