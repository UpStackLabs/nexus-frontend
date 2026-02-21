import { useState } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import type { ApiEvent } from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#22c55e',
};

function severityLabel(s: number): string {
  if (s >= 8) return 'critical';
  if (s >= 6) return 'high';
  if (s >= 4) return 'medium';
  return 'low';
}

interface Props {
  events: ApiEvent[];
  selectedEventId: string | null;
  onSelect: (eventId: string | null) => void;
}

export function EventSelector({ events, selectedEventId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const selected = events.find(e => e.id === selectedEventId);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
        style={{
          ...MONO,
          fontSize: '8px',
          padding: '3px 8px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-2)',
          cursor: 'pointer',
          letterSpacing: '0.06em',
          maxWidth: '240px',
        }}
      >
        <AlertTriangle size={9} style={{ color: selected ? SEVERITY_COLORS[severityLabel(selected.severity)] : 'var(--text-3)', flexShrink: 0 }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? `${selected.id} — ${selected.title}` : 'ALL EVENTS'}
        </span>
        <ChevronDown size={9} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '2px',
            width: '320px',
            maxHeight: '240px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            zIndex: 40,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            style={{
              ...MONO,
              fontSize: '8px',
              width: '100%',
              padding: '6px 8px',
              textAlign: 'left',
              border: 'none',
              borderBottom: '1px solid var(--border-dim)',
              backgroundColor: !selectedEventId ? 'var(--bg-raised)' : 'transparent',
              color: 'var(--text-2)',
              cursor: 'pointer',
            }}
          >
            ALL EVENTS
          </button>
          {events.map(e => {
            const sev = severityLabel(e.severity);
            return (
              <button
                key={e.id}
                onClick={() => { onSelect(e.id); setOpen(false); }}
                style={{
                  ...MONO,
                  fontSize: '8px',
                  width: '100%',
                  padding: '6px 8px',
                  textAlign: 'left',
                  border: 'none',
                  borderBottom: '1px solid var(--border-dim)',
                  backgroundColor: selectedEventId === e.id ? 'var(--bg-raised)' : 'transparent',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: SEVERITY_COLORS[sev],
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: SEVERITY_COLORS[sev], minWidth: '14px' }}>{e.severity}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {e.title}
                </span>
                <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>{e.type.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
