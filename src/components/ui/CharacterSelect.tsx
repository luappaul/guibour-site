'use client';

import { useState } from 'react';

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

interface CharacterSelectProps {
  onSelect: (character: CharacterData) => void;
  onBack: () => void;
}

export default function CharacterSelect({ onSelect, onBack }: CharacterSelectProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: '#0A1628',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 20px 20px 68px',
      overflow: 'auto',
    }}>
      {/* Blue grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(0,72,171,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,72,171,.09) 1px, transparent 1px)',
        backgroundSize: '56px 34px',
        pointerEvents: 'none',
      }} />
      <div className="scanlines" style={{ position: 'absolute', inset: 0 }} />

      {/* Formula bar */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: '#0D2B5E',
        border: '1px solid #1B3A6B',
        padding: '5px 16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
      }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', color: '#00D4CC', fontWeight: 700 }}>fx</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '1px' }}>
          =SELECT(&quot;PERSONNAGE&quot;) → CHOOSE_YOUR_FIGHTER
        </span>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: 'clamp(22px, 4vw, 36px)',
          color: '#A8D8FF',
          letterSpacing: '5px',
          textShadow: '2px 2px 0 #0D2B5E',
        }}>
          SÉLECTION DU PERSONNEL
        </div>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '10px',
          color: '#5B9BD5',
          letterSpacing: '3px',
          marginTop: '4px',
        }}>
          DOSSIER RH // CHOISISSEZ VOTRE PROFIL
        </div>
      </div>

      {/* Character cards */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        gap: '14px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '800px',
        width: '100%',
      }}>
        {CHARACTERS.map(char => {
          const isSelected = selectedId === char.id && !char.locked;
          return (
            <div
              key={char.id}
              onClick={() => { if (!char.locked) { setSelectedId(char.id); onSelect(char); } }}
              style={{
                width: '160px',
                border: isSelected ? '2px solid #0047AB' : '2px solid #1B3A6B',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: isSelected ? '0 0 20px rgba(0,71,171,.3)' : 'none',
                cursor: char.locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: char.locked ? 0.45 : 1,
              }}
              onMouseEnter={e => {
                if (!char.locked && !isSelected) {
                  e.currentTarget.style.borderColor = '#2B5090';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(0,71,171,.15)';
                }
              }}
              onMouseLeave={e => {
                if (!char.locked && !isSelected) {
                  e.currentTarget.style.borderColor = '#1B3A6B';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Status bar */}
              <div style={{
                background: char.locked ? '#4A1010' : isSelected ? '#0047AB' : '#1B3A6B',
                padding: '4px',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '9px',
                textAlign: 'center',
                color: char.locked ? '#FF6B6B' : isSelected ? '#A8D8FF' : '#5B9BD5',
                letterSpacing: '2px',
                transition: 'background 0.2s ease',
              }}>
                {char.locked ? char.lockedLabel : isSelected ? '✓ SÉLECTIONNÉ' : 'DISPONIBLE'}
              </div>

              {/* Avatar */}
              <div style={{
                height: '110px',
                background: isSelected ? '#12274A' : '#0D1E38',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                transition: 'background 0.2s ease',
              }}>
                {char.emoji}
              </div>

              {/* Info */}
              <div style={{ background: '#0D1E38', padding: '12px' }}>
                <div style={{
                  fontFamily: "'Lilita One', cursive",
                  fontSize: '16px',
                  color: '#A8D8FF',
                  letterSpacing: '2px',
                }}>
                  {char.name}
                </div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '8px',
                  color: char.locked ? '#FF6B6B' : '#00D4CC',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}>
                  {char.title}
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '1px',
                  background: '#1B3A6B',
                  border: '1px solid #1B3A6B',
                }}>
                  {char.stats.map(stat => (
                    <div key={stat.label} style={{
                      background: '#0A1628',
                      padding: '4px 0',
                      textAlign: 'center',
                      flex: 1,
                    }}>
                      <div style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '7px',
                        color: '#3C5A7A',
                      }}>{stat.label}</div>
                      <div style={{
                        fontFamily: "'Luckiest Guy', cursive",
                        fontSize: '13px',
                        color: isSelected ? '#00D4CC' : '#5B9BD5',
                        transition: 'color 0.2s ease',
                      }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions — confirm removed: clicking card starts immediately */}
      <div style={{ position: 'relative', zIndex: 2, marginTop: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#3C5A7A', letterSpacing: '3px' }}>
          CLIQUEZ SUR UN PERSONNAGE POUR COMMENCER
        </div>
        <button
          onClick={onBack}
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            letterSpacing: '3px',
            color: '#3C5A7A',
            background: 'transparent',
            border: '1px solid #1B3A6B',
            padding: '8px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#A8D8FF'; e.currentTarget.style.borderColor = '#2B5090'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3C5A7A'; e.currentTarget.style.borderColor = '#1B3A6B'; }}
        >
          ← RETOUR
        </button>
      </div>
    </div>
  );
}
