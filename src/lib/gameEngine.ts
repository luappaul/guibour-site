import { GameState, Dossier, DossierSize, Projectile, Bonus, BonusType, Player } from './gameTypes';
import { LEVELS } from './levels';

// ===== LAYOUT =====
const CHROME_H = 28;
const MENU_H = 24;
const FORMULA_H = 24;
const COLHEAD_H = 20;
const HEADER_OFFSET = CHROME_H + MENU_H + FORMULA_H + COLHEAD_H; // 96

const TABS_H = 22;
const STATUS_H = 34;
const GROUND_OFFSET = TABS_H + STATUS_H; // 56

const ROW_NUM_W = 28;
const CELL_W = 70;
const CELL_H = 26;
const PANORAMA_H = 140;

// ===== PHYSICS =====
const GRAVITY = 0.09;
const PLAYER_SPEED = 3;
const PROJECTILE_SPEED = 5;

const SIZE_CONFIG: Record<DossierSize, { radius: number; bounceVy: number; score: number }> = {
  A: { radius: 40, bounceVy: -7.0, score: 100 },
  B: { radius: 30, bounceVy: -6.5, score: 200 },
  C: { radius: 22, bounceVy: -6.0, score: 300 },
  D: { radius: 15, bounceVy: -5.5, score: 500 },
  E: { radius: 10, bounceVy: -5.0, score: 1000 },
};

const SPLIT_MAP: Record<DossierSize, DossierSize | null> = {
  A: 'B', B: 'C', C: 'D', D: 'E', E: null,
};

// 3D cube stack config per size: rows from bottom to top
const STACK_CONFIG: Record<DossierSize, { cubeW: number; cubeH: number; depth: number; rows: number[] }> = {
  A: { cubeW: 22, cubeH: 18, depth: 7, rows: [3, 2, 1] },
  B: { cubeW: 20, cubeH: 16, depth: 6, rows: [2, 1] },
  C: { cubeW: 18, cubeH: 15, depth: 5, rows: [2] },
  D: { cubeW: 20, cubeH: 16, depth: 5, rows: [1] },
  E: { cubeW: 16, cubeH: 13, depth: 4, rows: [1] },
};

const DOSSIER_PALETTE = ['#F5C542', '#E85B5B', '#5B8FB9', '#6BC76B', '#E88B5B'];

const BONUS_COLORS: Record<BonusType, string> = {
  coffee: '#6F4E37', salary: '#2E8B57', rtt: '#4169E1',
  meeting: '#8B4513', speed: '#FF6347', alcohol: '#9370DB',
};

const EFFECT_DURATION = 300;

// Absurd row/column numbers (matching mockup)
const COL_NUMBERS = ['4', '5', '6', '3', '4', '5', 'II', '1', '9', '0', '1', '1', '1', '2', '8', '3', '7', '4'];
const ROW_NUMBERS = ['1', '\u20222', '3', '5', '6', '7', '8', '9', '5', '10', '17', '18', '19', '10', '11.', '12', '13', '14', '15', '18', '19', '7', '110', '21', '23'];

// ===== SPRITES =====
let spriteIdle: HTMLImageElement | null = null;
let spriteRun: HTMLImageElement | null = null;
let spritesLoaded = false;

if (typeof window !== 'undefined') {
  spriteIdle = new Image();
  spriteIdle.src = '/guibour-idle.png';
  spriteRun = new Image();
  spriteRun.src = '/guibour-run.png';
  Promise.all([
    new Promise<void>(r => { spriteIdle!.onload = () => r(); }),
    new Promise<void>(r => { spriteRun!.onload = () => r(); }),
  ]).then(() => { spritesLoaded = true; });
}

// ===== PARTICLES =====
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

let particles: Particle[] = [];
let frameCount = 0;

// ===== INIT =====
export function createInitialState(cw: number, ch: number): GameState {
  particles = [];
  frameCount = 0;
  return {
    status: 'idle', level: 1,
    player: createPlayer(cw, ch, ''),
    dossiers: [], projectiles: [], bonuses: [], activeEffects: [],
    nextId: 1, canvasWidth: cw, canvasHeight: ch,
    keys: new Set(), touchLeft: false, touchRight: false, touchShoot: false,
    levelTransitionTimer: 0,
    startTime: 0, endTime: 0,
  };
}

function createPlayer(cw: number, ch: number, name: string): Player {
  return {
    x: cw / 2, y: ch - GROUND_OFFSET - 42,
    width: 28, height: 44, speed: PLAYER_SPEED,
    direction: 'idle', lives: 3, score: 0, name, invincible: 0,
  };
}

export function startGame(state: GameState, playerName: string): GameState {
  const s = { ...state, status: 'playing' as const, level: 1 };
  s.player = createPlayer(state.canvasWidth, state.canvasHeight, playerName);
  s.projectiles = []; s.bonuses = []; s.activeEffects = [];
  s.nextId = 1;
  s.dossiers = spawnDossiers(s, 1);
  s.startTime = Date.now();
  s.endTime = 0;
  particles = [];
  return s;
}

function spawnDossiers(state: GameState, level: number): Dossier[] {
  const config = LEVELS[level - 1];
  if (!config) return [];
  let id = state.nextId;
  const scale = Math.min(state.canvasWidth / 700, 1.2);
  const dossiers: Dossier[] = [];
  for (const d of config.dossiers) {
    const sc = SIZE_CONFIG[d.size];
    dossiers.push({
      id: id++,
      x: d.x * state.canvasWidth,
      y: HEADER_OFFSET + 50 + sc.radius * scale,
      vx: d.vx * scale, vy: 0,
      size: d.size, radius: sc.radius * scale,
      color: DOSSIER_PALETTE[Math.floor(Math.random() * DOSSIER_PALETTE.length)],
      type: d.type,
    });
  }
  state.nextId = id;
  return dossiers;
}

