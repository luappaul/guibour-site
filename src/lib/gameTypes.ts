export type DossierSize = 'A' | 'B' | 'C' | 'D' | 'E';

export interface Dossier {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: DossierSize;
  radius: number;
  color: string;
  type: 'folder' | 'clock' | 'chart';
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  height: number;
  active: boolean;
  type: 'email' | 'call';
}

export type BonusType = 'coffee' | 'salary' | 'rtt' | 'meeting' | 'speed' | 'alcohol';

export interface Bonus {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: BonusType;
  active: boolean;
}

export interface ActiveEffect {
  type: BonusType;
  remaining: number;
}

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 'left' | 'right' | 'idle';
  lives: number;
  score: number;
  name: string;
  invincible: number;
}

export interface LevelConfig {
  level: number;
  dossiers: Array<{
    size: DossierSize;
    x: number;
    vx: number;
    type: 'folder' | 'clock' | 'chart';
  }>;
  bonusChance: number;
}

export interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'levelComplete' | 'gameOver' | 'victory';
  level: number;
  player: Player;
  dossiers: Dossier[];
  projectiles: Projectile[];
  bonuses: Bonus[];
  activeEffects: ActiveEffect[];
  nextId: number;
  canvasWidth: number;
  canvasHeight: number;
  keys: Set<string>;
  touchLeft: boolean;
  touchRight: boolean;
  touchShoot: boolean;
  levelTransitionTimer: number;
  startTime: number;
  endTime: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
}
