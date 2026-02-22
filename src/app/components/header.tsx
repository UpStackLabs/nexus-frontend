import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useApp } from '../context';
import { useEvents } from '../../hooks/useBackendData';
import { EventSelector } from './event-selector';
import { SimulationForm } from './simulation-form';
import { NexusLogo } from './nexus-logo';
import type { ApiSimulationResult } from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

export function Header() {
  const [clock, setClock] = useState('');
  const { selectedEventId, setSelectedEventId, setChatOpen, chatOpen, setSimulationResult } = useApp();
  const { events } = useEvents();

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
      {/* Logo + Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <NexusLogo size={26} />
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
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 12px', flexShrink: 0 }} />

      {/* Event selector */}
      {events.length > 0 ? (
        <EventSelector
          events={events}
          selectedEventId={selectedEventId}
          onSelect={setSelectedEventId}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            border: '1px solid var(--border-dim)',
            backgroundColor: 'var(--bg-surface)',
            flexShrink: 0,
          }}
        >
          <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.1em' }}>
            NO EVENTS — AWAITING DATA
          </span>
        </div>
      )}

      {/* Action buttons: Simulate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px', flexShrink: 0 }}>
        <SimulationForm onResult={(r: ApiSimulationResult) => {
          setSimulationResult(r);
          setSelectedEventId(r.simulatedEventId);
        }} />
      </div>

      <div style={{ flex: 1 }} />

      {/* Chat button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '10px', flexShrink: 0 }}>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          style={{
            ...MONO,
            fontSize: '8px',
            letterSpacing: '0.08em',
            padding: '4px 10px',
            border: chatOpen ? '1px solid #c42020' : '1px solid var(--border-dim)',
            backgroundColor: chatOpen ? '#1a0808' : 'transparent',
            color: chatOpen ? '#c42020' : 'var(--text-3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          className="hover:bg-[var(--bg-raised)] transition-colors"
        >
          <MessageSquare size={10} />
          AI CHAT
        </button>
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
