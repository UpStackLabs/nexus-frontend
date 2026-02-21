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

// ── Globe Data ───────────────────────────────────────────────────────────────
export function useGlobeData(eventId?: string) {
  const [heatmap, setHeatmap] = useState<api.ApiHeatmapEntry[]>([]);
  const [arcs, setArcs] = useState<api.ApiConnectionArc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getGlobeHeatmap(eventId),
      api.getGlobeArcs(eventId),
    ]).then(([h, a]) => {
      setHeatmap(h);
      setArcs(a);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [eventId]);

  return { heatmap, arcs, loading };
}

// ── Simulation ───────────────────────────────────────────────────────────────
export function useSimulation() {
  const [result, setResult] = useState<api.ApiSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback(async (params: {
    title: string;
    type: string;
    severity: number;
    location: { lat: number; lng: number; country: string; region?: string };
  }) => {
    setLoading(true);
    try {
      const res = await api.simulateEvent(params);
      setResult(res);
      return res;
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, simulate };
}
