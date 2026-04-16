'use client';

import React from 'react';

import { GameState } from '@/lib/gameTypes';

import { addScore, formatSalary } from '@/lib/leaderboard';

import { useEffect, useState, useRef } from 'react';

import { PlayerIdentity } from '@/components/ui/CharacterSelect';

import { playClick } from '@/lib/sounds';

import { launchConfetti } from '@/lib/confetti';

import ScreenCrack from './ScreenCrack';

/** Real chroma-key: draws video frame-by-frame on a canvas, replacing green pixels with transparency */
function ChromaKeyVideo({ src, width }: { src: string; width: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let animId: number;
    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || video.paused || video.ended) { animId = requestAnimationFrame(draw); return; }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = frame.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // Green screen: green is dominant and bright enough
        if (g > 80 && g > r * 1.3 && g > b * 1.3) {
          d[i + 3] = 0; // make transparent
        }
      }
      ctx.putImageData(frame, 0, 0);
      animId = requestAnimationFrame(draw);
    };

    video.addEventListener('play', () => { animId = requestAnimationFrame(draw); });
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '16px 0 8px', display: 'flex', justifyContent: 'center' }}>
      <video ref={videoRef} autoPlay loop muted playsInline src={src}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
      />
      <canvas ref={canvasRef}
        style={{
          width: `${width}px`, height: 'auto',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 0 14px rgba(255,30,30,0.5))',
        }}
      />
    </div>
  );
}

interface Props {

state: GameState;

onRestart: () => void;

playerIdentity?: PlayerIdentity | null;

replayUrl?: string | null;

}

// ── Player profile tracker (localStorage) ─────────────────────────────────────

const PROFILE_KEY = 'guibour-player-profile';

interface PlayerProfile {
  email?: string;
  phone?: string;
  waShared?: boolean;
  igShared?: boolean;
  diplomaDownloaded?: boolean;
  defeatCount: number;
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


// ── Instagram share image via Canvas ────────────────────────────────────────────────────

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

ctx.strokeStyle = 'rgba(0,200,190,0.25)';

ctx.lineWidth = 2;

ctx.strokeRect(32, 32, w - 64, h - 64);

ctx.fillStyle = '#0047AB';

ctx.fillRect(20, 20, w - 40, 60);

ctx.fillStyle = '#A8D8FF';

ctx.font = 'bold 22px Orbitron, monospace';

ctx.fillText('GUIBOUR SYSTEM // W.O.W // 2026', 48, 58);

ctx.fillStyle = '#FFFFFF';

ctx.font = 'bold 110px Arial Black';

ctx.textAlign = 'center';

ctx.fillText('GUIBOUR', w / 2, 220);

ctx.fillStyle = '#00D4CC';

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

/** Email CTA component */
function EmailCTA({ onEmail }: { onEmail: (input: HTMLInputElement | null) => void }) {
  const emailRef = useRef<HTMLInputElement>(null);
  return (
    <div style={{ padding: '16px', borderRadius: '4px', animation: 'fadeIn 0.4s ease-out', background: 'rgba(26,16,0,.6)', border: '1px solid #5A4400' }}>
      <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '16px', color: '#FFE033', letterSpacing: '1px', marginBottom: '6px' }}>
        GAGNE +1 RTT MAINTENANT
      </div>
      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#C8A040', letterSpacing: '1px', marginBottom: '12px', lineHeight: 1.6 }}>
        Laisse ton email et debloque un jour de RTT bonus sur cette partie !
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <input ref={emailRef} type="email" placeholder="ton@email.com" style={{
          flex: 1, padding: '12px 14px', fontFamily: "'Orbitron', sans-serif", fontSize: '12px',
          background: '#091E4A', color: '#fff', border: '1px solid #1A3E7A', outline: 'none', borderRadius: '4px',
        }} />
        <button onClick={() => onEmail(emailRef.current)} style={{
          padding: '12px 20px', background: '#FFE033', color: '#0A1520', border: 'none', cursor: 'pointer',
          fontFamily: "'Lilita One', cursive", fontSize: '16px', fontWeight: 700, borderRadius: '4px',
        }}>OK</button>
      </div>
    </div>
  );
}

