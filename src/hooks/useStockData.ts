import { useState, useEffect, useCallback } from 'react';
import { fetchQuotes, Quote } from '../services/finnhub';
import { WATCHLIST, FINNHUB_KEY } from '../config';

export interface StockState {
  quotes: Record<string, Quote>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  hasKey: boolean;
}

const REFRESH_MS = 30_000;

export function useStockData(): StockState {
  const hasKey = Boolean(FINNHUB_KEY);
  const [state, setState] = useState<StockState>({
    quotes: {},
    loading: hasKey,
    error: hasKey ? null : 'Set VITE_FINNHUB_KEY in .env.local',
    lastUpdated: null,
    hasKey,
  });

  const refresh = useCallback(async () => {
    if (!hasKey) return;
    try {
      const quotes = await fetchQuotes(WATCHLIST);
      setState(s => ({ ...s, quotes, loading: false, error: null, lastUpdated: new Date() }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      setState(s => ({ ...s, loading: false, error: msg }));
    }
  }, [hasKey]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return state;
}
