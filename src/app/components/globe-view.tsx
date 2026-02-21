import { useRef, useEffect, useCallback } from 'react';
import { EPICENTER, SHOCK_ARCS } from '../../config';

// ── 3D math ──────────────────────────────────────────────────────────────────
interface P3 { x: number; y: number; z: number }

function latLng(lat: number, lng: number, r: number): P3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return {
    x: -(r * Math.sin(phi) * Math.cos(theta)),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
}
function ry(p: P3, a: number): P3 {
  return { x: p.x * Math.cos(a) + p.z * Math.sin(a), y: p.y, z: -p.x * Math.sin(a) + p.z * Math.cos(a) };
}
function rx(p: P3, a: number): P3 {
  return { x: p.x, y: p.y * Math.cos(a) - p.z * Math.sin(a), z: p.y * Math.sin(a) + p.z * Math.cos(a) };
}
function proj(p: P3, w: number, h: number, fov = 680): { x: number; y: number; s: number } | null {
  const z = p.z + fov;
  if (z <= 0) return null;
  const s = fov / z;
  return { x: p.x * s + w / 2, y: -p.y * s + h / 2, s };
}
function rotate(p: P3, rotY: number, rotX: number): P3 {
  return rx(ry(p, rotY), rotX);
}

// ── Binary texture (stable, hash-based) ─────────────────────────────────────
function drawBinary(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.font = '7px "IBM Plex Mono", "Courier New", monospace';
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.68;
  for (let by = 10; by < h; by += 13) {
    for (let bx = 4; bx < w; bx += 9) {
      const hash = (bx * 1733 + by * 9371) & 0xffff;
      if ((hash & 0xff) > 88) continue; // ~35% density
      const dx = bx - cx;
      const dy = by - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const alpha = Math.max(0, 0.075 - (dist / maxR) * 0.065);
      if (alpha < 0.005) continue;
      ctx.fillStyle = `rgba(42, 36, 30, ${alpha.toFixed(3)})`;
      ctx.fillText(((hash >> 8) & 1).toString(), bx, by);
    }
  }
}

// ── Orbital rings (2D fixed ellipses — Palantir image style) ─────────────────
function drawOrbitalRings(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // Ring 1 — broad tilted orbit (~28°)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.49);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.38, r * 0.21, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(165, 20, 20, 0.55)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();

  // Ring 2 — steep polar orbit (~-62°)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-1.08);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.26, r * 0.17, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(140, 15, 15, 0.38)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
  ctx.restore();
}

// ── Corner crosshairs ─────────────────────────────────────────────────────────
function drawCorners(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const s = 14;
  const p = 12;
  const corners = [
    [p, p], [w - p, p], [p, h - p], [w - p, h - p],
  ] as const;
  ctx.strokeStyle = 'rgba(60, 50, 42, 0.7)';
  ctx.lineWidth = 0.8;
  corners.forEach(([cx, cy]) => {
    ctx.beginPath();
    ctx.moveTo(cx - s, cy); ctx.lineTo(cx + s, cy);
    ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s);
    ctx.stroke();
  });
}

