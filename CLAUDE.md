# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Nexus frontend — a real-time financial intelligence dashboard with an interactive 3D globe showing how geopolitical events propagate as market shockwaves. Part of a monorepo; see the parent `../CLAUDE.md` for full project context.

## Commands

```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # Production build (type-checks + bundles)
npm run preview  # Serve production build locally
```

No linter, formatter, or test runner is configured in the frontend.

## Architecture

Single-page dashboard with a fixed-pixel layout — no routing. Entry: `src/main.tsx` → `App.tsx` → `Dashboard`.

### Layout (dashboard.tsx)

```
┌─────────────────────────────────────────────────────┐
│ Header (40px)                                       │
├──────────┬─────────────────────────┬────────────────┤
│ Asset    │ Globe (canvas, 58%)     │ Shock Panel    │
│ Table    ├─────────────────────────┤ (260px)        │
│ (220px)  │ News Feed (42%)         │                │
├──────────┴─────────────────────────┴────────────────┤
│ StatusBar (20px)                                    │
└─────────────────────────────────────────────────────┘
```

Left and right panels are fixed-width; center column flexes. All panels use `overflow: hidden` with internal scroll.

### Data Flow

```
src/services/   → API client functions (fetch wrappers)
src/hooks/      → React hooks that poll services on intervals
src/app/components/ → UI components consuming hook state
src/config.ts   → API URLs, watchlist symbols, arc geometry, scenario metadata
```

Each hook (`useStockData`, `useNewsData`, `useFxData`, `useWeatherData`) manages its own polling interval and loading/error state. No global state management.

### External APIs (all free, no backend needed)

| Service | Module | Key Required | Refresh |
|---------|--------|-------------|---------|
| Finnhub | `services/finnhub.ts` | `VITE_FINNHUB_KEY` in `.env.local` | 30s |
| GDELT v2 | `services/gdelt.ts` | None | 2min |
| Open Exchange Rates | `services/fx.ts` | None | 1min |
| Open-Meteo | `services/weather.ts` | None | 5min |

The app works without any API keys — components show "N/A" or warnings gracefully.

### 3D Globe

`globe-view.tsx` is a custom **Canvas 2D** renderer (not Three.js/WebGL). It draws wireframe grid lines, animated arc particles between shock epicenter and destination cities, and orbital rings. Supports mouse drag rotation with auto-rotate resume after 4s idle.

### Mock/Demo Data

`mock-data.ts` contains the Venezuelan invasion shock scenario with typed interfaces (`ShockEvent`, `ShockArc`, `ShockAsset`, `TimelineEvent`) and color maps. This is the demo dataset for the hackathon presentation.

## Design System

**Theme:** "Palantir Industrial" — defined in `src/styles/theme.css` via CSS custom properties.

- **Fonts:** IBM Plex Mono (body, data), IBM Plex Sans Condensed (headings, large numbers). Loaded from Google Fonts in `fonts.css`.
- **Colors:** Near-black surfaces (`--bg: #0a0a0a`), warm off-white text (`--text: #ccc7c0`), crimson accent (`--red: #c42020`). Status colors: `--green`, `--amber`, `--blue`.
- **Borders:** All radii are `0px` (sharp corners). Thin 1px borders using `--border` / `--border-dim`.
- **Font sizes:** Very small (7-10px) monospace throughout — military/intelligence terminal aesthetic.

Components use inline `style` objects with shared `MONO` / `COND` CSSProperties constants rather than Tailwind for typography. Tailwind is used for layout utilities (`flex`, `grid`, `overflow`, spacing).

### Tailwind CSS 4

Uses `@tailwindcss/vite` plugin (no `tailwind.config.js`). Configuration lives in:
- `src/styles/tailwind.css` — source directive and tw-animate-css import
- `src/styles/theme.css` — `@theme inline` block maps CSS vars to Tailwind color tokens

## Conventions

- Path alias: `@/` resolves to `./src/` (configured in both `vite.config.ts` and `tsconfig.json`)
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`
- Components are named exports (not default), one component per file
- All components use function declarations (`export function Foo()`)
- Icons from `lucide-react`
