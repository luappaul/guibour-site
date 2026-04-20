'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Typewriter from '@/components/ui/Typewriter';

interface ExcelChromeProps {
  formulaText?: string;
  children: React.ReactNode;
  gridColor?: string;
  gridOpacity?: number;
  chromeBg?: string;
  breadcrumb?: string;
}

// Excel-style columns: A-Z then AA-AZ (52 columns to fill any screen width)
const COLUMNS = [
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(c => 'A' + c),
];

// ── Easter egg: DEMISSION ──────────────────────────────────────────────
type DemissionPhase = 'idle' | 'shake' | 'aftermath';

export default function ExcelChrome({ formulaText = '=LAUNCH_GAME("GUIBOUR","SINGLE_2026") → WELCOME_TO_THE_SYSTEM', children, gridColor, gridOpacity, chromeBg, breadcrumb }: ExcelChromeProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [phase, setPhase] = useState<DemissionPhase>('idle');
  const [showFlash, setShowFlash] = useState(false);
  const [formulaTyped, setFormulaTyped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => timeoutRefs.current.forEach(clearTimeout);
  }, []);

  const triggerDemission = useCallback(() => {
    // Try to play a dramatic sound via Web Audio API
    try {
      const ac = new AudioContext();
      // Descending alarm tone
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ac.currentTime + 0.8);
      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.0);
      osc.start(ac.currentTime);
      osc.stop(ac.currentTime + 1.0);
    } catch {}

    setPhase('shake');
    setShowFlash(true);
    setEditing(false);
    setInputValue('');

    const t1 = setTimeout(() => setShowFlash(false), 1000);
    const t2 = setTimeout(() => setPhase('aftermath'), 2000);
    const t3 = setTimeout(() => setPhase('idle'), 4000);
    timeoutRefs.current.push(t1, t2, t3);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputValue.trim().toUpperCase() === 'DEMISSION') {
        triggerDemission();
      } else {
        setEditing(false);
        setInputValue('');
      }
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setInputValue('');
    }
  }, [inputValue, triggerDemission]);

  const handleBarClick = useCallback(() => {
    if (phase !== 'idle') return;
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [phase]);

  const getFormulaDisplay = () => {
    if (phase === 'shake') return '=DEMISSION_ACCEPTEE() // BONNE CHANCE DEHORS';
    if (phase === 'aftermath') return '=DEMISSION_ANNULEE() // ON RIGOLE';
    return formulaText;
  };

  const getFormulaColor = () => {
    if (phase === 'shake') return '#FF3333';
    if (phase === 'aftermath') return '#00FF88';
    return '#5B9BD5';
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      paddingLeft: '48px', // leave room for sidebar nav
      backgroundColor: chromeBg ?? '#0E2660',
      backgroundImage:
        `linear-gradient(${gridColor ?? 'rgba(60,130,240,.18)'} 1px, transparent 1px), linear-gradient(90deg, ${gridColor ?? 'rgba(60,130,240,.18)'} 1px, transparent 1px)`,
      backgroundSize: '56px 34px',
      // aligne avec les en-tetes de colonnes (28px header + 24px formula bar = 52px chrome total)
      backgroundPosition: '48px 52px',
      animation: phase === 'shake' ? 'easterShake 0.15s infinite' : undefined,
      transition: 'background-color 2.5s ease',
    }}>
      {/* Red flash overlay */}
      {showFlash && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(255, 0, 0, 0.35)',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'easterFlash 1s ease-out forwards',
        }} />
      )}

      {/* Shimmer — lumiere glissant sur les lignes de la grille */}
      <div className="grid-shimmer" />
      {/* Fondus de bord — degrade vers le noir a droite et en bas */}
      <div className="grid-edge-fades" />

      {/* Column headers row */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        height: '28px',
        background: '#0F2562',
        borderBottom: '1px solid #1E4080',
      }}>
        {COLUMNS.map(col => (
          <div key={col} style={{
            width: '56px',
            minWidth: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '9px',
            color: '#5B9BD5',
            borderRight: '1px solid rgba(43,80,144,.4)',
          }}>
            {col}
          </div>
        ))}
      </div>

      {/* Formula bar — clickable to edit */}
      <div
        onClick={handleBarClick}
        style={{
          position: 'sticky',
          top: 28,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          height: '24px',
          background: phase === 'shake' ? '#2A0000' : '#091D4E',
          borderBottom: '2px solid #0F2562',
          paddingLeft: '8px',
          gap: '12px',
          cursor: phase === 'idle' ? 'text' : 'default',
          transition: 'background 0.3s',
        }}
      >
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          color: phase === 'shake' ? '#FF3333' : '#00C8BE',
          fontWeight: 700,
          paddingLeft: '8px',
          transition: 'color 0.3s',
        }}>fx</span>

        {editing ? (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => { setEditing(false); setInputValue(''); }}
            placeholder={formulaText}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '9px',
              color: '#FFFFFF',
              letterSpacing: '1px',
              caretColor: '#00C8BE',
            }}
          />
        ) : (
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '9px',
            color: getFormulaColor(),
            letterSpacing: '1px',
            transition: 'color 0.3s',
            fontWeight: phase !== 'idle' ? 700 : 400,
          }}>
            {phase === 'idle' && !formulaTyped ? (
              <Typewriter
                text={getFormulaDisplay()}
                speed={18}
                delay={300}
                onComplete={() => setFormulaTyped(true)}
              />
            ) : (
              getFormulaDisplay()
            )}
          </span>
        )}
      </div>

      {/* Breadcrumb bar */}
      {breadcrumb && (
        <div
          style={{
            position: 'sticky',
            top: 52,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            height: '24px',
            background: '#0D2354',
            borderBottom: '1px solid #0F2562',
            paddingLeft: '16px',
            gap: '0',
          }}
        >
          <Link href="/" style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '8px',
            color: '#5B9BD5',
            letterSpacing: '2px',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#A8D8FF'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5B9BD5'; }}
          >
            GUIBOUR SYSTEM
          </Link>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '8px',
            color: '#2B5090',
            margin: '0 8px',
          }}>&gt;</span>
          {breadcrumb.split(' > ').map((part, i, arr) => {
            const isLast = i === arr.length - 1;
            return (
              <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '8px',
                  color: isLast ? '#3C5A7A' : '#5B9BD5',
                  letterSpacing: '2px',
                }}>
                  {part}
                </span>
                {!isLast && (
                  <span style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '8px',
                    color: '#2B5090',
                    margin: '0 8px',
                  }}>&gt;</span>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Main content area */}
      <div style={{
        paddingTop: '16px',
        minHeight: breadcrumb ? 'calc(100vh - 76px)' : 'calc(100vh - 52px)',
      }}>
        {children}
      </div>
    </div>
  );
}
