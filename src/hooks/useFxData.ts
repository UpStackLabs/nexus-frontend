import { useState, useEffect } from 'react';
import { fetchRates } from '../services/fx';
import { FX_CURRENCIES } from '../config';

export interface FxEntry {
  currency: string;
  pair: string;    // e.g. "BRL/USD"
  rate: number;    // units of currency per 1 USD
}

const REFRESH_MS = 60_000; // 1 min

export function useFxData() {
  const [rates, setRates] = useState<FxEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const data = await fetchRates('USD');
        if (!mounted) return;
        const entries: FxEntry[] = FX_CURRENCIES.map(c => ({
          currency: c,
          pair: `${c}/USD`,
          rate: data.rates[c] ?? 0,
        }));
        setRates(entries);
        setUpdatedAt(data.time_last_update_utc);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'FX fetch failed');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    refresh();
    const id = setInterval(refresh, REFRESH_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  return { rates, loading, error, updatedAt };
}
