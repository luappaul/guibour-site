'use client';

import { useEffect, useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import { getLeaderboard, formatSalary } from '@/lib/leaderboard';
import { LeaderboardEntry } from '@/lib/gameTypes';

export default function ResultatsPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setBoard(getLeaderboard());
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#1E293B' }}>
      <ExcelNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-xl shadow-lg">
          <div className="flex items-center gap-3 bg-[#217346] px-5 py-3">
            <div className="flex gap-2">
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FF5F56' }} />
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#FFBD2E' }} />
              <span className="block h-3.5 w-3.5 rounded-full" style={{ background: '#27C93F' }} />
            </div>
            <span className="text-sm font-bold text-white">Resultats.xlsx</span>
          </div>
          <div className="bg-[#F5F5F5] px-5 py-4">
            <p className="font-mono text-sm text-[#475569]">=CLASSEMENT(salaries, &quot;meilleurs&quot;)</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg shadow-lg">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'linear-gradient(to bottom, #F0F0F0, #DCDCDC)' }}>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#475569]">#</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-[#475569]">Employe</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#475569]">Niveau</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-[#475569]">Salaire</th>
              </tr>
            </thead>
            <tbody>
              {board.length === 0 && (
                <tr>
                  <td colSpan={4} className="bg-white px-4 py-8 text-center text-sm text-[#94A3B8]">
                    Aucun resultat. Jouez pour apparaitre ici !
                  </td>
                </tr>
              )}
              {board.map((entry, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}
                  style={i < 3 ? { borderLeft: `3px solid ${['#F0C830', '#94A3B8', '#CD7F32'][i]}` } : {}}
                >
                  <td className="px-4 py-3 text-sm font-bold text-[#475569]">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#1E293B]">{entry.name}</td>
                  <td className="px-4 py-3 text-right text-sm text-[#475569]">{entry.level}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-bold text-[#217346]">
                    {formatSalary(entry.score)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
