'use client';

import React from 'react';
import { GameState } from '@/lib/gameTypes';
import { addScore, formatSalary } from '@/lib/leaderboard';
import { useEffect, useState, useRef } from 'react';
import { PlayerIdentity } from '@/components/ui/CharacterSelect';
import { playClick } from '@/lib/sounds';
import { launchConfetti } from '@/lib/confetti';
import ScreenCrack from './ScreenCrack';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
  state: GameState;
  onRestart: () => void;
  onContinueWithRTT?: () => void;
  playerIdentity?: PlayerIdentity | null;
  replayUrl?: string | null;
}

type DefeatStep = 'crack' | 'replay-offer' | 'loser' | 'share';

// ── Player profile tracker (localStorage) ─────────────────────────────────────

const PROFILE_KEY = 'guibour-player-profile';

interface PlayerProfile {
  email?: string;
  phone?: string;
  waShared?: boolean;
  igShared?: boolean;
  diplomaDownloaded?: boolean;
  defeatCount: number;
  rttUsedThisSession?: boolean;
}

function getProfile(): PlayerProfile {
  if (typeof window === 'undefined') return { defeatCount: 0 };
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { defeatCount: 0 };
  } catch { return { defeatCount: 0 }; }
}

function updateProfile(patch: Partial<PlayerProfile>): PlayerProfile {
  const p = { ...getProfile(), ...patch };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  return p;
}

// ── Share image generator ─────────────────────────────────────────────────────

function generateShareImage(pseudo: string, level: number, score: number): string {
  const w = 1080, h = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0C2A62');
  grad.addColorStop(0.6, '#1A3F78');
  grad.addColorStop(1, '#264D82');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(0,120,220,0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 56) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  ctx.strokeStyle = '#00C8BE';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  ctx.fillStyle = '#0047AB';
  ctx.fillRect(20, 20, w - 40, 60);
  ctx.fillStyle = '#A8D8FF';
  ctx.font = 'bold 22px Orbitron, monospace';
  ctx.fillText('GUIBOUR SYSTEM // W.O.W // 2026', 48, 58);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 110px Arial Black';
  ctx.textAlign = 'center';
  ctx.fillText('GUIBOUR', w / 2, 220);

  ctx.fillStyle = '#00C8BE';
  ctx.font = 'bold 36px Orbitron, monospace';
  ctx.fillText('SYSTEM', w / 2, 270);

  ctx.fillStyle = '#00C8BE';
  ctx.fillRect(100, 295, w - 200, 3);

  ctx.fillStyle = '#5B9BD5';
  ctx.font = '20px monospace';
  ctx.fillText('EMPLOYÉ', w / 2, 340);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px Arial';
  ctx.fillText(pseudo.toUpperCase(), w / 2, 440);

  const stats = [
    { label: 'ÉTAGE ATTEINT', value: String(level).padStart(2, '0') + ' / 25', color: '#FFE033' },
    { label: 'SALAIRE CUMULÉ', value: formatSalary(score), color: '#00C8BE' },
    { label: 'STATUT', value: level >= 25 ? 'LIBÉRÉ ✓' : 'CAREER FAILED', color: level >= 25 ? '#27C93F' : '#FF4444' },
  ];

  stats.forEach((stat, i) => {
    const x = 100 + i * 296;
    const y = 500;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x, y, 276, 130);
    ctx.strokeStyle = stat.color + '60';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 276, 130);
    ctx.fillStyle = '#5B9BD5';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(stat.label, x + 138, y + 30);
    ctx.fillStyle = stat.color;
    ctx.font = 'bold 34px monospace';
    ctx.fillText(stat.value, x + 138, y + 90);
  });

  ctx.fillStyle = '#0047AB';
  ctx.fillRect(200, 680, w - 400, 80);
  ctx.strokeStyle = '#00C8BE';
  ctx.lineWidth = 2;
  ctx.strokeRect(200, 680, w - 400, 80);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('JOUE SUR GUIBOUR.FR', w / 2, 728);

  ctx.fillStyle = '#00C8BE';
  ctx.fillRect(20, h - 80, w - 40, 60);
  ctx.fillStyle = '#0C2A62';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('GUIBOUR.FR // W.O.W // #GUIBOUR2026', w / 2, h - 42);

  return canvas.toDataURL('image/png');
}

// ── Share buttons ─────────────────────────────────────────────────────────────

