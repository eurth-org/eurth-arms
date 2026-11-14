/**
 * Lines of partition: the five ways an edge can run. One function draws any straight edge in
 * any of them, so a fess, a chief and a field parted per bend all get their wavy line from the
 * same place; another runs a line round a closed shape, for the inside of a bordure.
 *
 * Edges belong to polygons drawn clockwise on screen, so the shape's own inside is always to
 * the right of the direction of travel. Engrailed arcs bite into the shape, with their points
 * outwards; battlements stand out from it. Wavy and indented lines run the same way whichever
 * side they are drawn from, so the two edges of a wavy fess rise and fall together.
 */
import { add, dist, pt, type Pt } from './geometry';
import type { Line } from './model';

/** The length of one scallop, tooth, wave or battlement. */
const period: Readonly<Record<Exclude<Line, 'straight'>, number>> = {
  engrailed: 56,
  indented: 44,
  wavy: 112,
  embattled: 76,
};

/** How far a line strays from the straight, for keeping charges clear of it. */
export const lineMargin: Readonly<Record<Line, number>> = {
  straight: 0,
  engrailed: 12,
  indented: 13,
  wavy: 15,
  embattled: 26,
};

const WAVE = 14;

/** Path commands from `a` (where the pen is) to `b`, along the line. */
export function edgePath(a: Pt, b: Pt, line: Line): string {
  const len = dist(a, b);
  if (line === 'straight' || len < 1) return `L${pt(b)}`;
  const t: Pt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const inward: Pt = [-t[1], t[0]];

  if (line === 'engrailed') {
    const n = Math.max(1, Math.round(len / period.engrailed));
    const p = len / n;
    let d = '';
    for (let i = 0; i < n; i++) d += `Q${pt(add(add(a, t, (i + 0.5) * p), inward, p * 0.42))} ${pt(add(a, t, (i + 1) * p))}`;
    return d;
  }

  if (line === 'embattled') {
    const n = Math.max(1, Math.round(len / period.embattled));
    const p = len / n;
    const h = Math.min(lineMargin.embattled, p * 0.36);
    let d = '';
    for (let i = 0; i < n; i++) {
      const s = add(a, t, i * p);
      const [up, down] = [add(s, t, p / 4), add(s, t, (3 * p) / 4)];
      d += `L${pt(up)}L${pt(add(up, inward, -h))}L${pt(add(down, inward, -h))}L${pt(down)}L${pt(add(s, t, p))}`;
    }
    return d;
  }

  // Wavy and indented: worked out left to right (or top to bottom), then walked in whichever
  // direction the edge runs, so opposite edges match.
  const flip = t[0] < -1e-6 || (Math.abs(t[0]) <= 1e-6 && t[1] < 0);
  const [s, tc]: [Pt, Pt] = flip ? [b, [-t[0], -t[1]]] : [a, t];
  const nc: Pt = [-tc[1], tc[0]];
  const halves = 2 * Math.max(1, Math.round(len / period[line]));
  const hp = len / halves;
  const order = Array.from({ length: halves }, (_, k) => (flip ? halves - 1 - k : k));
  if (line === 'wavy') {
    return order
      .map((k) => {
        const crest = add(add(s, tc, (k + 0.5) * hp), nc, (k % 2 ? 1 : -1) * WAVE * 2);
        return `Q${pt(crest)} ${pt(add(s, tc, (flip ? k : k + 1) * hp))}`;
      })
      .join('');
  }
  const amp = Math.min(lineMargin.indented, hp * 0.6);
  return `${order.map((k) => `L${pt(add(add(s, tc, (k + 0.5) * hp), nc, (k % 2 ? 1 : -1) * amp))}`).join('')}L${pt(b)}`;
}

/** A closed polygon as path data, with some of its edges drawn along a line. */
export function polygonPath(polygon: readonly Pt[], line: Line, fancy: readonly number[]): string {
  let d = `M${pt(polygon[0]!)}`;
  for (let i = 0; i < polygon.length; i++) {
    const [a, b] = [polygon[i]!, polygon[(i + 1) % polygon.length]!];
    d += fancy.includes(i) ? edgePath(a, b, line) : i === polygon.length - 1 ? '' : `L${pt(b)}`;
  }
  return `${d}Z`;
}

/**
 * A line run all the way round a closed shape (clockwise, its inside to the right), as a
 * closed path. Scallops point inwards and battlements step inwards: this is the inner edge of
 * a bordure, whose own body lies outside the line.
 */
export function loopPath(polygon: readonly Pt[], line: Line): string {
  if (line === 'straight' || polygon.length < 3) return `M${polygon.map(pt).join('L')}Z`;

  const lengths = polygon.map((p, i) => dist(p, polygon[(i + 1) % polygon.length]!));
  const total = lengths.reduce((sum, v) => sum + v, 0);
  /** The point a distance along the loop, and the way inwards from it. */
  const at = (distance: number): { p: Pt; inward: Pt } => {
    let s = ((distance % total) + total) % total;
    let i = 0;
    while (s > lengths[i]! && i < polygon.length - 1) s -= lengths[i++]!;
    const [a, b] = [polygon[i]!, polygon[(i + 1) % polygon.length]!];
    const len = lengths[i] || 1;
    const t: Pt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    return { p: add(a, t, s), inward: [-t[1], t[0]] };
  };
  const off = (distance: number, by: number): Pt => {
    const { p, inward } = at(distance);
    return add(p, inward, by);
  };

  const n = Math.max(6, Math.round(total / period[line]));
  const p = total / n;
  if (line === 'engrailed') {
    let d = `M${pt(at(0).p)}`;
    for (let i = 0; i < n; i++) d += `Q${pt(off((i + 0.5) * p, -p * 0.42))} ${pt(at((i + 1) * p).p)}`;
    return `${d}Z`;
  }
  if (line === 'embattled') {
    const h = Math.min(lineMargin.embattled, p * 0.36);
    const points: Pt[] = [];
    for (let i = 0; i < n; i++) points.push(at(i * p).p, at((i + 0.25) * p).p, off((i + 0.25) * p, h), off((i + 0.75) * p, h), at((i + 0.75) * p).p);
    return `M${points.map(pt).join('L')}Z`;
  }
  const halves = 2 * n;
  const hp = total / halves;
  if (line === 'wavy') {
    let d = `M${pt(at(0).p)}`;
    for (let k = 0; k < halves; k++) d += `Q${pt(off((k + 0.5) * hp, (k % 2 ? 1 : -1) * WAVE * 2))} ${pt(at((k + 1) * hp).p)}`;
    return `${d}Z`;
  }
  const amp = Math.min(lineMargin.indented, hp * 0.6);
  return `M${Array.from({ length: halves }, (_, k) => pt(off((k + 0.5) * hp, (k % 2 ? 1 : -1) * amp))).join('L')}Z`;
}
