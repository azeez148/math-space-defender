import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { AudioService, QuestionService, StorageService } from './core/services';
import { Level, LEVELS } from './core/models';
import { GameEngine } from './game/game-engine';
import { GameBoardComponent } from './game/game-board/game-board.component';
import { ExhibitionGuideComponent, ScoreboardComponent } from './components';
@Component({ selector: 'app-root', standalone: true, imports: [GameBoardComponent, ScoreboardComponent, ExhibitionGuideComponent], templateUrl: './app.component.html' })
export class AppComponent implements OnDestroy {
  readonly Math = Math;
  readonly storage = inject(StorageService); readonly audio = inject(AudioService); private questions = inject(QuestionService);
  readonly revision = signal(0); readonly levels = LEVELS; readonly guide = signal(false); readonly settings = signal(false);
  readonly name = signal(this.storage.read('student', 'Student name')); readonly school = signal(this.storage.read('school', 'School name'));
  readonly reduced = signal(this.storage.read('motion', String(matchMedia('(prefers-reduced-motion: reduce)').matches)) === 'true');
  readonly engine = new GameEngine(this.questions, kind => this.audio.play(kind), game => { this.storage.record(game.score); if (game.state === 'LEVEL_COMPLETE') this.storage.unlock(game.level + 1); });
  readonly state = computed(() => { this.revision(); return this.engine.state; });
  readonly active = computed(() => ['PLAYING', 'PAUSED', 'GAME_OVER', 'LEVEL_COMPLETE'].includes(this.state()));
  constructor() { this.engine.reducedMotion = this.reduced(); }
  sync(): void { this.revision.update(v => v + 1); }
  selectLevels(): void { this.engine.state = 'LEVEL_SELECT'; this.sync(); }
  start(level: Level, carry = false): void { this.guide.set(false); this.engine.start(level, carry); this.sync(); }
  menu(): void { this.storage.record(this.engine.score); this.engine.menu(); this.sync(); }
  pause(): void { this.engine.pause(); this.sync(); }
  next(): void { if (this.engine.level < 3) this.start((this.engine.level + 1) as Level, true); }
  toggleMotion(): void { this.reduced.update(v => !v); this.engine.reducedMotion = this.reduced(); this.storage.write('motion', String(this.reduced())); }
  edit(event: Event, field: 'student' | 'school'): void { const value = (event.target as HTMLInputElement).value; (field === 'student' ? this.name : this.school).set(value); this.storage.write(field, value); }
  accuracy(): number { const total = this.engine.correct + this.engine.incorrect; return total ? Math.round(this.engine.correct / total * 100) : 0; }
  ngOnDestroy(): void { this.audio.close(); }
}
