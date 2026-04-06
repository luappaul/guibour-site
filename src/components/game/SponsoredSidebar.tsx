'use client';
import React, { useEffect, useState } from 'react';
import { GameAssets } from '@/lib/assetLoader';

interface Props {
  currentLevel: number;
  totalLevels: number;
  assets: GameAssets | null;
}

// Messages publicitaires satiriques rotatifs
const ADS = [
  {
    brand: 'OPEN SPACE™',
    tagline: 'Mangez. Travaillez. Mourez.',
    sub: 'L\'open space où vos rêves viennent expirer en paix.',
    cta: '→ EN SAVOIR MOINS',
    color: '#C8960A',
    badge: '🏢 PARTENAIRE OFFICIEL',
  },
  {
    brand: 'RÉUNION CORP.',
    tagline: 'Votre temps ne nous appartient pas.',
    sub: 'Réunion de 3h pour décider de la date de la prochaine réunion.',
    cta: '→ S\'INSCRIRE',
    color: '#FF4444',
    badge: '📅 RÉUNION DU LUNDI',
  },
  {
    brand: 'EXCEL™ PRO',
    tagline: 'Pour ceux qui aiment souffrir.',
    sub: '#REF! — #N/A — #VALUE! — #DIV/0! Nous avons tout pour vous.',
    cta: '→ ACHETER MAINTENANT',
    color: '#00C8BE',
    badge: '📊 FORMULE DU SIÈCLE',
  },
  {
    brand: 'CAFÉ MACHINE™',
    tagline: 'Le seul collègue fiable.',
    sub: 'Pause café : la seule réunion où vous venez volontiers.',
    cta: '→ +1 RTT CAFÉ',
    color: '#A0522D',
    badge: '☕ PARTENAIRE BURNOUT',
  },
  {
    brand: 'GUIBOUR.FR',
    tagline: 'Votre pub ici.',
    sub: 'Cet espace publicitaire est disponible. Quelques dossiers en échange.',
    cta: '→ contact@guibour.fr',
    color: '#5B9BD5',
    badge: '📢 ESPACE DISPONIBLE',
    isCtaLink: true,
    ctaHref: '/contact',
  },
  {
    brand: 'SYNDICAT W.O.W™',
    tagline: 'On ne se bat pas. On remplit des formulaires.',
    sub: 'Grève de 15 min. Formulaire CERFA/14000-1. En 6 exemplaires.',
    cta: '→ ADHÉRER',
    color: '#FF8C00',
    badge: '✊ RÉSISTANCE PAPIER',
  },
];

function SponsoredSidebar({ currentLevel, totalLevels, assets }: Props) {
  const [adIndex, setAdIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const towerImg = assets?.tower;

  // Rotate ads every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setAdIndex(i => (i + 1) % ADS.length);
        setFade(true);
      }, 300);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Show ad popup for 5s on each new level
  useEffect(() => {
    setShowAdPopup(true);
    const t = setTimeout(() => setShowAdPopup(false), 5000);
    return () => clearTimeout(t);
  }, [currentLevel]);

  const ad = ADS[adIndex];
  const progress = Math.round((currentLevel / totalLevels) * 100);

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: '18%',
        minWidth: '84px',
        maxWidth: '186px',
        height: '100%',
        background: '#0A1520',
        border: '2px solid #1A3E7A',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tower image background */}
      {towerImg && (
        <img
          src={towerImg.src}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '60%',
            objectFit: 'cover',
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ── PROGRESS TOWER (top 55%) ── */}
      <div style={{ position: 'relative', flex: 1, padding: '6px 4px', overflowY: 'hidden', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '9px',
          color: '#00C8BE',
          letterSpacing: '2px',
          textAlign: 'center',
          marginBottom: '6px',
          borderBottom: '1px solid #1A3E7A',
          paddingBottom: '4px',
        }}>
          PROGRESSION
        </div>

        {/* Progress bar */}
        <div style={{
          margin: '0 4px 8px',
          background: '#0C2A62',
          border: '1px solid #1A3E7A',
          height: '6px',
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #0047AB, #00C8BE)',
            boxShadow: '0 0 6px rgba(0,200,190,.4)',
            transition: 'width 0.5s ease',
            borderRadius: '3px',
          }} />
        </div>

        {/* Floor markers — compact */}
        <div style={{ display: 'flex', flexDirection: 'column-reverse', height: 'calc(100% - 48px)', justifyContent: 'space-between', padding: '0 2px' }}>
          {Array.from({ length: totalLevels }, (_, i) => {
            const isCompleted = i < currentLevel;
            const isCurrent = i === currentLevel;
            return (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                minHeight: '8px',
              }}>
                <div style={{
                  width: '88%',
                  padding: '0',
                  textAlign: 'center',
                  fontSize: '7px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: isCurrent ? 800 : 400,
                  color: isCurrent ? '#0A1520' : isCompleted ? '#fff' : '#3C5A7A',
                  background: isCurrent
                    ? '#00C9C8'
                    : isCompleted
                    ? 'rgba(0,168,157,0.35)'
                    : 'transparent',
                  boxShadow: isCurrent ? '0 0 8px rgba(0,200,190,.5)' : 'none',
                  borderRadius: '1px',
                  transition: 'all 0.3s ease',
                  lineHeight: '14px',
                }}>
                  {isCurrent ? `▶ ${String(i + 1).padStart(2, '0')}` : String(i + 1).padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AD POPUP OVERLAY ── */}
      {showAdPopup && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          background: 'linear-gradient(180deg, #0A1520 0%, #0C2A62 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 10px',
          gap: '8px',
          animation: 'adSlideIn 0.35s ease both',
        }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#5B9BD5', letterSpacing: '3px', textAlign: 'center' }}>
            PUB
          </div>
          <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '18px', color: ad.color, textAlign: 'center', lineHeight: 1.1 }}>
            {ad.brand}
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#E8F4FF', textAlign: 'center', lineHeight: 1.4 }}>
            {ad.tagline}
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#A8D8FF', textAlign: 'center', opacity: 0.75, lineHeight: 1.3 }}>
            {ad.sub}
          </div>
          <div style={{ marginTop: '4px', padding: '4px 10px', background: ad.color, borderRadius: '2px', fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#0A1520', letterSpacing: '1px', textAlign: 'center' }}>
            {ad.cta}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(SponsoredSidebar);
