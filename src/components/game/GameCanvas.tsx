'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState, startGame, updateGame, renderGame, setGameAssets } from '@/lib/gameEngine';
import { GameState } from '@/lib/gameTypes';
import { loadAllAssets, GameAssets } from '@/lib/assetLoader';
import { LEVELS } from '@/lib/levels';
import { audioManager } from '@/lib/audioManager';
import SponsoredSidebar from './SponsoredSidebar';
import GameOverScreen from './GameOverScreen';
import { PlayerIdentity } from '@/components/ui/CharacterSelect';
import { playClick } from '@/lib/sounds';

interface GameCanvasProps {
  characterName?: string;
  playerIdentity?: PlayerIdentity | null;
}

export default function GameCanvas({ characterName = '', playerIdentity }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const [gameStatus, setGameStatus] = useState<GameState['status']>('idle');
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState(characterName);
  const [assetsRef, setAssetsRef] = useState<GameAssets | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [hudInfo, setHudInfo] = useState({ lives: 3, score: 0, levelName: '', phrase: '' });
  const [showPhrase, setShowPhrase] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [elevatorActive, setElevatorActive] = useState(false);
  // YouTube subscribe popup (shown once between levels, around level 8-12)
  const [showYouTubePopup, setShowYouTubePopup] = useState(false);
  const youtubeShownRef = useRef(false);
  // Boss level 25 overlay
  const [showBossOverlay, setShowBossOverlay] = useState(false);
  const bossShownRef = useRef(false);
  // RTT bonus applied
  const bonusRTTApplied = useRef(false);
  // Direct DOM refs for timer (avoid React re-render per frame)
  const timerFillRef = useRef<HTMLDivElement>(null);
  const timerTextRef = useRef<HTMLSpanElement>(null);
  const timerFormulaRef = useRef<HTMLSpanElement>(null);
  // Game replay — rolling 10s MediaRecorder buffer
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [replayUrl, setReplayUrl] = useState<string | null>(null);

  // Load assets on mount
  useEffect(() => {
    loadAllAssets((loaded, total) => {
      setLoadProgress(Math.floor((loaded / total) * 100));
    }).then(a => {
      setAssetsRef(a);
      setGameAssets(a);
      audioManager.init(a);
      setAssetsLoaded(true);
    });
  }, []);

  // Stop all audio when leaving the game page
  useEffect(() => {
    return () => {
      audioManager.stop('gameplay');
      audioManager.stop('gameover');
    };
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    canvas.width = w;
    canvas.height = h;
    if (stateRef.current) {
      stateRef.current.canvasWidth = w;
      stateRef.current.canvasHeight = h;
    }
  }, []);

  useEffect(() => {
    if (!assetsLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    resize();
    stateRef.current = createInitialState(canvas.width, canvas.height);
    const ctx = canvas.getContext('2d')!;
    renderGame(ctx, stateRef.current);
    let _rTimer: ReturnType<typeof setTimeout>|null = null;
    const ro = new ResizeObserver(() => { if (_rTimer) clearTimeout(_rTimer); _rTimer = setTimeout(resize, 100); });
    ro.observe(canvas.parentElement!);
    window.addEventListener('resize', resize);

    // Auto-start when character pre-selected — wait 1 rAF so flex layout settles
    if (characterName) {
      requestAnimationFrame(() => {
        resize();
        if (stateRef.current) {
          stateRef.current = startGame(stateRef.current, characterName);
          setCurrentLevel(0);
          setGameStatus('playing');
          try { audioManager.play('gameplay'); } catch (_) {}
        }
      });
    }

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
      if (_rTimer) clearTimeout(_rTimer);
    };
  }, [resize, assetsLoaded]); // eslint-disable-line

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing' && gameStatus !== 'burnout' && gameStatus !== 'levelComplete') return;

    let lastLevel = -1;
    const loop = () => {
      if (!stateRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d')!;
      stateRef.current = updateGame(stateRef.current);

      const s = stateRef.current;

      if (s.status === 'gameOver' || s.status === 'victory') {
        setGameStatus(s.status);
      } else if (s.status === 'burnout' && gameStatus !== 'burnout') {
        setGameStatus('burnout');
      } else if (s.status === 'levelComplete' && gameStatus !== 'levelComplete') {
        setGameStatus('levelComplete');
        setElevatorActive(true);
        setTimeout(() => setElevatorActive(false), 1500);
      } else if (s.status === 'playing' && (gameStatus === 'burnout' || gameStatus === 'levelComplete')) {
        setGameStatus('playing');
      }

      // Apply bonus RTT on first frame of playing
      if (!bonusRTTApplied.current && playerIdentity && (playerIdentity.bonusRTT ?? 0) > 0) {
        bonusRTTApplied.current = true;
        s.player.lives = (s.player.lives ?? 3) + playerIdentity.bonusRTT;
      }

      // Update HUD info
      if (s.level !== lastLevel) {
        lastLevel = s.level;
        setCurrentLevel(s.level);
        const lc = LEVELS[s.level];
        if (lc) {
          setHudInfo(prev => ({ ...prev, levelName: lc.name, phrase: lc.phrase }));
          setShowPhrase(true);
          setTimeout(() => setShowPhrase(false), 3000);
        }
        // YouTube popup once between level 8-12
        if (s.level >= 8 && s.level <= 12 && !youtubeShownRef.current) {
          youtubeShownRef.current = true;
          setShowYouTubePopup(true);
        }
        // Boss level 25
        if (s.level >= 24 && !bossShownRef.current) {
          bossShownRef.current = true;
          setShowBossOverlay(true);
          setTimeout(() => setShowBossOverlay(false), 4000);
        }
      }
      // Only re-render HUD when values actually change (avoid 60fps React re-renders)
      setHudInfo(prev =>
        prev.lives === s.player.lives && prev.score === s.player.score
          ? prev
          : { ...prev, lives: s.player.lives, score: s.player.score }
      );

      // Update timer DOM directly (no React state = no re-render per frame)
      if (timerFillRef.current && s.timer) {
        const ratio = Math.max(0, s.timer.remaining / s.timer.total);
        const pct = (ratio * 100).toFixed(1);
        timerFillRef.current.style.width = pct + '%';
        const isRed = ratio < 0.15;
        const isOrange = ratio < 0.30;
        timerFillRef.current.style.background = isRed
          ? 'linear-gradient(90deg, #FF4444, #FF6666)'
          : isOrange
            ? 'linear-gradient(90deg, #FFA500, #FFD000)'
            : 'linear-gradient(90deg, #0047AB, #00A89D)';
        timerFillRef.current.style.boxShadow = isRed
          ? '0 0 8px rgba(255,68,68,0.6)'
          : '0 0 6px rgba(0,168,157,0.4)';
      }
      if (timerTextRef.current && s.timer) {
        timerTextRef.current.textContent = Math.ceil(s.timer.remaining) + 's';
      }
      if (timerFormulaRef.current && s.timer) {
        const secs = Math.ceil(s.timer.remaining);
        timerFormulaRef.current.textContent =
          `=DESTROY(DOSSIERS,SALAIRE) // RTT:${s.player.lives} // SCORE:${s.player.score.toLocaleString('fr-FR')}€ // TEMPS:${secs}s`;
      }

      renderGame(ctx, s);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameStatus]);

  // Keyboard input
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'q', 'd', 'z', 'w'].includes(e.key)) {
        e.preventDefault();
      }
      stateRef.current?.keys.add(e.key);
    };
    const onUp = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      stateRef.current?.keys.delete(e.key);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!stateRef.current) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < e.touches.length; i++) {
      const tx = e.touches[i].clientX - rect.left;
      const third = rect.width / 3;
      if (tx < third) stateRef.current.touchLeft = true;
      else if (tx > third * 2) stateRef.current.touchRight = true;
      else stateRef.current.touchShoot = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!stateRef.current) return;
    stateRef.current.touchLeft = false;
    stateRef.current.touchRight = false;
    stateRef.current.touchShoot = false;
  }, []);

  const handlePlay = () => {
    if (characterName) {
      // Character already selected from selection screen — start immediately
      const canvas = canvasRef.current!;
      const newState = createInitialState(canvas.width, canvas.height);
      stateRef.current = startGame(newState, characterName);
      setCurrentLevel(0);
      setGameStatus('playing');
      audioManager.play('gameplay');
    } else {
      setShowNameModal(true);
    }
  };

  const handleStart = () => {
    if (!playerName.trim()) return;
    setShowNameModal(false);
    const canvas = canvasRef.current!;
    stateRef.current = createInitialState(canvas.width, canvas.height);
    stateRef.current = startGame(stateRef.current, playerName.trim());
    setCurrentLevel(0);
    setGameStatus('playing');
    audioManager.play('gameplay');
  };

  const handleRestart = () => {
    const canvas = canvasRef.current!;
    stateRef.current = createInitialState(canvas.width, canvas.height);
    youtubeShownRef.current = false;
    bossShownRef.current = false;
    bonusRTTApplied.current = false;
    stateRef.current = startGame(stateRef.current, playerName.trim());
    setCurrentLevel(0);
    setGameStatus('playing');
    audioManager.play('gameplay');
  };

  // ── Game replay : rolling 10s canvas recording ──────────────────────────
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas || !('captureStream' in canvas)) return;

    let recorder: MediaRecorder | null = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stream = (canvas as any).captureStream(24);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';
      if (!mimeType) return;

      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 1_500_000 });
      recorderRef.current = recorder;
      chunksRef.current = [];

      // Rolling buffer: drop old chunks so we keep ≤ 10s
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
          // Keep only last ~10 chunks (timeslice=1000ms → ~10s)
          if (chunksRef.current.length > 12) chunksRef.current.shift();
        }
      };

      recorder.start(1000); // 1 chunk per second
    } catch (_) {}

    return () => {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    };
  }, [gameStatus]);

  // When game ends, finalize the replay blob
  useEffect(() => {
    if (gameStatus !== 'gameOver' && gameStatus !== 'victory') return;
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      if (blob.size > 0) {
        setReplayUrl(URL.createObjectURL(blob));
      }
    };
    recorder.stop();
  }, [gameStatus]);

  // Stop gameplay music on game over/victory
  useEffect(() => {
    if (gameStatus === 'gameOver') {
      audioManager.stop('gameplay');
      audioManager.play('gameover');
    } else if (gameStatus === 'victory') {
      audioManager.stop('gameplay');
    }
  }, [gameStatus]);

  const handleToggleMute = () => {
    playClick();
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  // Loading screen
  if (!assetsLoaded) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-5"
           style={{
             background: '#1A3F78',
             backgroundImage: 'linear-gradient(rgba(0,72,171,.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,72,171,.09) 1px, transparent 1px)',
             backgroundSize: '52px 32px',
           }}>
        <div style={{
          fontFamily: "'Lilita One', cursive",
          fontSize: 'clamp(52px, 10vw, 80px)',
          color: '#FFFFFF',
          letterSpacing: '6px',
          lineHeight: 1,
          animation: 'glowWhite 3s ease-in-out infinite',
        }}>
          W.O.W
        </div>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(11px, 1.8vw, 16px)',
          color: '#00D4CC',
          letterSpacing: '8px',
          fontWeight: 400,
          textShadow: '0 0 10px rgba(0,212,204,.4)',
        }}>
          WORK OR WINDOW
        </div>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(10px, 1.5vw, 13px)',
          color: '#5B9BD5',
          letterSpacing: '2px',
          marginTop: '-4px',
        }}>
          25 ÉTAGES — SURVIVEZ AUX DOSSIERS VOLANTS
        </div>
        {/* fx progress bar */}
        <div style={{ width: 'clamp(280px, 40vw, 420px)', marginTop: '8px' }}>
          <div style={{
            background: '#0C2A62',
            border: '1px solid #1A3E7A',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '3px',
          }}>
            <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#00D4CC', fontWeight: 700 }}>fx</span>
            <div style={{
              flex: 1,
              background: '#1C3660',
              border: '1px solid #1E3F6E',
              height: '14px',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${loadProgress}%`,
                background: 'linear-gradient(90deg, #0047AB, #00A89D)',
                borderRadius: '2px',
                boxShadow: '0 0 8px rgba(0,71,171,.5)',
                transition: 'width 0.2s ease',
              }} />
            </div>
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '11px',
            color: '#2B5090',
            textAlign: 'center',
            marginTop: '5px',
            letterSpacing: '2px',
          }}>
            =LOADING(&quot;GAME_ASSETS&quot;) // {loadProgress}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full" style={{
      background: '#1A3F78' }}>

      {/* ── LEFT COL: canvas + timer + HUD ── */}
      <div className="flex flex-col flex-1" style={{ minHeight: 0, minWidth: 0 }}>

{/* Game canvas area */}
        <div className="relative flex-1" style={{ background: '#0A1400', overflow: 'hidden', border: '2px solid #2C5F2E', boxSizing: 'border-box' }}>
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          />

          {/* ── MUTE BUTTON — top right of game area ── */}
          {(gameStatus === 'playing' || gameStatus === 'burnout' || gameStatus === 'levelComplete') && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20 }}>
              <button
                onClick={handleToggleMute}
                className="pointer-events-auto cursor-pointer"
                style={{
                  background: 'rgba(12,42,98,.85)',
                  border: `1px solid ${isMuted ? 'rgba(255,68,68,.4)' : 'rgba(0,200,190,.35)'}`,
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '18px',
                  color: isMuted ? '#FF4444' : '#00C8BE',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,.5)',
                  lineHeight: 1,
                }}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
            </div>
          )}

          

          {/* IDLE overlay */}
          {gameStatus === 'idle' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
                 style={{ background: 'rgba(4,12,24,0.82)', backdropFilter: 'blur(3px)' }}>
              <div className="text-center">
                <div style={{ fontFamily: "'Lilita One', cursive", fontSize: 'clamp(40px, 8vw, 72px)', color: '#FFFFFF', letterSpacing: '8px', animation: 'glowWhite 3s ease-in-out infinite', lineHeight: 1 }}>
                  W.O.W
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '14px', color: '#A8D8FF', letterSpacing: '6px', marginTop: '6px' }}>
                  WORK OR WINDOW
                </div>
                <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#5B9BD5', letterSpacing: '2px', marginTop: '8px' }}>
                  25 ÉTAGES — SURVIVEZ AUX DOSSIERS VOLANTS
                </div>
              </div>
              <button
                onClick={handlePlay}
                className="cursor-pointer active:scale-95"
                style={{ fontFamily: "'Lilita One', cursive", fontSize: '20px', letterSpacing: '4px', color: '#fff', background: 'linear-gradient(135deg, #0047AB, #007B8A)', border: '2px solid #00C8BE', padding: '14px 48px', boxShadow: '0 0 16px rgba(0,200,190,.25)', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '6px' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #1B5EBB, #008B9A)'; e.currentTarget.style.boxShadow = '0 0 28px rgba(0,200,190,.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #0047AB, #007B8A)'; e.currentTarget.style.boxShadow = '0 0 16px rgba(0,200,190,.25)'; }}
              >
                JOUER À <span style={{ color: '#00C8BE', textShadow: '0 0 10px rgba(0,200,190,.6)', marginLeft: '6px' }}>W.O.W</span>
              </button>
              <div className="text-center" style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#3C5A7A', letterSpacing: '1px' }}>
                <p>FLÈCHES / ZQSD POUR BOUGER — ESPACE POUR TIRER</p>
              </div>
            </div>
          )}

          {/* ── THUMB CONTROLS ── */}
          {(gameStatus === 'playing' || gameStatus === 'burnout') && (
            <>
              {currentLevel === 0 ? (
                /* ── ÉTAGE 00 — contrôles avec tutoriel ── */
                <div style={{ position: 'absolute', top: '12px', left: '10px', zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  {/* Label COMMANDES */}
                  <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '8px', letterSpacing: '4px', color: '#00C8BE', textShadow: '0 0 8px rgba(0,200,190,.6)', alignSelf: 'flex-start' }}>
                    COMMANDES :
                  </div>
                  {/* ESPACE — shoot button */}
                  <button
                    className="thumb-btn"
                    style={{
                      width: '160px', height: '44px',
                      background: 'rgba(0,200,190,.12)',
                      border: '2px solid rgba(0,200,190,.5)',
                      borderRadius: '10px',
                      color: '#00C8BE',
                      fontFamily: "'Orbitron', sans-serif", fontSize: '11px', letterSpacing: '4px', fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0,0,0,.4), 0 0 10px rgba(0,200,190,.15)',
                    }}
                    onTouchStart={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchShoot = true; }}
                    onTouchEnd={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchShoot = false; }}
                    onTouchCancel={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchShoot = false; }}
                    onMouseDown={() => { if(stateRef.current) stateRef.current.touchShoot = true; }}
                    onMouseUp={() => { if(stateRef.current) stateRef.current.touchShoot = false; }}
                    onMouseLeave={() => { if(stateRef.current) stateRef.current.touchShoot = false; }}
                  >
                    ESPACE
                  </button>
                  {/* Flèches gauche / droite */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="thumb-btn"
                      style={{ width: '76px', height: '64px', background: 'rgba(0,200,190,.10)', border: '2px solid rgba(0,200,190,.35)', borderRadius: '10px', color: '#00C8BE', fontSize: '30px', boxShadow: '0 4px 12px rgba(0,0,0,.4)' }}
                      onTouchStart={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchLeft = true; }}
                      onTouchEnd={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchLeft = false; }}
                      onTouchCancel={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchLeft = false; }}
                      onMouseDown={() => { if(stateRef.current) stateRef.current.touchLeft = true; }}
                      onMouseUp={() => { if(stateRef.current) stateRef.current.touchLeft = false; }}
                      onMouseLeave={() => { if(stateRef.current) stateRef.current.touchLeft = false; }}
                    >◀</button>
                    <button
                      className="thumb-btn"
                      style={{ width: '76px', height: '64px', background: 'rgba(0,200,190,.10)', border: '2px solid rgba(0,200,190,.35)', borderRadius: '10px', color: '#00C8BE', fontSize: '30px', boxShadow: '0 4px 12px rgba(0,0,0,.4)' }}
                      onTouchStart={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchRight = true; }}
                      onTouchEnd={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchRight = false; }}
                      onTouchCancel={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchRight = false; }}
                      onMouseDown={() => { if(stateRef.current) stateRef.current.touchRight = true; }}
                      onMouseUp={() => { if(stateRef.current) stateRef.current.touchRight = false; }}
                      onMouseLeave={() => { if(stateRef.current) stateRef.current.touchRight = false; }}
                    >▶</button>
                  </div>
                </div>
              ) : (
                /* ── Étages 1+ — boutons discrets sans labels ── */
                <>
                  <div style={{ position: 'absolute', bottom: '12px', left: '10px', display: 'flex', gap: '6px', zIndex: 15 }}>
                    <button className="thumb-btn" style={{ width: '64px', height: '64px', background: 'rgba(0,200,190,.08)', border: '1px solid rgba(0,200,190,.25)', borderRadius: '10px', color: '#00C8BE', fontSize: '26px' }}
                      onTouchStart={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchLeft = true; }}
                      onTouchEnd={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchLeft = false; }}
                      onTouchCancel={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchLeft = false; }}
                      onMouseDown={() => { if(stateRef.current) stateRef.current.touchLeft = true; }}
                      onMouseUp={() => { if(stateRef.current) stateRef.current.touchLeft = false; }}
                      onMouseLeave={() => { if(stateRef.current) stateRef.current.touchLeft = false; }}
                    >◀</button>
                    <button className="thumb-btn" style={{ width: '64px', height: '64px', background: 'rgba(0,200,190,.08)', border: '1px solid rgba(0,200,190,.25)', borderRadius: '10px', color: '#00C8BE', fontSize: '26px' }}
                      onTouchStart={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchRight = true; }}
                      onTouchEnd={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchRight = false; }}
                      onTouchCancel={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchRight = false; }}
                      onMouseDown={() => { if(stateRef.current) stateRef.current.touchRight = true; }}
                      onMouseUp={() => { if(stateRef.current) stateRef.current.touchRight = false; }}
                      onMouseLeave={() => { if(stateRef.current) stateRef.current.touchRight = false; }}
                    >▶</button>
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', right: '10px', zIndex: 15 }}>
                    <button className="thumb-btn" style={{ width: '80px', height: '80px', background: 'rgba(0,71,171,.18)', border: '2px solid rgba(0,200,190,.4)', borderRadius: '50%', color: '#00C8BE', fontSize: '26px', boxShadow: '0 4px 16px rgba(0,200,190,.2)' }}
                      onTouchStart={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchShoot = true; }}
                      onTouchEnd={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchShoot = false; }}
                      onTouchCancel={e => { e.preventDefault(); if(stateRef.current) stateRef.current.touchShoot = false; }}
                      onMouseDown={() => { if(stateRef.current) stateRef.current.touchShoot = true; }}
                      onMouseUp={() => { if(stateRef.current) stateRef.current.touchShoot = false; }}
                      onMouseLeave={() => { if(stateRef.current) stateRef.current.touchShoot = false; }}
                    >●</button>
                  </div>
                </>
              )}
            </>
          )}

          {/* Name modal */}
          {showNameModal && (
            <div className="absolute inset-0 z-30 flex items-center justify-center"
                 style={{ background: 'rgba(10,21,32,0.7)', backdropFilter: 'blur(4px)' }}>
              <div className="w-[440px] max-w-[90vw] overflow-hidden shadow-2xl"
                   style={{ animation: 'slideUp 0.3s ease-out', border: '2px solid #0047AB', background: '#fff' }}>
                <div className="flex items-center justify-between px-3 py-2" style={{ background: '#0047AB' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FF5F56' }} />
                      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: '#27C93F' }} />
                    </div>
                    <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', fontWeight: 700, color: '#fff', letterSpacing: '1px' }}>
                      W.O.W — EMBAUCHE
                    </span>
                  </div>
                  <div className="flex gap-2 text-white/60" style={{ fontSize: '12px' }}>
                    <span>—</span><span>□</span><span>&#10005;</span>
                  </div>
                </div>
                <div className="flex items-center border-b" style={{ borderColor: '#C0D0DE', background: '#FAFAFA' }}>
                  <div className="flex items-center justify-center border-r px-2 py-1" style={{ borderColor: '#C0D0DE', background: '#E8E8E8' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#777' }}>fx</span>
                  </div>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', color: '#0047AB', padding: '4px 8px' }}>
                    =EMBAUCHE(NOM_EMPLOYE)
                  </span>
                </div>
                <div className="p-6" style={{ background: '#F5F5F5' }}>
                  <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#607888', letterSpacing: '1px', marginBottom: '14px' }}>
                    ENTREZ VOTRE NOM D&apos;EMPLOYÉ :
                  </p>
                  <input
                    type="text"
                    maxLength={16}
                    autoFocus
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleStart()}
                    placeholder="Nom..."
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '16px', width: '100%', padding: '10px 12px', border: '1px solid #C8D8E8', background: '#fff', color: '#0A1520', outline: 'none', marginBottom: '14px' }}
                  />
                  <button
                    onClick={() => { playClick(); handleStart(); }}
                    className="w-full cursor-pointer py-3 transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '14px', fontWeight: 700, letterSpacing: '4px', color: '#fff', background: '#0047AB', border: '1px solid #0A1520' }}
                  >
                    COMMENCER
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over / Victory */}
          {(gameStatus === 'gameOver' || gameStatus === 'victory') && stateRef.current && (
            <GameOverScreen
              state={stateRef.current}
              onRestart={handleRestart}
              playerIdentity={playerIdentity}
              replayUrl={replayUrl}
            />
          )}

          {/* YouTube Subscribe popup — between levels, one-time */}
          {showYouTubePopup && (
            <div className="absolute inset-0 z-40 flex items-center justify-center"
                 style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
              <div style={{
                width: '360px', maxWidth: '92vw',
                background: '#0C2A62', border: '2px solid #FF0000',
                borderRadius: '6px', overflow: 'hidden',
                animation: 'slideUp 0.3s ease-out',
              }}>
                <div style={{ background: '#CC0000', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '10px', color: '#fff', letterSpacing: '2px', fontWeight: 700 }}>
                    ▶ GUIBOUR — YOUTUBE
                  </span>
                  <button onClick={() => { playClick(); setShowYouTubePopup(false); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>✕</button>
                </div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>▶</div>
                  <div style={{ fontFamily: "'Luckiest Guy', cursive", fontSize: '22px', color: '#FFFFFF', letterSpacing: '3px', marginBottom: '6px' }}>
                    ABONNE-TOI
                  </div>
                  <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5', lineHeight: 1.6, marginBottom: '16px' }}>
                    Retrouve les clips de Guibour sur YouTube. Ton abonnement c&apos;est du carburant pour la prochaine prod.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <a
                      href="https://www.youtube.com/@Guibour?sub_confirmation=1"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => { playClick(); setShowYouTubePopup(false); }}
                      style={{
                        fontFamily: "'Orbitron', sans-serif", fontSize: '10px', letterSpacing: '2px',
                        padding: '10px 20px', background: 'linear-gradient(135deg,#FF0000,#CC0000)',
                        color: '#fff', border: '1px solid #FF4444', textDecoration: 'none',
                        borderRadius: '2px',
                      }}
                    >
                      S&apos;ABONNER →
                    </a>
                    <button
                      onClick={() => { playClick(); setShowYouTubePopup(false); }}
                      style={{
                        fontFamily: "'Orbitron', sans-serif", fontSize: '9px', letterSpacing: '2px',
                        padding: '10px 14px', background: 'transparent',
                        color: '#3C5A7A', border: '1px solid #1A3E7A', cursor: 'pointer',
                        borderRadius: '2px',
                      }}
                    >
                      CONTINUER
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Boss Level 25 — screen takeover */}
          {showBossOverlay && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                 style={{ background: 'rgba(60,0,0,0.96)' }}>
              <div style={{
                fontFamily: "'Luckiest Guy', cursive",
                fontSize: 'clamp(60px, 14vw, 140px)',
                color: '#FF0000',
                letterSpacing: '4px',
                lineHeight: 0.9,
                textAlign: 'center',
                animation: 'scareSlam 0.5s cubic-bezier(.15,0,.25,1) both, scareGlow 1.5s ease-in-out infinite 0.5s',
              }}>
                ⚠ BOSS<br />FINAL
              </div>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 'clamp(12px, 2vw, 18px)',
                color: '#FF6666',
                letterSpacing: '6px',
                marginTop: '20px',
                animation: 'fadeIn 0.5s ease 0.8s both',
              }}>
                ÉTAGE 25 — DERNIER NIVEAU
              </div>
            </div>
          )}
        </div>
        {/* ── TIMER BAR (canvas-width only) ── */}
        {(gameStatus === 'playing' || gameStatus === 'burnout' || gameStatus === 'levelComplete') && (
          <div style={{ flexShrink: 0, background: '#0D1F3C', borderTop: '2px solid #1A3E7A', fontFamily: "'Orbitron', sans-serif" }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '100%', borderRight: '1px solid #1A3E7A', background: '#0C2A62', flexShrink: 0 }}>
                <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '12px', color: '#00D4CC', fontWeight: 700 }}>fx</span>
              </div>
              <div style={{ flex: 1, padding: '0 10px', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#0C2A62', border: '1px solid #1A3E7A', height: '20px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div ref={timerFillRef} style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #0047AB, #00C8BE)', boxShadow: '0 0 8px rgba(0,200,190,.5)', transition: 'background 0.3s ease' }} />
                </div>
                <span ref={timerFormulaRef} style={{ display: 'none' }} />
                <span ref={timerTextRef} style={{ display: 'none' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── HUD ROW: RTT + elevator + SALAIRE (collé tour) ── */}
        {(gameStatus === 'playing' || gameStatus === 'burnout' || gameStatus === 'levelComplete') && (
          <div style={{ flexShrink: 0, background: '#1A3F78', display: 'flex', alignItems: 'center', borderTop: '2px solid #00C8BE' }}>
            {/* RTT */}
            <div style={{ background: '#0C2A62', padding: '6px 20px', textAlign: 'center', borderRight: '1px solid #1A3E7A', flexShrink: 0 }}>
              <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '9px', color: '#5B9BD5', letterSpacing: '3px', marginBottom: '2px' }}>RTT</div>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '38px', color: '#FF4444', lineHeight: 1, textShadow: '0 0 14px rgba(255,68,68,.6)' }}>{'\u2764'.repeat(Math.max(0, hudInfo.lives))}</div>
            </div>
            {/* Ascenseur: nom + numéro d'étage */}
            <div key={currentLevel} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px', animation: 'elevatorFloorIn .35s cubic-bezier(.15,0,.25,1) both' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#050E1F', border: '1px solid #1A3E7A', borderRadius: '4px', padding: '4px 20px', position: 'relative', overflow: 'hidden', minWidth: '90px' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 7px, rgba(26,62,122,0.3) 7px, rgba(26,62,122,0.3) 8px)', pointerEvents: 'none' }} />
                <div style={{ fontSize: '7px', fontFamily: "'Orbitron', sans-serif", color: '#5B9BD5', letterSpacing: '3px', position: 'relative', marginBottom: '1px' }}>ÉTAGE</div>
                <div style={{ fontSize: '28px', fontFamily: "'Orbitron', sans-serif", fontWeight: 'bold', color: '#00C8BE', lineHeight: 1, textShadow: '0 0 12px rgba(0,200,190,0.9)', position: 'relative' }}>{String(currentLevel + 1).padStart(2, '0')}</div>
                <div style={{ fontSize: '7px', fontFamily: "'Orbitron', sans-serif", color: '#A8D8FF', letterSpacing: '1px', position: 'relative', marginTop: '2px', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{hudInfo.levelName}</div>
              </div>
            </div>
            {/* SALAIRE - collé à la tour */}
            <div style={{ flexShrink: 0, background: '#0A1628', borderLeft: '2px solid #1A3E7A', padding: '8px 14px', textAlign: 'center', fontFamily: "'Orbitron', sans-serif" }}>
              <div style={{ fontSize: '9px', color: '#5B9BD5', letterSpacing: '3px', marginBottom: '2px' }}>SALAIRE</div>
              <div style={{ fontFamily: "'Lilita One', cursive", fontSize: '22px', color: '#00C8BE', lineHeight: 1, textShadow: '0 0 14px rgba(0,200,190,.6)' }}>{hudInfo.score.toLocaleString('fr-FR')}€</div>
            </div>
          </div>
        )}
      </div>{/* end LEFT COL */}
    </div>
  );
}
