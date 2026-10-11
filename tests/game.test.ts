import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QuestionGenerator } from '../src/app/game/question-generator';
import { GameEngine } from '../src/app/game/game-engine';
import { Level, Question } from '../src/app/core/models';
test('1500 generated questions have unique choices, one correct answer and valid arithmetic', () => {
  const generator = new QuestionGenerator();
  for (const level of [1, 2, 3] as Level[]) {
    const recent: string[] = [];
    for (let i = 0; i < 500; i++) {
      const q = generator.generate(level);
      assert.equal(q.options.length, level === 1 ? 3 : 4);
      assert.equal(new Set(q.options).size, q.options.length);
      assert.equal(q.options.filter(x => x === q.answer).length, 1);
      assert.ok(q.options.every(x => Number.isInteger(x) && x >= 0));
      const nums = q.text.match(/\d+/g)!.map(Number);
      const [a, b, c] = nums;
      const answer = q.operation === 'addition' ? a + b : q.operation === 'subtraction' ? a - b : q.operation === 'multiplication' ? a * b : q.operation === 'division' ? a / b : a * b + c;
      assert.equal(q.answer, answer); assert.ok(Number.isInteger(answer)); assert.ok(!recent.includes(q.text));
      recent.push(q.text); if (recent.length > 20) recent.shift();
      if (level === 1) assert.ok(a >= 1 && a <= 30 && b >= 1 && b <= 30);
    }
  }
});
class FixedQuestions extends QuestionGenerator { override generate(level: Level): Question { return { text: '8 × 7', answer: 56, options: level === 1 ? [54, 56, 63] : [54, 56, 63, 64], operation: 'multiplication', level }; } }
function advance(game: GameEngine, seconds: number): void { for (let i = 0; i < Math.ceil(seconds / .025); i++) game.update(.025); }
function hit(game: GameEngine, index: number): void { game.selected = index; game.playerX = game.asteroids[index].x; game.fire(); advance(game, .5); }
test('projectile collision awards once and clears other projectiles', () => { const g = new GameEngine(new FixedQuestions()); g.start(1); hit(g, 1); assert.equal(g.score, 15); assert.equal(g.correct, 1); g.fire(); advance(g, .1); assert.equal(g.score, 15); assert.equal(g.lives, 3); });
test('slow correct answer earns ten points', () => { const g = new GameEngine(new FixedQuestions()); g.start(1); advance(g, 8); hit(g, 1); assert.equal(g.score, 10); });
test('wrong answer deducts one life, reveals answer and advances once', () => { const g = new GameEngine(new FixedQuestions()); g.start(1); hit(g, 0); assert.equal(g.lives, 2); assert.equal(g.incorrect, 1); assert.match(g.feedback, /56/); advance(g, 1); assert.equal(g.lives, 2); advance(g, 1); assert.equal(g.round, 2); });
test('pause freezes time, physics and input; restart clears session', () => { const g = new GameEngine(new FixedQuestions()); g.start(2); hit(g, 1); advance(g, 1); g.pause(); const snapshot = JSON.stringify(g); advance(g, 5); g.fire(); assert.equal(JSON.stringify(g), snapshot); g.pause(); advance(g, .1); assert.equal(g.state, 'PLAYING'); g.start(2); assert.equal(g.score, 0); assert.equal(g.lives, 3); assert.equal(g.round, 1); assert.equal(g.correct, 0); assert.equal(g.projectiles.length, 0); });
test('ten successful questions complete each level; next mission carries score', () => { for (const level of [1, 2, 3] as Level[]) { let finished = 0; const g = new GameEngine(new FixedQuestions(), () => {}, () => finished++); g.start(level); for (let i = 0; i < 10; i++) { hit(g, 1); advance(g, 1); } assert.equal(g.state, 'LEVEL_COMPLETE'); assert.equal(g.score, 150); assert.equal(g.correct, 10); assert.equal(finished, 1); if (level < 3) { g.start((level + 1) as Level, true); assert.equal(g.score, 150); assert.equal(g.lives, 3); assert.equal(g.round, 1); } } });
test('timeouts deduct one life per question and end game after three misses', () => { let finished = 0; const g = new GameEngine(new FixedQuestions(), () => {}, () => finished++); g.start(3); for (let i = 0; i < 3; i++) advance(g, 14); assert.equal(g.state, 'GAME_OVER'); assert.equal(g.lives, 0); assert.equal(g.incorrect, 3); assert.equal(finished, 1); advance(g, 10); assert.equal(g.lives, 0); });
test('answer asteroids do not overlap and movement stays inside field', () => { const g = new GameEngine(new FixedQuestions()); g.start(3); for (let i = 1; i < g.asteroids.length; i++) assert.ok(g.asteroids[i].x - g.asteroids[i - 1].x > 86); for (let i = 0; i < 200; i++) g.update(.025, -1); assert.equal(g.playerX, 40); for (let i = 0; i < 200; i++) g.update(.025, 1); assert.equal(g.playerX, 960); });
