import { Header } from "./header";
import { GlobeScene } from "./globe-scene";
import { OsintFeed } from "./osint-feed";
import { StockChart } from "./stock-chart";
import { StocksBySector } from "./stocks-by-sector";
import { useStockData } from "../../hooks/useStockData";
import { useFxData } from "../../hooks/useFxData";
import { useSocket } from "../../hooks/useSocket";
import { useApp } from "../context";

function ScanLine() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />
    </div>
  );
}

function TickerBar() {
  const { quotes } = useStockData();
  const { rates } = useFxData();

  const stockTickers = Object.entries(quotes).map(([sym, q]) => ({
    sym,
    val: `$${q.c.toFixed(2)}`,
    chg: `${q.dp >= 0 ? "+" : ""}${q.dp.toFixed(2)}%`,
    positive: q.dp >= 0,
  }));

  const fxTickers = rates
    .filter((r) => r.rate > 0)
    .map((r) => {
      const invertedPairs = ["EUR", "GBP"];
      const display = invertedPairs.includes(r.currency)
        ? (1 / r.rate).toFixed(4)
        : r.rate.toFixed(4);
      const label = invertedPairs.includes(r.currency)
        ? `${r.currency}/USD`
        : `USD/${r.currency}`;
      return { sym: label, val: display, chg: "", positive: true };
    });

  const tickers = [...stockTickers, ...fxTickers];
  const display = tickers.length > 0 ? [...tickers, ...tickers] : [];

  if (display.length === 0) {
    return <div className="h-6 bg-[#080808] border-b border-[#141414] shrink-0" />;
  }

  return (
    <div className="h-6 bg-[#080808] border-b border-[#141414] flex items-center overflow-hidden shrink-0">
      <div className="flex items-center gap-6 animate-marquee px-4">
        {display.map((t, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[9px] text-[#505050]">{t.sym}</span>
            <span className="text-[9px] text-[#808080]">{t.val}</span>
            {t.chg && (
              <span className={`text-[9px] ${t.positive ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
                {t.chg}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { connected } = useSocket();
  const { selectedEventId } = useApp();

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden relative">
      <ScanLine />
      <Header />
      <TickerBar />

      {/* Main Content Grid */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - OSINT / News Feed */}
        <div className="w-[320px] border-r border-[#1e1e1e] flex flex-col shrink-0">
          <OsintFeed />
        </div>

        {/* Center Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Globe - top ~55% */}
          <div className="flex-[55] relative min-h-0">
            <GlobeScene selectedEventId={selectedEventId} />
            {/* Corner markers */}
            <div className="pointer-events-none absolute inset-0 z-20">
              <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-[#2a2a2a]" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-[#2a2a2a]" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-[#2a2a2a]" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-[#2a2a2a]" />
            </div>
          </div>

          {/* Stock Chart with Prediction - bottom ~45% */}
          <div className="flex-[45] border-t border-[#1e1e1e] min-h-0">
            <StockChart />
          </div>
        </div>

        {/* Right Panel - Stocks by Sector */}
        <div className="w-[300px] border-l border-[#1e1e1e] flex flex-col shrink-0">
          <StocksBySector />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-5 bg-[#080808] border-t border-[#141414] flex items-center justify-between px-4 shrink-0">
        <span className="text-[8px] text-[#353535] tracking-[0.08em]">LATENCY: 12ms</span>
        <div className="flex items-center gap-1">
          <div className={`w-1 h-1 rounded-full ${connected ? "bg-[#00c853]" : "bg-[#c41e3a]"}`} />
          <span className={`text-[8px] tracking-[0.08em] ${connected ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
            {connected ? "CONNECTED" : "DISCONNECTED"}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
