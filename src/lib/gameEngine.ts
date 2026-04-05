import {
  GameState, Bubble, BubbleSize, Projectile, Bonus, BonusType, Player,
  RoundTimer, ElevatorAnim,
} from './gameTypes';
import { LEVELS } from './levels';
import { GameAssets } from './assetLoader';

// ===== PHYSICS =====
const GRAVITY = 0.15;
const PLAYER_SPEED = 3;
const PROJECTILE_SPEED = 5;
const PLAYER_H = 90;
const PLAYER_W = 40;

// 7 bubble sizes: radius, bounceVy, speedX, divisionVy, score
// SPEC: plus la balle est grosse, MOINS elle rebondit (bounceVy proche de 0 = rebond faible)
const SIZE_CONFIG: Record<BubbleSize, {
  radius: number; bounceVy: number; speedX: number; divisionVy: number; score: number;
}> = {
  7: { radius: 80, bounceVy: -6.5,  speedX: 0.8, divisionVy: -7.5,  score: 50 },
  6: { radius: 62, bounceVy: -7.5,  speedX: 1.0, divisionVy: -8.5,  score: 100 },
  5: { radius: 48, bounceVy: -8.5,  speedX: 1.2, divisionVy: -9.5,  score: 150 },
  4: { radius: 36, bounceVy: -9.5,  speedX: 1.4, divisionVy: -10.5, score: 250 },
  3: { radius: 26, bounceVy: -10.5, speedX: 1.6, divisionVy: -11.5, score: 400 },
  2: { radius: 16, bounceVy: -11.5, speedX: 1.8, divisionVy: -13.0, score: 600 },
  1: { radius: 10, bounceVy: -13.0, speedX: 2.0, divisionVy: 0,     score: 1000 },
};

const SPLIT_MAP: Record<BubbleSize, BubbleSize | null> = {
  7: 6, 6: 5, 5: 4, 4: 3, 3: 2, 2: 1, 1: null,
};

const BONUS_DURATION: Partial<Record<BonusType, number>> = {
  cafe: 480,      // 8s at 60fps
  biere: 300,     // 5s
  pilule: 600,    // 10s
  stagiaire: 600, // 10s
};

const TIMER_BAR_H = 8;
const SPIKE_H = 20;
const GROUND_MARGIN = PLAYER_H; // ground line = bottom of canvas minus player height

// ===== PARTICLES =====
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

let particles: Particle[] = [];
let walkVideoPlaying = false;

// ===== ASSETS (set from component) =====
let assets: GameAssets | null = null;

export function setGameAssets(a: GameAssets) {
  assets = a;
}

// ===== INIT =====
export function createInitialState(cw: number, ch: number): GameState {
  particles = [];
  walkVideoPlaying = false;
  return {
    status: 'idle',
    level: 0,
    player: createPlayer(cw, ch, ''),
    bubbles: [],
    projectiles: [],
    bonuses: [],
    activeEffects: [],
    timer: { total: 90, remaining: 90 },
    burnout: false,
    burnoutTimer: 0,
    ceilingSpikes: false,
    cgtShield: false,
    elevatorAnim: { active: false, progress: 0, fromLevel: 0, toLevel: 0 },
    nextId: 1,
    canvasWidth: cw,
    canvasHeight: ch,
    keys: new Set(),
    touchLeft: false,
    touchRight: false,
    touchShoot: false,
    levelTransitionTimer: 0,
    startTime: 0,
    endTime: 0,
    frameCount: 0,
  };
}

function createPlayer(cw: number, ch: number, name: string): Player {
  return {
    x: cw / 2,
    y: ch, // feet on the ground line (canvas bottom)
    width: PLAYER_W,
    height: PLAYER_H,
    speed: PLAYER_SPEED,
    direction: 'idle',
    lives: 3,
    score: 0,
    name,
    invincible: 0,
  };
}

