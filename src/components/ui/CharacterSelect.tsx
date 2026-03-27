'use client';

import { useState } from 'react';

export interface CharacterData {
  id: string;
  name: string;
  title: string;
  description: string;
  stats: { label: string; value: number; max: number }[];
  accentColor: string;
  bgColor: string;
}

const CHARACTERS: CharacterData[] = [
  {
    id: 'guibour',
    name: 'GUIBOUR',
    title: 'LE STAGIAIRE',
    description: 'Survit aux réunions inutiles grâce à sa naïveté légendaire. Équilibré dans tous les domaines.',
    stats: [
      { label: 'VITESSE',  value: 3, max: 5 },
      { label: 'RTT',      value: 3, max: 5 },
      { label: 'AGILITÉ',  value: 3, max: 5 },
    ],
    accentColor: '#00A89D',
    bgColor: 'rgba(0,71,171,0.15)',
  },
  {
    id: 'adeline',
    name: 'ADELINE',
    title: 'LA COMPTABLE',
    description: 'Maîtrise les tableurs à la perfection. Résistante mais peu agile — elle préfère rester à son bureau.',
    stats: [
      { label: 'VITESSE',  value: 2, max: 5 },
      { label: 'RTT',      value: 5, max: 5 },
      { label: 'AGILITÉ',  value: 2, max: 5 },
    ],
    accentColor: '#FFD700',
    bgColor: 'rgba(180,130,0,0.12)',
  },
  {
    id: 'marc',
    name: 'MARC',
    title: 'LE COMMERCIAL',
    description: 'Toujours en déplacement, jamais au bureau. Fulgurant mais fragile — une signature de trop et c\'est le burnout.',
    stats: [
      { label: 'VITESSE',  value: 5, max: 5 },
      { label: 'RTT',      value: 2, max: 5 },
      { label: 'AGILITÉ',  value: 5, max: 5 },
    ],
    accentColor: '#FF6B35',
    bgColor: 'rgba(200,60,0,0.12)',
  },
];

interface CharacterSelectProps {
  onSelect: (character: CharacterData) => void;
  onBack: () => void;
}

