'use client';

import { useEffect, useState } from 'react';
import Sphere from './Sphere';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: 'C:\\GUIBOUR\\SYSTEM> init.exe', color: '#2A6040', delay: 400 },
  { text: '✓ Chargement des dossiers administratifs...', color: '#6ED47A', delay: 800 },
  { text: '✓ Module RTT initialisé — 3 unités disponibles', color: '#6ED47A', delay: 1400 },
  { text: '✓ Connexion Guibour Corp. établie', color: '#6ED47A', delay: 2000 },
  { text: '▶ Préparation de l\'espace de travail...', color: '#3A8040', delay: 2600, cursor: true },
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visibleLines, setVisibleLines] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
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
      background: '#0D1A0D',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      overflow: 'hidden',
    }}>
      {/* Green grid background — V7 plus visible */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(61,128,64,.11) 1px, transparent 1px), linear-gradient(90deg, rgba(61,128,64,.11) 1px, transparent 1px)',
        backgroundSize: '52px 32px',
        pointerEvents: 'none',
      }} />

      {/* Scanlines */}
      <div className="scanlines" style={{ position: 'absolute', inset: 0 }} />

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', animation: 'slideUp 1s ease' }}>
        {/* Employee ID tag */}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#6ED47A',
          letterSpacing: '4px',
          marginBottom: '28px',
        }}>
          EMPLOYEE ID: GS-4891 // INITIALIZING...
        </div>

        {/* Logo horizontal : sphère + texte */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '22px',
          marginBottom: '14px',
        }}>
          <Sphere size={90} />

          <div style={{ textAlign: 'left' }}>
            {/* GUIBOUR */}
            <div style={{
              fontFamily: "'Lilita One', cursive",
              fontSize: 'clamp(48px, 9vw, 76px)',
              color: '#7AEC7A',
              letterSpacing: '5px',
              lineHeight: 1,
              textShadow: '3px 3px 0 #2A6040, 0 0 40px rgba(122,236,122,.4)',
              animation: 'glowGreen 3s ease-in-out infinite',
            }}>
              GUIBOUR
            </div>

            {/* SYSTEM */}
            <div style={{
              fontFamily: "'Lilita One', cursive",
              fontSize: 'clamp(26px, 4.5vw, 40px)',
              color: '#FFE033',
              letterSpacing: '10px',
              textShadow: '2px 2px 0 rgba(160,128,13,.55), 0 0 20px rgba(255,224,51,.25)',
              marginTop: '-4px',
            }}>
              SYSTEM
            </div>

            {/* W.O.W subtitle */}
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '12px',
              color: '#6ED47A',
              letterSpacing: '7px',
              marginTop: '8px',
            }}>
              W . O . W — WORLD OF WORK
            </div>
          </div>
        </div>

        {/* Progress bar — fx Excel style */}
        <div style={{ width: '340px', margin: '28px auto 0' }}>
          <div style={{
            background: '#131E08',
            border: '1px solid #2A6040',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '4px',
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '13px',
              color: '#7AEC7A',
              fontWeight: 700,
            }}>fx</span>
            <div style={{
              flex: 1,
              background: '#1A3018',
              border: '1px solid #2A6040',
              height: '13px',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #7AEC7A, #3A8040)',
                borderRadius: '3px',
                boxShadow: '0 0 8px rgba(122,236,122,.5)',
                transition: 'width 0.1s linear',
              }} />
            </div>
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            color: '#3A8040',
            textAlign: 'center',
            marginTop: '6px',
            letterSpacing: '2px',
          }}>
            =LOADING(&quot;SYSTEM_BOOT&quot;) // {progress}%
          </div>
        </div>
      </div>

      {/* Badge employé — pendule bottom right, sphère dans le badge */}
      <div style={{
        position: 'absolute',
        right: '36px',
        bottom: '24px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ width: '2px', height: '20px', background: '#3A8040' }} />
        <div style={{
          width: '60px',
          height: '80px',
          background: 'linear-gradient(135deg, #fff, #eee)',
          borderRadius: '7px',
          border: '3px solid #7AEC7A',
          boxShadow: '0 4px 16px rgba(0,0,0,.5), 0 0 12px rgba(122,236,122,.18)',
          animation: 'swing 3s ease-in-out infinite',
          transformOrigin: 'top center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
        }}>
          <Sphere size={28} animated={false} />
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '6px',
            color: '#1A3A1A',
            letterSpacing: '1px',
          }}>GUIBOUR</div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '5px',
            color: '#888',
          }}>GS-4891</div>
        </div>
      </div>

      {/* Terminal boot text */}
      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '28px',
        zIndex: 10,
      }}>
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px',
            color: line.color,
            lineHeight: '1.9',
            animation: 'bootLine 0.3s ease-out',
          }}>
            {line.text}
            {line.cursor && (
              <span style={{
                color: '#7AEC7A',
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
