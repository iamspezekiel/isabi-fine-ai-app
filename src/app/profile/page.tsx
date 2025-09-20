
'use client';

import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, LogOut, Edit3, Save, Mail, Lock, Eye, EyeOff, AlertTriangle, CreditCard, Settings as SettingsIcon, Loader2, MapPin, Wallet, Shield, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import { useEmergencyHandler } from '@/hooks/use-emergency-handler';
import { EmergencyDialog } from '@/components/emergency/emergency-dialog';
import { useTranslation } from '@/components/layout/language-provider';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};

const createUser = (details: { email: string; displayName: string; photoURL?: string }): User => {
  return {
    email: details.email,
    displayName: details.displayName,
    photoURL: details.photoURL || `https://placehold.co/100x100.png?text=${details.displayName?.[0]?.toUpperCase() || 'U'}`,
    uid: `user-${Date.now()}`,
  };
};

export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false);
  const [showConfirmPasswordSignUp, setShowConfirmPasswordSignUp] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);

  const [isSignUpView, setIsSignUpView] = useState(false);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);

  const { toast } = useToast();
  const { handleEmergencyClick, emergencyDialogProps } = useEmergencyHandler();
  const { t } = useTranslation();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('isabifine.user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const handleSignUp = async (data: SignUpFormValues) => {
    setAuthError(null);
    setIsSigningUp(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser = createUser({
        email: data.email,
        displayName: `${data.firstName} ${data.lastName}`,
      });
      
      setCurrentUser(newUser);
      localStorage.setItem('isabifine.user', JSON.stringify(newUser));
      toast({ title: "Account Created", description: "You have successfully signed up!" });
      setIsSignUpView(false);
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: "Sign Up Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleLogin = async (data: LoginFormValues) => {
    setAuthError(null);
    setIsLoggingIn(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = createUser({
        email: data.email,
        displayName: 'Demo User',
      });
      setCurrentUser(user);
      localStorage.setItem('isabifine.user', JSON.stringify(user));
      toast({ title: "Logged In", description: "Welcome back!" });
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: "Login Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleSigningIn(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const user = createUser({
        email: 'demo.user@google.com',
        displayName: 'Google User',
        photoURL: `https://placehold.co/100x100.png?text=G`,
      });
      setCurrentUser(user);
      localStorage.setItem('isabifine.user', JSON.stringify(user));
      toast({ title: "Logged In with Google", description: "Welcome!" });
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: "Google Sign-In Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentUser(null);
      localStorage.removeItem('isabifine.user');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: "Logout Error", description: error.message, variant: "destructive" });
    }
  };

  const handleForgotPasswordClick = () => {
    setIsSignUpView(false);
    setIsForgotPasswordView(true);
    setAuthError(null);
    forgotPasswordForm.reset();
  };

  const handleSendResetLink = async (data: ForgotPasswordFormValues) => {
    setAuthError(null);
    setIsSendingResetLink(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Password Reset Link Sent",
        description: `If an account with ${data.email} exists, you will receive a reset link.`,
      });
      setIsForgotPasswordView(false); // Go back to login
    } catch (error: any) {
      setAuthError(error.message);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const toggleAuthView = (showSignUp: boolean) => {
    setIsSignUpView(showSignUp);
    setIsForgotPasswordView(false);
    setAuthError(null);
    loginForm.reset();
    signUpForm.reset();
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header onEmergencyClick={handleEmergencyClick} />
        <main className="flex-grow container mx-auto p-4 pt-20 pb-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  // Logged-out views
  if (!currentUser) {
    if (isForgotPasswordView) {
      return (
        <div className="flex flex-col min-h-screen">
          <Header onEmergencyClick={handleEmergencyClick} />
          <main className="flex-grow container mx-auto p-4 pt-20 pb-20 flex justify-center items-center">
            <Card className="w-full max-w-md shadow-xl animate-in fade-in-0 zoom-in-95">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-heading">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email to receive a password reset link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{authError}</AlertDescription>
                  </Alert>
                )}
                <Form {...forgotPasswordForm}>
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleSendResetLink)} className="space-y-4">
                    <FormField
                      control={forgotPasswordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="email" placeholder="you@example.com" {...field} className="bg-input pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSendingResetLink}>
                      {isSendingResetLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSendingResetLink ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="justify-center py-4">
                <Button variant="link" onClick={() => setIsForgotPasswordView(false)} className="text-sm text-muted-foreground p-0 h-auto">
                  Back to Login
                </Button>
              </CardFooter>
            </Card>
          </main>
          <EmergencyDialog {...emergencyDialogProps} />
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-screen">
        <Header onEmergencyClick={handleEmergencyClick} />
        <main className="flex-grow container mx-auto p-4 pt-20 pb-20 flex justify-center items-center">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold font-heading">
                {isSignUpView ? "Create Account" : "Welcome Back"}
              </CardTitle>
              <CardDescription>
                {isSignUpView ? "Join to access personalized health tools." : "Sign in to continue to your dashboard."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {authError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}

              {isSignUpView ? (
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signUpForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="First Name" {...field} className="bg-input pl-10"/>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={signUpForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                               <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Last Name" {...field} className="bg-input pl-10"/>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="email" placeholder="you@example.com" {...field} className="bg-input pl-10"/>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                             <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type={showPasswordSignUp ? "text" : "password"} placeholder="Choose a password" {...field} className="bg-input pl-10"/>
                              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}>
                                {showPasswordSignUp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={signUpForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                             <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type={showConfirmPasswordSignUp ? "text" : "password"} placeholder="Confirm your password" {...field} className="bg-input pl-10"/>
                              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowConfirmPasswordSignUp(!showConfirmPasswordSignUp)}>
                                {showConfirmPasswordSignUp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSigningUp}>
                      {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSigningUp ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type="email" placeholder="you@example.com" {...field} className="bg-input pl-10"/>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input type={showPasswordLogin ? "text" : "password"} placeholder="••••••••" {...field} className="bg-input pl-10"/>
                              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPasswordLogin(!showPasswordLogin)}>
                                {showPasswordLogin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center justify-end -mt-2 mb-2">
                        <Button 
                            type="button" 
                            variant="link" 
                            onClick={handleForgotPasswordClick}
                            className="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
                        >
                            Forgot Password?
                        </Button>
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoggingIn}>
                      {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoggingIn ? 'Logging In...' : 'Login'}
                    </Button>
                  </form>
                </Form>
              )}
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" onClick={handleGoogleSignIn} className="w-full border-primary/50 text-foreground hover:bg-accent hover:text-accent-foreground" disabled={isGoogleSigningIn}>
                {isGoogleSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                {isGoogleSigningIn ? 'Signing In...' : isSignUpView ? 'Sign up with Google' : 'Sign in with Google'}
              </Button>
            </CardContent>
            <CardFooter className="justify-center py-4">
              <Button variant="link" onClick={() => toggleAuthView(!isSignUpView)} className="text-sm text-muted-foreground p-0 h-auto">
                {isSignUpView 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Sign Up"}
              </Button>
            </CardFooter>
          </Card>
        </main>
        <EmergencyDialog {...emergencyDialogProps} />
      </div>
    );
  }

  // Authenticated user dashboard view
  const dashboardItems = [
    { href: '/wallet', icon: Wallet, title: t('emergency_wallet'), description: t('manage_emergency_funds') },
    { href: '/profile/account', icon: UserIcon, title: t('account_information'), description: t('edit_personal_details') },
    { href: '/profile/emergency', icon: Shield, title: t('emergency_setup'), description: t('manage_contacts_location') },
    { href: '/profile/subscription', icon: CreditCard, title: t('manage_subscription'), description: t('view_upgrade_plan') },
    { href: '/donate', icon: Gift, title: t('donate'), description: t('support_our_cause') },
    { href: '/profile/settings', icon: SettingsIcon, title: t('app_settings'), description: t('adjust_notifications_preferences') },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header onEmergencyClick={handleEmergencyClick} />
      <main className="flex-grow container mx-auto p-4 pt-20 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* User Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary shadow-md">
              <AvatarImage src={currentUser.photoURL || `https://placehold.co/100x100.png?text=${currentUser.email?.[0]?.toUpperCase() || 'U'}`} alt="User Avatar" data-ai-hint="person portrait" />
              <AvatarFallback className="text-2xl">{currentUser.displayName?.charAt(0).toUpperCase() || currentUser.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-primary font-heading">{t('welcome_back')}, {currentUser.displayName || 'User'}!</h1>
              <p className="text-sm text-muted-foreground">{currentUser.email}</p>
            </div>
          </div>

          {/* Dashboard Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardItems.map(item => (
              <Link href={item.href} key={item.href} className="group">
                <Card className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-start gap-4 p-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <item.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-semibold text-foreground">{item.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="pt-4">
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> {t('log_out')}
            </Button>
          </div>
        </div>
      </main>
      <EmergencyDialog {...emergencyDialogProps} />
    </div>
  );
}
