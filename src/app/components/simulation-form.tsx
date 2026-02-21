import { useState } from 'react';
import { Zap, Loader } from 'lucide-react';
import * as api from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

const EVENT_TYPES = ['military', 'economic', 'policy', 'natural_disaster', 'geopolitical'];

const PRESET_LOCATIONS = [
  { label: 'Caracas, VEN', lat: 10.48, lng: -66.88, country: 'VE' },
  { label: 'Taipei, TWN', lat: 25.03, lng: 121.57, country: 'TW' },
  { label: 'Tehran, IRN', lat: 35.69, lng: 51.39, country: 'IR' },
  { label: 'Kyiv, UKR', lat: 50.45, lng: 30.52, country: 'UA' },
  { label: 'Beijing, CHN', lat: 39.90, lng: 116.40, country: 'CN' },
  { label: 'Moscow, RUS', lat: 55.76, lng: 37.62, country: 'RU' },
];

interface Props {
  onResult: (result: api.ApiSimulationResult) => void;
}

export function SimulationForm({ onResult }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('military');
  const [severity, setSeverity] = useState(7);
  const [locationIdx, setLocationIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<api.ApiSimulationResult | null>(null);

  const runSimulation = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const loc = PRESET_LOCATIONS[locationIdx];
      const result = await api.simulateEvent({
        title: title.trim(),
        type,
        severity,
        location: { lat: loc.lat, lng: loc.lng, country: loc.country },
      });
      setLastResult(result);
      onResult(result);
    } catch {
      // Simulation failed
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5"
        style={{
          ...MONO,
          fontSize: '8px',
          padding: '3px 8px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-2)',
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
      >
        <Zap size={9} style={{ color: 'var(--amber)' }} />
        SIMULATE
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        zIndex: 40,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: '30px', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Zap size={10} style={{ color: 'var(--amber)' }} />
          <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)', letterSpacing: '0.1em' }}>
            WHAT-IF SIMULATION
          </span>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          CLOSE
        </button>
      </div>

      <div style={{ padding: '10px 12px' }}>
        {/* Title */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
            EVENT TITLE
          </label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. China invades Taiwan"
            style={{
              ...MONO,
              fontSize: '9px',
              width: '100%',
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '5px 8px',
              outline: 'none',
            }}
          />
        </div>

        {/* Type + Location row */}
        <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '8px' }}>
          <div>
            <label style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
              TYPE
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{
                ...MONO,
                fontSize: '9px',
                width: '100%',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '5px 6px',
                outline: 'none',
              }}
            >
              {EVENT_TYPES.map(t => (
                <option key={t} value={t}>{t.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
              LOCATION
            </label>
            <select
              value={locationIdx}
              onChange={e => setLocationIdx(Number(e.target.value))}
              style={{
                ...MONO,
                fontSize: '9px',
                width: '100%',
                backgroundColor: 'var(--bg)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '5px 6px',
                outline: 'none',
              }}
            >
              {PRESET_LOCATIONS.map((l, i) => (
                <option key={l.label} value={i}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Severity slider */}
        <div style={{ marginBottom: '10px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
            <label style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em' }}>
              SEVERITY
            </label>
            <span style={{ ...COND, fontSize: '16px', fontWeight: 700, color: severity >= 8 ? 'var(--red)' : severity >= 5 ? 'var(--amber)' : 'var(--green)' }}>
              {severity}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={e => setSeverity(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#c42020' }}
          />
          <div className="flex justify-between">
            <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>1 — MINOR</span>
            <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>10 — CATASTROPHIC</span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={runSimulation}
          disabled={loading || !title.trim()}
          style={{
            ...MONO,
            fontSize: '9px',
            letterSpacing: '0.1em',
            width: '100%',
            padding: '7px',
            backgroundColor: loading || !title.trim() ? 'var(--bg-raised)' : '#c42020',
            color: loading || !title.trim() ? 'var(--text-3)' : '#fff',
            border: 'none',
            cursor: loading || !title.trim() ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {loading ? <Loader className="w-3 h-3 animate-spin" /> : <Zap size={11} />}
          {loading ? 'RUNNING SIMULATION...' : 'RUN SIMULATION'}
        </button>

        {/* Results summary */}
        {lastResult && (
          <div style={{ marginTop: '10px', padding: '8px', border: '1px solid var(--border-dim)', backgroundColor: 'var(--bg)' }}>
            <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '6px' }}>
              SIMULATION RESULTS
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>COMPANIES</div>
                <div style={{ ...COND, fontSize: '16px', fontWeight: 700, color: 'var(--red)' }}>
                  {lastResult.totalAffectedCompanies}
                </div>
              </div>
              <div>
                <div style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>COUNTRIES</div>
                <div style={{ ...COND, fontSize: '16px', fontWeight: 700, color: 'var(--amber)' }}>
                  {lastResult.totalAffectedCountries}
                </div>
              </div>
              <div>
                <div style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>INTERLINKED</div>
                <div style={{ ...COND, fontSize: '16px', fontWeight: 700, color: 'var(--blue)' }}>
                  {lastResult.interlinkednessScore.toFixed(2)}
                </div>
              </div>
            </div>
            {lastResult.topAffectedSectors.slice(0, 3).map(s => (
              <div
                key={s.sector}
                className="flex items-center justify-between"
                style={{ ...MONO, fontSize: '8px', marginTop: '4px', padding: '2px 0', borderTop: '1px solid var(--border-dim)' }}
              >
                <span style={{ color: 'var(--text-2)' }}>{s.sector}</span>
                <span style={{ color: s.predictedDirection === 'up' ? 'var(--green)' : 'var(--red-bright)' }}>
                  {s.predictedDirection.toUpperCase()} ({s.averageShockScore.toFixed(2)})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
