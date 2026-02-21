import { X, Bell, AlertCircle, Loader } from "lucide-react";
import { useApp } from "../context";
import { useNewsData } from "../../hooks/useNewsData";
import { useEvents } from "../../hooks/useBackendData";

const SEV_COLORS: Record<string, string> = {
  CRITICAL: "#c41e3a",
  HIGH: "#ff9800",
  MEDIUM: "#2196f3",
  LOW: "#00c853",
};

function severityLabel(severity: number): string {
  if (severity >= 8) return "CRITICAL";
  if (severity >= 6) return "HIGH";
  if (severity >= 4) return "MEDIUM";
  return "LOW";
}

function mapEventType(type: string): string {
  const typeMap: Record<string, string> = {
    military: "GEOPOLITICAL",
    geopolitical: "GEOPOLITICAL",
    economic: "ECONOMIC",
    natural_disaster: "WEATHER",
    cyber: "CYBER",
    supply_chain: "SUPPLY_CHAIN",
  };
  return typeMap[type.toLowerCase()] ?? type.toUpperCase();
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ago`;
  return `${m}m ago`;
}

export function AlertsPanel() {
  const { alertsOpen, setAlertsOpen } = useApp();
  const { news, loading } = useNewsData();
  const { events: backendEvents, loading: eventsLoading } = useEvents();

  if (!alertsOpen) return null;

  const alerts = backendEvents.map(e => ({
    id: e.id,
    type: mapEventType(e.type),
    severity: severityLabel(e.severity),
    title: e.title,
    description: e.description,
    timestamp: e.timestamp,
    source: e.source.toUpperCase(),
    impact: 0,
    impactedStocks: e.affectedTickers,
  }));

  const totalAlerts = alerts.length + Math.min(news.length, 10);

  return (
    <div
      className="fixed inset-0 z-[90]"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={() => setAlertsOpen(false)}
    >
      <div
        className="absolute right-0 top-0 h-full w-[380px] flex flex-col"
        style={{ backgroundColor: "#0a0a0a", borderLeft: "1px solid #1e1e1e" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e1e] shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#c41e3a]" />
            <span className="text-[11px] text-[#d4d4d4] tracking-[0.12em]">ACTIVE ALERTS</span>
            <span
              className="text-[9px] px-1.5 py-0.5"
              style={{
                color: "#c41e3a",
                backgroundColor: "rgba(196,30,58,0.1)",
                border: "1px solid rgba(196,30,58,0.3)",
              }}
            >
              {totalAlerts}
            </span>
          </div>
          <button
            onClick={() => setAlertsOpen(false)}
            className="text-[#505050] hover:text-[#808080] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Intelligence Alerts */}
          <div className="px-3 py-1.5 text-[9px] text-[#404040] tracking-[0.12em] bg-[#080808] border-b border-[#141414]">
            INTELLIGENCE ALERTS
            {backendEvents.length > 0 && (
              <span className="ml-2 text-[#00c853]">LIVE</span>
            )}
          </div>

          {eventsLoading && (
            <div className="px-4 py-4 flex items-center gap-2 text-[9px] text-[#404040]">
              <Loader className="w-3 h-3 animate-spin" />
              <span>FETCHING INTELLIGENCE DATA...</span>
            </div>
          )}
          {!eventsLoading && alerts.length === 0 && (
            <div className="px-4 py-4 flex items-center gap-2 text-[9px] text-[#404040]">
              <AlertCircle className="w-3 h-3" />
              <span>No active alerts</span>
            </div>
          )}
          {alerts.map((event) => (
            <div
              key={event.id}
              className="px-4 py-3 border-b border-[#141414] hover:bg-[#0e0e0e] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-0.5 min-h-[44px] shrink-0 mt-0.5 rounded"
                  style={{ backgroundColor: SEV_COLORS[event.severity] ?? "#505050" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[8px] tracking-[0.1em] px-1 py-0.5"
                      style={{
                        color: SEV_COLORS[event.severity],
                        backgroundColor: `${SEV_COLORS[event.severity]}15`,
                        border: `1px solid ${SEV_COLORS[event.severity]}30`,
                      }}
                    >
                      {event.severity}
                    </span>
                    <span className="text-[8px] text-[#404040]">{event.type.replace("_", " ")}</span>
                  </div>
                  <div className="text-[11px] text-[#c0c0c0] leading-tight mb-1">{event.title}</div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-[#404040]">
                      {new Date(event.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}{" "}
                      UTC
                    </span>
                    <span className="text-[9px] text-[#353535]">{event.source}</span>
                    {event.impact !== 0 && (
                      <span className={`text-[9px] ${event.impact > 0 ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
                        {event.impact > 0 ? "+" : ""}
                        {event.impact}%
                      </span>
                    )}
                  </div>
                  {'impactedStocks' in event && (event as { impactedStocks: string[] }).impactedStocks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(event as { impactedStocks: string[] }).impactedStocks.slice(0, 5).map((s: string) => (
                        <span key={s} className="text-[8px] px-1 py-0.5 bg-[#1a1a1a] text-[#606060] border border-[#252525]">
                          ${s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Live News Feed */}
          <div className="px-3 py-1.5 text-[9px] text-[#404040] tracking-[0.12em] bg-[#080808] border-b border-[#141414]">
            LIVE NEWS FEED
          </div>

          {loading && (
            <div className="px-4 py-4 text-[9px] text-[#404040] animate-pulse">
              FETCHING LIVE NEWS...
            </div>
          )}

          {!loading && news.length === 0 && (
            <div className="px-4 py-4 flex items-center gap-2 text-[9px] text-[#404040]">
              <AlertCircle className="w-3 h-3" />
              <span>No live news available</span>
            </div>
          )}

          {news.slice(0, 12).map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 border-b border-[#141414] hover:bg-[#0e0e0e] transition-colors"
            >
              <div className="text-[11px] text-[#c0c0c0] leading-tight mb-1 hover:text-[#d4d4d4]">
                {item.title}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] text-[#404040]">{timeAgo(item.timestamp)}</span>
                <span className="text-[9px] text-[#353535]">{item.source}</span>
                <span
                  className="text-[8px] px-1 py-0.5"
                  style={{ backgroundColor: "#1a1a1a", color: "#606060" }}
                >
                  {item.type === "geopolitical" ? "GEOPOLITICAL" : "MARKET"}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
