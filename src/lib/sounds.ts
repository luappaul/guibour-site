/**
 * sounds.ts
 * Sound utilities for W.O.W — button clicks and bonus collection sounds.
 */
import type { BonusType } from './gameTypes';

// ── Button click sound ──────────────────────────────────────────────────────
let clickAudio: HTMLAudioElement | null = null;

function getClickAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!clickAudio) {
    clickAudio = new Audio('/game/audio/button-click.mp3');
    clickAudio.volume = 0.45;
    clickAudio.preload = 'auto';
    clickAudio.load();
  }
  return clickAudio;
}

export function playClick(): void {
  try {
    const audio = getClickAudio();
    if (!audio) return;
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = 0.45;
    clone.playbackRate = 1.0; // no pitch shift — use original file exactly
    clone.play().catch(() => {});
  } catch {}
}

export function prewarmClickSound(): void {
  if (typeof window === 'undefined') return;
  getClickAudio();
}

// ── Bonus collection sounds ─────────────────────────────────────────────────
const BONUS_SOUND_MAP: Partial<Record<BonusType, string>> = {
  argent:    '/game/audio/bonus-argent.mp3',
  cgt:       '/game/audio/bonus-cgt.mp3',
  rtt:       '/game/audio/bonus-cgt.mp3',   // reuse CGT fanfare for RTT
  cafe:      '/game/audio/bonus-argent.mp3', // upbeat coin sound
  biere:     '/game/audio/bonus-argent.mp3',
  pilule:    '/game/audio/bonus-argent.mp3',
  stagiaire: '/game/audio/bonus-argent.mp3',
  temps:     '/game/audio/bonus-cgt.mp3',
};

const BONUS_PITCH_MAP: Partial<Record<BonusType, number>> = {
  argent:    1.0,
  cgt:       1.0,
  rtt:       1.1,
  cafe:      1.2,
  biere:     0.9,
  pilule:    1.4,
  stagiaire: 0.85,
  temps:     1.15,
};

const bonusAudioCache: Partial<Record<string, HTMLAudioElement>> = {};

function getBonusAudio(src: string): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!bonusAudioCache[src]) {
    const a = new Audio(src);
    a.volume = 0.55;
    a.preload = 'auto';
    a.load();
    bonusAudioCache[src] = a;
  }
  return bonusAudioCache[src]!;
}

export function playBonusSound(type: BonusType): void {
  try {
    const src = BONUS_SOUND_MAP[type];
    if (!src) return;
    const audio = getBonusAudio(src);
    if (!audio) return;
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = 0.55;
    clone.playbackRate = BONUS_PITCH_MAP[type] ?? 1.0;
    clone.play().catch(() => {});
  } catch {}
}

export function prewarmBonusSounds(): void {
  if (typeof window === 'undefined') return;
  getBonusAudio('/game/audio/bonus-argent.mp3');
  getBonusAudio('/game/audio/bonus-cgt.mp3');
}