export function startGame(state: GameState, playerName: string): GameState {
  const s = { ...state, status: 'playing' as const, level: 0 };
  s.player = createPlayer(state.canvasWidth, state.canvasHeight, playerName);
  s.projectiles = [];
  s.bonuses = [];
  s.activeEffects = [];
  s.nextId = 1;
  s.cgtShield = false;
  s.burnout = false;
  s.burnoutTimer = 0;
  s.frameCount = 0;
  const levelConfig = LEVELS[0];
  s.timer = { total: levelConfig.timeLimit, remaining: levelConfig.timeLimit };
  s.ceilingSpikes = levelConfig.hasCeilingSpikes;
  s.bubbles = spawnBubbles(s, 0);
  s.startTime = Date.now();
  s.endTime = 0;
  particles = [];
  return s;
}

function spawnBubbles(state: GameState, level: number): Bubble[] {
  const config = LEVELS[level];
  if (!config) return [];
  let id = state.nextId;
  const bubbles: Bubble[] = [];
  for (const bc of config.bubbles) {
    const sc = SIZE_CONFIG[bc.size];
    bubbles.push({
      id: id++,
      x: bc.x * state.canvasWidth,
      y: TIMER_BAR_H + (state.ceilingSpikes ? SPIKE_H : 0) + sc.radius + 30,
      vx: bc.vx,
      vy: 0,
      size: bc.size,
      radius: sc.radius,
      sprite: `/game/bubbles/bubble-${bc.size}.png`,
    });
  }
  state.nextId = id;
  return bubbles;
}

// ===== GAME LOOP =====
export function updateGame(state: GameState): GameState {
  state.frameCount++;

  if (state.status === 'burnout') {
    state.burnoutTimer--;
    if (state.burnoutTimer <= 0) {
      state.burnout = false;
      if (state.player.lives <= 0) {
        state.status = 'gameOver';
        state.endTime = Date.now();
      } else {
        // Round restart
        state.status = 'playing';
        const config = LEVELS[state.level];
        state.timer = { total: config.timeLimit, remaining: config.timeLimit };
        state.bubbles = spawnBubbles(state, state.level);
        state.projectiles = [];
        state.bonuses = [];
        state.activeEffects = [];
        state.cgtShield = false;
        state.player.x = state.canvasWidth / 2;
        state.player.y = state.canvasHeight;
        state.player.invincible = 120;
      }
    }
    return state;
  }

  if (state.status === 'levelComplete') {
    state.levelTransitionTimer--;
    if (state.levelTransitionTimer <= 0) {
      if (state.level >= 24) {
        state.status = 'victory';
        state.endTime = Date.now();
        return state;
      }
      state.level++;
      const config = LEVELS[state.level];
      state.timer = { total: config.timeLimit, remaining: config.timeLimit };
      state.ceilingSpikes = config.hasCeilingSpikes;
      state.bubbles = spawnBubbles(state, state.level);
      state.projectiles = [];
      state.bonuses = [];
      state.activeEffects = [];
      state.cgtShield = false;
      state.player.x = state.canvasWidth / 2;
      state.player.y = state.canvasHeight;
      state.player.invincible = 0;
      state.status = 'playing';
    }
    return state;
  }

  if (state.status !== 'playing') return state;

  // Timer countdown (~60fps)
  state.timer.remaining -= 1 / 60;
  if (state.timer.remaining <= 0) {
    state.timer.remaining = 0;
    state.status = 'gameOver';
    state.endTime = Date.now();
    return state;
  }

  updatePlayer(state);
  updateProjectiles(state);
  updateBubbles(state);
  updateBonusItems(state);
  updateEffects(state);
  updateParticles();
  checkCollisions(state);

  // Level complete
  if (state.bubbles.length === 0 && state.status === 'playing') {
    state.status = 'levelComplete';
    state.levelTransitionTimer = 90; // 1.5s
    // Time bonus
    state.player.score += Math.floor(state.timer.remaining) * 10;
    state.player.score += (state.level + 1) * 500;
  }

  return state;
}

