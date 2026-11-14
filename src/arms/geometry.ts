/**
 * The little geometry the drawing needs: points, polygons and how far a point is from an edge.
 * Everything is drawn in one space, 600 wide and 720 high, with y running down the shield.
 */
export type Pt = readonly [number, number];

/** A number as SVG wants it: at most two decimals, no trailing noise. */
export const f = (v: number): string => String(Math.round(v * 100) / 100);

export const pt = ([x, y]: Pt): string => `${f(x)} ${f(y)}`;

export const add = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];
export const dist = (a: Pt, b: Pt): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

function distToSegment(p: Pt, a: Pt, b: Pt): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len2 = dx * dx + dy * dy;
  const t = len2 ? Math.min(1, Math.max(0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/** How far a point is from a polygon's edge. */
export function distToPolygon(p: Pt, polygon: readonly Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < polygon.length; i++) best = Math.min(best, distToSegment(p, polygon[i]!, polygon[(i + 1) % polygon.length]!));
  return best;
}

export function insidePolygon(p: Pt, polygon: readonly Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [a, b] = [polygon[i]!, polygon[j]!];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** Distance to the edge, counted as negative on the wrong side: room to spare inside a polygon. */
export const roomInside = (p: Pt, polygon: readonly Pt[]): number => (insidePolygon(p, polygon) ? 1 : -1) * distToPolygon(p, polygon);

/** The left and right ends of a polygon at a height, or undefined where it doesn't reach. */
export function spanAt(polygon: readonly Pt[], y: number): [number, number] | undefined {
  let [min, max] = [Infinity, -Infinity];
  for (let i = 0; i < polygon.length; i++) {
    const [a, b] = [polygon[i]!, polygon[(i + 1) % polygon.length]!];
    if (a[1] === b[1] || y < Math.min(a[1], b[1]) || y > Math.max(a[1], b[1])) continue;
    const x = a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
    min = Math.min(min, x);
    max = Math.max(max, x);
  }
  return min <= max ? [min, max] : undefined;
}

/**
 * Builds an outline twice over: as SVG path data with its true curves, and flattened into a
 * polygon for measuring.
 */
export class Outline {
  d = '';
  readonly points: Pt[] = [];
  private at: Pt = [0, 0];

  move(p: Pt): this {
    this.d += `M${pt(p)}`;
    this.points.push(p);
    this.at = p;
    return this;
  }

  line(p: Pt): this {
    this.d += `L${pt(p)}`;
    this.points.push(p);
    this.at = p;
    return this;
  }

  quad(c: Pt, p: Pt, steps = 12): this {
    this.d += `Q${pt(c)} ${pt(p)}`;
    const a = this.at;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      this.points.push([u * u * a[0] + 2 * u * t * c[0] + t * t * p[0], u * u * a[1] + 2 * u * t * c[1] + t * t * p[1]]);
    }
    this.at = p;
    return this;
  }

  cubic(c1: Pt, c2: Pt, p: Pt, steps = 20): this {
    this.d += `C${pt(c1)} ${pt(c2)} ${pt(p)}`;
    const a = this.at;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const [k0, k1, k2, k3] = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      this.points.push([k0 * a[0] + k1 * c1[0] + k2 * c2[0] + k3 * p[0], k0 * a[1] + k1 * c1[1] + k2 * c2[1] + k3 * p[1]]);
    }
    this.at = p;
    return this;
  }

  close(): this {
    this.d += 'Z';
    // The last point repeats the first; a polygon doesn't need it twice.
    const [first, last] = [this.points[0], this.points[this.points.length - 1]];
    if (first && last && dist(first, last) < 0.01) this.points.pop();
    return this;
  }
}

/**
 * A polygon moved inwards by a distance, for the bordure's inner edge. The polygon runs
 * clockwise on screen, so "in" is to the right of each edge. Points that land too near the
 * original edge (where a narrow tip folds over itself) are dropped.
 */
export function inset(polygon: readonly Pt[], by: number): Pt[] {
  const n = polygon.length;
  const moved: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const [prev, here, next] = [polygon[(i + n - 1) % n]!, polygon[i]!, polygon[(i + 1) % n]!];
    const normal = (a: Pt, b: Pt): Pt => {
      const len = dist(a, b) || 1;
      return [-(b[1] - a[1]) / len, (b[0] - a[0]) / len];
    };
    const [n1, n2] = [normal(prev, here), normal(here, next)];
    const sum: Pt = [n1[0] + n2[0], n1[1] + n2[1]];
    const len = Math.hypot(sum[0], sum[1]) || 1;
    const unit: Pt = [sum[0] / len, sum[1] / len];
    // At a corner the point must go further to stay the same distance from both edges.
    const mitre = Math.min(2.5, 1 / Math.max(0.2, unit[0] * n1[0] + unit[1] * n1[1]));
    moved.push(add(here, unit, by * mitre));
  }
  return moved.filter((p) => insidePolygon(p, polygon) && distToPolygon(p, polygon) > by * 0.97);
}
