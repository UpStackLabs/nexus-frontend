import { useRef, useEffect, useCallback } from "react";
import { globeMarkers } from "./mock-data";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function latLngTo3D(lat: number, lng: number, radius: number): Point3D {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

function rotateY(point: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos + point.z * sin,
    y: point.y,
    z: -point.x * sin + point.z * cos,
  };
}

function rotateX(point: Point3D, angle: number): Point3D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
}

function project(
  point: Point3D,
  width: number,
  height: number,
  fov = 600
): { x: number; y: number; scale: number } | null {
  const z = point.z + fov;
  if (z <= 0) return null;
  const scale = fov / z;
  return { x: point.x * scale + width / 2, y: -point.y * scale + height / 2, scale };
}

function generateContinentDots(): { lat: number; lng: number }[] {
  const dots: { lat: number; lng: number }[] = [];
  const regions = [
    { latMin: 25, latMax: 60, lngMin: -130, lngMax: -70, density: 120 },
    { latMin: -55, latMax: 10, lngMin: -80, lngMax: -35, density: 80 },
    { latMin: 35, latMax: 70, lngMin: -10, lngMax: 45, density: 100 },
    { latMin: -35, latMax: 35, lngMin: -15, lngMax: 50, density: 100 },
    { latMin: 10, latMax: 65, lngMin: 60, lngMax: 145, density: 140 },
    { latMin: -40, latMax: -12, lngMin: 115, lngMax: 155, density: 50 },
    { latMin: 55, latMax: 72, lngMin: 20, lngMax: 180, density: 80 },
  ];
  regions.forEach((r) => {
    for (let i = 0; i < r.density; i++) {
      dots.push({
        lat: r.latMin + Math.random() * (r.latMax - r.latMin),
        lng: r.lngMin + Math.random() * (r.lngMax - r.lngMin),
      });
    }
  });
  return dots;
}

const continentDots = generateContinentDots();

const severityColors: Record<string, string> = {
  CRITICAL: "#c41e3a",
  HIGH: "#ff9800",
  MEDIUM: "#2196f3",
  LOW: "#00c853",
};

