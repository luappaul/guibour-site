'use client';

import { useState, useCallback, useEffect } from 'react';
import { playClick } from '@/lib/sounds';

export interface CharacterData {
  id: string;
  name: string;
  title: string;
  emoji: string;
  stats: { label: string; value: number }[];
  locked?: boolean;
  lockedLabel?: string;
}

export interface PlayerIdentity {
  pseudo: string;
  email?: string;
  phone?: string;
  employeeId: string;
  bonusRTT: number;
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

const N = CHARACTERS.length;
type RelPos = 0 | 1 | 2 | 3;

function getRelPos(cardIndex: number, active: number): RelPos {
  return (((cardIndex - active) % N + N) % N) as RelPos;
}

function cardStyle(pos: RelPos): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease, filter 0.5s ease',
    transformOrigin: 'center center',
  };
  if (pos === 0) return { ...base, transform: 'translateX(0) scale(1.08) translateZ(0)', opacity: 1, filter: 'none', zIndex: 10, cursor: 'default' };
  if (pos === 1) return { ...base, transform: 'translateX(70%) scale(0.78) rotateY(-28deg)', opacity: 0.62, filter: 'brightness(0.65)', zIndex: 5, cursor: 'pointer' };
  if (pos === 3) return { ...base, transform: 'translateX(-70%) scale(0.78) rotateY(28deg)', opacity: 0.62, filter: 'brightness(0.65)', zIndex: 5, cursor: 'pointer' };
  return { ...base, transform: 'translateX(0) scale(0.5)', opacity: 0, zIndex: 0, pointerEvents: 'none' };
}

function StatBar({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} style={{
          width: '14px', height: '6px',
          background: i < value ? '#00C8BE' : '#1A3E7A',
          borderRadius: '1px',
          boxShadow: i < value ? '0 0 4px rgba(0,200,190,.5)' : 'none',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  );
}

// ── Generate employee ID ──────────────────────────────────────────────────────
function genEmployeeId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'GS-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ── localStorage helpers ──────────────────────────────────────────────────────
const STORAGE_KEY = 'guibour-identity';

function loadIdentity(): PlayerIdentity | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveIdentity(id: PlayerIdentity) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(id));
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface CharacterSelectProps {
  onSelect: (character: CharacterData, identity: PlayerIdentity) => void;
  onBack: () => void;
}

