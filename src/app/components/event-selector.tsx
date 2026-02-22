import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, AlertTriangle, X, Globe, Radio } from 'lucide-react';
import type { ApiEvent } from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#c41e3a',
  high: '#ff9100',
  medium: '#ffd600',
  low: '#00c853',
};

const TYPE_COLORS: Record<string, string> = {
  military: '#c41e3a',
  economic: '#ff9100',
  policy: '#2196f3',
  natural_disaster: '#ff6d00',
  geopolitical: '#9c27b0',
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
  const [filter, setFilter] = useState<string | null>(null);
  const selected = events.find(e => e.id === selectedEventId);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const filteredEvents = filter
    ? events.filter(e => e.type === filter)
    : events;

  const uniqueTypes = [...new Set(events.map(e => e.type))];

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 hover:bg-[#1a1a1a] transition-colors"
        style={{
          ...MONO,
          fontSize: '8px',
          padding: '3px 8px',
          border: '1px solid #1e1e1e',
          backgroundColor: '#111',
          color: '#a0a0a0',
          cursor: 'pointer',
          letterSpacing: '0.06em',
          maxWidth: '260px',
        }}
      >
        <AlertTriangle
          size={9}
          style={{
            color: selected
              ? SEVERITY_COLORS[severityLabel(selected.severity)]
              : '#505050',
            flexShrink: 0,
          }}
        />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.title : 'ALL EVENTS'}
        </span>
        <ChevronDown size={9} style={{ color: '#505050', flexShrink: 0 }} />
      </button>

      {/* Modal */}
      {open && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)',
              zIndex: 100,
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '480px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0e0e0e',
              border: '1px solid #2a2a2a',
              zIndex: 101,
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.8), 0 0 1px rgba(196, 30, 58, 0.3)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 shrink-0"
              style={{
                height: '38px',
                borderBottom: '1px solid #1e1e1e',
                background: 'linear-gradient(180deg, #131313 0%, #0e0e0e 100%)',
              }}
            >
              <div className="flex items-center gap-2">
                <Radio size={11} style={{ color: '#c41e3a' }} />
                <span style={{ ...MONO, fontSize: '10px', color: '#a0a0a0', letterSpacing: '0.12em' }}>
                  EVENT FEED
                </span>
                <span style={{ ...MONO, fontSize: '9px', color: '#404040' }}>
                  ({events.length})
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="hover:bg-[#1e1e1e] transition-colors"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} style={{ color: '#505050' }} />
              </button>
            </div>

            {/* Type filter pills */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <button
                onClick={() => setFilter(null)}
                style={{
                  ...MONO,
                  fontSize: '8px',
                  letterSpacing: '0.08em',
                  padding: '3px 10px',
                  border: `1px solid ${!filter ? '#a0a0a040' : '#1e1e1e'}`,
                  backgroundColor: !filter ? '#a0a0a010' : 'transparent',
                  color: !filter ? '#a0a0a0' : '#404040',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                ALL
              </button>
              {uniqueTypes.map(t => {
                const color = TYPE_COLORS[t] ?? '#808080';
                const active = filter === t;
                return (
                  <button
                    key={t}
                    onClick={() => setFilter(active ? null : t)}
                    style={{
                      ...MONO,
                      fontSize: '8px',
                      letterSpacing: '0.08em',
                      padding: '3px 10px',
                      border: `1px solid ${active ? color + '60' : '#1e1e1e'}`,
                      backgroundColor: active ? color + '15' : 'transparent',
                      color: active ? color : '#404040',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.toUpperCase().replace('_', ' ')}
                  </button>
                );
              })}
            </div>

            {/* "All Events" option */}
            <div className="shrink-0" style={{ borderBottom: '1px solid #1a1a1a' }}>
              <button
                onClick={() => { onSelect(null); setOpen(false); }}
                className="hover:bg-[#141414] transition-colors"
                style={{
                  ...MONO,
                  fontSize: '9px',
                  width: '100%',
                  padding: '10px 16px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: !selectedEventId ? '#141414' : 'transparent',
                  color: !selectedEventId ? '#d4d4d4' : '#707070',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Globe size={10} style={{ color: !selectedEventId ? '#c41e3a' : '#404040' }} />
                <span>ALL EVENTS — GLOBAL VIEW</span>
                {!selectedEventId && (
                  <span style={{ marginLeft: 'auto', fontSize: '7px', color: '#00c853', letterSpacing: '0.1em' }}>
                    ACTIVE
                  </span>
                )}
              </button>
            </div>

            {/* Event list */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filteredEvents.length === 0 && (
                <div style={{ ...MONO, fontSize: '9px', color: '#404040', padding: '20px', textAlign: 'center' }}>
                  NO EVENTS MATCH FILTER
                </div>
              )}
              {filteredEvents.map(e => {
                const sev = severityLabel(e.severity);
                const sevColor = SEVERITY_COLORS[sev];
                const typeColor = TYPE_COLORS[e.type] ?? '#808080';
                const isSelected = selectedEventId === e.id;

                return (
                  <button
                    key={e.id}
                    onClick={() => { onSelect(e.id); setOpen(false); }}
                    className="hover:bg-[#141414] transition-colors"
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      border: 'none',
                      borderBottom: '1px solid #141414',
                      backgroundColor: isSelected ? '#141414' : 'transparent',
                      borderLeft: isSelected ? `2px solid ${sevColor}` : '2px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    {/* Severity indicator */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingTop: '1px', flexShrink: 0 }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: sevColor,
                        boxShadow: `0 0 6px ${sevColor}40`,
                      }} />
                      <span style={{ ...COND, fontSize: '12px', fontWeight: 700, color: sevColor, lineHeight: 1 }}>
                        {e.severity}
                      </span>
                    </div>

                    {/* Event details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        ...MONO,
                        fontSize: '9px',
                        color: isSelected ? '#d4d4d4' : '#a0a0a0',
                        marginBottom: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {e.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{
                          ...MONO,
                          fontSize: '7px',
                          letterSpacing: '0.08em',
                          padding: '1px 5px',
                          border: `1px solid ${typeColor}40`,
                          backgroundColor: typeColor + '10',
                          color: typeColor,
                        }}>
                          {e.type.toUpperCase().replace('_', ' ')}
                        </span>
                        {e.location?.country && (
                          <span style={{ ...MONO, fontSize: '7px', color: '#404040' }}>
                            {e.location.country}
                          </span>
                        )}
                        {e.affectedTickers?.length > 0 && (
                          <span style={{ ...MONO, fontSize: '7px', color: '#353535' }}>
                            {e.affectedTickers.slice(0, 3).join(', ')}
                            {e.affectedTickers.length > 3 && ` +${e.affectedTickers.length - 3}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isSelected && (
                      <span style={{ ...MONO, fontSize: '7px', color: '#00c853', letterSpacing: '0.1em', flexShrink: 0, paddingTop: '2px' }}>
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
