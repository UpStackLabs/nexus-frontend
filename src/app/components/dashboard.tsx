import { Header } from './header';
import { GlobeView } from './globe-view';
import { AssetTable } from './asset-table';
import { NewsFeed } from './news-feed';
import { ShockPanel } from './shock-panel';
import { SHOCK_META } from '../../config';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };

function StatusBar() {
  return (
    <div
      style={{
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '12px',
        paddingRight: '12px',
        borderTop: '1px solid var(--border-dim)',
        backgroundColor: 'var(--bg)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)', letterSpacing: '0.1em' }}>
          SHOCKGLOBE INTELLIGENCE PLATFORM
        </span>
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>
          EVENT: {SHOCK_META.id}
        </span>
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>
          SCORE: {SHOCK_META.shockScore}/10
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)', letterSpacing: '0.08em' }}>
          DATA: OPEN-METEO / GDELT / ER-API / FINNHUB
        </span>
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--green)', letterSpacing: '0.06em' }}>
          SYSTEM NOMINAL
        </span>
      </div>
    </div>
  );
}

export function Dashboard() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--bg)',
      }}
    >
      {/* Top bar: 40px */}
      <Header />

      {/* Main content row */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Left panel: Asset watchlist + FX — 220px */}
        <div
          style={{
            width: '220px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <AssetTable />
        </div>

        {/* Center column: Globe (top) + News feed (bottom) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {/* Globe — takes ~58% of the center column height */}
          <div style={{ flex: '0 0 58%', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
            <GlobeView />
          </div>

          {/* Intelligence feed — takes remaining ~42% */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <NewsFeed />
          </div>
        </div>

        {/* Right panel: Shock analysis — 260px */}
        <div
          style={{
            width: '260px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <ShockPanel />
        </div>
      </div>

      {/* Bottom status bar: 20px */}
      <StatusBar />
    </div>
  );
}