function updatePlayer(state: GameState) {
  const { player, keys, canvasWidth, canvasHeight } = state;
  const cafeActive = state.activeEffects.some(e => e.type === 'cafe');
  const biereActive = state.activeEffects.some(e => e.type === 'biere');

  let moveLeft = keys.has('ArrowLeft') || keys.has('a') || keys.has('q') || state.touchLeft;
  let moveRight = keys.has('ArrowRight') || keys.has('d') || state.touchRight;

  let speed = player.speed;
  if (cafeActive) speed *= 1.5;
  if (biereActive) speed *= 0.5;

  if (moveLeft) { player.x -= speed; player.direction = 'left'; }
  else if (moveRight) { player.x += speed; player.direction = 'right'; }
  else { player.direction = 'idle'; }

  player.x = Math.max(player.width / 2, Math.min(canvasWidth - player.width / 2, player.x));
  // Always keep player feet on the floor — handles canvas resize mid-game
  player.y = canvasHeight;

  const wantsShoot = keys.has(' ') || keys.has('ArrowUp') || keys.has('z') || keys.has('w') || state.touchShoot;
  const activeProjectiles = state.projectiles.filter(p => p.active);
  const piluleActive = state.activeEffects.some(e => e.type === 'pilule');
  const stagiaireActive = state.activeEffects.some(e => e.type === 'stagiaire');
  const maxProjectiles = stagiaireActive ? 2 : 1;

  if (wantsShoot && activeProjectiles.length < maxProjectiles) {
    state.projectiles.push({
      id: state.nextId++,
      x: player.x,
      // Spawn at top of character (head/shoulder level) so arrow appears to come FROM the player
      y: player.y - player.height + 10,
      height: 0,
      active: true,
      piercing: piluleActive,
    });
  }

  if (player.invincible > 0) player.invincible--;
}

function updateProjectiles(state: GameState) {
  const topY = TIMER_BAR_H + (state.ceilingSpikes ? SPIKE_H : 0);
  for (const p of state.projectiles) {
    if (!p.active) continue;
    p.height += PROJECTILE_SPEED;
    const projTop = p.y - p.height;
    if (projTop <= topY) p.active = false;
  }
  state.projectiles = state.projectiles.filter(p => p.active);
}

function updateBubbles(state: GameState) {
  const floorY = state.canvasHeight; // bubbles land at canvas bottom, same as player feet
  const ceilingY = TIMER_BAR_H + (state.ceilingSpikes ? SPIKE_H : 0);

  for (const b of state.bubbles) {
    b.x += b.vx;
    b.vy += GRAVITY;
    b.y += b.vy;

    // Floor bounce
    if (b.y + b.radius >= floorY) {
      b.y = floorY - b.radius;
      b.vy = SIZE_CONFIG[b.size].bounceVy;
    }

    // Ceiling
    if (b.y - b.radius <= ceilingY) {
      if (state.ceilingSpikes) {
        // Spikes destroy bubble on contact
        b.radius = -1; // mark for destruction
      } else {
        b.y = ceilingY + b.radius;
        b.vy = Math.abs(b.vy) * 0.4;
      }
    }

    // Wall bounce
    if (b.x - b.radius <= 0) { b.x = b.radius; b.vx = Math.abs(b.vx); }
    if (b.x + b.radius >= state.canvasWidth) { b.x = state.canvasWidth - b.radius; b.vx = -Math.abs(b.vx); }
  }

  // Remove spike-destroyed bubbles (spawn particles)
  const destroyed = state.bubbles.filter(b => b.radius < 0);
  for (const d of destroyed) {
    spawnHitParticles(d.x, TIMER_BAR_H + SPIKE_H, '#FF4444');
    // Spike destruction doesn't spawn bonus or divide
  }
  state.bubbles = state.bubbles.filter(b => b.radius >= 0);
}

function updateBonusItems(state: GameState) {
  const floorY = state.canvasHeight; // bonus items land at canvas bottom, same as player feet
  for (const b of state.bonuses) {
    if (!b.active) continue;
    b.vy += 0.06;
    b.y += b.vy;
    if (b.y >= floorY) {
      b.y = floorY;
      b.vy = 0;
    }
    // Disappear after 300 frames (5s)
    if (state.frameCount - b.spawnTime > 300) b.active = false;
  }
  state.bonuses = state.bonuses.filter(b => b.active);
}

function updateEffects(state: GameState) {
  for (const e of state.activeEffects) e.remaining--;
  state.activeEffects = state.activeEffects.filter(e => e.remaining > 0);
}

function updateParticles() {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
}

function spawnHitParticles(x: number, y: number, color: string) {
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      life: 25 + Math.random() * 20,
      maxLife: 45,
      color,
      size: 3 + Math.random() * 4,
    });
  }
}

