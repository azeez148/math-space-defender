export type GameState = 'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER';
export type Level = 1 | 2 | 3;
export interface Question { text: string; answer: number; options: number[]; level: Level; operation: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed'; }
export interface Asteroid { x: number; y: number; radius: number; answer: number; seed: number; }
export interface Projectile { x: number; y: number; vx: number; vy: number; }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }
export const LEVELS = [
  { id: 1 as Level, name: 'Space Rookie', description: 'Addition & subtraction', time: 22, speed: 15, options: 3, color: '#58e5ca' },
  { id: 2 as Level, name: 'Galaxy Warrior', description: 'Multiplication & division', time: 17, speed: 21, options: 4, color: '#a995ff' },
  { id: 3 as Level, name: 'Math Commander', description: 'Mixed operations', time: 12, speed: 29, options: 4, color: '#ffbd71' }
];
