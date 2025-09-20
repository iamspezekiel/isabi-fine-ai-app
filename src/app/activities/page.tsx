
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import Link from 'next/link';
import { History, Play, ChevronRight, Footprints as RunIcon, MountainSnow, Bike, Loader2, Bed, Trash2, StopCircle } from 'lucide-react';
import type { ElementType } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Coordinates } from '@/lib/types';
import { haversineDistance } from '@/lib/utils';

interface Activity {
  id: 'running' | 'walking' | 'cycling' | 'sleeping';
  title: string;
  value: string; // Used for mileage (miles) or sleep time (hh:mm:ss for display, minutes for total)
  description: string;
  imageUrl: string;
  imageHint: string;
  cardBgClass: string;
  textClass: string;
  playButtonBgClass: string;
  playButtonIconClass: string;
  icon: ElementType;
}

const initialActivityData: Activity[] = [
  {
    id: 'running',
    title: 'Running',
    value: '0.0',
    description: 'Total running mileage',
    imageUrl: 'https://i.ibb.co/XG24Yt7/Gemini-Generated-Image-hgyn2rhgyn2rhgyn-2.png',
    imageHint: 'person running',
    cardBgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    playButtonBgClass: 'bg-white/70 hover:bg-white',
    playButtonIconClass: 'text-amber-600',
    icon: RunIcon,
  },
  {
    id: 'walking',
    title: 'Walking',
    value: '0.0',
    description: 'Total walking mileage',
    imageUrl: 'https://i.ibb.co/HpnyvR14/Gemini-Generated-Image-hgyn2rhgyn2rhgyn-1.png',
    imageHint: 'person walking',
    cardBgClass: 'bg-teal-600',
    textClass: 'text-white',
    playButtonBgClass: 'bg-white/30 hover:bg-white/50',
    playButtonIconClass: 'text-teal-100',
    icon: MountainSnow,
  },
  {
    id: 'cycling',
    title: 'Cycling',
    value: '0.0',
    description: 'Total mileage of cycling',
    imageUrl: 'https://i.ibb.co/CKw2mfRm/Gemini-Generated-Image-hgyn2rhgyn2rhgyn.png',
    imageHint: 'person cycling',
    cardBgClass: 'bg-sky-100',
    textClass: 'text-sky-700',
    playButtonBgClass: 'bg-white/70 hover:bg-white',
    playButtonIconClass: 'text-sky-600',
    icon: Bike,
  },
  {
    id: 'sleeping',
    title: 'Sleeping',
    value: '0',
    description: 'Total minutes of sleep',
    imageUrl: 'https://i.ibb.co/9Hpn67t2/Gemini-Generated-Image-k5taahk5taahk5ta.png',
    imageHint: 'person sleeping bed',
    cardBgClass: 'bg-indigo-900',
    textClass: 'text-white',
    playButtonBgClass: 'bg-white/30 hover:bg-white/50',
    playButtonIconClass: 'text-indigo-100',
    icon: Bed,
  },
];

const initialDisplayData: Activity[] = [
  {...initialActivityData[0]},
  {...initialActivityData[1]},
  {...initialActivityData[2]},
  {
    ...initialActivityData[3],
    value: "00:00:00",
    description: 'Sleep duration (hh:mm:ss)',
  }
];


