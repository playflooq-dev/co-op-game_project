import {
  ARENA_HEIGHT,
  ARENA_WIDTH,
  BULLET_DAMAGE,
  BULLET_LIFETIME,
  BULLET_RADIUS,
  BULLET_SPEED,
  FIRE_COOLDOWN,
  MAX_PLAYERS,
  PLAYER_MAX_HP,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  REVIVE_RADIUS,
  REVIVE_TIME,
  type EnemyKind,
  type GameSnapshot,
  type InputState,
  type Phase,
} from "../shared/protocol.js";

const COLORS = ["#4fc3f7", "#ffb74d", "#81c784", "#f06292"];
const INTERMISSION_SECONDS = 5;

const ENEMY_STATS: Record<EnemyKind, { radius: number; hp: number; speed: number; damage: number; points: number }> = {
  grunt: { radius: 14, hp: 50, speed: 90, damage: 15, points: 10 },
  runner: { radius: 10, hp: 25, speed: 170, damage: 8, points: 15 },
  brute: { radius: 26, hp: 250, speed: 55, damage: 35, points: 50 },
};

interface Player {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  hp: number;
  downed: boolean;
  reviveTimer: number;
  fireCooldown: number;
  score: number;
  input: InputState;
}

interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  hp: number;
  attackCooldown: number;
}

interface Bullet {
  id: number;
  ownerId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const idleInput = (): InputState => ({
  up: false,
  down: false,
  left: false,
  right: false,
  shooting: false,
  aim: 0,
});

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const dist2 = (ax: number, ay: number, bx: number, by: number) => (ax - bx) ** 2 + (ay - by) ** 2;

export class Game {
  private players = new Map<string, Player>();
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private phase: Phase = "lobby";
  private wave = 0;
  private timer = 0;
  private spawnQueue: EnemyKind[] = [];
  private spawnTimer = 0;
  private nextId = 1;

  get playerCount() {
    return this.players.size;
  }

  isFull() {
    return this.players.size >= MAX_PLAYERS;
  }

  addPlayer(id: string, name: string) {
    const usedColors = new Set([...this.players.values()].map((p) => p.color));
    const color = COLORS.find((c) => !usedColors.has(c)) ?? COLORS[0];
    const spawn = this.spawnPoint(this.players.size);
    // Players who join mid-game start downed so a teammate has to revive them in.
    const joiningLate = this.phase === "playing";
    this.players.set(id, {
      id,
      name: name.slice(0, 16) || "Player",
      color,
      x: spawn.x,
      y: spawn.y,
      hp: joiningLate ? 0 : PLAYER_MAX_HP,
      downed: joiningLate,
      reviveTimer: 0,
      fireCooldown: 0,
      score: 0,
      input: idleInput(),
    });
  }

  removePlayer(id: string) {
    this.players.delete(id);
    if (this.players.size === 0) this.reset();
  }

  setInput(id: string, input: InputState) {
    const p = this.players.get(id);
    if (p) p.input = sanitizeInput(input);
  }

  requestStart() {
    if (this.phase === "lobby" || this.phase === "gameover") {
      this.reset();
      this.startIntermission();
    }
  }

  private reset() {
    this.enemies = [];
    this.bullets = [];
    this.wave = 0;
    this.timer = 0;
    this.spawnQueue = [];
    this.phase = "lobby";
    let i = 0;
    for (const p of this.players.values()) {
      const s = this.spawnPoint(i++);
      Object.assign(p, { x: s.x, y: s.y, hp: PLAYER_MAX_HP, downed: false, reviveTimer: 0, score: 0 });
    }
  }

  private spawnPoint(index: number) {
    const offsets = [
      [-40, -40],
      [40, -40],
      [-40, 40],
      [40, 40],
    ];
    const [dx, dy] = offsets[index % offsets.length];
    return { x: ARENA_WIDTH / 2 + dx, y: ARENA_HEIGHT / 2 + dy };
  }

  private startIntermission() {
    this.phase = "intermission";
    this.timer = INTERMISSION_SECONDS;
  }