export default function CharacterSelect({ onSelect, onBack }: CharacterSelectProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleConfirm = () => {
    const char = CHARACTERS.find(c => c.id === selectedId);
    if (char) onSelect(char);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: '#0A1520',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,71,171,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,71,171,0.05) 1px, transparent 1px)',
        backgroundSize: '56px 34px',
        pointerEvents: 'none',
      }} />

      {/* Scanlines */}
      <div className="scanlines" style={{ position: 'absolute', inset: 0 }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '32px' }}>
        {/* Excel formula bar */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: '#EBF0F5',
          border: '1px solid #C0D0DE',
          padding: '4px 16px',
          marginBottom: '24px',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#0047AB', fontStyle: 'italic', fontWeight: 700 }}>fx</span>
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '11px', color: '#607888', letterSpacing: '1px' }}>
            =SELECT_EMPLOYEE(DEPARTEMENT, POSTE)
          </span>
        </div>

        <h1 style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(20px, 4vw, 32px)',
          fontWeight: 900,
          color: '#fff',
          letterSpacing: '6px',
          textShadow: '0 0 20px rgba(0,168,157,0.4)',
          display: 'block',
        }}>
          CHOISISSEZ VOTRE EMPLOYÉ
        </h1>
        <p style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#607888',
          letterSpacing: '3px',
          marginTop: '8px',
        }}>
          GUIBOUR CORP. — DÉPARTEMENT R.H. // FORMULAIRE D&apos;EMBAUCHE
        </p>
      </div>

      {/* Character cards */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        maxWidth: '960px',
        width: '100%',
      }}>
        {CHARACTERS.map(char => {
          const isHovered = hoveredId === char.id;
          const isSelected = selectedId === char.id;
          return (
            <div
              key={char.id}
              onClick={() => setSelectedId(char.id)}
              onMouseEnter={() => setHoveredId(char.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                flex: '1 1 260px',
                maxWidth: '300px',
                border: isSelected
                  ? `2px solid ${char.accentColor}`
                  : isHovered
                    ? '2px solid rgba(0,168,157,0.5)'
                    : '2px solid rgba(0,71,171,0.3)',
                background: isSelected
                  ? char.bgColor
                  : isHovered
                    ? 'rgba(0,71,171,0.08)'
                    : 'rgba(0,71,171,0.04)',
                padding: '0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected
                  ? `0 0 24px ${char.accentColor}40`
                  : isHovered
                    ? '0 0 16px rgba(0,168,157,0.2)'
                    : 'none',
                overflow: 'hidden',
              }}
            >
              {/* Card header bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                background: isSelected ? char.accentColor : 'rgba(0,71,171,0.3)',
                transition: 'background 0.2s ease',
              }}>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '10px',
                  color: isSelected ? '#0A1520' : '#607888',
                  letterSpacing: '2px',
                }}>
                  FICHE EMPLOYÉ
                </span>
                {isSelected && (
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '10px',
                    color: '#0A1520',
                    fontWeight: 700,
                    letterSpacing: '1px',
                  }}>
                    ✓ SÉLECTIONNÉ
                  </span>
                )}
              </div>

              {/* Avatar area */}
              <div style={{
                height: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(10,21,32,0.5)',
                borderBottom: '1px solid rgba(0,71,171,0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Character silhouette / icon */}
                <div style={{
                  fontSize: '72px',
                  opacity: isSelected ? 1 : 0.6,
                  transition: 'opacity 0.2s ease',
                  filter: isSelected ? `drop-shadow(0 0 12px ${char.accentColor})` : 'none',
                }}>
                  {char.id === 'guibour' ? '🧑‍💼' : char.id === 'adeline' ? '👩‍💻' : '🤵'}
                </div>
                {/* ID badge */}
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  background: 'rgba(0,71,171,0.6)',
                  border: `1px solid ${char.accentColor}`,
                  padding: '2px 8px',
                }}>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '8px',
                    color: char.accentColor,
                    letterSpacing: '1px',
                  }}>ID: GS-{char.id === 'guibour' ? '4891' : char.id === 'adeline' ? '2241' : '7734'}</span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '18px',
                    fontWeight: 800,
                    color: isSelected ? char.accentColor : '#fff',
                    letterSpacing: '2px',
                    transition: 'color 0.2s ease',
                  }}>{char.name}</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: '9px',
                    color: char.accentColor,
                    letterSpacing: '3px',
                  }}>{char.title}</span>
                </div>
                <p style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '10px',
                  color: '#607888',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  minHeight: '48px',
                }}>
                  {char.description}
                </p>

                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {char.stats.map(stat => (
                    <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '8px',
                        color: '#607888',
                        letterSpacing: '1px',
                        width: '56px',
                        flexShrink: 0,
                      }}>{stat.label}</span>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        background: 'rgba(0,71,171,0.2)',
                        border: '1px solid rgba(0,71,171,0.3)',
                      }}>
                        <div style={{
                          width: `${(stat.value / stat.max) * 100}%`,
                          height: '100%',
                          background: isSelected
                            ? `linear-gradient(90deg, ${char.accentColor}CC, ${char.accentColor})`
                            : 'linear-gradient(90deg, #0047AB, #00A89D)',
                          transition: 'all 0.3s ease',
                          boxShadow: isSelected ? `0 0 6px ${char.accentColor}80` : 'none',
                        }} />
                      </div>
                      <span style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: '9px',
                        color: isSelected ? char.accentColor : '#607888',
                        width: '12px',
                        textAlign: 'right',
                        transition: 'color 0.2s ease',
                      }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        gap: '16px',
        marginTop: '36px',
        alignItems: 'center',
      }}>
        <button
          onClick={onBack}
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '12px',
            letterSpacing: '3px',
            color: '#607888',
            background: 'transparent',
            border: '1px solid rgba(96,120,136,0.4)',
            padding: '12px 28px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#607888';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#607888';
            e.currentTarget.style.borderColor = 'rgba(96,120,136,0.4)';
          }}
        >
          ← RETOUR
        </button>

        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '6px',
            color: selectedId ? '#fff' : '#334',
            background: selectedId ? '#0047AB' : 'rgba(0,71,171,0.1)',
            border: `2px solid ${selectedId ? '#00A89D' : 'rgba(0,71,171,0.2)'}`,
            padding: '16px 52px',
            cursor: selectedId ? 'pointer' : 'not-allowed',
            boxShadow: selectedId ? '0 0 30px rgba(0,71,171,0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            if (selectedId) {
              e.currentTarget.style.background = '#1A6ED8';
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0,71,171,0.5)';
            }
          }}
          onMouseLeave={e => {
            if (selectedId) {
              e.currentTarget.style.background = '#0047AB';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,71,171,0.3)';
            }
          }}
        >
          COMMENCER
        </button>
      </div>
    </div>
  );
}
