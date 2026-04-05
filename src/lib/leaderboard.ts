import { LeaderboardEntry } from './gameTypes';

const STORAGE_KEY = 'guibour_leaderboard';

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function addScore(entry: LeaderboardEntry): number {
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, 100);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed.findIndex(e => e.name === entry.name && e.score === entry.score && e.date === entry.date) + 1;
}

export function getRank(score: number): number {
  const board = getLeaderboard();
  return board.filter(e => e.score > score).length + 1;
}

export function formatSalary(score: number): string {
  return score.toLocaleString('fr-FR') + ' \u20AC';
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function getShareText(name: string, level: number, score: number, durationMs?: number): string {
  const duration = durationMs ? formatDuration(durationMs) : '0:00';
  const etage = String(level).padStart(2, '0');
  return `guibour.fr\nW.O.W — Work Or Window\n\nJ'ai atteint l'etage ${etage} en ${duration} chez Guibour.\nSalaire : ${formatSalary(score)}\nPeux-tu battre mon score ?\n\n#WOW #guibour`;
}
