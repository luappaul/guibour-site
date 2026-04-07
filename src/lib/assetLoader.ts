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
    walkVideo: HTMLVideoElement; // motion design walk (left direction)
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

function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'auto';
    const timeout = setTimeout(() => reject(new Error(`Timeout loading video: ` + src)), 3000);
    video.oncanplaythrough = () => { clearTimeout(timeout); resolve(video); };
    video.onerror = () => { clearTimeout(timeout); reject(new Error(`Failed to load video: ` + src)); };
    video.src = src;
    video.load();
  });
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

export async function loadAllAssets(
  onProgress?: (loaded: number, total: number) => void
): Promise<GameAssets> {
  let loaded = 0;
  // 7 bubbles + 9 bonuses + 1 player idle + 1 player video + 1 tower = 19
  // Backgrounds: 25, Audio: 4
  const total = 19 + 25 + 4;

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

  // Priority: player idle image + walk video (WebM VP9 with alpha channel)
  const playerIdlePromise = loadImage('/game/player/guibour-idle.png').then(img => { tick(); return img; });
  const playerWalkPromise = loadVideo('/game/player/guibour-walk-right.webm?v=3').then(v => { tick(); return v; })
    .catch(() => { tick(); return document.createElement('video'); });

  // Priority: tower
  const towerPromise = loadImage('/game/tower/tower.png').then(img => { tick(); return img; });

  // Wait for priority assets
  await Promise.all([...bubblePromises, ...bonusPromises]);
  const playerIdle = await playerIdlePromise;
  const walkVideo = await playerWalkPromise;
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
    player: { idle: playerIdle, walkVideo },
  };
}
