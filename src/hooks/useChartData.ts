import { useState, useEffect } from 'react';
import { getStockHistory, type StockHistoryPoint } from '../services/api';

export interface ChartPoint {
  date: string;
  price: number;
  volume: number;
}

export function useChartData(symbol: string, timeframe: string, _fallbackPrice: number) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const points: StockHistoryPoint[] = await getStockHistory(symbol, timeframe);
        if (!cancelled && points.length > 0) {
          setData(points);
        }
      } catch (err) {
        console.error(`Failed to fetch chart data for ${symbol}:`, err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [symbol, timeframe]);

  return { data, loading };
}