// ===== COLLISIONS =====
function checkCollisions(state: GameState) {
  const { player, bubbles, projectiles, bonuses } = state;

  // Projectile vs Bubble
  for (const proj of projectiles) {
    if (!proj.active) continue;
    const projTop = proj.y - proj.height;

    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      // Check if projectile line intersects bubble circle
      if (proj.x - 4 <= b.x + b.radius && proj.x + 4 >= b.x - b.radius &&
          projTop <= b.y + b.radius && proj.y >= b.y - b.radius) {

        if (!proj.piercing) proj.active = false;

        player.score += SIZE_CONFIG[b.size].score;
        spawnHitParticles(b.x, b.y, '#F5C542');

        // Spawn bonus
        const config = LEVELS[state.level];
        if (config) {
          const weights = config.bonusWeights;
          const totalWeight = Object.values(weights).reduce((a, c) => a + (c || 0), 0);
          if (Math.random() < 0.3 && totalWeight > 0) {
            spawnBonus(state, b.x, b.y, weights);
          }
        }

        // Split bubble
        const nextSize = SPLIT_MAP[b.size];
        bubbles.splice(i, 1);
        if (nextSize) {
          const nc = SIZE_CONFIG[nextSize];
          bubbles.push(
            {
              id: state.nextId++, x: b.x - 10, y: b.y,
              vx: -Math.abs(b.vx) * 1.05,
              vy: SIZE_CONFIG[b.size].divisionVy,
              size: nextSize, radius: nc.radius,
              sprite: `/game/bubbles/bubble-${nextSize}.png`,
            },
            {
              id: state.nextId++, x: b.x + 10, y: b.y,
              vx: Math.abs(b.vx) * 1.05,
              vy: SIZE_CONFIG[b.size].divisionVy,
              size: nextSize, radius: nc.radius,
              sprite: `/game/bubbles/bubble-${nextSize}.png`,
            },
          );
        }
        if (!proj.piercing) break;
      }
    }
  }

  // Bubble vs Player
  if (player.invincible <= 0) {
    for (const b of bubbles) {
      const dx = player.x - b.x;
      const dy = (player.y - player.height / 3) - b.y;
      if (Math.sqrt(dx * dx + dy * dy) < b.radius + player.width / 2.5) {
        if (state.cgtShield) {
          // CGT shield absorbs hit
          state.cgtShield = false;
          player.invincible = 60;
          spawnHitParticles(player.x, player.y - player.height / 2, '#27C93F');
        } else {
          // BURN OUT
          player.lives--;
          state.burnout = true;
          state.burnoutTimer = 60; // 1 second flash
          state.status = 'burnout';
        }
        break;
      }
    }
  }

  // Player vs Bonus
  for (let i = bonuses.length - 1; i >= 0; i--) {
    const b = bonuses[i];
    if (!b.active) continue;
    if (Math.sqrt((player.x - b.x) ** 2 + ((player.y - player.height / 3) - b.y) ** 2) < 35) {
      b.active = false;
      applyBonus(state, b.type);
    }
  }
}

function spawnBonus(state: GameState, x: number, y: number, weights: Partial<Record<BonusType, number>>) {
  const entries = Object.entries(weights) as [BonusType, number][];
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = Math.random() * total;
  let type: BonusType = 'argent';
  for (const [t, w] of entries) {
    r -= w;
    if (r <= 0) { type = t; break; }
  }

  const spriteMap: Record<BonusType, string> = {
    cafe: '/game/bonuses/cafe.png',
    biere: '/game/bonuses/biere.png',
    argent: '/game/bonuses/argent.png',
    temps: '/game/bonuses/temps.png',
    pilule: '/game/bonuses/pilule.png',
    stagiaire: '/game/bonuses/stagiaire.png',
    cgt: '/game/bonuses/cgt.png',
    rtt: '/game/bonuses/rtt.png',
  };

  state.bonuses.push({
    id: state.nextId++,
    x, y,
    vy: -1.5,
    type,
    active: true,
    sprite: spriteMap[type],
    spawnTime: state.frameCount,
  });
}

