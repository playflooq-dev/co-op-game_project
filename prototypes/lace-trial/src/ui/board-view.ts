import { samePoint } from '../core/grid.ts';
import type { GameState, LevelDef, Point, Role } from '../core/types.ts';
import { PALETTE } from './theme.ts';

/** Everything the board needs to draw one phone's view. */
export interface BoardModel {
  readonly level: LevelDef;
  readonly state: GameState;
  readonly role: Role;
  /** Holes the Bobbin can reach next. Empty for the Pin. */
  readonly reachable: readonly Point[];
}

export interface BoardView {
  setModel(model: BoardModel): void;
  onTap(handler: (hole: Point) => void): void;
  destroy(): void;
}

interface Layout {
  cell: number;
  ox: number;
  oy: number;
}

const PING_MS = 1600;

/**
 * Draws the pattern card on a canvas and turns taps into hole coordinates.
 * The Pin's view hides the pattern: that is the split information.
 */
export function createBoardView(canvas: HTMLCanvasElement): BoardView {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is not available');
  const ctx: CanvasRenderingContext2D = context;
  let model: BoardModel | null = null;
  let layout: Layout = { cell: 1, ox: 0, oy: 0 };
  let tapHandler: (hole: Point) => void = () => {};
  let lastPingId = -1;
  let pingStart = 0;
  let frame = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (model) {
      const { cols, rows } = model.level;
      const margin = 1.1;
      const cell = Math.min(rect.width / (cols - 1 + margin * 2), rect.height / (rows - 1 + margin * 2));
      layout = {
        cell,
        ox: (rect.width - (cols - 1) * cell) / 2,
        oy: (rect.height - (rows - 1) * cell) / 2,
      };
    }
    draw();
  };

  const toScreen = (p: Point) => ({ x: layout.ox + p.x * layout.cell, y: layout.oy + p.y * layout.cell });

  const polyline = (points: readonly Point[]) => {
    points.forEach((p, i) => {
      const s = toScreen(p);
      if (i === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
  };

  const circle = (p: Point, r: number) => {
    const s = toScreen(p);
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
  };

  function draw(now = performance.now()) {
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = PALETTE.pillow;
    ctx.fillRect(0, 0, rect.width, rect.height);
    if (!model) return;
    const { level, state, role, reachable } = model;
    const c = layout.cell;

    // The pattern card.
    const pad = c * 0.6;
    const topLeft = toScreen({ x: 0, y: 0 });
    ctx.fillStyle = PALETTE.card;
    ctx.strokeStyle = PALETTE.cardEdge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(topLeft.x - pad, topLeft.y - pad, (level.cols - 1) * c + pad * 2, (level.rows - 1) * c + pad * 2, c * 0.12);
    ctx.fill();
    ctx.stroke();

    // The pattern drawing: only the Bobbin has it.
    if (role === 'bobbin') {
      ctx.save();
      ctx.strokeStyle = PALETTE.pattern;
      ctx.lineWidth = c * 0.14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([c * 0.2, c * 0.16]);
      ctx.beginPath();
      polyline(level.pattern);
      ctx.stroke();
      ctx.restore();
      const end = level.pattern[level.pattern.length - 1] as Point;
      ctx.strokeStyle = PALETTE.pattern;
      ctx.lineWidth = c * 0.06;
      circle(end, c * 0.26);
      ctx.stroke();
    }

    // Holes in the card.
    ctx.fillStyle = PALETTE.hole;
    for (let y = 0; y < level.rows; y++) {
      for (let x = 0; x < level.cols; x++) {
        circle({ x, y }, Math.max(2.5, c * 0.06));
        ctx.fill();
      }
    }

    // Gentle guide for where the thread can go next.
    ctx.fillStyle = PALETTE.reachable;
    for (const p of reachable) {
      circle(p, c * 0.22);
      ctx.fill();
    }

    // The laid thread.
    if (state.thread.length > 1) {
      ctx.strokeStyle = PALETTE.thread;
      ctx.lineWidth = c * 0.1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      polyline(state.thread);
      ctx.stroke();
    }

    // Pins.
    for (const pin of state.pins) {
      ctx.fillStyle = PALETTE.pinHead;
      circle(pin, c * 0.17);
      ctx.fill();
      const s = toScreen(pin);
      ctx.fillStyle = PALETTE.pinShine;
      ctx.beginPath();
      ctx.arc(s.x - c * 0.05, s.y - c * 0.05, c * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }

    // The bobbin at the end of the thread.
    const head = state.thread[state.thread.length - 1] as Point;
    const hs = toScreen(head);
    const onPin = state.pins.some((p) => samePoint(p, head));
    ctx.save();
    ctx.translate(hs.x + (onPin ? c * 0.24 : 0), hs.y + (onPin ? c * 0.24 : 0));
    ctx.fillStyle = PALETTE.bobbin;
    ctx.beginPath();
    ctx.roundRect(-c * 0.09, -c * 0.2, c * 0.18, c * 0.4, c * 0.08);
    ctx.fill();
    ctx.fillStyle = PALETTE.thread;
    ctx.fillRect(-c * 0.09, -c * 0.06, c * 0.18, c * 0.12);
    ctx.restore();

    // A ping: two expanding rings.
    const elapsed = now - pingStart;
    if (state.ping && elapsed < PING_MS) {
      for (const offset of [0, 0.35]) {
        const t = (elapsed / PING_MS + offset) % 1;
        ctx.strokeStyle = PALETTE.signal;
        ctx.globalAlpha = 1 - t;
        ctx.lineWidth = c * 0.08;
        circle(state.ping.at, c * (0.2 + t * 0.55));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }
  }

  const onPointerDown = (event: PointerEvent) => {
    if (!model) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left - layout.ox) / layout.cell);
    const y = Math.round((event.clientY - rect.top - layout.oy) / layout.cell);
    if (x < 0 || y < 0 || x >= model.level.cols || y >= model.level.rows) return;
    const s = toScreen({ x, y });
    const distance = Math.hypot(event.clientX - rect.left - s.x, event.clientY - rect.top - s.y);
    if (distance <= layout.cell * 0.55) tapHandler({ x, y });
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  return {
    setModel(next) {
      const levelChanged = !model || model.level !== next.level;
      model = next;
      if (next.state.ping && next.state.ping.id !== lastPingId) {
        lastPingId = next.state.ping.id;
        pingStart = performance.now();
        cancelAnimationFrame(frame);
      }
      if (levelChanged) resize();
      else draw();
    },
    onTap(handler) {
      tapHandler = handler;
    },
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
    },
  };
}