// ===== GAME LOOP =====
export function updateGame(state: GameState): GameState {
  frameCount++;
  if (state.status !== 'playing' && state.status !== 'levelComplete') return state;

  if (state.status === 'levelComplete') {
    state.levelTransitionTimer--;
    if (state.levelTransitionTimer <= 0) {
      if (state.level >= 10) { state.status = 'victory'; state.endTime = Date.now(); return state; }
      state.level++;
      state.dossiers = spawnDossiers(state, state.level);
      state.projectiles = []; state.bonuses = [];
      state.status = 'playing';
    }
    return state;
  }

  updatePlayer(state);
  updateProjectiles(state);
  updateDossiers(state);
  updateBonusItems(state);
  updateEffects(state);
  updateParticles();
  checkCollisions(state);

  if (state.dossiers.length === 0 && state.status === 'playing') {
    state.status = 'levelComplete';
    state.levelTransitionTimer = 150;
    state.player.score += state.level * 500;
  }
  return state;
}

function updatePlayer(state: GameState) {
  const { player, keys, canvasWidth } = state;
  const alcoholActive = state.activeEffects.some(e => e.type === 'alcohol');
  const speedActive = state.activeEffects.some(e => e.type === 'speed');

  let moveLeft = keys.has('ArrowLeft') || keys.has('a') || keys.has('q') || state.touchLeft;
  let moveRight = keys.has('ArrowRight') || keys.has('d') || state.touchRight;
  if (alcoholActive) { const t = moveLeft; moveLeft = moveRight; moveRight = t; }

  const speed = speedActive ? player.speed * 1.6 : player.speed;
  if (moveLeft) { player.x -= speed; player.direction = 'left'; }
  else if (moveRight) { player.x += speed; player.direction = 'right'; }
  else { player.direction = 'idle'; }

  player.x = Math.max(player.width / 2 + ROW_NUM_W, Math.min(canvasWidth - player.width / 2 - 4, player.x));

  const wantsShoot = keys.has(' ') || keys.has('ArrowUp') || keys.has('z') || keys.has('w') || state.touchShoot;
  const meetingActive = state.activeEffects.some(e => e.type === 'meeting');

  if (wantsShoot && state.projectiles.filter(p => p.active).length === 0) {
    state.projectiles.push({
      id: state.nextId++, x: player.x, y: player.y - 10,
      height: 0, active: true, type: meetingActive ? 'call' : 'email',
    });
  }
  if (player.invincible > 0) player.invincible--;
}

function updateProjectiles(state: GameState) {
  const maxH = state.canvasHeight - GROUND_OFFSET - HEADER_OFFSET;
  for (const p of state.projectiles) {
    if (!p.active) continue;
    p.height += PROJECTILE_SPEED;
    if (p.height >= maxH) p.active = false;
  }
  state.projectiles = state.projectiles.filter(p => p.active);
}

function updateDossiers(state: GameState) {
  const coffeeActive = state.activeEffects.some(e => e.type === 'coffee');
  const mult = coffeeActive ? 0.35 : 1;
  const floorY = state.canvasHeight - GROUND_OFFSET;
  const scale = Math.min(state.canvasWidth / 700, 1.2);

  for (const d of state.dossiers) {
    d.x += d.vx * mult;
    d.vy += GRAVITY;
    d.y += d.vy * mult;

    if (d.y + d.radius >= floorY) {
      d.y = floorY - d.radius;
      d.vy = SIZE_CONFIG[d.size].bounceVy * scale;
    }
    if (d.y - d.radius <= HEADER_OFFSET) {
      d.y = HEADER_OFFSET + d.radius;
      d.vy = Math.abs(d.vy) * 0.4;
    }
    if (d.x - d.radius <= ROW_NUM_W) { d.x = ROW_NUM_W + d.radius; d.vx = Math.abs(d.vx); }
    if (d.x + d.radius >= state.canvasWidth) { d.x = state.canvasWidth - d.radius; d.vx = -Math.abs(d.vx); }
  }
}

function updateBonusItems(state: GameState) {
  const floorY = state.canvasHeight - GROUND_OFFSET;
  for (const b of state.bonuses) {
    if (!b.active) continue;
    b.vy += 0.06;
    b.y += b.vy;
    if (b.y >= floorY - 12) b.active = false;
  }
  state.bonuses = state.bonuses.filter(b => b.active);
}

function updateEffects(state: GameState) {
  for (const e of state.activeEffects) e.remaining--;
  state.activeEffects = state.activeEffects.filter(e => e.remaining > 0);
}

function updateParticles() {
  for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life--; }
  particles = particles.filter(p => p.life > 0);
}

function spawnHitParticles(x: number, y: number, color: string) {
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 2,
      life: 30 + Math.random() * 25, maxLife: 55, color, size: 3 + Math.random() * 4,
    });
  }
}

