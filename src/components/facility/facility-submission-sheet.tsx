
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Building, Loader2, PlusCircle } from 'lucide-react';
import { facilityTypes } from '@/lib/types'; // <-- REMOVE 'type'
import type { FacilityType } from '@/lib/types';


import { ScrollArea } from '@/components/ui/scroll-area';

// const facilityTypes: FacilityType[] = ['Hospital', 'Clinic', 'Pharmacy', 'Diagnostic Center', 'Dental Clinic', 'Optical Center', 'Gym', 'Spa', 'Specialist Center', 'Physiotherapy Clinic'];

const facilitySchema = z.object({
  name: z.string().min(3, { message: 'Facility name must be at least 3 characters.' }),
  address: z.string().min(10, { message: 'Please provide a detailed address.' }),
  type: z.enum(facilityTypes, { required_error: 'Please select a facility type.' }),
  services: z.string().min(3, { message: 'Please list at least one service.' }),
  phone: z.string().optional(),
  openingHours: z.string().optional(),
  submitterName: z.string().min(2, { message: 'Your name is required.' }),
  submitterEmail: z.string().email({ message: 'A valid email is required.' }),
});

type FacilityFormValues = z.infer<typeof facilitySchema>;

interface FacilitySubmissionSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FacilitySubmissionSheet({ isOpen, onOpenChange }: FacilitySubmissionSheetProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      name: '',
      address: '',
      services: '',
      phone: '',
      openingHours: '24/7',
      submitterName: '',
      submitterEmail: '',
    },
  });

  const onSubmit = async (data: FacilityFormValues) => {
    setIsSubmitting(true);
    console.log('Facility Submission:', data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Submission Received!',
      description: `Thank you, ${data.submitterName}. We've received the details for ${data.name} and will review it shortly.`,
    });
    
    setIsSubmitting(false);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col h-full min-h-0 overflow-hidden">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-bold text-primary flex items-center">
            <Building className="mr-3 h-6 w-6" />
            Submit a New Facility
          </SheetTitle>
          <SheetDescription>
            Help us grow our directory by adding a new health or wellness facility. Your contribution is valuable!
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0">
             <ScrollArea className="flex-grow">
                <div className="p-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., IsabiFine Wellness Clinic" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter the full street address, city, and state." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a facility type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {facilityTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services Offered</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Emergency Care, Checkups, Dental..." {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Please provide a comma-separated list of services.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 08012345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="openingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Hours (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mon-Fri 9am-5pm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="text-md font-semibold text-foreground">Your Information</h3>
                      <FormField
                        control={form.control}
                        name="submitterName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="submitterEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">We may contact you to verify the submission.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>

                </div>
            </ScrollArea>
            <SheetFooter className="p-6 pt-4 border-t bg-background shrink-0">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Submitting...' : 'Submit Facility'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
