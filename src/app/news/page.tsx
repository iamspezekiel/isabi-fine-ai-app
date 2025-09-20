
import { format } from 'date-fns';
import type { NewsArticle } from '@/lib/types';
import NewsPageClient from './news-page-client';

// RSS Feed URLs for Google News
const localFeedUrl = 'https://news.google.com/rss/search?q=health+Nigeria&hl=en-NG&gl=NG&ceid=NG:en';
const foreignFeedUrl = 'https://news.google.com/rss/search?q=global+health+news&hl=en-US&gl=US&ceid=US:en';

// Helper function to fetch and parse RSS feed
async function fetchAndParseRSS(url: string, sourceNameDefault: string, category: 'Local' | 'Foreign'): Promise<NewsArticle[]> {
  try {
    const response = await fetch(url, { 
      headers: {
        'User-Agent': 'IsabiFineAI/1.0 (+http://localhost:9002)' // Basic User-Agent
      },
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      console.error(`Error fetching RSS feed from ${url}: ${response.status} ${response.statusText}`);
      return [];
    }

    const xmlText = await response.text();
    const items: NewsArticle[] = [];
    
    // Basic regex to parse RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      
      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
      const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);
      const descriptionMatch = /<description>([\s\S]*?)<\/description>/.exec(itemContent);
      const sourceTagMatch = /<source url="[^"]*">([\s\S]*?)<\/source>/.exec(itemContent);
      const guidMatch = /<guid isPermaLink="[^"]*">([\s\S]*?)<\/guid>/.exec(itemContent);

      if (titleMatch && linkMatch && pubDateMatch && descriptionMatch) {
        let title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
        const href = linkMatch[1].trim();
        const id = guidMatch ? guidMatch[1].trim() : href; // Use GUID as ID if available, else link
        const source = sourceTagMatch ? sourceTagMatch[1].trim() : sourceNameDefault;
        
        let formattedDate = new Date().toLocaleDateString(); // Default to today if parsing fails
        let pubTimestamp: number | undefined;
        
        try {
          const rawPubDate = pubDateMatch[1].trim();
          const parsedDate = new Date(rawPubDate);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = format(parsedDate, 'PP'); // Format like 'MMM d, yyyy' e.g. Aug 23, 2023
            pubTimestamp = parsedDate.getTime();
          } else {
            console.warn(`Could not parse date: ${rawPubDate} for article: ${title}`);
            pubTimestamp = 0; 
          }
        } catch (e) {
          console.warn(`Error parsing date for article: ${title}`, e);
          pubTimestamp = 0; 
        }
        
        const rawDescriptionContent = descriptionMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/s, '$1').trim();
        
        let imageUrl: string | undefined;
        // Attempt to extract image from rawDescriptionContent
        const imgRegex = /<img[^>]+src="([^">]+)"/;
        const imgContentMatch = imgRegex.exec(rawDescriptionContent);
        if (imgContentMatch) {
            imageUrl = imgContentMatch[1];
        }

        // More robust image extraction for Google News media:content from full itemContent
        if (!imageUrl) {
          const mediaContentRegex = /<media:content[^>]+url="([^">]+)"[^>]*medium="image"/;
          const mediaMatch = mediaContentRegex.exec(itemContent); 
          if (mediaMatch) {
            imageUrl = mediaMatch[1];
          }
        }
        // And media:thumbnail
        if (!imageUrl) {
            const mediaThumbnailRegex = /<media:thumbnail[^>]+url="([^">]+)"/;
            const mediaThumbMatch = mediaThumbnailRegex.exec(itemContent);
            if (mediaThumbMatch) {
                imageUrl = mediaThumbMatch[1];
            }
        }

        // Create plainSummary for card preview (strip HTML, truncate)
        let plainSummary = rawDescriptionContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        plainSummary = plainSummary.length > 200 ? plainSummary.substring(0, 197) + '...' : plainSummary;
        
        // Truncate title if too long
        title = title.length > 100 ? title.substring(0, 97) + '...' : title;

        items.push({
          id,
          title,
          summary: plainSummary, // For card preview
          contentForDialog: rawDescriptionContent, // For dialog view
          href,
          source,
          date: formattedDate,
          pubTimestamp,
          category,
          imageUrl,
          dataAiHint: category === 'Local' ? 'nigeria health' : 'global health',
        });
      }
    }
    return items.slice(0, 10); 
  } catch (error: any) {
    let errorMessage = error.message;
    if (error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
        errorMessage = `${error.message} (Cause: ${error.cause.code})`;
    } else if (error.cause) {
        errorMessage = `${error.message} (Cause: ${String(error.cause)})`;
    }
    
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNREFUSED')) {
      console.error(`Network error fetching RSS from ${url}: ${errorMessage}. This usually indicates a problem with DNS resolution or network connectivity from the server environment. Ensure the URL is accessible and DNS is configured correctly.`);
    } else {
      console.error(`Failed to fetch or parse RSS from ${url}:`, errorMessage);
    }
    return [];
  }
}

export default async function NewsPage() {
  const localArticlesPromise = fetchAndParseRSS(localFeedUrl, 'Nigerian News', 'Local');
  const foreignArticlesPromise = fetchAndParseRSS(foreignFeedUrl, 'Global News', 'Foreign');

  const [localArticles, foreignArticles] = await Promise.all([
    localArticlesPromise,
    foreignArticlesPromise,
  ]);

  let allArticles = [...localArticles, ...foreignArticles];

  allArticles.sort((a, b) => {
    const tsA = a.pubTimestamp || 0; 
    const tsB = b.pubTimestamp || 0;
    return tsB - tsA; 
  });
  
  const displayArticles = allArticles.slice(0, 12); 

  return <NewsPageClient articles={displayArticles} />;
}
