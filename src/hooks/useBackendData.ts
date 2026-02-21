import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

// ── Events ──────────────────────────────────────────────────────────────────
export function useEvents() {
  const [events, setEvents] = useState<api.ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.getEvents();
      setEvents(res.data);
    } catch {
      // Backend unavailable — no events to show
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { events, loading, refresh };
}

// ── Sectors ──────────────────────────────────────────────────────────────────
export function useSectors() {
  const [sectors, setSectors] = useState<api.ApiSector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSectors().then(setSectors).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return { sectors, loading };
}

// ── Stocks ───────────────────────────────────────────────────────────────────
export function useStocks() {
  const [stocks, setStocks] = useState<api.ApiStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStocks().then(res => setStocks(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return { stocks, loading };
}
