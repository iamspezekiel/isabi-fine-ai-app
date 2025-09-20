
'use client';

import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Send, Mic, Paperclip, User, Bot, MessageCircle, HeartPulse, Lightbulb, Footprints, X as XIcon, Loader2, PlusCircle } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { aiGeneralQA } from '@/ai/flows/basic-chat-flow';
import { aiSymptomCheck } from '@/ai/flows/symptom-checker-flow';
import { aiGetPersonalizedTip } from '@/ai/flows/personalized-tips-flow';
import { aiActivityRecommendation } from '@/ai/flows/activity-recommendation-flow';
import { useEmergencyHandler } from '@/hooks/use-emergency-handler';
import { EmergencyDialog } from '@/components/emergency/emergency-dialog';
import { useSearchParams, useRouter } from 'next/navigation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface AiTool {
  id: 'general_qa' | 'symptom_checker' | 'personalized_tips' | 'activity_recommendation';
  name: string;
  description: string;
  status: 'active' | 'coming_soon';
  icon: React.ElementType;
  placeholder: string;
}

const aiTools: AiTool[] = [
  { id: 'general_qa', name: 'General Health Q&A', description: 'Ask general health-related questions.', status: 'active', icon: MessageCircle, placeholder: 'Ask a general health question...' },
  { id: 'symptom_checker', name: 'Symptom Checker', description: 'Get a preliminary assessment of your symptoms.', status: 'active', icon: HeartPulse, placeholder: 'Describe your symptoms...' },
  { id: 'personalized_tips', name: 'Personalized Tips', description: 'Receive health tips tailored to you.', status: 'active', icon: Lightbulb, placeholder: 'Ask for a health tip...' },
  { id: 'activity_recommendation', name: 'Activity Advice', description: 'Get advice on physical activities.', status: 'active', icon: Footprints, placeholder: 'Ask for advice on activities...' },
];

// const SpeechRecognition =
//   (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;
const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;



