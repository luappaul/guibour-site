export interface SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  columns: number;
  fps: number;
}

export interface GameAssets {
  backgrounds: Map<number, HTMLImageElement>;  // 25 images (0-24)
  bubbles: Map<number, HTMLImageElement>;       // 7 sprites (1-7)
  bonuses: Map<string, HTMLImageElement>;       // 9 sprites
  tower: HTMLImageElement;
  audio: {
    gameplay: HTMLAudioElement;
    gameover: HTMLAudioElement;
    bonusArgent: HTMLAudioElement;
    bonusCgt: HTMLAudioElement;
  };
  player: {
    idle: HTMLImageElement;
    walkLeft: SpriteSheet;
    walkRight: SpriteSheet;
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function loadSpriteSheet(
  src: string,
  frameWidth: number,
  frameHeight: number,
  totalFrames: number,
  columns: number,
  fps: number,
): Promise<SpriteSheet> {
  return loadImage(src).then(image => ({
    image, frameWidth, frameHeight, totalFrames, columns, fps,
  }));
}

function loadAudio(src: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const timeout = setTimeout(() => reject(new Error(`Timeout loading audio: ` + src)), 5000);
    audio.oncanplaythrough = () => { clearTimeout(timeout); resolve(audio); };
    audio.onerror = () => { clearTimeout(timeout); reject(new Error(`Failed to load audio: ` + src)); };
    audio.preload = 'auto';
    audio.src = src;
  });
}

// Empty sprite sheet fallback (used if loading fails)
function emptySpriteSheet(): SpriteSheet {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const img = new Image();
  img.src = canvas.toDataURL();
  return { image: img, frameWidth: 1, frameHeight: 1, totalFrames: 1, columns: 1, fps: 1 };
}

export async function loadAllAssets(
  onProgress?: (loaded: number, total: number) => void
): Promise<GameAssets> {
  let loaded = 0;
  // 7 bubbles + 9 bonuses + 1 player idle + 2 player sprite sheets + 1 tower = 20
  // Backgrounds: 25, Audio: 4
  const total = 20 + 25 + 4;

  const tick = () => {
    loaded++;
    onProgress?.(loaded, total);
  };

  // Priority: bubble sprites
  const bubbles = new Map<number, HTMLImageElement>();
  const bubblePromises = [];
  for (let i = 1; i <= 7; i++) {
    bubblePromises.push(
      loadImage(`/game/bubbles/bubble-${i}.png`).then(img => { bubbles.set(i, img); tick(); })
    );
  }

  // Priority: bonus sprites
  const bonusNames = ['cafe', 'biere', 'argent', 'temps', 'pilule', 'stagiaire', 'cgt', 'cgt-shield', 'rtt'];
  const bonusMap = new Map<string, HTMLImageElement>();
  const bonusPromises = bonusNames.map(name =>
    loadImage(`/game/bonuses/${name}.png`).then(img => { bonusMap.set(name, img); tick(); })
  );

  // Player: idle PNG + walk sprite sheets (pre-rendered with alpha, no chroma key needed)
  const playerIdlePromise = loadImage('/game/player/guibour-idle-v5.png').then(img => { tick(); return img; });
  // Sprite sheets: 65 frames each, 248x301 per frame, 8 columns, 12 fps
  const walkRightPromise = loadSpriteSheet('/game/player/walk-right-sprite.png', 248, 301, 65, 8, 12)
    .then(s => { tick(); return s; })
    .catch(() => { tick(); return emptySpriteSheet(); });
  const walkLeftPromise = loadSpriteSheet('/game/player/walk-left-sprite.png', 248, 301, 65, 8, 12)
    .then(s => { tick(); return s; })
    .catch(() => { tick(); return emptySpriteSheet(); });

  // Priority: tower
  const towerPromise = loadImage('/game/tower/tower.png').then(img => { tick(); return img; });

  // Wait for priority assets
  await Promise.all([...bubblePromises, ...bonusPromises]);
  const playerIdle = await playerIdlePromise;
  const walkRight = await walkRightPromise;
  const walkLeft = await walkLeftPromise;
  const tower = await towerPromise;

  // Audio
  const audioPromises = [
    loadAudio('/game/audio/gameplay.mp3').then(a => { tick(); return a; }).catch(() => { tick(); return new Audio(); }),
    loadAudio('/game/audio/gameover.mp3').then(a => { tick(); return a; }).catch(() => { tick(); return new Audio(); }),
    loadAudio('/game/audio/bonus-argent.mp3').then(a => { tick(); return a; }).catch(() => { tick(); return new Audio(); }),
    loadAudio('/game/audio/bonus-cgt.mp3').then(a => { tick(); return a; }).catch(() => { tick(); return new Audio(); }),
  ];
  const [gameplay, gameover, bonusArgent, bonusCgt] = await Promise.all(audioPromises);

  // Backgrounds: load in batches of 5
  const backgrounds = new Map<number, HTMLImageElement>();
  for (let batch = 0; batch < 5; batch++) {
    const batchPromises = [];
    for (let i = batch * 5; i < Math.min((batch + 1) * 5, 25); i++) {
      const idx = i;
      batchPromises.push(
        loadImage(`/game/backgrounds/bg-${String(idx).padStart(2, '0')}.png`)
          .then(img => { backgrounds.set(idx, img); tick(); })
          .catch(() => { tick(); })
      );
    }
    await Promise.all(batchPromises);
  }

  return {
    backgrounds,
    bubbles,
    bonuses: bonusMap,
    tower,
    audio: { gameplay, gameover, bonusArgent, bonusCgt },
    player: { idle: playerIdle, walkLeft, walkRight },
  };
}
