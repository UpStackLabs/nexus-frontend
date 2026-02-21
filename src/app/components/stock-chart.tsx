import { useState } from "react";
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Bar,
} from "recharts";
import { stocks } from "./mock-data";
import { useStockData } from "../../hooks/useStockData";
import { useChartData } from "../../hooks/useChartData";
import { useApp } from "../context";
import { Activity, ChevronDown } from "lucide-react";

const timeframes = ["1D", "1W", "1M", "3M", "1Y"];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] border border-[#2a2a2a] px-3 py-2">
        <p className="text-[10px] text-[#707070] mb-1">{label}</p>
        <p className="text-[12px] text-[#d4d4d4]">${payload[0]?.value?.toFixed(2)}</p>
        {payload[1] && (
          <p className="text-[9px] text-[#505050]">
            Vol: {(payload[1].value / 1000000).toFixed(1)}M
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
  const { quotes, hasKey } = useStockData();

  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];

  const livePrice = quotes[selectedSymbol]?.c ?? selectedStock.price;
  const liveChange = quotes[selectedSymbol]?.d ?? selectedStock.change;
  const liveChangePct = quotes[selectedSymbol]?.dp ?? selectedStock.changePercent;

  const { data, loading } = useChartData(selectedSymbol, selectedTimeframe, livePrice);

  const positive = (liveChange ?? 0) >= 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-[#c41e3a]" />
            <span className="text-[10px] text-[#707070] tracking-[0.12em]">PRICE ACTION</span>
          </div>

          <div className="relative">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-[#111111] text-[#d4d4d4] text-[11px] border border-[#2a2a2a] px-2 py-0.5 appearance-none pr-5 cursor-pointer focus:outline-none focus:border-[#c41e3a]"
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#505050] absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#d4d4d4]">${livePrice.toFixed(2)}</span>
            <span className={`text-[10px] ${positive ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
              {positive ? "+" : ""}{(liveChange ?? 0).toFixed(2)} ({positive ? "+" : ""}{(liveChangePct ?? 0).toFixed(2)}%)
            </span>
            {hasKey && <span className="text-[8px] text-[#404040]">LIVE</span>}
          </div>

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

      <div className="flex-1 px-2 pt-2 min-h-0 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span className="text-[9px] text-[#404040] animate-pulse tracking-[0.1em]">LOADING CANDLES...</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={positive ? "#00c853" : "#c41e3a"} stopOpacity={0.2} />
                <stop offset="100%" stopColor={positive ? "#00c853" : "#c41e3a"} stopOpacity={0} />
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
            <Bar yAxisId="volume" dataKey="volume" fill="#1a1a1a" opacity={0.5} radius={[1, 1, 0, 0]} />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke={positive ? "#00c853" : "#c41e3a"}
              strokeWidth={1.5}
              fill="url(#priceGradient)"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
