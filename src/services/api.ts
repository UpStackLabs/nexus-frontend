// Nexus — Backend API Service Layer
// All calls to the NestJS backend at /api/*

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${path}: ${res.status} ${res.statusText}`);
  return res.json();
}

// ── Events ──────────────────────────────────────────────────────────────────
export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: number;
  location: { lat: number; lng: number; country: string; region?: string };
  timestamp: string;
  source: string;
  affectedCountries: string[];
  affectedSectors: string[];
  affectedTickers: string[];
  isSimulated: boolean;
}

export async function getEvents(params?: {
  type?: string;
  minSeverity?: number;
  maxSeverity?: number;
}): Promise<{ data: ApiEvent[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.minSeverity) query.set('minSeverity', String(params.minSeverity));
  if (params?.maxSeverity) query.set('maxSeverity', String(params.maxSeverity));
  const qs = query.toString();
  return fetchJson(`/events${qs ? `?${qs}` : ''}`);
}

// ── Stocks ───────────────────────────────────────────────────────────────────
export interface ApiStock {
  ticker: string;
  companyName: string;
  sector: string;
  country: string;
  exchange: string;
  marketCap: number;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  location: { lat: number; lng: number };
}

export async function getStocks(params?: {
  sector?: string;
  country?: string;
}): Promise<{ data: ApiStock[]; total: number }> {
  const query = new URLSearchParams();
  query.set('limit', '500');
  if (params?.sector) query.set('sector', params.sector);
  if (params?.country) query.set('country', params.country);
  return fetchJson(`/stocks?${query.toString()}`);
}

export interface StockHistoryPoint {
  date: string;
  price: number;
  volume: number;
}

export async function getStockHistory(
  ticker: string,
  timeframe = '1M',
): Promise<StockHistoryPoint[]> {
  return fetchJson(`/stocks/${ticker}/history?timeframe=${timeframe}`);
}

// ── Globe ────────────────────────────────────────────────────────────────────
export interface ApiHeatmapEntry {
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  shockIntensity: number;
  affectedSectors: string[];
  topAffectedStocks: string[];
  direction: 'positive' | 'negative' | 'mixed';
}

export interface ApiConnectionArc {
  id: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  fromLabel: string;
  toLabel: string;
  shockIntensity: number;
  direction: 'positive' | 'negative';
  color: string;
  eventId: string;
  sector?: string;
}

export async function getGlobeHeatmap(eventId?: string): Promise<ApiHeatmapEntry[]> {
  return fetchJson(`/globe/heatmap${eventId ? `?eventId=${eventId}` : ''}`);
}

export async function getGlobeArcs(eventId?: string): Promise<ApiConnectionArc[]> {
  return fetchJson(`/globe/arcs${eventId ? `?eventId=${eventId}` : ''}`);
}

/** Vector-DB proximity: countries historically similar to a given event embedding. */
export async function getGlobeVectorProximity(eventId: string): Promise<ApiHeatmapEntry[]> {
  return fetchJson(`/globe/vector-proximity?eventId=${eventId}`);
}

export async function getEvent(id: string): Promise<ApiEvent> {
  return fetchJson(`/events/${id}`);
}

// ── Sectors ──────────────────────────────────────────────────────────────────
export interface ApiSector {
  sector: string;
  averageShockScore: number;
  predictedDirection: string;
  stockCount: number;
  topAffectedStocks: { ticker: string; companyName: string; shockScore: number; direction: string }[];
}

export async function getSectors(): Promise<ApiSector[]> {
  return fetchJson('/sectors');
}

// ── Simulation ───────────────────────────────────────────────────────────────
export interface ApiShockScore {
  eventId: string;
  ticker: string;
  companyName: string;
  sector: string;
  country: string;
  score: number;
  predictedChange: number;
  confidence: number;
  direction: 'up' | 'down';
}

export interface ApiSimulationResult {
  simulatedEventId: string;
  title: string;
  shocks: ApiShockScore[];
  heatmap: ApiHeatmapEntry[];
  arcs: ApiConnectionArc[];
  interlinkednessScore: number;
  totalAffectedCompanies: number;
  totalAffectedCountries: number;
  topAffectedSectors: { sector: string; averageShockScore: number; predictedDirection: string }[];
}

export async function simulateEvent(params: {
  title: string;
  description?: string;
  type: string;
  severity: number;
  location: { lat: number; lng: number; country: string; region?: string };
}): Promise<ApiSimulationResult> {
  return fetchJson('/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Chat ─────────────────────────────────────────────────────────────────────
export interface ChatResponse {
  response: string;
  model: string;
}

export async function chat(
  message: string,
  history?: { role: 'user' | 'assistant'; content: string }[],
): Promise<ChatResponse> {
  return fetchJson('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export async function chatStream(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[] = [],
  onToken: (token: string) => void,
  onDone: () => void,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) throw new Error(`Chat stream: ${res.status}`);

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.token) onToken(json.token);
          if (json.done) onDone();
        } catch {
          // skip malformed SSE
        }
      }
    }
  }
  onDone();
}

// ── OSINT ────────────────────────────────────────────────────────────────────
export interface OsintResult {
  id: string;
  imageUrl: string;
  context: string | null;
  coordinates: { lat: number; lng: number } | null;
  vision: {
    detections: { label: string; confidence: number; bbox: { x1: number; y1: number; x2: number; y2: number } }[];
    classifications: { label: string; score: number }[];
    imageSize: [number, number];
    processingTimeMs: number;
  };
  classification: {
    type: string;
    severity: number;
    location: string;
    affectedCountries: string[];
    affectedSectors: string[];
    affectedTickers: string[];
  };
  eventId: string | null;
  timestamp: string;
}

export async function analyzeOsint(params: {
  imageUrl: string;
  context?: string;
  coordinates?: string;
}): Promise<OsintResult> {
  return fetchJson('/osint/analyze', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Predictions ─────────────────────────────────────────────────────────────
export interface ApiPredictionPoint {
  date: string;
  price: number;
  upper: number;
  lower: number;
}

export interface ApiShockFactor {
  eventTitle: string;
  type: string;
  severity: number;
  impactScore: number;
  direction: 'up' | 'down';
}

export interface ApiPredictionResult {
  ticker: string;
  companyName: string;
  currentPrice: number;
  trajectory: ApiPredictionPoint[];
  shockFactors: ApiShockFactor[];
  aiSummary: string;
  confidence: number;
  generatedAt: string;
}

export async function getStockPrediction(
  ticker: string,
  days = 30,
): Promise<ApiPredictionResult> {
  return fetchJson(`/stocks/${ticker}/predict?days=${days}`);
}

// ── Quotes (proxy for Finnhub-style data) ───────────────────────────────────
export interface ApiQuote {
  c: number;   // current price
  h: number;   // day high
  l: number;   // day low
  o: number;   // open price
  pc: number;  // previous close
  d: number;   // absolute change
  dp: number;  // percent change
  t: number;   // unix timestamp
}

export async function getQuotes(
  symbols: readonly string[],
): Promise<Record<string, ApiQuote>> {
  return fetchJson(`/stocks/quotes?symbols=${symbols.join(',')}`);
}

// ── News ─────────────────────────────────────────────────────────────────────
export interface NewsDisplayItem {
  title: string;
  source: string;
  publishedAt: string;
}

export async function getNews(): Promise<NewsDisplayItem[]> {
  return fetchJson('/ingest/news');
}

// ── Health ────────────────────────────────────────────────────────────────────
export async function getHealth(): Promise<{ status: string; uptime: number; timestamp: string }> {
  return fetchJson('/health');
}

