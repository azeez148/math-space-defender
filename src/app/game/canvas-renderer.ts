import { GameEngine } from './game-engine';
export class CanvasRenderer {
  private stars = Array.from({ length: 115 }, (_, i) => ({ x: (i * 137.51) % 1000, y: (i * 83.27) % 560, radius: i % 7 === 0 ? 1.7 : .7 }));
  draw(ctx: CanvasRenderingContext2D, game: GameEngine, time: number): void {
    ctx.clearRect(0, 0, 1000, 560);
    const bg = ctx.createLinearGradient(0, 0, 1000, 560); bg.addColorStop(0, '#10162e'); bg.addColorStop(.55, '#0b1126'); bg.addColorStop(1, '#221637'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 1000, 560);
    const motion = game.reducedMotion || game.state === 'PAUSED' ? 0 : time * 6;
    for (const star of this.stars) { ctx.globalAlpha = .3 + star.radius / 3; ctx.fillStyle = '#c9dcff'; ctx.beginPath(); ctx.arc(star.x, (star.y + motion) % 560, star.radius, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;
    // A ringed distant planet and Earth's atmospheric edge are drawn locally.
    ctx.save(); ctx.translate(865, 90); ctx.rotate(-.4); ctx.strokeStyle = '#8d6da338'; ctx.lineWidth = 9; ctx.beginPath(); ctx.ellipse(0, 0, 90, 24, 0, 0, Math.PI * 2); ctx.stroke();
    const planet = ctx.createRadialGradient(-20, -20, 1, 0, 0, 49); planet.addColorStop(0, '#78617e'); planet.addColorStop(1, '#282440'); ctx.fillStyle = planet; ctx.beginPath(); ctx.arc(0, 0, 49, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const earth = ctx.createRadialGradient(500, 1030, 470, 500, 1030, 580); earth.addColorStop(0, '#113553'); earth.addColorStop(.8, '#1c5071'); earth.addColorStop(.87, '#57cded'); earth.addColorStop(.9, '#246388'); earth.addColorStop(1, '#11213900'); ctx.fillStyle = earth; ctx.beginPath(); ctx.arc(500, 1030, 580, 0, Math.PI * 2); ctx.fill();
    ctx.setLineDash([4, 8]); ctx.strokeStyle = '#77cbe325'; ctx.beginPath(); ctx.moveTo(0, 455); ctx.lineTo(1000, 455); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = '10px monospace'; ctx.fillStyle = '#88aac5'; ctx.fillText('EARTH DEFENSE LINE', 22, 444);
    for (const [i, a] of game.asteroids.entries()) {
      ctx.save(); ctx.translate(a.x, a.y); ctx.shadowColor = i === game.selected ? '#5bddff' : '#000'; ctx.shadowBlur = i === game.selected ? 22 : 0;
      ctx.beginPath(); for (let j = 0; j < 12; j++) { const angle = j / 12 * Math.PI * 2, r = a.radius * (.87 + .13 * Math.sin(j * 4 + a.seed)); const x = Math.cos(angle) * r, y = Math.sin(angle) * r; if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.closePath();
      const rock = ctx.createLinearGradient(-30, -40, 40, 40); rock.addColorStop(0, '#605969'); rock.addColorStop(1, '#292d45'); ctx.fillStyle = rock; ctx.fill(); ctx.strokeStyle = i === game.selected ? '#6cddff' : '#9a8caa'; ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff0c'; ctx.beginPath(); ctx.arc(-18, -18, 10, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(20, 14, 8, 0, Math.PI * 2); ctx.fill();
      ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(String(a.answer), 0, 1);
      if (i === game.selected) { ctx.strokeStyle = '#61dafa'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, a.radius + 10, -.3, .7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, a.radius + 10, 2.8, 3.8); ctx.stroke(); } ctx.restore();
    }
    for (const p of game.projectiles) { ctx.strokeStyle = '#bcfaff'; ctx.shadowColor = '#39ddff'; ctx.shadowBlur = 16; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .025, p.y - p.vy * .025); ctx.stroke(); } ctx.shadowBlur = 0;
    for (const p of game.particles) { ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4); } ctx.globalAlpha = 1;
    this.ship(ctx, game.playerX, game.playerY, game.reducedMotion ? 0 : time);
  }
  private ship(ctx: CanvasRenderingContext2D, x: number, y: number, time: number): void {
    ctx.save(); ctx.translate(x, y); ctx.shadowColor = '#37d9ff'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#58ddff'; ctx.beginPath(); ctx.moveTo(-10, 22); ctx.lineTo(0, 43 + Math.sin(time * 22) * 7); ctx.lineTo(10, 22); ctx.fill();
    const body = ctx.createLinearGradient(-30, 0, 30, 0); body.addColorStop(0, '#3193cc'); body.addColorStop(.5, '#e0faff'); body.addColorStop(1, '#2da5d9'); ctx.fillStyle = body; ctx.strokeStyle = '#84ecff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, -33); ctx.lineTo(13, 0); ctx.lineTo(36, 24); ctx.lineTo(12, 19); ctx.lineTo(0, 26); ctx.lineTo(-12, 19); ctx.lineTo(-36, 24); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.fillStyle = '#103b68'; ctx.beginPath(); ctx.ellipse(0, -3, 7, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#9af9ff'; ctx.fillRect(-2, -14, 3, 10); ctx.restore();
  }
}