export default function AIPage() {
  const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTool, setActiveTool] = useState<AiTool>(aiTools[0]);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { handleEmergencyClick, emergencyDialogProps } = useEmergencyHandler();

  const searchParams = useSearchParams();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load messages from localStorage on mount
  useEffect(() => {
    if (isClient) {
      try {
        const savedMessages = localStorage.getItem('aiChatMessages');
        if (savedMessages) {
          const parsedMessages: Message[] = JSON.parse(savedMessages).map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp), // Rehydrate Date objects
          }));
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error('Failed to load messages from local storage:', error);
        localStorage.removeItem('aiChatMessages');
      }
    }
  }, [isClient]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      if (messages.length > 0) {
        localStorage.setItem('aiChatMessages', JSON.stringify(messages));
      } else {
        localStorage.removeItem('aiChatMessages');
      }
    }
  }, [messages, isClient]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || isProcessingFile) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    setInput('');
    setSelectedFile(null); 
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setIsLoading(true);

    try {
      let aiResponseText = '';
      switch (activeTool.id) {
        case 'general_qa':
          const qaResponse = await aiGeneralQA({ query: messageText });
          aiResponseText = qaResponse.response;
          break;
        case 'symptom_checker':
          const symptomResponse = await aiSymptomCheck({ query: messageText });
          aiResponseText = symptomResponse.response;
          break;
        case 'personalized_tips':
          const tipResponse = await aiGetPersonalizedTip({ query: messageText });
          aiResponseText = tipResponse.response;
          break;
        case 'activity_recommendation':
            const activityResponse = await aiActivityRecommendation({ query: messageText });
            aiResponseText = activityResponse.response;
            break;
        default:
          const defaultResponse = await aiGeneralQA({ query: messageText });
          aiResponseText = defaultResponse.response;
      }
      
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error calling AI flow:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      toast({
        title: 'AI Error',
        description: 'Could not get a response from the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const combinedInput = selectedFile ? `${input} (File attached: ${selectedFile.name})` : input;
    handleSendMessage(combinedInput);
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query && !isLoading && messages.length === 0) {
      router.replace('/ai', { scroll: false }); 
      
      const generalQATool = aiTools.find(tool => tool.id === 'general_qa');
      if (generalQATool) {
        setActiveTool(generalQATool);
      }
      handleSendMessage(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser does not support speech recognition.",
        variant: "destructive",
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
      toast({ title: "Listening...", description: "Speak into your microphone." });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSendMessage(transcript);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onerror = (event) => {
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

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingFile(true);
      setSelectedFile(file);
      toast({
        title: 'File Attached',
        description: `${file.name} is ready. You can mention it in your query.`,
      });
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    toast({
        title: 'File Cleared',
        description: 'The attached file has been removed.',
    });
  };

  const handleToolSelect = (tool: AiTool) => {
    if (tool.status !== 'active') {
      toast({
        title: 'Coming Soon!',
        description: `${tool.name} is under development and will be available shortly.`,
      });
      return;
    }
    setActiveTool(tool);
    toast({
      title: `${tool.name} Selected`,
      description: `Switched to ${tool.name} mode.`,
    });
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    setMessages([]); // This triggers the useEffect to clear localStorage
    toast({
      title: 'New Chat Started',
      description: 'Your conversation history has been cleared.',
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onEmergencyClick={handleEmergencyClick} />
      <main className="flex-grow flex flex-col pt-16 pb-16 bg-background">
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 w-full max-w-3xl mx-auto">
          {messages.length === 0 && !isLoading && (
            <div className="text-center mt-8">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-2xl font-bold text-primary mb-2 font-heading">IsabiFine AI</p>
              <p className="text-lg text-foreground mb-6">How can I help you today?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {aiTools.map((tool) => (
                  <Card
                    key={tool.id}
                    className={`cursor-pointer hover:bg-muted/80 transition-all duration-200 ${
                      activeTool.id === tool.id ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                    }`}
                    onClick={() => handleToolSelect(tool)}
                  >
                    <CardHeader className="flex flex-row items-start gap-4 p-4">
                      <div className={`mt-1 rounded-lg p-2 shrink-0 ${activeTool.id === tool.id ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                        <tool.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-foreground">{tool.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 mb-3 ${ 
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <Avatar className="h-8 w-8 self-end mb-1">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] sm:max-w-[70%] rounded-lg px-3 py-2 text-sm shadow ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground border border-border'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 self-end mb-1">
                    <AvatarFallback><User size={20} /></AvatarFallback>
                  </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start mb-3">
              <Avatar className="h-8 w-8 self-end mb-1">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
              </Avatar>
              <div className="max-w-[70%] rounded-lg px-3 py-2 text-sm shadow bg-muted text-muted-foreground">
                Typing...
              </div>
            </div>
          )}
        </ScrollArea>

        <div className="p-2 sm:p-4 w-full max-w-2xl mx-auto shrink-0 border-t border-border bg-background">
          {(messages.length > 0 || isLoading) && (
            <div className="mb-3 flex items-center justify-center gap-2 px-1">
              <span className="text-sm font-medium text-muted-foreground shrink-0">AI Tool:</span>
              <Select
                onValueChange={(toolId) => {
                  const tool = aiTools.find((t) => t.id === toolId);
                  if (tool) handleToolSelect(tool);
                }}
                value={activeTool.id}
              >
                <SelectTrigger className="flex-grow h-9 text-sm font-semibold rounded-full bg-card border-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <div className="flex items-center gap-2">
                    <activeTool.icon className="h-5 w-5 text-primary"/>
                    <SelectValue placeholder="Select a tool" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {aiTools.map((tool) => (
                    <SelectItem key={tool.id} value={tool.id} disabled={tool.status !== 'active'}>
                      <div className="flex items-center gap-2">
                        <tool.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{tool.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 shrink-0">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Chat
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Start a new chat?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently clear your current conversation history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleNewChat}>Start New Chat</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <form 
            onSubmit={handleSubmit} 
            className="bg-card p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-2"
          >
            {selectedFile && (
              <div className="text-xs text-muted-foreground px-2 pt-1 flex items-center justify-between bg-input/50 rounded-md">
                <span className="truncate">Attached: {selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearSelectedFile}
                  className="h-6 w-6 ml-1 text-muted-foreground hover:text-destructive"
                  aria-label="Clear attached file"
                  disabled={isProcessingFile}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <Input
              ref={inputRef}
              type="text"
              placeholder={activeTool.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base placeholder:text-muted-foreground px-2 pt-2"
              disabled={isLoading || isProcessingFile}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,application/pdf,.doc,.docx,.txt"
              disabled={isProcessingFile}
            />
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleFileUpload} 
                  className="text-muted-foreground hover:text-primary w-8 h-8"
                  disabled={isLoading || isProcessingFile}
                >
                  {isProcessingFile ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                  <span className="sr-only">Attach document</span>
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleVoiceInput} 
                  className={`w-8 h-8 ${isListening ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-primary'}`}
                  disabled={isLoading || isProcessingFile}
                >
                  <Mic className="h-5 w-5" />
                  <span className="sr-only">{isListening ? 'Stop listening' : 'Use voice input'}</span>
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || isProcessingFile || (!input.trim() && !selectedFile)} 
                  className="bg-primary hover:bg-primary/90 rounded-full w-8 h-8 p-0"
                  size="icon"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <EmergencyDialog {...emergencyDialogProps} />
    </div>
  );
}
