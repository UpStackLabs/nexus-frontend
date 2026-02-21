import { useState, useEffect, useCallback } from "react";
import { getStockPrediction, type ApiPredictionResult } from "../services/api";

export function usePrediction(ticker: string, days = 30) {
  const [data, setData] = useState<ApiPredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getStockPrediction(ticker, days);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prediction");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [ticker, days]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
