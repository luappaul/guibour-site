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

import Link from 'next/link';
import Countdown from '@/components/ui/Countdown';
import GlobeO from '@/components/ui/GlobeO';

function WowSpan() {
  return (
    <span style={{
      color: '#00C8BE',
      textShadow: '0 0 10px rgba(0,200,190,.55), 1px 2px 0 #003A38',
    }}>W.O.W</span>
  );
}

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
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '10px',
        color: '#5B9BD5',
        letterSpacing: '4px',
        marginBottom: '28px',
        position: 'relative',
        zIndex: 2,
      }}>
        EMPLOYEE ID: GS-4891 // W.O.W // 2026
      </div>

      {/* Logo GUIBOUR SYSTEM — globe neon dans le O */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginBottom: '4px' }}>
        {/* Ligne GUIB + globe + UR */}
        <div style={{
          fontSize     : 'clamp(52px, 10vw, 90px)',
          lineHeight   : 1,
          display      : 'flex',
          alignItems   : 'center',
          justifyContent: 'center',
          gap          : 0,
        }}>
          <span style={{
            fontFamily: "'Lilita One', cursive",
            color     : '#FFFFFF',
            letterSpacing: '3px',
            animation : 'glowWhite3D 3s ease-in-out infinite',
          }}>
            GUIB
          </span>
          <GlobeO />
          <span style={{
            fontFamily: "'Lilita One', cursive",
            color     : '#FFFFFF',
            letterSpacing: '3px',
            animation : 'glowWhite3D 3s ease-in-out infinite',
          }}>
            UR
          </span>
        </div>

        {/* Sous-titre SYSTEM */}
        <div style={{
          fontFamily   : "'Orbitron', sans-serif",
          fontSize     : 'clamp(11px, 1.8vw, 16px)',
          color        : '#00FFEE',
          letterSpacing: '8px',
          fontWeight   : 700,
          textShadow   : '0 0 14px rgba(0,255,238,.5)',
          marginTop    : '4px',
        }}>
          S Y S T E M
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '11px',
        color: '#5B9BD5',
        letterSpacing: '3px',
        marginTop: '14px',
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
      }}>
        WORK OR WINDOW // GRIMPE LES 25 ÉTAGES
      </div>

      {/* CTA JOUER À W.O.W */}
      <button
        onClick={() => { playClick(); onPlay(); }}
        style={{
          marginTop: '36px',
          fontFamily: "'Lilita One', cursive",
          fontSize: '22px',
          letterSpacing: '6px',
          color: '#fff',
          background: 'linear-gradient(135deg, #0047AB, #007B8A)',
          border: '2px solid #5B9BD5',
          padding: '14px 48px',
          cursor: 'pointer',
          boxShadow: '0 0 18px rgba(0,71,171,.3)',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)';
          e.currentTarget.style.boxShadow = '0 0 32px rgba(0,71,171,.5)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)';
          e.currentTarget.style.boxShadow = '0 0 18px rgba(0,71,171,.3)';
        }}
      >
        <span style={{ position: 'relative', zIndex: 1, textShadow: '1px 2px 0 rgba(0,0,0,0.55)' }}>
          JOUER À <WowSpan />
        </span>
        <span style={{
          position: 'absolute', top: 0, left: '-100%', width: '50%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)',
          animation: 'shimmer 3s ease-in-out infinite',
        }} />
      </button>

      {/* Bouton Boutique — gros et visible */}
      <Link
        href="/shopping"
        onClick={playClick}
        style={{
          marginTop: '16px',
          fontFamily: "'Lilita One', cursive",
          fontSize: '18px',
          letterSpacing: '4px',
          color: '#A8D8FF',
          textDecoration: 'none',
          background: 'transparent',
          border: '2px solid #1E3F6E',
          padding: '12px 40px',
          position: 'relative',
          zIndex: 2,
          transition: 'all 0.2s ease',
          display: 'inline-block',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#5B9BD5';
          e.currentTarget.style.color = '#fff';
          e.currentTarget.style.background = 'rgba(0,71,171,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#1E3F6E';
          e.currentTarget.style.color = '#A8D8FF';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{ textShadow: '1px 2px 0 rgba(0,0,0,0.55)' }}>ALLER À LA BOUTIQUE</span>
      </Link>
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
  );
}
