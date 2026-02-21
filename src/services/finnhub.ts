import { API, FINNHUB_KEY } from '../config';

export interface Quote {
  c: number;   // current price
  h: number;   // day high
  l: number;   // day low
  o: number;   // open price
  pc: number;  // previous close
  t: number;   // unix timestamp
  // computed
  dp: number;  // % change from prev close
  d: number;   // absolute change
}

export interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface Candle {
  c: number[];   // close prices
  h: number[];   // highs
  l: number[];   // lows
  o: number[];   // opens
  t: number[];   // timestamps
  v: number[];   // volumes
  s: string;     // status
}

function headers(): HeadersInit {
  return FINNHUB_KEY ? { 'X-Finnhub-Token': FINNHUB_KEY } : {};
}

function assertKey() {
  if (!FINNHUB_KEY) throw new Error('VITE_FINNHUB_KEY not set');
}

export async function fetchQuote(symbol: string): Promise<Quote> {
  assertKey();
  const res = await fetch(`${API.finnhub}/quote?symbol=${symbol}`, { headers: headers() });
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  const dp = data.pc > 0 ? ((data.c - data.pc) / data.pc) * 100 : 0;
  return { ...data, dp, d: data.c - data.pc };
}

export async function fetchQuotes(symbols: readonly string[]): Promise<Record<string, Quote>> {
  const results = await Promise.allSettled(symbols.map(s => fetchQuote(s).then(q => [s, q] as const)));
  return Object.fromEntries(
    results
      .filter((r): r is PromiseFulfilledResult<readonly [string, Quote]> => r.status === 'fulfilled')
      .map(r => r.value)
  );
}

export async function fetchMarketNews(category = 'general'): Promise<NewsItem[]> {
  assertKey();
  const res = await fetch(`${API.finnhub}/news?category=${category}`, { headers: headers() });
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return Array.isArray(data) ? data.slice(0, 40) : [];
}

export async function fetchCandles(
  symbol: string,
  resolution: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M',
  from: number,
  to: number
): Promise<Candle> {
  assertKey();
  const url = `${API.finnhub}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  return res.json();
}
