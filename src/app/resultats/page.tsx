'use client';

import { useEffect, useState } from 'react';
import ExcelNav from '@/components/ui/ExcelNav';
import ExcelChrome from '@/components/ui/ExcelChrome';
import GlobeIcon from '@/components/ui/GlobeIcon';
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

function PodiumCard({ entry, rank, index }: { entry: LeaderboardEntry; rank: number; index: number }) {
  const heights = [110, 80, 60];
  const medals = ['🥇','🥈','🥉'];
  const orders = [1, 0, 2];
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', order: orders[index] }}>
      <div style={{ fontSize:'28px' }}>{medals[index]}</div>
      <div style={{ background:'#fff', border:`2px solid ${getRankColor(rank)}`, padding:'12px 20px', textAlign:'center', minWidth:'140px', boxShadow: rank===1?'0 0 24px rgba(200,150,10,.2)':'none' }}>
        <div style={{ fontFamily:"'Luckiest Guy', cursive", fontSize:'22px', color: getRankColor(rank) }}>{rank}</div>
        <div style={{ fontFamily:"'Lilita One', cursive", fontSize:'14px', color:'#0D2B5E', letterSpacing:'2px', marginTop:'4px' }}>{entry.name}</div>
        <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color: getRankColor(rank), letterSpacing:'2px', marginTop:'2px' }}>{getRankTitle(rank)}</div>
        <div style={{ fontFamily:"'Luckiest Guy', cursive", fontSize:'18px', color:'#007B8A', marginTop:'6px' }}>{formatSalary(entry.score)}</div>
      </div>
      <div style={{ width:'100%', height:`${heights[index]}px`, background:`linear-gradient(to bottom,${getRankColor(rank)}22,${getRankColor(rank)}11)`, border:`1px solid ${getRankColor(rank)}44`, borderBottom:'none' }} />
    </div>
  );
}