export function GlobeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const rotationRef = useRef({ y: 0.3, x: -0.3 });
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const radius = Math.min(w, h) * 0.32;
    const rotY = rotationRef.current.y;
    const rotX = rotationRef.current.x;

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = "rgba(255,255,255,0.015)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 40) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(30,60,30,0.35)";
      ctx.lineWidth = 0.5;
      let started = false;
      for (let lng = 0; lng <= 360; lng += 3) {
        const p3d = latLngTo3D(lat, lng, radius);
        const rotated = rotateX(rotateY(p3d, rotY), rotX);
        const projected = project(rotated, w, h);
        if (!projected) continue;
        if (rotated.z > 0) {
          if (!started) { ctx.moveTo(projected.x, projected.y); started = true; }
          else ctx.lineTo(projected.x, projected.y);
        } else { started = false; }
      }
      ctx.stroke();
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 20) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(30,60,30,0.35)";
      ctx.lineWidth = 0.5;
      let started = false;
      for (let lat = -90; lat <= 90; lat += 3) {
        const p3d = latLngTo3D(lat, lng, radius);
        const rotated = rotateX(rotateY(p3d, rotY), rotX);
        const projected = project(rotated, w, h);
        if (!projected) continue;
        if (rotated.z > 0) {
          if (!started) { ctx.moveTo(projected.x, projected.y); started = true; }
          else ctx.lineTo(projected.x, projected.y);
        } else { started = false; }
      }
      ctx.stroke();
    }

    // Continent dots
    continentDots.forEach((dot) => {
      const p3d = latLngTo3D(dot.lat, dot.lng, radius);
      const rotated = rotateX(rotateY(p3d, rotY), rotX);
      if (rotated.z <= 0) return;
      const projected = project(rotated, w, h);
      if (!projected) return;
      const brightness = Math.max(0.2, rotated.z / radius);
      ctx.fillStyle = `rgba(40,80,40,${0.5 * brightness})`;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, 1.2 * projected.scale * radius * 0.008, 0, Math.PI * 2);
      ctx.fill();
    });

    // Event markers with pulse
    const pulseScale = 1 + Math.sin(timeRef.current * 3) * 0.3;
    globeMarkers.forEach((marker) => {
      const p3d = latLngTo3D(marker.lat, marker.lng, radius * 1.02);
      const rotated = rotateX(rotateY(p3d, rotY), rotX);
      if (rotated.z <= -radius * 0.1) return;
      const projected = project(rotated, w, h);
      if (!projected) return;

      const color = severityColors[marker.severity] || "#2196f3";
      const alpha = rotated.z > 0 ? 1 : 0.3;
      const baseSize = 4 * projected.scale * radius * 0.008;

      ctx.beginPath();
      ctx.arc(projected.x, projected.y, baseSize * pulseScale * 2, 0, Math.PI * 2);
      ctx.strokeStyle = `${color}${Math.round(alpha * 40).toString(16).padStart(2, "0")}`;
      ctx.lineWidth = 1;
      ctx.stroke();

      const gradient = ctx.createRadialGradient(projected.x, projected.y, 0, projected.x, projected.y, baseSize * 3);
      gradient.addColorStop(0, `${color}${Math.round(alpha * 60).toString(16).padStart(2, "0")}`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, baseSize * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, baseSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Connection arcs
    for (let i = 0; i < globeMarkers.length - 1; i++) {
      const m1 = globeMarkers[i];
      const m2 = globeMarkers[i + 1];
      const steps = 30;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(196, 30, 58, 0.15)";
      ctx.lineWidth = 0.8;
      let started = false;
      for (let t = 0; t <= steps; t++) {
        const frac = t / steps;
        const lat = m1.lat + (m2.lat - m1.lat) * frac;
        const lng = m1.lng + (m2.lng - m1.lng) * frac;
        const elevation = 1 + Math.sin(frac * Math.PI) * 0.15;
        const p3d = latLngTo3D(lat, lng, radius * elevation);
        const rotated = rotateX(rotateY(p3d, rotY), rotX);
        if (rotated.z <= 0) { started = false; continue; }
        const projected = project(rotated, w, h);
        if (!projected) continue;
        if (!started) { ctx.moveTo(projected.x, projected.y); started = true; }
        else ctx.lineTo(projected.x, projected.y);
      }
      ctx.stroke();
    }

    // Orbital rings
    ctx.strokeStyle = "rgba(196, 30, 58, 0.12)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 8]);

    ctx.beginPath();
    for (let a = 0; a <= 360; a += 2) {
      const rad = (a * Math.PI) / 180;
      const x = Math.cos(rad) * radius * 1.4;
      const y = Math.sin(rad) * radius * 0.15;
      const z = Math.sin(rad) * radius * 1.4;
      const rotated = rotateX(rotateY({ x, y, z }, rotY + 0.3), rotX);
      const projected = project(rotated, w, h);
      if (!projected) continue;
      if (a === 0) ctx.moveTo(projected.x, projected.y);
      else ctx.lineTo(projected.x, projected.y);
    }
    ctx.stroke();

    ctx.strokeStyle = "rgba(196, 30, 58, 0.07)";
    ctx.beginPath();
    for (let a = 0; a <= 360; a += 2) {
      const rad = (a * Math.PI) / 180;
      const x = Math.cos(rad) * radius * 1.6;
      const y = Math.sin(rad) * radius * 0.3;
      const z = Math.sin(rad) * radius * 1.6;
      const rotated = rotateX(rotateY({ x, y, z }, rotY - 0.5), rotX + 0.2);
      const projected = project(rotated, w, h);
      if (!projected) continue;
      if (a === 0) ctx.moveTo(projected.x, projected.y);
      else ctx.lineTo(projected.x, projected.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (autoRotateRef.current && !isDragging.current) {
      rotationRef.current.y += 0.003;
    }

    timeRef.current += 0.016;
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    autoRotateRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    rotationRef.current.y += dx * 0.005;
    rotationRef.current.x += dy * 0.005;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    setTimeout(() => { if (!isDragging.current) autoRotateRef.current = true; }, 3000);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      <div className="absolute top-3 left-3 z-30 text-[10px] tracking-[0.1em]">
        <div className="text-[#505050] mb-0.5">[SCOPE] GLOBAL THREAT MAP</div>
        <div className="text-[#c41e3a]">{globeMarkers.length} ACTIVE EVENTS TRACKED</div>
        <div className="text-[#353535] mt-1">DRAG TO ROTATE</div>
      </div>

      <div className="absolute bottom-3 left-3 z-30 text-[9px] tracking-[0.08em] space-y-1">
        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
          <div key={sev} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[sev] }} />
            <span className="text-[#505050]">{sev}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 right-3 z-30 text-[9px] text-[#353535] tracking-[0.08em] text-right">
        <div>SRC: MULTI-INT</div>
        <div>REF: 30s CYCLE</div>
        <div>PROJ: ORTHOGRAPHIC</div>
      </div>

      <div className="absolute top-3 right-3 z-30 text-[9px] text-[#404040] tracking-[0.08em] text-right font-mono">
        <div>ROT_Y: {(rotationRef.current.y % (Math.PI * 2)).toFixed(3)}</div>
        <div>ROT_X: {rotationRef.current.x.toFixed(3)}</div>
      </div>
    </div>
  );
}
