import { useState } from "react";
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Bar, ReferenceLine,
} from "recharts";
import { useStockData } from "../../hooks/useStockData";
import { useStocks } from "../../hooks/useBackendData";
import { useChartData } from "../../hooks/useChartData";
import { usePrediction } from "../../hooks/usePrediction";
import { useApp } from "../context";
import { Activity, ChevronDown, Loader, Brain } from "lucide-react";

const timeframes = ["1D", "1W", "1M", "3M", "1Y"];

interface ChartPoint {
  date: string;
  price?: number;
  volume?: number;
  predicted?: number;
  upper?: number;
  lower?: number;
  isToday?: boolean;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string }) {
  if (active && payload && payload.length) {
    const price = payload.find(p => p.dataKey === "price");
    const predicted = payload.find(p => p.dataKey === "predicted");
    const volume = payload.find(p => p.dataKey === "volume");
    const upper = payload.find(p => p.dataKey === "upper");
    const lower = payload.find(p => p.dataKey === "lower");

    return (
      <div className="bg-[#111111] border border-[#2a2a2a] px-3 py-2">
        <p className="text-[10px] text-[#707070] mb-1">{label}</p>
        {price && <p className="text-[12px] text-[#d4d4d4]">${price.value?.toFixed(2)}</p>}
        {predicted && (
          <p className="text-[11px] text-[#7c4dff]">
            Predicted: ${predicted.value?.toFixed(2)}
          </p>
        )}
        {upper && lower && (
          <p className="text-[9px] text-[#505050]">
            Band: ${lower.value?.toFixed(2)} – ${upper.value?.toFixed(2)}
          </p>
        )}
        {volume && (
          <p className="text-[9px] text-[#505050]">
            Vol: {(volume.value / 1000000).toFixed(1)}M
          </p>
        )}
      </div>
    );
  }
  return null;
}