function applyBonus(state: GameState, type: BonusType) {
  switch (type) {
    case 'rtt':
      state.player.lives++;
      break;
    case 'argent':
      state.player.score += 500;
      break;
    case 'temps':
      state.timer.remaining = Math.min(state.timer.remaining + 15, state.timer.total);
      break;
    case 'cgt':
      state.cgtShield = true;
      break;
    case 'cafe':
    case 'biere':
    case 'pilule':
    case 'stagiaire':
      state.activeEffects = state.activeEffects.filter(e => e.type !== type);
      state.activeEffects.push({ type, remaining: BONUS_DURATION[type] || 300 });
      break;
  }
}

// =========================================================================
// RENDERING
// =========================================================================

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const { canvasWidth: w, canvasHeight: h } = state;
  ctx.clearRect(0, 0, w, h);

  // 1. Background
  drawBackground(ctx, w, h, state);

  // 2. Ceiling spikes
  if (state.ceilingSpikes && (state.status === 'playing' || state.status === 'levelComplete' || state.status === 'burnout')) {
    drawCeilingSpikes(ctx, w);
  }

  // 3. Timer gauge
  if (state.status === 'playing' || state.status === 'levelComplete' || state.status === 'burnout') {
    drawTimerGauge(ctx, w, state);
  }

  if (state.status === 'playing' || state.status === 'levelComplete' || state.status === 'burnout') {
    // 4. Particles (behind everything)
    drawParticles(ctx);

    // 5. Bubbles
    drawBubbles(ctx, state);

    // 6. Bonus items
    drawBonusItems(ctx, state);

    // 7. Projectiles
    drawProjectiles(ctx, state);

    // 8. Player
    drawPlayer(ctx, state);

    // 9. CGT Shield indicator
    if (state.cgtShield) {
      drawCgtShield(ctx, state);
    }

    // 10. Level complete overlay
    if (state.status === 'levelComplete') {
      drawLevelComplete(ctx, state);
    }

    // 11. BURN OUT flash
    if (state.status === 'burnout') {
      drawBurnout(ctx, w, h, state);
    }
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, state: GameState) {
  const bg = assets?.backgrounds.get(state.level);
  if (bg) {
    ctx.globalAlpha = 0.88;
    ctx.drawImage(bg, 0, 0, w, h);
    ctx.globalAlpha = 1;
  } else {
    // Fallback: solid color
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);
  }
}

function drawTimerGauge(ctx: CanvasRenderingContext2D, w: number, _state: GameState) {
  // Timer is now rendered as HTML overlay (Excel formula bar) in GameCanvas.tsx
  // Keep zone transparent to preserve physics offsets (TIMER_BAR_H = 8px)
  ctx.clearRect(0, 0, w, TIMER_BAR_H);
}

