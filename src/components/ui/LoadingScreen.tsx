'use client';

import { useEffect, useState } from 'react';
import { GlobeSVG } from './Logo';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: 'C:\\GUIBOUR\\SYSTEM> init.exe', color: '#1A3A6A', delay: 400 },
  { text: '✓ Chargement des dossiers administratifs...', color: '#00A89D', delay: 800 },
  { text: '✓ Module RTT initialisé — 3 unités disponibles', color: '#00A89D', delay: 1400 },
  { text: '✓ Connexion Guibour Corp. établie', color: '#00A89D', delay: 2000 },
  { text: '▶ Préparation de l\'espace de travail...', color: '#1A3A6A', delay: 2600, cursor: true },
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 35);

    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });

    const fadeTimer = setTimeout(() => setFadeOut(true), 3800);
    const completeTimer = setTimeout(() => onComplete(), 4300);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#0A1520',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
    }}>
      {/* Subtle paper grain texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"),
          linear-gradient(rgba(0,71,171,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,71,171,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '256px 256px, 52px 32px, 52px 32px',
      }} />

      {/* Scanlines */}
      <div className="scanlines" style={{ position: 'absolute', inset: 0 }} />

      {/* Center content — no white square, directly on dark background */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        {/* Globe icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <GlobeSVG size={100} color="#0047AB" accentColor="#00A89D" glowColor="#00A89D" />
        </div>

        {/* W.O.W title — game name, simple mono font */}
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '56px',
          fontWeight: 400,
          color: '#fff',
          letterSpacing: '12px',
          display: 'block',
          lineHeight: 1,
          textShadow: '0 0 20px rgba(0,168,157,0.6), 0 0 60px rgba(0,168,157,0.2)',
        }}>
          W.O.W
        </span>

        {/* Subtitle */}
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#00A89D',
          letterSpacing: '6px',
          display: 'block',
          marginTop: '10px',
        }}>
          WORK OR WINDOW
        </span>

        {/* Separator */}
        <div style={{
          width: '280px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #0047AB, #00A89D, transparent)',
          margin: '24px auto',
          boxShadow: '0 0 8px #00A89D',
        }} />

        {/* Progress bar */}
        <div style={{
          width: '320px',
          margin: '0 auto',
          background: 'rgba(0,71,171,0.15)',
          border: '1px solid #0047AB',
          padding: '4px',
        }}>
          <div style={{
            height: '12px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0047AB, #00A89D)',
            boxShadow: '0 0 8px #00A89D',
            transition: 'width 0.1s linear',
          }} />
        </div>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#00A89D',
          letterSpacing: '3px',
          marginTop: '10px',
          display: 'block',
        }}>
          INITIALISATION... {progress}%
        </span>
      </div>

      {/* Terminal boot text - bottom left */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 28,
        zIndex: 10,
      }}>
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            color: line.color,
            lineHeight: '1.8',
            animation: 'bootLine 0.3s ease-out',
          }}>
            {line.text}
            {line.cursor && (
              <span style={{
                color: '#00A89D',
                animation: 'cursorBlink 1s infinite',
                marginLeft: '4px',
              }}>█</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
