
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings as SettingsIcon, ChevronLeft, Sun, Moon, Laptop, Bell, Database, Trash2, Languages } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
import { useTranslation, type Language } from '@/components/layout/language-provider';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [theme, setTheme] = useState('system');
  const [dataSaving, setDataSaving] = useState(false);
  
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    // Load saved settings
    const savedNotifications = localStorage.getItem('receiveNotifications');
    if (savedNotifications !== null) {
      setReceiveNotifications(JSON.parse(savedNotifications));
    }
    const savedTheme = localStorage.getItem('appTheme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    const savedDataSaving = localStorage.getItem('dataSavingEnabled');
    if (savedDataSaving) {
      setDataSaving(JSON.parse(savedDataSaving));
    }
    setLoading(false);
  }, []);

  const handleNotificationSettingChange = async (checked: boolean) => {
    setReceiveNotifications(checked);
    localStorage.setItem('receiveNotifications', JSON.stringify(checked));
    toast({ title: "Settings Updated", description: `Notifications ${checked ? 'enabled' : 'disabled'}.` });
  };
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
    toast({ title: "Theme Updated", description: `Theme set to ${newTheme}.` });
    
    // For a real implementation with next-themes, you would apply the theme change globally.
    document.documentElement.classList.remove('light', 'dark');
    if (newTheme === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
    } else {
        document.documentElement.classList.add(newTheme);
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as Language);
    const languageName = {
      en: 'English',
      ha: 'Hausa',
      ig: 'Igbo',
      yo: 'Yoruba',
      pcm: 'Nigerian Pidgin',
      efik: 'Efik'
    }[newLanguage] || newLanguage;
    
    toast({ title: "Language Updated", description: `Language set to ${languageName}. App content will update on next refresh.` });
  };

  const handleDataSavingChange = (checked: boolean) => {
    setDataSaving(checked);
    localStorage.setItem('dataSavingEnabled', JSON.stringify(checked));
    toast({ title: "Settings Updated", description: `Data Saving mode ${checked ? 'enabled' : 'disabled'}.` });
  };

  const handleClearCache = () => {
    // This is a destructive action.
    localStorage.clear();
    toast({ title: "Cache Cleared", description: "Application data has been cleared. Please reload." });
    // Reset state to defaults and force a reload to reflect the cleared state.
    setTimeout(() => window.location.reload(), 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-4 border-b bg-background h-16">
          <Button asChild variant="ghost" size="icon" className="mr-2">
              <Link href="/profile" aria-label="Go back to dashboard">
                  <ChevronLeft className="h-6 w-6" />
              </Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground font-heading">{t('app_settings')}</h1>
      </div>

      <main className="flex-grow container mx-auto p-4 pt-20 pb-20">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <SettingsIcon className="mr-3 h-6 w-6" /> {t('app_settings')}
              </CardTitle>
              <CardDescription>
                {t('manage_app_preferences')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {/* Notifications */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2 flex items-center"><Bell className="mr-2 h-5 w-5"/> {t('notifications')}</h3>
                <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="text-foreground font-medium">{t('receive_email_notifications')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t('allow_us_to_send_updates')}
                    </p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={receiveNotifications} 
                    onCheckedChange={handleNotificationSettingChange}
                  />
                </div>
              </div>

              <Separator />

              {/* Appearance */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2 flex items-center"><Sun className="mr-2 h-5 w-5"/> {t('appearance')}</h3>
                 <div className="space-y-2">
                    <Label htmlFor="theme-select">{t('theme')}</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                        <SelectTrigger id="theme-select">
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">
                                <div className="flex items-center gap-2"><Sun className="h-4 w-4" /> {t('light')}</div>
                            </SelectItem>
                            <SelectItem value="dark">
                               <div className="flex items-center gap-2"><Moon className="h-4 w-4" /> {t('dark')}</div>
                            </SelectItem>
                            <SelectItem value="system">
                                <div className="flex items-center gap-2"><Laptop className="h-4 w-4" /> {t('system')}</div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{t('choose_theme')}</p>
                 </div>
              </div>

              <Separator />

              {/* Language Section */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2 flex items-center"><Languages className="mr-2 h-5 w-5"/> {t('language')}</h3>
                 <div className="space-y-2">
                    <Label htmlFor="language-select">{t('app_language')}</Label>
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger id="language-select">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">{t('english')}</SelectItem>
                            <SelectItem value="ha">{t('hausa')}</SelectItem>
                            <SelectItem value="ig">{t('igbo')}</SelectItem>
                            <SelectItem value="yo">{t('yoruba')}</SelectItem>
                            <SelectItem value="pcm">{t('pidgin')}</SelectItem>
                            <SelectItem value="efik">{t('efik')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{t('choose_language')}</p>
                 </div>
              </div>

              <Separator />

              {/* Data and Cache */}
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2 flex items-center"><Database className="mr-2 h-5 w-5"/> {t('data_cache')}</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-card rounded-md border">
                      <div className="space-y-0.5">
                        <Label htmlFor="data-saving" className="font-medium">{t('data_saving_mode')}</Label>
                        <p className="text-xs text-muted-foreground">{t('reduce_data_usage')}</p>
                      </div>
                       <Switch 
                        id="data-saving" 
                        checked={dataSaving} 
                        onCheckedChange={handleDataSavingChange}
                      />
                    </div>
                     <div className="space-y-2">
                        <Label>{t('clear_local_data')}</Label>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" /> {t('clear_local_cache')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('are_you_sure')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('action_irreversible')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                              <AlertDialogAction onClick={handleClearCache}>{t('continue')}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <p className="text-xs text-muted-foreground">{t('clear_cache_description')}</p>
                     </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
