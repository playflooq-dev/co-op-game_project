import type { Point } from './types.ts';

export function samePoint(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function containsPoint(points: readonly Point[], p: Point): boolean {
  return points.some((q) => samePoint(q, p));
}

export function inGrid(p: Point, cols: number, rows: number): boolean {
  return Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.y >= 0 && p.x < cols && p.y < rows;
}

/** Unit step from `from` towards `to` if they share a row or column, otherwise null. */
export function straightDirection(from: Point, to: Point): Point | null {
  if (samePoint(from, to)) return null;
  if (from.x === to.x) return { x: 0, y: Math.sign(to.y - from.y) };
  if (from.y === to.y) return { x: Math.sign(to.x - from.x), y: 0 };
  return null;
}

/** Drops repeated points and points in the middle of a straight run, leaving only ends and corners. */
export function simplifyPath(points: readonly Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last && samePoint(last, p)) continue;
    const beforeLast = out[out.length - 2];
    if (last && beforeLast) {
      const d1 = straightDirection(beforeLast, last);
      const d2 = straightDirection(last, p);
      if (d1 && d2 && samePoint(d1, d2)) out.pop();
    }
    out.push(p);
  }
  return out;
}

export function pathsEqual(a: readonly Point[], b: readonly Point[]): boolean {
  const sa = simplifyPath(a);
  const sb = simplifyPath(b);
  return sa.length === sb.length && sa.every((p, i) => samePoint(p, sb[i] as Point));
}

/** Holes where a path changes direction. */
export function cornersOf(points: readonly Point[]): Point[] {
  return simplifyPath(points).slice(1, -1);
}

/** Every hole a straight path passes through, ends included. */
export function holesAlong(points: readonly Point[]): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i] as Point;
    const next = points[i + 1];
    if (!next) {
      if (!containsPoint(out, p)) out.push(p);
      break;
    }
    const d = straightDirection(p, next);
    if (!d) continue;
    for (let q = p; !samePoint(q, next); q = { x: q.x + d.x, y: q.y + d.y }) {
      if (!containsPoint(out, q)) out.push(q);
    }
  }
  return out;
}

export function isPoint(value: unknown): value is Point {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return Number.isInteger(v.x) && Number.isInteger(v.y);
}
