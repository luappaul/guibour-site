'use client';

import { useState, useCallback } from 'react';

export interface CharacterData {
  id: string;
  name: string;
  title: string;
  emoji: string;
  stats: { label: string; value: number }[];
  locked?: boolean;
  lockedLabel?: string;
}

const CHARACTERS: CharacterData[] = [
  {
    id: 'guibour',
    name: 'GUIBOUR',
    title: 'EMPLOYÉ MODÈLE',
    emoji: '🧑‍💼',
    stats: [
      { label: 'VIT', value: 3 },
      { label: 'TIR', value: 3 },
      { label: 'LUCK', value: 3 },
    ],
  },
  {
    id: 'nath',
    name: 'NATH',
    title: 'SECRÉTAIRE',
    emoji: '👩‍💼',
    stats: [
      { label: 'VIT', value: 4 },
      { label: 'TIR', value: 2 },
      { label: 'LUCK', value: 4 },
    ],
  },
  {
    id: 'tim',
    name: 'TIM',
    title: 'STAGIAIRE',
    emoji: '🧑‍🎓',
    stats: [
      { label: 'VIT', value: 5 },
      { label: 'TIR', value: 1 },
      { label: 'LUCK', value: 5 },
    ],
  },
  {
    id: 'bigboss',
    name: 'BIG BOSS',
    title: 'DIRECTEUR',
    emoji: '👔',
    locked: true,
    lockedLabel: '🔒 ÉTAGE 15+',
    stats: [
      { label: 'VIT', value: 2 },
      { label: 'TIR', value: 5 },
      { label: 'LUCK', value: 2 },
    ],
  },
];

const N = CHARACTERS.length; // 4

// Position relative to activeIndex: 0=front 1=right 2=back 3=left
type RelPos = 0 | 1 | 2 | 3;

function getRelPos(cardIndex: number, active: number): RelPos {
  return (((cardIndex - active) % N + N) % N) as RelPos;
}

// Visual style per position (coverflow effect)
function cardStyle(pos: RelPos): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease, filter 0.5s ease',
    transformOrigin: 'center center',
  };
  if (pos === 0) return { ...base, transform: 'translateX(0) scale(1.08) translateZ(0)', opacity: 1, filter: 'none', zIndex: 10, cursor: 'default' };
  if (pos === 1) return { ...base, transform: 'translateX(70%) scale(0.78) rotateY(-28deg)', opacity: 0.62, filter: 'brightness(0.65)', zIndex: 5, cursor: 'pointer' };
  if (pos === 3) return { ...base, transform: 'translateX(-70%) scale(0.78) rotateY(28deg)', opacity: 0.62, filter: 'brightness(0.65)', zIndex: 5, cursor: 'pointer' };
  // pos === 2 (back) — hidden
  return { ...base, transform: 'translateX(0) scale(0.5)', opacity: 0, zIndex: 0, pointerEvents: 'none' };
}

function StatBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: '14px', height: '6px',
          background: i < value ? '#00C8BE' : '#1B3A6B',
          borderRadius: '1px',
          boxShadow: i < value ? '0 0 4px rgba(0,200,190,.5)' : 'none',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

interface CharacterSelectProps {
  onSelect: (character: CharacterData) => void;
  onBack: () => void;
}