// ===== COLLISIONS =====
function checkCollisions(state: GameState) {
  const { player, dossiers, projectiles, bonuses } = state;

  for (const proj of projectiles) {
    if (!proj.active) continue;
    const projTop = proj.y - proj.height;

    for (let i = dossiers.length - 1; i >= 0; i--) {
      const d = dossiers[i];
      if (proj.x - 4 <= d.x + d.radius && proj.x + 4 >= d.x - d.radius &&
          projTop <= d.y + d.radius && proj.y >= d.y - d.radius) {
        proj.active = false;
        const salaryActive = state.activeEffects.some(e => e.type === 'salary');
        player.score += SIZE_CONFIG[d.size].score * (salaryActive ? 2 : 1);
        spawnHitParticles(d.x, d.y, d.color);

        if (Math.random() < (LEVELS[state.level - 1]?.bonusChance || 0.2)) spawnBonus(state, d.x, d.y);

        const nextSize = SPLIT_MAP[d.size];
        dossiers.splice(i, 1);
        const scale = Math.min(state.canvasWidth / 700, 1.2);
        if (nextSize) {
          const nc = SIZE_CONFIG[nextSize];
          const nr = nc.radius * scale;
          dossiers.push(
            { id: state.nextId++, x: d.x - 10, y: d.y, vx: -Math.abs(d.vx) * 1.05, vy: nc.bounceVy * scale, size: nextSize, radius: nr, color: d.color, type: d.type },
            { id: state.nextId++, x: d.x + 10, y: d.y, vx: Math.abs(d.vx) * 1.05, vy: nc.bounceVy * scale, size: nextSize, radius: nr, color: d.color, type: d.type },
          );
        }
        break;
      }
    }
  }

  if (player.invincible <= 0) {
    for (const d of dossiers) {
      const dx = player.x - d.x;
      const dy = (player.y - player.height / 3) - d.y;
      if (Math.sqrt(dx * dx + dy * dy) < d.radius + player.width / 2.5) {
        player.lives--;
        player.invincible = 120;
        if (player.lives <= 0) { state.status = 'gameOver'; state.endTime = Date.now(); }
        break;
      }
    }
  }

  for (let i = bonuses.length - 1; i >= 0; i--) {
    const b = bonuses[i];
    if (!b.active) continue;
    if (Math.sqrt((player.x - b.x) ** 2 + (player.y - b.y) ** 2) < 30) {
      b.active = false;
      applyBonus(state, b.type);
    }
  }
}

function spawnBonus(state: GameState, x: number, y: number) {
  const types: BonusType[] = ['coffee', 'salary', 'rtt', 'meeting', 'speed', 'alcohol'];
  const weights = [25, 25, 10, 15, 15, 10];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let type: BonusType = 'coffee';
  for (let i = 0; i < types.length; i++) { r -= weights[i]; if (r <= 0) { type = types[i]; break; } }
  state.bonuses.push({ id: state.nextId++, x, y, vy: -1.5, type, active: true });
}

function applyBonus(state: GameState, type: BonusType) {
  if (type === 'rtt') { state.player.lives++; return; }
  state.activeEffects = state.activeEffects.filter(e => e.type !== type);
  state.activeEffects.push({ type, remaining: EFFECT_DURATION });
}

// =========================================================================
// RENDERING
// =========================================================================

export function renderGame(ctx: CanvasRenderingContext2D, state: GameState) {
  const { canvasWidth: w, canvasHeight: h } = state;
  ctx.clearRect(0, 0, w, h);

  drawWindowChrome(ctx, w);
  drawMenuBar(ctx, w);
  drawFormulaBar(ctx, w, state);
  drawColumnHeaders(ctx, w);

  drawGameBackground(ctx, w, h);
  drawPanorama(ctx, w);
  drawGrid(ctx, w, h);

  if (state.status === 'playing' || state.status === 'levelComplete') {
    drawParticles(ctx);
    drawDossiers(ctx, state);
    drawProjectiles(ctx, state);
    drawBonusItems(ctx, state);
    drawPlayer(ctx, state);
    drawLevelBadge(ctx, w, state);
    drawSheetTabs(ctx, w, h, state);
    drawStatusBar(ctx, w, h, state);
    if (state.status === 'levelComplete') drawLevelComplete(ctx, state);
  }
}

// ===== WINDOW CHROME =====
function drawWindowChrome(ctx: CanvasRenderingContext2D, w: number) {
  const grad = ctx.createLinearGradient(0, 0, 0, CHROME_H);
  grad.addColorStop(0, '#4A4A4A');
  grad.addColorStop(0.5, '#3A3A3A');
  grad.addColorStop(1, '#2D2D2D');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, CHROME_H);

  ctx.strokeStyle = '#1A1A1A';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, CHROME_H); ctx.lineTo(w, CHROME_H); ctx.stroke();

  // Traffic lights (Mac)
  const dots = [{ c: '#FF5F56', x: 16 }, { c: '#FFBD2E', x: 34 }, { c: '#27C93F', x: 52 }];
  for (const d of dots) {
    ctx.fillStyle = d.c;
    ctx.beginPath(); ctx.arc(d.x, CHROME_H / 2, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = darken(d.c, 25);
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Windows buttons (right side — mixing Mac + Windows = corporate absurdity)
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 1.5;
  // Minimize
  ctx.beginPath(); ctx.moveTo(w - 70, CHROME_H / 2); ctx.lineTo(w - 60, CHROME_H / 2); ctx.stroke();
  // Maximize
  ctx.strokeRect(w - 48, CHROME_H / 2 - 5, 10, 10);
  // Close
  ctx.beginPath();
  ctx.moveTo(w - 24, CHROME_H / 2 - 5); ctx.lineTo(w - 14, CHROME_H / 2 + 5); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(w - 14, CHROME_H / 2 - 5); ctx.lineTo(w - 24, CHROME_H / 2 + 5); ctx.stroke();
}

// ===== MENU BAR (Silver ribbon with parodic names) =====
function drawMenuBar(ctx: CanvasRenderingContext2D, w: number) {
  const y = CHROME_H;
  const grad = ctx.createLinearGradient(0, y, 0, y + MENU_H);
  grad.addColorStop(0, '#F0F0F0');
  grad.addColorStop(1, '#DCDCDC');
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, w, MENU_H);

  ctx.strokeStyle = '#B8B8B8';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y + MENU_H); ctx.lineTo(w, y + MENU_H); ctx.stroke();

  // Menu items with underlined letters (parodic Excel menus)
  const menus = [
    { text: 'Luryone', underline: 0 },
    { text: 'Evaitema', underline: 1 },
    { text: 'Aictous', underline: 0 },
    { text: 'Porsent', underline: 0 },
    { text: 'Bss', underline: 0 },
    { text: 'Bevites', underline: 0 },
    { text: 'Ads', underline: 0 },
  ];

  ctx.font = '12px "Segoe UI", -apple-system, sans-serif';
  let mx = 20;
  for (const menu of menus) {
    ctx.fillStyle = '#333';
    ctx.textAlign = 'left';
    ctx.fillText(menu.text, mx, y + 16);

    // Underline one letter
    const beforeW = ctx.measureText(menu.text.slice(0, menu.underline)).width;
    const charW = ctx.measureText(menu.text[menu.underline]).width;
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx + beforeW, y + 18);
    ctx.lineTo(mx + beforeW + charW, y + 18);
    ctx.stroke();

    mx += ctx.measureText(menu.text).width + 18;
  }
}

