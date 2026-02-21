import { useState, useEffect } from 'react';
import { SHOCK_META, FINNHUB_KEY } from '../../config';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

type Mode = 'LIVE' | 'REPLAY' | 'SIM';

// API status indicator — we can't know if open-meteo/gdelt are up without fetching,
// so we mark them as "always available" (no-key free APIs) and track Finnhub by key presence
function ApiDot({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <div
        className={active ? 'animate-pulse' : ''}
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: active ? 'var(--green)' : 'var(--red-dim)',
          flexShrink: 0,
        }}
      />
      <span style={{ ...MONO, fontSize: '7px', color: active ? 'var(--text-3)' : '#3a2020', letterSpacing: '0.08em' }}>
        {label}
      </span>
    </div>
  );
}

export function Header() {
  const [clock, setClock] = useState('');
  const [mode, setMode] = useState<Mode>('LIVE');
  const hasFinnhub = Boolean(FINNHUB_KEY);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const date = d.toISOString().slice(0, 10);
      const hh = d.getUTCHours().toString().padStart(2, '0');
      const mm = d.getUTCMinutes().toString().padStart(2, '0');
      const ss = d.getUTCSeconds().toString().padStart(2, '0');
      setClock(`${date} ${hh}:${mm}:${ss}Z`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        paddingLeft: '12px',
        paddingRight: '12px',
        gap: '0',
      }}
    >
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', flexShrink: 0 }}>
        <span
          style={{
            ...COND,
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--red)',
            letterSpacing: '0.12em',
            lineHeight: 1,
          }}
        >
          NEXUS
        </span>
        <span
          style={{
            ...MONO,
            fontSize: '7px',
            color: 'var(--text-3)',
            letterSpacing: '0.14em',
            marginLeft: '6px',
            alignSelf: 'center',
          }}
        >
          SHOCKGLOBE v3.0
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 12px', flexShrink: 0 }} />

      {/* Active event badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 8px',
          border: '1px solid var(--red-dim)',
          backgroundColor: '#0f0404',
          flexShrink: 0,
        }}
      >
        <div
          className="animate-pulse"
          style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--red)', flexShrink: 0 }}
        />
        <span style={{ ...MONO, fontSize: '8px', color: 'var(--red)', letterSpacing: '0.1em' }}>
          {SHOCK_META.id}
        </span>
        <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>|</span>
        <span
          style={{
            ...MONO,
            fontSize: '8px',
            color: 'var(--text-2)',
            letterSpacing: '0.04em',
            maxWidth: '260px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {SHOCK_META.title.toUpperCase()}
        </span>
        <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>|</span>
        <span style={{ ...MONO, fontSize: '8px', color: 'var(--red-bright)', letterSpacing: '0.08em' }}>
          {SHOCK_META.severity}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* API status row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '2px 10px',
          borderLeft: '1px solid var(--border-dim)',
          borderRight: '1px solid var(--border-dim)',
          marginRight: '10px',
          height: '100%',
        }}
      >
        <ApiDot label="NEXUS-API" active />
        <ApiDot label="OPEN-METEO" active />
        <ApiDot label="GDELT" active />
        <ApiDot label="FINNHUB" active={hasFinnhub} />
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', flexShrink: 0, marginRight: '12px' }}>
        {(['LIVE', 'REPLAY', 'SIM'] as Mode[]).map((m, i) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              ...MONO,
              fontSize: '8px',
              letterSpacing: '0.1em',
              padding: '2px 8px',
              border: '1px solid var(--border-dim)',
              borderLeft: i === 0 ? '1px solid var(--border-dim)' : 'none',
              backgroundColor: mode === m ? 'var(--bg-raised)' : 'transparent',
              color: mode === m ? (m === 'LIVE' ? 'var(--red)' : 'var(--text-2)') : 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {m === 'LIVE' && mode === 'LIVE' && (
              <span
                className="animate-pulse"
                style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--red)' }}
              />
            )}
            {m}
          </button>
        ))}
      </div>

      {/* UTC clock */}
      <div
        style={{
          ...MONO,
          fontSize: '9px',
          color: 'var(--text-3)',
          letterSpacing: '0.04em',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {clock}
      </div>
    </header>
  );
}
