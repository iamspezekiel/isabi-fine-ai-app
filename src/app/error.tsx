'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card p-8 rounded-lg shadow-xl text-center max-w-md">
        <h2 className="text-2xl font-bold text-destructive mb-4">Oops! Something went wrong.</h2>
        <p className="text-card-foreground mb-6">
          We encountered an unexpected issue. Please try again.
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Error: {error.message}
        </p>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
