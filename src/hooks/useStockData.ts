import { useState, useEffect, useCallback } from 'react';
import { getQuotes, ApiQuote } from '../services/api';
import { WATCHLIST, DISPLAY_SYMBOLS } from '../config';

const ALL_SYMBOLS = [...WATCHLIST, ...DISPLAY_SYMBOLS] as const;

export type Quote = ApiQuote;

export interface StockState {
  quotes: Record<string, Quote>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  hasKey: boolean;
}

const REFRESH_MS = 30_000;

export function useStockData(): StockState {
  const [state, setState] = useState<StockState>({
    quotes: {},
    loading: true,
    error: null,
    lastUpdated: null,
    hasKey: true, // always true — backend handles API keys
  });

  const refresh = useCallback(async () => {
    try {
      const quotes = await getQuotes(ALL_SYMBOLS);
      setState(s => ({ ...s, quotes, loading: false, error: null, lastUpdated: new Date() }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Fetch failed';
      setState(s => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return state;
}
