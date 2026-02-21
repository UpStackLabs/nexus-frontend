import { useState, useEffect } from "react";
import { Activity, Radio, Shield, Search, Bell, Satellite } from "lucide-react";
import { systemStatus } from "./mock-data";
import { useApp, NavTab } from "../context";

export function Header() {
  const [time, setTime] = useState(new Date());
  const { activeTab, setActiveTab, setSearchOpen, setAlertsOpen } = useApp();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utcTime = time.toUTCString().split(" ").slice(4).join(" ").replace(" GMT", "");

  return (
    <header className="h-12 border-b border-[#1e1e1e] bg-[#0a0a0a] flex items-center px-4 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 bg-[#c41e3a] flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="text-[#d4d4d4] tracking-[0.15em] text-[13px]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          NEXUS
        </span>
        <span className="text-[#505050] text-[10px] tracking-[0.1em]">INTELLIGENCE</span>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-1">
        {(["DASHBOARD", "GLOBE", "INTEL", "MARKETS"] as NavTab[]).map((item) => (
          <button
            key={item}
            onClick={() => setActiveTab(item)}
            className={`px-3 py-1 text-[10px] tracking-[0.12em] transition-colors ${
              activeTab === item
                ? "text-[#c41e3a] bg-[#c41e3a]/10 border border-[#c41e3a]/30"
                : "text-[#606060] hover:text-[#909090] border border-transparent"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* System Status */}
      <div className="flex items-center gap-4 text-[10px] tracking-[0.08em]">
        <div className="flex items-center gap-1.5 text-[#505050]">
          <Radio className="w-3 h-3 text-[#00c853]" />
          <span>{systemStatus.dataFeeds} FEEDS</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#505050]">
          <Satellite className="w-3 h-3 text-[#2196f3]" />
          <span>{systemStatus.satellitesTracked} SAT</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#505050]">
          <Shield className="w-3 h-3 text-[#ff9800]" />
          <span className="text-[#ff9800]">{systemStatus.threatLevel}</span>
        </div>

        <div className="h-4 w-px bg-[#1e1e1e]" />

        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-1.5 text-[#505050] hover:text-[#808080] transition-colors"
        >
          <Search className="w-3 h-3" />
          <span className="text-[10px]">SEARCH</span>
        </button>

        <button
          onClick={() => setAlertsOpen(true)}
          className="relative flex items-center gap-1.5 text-[#505050] hover:text-[#808080] transition-colors"
        >
          <Bell className="w-3 h-3" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#c41e3a] rounded-full" />
        </button>

        <div className="h-4 w-px bg-[#1e1e1e]" />

        <div className="flex items-center gap-1 text-[#707070] font-mono">
          <span className="text-[10px]">{utcTime} UTC</span>
        </div>
      </div>
    </header>
  );
}
