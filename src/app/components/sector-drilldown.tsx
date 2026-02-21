import { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import * as api from '../../services/api';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };
const COND: React.CSSProperties = { fontFamily: "'IBM Plex Sans Condensed', sans-serif" };

export function SectorDrilldown() {
  const [sectors, setSectors] = useState<api.ApiSector[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.getSectors()
      .then(setSectors)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-3" style={{ color: 'var(--text-3)' }}>
        <Loader className="w-2.5 h-2.5 animate-spin" />
        <span style={{ ...MONO, fontSize: '9px' }}>Loading sectors...</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="px-3 py-1"
        style={{ borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}
      >
        <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-3)', letterSpacing: '0.12em' }}>
          SECTOR IMPACT
        </span>
      </div>

      {sectors.map(sector => {
        const isExpanded = expanded === sector.sector;
        const dirColor = sector.predictedDirection === 'up'
          ? 'var(--green)'
          : sector.predictedDirection === 'down'
            ? 'var(--red-bright)'
            : 'var(--amber)';

        return (
          <div key={sector.sector}>
            <button
              onClick={() => setExpanded(isExpanded ? null : sector.sector)}
              className="flex items-center w-full px-3"
              style={{
                height: '28px',
                borderBottom: '1px solid var(--border-dim)',
                background: isExpanded ? 'var(--bg-raised)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                justifyContent: 'space-between',
              }}
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  size={9}
                  style={{
                    color: 'var(--text-3)',
                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s',
                  }}
                />
                <span style={{ ...MONO, fontSize: '9px', color: 'var(--text-2)' }}>
                  {sector.sector.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ ...MONO, fontSize: '9px', color: dirColor }}>
                  {sector.predictedDirection === 'up' ? (
                    <TrendingUp className="inline w-2.5 h-2.5 mr-0.5" />
                  ) : sector.predictedDirection === 'down' ? (
                    <TrendingDown className="inline w-2.5 h-2.5 mr-0.5" />
                  ) : null}
                  {sector.predictedDirection.toUpperCase()}
                </span>
                {/* Shock bar */}
                <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--bg-raised)', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: `${Math.min(100, sector.averageShockScore * 100)}%`,
                      backgroundColor: dirColor,
                    }}
                  />
                </div>
                <span style={{ ...COND, fontSize: '11px', fontWeight: 600, color: dirColor, minWidth: '28px', textAlign: 'right' }}>
                  {sector.averageShockScore.toFixed(2)}
                </span>
              </div>
            </button>

            {/* Expanded stock list */}
            {isExpanded && sector.topAffectedStocks.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-surface)' }}>
                {sector.topAffectedStocks.map(stock => (
                  <div
                    key={stock.ticker}
                    className="flex items-center justify-between px-3"
                    style={{
                      height: '22px',
                      paddingLeft: '28px',
                      borderBottom: '1px solid var(--border-dim)',
                    }}
                  >
                    <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-2)' }}>
                      {stock.ticker}
                    </span>
                    <span style={{ ...MONO, fontSize: '8px', color: 'var(--text-3)' }}>
                      {stock.companyName}
                    </span>
                    <span
                      style={{
                        ...MONO,
                        fontSize: '8px',
                        color: stock.direction === 'up' ? 'var(--green)' : 'var(--red-bright)',
                      }}
                    >
                      {stock.shockScore.toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
