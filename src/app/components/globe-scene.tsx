import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { globeMarkers } from "./mock-data";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

const severityColors: Record<string, string> = {
  CRITICAL: "#c41e3a",
  HIGH: "#ff9800",
  MEDIUM: "#2196f3",
  LOW: "#00c853",
};

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

export function GlobeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [20, 20],
      zoom: 1.5,
      projection: "mercator",
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      // --- Pulsing marker dots via canvas icons ---
      globeMarkers.forEach((marker) => {
        const color = severityColors[marker.severity] || "#2196f3";

        // Outer glow element
        const el = document.createElement("div");
        el.className = "mapbox-marker";
        el.style.width = "28px";
        el.style.height = "28px";
        el.style.position = "relative";

        // Pulse ring
        const pulse = document.createElement("div");
        pulse.style.cssText = `
          position:absolute;inset:0;border-radius:50%;
          border:1.5px solid ${color};opacity:0.5;
          animation:marker-pulse 2s ease-out infinite;
        `;
        el.appendChild(pulse);

        // Core dot
        const dot = document.createElement("div");
        dot.style.cssText = `
          position:absolute;top:50%;left:50%;
          width:10px;height:10px;border-radius:50%;
          background:${color};transform:translate(-50%,-50%);
          box-shadow:0 0 8px ${color};
        `;
        el.appendChild(dot);

        const popup = new mapboxgl.Popup({
          offset: 16,
          closeButton: false,
          className: "threat-popup",
        }).setHTML(
          `<div style="font-family:monospace;font-size:10px;letter-spacing:0.08em;color:#e0e0e0;padding:2px 0;">
            <div style="color:${color};font-weight:600;margin-bottom:3px;">[${marker.severity}] ${marker.type}</div>
            <div style="color:#999;">${marker.label}</div>
            <div style="color:#555;margin-top:3px;">${marker.lat.toFixed(1)}N ${Math.abs(marker.lng).toFixed(1)}${marker.lng >= 0 ? "E" : "W"}</div>
          </div>`
        );

        new mapboxgl.Marker({ element: el })
          .setLngLat([marker.lng, marker.lat])
          .setPopup(popup)
          .addTo(map);
      });

      // --- Connection arcs ---
      const arcFeatures = [];
      for (let i = 0; i < globeMarkers.length - 1; i++) {
        const m1 = globeMarkers[i];
        const m2 = globeMarkers[i + 1];
        arcFeatures.push({
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: buildArcCoords(
              [m1.lng, m1.lat],
              [m2.lng, m2.lat]
            ),
          },
        });
      }

      map.addSource("arcs", {
        type: "geojson",
        data: { type: "FeatureCollection", features: arcFeatures },
      });

      map.addLayer({
        id: "arcs-line",
        type: "line",
        source: "arcs",
        paint: {
          "line-color": "#c41e3a",
          "line-opacity": 0.25,
          "line-width": 1,
          "line-dasharray": [4, 4],
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-[11px] text-[#505050] tracking-[0.1em] text-center leading-relaxed">
          <div className="text-[#c41e3a] mb-2">[MAP OFFLINE]</div>
          <div>Set VITE_MAPBOX_TOKEN in .env.local</div>
          <div className="mt-1 text-[9px] text-[#353535]">
            Get a free token at mapbox.com
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* HUD overlays */}
      <div className="absolute top-3 left-3 z-30 text-[10px] tracking-[0.1em] pointer-events-none">
        <div className="text-[#505050] mb-0.5">[SCOPE] GLOBAL THREAT MAP</div>
        <div className="text-[#c41e3a]">
          {globeMarkers.length} ACTIVE EVENTS TRACKED
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-30 text-[9px] tracking-[0.08em] space-y-1 pointer-events-none">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
          <div key={sev} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: severityColors[sev] }}
            />
            <span className="text-[#505050]">{sev}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 z-30 text-[9px] text-[#353535] tracking-[0.08em] text-right pointer-events-none">
        <div>SRC: MULTI-INT</div>
        <div>REF: 30s CYCLE</div>
        <div>PROJ: MERCATOR</div>
      </div>

      <style>{`
        @keyframes marker-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .mapboxgl-popup-content {
          background: #111 !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 2px !important;
          padding: 8px 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.6) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: #111 !important;
        }
        .mapboxgl-ctrl-group {
          background: #111 !important;
          border: 1px solid #2a2a2a !important;
          border-radius: 2px !important;
        }
        .mapboxgl-ctrl-group button {
          border-color: #2a2a2a !important;
        }
        .mapboxgl-ctrl-group button span {
          filter: invert(1) brightness(0.5) !important;
        }
      `}</style>
    </div>
  );
}
