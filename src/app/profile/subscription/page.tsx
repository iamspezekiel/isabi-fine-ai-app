'use client';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePaystackPayment } from 'react-paystack';
import type { PaystackProps } from 'react-paystack/dist/types';
import { useEmergencyHandler } from '@/hooks/use-emergency-handler';
import { EmergencyDialog } from '@/components/emergency/emergency-dialog';
import Link from 'next/link';

// In a real application, you would get the current user's data
// from your authentication context or state management.
const currentUser = {
  email: 'demo.user@isabifine.ai',
  name: 'Demo User',
};

// Premium plan details
const premiumPlan = {
  amount: 250000, // Amount in Kobo (2500 NGN)
  name: 'Premium Plan',
};


export default function SubscriptionPage() {
  const { toast } = useToast();
  const { handleEmergencyClick, emergencyDialogProps } = useEmergencyHandler();

  const config: PaystackProps = {
    reference: new Date().getTime().toString(),
    email: currentUser.email,
    amount: premiumPlan.amount,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      name: currentUser.name,
      plan: premiumPlan.name,
      custom_fields:[],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    console.log('Paystack success reference:', reference);
    toast({
      title: 'Payment Successful!',
      description: 'Your upgrade to the Premium Plan is complete. Welcome!',
    });
    // In a real app, you would now call your backend to verify the transaction
    // and update the user's subscription status in your database.
  };

  const onClose = () => {
    toast({
      title: 'Payment Closed',
      description: 'You closed the payment window. Your plan was not upgraded.',
      variant: 'default',
    });
  };

  const handleUpgradeClick = () => {
    if (!config.publicKey) {
      toast({
        title: 'Configuration Error',
        description: 'The payment gateway is not configured. Please add your Paystack public key.',
        variant: 'destructive',
      });
      return;
    }
    initializePayment({onSuccess, onClose});
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-4 border-b bg-background h-16">
        <Button asChild variant="ghost" size="icon" className="mr-2">
            <Link href="/profile" aria-label="Go back to dashboard">
                <ChevronLeft className="h-6 w-6" />
            </Link>
        </Button>
        <h1 className="text-xl font-bold text-foreground font-heading">Subscription</h1>
      </div>

      <main className="flex-grow container mx-auto p-4 pt-20 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary mb-2 font-heading">Our Subscription Plans</h1>
            <p className="text-lg text-foreground">
              Choose the plan that's right for you and unlock more features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Basic Plan */}
            <Card className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-heading">Basic Plan</CardTitle>
                <CardDescription>Perfect for getting started.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold font-heading">
                  Free
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>Find nearby facilities</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>Basic AI health chat</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>Read health news</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled>
                  Your Current Plan
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="shadow-xl border-2 border-primary relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
               <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
               </div>
              <CardHeader className="pt-10">
                <CardTitle className="text-2xl font-heading">Premium Plan</CardTitle>
                <CardDescription>Unlock the full power of IsabiFine AI.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold font-heading">
                  ₦2,500 <span className="text-lg font-normal text-muted-foreground">/ month</span>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                   <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span className="font-semibold text-foreground">Everything in Basic, plus:</span>
                  </li>
                   <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>Advanced AI symptom checker</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>Personalized health tips & plans</span>
                  </li>
                   <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>Activity tracking & goals</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleUpgradeClick}>
                  Upgrade to Premium
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <EmergencyDialog {...emergencyDialogProps} />
    </div>
  );
}
