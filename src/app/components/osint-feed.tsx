import { useState } from "react";
import { Shield, Cloud, Cpu, Globe2, TrendingDown, ChevronRight, Radio } from "lucide-react";
import { useNewsData } from "../../hooks/useNewsData";
import { osintEvents } from "./mock-data";

type OsintEvent = typeof osintEvents[number];

const typeIcons: Record<string, React.ReactNode> = {
  GEOPOLITICAL: <Globe2 className="w-3 h-3" />,
  WEATHER: <Cloud className="w-3 h-3" />,
  CYBER: <Shield className="w-3 h-3" />,
  SUPPLY_CHAIN: <Cpu className="w-3 h-3" />,
  ECONOMIC: <TrendingDown className="w-3 h-3" />,
};

const severityColors: Record<string, string> = {
  CRITICAL: "#c41e3a",
  HIGH: "#ff9800",
  MEDIUM: "#2196f3",
  LOW: "#00c853",
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m ago`;
  return `${mins}m ago`;
}

// Map GDELT/Finnhub news to the OSINT event format for display
function gdeltToEvent(article: { id: string; title: string; source: string; url: string; timestamp: number; type: string }, idx: number): OsintEvent {
  return {
    id: idx + 100,
    type: "GEOPOLITICAL",
    severity: "MEDIUM",
    title: article.title,
    description: `Source: ${article.source}. Click to read full article.`,
    timestamp: new Date(article.timestamp).toISOString(),
    lat: 0,
    lng: 0,
    impactedStocks: [],
    impact: 0,
    source: article.source.toUpperCase(),
  };
}

export function OsintFeed() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [showAll, setShowAll] = useState(false);
  const { news } = useNewsData();

  // Merge real GDELT news with mock events for a richer feed
  const liveEvents: OsintEvent[] = news
    .filter((n) => n.type === "geopolitical")
    .slice(0, 4)
    .map(gdeltToEvent);

  const allEvents: OsintEvent[] = [...liveEvents, ...osintEvents];

  const filteredEvents =
    filter === "ALL" ? allEvents : allEvents.filter((e) => e.type === filter);

  const visibleEvents = showAll ? filteredEvents : filteredEvents.slice(0, 8);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Radio className="w-3 h-3 text-[#c41e3a]" />
          <span className="text-[10px] text-[#707070] tracking-[0.12em]">OSINT FEED</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-[#00c853] rounded-full animate-pulse" />
          <span className="text-[9px] text-[#404040]">LIVE</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#141414] overflow-x-auto">
        {["ALL", "GEOPOLITICAL", "WEATHER", "CYBER", "SUPPLY_CHAIN", "ECONOMIC"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 text-[8px] tracking-[0.1em] whitespace-nowrap transition-colors ${
              filter === f
                ? "text-[#c41e3a] bg-[#c41e3a]/10 border border-[#c41e3a]/30"
                : "text-[#505050] hover:text-[#808080] border border-transparent"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto">
        {visibleEvents.map((event) => (
          <div
            key={event.id}
            className="px-3 py-2.5 border-b border-[#141414] cursor-pointer hover:bg-[#0e0e0e] transition-colors"
            onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-1 min-h-[40px] shrink-0 mt-0.5"
                style={{ backgroundColor: severityColors[event.severity] }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: severityColors[event.severity] }}>
                    {typeIcons[event.type]}
                  </span>
                  <span
                    className="text-[8px] tracking-[0.1em] px-1 py-0.5"
                    style={{
                      color: severityColors[event.severity],
                      backgroundColor: `${severityColors[event.severity]}15`,
                      border: `1px solid ${severityColors[event.severity]}30`,
                    }}
                  >
                    {event.severity}
                  </span>
                  <span className="text-[8px] text-[#404040] tracking-[0.08em]">
                    {event.type.replace("_", " ")}
                  </span>
                </div>

                <div className="text-[11px] text-[#c0c0c0] mb-1 leading-tight">
                  {event.title}
                </div>

                <div className="flex items-center gap-3 text-[9px] text-[#404040]">
                  <span>{timeAgo(event.timestamp)}</span>
                  <span className="text-[#353535]">{event.source}</span>
                </div>

                {expandedId === event.id && (
                  <div className="mt-2 pt-2 border-t border-[#1a1a1a]">
                    <p className="text-[10px] text-[#707070] mb-2 leading-relaxed">
                      {event.description}
                    </p>
                    {event.impact !== 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] text-[#505050] tracking-[0.08em]">IMPACT:</span>
                        <span className={`text-[10px] ${event.impact > 0 ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
                          {event.impact > 0 ? "+" : ""}{event.impact}%
                        </span>
                      </div>
                    )}
                    {event.impactedStocks.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.impactedStocks.map((s) => (
                          <span key={s} className="text-[9px] px-1.5 py-0.5 bg-[#1a1a1a] text-[#808080] border border-[#252525]">
                            ${s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <ChevronRight
                className={`w-3 h-3 text-[#353535] shrink-0 transition-transform ${
                  expandedId === event.id ? "rotate-90" : ""
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-1.5 border-t border-[#1e1e1e] flex items-center justify-between">
        <span className="text-[9px] text-[#404040]">
          {visibleEvents.length}/{filteredEvents.length} EVENTS
        </span>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-[9px] text-[#c41e3a] tracking-[0.08em] hover:underline transition-opacity"
        >
          {showAll ? "COLLAPSE <<<" : "VIEW ALL >>>"}
        </button>
      </div>
    </div>
  );
}
