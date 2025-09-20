
'use client';

import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { Facility } from '@/lib/types';
import { Phone, Navigation, Clock, CheckCircle, MapPin, Building as BuildingIconLucide, Share2, X as CloseIcon, Dumbbell, Stethoscope, Pill, TestTube, Eye, Sparkles, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { ReactNode } from 'react';

// Inline SVG for Tooth icon as it's not in Lucide
const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.34 12.22a8.06 8.06 0 0 0-5.32-4.51L12 2l-3.02 5.71a8.06 8.06 0 0 0-5.32 4.51A7.59 7.59 0 0 0 6 18c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4a7.59 7.59 0 0 0-2.66-5.78Z" />
        <path d="M12 12h.01" /><path d="M15.5 15.5h.01" /><path d="M8.5 15.5h.01" />
    </svg>
);

const getFacilityTypeIcon = (type: string | undefined): ReactNode => {
  const iconProps = { className: "mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" };
  switch (type?.toLowerCase()) {
    case 'hospital': return <BuildingIconLucide {...iconProps} />;
    case 'clinic': return <Stethoscope {...iconProps} />;
    case 'pharmacy': return <Pill {...iconProps} />;
    case 'diagnostic center': return <TestTube {...iconProps} />;
    case 'dental clinic': return <ToothIcon {...iconProps} />;
    case 'optical center': return <Eye {...iconProps} />;
    case 'gym': return <Dumbbell {...iconProps} />;
    case 'spa': return <Sparkles {...iconProps} />;
    case 'specialist center': return <UserCheck {...iconProps} />;
    case 'physiotherapy clinic': return <Dumbbell {...iconProps} />; // Using dumbbell as a proxy for physical activity
    default: return <BuildingIconLucide {...iconProps} />;
  }
};


interface FacilitySheetProps {
  facility: Facility | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onGetDirections: (facility: Facility) => void;
}

export function FacilitySheet({ facility, isOpen, onOpenChange, onGetDirections }: FacilitySheetProps) {
  const { toast } = useToast();

  if (!facility) return null;

  const handleShare = async () => {
    if (!facility) return;

    const shareData = {
      title: facility.name,
      text: `Check out ${facility.name} (${facility.type}) on IsabiFine AI! Address: ${facility.address}. Hours: ${facility.openingHours || 'Not specified'}.`,
      // url: window.location.href, // Or a specific facility URL if you have one
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: 'Shared successfully!' });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast({ title: 'Error sharing', description: (err as Error).message, variant: 'destructive' });
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.text);
        toast({ title: 'Copied to clipboard!', description: 'Facility details copied.' });
      } catch (err) {
        toast({ title: 'Failed to copy', description: 'Could not copy details to clipboard.', variant: 'destructive' });
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full min-h-0 overflow-hidden">
        
        {/* Screen reader only title and description for accessibility */}
        <div className="sr-only">
          <SheetTitle>{facility.name}</SheetTitle>
          <SheetDescription>
            Detailed information for {facility.name}, a {facility.type}. Includes address, contact, hours, and services.
          </SheetDescription>
        </div>

        <ScrollArea className="flex-grow">
          <div className="relative w-full aspect-[3/2] overflow-hidden bg-muted">
            {facility.imageUrl && (
              <Image
                src={facility.imageUrl}
                alt={facility.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint={facility.dataAiHint || "medical building"}
              />
            )}
            <SheetClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/75 hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>

          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold text-primary">{facility.name}</h2>

            <div className="space-y-2">
              <div className="flex items-start pt-1">
                {getFacilityTypeIcon(facility.type)}
                <span className="text-sm text-foreground">{facility.type}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{facility.address}</span>
              </div>
              {facility.phone && (
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-foreground">{facility.phone}</span>
                </div>
              )}
              {facility.openingHours && (
                  <div className="flex items-center">
                      <Clock className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground">{facility.openingHours}</span>
                  </div>
              )}
            </div>

            <div>
              <h3 className="text-md font-semibold text-foreground mb-2">Services Offered:</h3>
              {facility.services && facility.services.length > 0 ? (
                <ul className="list-none space-y-1.5 pl-1">
                  {facility.services.map((service, index) => (
                    <li key={index} className="flex items-center text-sm text-foreground">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" />
                      {service}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground pl-1">Services information not available.</p>
              )}
            </div>
            
            <Separator className="my-6" />
            <div className="flex flex-row gap-2 pt-2">
                <Button
                  size="sm"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => onGetDirections(facility)}
                  disabled={!facility.coordinates}
                >
                  <Navigation className="mr-2 h-4 w-4" /> Directions
                </Button>
                {facility.phone ? (
                    <Button asChild variant="outline" size="sm" className="flex-1 border-primary text-primary hover:bg-primary/10 hover:text-primary">
                        <a href={`tel:${facility.phone}`} className="w-full flex items-center justify-center">
                            <Phone className="mr-2 h-4 w-4" /> Call
                        </a>
                    </Button>
                ) : (
                     <Button variant="outline" size="sm" className="flex-1" disabled>
                        <Phone className="mr-2 h-4 w-4" /> Call
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