// ===== FORMULA BAR =====
function drawFormulaBar(ctx: CanvasRenderingContext2D, w: number, state: GameState) {
  const y = CHROME_H + MENU_H;
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(0, y, w, FORMULA_H);
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y + FORMULA_H); ctx.lineTo(w, y + FORMULA_H); ctx.stroke();

  // Icons area
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, y, 60, FORMULA_H);
  ctx.strokeStyle = '#C0C0C0';
  ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(60, y + FORMULA_H); ctx.stroke();

  // Small icons (triangle, refresh, =)
  ctx.fillStyle = '#777';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u25B7', 14, y + 15); // triangle
  ctx.fillText('\u21BB', 30, y + 15); // refresh
  ctx.fillText('=', 48, y + 16);

  // Dropdown arrow
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(60, y, 30, FORMULA_H);
  ctx.strokeStyle = '#C0C0C0';
  ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(90, y + FORMULA_H); ctx.stroke();
  ctx.fillStyle = '#777';
  ctx.font = '8px sans-serif';
  ctx.fillText('\u25BC', 75, y + 15);

  // Formula
  ctx.fillStyle = '#333';
  ctx.font = '11px Consolas, "SF Mono", monospace';
  ctx.textAlign = 'left';
  const salary = state.player.score.toLocaleString('fr-FR');
  ctx.fillText(`=NIVEAU(${state.level}) & " | " & SALAIRE(${salary})`, 98, y + 16);
}

// ===== COLUMN HEADERS =====
function drawColumnHeaders(ctx: CanvasRenderingContext2D, w: number) {
  const y = CHROME_H + MENU_H + FORMULA_H;

  // Background
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, y, w, COLHEAD_H);
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y + COLHEAD_H); ctx.lineTo(w, y + COLHEAD_H); ctx.stroke();

  // Corner cell
  ctx.fillStyle = '#DDD';
  ctx.fillRect(0, y, ROW_NUM_W, COLHEAD_H);
  ctx.strokeStyle = '#C0C0C0';
  ctx.beginPath(); ctx.moveTo(ROW_NUM_W, y); ctx.lineTo(ROW_NUM_W, y + COLHEAD_H); ctx.stroke();

  // Column numbers (absurd)
  ctx.fillStyle = '#555';
  ctx.font = '10px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; ROW_NUM_W + i * CELL_W + CELL_W / 2 < w && i < COL_NUMBERS.length; i++) {
    ctx.fillText(COL_NUMBERS[i], ROW_NUM_W + i * CELL_W + CELL_W / 2, y + 14);
  }
  ctx.textAlign = 'left';
}

// ===== GAME BACKGROUND =====
function drawGameBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const top = HEADER_OFFSET;
  const bottom = h - GROUND_OFFSET;
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(0, top, w, bottom - top);
}

