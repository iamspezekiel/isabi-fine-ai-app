
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { usePaystackPayment } from 'react-paystack';
import type { PaystackProps } from 'react-paystack/dist/types';
import { Wallet as WalletIcon, PlusCircle, MinusCircle, DollarSign, Loader2, ChevronLeft, Download, Upload, History, Copy, Banknote, ShieldAlert, KeyRound, Send } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Currency = 'USDC' | 'NGN';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
  currency: Currency;
  details?: string;
}

interface WalletData {
    balances: { usdc: number; ngn: number };
    transactions: Transaction[];
    seedPhrase: string;
}

const nigerianBanks = [
    'Access Bank',
    'Fidelity Bank',
    'First Bank of Nigeria',
    'First City Monument Bank (FCMB)',
    'Guaranty Trust Bank (GTB)',
    'Kuda Bank',
    'Opay',
    'Palmpay',
    'Polaris Bank',
    'Stanbic IBTC Bank',
    'Sterling Bank',
    'United Bank for Africa (UBA)',
    'Union Bank of Nigeria',
    'Wema Bank',
    'Zenith Bank',
];

const currentUser = {
  email: 'demo.user@isabifine.ai',
  name: 'Demo User',
  solanaAddress: 'So11111111111111111111111111111111111111112',
  virtualAccount: {
    accountNumber: '9988776655',
    bankName: 'Providus Bank',
    accountName: 'IsabiFine - Demo User',
  },
};

// word list for seed phrase generation
const wordlist = [
  'apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew',
  'kiwi', 'lemon', 'mango', 'nectarine', 'orange', 'papaya', 'quince', 'raspberry',
  'strawberry', 'tangerine', 'ugli', 'vanilla', 'watermelon', 'xigua', 'yuzu', 'zucchini',
  'act', 'add', 'age', 'air', 'all', 'amp', 'and', 'ant', 'any', 'ape', 'apt', 'arc', 'are',
  'ark', 'arm', 'art', 'ash', 'ask', 'auk', 'awe', 'axe', 'aye', 'bad', 'bag', 'ban', 'bat',
  'bed', 'bee', 'beg', 'bet', 'bid', 'big', 'bin', 'bit', 'boa', 'bob', 'bog', 'bon', 'boo',
  'bow', 'box', 'boy', 'bud', 'bug', 'bum', 'bun', 'bus', 'but', 'buy', 'bye', 'cab', 'cad',
  'cam', 'can', 'cap', 'car', 'cat', 'caw', 'chi', 'cod', 'cog', 'con', 'coo', 'cop', 'cot'
];

// Generates a 12-word seed phrase
const generateSeedPhrase = () => [...Array(12)].map(() => wordlist[Math.floor(Math.random() * wordlist.length)]).join(' ');


