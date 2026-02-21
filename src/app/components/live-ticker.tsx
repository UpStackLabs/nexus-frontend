import { useEffect, useRef } from 'react';

const MONO: React.CSSProperties = { fontFamily: "'IBM Plex Mono', monospace" };

interface PriceItem {
  ticker: string;
  price: number;
  changePercent: number;
}

interface Props {
  prices: PriceItem[];
}

export function LiveTicker({ prices }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const animRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || prices.length === 0) return;

    const animate = () => {
      posRef.current -= 0.5;
      if (posRef.current < -(el.scrollWidth / 2)) {
        posRef.current = 0;
      }
      el.style.transform = `translateX(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [prices]);

  if (prices.length === 0) return null;

  // Double the items for seamless loop
  const items = [...prices, ...prices];

  return (
    <div
      style={{
        height: '18px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-dim)',
        backgroundColor: 'var(--bg-surface)',
        flexShrink: 0,
      }}
    >
      <div ref={scrollRef} className="flex items-center h-full" style={{ whiteSpace: 'nowrap', willChange: 'transform' }}>
        {items.map((p, i) => (
          <span
            key={`${p.ticker}-${i}`}
            className="inline-flex items-center gap-1"
            style={{ ...MONO, fontSize: '8px', paddingLeft: '16px' }}
          >
            <span style={{ color: 'var(--text-2)' }}>{p.ticker}</span>
            <span style={{ color: 'var(--text-3)' }}>${p.price.toFixed(2)}</span>
            <span style={{ color: p.changePercent >= 0 ? 'var(--green)' : 'var(--red-bright)' }}>
              {p.changePercent >= 0 ? '+' : ''}{p.changePercent.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
