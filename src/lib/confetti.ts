interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  tilt: number;
  tiltSpeed: number;
  opacity: number;
}

const DEFAULT_COLORS = ['#00FFEE', '#FFD700', '#FF4444', '#A8D8FF', '#FFFFFF'];

export function launchConfetti(
  canvas: HTMLCanvasElement,
  options?: { count?: number; colors?: string[] }
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const count = options?.count ?? (80 + Math.floor(Math.random() * 41)); // 80-120
  const colors = options?.colors ?? DEFAULT_COLORS;
  const W = canvas.width;
  const H = canvas.height;

  const particles: ConfettiParticle[] = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: -10 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 4,
      width: 4 + Math.random() * 8,
      height: 6 + Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      tilt: Math.random() * Math.PI * 2,
      tiltSpeed: 0.03 + Math.random() * 0.07,
      opacity: 0.9 + Math.random() * 0.1,
    });
  }

  const startTime = performance.now();
  const DURATION = 3500; // ~3.5 seconds
  let animId: number;

  const animate = (now: number) => {
    const elapsed = now - startTime;

    // Clear only if we're the only animation on this canvas
    ctx.clearRect(0, 0, W, H);

    let alive = 0;

    for (const p of particles) {
      // Gravity
      p.vy += 0.08;
      // Air resistance
      p.vx *= 0.99;
      p.vy *= 0.995;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.tilt += p.tiltSpeed;

      // Skip if out of canvas
      if (p.y > H + 20 || p.x < -20 || p.x > W + 20) continue;

      alive++;

      // Fade out in the last second
      const fadeStart = DURATION - 1000;
      const alpha = elapsed > fadeStart
        ? p.opacity * Math.max(0, 1 - (elapsed - fadeStart) / 1000)
        : p.opacity;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Simulate 3D rotation by scaling width with cos(tilt)
      const scaleX = Math.abs(Math.cos(p.tilt));

      ctx.scale(scaleX || 0.05, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    }

    // Stop when duration exceeded or no particles visible
    if (elapsed < DURATION && alive > 0) {
      animId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, W, H);
      cancelAnimationFrame(animId);
    }
  };

  animId = requestAnimationFrame(animate);
}
