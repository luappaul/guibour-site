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

export default function Countdown() {
  const [t, setT] = useState<TimeLeft | null>(null);
  const [closed, setClosed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check sessionStorage for dismissal
    if (typeof window !== 'undefined' && sessionStorage.getItem('concert-banner-closed')) {
      setClosed(true);
    }
    setT(computeTimeLeft());
    const id = setInterval(() => setT(computeTimeLeft()), 1000);
    // Slide-up animation with 0.5s delay
    const timer = setTimeout(() => setVisible(true), 500);
    return () => { clearInterval(id); clearTimeout(timer); };
  }, []);

  if (!t || t.expired || closed) return null;

  const handleClose = () => {
    setClosed(true);
    sessionStorage.setItem('concert-banner-closed', 'true');
  };

  return (
    <>
      <style>{`
        @keyframes concertSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 45,
        background: 'linear-gradient(90deg, #8B0000, #CC0000, #8B0000)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        opacity: visible ? 1 : 0,
        animation: visible ? 'concertSlideUp 0.4s ease-out' : undefined,
        transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
        boxShadow: '0 -4px 20px rgba(0,0,0,.5)',
      }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: '4px',
            right: '8px',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,.6)',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Concert info */}
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(9px, 1.4vw, 12px)',
          color: '#FFFFFF',
          letterSpacing: '2px',
          fontWeight: 700,
          textShadow: '0 0 10px rgba(0,0,0,.5)',
          textAlign: 'center',
        }}>
          🎫 CONCERT LA BOULE NOIRE — 24 JUIN — PLACES LIMITÉES
        </div>

        {/* Countdown compact */}
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(10px, 1.4vw, 13px)',
          color: '#FFD700',
          letterSpacing: '1px',
          fontWeight: 700,
          textShadow: '0 0 8px rgba(255,215,0,.5)',
          whiteSpace: 'nowrap',
        }}>
          J-{t.days} {pad(t.hours)}:{pad(t.minutes)}:{pad(t.seconds)}
        </div>

        {/* CTA Button */}
        <a
          href={BILLETTERIE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: 'clamp(10px, 1.3vw, 13px)',
            letterSpacing: '3px',
            color: '#fff',
            background: '#FF0000',
            border: '1px solid rgba(255,255,255,.3)',
            padding: '8px 20px',
            borderRadius: '3px',
            textDecoration: 'none',
            textShadow: '1px 1px 0 rgba(0,0,0,.5)',
            boxShadow: '0 0 16px rgba(255,0,0,.6), 0 0 32px rgba(255,0,0,.3)',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          RÉSERVER
        </a>
      </div>
    </>
  );
}
