'use client';

import { GameState } from '@/lib/gameTypes';
import { addScore, formatDuration, formatSalary, getShareText } from '@/lib/leaderboard';
import { useEffect, useState, useRef } from 'react';
import { PlayerIdentity } from '@/components/ui/CharacterSelect';
import { playClick } from '@/lib/sounds';

interface Props {
  state: GameState;
  onRestart: () => void;
  playerIdentity?: PlayerIdentity | null;
  replayUrl?: string | null;
}

// ── WhatsApp share RTT tracker ────────────────────────────────────────────────
const WA_SHARE_KEY = 'guibour-wa-shares';
function getWaShares(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(WA_SHARE_KEY) ?? '0', 10);
}
function incWaShares(): number {
  const n = Math.min(getWaShares() + 1, 3);
  localStorage.setItem(WA_SHARE_KEY, String(n));
  return n;
}

// ── Instagram share image via Canvas ────────────────────────────────────────
function generateShareImage(pseudo: string, level: number, score: number): string {
  const w = 1080, h = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#0C2A62');
  grad.addColorStop(0.6, '#1A3F78');
  grad.addColorStop(1, '#264D82');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(0,120,220,0.12)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 56) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Border
  ctx.strokeStyle = '#00C8BE';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, w - 40, h - 40);
  ctx.strokeStyle = 'rgba(0,200,190,0.25)';
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, w - 64, h - 64);

  // Header bar
  ctx.fillStyle = '#0047AB';
  ctx.fillRect(20, 20, w - 40, 60);

  ctx.fillStyle = '#A8D8FF';
  ctx.font = 'bold 22px Orbitron, monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('GUIBOUR SYSTEM // W.O.W // 2026', 48, 58);

  // Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 110px Arial Black';
  ctx.textAlign = 'center';
  ctx.fillText('GUIBOUR', w / 2, 220);

  ctx.fillStyle = '#00D4CC';
  ctx.font = 'bold 36px Orbitron, monospace';
  ctx.letterSpacing = '16px';
  ctx.fillText('SYSTEM', w / 2, 270);

  // Divider
  ctx.fillStyle = '#00C8BE';
  ctx.fillRect(100, 295, w - 200, 3);

  // Employee ID
  ctx.fillStyle = '#5B9BD5';
  ctx.font = '20px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText(`EMPLOYÉ`, w / 2, 340);

  // Pseudo
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 72px Arial';
  ctx.letterSpacing = '4px';
  ctx.fillText(pseudo.toUpperCase(), w / 2, 440);

  // Stats grid
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
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText(stat.label, x + 138, y + 30);

    ctx.fillStyle = stat.color;
    ctx.font = 'bold 34px monospace';
    ctx.letterSpacing = '1px';
    ctx.fillText(stat.value, x + 138, y + 90);
  });

  // CTA
  ctx.fillStyle = '#0047AB';
  ctx.fillRect(200, 680, w - 400, 80);
  ctx.strokeStyle = '#00C8BE';
  ctx.lineWidth = 2;
  ctx.strokeRect(200, 680, w - 400, 80);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 26px Orbitron, monospace';
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.fillText('JOUE SUR GUIBOUR.FR', w / 2, 728);

  // Footer
  ctx.fillStyle = '#00C8BE';
  ctx.fillRect(20, h - 80, w - 40, 60);
  ctx.fillStyle = '#0C2A62';
  ctx.font = 'bold 22px monospace';
  ctx.letterSpacing = '6px';
  ctx.fillText('GUIBOUR.FR // W.O.W // #GUIBOUR2026', w / 2, h - 42);

  return canvas.toDataURL('image/png');
}

