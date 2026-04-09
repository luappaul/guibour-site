'use client';
import { useEffect, useState } from 'react';
import GlobeO from './GlobeO';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [bootLines, setBootLines] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 1;
      });
    }, 18);
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const completeTimer = setTimeout(() => onComplete(), 2500);
    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Boot sequence lines
  useEffect(() => {
    const lines = [
      '> INITIALIZING GUIBOUR_SYSTEM v2.6...',
      '> LOADING EMPLOYEE DATABASE...',
      '> CONNECTING TO W.O.W NETWORK...',
      '> CALIBRATING BUBBLE PHYSICS...',
      '> TOWER ACCESS: 25 FLOORS DETECTED',
      '> SYSTEM READY.',
    ];
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((line, i) => {
      timers.push(setTimeout(() => setBootLines(prev => [...prev, line]), 200 + i * 280));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: '#0E2660',
      backgroundImage:
        'linear-gradient(rgba(60,130,240,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(60,130,240,.18) 1px, transparent 1px)',
      backgroundSize: '56px 34px',
      backgroundPosition: '48px 52px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
      overflow: 'hidden',
    }}>
      {/* Grid shimmer effect — same as homepage */}
      <div className="grid-shimmer" />
      {/* Edge fades */}
      <div className="grid-edge-fades" />

      {/* Scanlines */}
      <div className="scanlines" style={{ position: 'absolute', inset: 0 }} />

      {/* Excel formula bar at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '28px',
        background: '#0F2562', borderBottom: '1px solid #1E4080',
        display: 'flex', alignItems: 'center', zIndex: 10,
      }}>
        <div style={{
          width: '56px', height: '100%', borderRight: '1px solid rgba(43,80,144,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5' }}>A</span>
        </div>
        {['B','C','D','E','F','G','H','I'].map(c => (
          <div key={c} style={{
            width: '56px', height: '100%', borderRight: '1px solid rgba(43,80,144,.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5' }}>{c}</span>
          </div>
        ))}
      </div>

      {/* Formula bar */}
      <div style={{
        position: 'absolute', top: '28px', left: 0, right: 0, height: '24px',
        background: '#091D4E', borderBottom: '2px solid #0F2562',
        display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '16px', zIndex: 10,
      }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#00D4CC', fontWeight: 700 }}>fx</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5', letterSpacing: '1px' }}>
          {'=LOADING("GUIBOUR_SYSTEM") // ' + progress + '%'}
        </span>
      </div>

      {/* Center content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>

        {/* Employee ID */}
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '10px',
          color: '#5B9BD5', letterSpacing: '4px', marginBottom: '28px',
          animation: 'fadeIn 0.5s ease-out',
        }}>
          EMPLOYEE ID: GS-4891 // W.O.W // 2026
        </div>

        {/* GUIBOUR logo — same layout as main page with Lilita One */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <div style={{
            fontSize: 'clamp(52px, 10vw, 90px)', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
          }}>
            <span style={{
              fontFamily: "'Lilita One', cursive", color: '#FFFFFF',
              letterSpacing: '3px', animation: 'glowWhite3D 3s ease-in-out infinite',
            }}>GUIB</span>
            <GlobeO />
            <span style={{
              fontFamily: "'Lilita One', cursive", color: '#FFFFFF',
              letterSpacing: '3px', animation: 'glowWhite3D 3s ease-in-out infinite',
            }}>UR</span>
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(11px, 1.8vw, 16px)', color: '#00FFEE',
            letterSpacing: '8px', fontWeight: 700,
            textShadow: '0 0 14px rgba(0,255,238,.5)', marginTop: '4px',
          }}>
            S Y S T E M
          </div>
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '11px',
          color: '#5B9BD5', letterSpacing: '3px', marginTop: '14px',
        }}>
          WORK OR WINDOW // GRIMPE LES 25 ÉTAGES
        </div>

        {/* Progress bar */}
        <div style={{ width: 'clamp(280px, 40vw, 420px)', marginTop: '36px' }}>
          <div style={{
            background: '#091D4E', border: '1px solid #1E4080',
            padding: '6px 12px', display: 'flex', alignItems: 'center',
            gap: '10px', borderRadius: '3px',
          }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#00D4CC', fontWeight: 700 }}>fx</span>
            <div style={{
              flex: 1, background: '#0C2240',
              border: '1px solid #1E4080', height: '14px',
              borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: progress + '%',
                background: 'linear-gradient(90deg, #0047AB, #00A89D)',
                borderRadius: '2px',
                boxShadow: '0 0 12px rgba(0,200,190,.5), 0 0 24px rgba(0,71,171,.3)',
                transition: 'width 0.1s linear',
              }} />
            </div>
          </div>
        </div>

        {/* Boot sequence lines */}
        <div style={{
          marginTop: '24px', textAlign: 'left',
          width: 'clamp(280px, 40vw, 420px)',
          minHeight: '100px',
        }}>
          {bootLines.map((line, i) => (
            <div key={i} style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
              color: line.includes('READY') ? '#00C8BE' : '#2B5090',
              letterSpacing: '1px', marginBottom: '4px',
              animation: 'bootLine 0.3s ease-out',
              textShadow: line.includes('READY') ? '0 0 8px rgba(0,200,190,.5)' : 'none',
            }}>
              {line}
              {i === bootLines.length - 1 && !line.includes('READY') && (
                <span style={{ animation: 'cursorBlink 0.8s step-end infinite' }}>_</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Badge employé — bottom right */}
      <div style={{
        position: 'absolute', right: '36px', bottom: '24px',
        zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ width: '2px', height: '20px', background: '#1B3A6B' }} />
        <div style={{
          width: '60px', height: '80px',
          background: 'linear-gradient(135deg, #fff, #E8EEF4)',
          borderRadius: '7px', border: '3px solid #0047AB',
          boxShadow: '0 4px 16px rgba(0,0,0,.5), 0 0 12px rgba(0,71,171,.25)',
          animation: 'swing 3s ease-in-out infinite',
          transformOrigin: 'top center',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '4px',
        }}>
          <div style={{ fontSize: '20px' }}>🌐</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '6px', color: '#0C2A62', letterSpacing: '1px' }}>GUIBOUR</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '5px', color: '#607888' }}>GS-4891</div>
        </div>
      </div>
    </div>
  );
}
