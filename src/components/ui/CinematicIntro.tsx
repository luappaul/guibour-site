'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

const LINES = [
  '> BIENVENUE CHEZ GUIBOUR SYSTEM...',
  '> INITIALISATION DU POSTE DE TRAVAIL...',
  '> CHARGEMENT DES SYNERGIES CRÉATIVES...',
];

// Timing config
const LINE_START_TIMES = [500, 1500, 2500]; // ms
const CHARS_PER_SECOND = 40;
const FLASH_START = 3000;
const LOGO_START = 3500;
const END_TIME = 4000;

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 800;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
    setTimeout(() => ctx.close(), 200);
  } catch {
    // Web Audio not available
  }
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentTyping, setCurrentTyping] = useState('');
  const [typingLineIndex, setTypingLineIndex] = useState(-1);
  const [showFlash, setShowFlash] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const startTimeRef = useRef(0);
  const frameRef = useRef(0);
  const completedRef = useRef(false);
  const beepPlayedRef = useRef<Set<number>>(new Set());

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    cancelAnimationFrame(frameRef.current);
    sessionStorage.setItem('guibour-intro-seen', 'true');
    onComplete();
  }, [onComplete]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 400);
    return () => clearInterval(interval);
  }, []);

  // Main animation loop
  useEffect(() => {
    startTimeRef.current = performance.now();

    const tick = () => {
      if (completedRef.current) return;
      const elapsed = performance.now() - startTimeRef.current;

      // Type lines
      for (let i = 0; i < LINES.length; i++) {
        const lineStart = LINE_START_TIMES[i];
        if (elapsed >= lineStart) {
          // Play beep once per line
          if (!beepPlayedRef.current.has(i)) {
            beepPlayedRef.current.add(i);
            playBeep();
          }

          const charTime = (elapsed - lineStart) / 1000 * CHARS_PER_SECOND;
          const chars = Math.min(Math.floor(charTime), LINES[i].length);

          if (chars >= LINES[i].length) {
            // Line fully typed
            setVisibleLines(prev => {
              if (prev.length <= i) return [...prev, LINES[i]];
              return prev;
            });
            if (typingLineIndex === i) {
              setTypingLineIndex(i + 1);
              setCurrentTyping('');
            }
          } else if (i === 0 || elapsed >= LINE_START_TIMES[i]) {
            // Currently typing this line
            const alreadyDone = visibleLines.length > i;
            if (!alreadyDone) {
              setTypingLineIndex(i);
              setCurrentTyping(LINES[i].substring(0, chars));
            }
          }
        }
      }

      // Flash
      if (elapsed >= FLASH_START && elapsed < LOGO_START) {
        setShowFlash(true);
      } else {
        setShowFlash(false);
      }

      // Logo
      if (elapsed >= LOGO_START && elapsed < END_TIME) {
        setShowLogo(true);
      }

      // End
      if (elapsed >= END_TIME) {
        setFadeOut(true);
        setTimeout(finish, 500);
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        transition: 'opacity 0.5s ease',
      }}
    >
      {/* Terminal lines */}
      {!showLogo && (
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 'clamp(14px, 2.5vw, 20px)',
            color: '#00FF41',
            textAlign: 'left',
            padding: '0 24px',
            maxWidth: '700px',
            width: '100%',
          }}
        >
          {visibleLines.map((line, i) => (
            <div key={i} style={{ marginBottom: '12px', lineHeight: 1.6 }}>
              {line}
            </div>
          ))}
          {typingLineIndex >= 0 && typingLineIndex < LINES.length && !visibleLines[typingLineIndex] && (
            <div style={{ marginBottom: '12px', lineHeight: 1.6 }}>
              {currentTyping}
              <span
                style={{
                  opacity: cursorVisible ? 1 : 0,
                  transition: 'opacity 0.1s',
                }}
              >
                _
              </span>
            </div>
          )}
        </div>
      )}

      {/* White flash */}
      {showFlash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            animation: 'cinematic-flash 0.5s ease-in-out',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Logo reveal */}
      {showLogo && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'cinematic-logo-in 0.4s ease-out',
          }}
        >
          <div
            style={{
              fontFamily: "'Lilita One', cursive",
              fontSize: 'clamp(48px, 10vw, 90px)',
              color: '#fff',
              textShadow: '0 0 30px #00FFEE, 0 0 60px #00FFEE, 0 0 120px #00FFEE',
              letterSpacing: '6px',
              lineHeight: 1,
            }}
          >
            GUIBOUR
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 'clamp(12px, 2vw, 18px)',
              color: '#00FFEE',
              letterSpacing: '10px',
              fontWeight: 700,
              textShadow: '0 0 20px #00FFEE, 0 0 40px #00FFEE',
              marginTop: '8px',
            }}
          >
            S Y S T E M
          </div>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={finish}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#fff',
          opacity: 0.3,
          background: 'none',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '6px 16px',
          cursor: 'pointer',
          letterSpacing: '2px',
          zIndex: 10,
        }}
      >
        SKIP
      </button>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes cinematic-flash {
          0% { opacity: 0; }
          40% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes cinematic-logo-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
