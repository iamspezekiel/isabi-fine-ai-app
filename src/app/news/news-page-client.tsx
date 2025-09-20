
'use client';

import { Header } from '@/components/layout/header';
import { NewsList } from '@/components/news/news-list';
import { EmergencyDialog } from '@/components/emergency/emergency-dialog';
import { useEmergencyHandler } from '@/hooks/use-emergency-handler';
import type { NewsArticle } from '@/lib/types';

interface NewsPageClientProps {
  articles: NewsArticle[];
}

export default function NewsPageClient({ articles }: NewsPageClientProps) {
  const { handleEmergencyClick, emergencyDialogProps } = useEmergencyHandler();

  return (
    <div className="flex flex-col min-h-screen">
      <Header onEmergencyClick={handleEmergencyClick} /> 
      <main className="flex-grow container mx-auto p-4 pt-20 pb-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2 font-heading">Health News & Updates</h1>
          <p className="text-lg text-foreground">
            Stay informed with the latest health news from Nigeria and around the world.
          </p>
        </div>
        <NewsList articles={articles} />
      </main>
      <EmergencyDialog {...emergencyDialogProps} />
    </div>
  );
}
