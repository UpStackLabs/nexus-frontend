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

// Display stocks shown in StockPanel / StockChart
export const DISPLAY_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA', 'AMZN', 'META', 'PLTR'] as const;

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
