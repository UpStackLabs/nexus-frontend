import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as api from "../../services/api";
import { useApp } from "../context";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const severityColors: Record<string, string> = {
  CRITICAL: "#c41e3a",
  HIGH: "#ff9800",
  MEDIUM: "#2196f3",
  LOW: "#00c853",
};

function intensityToSeverity(intensity: number): string {
  if (intensity >= 0.8) return "CRITICAL";
  if (intensity >= 0.6) return "HIGH";
  if (intensity >= 0.3) return "MEDIUM";
  return "LOW";
}

function buildArcCoords(
  start: [number, number],
  end: [number, number],
  steps = 50
): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lng = start[0] + (end[0] - start[0]) * t;
    const lat = start[1] + (end[1] - start[1]) * t;
    coords.push([lng, lat]);
  }
  return coords;
}

interface GlobeSceneProps {
  selectedEventId?: string | null;
}

export function GlobeScene({ selectedEventId }: GlobeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [markerCount, setMarkerCount] = useState(0);
  const [companyCount, setCompanyCount] = useState(0);
  const [vectorCount, setVectorCount] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<api.ApiEvent | null>(null);
  const { simulationResult } = useApp();
  const isSimEvent = selectedEventId?.startsWith('sim-') ?? false;

  // ── Resolve full event when selectedEventId changes ───────────────
  useEffect(() => {
    if (!selectedEventId) {
      setSelectedEvent(null);
      return;
    }
    // Simulation events don't exist in the backend store
    if (selectedEventId.startsWith('sim-')) {
      setSelectedEvent(null);
      return;
    }
    api.getEvent(selectedEventId)
      .then((ev) => setSelectedEvent(ev))
      .catch(() => setSelectedEvent(null));
  }, [selectedEventId]);

  // ── Country heatmap + vector proximity ───────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    async function loadCountryMarkers() {
      type CountryFeature = GeoJSON.Feature<GeoJSON.Point, {
        severity: string;
        color: string;
        label: string;
        type: string;
        intensity: number;
        sectors: string;
        stocks: string;
        lat: number;
        lng: number;
      }>;

      let features: CountryFeature[] = [];
      let vecFeatures: GeoJSON.Feature<GeoJSON.Point, {
        color: string;
        label: string;
        intensity: number;
        sectors: string;
        lat: number;
        lng: number;
      }>[] = [];

      try {
        // Use simulation data from context for sim events, otherwise fetch from API
        const heatmap = (isSimEvent && simulationResult?.heatmap)
          ? simulationResult.heatmap
          : await api.getGlobeHeatmap(selectedEventId ?? undefined);
        features = heatmap.map((h) => ({
          type: "Feature",
          properties: {
            severity: intensityToSeverity(h.shockIntensity),
            color: severityColors[intensityToSeverity(h.shockIntensity)] || "#2196f3",
            label: h.country,
            type: h.direction.toUpperCase(),
            intensity: h.shockIntensity,
            sectors: h.affectedSectors.slice(0, 3).join(", "),
            stocks: h.topAffectedStocks.join(", ") || "—",
            lat: h.lat,
            lng: h.lng,
          },
          geometry: { type: "Point", coordinates: [h.lng, h.lat] },
        }));
      } catch (err) {
        console.error("Failed to load heatmap:", err);
      }

      if (selectedEventId && !isSimEvent) {
        try {
          const vecHeatmap = await api.getGlobeVectorProximity(selectedEventId);
          vecFeatures = vecHeatmap.map((h) => ({
            type: "Feature",
            properties: {
              color: "#9c27b0",
              label: h.country,
              intensity: h.shockIntensity,
              sectors: h.affectedSectors.slice(0, 3).join(", "),
              lat: h.lat,
              lng: h.lng,
            },
            geometry: { type: "Point", coordinates: [h.lng, h.lat] },
          }));
        } catch {
          // Vector DB offline — silent
        }
      }

      setMarkerCount(features.length);
      setVectorCount(vecFeatures.length);

      const geojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features };
      const vecGeojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: vecFeatures };

      if (map!.getSource("markers")) {
        (map!.getSource("markers") as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map!.addSource("markers", { type: "geojson", data: geojson });

        map!.addLayer({
          id: "markers-glow",
          type: "circle",
          source: "markers",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "intensity"], 0, 10, 0.5, 18, 1, 28],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.07,
            "circle-blur": 1,
          },
        });
        map!.addLayer({
          id: "markers-ring",
          type: "circle",
          source: "markers",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "intensity"], 0, 6, 0.5, 10, 1, 16],
            "circle-color": "transparent",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": ["get", "color"],
            "circle-stroke-opacity": ["interpolate", ["linear"], ["get", "intensity"], 0, 0.2, 1, 0.6],
          },
        });
        map!.addLayer({
          id: "markers-dot",
          type: "circle",
          source: "markers",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "intensity"], 0, 3, 0.5, 5, 1, 9],
            "circle-color": ["get", "color"],
            "circle-opacity": 0.9,
            "circle-blur": 0.2,
          },
        });

        map!.on("click", "markers-dot", (e) => {
          if (!e.features?.length) return;
          const f = e.features[0];
          const coords = (f.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
          const p = f.properties!;
          const pct = Math.round(Number(p.intensity) * 100);
          popupRef.current?.remove();
          popupRef.current = new mapboxgl.Popup({ offset: 16, closeButton: false, className: "threat-popup" })
            .setLngLat(coords)
            .setHTML(`<div style="font-family:monospace;font-size:10px;letter-spacing:0.08em;color:#e0e0e0;padding:2px 0;min-width:150px;">
              <div style="color:${p.color};font-weight:600;margin-bottom:4px;">[${p.severity}] ${p.type}</div>
              <div style="color:#ccc;margin-bottom:2px;">${p.label}</div>
              <div style="color:#888;margin-bottom:2px;">SHOCK: ${pct}%</div>
              ${p.sectors ? `<div style="color:#666;margin-bottom:2px;">SECTORS: ${p.sectors}</div>` : ""}
              ${p.stocks && p.stocks !== "—" ? `<div style="color:#555;">TICKERS: ${p.stocks}</div>` : ""}
            </div>`)
            .addTo(map!);
        });
        map!.on("mouseenter", "markers-dot", () => { map!.getCanvas().style.cursor = "pointer"; });
        map!.on("mouseleave", "markers-dot", () => { map!.getCanvas().style.cursor = ""; });
      }

      if (map!.getSource("vec-markers")) {
        (map!.getSource("vec-markers") as mapboxgl.GeoJSONSource).setData(vecGeojson);
      } else {
        map!.addSource("vec-markers", { type: "geojson", data: vecGeojson });
        map!.addLayer({
          id: "vec-markers-glow",
          type: "circle",
          source: "vec-markers",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "intensity"], 0, 12, 1, 20],
            "circle-color": "#9c27b0",
            "circle-opacity": 0.05,
            "circle-blur": 1.5,
          },
        });
        map!.addLayer({
          id: "vec-markers-ring",
          type: "circle",
          source: "vec-markers",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "intensity"], 0, 7, 1, 13],
            "circle-color": "transparent",
            "circle-stroke-width": 1,
            "circle-stroke-color": "#9c27b0",
            "circle-stroke-opacity": ["interpolate", ["linear"], ["get", "intensity"], 0, 0.15, 1, 0.45],
          },
        });
        map!.on("click", "vec-markers-ring", (e) => {
          if (!e.features?.length) return;
          const f = e.features[0];
          const coords = (f.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
          const p = f.properties!;
          popupRef.current?.remove();
          popupRef.current = new mapboxgl.Popup({ offset: 16, closeButton: false, className: "threat-popup" })
            .setLngLat(coords)
            .setHTML(`<div style="font-family:monospace;font-size:10px;letter-spacing:0.08em;color:#e0e0e0;padding:2px 0;min-width:150px;">
              <div style="color:#ce93d8;font-weight:600;margin-bottom:4px;">[VEC-SIM] HISTORICAL ANALOG</div>
              <div style="color:#ccc;margin-bottom:2px;">${p.label}</div>
              <div style="color:#888;margin-bottom:2px;">SIMILARITY: ${Math.round(Number(p.intensity) * 100)}%</div>
              ${p.sectors ? `<div style="color:#666;">SECTORS: ${p.sectors}</div>` : ""}
            </div>`)
            .addTo(map!);
        });
        map!.on("mouseenter", "vec-markers-ring", () => { map!.getCanvas().style.cursor = "pointer"; });
        map!.on("mouseleave", "vec-markers-ring", () => { map!.getCanvas().style.cursor = ""; });
      }

      // Fly to epicenter (highest-intensity dot) when event is selected
      if (selectedEventId && features.length > 0) {
        const epicenter = features.reduce((best, f) =>
          (f.properties.intensity > best.properties.intensity ? f : best)
        );
        const [lng, lat] = epicenter.geometry.coordinates;
        map!.flyTo({
          center: [lng, lat],
          zoom: Math.max(map!.getZoom(), 2.5),
          essential: true,
          duration: 1200,
          offset: [0, -40],
        });
      }
    }

    loadCountryMarkers();
  }, [selectedEventId, mapReady, isSimEvent, simulationResult]);

  // ── Company / stock dots ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    async function loadCompanyMarkers() {
      try {
        const { data: stocks } = await api.getStocks();
        const affectedTickers = new Set(selectedEvent?.affectedTickers ?? []);
        const hasFilter = affectedTickers.size > 0;

        type CompanyFeature = GeoJSON.Feature<GeoJSON.Point, {
          ticker: string;
          company: string;
          sector: string;
          pct: number;
          pctAbs: number;
          color: string;
          dotRadius: number;
          dotOpacity: number;
          strokeOpacity: number;
          isAffected: number;
        }>;

        const features: CompanyFeature[] = stocks
          .filter((s) => s.location && s.location.lat !== 0)
          .map((s) => {
            const isUp = s.priceChangePercent >= 0;
            const pctAbs = Math.abs(s.priceChangePercent);
            const isAffected = !hasFilter || affectedTickers.has(s.ticker);
            return {
              type: "Feature",
              properties: {
                ticker: s.ticker,
                company: s.companyName,
                sector: s.sector,
                pct: s.priceChangePercent,
                pctAbs,
                color: isUp ? "#22c55e" : "#ef4444",
                dotRadius: Math.max(2.5, Math.min(2.5 + pctAbs * 0.35, 7)),
                dotOpacity: isAffected ? 0.85 : 0.18,
                strokeOpacity: isAffected ? 0.5 : 0.08,
                isAffected: isAffected ? 1 : 0,
              },
              geometry: { type: "Point", coordinates: [s.location.lng, s.location.lat] },
            };
          });

        setCompanyCount(features.filter((f) => f.properties.isAffected).length);

        const geojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features };

        if (map!.getSource("company-markers")) {
          (map!.getSource("company-markers") as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
          map!.addSource("company-markers", { type: "geojson", data: geojson });

          // Glow for affected tickers
          map!.addLayer({
            id: "company-glow",
            type: "circle",
            source: "company-markers",
            filter: ["==", ["get", "isAffected"], 1],
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["get", "pctAbs"], 0, 10, 15, 20],
              "circle-color": ["get", "color"],
              "circle-opacity": 0.06,
              "circle-blur": 1.5,
            },
          });

          // Main company dot
          map!.addLayer({
            id: "company-dot",
            type: "circle",
            source: "company-markers",
            paint: {
              "circle-radius": ["get", "dotRadius"],
              "circle-color": ["get", "color"],
              "circle-opacity": ["get", "dotOpacity"],
              "circle-stroke-width": 1,
              "circle-stroke-color": ["get", "color"],
              "circle-stroke-opacity": ["get", "strokeOpacity"],
            },
          });

          // Ticker label for affected companies (only when zoomed in enough)
          map!.addLayer({
            id: "company-label",
            type: "symbol",
            source: "company-markers",
            filter: ["==", ["get", "isAffected"], 1],
            minzoom: 3,
            layout: {
              "text-field": ["get", "ticker"],
              "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
              "text-size": 8,
              "text-offset": [0, 1.2],
              "text-anchor": "top",
              "text-allow-overlap": false,
            },
            paint: {
              "text-color": ["get", "color"],
              "text-opacity": 0.7,
              "text-halo-color": "#0a0a0a",
              "text-halo-width": 1,
            },
          });

          // Popup on click
          map!.on("click", "company-dot", (e) => {
            if (!e.features?.length) return;
            const f = e.features[0];
            const coords = (f.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
            const p = f.properties!;
            const sign = Number(p.pct) >= 0 ? "+" : "";
            popupRef.current?.remove();
            popupRef.current = new mapboxgl.Popup({ offset: 12, closeButton: false, className: "threat-popup" })
              .setLngLat(coords)
              .setHTML(`<div style="font-family:monospace;font-size:10px;letter-spacing:0.08em;color:#e0e0e0;padding:2px 0;min-width:130px;">
                <div style="color:${p.color};font-weight:600;margin-bottom:3px;">${p.ticker}</div>
                <div style="color:#aaa;margin-bottom:2px;">${p.company}</div>
                <div style="color:${p.color};margin-bottom:2px;">Δ ${sign}${Number(p.pct).toFixed(2)}%</div>
                <div style="color:#555;">${p.sector}</div>
              </div>`)
              .addTo(map!);
          });
          map!.on("mouseenter", "company-dot", () => { map!.getCanvas().style.cursor = "pointer"; });
          map!.on("mouseleave", "company-dot", () => { map!.getCanvas().style.cursor = ""; });
        }
      } catch (err) {
        console.error("Failed to load company markers:", err);
      }
    }

    loadCompanyMarkers();
  }, [selectedEvent, mapReady]);

  // ── Arcs ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    async function loadArcs() {
      let arcFeatures: GeoJSON.Feature<GeoJSON.LineString, {
        intensity: number; color: string; from: string; to: string;
      }>[] = [];

      try {
        // Use simulation arcs from context for sim events
        const backendArcs = (isSimEvent && simulationResult?.arcs)
          ? simulationResult.arcs
          : await api.getGlobeArcs(selectedEventId ?? undefined);
        arcFeatures = backendArcs.map((arc) => ({
          type: "Feature" as const,
          properties: {
            intensity: arc.shockIntensity,
            color: arc.color || "#c41e3a",
            from: arc.fromLabel || "",
            to: arc.toLabel || "",
          },
          geometry: {
            type: "LineString" as const,
            coordinates: buildArcCoords([arc.startLng, arc.startLat], [arc.endLng, arc.endLat]),
          },
        }));
      } catch (err) {
        console.error("Failed to load arcs:", err);
      }

      const data: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: arcFeatures };

      if (map!.getSource("arcs")) {
        (map!.getSource("arcs") as mapboxgl.GeoJSONSource).setData(data);
      } else {
        map!.addSource("arcs", { type: "geojson", data });
        map!.addLayer({
          id: "arcs-glow",
          type: "line",
          source: "arcs",
          paint: {
            "line-color": ["get", "color"],
            "line-opacity": 0.12,
            "line-width": 4,
            "line-blur": 3,
          },
        });
        map!.addLayer({
          id: "arcs-line",
          type: "line",
          source: "arcs",
          paint: {
            "line-color": ["get", "color"],
            "line-opacity": ["*", ["get", "intensity"], 0.5],
            "line-width": ["interpolate", ["linear"], ["get", "intensity"], 0, 0.5, 1, 2],
            "line-dasharray": [3, 3],
          },
        });
      }
    }

    loadArcs();
  }, [selectedEventId, mapReady, isSimEvent, simulationResult]);

  // ── Map init ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20, 20],
      zoom: 1.8,
      projection: "mercator",
      attributionControl: false,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => setMapReady(true));

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-[11px] text-[#505050] tracking-[0.1em] text-center leading-relaxed">
          <div className="text-[#c41e3a] mb-2">[MAP OFFLINE]</div>
          <div>Set VITE_MAPBOX_TOKEN in .env.local</div>
          <div className="mt-1 text-[9px] text-[#353535]">Get a free token at mapbox.com</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* HUD — top left */}
      <div className="absolute top-3 left-3 z-30 text-[10px] tracking-[0.1em] pointer-events-none">
        <div className="text-[#505050] mb-0.5">[SCOPE] GLOBAL SHOCK MAP</div>
        {isSimEvent && (
          <div className="text-[#ff9100] mb-0.5 animate-pulse">[SIMULATION ACTIVE]</div>
        )}
        {selectedEvent ? (
          <>
            <div className="text-[#c41e3a] mb-0.5 max-w-[200px] truncate">
              EVT: {selectedEvent.title.toUpperCase()}
            </div>
            <div className="text-[#888]">
              {markerCount} COUNTRIES · {companyCount} COS
              {vectorCount > 0 && (
                <span className="text-[#9c27b0] ml-2">+{vectorCount} VEC</span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-[#c41e3a] mb-0.5">{markerCount} SHOCK ZONES ACTIVE</div>
            <div className="text-[#606060]">{companyCount} COMPANIES MONITORED</div>
          </>
        )}
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-3 left-3 z-30 text-[9px] tracking-[0.08em] space-y-1 pointer-events-none">
        <div className="text-[#404040] mb-1">COUNTRY SHOCK</div>
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
          <div key={sev} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[sev] }} />
            <span className="text-[#505050]">{sev}</span>
          </div>
        ))}
        <div className="text-[#404040] mt-1.5 mb-1 pt-1 border-t border-[#1a1a1a]">COMPANIES</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
          <span className="text-[#505050]">GAIN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
          <span className="text-[#505050]">LOSS</span>
        </div>
        {vectorCount > 0 && (
          <>
            <div className="text-[#404040] mt-1.5 mb-1 pt-1 border-t border-[#1a1a1a]">VEC-SIM</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full border border-[#9c27b0]" />
              <span className="text-[#664d70]">ANALOG</span>
            </div>
          </>
        )}
      </div>

      {/* Metadata — bottom right */}
      <div className="absolute bottom-3 right-3 z-30 text-[9px] text-[#353535] tracking-[0.08em] text-right pointer-events-none">
        <div>SRC: MULTI-INT</div>
        <div>REF: 30s CYCLE</div>
        <div>PROJ: MERCATOR-2D</div>
      </div>

      <style>{`
        .mapboxgl-popup-content {
          background: #111 !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 2px !important;
          padding: 8px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
        }
        .mapboxgl-popup-tip { border-top-color: #111 !important; }
        .mapboxgl-ctrl-group {
          background: #111 !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 2px !important;
        }
        .mapboxgl-ctrl-group button { border-color: #2a2a2a !important; }
        .mapboxgl-ctrl-group button span { filter: invert(1) brightness(0.5) !important; }
      `}</style>
    </div>
  );
}