export default function CharacterSelect({ onSelect, onBack }: CharacterSelectProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // Identity state
  const [step, setStep] = useState<'identity' | 'character'>('identity');
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pseudoError, setPseudoError] = useState('');
  const [bonusRTT, setBonusRTT] = useState(0);
  const [employeeId] = useState(genEmployeeId);
  const [existingIdentity, setExistingIdentity] = useState<PlayerIdentity | null>(null);
  const [emailGiven, setEmailGiven] = useState(false);
  const [phoneGiven, setPhoneGiven] = useState(false);

  // Load persisted identity on mount
  useEffect(() => {
    const stored = loadIdentity();
    if (stored) {
      setExistingIdentity(stored);
      setPseudo(stored.pseudo);
      setEmailGiven(!!stored.email);
      setPhoneGiven(!!stored.phone);
    }
  }, []);

  const spin = useCallback((dir: 1 | -1) => {
    if (spinning) return;
    playClick();
    setSpinning(true);
    setActiveIndex(i => ((i + dir + N) % N));
    setTimeout(() => setSpinning(false), 520);
  }, [spinning]);

  const handleCardClick = useCallback((cardIndex: number) => {
    const pos = getRelPos(cardIndex, activeIndex);
    if (pos === 0) {
      const char = CHARACTERS[cardIndex];
      if (!char.locked) {
        const identity: PlayerIdentity = {
          pseudo,
          email: email || existingIdentity?.email,
          phone: phone || existingIdentity?.phone,
          employeeId: existingIdentity?.employeeId ?? employeeId,
          bonusRTT,
        };
        saveIdentity(identity);
        onSelect(char, identity);
      }
    } else if (pos === 1) { spin(1); }
    else if (pos === 3) { spin(-1); }
  }, [activeIndex, spin, onSelect, pseudo, email, phone, existingIdentity, employeeId, bonusRTT]);

  // ── Identity step handlers ──────────────────────────────────────────────────
  const handleIdentitySubmit = () => {
    playClick();
    if (!pseudo.trim()) {
      setPseudoError('Un pseudo est obligatoire pour jouer.');
      return;
    }
    let rtt = 0;
    if (email.trim() && !emailGiven) rtt += 1;
    if (phone.trim() && !phoneGiven) rtt += 1;
    setBonusRTT(rtt);
    setStep('character');
  };

  const handlePlayAsExisting = () => {
    playClick();
    setStep('character');
  };

  const active = CHARACTERS[activeIndex];
  const currentId = existingIdentity?.employeeId ?? employeeId;

  // ── STEP 1: IDENTITY FORM (simplifié) ────────────────────────────────────
  if (step === 'identity') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'linear-gradient(160deg, #0D1F45 0%, #1A3F78 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,72,171,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(0,72,171,.06) 1px,transparent 1px)', backgroundSize: '56px 34px' }} />

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '380px', animation: 'slideUp 0.3s ease-out' }}>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '32px', color: '#FFFFFF', letterSpacing: '5px', textShadow: '2px 3px 0 #0C2A62' }}>
              GUIBOUR SYSTEM
            </div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#00C8BE', letterSpacing: '4px', marginTop: '4px' }}>
              IDENTIFICATION EMPLOYÉ
            </div>
          </div>

          {/* Existing identity shortcut */}
          {existingIdentity && (
            <div style={{ marginBottom: '16px', background: 'rgba(0,200,190,.08)', border: '1px solid rgba(0,200,190,.25)', padding: '14px 16px' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00C8BE', letterSpacing: '2px', marginBottom: '6px' }}>✓ PROFIL SAUVEGARDÉ</div>
              <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '20px', color: '#fff', letterSpacing: '3px', marginBottom: '8px' }}>{existingIdentity.pseudo}</div>
              <button onClick={handlePlayAsExisting} style={{ width: '100%', fontFamily: "'Lilita One', cursive", fontSize: '15px', letterSpacing: '3px', color: '#fff', background: 'linear-gradient(135deg,#0047AB,#007B8A)', border: '2px solid #00C8BE', padding: '11px', cursor: 'pointer' }}>
                CONTINUER →
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px', fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2B4060' }}>— ou crée un nouveau profil —</div>
            </div>
          )}

          {/* Pseudo field */}
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              value={pseudo}
              onChange={e => { setPseudo(e.target.value); setPseudoError(''); }}
              placeholder="TON PSEUDO *"
              maxLength={20}
              autoFocus={!existingIdentity}
              style={{
                width: '100%', padding: '14px 16px', boxSizing: 'border-box',
                fontFamily: "'Orbitron', sans-serif", fontSize: '14px', letterSpacing: '2px',
                background: '#091E4A', color: '#FFFFFF',
                border: `2px solid ${pseudoError ? '#FF4444' : '#1A3E7A'}`,
                outline: 'none', textAlign: 'center',
              }}
              onFocus={e => e.target.style.borderColor = '#00C8BE'}
              onBlur={e => e.target.style.borderColor = pseudoError ? '#FF4444' : '#1A3E7A'}
              onKeyDown={e => e.key === 'Enter' && handleIdentitySubmit()}
            />
            {pseudoError && <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#FF4444', marginTop: '4px', textAlign: 'center' }}>{pseudoError}</div>}
          </div>

          {/* Email/phone — compact with RTT badge */}
          {!emailGiven && (
            <div style={{ marginBottom: '8px', position: 'relative' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="EMAIL (facultatif)"
                style={{ width: '100%', padding: '11px 16px', boxSizing: 'border-box', fontFamily: "'Orbitron', sans-serif", fontSize: '11px', background: '#091E4A', color: '#FFFFFF', border: '1px solid #1A3E7A', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#00C8BE'}
                onBlur={e => e.target.style.borderColor = '#1A3E7A'}
              />
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#00C8BE', background: 'rgba(0,200,190,.15)', border: '1px solid #00C8BE', padding: '2px 6px', borderRadius: '2px' }}>+1 RTT ❤</span>
            </div>
          )}
          {!phoneGiven && (
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="TÉLÉPHONE (facultatif)"
                style={{ width: '100%', padding: '11px 16px', boxSizing: 'border-box', fontFamily: "'Orbitron', sans-serif", fontSize: '11px', background: '#091E4A', color: '#FFFFFF', border: '1px solid #1A3E7A', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#00C8BE'}
                onBlur={e => e.target.style.borderColor = '#1A3E7A'}
              />
              <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#00C8BE', background: 'rgba(0,200,190,.15)', border: '1px solid #00C8BE', padding: '2px 6px', borderRadius: '2px' }}>+1 RTT ❤</span>
            </div>
          )}

          <button onClick={handleIdentitySubmit} style={{ width: '100%', fontFamily: "'Lilita One', cursive", fontSize: '20px', letterSpacing: '4px', color: '#fff', background: 'linear-gradient(135deg,#0047AB,#007B8A)', border: '2px solid #00C8BE', padding: '16px', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,200,190,.3)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 32px rgba(0,200,190,.55)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,200,190,.3)'}>
            ENTRER →
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px', fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#1E3252' }}>
            Données utilisées pour le classement du concours uniquement.
          </div>
        </div>

        <button onClick={() => { playClick(); onBack(); }} style={{ position: 'relative', zIndex: 2, marginTop: '16px', fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '3px', color: '#3C5A7A', background: 'transparent', border: '1px solid #1A3E7A', padding: '7px 18px', cursor: 'pointer' }}>← RETOUR</button>
      </div>
    );
  }

  // ── STEP 2: CHARACTER SELECT ──────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'linear-gradient(160deg, #1A3F78 0%, #1A3F78 60%, #264D82 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px 20px 20px 68px', overflow: 'hidden',
    }}>
      {/* Grid texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,72,171,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,72,171,.07) 1px,transparent 1px)',
        backgroundSize: '56px 34px',
      }} />

      {/* Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse at center, rgba(0,71,171,.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Formula bar */}
      <div style={{
        position: 'relative', zIndex: 2, background: '#0C2A62', border: '1px solid #1A3E7A',
        padding: '5px 18px', display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
      }}>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', color: '#00D4CC', fontWeight: 700 }}>fx</span>
        <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '1px' }}>
          =SELECT(&quot;PERSONNAGE&quot;) → {pseudo || 'EMPLOYEE'}
        </span>
        {bonusRTT > 0 && (
          <span style={{
            background: 'rgba(0,200,190,.15)', border: '1px solid #00C8BE',
            color: '#00C8BE', padding: '2px 8px', fontSize: '9px', borderRadius: '2px',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            +{bonusRTT} RTT BONUS ❤
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 'clamp(20px,3.5vw,32px)', color: '#A8D8FF', letterSpacing: '5px', textShadow: '2px 2px 0 #0C2A62' }}>
          SÉLECTION DU PERSONNEL
        </div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5', letterSpacing: '3px', marginTop: '5px' }}>
          DOSSIER RH // CHOISISSEZ VOTRE PROFIL — EMPLOYÉ {currentId}
        </div>
      </div>

      {/* Carousel */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
        <button onClick={() => spin(-1)} style={{
          width: '48px', height: '48px', flexShrink: 0,
          background: 'rgba(0,71,171,.18)', border: '2px solid #1A3E7A',
          color: '#5B9BD5', fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C8BE'; e.currentTarget.style.color = '#00C8BE'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A3E7A'; e.currentTarget.style.color = '#5B9BD5'; }}
        >‹</button>

        <div style={{ position: 'relative', width: '200px', height: '300px', perspective: '1200px', perspectiveOrigin: '50% 50%' }}>
          {CHARACTERS.map((char, i) => {
            const pos = getRelPos(i, activeIndex);
            const isFront = pos === 0;
            return (
              <div key={char.id} onClick={() => handleCardClick(i)} style={cardStyle(pos)}>
                <div style={{
                  width: '100%', height: '100%',
                  background: isFront ? 'linear-gradient(180deg, #1A3560 0%, #0D2040 100%)' : 'linear-gradient(180deg, #152644 0%, #0A1828 100%)',
                  border: `2px solid ${isFront ? '#00C8BE' : '#1A3E7A'}`,
                  borderRadius: '10px', overflow: 'hidden',
                  boxShadow: isFront ? '0 0 32px rgba(0,200,190,.25), 0 16px 40px rgba(0,0,0,.5)' : '0 8px 20px rgba(0,0,0,.3)',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{
                    background: char.locked ? '#3A0A0A' : isFront ? '#00C8BE' : '#1A3E7A',
                    padding: '5px', fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                    textAlign: 'center', color: char.locked ? '#FF6B6B' : isFront ? '#0C2A62' : '#5B9BD5',
                    letterSpacing: '2px', fontWeight: isFront ? 700 : 400,
                  }}>
                    {char.locked ? char.lockedLabel : isFront ? '▶ SÉLECTIONNER' : 'DISPONIBLE'}
                  </div>
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isFront ? '60px' : '50px',
                    background: isFront ? 'radial-gradient(ellipse at 50% 60%, rgba(0,200,190,.1), transparent 70%)' : 'transparent',
                    opacity: char.locked ? 0.35 : 1, transition: 'font-size .3s',
                  }}>{char.emoji}</div>
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,.2)' }}>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '15px', color: isFront ? '#FFFFFF' : '#A8D8FF', letterSpacing: '2px', marginBottom: '1px' }}>{char.name}</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: char.locked ? '#FF6B6B' : '#00D4CC', letterSpacing: '1px', marginBottom: '8px' }}>{char.title}</div>
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

        <button onClick={() => spin(1)} style={{
          width: '48px', height: '48px', flexShrink: 0,
          background: 'rgba(0,71,171,.18)', border: '2px solid #1A3E7A',
          color: '#5B9BD5', fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#00C8BE'; e.currentTarget.style.color = '#00C8BE'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A3E7A'; e.currentTarget.style.color = '#5B9BD5'; }}
        >›</button>
      </div>

      {/* Dots */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {CHARACTERS.map((_, i) => (
          <button key={i} onClick={() => setActiveIndex(i)} style={{
            width: i === activeIndex ? '24px' : '8px', height: '8px',
            background: i === activeIndex ? '#00C8BE' : '#1A3E7A',
            border: 'none', borderRadius: '4px', cursor: 'pointer', padding: 0,
            transition: 'all .3s ease', boxShadow: i === activeIndex ? '0 0 8px rgba(0,200,190,.6)' : 'none',
          }} />
        ))}
      </div>

      {/* CTA */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '16px' }}>
        {active.locked ? (
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#FF6B6B', letterSpacing: '3px' }}>
            DÉBLOQUÉ À L&apos;ÉTAGE 15
          </div>
        ) : (
          <button
            onClick={() => {
              playClick();
              const identity: PlayerIdentity = {
                pseudo,
                email: email || existingIdentity?.email,
                phone: phone || existingIdentity?.phone,
                employeeId: existingIdentity?.employeeId ?? employeeId,
                bonusRTT,
              };
              saveIdentity(identity);
              onSelect(active, identity);
            }}
            style={{
              fontFamily: "'Lilita One', cursive", fontSize: '18px', letterSpacing: '4px', color: '#fff',
              background: 'linear-gradient(135deg,#0047AB,#007B8A)', border: '2px solid #00C8BE',
              padding: '13px 48px', cursor: 'pointer', boxShadow: '0 0 20px rgba(0,200,190,.3)', transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 32px rgba(0,200,190,.55)'; e.currentTarget.style.background = 'linear-gradient(135deg,#1B5EBB,#008B9A)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(0,200,190,.3)'; e.currentTarget.style.background = 'linear-gradient(135deg,#0047AB,#007B8A)'; }}
          >
            JOUER EN TANT QUE {active.name} →
          </button>
        )}
      </div>

      <button onClick={() => { playClick(); setStep('identity'); }} style={{
        position: 'relative', zIndex: 2,
        fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '3px', color: '#3C5A7A',
        background: 'transparent', border: '1px solid #1A3E7A', padding: '7px 18px', cursor: 'pointer',
      }}>← MODIFIER MON PROFIL</button>
    </div>
  );
}
