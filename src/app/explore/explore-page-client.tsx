
'use client';

import { useState, useEffect, type ReactNode, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FacilitySheet } from '@/components/facility/facility-sheet';
import { EmergencyDialog } from '@/components/emergency/emergency-dialog';
import {
  Search, Hospital, Stethoscope, Pill, TestTube, Eye, Dumbbell, Sparkles, UserCheck,
  AlertCircle, MapPin, Building, Info, Navigation, PhoneCall, FilterX, LocateFixed, Loader2, PlusCircle
} from 'lucide-react';
import type { Facility, FacilityType } from '@/lib/types';
import useGeolocation from '@/hooks/use-geolocation';
import { useToast } from '@/hooks/use-toast';
import { haversineDistance } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useSearchParams, useRouter, usePathname } from 'next/navigation'; 
import { useEmergencyHandler } from '@/hooks/use-emergency-handler';
import Link from 'next/link';
import { FacilitySubmissionSheet } from '@/components/facility/facility-submission-sheet';

// Inline SVG for Tooth icon
const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20.34 12.22a8.06 8.06 0 0 0-5.32-4.51L12 2l-3.02 5.71a8.06 8.06 0 0 0-5.32 4.51A7.59 7.59 0 0 0 6 18c0 2.21 1.79 4 4 4h4c2.21 0 4-1.79 4-4a7.59 7.59 0 0 0-2.66-5.78Z" />
    <path d="M12 12h.01" /><path d="M15.5 15.5h.01" /><path d="M8.5 15.5h.01" />
  </svg>
);

const getFacilityTypeIcon = (type: FacilityType | undefined): ReactNode => {
  const iconProps = { className: "mr-2 h-4 w-4 text-primary shrink-0" };
  switch (type?.toLowerCase()) {
    case 'hospital': return <Hospital {...iconProps} />;
    case 'clinic': return <Stethoscope {...iconProps} />;
    case 'pharmacy': return <Pill {...iconProps} />;
    case 'diagnostic center': return <TestTube {...iconProps} />;
    case 'dental clinic': return <ToothIcon {...iconProps} />;
    case 'optical center': return <Eye {...iconProps} />;
    case 'gym': return <Dumbbell {...iconProps} />;
    case 'spa': return <Sparkles {...iconProps} />;
    case 'specialist center': return <UserCheck {...iconProps} />;
    case 'physiotherapy clinic': return <Dumbbell {...iconProps} />;
    default: return <Building {...iconProps} />;
  }
};

const NEARBY_RADIUS_KM = 10; // 10 kilometers
const MAX_TOTAL_VISIBLE_ITEMS_IN_SERVICE_ROW = 3;
const MAX_INDIVIDUAL_SERVICE_BADGES_WHEN_OVERFLOW = MAX_TOTAL_VISIBLE_ITEMS_IN_SERVICE_ROW - 1;

interface ExplorePageClientProps {
  facilities: Facility[];
}

