// ===== BUBBLE SIZES (1=smallest, 7=largest) =====
export type BubbleSize = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Bubble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: BubbleSize;
  radius: number;
  sprite: string; // path to PNG
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  height: number;
  active: boolean;
  piercing: boolean; // pilule bonus: goes through bubbles
}

// ===== BONUS TYPES =====
export type BonusType = 'cafe' | 'biere' | 'argent' | 'temps' | 'pilule' | 'stagiaire' | 'cgt' | 'rtt';

export interface Bonus {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: BonusType;
  active: boolean;
  sprite: string; // path to PNG
  spawnTime: number; // frame when spawned (disappear after 5s = 300 frames)
}

export interface ActiveEffect {
  type: BonusType;
  remaining: number; // frames remaining
}

// ===== TIMER =====
export interface RoundTimer {
  total: number;    // seconds
  remaining: number; // seconds (decremented per frame via dt)
}

// ===== PLAYER =====
export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 'left' | 'right' | 'idle';
  lives: number; // RTT
  score: number;
  name: string;
  invincible: number; // frames of invincibility after hit
}

// ===== ELEVATOR ANIMATION =====
export interface ElevatorAnim {
  active: boolean;
  progress: number;    // 0 to 1
  fromLevel: number;
  toLevel: number;
}

// ===== LEVEL CONFIG =====
export interface BubbleConfig {
  size: BubbleSize;
  x: number;   // 0-1 fraction of canvas width
  vx: number;  // initial horizontal velocity
}

export interface LevelConfig {
  id: number;           // 0-24
  name: string;         // "Etage 00 — Accueil" etc.
  background: string;   // "/game/backgrounds/bg-00.png"
  phrase: string;       // satirical phrase shown at start
  bubbles: BubbleConfig[];
  timeLimit: number;    // seconds
  bonusWeights: Partial<Record<BonusType, number>>;
  hasCeilingSpikes: boolean;
}

// ===== GAME STATE =====
export interface GameState {
  status: 'idle' | 'playing' | 'paused' | 'levelComplete' | 'gameOver' | 'victory' | 'burnout';
  level: number;         // 0-24
  player: Player;
  bubbles: Bubble[];
  projectiles: Projectile[];
  bonuses: Bonus[];
  activeEffects: ActiveEffect[];
  timer: RoundTimer;
  burnout: boolean;       // currently in burn out animation
  burnoutTimer: number;   // frames remaining for burn out flash
  ceilingSpikes: boolean; // active on current level
  cgtShield: boolean;     // CGT shield active (absorbs next hit)
  elevatorAnim: ElevatorAnim;
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
  frameCount: number;
}

// ===== LEADERBOARD =====
export interface LeaderboardEntry {
  name: string;
  score: number;
  level: number;
  date: string;
  employeeId?: string;
}
