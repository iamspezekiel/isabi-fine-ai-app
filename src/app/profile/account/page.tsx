
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, User as UserIcon, Edit3, Save, Mail, ChevronLeft, Lock, ShieldAlert, Phone, Calendar, Home, X as XIcon, Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

// Zod schemas for validation
const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say", ""]).optional(),
  address: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordSchema>;

type GenderType = "Male" | "Female" | "Other" | "Prefer not to say" | "";
// User type and creation function
type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phone?: string;
  dob?: string; // Storing as ISO string e.g., "1990-01-01"
  gender?: GenderType;
  address?: string;
};

export default function AccountPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);


  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
      phone: '',
      dob: '',
      gender: '',
      address: '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // In a real app, you'd get this from a global auth context.
    const savedUserRaw = localStorage.getItem('isabifine.user');
    const accountInfoRaw = localStorage.getItem('isabifine.accountInfo');

    if (savedUserRaw) {
      const savedUser = JSON.parse(savedUserRaw);
      let accountInfo = {};
      if(accountInfoRaw) {
        accountInfo = JSON.parse(accountInfoRaw);
      }
      
      const user: User = { ...savedUser, ...accountInfo };
      setCurrentUser(user);
      profileForm.reset({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '',
        gender: user.gender || '',
        address: user.address || '',
      });
    }
    setLoading(false);
  }, [profileForm]);
  
  const handleEditToggle = (editing: boolean) => {
    setIsEditing(editing);
    if (!editing && currentUser) {
      // If canceling, reset the form to the current user's data
      profileForm.reset({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        dob: currentUser.dob || '',
        gender: currentUser.gender || '',
        address: currentUser.address || '',
      });
    }
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsUpdatingProfile(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    if (currentUser) {
        const updatedUser: User = {
            ...currentUser,
            displayName: data.displayName,
            email: data.email,
        };
        const accountInfo = {
            phone: data.phone,
            dob: data.dob,
            gender: data.gender,
            address: data.address,
        }
        localStorage.setItem('isabifine.user', JSON.stringify(updatedUser));
        localStorage.setItem('isabifine.accountInfo', JSON.stringify(accountInfo));
        setCurrentUser({ ...updatedUser, ...accountInfo });
    }
    
    setIsEditing(false);
    
    toast({
      title: 'Profile Updated',
      description: 'Your personal information has been successfully updated.',
    });
    setIsUpdatingProfile(false);
  };
  
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsUpdatingPassword(true);
    console.log("Password change data:", data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    toast({
      title: 'Password Updated',
      description: 'Your password has been changed successfully.',
    });
    passwordForm.reset();
    setIsUpdatingPassword(false);
  };
  
  const onDeleteAccount = async () => {
    toast({
        title: "Account Deletion Requested",
        description: "Your account is now scheduled for deletion.",
        variant: "destructive"
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-center">You must be logged in to view this page.</p>
        <Button asChild variant="link" className="mt-2">
            <Link href="/profile">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Custom Header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-4 border-b bg-background h-16">
          <Button asChild variant="ghost" size="icon" className="mr-2">
              <Link href="/profile" aria-label="Go back to dashboard">
                  <ChevronLeft className="h-6 w-6" />
              </Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground font-heading">Account Information</h1>
      </div>

      <main className="flex-grow container mx-auto p-4 pt-20 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Personal Info Card */}
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary flex items-center">
                    <UserIcon className="mr-3 h-6 w-6" /> Personal Information
                  </CardTitle>
                  <CardDescription>
                    View and edit your account details. Your email is used for logging in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField control={profileForm.control} name="displayName" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} readOnly={!isEditing} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} readOnly={!isEditing} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} readOnly={!isEditing} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={profileForm.control} name="dob" render={({ field }) => (
                      <FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} readOnly={!isEditing} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={profileForm.control} name="gender" render={({ field }) => (
                    <FormItem><FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''} disabled={!isEditing}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={profileForm.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Textarea {...field} readOnly={!isEditing} rows={3} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={() => handleEditToggle(false)} disabled={isUpdatingProfile}>Cancel</Button>
                      <Button type="submit" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => handleEditToggle(true)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
          </Form>

          {/* Change Password Card */}
          <Card className="shadow-xl">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-primary flex items-center">
                    <Lock className="mr-3 h-6 w-6" /> Change Password
                  </CardTitle>
                  <CardDescription>
                    For your security, we recommend using a strong password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                    <FormItem><FormLabel>Current Password</FormLabel><FormControl><div className="relative"><Input type={showCurrentPassword ? "text" : "password"} {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                    <FormItem><FormLabel>New Password</FormLabel><FormControl><div className="relative"><Input type={showNewPassword ? "text" : "password"} {...field} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type={showNewPassword ? "text" : "password"} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isUpdatingPassword}>
                    {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          
          {/* Danger Zone Card */}
          <Card className="shadow-xl border-destructive/50">
             <CardHeader>
                <CardTitle className="text-2xl font-bold text-destructive flex items-center">
                  <ShieldAlert className="mr-3 h-6 w-6" /> Danger Zone
                </CardTitle>
                 <CardDescription>
                  These actions are permanent and cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">Delete My Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is irreversible. It will permanently delete your account and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onDeleteAccount}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