export default function ExplorePageClient({ facilities: initialFacilities }: ExplorePageClientProps) {
  const searchParams = useSearchParams(); 
  const router = useRouter(); 
  const pathname = usePathname(); 

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || ''); 
  const [selectedType, setSelectedType] = useState<FacilityType | 'all'>('all');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isFacilitySheetOpen, setIsFacilitySheetOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [isSubmissionSheetOpen, setIsSubmissionSheetOpen] = useState(false);

  const { toast } = useToast();
  const { coordinates: userLocation, error: geolocationError, loading: geolocationLoading } = useGeolocation();
  const { handleEmergencyClick, emergencyDialogProps } = useEmergencyHandler();

  useEffect(() => {
    setIsClient(true);
  }, []); 

  useEffect(() => {
    const queryFromUrl = searchParams.get('q');
    if (queryFromUrl !== null && queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams, searchQuery]);


  // Memoize the filtering logic to prevent expensive recalculations on every render.
  const displayedFacilities = useMemo(() => {
    if (!isClient) return [];

    let facilities = initialFacilities;

    if (isNearMeActive && userLocation && !geolocationLoading) {
      facilities = facilities.filter(facility => {
        if (!facility.coordinates) return false;
        const distance = haversineDistance(userLocation, facility.coordinates);
        return distance <= NEARBY_RADIUS_KM;
      });
    } else if (isNearMeActive && (geolocationLoading || geolocationError || !userLocation)) {
       facilities = [];
    }

    if (selectedType !== 'all') {
      facilities = facilities.filter(facility => facility.type.toLowerCase() === selectedType.toLowerCase());
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      facilities = facilities.filter(facility =>
        facility.name.toLowerCase().includes(lowercasedQuery) ||
        facility.address.toLowerCase().includes(lowercasedQuery) ||
        (facility.services && facility.services.some(service => service.toLowerCase().includes(lowercasedQuery))) ||
        facility.type.toLowerCase().includes(lowercasedQuery)
      );
    }
    return facilities;
  }, [searchQuery, selectedType, isClient, isNearMeActive, userLocation, geolocationLoading, geolocationError, initialFacilities]);


  const handleFacilitySelect = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsFacilitySheetOpen(true);
  };

  const updateUrlQuery = (newQueryValue: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (!newQueryValue.trim()) {
      current.delete('q');
    } else {
      current.set('q', newQueryValue);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.replace(`${pathname}${query}`);
  };

  const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
  };


  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setIsNearMeActive(false);
    updateUrlQuery(''); 
    toast({ title: 'Filters Cleared', description: 'Showing all facilities.' });
  };

  const handleNearMeClick = () => {
    if (geolocationLoading) {
      toast({ title: 'Locating...', description: 'Fetching your current location. Please wait.' });
      return;
    }
    if (geolocationError || !userLocation) {
      toast({
        title: 'Location Unavailable',
        description: 'Could not get your location. Please enable location services in your browser/device settings and try again.',
        variant: 'destructive',
      });
      setIsNearMeActive(false); 
      return;
    }
    
    setSearchQuery(''); 
    updateUrlQuery(''); 
    setSelectedType('all'); 
    setIsNearMeActive(true);
    toast({ title: 'Searching Nearby', description: `Looking for facilities within ${NEARBY_RADIUS_KM}km.` });
  };

  if (!isClient) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onEmergencyClick={handleEmergencyClick} />
        <main className="flex-grow container mx-auto p-4 pt-24 pb-20">
          <div className="mb-6">
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-72 w-full" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen">
        <Header onEmergencyClick={handleEmergencyClick} />
        <main className="flex-grow container mx-auto p-4 pt-24 pb-20">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary mb-2 font-heading">Explore Your Health &amp; Wellness Options</h1>
            <p className="text-lg text-foreground break-words">
              Find hospitals, clinics, pharmacies, diagnostic centers, dental and optical clinics, specialist centers, gyms, spas, and more. Use the filters below to narrow your search.
            </p>
          </div>

          <Card className="mb-8 shadow-lg bg-background/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-accent">
                <Search className="mr-2 h-5 w-5" /> Filter Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="search-facility" className="block text-sm font-medium text-muted-foreground mb-1">
                    Search by name, address, service, or type
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-facility"
                      placeholder="e.g., Hospital, Pharmacy, or Ikeja"
                      className="pl-10 bg-input"
                      value={searchQuery}
                      onChange={handleLocalSearchChange}
                       onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateUrlQuery(searchQuery); 
                        }
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="facility-type" className="block text-sm font-medium text-muted-foreground mb-1">
                    Filter by type
                  </label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as FacilityType | 'all')}>
                    <SelectTrigger id="facility-type" className="bg-input">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Hospital"><div className="flex items-center"><Hospital className="mr-2 h-4 w-4" /> Hospital</div></SelectItem>
                      <SelectItem value="Clinic"><div className="flex items-center"><Stethoscope className="mr-2 h-4 w-4" /> Clinic</div></SelectItem>
                      <SelectItem value="Pharmacy"><div className="flex items-center"><Pill className="mr-2 h-4 w-4" /> Pharmacy</div></SelectItem>
                      <SelectItem value="Diagnostic Center"><div className="flex items-center"><TestTube className="mr-2 h-4 w-4" /> Diagnostic Center</div></SelectItem>
                      <SelectItem value="Dental Clinic"><div className="flex items-center"><ToothIcon className="mr-2 h-4 w-4" /> Dental Clinic</div></SelectItem>
                      <SelectItem value="Optical Center"><div className="flex items-center"><Eye className="mr-2 h-4 w-4" /> Optical Center</div></SelectItem>
                      <SelectItem value="Gym"><div className="flex items-center"><Dumbbell className="mr-2 h-4 w-4" /> Gym</div></SelectItem>
                      <SelectItem value="Spa"><div className="flex items-center"><Sparkles className="mr-2 h-4 w-4" /> Spa</div></SelectItem>
                      <SelectItem value="Specialist Center"><div className="flex items-center"><UserCheck className="mr-2 h-4 w-4" /> Specialist Center</div></SelectItem>
                      <SelectItem value="Physiotherapy Clinic"><div className="flex items-center"><Dumbbell className="mr-2 h-4 w-4" /> Physiotherapy Clinic</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  variant={isNearMeActive ? "default" : "outline"}
                  onClick={handleNearMeClick}
                  className="w-full sm:flex-1"
                  disabled={geolocationLoading && !userLocation} 
                >
                  {geolocationLoading && isNearMeActive ? ( 
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LocateFixed className="mr-2 h-4 w-4" />
                  )}
                  Facilities Near Me {isNearMeActive ? `(${NEARBY_RADIUS_KM}km)` : ''}
                </Button>
                <Button variant="outline" onClick={handleClearFilters} className="w-full sm:flex-1">
                  <FilterX className="mr-2 h-4 w-4" /> Clear All Filters
                </Button>
              </div>
            </CardContent>
             <CardFooter className="border-t p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSubmissionSheetOpen(true)}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Can't find a facility? Add one to our directory.
                </Button>
            </CardFooter>
          </Card>
           {isNearMeActive && userLocation && !geolocationLoading && (
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Showing facilities within {NEARBY_RADIUS_KM}km of your current location.
            </p>
          )}
          {isNearMeActive && geolocationLoading && (
             <div className="text-center py-10">
                <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Finding facilities near you...</p>
             </div>
          )}


          {displayedFacilities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedFacilities.map((facility) => {
                const servicesToDisplayCount = facility.services.length > MAX_TOTAL_VISIBLE_ITEMS_IN_SERVICE_ROW
                  ? MAX_INDIVIDUAL_SERVICE_BADGES_WHEN_OVERFLOW
                  : facility.services.length;
                const servicesToShowDirectly = facility.services.slice(0, servicesToDisplayCount);
                
                const showMoreBadge = facility.services.length > MAX_TOTAL_VISIBLE_ITEMS_IN_SERVICE_ROW;
                const remainingServicesCount = facility.services.length - MAX_INDIVIDUAL_SERVICE_BADGES_WHEN_OVERFLOW;
                const servicesForTooltip = facility.services.slice(MAX_INDIVIDUAL_SERVICE_BADGES_WHEN_OVERFLOW);

                return (
                  <Card key={facility.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl font-semibold text-primary mb-1 truncate" title={facility.name}>
                        {facility.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground pt-1">
                        {getFacilityTypeIcon(facility.type)}
                        <p className="font-medium">{facility.type}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-3 text-sm pt-0">
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground shrink-0" />
                        <p className="text-muted-foreground break-words">{facility.address}</p>
                      </div>
                      {facility.services && facility.services.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {servicesToShowDirectly.map(service => (
                            <Badge key={service} variant="secondary" className="text-xs px-2 py-0.5">{service}</Badge>
                          ))}
                          {showMoreBadge && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs px-2 py-0.5 cursor-default">+{remainingServicesCount} more</Badge>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <div className="p-2">
                                  <p className="font-semibold mb-1 text-xs">Additional Services:</p>
                                  <ul className="list-disc pl-4 text-xs space-y-0.5">
                                    {servicesForTooltip.map(service => (
                                      <li key={service}>{service}</li>
                                    ))}
                                  </ul>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Services not specified.</p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-row gap-2 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleFacilitySelect(facility)} className="flex-1">
                        <Info className="mr-2 h-4 w-4" /> Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={!facility.coordinates}
                        className="flex-1"
                      >
                        <Link
                          href={facility.coordinates ? `/?directions_to_id=${facility.id}` : '#'}
                          className={`w-full flex items-center justify-center ${!facility.coordinates ? 'cursor-not-allowed opacity-50' : ''}`}
                        >
                          <Navigation className="mr-2 h-4 w-4" /> Directions
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!facility.phone}
                        asChild={!!facility.phone}
                        className="flex-1"
                      >
                        {facility.phone ? (
                          <a href={`tel:${facility.phone}`} className="w-full flex items-center justify-center">
                            <PhoneCall className="mr-2 h-4 w-4" /> Call
                          </a>
                        ) : (
                          <div className={`w-full flex items-center justify-center ${!facility.phone ? 'cursor-not-allowed opacity-50' : ''}`}>
                            <PhoneCall className="mr-2 h-4 w-4" /> Call
                          </div>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
             !geolocationLoading && ( 
              <Card className="shadow-md col-span-full">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold text-foreground mb-2">No Matching Facilities</h2>
                  <p className="text-muted-foreground">
                    We couldn't find any facilities
                    {isNearMeActive && userLocation ? ` near you within ${NEARBY_RADIUS_KM}km` : ''}
                    {isNearMeActive && !userLocation && geolocationError ? ' because your location could not be determined' : ''}
                    {searchQuery && !isNearMeActive ? ` matching your search for "${searchQuery}"` : ''}
                    {selectedType !== 'all' && !isNearMeActive ? ` of type "${selectedType}"` : ''}.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your search terms, selecting a different facility type, or clearing all filters.
                  </p>
                  <Button variant="outline" onClick={handleClearFilters} className="mt-4">
                    <FilterX className="mr-2 h-4 w-4" /> Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            )
          )}
        </main>

        <FacilitySheet
          facility={selectedFacility}
          isOpen={isFacilitySheetOpen}
          onOpenChange={(open) => {
            setIsFacilitySheetOpen(open);
            if (!open) setSelectedFacility(null);
          }}
          onGetDirections={(facility) => {
            // In the Explore page, the "Directions" button is a direct link.
            // This handler is more relevant for the main map page.
            // We can just close the sheet.
            setIsFacilitySheetOpen(false);
          }}
        />
        <FacilitySubmissionSheet isOpen={isSubmissionSheetOpen} onOpenChange={setIsSubmissionSheetOpen} />
        <EmergencyDialog {...emergencyDialogProps} />
      </div>
    </TooltipProvider>
  );
}
