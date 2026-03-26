'use client';

import { useEffect, useState } from 'react';
import Logo, { GlobeSVG } from './Logo';
import GuibourCharacter from './GuibourCharacter';

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

      {/* Logo top-left */}
      <div style={{ position: 'absolute', top: 24, left: 28 }}>
        <Logo variant="dark" size="sm" />
      </div>

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        {/* White backdrop behind logo */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '32px 48px',
          boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
          display: 'inline-block',
          animation: 'logoPulse 3s ease-in-out infinite',
        }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <GlobeSVG size={90} color="#0047AB" accentColor="#00A89D" glowColor="#00A89D" />
          </div>

          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '72px',
            fontWeight: 800,
            color: '#0A1520',
            letterSpacing: '2px',
            display: 'block',
            lineHeight: 1,
          }}>
            GUIBOUR
          </span>

          {/* Separator */}
          <div style={{
            width: '320px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #0047AB, #00A89D, transparent)',
            margin: '16px auto',
            boxShadow: '0 0 8px #00A89D',
          }} />

          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            fontWeight: 300,
            color: '#0047AB',
            letterSpacing: '18px',
            display: 'block',
          }}>
            SYSTEM
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '320px',
          margin: '40px auto 0',
          background: 'rgba(0,71,171,0.15)',
          border: '1px solid #0047AB',
          padding: '4px',
        }}>
          <div style={{
            height: '10px',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0047AB, #00A89D)',
            boxShadow: '0 0 8px #00A89D',
            transition: 'width 0.1s linear',
          }} />
        </div>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '9px',
          color: '#00A89D',
          letterSpacing: '3px',
          marginTop: '8px',
          display: 'block',
        }}>
          INITIALISATION... {progress}%
        </span>
      </div>

      {/* Walking character */}
      <div style={{
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        overflow: 'hidden',
        height: '100px',
        zIndex: 10,
      }}>
        <GuibourCharacter size={80} animate={true} />
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