export default function WalletPage() {
  const [balances, setBalances] = useState<{ usdc: number; ngn: number }>({ usdc: 25.50, ngn: 15000.00 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USDC');
  
  const [withdrawalBank, setWithdrawalBank] = useState('');
  const [withdrawalAccount, setWithdrawalAccount] = useState('');
  const [withdrawalAddress, setWithdrawalAddress] = useState('');

  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [restoreSeedPhrase, setRestoreSeedPhrase] = useState('');
  const [currentSeedPhrase, setCurrentSeedPhrase] = useState('');

  const [isPasscodeDialogOpen, setIsPasscodeDialogOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  // New state for page-level wallet lock
  const [isWalletUnlocked, setIsWalletUnlocked] = useState(false);
  const [pageLoadPasscode, setPageLoadPasscode] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  
  const PASSCODE = '1234';

  const { toast } = useToast();
  
  const finalAmountNGN = Number(amount) * 100; // Paystack amount is in Kobo
  const paystackConfig: PaystackProps = {
    reference: new Date().getTime().toString(),
    email: currentUser.email,
    amount: finalAmountNGN, 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    metadata: {
      name: currentUser.name,
      type: 'NGN Deposit',
      custom_fields: [],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const loadWalletData = () => {
    const savedDataRaw = localStorage.getItem('walletData');
    if (savedDataRaw) {
      try {
        const savedData: WalletData = JSON.parse(savedDataRaw);
        setBalances(savedData.balances);
        setTransactions(savedData.transactions);
        setCurrentSeedPhrase(savedData.seedPhrase);
      } catch (e) {
        console.error("Could not parse saved wallet data, resetting.", e);
        resetAndSaveWallet();
      }
    } else {
      resetAndSaveWallet();
    }
  };
  
  const resetAndSaveWallet = () => {
    const newSeed = generateSeedPhrase();
    const initialData: WalletData = {
      balances: { usdc: 25.50, ngn: 15000.00 },
      transactions: [],
      seedPhrase: newSeed
    };
    localStorage.setItem('walletData', JSON.stringify(initialData));
    setBalances(initialData.balances);
    setTransactions(initialData.transactions);
    setCurrentSeedPhrase(initialData.seedPhrase);
  };
  
  useEffect(() => {
    setIsClient(true);
    loadWalletData();
  }, []);
  
  useEffect(() => {
    if (isClient) {
      const dataToSave: WalletData = { balances, transactions, seedPhrase: currentSeedPhrase };
      localStorage.setItem('walletData', JSON.stringify(dataToSave));
    }
  }, [balances, transactions, currentSeedPhrase, isClient]);
  
  const copyToClipboard = (text: string, subject: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: `${subject} Copied!`,
        description: `${subject} has been copied to your clipboard.`,
      });
    }, () => {
      toast({
        title: `Failed to Copy ${subject}`,
        description: `Could not copy to clipboard.`,
        variant: 'destructive',
      });
    });
  };

  const executeTransaction = (type: 'deposit' | 'withdrawal', transactionCurrency?: Currency) => {
    const currency = transactionCurrency || selectedCurrency;
    const numericAmount = parseFloat(amount);
    
    if (type === 'deposit') {
      // No validation needed beyond what's done before calling this
    } else { // Withdrawal
      if (currency === 'NGN' && (!withdrawalBank || !withdrawalAccount)) {
        toast({ title: "Missing Information", description: "Please select a bank and enter an account number.", variant: "destructive" });
        return;
      }
      if (currency === 'USDC' && !withdrawalAddress.trim()) {
        toast({ title: "Missing Information", description: "Please enter a recipient Solana address.", variant: "destructive" });
        return;
      }
      const currentBalance = currency === 'USDC' ? balances.usdc : balances.ngn;
      if (numericAmount > currentBalance) {
        toast({ title: "Insufficient Funds", description: "You cannot withdraw more than your current balance.", variant: "destructive" });
        return;
      }
    }
    
    setIsLoading(true);

    setTimeout(() => {
      let txDetails: string | undefined;
      if (type === 'withdrawal') {
          if (currency === 'NGN') {
              txDetails = `to ${withdrawalBank} - ${withdrawalAccount}`;
          } else { // USDC
              txDetails = `to ${withdrawalAddress.substring(0,6)}...${withdrawalAddress.substring(withdrawalAddress.length - 4)}`;
          }
      }

      const newTransaction: Transaction = {
        id: new Date().toISOString(),
        type,
        amount: numericAmount,
        date: new Date().toLocaleString(),
        status: 'Completed',
        currency,
        details: txDetails,
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      const balanceKey = currency.toLowerCase() as keyof typeof balances;

      if (type === 'deposit') {
        setBalances(prev => ({ ...prev, [balanceKey]: prev[balanceKey] + numericAmount }));
        toast({ title: "Deposit Successful", description: `${numericAmount.toFixed(2)} ${currency} has been added to your wallet.` });
      } else {
        setBalances(prev => ({ ...prev, [balanceKey]: prev[balanceKey] - numericAmount }));
        toast({ title: "Withdrawal Successful", description: `${numericAmount.toFixed(2)} ${currency} has been withdrawn.` });
      }

      setAmount('');
      setWithdrawalBank('');
      setWithdrawalAccount('');
      setWithdrawalAddress('');
      setIsLoading(false);
      setIsDepositOpen(false);
      setIsWithdrawOpen(false);
    }, 1500);
  };
  
  const handleTransaction = (type: 'deposit' | 'withdrawal', transactionCurrency?: Currency) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive" });
      return;
    }
    
    const action = () => executeTransaction(type, transactionCurrency);
    
    if(type === 'withdrawal') {
        setPendingAction(() => action);
        setIsPasscodeDialogOpen(true);
    } else {
        action();
    }
  };

  const executeTransfer = () => {
    const currency = selectedCurrency;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive" });
        return;
    }
    if (!transferRecipient.trim() || !transferRecipient.includes('@')) {
        toast({ title: "Invalid Recipient", description: "Please enter a valid recipient email.", variant: "destructive" });
        return;
    }
    const currentBalance = currency === 'USDC' ? balances.usdc : balances.ngn;
    if (numericAmount > currentBalance) {
        toast({ title: "Insufficient Funds", description: "You cannot transfer more than your current balance.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);

    setTimeout(() => {
        const txDetails = `Transfer to ${transferRecipient}`;
        
        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            type: 'withdrawal',
            amount: numericAmount,
            date: new Date().toLocaleString(),
            status: 'Completed',
            currency,
            details: txDetails + (transferNote ? ` (Note: ${transferNote})` : ''),
        };

        setTransactions(prev => [newTransaction, ...prev]);

        const balanceKey = currency.toLowerCase() as keyof typeof balances;
        setBalances(prev => ({ ...prev, [balanceKey]: prev[balanceKey] - numericAmount }));
        
        toast({ title: "Transfer Successful", description: `${numericAmount.toFixed(2)} ${currency} sent to ${transferRecipient}.` });

        setAmount('');
        setTransferRecipient('');
        setTransferNote('');
        setIsLoading(false);
        setIsTransferOpen(false);
    }, 1500);
  };

  const handleTransfer = () => {
     const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        toast({ title: "Invalid Amount", description: "Please enter a positive number.", variant: "destructive" });
        return;
    }
    if (!transferRecipient.trim() || !transferRecipient.includes('@')) {
        toast({ title: "Invalid Recipient", description: "Please enter a valid recipient email.", variant: "destructive" });
        return;
    }

    const action = () => executeTransfer();
    setPendingAction(() => action);
    setIsPasscodeDialogOpen(true);
  };

  const handlePasscodeConfirm = () => {
    if (passcode === PASSCODE) {
      toast({
        title: 'Passcode Accepted',
        description: 'Your transaction will now proceed.',
      });
      setIsPasscodeDialogOpen(false);
      pendingAction?.(); // Execute the stored action
    } else {
      toast({
        title: 'Incorrect Passcode',
        description: 'The passcode you entered is incorrect. Please try again.',
        variant: 'destructive',
      });
    }
    setPasscode('');
    setPendingAction(null);
  };


  const onPaystackSuccess = (reference: any) => {
    const numericAmount = parseFloat(amount);
    const newTransaction: Transaction = {
        id: new Date().toISOString(),
        type: 'deposit',
        amount: numericAmount,
        date: new Date().toLocaleString(),
        status: 'Completed',
        currency: 'NGN',
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setBalances(prev => ({...prev, ngn: prev.ngn + numericAmount }));

    toast({
      title: 'Payment Successful!',
      description: `Your deposit of ₦${numericAmount.toLocaleString()} was successful.`,
    });
    setAmount('');
    setIsDepositOpen(false);
  };

  const onPaystackClose = () => {
    toast({
      title: 'Payment Closed',
      description: 'You closed the payment window.',
      variant: 'default',
    });
  };

  const handleFundWithPaystack = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a positive number to fund.", variant: "destructive" });
      return;
    }
    if (!paystackConfig.publicKey) {
      toast({
        title: 'Configuration Error',
        description: 'The payment gateway is not configured. Please add your Paystack public key.',
        variant: 'destructive',
      });
      return;
    }
    initializePayment({onSuccess: onPaystackSuccess, onClose: onPaystackClose});
  };

  const handleRestore = () => {
    const words = restoreSeedPhrase.trim().split(/\s+/);
    if (words.length !== 12) {
        toast({
            title: "Invalid Recovery Phrase",
            description: "Please enter your 12-word recovery phrase, separated by spaces.",
            variant: "destructive"
        });
        return;
    }

    // Simulate restoring wallet data
    const restoredData: WalletData = {
        balances: { usdc: parseFloat((Math.random() * 500).toFixed(2)), ngn: balances.ngn }, // Keep NGN balance
        transactions: [], // Clear old txs
        seedPhrase: restoreSeedPhrase.trim()
    };

    localStorage.setItem('walletData', JSON.stringify(restoredData));
    setBalances(restoredData.balances);
    setTransactions(restoredData.transactions);
    setCurrentSeedPhrase(restoredData.seedPhrase);

    toast({
        title: "Wallet Restored",
        description: "Your USDC wallet has been restored using the provided recovery phrase.",
    });
    
    setRestoreSeedPhrase('');
    setIsRestoreOpen(false);
  };

  const handleUnlockWallet = () => {
    setUnlockLoading(true);
    setTimeout(() => {
        if (pageLoadPasscode === PASSCODE) {
            setIsWalletUnlocked(true);
            toast({ title: "Wallet Unlocked", description: "Welcome to your emergency wallet." });
        } else {
            toast({ title: "Incorrect Passcode", description: "Please try again.", variant: "destructive" });
            setPageLoadPasscode('');
        }
        setUnlockLoading(false);
    }, 500);
  };
  
  const currentBalance = selectedCurrency === 'USDC' ? balances.usdc : balances.ngn;
  const filteredTransactions = transactions.filter(tx => tx.currency === selectedCurrency);
  
  const handleOpenChange = (setter: React.Dispatch<React.SetStateAction<boolean>>) => (open: boolean) => {
    setter(open);
    if (!open) {
        setAmount('');
        setWithdrawalBank('');
        setWithdrawalAccount('');
        setWithdrawalAddress('');
        setTransferRecipient('');
        setTransferNote('');
    }
  };

  if (!isClient) {
    return (
        <div className="flex flex-col h-screen bg-background">
            <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 border-b bg-background h-16">
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="icon" className="mr-2">
                        <Link href="/profile" aria-label="Go back to profile">
                            <ChevronLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold text-foreground font-heading">Emergency Wallet</h1>
                </div>
            </div>
            <main className="flex-grow pt-16 pb-16 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </main>
        </div>
    );
  }

  if (!isWalletUnlocked) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-4 border-b bg-background h-16">
                 <Button asChild variant="ghost" size="icon" className="mr-2">
                    <Link href="/profile" aria-label="Go back to profile">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold text-foreground font-heading">Wallet Locked</h1>
            </div>
            <main className="flex-grow flex justify-center items-center p-4">
                <Card className="w-full max-w-sm shadow-xl animate-in fade-in-0 zoom-in-95">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                            <KeyRound className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-heading">Enter Your Passcode</CardTitle>
                        <CardDescription>
                            Unlock your wallet to view balances and make transactions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Input
                            type="password"
                            maxLength={4}
                            value={pageLoadPasscode}
                            onChange={(e) => setPageLoadPasscode(e.target.value.replace(/\D/g, ''))}
                            className="w-40 mx-auto text-center text-3xl tracking-[1.5rem] bg-input"
                            placeholder="----"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleUnlockWallet(); }}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full h-11" onClick={handleUnlockWallet} disabled={pageLoadPasscode.length !== 4 || unlockLoading}>
                            {unlockLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WalletIcon className="mr-2 h-4 w-4" />}
                            {unlockLoading ? 'Unlocking...' : 'Unlock Wallet'}
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
  }

  return (
    <>
    <div className="flex flex-col h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 border-b bg-background h-16">
            <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="icon" className="mr-2">
                    <Link href="/profile" aria-label="Go back to profile">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold text-foreground font-heading">Emergency Wallet</h1>
            </div>

            {selectedCurrency === 'USDC' && (
                <div className="flex items-center gap-2">
                    <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-3">
                                <Download className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Backup</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2"><ShieldAlert className="h-6 w-6 text-destructive" /> Secure Your Recovery Phrase</DialogTitle>
                                <DialogDescription>
                                    Your 12-word recovery phrase provides full access to your wallet. Keep it safe and never share it with anyone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <Label>Your Recovery Phrase</Label>
                                <div className="grid grid-cols-3 gap-2 p-4 rounded-lg border bg-input/50">
                                {currentSeedPhrase && currentSeedPhrase.split(' ').map((word, index) => (
                                    <div key={index} className="text-sm font-mono flex items-baseline">
                                        <span className="text-muted-foreground mr-2 w-6 text-right">{index + 1}.</span>
                                        <span className="text-foreground font-medium">{word}</span>
                                    </div>
                                ))}
                                </div>
                                <Button variant="outline" className="w-full" onClick={() => copyToClipboard(currentSeedPhrase, 'Recovery Phrase')}>
                                    <Copy className="mr-2 h-4 w-4" /> Copy Phrase
                                </Button>
                                <p className="text-xs text-muted-foreground">Store this phrase in a secure, offline location.</p>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setIsBackupOpen(false)}>I've Backed It Up</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-3">
                                <Upload className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Restore</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Restore Wallet</DialogTitle>
                                <DialogDescription>
                                    Enter your 12-word recovery phrase to restore your wallet. This will replace your current wallet data.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2 py-4">
                                <Label htmlFor="restoreKey">Enter Recovery Phrase</Label>
                                <Textarea id="restoreKey" value={restoreSeedPhrase} onChange={(e) => setRestoreSeedPhrase(e.target.value)} placeholder="Enter your 12 words separated by spaces..." className="bg-input" rows={3} />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsRestoreOpen(false)}>Cancel</Button>
                                <Button onClick={handleRestore}>Restore Wallet</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )}
        </div>

        <main className="flex-grow pt-16 pb-16">
            <ScrollArea className="h-full">
                <div className="container mx-auto p-4 sm:p-6 space-y-6">
                    <Tabs value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as Currency)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="USDC">USDC Wallet</TabsTrigger>
                            <TabsTrigger value="NGN">NGN Wallet</TabsTrigger>
                        </TabsList>
                        
                        <div className="mt-6">
                            <Card className="shadow-lg bg-primary text-primary-foreground">
                                <CardHeader>
                                    <CardDescription className="text-primary-foreground/80 flex items-center">
                                        <WalletIcon className="mr-2 h-4 w-4" /> Current {selectedCurrency} Balance
                                    </CardDescription>
                                    <CardTitle className="text-4xl sm:text-5xl font-bold">
                                        {isClient ? (selectedCurrency === 'NGN' ? `₦${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`) : '0.00'}
                                        <span className="text-2xl sm:text-3xl ml-2 font-medium">{selectedCurrency}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardFooter className="flex gap-2 sm:gap-3">
                                    <Dialog open={isDepositOpen} onOpenChange={handleOpenChange(setIsDepositOpen)}>
                                        <DialogTrigger asChild>
                                            <Button variant="secondary" className="flex-1">
                                                <PlusCircle className="mr-2 h-4 w-4" /> Deposit
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Deposit {selectedCurrency}</DialogTitle>
                                                <DialogDescription>
                                                    {selectedCurrency === 'USDC' 
                                                        ? "Send USDC on the Solana network to your address below. For demonstration, you can enter an amount to add."
                                                        : "Choose a method to fund your NGN wallet."
                                                    }
                                                </DialogDescription>
                                            </DialogHeader>

                                            {selectedCurrency === 'USDC' ? (
                                                <>
                                                    <div className="space-y-2 py-4">
                                                        <Label htmlFor="usdc-deposit-address">Your Solana Wallet Address</Label>
                                                        <div className="relative">
                                                            <Input 
                                                                id="usdc-deposit-address"
                                                                type="text" 
                                                                value={currentUser.solanaAddress}
                                                                readOnly
                                                                className="pr-10 bg-input"
                                                            />
                                                            <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => copyToClipboard(currentUser.solanaAddress, 'Address')}>
                                                                <Copy className="h-4 w-4"/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 pb-4">
                                                        <Label htmlFor="deposit-amount">Amount ({selectedCurrency})</Label>
                                                        <div className="relative">
                                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                            <Input id="deposit-amount" type="number" placeholder="e.g., 50.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10" />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="outline" onClick={() => setIsDepositOpen(false)} disabled={isLoading}>Cancel</Button>
                                                        <Button onClick={() => handleTransaction('deposit', 'USDC')} disabled={isLoading}>
                                                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                                            {isLoading ? 'Processing...' : 'Confirm Deposit'}
                                                        </Button>
                                                    </DialogFooter>
                                                </>
                                            ) : (
                                                <Tabs defaultValue="transfer" className="w-full pt-4">
                                                     <TabsList className="grid w-full grid-cols-2">
                                                        <TabsTrigger value="transfer">Bank Transfer</TabsTrigger>
                                                        <TabsTrigger value="card">Card / Other</TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="card">
                                                        <Card className="border-none shadow-none">
                                                            <CardHeader className="px-1 pt-4">
                                                                <Label htmlFor="deposit-amount-card">Amount (NGN)</Label>
                                                            </CardHeader>
                                                            <CardContent className="space-y-2 px-1">
                                                                <div className="relative">
                                                                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                    <Input id="deposit-amount-card" type="number" placeholder="e.g., 5000" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10" />
                                                                </div>
                                                            </CardContent>
                                                            <CardFooter className="px-1 pb-1">
                                                                <Button onClick={handleFundWithPaystack} disabled={!amount || Number(amount) <= 0 || isLoading} className="w-full">
                                                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                                                    Fund with Paystack
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    </TabsContent>
                                                    <TabsContent value="transfer">
                                                        <Card className="border-none shadow-none">
                                                            <CardHeader className="px-1 pt-4">
                                                                <CardDescription>Transfer any amount to the account below. Your wallet will be credited automatically.</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3 px-1 text-sm">
                                                                <div className="bg-input/50 rounded-lg p-3 space-y-2 border">
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-muted-foreground">Bank Name</span>
                                                                        <span className="font-semibold">{currentUser.virtualAccount.bankName}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-muted-foreground">Account Name</span>
                                                                        <span className="font-semibold">{currentUser.virtualAccount.accountName}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-muted-foreground">Account Number</span>
                                                                        <div className="flex items-center gap-1">
                                                                            <span className="font-semibold">{currentUser.virtualAccount.accountNumber}</span>
                                                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(currentUser.virtualAccount.accountNumber, 'Account Number')}><Copy className="h-4 w-4" /></Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2 pt-2">
                                                                    <Label htmlFor="deposit-amount-transfer">Amount Transferred</Label>
                                                                    <div className="relative">
                                                                        <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                        <Input id="deposit-amount-transfer" type="number" placeholder="Enter amount transferred" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-10" />
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                             <CardFooter className="px-1 pb-1">
                                                                <Button onClick={() => handleTransaction('deposit', 'NGN')} disabled={!amount || Number(amount) <= 0 || isLoading} className="w-full">
                                                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                                                    I've made the transfer
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    </TabsContent>
                                                </Tabs>
                                            )}
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={isTransferOpen} onOpenChange={handleOpenChange(setIsTransferOpen)}>
                                        <DialogTrigger asChild>
                                            <Button variant="secondary" className="flex-1">
                                                <Send className="mr-2 h-4 w-4" /> Send
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Send {selectedCurrency} to another user</DialogTitle>
                                                <DialogDescription>
                                                    Transfers are instant and free between IsabiFine AI users.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="transfer-recipient">Recipient's Email</Label>
                                                    <Input 
                                                        id="transfer-recipient"
                                                        type="email"
                                                        placeholder="user@example.com"
                                                        value={transferRecipient}
                                                        onChange={(e) => setTransferRecipient(e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="transfer-amount">Amount ({selectedCurrency})</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input 
                                                            id="transfer-amount"
                                                            type="number" 
                                                            placeholder="e.g., 10.00"
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="transfer-note">Note (Optional)</Label>
                                                    <Textarea 
                                                        id="transfer-note"
                                                        placeholder="e.g., For lunch"
                                                        value={transferNote}
                                                        onChange={(e) => setTransferNote(e.target.value)}
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsTransferOpen(false)} disabled={isLoading}>Cancel</Button>
                                                <Button onClick={handleTransfer} disabled={isLoading}>
                                                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                                    {isLoading ? 'Sending...' : 'Send Money'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>


                                    <Dialog open={isWithdrawOpen} onOpenChange={handleOpenChange(setIsWithdrawOpen)}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="flex-1 bg-background text-destructive border-destructive/30 hover:bg-destructive/5 hover:border-destructive/50">
                                                <MinusCircle className="mr-2 h-4 w-4" /> Withdraw
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Withdraw {selectedCurrency}</DialogTitle>
                                                <DialogDescription>
                                                    {selectedCurrency === 'USDC' 
                                                      ? "Enter the recipient's Solana address and amount to withdraw."
                                                      : "Enter the details for your Nigerian bank account withdrawal."
                                                    }
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                {selectedCurrency === 'NGN' ? (
                                                    <>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="withdrawal-bank">Bank</Label>
                                                            <Select value={withdrawalBank} onValueChange={setWithdrawalBank}>
                                                                <SelectTrigger id="withdrawal-bank">
                                                                    <SelectValue placeholder="Select a bank" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {nigerianBanks.map(bank => (
                                                                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="withdrawal-account">Account Number</Label>
                                                            <Input 
                                                                id="withdrawal-account"
                                                                type="text"
                                                                inputMode="numeric" 
                                                                pattern="\d*"
                                                                placeholder="0123456789"
                                                                value={withdrawalAccount}
                                                                onChange={(e) => setWithdrawalAccount(e.target.value)}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <Label htmlFor="withdrawal-address">Recipient Solana Address</Label>
                                                        <Input 
                                                            id="withdrawal-address"
                                                            type="text"
                                                            placeholder="Enter Solana wallet address"
                                                            value={withdrawalAddress}
                                                            onChange={(e) => setWithdrawalAddress(e.target.value)}
                                                        />
                                                    </div>
                                                )}

                                                <div className="space-y-2">
                                                    <Label htmlFor="withdraw-amount">Amount ({selectedCurrency})</Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input 
                                                            id="withdraw-amount"
                                                            type="number" 
                                                            placeholder="e.g., 20.00"
                                                            value={amount}
                                                            onChange={(e) => setAmount(e.target.value)}
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsWithdrawOpen(false)} disabled={isLoading}>Cancel</Button>

                                                <Button variant="destructive" onClick={() => handleTransaction('withdrawal')} disabled={isLoading}>
                                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    {isLoading ? 'Processing...' : 'Confirm Withdrawal'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>

                            <Card className="shadow-lg mt-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <History className="mr-2 h-5 w-5 text-primary"/>
                                        {selectedCurrency} Transaction History
                                    </CardTitle>
                                    <CardDescription>View your recent {selectedCurrency} deposits and withdrawals.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {filteredTransactions.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8">
                                            <p>No transactions yet for {selectedCurrency}.</p>
                                            <p className="text-sm">Make a deposit to get started.</p>
                                        </div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {filteredTransactions.map(tx => (
                                                <li key={tx.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center">
                                                        <div className={`mr-4 p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                                            {tx.type === 'deposit' ? 
                                                                <PlusCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> : 
                                                                <MinusCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold capitalize">{tx.type}
                                                            {tx.details && <span className="text-xs text-muted-foreground font-normal ml-1">({tx.details})</span>}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`text-right font-semibold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {tx.type === 'deposit' ? '+' : '-'}{tx.currency === 'NGN' ? '₦' : '$'}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tx.currency}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </Tabs>
                </div>
            </ScrollArea>
        </main>
    </div>
    <AlertDialog open={isPasscodeDialogOpen} onOpenChange={setIsPasscodeDialogOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Enter Passcode</AlertDialogTitle>
            <AlertDialogDescription>
            For your security, please enter your 4-digit passcode to authorize this transaction.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
            <Input
            type="password"
            maxLength={4}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
            className="w-32 text-center text-2xl tracking-[1.5rem] bg-input"
            placeholder="----"
            />
        </div>
        <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasscodeConfirm} disabled={passcode.length !== 4}>
            Confirm
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
