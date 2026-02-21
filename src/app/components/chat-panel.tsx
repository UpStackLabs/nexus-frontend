import { useState, useRef, useEffect } from 'react';
import { Send, X, Loader, Bot, User, Sparkles } from 'lucide-react';
import { useApp } from '../context';
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
  'Which stocks are most exposed to the current event?',
  'How are sectors impacted by this shock?',
  'Compare this to historical events',
  'Analyze energy sector risk exposure',
  'What is the surprise factor for NVDA?',
  'Explain the shock propagation model',
];

export function ChatPanel() {
  const { chatOpen, setChatOpen } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (chatOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [chatOpen]);

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

  return (
    <>
      {/* Backdrop */}
      {chatOpen && (
        <div
          className="fixed inset-0 z-[80]"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={() => setChatOpen(false)}
        />
      )}

      {/* Slide-out Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          backgroundColor: '#0a0a0a',
          borderLeft: '1px solid #1e1e1e',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          transform: chatOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: chatOpen ? '-8px 0 32px rgba(0, 0, 0, 0.5)' : 'none',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: '48px',
            borderBottom: '1px solid #1e1e1e',
            flexShrink: 0,
            backgroundColor: '#080808',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#c42020',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={14} color="#fff" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ ...COND, fontSize: '13px', fontWeight: 600, color: '#d4d4d4', letterSpacing: '0.08em' }}>
                  NEXUS AI
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-[#00c853] rounded-full animate-pulse" />
                  <span style={{ ...MONO, fontSize: '8px', color: '#505050' }}>ONLINE</span>
                </div>
              </div>
              <span style={{ ...MONO, fontSize: '8px', color: '#404040', letterSpacing: '0.06em' }}>
                MISTRAL-7B + RAG PIPELINE
              </span>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            style={{
              background: 'none',
              border: '1px solid #1e1e1e',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="hover:bg-[#141414] transition-colors"
          >
            <X size={14} style={{ color: '#707070' }} />
          </button>
        </div>

        {/* Messages Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto" style={{ padding: '16px' }}>
          {messages.length === 0 && (
            <div style={{ padding: '8px 0' }}>
              {/* Welcome */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#0e0e0e',
                  border: '1px solid #1a1a1a',
                  marginBottom: '16px',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={12} style={{ color: '#c42020' }} />
                  <span style={{ ...COND, fontSize: '11px', fontWeight: 600, color: '#a0a0a0', letterSpacing: '0.08em' }}>
                    AI-POWERED ANALYSIS
                  </span>
                </div>
                <p style={{ ...MONO, fontSize: '10px', color: '#606060', lineHeight: '1.7' }}>
                  Ask questions about events, stocks, sectors, shock scores, and market impact.
                  Powered by Mistral-7B with retrieval-augmented generation from the Nexus knowledge base.
                </p>
              </div>

              <div style={{ ...MONO, fontSize: '9px', color: '#404040', marginBottom: '10px', letterSpacing: '0.1em' }}>
                SUGGESTED QUERIES
              </div>
              <div className="flex flex-col gap-2">
                {EXAMPLE_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      ...MONO,
                      fontSize: '10px',
                      color: '#808080',
                      backgroundColor: '#0e0e0e',
                      border: '1px solid #1a1a1a',
                      padding: '10px 12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      lineHeight: '1.4',
                    }}
                    className="hover:border-[#2a2a2a] hover:text-[#a0a0a0] hover:bg-[#111] transition-colors"
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
                marginBottom: '16px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: m.role === 'user' ? '#1a1a1a' : '#1a0808',
                  border: `1px solid ${m.role === 'user' ? '#252525' : '#2a1515'}`,
                  marginTop: '2px',
                }}
              >
                {m.role === 'user' ? (
                  <User size={11} style={{ color: '#707070' }} />
                ) : (
                  <Bot size={11} style={{ color: '#c42020' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    ...MONO,
                    fontSize: '8px',
                    color: '#404040',
                    marginBottom: '4px',
                    letterSpacing: '0.08em',
                  }}
                >
                  {m.role === 'user' ? 'YOU' : 'NEXUS AI'}
                  <span style={{ marginLeft: '8px', color: '#303030' }}>
                    {new Date(m.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </span>
                </div>
                <div
                  style={{
                    ...MONO,
                    fontSize: '11px',
                    lineHeight: '1.6',
                    color: m.role === 'user' ? '#c0c0c0' : '#909090',
                    backgroundColor: m.role === 'user' ? '#111' : 'transparent',
                    border: m.role === 'user' ? '1px solid #1a1a1a' : 'none',
                    padding: m.role === 'user' ? '10px 12px' : '2px 0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {m.content}
                  {m.role === 'assistant' && m.content === '' && streaming && (
                    <span className="inline-flex items-center gap-1">
                      <Loader className="w-3 h-3 animate-spin" style={{ color: '#c42020' }} />
                      <span style={{ ...MONO, fontSize: '9px', color: '#404040' }}>Analyzing...</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: '1px solid #1e1e1e',
            padding: '12px 16px',
            flexShrink: 0,
            backgroundColor: '#080808',
          }}
        >
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="Ask Nexus AI about events, stocks, risks..."
              disabled={streaming}
              rows={2}
              style={{
                ...MONO,
                fontSize: '11px',
                flex: 1,
                backgroundColor: '#0e0e0e',
                border: '1px solid #1e1e1e',
                color: '#c0c0c0',
                padding: '10px 12px',
                outline: 'none',
                resize: 'none',
                lineHeight: '1.5',
              }}
              className="focus:border-[#2a2a2a] transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={streaming || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: streaming || !input.trim() ? '#1a1a1a' : '#c42020',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: streaming || !input.trim() ? 'default' : 'pointer',
                flexShrink: 0,
                transition: 'background-color 0.15s',
              }}
            >
              {streaming ? (
                <Loader size={14} className="animate-spin" color="#505050" />
              ) : (
                <Send size={14} color={!input.trim() ? '#404040' : '#fff'} />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span style={{ ...MONO, fontSize: '8px', color: '#303030', letterSpacing: '0.06em' }}>
              SHIFT+ENTER for new line
            </span>
            <span style={{ ...MONO, fontSize: '8px', color: '#303030', letterSpacing: '0.06em' }}>
              {messages.filter(m => m.role === 'user').length} queries this session
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
