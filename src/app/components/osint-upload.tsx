import { useState } from 'react';
import { Satellite, Loader, Eye, MapPin, AlertTriangle } from 'lucide-react';
import * as api from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

export function OsintUpload() {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [context, setContext] = useState('');
  const [coords, setCoords] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<api.OsintResult | null>(null);

  const analyze = async () => {
    if (!imageUrl.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.analyzeOsint({
        imageUrl: imageUrl.trim(),
        context: context.trim() || undefined,
        coordinates: coords.trim() || undefined,
      });
      setResult(res);
    } catch {
      // Analysis failed
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
        <Satellite size={9} style={{ color: 'var(--blue)' }} />
        OSINT
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '40px',
        right: '8px',
        width: '360px',
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
          <Satellite size={10} style={{ color: 'var(--blue)' }} />
          <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)', letterSpacing: '0.1em' }}>
            OSINT VISION ANALYSIS
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
        <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', marginBottom: '8px' }}>
          Feed satellite/CCTV imagery for AI analysis (YOLOv8 + CLIP)
        </div>

        {/* Image URL */}
        <div style={{ marginBottom: '6px' }}>
          <label style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em', display: 'block', marginBottom: '3px' }}>
            IMAGE URL
          </label>
          <input
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://example.com/satellite-image.jpg"
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

        {/* Context + Coordinates */}
        <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '8px' }}>
          <div>
            <label style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', display: 'block', marginBottom: '3px' }}>
              CONTEXT
            </label>
            <input
              value={context}
              onChange={e => setContext(e.target.value)}
              placeholder="Border region..."
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
            />
          </div>
          <div>
            <label style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', display: 'block', marginBottom: '3px' }}>
              COORDS (lat, lng)
            </label>
            <input
              value={coords}
              onChange={e => setCoords(e.target.value)}
              placeholder="6.0, -61.0"
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
            />
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={loading || !imageUrl.trim()}
          style={{
            ...MONO,
            fontSize: '9px',
            letterSpacing: '0.1em',
            width: '100%',
            padding: '7px',
            backgroundColor: loading || !imageUrl.trim() ? 'var(--bg-raised)' : '#3b82f6',
            color: loading || !imageUrl.trim() ? 'var(--text-3)' : '#fff',
            border: 'none',
            cursor: loading || !imageUrl.trim() ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {loading ? <Loader className="w-3 h-3 animate-spin" /> : <Eye size={11} />}
          {loading ? 'ANALYZING...' : 'ANALYZE IMAGE'}
        </button>

        {/* Results */}
        {result && (
          <div style={{ marginTop: '10px' }}>
            {/* Detections */}
            <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: '4px' }}>
              DETECTIONS ({result.vision.detections.length}) — {result.vision.processingTimeMs}ms
            </div>
            {result.vision.detections.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
                style={{ ...MONO, fontSize: '8px', padding: '3px 6px', borderBottom: '1px solid var(--border-dim)', backgroundColor: i % 2 ? 'var(--row-alt)' : 'transparent' }}
              >
                <span style={{ color: 'var(--text-2)' }}>{d.label.replace(/_/g, ' ')}</span>
                <span style={{ color: d.confidence > 0.8 ? 'var(--green)' : 'var(--amber)' }}>
                  {(d.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}

            {/* Scene Classification */}
            <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.08em', marginTop: '8px', marginBottom: '4px' }}>
              SCENE CLASSIFICATION
            </div>
            {result.vision.classifications.slice(0, 3).map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between"
                style={{ ...MONO, fontSize: '8px', padding: '3px 6px', borderBottom: '1px solid var(--border-dim)' }}
              >
                <span style={{ color: 'var(--text-2)' }}>{c.label.replace(/_/g, ' ')}</span>
                <div className="flex items-center gap-2">
                  <div style={{ width: '30px', height: '2px', backgroundColor: 'var(--bg-raised)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${c.score * 100}%`, backgroundColor: 'var(--blue)' }} />
                  </div>
                  <span style={{ color: 'var(--blue)' }}>{(c.score * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}

            {/* Event Classification */}
            <div
              style={{
                marginTop: '8px',
                padding: '6px',
                border: '1px solid var(--border-dim)',
                backgroundColor: 'var(--bg)',
              }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <AlertTriangle size={9} style={{ color: result.classification.severity >= 7 ? 'var(--red)' : 'var(--amber)' }} />
                <span style={{ ...COND, fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                  {result.classification.type.toUpperCase()}
                </span>
                <span style={{ ...COND, fontSize: '12px', fontWeight: 700, color: 'var(--red)' }}>
                  SEV {result.classification.severity}
                </span>
              </div>
              {result.coordinates && (
                <div className="flex items-center gap-1" style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>
                  <MapPin size={8} />
                  {result.coordinates.lat.toFixed(2)}, {result.coordinates.lng.toFixed(2)}
                </div>
              )}
              {result.eventId && (
                <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Stored as {result.eventId} in VectorAI DB
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
