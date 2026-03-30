'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CharacterSelect, { CharacterData } from '@/components/ui/CharacterSelect';
import Sphere from '@/components/ui/Sphere';

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
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Employee ID */}
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '10px',
        color: '#6ED47A',
        letterSpacing: '4px',
        marginBottom: '28px',
        position: 'relative',
        zIndex: 2,
      }}>
        EMPLOYEE ID: GS-4891 // GUIBOUR CORP. // 2026
      </div>

      {/* Logo horizontal — sphère + texte */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        marginBottom: '4px',
        position: 'relative',
        zIndex: 2,
      }}>
        <Sphere size={80} />

        <div style={{ textAlign: 'left' }}>
          {/* GUIBOUR — Lilita One green glow */}
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: 'clamp(48px, 9vw, 82px)',
            color: '#7AEC7A',
            letterSpacing: '5px',
            lineHeight: 1,
            textShadow: '3px 3px 0 #2A6040, 0 0 30px rgba(122,236,122,.4)',
            animation: 'glowGreen 3s ease-in-out infinite',
          }}>
            GUIBOUR
          </div>

          {/* SYSTEM — Lilita One yellow */}
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: 'clamp(26px, 4.5vw, 44px)',
            color: '#FFE033',
            letterSpacing: '8px',
            textShadow: '2px 2px 0 rgba(160,128,13,.55)',
            marginTop: '-4px',
          }}>
            SYSTEM
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        color: '#6ED47A',
        letterSpacing: '3px',
        marginTop: '14px',
        position: 'relative',
        zIndex: 2,
      }}>
        NOUVEAU SINGLE // JOUE ET GRIMPE DANS LA HIÉRARCHIE
      </div>

      {/* Excel cells */}
      <div style={{
        display: 'flex',
        gap: '1px',
        marginTop: '24px',
        background: '#2A6040',
        border: '1px solid #3A8040',
        position: 'relative',
        zIndex: 2,
      }}>
        {[
          { label: 'LVL', value: '1', gold: false },
          { label: 'SALAIRE', value: '0€', gold: true },
          { label: 'RTT', value: '3', gold: false },
          { label: 'FORMULE', value: '=SUM(AMBITION)', gold: true },
        ].map(cell => (
          <div key={cell.label} style={{
            background: '#1A3018',
            padding: '8px 18px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '7px',
              color: '#6ED47A',
              letterSpacing: '2px',
              marginBottom: '3px',
            }}>{cell.label}</div>
            <div style={{
              fontFamily: "'Luckiest Guy', cursive",
              fontSize: '14px',
              color: cell.gold ? '#FFE033' : '#7AEC7A',
            }}>{cell.value}</div>
          </div>
        ))}
      </div>

      {/* CTA JOUER */}
      <button
        onClick={onPlay}
        style={{
          marginTop: '36px',
          fontFamily: "'Bangers', cursive",
          fontSize: '24px',
          letterSpacing: '10px',
          color: '#fff',
          background: '#2A6040',
          border: '2px solid #7AEC7A',
          padding: '14px 56px',
          cursor: 'pointer',
          boxShadow: '0 0 18px rgba(122,236,122,.25)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
          transition: 'all 0.2s ease',
          textShadow: '0 0 10px rgba(122,236,122,.4)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#3A8040';
          e.currentTarget.style.boxShadow = '0 0 32px rgba(122,236,122,.45)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#2A6040';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(122,236,122,.25)';
        }}
      >
        <span style={{ position: 'relative', zIndex: 1 }}>JOUER</span>
        {/* shimmer */}
        <span style={{
          position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
        }} />
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
        style={{ background: '#0E1A0E', height: '100dvh', paddingLeft: '48px' }}
      >
        <main
          className="flex-1"
          style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <GameCanvas characterName={selectedCharacter?.name ?? ''} />
        </main>
        <ExcelNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0E1A0E' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=LAUNCH_GAME("GUIBOUR","SINGLE_2026") → WELCOME_TO_THE_SYSTEM'>
        <HeroContent onPlay={handlePlay} />
      </ExcelChrome>
    </div>
  );
}
