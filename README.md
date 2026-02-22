# Nexus Frontend

Real-time financial intelligence dashboard with an interactive Mapbox GL globe showing how geopolitical events propagate as market shockwaves across countries, sectors, and stocks.

Built for **Hacklytics 2026** (Finance track) by team **Nexus**.

> The app runs without a backend or API keys — all services degrade gracefully to seed/mock data.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (port 5173)
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_URL` | No | Backend URL (defaults to `http://localhost:3000/api` in dev, `/api` in prod) |
| `VITE_MAPBOX_TOKEN` | Yes | Mapbox GL token for globe rendering |

Without `VITE_MAPBOX_TOKEN`, the globe shows a `[MAP OFFLINE]` fallback.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server with HMR (port 5173) |
| `npm run build` | Production build (type-check + bundle) |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Playwright e2e tests (auto-starts dev server) |
| `npm run test:headed` | Playwright with visible browser |

## Features

- **Interactive Globe** — Mapbox GL globe with GeoJSON layers for shock heatmaps, stock dots (gain/loss coloring), and arc lines between event origins and affected destinations
- **AI Chat** — Sliding panel with SSE streaming from the backend RAG-powered financial analyst
- **What-If Simulation** — Modal to simulate hypothetical geopolitical events and see projected market impact
- **OSINT Upload** — Drag-and-drop satellite/CCTV image analysis via OpenAI Vision
- **Stock Charts** — Recharts OHLC charts with optional AI price prediction overlay and confidence bands
- **Global Search** — `Cmd+K` to search stocks and events
- **Live Ticker Bar** — Scrolling marquee of real-time stock quotes
- **Sector Breakdown** — Right panel grouping stocks by sector with shock impact scores

## Tech Stack

- **React 18** + **TypeScript** (strict mode)
- **Vite** with `@tailwindcss/vite` (Tailwind CSS 4, no config file)
- **Mapbox GL** for the 3D globe
- **Recharts** for stock charts
- **Radix UI** primitives (shadcn/ui pattern)
- **Socket.io** for real-time data push
- **Lucide** icons
- **Motion** (Framer Motion) for animations

## Architecture

Single-page dashboard with a fixed-pixel layout (no routing).

```
┌─────────────────────────────────────────────────────┐
│ Header (40px)                                       │
│ TickerBar (24px, scrolling marquee)                 │
├───────────┬─────────────────────────┬───────────────┤
│ OsintFeed │ GlobeScene (flex 55%)   │ StocksBySector│
│ (320px)   ├─────────────────────────┤ (300px)       │
│           │ StockChart (flex 45%)   │               │
├───────────┴─────────────────────────┴───────────────┤
│ StatusBar (20px — socket connection state)          │
└─────────────────────────────────────────────────────┘
Overlays: SearchOverlay (Cmd+K), AlertsPanel, ChatPanel, SimulationForm
```

### Design

Dark terminal/CRT aesthetic — monospace fonts (Geist Mono), near-black surfaces, crimson accent color, and a scanline overlay effect.

## CI/CD

GitHub Actions deploys to S3 (`s3://hackalytics-frontend-prod/`) on push to `main`. Hashed assets get immutable caching; root files get `no-cache`.

## License

Built for Hacklytics 2026.
