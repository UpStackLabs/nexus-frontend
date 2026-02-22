import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Loader, X, MapPin, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import * as api from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

const EVENT_TYPES = [
  { value: 'military', label: 'MILITARY', color: '#c41e3a' },
  { value: 'economic', label: 'ECONOMIC', color: '#ff9100' },
  { value: 'policy', label: 'POLICY', color: '#2196f3' },
  { value: 'natural_disaster', label: 'NATURAL DISASTER', color: '#ff6d00' },
  { value: 'geopolitical', label: 'GEOPOLITICAL', color: '#9c27b0' },
];

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
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const runSimulation = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
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
      setError('Simulation failed — check backend connection');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && title.trim() && !loading) {
      runSimulation();
    }
  };

  const selectedType = EVENT_TYPES.find(t => t.value === type)!;
  const severityColor = severity >= 8 ? '#c41e3a' : severity >= 5 ? '#ff9100' : '#00c853';
  const severityLabel = severity >= 8 ? 'CATASTROPHIC' : severity >= 5 ? 'MODERATE' : 'MINOR';

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 hover:bg-[#1a1a1a] transition-colors"
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

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={() => !loading && setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(2px)',
          zIndex: 100,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0e0e0e',
          border: '1px solid #2a2a2a',
          zIndex: 101,
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.8), 0 0 1px rgba(196, 30, 58, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: '38px',
            borderBottom: '1px solid #1e1e1e',
            background: 'linear-gradient(180deg, #131313 0%, #0e0e0e 100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <Zap size={11} style={{ color: '#ff9100' }} />
            <span style={{ ...MONO, fontSize: '10px', color: '#a0a0a0', letterSpacing: '0.12em' }}>
              WHAT-IF SIMULATION
            </span>
          </div>
          <button
            onClick={() => !loading && setOpen(false)}
            className="hover:bg-[#1e1e1e] transition-colors"
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={14} style={{ color: '#505050' }} />
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          {/* Event Title */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...MONO, fontSize: '8px', color: '#606060', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              EVENT SCENARIO
            </label>
            <input
              ref={inputRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. China invades Taiwan"
              style={{
                ...MONO,
                fontSize: '11px',
                width: '100%',
                backgroundColor: '#111',
                border: '1px solid #2a2a2a',
                color: '#d4d4d4',
                padding: '8px 10px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Type selection - pill buttons */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...MONO, fontSize: '8px', color: '#606060', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              EVENT TYPE
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  style={{
                    ...MONO,
                    fontSize: '8px',
                    letterSpacing: '0.08em',
                    padding: '4px 10px',
                    border: `1px solid ${type === t.value ? t.color + '60' : '#1e1e1e'}`,
                    backgroundColor: type === t.value ? t.color + '15' : 'transparent',
                    color: type === t.value ? t.color : '#505050',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...MONO, fontSize: '8px', color: '#606060', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>
              <MapPin size={8} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              EPICENTER
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_LOCATIONS.map((loc, i) => (
                <button
                  key={loc.label}
                  onClick={() => setLocationIdx(i)}
                  style={{
                    ...MONO,
                    fontSize: '8px',
                    letterSpacing: '0.06em',
                    padding: '4px 10px',
                    border: `1px solid ${locationIdx === i ? '#c41e3a40' : '#1e1e1e'}`,
                    backgroundColor: locationIdx === i ? '#c41e3a12' : 'transparent',
                    color: locationIdx === i ? '#c41e3a' : '#505050',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div style={{ marginBottom: '16px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <label style={{ ...MONO, fontSize: '8px', color: '#606060', letterSpacing: '0.1em' }}>
                <AlertTriangle size={8} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                SEVERITY
              </label>
              <div className="flex items-center gap-2">
                <span style={{ ...MONO, fontSize: '7px', color: severityColor, letterSpacing: '0.08em' }}>
                  {severityLabel}
                </span>
                <span style={{
                  ...COND,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: severityColor,
                  lineHeight: 1,
                  minWidth: '24px',
                  textAlign: 'right',
                }}>
                  {severity}
                </span>
              </div>
            </div>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  transform: 'translateY(-50%)',
                  background: `linear-gradient(90deg, #00c853, #ff9100 50%, #c41e3a)`,
                  opacity: 0.2,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={e => setSeverity(Number(e.target.value))}
                style={{ width: '100%', accentColor: severityColor, position: 'relative', zIndex: 1 }}
              />
            </div>
            <div className="flex justify-between" style={{ marginTop: '2px' }}>
              <span style={{ ...MONO, fontSize: '7px', color: '#353535' }}>1</span>
              <span style={{ ...MONO, fontSize: '7px', color: '#353535' }}>10</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              ...MONO,
              fontSize: '8px',
              color: '#c41e3a',
              padding: '6px 10px',
              marginBottom: '12px',
              border: '1px solid #c41e3a30',
              backgroundColor: '#c41e3a08',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={runSimulation}
            disabled={loading || !title.trim()}
            className="transition-all"
            style={{
              ...MONO,
              fontSize: '10px',
              letterSpacing: '0.12em',
              width: '100%',
              padding: '10px',
              backgroundColor: loading || !title.trim() ? '#1a1a1a' : '#c42020',
              color: loading || !title.trim() ? '#505050' : '#fff',
              border: loading || !title.trim() ? '1px solid #2a2a2a' : '1px solid #c42020',
              cursor: loading || !title.trim() ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Zap size={12} />}
            {loading ? 'RUNNING SIMULATION...' : 'RUN SIMULATION'}
          </button>
        </div>

        {/* Results panel */}
        {lastResult && (
          <div style={{
            borderTop: '1px solid #1e1e1e',
            padding: '14px 16px',
            background: 'linear-gradient(180deg, #0c0c0c 0%, #0e0e0e 100%)',
          }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
              <div style={{ width: '4px', height: '4px', backgroundColor: '#00c853', borderRadius: '50%' }} />
              <span style={{ ...MONO, fontSize: '9px', color: '#707070', letterSpacing: '0.1em' }}>
                SIMULATION COMPLETE
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3" style={{ marginBottom: '12px' }}>
              {[
                { label: 'COMPANIES', value: lastResult.totalAffectedCompanies, color: '#c41e3a' },
                { label: 'COUNTRIES', value: lastResult.totalAffectedCountries, color: '#ff9100' },
                { label: 'INTERLINKED', value: lastResult.interlinkednessScore.toFixed(2), color: '#2196f3' },
              ].map(stat => (
                <div key={stat.label} style={{ padding: '8px', border: '1px solid #1a1a1a', backgroundColor: '#0a0a0a' }}>
                  <div style={{ ...MONO, fontSize: '7px', color: '#505050', letterSpacing: '0.08em', marginBottom: '4px' }}>
                    {stat.label}
                  </div>
                  <div style={{ ...COND, fontSize: '20px', fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Top affected sectors */}
            <div style={{ ...MONO, fontSize: '7px', color: '#505050', letterSpacing: '0.08em', marginBottom: '6px' }}>
              TOP AFFECTED SECTORS
            </div>
            {lastResult.topAffectedSectors.slice(0, 4).map(s => {
              const isUp = s.predictedDirection === 'up';
              const isMixed = s.predictedDirection === 'mixed';
              return (
                <div
                  key={s.sector}
                  className="flex items-center justify-between"
                  style={{
                    padding: '5px 8px',
                    borderBottom: '1px solid #141414',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isMixed ? (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #ff9100' }} />
                    ) : isUp ? (
                      <TrendingUp size={10} style={{ color: '#00c853' }} />
                    ) : (
                      <TrendingDown size={10} style={{ color: '#c41e3a' }} />
                    )}
                    <span style={{ ...MONO, fontSize: '9px', color: '#a0a0a0' }}>{s.sector}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{
                      ...MONO,
                      fontSize: '8px',
                      color: isMixed ? '#ff9100' : isUp ? '#00c853' : '#c41e3a',
                    }}>
                      {s.predictedDirection.toUpperCase()}
                    </span>
                    <span style={{
                      ...MONO,
                      fontSize: '9px',
                      color: '#808080',
                      minWidth: '32px',
                      textAlign: 'right',
                    }}>
                      {s.averageShockScore.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Close results / run another */}
            <div className="flex gap-2" style={{ marginTop: '12px' }}>
              <button
                onClick={() => {
                  setLastResult(null);
                  setTitle('');
                }}
                style={{
                  ...MONO,
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                  flex: 1,
                  padding: '7px',
                  backgroundColor: 'transparent',
                  color: '#606060',
                  border: '1px solid #2a2a2a',
                  cursor: 'pointer',
                }}
              >
                NEW SIMULATION
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  ...MONO,
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                  flex: 1,
                  padding: '7px',
                  backgroundColor: '#c4202015',
                  color: '#c42020',
                  border: '1px solid #c4202040',
                  cursor: 'pointer',
                }}
              >
                CLOSE & VIEW GLOBE
              </button>
            </div>
          </div>
        )}
      </div>
    </>,
    document.body,
  );
}
