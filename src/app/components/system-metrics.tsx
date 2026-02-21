import { useEffect, useState } from "react";
import { Cpu, Wifi, Zap, Database, Activity, Shield } from "lucide-react";
import * as api from "../../services/api";
import { useEvents } from "../../hooks/useBackendData";

const NODE_ID = `NX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const segments = 20;
  const filled = Math.round((value / max) * segments);
  return (
    <div className="flex gap-[1px]">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] h-2"
          style={{
            backgroundColor: i < filled ? color : "#1a1a1a",
            opacity: i < filled ? 0.8 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

export function SystemMetrics() {
  const { events } = useEvents();
  const [signals, setSignals] = useState(0);
  const [health, setHealth] = useState<{ status: string; uptime: number; timestamp: string } | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // Fetch health from backend
  useEffect(() => {
    const fetchHealth = () => {
      api.getHealth()
        .then(h => {
          setHealth(h);
          setBackendOnline(true);
        })
        .catch(() => {
          setBackendOnline(false);
        });
    };
    fetchHealth();
    const id = setInterval(fetchHealth, 30_000);
    return () => clearInterval(id);
  }, []);

  // Increment signals counter
  useEffect(() => {
    const interval = setInterval(() => {
      setSignals((prev) => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = events.length;
  const dataFeeds = backendOnline ? 47 : 0;
  const uptime = health ? formatUptime(health.uptime) : "—";
  const lastSync = health ? health.timestamp : new Date().toISOString();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Cpu className="w-3 h-3 text-[#9c27b0]" />
          <span className="text-[10px] text-[#707070] tracking-[0.12em]">SYSTEM STATUS</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-[#00c853]" : "bg-[#ff9800]"}`} />
          <span className={`text-[9px] ${backendOnline ? "text-[#00c853]" : "text-[#ff9800]"}`}>
            {backendOnline ? "OPERATIONAL" : "DEMO MODE"}
          </span>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        <div className="p-2 bg-[#0e0e0e] border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#ff9800]" />
              <span className="text-[9px] text-[#505050] tracking-[0.08em]">SIGNALS CAPTURED</span>
            </div>
            <span className="text-[14px] text-[#d4d4d4] tabular-nums">{signals.toLocaleString()}</span>
          </div>
          <MetricBar value={signals % 100} max={100} color="#ff9800" />
        </div>

        <div className="p-2 bg-[#0e0e0e] border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3 text-[#2196f3]" />
              <span className="text-[9px] text-[#505050] tracking-[0.08em]">ACTIVE DATA FEEDS</span>
            </div>
            <span className="text-[14px] text-[#d4d4d4]">{dataFeeds}</span>
          </div>
          <MetricBar value={dataFeeds} max={60} color="#2196f3" />
        </div>

        <div className="p-2 bg-[#0e0e0e] border border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#c41e3a]" />
              <span className="text-[9px] text-[#505050] tracking-[0.08em]">ACTIVE ALERTS</span>
            </div>
            <span className="text-[14px] text-[#c41e3a]">{activeAlerts}</span>
          </div>
          <MetricBar value={activeAlerts} max={20} color="#c41e3a" />
        </div>

        <div className="p-2 bg-[#0e0e0e] border border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#00c853]" />
              <span className="text-[9px] text-[#505050] tracking-[0.08em]">SYSTEM UPTIME</span>
            </div>
            <span className="text-[14px] text-[#00c853]">{uptime}</span>
          </div>
        </div>

        <div className="p-2 bg-[#0e0e0e] border border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3 text-[#00c853]" />
              <span className="text-[9px] text-[#505050] tracking-[0.08em]">LAST SYNC</span>
            </div>
            <span className="text-[10px] text-[#707070]">
              {new Date(lastSync).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
              })}{" "}UTC
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#141414]">
          <div className="text-[8px] text-[#303030] tracking-[0.1em] space-y-1">
            <div>SYS.VERSION: NEXUS-4.2.1</div>
            <div>CRYPTO.MODULE: AES-256-GCM</div>
            <div>DATA.CLASSIFICATION: TS//SCI</div>
            <div>NODE.ID: {NODE_ID}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}