// ── Globe arc helpers ─────────────────────────────────────────────────────────
function arcPoints(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  steps: number,
  elevation: number
) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const lat = from.lat + (to.lat - from.lat) * t;
    const lng = from.lng + (to.lng - from.lng) * t;
    const elev = 1 + Math.sin(t * Math.PI) * elevation;
    return { lat, lng, elev, t };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export function GlobeView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const rotYRef = useRef(-0.9);
  const rotXRef = useRef(-0.1);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const autoRot = useRef(true);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const CX = W / 2;
    const CY = H / 2;
    const R = Math.min(W, H) * 0.36;
    const RY = rotYRef.current;
    const RX = rotXRef.current;
    const T = timeRef.current;

    // ── Background ────────────────────────────────────────────────────────────
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, W, H);

    // Center ambient glow
    const ambGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, R * 1.6);
    ambGrad.addColorStop(0, 'rgba(18, 14, 10, 0.6)');
    ambGrad.addColorStop(1, 'rgba(10, 10, 10, 0)');
    ctx.fillStyle = ambGrad;
    ctx.fillRect(0, 0, W, H);

    // Binary texture
    drawBinary(ctx, W, H);

    // ── Globe grid lines ──────────────────────────────────────────────────────
    const gridColor = 'rgba(45, 38, 32, 0.65)';
    function drawGridLine(c: CanvasRenderingContext2D, pts: Array<[number, number]>) {
      c.beginPath();
      c.strokeStyle = gridColor;
      c.lineWidth = 0.5;
      let started = false;
      for (const [lat, lng] of pts) {
        const p = rotate(latLng(lat, lng, R), RY, RX);
        if (p.z <= 0) { started = false; continue; }
        const pr = proj(p, W, H);
        if (!pr) continue;
        if (!started) { c.moveTo(pr.x, pr.y); started = true; }
        else c.lineTo(pr.x, pr.y);
      }
      c.stroke();
    }

    for (let lat = -80; lat <= 80; lat += 15) {
      drawGridLine(ctx, Array.from({ length: 121 }, (_, i) => [lat, i * 3] as [number, number]));
    }
    for (let lng = 0; lng < 360; lng += 15) {
      drawGridLine(ctx, Array.from({ length: 61 }, (_, i) => [-90 + i * 3, lng] as [number, number]));
    }

    // ── Globe specular & rim ──────────────────────────────────────────────────
    const specGrad = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.25, 0, CX, CY, R);
    specGrad.addColorStop(0, 'rgba(50, 40, 30, 0.06)');
    specGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fill();

    const rimGrad = ctx.createRadialGradient(CX, CY, R * 0.88, CX, CY, R * 1.06);
    rimGrad.addColorStop(0, 'rgba(25, 18, 12, 0)');
    rimGrad.addColorStop(1, 'rgba(25, 18, 12, 0.18)');
    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.arc(CX, CY, R * 1.06, 0, Math.PI * 2);
    ctx.fill();

    // ── Orbital rings ─────────────────────────────────────────────────────────
    drawOrbitalRings(ctx, CX, CY, R);

    // ── Arc ghost paths ───────────────────────────────────────────────────────
    SHOCK_ARCS.forEach(arc => {
      const pts = arcPoints(arc.from, arc.to, 80, 0.38);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(140, 18, 18, 0.14)';
      ctx.lineWidth = 0.7;
      let started = false;
      pts.forEach(({ lat, lng, elev }) => {
        const p = rotate(latLng(lat, lng, R * elev), RY, RX);
        if (p.z <= 0) { started = false; return; }
        const pr = proj(p, W, H);
        if (!pr) { started = false; return; }
        if (!started) { ctx.moveTo(pr.x, pr.y); started = true; }
        else ctx.lineTo(pr.x, pr.y);
      });
      ctx.stroke();
    });

    // ── Animated arc particles ────────────────────────────────────────────────
    SHOCK_ARCS.forEach((arc, idx) => {
      const speed = 0.15 + idx * 0.017;
      const numP = 3;
      for (let pi = 0; pi < numP; pi++) {
        const headT = (T * speed + pi / numP) % 1.0;
        const trailLen = 0.09;
        const trailSteps = 14;
        let prevPr: { x: number; y: number } | null = null;

        for (let s = 0; s <= trailSteps; s++) {
          const tFrac = Math.max(0, headT - trailLen * (1 - s / trailSteps));
          const lat = arc.from.lat + (arc.to.lat - arc.from.lat) * tFrac;
          const lng = arc.from.lng + (arc.to.lng - arc.from.lng) * tFrac;
          const elev = 1 + Math.sin(tFrac * Math.PI) * 0.38;
          const p = rotate(latLng(lat, lng, R * elev), RY, RX);
          if (p.z <= 0) { prevPr = null; continue; }
          const pr = proj(p, W, H);
          if (!pr) { prevPr = null; continue; }

          if (prevPr && s > 0) {
            const alpha = (s / trailSteps) * 0.7;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(190, 25, 25, ${alpha.toFixed(2)})`;
            ctx.lineWidth = 1.2;
            ctx.moveTo(prevPr.x, prevPr.y);
            ctx.lineTo(pr.x, pr.y);
            ctx.stroke();
          }
          prevPr = { x: pr.x, y: pr.y };
        }

        // Head glow
        const hLat = arc.from.lat + (arc.to.lat - arc.from.lat) * headT;
        const hLng = arc.from.lng + (arc.to.lng - arc.from.lng) * headT;
        const hElev = 1 + Math.sin(headT * Math.PI) * 0.38;
        const hp = rotate(latLng(hLat, hLng, R * hElev), RY, RX);
        if (hp.z > 0) {
          const hpr = proj(hp, W, H);
          if (hpr) {
            const g = ctx.createRadialGradient(hpr.x, hpr.y, 0, hpr.x, hpr.y, 8);
            g.addColorStop(0, 'rgba(220, 35, 35, 0.8)');
            g.addColorStop(1, 'rgba(190, 25, 25, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(hpr.x, hpr.y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e8e0d8';
            ctx.beginPath();
            ctx.arc(hpr.x, hpr.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    });

    // ── Destination markers ───────────────────────────────────────────────────
    SHOCK_ARCS.forEach(arc => {
      const p = rotate(latLng(arc.to.lat, arc.to.lng, R * 1.01), RY, RX);
      if (p.z < -R * 0.08) return;
      const pr = proj(p, W, H);
      if (!pr) return;
      const alpha = Math.max(0.18, Math.min(1, p.z / R + 0.5));
      const a2 = alpha.toFixed(2);

      // Small crosshair
      const cs = 5;
      ctx.strokeStyle = `rgba(140, 130, 120, ${a2})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(pr.x - cs, pr.y); ctx.lineTo(pr.x + cs, pr.y);
      ctx.moveTo(pr.x, pr.y - cs); ctx.lineTo(pr.x, pr.y + cs);
      ctx.stroke();

      // Label
      if (p.z > 0) {
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = `rgba(120, 112, 104, ${a2})`;
        ctx.fillText(arc.city, pr.x + 6, pr.y - 3);
      }
    });

    // ── Venezuela epicenter ───────────────────────────────────────────────────
    const ep = rotate(latLng(EPICENTER.lat, EPICENTER.lng, R * 1.01), RY, RX);
    const epr = proj(ep, W, H);
    if (epr && ep.z > -R * 0.1) {
      const ea = ep.z > 0 ? 1 : 0.3;
      const ex = epr.x;
      const ey = epr.y;

      // Ambient area glow
      const ag = ctx.createRadialGradient(ex, ey, 0, ex, ey, R * 0.42);
      ag.addColorStop(0, `rgba(180, 20, 20, ${ea * 0.09})`);
      ag.addColorStop(1, 'rgba(180, 20, 20, 0)');
      ctx.fillStyle = ag;
      ctx.beginPath();
      ctx.arc(ex, ey, R * 0.42, 0, Math.PI * 2);
      ctx.fill();

      // Expanding pulse rings
      for (let ring = 0; ring < 3; ring++) {
        const phase = (T * 0.36 + ring / 3) % 1.0;
        const ringR = 6 + phase * 48;
        const ringA = (1 - phase) * ea * 0.85;
        const lw = 1.8 * (1 - phase) + 0.3;
        ctx.beginPath();
        ctx.arc(ex, ey, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(190, 20, 20, ${ringA.toFixed(2)})`;
        ctx.lineWidth = lw;
        ctx.stroke();
      }

      // Core glow
      const cg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 12);
      cg.addColorStop(0, `rgba(230, 30, 30, ${ea})`);
      cg.addColorStop(1, 'rgba(190, 20, 20, 0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(ex, ey, 12, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = `rgba(240, 235, 228, ${ea})`;
      ctx.beginPath();
      ctx.arc(ex, ey, 2.8, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair
      const cs = 11;
      ctx.strokeStyle = `rgba(200, 25, 25, ${ea * 0.7})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(ex - cs, ey); ctx.lineTo(ex - 5, ey);
      ctx.moveTo(ex + 5, ey); ctx.lineTo(ex + cs, ey);
      ctx.moveTo(ex, ey - cs); ctx.lineTo(ex, ey - 5);
      ctx.moveTo(ex, ey + 5); ctx.lineTo(ex, ey + cs);
      ctx.stroke();

      // Label
      if (ep.z > 0) {
        ctx.font = '8px "IBM Plex Mono", monospace';
        ctx.fillStyle = `rgba(180, 20, 20, ${ea * 0.9})`;
        ctx.fillText(EPICENTER.label, ex + 8, ey - 6);
        ctx.font = '7px "IBM Plex Mono", monospace';
        ctx.fillStyle = `rgba(130, 60, 60, ${ea * 0.65})`;
        ctx.fillText('EPICENTER', ex + 8, ey + 4);
      }
    }

    // ── Corner crosshairs ─────────────────────────────────────────────────────
    drawCorners(ctx, W, H);

    // ── HUD text ──────────────────────────────────────────────────────────────
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillStyle = 'rgba(60, 50, 40, 0.8)';
    ctx.fillText('PROJ: ORTHOGRAPHIC', 20, H - 16);
    ctx.fillText('DRAG TO ROTATE', 20, H - 6);

    ctx.fillStyle = 'rgba(155, 18, 18, 0.75)';
    ctx.fillText('6 PROPAGATION VECTORS ACTIVE', 20, 18);

    ctx.fillStyle = 'rgba(50, 42, 35, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText('SRC: MULTI-INT', W - 20, H - 16);
    ctx.fillText('ALGO: SHOCK-v2.1', W - 20, H - 6);
    ctx.textAlign = 'left';

    // ── Auto-rotate ───────────────────────────────────────────────────────────
    if (autoRot.current && !dragging.current) {
      rotYRef.current += 0.0009;
    }
    timeRef.current += 0.016;
    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const onDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    autoRot.current = false;
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    rotYRef.current += (e.clientX - lastMouse.current.x) * 0.004;
    rotXRef.current += (e.clientY - lastMouse.current.y) * 0.004;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onUp = useCallback(() => {
    dragging.current = false;
    setTimeout(() => { if (!dragging.current) autoRot.current = true; }, 4000);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
      />
    </div>
  );
}
