'use client';

import React from 'react';

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

// ── WhatsApp share RTT tracker ────────────────────────────────────────────────────────────────────────────────

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

function GameOverScreen({ state, onRestart, playerIdentity, replayUrl }: Props) {

const { player, level, status } = state;

const isVictory = status === 'victory';

const [rank, setRank] = useState(0);

const [saved, setSaved] = useState(false);

const [copied, setCopied] = useState(false);

const [showContent, setShowContent] = useState(false);

const [showRTTPanel, setShowRTTPanel] = useState(false);

const [waShareCount, setWaShareCount] = useState(0);

const [emailGiven, setEmailGiven] = useState(false);

const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);

const canvasGenerated = useRef(false);

const durationMs = state.endTime && state.startTime ? state.endTime - state.startTime : 0;

const durationText = formatDuration(durationMs);

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

useEffect(() => {

if (!isVictory && showContent) {

const t = setTimeout(() => {

setShowRTTPanel(true);

setWaShareCount(getWaShares());

}, 600);

return () => clearTimeout(t);

}

}, [isVictory, showContent]);

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

setTimeout(() => window.open('https://www.instagram.com/', '_blank'), 500);

};

const handleDownloadImage = () => {

playClick();

if (!shareImageUrl) return;

const link = document.createElement('a');

link.href = shareImageUrl;

link.download = 'guibour-wow-score.png';

link.click();

};

return (

<div className="absolute inset-0 z-30 flex flex-col items-center justify-center"

style={{ background: isVictory ? 'rgba(0,8,20,0.88)' : 'rgba(4,0,0,0.95)', backdropFilter: 'blur(5px)', overflowY: 'auto' }}>

<div className="mb-6 text-center" style={{ pointerEvents: 'none', flexShrink: 0 }}>

<h1 style={{ fontFamily: "'Lilita One', cursive", fontSize: isVictory ? 'clamp(64px, 11vw, 116px)' : 'clamp(58px, 10vw, 108px)', color: isVictory ? '#00FFEE' : '#FF2020', letterSpacing: isVictory ? '8px' : '4px', lineHeight: 0.9, display: 'block', textShadow: isVictory ? '3px 4px 0 #002A28, 6px 8px 0 rgba(0,30,28,.7), 9px 12px 0 rgba(0,0,0,.4), 0 0 40px rgba(0,255,235,.7)' : '3px 4px 0 #2A0000, 6px 8px 0 rgba(40,0,0,.7), 9px 12px 0 rgba(0,0,0,.4), 0 0 40px rgba(255,30,30,.7)', animation: isVictory ? 'victorySlam 0.7s cubic-bezier(.15,0,.25,1) both, victoryGlow 2s ease-in-out infinite 0.8s' : 'scareSlam 0.7s cubic-bezier(.15,0,.25,1) both, scareGlow 2s ease-in-out infinite 0.8s' }}>

{isVictory ? 'VOUS ÊTES\nLIBRE' : 'FIN DE\nCARRIÈRE'}

</h1>

{!isVictory && (<p style={{ fontFamily: "'Lilita One', cursive", fontSize: 'clamp(30px, 5.5vw, 62px)', color: '#FF5050', letterSpacing: '5px', marginTop: '10px', display: 'block', textShadow: '2px 3px 0 #2A0000, 4px 6px 0 rgba(40,0,0,.6), 0 0 20px rgba(255,60,60,.5)', animation: 'scareSlam 0.7s cubic-bezier(.15,0,.25,1) 0.2s both, scarePulse 1.8s ease-in-out infinite 0.9s' }}>TU ES UN LOOSER</p>)}

{isVictory && (<p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(11px, 1.8vw, 16px)', color: '#00C8BE', letterSpacing: '5px', marginTop: '18px', opacity: 0.8, animation: 'fadeIn 0.6s ease 0.9s both' }}>25 ÉTAGES — MISSION ACCOMPLIE</p>)}

</div>

      {/* GUIBOUR DEFAITE */}
      {!isVictory && (
        <video autoPlay loop muted playsInline
          style={{ width: '180px', height: 'auto', flexShrink: 0, marginBottom: '4px', imageRendering: 'pixelated', filter: 'drop-shadow(0 0 18px rgba(255,30,30,0.7))' }}
          src="/game/player/guibour-defaite-v4.webm"
        />
      )}

{showContent && (

<div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 16px 16px', width: '100%', maxWidth: '960px' }}>

<div style={{ width: '400px', maxWidth: '92vw', background: '#0C1E40', border: '2px solid #0047AB', animation: 'slideUp 0.4s ease-out', flexShrink: 0, overflow: 'hidden' }}>

<div style={{ background: '#0047AB', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

<div style={{ display: 'flex', gap: '5px' }}>

<span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F56', display: 'inline-block' }} />

<span style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />

<span style={{ width: 9, height: 9, borderRadius: '50%', background: '#27C93F', display: 'inline-block' }} />

</div>

<span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#fff', letterSpacing: '2px' }}>{isVictory ? 'LIBERTÉ OBTENUE' : 'DOSSIER CLASSÉ'}</span>

<span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: 'rgba(255,255,255,.4)' }}>✕</span>

</div>

<div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

<div style={{ textAlign: 'center' }}>

<div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '22px', color: '#FFFFFF', letterSpacing: '4px' }}>{pseudo}</div>

<div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', letterSpacing: '3px' }}>EMPLOYÉ(E) DU MOIS</div>

</div>

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>

{[

{ label: 'ÉTAGE', value: `${String(level).padStart(2,'0')}/25`, color: '#FFE033' },

{ label: 'SALAIRE', value: formatSalary(player.score), color: '#00C8BE' },

{ label: 'RANG', value: rank > 0 ? `#${rank}` : '—', color: '#FF7744' },

].map(s => (

<div key={s.label} style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '10px 6px', textAlign: 'center' }}>

<div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#3C5A7A', letterSpacing: '2px', marginBottom: '4px' }}>{s.label}</div>

<div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '16px', fontWeight: 700, color: s.color }}>{s.value}</div>

</div>

))}

