'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePaystackPayment } from 'react-paystack';
import type { PaystackProps } from 'react-paystack/dist/types';
import { ChevronLeft, Gift } from 'lucide-react';
import Link from 'next/link';

const currentUser = {
  email: 'demo.user@isabifine.ai',
  name: 'Demo User',
};

const donationAmounts = [1000, 2500, 5000, 10000];

export default function DonatePage() {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const { toast } = useToast();

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setAmount(value);
  };

  const finalAmount = Number(amount) * 100; // Convert to Kobo

  const config: PaystackProps = {
    reference: new Date().getTime().toString(),
    email: currentUser.email,
    amount: finalAmount, 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      name: currentUser.name,
      type: 'Donation',
      custom_fields: []

    },
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    console.log('Paystack success reference:', reference);
    toast({
      title: 'Thank You!',
      description: `Your donation of ₦${amount} was successful. We appreciate your support.`,
    });
    setAmount('');
    setCustomAmount('');
  };

  const onClose = () => {
    toast({
      title: 'Payment Closed',
      description: 'You closed the payment window.',
      variant: 'default',
    });
  };

  const handleDonateClick = () => {
    if (!config.publicKey) {
      toast({
        title: 'Configuration Error',
        description: 'The payment gateway is not configured. Please add your Paystack public key.',
        variant: 'destructive',
      });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please select or enter a valid donation amount.',
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
        <h1 className="text-xl font-bold text-foreground font-heading">Donate to IsabiFine AI</h1>
      </div>

      <main className="flex-grow container mx-auto p-4 pt-20 pb-20 flex justify-center items-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
              <Gift className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-heading">Support Our Cause</CardTitle>
            <CardDescription>
              Your generous contribution helps us maintain and improve our services, providing vital health information to communities across Nigeria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Select an amount (NGN)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {donationAmounts.map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    variant={amount === presetAmount.toString() ? 'default' : 'outline'}
                    onClick={() => handleAmountSelect(presetAmount)}
                  >
                    ₦{presetAmount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
            </div>

            <div>
              <Label htmlFor="custom-amount">Enter a custom amount (NGN)</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="e.g., 3000"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="mt-2 text-lg font-semibold"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full h-12 text-lg bg-primary hover:bg-primary/90" onClick={handleDonateClick} disabled={!amount || Number(amount) <= 0}>
              Donate {Number(amount) > 0 ? `₦${Number(amount).toLocaleString()}` : ''}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