// ===== PANORAMA =====
function drawPanorama(ctx: CanvasRenderingContext2D, w: number) {
  const top = HEADER_OFFSET;
  const pW = w - ROW_NUM_W;
  const pX = ROW_NUM_W;

  ctx.save();

  // Ceiling
  ctx.fillStyle = '#D0D0D0';
  ctx.fillRect(pX, top, pW, 18);
  // Fluorescent lights
  for (let i = 0; i < 4; i++) {
    const lx = pX + pW * 0.15 + i * pW * 0.22;
    ctx.fillStyle = '#F8F8E8';
    ctx.fillRect(lx, top + 4, pW * 0.12, 8);
    ctx.strokeStyle = '#C8C8B8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(lx, top + 4, pW * 0.12, 8);
  }

  // Back wall
  ctx.fillStyle = '#E8E4DC';
  ctx.fillRect(pX, top + 18, pW, PANORAMA_H - 38);

  // Back office desks (through glass)
  for (let i = 0; i < 5; i++) {
    const dx = pX + 40 + i * (pW / 5);
    // Desk
    ctx.fillStyle = '#A09080';
    ctx.fillRect(dx, top + 85, 50, 8);
    // Monitor
    ctx.fillStyle = '#2A2A2A';
    ctx.fillRect(dx + 15, top + 60, 22, 18);
    ctx.fillStyle = '#4A8FC4';
    ctx.fillRect(dx + 17, top + 62, 18, 14);
    // Stand
    ctx.fillStyle = '#555';
    ctx.fillRect(dx + 23, top + 78, 6, 7);
    // Chair
    ctx.fillStyle = '#3A3A3A';
    ctx.beginPath(); ctx.arc(dx + 26, top + 98, 10, 0, Math.PI * 2); ctx.fill();
  }

  // Glass partition frame
  ctx.fillStyle = 'rgba(190, 220, 240, 0.12)';
  ctx.fillRect(pX, top + 14, pW, PANORAMA_H - 34);

  // Glass frame vertical bars
  ctx.strokeStyle = '#8A9AAA';
  ctx.lineWidth = 3;
  for (let x = pX; x < pX + pW; x += pW / 6) {
    ctx.beginPath(); ctx.moveTo(x, top + 14); ctx.lineTo(x, top + PANORAMA_H - 20); ctx.stroke();
  }
  // Horizontal frames
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pX, top + 14); ctx.lineTo(pX + pW, top + 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pX, top + PANORAMA_H - 20); ctx.lineTo(pX + pW, top + PANORAMA_H - 20); ctx.stroke();
  // Mid bar
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pX, top + 70); ctx.lineTo(pX + pW, top + 70); ctx.stroke();

  // Manager (center, behind glass)
  drawManager(ctx, pX + pW / 2, top + 50);

  // Floor / carpet
  ctx.fillStyle = '#B8B0A4';
  ctx.fillRect(pX, top + PANORAMA_H - 20, pW, 20);

  // Fade into grid
  const fadeGrad = ctx.createLinearGradient(0, top + PANORAMA_H - 15, 0, top + PANORAMA_H + 15);
  fadeGrad.addColorStop(0, 'rgba(245, 245, 245, 0)');
  fadeGrad.addColorStop(1, 'rgba(245, 245, 245, 1)');
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(pX, top + PANORAMA_H - 15, pW, 30);

  ctx.restore();
}

function drawManager(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Desk
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(x - 35, y + 20, 70, 10);

  // Papers on desk
  ctx.fillStyle = '#FFF';
  ctx.fillRect(x - 25, y + 17, 14, 10);
  ctx.fillRect(x + 10, y + 18, 12, 8);

  // Body (dark suit)
  ctx.fillStyle = '#2C3040';
  ctx.beginPath(); ctx.roundRect(x - 12, y - 5, 24, 28, 3); ctx.fill();

  // White shirt / collar
  ctx.fillStyle = '#F0EDE8';
  ctx.fillRect(x - 5, y - 2, 10, 8);

  // Tie (dark red)
  ctx.fillStyle = '#8B2252';
  ctx.beginPath();
  ctx.moveTo(x - 2, y); ctx.lineTo(x + 2, y);
  ctx.lineTo(x + 1, y + 12); ctx.lineTo(x, y + 14); ctx.lineTo(x - 1, y + 12);
  ctx.closePath(); ctx.fill();

  // Head
  ctx.fillStyle = '#E8C898';
  ctx.beginPath(); ctx.arc(x, y - 16, 11, 0, Math.PI * 2); ctx.fill();

  // Hair
  ctx.fillStyle = '#3A2A1A';
  ctx.beginPath(); ctx.arc(x, y - 20, 11.5, Math.PI * 0.8, Math.PI * 2.2); ctx.fill();

  // Glasses
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x - 5, y - 15, 4, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(x + 5, y - 15, 4, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x - 1, y - 15); ctx.lineTo(x + 1, y - 15); ctx.stroke();
  // Temple arms
  ctx.beginPath(); ctx.moveTo(x - 9, y - 15); ctx.lineTo(x - 13, y - 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 9, y - 15); ctx.lineTo(x + 13, y - 14); ctx.stroke();

  // Eyes behind glasses
  ctx.fillStyle = '#2A2A2A';
  ctx.beginPath(); ctx.arc(x - 5, y - 15, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 5, y - 15, 1.5, 0, Math.PI * 2); ctx.fill();
}

// ===== GRID =====
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const top = HEADER_OFFSET;
  const bottom = h - GROUND_OFFSET;

  // Row numbers column
  ctx.fillStyle = '#E8E8E8';
  ctx.fillRect(0, top, ROW_NUM_W, bottom - top);
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ROW_NUM_W, top); ctx.lineTo(ROW_NUM_W, bottom); ctx.stroke();

  // Grid lines
  ctx.strokeStyle = 'rgba(190, 195, 200, 0.45)';
  ctx.lineWidth = 0.5;

  // Vertical
  for (let x = ROW_NUM_W + CELL_W; x < w; x += CELL_W) {
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
  }
  // Horizontal + row numbers
  ctx.font = '9px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  let rIdx = 0;
  for (let y = top; y < bottom; y += CELL_H) {
    ctx.strokeStyle = 'rgba(190, 195, 200, 0.45)';
    ctx.beginPath(); ctx.moveTo(ROW_NUM_W, y); ctx.lineTo(w, y); ctx.stroke();
    // Row number
    if (rIdx < ROW_NUMBERS.length) {
      ctx.fillStyle = '#777';
      ctx.fillText(ROW_NUMBERS[rIdx], ROW_NUM_W / 2, y + CELL_H / 2 + 3);
    }
    rIdx++;
  }

  // Floor line
  ctx.strokeStyle = '#999';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, bottom); ctx.lineTo(w, bottom); ctx.stroke();

  ctx.textAlign = 'left';
}

