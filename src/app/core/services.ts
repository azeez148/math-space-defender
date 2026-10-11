import { Injectable, signal } from '@angular/core';
import { QuestionGenerator } from '../game/question-generator';
@Injectable({ providedIn: 'root' })
export class QuestionService extends QuestionGenerator {}
@Injectable({ providedIn: 'root' })
export class StorageService {
  read(key: string, fallback: string): string { try { return localStorage.getItem('msd-' + key) ?? fallback; } catch { return fallback; } }
  write(key: string, value: string): void { try { localStorage.setItem('msd-' + key, value); } catch { /* Game still works when storage is unavailable. */ } }
  readonly highScore = signal(Number(this.read('high-score', '0')) || 0);
  readonly unlocked = signal(Math.min(3, Math.max(1, Number(this.read('unlocked', '1')) || 1)));
  record(score: number): void { if (score > this.highScore()) { this.highScore.set(score); this.write('high-score', String(score)); } }
  unlock(level: number): void { this.unlocked.set(Math.max(this.unlocked(), Math.min(3, level))); this.write('unlocked', String(this.unlocked())); }
}
@Injectable({ providedIn: 'root' })
export class AudioService {
  readonly enabled = signal(false);
  private context?: AudioContext;
  toggle(): void { this.enabled.update(v => !v); if (this.enabled()) { this.context ??= new AudioContext(); void this.context.resume(); this.play('correct'); } }
  play(kind: 'laser' | 'correct' | 'wrong' | 'victory' | 'explosion'): void {
    if (!this.enabled() || !this.context) return;
    const ctx = this.context;
    const notes = kind === 'victory' ? [523, 659, 784, 1047] : kind === 'correct' ? [660, 880] : kind === 'wrong' ? [160, 100] : kind === 'explosion' ? [65] : [950];
    notes.forEach((frequency, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain(), start = ctx.currentTime + i * .11;
      osc.type = kind === 'laser' ? 'sawtooth' : kind === 'explosion' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(frequency, start); osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency / 2), start + .18);
      gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(.09, start + .01); gain.gain.exponentialRampToValueAtTime(.0001, start + .22);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + .24); osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }
  close(): void { void this.context?.close(); }
}
