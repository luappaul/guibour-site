'use client';

import { useEffect, useRef } from 'react';

interface GlobeIconProps {
  size?: number;
  color?: string;
}

const N_MERIDIANS = 6;
const N_PARALLELS = 5;
// Canvas interne haute résolution → CSS le scale à la taille demandée
const RES = 80;
const CX  = RES / 2;
const CY  = RES / 2;
const R   = 34;

export default function GlobeIcon({ size = 28, color = '#00FFEE' }: GlobeIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, RES, RES);
      const lw   = 1.6;
      const glow = 9 + Math.sin(t * 3) * 5;
      ctx.lineCap = 'round';

      for (let i = 1; i <= N_PARALLELS; i++) {
        const p   = (i / (N_PARALLELS + 1)) * 2 - 1;
        const py  = CY + p * R;
        const rxP = R * Math.sqrt(1 - p * p);
        const ryP = rxP * 0.22;
        ctx.shadowBlur  = glow * 0.55;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.ellipse(CX, py, rxP, ryP, 0, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth   = lw;
        ctx.globalAlpha = 0.9;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

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
        ctx.strokeStyle = color;
        ctx.lineWidth   = lw;
        ctx.globalAlpha = isFront ? 1.0 : 0.18;
        if (!isFront) ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

      ctx.shadowBlur  = glow * 1.3;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = lw * 1.15;
      ctx.stroke();
      ctx.shadowBlur  = 0;
    }

    function frame() { t += 0.009; draw(); animRef.current = requestAnimationFrame(frame); }
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      width={RES}
      height={RES}
      style={{ display: 'block', width: size, height: size, flexShrink: 0 }}
    />
  );
}
