'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CharacterSelect, { CharacterData } from '@/components/ui/CharacterSelect';
import LogoSphere from '@/components/ui/LogoSphere';

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

import Link from 'next/link';

function WowSpan() {
  return (
    <span style={{
      color: '#00C8BE',
      textShadow: '0 0 10px rgba(0,200,190,.55)',
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

      {/* Logo centré — globe derrière GUIBOUR SYSTEM */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px',
        zIndex: 2,
      }}>
        {/* Sphère 3D style logo années 90 — centrée derrière le texte */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.78,
          animation: 'float 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}>
          <LogoSphere size={270} />
        </div>

        {/* Texte en avant-plan */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: 'clamp(48px, 9vw, 82px)',
            color: '#FFFFFF',
            letterSpacing: '5px',
            lineHeight: 1,
            animation: 'glowWhite3D 3s ease-in-out infinite',
          }}>
            GUIBOUR
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(13px, 2.2vw, 22px)',
            color: '#00D4CC',
            letterSpacing: '10px',
            fontWeight: 400,
            textShadow: '0 0 12px rgba(0,212,204,.45)',
            marginTop: '-8px',
          }}>
            SYSTEM
          </div>
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
        onClick={onPlay}
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
        <span style={{ position: 'relative', zIndex: 1 }}>
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
        ALLER À LA BOUTIQUE
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
        style={{ background: '#1A3F78', height: '100dvh', paddingLeft: '48px' }}
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
    <div className="min-h-screen" style={{ background: '#1A3F78' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=LAUNCH_GAME("GUIBOUR","SINGLE_2026") → WELCOME_TO_THE_SYSTEM'>
        <HeroContent onPlay={handlePlay} />
      </ExcelChrome>
    </div>
  );
}
