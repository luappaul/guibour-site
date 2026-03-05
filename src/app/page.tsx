'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Logo from '@/components/ui/Logo';

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

function HeroContent({ onPlay }: { onPlay: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 160px)',
      padding: '40px 20px',
    }}>
      {/* Eyebrow tag */}
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '8px',
        color: '#00755E',
        letterSpacing: '3px',
        marginBottom: '24px',
      }}>
        EMPLOYEE ID: GS-4891 // GUIBOUR CORP. // 2025
      </span>

      {/* Logo */}
      <Logo variant="light" size="lg" />

      {/* Description */}
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '9px',
        color: '#607888',
        letterSpacing: '2px',
        marginTop: '24px',
        textAlign: 'center',
      }}>
        NOUVEAU SINGLE // JOUE ET GRIMPE DANS LA HIÉRARCHIE
      </span>

      {/* Excel cells */}
      <div style={{
        display: 'flex',
        gap: '1px',
        marginTop: '20px',
        background: '#C8D8E8',
        border: '1px solid #C8D8E8',
      }}>
        {[
          { label: 'LVL', value: '1' },
          { label: 'SALAIRE', value: '0€' },
          { label: 'RTT', value: '3' },
          { label: 'FORMULE', value: '=SUM(AMBITION)' },
        ].map(cell => (
          <div key={cell.label} style={{
            background: 'white',
            padding: '6px 16px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '7px',
              color: '#607888',
              letterSpacing: '2px',
              marginBottom: '2px',
            }}>{cell.label}</div>
            <div style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: cell.label === 'FORMULE' ? '#0047AB' : '#1A2530',
            }}>{cell.value}</div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={onPlay}
        style={{
          marginTop: '32px',
          fontFamily: "'Oxanium', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '8px',
          color: '#00A89D',
          background: '#080D14',
          border: '1px solid #00A89D',
          padding: '15px 52px',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(0,168,157,0.15), inset 0 0 20px rgba(0,168,157,0.05)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        JOUER
      </button>
    </div>
  );
}

export default function Home() {
  const [showLoading, setShowLoading] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);

  useEffect(() => {
    // Check if loading was already shown this session
    if (typeof window !== 'undefined') {
      const alreadyLoaded = sessionStorage.getItem('guibour-loaded');
      if (alreadyLoaded) {
        setLoadingDone(true);
      } else {
        setShowLoading(true);
      }
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    setLoadingDone(true);
    sessionStorage.setItem('guibour-loaded', 'true');
  }, []);

  const handlePlay = useCallback(() => {
    setShowGame(true);
  }, []);

  // Show loading screen first
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Show game full screen
  if (showGame) {
    return (
      <div className="flex h-screen flex-col overflow-hidden" style={{ background: '#1E293B' }}>
        <ExcelNav />
        <main className="flex-1">
          <GameCanvas />
        </main>
      </div>
    );
  }

  // Show homepage hero
  return (
    <div className="min-h-screen">
      <ExcelNav />
      <ExcelChrome formulaText='=LAUNCH_GAME("GUIBOUR","SINGLE_2025") → WELCOME_TO_THE_SYSTEM'>
        <HeroContent onPlay={handlePlay} />
      </ExcelChrome>
    </div>
  );
}
