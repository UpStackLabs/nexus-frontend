import { Cloud, Thermometer, Wind, Droplets, Gauge, Satellite } from "lucide-react";
import { useWeatherData } from "../../hooks/useWeatherData";
import { satellitePasses } from "./mock-data";

// Map the 3 Open-Meteo locations to display names
const REGION_NAMES: Record<string, string> = {
  Caracas: "South America",
  Houston: "Gulf of Mexico",
  Washington: "East Coast US",
};

const statusForTemp = (t: number) => {
  if (t > 35) return { label: "HEAT ADVISORY", color: "#ff9800" };
  if (t < 0) return { label: "FREEZE WARNING", color: "#2196f3" };
  return { label: "NOMINAL", color: "#00c853" };
};

export function WeatherPanel() {
  const { data: weatherData, loading } = useWeatherData();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <Cloud className="w-3 h-3 text-[#2196f3]" />
          <span className="text-[10px] text-[#707070] tracking-[0.12em]">WEATHER / SAT DATA</span>
        </div>
        <span className="text-[9px] text-[#404040]">OPEN-METEO LIVE</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Live Weather Conditions */}
        <div className="px-3 py-2">
          <div className="text-[9px] text-[#505050] tracking-[0.1em] mb-2">ACTIVE CONDITIONS</div>
          {loading ? (
            <div className="text-[9px] text-[#404040] animate-pulse">FETCHING ATMOSPHERIC DATA...</div>
          ) : (
            <div className="space-y-2">
              {weatherData.map((loc) => {
                const status = loc.current ? statusForTemp(loc.current.temperature_2m) : { label: "UNAVAILABLE", color: "#505050" };
                const regionName = REGION_NAMES[loc.name] ?? loc.name;
                return (
                  <div key={loc.name} className="p-2 bg-[#0e0e0e] border border-[#1a1a1a]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-[#a0a0a0]">{regionName}</span>
                      <span
                        className="text-[8px] tracking-[0.08em] px-1.5 py-0.5"
                        style={{
                          color: status.color,
                          backgroundColor: `${status.color}15`,
                          border: `1px solid ${status.color}30`,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                    {loc.current ? (
                      <div className="grid grid-cols-4 gap-2">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-2.5 h-2.5 text-[#404040]" />
                          <span className="text-[9px] text-[#808080]">{loc.current.temperature_2m.toFixed(1)}°C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wind className="w-2.5 h-2.5 text-[#404040]" />
                          <span className="text-[9px] text-[#808080]">{loc.current.wind_speed_10m.toFixed(0)}kph</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplets className="w-2.5 h-2.5 text-[#404040]" />
                          <span className="text-[9px] text-[#808080]">{loc.current.precipitation.toFixed(1)}mm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gauge className="w-2.5 h-2.5 text-[#404040]" />
                          <span className="text-[9px] text-[#808080]">{loc.current.surface_pressure.toFixed(0)}hPa</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[9px] text-[#404040]">Data unavailable</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Satellite Schedule */}
        <div className="px-3 py-2 border-t border-[#141414]">
          <div className="text-[9px] text-[#505050] tracking-[0.1em] mb-2">SATELLITE PASSES</div>
          <div className="space-y-1">
            {satellitePasses.map((sat, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-[#0e0e0e] border border-[#141414]">
                <div className="flex items-center gap-2">
                  <Satellite className="w-3 h-3 text-[#2196f3]" />
                  <span className="text-[10px] text-[#a0a0a0]">{sat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-[#505050]">{sat.type}</span>
                  <span className="text-[9px] text-[#707070]">{sat.nextPass}</span>
                  <span className="text-[9px] text-[#404040]">{sat.elevation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