function ShareButtons({ pseudo, level, score, shareImageUrl, onDiploma }: {
  pseudo: string; level: number; score: number;
  shareImageUrl: string | null; onDiploma: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl = 'https://guibour.fr';
  const scoreCardUrl = `${siteUrl}/api/score-card?pseudo=${encodeURIComponent(pseudo)}&score=${score}&level=${level}`;
  const shareText = `J'ai atteint l'etage ${level} avec ${score.toLocaleString('fr-FR')} points sur GUIBOUR SYSTEM W.O.W ! 🏢 Bats mon score → guibour.fr`;

  const btnBase: React.CSSProperties = {
    width: '100%', padding: '12px 12px', borderRadius: '4px', cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif", fontSize: '11px', letterSpacing: '2px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'all .2s', border: 'none',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', animation: 'fadeIn 0.4s ease-out' }}>
      <button onClick={() => { playClick(); window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(scoreCardUrl)}`, '_blank'); }} style={{ ...btnBase, background: '#000', color: '#fff', border: '1px solid #333' }}>
        PARTAGER SUR X
      </button>
      <button onClick={() => { playClick(); window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${scoreCardUrl}`)}`, '_blank'); }} style={{ ...btnBase, background: '#25D366', color: '#fff' }}>
        WHATSAPP
      </button>
      <button onClick={async () => { playClick(); try { await navigator.clipboard.writeText(scoreCardUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }} style={{ ...btnBase, background: copied ? '#00C8BE' : 'rgba(0,71,171,0.3)', color: copied ? '#0A1520' : '#A8D8FF', border: '1px solid #1A3E7A' }}>
        {copied ? 'LIEN COPIE !' : 'COPIER LE LIEN'}
      </button>
      <button onClick={() => { playClick(); if (!shareImageUrl) return; const link = document.createElement('a'); link.href = shareImageUrl; link.download = `guibour-wow-${pseudo.toLowerCase()}-lvl${level}.png`; link.click(); }} style={{ ...btnBase, background: 'rgba(0,71,171,0.3)', color: '#A8D8FF', border: '1px solid #1A3E7A' }}>
        TELECHARGER IMAGE
      </button>
      <button onClick={onDiploma} style={{ ...btnBase, gridColumn: '1 / -1', background: 'rgba(58,42,0,0.4)', color: '#FFE033', border: '1px solid #5A4400' }}>
        TELECHARGE TON DIPLOME
      </button>
    </div>
  );
}

// ── Popup wrapper ─────────────────────────────────────────────────────────────

function Popup({ children, borderColor = '#FF4444' }: { children: React.ReactNode; borderColor?: string }) {
  return (
    <div style={{
      width: '420px', maxWidth: '92vw',
      background: 'rgba(12,30,64,0.97)',
      border: `2px solid ${borderColor}`,
      borderRadius: '8px',
      animation: 'slideUp 0.4s ease-out',
      overflow: 'hidden',
      boxShadow: `0 0 60px ${borderColor}40, 0 20px 60px rgba(0,0,0,.6)`,
    }}>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

function GameOverScreen({ state, onRestart, onContinueWithRTT, playerIdentity, replayUrl }: Props) {
  const { player, level, status } = state;
  const isVictory = status === 'victory';

  const [rank, setRank] = useState(0);
  const [saved, setSaved] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const canvasGenerated = useRef(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiFired = useRef(false);
  const [profile, setProfile] = useState<PlayerProfile>({ defeatCount: 0 });

  // Defeat flow step
  const [defeatStep, setDefeatStep] = useState<DefeatStep>('crack');
  const [rttEarned, setRttEarned] = useState(false);

  const pseudo = playerIdentity?.pseudo || player.name || 'EMPLOYÉ';

  // ── Save score ──
  useEffect(() => {
    if (!saved) {
      setSaved(true);
      const r = addScore({ name: pseudo, score: player.score, level, date: new Date().toISOString() });
      setRank(r);
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pseudo,
          score: player.score,
          level,
          employeeId: playerIdentity?.employeeId || `GS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        }),
      }).then(res => res.json()).then(d => { if (d.rank) setRank(d.rank); }).catch(() => {});
      fetch('/api/players', { method: 'POST' }).catch(() => {});
    }
  }, [saved, pseudo, player, level, playerIdentity]);

  // ── Defeat flow: crack (2.5s) → replay-offer ──
  useEffect(() => {
    if (isVictory) return;
    const t = setTimeout(() => setDefeatStep('replay-offer'), 2500);
    return () => clearTimeout(t);
  }, [isVictory]);

  // ── Load profile ──
  useEffect(() => {
    const p = getProfile();
    if (playerIdentity?.email && !p.email) p.email = playerIdentity.email;
    if (!isVictory) p.defeatCount = (p.defeatCount || 0) + 1;
    const updated = updateProfile(p);
    setProfile(updated);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Confetti for victory ──
  useEffect(() => {
    if (!isVictory || confettiFired.current) return;
    confettiFired.current = true;
    setTimeout(() => {
      const canvas = confettiCanvasRef.current;
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; launchConfetti(canvas); }
    }, 500);
  }, [isVictory]);

  // ── Confetti for top 10 ──
  useEffect(() => {
    if (confettiFired.current || rank <= 0 || rank > 10) return;
    confettiFired.current = true;
    const canvas = confettiCanvasRef.current;
    if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; launchConfetti(canvas); }
  }, [rank]);

  // ── Share image generation ──
  useEffect(() => {
    if (defeatStep !== 'share' && !isVictory) return;
    if (canvasGenerated.current) return;
    canvasGenerated.current = true;
    try { setShareImageUrl(generateShareImage(pseudo, level, player.score)); } catch {}
  }, [defeatStep, isVictory, pseudo, level, player.score]);

  // ── RTT handlers ──
  const handleRTTEmail = (email: string) => {
    const updated = updateProfile({ email });
    setProfile(updated);
    setRttEarned(true);
    const stored = localStorage.getItem('guibour-identity');
    if (stored) { const id = JSON.parse(stored); id.email = email; id.bonusRTT = (id.bonusRTT ?? 0) + 1; localStorage.setItem('guibour-identity', JSON.stringify(id)); }
    fetch('/api/email-collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, pseudo, source: 'rtt-bonus' }) }).catch(() => {});
  };

  const handleRTTShare = (platform: 'twitter' | 'whatsapp') => {
    const siteUrl = 'https://guibour.fr';
    const text = `Je joue a GUIBOUR SYSTEM W.O.W — le jeu le plus absurde du web ! 🏢 guibour.fr`;
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(siteUrl)}`, '_blank');
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${siteUrl}`)}`, '_blank');
    setRttEarned(true);
  };

  const handleContinue = () => {
    playClick();
    updateProfile({ rttUsedThisSession: true });
    if (onContinueWithRTT) onContinueWithRTT();
    else onRestart();
  };

  const handleDiploma = async () => {
    playClick();
    const { generateCertificate } = await import('@/lib/generateCertificate');
    await generateCertificate({ pseudo, employeeId: playerIdentity?.employeeId || 'GS-000000', level, score: player.score, rank: rank > 0 ? rank : undefined });
    updateProfile({ diplomaDownloaded: true });
  };

  // ══════════════════════════════════════════════════════════════════════════
  // VICTORY SCREEN (unchanged flow)
  // ══════════════════════════════════════════════════════════════════════════

  if (isVictory) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
        style={{ background: 'rgba(0,8,20,0.65)', backdropFilter: 'blur(4px)', overflowY: 'auto' }}>
        <canvas ref={confettiCanvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} />

        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 'clamp(36px, 8vw, 60px)', color: '#FFFFFF', letterSpacing: '4px', lineHeight: 1, textShadow: '0 0 30px rgba(0,200,190,.5), 3px 4px 0 rgba(0,0,0,.4)' }}>
            VOUS ÊTES LIBRE
          </div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', color: '#A8FFE0', letterSpacing: '5px', marginTop: '6px' }}>
            25 ÉTAGES — MISSION ACCOMPLIE
          </div>
        </div>

        <Popup borderColor="#00C8BE">
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '26px', color: '#FFFFFF', letterSpacing: '3px' }}>{pseudo}</div>
            </div>
            <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '16px', textAlign: 'center', borderRadius: '4px' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#5B9BD5', letterSpacing: '3px', marginBottom: '8px' }}>SALAIRE GAGNÉ</div>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '38px', color: '#00C8BE', textShadow: '0 0 20px rgba(0,200,190,.4)' }}>{formatSalary(player.score)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '12px', textAlign: 'center', borderRadius: '4px' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#5B9BD5', letterSpacing: '2px', marginBottom: '8px' }}>ÉTAGE</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FFE033' }}>25/25</div>
              </div>
              <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '12px', textAlign: 'center', borderRadius: '4px' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#5B9BD5', letterSpacing: '2px', marginBottom: '8px' }}>RANG</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FF7744' }}>{rank > 0 ? `#${rank}` : '—'}</div>
              </div>
            </div>
            <button onClick={() => { playClick(); onRestart(); }} style={{
              width: '100%', fontFamily: "'Lilita One', cursive", fontSize: '20px', letterSpacing: '4px', color: '#fff',
              background: '#0047AB', border: '2px solid #00C8BE', padding: '16px', cursor: 'pointer', borderRadius: '4px',
            }}>REJOUER</button>
            <ShareButtons pseudo={pseudo} level={level} score={player.score} shareImageUrl={shareImageUrl} onDiploma={handleDiploma} />
            <ReferralChallenge pseudo={pseudo} />
          </div>
          <div style={{ background: '#004D48', padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>guibour.fr</span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>#WOW2026</span>
          </div>
        </Popup>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEFEAT FLOW — 4 steps séquentiels
  // 1) crack: fissures + "FIN DE CARRIÈRE" (2.5s, jeu visible derrière)
  // 2) replay-offer: "VEUX-TU REJOUER ?" avec toutes les CTA pour gagner un RTT
  // 3) loser: "TU ES UN LOSER" (s'il refuse)
  // 4) share: partage ton score, diplôme, referral
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
      style={{ background: defeatStep === 'crack' ? 'rgba(4,0,0,0.45)' : 'rgba(4,0,0,0.7)', transition: 'background 0.5s', overflowY: 'auto' }}>

      <canvas ref={confettiCanvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} />

      {/* Screen crack overlay — visible during crack step only */}
      {defeatStep === 'crack' && <ScreenCrack />}

      {/* ═══ STEP 1: CRACK — Fissures + titre seul, jeu visible derrière ═══ */}
      {defeatStep === 'crack' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(36px, 9vw, 64px)', color: '#FF1111',
            fontWeight: 900, letterSpacing: '8px', lineHeight: 1,
            textShadow: '0 0 30px rgba(255,0,0,.7), 0 0 60px rgba(255,0,0,.4)',
          }}>
            FIN DE CARRIÈRE
          </div>
        </div>
      )}

      {/* ═══ STEP 2: REPLAY OFFER — "Veux-tu rejouer ?" + CTA pour gagner RTT ═══ */}
      {defeatStep === 'replay-offer' && (
        <Popup borderColor="#FFE033">
          <div style={{ background: 'rgba(58,42,0,.3)', padding: '12px 16px', borderBottom: '1px solid #5A4400' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#FFE033', letterSpacing: '3px', textShadow: '0 0 8px rgba(255,224,51,.5)' }}>
              SERVICE DES RESSOURCES HUMAINES
            </div>
          </div>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <div style={{
              fontFamily: "'Lilita One', cursive", fontSize: '24px', color: '#FFE033',
              letterSpacing: '2px', marginBottom: '8px',
            }}>
              VEUX-TU REJOUER ?
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#C8A040',
              letterSpacing: '1px', lineHeight: 1.8, marginBottom: '24px',
            }}>
              GAGNE UN RTT POUR CONTINUER DEPUIS L'ÉTAGE {level}
            </div>

            {/* CTA options pour gagner un RTT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', textAlign: 'left' }}>
              {/* Email */}
              {!profile.email && !rttEarned && (
                <RTTOptionEmail onSubmit={handleRTTEmail} />
              )}

              {/* Share Twitter */}
              {!rttEarned && (
                <button onClick={() => { playClick(); handleRTTShare('twitter'); }} style={{
                  width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(0,0,0,.4)', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '22px' }}>𝕏</span>
                  <div>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: '#fff', letterSpacing: '1px' }}>PARTAGER SUR X</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#666' }}>TWEET = +1 RTT</div>
                  </div>
                </button>
              )}

              {/* Share WhatsApp */}
              {!rttEarned && (
                <button onClick={() => { playClick(); handleRTTShare('whatsapp'); }} style={{
                  width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(37,211,102,.08)', border: '1px solid #25D366', borderRadius: '4px', cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '22px' }}>💬</span>
                  <div>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: '#25D366', letterSpacing: '1px' }}>ENVOYER SUR WHATSAPP</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#1A8A4A' }}>PARTAGE = +1 RTT</div>
                  </div>
                </button>
              )}

              {/* RTT earned */}
              {rttEarned && (
                <div style={{
                  textAlign: 'center', padding: '16px', background: 'rgba(0,200,190,.08)',
                  border: '1px solid rgba(0,200,190,.3)', borderRadius: '4px', animation: 'fadeIn 0.3s ease-out',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>✅</div>
                  <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '18px', color: '#00C8BE', letterSpacing: '2px' }}>
                    +1 RTT DÉBLOQUÉ !
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {rttEarned ? (
                <button onClick={handleContinue} style={{
                  flex: 2, padding: '16px', fontFamily: "'Lilita One', cursive", fontSize: '18px',
                  letterSpacing: '3px', color: '#fff',
                  background: '#0047AB', border: '2px solid #00C8BE',
                  cursor: 'pointer', borderRadius: '4px',
                }}>
                  CONTINUER ▶
                </button>
              ) : (
                <button onClick={() => { playClick(); onRestart(); }} style={{
                  flex: 2, padding: '16px', fontFamily: "'Lilita One', cursive", fontSize: '18px',
                  letterSpacing: '3px', color: '#fff',
                  background: '#0047AB', border: '2px solid #00C8BE',
                  cursor: 'pointer', borderRadius: '4px',
                }}>
                  REJOUER
                </button>
              )}
              <button onClick={() => { playClick(); setDefeatStep('loser'); }} style={{
                flex: 1, padding: '16px', fontFamily: "'Orbitron', sans-serif", fontSize: '11px',
                letterSpacing: '2px', color: '#666', background: 'rgba(255,255,255,.05)',
                border: '1px solid #333', cursor: 'pointer', borderRadius: '4px',
              }}>
                ABANDONNER
              </button>
            </div>
          </div>
        </Popup>
      )}

      {/* ═══ STEP 3: LOSER — "Tu es un loser" ═══ */}
      {defeatStep === 'loser' && (
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease-out', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(42px, 11vw, 72px)', color: '#FF1111',
              fontWeight: 900, letterSpacing: '10px', lineHeight: 1,
              textShadow: '0 0 40px rgba(255,0,0,.8), 0 0 80px rgba(255,0,0,.4)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              LICENCIÉ
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#FF6666',
              fontWeight: 700, letterSpacing: '6px', marginTop: '12px',
              textShadow: '0 0 12px rgba(255,0,0,.4)',
            }}>
              MOTIF : INCOMPÉTENCE PROFESSIONNELLE
            </div>
          </div>

          <button onClick={() => { playClick(); setDefeatStep('share'); }} style={{
            padding: '16px 48px', fontFamily: "'Orbitron', sans-serif", fontSize: '13px',
            letterSpacing: '3px', color: '#FF6666', background: 'rgba(100,0,0,.3)',
            border: '1px solid #FF4444', cursor: 'pointer', borderRadius: '4px',
            transition: 'all .2s',
          }}>
            VOIR MON SCORE →
          </button>
        </div>
      )}

      {/* ═══ STEP 4: SHARE — Score + partage ═══ */}
      {defeatStep === 'share' && (
        <Popup borderColor="#FF4444">
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '28px', color: '#FFFFFF', letterSpacing: '3px' }}>{pseudo}</div>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#FF6666', letterSpacing: '2px', marginTop: '4px' }}>LICENCIÉ</div>
            </div>
            <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '16px', textAlign: 'center', borderRadius: '4px' }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#5B9BD5', letterSpacing: '3px', marginBottom: '8px' }}>SALAIRE GAGNÉ</div>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '38px', color: '#00C8BE', textShadow: '0 0 20px rgba(0,200,190,.4)' }}>{formatSalary(player.score)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '12px', textAlign: 'center', borderRadius: '4px' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#5B9BD5', letterSpacing: '2px', marginBottom: '8px' }}>ÉTAGE</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FFE033' }}>{String(level).padStart(2, '0')}/25</div>
              </div>
              <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '12px', textAlign: 'center', borderRadius: '4px' }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#5B9BD5', letterSpacing: '2px', marginBottom: '8px' }}>RANG</div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FF7744' }}>{rank > 0 ? `#${rank}` : '—'}</div>
              </div>
            </div>
            <button onClick={() => { playClick(); onRestart(); }} style={{
              width: '100%', fontFamily: "'Lilita One', cursive", fontSize: '20px', letterSpacing: '4px', color: '#fff',
              background: '#0047AB', border: '2px solid #00C8BE', padding: '16px',
              cursor: 'pointer', borderRadius: '4px',
            }}>REJOUER</button>
            <ShareButtons pseudo={pseudo} level={level} score={player.score} shareImageUrl={shareImageUrl} onDiploma={handleDiploma} />
            <ReferralChallenge pseudo={pseudo} />
          </div>
          <div style={{ background: '#5A0000', padding: '8px 16px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>guibour.fr</span>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>#WOW2026</span>
          </div>
        </Popup>
      )}
    </div>
  );
}