/** Share buttons grid */
function ShareButtons({ pseudo, level, score, shareImageUrl, onDiploma }: {
  pseudo: string; level: number; score: number;
  shareImageUrl: string | null; onDiploma: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl = 'https://guibour.fr';
  const scoreCardUrl = `${siteUrl}/api/score-card?pseudo=${encodeURIComponent(pseudo)}&score=${score}&level=${level}`;
  const shareText = `J'ai atteint l'etage ${level} avec ${score.toLocaleString('fr-FR')} points sur GUIBOUR SYSTEM W.O.W ! 🏢 Bats mon score → guibour.fr`;

  const btnBase: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '4px', cursor: 'pointer',
    fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '2px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    transition: 'all .2s', border: 'none',
  };

  const handleTwitter = () => {
    playClick();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(scoreCardUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleWhatsApp = () => {
    playClick();
    const waText = `${shareText}\n${scoreCardUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
  };

  const handleCopyLink = async () => {
    playClick();
    try {
      await navigator.clipboard.writeText(scoreCardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleDownload = () => {
    playClick();
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `guibour-wow-${pseudo.toLowerCase()}-lvl${level}.png`;
    link.click();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Twitter/X */}
      <button onClick={handleTwitter} style={{ ...btnBase, background: '#000', color: '#fff', border: '1px solid #333' }}>
        PARTAGER SUR X
      </button>
      {/* WhatsApp */}
      <button onClick={handleWhatsApp} style={{ ...btnBase, background: '#25D366', color: '#fff' }}>
        WHATSAPP
      </button>
      {/* Copy link */}
      <button onClick={handleCopyLink} style={{ ...btnBase, background: copied ? '#00C8BE' : 'rgba(0,71,171,0.3)', color: copied ? '#0A1520' : '#A8D8FF', border: '1px solid #1A3E7A' }}>
        {copied ? 'LIEN COPIE !' : 'COPIER LE LIEN'}
      </button>
      {/* Download image */}
      <button onClick={handleDownload} style={{ ...btnBase, background: 'rgba(0,71,171,0.3)', color: '#A8D8FF', border: '1px solid #1A3E7A' }}>
        TELECHARGER IMAGE
      </button>
      {/* Diploma — full width */}
      <button onClick={onDiploma} style={{
        ...btnBase, gridColumn: '1 / -1',
        background: 'rgba(58,42,0,0.4)', color: '#FFE033', border: '1px solid #5A4400',
      }}>
        TELECHARGE TON DIPLOME
      </button>
    </div>
  );
}

function GameOverScreen({ state, onRestart, playerIdentity, replayUrl }: Props) {

const { player, level, status } = state;

const isVictory = status === 'victory';

const [rank, setRank] = useState(0);
const [saved, setSaved] = useState(false);
const [showContent, setShowContent] = useState(false);
const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
const canvasGenerated = useRef(false);
const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
const confettiFired = useRef(false);
const [profile, setProfile] = useState<PlayerProfile>({ defeatCount: 0 });
const [ctaDone, setCtaDone] = useState(false);
const [crackDone, setCrackDone] = useState(false);

const pseudo = playerIdentity?.pseudo || player.name || 'EMPLOYÉ';

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

employeeId: playerIdentity?.employeeId || `GS-${Math.random().toString(36).slice(2,8).toUpperCase()}`,

}),

})

.then(res => res.json())

.then(d => { if (d.rank) setRank(d.rank); })

.catch(() => {});

fetch('/api/players', { method: 'POST' }).catch(() => {});

}

}, [saved, pseudo, player, level, playerIdentity]);

useEffect(() => {

const t1 = setTimeout(() => setShowContent(true), 2500);

return () => clearTimeout(t1);

}, []);

// Crack animation done after 1.5s (defeat only)
useEffect(() => {
  if (isVictory) { setCrackDone(true); return; }
  const t = setTimeout(() => setCrackDone(true), 1500);
  return () => clearTimeout(t);
}, [isVictory]);

// Load profile + increment defeat count on mount
useEffect(() => {
  const p = getProfile();
  // Carry over email from playerIdentity if we have it
  if (playerIdentity?.email && !p.email) p.email = playerIdentity.email;
  if (!isVictory) p.defeatCount = (p.defeatCount || 0) + 1;
  const updated = updateProfile(p);
  setProfile(updated);
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// Launch confetti on victory (stage 25) or top 10 leaderboard
useEffect(() => {
  if (!showContent || confettiFired.current) return;
  const shouldFire = isVictory || (rank > 0 && rank <= 10);
  if (!shouldFire) return;

  confettiFired.current = true;
  const canvas = confettiCanvasRef.current;
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    launchConfetti(canvas);
  }
}, [showContent, rank, isVictory]);

useEffect(() => {
  if (showContent && !canvasGenerated.current) {
    canvasGenerated.current = true;
    try {
      const url = generateShareImage(pseudo, level, player.score);
      setShareImageUrl(url);
    } catch (_) {}
  }
}, [showContent, pseudo, level, player.score]);

// ── CTA handlers ──

const handleCTAEmail = (inputEl: HTMLInputElement | null) => {
  playClick();
  if (!inputEl?.value?.includes('@')) return;
  const updated = updateProfile({ email: inputEl.value });
  setProfile(updated);
  setCtaDone(true);
  // Also store in identity
  const stored = localStorage.getItem('guibour-identity');
  if (stored) { const id = JSON.parse(stored); id.email = inputEl.value; id.bonusRTT = (id.bonusRTT ?? 0) + 1; localStorage.setItem('guibour-identity', JSON.stringify(id)); }
  fetch('/api/email-collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inputEl.value, pseudo, source: 'rtt-bonus' }) }).catch(() => {});
};


const handleCTADiploma = async () => {
  playClick();
  const { generateCertificate } = await import('@/lib/generateCertificate');
  await generateCertificate({ pseudo, employeeId: playerIdentity?.employeeId || 'GS-000000', level, score: player.score, rank: rank > 0 ? rank : undefined });
  const updated = updateProfile({ diplomaDownloaded: true });
  setProfile(updated);
  setCtaDone(true);
};


return (

<div className="absolute inset-0 z-30 flex flex-col items-center justify-center"
  style={{ background: isVictory ? 'rgba(0,8,20,0.65)' : 'rgba(4,0,0,0.60)', backdropFilter: 'blur(4px)', overflowY: 'auto', gap: '0px' }}>

  {/* Confetti canvas overlay */}
  <canvas
    ref={confettiCanvasRef}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 50,
    }}
  />

  {/* Screen crack overlay for defeat */}
  {!isVictory && <ScreenCrack />}

  {/* ── TITLE — outside the card, full width, scary ── */}
  {!isVictory ? (
    <div style={{
      textAlign: 'center',
      marginBottom: '12px',
      animation: 'shakeTitle 0.15s ease-in-out infinite',
    }}>
      <div style={{
        fontFamily: "'Lilita One', cursive",
        fontSize: 'clamp(42px, 10vw, 72px)',
        color: '#FF1111',
        letterSpacing: '6px',
        lineHeight: 1,
        textShadow: '0 0 30px rgba(255,0,0,.7), 0 0 60px rgba(255,0,0,.4), 3px 4px 0 rgba(80,0,0,.8)',
        textTransform: 'uppercase',
      }}>
        FIN DE CARRIÈRE
      </div>
      <div style={{
        fontFamily: "'Lilita One', cursive",
        fontSize: 'clamp(16px, 3.5vw, 26px)',
        color: '#FF6666',
        letterSpacing: '8px',
        marginTop: '6px',
        textShadow: '0 0 20px rgba(255,0,0,.5)',
      }}>
        TU ES UN LOSER
      </div>
      <style>{`@keyframes shakeTitle {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px) rotate(-0.5deg); }
        75% { transform: translateX(3px) rotate(0.5deg); }
      }`}</style>
    </div>
  ) : (
    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
      <div style={{
        fontFamily: "'Lilita One', cursive",
        fontSize: 'clamp(36px, 8vw, 60px)',
        color: '#FFFFFF',
        letterSpacing: '4px',
        lineHeight: 1,
        textShadow: '0 0 30px rgba(0,200,190,.5), 3px 4px 0 rgba(0,0,0,.4)',
      }}>
        VOUS ÊTES LIBRE
      </div>
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '12px',
        color: '#A8FFE0',
        letterSpacing: '5px',
        marginTop: '6px',
      }}>
        25 ÉTAGES — MISSION ACCOMPLIE
      </div>
    </div>
  )}

  {/* ── Central popup card ── */}
  <div style={{
    width: '420px', maxWidth: '92vw',
    background: 'rgba(12,30,64,0.95)',
    border: `2px solid ${isVictory ? '#00C8BE' : '#FF4444'}`,
    borderRadius: '8px',
    animation: 'slideUp 0.4s ease-out',
    overflow: 'hidden',
    boxShadow: isVictory
      ? '0 0 60px rgba(0,200,190,.3), 0 20px 60px rgba(0,0,0,.6)'
      : '0 0 60px rgba(255,40,40,.3), 0 20px 60px rgba(0,0,0,.6)',
  }}>

    {/* Defeat animation — real chroma-key via canvas */}
    {!isVictory && <ChromaKeyVideo src="/game/player/guibour-defaite-v5.webm" width={160} />}

    {/* Content — visible after animation delay */}
    {showContent && (
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Player name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: '26px',
            color: '#FFFFFF',
            letterSpacing: '3px',
          }}>{pseudo}</div>
        </div>

        {/* Score: just salary */}
        <div style={{
          background: '#091E4A',
          border: '1px solid #1A3E7A',
          padding: '16px',
          textAlign: 'center',
          borderRadius: '4px',
        }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            color: '#5B9BD5',
            letterSpacing: '3px',
            marginBottom: '8px',
          }}>SALAIRE GAGNÉ</div>
          <div style={{
            fontFamily: "'Lilita One', cursive",
            fontSize: '38px',
            color: '#00C8BE',
            textShadow: '0 0 20px rgba(0,200,190,.4)',
          }}>{formatSalary(player.score)}</div>
        </div>

        {/* Étage + Rang inline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '12px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '2px', marginBottom: '6px' }}>ÉTAGE</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FFE033' }}>{String(level).padStart(2,'0')}/25</div>
          </div>
          <div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '12px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '2px', marginBottom: '6px' }}>RANG</div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '20px', fontWeight: 700, color: '#FF7744' }}>{rank > 0 ? `#${rank}` : '—'}</div>
          </div>
        </div>

        {/* REJOUER — always visible */}
        <button onClick={() => { playClick(); onRestart(); }} style={{
          width: '100%',
          fontFamily: "'Lilita One', cursive",
          fontSize: '20px',
          letterSpacing: '4px',
          color: '#fff',
          background: 'linear-gradient(135deg,#0047AB,#007B8A)',
          border: '2px solid #00C8BE',
          padding: '16px',
          cursor: 'pointer',
          borderRadius: '4px',
          transition: 'all .2s',
        }}>REJOUER</button>

        {/* ── Email CTA (if no email yet) ── */}
        {!isVictory && !profile.email && !ctaDone && (
          <EmailCTA onEmail={handleCTAEmail} />
        )}

        {ctaDone && !profile.email && !isVictory && (
          <div style={{
            textAlign: 'center', fontFamily: "'Lilita One', cursive", fontSize: '15px',
            color: '#00C8BE', padding: '14px', border: '1px solid rgba(0,200,190,.3)',
            borderRadius: '4px', letterSpacing: '2px',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            BONUS +1 RTT ACTIVE
          </div>
        )}

        {/* ── Share buttons — always visible ── */}
        <ShareButtons
          pseudo={pseudo}
          level={level}
          score={player.score}
          shareImageUrl={shareImageUrl}
          onDiploma={handleCTADiploma}
        />
      </div>
    )}

    {/* Footer */}
    <div style={{ background: isVictory ? '#004D48' : '#5A0000', padding: '6px 14px', display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>guibour.fr</span>
      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>#WOW2026</span>
    </div>
  </div>

</div>

);

}

export default React.memo(GameOverScreen);
