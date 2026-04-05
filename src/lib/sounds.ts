/**
 * sounds.ts
 * Lightweight click-sound utility for W.O.W buttons.
 * Audio is cached on first call to avoid latency.
 */

let clickAudio: HTMLAudioElement | null = null;
let clickReady = false;

function getClickAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!clickAudio) {
    clickAudio = new Audio('/game/audio/button-click.mp3');
    clickAudio.volume = 0.45;
    clickAudio.preload = 'auto';
    clickAudio.addEventListener('canplaythrough', () => { clickReady = true; }, { once: true });
    clickAudio.load();
  }
  return clickAudio;
}

/**
 * Play the button click sound.
 * Safe to call from any event handler — no-ops silently if audio isn't ready.
 */
export function playClick(): void {
  try {
    const audio = getClickAudio();
    if (!audio) return;
    // Clone for rapid successive clicks (avoids waiting for previous playback)
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = 0.45;
    clone.play().catch(() => {/* blocked by browser autoplay policy — silent fail */});
  } catch {
    // Never throw from a UI sound effect
  }
}

/** Pre-warm audio on first user interaction so it's ready immediately after */
export function prewarmClickSound(): void {
  if (typeof window === 'undefined') return;
  getClickAudio();
}
