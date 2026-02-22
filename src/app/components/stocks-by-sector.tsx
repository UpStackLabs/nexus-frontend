import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ChevronRight, TrendingUp, TrendingDown, Layers, Loader } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useStocks, useSectors } from "../../hooks/useBackendData";
import { useStockData } from "../../hooks/useStockData";
import { useSocket } from "../../hooks/useSocket";
import { getStockHistory } from "../../services/api";
import { useApp } from "../context";

function MiniSparkline({ symbol, positive }: { symbol: string; positive: boolean }) {
  const [data, setData] = useState<{ price: number }[]>([]);

  useEffect(() => {
    getStockHistory(symbol, "1W")
      .then((points) => setData(points.slice(-14).map((p) => ({ price: p.price }))))
      .catch(() => {});
  }, [symbol]);

  const color = positive ? "#00c853" : "#c41e3a";
  if (data.length === 0) return <div className="w-14 h-7" />;

  return (
    <ResponsiveContainer width="100%" height={28}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`sbs-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sbs-${symbol})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ShockBadge({ score }: { score: number }) {
  const level =
    score >= 0.75 ? "CRITICAL" : score >= 0.5 ? "HIGH" : score >= 0.25 ? "MED" : "LOW";
  const color =
    score >= 0.75
      ? "text-[#ff1744] bg-[#ff1744]/10 border-[#ff1744]/30"
      : score >= 0.5
        ? "text-[#ff9100] bg-[#ff9100]/10 border-[#ff9100]/30"
        : score >= 0.25
          ? "text-[#ffd600] bg-[#ffd600]/10 border-[#ffd600]/30"
          : "text-[#00c853] bg-[#00c853]/10 border-[#00c853]/30";

  return (
    <span className={`text-[7px] px-1 py-0.5 border tracking-wider ${color}`}>
      {level}
    </span>
  );
}

export function StocksBySector() {
  const { selectedSymbol, setSelectedSymbol, simulationResult } = useApp();
  const { stocks: backendStocks, loading: stocksLoading } = useStocks();
  const { sectors, loading: sectorsLoading } = useSectors();
  const { quotes } = useStockData();
  const { prices } = useSocket();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [flashTickers, setFlashTickers] = useState<Set<string>>(new Set());
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Track price updates and trigger flash
  const prevPricesRef = useRef<Record<string, number>>({});
  useEffect(() => {
    for (const [ticker, data] of Object.entries(prices)) {
      const prev = prevPricesRef.current[ticker];
      if (prev !== undefined && prev !== data.price) {
        setFlashTickers((s) => new Set(s).add(ticker));
        if (flashTimers.current[ticker]) clearTimeout(flashTimers.current[ticker]);
        flashTimers.current[ticker] = setTimeout(() => {
          setFlashTickers((s) => {
            const next = new Set(s);
            next.delete(ticker);
            return next;
          });
        }, 2000);
      }
      prevPricesRef.current[ticker] = data.price;
    }
  }, [prices]);

  const simAffectedSectors = useMemo(() => {
    if (!simulationResult) return new Set<string>();
    return new Set(simulationResult.topAffectedSectors.map((s) => s.sector));
  }, [simulationResult]);

  // Group stocks by sector
  const grouped = useMemo(() => {
    const map: Record<string, typeof backendStocks> = {};
    for (const stock of backendStocks) {
      const sector = stock.sector || "Other";
      if (!map[sector]) map[sector] = [];
      map[sector].push(stock);
    }
    // Sort sectors by average shock score from sector data
    const sectorOrder = sectors.map((s) => s.sector);
    return Object.entries(map).sort(([a], [b]) => {
      const idxA = sectorOrder.indexOf(a);
      const idxB = sectorOrder.indexOf(b);
      return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
    });
  }, [backendStocks, sectors]);

  // Auto-expand the first 2 sectors
  useEffect(() => {
    if (grouped.length > 0 && Object.keys(expanded).length === 0) {
      const initial: Record<string, boolean> = {};
      grouped.slice(0, 2).forEach(([sector]) => {
        initial[sector] = true;
      });
      setExpanded(initial);
    }
  }, [grouped, expanded]);

  const toggleSector = (sector: string) => {
    setExpanded((prev) => ({ ...prev, [sector]: !prev[sector] }));
  };

  const getSectorShockScore = (sector: string) => {
    return sectors.find((s) => s.sector === sector)?.averageShockScore ?? 0;
  };

  const loading = stocksLoading || sectorsLoading;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Layers className="w-3 h-3 text-[#c41e3a]" />
          <span className="text-[10px] text-[#707070] tracking-[0.12em]">STOCKS BY SECTOR</span>
        </div>
        <span className="text-[9px] text-[#404040]">
          {loading ? "LOADING" : `${backendStocks.length} ASSETS`}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 px-3 py-4">
            <Loader className="w-3 h-3 animate-spin text-[#404040]" />
            <span className="text-[9px] text-[#404040]">Loading sector data...</span>
          </div>
        )}
        {!loading &&
          grouped.map(([sector, stocks]) => {
            const isOpen = expanded[sector] ?? false;
            const shockScore = getSectorShockScore(sector);
            return (
              <div key={sector}>
                <button
                  onClick={() => toggleSector(sector)}
                  className="w-full flex items-center justify-between px-3 py-1.5 border-b border-[#141414] hover:bg-[#111111] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className={`w-3 h-3 text-[#505050] transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                    <span className="text-[10px] text-[#a0a0a0] tracking-wide">{sector.toUpperCase()}</span>
                    <span className="text-[8px] text-[#404040]">({stocks.length})</span>
                    {simulationResult && simAffectedSectors.has(sector) && (
                      <span className="text-[7px] px-1 py-0.5 border border-[#ff9100]/30 bg-[#ff9100]/10 text-[#ff9100] tracking-wider">
                        SIM
                      </span>
                    )}
                  </div>
                  <ShockBadge score={shockScore} />
                </button>

                {isOpen && (
                  <div>
                    {stocks.map((stock) => {
                      // Merge live prices from socket, backend quotes, or seed fallback
                      const socketPrice = prices[stock.ticker];
                      const quote = quotes[stock.ticker];
                      const livePrice = socketPrice?.price ?? quote?.c ?? stock.price;
                      const change = socketPrice?.change ?? quote?.d ?? stock.priceChange;
                      const changePct = socketPrice?.changePercent ?? quote?.dp ?? stock.priceChangePercent;
                      const positive = change >= 0;
                      const isSelected = selectedSymbol === stock.ticker;
                      const isFlashing = flashTickers.has(stock.ticker);

                      return (
                        <div
                          key={stock.ticker}
                          onClick={() => setSelectedSymbol(stock.ticker)}
                          className={`flex items-center justify-between px-3 py-1.5 cursor-pointer transition-colors hover:bg-[#141414] border-b border-[#0e0e0e] ${
                            isSelected ? "bg-[#141414] border-l-2 border-l-[#c41e3a]" : "pl-[14px]"
                          }`}
                          style={isFlashing ? {
                            backgroundColor: positive ? 'rgba(0, 200, 83, 0.08)' : 'rgba(196, 30, 58, 0.08)',
                            transition: 'background-color 0.3s ease-in',
                          } : undefined}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {positive ? (
                              <TrendingUp className="w-2.5 h-2.5 text-[#00c853] shrink-0" />
                            ) : (
                              <TrendingDown className="w-2.5 h-2.5 text-[#c41e3a] shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-[10px] text-[#d4d4d4]">{stock.ticker}</div>
                              <div className="text-[8px] text-[#404040] truncate max-w-[80px]">
                                {stock.companyName}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-14">
                              <MiniSparkline symbol={stock.ticker} positive={positive} />
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-[#d4d4d4] font-mono">
                                ${livePrice.toFixed(2)}
                              </div>
                              <div
                                className={`text-[8px] ${positive ? "text-[#00c853]" : "text-[#c41e3a]"}`}
                              >
                                {positive ? "+" : ""}
                                {changePct.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
