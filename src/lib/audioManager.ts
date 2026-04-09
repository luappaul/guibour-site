import { GameAssets } from './assetLoader';

type SoundName = 'gameplay' | 'gameover' | 'bonus-argent' | 'bonus-cgt' | 'slot-machine' | 'elevator-bell';

class AudioManager {
  private sounds: Map<SoundName, HTMLAudioElement> = new Map();
  private muted: boolean = false;
  private volume: number = 0.5;

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
  }

  /** Pause gameplay music (for slot machine solo sound) */
  pauseGameplay() {
    const gameplay = this.sounds.get('gameplay');
    if (gameplay) gameplay.pause();
  }

  /** Resume gameplay music */
  resumeGameplay() {
    if (this.muted) return;
    const gameplay = this.sounds.get('gameplay');
    if (gameplay) gameplay.play().catch(() => {});
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.sounds.get('gameplay')?.pause();
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
  }
}

export const audioManager = new AudioManager();
