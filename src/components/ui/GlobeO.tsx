'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Globe neon (variante 02) qui remplace le "O" dans GUIBOUR.
// Canvas carre 120x120 -> CSS 1.20em x 1.20em = sphere parfaite.
// Easter egg: 10 clics -> mode boule disco pendant 10 secondes.

const N_MERIDIANS = 6;
const N_PARALLELS = 5;
const W  = 120;
const H  = 120;
const R  = 36;
const CX = W / 2;
const CY = H / 2;

// Disco colors palette
const DISCO_COLORS = [
  '#FF0055', '#FF8800', '#FFEE00', '#00FF88',
  '#0088FF', '#AA00FF', '#FF00AA', '#00FFCC',
];

// ── Disco overlay component (portaled to body) ─────────────────────────
function DiscoOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let t = 0;

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawDiscoLights() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.12 + Math.sin(t * 2) * 0.06;

      // Rotating colored squares simulating disco ball reflections
      const cols = 8;
      const rows = 6;
      const cellW = w / cols;
      const cellH = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c + Math.floor(t * 3)) % DISCO_COLORS.length;
          const alpha = 0.3 + 0.3 * Math.sin(t * 4 + r * 1.3 + c * 0.9);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = DISCO_COLORS[idx];
          const size = cellW * 0.6;
          const x = c * cellW + (cellW - size) / 2 + Math.sin(t + c) * 10;
          const y = r * cellH + (cellH - size) / 2 + Math.cos(t + r) * 10;
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    function frame() {
      t += 0.03;
      drawDiscoLights();
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return createPortal(
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        pointerEvents: 'none',
        animation: 'discoPulse 1.5s ease-in-out infinite',
      }}
    />,
    document.body,
  );
}

// ── "GUIBOUR DISCO" text swap (portaled near the SYSTEM text) ──────────
function DiscoTextSwap() {
  // Find the SYSTEM text element and overlay it
  useEffect(() => {
    // The SYSTEM text is in a div that follows the logo h1
    const systemEls = document.querySelectorAll('div');
    systemEls.forEach(el => {
      if (el.textContent?.trim() === 'S Y S T E M') {
        el.setAttribute('data-original-text', el.textContent);
        el.textContent = 'D I S C O';
        el.style.animation = 'discoRainbow 0.8s linear infinite';
      }
    });
    return () => {
      systemEls.forEach(el => {
        const orig = el.getAttribute('data-original-text');
        if (orig) {
          el.textContent = orig;
          el.style.animation = '';
          el.removeAttribute('data-original-text');
        }
      });
    };
  }, []);
  return null;
}

export default function GlobeO({ size }: { size?: number } = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef  = useRef<number>(0);
  const clickCount = useRef(0);
  const [disco, setDisco] = useState(false);
  const discoRef = useRef(false);
  const discoStartRef = useRef(0);

  const handleClick = useCallback(() => {
    clickCount.current += 1;
    if (clickCount.current >= 10 && !discoRef.current) {
      discoRef.current = true;
      discoStartRef.current = performance.now();
      setDisco(true);
      clickCount.current = 0;

      // Play a disco sound via Web Audio API
      try {
        const ac = new AudioContext();
        const now = ac.currentTime;
        // Funky ascending notes
        const notes = [261, 329, 392, 523, 659, 784, 523, 659];
        notes.forEach((freq, i) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.11);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.12);
        });
      } catch {}

      setTimeout(() => {
        discoRef.current = false;
        setDisco(false);
      }, 10000);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      const isDisco = discoRef.current;
      const speed = isDisco ? 0.06 : 0.009;
      t += speed;

      if (isDisco) {
        // ── DISCO BALL MODE ──────────────────────────
        const elapsed = (performance.now() - discoStartRef.current) / 1000;

        // Outer circle with rainbow glow
        const hue = (elapsed * 120) % 360;
        const discoColor = `hsl(${hue}, 100%, 60%)`;

        ctx.shadowBlur = 20;
        ctx.shadowColor = discoColor;
        ctx.beginPath();
        ctx.arc(CX, CY, R, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, 30%, 15%)`;
        ctx.fill();
        ctx.strokeStyle = discoColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw mirror tiles on the sphere
        const tileRows = 6;
        const tileCols = 8;
        for (let row = 0; row < tileRows; row++) {
          const lat = ((row + 0.5) / tileRows) * Math.PI - Math.PI / 2;
          const y = CY + Math.sin(lat) * R * 0.85;
          const rowR = Math.cos(lat) * R * 0.85;

          for (let col = 0; col < tileCols; col++) {
            const lon = ((col + 0.5) / tileCols) * Math.PI * 2 + t * 2;
            const x = CX + Math.cos(lon) * rowR;
            const z = Math.sin(lon);

            if (z < -0.1) continue; // back face

            const tileHue = ((row * tileCols + col) * 47 + elapsed * 200) % 360;
            const brightness = 50 + z * 40;
            const size = 3 + z * 2;

            ctx.globalAlpha = 0.5 + z * 0.5;
            ctx.fillStyle = `hsl(${tileHue}, 90%, ${brightness}%)`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = `hsl(${tileHue}, 100%, 70%)`;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            ctx.shadowBlur = 0;
          }
        }
        ctx.globalAlpha = 1;

        // Specular highlight
        ctx.beginPath();
        const hlX = CX - R * 0.25;
        const hlY = CY - R * 0.3;
        const grad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, R * 0.35);
        grad.addColorStop(0, 'rgba(255,255,255,0.6)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.arc(hlX, hlY, R * 0.35, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // ── NORMAL GLOBE MODE ────────────────────────
        const color = '#00FFEE';
        const lw    = 1.7;
        const glow  = 9 + Math.sin(t * 3) * 5;

        ctx.lineCap = 'round';

        // Paralleles
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

        // Meridiens (rotation Y simulee)
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

        // Cercle exterieur
        ctx.shadowBlur  = glow * 1.3;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(CX, CY, R, 0, Math.PI * 2);
        ctx.strokeStyle  = color;
        ctx.lineWidth    = lw * 1.15;
        ctx.stroke();
        ctx.shadowBlur   = 0;
      }
    }

    function frame() {
      draw();
      animRef.current = requestAnimationFrame(frame);
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onClick={handleClick}
        style={size ? {
          display: 'block',
          width: `${size}px`,
          height: `${size}px`,
          cursor: 'pointer',
          animation: disco ? 'discoSpin 2s linear infinite' : undefined,
        } : {
          display      : 'inline-block',
          width        : '1.20em',
          height       : '1.20em',
          margin       : '0 -0.20em',
          verticalAlign: '0.02em',
          cursor       : 'pointer',
          animation    : disco ? 'discoSpin 2s linear infinite' : undefined,
        }}
      />
      {disco && <DiscoOverlay />}
      {disco && <DiscoTextSwap />}
    </>
  );
}