  private startWave() {
    this.wave++;
    this.phase = "playing";
    // Waves scale with both wave number and team size.
    const scale = 1 + (this.players.size - 1) * 0.5;
    const grunts = Math.round((4 + this.wave * 2) * scale);
    const runners = this.wave >= 2 ? Math.round(this.wave * 1.5 * scale) : 0;
    const brutes = this.wave >= 3 ? Math.round(Math.floor(this.wave / 3) * scale) : 0;
    this.spawnQueue = shuffle([
      ...Array<EnemyKind>(grunts).fill("grunt"),
      ...Array<EnemyKind>(runners).fill("runner"),
      ...Array<EnemyKind>(brutes).fill("brute"),
    ]);
    this.spawnTimer = 0;
    // Revive everyone between waves at partial health.
    for (const p of this.players.values()) {
      if (p.downed) {
        p.downed = false;
        p.hp = PLAYER_MAX_HP / 2;
      }
    }
  }

  update(dt: number) {
    if (this.phase === "intermission") {
      this.timer -= dt;
      if (this.timer <= 0) this.startWave();
    }
    if (this.phase !== "lobby") this.updatePlayers(dt);
    if (this.phase === "playing") {
      this.updateSpawning(dt);
      this.updateEnemies(dt);
      this.updateBullets(dt);
      this.updateRevives(dt);
      this.checkWaveState();
    } else {
      this.updateBullets(dt);
    }
  }

  private updatePlayers(dt: number) {
    for (const p of this.players.values()) {
      p.fireCooldown = Math.max(0, p.fireCooldown - dt);
      if (p.downed) continue;
      let dx = (p.input.right ? 1 : 0) - (p.input.left ? 1 : 0);
      let dy = (p.input.down ? 1 : 0) - (p.input.up ? 1 : 0);
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        dx /= len;
        dy /= len;
      }
      p.x = clamp(p.x + dx * PLAYER_SPEED * dt, PLAYER_RADIUS, ARENA_WIDTH - PLAYER_RADIUS);
      p.y = clamp(p.y + dy * PLAYER_SPEED * dt, PLAYER_RADIUS, ARENA_HEIGHT - PLAYER_RADIUS);

      if (p.input.shooting && p.fireCooldown === 0 && this.phase === "playing") {
        p.fireCooldown = FIRE_COOLDOWN;
        const cos = Math.cos(p.input.aim);
        const sin = Math.sin(p.input.aim);
        this.bullets.push({
          id: this.nextId++,
          ownerId: p.id,
          x: p.x + cos * (PLAYER_RADIUS + 4),
          y: p.y + sin * (PLAYER_RADIUS + 4),
          vx: cos * BULLET_SPEED,
          vy: sin * BULLET_SPEED,
          life: BULLET_LIFETIME,
        });
      }
    }
  }

  private updateSpawning(dt: number) {
    if (this.spawnQueue.length === 0) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = Math.max(0.25, 1.2 - this.wave * 0.08);
    const kind = this.spawnQueue.pop()!;
    // Spawn just inside a random edge of the arena.
    const edge = Math.floor(Math.random() * 4);
    const r = ENEMY_STATS[kind].radius;
    const x = edge === 0 ? r : edge === 1 ? ARENA_WIDTH - r : Math.random() * ARENA_WIDTH;
    const y = edge === 2 ? r : edge === 3 ? ARENA_HEIGHT - r : Math.random() * ARENA_HEIGHT;
    this.enemies.push({ id: this.nextId++, kind, x, y, hp: ENEMY_STATS[kind].hp, attackCooldown: 0 });
  }

