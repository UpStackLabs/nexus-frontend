// ShockGlobe — Application Configuration
// Live API endpoints + application constants (no hardcoded data values)

export const API = {
  exchangeRate: 'https://open.er-api.com/v6/latest',
  gdelt: 'https://api.gdeltproject.org/api/v2/doc/doc',
} as const;

// Stocks to track — tied to the Venezuelan invasion shock scenario
export const WATCHLIST = ['LMT', 'RTX', 'NOC', 'XOM', 'CVX', 'VXX', 'GLD', 'USO', 'BNO'] as const;

// Display stocks shown in StockPanel / StockChart
export const DISPLAY_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA', 'AMZN', 'META', 'PLTR'] as const;

// FX currencies to track relative to USD
export const FX_CURRENCIES = ['BRL', 'EUR', 'GBP', 'SAR'] as const;

// GDELT search query for geopolitical events
export const GDELT_QUERY = 'Venezuela military invasion Guyana Essequibo';
