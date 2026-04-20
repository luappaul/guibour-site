'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import LoadingScreen from '@/components/ui/LoadingScreen';
import CinematicIntro from '@/components/ui/CinematicIntro';
import BadgeScanner from '@/components/ui/BadgeScanner';
import CharacterSelect, { CharacterData, PlayerIdentity } from '@/components/ui/CharacterSelect';
import { DayNightTheme } from '@/hooks/useDayNight';
import { useTheme } from '@/contexts/ThemeContext';
import { playClick } from '@/lib/sounds';
import Typewriter from '@/components/ui/Typewriter';
// Testimonials component available at @/components/ui/Testimonials if needed elsewhere

const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <div className="flex-1" />,
});

import Countdown from '@/components/ui/Countdown';
import GlobeO from '@/components/ui/GlobeO';

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) return;
    const duration = 1500;
    const start = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <div style={{
      fontFamily: "'Orbitron', sans-serif",
      fontSize: '10px',
      color: '#5B9BD5',
      letterSpacing: '3px',
      opacity: 0.7,
      marginTop: '24px',
      textAlign: 'center',
      zIndex: 2,
      position: 'relative',
    }}>
      🏢 {count.toLocaleString('fr-FR')} EMPLOYÉS ONT JOUÉ
    </div>
  );
}

