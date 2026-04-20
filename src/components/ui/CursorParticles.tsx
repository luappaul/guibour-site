'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const activeRef = useRef(true);

  useEffect(() => {
    // Desktop only — skip on touch devices or narrow screens
    if (
      typeof window === 'undefined' ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth < 768
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const handleVisibility = () => {
      activeRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const particles = particlesRef.current;
      // Spawn 2-3 particles per move, cap at 60
      const count = 2 + Math.floor(Math.random() * 2); // 2 or 3
      for (let i = 0; i < count; i++) {
        if (particles.length >= 60) break;
        const maxLife = 500 + Math.random() * 300; // 500-800ms
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 6,
          y: e.clientY + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2 - 0.5,
          size: 2 + Math.random() * 3,
          opacity: 0.8 + Math.random() * 0.2,
          life: 0,
          maxLife,
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let lastTime = performance.now();

    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate);

      if (!activeRef.current) return;

      const dt = Math.min(now - lastTime, 32); // cap delta
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Physics
        p.vy += 0.02 * (dt / 16); // gentle gravity
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);

        // Fade based on life progress
        const progress = p.life / p.maxLife;
        const alpha = p.opacity * (1 - progress);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.3), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 238, ${alpha})`;
        ctx.shadowColor = 'rgba(0, 255, 238, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
}
