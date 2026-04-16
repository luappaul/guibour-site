'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CharacterSelect, { CharacterData, PlayerIdentity } from '@/components/ui/CharacterSelect';
import { useDayNight, getDayNightTheme } from '@/hooks/useDayNight';
import { playClick } from '@/lib/sounds';

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

import Countdown from '@/components/ui/Countdown';
import GlobeO from '@/components/ui/GlobeO';

function HeroContent({ onPlay }: { onPlay: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 120px)',
      padding: '0 20px',
      position: 'relative',
    }}>

      {/* Logo GUIBOUR SYSTEM — centré, imposant, respire */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: 'clamp(60px, 12vw, 110px)',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}>
          <span style={{
            fontFamily: "'Lilita One', cursive",
            color: '#FFFFFF',
            letterSpacing: '4px',
            animation: 'glowWhite3D 3s ease-in-out infinite',
          }}>GUIB</span>
          <GlobeO />
          <span style={{
            fontFamily: "'Lilita One', cursive",
            color: '#FFFFFF',
            letterSpacing: '4px',
            animation: 'glowWhite3D 3s ease-in-out infinite',
          }}>UR</span>
        </div>

        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(12px, 2vw, 18px)',
          color: '#00FFEE',
          letterSpacing: '10px',
          fontWeight: 700,
          textShadow: '0 0 14px rgba(0,255,238,.5)',
          marginTop: '6px',
        }}>
          S Y S T E M
        </div>
      </div>

      {/* Tagline — discret */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '10px',
        color: '#2B5090',
        letterSpacing: '4px',
        marginTop: '20px',
        position: 'relative',
        zIndex: 2,
      }}>
        WORK OR WINDOW
      </div>

      {/* CTA JOUER — gros, seul, central */}
      <button
        onClick={() => { playClick(); onPlay(); }}
        style={{
          marginTop: '48px',
          fontFamily: "'Lilita One', cursive",
          fontSize: 'clamp(20px, 4vw, 28px)',
          letterSpacing: '8px',
          color: '#fff',
          background: 'linear-gradient(135deg, #0047AB, #007B8A)',
          border: '2px solid rgba(0,200,190,.4)',
          padding: '18px 60px',
          cursor: 'pointer',
          boxShadow: '0 0 40px rgba(0,71,171,.25), 0 0 80px rgba(0,200,190,.1)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
          transition: 'all 0.3s ease',
          borderRadius: '2px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 0 60px rgba(0,71,171,.5), 0 0 120px rgba(0,200,190,.2)';
          e.currentTarget.style.borderColor = 'rgba(0,200,190,.8)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0,71,171,.25), 0 0 80px rgba(0,200,190,.1)';
          e.currentTarget.style.borderColor = 'rgba(0,200,190,.4)';
        }}
      >
        <span style={{ position: 'relative', zIndex: 1, textShadow: '2px 3px 0 rgba(0,0,0,.5)' }}>
          JOUER
        </span>
        <span style={{
          position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)',
          animation: 'shimmer 4s ease-in-out infinite',
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
  const [playerIdentity, setPlayerIdentity] = useState<PlayerIdentity | null>(null);
  const timeMode = useDayNight();
  const theme = getDayNightTheme(timeMode);

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

  // Masquer Guibot pendant le jeu
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (showGame || showCharacterSelect || showLoading) {
      document.body.dataset.gameActive = 'true';
    } else {
      delete document.body.dataset.gameActive;
    }
    return () => {
      delete document.body.dataset.gameActive;
    };
  }, [showGame, showCharacterSelect, showLoading]);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    setLoadingDone(true);
    sessionStorage.setItem('guibour-loaded', 'true');
  }, []);

  const handlePlay = useCallback(() => {
    // Toujours afficher CharacterSelect pour identifier le joueur
    setShowCharacterSelect(true);
  }, []);

  const handleCharacterSelect = useCallback((character: CharacterData, identity: PlayerIdentity) => {
    setSelectedCharacter(character);
    setPlayerIdentity(identity);
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
        className="game-wrapper flex flex-col overflow-hidden"
        style={{ background: '#1A3F78', height: '100dvh' }}
      >
        {/* Sidebar hidden on mobile during game via CSS */}
        <div className="sidebar-nav-hide-game">
          <ExcelNav />
        </div>
        <main
          className="flex-1"
          style={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <GameCanvas characterName={selectedCharacter?.name ?? ''} playerIdentity={playerIdentity} />
        </main>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen" style={{ background: theme.bg, transition: 'background 2s ease' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=LAUNCH_GAME("GUIBOUR","SINGLE_2026") → WELCOME_TO_THE_SYSTEM'>
        <HeroContent onPlay={handlePlay} />
      </ExcelChrome>
      {/* Countdown fixed en bas — concert privé */}
      <Countdown />
      {/* Indicateur mode jour/nuit discret */}
      <div style={{
        position: 'fixed', bottom: '12px', right: '12px',
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '8px', color: '#2B5090', letterSpacing: '2px',
        zIndex: 10, opacity: 0.6, pointerEvents: 'none',
      }}>
        {theme.accentLabel}
      </div>
    </div>
    </>
  );
}
