import { HeartPulse } from 'lucide-react';

export function Preloader() {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="relative flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32">
        {/* Ripple effect rings */}
        <div className="absolute h-full w-full rounded-full bg-primary/10 animate-ping delay-500"></div>
        <div className="absolute h-full w-full rounded-full bg-primary/15 animate-ping delay-300"></div>
        <div className="absolute h-3/4 w-3/4 rounded-full bg-primary/20 animate-ping"></div>

        {/* Central Logo */}
        <div className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 bg-background p-3 rounded-full shadow-2xl">
           <HeartPulse className="h-full w-full text-primary animate-pulse duration-2000" />
        </div>
      </div>
      <div className="text-center">
        <p className="mt-8 text-2xl font-bold text-primary tracking-wider font-heading">
          Welcome to IsabiFine AI
        </p>
        <p className="mt-2 text-md text-muted-foreground">
          Getting things ready for you...
        </p>
      </div>
    </div>
  );
}
