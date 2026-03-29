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

  const handleConfirm = () => {
    const char = CHARACTERS.find(c => c.id === selectedId && !c.locked);
    if (char) onSelect(char);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: '#080F08',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 20px 20px 68px', // leave room for sidebar
      overflow: 'auto',
    }}>
      {/* Green grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(44,95,46,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(44,95,46,.08) 1px, transparent 1px)',
        backgroundSize: '56px 34px',
        pointerEvents: 'none',
      }} />
      <div className="scanlines" style={{ position: 'absolute', inset: 0 }} />

      {/* Formula bar */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: '#060E00',
        border: '1px solid #1B4332',
        padding: '5px 16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
      }}>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '12px', color: '#5CDB5C', fontWeight: 700 }}>fx</span>
        <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: '#4CAF50', letterSpacing: '1px' }}>
          =SELECT(&quot;PERSONNAGE&quot;) → CHOOSE_YOUR_FIGHTER
        </span>
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          fontFamily: "'Bangers', cursive",
          fontSize: 'clamp(22px, 4vw, 36px)',
          color: '#5CDB5C',
          letterSpacing: '5px',
          textShadow: '2px 2px 0 #1B4332',
        }}>
          SÉLECTION DU PERSONNEL
        </div>
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          color: '#4CAF50',
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
              onClick={() => !char.locked && setSelectedId(char.id)}
              style={{
                width: '160px',
                border: isSelected ? '2px solid #5CDB5C' : '2px solid #1B4332',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: isSelected ? '0 0 20px rgba(92,219,92,.25)' : 'none',
                cursor: char.locked ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: char.locked ? 0.45 : 1,
              }}
              onMouseEnter={e => {
                if (!char.locked && !isSelected) {
                  e.currentTarget.style.borderColor = '#2C5F2E';
                  e.currentTarget.style.boxShadow = '0 0 12px rgba(92,219,92,.1)';
                }
              }}
              onMouseLeave={e => {
                if (!char.locked && !isSelected) {
                  e.currentTarget.style.borderColor = '#1B4332';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Status bar */}
              <div style={{
                background: char.locked ? '#7B241C' : isSelected ? '#2C5F2E' : '#1B4332',
                padding: '4px',
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: '9px',
                textAlign: 'center',
                color: char.locked ? '#FF4444' : isSelected ? '#5CDB5C' : '#4CAF50',
                letterSpacing: '2px',
                transition: 'background 0.2s ease',
              }}>
                {char.locked ? char.lockedLabel : isSelected ? '✓ SÉLECTIONNÉ' : 'DISPONIBLE'}
              </div>

              {/* Avatar */}
              <div style={{
                height: '110px',
                background: isSelected ? '#1B4332' : '#0D2B0D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                transition: 'background 0.2s ease',
              }}>
                {char.emoji}
              </div>

              {/* Info */}
              <div style={{ background: '#0D2B0D', padding: '12px' }}>
                <div style={{
                  fontFamily: "'Bangers', cursive",
                  fontSize: '16px',
                  color: '#5CDB5C',
                  letterSpacing: '2px',
                }}>
                  {char.name}
                </div>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '8px',
                  color: char.locked ? '#FF4444' : '#FFE033',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}>
                  {char.title}
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '1px',
                  background: '#1B4332',
                  border: '1px solid #1B4332',
                }}>
                  {char.stats.map(stat => (
                    <div key={stat.label} style={{
                      background: '#0A1400',
                      padding: '4px 0',
                      textAlign: 'center',
                      flex: 1,
                    }}>
                      <div style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '7px',
                        color: '#4CAF50',
                      }}>{stat.label}</div>
                      <div style={{
                        fontFamily: "'Luckiest Guy', cursive",
                        fontSize: '13px',
                        color: isSelected ? '#FFE033' : '#5CDB5C',
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

      {/* Actions */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        gap: '14px',
        marginTop: '32px',
        alignItems: 'center',
      }}>
        <button
          onClick={onBack}
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '11px',
            letterSpacing: '3px',
            color: '#2C5F2E',
            background: 'transparent',
            border: '1px solid #1B4332',
            padding: '10px 24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#5CDB5C';
            e.currentTarget.style.borderColor = '#2C5F2E';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#2C5F2E';
            e.currentTarget.style.borderColor = '#1B4332';
          }}
        >
          ← RETOUR
        </button>

        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          style={{
            fontFamily: "'Bangers', cursive",
            fontSize: '18px',
            letterSpacing: '5px',
            color: selectedId ? '#5CDB5C' : '#1B4332',
            background: selectedId ? '#1B4332' : 'rgba(27,67,50,0.2)',
            border: `2px solid ${selectedId ? '#5CDB5C' : '#1B4332'}`,
            padding: '12px 44px',
            cursor: selectedId ? 'pointer' : 'not-allowed',
            boxShadow: selectedId ? '0 0 16px rgba(92,219,92,.2)' : 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            if (selectedId) {
              e.currentTarget.style.background = '#2C5F2E';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(92,219,92,.35)';
            }
          }}
          onMouseLeave={e => {
            if (selectedId) {
              e.currentTarget.style.background = '#1B4332';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(92,219,92,.2)';
            }
          }}
        >
          CONFIRMER L&apos;EMBAUCHE →
        </button>
      </div>
    </div>
  );
}
