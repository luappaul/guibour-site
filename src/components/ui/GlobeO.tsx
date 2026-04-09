'use client';

import { useEffect, useRef } from 'react';

// Globe neon (variante 02) qui remplace le "O" dans GUIBOUR.
// Canvas carré 80×80 → CSS 0.73em × 0.73em = sphère parfaite,
// aussi haute que large, alignée sur la hauteur de capitales.

const N_MERIDIANS = 6;
const N_PARALLELS = 5;
const W  = 80;
const H  = 80;   // carré = sphère parfaite
const R  = 36;   // rayon remplit bien le carré
const CX = W / 2;
const CY = H / 2;

export default function GlobeO() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef  = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const color = '#00FFEE';
      const lw    = 1.7;
      const glow  = 9 + Math.sin(t * 3) * 5;   // pulse entre 4 et 14

      ctx.lineCap = 'round';

      // ── Parallèles ──────────────────────────────
      for (let i = 1; i <= N_PARALLELS; i++) {
        const p   = (i / (N_PARALLELS + 1)) * 2 - 1;
        const py  = CY + p * R;
        const rxP = R * Math.sqrt(1 - p * p);
        const ryP = rxP * 0.22;

        ctx.shadowBlur  = glow * 0.55;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.ellipse(CX, py, rxP, ryP, 0, 0, Math.PI * 2);
        ctx.strokeStyle  = color;
        ctx.lineWidth    = lw;
        ctx.globalAlpha  = 0.92;
        ctx.stroke();
        ctx.globalAlpha  = 1;
        ctx.shadowBlur   = 0;
      }

      // ── Méridiens (rotation Y simulée) ──────────
      for (let i = 0; i < N_MERIDIANS; i++) {
        const angle   = (i / N_MERIDIANS) * Math.PI + t;
        const sinA    = Math.sin(angle);
        const cosA    = Math.cos(angle);
        const rxM     = R * Math.abs(sinA);
        const isFront = cosA >= 0;

        if (rxM < 0.8) continue;

        ctx.shadowBlur  = glow;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.ellipse(CX, CY, rxM, R, 0, 0, Math.PI * 2);
        ctx.strokeStyle  = color;
        ctx.lineWidth    = lw;
        ctx.globalAlpha  = isFront ? 1.0 : 0.18;
        if (!isFront) ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha  = 1;
        ctx.shadowBlur   = 0;
      }

      // ── Cercle extérieur ─────────────────────────
      ctx.shadowBlur  = glow * 1.3;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle  = color;
      ctx.lineWidth    = lw * 1.15;
      ctx.stroke();
      ctx.shadowBlur   = 0;
    }

    function frame() {
      t += 0.009;
      draw();
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{
        display      : 'inline-block',
        // 0.80em = légèrement plus grand que la cap-height, imposant mais équilibré
        width        : '0.80em',
        height       : '0.80em',   // même valeur → cercle parfait
        verticalAlign: '-0.08em',  // compense la hauteur supplémentaire
      }}
    />
  );
}
