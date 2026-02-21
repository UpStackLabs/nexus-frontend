import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useStockData } from "../../hooks/useStockData";
import { useStocks } from "../../hooks/useBackendData";
import { stocks as mockStocks, generateStockHistory } from "./mock-data";
import { useApp } from "../context";

// Pre-generate sparkline data for mock stocks (stable, does not re-randomize on render)
const sparklineData: Record<string, { price: number }[]> = {};
mockStocks.forEach((s) => {
  sparklineData[s.symbol] = generateStockHistory(s.price, 0.015).slice(-14);
});

function MiniChart({ symbol, positive }: { symbol: string; positive: boolean }) {
  const data = sparklineData[symbol] || [];
  const color = positive ? "#00c853" : "#c41e3a";
  if (data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={28}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`sg-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1}
          fill={`url(#sg-${symbol})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StockPanel() {
  const { selectedSymbol, setSelectedSymbol } = useApp();
  const { quotes, hasKey } = useStockData();
  const { stocks: backendStocks, loading: backendLoading } = useStocks();

  // Build display list: prefer backend stocks, fall back to mock
  const baseStocks = backendStocks.length > 0
    ? backendStocks.map((s) => ({
        symbol: s.ticker,
        name: s.companyName,
        price: s.price,
        change: s.priceChange,
        changePercent: s.priceChangePercent,
        volume: s.volume > 1_000_000
          ? `${(s.volume / 1_000_000).toFixed(1)}M`
          : s.volume > 1_000
            ? `${(s.volume / 1_000).toFixed(0)}K`
            : String(s.volume),
      }))
    : mockStocks;

  // Overlay Finnhub live quotes when available
  const displayStocks = baseStocks.map((s) => {
    const live = quotes[s.symbol];
    if (live) {
      return {
        ...s,
        price: live.c,
        change: live.d ?? s.change,
        changePercent: live.dp ?? s.changePercent,
      };
    }
    return s;
  });

  const isLive = hasKey || backendStocks.length > 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3 h-3 text-[#c41e3a]" />
          <span className="text-[10px] text-[#707070] tracking-[0.12em]">MARKET WATCH</span>
        </div>
        <span className="text-[9px] text-[#404040]">
          {backendLoading ? "LOADING" : isLive ? "LIVE" : "DEMO"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {displayStocks.map((stock) => {
          const positive = stock.change >= 0;
          return (
            <div
              key={stock.symbol}
              className={`px-3 py-2 border-b border-[#141414] cursor-pointer transition-colors hover:bg-[#141414] ${
                selectedSymbol === stock.symbol ? "bg-[#141414] border-l-2 border-l-[#c41e3a]" : ""
              }`}
              onClick={() => setSelectedSymbol(stock.symbol)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#d4d4d4]">{stock.symbol}</span>
                  <span className="text-[9px] text-[#404040] hidden xl:inline">{stock.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {positive ? (
                    <TrendingUp className="w-3 h-3 text-[#00c853]" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-[#c41e3a]" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[12px] text-[#d4d4d4] font-mono">
                    ${stock.price.toFixed(2)}
                  </span>
                  <span className={`text-[10px] ml-2 ${positive ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
                    {positive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="w-16">
                  <MiniChart symbol={stock.symbol} positive={positive} />
                </div>
              </div>
              <div className="text-[9px] text-[#353535] mt-0.5">VOL: {stock.volume}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
