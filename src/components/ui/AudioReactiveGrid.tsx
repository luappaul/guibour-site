'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AudioReactiveGridProps {
  active: boolean;
  bpm?: number;
}

export default function AudioReactiveGrid({ active, bpm = 128 }: AudioReactiveGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const flashSpotsRef = useRef<{ x: number; y: number; life: number; maxLife: number }[]>([]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const CELL_W = 56;
    const CELL_H = 34;
    const beatInterval = 60 / bpm; // seconds per beat
    const beatPhase = (t % beatInterval) / beatInterval;
    const CYAN = [0, 255, 238] as const;

    ctx.clearRect(0, 0, w, h);

    // Simulated frequency bands
    const bass = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / beatInterval); // pulses on beat
    const mid = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / beatInterval * 2 + 0.5);
    const treble = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / beatInterval * 4 + 1.2);

    // Kick flash (sharp spike near beat)
    const kickIntensity = Math.pow(Math.max(0, 1 - beatPhase * 6), 3);

    // ── Horizontal lines (react to bass) ──
    const hLineOpacity = 0.04 + bass * 0.12 + kickIntensity * 0.15;
    ctx.strokeStyle = `rgba(${CYAN[0]},${CYAN[1]},${CYAN[2]},${hLineOpacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 0; y <= h; y += CELL_H) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
    }
    ctx.stroke();

    // ── Vertical lines (react to treble) ──
    const vLineOpacity = 0.04 + treble * 0.08 + kickIntensity * 0.06;
    ctx.strokeStyle = `rgba(${CYAN[0]},${CYAN[1]},${CYAN[2]},${vLineOpacity})`;
    ctx.beginPath();
    for (let x = 0; x <= w; x += CELL_W) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
    }
    ctx.stroke();

    // ── Flash spots on intersections ──
    const spots = flashSpotsRef.current;

    // Spawn new spots on "kicks" (when beatPhase is very small)
    if (beatPhase < 0.04 && Math.random() < 0.6) {
      const cols = Math.ceil(w / CELL_W);
      const rows = Math.ceil(h / CELL_H);
      const numSpots = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numSpots; i++) {
        spots.push({
          x: Math.floor(Math.random() * cols) * CELL_W,
          y: Math.floor(Math.random() * rows) * CELL_H,
          life: 1,
          maxLife: 0.3 + Math.random() * 0.5,
        });
      }
    }

    // Also spawn occasional mid-frequency spots
    if (mid > 0.8 && Math.random() < 0.08) {
      const cols = Math.ceil(w / CELL_W);
      const rows = Math.ceil(h / CELL_H);
      spots.push({
        x: Math.floor(Math.random() * cols) * CELL_W,
        y: Math.floor(Math.random() * rows) * CELL_H,
        life: 1,
        maxLife: 0.4 + Math.random() * 0.3,
      });
    }

    // Draw and decay spots
    const dt = 1 / 60; // approx frame time
    for (let i = spots.length - 1; i >= 0; i--) {
      const spot = spots[i];
      spot.life -= dt / spot.maxLife;
      if (spot.life <= 0) {
        spots.splice(i, 1);
        continue;
      }
      const alpha = spot.life * (0.25 + kickIntensity * 0.15);
      const size = 4 + (1 - spot.life) * 2;

      // Glow
      const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, size * 3);
      gradient.addColorStop(0, `rgba(${CYAN[0]},${CYAN[1]},${CYAN[2]},${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${CYAN[0]},${CYAN[1]},${CYAN[2]},0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(spot.x - size * 3, spot.y - size * 3, size * 6, size * 6);

      // Core
      ctx.fillStyle = `rgba(${CYAN[0]},${CYAN[1]},${CYAN[2]},${alpha})`;
      ctx.fillRect(spot.x - size / 2, spot.y - size / 2, size, size);
    }

    // ── Subtle overall glow pulse on kick ──
    if (kickIntensity > 0.1) {
      ctx.fillStyle = `rgba(${CYAN[0]},${CYAN[1]},${CYAN[2]},${kickIntensity * 0.02})`;
      ctx.fillRect(0, 0, w, h);
    }
  }, [bpm]);

  useEffect(() => {
    if (!active) {
      // Clear canvas when inactive
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      flashSpotsRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const startTime = performance.now() / 1000;
    let running = true;

    const loop = () => {
      if (!running) return;
      // Skip if tab is hidden
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      const t = performance.now() / 1000 - startTime;
      // Reset transform before drawing (resize sets scale)
      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      draw(ctx, window.innerWidth, window.innerHeight, t);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active, draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: active ? 0.22 : 0,
        transition: 'opacity 0.8s ease',
      }}
    />
  );
}
