'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface BadgeScannerProps {
  onComplete: () => void;
}

const SCAN_DURATION = 1500; // 0.3s-1.5s laser
const FLASH_TIME = 1500;
const TEXT_TIME = 1800;
const END_TIME = 2500;

export default function BadgeScanner({ onComplete }: BadgeScannerProps) {
  const [phase, setPhase] = useState<'scan' | 'flash' | 'granted' | 'done'>('scan');
  const [fadeOut, setFadeOut] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const startTimeRef = useRef(0);
  const frameRef = useRef(0);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelAnimationFrame(frameRef.current);
    sessionStorage.setItem('guibour-badge-scanned', 'true');
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = () => {
      if (completedRef.current) return;
      const elapsed = performance.now() - startTimeRef.current;

      // Scan laser progress (0.3s to 1.5s)
      if (elapsed >= 300 && elapsed < SCAN_DURATION) {
        setScanProgress((elapsed - 300) / (SCAN_DURATION - 300));
      }

      if (elapsed >= FLASH_TIME && phase === 'scan') {
        setPhase('flash');
        // Vibrate
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      }

      if (elapsed >= TEXT_TIME && phase === 'flash') {
        setPhase('granted');
      }

      if (elapsed >= END_TIME) {
        setFadeOut(true);
        setTimeout(finish, 400);
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Scan frame */}
      {phase === 'scan' && (
        <div
          style={{
            width: '80vw',
            maxWidth: '300px',
            height: '60vh',
            maxHeight: '400px',
            border: '2px solid #00FF41',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 20px rgba(0,255,65,0.3), inset 0 0 20px rgba(0,255,65,0.1)',
          }}
        >
          {/* Corner markers */}
          {[
            { top: 0, left: 0 },
            { top: 0, right: 0 },
            { bottom: 0, left: 0 },
            { bottom: 0, right: 0 },
          ].map((pos, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                ...pos,
                width: '24px',
                height: '24px',
                borderColor: '#00FF41',
                borderStyle: 'solid',
                borderWidth: 0,
                ...(pos.top === 0 ? { borderTopWidth: '3px' } : { borderBottomWidth: '3px' }),
                ...(pos.left === 0 ? { borderLeftWidth: '3px' } : { borderRightWidth: '3px' }),
              } as React.CSSProperties}
            />
          ))}

          {/* Laser line */}
          <div
            style={{
              position: 'absolute',
              left: '10%',
              width: '80%',
              height: '2px',
              background: '#00FF41',
              boxShadow: '0 0 10px #00FF41, 0 0 20px #00FF41, 0 0 40px #00FF41',
              top: `${scanProgress * 100}%`,
              transition: 'top 0.05s linear',
            }}
          />

          {/* SCAN text */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              width: '100%',
              textAlign: 'center',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#00FF41',
              letterSpacing: '4px',
              opacity: 0.7,
            }}
          >
            SCANNING...
          </div>
        </div>
      )}

      {/* Green flash */}
      {phase === 'flash' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#00FF41',
            animation: 'badge-flash 0.3s ease-out',
          }}
        />
      )}

      {/* Access granted */}
      {phase === 'granted' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'badge-granted-in 0.3s ease-out',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              color: '#00FF41',
              marginBottom: '16px',
              textShadow: '0 0 20px #00FF41',
            }}
          >
            ✓
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(20px, 5vw, 32px)',
              color: '#00FF41',
              letterSpacing: '6px',
              fontWeight: 700,
              textShadow: '0 0 15px #00FF41, 0 0 30px #00FF41',
            }}
          >
            ACCÈS AUTORISÉ
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes badge-flash {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes badge-granted-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