export function StockChart() {
  const { selectedSymbol, setSelectedSymbol } = useApp();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [showPrediction, setShowPrediction] = useState(true);
  const { quotes } = useStockData();
  const { stocks: backendStocks, loading: stocksLoading } = useStocks();

  const stockList = backendStocks.map(s => ({
    symbol: s.ticker,
    name: s.companyName,
    price: s.price,
    change: s.priceChange,
    changePercent: s.priceChangePercent,
  }));

  const selectedStock = stockList.find((s) => s.symbol === selectedSymbol) || stockList[0];

  const livePrice = quotes[selectedSymbol]?.c ?? selectedStock?.price ?? 0;
  const liveChange = quotes[selectedSymbol]?.d ?? selectedStock?.change ?? 0;
  const liveChangePct = quotes[selectedSymbol]?.dp ?? selectedStock?.changePercent ?? 0;

  const { data: historyData, loading: historyLoading } = useChartData(selectedSymbol, selectedTimeframe, livePrice);
  const { data: prediction, loading: predictionLoading } = usePrediction(selectedSymbol);

  const positive = (liveChange ?? 0) >= 0;

  // Merge historical + prediction data
  const mergedData: ChartPoint[] = [
    ...historyData.map((p) => ({
      date: p.date,
      price: p.price,
      volume: p.volume,
    })),
  ];

  // Add "today" marker and prediction data
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayDate = fmtDate(new Date().toISOString());

  if (showPrediction && prediction?.trajectory) {
    // Add today divider
    mergedData.push({
      date: todayDate,
      price: livePrice,
      predicted: livePrice,
      upper: livePrice,
      lower: livePrice,
      isToday: true,
    });

    // Add prediction points
    for (const pt of prediction.trajectory) {
      mergedData.push({
        date: fmtDate(pt.date),
        predicted: pt.price,
        upper: pt.upper,
        lower: pt.lower,
      });
    }
  }

  const loading = historyLoading || predictionLoading;

  // Predicted end price
  const lastPred = prediction?.trajectory?.[prediction.trajectory.length - 1];
  const predChange = lastPred ? ((lastPred.price - livePrice) / livePrice * 100) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-[#c41e3a]" />
            <span className="text-[10px] text-[#707070] tracking-[0.12em]">PRICE ACTION</span>
          </div>

          <div className="relative">
            {stocksLoading ? (
              <div className="flex items-center gap-1 px-2 py-0.5">
                <Loader className="w-3 h-3 animate-spin text-[#404040]" />
              </div>
            ) : (
              <>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="bg-[#111111] text-[#d4d4d4] text-[11px] border border-[#2a2a2a] px-2 py-0.5 appearance-none pr-5 cursor-pointer focus:outline-none focus:border-[#c41e3a]"
                >
                  {stockList.map((s) => (
                    <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#505050] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#d4d4d4]">${livePrice.toFixed(2)}</span>
            <span className={`text-[10px] ${positive ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
              {positive ? "+" : ""}{(liveChange ?? 0).toFixed(2)} ({positive ? "+" : ""}{(liveChangePct ?? 0).toFixed(2)}%)
            </span>
            <span className="text-[8px] text-[#404040]">LIVE</span>
          </div>

          {/* Prediction toggle */}
          <button
            onClick={() => setShowPrediction(!showPrediction)}
            className={`flex items-center gap-1 px-2 py-0.5 text-[9px] border transition-colors ${
              showPrediction
                ? "text-[#7c4dff] bg-[#7c4dff]/10 border-[#7c4dff]/30"
                : "text-[#505050] border-transparent hover:text-[#808080]"
            }`}
          >
            <Brain className="w-3 h-3" />
            AI
          </button>

          <div className="flex items-center gap-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-0.5 text-[9px] transition-colors ${
                  selectedTimeframe === tf
                    ? "text-[#c41e3a] bg-[#c41e3a]/10 border border-[#c41e3a]/30"
                    : "text-[#505050] hover:text-[#808080] border border-transparent"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 pt-2 min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[9px] text-[#404040] animate-pulse tracking-[0.1em]">LOADING CANDLES...</span>
          </div>
        )}
        {!loading && mergedData.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[9px] text-[#404040] tracking-[0.1em]">NO CHART DATA</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mergedData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={positive ? "#00c853" : "#c41e3a"} stopOpacity={0.2} />
                <stop offset="100%" stopColor={positive ? "#00c853" : "#c41e3a"} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c4dff" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#7c4dff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c4dff" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#7c4dff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#141414" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#404040" }}
              axisLine={{ stroke: "#1e1e1e" }}
              tickLine={{ stroke: "#1e1e1e" }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="price"
              tick={{ fontSize: 9, fill: "#404040" }}
              axisLine={{ stroke: "#1e1e1e" }}
              tickLine={{ stroke: "#1e1e1e" }}
              tickFormatter={(v) => `$${v}`}
              domain={["auto", "auto"]}
            />
            <YAxis
              yAxisId="volume"
              orientation="right"
              tick={{ fontSize: 8, fill: "#303030" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Volume bars */}
            <Bar yAxisId="volume" dataKey="volume" fill="#1a1a1a" opacity={0.5} radius={[1, 1, 0, 0]} />

            {/* Historical price */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke={positive ? "#00c853" : "#c41e3a"}
              strokeWidth={1.5}
              fill="url(#priceGradient)"
              dot={false}
              connectNulls={false}
            />

            {/* Confidence band */}
            {showPrediction && (
              <>
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#bandGradient)"
                  dot={false}
                  connectNulls={false}
                />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="transparent"
                  dot={false}
                  connectNulls={false}
                />
              </>
            )}

            {/* Prediction line */}
            {showPrediction && (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="predicted"
                stroke="#7c4dff"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                fill="url(#predGradient)"
                dot={false}
                connectNulls={false}
              />
            )}

            {/* Today reference line */}
            {showPrediction && prediction && (
              <ReferenceLine
                yAxisId="price"
                x={todayDate}
                stroke="#7c4dff"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* AI Summary Bar */}
      {showPrediction && prediction && (
        <div className="px-3 py-2 border-t border-[#1e1e1e] bg-[#0c0c0c]">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-3 h-3 text-[#7c4dff]" />
            <span className="text-[9px] text-[#7c4dff] tracking-[0.1em]">AI PREDICTION — {prediction.trajectory.length}D</span>
            <span className="text-[9px] text-[#505050]">|</span>
            <span className="text-[9px] text-[#505050]">Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
            {predChange !== null && (
              <>
                <span className="text-[9px] text-[#505050]">|</span>
                <span className={`text-[9px] ${predChange >= 0 ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
                  Target: ${lastPred!.price.toFixed(2)} ({predChange >= 0 ? "+" : ""}{predChange.toFixed(1)}%)
                </span>
              </>
            )}
          </div>
          <p className="text-[9px] text-[#707070] leading-relaxed line-clamp-2">
            {prediction.aiSummary}
          </p>
        </div>
      )}
    </div>
  );
}
