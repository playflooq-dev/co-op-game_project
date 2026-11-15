// Messages and data shapes shared by the server and the browser client.

export const ARENA_WIDTH = 1200;
export const ARENA_HEIGHT = 800;
export const TICK_RATE = 30; // server simulation steps per second
export const MAX_PLAYERS = 4;

export const PLAYER_RADIUS = 16;
export const PLAYER_SPEED = 220; // px/s
export const PLAYER_MAX_HP = 100;
export const FIRE_COOLDOWN = 0.18; // seconds between shots
export const BULLET_SPEED = 600;
export const BULLET_RADIUS = 4;
export const BULLET_LIFETIME = 1.2;
export const BULLET_DAMAGE = 25;
export const REVIVE_RADIUS = 48;
export const REVIVE_TIME = 2.5; // seconds a teammate must stand nearby

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shooting: boolean;
  aim: number; // radians
}

export interface PlayerView {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  aim: number;
  hp: number;
  downed: boolean;
  reviveProgress: number; // 0..1
  score: number;
}

export interface EnemyView {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
}

export type EnemyKind = "grunt" | "runner" | "brute";

export interface BulletView {
  id: number;
  x: number;
  y: number;
}

export type Phase = "lobby" | "playing" | "intermission" | "gameover";

export interface GameSnapshot {
  phase: Phase;
  wave: number;
  timer: number; // seconds left in intermission, 0 otherwise
  players: PlayerView[];
  enemies: EnemyView[];
  bullets: BulletView[];
}

export type ClientMessage =
  | { type: "join"; name: string }
  | { type: "input"; input: InputState }
  | { type: "start" };

export type ServerMessage =
  | { type: "welcome"; id: string }
  | { type: "full" }
  | { type: "state"; state: GameSnapshot };