function drawCeilingSpikes(ctx: CanvasRenderingContext2D, w: number) {
  const y = TIMER_BAR_H;
  ctx.fillStyle = '#555';
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  const spikeW = 20;
  const count = Math.ceil(w / spikeW);
  for (let i = 0; i < count; i++) {
    const x = i * spikeW;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + spikeW / 2, y + SPIKE_H);
    ctx.lineTo(x + spikeW, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawBubbles(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const b of state.bubbles) {
    const sprite = assets?.bubbles.get(b.size);
    const drawSize = b.radius * 2;
    if (sprite) {
      ctx.drawImage(sprite, b.x - drawSize / 2, b.y - drawSize / 2, drawSize, drawSize);
    } else {
      // Fallback circle
      ctx.fillStyle = '#F5C542';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawProjectiles(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.strokeStyle = '#00C9C8';
  ctx.lineWidth = 3;
  for (const p of state.projectiles) {
    if (!p.active) continue;
    const topY = p.y - p.height;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, topY);
    ctx.stroke();

    // Arrow tip
    ctx.fillStyle = '#00C9C8';
    ctx.beginPath();
    ctx.moveTo(p.x - 5, topY + 5);
    ctx.lineTo(p.x, topY - 3);
    ctx.lineTo(p.x + 5, topY + 5);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBonusItems(ctx: CanvasRenderingContext2D, state: GameState) {
  const bonusSize = 30;
  for (const b of state.bonuses) {
    if (!b.active) continue;
    const sprite = assets?.bonuses.get(b.type);
    if (sprite) {
      ctx.drawImage(sprite, b.x - bonusSize / 2, b.y - bonusSize / 2, bonusSize, bonusSize);
    } else {
      // Fallback
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(b.x - bonusSize / 2, b.y - bonusSize / 2, bonusSize, bonusSize);
      ctx.fillStyle = '#000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.type.slice(0, 3), b.x, b.y + 4);
    }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player } = state;

  // Blinking when invincible
  if (player.invincible > 0 && state.frameCount % 8 < 4) return;

  const walkVideo = assets?.player.walkVideo;
  const idleImg = assets?.player.idle;
  const isMoving = player.direction === 'left' || player.direction === 'right';
  // Show idle/front-facing when shooting (has active projectile)
  const isShooting = state.projectiles.some(p => p.active);
  // Use walk animation only when moving AND not shooting
  const useWalk = isMoving && !isShooting;

  // Manage video play/pause
  if (walkVideo && walkVideo.readyState >= 2) {
    if (useWalk && !walkVideoPlaying) {
      walkVideo.play().catch(() => {});
      walkVideoPlaying = true;
    } else if (!useWalk && walkVideoPlaying) {
      walkVideo.pause();
      walkVideoPlaying = false;
    }
  }

  ctx.save();

  if (useWalk && walkVideo && walkVideo.readyState >= 2) {
    // Draw video frame — video is natively facing left (1280×720), trimmed from 1.0s
    // Character occupies x=356..935 (sw=579) of the full hflipped frame
    const sx = 356, sy = 0, sw = 579, sh = 720;
    if (player.direction === 'right') {
      // Flip horizontally for right movement
      ctx.translate(player.x + player.width / 2, player.y - player.height);
      ctx.scale(-1, 1);
      ctx.drawImage(walkVideo, sx, sy, sw, sh, -player.width, 0, player.width, player.height);
    } else {
      // Left = native direction
      ctx.drawImage(walkVideo, sx, sy, sw, sh, player.x - player.width / 2, player.y - player.height, player.width, player.height);
    }
  } else if (idleImg) {
    // Idle or shooting: draw face-forward static image
    ctx.drawImage(idleImg, player.x - player.width / 2, player.y - player.height, player.width, player.height);
  } else {
    // Fallback rectangle
    ctx.fillStyle = '#00C9C8';
    ctx.fillRect(player.x - player.width / 2, player.y - player.height, player.width, player.height);
  }

  ctx.restore();
}

function drawCgtShield(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player } = state;
  ctx.save();
  ctx.strokeStyle = '#27C93F';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5 + 0.3 * Math.sin(state.frameCount * 0.1);
  ctx.beginPath();
  ctx.arc(player.x, player.y - player.height / 2, player.height / 2 + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

function drawLevelComplete(ctx: CanvasRenderingContext2D, state: GameState) {
  const { canvasWidth: w, canvasHeight: h } = state;
  ctx.fillStyle = 'rgba(10,26,18,0.5)';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#00C9C8';
  ctx.font = 'bold 32px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DOSSIER CLASSE !', w / 2, h / 2 - 15);

  ctx.fillStyle = '#fff';
  ctx.font = '16px "Orbitron", sans-serif';
  ctx.fillText(`Etage ${state.level} termine`, w / 2, h / 2 + 20);
  ctx.textBaseline = 'alphabetic';
}

function drawBurnout(ctx: CanvasRenderingContext2D, w: number, h: number, state: GameState) {
  // Red flash
  const alpha = state.burnoutTimer > 30 ? 0.4 : 0.2;
  ctx.fillStyle = `rgba(255,0,0,${alpha})`;
  ctx.fillRect(0, 0, w, h);

  // BURN OUT text
  ctx.fillStyle = '#FF4444';
  ctx.font = 'bold 48px "Orbitron", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('BURN OUT !', w / 2, h / 2);

  ctx.fillStyle = '#fff';
  ctx.font = '18px "Orbitron", sans-serif';
  ctx.fillText(`RTT restants : ${state.player.lives}`, w / 2, h / 2 + 40);
  ctx.textBaseline = 'alphabetic';
}
