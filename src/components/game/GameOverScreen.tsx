'use client';

import { GameState } from '@/lib/gameTypes';
import { addScore, formatDuration, formatSalary, getShareText } from '@/lib/leaderboard';
import { useEffect, useState } from 'react';

interface Props {
  state: GameState;
  onRestart: () => void;
}

export default function GameOverScreen({ state, onRestart }: Props) {
  const { player, level, status } = state;
  const isVictory = status === 'victory';
  const [rank, setRank] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const durationMs = state.endTime && state.startTime ? state.endTime - state.startTime : 0;
  const durationText = formatDuration(durationMs);

  useEffect(() => {
    if (!saved) {
      const r = addScore({
        name: player.name,
        score: player.score,
        level,
        date: new Date().toISOString(),
      });
      setRank(r);
      setSaved(true);
    }
  }, [saved, player, level]);

  // Show big text first, then modal after 2s
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const text = getShareText(player.name, level, player.score, durationMs);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleChallenge = async () => {
    const text = getShareText(player.name, level, player.score, durationMs);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'W.O.W - Defi', text, url: 'https://guibour.fr' });
      } catch {}
    } else {
      const challengeText = `${text}\n\nguibour.fr`;
      await navigator.clipboard.writeText(challengeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
         style={{
           background: isVictory
             ? 'rgba(0,8,20,0.88)'
             : 'rgba(8,2,2,0.90)',
           backdropFilter: 'blur(5px)',
         }}>

      {/* ── GRAND TEXTE CHOC ── */}
      <div className="mb-8 text-center" style={{ pointerEvents: 'none' }}>

        {/* Titre principal — énorme, effrayant */}
        <h1 style={{
          fontFamily: "'Luckiest Guy', cursive",
          fontSize: isVictory
            ? 'clamp(58px, 10vw, 108px)'
            : 'clamp(64px, 12vw, 130px)',
          color: isVictory ? '#00C9C8' : '#FF2020',
          letterSpacing: isVictory ? '6px' : '3px',
          lineHeight: 0.92,
          display: 'block',
          animation: isVictory
            ? 'victorySlam 0.65s cubic-bezier(.15,0,.25,1) both, victoryGlow 2s ease-in-out infinite 0.7s'
            : 'scareSlam 0.65s cubic-bezier(.15,0,.25,1) both, scareGlow 2s ease-in-out infinite 0.7s',
        }}>
          {isVictory ? 'VOUS ÊTES\nLIBRE' : 'CAREER\nFAILED'}
        </h1>

        {/* Sous-titre GAME OVER */}
        {!isVictory && (
          <p style={{
            fontFamily: "'Luckiest Guy', cursive",
            fontSize: 'clamp(32px, 6vw, 64px)',
            color: '#FF5050',
            letterSpacing: '8px',
            marginTop: '10px',
            display: 'block',
            animation: 'scareSlam 0.65s cubic-bezier(.15,0,.25,1) 0.18s both, scarePulse 1.8s ease-in-out infinite 0.85s',
          }}>
            GAME OVER
          </p>
        )}

        {/* Sous-titre victoire */}
        {isVictory && (
          <p style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(11px, 1.8vw, 16px)',
            color: '#00C8BE',
            letterSpacing: '4px',
            marginTop: '16px',
            opacity: 0.8,
            animation: 'fadeIn 0.6s ease 0.8s both',
          }}>
            25 ÉTAGES — MISSION ACCOMPLIE
          </p>
        )}
      </div>

      {/* Stats modal (appears after 2s) */}
      {showContent && (
        <div className="w-[440px] max-w-[92vw] overflow-hidden shadow-2xl"
             style={{
               animation: 'slideUp 0.4s ease-out',
               border: '2px solid #0047AB',
               background: '#fff',
             }}>
          <div className="flex items-center justify-between px-3 py-2"
               style={{ background: '#0047AB' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FF5F56' }} />
                <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#27C93F' }} />
              </div>
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '1px',
              }}>
                {isVictory ? 'W.O.W — LIBERATION' : 'W.O.W — FIN DE CONTRAT'}
              </span>
            </div>
            <div className="flex gap-2 text-white/60" style={{ fontSize: '10px' }}>
              <span>—</span><span>□</span><span>&#10005;</span>
            </div>
          </div>

          <div className="flex items-center border-b" style={{ borderColor: '#C0D0DE', background: '#FAFAFA' }}>
            <div className="flex items-center justify-center border-r px-2 py-1" style={{ borderColor: '#C0D0DE', background: '#E8E8E8' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#777' }}>fx</span>
            </div>
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '10px',
              color: '#0047AB',
              padding: '4px 8px',
            }}>
              =BILAN(&quot;{player.name}&quot;, DUREE({durationText}), SALAIRE({formatSalary(player.score)}))
            </span>
          </div>

          <div className="p-5 text-center" style={{ background: '#F5F5F5' }}>
            {/* Duration */}
            <div style={{
              background: '#fff',
              border: '1px solid #C8D8E8',
              padding: '10px',
              marginBottom: '12px',
            }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#607888' }}>
                DUREE DANS LE SYSTEME
              </span>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '32px',
                fontWeight: 800,
                color: '#0047AB',
                lineHeight: 1.2,
              }}>
                {durationText}
              </div>
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1px',
              background: '#C8D8E8',
              border: '1px solid #C8D8E8',
              marginBottom: '12px',
            }}>
              {[
                { label: 'ETAGE', value: String(level).padStart(2, '0'), color: '#0A1520' },
                { label: 'SALAIRE', value: formatSalary(player.score), color: '#0047AB' },
                { label: 'CLASSEMENT', value: `#${rank}`, color: '#D4A020' },
              ].map(cell => (
                <div key={cell.label} style={{ background: '#fff', padding: '8px 6px', textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '8px',
                    color: '#607888',
                    letterSpacing: '2px',
                    marginBottom: '2px',
                  }}>{cell.label}</div>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: cell.color,
                  }}>{cell.value}</div>
                </div>
              ))}
            </div>

            <p style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '10px',
              color: '#0047AB',
              letterSpacing: '2px',
              marginBottom: '14px',
            }}>
              PEUX-TU BATTRE MON SCORE ?
            </p>

            <div className="flex gap-2">
              <button
                onClick={onRestart}
                className="flex-1 cursor-pointer py-3 text-xs font-bold tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: '#0047AB',
                  border: '1px solid #0A1520',
                }}
              >
                REJOUER
              </button>
              <button
                onClick={handleChallenge}
                className="flex-1 cursor-pointer py-3 text-xs font-bold tracking-widest transition-all hover:brightness-110 active:scale-[0.98]"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: '#00A89D',
                  color: '#fff',
                  border: '1px solid #0047AB',
                }}
              >
                {copied ? 'COPIE !' : 'DEFIER UN AMI'}
              </button>
              <button
                onClick={handleShare}
                className="cursor-pointer px-4 py-3 text-xs font-bold tracking-widest transition-all hover:bg-[#E8E8E8] active:scale-[0.98]"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  background: '#fff',
                  color: '#0A1520',
                  border: '1px solid #C8D8E8',
                }}
              >
                PARTAGER
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-1"
               style={{ background: '#0047AB', borderTop: '1px solid #0F3320' }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>
              guibour.fr
            </span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>
              #WOW #guibour
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