</div>

<div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

<span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', letterSpacing: '2px' }}>DURÉE</span>

<span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '14px', color: '#A8D8FF', fontWeight: 700 }}>{durationText}</span>

</div>

<div style={{ display: 'flex', gap: '8px' }}>

<button onClick={() => { playClick(); onRestart(); }} style={{ flex: 1, fontFamily: "'Luckiest Guy', cursive", fontSize: '15px', letterSpacing: '3px', color: '#fff', background: 'linear-gradient(135deg,#0047AB,#007B8A)', border: '2px solid #00C8BE', padding: '12px', cursor: 'pointer', transition: 'all .2s' }}>REJOUER</button>

<button onClick={handleShare} style={{ padding: '12px 14px', fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#00C8BE', background: 'transparent', border: '1px solid #1A3E7A', cursor: 'pointer' }}>{copied ? '✓' : '↗'}</button>

<button onClick={handleDownloadCertificate} title="Certificat PDF" style={{ padding: '12px 14px', fontFamily: "'Orbitron', sans-serif", fontSize: '14px', color: '#FFE033', background: 'transparent', border: '1px solid #3A2A00', cursor: 'pointer' }}>📜</button>

</div>

{shareImageUrl && (

<div style={{ display: 'flex', gap: '6px', alignItems: 'center', padding: '8px 10px', background: '#0A1828', border: '1px solid #2A1830' }}>

<img src={shareImageUrl} alt="Score" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '2px' }} />

<div style={{ flex: 1 }}>

<div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#C13584', letterSpacing: '1px', marginBottom: '4px' }}>PARTAGER LE SCORE</div>

<div style={{ display: 'flex', gap: '4px' }}>

<button onClick={handleInstagramShare} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', padding: '4px 8px', background: 'linear-gradient(135deg,#C13584,#E1306C)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '2px' }}>INSTA</button>

<button onClick={handleWhatsAppShare} disabled={waShareCount >= 3} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', padding: '4px 8px', background: waShareCount >= 3 ? '#1A3E7A' : '#25D366', color: '#fff', border: 'none', cursor: waShareCount >= 3 ? 'not-allowed' : 'pointer', borderRadius: '2px', opacity: waShareCount >= 3 ? 0.5 : 1 }}>WA {waShareCount}/3</button>

<button onClick={handleDownloadImage} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', padding: '4px 6px', background: 'transparent', color: '#5B9BD5', border: '1px solid #1A3E7A', cursor: 'pointer', borderRadius: '2px' }}>↓</button>

</div>

</div>

</div>

)}

{replayUrl && (

<div style={{ background: '#091E4A', border: '1px solid #1A3E7A', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>

<span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00C8BE', letterSpacing: '1px' }}>🎬 REPLAY</span>

<a href={replayUrl} download={`wow-replay-${pseudo}.webm`} style={{ marginLeft: 'auto', fontFamily: "'Orbitron', sans-serif", fontSize: '8px', padding: '5px 10px', background: 'rgba(0,200,190,.12)', color: '#00C8BE', border: '1px solid #1A3E7A', textDecoration: 'none', borderRadius: '2px' }}>↓ DL</a>

</div>

)}

{showRTTPanel && !isVictory && !emailGiven && (

<div style={{ background: '#1A1000', border: '1px solid #3A2A00', padding: '10px 12px' }}>

<div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#FFE033', letterSpacing: '2px', marginBottom: '6px' }}>💼 +1 RTT — LAISSE TON EMAIL</div>

<div style={{ display: 'flex', gap: '4px' }}>

<input type="email" placeholder="ton@email.com" id="rtt-email-input" style={{ flex: 1, padding: '6px 8px', fontFamily: "'Orbitron', sans-serif", fontSize: '9px', background: '#091E4A', color: '#fff', border: '1px solid #1A3E7A', outline: 'none' }} />

<button onClick={() => {

playClick();

const input = document.getElementById('rtt-email-input') as HTMLInputElement;

if (input?.value?.includes('@')) {

const stored = localStorage.getItem('guibour-identity');

if (stored) { const id = JSON.parse(stored); id.email = input.value; id.bonusRTT = (id.bonusRTT ?? 0) + 1; localStorage.setItem('guibour-identity', JSON.stringify(id)); }

fetch('/api/email-collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: input.value, pseudo, source: 'rtt-bonus' }) }).catch(() => {});

setEmailGiven(true);

}

}} style={{ padding: '6px 12px', background: '#FFE033', color: '#0A1520', border: 'none', cursor: 'pointer', fontFamily: "'Orbitron', sans-serif", fontSize: '9px', fontWeight: 700 }}>OK</button>

</div>

</div>

)}

{emailGiven && !isVictory && (

<div style={{ textAlign: 'center', fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#00C8BE', padding: '6px', border: '1px solid rgba(0,200,190,.2)' }}>✓ EMAIL ENREGISTRÉ — +1 RTT AU PROCHAIN RUN</div>

)}

</div>

<div style={{ background: '#0047AB', padding: '5px 14px', display: 'flex', justifyContent: 'space-between' }}>

<span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>guibour.fr</span>

<span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: 'rgba(255,255,255,.5)' }}>#WOW2026</span>

</div>

</div>

</div>

)}

</div>

);

}

export default React.memo(GameOverScreen);
