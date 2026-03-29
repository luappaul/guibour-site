'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: 'C:\\GUIBOUR\\SYSTEM> init.exe', color: '#1B4332', delay: 400 },
  { text: '✓ Chargement des dossiers administratifs...', color: '#4CAF50', delay: 800 },
  { text: '✓ Module RTT initialisé — 3 unités disponibles', color: '#4CAF50', delay: 1400 },
  { text: '✓ Connexion Guibour Corp. établie', color: '#4CAF50', delay: 2000 },
  { text: '▶ Préparation de l\'espace de travail...', color: '#1B4332', delay: 2600, cursor: true },
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
      background: '#080F08',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      overflow: 'hidden',
    }}>
      {/* Green grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(44,95,46,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(44,95,46,.08) 1px, transparent 1px)',
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
          color: '#4CAF50',
          letterSpacing: '4px',
          marginBottom: '28px',
        }}>
          EMPLOYEE ID: GS-4891 // INITIALIZING...
        </div>

        {/* GUIBOUR — Lilita One green */}
        <div style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: 'clamp(52px, 10vw, 80px)',
          color: '#5CDB5C',
          letterSpacing: '6px',
          lineHeight: 1,
          textShadow: '3px 3px 0 #1B4332, 0 0 40px rgba(92,219,92,.35)',
          animation: 'glowGreen 3s ease-in-out infinite',
        }}>
          GUIBOUR
        </div>

        {/* SYSTEM — Lilita One yellow */}
        <div style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: 'clamp(28px, 5vw, 44px)',
          color: '#FFE033',
          letterSpacing: '10px',
          textShadow: '2px 2px 0 rgba(160,128,13,.5), 0 0 20px rgba(255,224,51,.2)',
          marginTop: '-4px',
        }}>
          SYSTEM
        </div>

        {/* W.O.W subtitle */}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '13px',
          color: '#4CAF50',
          letterSpacing: '8px',
          marginTop: '10px',
        }}>
          W . O . W — WORLD OF WORK
        </div>

        {/* Progress bar — fx Excel style */}
        <div style={{ width: '340px', margin: '36px auto 0' }}>
          <div style={{
            background: '#060E00',
            border: '1px solid #1B4332',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '3px',
          }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '12px',
              color: '#5CDB5C',
              fontWeight: 700,
            }}>fx</span>
            <div style={{
              flex: 1,
              background: '#0D2B0D',
              border: '1px solid #1B4332',
              height: '12px',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #5CDB5C, #2C5F2E)',
                borderRadius: '2px',
                boxShadow: '0 0 8px rgba(92,219,92,.5)',
                transition: 'width 0.1s linear',
              }} />
            </div>
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            color: '#2C5F2E',
            textAlign: 'center',
            marginTop: '6px',
            letterSpacing: '2px',
          }}>
            =LOADING(&quot;SYSTEM_BOOT&quot;) // {progress}%
          </div>
        </div>
      </div>

      {/* Badge employé — pendule bottom right */}
      <div style={{
        position: 'absolute',
        right: '36px',
        bottom: '24px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ width: '2px', height: '20px', background: '#2C5F2E' }} />
        <div style={{
          width: '56px',
          height: '76px',
          background: 'linear-gradient(135deg, #fff, #eee)',
          borderRadius: '6px',
          border: '3px solid #5CDB5C',
          boxShadow: '0 4px 16px rgba(0,0,0,.5), 0 0 12px rgba(92,219,92,.15)',
          animation: 'swing 3s ease-in-out infinite',
          transformOrigin: 'top center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
          }}>👤</div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '6px',
            color: '#1B4332',
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
            lineHeight: '1.8',
            animation: 'bootLine 0.3s ease-out',
          }}>
            {line.text}
            {line.cursor && (
              <span style={{
                color: '#5CDB5C',
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
