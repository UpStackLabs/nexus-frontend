import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { sectorPerformance as mockSectorPerformance, osintEvents } from "./mock-data";
import { useApp } from "../context";
import * as api from "../../services/api";

// Mock impact data as fallback
const mockImpactData = osintEvents.map((e) => ({
  name: e.title.split(" ").slice(0, 3).join(" "),
  impact: e.impact,
  type: e.type,
  severity: e.severity,
}));

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
  const [impactData, setImpactData] = useState(mockImpactData);
  const [sectorPerformance, setSectorPerformance] = useState(mockSectorPerformance);

  // Fetch shock scores for the selected event
  useEffect(() => {
    if (!selectedEventId) {
      setImpactData(mockImpactData);
      return;
    }

    api.getEventShocks(selectedEventId)
      .then((shocks) => {
        if (shocks.length > 0) {
          setImpactData(
            shocks.slice(0, 10).map((s) => ({
              name: s.ticker,
              impact: s.predictedChange,
              type: s.direction === "up" ? "POSITIVE" : "NEGATIVE",
              severity: s.score >= 8 ? "CRITICAL" : s.score >= 6 ? "HIGH" : "MEDIUM",
            }))
          );
        }
      })
      .catch(() => {
        // Keep current data on error
      });
  }, [selectedEventId]);

  // Fetch sectors
  useEffect(() => {
    api.getSectors()
      .then((sectors) => {
        if (sectors.length > 0) {
          setSectorPerformance(
            sectors.map((s) => ({
              sector: s.sector,
              change: s.averageShockScore * (s.predictedDirection === "down" ? -1 : 1),
              color: s.predictedDirection === "down" ? "#c41e3a" : "#00c853",
            }))
          );
        }
      })
      .catch(() => {
        // Keep mock data on error
      });
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
        <span className="text-[9px] text-[#404040]">{selectedEventId ? "LIVE" : "DEMO"}</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 px-2 pt-2 min-h-0">
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
        </div>
      </div>
    </div>
  );
}
