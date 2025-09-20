'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';

// Parent wrapper with Suspense
export function TopLoader() {
  return (
    <Suspense fallback={null}>
      <TopLoaderInner />
    </Suspense>
  );
}

// Actual logic separated into its own component
function TopLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);

    const startTimer = setTimeout(() => {
      setProgress(30 + Math.random() * 30);
    }, 50);

    const endTimer = setTimeout(() => {
      setProgress(100);
    }, 600);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    if (progress === 100) {
      const hideTimer = setTimeout(() => {
        setProgress(0);
      }, 500);
      return () => clearTimeout(hideTimer);
    }
  }, [progress]);

  return progress > 0 ? (
    <Progress
      value={progress}
      className="fixed top-0 left-0 right-0 h-1 w-full rounded-none z-[9999] bg-transparent"
    />
  ) : null;
}
