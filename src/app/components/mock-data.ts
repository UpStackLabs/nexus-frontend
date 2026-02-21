// ShockGlobe — Venezuelan Invasion Scenario
// Hacklytics 2026 Demo Data

export interface ShockEvent {
  id: string;
  title: string;
  subtitle: string;
  epicenter: { lat: number; lng: number; name: string };
  shockScore: number;
  surpriseFactor: number;
  timestamp: string;
  type: 'GEOPOLITICAL' | 'ECONOMIC' | 'WEATHER' | 'CYBER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ShockArc {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number; name: string; city: string };
  type: 'OIL' | 'DEFENSE' | 'SAFE_HAVEN' | 'FX';
  impact: number;
  ticker: string;
}

export interface ShockAsset {
  ticker: string;
  name: string;
  change: number;
  surpriseFlag?: boolean;
  type: string;
  surpriseSigma?: number;
}

export interface TimelineEvent {
  time: string;
  title: string;
  category: 'GEO' | 'ECON' | 'MARKET' | 'WEATHER';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const shockEvent: ShockEvent = {
  id: 'VEN-2026-001',
  title: 'Venezuelan Military Invasion of Guyana',
  subtitle: 'Maduro regime crosses Essequibo River; NATO consultations initiated',
  epicenter: { lat: 10.48, lng: -66.88, name: 'Caracas, VEN' },
  shockScore: 8.7,
  surpriseFactor: 2.4,
  timestamp: '2026-02-20T06:34:00Z',
  type: 'GEOPOLITICAL',
  severity: 'CRITICAL',
};

export const shockArcs: ShockArc[] = [
  {
    from: { lat: 10.48, lng: -66.88 },
    to: { lat: 29.76, lng: -95.37, name: 'Houston, TX', city: 'HOU' },
    type: 'OIL',
    impact: -4.2,
    ticker: 'XOM',
  },
  {
    from: { lat: 10.48, lng: -66.88 },
    to: { lat: 38.89, lng: -77.03, name: 'Washington, DC', city: 'DC' },
    type: 'DEFENSE',
    impact: +8.1,
    ticker: 'LMT',
  },
  {
    from: { lat: 10.48, lng: -66.88 },
    to: { lat: 51.51, lng: -0.12, name: 'London, UK', city: 'LON' },
    type: 'DEFENSE',
    impact: +6.3,
    ticker: 'BA.L',
  },
  {
    from: { lat: 10.48, lng: -66.88 },
    to: { lat: -23.55, lng: -46.63, name: 'São Paulo, BRA', city: 'GRU' },
    type: 'FX',
    impact: -2.3,
    ticker: 'BRL',
  },
  {
    from: { lat: 10.48, lng: -66.88 },
    to: { lat: 24.68, lng: 46.72, name: 'Riyadh, KSA', city: 'RUH' },
    type: 'OIL',
    impact: +3.1,
    ticker: 'OPEC+',
  },
  {
    from: { lat: 10.48, lng: -66.88 },
    to: { lat: 51.92, lng: 4.47, name: 'Rotterdam, NLD', city: 'RTM' },
    type: 'OIL',
    impact: -2.8,
    ticker: 'BRENT',
  },
];

export const shockAssets: ShockAsset[] = [
  { ticker: 'LMT', name: 'Lockheed Martin', change: +8.4, surpriseFlag: true, type: 'DEFENSE', surpriseSigma: 2.4 },
  { ticker: 'RTX', name: 'Raytheon Tech.', change: +7.1, type: 'DEFENSE' },
  { ticker: 'NOC', name: 'Northrop Grumman', change: +5.9, type: 'DEFENSE' },
  { ticker: 'CL=F', name: 'WTI Crude Oil', change: +6.2, type: 'COMMODITY' },
  { ticker: 'VXX', name: 'VIX Futures', change: +31.4, type: 'VOLATILITY' },
  { ticker: 'XOM', name: 'ExxonMobil', change: -3.8, type: 'OIL' },
  { ticker: 'CVX', name: 'Chevron', change: -4.1, type: 'OIL' },
  { ticker: 'GLD', name: 'Gold Spot', change: +1.9, type: 'SAFE_HAVEN' },
  { ticker: 'BRL/USD', name: 'Brazilian Real', change: -2.3, type: 'FX' },
  { ticker: 'USO', name: 'US Oil ETF', change: +5.8, type: 'COMMODITY' },
];

export const timelineEvents: TimelineEvent[] = [
  {
    time: '03:12',
    title: 'Satellite Imagery Anomaly',
    category: 'GEO',
    description: 'SENTINEL-2 detects military convoy movement near Essequibo border',
    severity: 'MEDIUM',
  },
  {
    time: '04:45',
    title: 'SIGINT Intercept',
    category: 'GEO',
    description: 'Encrypted comm surge from VEN military command, unusual traffic patterns',
    severity: 'HIGH',
  },
  {
    time: '05:20',
    title: 'Pre-Market Volatility',
    category: 'MARKET',
    description: 'CL futures spike 2.1% on thin liquidity; algo triggers detected',
    severity: 'MEDIUM',
  },
  {
    time: '06:34',
    title: '■ INVASION CONFIRMED',
    category: 'GEO',
    description: 'VEN armor crosses international border; Georgetown on lockdown',
    severity: 'CRITICAL',
  },
  {
    time: '06:41',
    title: 'Pentagon Activation',
    category: 'GEO',
    description: 'SOUTHCOM elevated alert; USS George Washington diverted to Caribbean',
    severity: 'CRITICAL',
  },
  {
    time: '06:55',
    title: 'NYSE Circuit Breaker',
    category: 'MARKET',
    description: 'Level 1 triggered; S&P -7.2% at open, trading halted 15 min',
    severity: 'CRITICAL',
  },
  {
    time: '07:18',
    title: 'OPEC Emergency Call',
    category: 'ECON',
    description: 'Saudi Aramco coordinates emergency supply response, WTI +6.2%',
    severity: 'HIGH',
  },
  {
    time: '07:45',
    title: 'NATO Article 4',
    category: 'GEO',
    description: 'Collective consultation invoked; UK, US forces placed on standby',
    severity: 'HIGH',
  },
];

export const arcTypeColors: Record<string, string> = {
  OIL: '#f59e0b',
  DEFENSE: '#00ff88',
  SAFE_HAVEN: '#38bdf8',
  FX: '#a78bfa',
};

export const severityColors: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
};

export const categoryColors: Record<string, string> = {
  GEO: '#ef4444',
  ECON: '#f59e0b',
  MARKET: '#38bdf8',
  WEATHER: '#22c55e',
};

export const assetTypeColors: Record<string, string> = {
  DEFENSE: '#00ff88',
  OIL: '#f59e0b',
  COMMODITY: '#f59e0b',
  FX: '#a78bfa',
  SAFE_HAVEN: '#38bdf8',
  VOLATILITY: '#ef4444',
};
