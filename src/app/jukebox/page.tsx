'use client';

import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import { useState } from 'react';

// ── CATALOGUE ────────────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: 1,
    title: "DON'T TALK TO ME",
    bpm: 128,
    mood: 'RAW',
    moodColor: '#FF4444',
    spotifyId: '0eAziZNCXORNa9kDbY91wE',
    youtubeId: 'oOdwfvDwXcM',
    hasClip: true,
    released: true,
  },
  {
    id: 2,
    title: 'LE 11',
    bpm: 95,
    mood: 'SOUL',
    moodColor: '#00C8BE',
    spotifyId: '6oEnxkmtM9Jw68Q9r3UkC2',
    youtubeId: null,
    hasClip: false,
    released: true,
  },
  {
    id: 3,
    title: '[PROCHAINEMENT]',
    bpm: null,
    mood: '???',
    moodColor: '#607888',
    spotifyId: null,
    youtubeId: null,
    hasClip: false,
    released: false,
  },
];

const WOW_PLAYLIST_URL =
  'https://open.spotify.com/playlist/0J6cPuFnzRn8IUVBP2Q2g8?si=wow_sounds_guibour';
const YOUTUBE_CHANNEL = 'https://www.youtube.com/@Guibour?sub_confirmation=1';
const SPOTIFY_ARTIST  = 'https://open.spotify.com/intl-fr/artist/6xSqhm0F1HfJXiudOKlrGL';

