import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader, Bot, User } from 'lucide-react';
import * as api from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const EXAMPLE_QUERIES = [
  'Which stocks are most exposed?',
  'How are sectors impacted?',
  'Compare to historical events',
  'Analyze energy sector risk',
];

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const assistantId = `a-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
    ]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      await api.chatStream(
        text.trim(),
        history,
        (token) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + token } : m,
            ),
          );
        },
        () => {
          setStreaming(false);
        },
      );
    } catch {
      // Fallback to non-streaming
      try {
        const res = await api.chat(text.trim(), messages.map(m => ({ role: m.role, content: m.content })));
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: res.response } : m,
          ),
        );
      } catch {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: 'Unable to connect to Nexus AI. Backend may be offline.' }
              : m,
          ),
        );
      }
      setStreaming(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '44px',
          height: '44px',
          backgroundColor: '#c42020',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          boxShadow: '0 2px 12px rgba(196, 32, 32, 0.4)',
        }}
      >
        <MessageSquare size={20} color="#fff" />
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        width: '380px',
        height: '520px',
        backgroundColor: 'var(--bg)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3"
        style={{
          height: '36px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <Bot size={12} style={{ color: 'var(--red)' }} />
          <span style={{ ...COND, fontSize: '11px', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.06em' }}>
            NEXUS AI
          </span>
          <span style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)' }}>MISTRAL-7B + RAG</span>
        </div>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
        >
          <X size={14} style={{ color: 'var(--text-3)' }} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ padding: '8px' }}>
        {messages.length === 0 && (
          <div style={{ padding: '12px 4px' }}>
            <div style={{ ...MONO, fontSize: '9px', color: 'var(--text-3)', marginBottom: '12px', letterSpacing: '0.08em' }}>
              ASK THE AI ANALYST
            </div>
            <div className="flex flex-col gap-1.5">
              {EXAMPLE_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    ...MONO,
                    fontSize: '9px',
                    color: 'var(--text-2)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-dim)',
                    padding: '6px 8px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  className="hover:border-[var(--border)]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div
            key={m.id}
            style={{
              marginBottom: '8px',
              display: 'flex',
              gap: '6px',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px',
              }}
            >
              {m.role === 'user' ? (
                <User size={10} style={{ color: 'var(--text-3)' }} />
              ) : (
                <Bot size={10} style={{ color: 'var(--red)' }} />
              )}
            </div>
            <div
              style={{
                ...MONO,
                fontSize: '9px',
                lineHeight: '1.5',
                color: m.role === 'user' ? 'var(--text)' : 'var(--text-2)',
                backgroundColor: m.role === 'user' ? 'var(--bg-raised)' : 'transparent',
                padding: m.role === 'user' ? '4px 6px' : '2px 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {m.content}
              {m.role === 'assistant' && m.content === '' && streaming && (
                <Loader className="w-2.5 h-2.5 animate-spin inline" style={{ color: 'var(--red)' }} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          padding: '8px',
          flexShrink: 0,
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask Nexus AI..."
            disabled={streaming}
            style={{
              ...MONO,
              fontSize: '10px',
              flex: 1,
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '6px 8px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: streaming || !input.trim() ? 'var(--bg-raised)' : '#c42020',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: streaming || !input.trim() ? 'default' : 'pointer',
            }}
          >
            <Send size={12} color={streaming || !input.trim() ? '#333' : '#fff'} />
          </button>
        </div>
      </div>
    </div>
  );
}
