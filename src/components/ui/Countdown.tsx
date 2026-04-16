'use client';

import { useEffect, useState } from 'react';

const CONCERT_DATE = new Date('2026-06-24T20:00:00+02:00').getTime();
const BILLETTERIE_URL = 'https://shotgun.live/fr/events/guibour-la-boule-noire';

interface TimeLeft {
  days: number; hours: number; minutes: number; seconds: number; expired: boolean;
}

function computeTimeLeft(): TimeLeft {
  const diff = CONCERT_DATE - Date.now();
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

function Digit({ value, urgent }: { value: string; urgent: boolean }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{
        fontFamily: "'DSEG7', monospace",
        fontSize: 'clamp(18px, 2.6vw, 32px)',
        color: 'rgba(255,34,34,0.10)',
        letterSpacing: '1px',
        position: 'absolute', top: 0, left: 0,
        userSelect: 'none',
      }}>88</span>
      <span style={{
        fontFamily: "'DSEG7', monospace",
        fontSize: 'clamp(18px, 2.6vw, 32px)',
        color: urgent ? '#FF0000' : '#FF2222',
        letterSpacing: '1px',
        textShadow: urgent
          ? '0 0 14px rgba(255,0,0,.9), 0 0 30px rgba(255,0,0,.6)'
          : '0 0 10px rgba(255,34,34,.8), 0 0 24px rgba(255,34,34,.4)',
        position: 'relative', zIndex: 1,
        animation: urgent ? 'urgentPulse 0.8s ease-in-out infinite' : undefined,
      }}>{value}</span>
    </span>
  );
}

function Sep({ urgent }: { urgent: boolean }) {
  return (
    <span style={{
      fontFamily: "'DSEG7', monospace",
      fontSize: 'clamp(18px, 2.6vw, 32px)',
      color: urgent ? '#FF0000' : '#FF2222',
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

  const urgent = t.days < 7;

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
      pointerEvents: 'auto',
    }}>
      <style>{`@keyframes urgentPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }`}</style>

      {/* Label */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 700,
        fontSize: 'clamp(8px, 1vw, 11px)',
        color: urgent ? '#FF0000' : '#FF3333',
        letterSpacing: '6px',
        textShadow: '0 0 10px rgba(255,34,34,.65), 0 0 22px rgba(255,34,34,.25)',
        animation: urgent ? 'urgentPulse 1s ease-in-out infinite' : undefined,
      }}>
        {urgent ? 'CONCERT DANS :' : 'FIN DU JEU — CONCERT LA BOULE NOIRE :'}
      </div>

      {/* Chiffres */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
        <Digit value={pad(t.days)} urgent={urgent} />
        <Sep urgent={urgent} />
        <Digit value={pad(t.hours)} urgent={urgent} />
        <Sep urgent={urgent} />
        <Digit value={pad(t.minutes)} urgent={urgent} />
        <Sep urgent={urgent} />
        <Digit value={pad(t.seconds)} urgent={urgent} />
      </div>

      {/* CTA Billetterie */}
      <a
        href={BILLETTERIE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: 'clamp(10px, 1.3vw, 14px)',
          letterSpacing: '3px',
          color: '#fff',
          background: urgent ? 'linear-gradient(135deg, #CC0000, #880000)' : 'linear-gradient(135deg, #8B0000, #5A0000)',
          border: '1px solid rgba(255,68,68,.5)',
          padding: '6px 20px',
          borderRadius: '3px',
          textDecoration: 'none',
          textShadow: '1px 1px 0 rgba(0,0,0,.5)',
          transition: 'all 0.2s',
          animation: urgent ? 'urgentPulse 1.5s ease-in-out infinite' : undefined,
        }}
      >
        RÉSERVER MA PLACE
      </a>
    </div>
  );
}
