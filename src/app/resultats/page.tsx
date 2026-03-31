'use client';

import { useEffect, useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import { getLeaderboard, formatSalary } from '@/lib/leaderboard';
import { LeaderboardEntry } from '@/lib/gameTypes';

function getRankTitle(rank: number): string {
  if (rank === 1) return 'DIRECTEUR GÉNÉRAL';
  if (rank === 2) return 'DIRECTEUR';
  if (rank === 3) return 'MANAGER';
  return 'EMPLOYÉ';
}

function getRankColor(rank: number): string {
  if (rank === 1) return '#C8960A';
  if (rank === 2) return '#8FA5B8';
  if (rank === 3) return '#8B6914';
  return '#607888';
}

export default function ResultatsPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setBoard(getLeaderboard());
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#EEF3F8' }}>
      <ExcelNav />
      <ExcelChrome formulaText={`=RANK(JOUEURS) // TOTAL_ENTRÉES: ${board.length}`}>
        {/* Light content wrapper */}
        <div style={{ background: '#EEF3F8', minHeight: 'calc(100vh - 52px)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

            {/* Page title */}
            <div style={{ marginBottom: '32px' }}>
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '8px',
                color: '#8FA5B8',
                letterSpacing: '6px',
              }}>01 / CLASSEMENT</span>
              <h1 style={{
                fontFamily: "'Lilita One', cursive",
                fontSize: '36px',
                color: '#0D2B5E',
                letterSpacing: '4px',
                marginTop: '6px',
              }}>RÉSULTATS</h1>
              <div style={{
                width: '60px',
                height: '2px',
                background: 'linear-gradient(90deg, #0047AB, transparent)',
                marginTop: '6px',
              }} />
            </div>

            {/* Table */}
            <div style={{
              border: '1px solid #C8D8E8',
              overflow: 'hidden',
              background: '#fff',
            }}>
              {/* Header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 160px 100px 130px',
                background: '#1B3A6B',
                borderBottom: '2px solid #0047AB',
              }}>
                {['RANG', 'PSEUDO', 'TITRE', 'NIVEAU', 'SALAIRE'].map(col => (
                  <div key={col} style={{
                    padding: '10px 12px',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '8px',
                    fontWeight: 'bold',
                    color: '#5B9BD5',
                    letterSpacing: '2px',
                    borderRight: '1px solid rgba(91,155,213,.2)',
                  }}>
                    {col}
                  </div>
                ))}
              </div>

              {/* Empty state */}
              {board.length === 0 && (
                <div style={{
                  padding: '48px',
                  textAlign: 'center',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '11px',
                  color: '#8FA5B8',
                  letterSpacing: '2px',
                }}>
                  AUCUN RÉSULTAT — JOUEZ POUR APPARAÎTRE ICI
                </div>
              )}

              {/* Data rows */}
              {board.map((entry, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 160px 100px 130px',
                  background: i < 3 ? '#F0F7FF' : i % 2 === 0 ? '#fff' : '#F7FAFD',
                  borderBottom: '1px solid #C8D8E8',
                  borderLeft: i < 3 ? `3px solid ${getRankColor(i + 1)}` : '3px solid transparent',
                }}>
                  <div style={{
                    padding: '12px 12px',
                    fontFamily: "'Luckiest Guy', cursive",
                    fontSize: '18px',
                    color: getRankColor(i + 1),
                    borderRight: '1px solid #C8D8E8',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{
                    padding: '12px 12px',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '12px',
                    color: '#1A2B40',
                    fontWeight: i === 0 ? 700 : 400,
                    borderRight: '1px solid #C8D8E8',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {entry.name}
                  </div>
                  <div style={{
                    padding: '12px 12px',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '8px',
                    color: i < 3 ? '#007B8A' : '#8FA5B8',
                    letterSpacing: '1px',
                    borderRight: '1px solid #C8D8E8',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {getRankTitle(i + 1)}
                  </div>
                  <div style={{
                    padding: '12px 12px',
                    fontFamily: "'Luckiest Guy', cursive",
                    fontSize: '18px',
                    color: '#0047AB',
                    borderRight: '1px solid #C8D8E8',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {entry.level}
                  </div>
                  <div style={{
                    padding: '12px 12px',
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#C8960A',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {formatSalary(entry.score)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div style={{
              marginTop: '16px',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '7px',
              color: '#8FA5B8',
              letterSpacing: '2px',
            }}>
              =LAST_UPDATE() // CLASSEMENT LOCAL — DONNÉES SAUVEGARDÉES EN SESSION
            </div>
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
