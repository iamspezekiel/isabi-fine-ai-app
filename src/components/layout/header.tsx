
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HeartPulse, Search as SearchIcon, Mic, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from './language-provider';

interface HeaderProps {
  onEmergencyClick?: () => void;
  onTitleClick?: () => void;
}

const SpeechRecognition =
  (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

export function Header({ onEmergencyClick, onTitleClick }: HeaderProps) {
  const { toast } = useToast();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const router = useRouter();

  const { t } = useTranslation();

  const [searchMode, setSearchMode] = useState<'facilities' | 'ai'>('facilities');

  const handleTitleAreaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onTitleClick) {
      onTitleClick();
    }
  };

  const handleEmergency = () => {
    if (onEmergencyClick) {
      onEmergencyClick();
    } else {
      console.warn("Header: onEmergencyClick handler was not provided by the parent page.");
      toast({
        title: "Emergency Action",
        description: "Emergency services typically contacted here. (This is a generic message).",
        variant: "default",
      });
    }
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      if (searchMode === 'facilities') {
        router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push(`/ai?q=${encodeURIComponent(query.trim())}`);
      }
      setSearchInputValue('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchInputValue.trim()) {
      event.preventDefault();
      handleSearchSubmit(searchInputValue);
    }
  };

  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast({ title: 'Listening...', description: 'Speak into your microphone.' });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setSearchInputValue(transcript);
      // Automatically submit search after successful recognition
      handleSearchSubmit(transcript); 
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onnomatch = () => {
      toast({ title: 'No Match', description: 'Speech not recognized. Please try again.', variant: 'destructive' });
    };

    recognition.onerror = (event:SpeechRecognitionErrorEvent) => {
      let errorMessage = 'An unknown error occurred.';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try again.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Microphone problem. Ensure it is enabled and working.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
      }
      toast({ title: 'Voice Input Error', description: errorMessage, variant: 'destructive' });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Error starting recognition: ", e);
      toast({ title: 'Voice Input Error', description: 'Could not start voice recognition.', variant: 'destructive' });
      setIsListening(false);
    }
  };
  
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-background shadow-md gap-4 h-16">
      <Link href="/" onClick={handleTitleAreaClick} className="flex items-center gap-2 shrink-0 cursor-pointer group">
        <HeartPulse className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
        <h1 className="text-lg sm:text-xl font-semibold text-primary group-hover:text-primary/80 transition-colors hidden md:block font-heading">
          IsabiFine AI
        </h1>
      </Link>

      <div className="flex-grow max-w-xl">
        <div className="flex items-center w-full bg-input rounded-lg shadow-sm h-10">
          <Select value={searchMode} onValueChange={(value) => setSearchMode(value as 'facilities' | 'ai')}>
            <SelectTrigger className="w-auto bg-transparent border-0 rounded-r-none h-full focus:ring-0 focus:ring-offset-0 px-3 text-muted-foreground">
              <SelectValue>
                {searchMode === 'facilities' ? (
                  <SearchIcon className="h-5 w-5" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facilities">
                <div className="flex items-center gap-2">
                  <SearchIcon className="h-4 w-4" />
                  <span>{t('search_facilities')}</span>
                </div>
              </SelectItem>
              <SelectItem value="ai">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{t('ask_ai')}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-grow h-full">
            <Input
              type="search"
              placeholder={searchMode === 'facilities' ? t('search_facilities_placeholder') : t('ask_ai_placeholder')}
              className="bg-transparent border-none rounded-l-none h-full pl-2 pr-10 w-full text-sm sm:text-base focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 ${isListening ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-primary'}`}
              aria-label={isListening ? 'Stop listening' : 'Use voice input for search'}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <Button
        variant="destructive"
        onClick={handleEmergency}
        className="rounded-lg px-3 sm:px-4 h-10 flex items-center"
      >
        <HeartPulse className="mr-0 sm:mr-2 h-5 w-5" />
        <span className="hidden sm:inline text-sm">{t('emergency')}</span>
      </Button>
    </header>
  );
}
