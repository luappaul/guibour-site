'use client';

import { GameState } from '@/lib/gameTypes';
import { addScore, formatSalary, getRank, getShareText } from '@/lib/leaderboard';
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

  const handleShare = async () => {
    const text = getShareText(player.name, level, player.score);
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center"
         style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-[420px] max-w-[92vw] overflow-hidden rounded-lg shadow-2xl"
           style={{ animation: 'slideUp 0.4s ease-out' }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-3 py-2"
             style={{ background: isVictory ? '#F0C830' : '#E85B5B' }}>
          <div className="flex gap-1.5">
            <span className="block h-3 w-3 rounded-full bg-[rgba(0,0,0,0.2)]" />
            <span className="block h-3 w-3 rounded-full bg-[rgba(0,0,0,0.2)]" />
            <span className="block h-3 w-3 rounded-full bg-[rgba(0,0,0,0.2)]" />
          </div>
          <span className="text-xs font-bold" style={{ color: isVictory ? '#4A2800' : '#FFF' }}>
            {isVictory ? 'Guibour Corp. — Promotion !' : 'Guibour Corp. — Licenciement'}
          </span>
        </div>

        {/* Body */}
        <div className="bg-[#F5F5F5] p-6 text-center">
          <h2 className="mb-1 text-2xl font-bold text-[#1E293B]">
            {isVictory ? 'Felicitations !' : 'Fin de contrat'}
          </h2>
          <p className="mb-4 text-sm text-[#64748B]">
            {isVictory
              ? `${player.name}, vous etes promu(e) PDG de Guibour Corp.`
              : `${player.name}, votre CDD n'a pas ete renouvele.`}
          </p>

          {/* Stats grid */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-xs text-[#94A3B8]">Niveau</div>
              <div className="text-xl font-bold text-[#1E293B]">{level}</div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-xs text-[#94A3B8]">Salaire</div>
              <div className="text-xl font-bold text-[#217346]">{formatSalary(player.score)}</div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-xs text-[#94A3B8]">Classement</div>
              <div className="text-xl font-bold text-[#F0C830]">#{rank}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="flex-1 cursor-pointer rounded-lg py-3 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: 'linear-gradient(to bottom, #27AE60, #1E8C4D)' }}
            >
              Rejouer
            </button>
            <button
              onClick={handleShare}
              className="flex-1 cursor-pointer rounded-lg border border-[#CBD5E1] bg-white py-3 text-sm font-bold text-[#1E293B] transition-all hover:bg-[#F8FAFC] active:scale-[0.98]"
            >
              Partager
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
