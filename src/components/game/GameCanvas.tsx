'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createInitialState, startGame, updateGame, renderGame } from '@/lib/gameEngine';
import { GameState } from '@/lib/gameTypes';
import GameOverScreen from './GameOverScreen';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const rafRef = useRef<number>(0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'paused' | 'gameOver' | 'victory'>('idle');
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState('');

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

  // Init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resize();
    stateRef.current = createInitialState(canvas.width, canvas.height);
    const ctx = canvas.getContext('2d')!;
    renderGame(ctx, stateRef.current);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const loop = () => {
      if (!stateRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d')!;
      stateRef.current = updateGame(stateRef.current);

      if (stateRef.current.status === 'gameOver' || stateRef.current.status === 'victory') {
        setGameStatus(stateRef.current.status);
      }

      renderGame(ctx, stateRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameStatus]);

  // Keyboard
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      // Don't intercept keys when typing in an input/textarea
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
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, []);

  // Touch controls
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

  const handlePlay = () => setShowNameModal(true);

  const handleStart = () => {
    if (!playerName.trim()) return;
    setShowNameModal(false);
    const canvas = canvasRef.current!;
    stateRef.current = createInitialState(canvas.width, canvas.height);
    stateRef.current = startGame(stateRef.current, playerName.trim());
    setGameStatus('playing');
  };

  const handleRestart = () => {
    const canvas = canvasRef.current!;
    stateRef.current = createInitialState(canvas.width, canvas.height);
    stateRef.current = startGame(stateRef.current, playerName.trim());
    setGameStatus('playing');
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{ touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />

      {/* IDLE overlay — JOUER button */}
      {gameStatus === 'idle' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6"
             style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-lg md:text-5xl">
              GUIBUREAUCRACY
            </h1>
            <p className="mt-2 text-sm text-[#94A3B8]">Survivez aux dossiers volants de l'open space</p>
          </div>
          <button
            onClick={handlePlay}
            className="cursor-pointer rounded-xl px-12 py-4 text-xl font-black tracking-wide text-white shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(to bottom, #27AE60, #1E8C4D)',
              animation: 'pulse-gold 2s infinite',
            }}
          >
            JOUER
          </button>
          <div className="mt-4 text-center text-xs text-[#64748B]">
            <p>Fleches / ZQSD pour bouger — Espace pour tirer</p>
            <p className="mt-1">Mobile : gauche/droite pour bouger, centre pour tirer</p>
          </div>
        </div>
      )}

      {/* Name modal */}
      {showNameModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center"
             style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-[440px] max-w-[90vw] overflow-hidden rounded-xl shadow-2xl"
               style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex items-center gap-3 bg-[#217346] px-5 py-3">
              <div className="flex gap-2">
                <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FF5F56' }} />
                <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FFBD2E' }} />
                <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#27C93F' }} />
              </div>
              <span className="text-sm font-bold text-white">Guibour Corp. — Embauche</span>
            </div>
            <div className="bg-[#F5F5F5] p-8">
              <p className="mb-5 text-base text-[#475569]">Entrez votre nom d&apos;employe :</p>
              <input
                type="text"
                maxLength={16}
                autoFocus
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleStart()}
                placeholder="Nom..."
                className="mb-5 w-full rounded-lg border border-[#CBD5E1] bg-white px-5 py-3.5 text-base text-[#1E293B] outline-none transition-all focus:border-[#217346] focus:ring-2 focus:ring-[#217346]/30"
              />
              <button
                onClick={handleStart}
                className="w-full cursor-pointer rounded-lg py-4 text-base font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ background: 'linear-gradient(to bottom, #27AE60, #1E8C4D)' }}
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Victory overlay */}
      {(gameStatus === 'gameOver' || gameStatus === 'victory') && stateRef.current && (
        <GameOverScreen state={stateRef.current} onRestart={handleRestart} />
      )}
    </div>
  );
}