export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(initialActivityData);
  const [displayActivities, setDisplayActivities] = useState<Activity[]>(initialDisplayData);
  const { toast } = useToast();
  
  const [isTracking, setIsTracking] = useState(false);
  const [trackingActivityId, setTrackingActivityId] = useState<Activity['id'] | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const lastPositionRef = useRef<Coordinates | null>(null);
  const totalDistanceRef = useRef(0);
  const sleepStartTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load activities from localStorage on mount
  useEffect(() => {
    if (isClient) {
      try {
        const savedActivities = localStorage.getItem('userActivities');
        if (savedActivities) {
          const parsedActivities: Activity[] = JSON.parse(savedActivities);
          // Restore icons which are not serializable
          const restoredActivities = parsedActivities.map((savedAct, index) => ({
            ...savedAct,
            icon: initialActivityData[index].icon
          }));
          setActivities(restoredActivities);
        }
      } catch (error) {
        console.error("Failed to load activities from local storage", error);
        localStorage.removeItem('userActivities');
      }
    }
  }, [isClient]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      // Create a serializable version of activities without the 'icon' property
      const activitiesToSave = activities.map(({ icon, ...rest }) => rest);
      localStorage.setItem('userActivities', JSON.stringify(activitiesToSave));
    }
  }, [activities, isClient]);


  const updateDisplayValue = (activityId: Activity['id'], displayValue: string) => {
    setDisplayActivities(prev => prev.map(act => act.id === activityId ? {...act, value: displayValue} : act));
  };
  
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const handleStartActivity = (activityId: Activity['id']) => {
    if (isTracking || trackingActivityId) {
      toast({
        title: "Activity in Progress",
        description: "Another activity is already being tracked.",
        variant: "default",
      });
      return;
    }

    if (activityId === 'sleeping') {
        setIsTracking(true);
        setTrackingActivityId(activityId);
        sleepStartTimeRef.current = Date.now();
        
        intervalRef.current = setInterval(() => {
            if (sleepStartTimeRef.current) {
                const elapsedSeconds = (Date.now() - sleepStartTimeRef.current) / 1000;
                updateDisplayValue('sleeping', formatTime(elapsedSeconds));
            }
        }, 1000); // Update every second

        toast({
          title: "Sleep Logging Started",
          description: "We'll track your sleep time. Press the stop button when you wake up.",
        });
        return;
    }

    if (!navigator.geolocation) {
      toast({ title: "Geolocation Not Supported", description: "Your browser does not support geolocation.", variant: "destructive" });
      return;
    }
    
    setIsTracking(true);
    setTrackingActivityId(activityId);
    lastPositionRef.current = null;
    totalDistanceRef.current = 0;
    updateDisplayValue(activityId, '0.0');

    const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
    };
    
    toast({
      title: "Activity Started!",
      description: `Tracking your ${activityId}. Move to see progress.`,
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition: Coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (lastPositionRef.current) {
          const distance = haversineDistance(lastPositionRef.current, newPosition);
          const distanceInMiles = distance * 0.621371;
          totalDistanceRef.current += distanceInMiles;
          updateDisplayValue(activityId, totalDistanceRef.current.toFixed(1));
        }
        lastPositionRef.current = newPosition;
      },
      (error) => {
        toast({
          title: 'Location Error',
          description: `Could not track location: ${error.message}.`,
          variant: 'destructive',
        });
        handleStopActivity(activityId);
      },
      options
    );
  };
  
  const handleStopActivity = (activityId: Activity['id']) => {
    if (activityId === 'sleeping') {
      if (sleepStartTimeRef.current) {
        if(intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        const endTime = Date.now();
        const durationInMinutes = Math.round((endTime - sleepStartTimeRef.current) / (1000 * 60));
        
        setActivities(prev => prev.map(act => act.id === 'sleeping' ? {...act, value: (parseFloat(act.value) + durationInMinutes).toString()} : act));

        toast({
          title: "Sleep Logged!",
          description: `You logged ${durationInMinutes} minutes of sleep. Rest well!`,
        });
        sleepStartTimeRef.current = null;
        updateDisplayValue('sleeping', '00:00:00'); // Reset display timer
      }
    } else {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        
        const unit = 'miles';
        const totalValue = totalDistanceRef.current;

        setActivities(prev => prev.map(act => act.id === activityId ? {...act, value: (parseFloat(act.value) + totalValue).toFixed(1)} : act));
        
        toast({
          title: "Activity Stopped",
          description: `You logged a total of ${totalValue.toFixed(1)} ${unit}. Great job!`,
        });

        lastPositionRef.current = null;
        totalDistanceRef.current = 0;
        updateDisplayValue(activityId, '0.0');
    }

    setIsTracking(false);
    setTrackingActivityId(null);
  };

  const handleResetActivities = () => {
    if (isTracking) {
        toast({
            title: "Cannot Reset",
            description: "Please stop the current activity before resetting.",
            variant: "destructive"
        });
        return;
    }
    setActivities(initialActivityData);
    setDisplayActivities(initialDisplayData);
    toast({
      title: "Activities Reset",
      description: "Your activity progress has been reset to zero.",
    });
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Effect to sync display state when activities state changes from a reset
  useEffect(() => {
      const isReset = activities.every((act, i) => act.value === initialActivityData[i].value);
      if (isReset) {
          setDisplayActivities(initialDisplayData);
      }
  }, [activities]);

  return (
    <TooltipProvider>
    <div className="flex flex-col h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 border-b bg-background h-16">
        <h1 className="text-xl font-bold text-foreground font-heading">Activities</h1>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
                <Link href="/activities/history">
                    <History className="mr-2 h-4 w-4" />
                    Activities History
                </Link>
            </Button>
        </div>
      </div>

      <main className="flex-grow pt-16 pb-24">
        <ScrollArea className="h-full">
          <div className="container mx-auto p-4 sm:p-6 space-y-6">

            {displayActivities.map((activity) => (
              <Card
                key={activity.id}
                className={`relative overflow-hidden rounded-xl shadow-lg ${activity.cardBgClass} ${activity.textClass}`}
              >
                <div className="flex flex-row items-stretch min-h-[180px]">
                  <div className="w-1/2 p-4 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{activity.title}</h2>
                      <p className="text-3xl sm:text-4xl font-bold">{activity.value}</p>
                      <p className="text-xs sm:text-sm flex items-center mt-1">
                        {activity.id === 'sleeping' ? activity.description : `Total ${activity.title}: ${activities.find(a => a.id === activity.id)?.value || '0.0'} miles`}
                        <ChevronRight className="h-4 w-4 ml-0.5 opacity-70" />
                      </p>
                    </div>

                    {trackingActivityId === activity.id ? (
                       <Button
                          variant="ghost"
                          size="icon"
                          className={`mt-3 self-start rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-red-500/80 hover:bg-red-500`}
                          aria-label={`Stop ${activity.title}`}
                          onClick={() => handleStopActivity(activity.id)}
                        >
                           <StopCircle className={`h-5 w-5 sm:h-6 sm:w-6 text-white`} />
                        </Button>
                    ) : (
                       <Button
                          variant="ghost"
                          size="icon"
                          className={`mt-3 self-start rounded-full h-10 w-10 sm:h-12 sm:w-12 ${activity.playButtonBgClass}`}
                          aria-label={`Start ${activity.title}`}
                          onClick={() => handleStartActivity(activity.id)}
                          disabled={!!trackingActivityId}
                        >
                          <Play className={`h-5 w-5 sm:h-6 sm:w-6 ${activity.playButtonIconClass}`} />
                        </Button>
                    )}

                  </div>

                  <div className="w-1/2 relative">
                    <Image
                      src={activity.imageUrl}
                      alt={`${activity.title} activity illustration`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-r-xl"
                      data-ai-hint={activity.imageHint}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>

      <div className="absolute bottom-24 right-6 z-20">
        <AlertDialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="bg-destructive/80 hover:bg-destructive rounded-full p-2 shadow-lg w-12 h-12">
                  <Trash2 className="h-6 w-6" />
                   <span className="sr-only">Clear Progress</span>
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Clear Progress</p>
            </TooltipContent>
          </Tooltip>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all your activity progress to zero. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetActivities}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

    </div>
    </TooltipProvider>
  );
}
