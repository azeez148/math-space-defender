import {
  AfterViewInit, Component, ElementRef, HostListener,
  input, OnDestroy, output, viewChild,
} from '@angular/core';
import { GameEngine } from '../game-engine';
import { CanvasRenderer } from '../canvas-renderer';

@Component({
  selector: 'game-board',
  standalone: true,
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.css',
})
export class GameBoardComponent implements AfterViewInit, OnDestroy {
  readonly game = input.required<GameEngine>();
  readonly frame = output<void>();
  readonly pause = output<void>();

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private renderer = new CanvasRenderer();
  private raf = 0;
  private last = 0;
  private visualTime = 0;
  private keys = new Set<string>();
  private touchMovement = 0;

  ngAfterViewInit(): void {
    const ctx = this.canvas().nativeElement.getContext('2d');
    if (!ctx) return;

    const loop = (time: number) => {
      const dt = this.last ? Math.min((time - this.last) / 1000, .05) : 0;
      this.last = time;

      const g = this.game();
      const movement = this.touchMovement || (
        Number(this.keys.has('ArrowRight') || this.keys.has('d')) -
        Number(this.keys.has('ArrowLeft') || this.keys.has('a'))
      );

      g.update(dt, movement);
      if (g.state !== 'PAUSED') this.visualTime += dt;
      this.renderer.draw(ctx, g, this.visualTime);
      this.frame.emit();
      this.raf = requestAnimationFrame(loop);
    };

    this.raf = requestAnimationFrame(loop);
  }

  aim(event: PointerEvent): void {
    if (this.game().state !== 'PLAYING') return;
    const rect = this.canvas().nativeElement.getBoundingClientRect();
    this.game().selectAt(
      (event.clientX - rect.left) * 1000 / rect.width,
      (event.clientY - rect.top) * 560 / rect.height,
    );
  }

  shoot(event: PointerEvent): void {
    event.preventDefault();
    this.aim(event);
    this.fire();
  }

  fire(): void {
    this.game().fire();
  }

  hold(direction: number, event: PointerEvent): void {
    event.preventDefault();
    this.touchMovement = direction;
  }

  release(): void {
    this.touchMovement = 0;
  }

  @HostListener('window:keydown', ['$event'])
  keydown(event: KeyboardEvent): void {
    if (
      !['PLAYING', 'PAUSED'].includes(this.game().state) ||
      (event.target instanceof HTMLElement &&
        ['INPUT', 'TEXTAREA'].includes(event.target.tagName))
    ) return;

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' ', 'p', '1', '2', '3', '4'].includes(key)) {
      event.preventDefault();
    }

    this.keys.add(key);
    if (event.repeat) return;
    if (key === 'p') this.pause.emit();
    if (key === ' ') this.fire();

    const option = Number(key);
    if (option >= 1 && option <= this.game().asteroids.length) {
      this.game().selected = option - 1;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyup(event: KeyboardEvent): void {
    this.keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  }

  @HostListener('window:blur')
  blur(): void {
    this.keys.clear();
    this.release();
    if (this.game().state === 'PLAYING') this.pause.emit();
  }

  @HostListener('document:visibilitychange')
  visibility(): void {
    if (document.hidden) this.blur();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.keys.clear();
  }
}