export default function CharacterSelect({ onSelect, onBack }: CharacterSelectProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const spin = useCallback((dir: 1 | -1) => {
    if (spinning) return;
    setSpinning(true);
    setActiveIndex(i => ((i + dir + N) % N));
    setTimeout(() => setSpinning(false), 520);
  }, [spinning]);

  const handleCardClick = useCallback((cardIndex: number) => {
    const pos = getRelPos(cardIndex, activeIndex);
    if (pos === 0) {
      const char = CHARACTERS[cardIndex];
      if (!char.locked) onSelect(char);
    } else if (pos === 1) {
      spin(1);
    } else if (pos === 3) {
      spin(-1);
    }
  }, [activeIndex, spin, onSelect]);

  const active = CHARACTERS[activeIndex];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'linear-gradient(160deg, #162840 0%, #0F1E32 60%, #1A2F48 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 20px 20px 68px',
      overflow: 'hidden',
    }}>

      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,72,171,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,72,171,.07) 1px,transparent 1px)',
        backgroundSize: '56px 34px',
      }} />

      {/* Ambient glow center */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(0,71,171,.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Formula bar */}
      <div style={{
        position: 'relative', zIndex: 2,
        background: '#0D2B5E',
        border: '1px solid #1B3A6B',
        padding: '5px 18px',
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        marginBottom: '22px',
      }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', color: '#00D4CC', fontWeight: 700 }}>fx</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '1px' }}>
          =SELECT(&quot;PERSONNAGE&quot;) → CHOOSE_YOUR_FIGHTER
        </span>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 'clamp(20px,3.5vw,32px)', color: '#A8D8FF', letterSpacing: '5px', textShadow: '2px 2px 0 #0D2B5E' }}>
          SÉLECTION DU PERSONNEL
        </div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5', letterSpacing: '3px', marginTop: '5px' }}>
          DOSSIER RH // CHOISISSEZ VOTRE PROFIL
        </div>
      </div>

      {/* ── 3D CAROUSEL ── */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>

        {/* Left arrow */}
        <button
          onClick={() => spin(-1)}
          style={{
            width: '48px', height: '48px', flexShrink: 0,
            background: 'rgba(0,71,171,.18)',
            border: '2px solid #1B3A6B',
            color: '#5B9BD5', fontSize: '22px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s',
            borderRadius: '4px',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C8BE'; e.currentTarget.style.color = '#00C8BE'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1B3A6B'; e.currentTarget.style.color = '#5B9BD5'; }}
        >‹</button>

        {/* Carousel viewport */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '300px',
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}>
          {CHARACTERS.map((char, i) => {
            const pos = getRelPos(i, activeIndex);
            const isFront = pos === 0;
            return (
              <div
                key={char.id}
                onClick={() => handleCardClick(i)}
                style={cardStyle(pos)}
              >
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: isFront
                    ? 'linear-gradient(180deg, #1A3560 0%, #0D2040 100%)'
                    : 'linear-gradient(180deg, #152644 0%, #0A1828 100%)',
                  border: `2px solid ${isFront ? '#00C8BE' : '#1B3A6B'}`,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: isFront
                    ? '0 0 32px rgba(0,200,190,.25), 0 16px 40px rgba(0,0,0,.5)'
                    : '0 8px 20px rgba(0,0,0,.3)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  {/* Status strip */}
                  <div style={{
                    background: char.locked ? '#3A0A0A' : isFront ? '#00C8BE' : '#1B3A6B',
                    padding: '5px',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '8px',
                    textAlign: 'center',
                    color: char.locked ? '#FF6B6B' : isFront ? '#0D2B5E' : '#5B9BD5',
                    letterSpacing: '2px',
                    fontWeight: isFront ? 700 : 400,
                  }}>
                    {char.locked ? char.lockedLabel : isFront ? '▶ SÉLECTIONNER' : 'DISPONIBLE'}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isFront ? '60px' : '50px',
                    background: isFront
                      ? 'radial-gradient(ellipse at 50% 60%, rgba(0,200,190,.1), transparent 70%)'
                      : 'transparent',
                    opacity: char.locked ? 0.35 : 1,
                    transition: 'font-size .3s',
                  }}>
                    {char.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,.2)' }}>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '15px', color: isFront ? '#FFFFFF' : '#A8D8FF', letterSpacing: '2px', marginBottom: '1px' }}>
                      {char.name}
                    </div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: char.locked ? '#FF6B6B' : '#00D4CC', letterSpacing: '1px', marginBottom: '8px' }}>
                      {char.title}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {char.stats.map(stat => (
                        <div key={stat.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#5B9BD5', letterSpacing: '2px', width: '30px' }}>{stat.label}</span>
                          <StatBar value={stat.value} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => spin(1)}
          style={{
            width: '48px', height: '48px', flexShrink: 0,
            background: 'rgba(0,71,171,.18)',
            border: '2px solid #1B3A6B',
            color: '#5B9BD5', fontSize: '22px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s',
            borderRadius: '4px',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C8BE'; e.currentTarget.style.color = '#00C8BE'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1B3A6B'; e.currentTarget.style.color = '#5B9BD5'; }}
        >›</button>
      </div>

      {/* Dot indicators */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '8px', marginBottom: '28px' }}>
        {CHARACTERS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const diff = ((i - activeIndex) % N + N) % N;
              if (diff === 1 || diff === N - 1) {
                setActiveIndex(i);
              } else if (diff !== 0) {
                setActiveIndex(i);
              }
            }}
            style={{
              width: i === activeIndex ? '24px' : '8px',
              height: '8px',
              background: i === activeIndex ? '#00C8BE' : '#1B3A6B',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: 0,
              transition: 'all .3s ease',
              boxShadow: i === activeIndex ? '0 0 8px rgba(0,200,190,.6)' : 'none',
            }}
          />
        ))}
      </div>

      {/* Active character name + CTA */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '20px' }}>
        {active.locked ? (
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#FF6B6B', letterSpacing: '3px' }}>
            DÉBLOQUÉ À L&apos;ÉTAGE 15
          </div>
        ) : (
          <button
            onClick={() => onSelect(active)}
            style={{
              fontFamily: "'Lilita One', cursive",
              fontSize: '18px', letterSpacing: '4px', color: '#fff',
              background: 'linear-gradient(135deg,#0047AB,#007B8A)',
              border: '2px solid #00C8BE',
              padding: '13px 48px', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0,200,190,.3)',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(0,200,190,.55)'; e.currentTarget.style.background = 'linear-gradient(135deg,#1B5EBB,#008B9A)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(0,200,190,.3)'; e.currentTarget.style.background = 'linear-gradient(135deg,#0047AB,#007B8A)'; }}
          >
            JOUER EN TANT QUE {active.name} →
          </button>
        )}
      </div>

      {/* Retour */}
      <button
        onClick={onBack}
        style={{
          position: 'relative', zIndex: 2,
          fontFamily: "'Orbitron', sans-serif", fontSize: '9px',
          letterSpacing: '3px', color: '#3C5A7A',
          background: 'transparent', border: '1px solid #1B3A6B',
          padding: '7px 18px', cursor: 'pointer', transition: 'all .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#A8D8FF'; e.currentTarget.style.borderColor = '#2B5090'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#3C5A7A'; e.currentTarget.style.borderColor = '#1B3A6B'; }}
      >← RETOUR</button>

    </div>
  );
}
