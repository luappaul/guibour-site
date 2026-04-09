'use client';

import { useEffect, useState } from 'react';

const TARGET = new Date('2026-06-01T18:00:00+02:00').getTime();

interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number; expired: boolean;
}

function computeTimeLeft(): TimeLeft {
  const diff = TARGET - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function Digit({ value }: { value: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {/* Segments éteints */}
      <span style={{
        fontFamily: "'DSEG7', monospace",
        fontSize: 'clamp(18px, 2.6vw, 32px)',
        color: 'rgba(255,34,34,0.10)',
        letterSpacing: '1px',
        position: 'absolute', top: 0, left: 0,
        userSelect: 'none',
      }}>88</span>
      {/* Segments allumés */}
      <span style={{
        fontFamily: "'DSEG7', monospace",
        fontSize: 'clamp(18px, 2.6vw, 32px)',
        color: '#FF2222',
        letterSpacing: '1px',
        textShadow: '0 0 10px rgba(255,34,34,.8), 0 0 24px rgba(255,34,34,.4)',
        position: 'relative', zIndex: 1,
      }}>{value}</span>
    </span>
  );
}

function Sep() {
  return (
    <span style={{
      fontFamily: "'DSEG7', monospace",
      fontSize: 'clamp(18px, 2.6vw, 32px)',
      color: '#FF2222',
      textShadow: '0 0 10px rgba(255,34,34,.7)',
      opacity: 0.65,
      userSelect: 'none',
      margin: '0 2px',
    }}>:</span>
  );
}

export default function Countdown() {
  const [t, setT] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setT(computeTimeLeft());
    const id = setInterval(() => setT(computeTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!t || t.expired) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      left: '48px',
      right: 0,
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      pointerEvents: 'none',
    }}>
      {/* Label — typo Orbitron comme SYSTEM, rouge neon */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(8px, 1vw, 11px)',
        color: '#FF3333',
        letterSpacing: '6px',
        textShadow: '0 0 10px rgba(255,34,34,.65), 0 0 22px rgba(255,34,34,.25)',
      }}>
        FIN DU JEU DANS :
      </div>

      {/* Chiffres */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
        <Digit value={pad(t.days)}    />
        <Sep />
        <Digit value={pad(t.hours)}   />
        <Sep />
        <Digit value={pad(t.minutes)} />
        <Sep />
        <Digit value={pad(t.seconds)} />
      </div>
    </div>
  );
}
