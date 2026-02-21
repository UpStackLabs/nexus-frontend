import { useState, useCallback } from 'react';
import { Header } from './header';
import { GlobeView } from './globe-view';
import { AssetTable } from './asset-table';
import { NewsFeed } from './news-feed';
import { ShockPanel } from './shock-panel';
import { ChatPanel } from './chat-panel';
import { EventSelector } from './event-selector';
import { SimulationForm } from './simulation-form';
import { SectorDrilldown } from './sector-drilldown';
import { LiveTicker } from './live-ticker';
import { OsintUpload } from './osint-upload';
import { useSocket } from '../../hooks/useSocket';
import { useEvents } from '../../hooks/useBackendData';
import { SHOCK_META } from '../../config';
import type { ApiSimulationResult } from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };

function StatusBar({ socketConnected }: { socketConnected: boolean }) {
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
          NEXUS INTELLIGENCE PLATFORM
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
        <div className="flex items-center gap-1">
          <div
            className={socketConnected ? 'animate-pulse' : ''}
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              backgroundColor: socketConnected ? 'var(--green)' : 'var(--red-dim)',
            }}
          />
          <span style={{ ...MONO, fontSize: '7px', color: socketConnected ? 'var(--green)' : 'var(--text-3)', letterSpacing: '0.06em' }}>
            {socketConnected ? 'WS CONNECTED' : 'WS OFFLINE'}
          </span>
        </div>
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--green)', letterSpacing: '0.06em' }}>
          SYSTEM NOMINAL
        </span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { connected, priceList } = useSocket();
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [, setSimResult] = useState<ApiSimulationResult | null>(null);

  const handleSimResult = useCallback((result: ApiSimulationResult) => {
    setSimResult(result);
  }, []);

  const tickerPrices = priceList().map(p => ({
    ticker: p.ticker,
    price: p.price,
    changePercent: p.changePercent,
  }));

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

      {/* Live price ticker */}
      <LiveTicker prices={tickerPrices} />

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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, position: 'relative' }}>
          {/* Globe controls overlay */}
          <div
            className="flex items-center gap-2"
            style={{
              position: 'absolute',
              top: '6px',
              left: '8px',
              zIndex: 30,
            }}
          >
            <EventSelector
              events={events}
              selectedEventId={selectedEventId}
              onSelect={setSelectedEventId}
            />
            <SimulationForm onResult={handleSimResult} />
            <OsintUpload />
          </div>

          {/* Globe — takes ~58% of the center column height */}
          <div style={{ flex: '0 0 58%', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
            <GlobeView />
          </div>

          {/* Intelligence feed — takes remaining ~42% */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <NewsFeed />
          </div>
        </div>

        {/* Right panel: Shock analysis + Sector Drilldown — 260px */}
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
          <div className="flex-1 overflow-y-auto">
            <ShockPanel />
            <SectorDrilldown />
          </div>
        </div>
      </div>

      {/* Bottom status bar: 20px */}
      <StatusBar socketConnected={connected} />

      {/* Chat panel (floating) */}
      <ChatPanel />
    </div>
  );
}
