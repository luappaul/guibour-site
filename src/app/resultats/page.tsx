'use client';

import { useEffect, useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import { getLeaderboard, formatSalary } from '@/lib/leaderboard';
import { LeaderboardEntry } from '@/lib/gameTypes';

function getRankTitle(rank: number): string {
  if (rank === 1) return '▲ DIRECTEUR GÉNÉRAL';
  if (rank === 2) return '▲ DIRECTEUR';
  if (rank === 3) return '▲ MANAGER';
  return '─ EMPLOYÉ';
}

export default function ResultatsPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setBoard(getLeaderboard());
  }, []);

  return (
    <div className="min-h-screen">
      <ExcelNav />
      <ExcelChrome formulaText={`=RANK(JOUEURS) // TOTAL_ENTRÉES: ${board.length}`}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
          {/* Page title */}
          <div style={{ marginBottom: '32px' }}>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '8px',
              color: '#00A89D',
              letterSpacing: '6px',
            }}>01 / CLASSEMENT</span>
            <h1 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '28px',
              fontWeight: 800,
              color: '#1A2530',
              letterSpacing: '2px',
              marginTop: '8px',
            }}>RÉSULTATS</h1>
            <div style={{
              width: '60px',
              height: '2px',
              background: 'linear-gradient(90deg, #00A89D, transparent)',
              marginTop: '8px',
            }} />
          </div>

          {/* Table */}
          <div style={{ border: '1px solid #C8D8E8', background: 'white' }}>
            {/* Header row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 140px 120px 120px',
              background: '#EBF0F5',
              borderBottom: '2px solid #C0D0DE',
            }}>
              {['RANG', 'PSEUDO', 'TITRE', 'NIVEAU', 'SALAIRE'].map(col => (
                <div key={col} style={{
                  padding: '10px 12px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '8px',
                  fontWeight: 'bold',
                  color: '#607888',
                  letterSpacing: '2px',
                  borderRight: '1px solid #C0D0DE',
                }}>
                  {col}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {board.length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '14px',
                color: '#607888',
              }}>
                Aucun résultat. Jouez pour apparaître ici !
              </div>
            )}
            {board.map((entry, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 140px 120px 120px',
                background: i < 1 ? '#D4E8FF' : i % 2 === 0 ? 'white' : '#F4F8FB',
                borderBottom: '1px solid #C8D8E8',
                ...(i < 1 ? { border: '1px solid #0047AB' } : {}),
              }}>
                <div style={{
                  padding: '10px 12px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#1A2530',
                  borderRight: '1px solid #C8D8E8',
                }}>
                  {i + 1}
                </div>
                <div style={{
                  padding: '10px 12px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1A2530',
                  borderRight: '1px solid #C8D8E8',
                }}>
                  {entry.name}
                </div>
                <div style={{
                  padding: '10px 12px',
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: '9px',
                  color: i < 3 ? '#0047AB' : '#607888',
                  letterSpacing: '1px',
                  borderRight: '1px solid #C8D8E8',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {getRankTitle(i + 1)}
                </div>
                <div style={{
                  padding: '10px 12px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0047AB',
                  borderRight: '1px solid #C8D8E8',
                }}>
                  {entry.level}
                </div>
                <div style={{
                  padding: '10px 12px',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#00755E',
                }}>
                  {formatSalary(entry.score)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
