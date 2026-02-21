import { useState, useEffect } from 'react';
import { getNews, NewsDisplayItem } from '../services/api';

export type NewsSource = 'geopolitical' | 'market';

export interface NewsEntry {
  id: string;
  title: string;
  source: string;
  url: string;
  timestamp: number; // unix ms
  type: NewsSource;
}

function fromBackendNews(item: NewsDisplayItem, index: number): NewsEntry {
  return {
    id: `news-${index}-${item.publishedAt}`,
    title: item.title,
    source: item.source,
    url: '',
    timestamp: new Date(item.publishedAt).getTime(),
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
        const items = await getNews();
        const entries = items
          .map(fromBackendNews)
          .sort((a, b) => b.timestamp - a.timestamp);

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