// ── RTT Email sub-component ─────────────────────────────────────────────────

function RTTOptionEmail({ onSubmit }: { onSubmit: (email: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{
      padding: '16px', background: 'rgba(58,42,0,.3)', border: '1px solid #5A4400', borderRadius: '4px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>📧</span>
        <div>
          <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '14px', color: '#FFE033', letterSpacing: '1px' }}>LAISSE TON EMAIL</div>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#C8A040', letterSpacing: '1px' }}>DÉBLOQUER +1 RTT INSTANTANÉMENT</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input ref={inputRef} type="email" placeholder="ton@email.com" style={{
          flex: 1, padding: '12px 12px', fontFamily: "'Orbitron', sans-serif", fontSize: '11px',
          background: '#091E4A', color: '#fff', border: '1px solid #1A3E7A', outline: 'none', borderRadius: '4px',
        }} />
        <button onClick={() => {
          playClick();
          const email = inputRef.current?.value;
          if (email && email.includes('@') && email.includes('.')) onSubmit(email);
        }} style={{
          padding: '12px 24px', background: '#FFE033', color: '#0A1520', border: 'none', cursor: 'pointer',
          fontFamily: "'Lilita One', cursive", fontSize: '14px', borderRadius: '4px',
        }}>OK</button>
      </div>
    </div>
  );
}

