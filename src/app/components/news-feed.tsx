import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useNewsData, NewsSource } from '../../hooks/useNewsData';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };

const TYPE_LABELS: Record<NewsSource, string> = {
  geopolitical: 'GEO',
  market: 'MKT',
};
const TYPE_COLORS: Record<NewsSource, string> = {
  geopolitical: '#c42020',
  market: '#3b82f6',
};

type Filter = 'ALL' | NewsSource;

function relTime(ms: number): string {
  const diff = (Date.now() - ms) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export function NewsFeed() {
  const { news, loading, error } = useNewsData();
  const [filter, setFilter] = useState<Filter>('ALL');

  const visible = filter === 'ALL' ? news : news.filter(n => n.type === filter);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: '32px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
      >
        <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)', letterSpacing: '0.12em' }}>
          INTELLIGENCE FEED
        </span>
        <div className="flex items-center gap-1">
          {(['ALL', 'geopolitical', 'market'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...MONO,
                fontSize: '8px',
                letterSpacing: '0.08em',
                padding: '1px 6px',
                border: `1px solid ${filter === f ? 'var(--border)' : 'transparent'}`,
                backgroundColor: filter === f ? 'var(--bg-raised)' : 'transparent',
                color: filter === f ? 'var(--text)' : 'var(--text-3)',
                cursor: 'pointer',
              }}
            >
              {f === 'ALL' ? 'ALL' : TYPE_LABELS[f as NewsSource]}
            </button>
          ))}
          {loading && <Loader className="w-2.5 h-2.5 animate-spin ml-1" style={{ color: 'var(--text-3)' }} />}
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid px-3 py-1"
        style={{
          gridTemplateColumns: '32px 1fr 48px',
          gap: '8px',
          borderBottom: '1px solid var(--border-dim)',
          flexShrink: 0,
        }}
      >
        {['SRC', 'HEADLINE', 'AGE'].map(h => (
          <span key={h} style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.1em' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Articles */}
      <div className="flex-1 overflow-y-auto">
        {error && !loading && visible.length === 0 ? (
          <div className="px-3 py-3" style={{ color: 'var(--text-3)', ...MONO, fontSize: '9px' }}>
            {error}
          </div>
        ) : (
          visible.map((item, i) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="grid items-start px-3 group"
              style={{
                gridTemplateColumns: '32px 1fr 48px',
                gap: '8px',
                minHeight: '28px',
                paddingTop: '5px',
                paddingBottom: '5px',
                backgroundColor: i % 2 === 1 ? 'var(--row-alt)' : undefined,
                borderBottom: '1px solid var(--border-dim)',
                textDecoration: 'none',
              }}
            >
              {/* Type badge */}
              <span
                style={{
                  ...MONO,
                  fontSize: '7px',
                  letterSpacing: '0.06em',
                  color: TYPE_COLORS[item.type],
                  paddingTop: '1px',
                }}
              >
                {TYPE_LABELS[item.type]}
              </span>

              {/* Headline */}
              <span
                style={{
                  ...MONO,
                  fontSize: '9px',
                  color: 'var(--text-2)',
                  lineHeight: '1.4',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
                className="group-hover:text-[var(--text)] transition-colors"
              >
                {item.title}
              </span>

              {/* Age + source */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>
                  {relTime(item.timestamp)}
                </div>
                <div style={{ ...MONO, fontSize: '7px', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '48px' }}>
                  {item.source}
                </div>
              </div>
            </a>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: '20px', borderTop: '1px solid var(--border-dim)', flexShrink: 0 }}
      >
        <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>
          GDELT v2 + FINNHUB
        </span>
        <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>
          {visible.length} ARTICLES
        </span>
      </div>
    </div>
  );
}
