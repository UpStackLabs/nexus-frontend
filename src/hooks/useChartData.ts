import { useState, useEffect, useRef } from 'react';
import { fetchCandles } from '../services/finnhub';
import { FINNHUB_KEY } from '../config';
import { generateStockHistory, generateIntraday } from '../app/components/mock-data';

export interface ChartPoint {
  date: string;
  price: number;
  volume: number;
}

type Resolution = '5' | '15' | '60' | 'D' | 'W';
type DateFmt = 'time' | 'day' | 'week';

const TF_CONFIG: Record<string, { resolution: Resolution; days: number; fmt: DateFmt }> = {
  '1D': { resolution: '15', days: 1,   fmt: 'time' },
  '1W': { resolution: '60', days: 7,   fmt: 'day'  },
  '1M': { resolution: 'D',  days: 30,  fmt: 'day'  },
  '3M': { resolution: 'D',  days: 90,  fmt: 'day'  },
  '1Y': { resolution: 'W',  days: 365, fmt: 'week' },
};

function fmtTs(t: number, fmt: DateFmt): string {
  const d = new Date(t * 1000);
  if (fmt === 'time') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  if (fmt === 'week') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function useChartData(symbol: string, timeframe: string, fallbackPrice: number) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const priceRef = useRef(fallbackPrice);
  priceRef.current = fallbackPrice;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const price = priceRef.current;

      if (!FINNHUB_KEY) {
        // No API key — generate plausible mock data
        if (timeframe === '1D') {
          setData(generateIntraday(price, 0.008));
        } else {
          const days = TF_CONFIG[timeframe]?.days ?? 30;
          setData(generateStockHistory(price, 0.025, days));
        }
        return;
      }

      setLoading(true);
      try {
        const cfg = TF_CONFIG[timeframe] ?? TF_CONFIG['1M'];
        const now = Math.floor(Date.now() / 1000);
        const from = now - cfg.days * 24 * 3600;
        const candles = await fetchCandles(symbol, cfg.resolution, from, now);

        if (cancelled) return;

        if (candles.s === 'ok' && candles.t?.length > 0) {
          const points: ChartPoint[] = candles.t.map((t, i) => ({
            date: fmtTs(t, cfg.fmt),
            price: candles.c[i],
            volume: candles.v[i],
          }));
          setData(points);
        } else {
          setData(generateStockHistory(price, 0.025, cfg.days));
        }
      } catch {
        if (!cancelled) setData(generateStockHistory(priceRef.current, 0.025, 30));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // Re-fetch only when symbol or timeframe changes, not on every price tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeframe]);

  return { data, loading };
}