export default function GameOverScreen({ state, onRestart, playerIdentity, replayUrl }: Props) {
  const { player, level, status } = state;
  const isVictory = status === 'victory';
  const [rank, setRank] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // RTT bonus UI
  const [showRTTPanel, setShowRTTPanel] = useState(false);
  const [waShareCount, setWaShareCount] = useState(0);
  const [emailGiven, setEmailGiven] = useState(false);

  // Share image
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const canvasGenerated = useRef(false);

  const durationMs = state.endTime && state.startTime ? state.endTime - state.startTime : 0;
  const durationText = formatDuration(durationMs);
  const pseudo = playerIdentity?.pseudo || player.name || 'EMPLOYÉ';

  // Submit score to global API leaderboard + register player counter
  useEffect(() => {
    if (!saved) {
      setSaved(true);
      // Local leaderboard (legacy fallback)
      const r = addScore({ name: pseudo, score: player.score, level, date: new Date().toISOString() });
      setRank(r);
      // Global API leaderboard
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pseudo,
          score: player.score,
          level,
          employeeId: playerIdentity?.employeeId || `GS-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        }),
      })
        .then(res => res.json())
        .then(d => { if (d.rank) setRank(d.rank); })
        .catch(() => {});
      // Increment active player counter
      fetch('/api/players', { method: 'POST' }).catch(() => {});
    }
  }, [saved, pseudo, player, level, playerIdentity]);

  // Show big text, then content after 2.5s
  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 2500);
    return () => clearTimeout(t1);
  }, []);

  // Show RTT panel 500ms after content appears (only on game over)
  useEffect(() => {
    if (!isVictory && showContent) {
      const t = setTimeout(() => {
        setShowRTTPanel(true);
        setWaShareCount(getWaShares());
      }, 600);
      return () => clearTimeout(t);
    }
  }, [isVictory, showContent]);

  // Generate share image once
  useEffect(() => {
    if (showContent && !canvasGenerated.current) {
      canvasGenerated.current = true;
      try {
        const url = generateShareImage(pseudo, level, player.score);
        setShareImageUrl(url);
      } catch (_) {}
    }
  }, [showContent, pseudo, level, player.score]);

  useEffect(() => {
    if (playerIdentity) {
      setEmailGiven(!!(playerIdentity.email));
    }
  }, [playerIdentity]);

  const handleDownloadCertificate = async () => {
    playClick();
    const { generateCertificate } = await import('@/lib/generateCertificate');
    await generateCertificate({
      pseudo,
      employeeId: playerIdentity?.employeeId || 'GS-000000',
      level,
      score: player.score,
      rank: rank > 0 ? rank : undefined,
    });
  };

  const handleShare = async () => {
    playClick();
    const text = getShareText(pseudo, level, player.score, durationMs);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    playClick();
    if (waShareCount >= 3) return;
    const text = encodeURIComponent(
      `🎮 J'ai joué à W.O.W (Work Or Window) de Guibour !\n` +
      `Étage ${level} | ${formatSalary(player.score)} de salaire\n` +
      `Bats mon score → guibour.fr`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    const newCount = incWaShares();
    setWaShareCount(newCount);
  };

  const handleInstagramShare = () => {
    playClick();
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `guibour-wow-${pseudo.toLowerCase()}-lvl${level}.png`;
    link.click();
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 500);
  };

  const handleDownloadImage = () => {
    playClick();
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `guibour-wow-score.png`;
    link.click();
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
         style={{
           background: isVictory ? 'rgba(0,8,20,0.88)' : 'rgba(8,2,2,0.90)',
           backdropFilter: 'blur(5px)',
           overflowY: 'auto',
         }}>

      {/* ── BIG SLAM TEXT ── */}
      <div className="mb-6 text-center" style={{ pointerEvents: 'none', flexShrink: 0 }}>
        <h1 style={{
          fontFamily: "'Luckiest Guy', cursive",
          fontSize: isVictory ? 'clamp(58px, 10vw, 108px)' : 'clamp(64px, 12vw, 130px)',
          color: isVictory ? '#00C9C8' : '#FF2020',
          letterSpacing: isVictory ? '6px' : '3px',
          lineHeight: 0.92, display: 'block',
          animation: isVictory
            ? 'victorySlam 0.65s cubic-bezier(.15,0,.25,1) both, victoryGlow 2s ease-in-out infinite 0.7s'
            : 'scareSlam 0.65s cubic-bezier(.15,0,.25,1) both, scareGlow 2s ease-in-out infinite 0.7s',
        }}>
          {isVictory ? 'VOUS ÊTES\nLIBRE' : 'CAREER\nFAILED'}
        </h1>
        {!isVictory && (
          <p style={{
            fontFamily: "'Luckiest Guy', cursive",
            fontSize: 'clamp(32px, 6vw, 64px)',
            color: '#FF5050', letterSpacing: '8px', marginTop: '10px', display: 'block',
            animation: 'scareSlam 0.65s cubic-bezier(.15,0,.25,1) 0.18s both, scarePulse 1.8s ease-in-out infinite 0.85s',
          }}>
            GAME OVER
          </p>
        )}
        {isVictory && (
          <p style={{
            fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(11px, 1.8vw, 16px)',
            color: '#00C8BE', letterSpacing: '4px', marginTop: '16px', opacity: 0.8,
            animation: 'fadeIn 0.6s ease 0.8s both',
          }}>
            25 ÉTAGES — MISSION ACCOMPLIE
          </p>
        )}
      </div>

      {/* ── STATS MODAL ── */}
      {showContent && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px 16px', width: '100%', maxWidth: '960px' }}>

          {/* Main stats card */}
          <div className="w-[440px] max-w-[92vw] overflow-hidden shadow-2xl"
               style={{ animation: 'slideUp 0.4s ease-out', border: '2px solid #0047AB', background: '#fff', flexShrink: 0 }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ background: '#0047AB' }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FF5F56' }} />
                  <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#27C93F' }} />
                </div>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
                  {isVictory ? 'W.O.W — LIBERATION' : 'W.O.W — FIN DE CONTRAT'}
                </span>
              </div>
              <div className="flex gap-2 text-white/60" style={{ fontSize: '10px' }}><span>—</span><span>□</span><span>✕</span></div>
            </div>

            <div className="flex items-center border-b" style={{ borderColor: '#C0D0DE', background: '#FAFAFA' }}>
              <div className="flex items-center justify-center border-r px-2 py-1" style={{ borderColor: '#C0D0DE', background: '#E8E8E8' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#777' }}>fx</span>
              </div>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#0047AB', padding: '4px 8px' }}>
                =BILAN(&quot;{pseudo}&quot;, DUREE({durationText}), SALAIRE({formatSalary(player.score)}))
              </span>
            </div>

            <div className="p-5 text-center" style={{ background: '#F5F5F5' }}>
              <div style={{ background: '#fff', border: '1px solid #C8D8E8', padding: '10px', marginBottom: '12px' }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#607888' }}>DURÉE DANS LE SYSTÈME</span>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '32px', fontWeight: 800, color: '#0047AB', lineHeight: 1.2 }}>{durationText}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: '#C8D8E8', border: '1px solid #C8D8E8', marginBottom: '12px' }}>
                {[
                  { label: 'ÉTAGE', value: String(level).padStart(2, '0'), color: '#0A1520' },
                  { label: 'SALAIRE', value: formatSalary(player.score), color: '#0047AB' },
                  { label: 'CLASSEMENT', value: `#${rank}`, color: '#D4A020' },
                ].map(cell => (
                  <div key={cell.label} style={{ background: '#fff', padding: '8px 6px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#607888', letterSpacing: '2px', marginBottom: '2px' }}>{cell.label}</div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '18px', fontWeight: 700, color: cell.color }}>{cell.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button onClick={() => { playClick(); onRestart(); }} className="flex-1 cursor-pointer py-3 text-xs font-bold tracking-widest text-white transition-all hover:brightness-110 active:scale-[0.98]" style={{ fontFamily: "'Orbitron', sans-serif", background: '#0047AB', border: '1px solid #0A1520', minWidth: '80px' }}>
                  REJOUER
                </button>
                <button onClick={handleShare} className="flex-1 cursor-pointer py-3 text-xs font-bold tracking-widest transition-all hover:brightness-110 active:scale-[0.98]" style={{ fontFamily: "'Orbitron', sans-serif", background: '#00A89D', color: '#fff', border: '1px solid #0047AB', minWidth: '80px' }}>
                  {copied ? 'COPIÉ !' : 'PARTAGER'}
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  title="Télécharger votre certificat PDF"
                  className="cursor-pointer py-3 text-xs font-bold tracking-widest transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ fontFamily: "'Orbitron', sans-serif", background: 'linear-gradient(135deg, #C8960A, #A07008)', color: '#fff', border: '1px solid #FFE033', padding: '12px 14px', minWidth: '40px' }}
                >
                  📜
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-1" style={{ background: '#0047AB', borderTop: '1px solid #0F3320' }}>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>guibour.fr</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,0.6)' }}>#WOW #guibour</span>
            </div>
          </div>

          {/* Right side: share + RTT bonus */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '280px', maxWidth: '92vw', flexShrink: 0 }}>

            {/* Share on Instagram */}
            {shareImageUrl && (
              <div style={{
                background: '#0C2A62', border: '2px solid #C13584',
                borderRadius: '4px', padding: '14px',
                animation: 'slideUp 0.4s ease-out 0.15s both',
              }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#C13584', letterSpacing: '2px', marginBottom: '8px' }}>
                  📸 PARTAGER SUR INSTAGRAM
                </div>
                <img src={shareImageUrl} alt="Score card" style={{ width: '100%', borderRadius: '2px', marginBottom: '8px', border: '1px solid #1A3E7A' }} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleInstagramShare}
                    style={{
                      flex: 1, fontFamily: "'Orbitron', sans-serif", fontSize: '8px', letterSpacing: '1px',
                      padding: '8px', background: 'linear-gradient(135deg, #C13584, #E1306C)',
                      color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '2px',
                    }}
                  >
                    DL + INSTA →
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '8px', padding: '8px 10px',
                      background: 'transparent', color: '#5B9BD5', border: '1px solid #1A3E7A', cursor: 'pointer', borderRadius: '2px',
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            )}

            {/* Game Replay download */}
            {replayUrl && (
              <div style={{
                background: '#0C2A62', border: '2px solid #00C8BE',
                borderRadius: '4px', padding: '12px',
                animation: 'slideUp 0.4s ease-out 0.2s both',
              }}>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#00C8BE', letterSpacing: '2px', marginBottom: '8px' }}>
                  🎬 REPLAY — DERNIÈRES 10 SECONDES
                </div>
                <video
                  src={replayUrl}
                  controls
                  autoPlay
                  muted
                  loop
                  style={{ width: '100%', borderRadius: '2px', border: '1px solid #1A3E7A', marginBottom: '8px', maxHeight: '100px', objectFit: 'cover' }}
                />
                <a
                  href={replayUrl}
                  download={`wow-replay-${playerIdentity?.pseudo || 'player'}.webm`}
                  style={{
                    display: 'block', textAlign: 'center',
                    fontFamily: "'Orbitron', sans-serif", fontSize: '8px', letterSpacing: '2px',
                    padding: '8px', background: 'rgba(0,200,190,.12)',
                    color: '#00C8BE', border: '1px solid #1A3E7A', textDecoration: 'none', borderRadius: '2px',
                  }}
                >
                  ↓ TÉLÉCHARGER LE REPLAY (.webm)
                </a>
              </div>
            )}

            {/* RTT Bonus panel (only on game over, not victory) */}
            {showRTTPanel && !isVictory && (
              <div style={{
                background: '#0C2A62', border: '2px solid #FFE033',
                borderRadius: '4px', overflow: 'hidden',
                animation: 'slideUp 0.4s ease-out 0.3s both',
              }}>
                <div style={{ background: '#2A1A00', padding: '8px 14px' }}>
                  <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '16px', color: '#FFE033', letterSpacing: '2px' }}>
                    💼 GAGNER UN RTT
                  </div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#C8960A', marginTop: '2px' }}>
                    RÉCUPÈRE UNE VIE POUR TON PROCHAIN RUN
                  </div>
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                  {/* WhatsApp share x3 */}
                  <div style={{
                    background: waShareCount >= 3 ? 'rgba(0,200,190,.08)' : 'rgba(0,71,171,.1)',
                    border: `1px solid ${waShareCount >= 3 ? '#00C8BE' : '#1A3E7A'}`,
                    borderRadius: '3px', padding: '10px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#A8D8FF', letterSpacing: '1px' }}>
                        📱 PARTAGER SUR WHATSAPP
                      </span>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#FFE033' }}>
                        {waShareCount}/3
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#5B9BD5', marginBottom: '8px', lineHeight: 1.5 }}>
                      Partage le lien du jeu à tes potes — jusqu&apos;à 3 fois +1 RTT chacune
                    </div>
                    {/* Progress dots */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: i < waShareCount ? '#25D366' : '#1A3E7A',
                          transition: 'background .3s',
                        }} />
                      ))}
                    </div>
                    <button
                      onClick={handleWhatsAppShare}
                      disabled={waShareCount >= 3}
                      style={{
                        width: '100%', fontFamily: "'Orbitron', sans-serif", fontSize: '8px', letterSpacing: '1px',
                        padding: '8px', cursor: waShareCount >= 3 ? 'not-allowed' : 'pointer',
                        background: waShareCount >= 3 ? '#1A3E7A' : 'linear-gradient(135deg,#25D366,#128C7E)',
                        color: '#fff', border: 'none', borderRadius: '2px',
                        opacity: waShareCount >= 3 ? 0.5 : 1,
                      }}
                    >
                      {waShareCount >= 3 ? '✓ MAX ATTEINT' : `PARTAGER SUR WHATSAPP (+1 RTT)`}
                    </button>
                  </div>

                  {/* Email (once only) */}
                  {!emailGiven && (
                    <div style={{ background: 'rgba(0,71,171,.1)', border: '1px solid #1A3E7A', borderRadius: '3px', padding: '10px' }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#A8D8FF', letterSpacing: '1px', marginBottom: '6px' }}>
                        📧 LAISSE TON EMAIL (+1 RTT)
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          id="rtt-email-input"
                          style={{
                            flex: 1, padding: '6px 8px',
                            fontFamily: "'Orbitron', sans-serif", fontSize: '9px',
                            background: '#091E4A', color: '#fff', border: '1px solid #1A3E7A', outline: 'none',
                            borderRadius: '2px',
                          }}
                        />
                        <button
                          onClick={() => {
                            playClick();
                            const input = document.getElementById('rtt-email-input') as HTMLInputElement;
                            if (input?.value?.includes('@')) {
                              // Save to identity
                              const stored = localStorage.getItem('guibour-identity');
                              if (stored) {
                                const id = JSON.parse(stored);
                                id.email = input.value;
                                id.bonusRTT = (id.bonusRTT ?? 0) + 1;
                                localStorage.setItem('guibour-identity', JSON.stringify(id));
                              }
                              // Send to API (fire and forget)
                              fetch('/api/email-collect', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: input.value, pseudo, source: 'rtt-bonus' }),
                              }).catch(() => {});
                              setEmailGiven(true);
                            }
                          }}
                          style={{
                            padding: '6px 10px', background: '#0047AB', color: '#fff',
                            border: 'none', cursor: 'pointer', fontSize: '10px', borderRadius: '2px',
                          }}
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}

                  {emailGiven && (
                    <div style={{
                      background: 'rgba(0,200,190,.08)', border: '1px solid #00C8BE',
                      borderRadius: '3px', padding: '10px', textAlign: 'center',
                    }}>
                      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#00C8BE' }}>
                        ✓ EMAIL ENREGISTRÉ — +1 RTT ACCORDÉ AU PROCHAIN RUN
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => { playClick(); onRestart(); }}
                    style={{
                      width: '100%', fontFamily: "'Luckiest Guy', cursive", fontSize: '16px', letterSpacing: '3px',
                      color: '#fff', background: 'linear-gradient(135deg,#0047AB,#007B8A)',
                      border: '2px solid #00C8BE', padding: '12px', cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(0,200,190,.25)', marginTop: '4px',
                    }}
                  >
                    REJOUER →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
