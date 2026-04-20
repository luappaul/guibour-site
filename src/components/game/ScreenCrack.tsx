'use client';

import React, { useEffect, useRef, useState } from 'react';

/** Generate crack paths radiating from an impact point */
function generateCracks(cx: number, cy: number, w: number, h: number) {
  const mainLines: string[] = [];
  const branches: string[] = [];
  const numMain = 6 + Math.floor(Math.random() * 3); // 6-8 main lines

  for (let i = 0; i < numMain; i++) {
    const angle = (Math.PI * 2 * i) / numMain + (Math.random() - 0.5) * 0.4;
    const len = Math.max(w, h) * (0.5 + Math.random() * 0.6);
    const segments = 4 + Math.floor(Math.random() * 3);
    let px = cx, py = cy;
    let d = `M ${cx} ${cy}`;

    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const wobble = (Math.random() - 0.5) * 60;
      const nx = cx + Math.cos(angle + wobble * 0.005) * len * t + wobble;
      const ny = cy + Math.sin(angle + wobble * 0.005) * len * t + (Math.random() - 0.5) * 40;
      d += ` L ${nx} ${ny}`;

      // Branch from this point
      if (s >= 2 && Math.random() > 0.4) {
        const brAngle = angle + (Math.random() - 0.5) * 1.2;
        const brLen = 30 + Math.random() * 80;
        const bx = nx + Math.cos(brAngle) * brLen;
        const by = ny + Math.sin(brAngle) * brLen;
        branches.push(`M ${nx} ${ny} L ${bx} ${by}`);
      }

      px = nx;
      py = ny;
    }

    mainLines.push(d);
  }

  return { mainLines, branches };
}

/** Generate falling shards (triangles) */
function generateShards(cx: number, cy: number) {
  const shards: { points: string; delay: number; rotation: number; tx: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const x = cx + (Math.random() - 0.5) * 200;
    const y = cy + Math.random() * 100;
    const size = 20 + Math.random() * 40;
    const p1 = `${x},${y}`;
    const p2 = `${x + size},${y + size * 0.5}`;
    const p3 = `${x - size * 0.3},${y + size}`;
    shards.push({
      points: `${p1} ${p2} ${p3}`,
      delay: 0.4 + i * 0.08,
      rotation: (Math.random() - 0.5) * 180,
      tx: (Math.random() - 0.5) * 100,
    });
  }
  return shards;
}

/** Play glass breaking sound via Web Audio API */
function playGlassBreak() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const duration = 0.25;
    const sampleRate = ctx.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, numSamples, sampleRate);
    const data = buffer.getChannelData(0);

    // White noise burst with decaying envelope
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 18); // fast decay
      data[i] = (Math.random() * 2 - 1) * envelope * 0.6;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Highpass filter for glass-like character
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2000;
    hp.Q.value = 0.7;

    // Bandpass for some resonance
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 4500;
    bp.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.value = 0.4;

    source.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    source.onended = () => ctx.close();
  } catch {
    // Web Audio not available
  }
}

export default function ScreenCrack() {
  const [visible, setVisible] = useState(false);
  const [showText, setShowText] = useState(false);
  const cracksRef = useRef<{ mainLines: string[]; branches: string[] } | null>(null);
  const shardsRef = useRef<ReturnType<typeof generateShards> | null>(null);
  const soundPlayed = useRef(false);

  // Generate cracks on mount
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h * 0.15; // impact point: center-top

    cracksRef.current = generateCracks(cx, cy, w, h);
    shardsRef.current = generateShards(cx, cy);
    setVisible(true);

    // Play sound
    if (!soundPlayed.current) {
      soundPlayed.current = true;
      playGlassBreak();
    }

    // Show "LICENCIE" text after cracks draw
    const timer = setTimeout(() => setShowText(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !cracksRef.current || !shardsRef.current) return null;

  const { mainLines, branches } = cracksRef.current;
  const shards = shardsRef.current;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* SVG crack overlay */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main crack lines */}
        {mainLines.map((d, i) => (
          <path
            key={`main-${i}`}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={2.5 - i * 0.15}
            strokeLinecap="round"
            filter="url(#crackGlow)"
            style={{
              strokeDasharray: 2000,
              strokeDashoffset: 2000,
              animation: `crackDraw 0.5s ease-out ${i * 0.03}s forwards`,
            }}
          />
        ))}
        {/* Branch lines */}
        {branches.map((d, i) => (
          <path
            key={`branch-${i}`}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1}
            strokeLinecap="round"
            style={{
              strokeDasharray: 500,
              strokeDashoffset: 500,
              animation: `crackDraw 0.3s ease-out ${0.15 + i * 0.04}s forwards`,
            }}
          />
        ))}
        {/* Falling shards */}
        {shards.map((shard, i) => (
          <polygon
            key={`shard-${i}`}
            points={shard.points}
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={1}
            style={{
              transformOrigin: 'center',
              animation: `shardFall 1.2s ease-in ${shard.delay}s forwards`,
              opacity: 0,
            }}
          />
        ))}
        {/* Glow filter */}
        <defs>
          <filter id="crackGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Text removed — GameOverScreen handles defeat text in its own steps */}
    </div>
  );
}
