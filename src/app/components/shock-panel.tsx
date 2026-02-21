import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { SHOCK_META, SHOCK_ARCS } from '../../config';
import { useWeatherData } from '../../hooks/useWeatherData';
import { useApp } from '../context';
import * as api from '../../services/api';

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

// Map backend event type to display label
function formatEventType(type: string): string {
  return type.toUpperCase().replace(/_/g, ' ');
}

// Map severity number to display label
function formatSeverity(severity: number): string {
  if (severity >= 8) return 'CRITICAL';
  if (severity >= 6) return 'HIGH';
  if (severity >= 4) return 'MEDIUM';
  return 'LOW';
}

export function ShockPanel() {
  const { data: weather, loading: wLoading } = useWeatherData();
  const { selectedEventId } = useApp();
  const [event, setEvent] = useState<api.ApiEvent | null>(null);
  const [shocks, setShocks] = useState<api.ApiShockScore[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedEventId) {
      setEvent(null);
      setShocks([]);
      return;
    }

    setLoading(true);
    Promise.all([
      api.getEvent(selectedEventId),
      api.getEventShocks(selectedEventId),
    ])
      .then(([e, s]) => {
        setEvent(e);
        setShocks(s);
      })
      .catch(() => {
        // Backend unavailable — keep defaults
      })
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  // Compute display values from backend data, fall back to SHOCK_META defaults
  const shockScore = shocks.length > 0
    ? Math.max(...shocks.map((s) => s.score))
    : SHOCK_META.shockScore;

  const surpriseFactor = shocks.length > 0
    ? (shocks.reduce((sum, s) => sum + (s.surpriseFactor ?? 0), 0) / shocks.filter((s) => s.surpriseFactor != null).length) || 0
    : SHOCK_META.surpriseFactor;

  const eventId = event?.id ?? SHOCK_META.id;
  const eventType = event ? formatEventType(event.type) : SHOCK_META.type;
  const eventSeverity = event ? formatSeverity(event.severity) : SHOCK_META.severity;
  const eventTimestamp = event
    ? new Date(event.timestamp).toISOString().replace('T', ' ').slice(0, 16) + 'Z'
    : '2026-02-20 06:34Z';
  const vectorCount = shocks.length > 0 ? shocks.length : SHOCK_ARCS.length;

  // Group shocks by sector for propagation breakdown
  const sectorGroups = shocks.length > 0
    ? shocks.reduce<Record<string, number>>((acc, s) => {
        // Use first 3 chars of ticker as a rough sector key, or group by direction
        const key = s.direction === 'up' ? 'POSITIVE' : 'NEGATIVE';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {})
    : null;

  const surpriseLabel = surpriseFactor >= 2 ? 'ANOMALOUS' : surpriseFactor >= 1 ? 'ELEVATED' : 'NORMAL';

  return (
    <div style={{ backgroundColor: 'var(--bg)' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: '32px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
      >
        <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)', letterSpacing: '0.12em' }}>SHOCK ANALYSIS</span>
        <div className="flex items-center gap-1.5">
          {loading ? (
            <Loader className="w-2.5 h-2.5 animate-spin" style={{ color: 'var(--text-3)' }} />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--red)' }} />
          )}
          <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>
            {selectedEventId ? 'LIVE' : 'DEMO'}
          </span>
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
              {shockScore.toFixed(1)}
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
                width: `${Math.min(shockScore * 10, 100)}%`,
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
                {surpriseFactor.toFixed(1)}σ
              </span>
            </div>
            <div>
              <div style={{ ...MONO, fontSize: '9px', color: 'var(--green)' }}>{surpriseLabel}</div>
              <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>vs 90d baseline</div>
            </div>
          </div>
        </div>

        {/* Event metadata */}
        <SectionHeader>EVENT METADATA</SectionHeader>
        <Row label="EVENT ID" value={typeof eventId === 'string' && eventId.length > 12 ? eventId.slice(0, 12) + '...' : String(eventId)} />
        <Row label="TYPE" value={eventType} color="var(--red)" />
        <Row label="SEVERITY" value={eventSeverity} color="var(--red-bright)" />
        <Row label="TIMESTAMP" value={eventTimestamp} />
        <Row
          label="VECTORS"
          value={`${vectorCount} ACTIVE`}
          color="var(--amber)"
        />

        {/* Propagation breakdown */}
        <SectionHeader>PROPAGATION BREAKDOWN</SectionHeader>
        {sectorGroups ? (
          // Backend-driven breakdown by direction
          Object.entries(sectorGroups).map(([key, count]) => {
            const colors: Record<string, string> = {
              POSITIVE: '#22c55e',
              NEGATIVE: '#c41e3a',
            };
            return (
              <div
                key={key}
                className="flex items-center justify-between px-3"
                style={{ height: '24px', borderBottom: '1px solid var(--border-dim)' }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[key] ?? '#a78bfa' }} />
                  <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)' }}>{key}</span>
                </div>
                <span style={{ ...MONO, fontSize: '9px', color: colors[key] ?? '#a78bfa' }}>{count} VECTOR{count > 1 ? 'S' : ''}</span>
              </div>
            );
          })
        ) : (
          // Default: mock arc types
          (['OIL', 'DEFENSE', 'FX'] as const).map(type => {
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
          })
        )}

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
