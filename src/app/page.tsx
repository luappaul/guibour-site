'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import LoadingScreen from '@/components/ui/LoadingScreen';
import Logo from '@/components/ui/Logo';
import CharacterSelect, { CharacterData } from '@/components/ui/CharacterSelect';

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
      background: 'linear-gradient(180deg, #0A1520 0%, #0D1D35 40%, #0A1520 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,71,171,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,71,171,0.07) 1px, transparent 1px)',
        backgroundSize: '56px 34px',
        pointerEvents: 'none',
      }} />

      {/* Eyebrow tag */}
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '8px',
        color: '#00A89D',
        letterSpacing: '3px',
        marginBottom: '24px',
        position: 'relative',
        zIndex: 2,
      }}>
        EMPLOYEE ID: GS-4891 // GUIBOUR CORP. // 2025
      </span>

      {/* Logo - much bigger */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Logo variant="dark" size="lg" />
      </div>


      {/* Description */}
      <span style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '10px',
        color: '#00A89D',
        letterSpacing: '2px',
        marginTop: '24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
      }}>
        NOUVEAU SINGLE // JOUE ET GRIMPE DANS LA HIERARCHIE
      </span>

      {/* Excel cells */}
      <div style={{
        display: 'flex',
        gap: '1px',
        marginTop: '20px',
        background: '#C8D8E8',
        border: '1px solid #C8D8E8',
        position: 'relative',
        zIndex: 2,
      }}>
        {[
          { label: 'LVL', value: '1' },
          { label: 'SALAIRE', value: '0\u20AC' },
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
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              color: cell.label === 'FORMULE' ? '#0047AB' : '#1A2530',
            }}>{cell.value}</div>
          </div>
        ))}
      </div>

      {/* CTA Button - bigger and more impactful */}
      <button
        onClick={onPlay}
        style={{
          marginTop: '36px',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '10px',
          color: '#fff',
          background: '#0047AB',
          border: '2px solid #00A89D',
          padding: '20px 64px',
          cursor: 'pointer',
          boxShadow: '0 0 30px rgba(0,71,171,0.4), inset 0 0 20px rgba(0,71,171,0.1)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#1A6ED8';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,71,171,0.6), inset 0 0 30px rgba(0,71,171,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#0047AB';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0,71,171,0.4), inset 0 0 20px rgba(0,71,171,0.1)';
        }}
      >
        JOUER
      </button>
    </div>
  );
}

export default function Home() {
  const [showLoading, setShowLoading] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);

  useEffect(() => {
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
    setShowCharacterSelect(true);
  }, []);

  const handleCharacterSelect = useCallback((character: CharacterData) => {
    setSelectedCharacter(character);
    setShowCharacterSelect(false);
    setShowGame(true);
  }, []);

  const handleCharacterBack = useCallback(() => {
    setShowCharacterSelect(false);
  }, []);

  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (showCharacterSelect) {
    return <CharacterSelect onSelect={handleCharacterSelect} onBack={handleCharacterBack} />;
  }

  if (showGame) {
    return (
      <div
        className="flex flex-col overflow-hidden"
        style={{ background: '#0A1520', height: '100dvh' }}
      >
        <ExcelNav />
        <main
          className="flex-1"
          style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <GameCanvas characterName={selectedCharacter?.name ?? ''} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ExcelNav />
      <ExcelChrome formulaText='=LAUNCH_GAME("W.O.W","SINGLE_2025") → WELCOME_TO_THE_SYSTEM'>
        <HeroContent onPlay={handlePlay} />
      </ExcelChrome>
    </div>
  );
}
