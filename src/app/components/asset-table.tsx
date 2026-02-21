import { TrendingUp, TrendingDown, Loader, AlertCircle } from 'lucide-react';
import { useStockData } from '../../hooks/useStockData';
import { useFxData } from '../../hooks/useFxData';
import { WATCHLIST } from '../../config';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };

function pct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}
function price(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ChangeCell({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span style={{ color: pos ? 'var(--green)' : 'var(--red-bright)', ...MONO }}>
      {pos ? <TrendingUp className="inline w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="inline w-2.5 h-2.5 mr-0.5" />}
      {pct(value)}
    </span>
  );
}

export function AssetTable() {
  const { quotes, loading, hasKey, lastUpdated } = useStockData();
  const { rates, loading: fxLoading } = useFxData();

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-3"
        style={{ height: '32px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}
      >
        <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)', letterSpacing: '0.12em' }}>
          ASSET WATCHLIST
        </span>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>
              {lastUpdated.toUTCString().split(' ').slice(4, 5).join('')} UTC
            </span>
          )}
          {loading && <Loader className="w-2.5 h-2.5 animate-spin" style={{ color: 'var(--text-3)' }} />}
        </div>
      </div>

      {/* No-key warning */}
      {!hasKey && (
        <div
          className="flex items-start gap-2 px-3 py-2"
          style={{ backgroundColor: '#1a0a0a', borderBottom: '1px solid var(--red-dim)' }}
        >
          <AlertCircle className="w-3 h-3 mt-0.5 flex-none" style={{ color: 'var(--red)' }} />
          <div style={{ ...MONO, fontSize: '8px', color: '#7a4040', lineHeight: '1.6' }}>
            Add VITE_FINNHUB_KEY to .env.local for live quotes. Free at finnhub.io
          </div>
        </div>
      )}

      {/* Column headers */}
      <div
        className="grid px-3 py-1"
        style={{
          gridTemplateColumns: '1fr auto auto',
          borderBottom: '1px solid var(--border-dim)',
          flexShrink: 0,
        }}
      >
        {['SYMBOL', 'PRICE', 'CHG%'].map(h => (
          <span key={h} style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)', letterSpacing: '0.1em', textAlign: h !== 'SYMBOL' ? 'right' : 'left' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Quote rows */}
      <div className="flex-1 overflow-y-auto">
        {WATCHLIST.map((sym, i) => {
          const q = quotes[sym];
          const isAlt = i % 2 === 1;
          return (
            <div
              key={sym}
              className="grid px-3 items-center group"
              style={{
                gridTemplateColumns: '1fr auto auto',
                height: '26px',
                backgroundColor: isAlt ? 'var(--row-alt)' : undefined,
                borderBottom: '1px solid var(--border-dim)',
              }}
            >
              {/* Symbol */}
              <span
                style={{
                  ...MONO,
                  fontSize: '10px',
                  color: q ? 'var(--text)' : 'var(--text-3)',
                  fontWeight: q ? 500 : 400,
                }}
              >
                {sym}
              </span>

              {/* Price */}
              <span style={{ ...MONO, fontSize: '10px', color: 'var(--text-2)', textAlign: 'right', minWidth: '70px' }}>
                {q ? price(q.c) : loading ? '——' : 'N/A'}
              </span>

              {/* Change */}
              <div style={{ minWidth: '72px', textAlign: 'right', fontSize: '10px' }}>
                {q ? <ChangeCell value={q.dp} /> : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* FX Rates section */}
      <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div
          className="px-3 py-1"
          style={{ borderBottom: '1px solid var(--border-dim)' }}
        >
          <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.12em' }}>
            FX RATES — USD BASE
          </span>
        </div>

        {fxLoading ? (
          <div className="px-3 py-2 flex items-center gap-2" style={{ color: 'var(--text-3)' }}>
            <Loader className="w-2.5 h-2.5 animate-spin" />
            <span style={{ ...MONO, fontSize: '9px' }}>Loading...</span>
          </div>
        ) : (
          rates.map((entry, i) => (
            <div
              key={entry.currency}
              className="grid px-3 items-center"
              style={{
                gridTemplateColumns: '1fr auto',
                height: '24px',
                backgroundColor: i % 2 === 0 ? 'var(--row-alt)' : undefined,
                borderBottom: '1px solid var(--border-dim)',
              }}
            >
              <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)' }}>
                {entry.pair}
              </span>
              <span style={{ ...MONO, fontSize: '10px', color: 'var(--text)', textAlign: 'right' }}>
                {entry.rate.toFixed(4)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