function HeroContent({ onPlay, theme }: { onPlay: () => void; theme: DayNightTheme }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const systemRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useRef(false);
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const QUOTES = [
    { text: "J'ai perdu 3h de ma vie sur ce jeu.", author: "Jean-Michel D.", role: "Directeur des Synergies" },
    { text: "J'ai battu le record du bureau. Personne ne m'a félicitée.", author: "Nathalie K.", role: "Cheffe de Projet" },
    { text: "Mon boss m'a surprise en train de jouer. Il est toujours dessus.", author: "Isabelle M.", role: "Assistante de Direction" },
    { text: "La réunion de 14h a été annulée grâce à ce jeu.", author: "François T.", role: "Consultant Senior" },
  ];

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  useEffect(() => {
    fetch('/api/players')
      .then(r => r.json())
      .then(d => { if (typeof d.count === 'number') setPlayerCount(d.count); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTestimonialIdx(i => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(id);
  }, [QUOTES.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    if (logoRef.current) logoRef.current.style.transform = `translate3d(${-dx * 15}px, ${-dy * 15}px, 0)`;
    if (systemRef.current) systemRef.current.style.transform = `translate3d(${-dx * 8}px, ${-dy * 8}px, 0)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (logoRef.current) logoRef.current.style.transform = 'translate3d(0,0,0)';
    if (systemRef.current) systemRef.current.style.transform = 'translate3d(0,0,0)';
  }, []);

  const q = QUOTES[testimonialIdx];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '0 20px',
        position: 'relative',
      }}
    >

      {/* ── LOGO GUIBOUR SYSTEM with globe behind ── */}
      <h1
        ref={logoRef}
        aria-label="GUIBOUR SYSTEM"
        style={{
          textAlign: 'center', position: 'relative', zIndex: 2, margin: 0,
          transition: 'transform 0.15s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Globe in background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: -1,
          opacity: 0.35,
          pointerEvents: 'none',
        }}>
          <GlobeO size={280} />
        </div>

        <div style={{
          fontSize: 'clamp(60px, 12vw, 110px)',
          lineHeight: 1,
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: "'Anton', sans-serif",
            color: '#FFFFFF',
            letterSpacing: '-2px',
            WebkitTextStroke: '4px rgba(255,255,255,.85)',
            paintOrder: 'stroke fill',
            textShadow: '2px 3px 0 rgba(0,0,0,.9), 4px 6px 0 rgba(0,0,0,.8), 6px 9px 0 rgba(0,0,0,.7), 8px 12px 0 rgba(0,0,0,.6), 10px 15px 4px rgba(0,0,0,.5), -5px 1px 8px rgba(0,0,0,.6)',
          }}>GUIBOUR</span>
        </div>

        <div
          ref={systemRef}
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(12px, 2vw, 18px)',
            color: '#00FFEE',
            letterSpacing: '10px',
            fontWeight: 700,
            textShadow: theme.neonTextShadow,
            marginTop: '6px',
            transition: 'transform 0.15s ease-out, text-shadow 2s ease',
            willChange: 'transform',
          }}
        >
          S Y S T E M
        </div>
      </h1>

      {/* ── TAGLINE ── */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '11px',
        color: '#2B5090',
        letterSpacing: '4px',
        marginTop: '20px',
        position: 'relative',
        zIndex: 2,
      }}>
        <Typewriter text="WORK OR WINDOW" speed={60} delay={800} />
      </div>

      {/* ── CTA JOUER ── */}
      <button
        onClick={() => { playClick(); onPlay(); }}
        style={{
          marginTop: '40px',
          fontFamily: "'Lilita One', cursive",
          fontSize: 'clamp(20px, 4vw, 28px)',
          letterSpacing: '8px',
          color: '#fff',
          background: '#0047AB',
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
      </button>

      {/* ── COMPTEUR JOUEURS ── */}
      {playerCount !== null && playerCount > 0 && <AnimatedCounter target={playerCount} />}

      {/* ── NOTICE "BIENVENUE DANS LE SYSTEM" ── */}
      <div style={{
        marginTop: '40px',
        maxWidth: '480px',
        width: '100%',
        padding: '20px 24px',
        background: 'rgba(0,0,0,.25)',
        border: '1px solid rgba(0,200,190,.15)',
        borderRadius: '4px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          color: '#00C8BE',
          letterSpacing: '3px',
          marginBottom: '16px',
          textShadow: '0 0 8px rgba(0,200,190,.4)',
        }}>
          BIENVENUE DANS LE SYSTEM
        </div>
        {[
          'Survivez aux 25 étages de l\'open space',
          'Esquivez les dossiers volants',
          'Grimpez dans le classement mondial',
          'Gagnez votre liberté',
        ].map((line, i) => (
          <div key={i} style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            color: '#5B9BD5',
            lineHeight: 2,
            paddingLeft: '16px',
          }}>
            <span style={{ color: '#00C8BE', marginRight: '8px' }}>&gt;</span>
            {line}
          </div>
        ))}

        {/* Liens secondaires */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(0,200,190,.08)',
        }}>
          {[
            { label: 'ÉCOUTER', href: '/jukebox' },
            { label: 'CLASSEMENT', href: '/resultats' },
            { label: 'BOUTIQUE', href: '/shopping' },
          ].map(link => (
            <a key={link.href} href={link.href} style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '11px',
              color: '#2B5090',
              letterSpacing: '2px',
              textDecoration: 'none',
              padding: '8px 16px',
              border: '1px solid rgba(0,200,190,.1)',
              borderRadius: '4px',
              transition: 'all .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C8BE'; e.currentTarget.style.color = '#00C8BE'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,200,190,.1)'; e.currentTarget.style.color = '#2B5090'; }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIAL UNIQUE (petit, discret, rotatif) ── */}
      <div style={{
        marginTop: '32px',
        maxWidth: '400px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        minHeight: '48px',
      }}>
        <div key={testimonialIdx} style={{
          animation: 'fadeIn 0.5s ease-out',
        }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            color: '#5B9BD5',
            fontStyle: 'italic',
            lineHeight: 1.6,
            opacity: 0.7,
          }}>
            &laquo; {q.text} &raquo;
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            color: '#2B5090',
            marginTop: '4px',
          }}>
            — {q.author}, {q.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [showBadgeScanner, setShowBadgeScanner] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterData | null>(null);
  const [playerIdentity, setPlayerIdentity] = useState<PlayerIdentity | null>(null);
  const { mode: timeMode, theme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768 || navigator.maxTouchPoints > 0;
      const badgeScanned = sessionStorage.getItem('guibour-badge-scanned');
      const introSeen = sessionStorage.getItem('guibour-intro-seen');
      const alreadyLoaded = sessionStorage.getItem('guibour-loaded');

      if (isMobile && !badgeScanned) {
        setShowBadgeScanner(true);
      } else if (!introSeen) {
        setShowIntro(true);
      } else if (alreadyLoaded) {
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

  const handleBadgeScannerComplete = useCallback(() => {
    setShowBadgeScanner(false);
    const introSeen = sessionStorage.getItem('guibour-intro-seen');
    if (!introSeen) {
      setShowIntro(true);
    } else {
      const alreadyLoaded = sessionStorage.getItem('guibour-loaded');
      if (alreadyLoaded) {
        setLoadingDone(true);
      } else {
        setShowLoading(true);
      }
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    const alreadyLoaded = sessionStorage.getItem('guibour-loaded');
    if (alreadyLoaded) {
      setLoadingDone(true);
    } else {
      setShowLoading(true);
    }
  }, []);

  if (showBadgeScanner) {
    return <BadgeScanner onComplete={handleBadgeScannerComplete} />;
  }

  if (showIntro) {
    return <CinematicIntro onComplete={handleIntroComplete} />;
  }

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
      <ExcelChrome
        formulaText='=LAUNCH_GAME("GUIBOUR","SINGLE_2026") → WELCOME_TO_THE_SYSTEM'
        gridColor={theme.gridColor}
        gridOpacity={theme.gridOpacity}
        chromeBg={theme.chromeBg}
      >
        <HeroContent onPlay={handlePlay} theme={theme} />
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
