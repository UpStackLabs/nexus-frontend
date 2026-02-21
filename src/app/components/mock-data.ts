// Mock stock data — used as fallback / sparkline base when Finnhub key not set
export const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: 247.83, change: +2.14, changePercent: +0.87, volume: "52.3M" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 478.92, change: -3.21, changePercent: -0.67, volume: "28.1M" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 892.45, change: +18.33, changePercent: +2.10, volume: "45.7M" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 187.64, change: +1.05, changePercent: +0.56, volume: "21.4M" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 342.17, change: -8.92, changePercent: -2.54, volume: "67.2M" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 213.58, change: +0.83, changePercent: +0.39, volume: "33.8M" },
  { symbol: "META", name: "Meta Platforms", price: 612.30, change: +5.67, changePercent: +0.93, volume: "18.9M" },
  { symbol: "PLTR", name: "Palantir Tech.", price: 78.42, change: +4.21, changePercent: +5.67, volume: "89.3M" },
];

// Stock chart data generator
export function generateStockHistory(basePrice: number, volatility: number = 0.02, numDays = 30) {
  const data = [];
  let price = basePrice * 0.95;
  for (let i = numDays; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price = price + (Math.random() - 0.48) * basePrice * volatility;
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.round(price * 100) / 100,
      volume: Math.round(Math.random() * 50 + 10) * 1000000,
    });
  }
  return data;
}

// Intraday (30-min bars) mock data for 1D view
export function generateIntraday(basePrice: number, volatility = 0.008) {
  const data = [];
  let price = basePrice * 0.993;
  const now = new Date();
  const open = new Date(now);
  open.setUTCHours(14, 30, 0, 0); // 9:30 AM ET
  const bars = 13; // 6.5 h × 2 bars/h = 13
  for (let i = 0; i < bars; i++) {
    const t = new Date(open.getTime() + i * 30 * 60_000);
    if (t > now) break;
    price = price + (Math.random() - 0.48) * basePrice * volatility;
    data.push({
      date: t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      price: Math.round(price * 100) / 100,
      volume: Math.round(Math.random() * 10 + 2) * 1_000_000,
    });
  }
  return data;
}

