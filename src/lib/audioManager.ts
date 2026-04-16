import { GameAssets } from './assetLoader';

type SoundName = 'gameplay' | 'gameover' | 'bonus-argent' | 'bonus-cgt' | 'slot-machine' | 'elevator-bell';

class AudioManager {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  private volume: number = 0.5;
  private defaultGameplay: HTMLAudioElement | null = null;
  private levelMusic: HTMLAudioElement | null = null;
  private currentMusicOverride: string | null = null;

  init(assets: GameAssets) {
    this.sounds.set('gameplay', assets.audio.gameplay);
    this.sounds.set('gameover', assets.audio.gameover);
    this.sounds.set('bonus-argent', assets.audio.bonusArgent);
    this.sounds.set('bonus-cgt', assets.audio.bonusCgt);
    this.sounds.set('slot-machine', assets.audio.slotMachine);
    this.sounds.set('elevator-bell', assets.audio.elevatorBell);

    const gameplay = this.sounds.get('gameplay');
    if (gameplay) {
      gameplay.loop = true;
      gameplay.volume = this.volume;
      this.defaultGameplay = gameplay;
    }
  }

  play(sound: SoundName) {
    if (this.muted) return;
    const audio = this.sounds.get(sound);
    if (!audio) return;
    if (sound !== 'gameplay') {
      audio.currentTime = 0;
    }
    audio.volume = this.volume;
    audio.play().catch(() => {});
  }

  stop(sound: SoundName) {
    const audio = this.sounds.get(sound);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    // Also stop level-specific music
    if (sound === 'gameplay' && this.levelMusic) {
      this.levelMusic.pause();
      this.levelMusic.currentTime = 0;
      this.levelMusic = null;
      this.currentMusicOverride = null;
    }
  }

  /** Switch to level-specific music or back to default */
  setLevelMusic(musicPath: string | undefined) {
    // Same track already playing — do nothing
    if (musicPath === this.currentMusicOverride) return;

    // Stop current level music if any
    if (this.levelMusic) {
      this.levelMusic.pause();
      this.levelMusic.currentTime = 0;
      this.levelMusic = null;
    }

    if (musicPath) {
      // Pause default gameplay music
      this.defaultGameplay?.pause();

      // Load and play level-specific music
      const audio = new Audio(musicPath);
      audio.loop = true;
      audio.volume = this.volume;
      this.levelMusic = audio;
      this.currentMusicOverride = musicPath;
      if (!this.muted) {
        audio.play().catch(() => {});
      }
    } else {
      // Return to default gameplay music
      this.currentMusicOverride = null;
      if (!this.muted && this.defaultGameplay) {
        this.defaultGameplay.play().catch(() => {});
      }
    }
  }

  /** Pause gameplay music (for slot machine solo sound) */
  pauseGameplay() {
    const gameplay = this.sounds.get('gameplay');
    if (gameplay) gameplay.pause();
    if (this.levelMusic) this.levelMusic.pause();
  }

  /** Resume gameplay music */
  resumeGameplay() {
    if (this.muted) return;
    if (this.levelMusic) {
      this.levelMusic.play().catch(() => {});
    } else {
      const gameplay = this.sounds.get('gameplay');
      if (gameplay) gameplay.play().catch(() => {});
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.sounds.get('gameplay')?.pause();
      if (this.levelMusic) this.levelMusic.pause();
    }
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    const gameplay = this.sounds.get('gameplay');
    if (gameplay) gameplay.volume = this.volume;
    if (this.levelMusic) this.levelMusic.volume = this.volume;
  }
}

export const audioManager = new AudioManager();
