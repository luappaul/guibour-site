'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';
import { formatSalary } from '@/lib/leaderboard';
import { LeaderboardEntry } from '@/lib/gameTypes';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getRankTitle(rank: number): string {
  if (rank === 1) return 'DIRECTEUR GÉNÉRAL';
  if (rank === 2) return 'DIRECTEUR';
  if (rank === 3) return 'MANAGER';
  return 'EMPLOYÉ';
}

const RANK_COLORS = ['#C8960A', '#8FA5B8', '#8B6914'];
const RANK_GLOW   = ['rgba(200,150,10,.6)', 'rgba(143,165,184,.5)', 'rgba(139,105,20,.5)'];
const MEDALS      = ['🥇', '🥈', '🥉'];
const HEIGHTS     = [120, 85, 65]; // podium column heights
const ORDER       = [1, 0, 2];     // centre = #1

// ── Image compression helper (client-side) ────────────────────────────────────
function compressImage(file: File, maxW = 300, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── Podium Card ───────────────────────────────────────────────────────────────
function PodiumCard({
  entry, rank, index, photo, isMe, onUploadPhoto, uploading,
}: {
  entry: LeaderboardEntry;
  rank: number; index: number;
  photo?: string; isMe: boolean;
  onUploadPhoto: (rank: number) => void;
  uploading: boolean;
}) {
  const c    = RANK_COLORS[index];
  const glow = RANK_GLOW[index];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '0', order: ORDER[index],
    }}>
      {/* Avatar area */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <div style={{
          width: rank === 1 ? '88px' : '72px',
          height: rank === 1 ? '88px' : '72px',
          borderRadius: '50%',
          border: `3px solid ${c}`,
          boxShadow: `0 0 20px ${glow}, 0 0 40px ${glow.replace('.6','.2').replace('.5','.2')}`,
          overflow: 'hidden',
          background: `radial-gradient(circle, rgba(${rank===1?'200,150,10':rank===2?'143,165,184':'139,105,20'},.15) 0%, rgba(14,38,96,.8) 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isMe ? 'pointer' : 'default',
          transition: 'box-shadow .3s',
        }}
          onClick={() => isMe && onUploadPhoto(rank)}
          title={isMe ? 'Cliquez pour ajouter votre photo' : undefined}
        >
          {photo ? (
            <img src={photo} alt={entry.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: rank === 1 ? '36px' : '28px', opacity: .7 }}>
              {MEDALS[index]}
            </span>
          )}
        </div>

        {/* Upload hint for current player */}
        {isMe && (
          <div style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: uploading ? '#3C5A7A' : c,
            border: '2px solid #0E2660',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', cursor: 'pointer',
            boxShadow: `0 0 8px ${glow}`,
            transition: 'all .2s',
          }}
            onClick={() => onUploadPhoto(rank)}
          >
            {uploading ? '⏳' : '📷'}
          </div>
        )}
      </div>

      {/* Info card */}
      <div style={{
        background: rank === 1
          ? 'linear-gradient(160deg, rgba(200,150,10,.12) 0%, rgba(14,38,96,.9) 100%)'
          : 'rgba(5,15,45,.85)',
        border: `1px solid ${c}55`,
        padding: '14px 20px', textAlign: 'center',
        minWidth: rank === 1 ? '160px' : '136px',
        boxShadow: rank === 1 ? `0 0 28px ${glow.replace('.6','.25')}` : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Rank number */}
        <div style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: rank === 1 ? '28px' : '22px',
          color: c,
          textShadow: `0 0 14px ${glow}, 1px 2px 0 rgba(0,0,0,.8)`,
          lineHeight: 1,
        }}>{rank}</div>

        <div style={{
          fontFamily: "'Lilita One', cursive", fontSize: '14px',
          color: '#F0F8FF', letterSpacing: '2px', marginTop: '5px',
          textShadow: '1px 2px 0 rgba(0,0,0,.6)',
        }}>{entry.name}</div>

        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
          color: c, letterSpacing: '2px', marginTop: '3px', opacity: .85,
          textShadow: `0 0 6px ${glow}`,
        }}>{getRankTitle(rank)}</div>

        <div style={{
          fontFamily: "'Lilita One', cursive", fontSize: rank === 1 ? '17px' : '14px',
          color: '#00FFEE', marginTop: '6px',
          textShadow: '0 0 10px rgba(0,255,235,.5), 1px 2px 0 rgba(0,0,0,.6)',
        }}>{formatSalary(entry.score)}</div>

        <div style={{
          fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
          color: '#2A4060', marginTop: '3px',
        }}>ÉTG {entry.level}</div>

        {isMe && (
          <div style={{
            marginTop: '8px', fontFamily: "'Orbitron', sans-serif",
            fontSize: '7px', color: c, letterSpacing: '2px',
            textShadow: `0 0 6px ${glow}`, opacity: .85,
          }}>▲ C&apos;EST VOUS</div>
        )}
      </div>

      {/* Podium column */}
      <div style={{
        width: '100%', height: `${HEIGHTS[index]}px`,
        background: `linear-gradient(to bottom, ${c}30, ${c}08)`,
        border: `1px solid ${c}33`, borderBottom: 'none',
        position: 'relative', overflow: 'hidden',
      }}>
        {rank === 1 && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '1px',
            background: `linear-gradient(90deg, transparent, ${c}, transparent)`,
            animation: 'rankScan 3s ease-in-out infinite',
          }} />
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResultatsPage() {
  const [board,        setBoard]       = useState<LeaderboardEntry[]>([]);
  const [playerCount,  setPlayerCount] = useState<number | null>(null);
  const [loading,      setLoading]     = useState(true);
  const [lastUpdate,   setLastUpdate]  = useState('');
  const [photos,       setPhotos]      = useState<Record<string, string>>({});
  const [uploading,    setUploading]   = useState(false);
  const [myEmpId,      setMyEmpId]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRankRef = useRef<number>(0);

  // Get current player's employeeId from localStorage
  useEffect(() => {
    try {
      const pid = localStorage.getItem('guibour_playerIdentity');
      if (pid) {
        const p = JSON.parse(pid) as { employeeId?: string };
        if (p.employeeId) setMyEmpId(p.employeeId);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard', { cache: 'no-store' });
      const data = await res.json() as { entries?: LeaderboardEntry[] };
      if (Array.isArray(data.entries)) {
        setBoard(data.entries);
        setLastUpdate(new Date().toLocaleTimeString('fr-FR'));
        // Fetch photos for top 3
        const ids = data.entries.slice(0, 3).map((e: LeaderboardEntry) => e.employeeId).filter(Boolean);
        if (ids.length > 0) {
          const pRes = await fetch(`/api/photo?ids=${ids.join(',')}`, { cache: 'no-store' });
          const pData = await pRes.json() as Record<string, string>;
          setPhotos(pData);
        }
      }
    } catch { /* silently fail */ } finally { setLoading(false); }
  }, []);

  const fetchCount = useCallback(async () => {
    try {
      const res  = await fetch('/api/players');
      const data = await res.json() as { count?: number };
      setPlayerCount(data.count ?? null);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchBoard();
    fetchCount();
    const id = setInterval(() => { fetchBoard(); fetchCount(); }, 30000);
    return () => clearInterval(id);
  }, [fetchBoard, fetchCount]);

  // Handle photo upload
  const handleUploadPhoto = useCallback((rank: number) => {
    uploadRankRef.current = rank;
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !myEmpId) return;
    e.target.value = '';
    setUploading(true);
    try {
      const b64 = await compressImage(file, 300, 0.78);
      await fetch('/api/photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: myEmpId, photo: b64 }),
      });
      setPhotos(prev => ({ ...prev, [myEmpId]: b64 }));
    } catch { /* ignore */ } finally { setUploading(false); }
  }, [myEmpId]);

  const topThree = board.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: '#0E2660' }}>
      <ExcelNav />
      <ExcelChrome formulaText={`=RANK(JOUEURS) // TOTAL:${board.length} // W.O.W_LEADERBOARD`}>

        <div style={{
          backgroundImage: 'linear-gradient(rgba(0,255,235,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.04) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
          minHeight: 'calc(100vh - 52px)',
        }}>

          {/* ── HEADER ── */}
          <div style={{
            background: 'linear-gradient(135deg,#06101F 0%,#0B1E4A 60%,#0A2C70 100%)',
            padding: '28px 48px 24px',
            borderBottom: '2px solid rgba(0,255,235,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <GlobeIcon size={52} color="#00FFEE" />
              <div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2A4060', letterSpacing: '5px', marginBottom: '4px' }}>
                  01 / CLASSEMENT
                </div>
                <div style={{
                  fontFamily: "'Lilita One', cursive",
                  fontSize: 'clamp(22px,4vw,36px)', color: '#F2F8FF',
                  letterSpacing: '4px', lineHeight: 1,
                  textShadow: '0 0 24px rgba(0,255,235,.18)',
                }}>RÉSULTATS</div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                  color: '#00FFEE', letterSpacing: '4px', marginTop: '4px',
                  textShadow: '0 0 8px rgba(0,255,235,.6)',
                }}>W.O.W — CLASSEMENT GÉNÉRAL</div>
              </div>
            </div>

            {/* Stats badges */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'EN JEU',    value: playerCount !== null ? `${playerCount} 🟢` : '...' },
                { label: 'INSCRITS',  value: String(board.length).padStart(3, '0') },
                { label: 'MEILLEUR',  value: board[0] ? formatSalary(board[0].score) : '—' },
                { label: 'NIVEAU MAX',value: board[0] ? `ÉTG ${board[0].level}` : '—' },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '10px 16px',
                  background: 'rgba(0,255,235,.03)',
                  border: '1px solid rgba(0,255,235,.12)',
                }}>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#2A4060', letterSpacing: '3px' }}>{s.label}</div>
                  <div style={{
                    fontFamily: "'Lilita One', cursive", fontSize: '18px',
                    color: '#00FFEE', marginTop: '3px',
                    textShadow: '0 0 10px rgba(0,255,235,.5), 1px 2px 0 rgba(0,0,0,.6)',
                  }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 60px' }}>

            {/* ── PODIUM ── */}
            {topThree.length >= 1 && (
              <div style={{ marginBottom: '56px' }}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                  color: '#2A4060', letterSpacing: '5px', marginBottom: '32px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  PODIUM
                  <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,rgba(0,255,235,.2),transparent)' }} />
                  {myEmpId && board.slice(0,3).some(e => e.employeeId === myEmpId) && (
                    <span style={{
                      fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                      color: '#00FFEE', letterSpacing: '2px', opacity: .75,
                    }}>📷 CLIQUEZ SUR VOTRE AVATAR POUR AJOUTER VOTRE PHOTO</span>
                  )}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'flex-end',
                  justifyContent: 'center', gap: '20px',
                }}>
                  {topThree.map((entry, i) => (
                    <PodiumCard
                      key={entry.employeeId ?? entry.name}
                      entry={entry} rank={i + 1} index={i}
                      photo={entry.employeeId ? photos[entry.employeeId] : undefined}
                      isMe={!!myEmpId && entry.employeeId === myEmpId}
                      onUploadPhoto={handleUploadPhoto}
                      uploading={uploading}
                    />
                  ))}
                </div>
              </div>
            )}

            {loading && board.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '60px',
                fontFamily: "'Orbitron', sans-serif", fontSize: '10px',
                color: '#2A4060', letterSpacing: '3px',
              }}>CHARGEMENT...</div>
            )}

            {/* ── TABLEAU ── */}
            {!loading && (
              <>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                  color: '#2A4060', letterSpacing: '5px', marginBottom: '14px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  CLASSEMENT COMPLET
                  <span style={{ flex: 1, height: '1px', background: 'linear-gradient(to right,rgba(0,255,235,.15),transparent)' }} />
                  <span style={{ fontSize: '7px' }}>={board.length} ENTRÉES</span>
                </div>

                <div style={{
                  border: '1px solid rgba(0,255,235,.1)',
                  overflow: 'hidden',
                  boxShadow: '0 0 30px rgba(0,0,0,.4)',
                }}>
                  {/* Table header */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '56px 1fr 170px 90px 150px',
                    background: 'rgba(0,0,0,.5)',
                    borderBottom: '2px solid rgba(0,255,235,.2)',
                  }}>
                    {['RANG', 'PSEUDO', 'TITRE', 'NIVEAU', 'SALAIRE'].map(col => (
                      <div key={col} style={{
                        padding: '10px 14px',
                        fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                        color: '#00FFEE', letterSpacing: '2px',
                        borderRight: '1px solid rgba(0,255,235,.06)',
                        textShadow: '0 0 6px rgba(0,255,235,.5)',
                      }}>{col}</div>
                    ))}
                  </div>

                  {board.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(2,8,28,.6)' }}>
                      <div style={{
                        fontFamily: "'Lilita One', cursive", fontSize: '22px',
                        color: '#1E3050', letterSpacing: '4px', marginBottom: '8px',
                      }}>AUCUN RÉSULTAT</div>
                      <div style={{
                        fontFamily: "'Orbitron', sans-serif", fontSize: '10px',
                        color: '#1A2A40', letterSpacing: '2px',
                      }}>JOUEZ POUR APPARAÎTRE ICI</div>
                    </div>
                  ) : board.map((entry, i) => {
                    const isMedal = i < 3;
                    const rc = isMedal ? RANK_COLORS[i] : null;
                    const isCurrentPlayer = !!myEmpId && entry.employeeId === myEmpId;
                    return (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '56px 1fr 170px 90px 150px',
                        background: isCurrentPlayer
                          ? 'rgba(0,255,235,.07)'
                          : isMedal
                          ? `${rc}0A`
                          : i % 2 === 0 ? 'rgba(5,15,45,.6)' : 'rgba(2,8,28,.5)',
                        borderBottom: '1px solid rgba(0,255,235,.04)',
                        borderLeft: `3px solid ${isMedal ? rc : isCurrentPlayer ? 'rgba(0,255,235,.5)' : 'transparent'}`,
                        transition: 'background .15s',
                      }}>
                        {/* Rang */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Lilita One', cursive", fontSize: '20px',
                          color: isMedal ? rc! : '#1E3050',
                          textShadow: isMedal ? `1px 2px 0 rgba(0,0,0,.7), 0 0 10px ${RANK_GLOW[i]}` : '1px 2px 0 rgba(0,0,0,.5)',
                          borderRight: '1px solid rgba(0,255,235,.04)',
                          display: 'flex', alignItems: 'center',
                        }}>{i + 1}</div>

                        {/* Pseudo */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Orbitron', sans-serif", fontSize: '12px',
                          color: isCurrentPlayer ? '#00FFEE' : isMedal ? '#E0F0FF' : '#4A6A88',
                          fontWeight: i === 0 ? 700 : 400,
                          borderRight: '1px solid rgba(0,255,235,.04)',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          textShadow: isCurrentPlayer ? '0 0 8px rgba(0,255,235,.5)' : 'none',
                        }}>
                          {i === 0 && <span>👑</span>}
                          {isCurrentPlayer && <span style={{ fontSize: '10px' }}>▶</span>}
                          {entry.name}
                        </div>

                        {/* Titre */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Orbitron', sans-serif", fontSize: '8px',
                          color: isMedal ? rc! : '#1E3050', letterSpacing: '1px',
                          borderRight: '1px solid rgba(0,255,235,.04)',
                          display: 'flex', alignItems: 'center',
                        }}>{getRankTitle(i + 1)}</div>

                        {/* Niveau */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Lilita One', cursive", fontSize: '18px',
                          color: isMedal ? '#A8D8FF' : '#2A4060',
                          textShadow: '1px 2px 0 rgba(0,0,0,.5)',
                          borderRight: '1px solid rgba(0,255,235,.04)',
                          display: 'flex', alignItems: 'center',
                        }}>{entry.level}</div>

                        {/* Salaire */}
                        <div style={{
                          padding: '12px 14px',
                          fontFamily: "'Lilita One', cursive", fontSize: '16px',
                          color: isMedal ? '#00FFEE' : '#2A4060',
                          textShadow: isMedal ? '0 0 8px rgba(0,255,235,.4), 1px 2px 0 rgba(0,0,0,.6)' : '1px 2px 0 rgba(0,0,0,.4)',
                          display: 'flex', alignItems: 'center',
                        }}>{formatSalary(entry.score)}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  marginTop: '12px',
                  fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                  color: '#1A2E48', letterSpacing: '2px',
                  display: 'flex', justifyContent: 'space-between',
                }}>
                  <span>=LAST_UPDATE() // {lastUpdate || '...'}</span>
                  <span>W.O.W · WORK OR WINDOW · 2026</span>
                </div>
              </>
            )}
          </div>
        </div>
      </ExcelChrome>

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef} type="file" accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <style>{`
        @keyframes rankScan {
          0%,100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
