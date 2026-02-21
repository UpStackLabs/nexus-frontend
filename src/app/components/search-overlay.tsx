import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Globe2 } from "lucide-react";
import { useApp } from "../context";
import { stocks, osintEvents } from "./mock-data";

const severityColors: Record<string, string> = {
  CRITICAL: "#c41e3a", HIGH: "#ff9800", MEDIUM: "#2196f3", LOW: "#00c853",
};

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setSelectedSymbol, setActiveTab } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const q = query.toLowerCase();

  const matchedStocks = q
    ? stocks.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    : stocks.slice(0, 4);

  const matchedEvents = q
    ? osintEvents.filter((e) => e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
    : osintEvents.slice(0, 3);

  const hasResults = matchedStocks.length > 0 || matchedEvents.length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(2px)" }}
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-[600px] flex flex-col"
        style={{ border: "1px solid #2a2a2a", backgroundColor: "#0e0e0e", maxHeight: "70vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e1e1e]">
          <Search className="w-4 h-4 text-[#505050] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks, events, symbols..."
            className="flex-1 bg-transparent text-[#d4d4d4] text-[13px] outline-none placeholder-[#404040]"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          />
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[#353535] border border-[#252525] px-1.5 py-0.5">ESC</span>
            <button onClick={() => setSearchOpen(false)} className="text-[#505050] hover:text-[#808080]">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto">
          {!hasResults && query && (
            <div className="px-4 py-6 text-center text-[11px] text-[#404040]">
              No results for "{query}"
            </div>
          )}

          {/* Stocks */}
          {matchedStocks.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[9px] text-[#404040] tracking-[0.12em] border-b border-[#141414] bg-[#080808]">
                STOCKS
              </div>
              {matchedStocks.map((s) => (
                <button
                  key={s.symbol}
                  className="w-full flex items-center gap-4 px-4 py-2.5 hover:bg-[#141414] border-b border-[#141414] text-left transition-colors"
                  onClick={() => {
                    setSelectedSymbol(s.symbol);
                    setActiveTab("MARKETS");
                    setSearchOpen(false);
                  }}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-[#505050] shrink-0" />
                  <span className="text-[13px] text-[#d4d4d4] w-16 shrink-0">{s.symbol}</span>
                  <span className="text-[11px] text-[#505050] flex-1">{s.name}</span>
                  <span className={`text-[11px] ${s.change >= 0 ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
                    {s.change >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                  </span>
                  <span className="text-[11px] text-[#808080]">${s.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Events */}
          {matchedEvents.length > 0 && (
            <div>
              <div className="px-4 py-2 text-[9px] text-[#404040] tracking-[0.12em] border-b border-[#141414] bg-[#080808]">
                INTELLIGENCE EVENTS
              </div>
              {matchedEvents.map((e) => (
                <button
                  key={e.id}
                  className="w-full flex items-start gap-4 px-4 py-2.5 hover:bg-[#141414] border-b border-[#141414] text-left transition-colors"
                  onClick={() => {
                    setActiveTab("INTEL");
                    setSearchOpen(false);
                  }}
                >
                  <Globe2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: severityColors[e.severity] }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-[#c0c0c0] leading-tight truncate">{e.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px]" style={{ color: severityColors[e.severity] }}>{e.severity}</span>
                      <span className="text-[9px] text-[#404040]">{e.type.replace("_", " ")}</span>
                      <span className="text-[9px] text-[#353535]">{e.source}</span>
                    </div>
                  </div>
                  <span className={`text-[11px] shrink-0 ${e.impact >= 0 ? "text-[#00c853]" : "text-[#c41e3a]"}`}>
                    {e.impact > 0 ? "+" : ""}{e.impact}%
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Footer hint */}
          {!query && (
            <div className="px-4 py-2 text-[9px] text-[#303030] flex items-center gap-3">
              <span>↵ select</span>
              <span>↑↓ navigate</span>
              <span>ESC close</span>
              <span className="ml-auto">⌘K to open</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