// ── Referral Challenge sub-component ──────────────────────────────────────────

function ReferralChallenge({ pseudo }: { pseudo: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSend = async () => {
    playClick();
    const email = inputRef.current?.value?.trim();
    if (!email || !email.includes('@') || !email.includes('.')) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerPseudo: pseudo, friendEmail: email }),
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div style={{
      marginTop: '12px',
      padding: '16px',
      background: 'rgba(40,25,0,.4)',
      border: '1px solid #8B6508',
      borderRadius: '4px',
      animation: 'fadeIn 0.4s ease-out',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '14px', color: '#FFB347', letterSpacing: '2px' }}>
          ⚔️ DÉFIE UN COLLÈGUE
        </div>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', color: '#C8A040', letterSpacing: '1px', marginTop: '4px' }}>
          ENVOIE UN DÉFI PAR EMAIL — GAGNE +1 RTT SI TON AMI JOUE
        </div>
      </div>
      {status === 'sent' ? (
        <div style={{ textAlign: 'center', padding: '10px', color: '#00C8BE', fontFamily: "'Orbitron', sans-serif", fontSize: '11px', letterSpacing: '1px' }}>
          ✅ DÉFI ENVOYÉ ! RTT DÉBLOQUÉ QUAND IL JOUE
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            ref={inputRef}
            type="email"
            placeholder="email-du-collegue@enterprise.com"
            style={{
              flex: 1, padding: '12px 12px', fontFamily: "'Orbitron', sans-serif", fontSize: '11px',
              background: '#091E4A', color: '#fff', border: '1px solid #1A3E7A', outline: 'none', borderRadius: '4px',
              minWidth: 0,
            }}
          />
          <button
            onClick={handleSend}
            disabled={status === 'sending'}
            style={{
              padding: '12px 16px', background: status === 'sending' ? '#5A4400' : '#FFB347', color: '#0A1520',
              border: 'none', cursor: status === 'sending' ? 'wait' : 'pointer',
              fontFamily: "'Lilita One', cursive", fontSize: '11px', borderRadius: '4px', whiteSpace: 'nowrap',
              letterSpacing: '1px',
            }}
          >
            {status === 'sending' ? '...' : status === 'error' ? 'ERREUR' : 'ENVOYER LE DÉFI'}
          </button>
        </div>
      )}
    </div>
  );
}

export default React.memo(GameOverScreen);
