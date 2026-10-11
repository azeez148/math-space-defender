import { Level, Question } from '../core/models';
/** Pure question generator; injectable wrapper is kept separate for easy unit testing. */
export class QuestionGenerator {
  private recent: string[] = [];
  private integer(min: number, max: number): number { return min + Math.floor(Math.random() * (max - min + 1)); }
  generate(level: Level): Question {
    let q: Question;
    let attempts = 0;
    do { q = this.create(level); } while (this.recent.includes(q.text) && ++attempts < 100);
    this.recent.push(q.text); this.recent = this.recent.slice(-20);
    const choices = new Set<number>([q.answer]);
    while (choices.size < (level === 1 ? 3 : 4)) {
      const candidate = q.answer + this.integer(-12, 12);
      if (candidate >= 0) choices.add(candidate);
    }
    q.options = [...choices];
    for (let i = q.options.length - 1; i > 0; i--) { const j = this.integer(0, i); [q.options[i], q.options[j]] = [q.options[j], q.options[i]]; }
    return q;
  }
  private create(level: Level): Question {
    let a = this.integer(1, level === 1 ? 30 : 12), b = this.integer(1, level === 1 ? 30 : 12);
    const op = this.integer(0, level === 1 ? 1 : level === 2 ? 1 : 4);
    let text: string, answer: number, operation: Question['operation'];
    if (level === 3 && op === 4) {
      const c = this.integer(1, 15); text = `(${a} × ${b}) + ${c}`; answer = a * b + c; operation = 'mixed';
    } else if ((level === 1 && op === 0) || (level === 3 && op === 0)) {
      text = `${a} + ${b}`; answer = a + b; operation = 'addition';
    } else if ((level === 1 && op === 1) || (level === 3 && op === 1)) {
      if (a < b) [a, b] = [b, a]; text = `${a} − ${b}`; answer = a - b; operation = 'subtraction';
    } else if ((level === 2 && op === 0) || op === 2) {
      text = `${a} × ${b}`; answer = a * b; operation = 'multiplication';
    } else { text = `${a * b} ÷ ${b}`; answer = a; operation = 'division'; }
    return { text, answer, operation, level, options: [] };
  }
}
