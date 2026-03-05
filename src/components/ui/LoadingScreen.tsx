'use client';

import { useEffect, useState } from 'react';
import Logo, { GlobeSVG } from './Logo';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: 'C:\\GUIBOUR\\SYSTEM> init.exe', color: '#1A4A3A', delay: 400 },
  { text: '✓ Chargement des dossiers administratifs...', color: '#009B77', delay: 800 },
  { text: '✓ Module RTT initialisé — 3 unités disponibles', color: '#009B77', delay: 1400 },
  { text: '✓ Connexion Guibour Corp. établie', color: '#009B77', delay: 2000 },
  { text: '▶ Préparation de l\'espace de travail...', color: '#1A4A3A', delay: 2600, cursor: true },
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 35);

    // Show boot lines progressively
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });

    // Fade out after loading
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
      background: '#080D14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,168,157,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,157,0.04) 1px, transparent 1px)',
        backgroundSize: '52px 32px',
      }} />

      {/* Scanlines */}
      <div className="scanlines" style={{ position: 'absolute', inset: 0 }} />

      {/* Logo top-left */}
      <div style={{ position: 'absolute', top: 24, left: 28 }}>
        <Logo variant="dark" size="sm" />
      </div>

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <GlobeSVG size={90} color="#0047AB" accentColor="#00C9C8" glowColor="#00C9C8" />
        </div>

        <span style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: '72px',
          fontWeight: 800,
          color: 'white',
          letterSpacing: '2px',
          display: 'block',
          lineHeight: 1,
          textShadow: '0 0 14px rgba(0,201,200,0.8), 0 0 40px rgba(0,201,200,0.3), 0 0 60px rgba(0,71,171,0.5)',
        }}>
          GUIBOUR
        </span>

        {/* Separator */}
        <div style={{
          width: '320px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #00A89D, #00C9C8, transparent)',
          margin: '16px auto',
          boxShadow: '0 0 8px #00C9C8',
        }} />

        <span style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: '14px',
          fontWeight: 300,
          color: '#00C9C8',
          letterSpacing: '18px',
          display: 'block',
        }}>
          SYSTEM
        </span>

        {/* Progress bar */}
        <div style={{
          width: '320px',
          margin: '40px auto 0',
          background: 'rgba(0,71,171,0.2)',
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
          color: '#00C9C8',
          letterSpacing: '3px',
          marginTop: '8px',
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
                color: '#00C9C8',
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
