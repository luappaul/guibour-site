import { LevelConfig, DossierSize } from './gameTypes';

function d(size: DossierSize, x: number, vx: number, type: 'folder' | 'clock' | 'chart' = 'folder') {
  return { size, x, vx, type };
}

export const LEVELS: LevelConfig[] = [
  { level: 1, dossiers: [d('B', 0.3, 0.8)], bonusChance: 0.35 },
  { level: 2, dossiers: [d('A', 0.5, 0.7)], bonusChance: 0.35 },
  { level: 3, dossiers: [d('A', 0.3, 0.8), d('C', 0.7, -0.7)], bonusChance: 0.3 },
  { level: 4, dossiers: [d('A', 0.2, 0.8, 'clock'), d('B', 0.7, -0.9)], bonusChance: 0.3 },
  { level: 5, dossiers: [d('A', 0.3, 0.7), d('A', 0.7, -0.7)], bonusChance: 0.25 },
  { level: 6, dossiers: [d('A', 0.2, 0.8, 'chart'), d('B', 0.5, -0.9), d('B', 0.8, 0.7)], bonusChance: 0.25 },
  { level: 7, dossiers: [d('A', 0.15, 1.0), d('A', 0.5, -0.8), d('C', 0.8, 0.8, 'clock')], bonusChance: 0.2 },
  { level: 8, dossiers: [d('A', 0.2, 1.0, 'chart'), d('A', 0.6, -1.0), d('B', 0.4, 0.8)], bonusChance: 0.2 },
  { level: 9, dossiers: [d('A', 0.15, 1.1), d('A', 0.5, -1.0, 'clock'), d('A', 0.85, 0.9)], bonusChance: 0.15 },
  { level: 10, dossiers: [d('A', 0.1, 1.2, 'chart'), d('A', 0.4, -1.1), d('A', 0.7, 1.0, 'clock'), d('B', 0.9, -0.9)], bonusChance: 0.15 },
];
