
'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // Show a toast or a custom button to prompt the user.
      showInstallToast(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = (promptEvent: Event | null) => {
    if (!promptEvent) {
      return;
    }
    // Show the browser's install prompt.
    (promptEvent as any).prompt();
    // Wait for the user to respond to the prompt.
    (promptEvent as any).userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA installation');
      } else {
        console.log('User dismissed the PWA installation');
      }
      setInstallPrompt(null);
    });
  };

  const showInstallToast = (e: Event) => {
    toast({
      title: 'Install IsabiFine AI App',
      description: 'Get a better experience by installing the app on your device.',
      duration: 10000, // 10 seconds
      action: (
        <Button onClick={() => handleInstallClick(e)} size="sm">
          <Download className="mr-2 h-4 w-4" />
          Install
        </Button>
      ),
    });
  };

  // This component doesn't render anything itself.
  // It just handles the logic for the install prompt.
  return null;
};

export default InstallPWA;