// ===== 3D BLOCK DRAWING =====
function draw3DBlock(ctx: CanvasRenderingContext2D, cx: number, cy: number,
  bw: number, bh: number, depth: number, color: string) {
  const x = cx - bw / 2;
  const y = cy - bh / 2;
  const dk = darken(color, 28);
  const lt = lighten(color, 32);
  const outline = darken(color, 50);

  // Right face
  ctx.fillStyle = dk;
  ctx.beginPath();
  ctx.moveTo(x + bw, y); ctx.lineTo(x + bw + depth, y - depth);
  ctx.lineTo(x + bw + depth, y + bh - depth); ctx.lineTo(x + bw, y + bh);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = outline; ctx.lineWidth = 1; ctx.stroke();

  // Top face
  ctx.fillStyle = lt;
  ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + depth, y - depth);
  ctx.lineTo(x + bw + depth, y - depth); ctx.lineTo(x + bw, y);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = outline; ctx.stroke();

  // Front face
  ctx.fillStyle = color;
  ctx.fillRect(x, y, bw, bh);
  ctx.strokeStyle = outline;
  ctx.strokeRect(x, y, bw, bh);

  // Shine highlight on front face
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(x + 2, y + 2, bw * 0.4, bh * 0.35);
}

// ===== DOSSIERS =====
function drawDossiers(ctx: CanvasRenderingContext2D, state: GameState) {
  const scale = Math.min(state.canvasWidth / 700, 1.2);

  for (const d of state.dossiers) {
    ctx.save();

    // Drop shadow
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(d.x + 4, d.y + d.radius * 0.8, d.radius * 0.7, d.radius * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const config = STACK_CONFIG[d.size];
    const cw = config.cubeW * scale;
    const ch = config.cubeH * scale;
    const dep = config.depth * scale;
    const rows = config.rows;

    const totalH = rows.length * ch;
    const baseY = d.y + totalH / 2;

    // Get color mix for cubes
    const colors = getCubeColors(d.color);
    let cIdx = 0;

    for (let r = 0; r < rows.length; r++) {
      const count = rows[r];
      const rowCY = baseY - r * ch - ch / 2;
      const rowStartX = d.x - (count * cw) / 2;

      for (let c = 0; c < count; c++) {
        const cubeCX = rowStartX + c * cw + cw / 2;
        draw3DBlock(ctx, cubeCX, rowCY, cw, ch, dep, colors[cIdx % colors.length]);
        cIdx++;
      }
    }

    ctx.restore();
  }
}

function getCubeColors(baseColor: string): string[] {
  const idx = DOSSIER_PALETTE.indexOf(baseColor);
  if (idx === -1) return [baseColor, '#F5C542', '#5B8FB9'];
  return [
    DOSSIER_PALETTE[idx],
    DOSSIER_PALETTE[(idx + 2) % DOSSIER_PALETTE.length],
    DOSSIER_PALETTE[(idx + 4) % DOSSIER_PALETTE.length],
  ];
}

// ===== PROJECTILES =====
function drawProjectiles(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const proj of state.projectiles) {
    if (!proj.active) continue;
    const topY = proj.y - proj.height;

    if (proj.type === 'email') {
      // Green line
      ctx.strokeStyle = 'rgba(46, 139, 87, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(proj.x, proj.y); ctx.lineTo(proj.x, topY); ctx.stroke();

      // Glow
      ctx.fillStyle = 'rgba(46, 139, 87, 0.08)';
      ctx.fillRect(proj.x - 8, topY, 16, proj.height);

      // Envelopes
      const spacing = 20;
      const count = Math.floor(proj.height / spacing);
      for (let i = 0; i <= Math.min(count, 20); i++) {
        const ey = proj.y - i * spacing;
        if (ey < HEADER_OFFSET) break;
        ctx.globalAlpha = 1 - i / Math.max(count, 1) * 0.6;
        drawEnvelope(ctx, proj.x, ey, 8);
        ctx.globalAlpha = 1;
      }

      // Arrow tip
      ctx.fillStyle = '#2E8B57';
      ctx.beginPath();
      ctx.moveTo(proj.x - 5, topY + 10);
      ctx.lineTo(proj.x, topY);
      ctx.lineTo(proj.x + 5, topY + 10);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(proj.x, proj.y); ctx.lineTo(proj.x, topY); ctx.stroke();
      for (let w = 1; w <= 3; w++) {
        ctx.strokeStyle = `rgba(60, 130, 220, ${0.5 - w * 0.12})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(proj.x, topY, w * 10, -Math.PI * 0.6, -Math.PI * 0.4); ctx.stroke();
        ctx.beginPath(); ctx.arc(proj.x, topY, w * 10, Math.PI * 0.4, Math.PI * 0.6); ctx.stroke();
      }
    }
  }
}

function drawEnvelope(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = '#F0F4FA';
  ctx.fillRect(x - s, y - s * 0.5, s * 2, s);
  ctx.strokeStyle = '#2E8B57';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - s, y - s * 0.5, s * 2, s);
  // Flap
  ctx.beginPath();
  ctx.moveTo(x - s, y - s * 0.5);
  ctx.lineTo(x, y + s * 0.15);
  ctx.lineTo(x + s, y - s * 0.5);
  ctx.strokeStyle = '#2E8B57';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

// ===== PLAYER =====
function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState) {
  const { player } = state;
  if (player.invincible > 0 && Math.floor(player.invincible / 8) % 2 === 0) return;

  ctx.save();
  ctx.translate(player.x, player.y);

  // Shadow
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.ellipse(0, 30, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  if (spritesLoaded && spriteIdle && spriteRun) {
    const isMoving = player.direction !== 'idle';
    const sprite = isMoving ? spriteRun : spriteIdle;

    // Sprite sizing: fit to player height (64px tall)
    const drawH = 64;
    const aspectRatio = sprite.naturalWidth / sprite.naturalHeight;
    const drawW = drawH * aspectRatio;

    // Flip when moving left (run sprite faces right by default)
    if (player.direction === 'left') {
      ctx.scale(-1, 1);
    }

    ctx.drawImage(sprite, -drawW / 2, -drawH + 32, drawW, drawH);
  } else {
    // Fallback: simple rectangle while sprites load
    if (player.direction === 'left') ctx.scale(-1, 1);
    ctx.fillStyle = '#F0EDE8';
    ctx.beginPath(); ctx.roundRect(-13, -18, 26, 32, 4); ctx.fill();
    ctx.fillStyle = '#3060A0';
    ctx.beginPath();
    ctx.moveTo(-2, -14); ctx.lineTo(2, -14);
    ctx.lineTo(1.5, 6); ctx.lineTo(0, 9); ctx.lineTo(-1.5, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#E8C898';
    ctx.beginPath(); ctx.arc(0, -26, 10, 0, Math.PI * 2); ctx.fill();
  }

  ctx.restore();
}

// ===== BONUS ITEMS =====
function drawBonusItems(ctx: CanvasRenderingContext2D, state: GameState) {
  for (const b of state.bonuses) {
    if (!b.active) continue;
    ctx.save();
    ctx.translate(b.x, b.y);

    const pulse = Math.sin(frameCount * 0.08) * 0.12 + 0.88;
    ctx.scale(pulse, pulse);

    // Special drawing for coffee (mug) and salary (coin)
    if (b.type === 'coffee') {
      drawCoffeeMug(ctx);
    } else if (b.type === 'salary') {
      drawCoin(ctx);
    } else {
      // Generic circle bonus
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = BONUS_COLORS[b.type];
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;

      const grad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 14);
      grad.addColorStop(0, lighten(BONUS_COLORS[b.type], 35));
      grad.addColorStop(1, BONUS_COLORS[b.type]);
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = darken(BONUS_COLORS[b.type], 20);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const icons: Record<BonusType, string> = {
        coffee: '\u2615', salary: '\u20AC', rtt: 'RTT',
        meeting: '\u260E', speed: '\u26A1', alcohol: '\uD83C\uDF77',
      };
      ctx.fillText(icons[b.type], 0, 1);
      ctx.textBaseline = 'alphabetic';
    }

    ctx.restore();
  }
}

function drawCoffeeMug(ctx: CanvasRenderingContext2D) {
  // Mug body (white)
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.roundRect(-10, -6, 20, 18, 3); ctx.fill();
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Handle
  ctx.strokeStyle = '#AAA';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(12, 2, 6, -Math.PI * 0.4, Math.PI * 0.4); ctx.stroke();

  // Coffee inside
  ctx.fillStyle = '#6F4E37';
  ctx.fillRect(-8, -2, 16, 12);

  // Steam
  ctx.strokeStyle = 'rgba(180,180,180,0.6)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    const sx = -5 + i * 5;
    const sway = Math.sin(frameCount * 0.05 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(sx, -8);
    ctx.quadraticCurveTo(sx + sway, -16, sx, -22);
    ctx.stroke();
  }
}

function drawCoin(ctx: CanvasRenderingContext2D) {
  // Gold coin
  ctx.fillStyle = '#F5C542';
  ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#C49A1F';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner circle
  ctx.strokeStyle = '#D4A030';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke();

  // $ symbol
  ctx.fillStyle = '#8B7010';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u20AC', 0, 1);
  ctx.textBaseline = 'alphabetic';
}

// ===== PARTICLES =====
function drawParticles(ctx: CanvasRenderingContext2D) {
  for (const p of particles) {
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    const s = p.size * (p.life / p.maxLife);
    // Draw as small squares (block debris)
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}

// ===== LEVEL BADGE =====
function drawLevelBadge(ctx: CanvasRenderingContext2D, w: number, state: GameState) {
  const bx = w - 110;
  const by = HEADER_OFFSET + 6;
  const bw = 100;
  const bh = 30;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath(); ctx.roundRect(bx + 2, by + 2, bw, bh, 6); ctx.fill();

  // Gold gradient background
  const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
  grad.addColorStop(0, '#F0C830');
  grad.addColorStop(1, '#D4A020');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill();
  ctx.strokeStyle = '#B08818';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Chrome-like colorful circle icon
  const iconX = bx + 18;
  const iconY = by + bh / 2;
  const ir = 8;
  ctx.fillStyle = '#E85B5B'; ctx.beginPath(); ctx.arc(iconX, iconY, ir, -Math.PI * 0.3, Math.PI * 0.3); ctx.lineTo(iconX, iconY); ctx.fill();
  ctx.fillStyle = '#F5C542'; ctx.beginPath(); ctx.arc(iconX, iconY, ir, Math.PI * 0.3, Math.PI * 0.9); ctx.lineTo(iconX, iconY); ctx.fill();
  ctx.fillStyle = '#27AE60'; ctx.beginPath(); ctx.arc(iconX, iconY, ir, Math.PI * 0.9, Math.PI * 1.5); ctx.lineTo(iconX, iconY); ctx.fill();
  ctx.fillStyle = '#3B82F6'; ctx.beginPath(); ctx.arc(iconX, iconY, ir, Math.PI * 1.5, -Math.PI * 0.3 + Math.PI * 2); ctx.lineTo(iconX, iconY); ctx.fill();
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.arc(iconX, iconY, 4, 0, Math.PI * 2); ctx.fill();

  // Text
  ctx.fillStyle = '#4A2800';
  ctx.font = 'bold 14px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Niveau ${state.level}`, bx + 32, by + 20);
}

// ===== SHEET TABS =====
function drawSheetTabs(ctx: CanvasRenderingContext2D, w: number, h: number, state: GameState) {
  const y = h - GROUND_OFFSET;

  // Tab bar background
  ctx.fillStyle = '#D0D0D0';
  ctx.fillRect(0, y, w, TABS_H);
  ctx.strokeStyle = '#B0B0B0';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();

  // Small nav arrows
  ctx.fillStyle = '#888';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('\u25C0', 12, y + 14);
  ctx.fillText('\u25B6', 28, y + 14);

  // "guibour" tab (active — white)
  const tab1X = 42;
  const tab1W = 90;
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo(tab1X, y + TABS_H);
  ctx.lineTo(tab1X + 4, y + 3);
  ctx.lineTo(tab1X + tab1W - 4, y + 3);
  ctx.lineTo(tab1X + tab1W, y + TABS_H);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#B0B0B0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.player.name || 'guibour', tab1X + tab1W / 2, y + 16);

  // "RTT" tab
  const tab2X = tab1X + tab1W + 2;
  const tab2W = 50;
  ctx.fillStyle = '#E0E0E0';
  ctx.beginPath();
  ctx.moveTo(tab2X, y + TABS_H);
  ctx.lineTo(tab2X + 4, y + 3);
  ctx.lineTo(tab2X + tab2W - 4, y + 3);
  ctx.lineTo(tab2X + tab2W, y + TABS_H);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#B0B0B0';
  ctx.stroke();

  ctx.fillStyle = '#666';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.fillText('RTT', tab2X + tab2W / 2, y + 16);

  ctx.textAlign = 'left';
}

// ===== STATUS BAR =====
function drawStatusBar(ctx: CanvasRenderingContext2D, w: number, h: number, state: GameState) {
  const y = h - STATUS_H;
  const { player } = state;

  // Dark green status bar
  const grad = ctx.createLinearGradient(0, y, 0, h);
  grad.addColorStop(0, '#1A4A2C');
  grad.addColorStop(1, '#0F3320');
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, w, STATUS_H);

  // Row number column continuation
  ctx.fillStyle = '#E0E0E0';
  ctx.fillRect(0, y, ROW_NUM_W, STATUS_H);
  ctx.fillStyle = '#777';
  ctx.font = '9px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('21', ROW_NUM_W / 2, y + 12);
  ctx.fillText('23', ROW_NUM_W / 2, y + 26);

  // RTT lives (gold/red badges)
  let rx = ROW_NUM_W + 10;
  for (let i = 0; i < player.lives; i++) {
    const bg = ctx.createLinearGradient(rx, y + 6, rx, y + 26);
    bg.addColorStop(0, '#E8A020');
    bg.addColorStop(1, '#C08018');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.roundRect(rx, y + 6, 28, 22, 4); ctx.fill();
    ctx.strokeStyle = '#A06010';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rt', rx + 14, y + 21);
    rx += 34;
  }

  // Active effects indicators
  rx += 10;
  for (const eff of state.activeEffects) {
    if (eff.type === 'rtt') continue;
    const pct = eff.remaining / EFFECT_DURATION;
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.roundRect(rx, y + 10, 30, 14, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.roundRect(rx, y + 10, 30 * pct, 14, 3); ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.font = '8px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(eff.type.slice(0, 3).toUpperCase(), rx + 15, y + 20);
    rx += 36;
  }

  // Salary (right side)
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '13px "Segoe UI", sans-serif';
  ctx.fillText('Salaire:', w - 130, y + 22);

  // Salary box
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.roundRect(w - 120, y + 7, 110, 22, 3); ctx.fill();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#1A1A1A';
  ctx.font = 'bold 13px Consolas, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${player.score.toLocaleString('fr-FR')}\u20AC`, w - 16, y + 23);

  ctx.textAlign = 'left';
}

// ===== LEVEL COMPLETE =====
function drawLevelComplete(ctx: CanvasRenderingContext2D, state: GameState) {
  const { canvasWidth: w, canvasHeight: h } = state;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(0, 0, w, h);

  const bW = Math.min(360, w * 0.85);
  const bH = 130;
  const bX = (w - bW) / 2;
  const bY = (h - bH) / 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath(); ctx.roundRect(bX + 3, bY + 3, bW, bH, 6); ctx.fill();

  // Card
  ctx.fillStyle = '#FFF';
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, 6); ctx.fill();

  // Title bar (Excel green)
  ctx.fillStyle = '#1A5C38';
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, 28, [6, 6, 0, 0]); ctx.fill();

  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 11px "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Guibour Corp. \u2014 Notification', bX + 12, bY + 18);

  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Niveau ${state.level} termine !`, w / 2, bY + 60);

  ctx.fillStyle = '#1A5C38';
  ctx.font = 'bold 14px Consolas, monospace';
  ctx.fillText(`Prime: +${(state.level * 500).toLocaleString('fr-FR')} \u20AC`, w / 2, bY + 85);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '11px "Segoe UI", sans-serif';
  ctx.fillText('Prochain niveau...', w / 2, bY + 115);

  ctx.textAlign = 'left';
}

// ===== HELPERS =====
function lighten(hex: string, pct: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const f = pct / 100;
  return `rgb(${Math.min(255, Math.round(r + (255 - r) * f))},${Math.min(255, Math.round(g + (255 - g) * f))},${Math.min(255, Math.round(b + (255 - b) * f))})`;
}

function darken(hex: string, pct: number): string {
  let r: number, g: number, b: number;
  if (hex.startsWith('rgb')) {
    const m = hex.match(/(\d+)/g);
    if (!m) return hex;
    [r, g, b] = m.map(Number);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  const f = 1 - pct / 100;
  return `rgb(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)})`;
}

export { GROUND_OFFSET, HEADER_OFFSET };