export default function ResultatsPage() {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => { setBoard(getLeaderboard()); }, []);
  const topThree = board.slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background:'#EEF3F8' }}>
      <ExcelNav />
      <ExcelChrome formulaText={`=RANK(JOUEURS) // TOTAL: ${board.length} // W.O.W LEADERBOARD`}>
        <div style={{
          background:'#EEF3F8',
          backgroundImage:'linear-gradient(rgba(0,71,171,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,71,171,.03) 1px,transparent 1px)',
          backgroundSize:'56px 34px',
          minHeight:'calc(100vh - 52px)',
        }}>

          {/* HEADER */}
          <div style={{ background:'linear-gradient(135deg,#0B1F3A 0%,#0D2B5E 60%,#0047AB 100%)', padding:'28px 48px', borderBottom:'3px solid #00C8BE', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'24px', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
              <GlobeIcon size={52} color="#00C8BE" />
              <div>
                <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'9px', color:'#3C5A7A', letterSpacing:'5px', marginBottom:'4px' }}>01 / CLASSEMENT</div>
                <div style={{ fontFamily:"'Lilita One', cursive", fontSize:'clamp(22px,4vw,36px)', color:'#F2F8FF', letterSpacing:'4px', lineHeight:1 }}>RÉSULTATS</div>
                <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#00C8BE', letterSpacing:'4px', marginTop:'4px' }}>W.O.W — CLASSEMENT GÉNÉRAL</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
              {[
                { label:'JOUEURS', value: String(board.length).padStart(3,'0') },
                { label:'MEILLEUR', value: board[0] ? formatSalary(board[0].score) : '—' },
                { label:'NIVEAU MAX', value: board[0] ? `ÉTG ${board[0].level}` : '—' },
              ].map(s => (
                <div key={s.label} style={{ textAlign:'center', padding:'8px 16px', background:'rgba(255,255,255,.06)', border:'1px solid rgba(0,200,190,.15)' }}>
                  <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#3C5A7A', letterSpacing:'3px' }}>{s.label}</div>
                  <div style={{ fontFamily:"'Luckiest Guy', cursive", fontSize:'20px', color:'#00C8BE', marginTop:'2px' }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ maxWidth:'960px', margin:'0 auto', padding:'40px 24px' }}>

            {/* PODIUM */}
            {topThree.length >= 2 && (
              <div style={{ marginBottom:'48px' }}>
                <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#8FA5B8', letterSpacing:'5px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'12px' }}>
                  PODIUM <span style={{ flex:1, height:'1px', background:'linear-gradient(to right,rgba(0,71,171,.3),transparent)' }} />
                </div>
                <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'16px' }}>
                  {topThree.map((entry, i) => <PodiumCard key={entry.name} entry={entry} rank={i+1} index={i} />)}
                </div>
              </div>
            )}

            {/* TABLEAU */}
            <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#8FA5B8', letterSpacing:'5px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'12px' }}>
              CLASSEMENT COMPLET <span style={{ flex:1, height:'1px', background:'linear-gradient(to right,rgba(0,71,171,.3),transparent)' }} />
              <span style={{ fontSize:'7px' }}>=RANK(ALL) // {board.length} ENTRÉES</span>
            </div>

            <div style={{ border:'1px solid #C8D8E8', overflow:'hidden', background:'#fff', boxShadow:'0 2px 20px rgba(0,47,94,.08)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'56px 1fr 160px 90px 140px', background:'#0D2B5E', borderBottom:'3px solid #00C8BE' }}>
                {['RANG','PSEUDO','TITRE','NIVEAU','SALAIRE'].map(col => (
                  <div key={col} style={{ padding:'10px 14px', fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color:'#5B9BD5', letterSpacing:'2px', borderRight:'1px solid rgba(91,155,213,.15)' }}>{col}</div>
                ))}
              </div>

              {board.length === 0 && (
                <div style={{ padding:'60px', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Lilita One', cursive", fontSize:'24px', color:'#C8D8E8', letterSpacing:'4px', marginBottom:'8px' }}>AUCUN RÉSULTAT</div>
                  <div style={{ fontFamily:"'Orbitron', sans-serif", fontSize:'10px', color:'#8FA5B8', letterSpacing:'2px' }}>JOUEZ POUR APPARAÎTRE ICI</div>
                </div>
              )}

              {board.map((entry, i) => {
                const isMedal = i < 3;
                return (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'56px 1fr 160px 90px 140px', background: isMedal?'#F0F7FF': i%2===0?'#fff':'#F7FAFD', borderBottom:'1px solid #E0EAF4', borderLeft:`4px solid ${isMedal ? getRankColor(i+1) : 'transparent'}` }}>
                    <div style={{ padding:'13px 14px', fontFamily:"'Luckiest Guy', cursive", fontSize:'20px', color: getRankColor(i+1), borderRight:'1px solid #E0EAF4', display:'flex', alignItems:'center' }}>{i+1}</div>
                    <div style={{ padding:'13px 14px', fontFamily:"'Orbitron', sans-serif", fontSize:'12px', color:'#0D2B5E', fontWeight: i===0 ? 700 : 400, borderRight:'1px solid #E0EAF4', display:'flex', alignItems:'center', gap:'8px' }}>
                      {i===0 && <span>👑</span>}{entry.name}
                    </div>
                    <div style={{ padding:'13px 14px', fontFamily:"'Orbitron', sans-serif", fontSize:'8px', color: isMedal?'#007B8A':'#8FA5B8', letterSpacing:'1px', borderRight:'1px solid #E0EAF4', display:'flex', alignItems:'center' }}>{getRankTitle(i+1)}</div>
                    <div style={{ padding:'13px 14px', fontFamily:"'Luckiest Guy', cursive", fontSize:'18px', color:'#0047AB', borderRight:'1px solid #E0EAF4', display:'flex', alignItems:'center' }}>{entry.level}</div>
                    <div style={{ padding:'13px 14px', fontFamily:"'Luckiest Guy', cursive", fontSize:'18px', color:'#C8960A', display:'flex', alignItems:'center' }}>{formatSalary(entry.score)}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:'14px', fontFamily:"'Orbitron', sans-serif", fontSize:'7px', color:'#8FA5B8', letterSpacing:'2px', display:'flex', justifyContent:'space-between' }}>
              <span>=LAST_UPDATE() // CLASSEMENT LOCAL — SESSION</span>
              <span>W.O.W · WORK OR WINDOW · 2026</span>
            </div>
          </div>
        </div>
      </ExcelChrome>
    </div>
  );
}
