import { Loader } from 'lucide-react';
import { SHOCK_META, SHOCK_ARCS } from '../../config';
import { useWeatherData } from '../../hooks/useWeatherData';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      className="flex items-center justify-between px-3"
      style={{ height: '24px', borderBottom: '1px solid var(--border-dim)' }}
    >
      <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ ...MONO, fontSize: '10px', color: color ?? 'var(--text)' }}>{value}</span>
    </div>
  );
}

function SectionHeader({ children }: { children: string }) {
  return (
    <div
      className="px-3 py-1"
      style={{ borderBottom: '1px solid var(--border-dim)', borderTop: '1px solid var(--border)' }}
    >
      <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.12em' }}>{children}</span>
    </div>
  );
}

export function ShockPanel() {
  const { data: weather, loading: wLoading } = useWeatherData();

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: '32px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
      >
        <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)', letterSpacing: '0.12em' }}>SHOCK ANALYSIS</span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--red)' }} />
          <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>ACTIVE</span>
        </div>
      </div>

      <div>
        {/* Shock Score display */}
        <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.14em', marginBottom: '6px' }}>
            SHOCK SCORE
          </div>
          <div className="flex items-baseline gap-2">
            <span
              style={{
                ...COND,
                fontSize: '52px',
                fontWeight: 700,
                color: 'var(--red)',
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}
            >
              {SHOCK_META.shockScore}
            </span>
            <span style={{ ...MONO, fontSize: '18px', color: 'var(--text-3)' }}>/10</span>
          </div>
          {/* Bar */}
          <div
            className="mt-2"
            style={{ height: '2px', backgroundColor: 'var(--bg-raised)', position: 'relative' }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${SHOCK_META.shockScore * 10}%`,
                backgroundColor: 'var(--red)',
              }}
            />
          </div>
        </div>

        {/* Surprise Factor */}
        <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.14em', marginBottom: '6px' }}>
            SURPRISE FACTOR
          </div>
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
            >
              <span style={{ ...COND, fontSize: '28px', fontWeight: 700, color: '#3b82f6', lineHeight: 1 }}>
                {SHOCK_META.surpriseFactor}σ
              </span>
            </div>
            <div>
              <div style={{ ...MONO, fontSize: '9px', color: 'var(--green)' }}>ANOMALOUS</div>
              <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>vs 90d baseline</div>
            </div>
          </div>
        </div>

        {/* Event metadata */}
        <SectionHeader>EVENT METADATA</SectionHeader>
        <Row label="EVENT ID" value={SHOCK_META.id} />
        <Row label="TYPE" value={SHOCK_META.type} color="var(--red)" />
        <Row label="SEVERITY" value={SHOCK_META.severity} color="var(--red-bright)" />
        <Row label="TIMESTAMP" value="2026-02-20 06:34Z" />
        <Row
          label="VECTORS"
          value={`${SHOCK_ARCS.length} ACTIVE`}
          color="var(--amber)"
        />

        {/* Propagation breakdown */}
        <SectionHeader>PROPAGATION BREAKDOWN</SectionHeader>
        {(['OIL', 'DEFENSE', 'FX'] as const).map(type => {
          const count = SHOCK_ARCS.filter(a => a.type === type).length;
          if (count === 0) return null;
          const colors: Record<string, string> = {
            OIL: '#d97706', DEFENSE: '#22c55e', FX: '#a78bfa',
          };
          return (
            <div
              key={type}
              className="flex items-center justify-between px-3"
              style={{ height: '24px', borderBottom: '1px solid var(--border-dim)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[type] }} />
                <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)' }}>{type}</span>
              </div>
              <span style={{ ...MONO, fontSize: '9px', color: colors[type] }}>{count} VECTOR{count > 1 ? 'S' : ''}</span>
            </div>
          );
        })}

        {/* Weather section */}
        <SectionHeader>ATMOS / WEATHER INTEL</SectionHeader>
        {wLoading ? (
          <div className="flex items-center gap-2 px-3 py-2" style={{ color: 'var(--text-3)' }}>
            <Loader className="w-2.5 h-2.5 animate-spin" />
            <span style={{ ...MONO, fontSize: '9px' }}>Fetching Open-Meteo...</span>
          </div>
        ) : (
          weather.map(loc => (
            <div key={loc.name} style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <div
                className="px-3 py-1 flex items-center justify-between"
                style={{ backgroundColor: 'var(--row-alt)' }}
              >
                <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-2)', letterSpacing: '0.08em' }}>
                  {loc.name.toUpperCase()} — {loc.country}
                </span>
              </div>
              {loc.current ? (
                <div className="grid grid-cols-2 gap-0">
                  {[
                    { k: 'TEMP', v: `${loc.current.temperature_2m.toFixed(1)}°C` },
                    { k: 'WIND', v: `${loc.current.wind_speed_10m.toFixed(0)} km/h` },
                    { k: 'PRECIP', v: `${loc.current.precipitation.toFixed(1)} mm` },
                    { k: 'PRESSURE', v: `${loc.current.surface_pressure.toFixed(0)} hPa` },
                  ].map(({ k, v }) => (
                    <div
                      key={k}
                      className="flex flex-col px-3 py-1"
                      style={{ borderBottom: '1px solid var(--border-dim)' }}
                    >
                      <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)', letterSpacing: '0.1em' }}>{k}</span>
                      <span style={{ ...MONO, fontSize: '10px', color: 'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-1">
                  <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-3)' }}>Unavailable</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 flex items-center justify-between"
        style={{ height: '20px', borderTop: '1px solid var(--border)' }}
      >
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>OPEN-METEO / LIVE</span>
        <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>5min REFRESH</span>
      </div>
    </div>
  );
}