export default function JukeboxPage() {
  const [activeTrack, setActiveTrack] = useState(TRACKS[0]);
  const [view, setView] = useState<'audio' | 'clip'>('audio');
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  const handleSave = (trackId: number, spotifyId: string) => {
    window.open(`https://open.spotify.com/track/${spotifyId}`, '_blank');
    setSaved(prev => ({ ...prev, [trackId]: true }));
  };

  return (
    <div className="min-h-screen" style={{ background: '#0E2660' }}>
      <ExcelNav />
      <ExcelChrome formulaText='=PLAY("GUIBOUR_EP","VIDEO_MUSIC_BOX_2026") → BROADCAST_MODE_ON'>
        {/* global dark grid bg */}
        <div style={{
          backgroundImage: 'linear-gradient(rgba(0,255,235,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,235,.04) 1px,transparent 1px)',
          backgroundSize: '56px 34px',
          minHeight: 'calc(100vh - 52px)',
        }}>

        {/* ── HERO HEADER ── */}
        <div style={{
          background: 'linear-gradient(135deg,#06101F 0%,#0B1E4A 60%,#0A2C70 100%)',
          padding: '36px 48px 28px',
          borderBottom: '2px solid rgba(0,255,235,.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '24px', flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* CSS audio visualiser bars (pure decoration) */}
          <div style={{
            position: 'absolute', right: '48px', bottom: 0,
            display: 'flex', alignItems: 'flex-end', gap: '3px', height: '56px',
            opacity: 0.18,
          }}>
            {[22,38,18,50,30,44,24,48,16,36,28,42,20,46,32].map((h, i) => (
              <div key={i} style={{
                width: '4px', height: `${h}px`,
                background: '#00FFEE',
                borderRadius: '2px 2px 0 0',
                animation: `barBounce ${0.6 + (i % 5) * 0.12}s ease-in-out ${i * 0.05}s infinite alternate`,
              }} />
            ))}
          </div>

          <div>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#2A4060', letterSpacing: '5px', marginBottom: '6px' }}>
              02 / SALLE D&apos;ÉCOUTE
            </div>
            <h1 style={{
              fontFamily: "'Lilita One', cursive",
              fontSize: 'clamp(28px,5vw,52px)',
              color: '#FFFFFF', letterSpacing: '4px', lineHeight: 1,
              textShadow: '0 0 30px rgba(0,255,235,.2)', marginBottom: '6px',
            }}>VIDEO &amp; MUSIC BOX</h1>
            <div style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: '9px',
              color: '#00FFEE', letterSpacing: '4px',
              textShadow: '0 0 8px rgba(0,255,235,.6)',
            }}>ÉCOUTER · REGARDER · PARTAGER</div>
          </div>
        </div>

        <div style={{ padding: '28px 24px 60px', maxWidth: '940px', margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>

            {/* ── LEFT COLUMN — PLAYER + TRACKLIST ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* ── PLAYER ZONE ── */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* Player header bar */}
                <div style={{
                  background: '#0A2254',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #1A3E7A',
                }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block' }} />
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F', display: 'inline-block' }} />
                  </div>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '2px' }}>
                    GUIBOUR.JUKEBOX — {activeTrack.title}
                  </span>
                  {/* View toggle */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(['audio', 'clip'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => setView(v)}
                        disabled={v === 'clip' && !activeTrack.hasClip}
                        style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: '8px',
                          letterSpacing: '1px',
                          padding: '4px 10px',
                          background: view === v ? '#0047AB' : 'transparent',
                          color: view === v ? '#fff' : (v === 'clip' && !activeTrack.hasClip) ? '#2B4060' : '#5B9BD5',
                          border: `1px solid ${view === v ? '#00C8BE' : '#1A3E7A'}`,
                          cursor: (v === 'clip' && !activeTrack.hasClip) ? 'not-allowed' : 'pointer',
                          borderRadius: '2px',
                          transition: 'all .15s',
                        }}
                      >
                        {v === 'audio' ? '♪ AUDIO' : '▶ CLIP'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player iframe */}
                <div style={{ position: 'relative' }}>
                  {view === 'audio' && activeTrack.spotifyId ? (
                    <iframe
                      key={activeTrack.spotifyId}
                      src={`https://open.spotify.com/embed/track/${activeTrack.spotifyId}?utm_source=generator&theme=0`}
                      width="100%"
                      height="152"
                      style={{ display: 'block', border: 'none' }}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  ) : view === 'clip' && activeTrack.youtubeId ? (
                    <iframe
                      width="100%"
                      height="380"
                      src={`https://www.youtube.com/embed/${activeTrack.youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                      title={`${activeTrack.title} — Guibour`}
                      style={{ display: 'block', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div style={{
                      height: '152px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Orbitron', sans-serif", fontSize: '10px',
                      color: '#3C5A7A', letterSpacing: '3px',
                    }}>
                      {!activeTrack.released ? 'BIENTÔT DISPONIBLE' : 'PAS DE CLIP DISPONIBLE'}
                    </div>
                  )}
                </div>

                {/* Save + links bar */}
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  borderTop: '1px solid #1A3E7A',
                  background: '#091E4A',
                }}>
                  {activeTrack.spotifyId && (
                    <button
                      onClick={() => handleSave(activeTrack.id, activeTrack.spotifyId!)}
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '9px',
                        letterSpacing: '2px',
                        padding: '8px 16px',
                        background: saved[activeTrack.id] ? '#1A8A5A' : 'linear-gradient(135deg, #1DB954, #169940)',
                        color: '#fff',
                        border: '1px solid ' + (saved[activeTrack.id] ? '#27C93F' : '#1DB954'),
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'all .2s',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      {saved[activeTrack.id] ? '✓ ENREGISTRÉ' : '+ ENREGISTRER SUR SPOTIFY'}
                    </button>
                  )}
                  {activeTrack.youtubeId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${activeTrack.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '9px',
                        letterSpacing: '2px',
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #FF0000, #CC0000)',
                        color: '#fff',
                        border: '1px solid #FF4444',
                        textDecoration: 'none',
                        borderRadius: '2px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}
                    >
                      ▶ YOUTUBE
                    </a>
                  )}
                  <a
                    href={SPOTIFY_ARTIST}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: '9px',
                      letterSpacing: '2px',
                      padding: '8px 16px',
                      background: 'transparent',
                      color: '#1DB954',
                      border: '1px solid #1A3E7A',
                      textDecoration: 'none',
                      borderRadius: '2px',
                    }}
                  >
                    PROFIL ARTISTE →
                  </a>
                </div>
              </div>

              {/* ── TRACKLIST ── */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 80px',
                  padding: '8px 16px',
                  background: '#1A3E7A',
                  borderBottom: '1px solid #2B5090',
                }}>
                  {['#', 'TITRE', ''].map((h, i) => (
                    <div key={i} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#5B9BD5', letterSpacing: '2px' }}>
                      {h}
                    </div>
                  ))}
                </div>

                {/* Tracks */}
                {TRACKS.map((track, i) => {
                  const isActive = activeTrack.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => track.released && setActiveTrack(track)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '32px 1fr 80px',
                        padding: '12px 16px',
                        background: isActive ? 'rgba(0,71,171,.22)' : 'transparent',
                        borderBottom: '1px solid rgba(26,62,122,.4)',
                        cursor: track.released ? 'pointer' : 'default',
                        borderLeft: isActive ? '3px solid #00C8BE' : '3px solid transparent',
                        transition: 'all .15s',
                        opacity: track.released ? 1 : 0.4,
                      }}
                      onMouseEnter={e => { if (track.released && !isActive) e.currentTarget.style.background = 'rgba(0,71,171,.1)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: isActive ? '#00C8BE' : '#3C5A7A' }}>
                        {isActive ? '▶' : String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: isActive ? '#FFFFFF' : '#A8D8FF', letterSpacing: '1px' }}>
                          {track.title}
                        </div>
                        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#3C5A7A', marginTop: '2px' }}>
                          GUIBOUR {track.hasClip ? '· CLIP DISPO' : ''}
                        </div>
                      </div>
                      <div style={{ alignSelf: 'center' }}>
                        {track.spotifyId && (
                          <button
                            onClick={e => { e.stopPropagation(); handleSave(track.id, track.spotifyId!); }}
                            style={{
                              fontFamily: "'Orbitron', sans-serif", fontSize: '7px',
                              padding: '4px 8px', background: 'transparent',
                              color: saved[track.id] ? '#27C93F' : '#1DB954',
                              border: `1px solid ${saved[track.id] ? '#27C93F' : '#1A3E7A'}`,
                              cursor: 'pointer', borderRadius: '2px', whiteSpace: 'nowrap',
                            }}
                          >
                            {saved[track.id] ? '✓' : '+ SAVE'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT COLUMN — INFO + LINKS ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* About card — photo artiste */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{ background: '#1A3E7A', padding: '8px 14px', borderBottom: '1px solid #2B5090' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#A8D8FF', letterSpacing: '3px' }}>DOSSIER ARTISTE</span>
                </div>
                {/* Photo */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/artist-photo.jpg"
                    alt="Guibour"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  />
                  {/* Overlay gradient + name */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(6,16,40,.92))',
                    padding: '24px 14px 14px',
                  }}>
                    <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '22px', color: '#FFF', letterSpacing: '4px', textShadow: '0 0 14px rgba(0,255,235,.2)' }}>
                      GUIBOUR
                    </div>
                    <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '7px', color: '#00D4CC', letterSpacing: '4px', textShadow: '0 0 6px rgba(0,200,190,.5)' }}>
                      ARTISTE · EP 2026
                    </div>
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5', lineHeight: 1.7, letterSpacing: '0.5px' }}>
                    Artiste indépendant. Un EP en cours de sortie. Un jeu web. Une satire du monde du travail.
                    Work Or Window — le son du bureau qui brûle.
                  </p>
                </div>
              </div>

              {/* Platform links */}
              <div style={{
                background: '#0C2A62',
                border: '2px solid #1A3E7A',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{ background: '#1A3E7A', padding: '8px 14px', borderBottom: '1px solid #2B5090' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#A8D8FF', letterSpacing: '3px' }}>ÉCOUTER PARTOUT</span>
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'SPOTIFY', url: SPOTIFY_ARTIST, color: '#1DB954', icon: '🎵' },
                    { label: 'YOUTUBE', url: YOUTUBE_CHANNEL, color: '#FF0000', icon: '▶' },
                    { label: 'PLAYLIST W.O.W SOUNDS', url: WOW_PLAYLIST_URL, color: '#00C8BE', icon: '📋' },
                  ].map(({ label, url, color, icon }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        background: `${color}12`,
                        border: `1px solid ${color}30`,
                        borderRadius: '3px',
                        textDecoration: 'none',
                        transition: 'all .2s',
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: '9px',
                        color: color,
                        letterSpacing: '2px',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.borderColor = color; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = `${color}30`; }}
                    >
                      <span style={{ fontSize: '16px' }}>{icon}</span>
                      {label}
                      <span style={{ marginLeft: 'auto', opacity: 0.6 }}>→</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* YouTube subscribe — compact */}
              <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#0A0000', border: '2px solid #CC0000', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF0000'; e.currentTarget.style.boxShadow = '0 0 16px rgba(255,0,0,.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#CC0000'; e.currentTarget.style.boxShadow = 'none'; }}>
                <span style={{ fontSize: '22px' }}>▶</span>
                <div>
                  <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '13px', color: '#FF4444', letterSpacing: '2px', textShadow: '0 0 8px rgba(255,68,68,.6)' }}>S&apos;ABONNER</div>
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', color: '#884444', letterSpacing: '1px' }}>@GUIBOUR</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#FF4444', fontSize: '16px' }}>→</span>
              </a>
            </div>
          </div>
        </div>{/* maxWidth container */}

        <style>{`
          @keyframes barBounce {
            0%   { transform: scaleY(0.4); }
            100% { transform: scaleY(1);   }
          }
        `}</style>
        </div>{/* dark grid bg */}
      </ExcelChrome>
    </div>
  );
}
