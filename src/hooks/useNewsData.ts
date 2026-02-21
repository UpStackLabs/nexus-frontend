import { useState, useEffect } from 'react';
import { fetchMarketNews, NewsItem as FinnhubNewsItem } from '../services/finnhub';
import { fetchGdeltEvents, GdeltArticle, parseGdeltDate } from '../services/gdelt';
import { GDELT_QUERY, FINNHUB_KEY } from '../config';

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

function fromFinnhub(a: FinnhubNewsItem): NewsEntry {
  return {
    id: `fh-${a.id}`,
    title: a.headline,
    source: a.source,
    url: a.url,
    timestamp: a.datetime * 1000,
    type: 'market',
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
      const tasks = [
        fetchGdeltEvents(GDELT_QUERY).then(a => a.map(fromGdelt)).catch(() => [] as NewsEntry[]),
        FINNHUB_KEY
          ? fetchMarketNews().then(a => a.map(fromFinnhub)).catch(() => [] as NewsEntry[])
          : Promise.resolve([] as NewsEntry[]),
      ];

      const [geo, market] = await Promise.all(tasks);
      const all = [...geo, ...market].sort((a, b) => b.timestamp - a.timestamp).slice(0, 40);

      if (!mounted) return;
      if (all.length === 0) {
        setError('No news sources available');
      } else {
        setNews(all);
        setError(null);
      }
      setLoading(false);
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