// OSINT Events — used as globe markers and impact correlation baseline
export const osintEvents = [
  {
    id: 1,
    type: "GEOPOLITICAL",
    severity: "HIGH",
    title: "South China Sea Military Buildup Detected",
    description: "Satellite imagery confirms increased naval presence in disputed waters. 14 vessels identified.",
    timestamp: "2026-02-21T08:32:00Z",
    lat: 15.5,
    lng: 114.2,
    impactedStocks: ["PLTR", "LMT", "RTX"],
    impact: -2.3,
    source: "SAT-IMAGERY / OSINT-7",
  },
  {
    id: 2,
    type: "WEATHER",
    severity: "CRITICAL",
    title: "Category 4 Hurricane Approaching Gulf Coast",
    description: "Hurricane Elena tracking toward Texas coast. Oil infrastructure at risk. Landfall estimated 48hrs.",
    timestamp: "2026-02-21T07:15:00Z",
    lat: 26.1,
    lng: -93.4,
    impactedStocks: ["XOM", "CVX", "OXY"],
    impact: +4.7,
    source: "NOAA / WEATHER-SAT",
  },
  {
    id: 3,
    type: "CYBER",
    severity: "HIGH",
    title: "Major Ransomware Attack on European Banking",
    description: "Coordinated ransomware campaign targeting EU financial institutions. 3 banks confirmed compromised.",
    timestamp: "2026-02-21T06:48:00Z",
    lat: 48.8,
    lng: 2.3,
    impactedStocks: ["CRWD", "PANW", "FTNT"],
    impact: +8.2,
    source: "SIGINT / CYBER-OPS",
  },
  {
    id: 4,
    type: "SUPPLY_CHAIN",
    severity: "MEDIUM",
    title: "Taiwan Semiconductor Fab Shutdown",
    description: "TSMC Fab 18 reports unexpected maintenance shutdown. Advanced node production halted for 72hrs.",
    timestamp: "2026-02-21T05:22:00Z",
    lat: 24.8,
    lng: 120.9,
    impactedStocks: ["TSM", "NVDA", "AMD"],
    impact: -3.8,
    source: "HUMINT / SUPPLY-CHAIN",
  },
  {
    id: 5,
    type: "ECONOMIC",
    severity: "MEDIUM",
    title: "China PMI Data Below Expectations",
    description: "Manufacturing PMI came in at 48.2, below consensus of 50.1. Services sector also contracting.",
    timestamp: "2026-02-21T04:00:00Z",
    lat: 39.9,
    lng: 116.4,
    impactedStocks: ["BABA", "JD", "PDD"],
    impact: -5.1,
    source: "ECON-INT / NBS",
  },
  {
    id: 6,
    type: "GEOPOLITICAL",
    severity: "LOW",
    title: "EU-US Trade Negotiation Progress",
    description: "Sources confirm breakthrough in semiconductor trade talks. Tariff reduction expected Q2.",
    timestamp: "2026-02-21T03:15:00Z",
    lat: 50.8,
    lng: 4.4,
    impactedStocks: ["ASML", "INTC", "QCOM"],
    impact: +2.1,
    source: "DIPLO-INT / EU-COM",
  },
  {
    id: 7,
    type: "WEATHER",
    severity: "MEDIUM",
    title: "Drought Conditions Worsening in Midwest",
    description: "MODIS satellite data shows 67% of corn belt under severe drought. Crop yields at risk.",
    timestamp: "2026-02-20T22:30:00Z",
    lat: 41.5,
    lng: -93.1,
    impactedStocks: ["ADM", "DE", "MON"],
    impact: +3.4,
    source: "NASA-MODIS / USDA",
  },
  {
    id: 8,
    type: "CYBER",
    severity: "CRITICAL",
    title: "Zero-Day Exploit in Cloud Infrastructure",
    description: "Critical vulnerability discovered in major cloud provider. Active exploitation in the wild confirmed.",
    timestamp: "2026-02-20T20:10:00Z",
    lat: 37.4,
    lng: -122.1,
    impactedStocks: ["AMZN", "MSFT", "GOOGL"],
    impact: -1.8,
    source: "CVE-TRACK / CERT",
  },
];

// Globe event markers
export const globeMarkers = osintEvents.map((e) => ({
  lat: e.lat,
  lng: e.lng,
  label: e.title,
  severity: e.severity,
  type: e.type,
}));

// Satellite schedule
export const satellitePasses = [
  { name: "NOAA-20", nextPass: "14:32 UTC", elevation: "78deg", type: "WEATHER" },
  { name: "Sentinel-2B", nextPass: "15:08 UTC", elevation: "62deg", type: "IMAGERY" },
  { name: "GOES-18", nextPass: "GEOSTAT", elevation: "N/A", type: "WEATHER" },
  { name: "Landsat-9", nextPass: "16:45 UTC", elevation: "45deg", type: "IMAGERY" },
  { name: "WorldView-3", nextPass: "17:22 UTC", elevation: "71deg", type: "HIGH-RES" },
];

// Sector performance
export const sectorPerformance = [
  { sector: "Defense", change: +3.2, color: "#00c853" },
  { sector: "Energy", change: +2.8, color: "#00c853" },
  { sector: "Cybersecurity", change: +5.4, color: "#00c853" },
  { sector: "Semiconductors", change: -2.1, color: "#c41e3a" },
  { sector: "E-Commerce CN", change: -4.3, color: "#c41e3a" },
  { sector: "Cloud Infra", change: -1.2, color: "#c41e3a" },
  { sector: "Agriculture", change: +1.8, color: "#00c853" },
  { sector: "Financials EU", change: -1.5, color: "#c41e3a" },
];

// System status
export const systemStatus = {
  dataFeeds: 47,
  activeAlerts: 12,
  satellitesTracked: 23,
  signalsCaptured: 1847,
  uptime: "99.97%",
  lastSync: new Date().toISOString(),
  threatLevel: "ELEVATED",
};