  private updateEnemies(dt: number) {
    const alive = [...this.players.values()].filter((p) => !p.downed);
    for (const e of this.enemies) {
      const stats = ENEMY_STATS[e.kind];
      e.attackCooldown = Math.max(0, e.attackCooldown - dt);
      let target: Player | undefined;
      let best = Infinity;
      for (const p of alive) {
        const d = dist2(e.x, e.y, p.x, p.y);
        if (d < best) {
          best = d;
          target = p;
        }
      }
      if (!target) continue;
      const d = Math.sqrt(best);
      const reach = stats.radius + PLAYER_RADIUS;
      if (d > reach) {
        e.x += ((target.x - e.x) / d) * stats.speed * dt;
        e.y += ((target.y - e.y) / d) * stats.speed * dt;
      } else if (e.attackCooldown === 0) {
        e.attackCooldown = 0.8;
        target.hp -= stats.damage;
        if (target.hp <= 0) {
          target.hp = 0;
          target.downed = true;
          target.reviveTimer = 0;
        }
      }
    }
    // Light separation so enemies don't stack into a single blob.
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = i + 1; j < this.enemies.length; j++) {
        const a = this.enemies[i];
        const b = this.enemies[j];
        const min = ENEMY_STATS[a.kind].radius + ENEMY_STATS[b.kind].radius;
        const d = Math.sqrt(dist2(a.x, a.y, b.x, b.y)) || 0.01;
        if (d < min) {
          const push = (min - d) / 2;
          const nx = (a.x - b.x) / d;
          const ny = (a.y - b.y) / d;
          a.x += nx * push;
          a.y += ny * push;
          b.x -= nx * push;
          b.y -= ny * push;
        }
      }
    }
  }

  private updateBullets(dt: number) {
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      for (const e of this.enemies) {
        if (e.hp <= 0) continue;
        const r = ENEMY_STATS[e.kind].radius + BULLET_RADIUS;
        if (dist2(b.x, b.y, e.x, e.y) <= r * r) {
          e.hp -= BULLET_DAMAGE;
          b.life = 0;
          if (e.hp <= 0) {
            const owner = this.players.get(b.ownerId);
            if (owner) owner.score += ENEMY_STATS[e.kind].points;
          }
          break;
        }
      }
    }
    this.bullets = this.bullets.filter(
      (b) => b.life > 0 && b.x >= 0 && b.x <= ARENA_WIDTH && b.y >= 0 && b.y <= ARENA_HEIGHT,
    );
    this.enemies = this.enemies.filter((e) => e.hp > 0);
  }

  private updateRevives(dt: number) {
    const players = [...this.players.values()];
    for (const p of players) {
      if (!p.downed) continue;
      const helped = players.some(
        (o) => o !== p && !o.downed && dist2(o.x, o.y, p.x, p.y) <= REVIVE_RADIUS ** 2,
      );
      p.reviveTimer = helped ? p.reviveTimer + dt : Math.max(0, p.reviveTimer - dt / 2);
      if (p.reviveTimer >= REVIVE_TIME) {
        p.downed = false;
        p.hp = PLAYER_MAX_HP / 2;
        p.reviveTimer = 0;
      }
    }
  }

  private checkWaveState() {
    const players = [...this.players.values()];
    if (players.length > 0 && players.every((p) => p.downed)) {
      this.phase = "gameover";
      return;
    }
    if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.startIntermission();
    }
  }

  snapshot(): GameSnapshot {
    const round = (n: number) => Math.round(n * 10) / 10;
    return {
      phase: this.phase,
      wave: this.wave,
      timer: Math.max(0, round(this.timer)),
      players: [...this.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        x: round(p.x),
        y: round(p.y),
        aim: round(p.input.aim * 10) / 10,
        hp: Math.round(p.hp),
        downed: p.downed,
        reviveProgress: round(p.reviveTimer / REVIVE_TIME),
        score: p.score,
      })),
      enemies: this.enemies.map((e) => ({
        id: e.id,
        kind: e.kind,
        x: round(e.x),
        y: round(e.y),
        radius: ENEMY_STATS[e.kind].radius,
        hp: e.hp,
        maxHp: ENEMY_STATS[e.kind].hp,
      })),
      bullets: this.bullets.map((b) => ({ id: b.id, x: round(b.x), y: round(b.y) })),
    };
  }
}

function sanitizeInput(raw: Partial<InputState>): InputState {
  const aim = Number(raw.aim);
  return {
    up: raw.up === true,
    down: raw.down === true,
    left: raw.left === true,
    right: raw.right === true,
    shooting: raw.shooting === true,
    aim: Number.isFinite(aim) ? aim : 0,
  };
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
