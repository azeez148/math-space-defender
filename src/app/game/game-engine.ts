import { Asteroid, GameState, Level, LEVELS, Particle, Projectile, Question } from '../core/models';
import { QuestionGenerator } from './question-generator';
export class GameEngine {
  state: GameState = 'MENU'; level: Level = 1; score = 0; lives = 3; correct = 0; incorrect = 0; round = 0;
  question!: Question; asteroids: Asteroid[] = []; projectiles: Projectile[] = []; particles: Particle[] = [];
  playerX = 500; readonly playerY = 490; selected = 0; remaining = 22; elapsed = 0; feedback = ''; feedbackGood = true;
  reducedMotion = false; private transition = 0; private fireCooldown = 0;
  constructor(private generator: QuestionGenerator, private sound: (kind: 'laser' | 'correct' | 'wrong' | 'victory' | 'explosion') => void = () => {}, private finish: (engine: GameEngine) => void = () => {}) {}
  get config() { return LEVELS[this.level - 1]; }
  start(level: Level, carry = false): void {
    this.level = level; if (!carry) { this.score = 0; this.correct = 0; this.incorrect = 0; this.lives = 3; }
    this.round = 0; this.playerX = 500; this.particles = []; this.projectiles = []; this.feedback = ''; this.transition = 0; this.fireCooldown = 0; this.state = 'PLAYING'; this.nextQuestion();
  }
  pause(): void { if (this.state === 'PLAYING') this.state = 'PAUSED'; else if (this.state === 'PAUSED') this.state = 'PLAYING'; }
  menu(): void { this.state = 'MENU'; this.asteroids = []; this.projectiles = []; this.particles = []; }
  selectAt(x: number, y: number): boolean {
    const index = this.asteroids.findIndex(a => Math.hypot(x - a.x, y - a.y) < a.radius + 16);
    if (index >= 0) { this.selected = index; return true; } return false;
  }
  fire(): void {
    if (this.state !== 'PLAYING' || this.transition > 0 || this.fireCooldown > 0) return;
    const target = this.asteroids[this.selected]; if (!target) return;
    const dx = target.x - this.playerX, dy = target.y - this.playerY, distance = Math.hypot(dx, dy);
    // Aim at the target's future position, accounting for its downward velocity.
    const futureY = target.y + this.config.speed * distance / 1050;
    const angle = Math.atan2(futureY - this.playerY, dx);
    this.projectiles.push({ x: this.playerX, y: this.playerY - 20, vx: Math.cos(angle) * 1050, vy: Math.sin(angle) * 1050 });
    this.fireCooldown = .22; this.sound('laser');
  }
  update(dt: number, movement = 0): void {
    if (this.state !== 'PLAYING') return;
    dt = Math.max(0, Math.min(dt, .05));
    this.playerX = Math.max(40, Math.min(960, this.playerX + movement * 420 * dt));
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);
    for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    this.particles = this.particles.filter(p => p.life > 0);
    if (this.transition > 0) {
      this.transition -= dt;
      if (this.transition <= 0) {
        if (this.lives <= 0) { this.state = 'GAME_OVER'; this.finish(this); }
        else if (this.round >= 10) { this.state = 'LEVEL_COMPLETE'; this.sound('victory'); this.finish(this); }
        else this.nextQuestion();
      }
      return;
    }
    this.elapsed += dt; this.remaining = Math.max(0, this.config.time - this.elapsed);
    for (const a of this.asteroids) a.y += this.config.speed * dt;
    for (const p of this.projectiles) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      const hit = this.asteroids.find(a => Math.hypot(p.x - a.x, p.y - a.y) < a.radius + 6);
      if (hit) { this.resolve(hit.answer, hit.x, hit.y); return; }
    }
    this.projectiles = this.projectiles.filter(p => p.y > -30 && p.x > -30 && p.x < 1030);
    if (this.remaining <= 0 || this.asteroids.some(a => a.y + a.radius >= 455)) this.resolve(null, 500, 455);
  }
  private nextQuestion(): void {
    this.round++; this.question = this.generator.generate(this.level); this.elapsed = 0; this.remaining = this.config.time;
    this.feedback = ''; this.projectiles = []; this.selected = 0;
    this.asteroids = this.question.options.map((answer, i, arr) => ({ answer, x: (i + 1) * 1000 / (arr.length + 1), y: 90 + (i % 2) * 35, radius: 43, seed: Math.random() * 20 }));
  }
  private resolve(answer: number | null, x: number, y: number): void {
    if (this.transition > 0) return;
    const good = answer === this.question.answer; this.feedbackGood = good;
    if (good) { const bonus = this.elapsed < this.config.time / 3 ? 5 : 0; this.score += 10 + bonus; this.correct++; this.feedback = `${['Excellent shot!', 'Math genius!', 'Perfect hit!', 'Amazing!'][this.correct % 4]} +${10 + bonus}`; this.sound('correct'); this.sound('explosion'); }
    else { this.lives--; this.incorrect++; this.feedback = `${answer === null ? 'Earth took a hit!' : 'Keep going, pilot!'} ${this.question.text} = ${this.question.answer}`; this.sound('wrong'); }
    const color = good ? '#64f5d0' : '#ff728c';
    for (let i = 0; i < (this.reducedMotion ? 8 : 45); i++) { const angle = Math.random() * Math.PI * 2, speed = 40 + Math.random() * 200; this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .4 + Math.random() * .8, color }); }
    this.asteroids = []; this.projectiles = []; this.transition = good ? .85 : 1.8;
  }
}
