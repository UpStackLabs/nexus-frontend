import { useState, useEffect } from 'react';
import { fetchGdeltEvents, GdeltArticle, parseGdeltDate } from '../services/gdelt';
import { GDELT_QUERY } from '../config';

export type NewsSource = 'geopolitical' | 'market';

export interface NewsEntry {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: number; // unix ms
  type: NewsSource;
}

function fromGdelt(a: GdeltArticle): NewsEntry {
  return {
    id: `gdelt-${a.url}`,
    title: a.title,
    source: a.domain,
    url: a.url,
    timestamp: parseGdeltDate(a.seendate),
    type: 'geopolitical',
  };
}

const REFRESH_MS = 120_000; // 2 min

export function useNewsData() {
  const [news, setNews] = useState<NewsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const articles = await fetchGdeltEvents(GDELT_QUERY);
        const entries = articles.map(fromGdelt).sort((a, b) => b.timestamp - a.timestamp).slice(0, 40);

        if (!mounted) return;
        if (entries.length === 0) {
          setError('No news sources available');
        } else {
          setNews(entries);
          setError(null);
        }
      } catch {
        if (mounted) setError('Failed to fetch news');
      }
      if (mounted) setLoading(false);
    }

    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return { news, loading, error };
}
