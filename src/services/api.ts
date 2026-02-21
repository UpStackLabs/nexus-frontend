// ShockGlobe — Backend API Service Layer
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

export async function getEvent(id: string): Promise<ApiEvent> {
  return fetchJson(`/events/${id}`);
}

export async function getEventShocks(id: string): Promise<ApiShockScore[]> {
  return fetchJson(`/events/${id}/shocks`);
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

export interface ApiShockScore {
  eventId: string;
  ticker: string;
  companyName: string;
  score: number;
  similarityScore: number;
  historicalSensitivity: number;
  geographicProximity: number;
  supplyChainLinkage: number;
  predictedChange: number;
  actualChange: number | null;
  surpriseFactor: number | null;
  confidence: number;
  direction: 'up' | 'down';
}

export interface ApiStockAnalysis {
  ticker: string;
  companyName: string;
  sector: string;
  country: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  relevantEvents: { eventId: string; title: string; type: string; severity: number; shockScore: number }[];
  shockAnalysis: {
    overallRiskLevel: string;
    compositeShockScore: number;
    topContributors: { factor: string; value: number }[];
  };
  analyzedAt: string;
}

export async function getStocks(params?: {
  sector?: string;
  country?: string;
}): Promise<{ data: ApiStock[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.sector) query.set('sector', params.sector);
  if (params?.country) query.set('country', params.country);
  const qs = query.toString();
  return fetchJson(`/stocks${qs ? `?${qs}` : ''}`);
}

export async function getStockAnalysis(ticker: string): Promise<ApiStockAnalysis> {
  return fetchJson(`/stocks/${ticker}/analysis`);
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

export async function getGlobeMarkers(): Promise<{
  id: string;
  title: string;
  lat: number;
  lng: number;
  type: string;
  severity: number;
  rippleRadius: number;
}[]> {
  return fetchJson('/globe/markers');
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
  type: string;
  severity: number;
  location: { lat: number; lng: number; country: string; region?: string };
}): Promise<ApiSimulationResult> {
  return fetchJson('/simulate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

// ── Historical ───────────────────────────────────────────────────────────────
export async function getHistoricalSimilar(params?: {
  eventId?: string;
  description?: string;
  limit?: number;
}): Promise<ApiEvent[]> {
  const query = new URLSearchParams();
  if (params?.eventId) query.set('eventId', params.eventId);
  if (params?.description) query.set('description', params.description);
  if (params?.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return fetchJson(`/historical/similar${qs ? `?${qs}` : ''}`);
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

// ── Health ────────────────────────────────────────────────────────────────────
export async function getHealth(): Promise<{ status: string; uptime: number; timestamp: string }> {
  return fetchJson('/health');
}
