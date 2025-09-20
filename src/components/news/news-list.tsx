
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Globe, MapPin, AlertTriangle, Newspaper, ExternalLink } from 'lucide-react';
import type { NewsArticle } from '@/lib/types';
import { useState, type AnchorHTMLAttributes, type DetailedHTMLProps } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NewsListProps {
  articles: NewsArticle[];
}

export function NewsList({ articles }: NewsListProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReadArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsDialogOpen(true);
  };

  // Custom link renderer to open external links in a new tab
  const customLinkRenderer: Components['a'] = ({ node, children, href, ...props }) => {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    );
  };

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-foreground">No News Articles Found</h1>
        <p className="text-muted-foreground">
          We couldn't fetch any news articles at the moment. This might be due to issues with the news feeds or network connectivity. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Card key={article.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="p-0">
              <div className="relative w-full h-48">
                <Image
                  src={article.imageUrl || 'https://placehold.co/600x400.png'}
                  alt={article.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                  data-ai-hint={article.dataAiHint}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400.png'; }}
                />
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                {article.category === 'Local' ? (
                  <MapPin className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                ) : (
                  <Globe className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                )}
                <span className={`font-medium ${article.category === 'Local' ? 'text-green-700' : 'text-blue-700'}`}>
                  {article.category}
                </span>
                <span className="mx-1.5">|</span>
                <span className="truncate hover:text-clip" title={article.source}>{article.source}</span>
              </div>
              <CardTitle className="text-lg font-semibold text-accent mb-2 leading-tight">
                {article.title}
              </CardTitle>
              <div className="flex items-center text-xs text-muted-foreground mb-3">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5" /> {article.date}
              </div>
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                {article.summary}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-start items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReadArticle(article)}
              >
                <Newspaper className="mr-2 h-4 w-4" /> Read News
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedArticle && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader className="pt-6 px-6 pb-4 border-b sticky top-0 bg-background z-10">
              <DialogTitle className="text-2xl font-bold text-primary">{selectedArticle.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Source: {selectedArticle.source} | Date: {selectedArticle.date}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow my-2 px-6">
              <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground leading-relaxed py-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{ a: customLinkRenderer }}
                >
                  {selectedArticle.contentForDialog || 'No detailed content available in the feed. Please visit the source website for the full article.'}
                </ReactMarkdown>
              </article>
            </ScrollArea>
            <DialogFooter className="px-6 py-4 border-t sticky bottom-0 bg-background z-10">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
