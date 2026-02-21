// ShockGlobe — Application Configuration
// Live API endpoints + application constants (no hardcoded data values)

export const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY;

export const API = {
  finnhub: 'https://finnhub.io/api/v1',
  openMeteo: 'https://api.open-meteo.com/v1',
  exchangeRate: 'https://open.er-api.com/v6/latest',
  gdelt: 'https://api.gdeltproject.org/api/v2/doc/doc',
} as const;

// Stocks to track — tied to the Venezuelan invasion shock scenario
export const WATCHLIST = ['LMT', 'RTX', 'NOC', 'XOM', 'CVX', 'VXX', 'GLD', 'USO', 'BNO'] as const;
export type WatchlistSymbol = (typeof WATCHLIST)[number];

// FX currencies to track relative to USD
export const FX_CURRENCIES = ['BRL', 'EUR', 'GBP', 'SAR'] as const;

// Locations for weather data — shock epicenter + downstream hubs
export const WEATHER_LOCATIONS = [
  { name: 'Caracas', country: 'VEN', lat: 10.48, lon: -66.88 },
  { name: 'Houston', country: 'USA', lat: 29.76, lon: -95.37 },
  { name: 'Washington', country: 'USA', lat: 38.89, lon: -77.03 },
] as const;

// GDELT search query for geopolitical events
export const GDELT_QUERY = 'Venezuela military invasion Guyana Essequibo';

// Globe arc configuration — purely geometric/logical, not data
export const SHOCK_ARCS = [
  { from: { lat: 10.48, lng: -66.88 }, to: { lat: 29.76, lng: -95.37 }, city: 'HOU', type: 'OIL' },
  { from: { lat: 10.48, lng: -66.88 }, to: { lat: 38.89, lng: -77.03 }, city: 'DC', type: 'DEFENSE' },
  { from: { lat: 10.48, lng: -66.88 }, to: { lat: 51.51, lng: -0.12 }, city: 'LON', type: 'DEFENSE' },
  { from: { lat: 10.48, lng: -66.88 }, to: { lat: -23.55, lng: -46.63 }, city: 'GRU', type: 'FX' },
  { from: { lat: 10.48, lng: -66.88 }, to: { lat: 24.68, lng: 46.72 }, city: 'RUH', type: 'OIL' },
  { from: { lat: 10.48, lng: -66.88 }, to: { lat: 51.92, lng: 4.47 }, city: 'RTM', type: 'OIL' },
] as const;

export const EPICENTER = { lat: 10.48, lng: -66.88, label: 'CARACAS' } as const;

// Shock scenario metadata (not price data — conceptual/classification)
export const SHOCK_META = {
  id: 'VEN-2026-001',
  title: 'Venezuelan Invasion of Guyana',
  type: 'GEOPOLITICAL',
  severity: 'CRITICAL',
  timestamp: '2026-02-20T06:34:00Z',
  shockScore: 8.7,
  surpriseFactor: 2.4,
} as const;
