import { useState, useEffect } from "react";
import { Target, Loader } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { useApp } from "../context";
import * as api from "../../services/api";

interface ImpactEntry {
  name: string;
  impact: number;
  type: string;
  severity: string;
}

interface SectorEntry {
  sector: string;
  change: number;
  color: string;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111] border border-[#2a2a2a] px-3 py-2 text-[10px]">
        <p className="text-[#a0a0a0] mb-1">{label}</p>
        <p className={payload[0].value >= 0 ? "text-[#00c853]" : "text-[#c41e3a]"}>
          Impact: {payload[0].value > 0 ? "+" : ""}{payload[0].value.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

export function EventImpact() {
  const { selectedEventId } = useApp();
  const [impactData, setImpactData] = useState<ImpactEntry[]>([]);
  const [sectorPerformance, setSectorPerformance] = useState<SectorEntry[]>([]);
  const [loadingShocks, setLoadingShocks] = useState(false);
  const [loadingSectors, setLoadingSectors] = useState(true);

  // Fetch shock scores for the selected event
  useEffect(() => {
    if (!selectedEventId) {
      setImpactData([]);
      return;
    }

    setLoadingShocks(true);
    api.getEventShocks(selectedEventId)
      .then((shocks) => {
        setImpactData(
          shocks.slice(0, 10).map((s) => ({
            name: s.ticker,
            impact: s.predictedChange,
            type: s.direction === "up" ? "POSITIVE" : "NEGATIVE",
            severity: s.score >= 8 ? "CRITICAL" : s.score >= 6 ? "HIGH" : "MEDIUM",
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch event shocks:", err);
      })
      .finally(() => setLoadingShocks(false));
  }, [selectedEventId]);

  // Fetch sectors
  useEffect(() => {
    api.getSectors()
      .then((sectors) => {
        setSectorPerformance(
          sectors.map((s) => ({
            sector: s.sector,
            change: s.averageShockScore * (s.predictedDirection === "down" ? -1 : 1),
            color: s.predictedDirection === "down" ? "#c41e3a" : "#00c853",
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to fetch sectors:", err);
      })
      .finally(() => setLoadingSectors(false));
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Target className="w-3 h-3 text-[#ff9800]" />
          <span className="text-[10px] text-[#707070] tracking-[0.12em]">
            EVENT-STOCK IMPACT CORRELATION
          </span>
        </div>
        <span className="text-[9px] text-[#404040]">{selectedEventId ? "LIVE" : "SELECT EVENT"}</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 px-2 pt-2 min-h-0 relative">
          {loadingShocks && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader className="w-3 h-3 animate-spin text-[#404040]" />
            </div>
          )}
          {!loadingShocks && impactData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-[9px] text-[#404040] tracking-[0.1em]">
                {selectedEventId ? "NO SHOCK DATA" : "SELECT AN EVENT TO VIEW IMPACT"}
              </span>
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={impactData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 8, fill: "#505050" }}
                axisLine={{ stroke: "#1e1e1e" }}
                tickLine={{ stroke: "#1e1e1e" }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#505050" }}
                axisLine={{ stroke: "#1e1e1e" }}
                tickLine={{ stroke: "#1e1e1e" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#2a2a2a" />
              <Bar dataKey="impact" radius={[2, 2, 0, 0]}>
                {impactData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact >= 0 ? "#00c853" : "#c41e3a"}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="px-3 py-2 border-t border-[#141414]">
          <div className="text-[9px] text-[#505050] tracking-[0.1em] mb-2">SECTOR IMPACT</div>
          {loadingSectors ? (
            <div className="flex items-center gap-2">
              <Loader className="w-3 h-3 animate-spin text-[#404040]" />
              <span className="text-[9px] text-[#404040]">Loading sectors...</span>
            </div>
          ) : sectorPerformance.length === 0 ? (
            <div className="text-[9px] text-[#404040]">No sector data available</div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {sectorPerformance.map((s, i) => (
                <div key={i} className="p-1.5 bg-[#0e0e0e] border border-[#141414] flex flex-col gap-0.5">
                  <span className="text-[8px] text-[#505050] truncate">{s.sector}</span>
                  <span className="text-[11px]" style={{ color: s.color }}>
                    {s.change > 0 ? "+" : ""}{s.change.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
