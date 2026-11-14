/**
 * Where everything goes. From a design this works out, in the shield's own space:
 *
 * - the frame: the part of the shield the field, its division and the ordinary are built in
 *   (the whole shield, or what a chief leaves below it);
 * - the ordinary, the chief and the pieces of a parted field, as polygons;
 * - the bordure's inner edge;
 * - a place and a size for every charge.
 *
 * Charges are not put at fixed spots. Each starts from the spot tradition gives it (two and
 * one, in pale, either side of a bend) and then settles into the room it actually has: inside
 * the shield, clear of the ordinary, the chief and the bordure. That is what lets three
 * mullets fit a lozenge as well as a heater.
 */
import { add, dist, inset, roomInside, spanAt, type Pt } from './geometry';
import { lineMargin } from './lines';
import type { Arms, ChargeGroup, Division, Field, OrdinaryType } from './model';
import { shield, type Shield } from './shapes';

/** How wide a bordure is. */
export const BORDURE = 46;

/** Far enough outside the shield that an edge drawn there is never seen. */
const FAR = 900;
const [X0, X1, Y0, Y1] = [-80, 680, -80, 800];
const S = Math.SQRT1_2;
/** How steep a chevron's arms are. */
const SLOPE = 0.8;

export interface Frame {
  cx: number;
  cy: number;
  top: number;
  bottom: number;
  /** How much thinner ordinaries are drawn when a chief takes some of the shield. */
  k: number;
}

/** A polygon, clockwise on screen, and which of its edges take the line of partition. */
export interface Piece {
  polygon: Pt[];
  fancy: number[];
}

/** Where the chief ends: its lower edge. */
export function chiefLine(s: Shield): number {
  return s.top + 0.28 * (s.bottom - s.top);
}

export function frameOf(arms: Arms): Frame {
  const s = shield(arms.shape);
  if (!arms.chief) return { cx: s.centre[0], cy: s.centre[1], top: s.top, bottom: s.bottom, k: 1 };
  const top = chiefLine(s);
  return { cx: s.centre[0], cy: s.centre[1] + (top - s.top) * 0.55, top, bottom: s.bottom, k: 0.84 };
}

interface Built {
  polygon: Pt[];
  /** The long edges, which take a line of partition. */
  long: number[];
  /** Of those, the upper ones: all an embattled fess, bend or chevron is embattled on. */
  upper: number[];
}

/** Sizes of the ordinaries, before a chief thins them. */
const HALF = { pale: 85, fess: 85, bend: 68, cross: 54, saltire: 48, chevron: 56, pile: 165 } as const;

function buildOrdinary(type: OrdinaryType, F: Frame, s: Shield): Built {
  const { cx, cy, k } = F;
  const c: Pt = [cx, cy];
  switch (type) {
    case 'pale': {
      const h = HALF.pale * k;
      return { polygon: [[cx - h, Y0], [cx + h, Y0], [cx + h, Y1], [cx - h, Y1]], long: [1, 3], upper: [] };
    }
    case 'fess': {
      const h = HALF.fess * k;
      return { polygon: [[X0, cy - h], [X1, cy - h], [X1, cy + h], [X0, cy + h]], long: [0, 2], upper: [0] };
    }
    case 'bend': {
      const h = HALF.bend * k;
      const [u, n]: [Pt, Pt] = [[S, S], [S, -S]];
      const [start, end] = [add(c, u, -FAR), add(c, u, FAR)];
      return { polygon: [add(start, n, h), add(end, n, h), add(end, n, -h), add(start, n, -h)], long: [0, 2], upper: [0] };
    }
    case 'chevron': {
      const { outer, inner } = chevronApex(F);
      const drop = (x: number): number => SLOPE * Math.abs(x - cx);
      return {
        polygon: [[X0, outer + drop(X0)], [cx, outer], [X1, outer + drop(X1)], [X1, inner + drop(X1)], [cx, inner], [X0, inner + drop(X0)]],
        long: [0, 1, 3, 4],
        upper: [0, 1],
      };
    }
    case 'cross': {
      const h = HALF.cross * k;
      return {
        polygon: [
          [cx - h, Y0], [cx + h, Y0], [cx + h, cy - h], [X1, cy - h], [X1, cy + h], [cx + h, cy + h],
          [cx + h, Y1], [cx - h, Y1], [cx - h, cy + h], [X0, cy + h], [X0, cy - h], [cx - h, cy - h],
        ],
        long: [1, 2, 4, 5, 7, 8, 10, 11],
        upper: [],
      };
    }
    case 'saltire': {
      const h = HALF.saltire * k * Math.SQRT2;
      const notch: Pt[] = [[cx, cy - h], [cx + h, cy], [cx, cy + h], [cx - h, cy]];
      const arm: Pt[] = [[S, -S], [S, S], [-S, S], [-S, -S]];
      const polygon: Pt[] = [];
      for (let i = 0; i < 4; i++) polygon.push(notch[i]!, add(notch[i]!, arm[i]!, FAR), add(notch[(i + 1) % 4]!, arm[i]!, FAR));
      return { polygon, long: [0, 2, 3, 5, 6, 8, 9, 11], upper: [] };
    }
    case 'pile': {
      const { tip, half } = pileOf(F, s);
      const run = (half * 60) / (tip - F.top);
      return { polygon: [[cx - half - run, F.top - 60], [cx + half + run, F.top - 60], [cx, tip]], long: [1, 2], upper: [] };
    }
  }
}

function chevronApex(F: Frame): { outer: number; inner: number } {
  const outer = F.cy - 85 * F.k;
  return { outer, inner: outer + 2 * HALF.chevron * F.k };
}

function pileOf(F: Frame, s: Shield): { tip: number; half: number } {
  return { tip: s.bottom - 0.17 * (s.bottom - F.top), half: HALF.pile };
}

export function ordinaryPiece(arms: Arms): Piece | undefined {
  if (!arms.ordinary) return undefined;
  const { type, line } = arms.ordinary;
  const built = buildOrdinary(type, frameOf(arms), shield(arms.shape));
  const upperOnly = line === 'embattled' && built.upper.length > 0;
  return { polygon: built.polygon, fancy: upperOnly ? built.upper : built.long };
}

export function chiefPiece(arms: Arms): Piece | undefined {
  if (!arms.chief) return undefined;
  const y = chiefLine(shield(arms.shape));
  return { polygon: [[X0, Y0], [X1, Y0], [X1, y], [X0, y]], fancy: [2] };
}

/** The bordure's inner edge: the shield's outline, moved in. */
export function bordureInner(arms: Arms): Pt[] {
  return inset(shield(arms.shape).outline, BORDURE);
}

/** A piece of a parted field, and which of the field's tinctures paints it. */
export interface FieldPiece extends Piece {
  tincture: number;
}

/** A parted or patterned field: the tincture laid down first, and the pieces painted over it. */
export function fieldPieces(field: Exclude<Field, { kind: 'plain' }>, F: Frame, s: Shield): { base: number; pieces: FieldPiece[] } {
  const { cx, cy } = F;
  const c: Pt = [cx, cy];
  const piece = (tincture: number, polygon: Pt[], fancy: number[] = []): FieldPiece => ({ tincture, polygon, fancy });
  const rect = (x0: number, y0: number, x1: number, y1: number): Pt[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  if (field.kind === 'patterned') {
    const pieces: FieldPiece[] = [];
    const n = field.count;
    if (field.pattern === 'barry') {
      const h = (F.bottom - F.top) / n;
      for (let i = 0; i < n; i += 2) pieces.push(piece(0, rect(X0, F.top + i * h, X1, F.top + (i + 1) * h)));
    } else if (field.pattern === 'paly') {
      const w = (s.right - s.left) / n;
      for (let i = 0; i < n; i += 2) pieces.push(piece(0, rect(s.left + i * w, Y0, s.left + (i + 1) * w, Y1)));
    } else if (field.pattern === 'bendy') {
      // Stripes that run with the bend, counted down from the sinister chief corner.
      const [u, normal]: [Pt, Pt] = [[S, S], [S, -S]];
      const from = (s.right - cx) * S + (cy - F.top) * S;
      const to = (s.left - cx) * S + (cy - s.bottom) * S;
      const w = (from - to) / n;
      for (let i = 0; i < n; i += 2) {
        const [a, b] = [add(c, normal, from - i * w), add(c, normal, from - (i + 1) * w)];
        pieces.push(piece(0, [add(a, u, -FAR), add(a, u, FAR), add(b, u, FAR), add(b, u, -FAR)]));
      }
    } else {
      const size = (s.right - s.left) / n;
      for (let row = 0; F.top + row * size < F.bottom; row++) {
        for (let col = row % 2; col < n; col += 2) {
          pieces.push(piece(0, rect(s.left + col * size, F.top + row * size, s.left + (col + 1) * size, F.top + (row + 1) * size)));
        }
      }
    }
    return { base: 1, pieces };
  }

  const diag = (dx: number, dy: number): Pt => add(c, [dx * S, dy * S], FAR);
  const division: Division = field.division;
  switch (division) {
    case 'perPale':
      return { base: 1, pieces: [piece(0, [[X0, Y0], [cx, Y0], [cx, Y1], [X0, Y1]], [1])] };
    case 'perFess':
      return { base: 0, pieces: [piece(1, [[X0, cy], [X1, cy], [X1, Y1], [X0, Y1]], [0])] };
    case 'perBend':
      return { base: 1, pieces: [piece(0, [diag(-1, -1), add(diag(-1, -1), [S, -S], FAR), add(diag(1, 1), [S, -S], FAR), diag(1, 1)], [3])] };
    case 'perBendSinister':
      return { base: 1, pieces: [piece(0, [diag(1, -1), diag(-1, 1), add(diag(-1, 1), [-S, -S], FAR), add(diag(1, -1), [-S, -S], FAR)], [0])] };
    case 'perChevron': {
      const apex = cy - 60;
      const drop = (x: number): number => SLOPE * Math.abs(x - cx);
      return { base: 0, pieces: [piece(1, [[X0, apex + drop(X0)], [cx, apex], [X1, apex + drop(X1)], [X1, Y1], [X0, Y1]], [0, 1])] };
    }
    case 'perSaltire':
      return { base: 1, pieces: [piece(0, [c, diag(-1, -1), diag(1, -1)]), piece(0, [c, diag(1, 1), diag(-1, 1)])] };
    case 'quarterly':
      return { base: 1, pieces: [piece(0, rect(X0, Y0, cx, cy)), piece(0, rect(cx, cy, X1, Y1))] };
    case 'tiercedPale': {
      const w = (s.right - s.left) / 3;
      return { base: 1, pieces: [piece(0, rect(X0, Y0, s.left + w, Y1)), piece(2, rect(s.right - w, Y0, X1, Y1))] };
    }
    case 'tiercedFess': {
      const h = (F.bottom - F.top) / 3;
      return { base: 1, pieces: [piece(0, rect(X0, Y0, X1, F.top + h)), piece(2, rect(X0, F.bottom - h, X1, Y1))] };
    }
    case 'tiercedPall':
      return { base: 2, pieces: [piece(0, [c, diag(-1, -1), diag(1, -1)]), piece(1, [c, [cx, Y1], [X0, Y1], [X0, Y0], diag(-1, -1)])] };
  }
}

/** Where one charge goes: its centre, the radius of the circle it must fit, and its turn. */
export interface Slot {
  x: number;
  y: number;
  r: number;
  rot: number;
}

export interface Slots {
  field: Slot[];
  ordinary: Slot[];
  chief: Slot[];
}

/** Room to keep between a charge and whatever it must stay clear of. */
const GAP = 9;

interface Region {
  /** Polygons the charge must be inside, each with a margin. */
  inside: [readonly Pt[], number][];
  /** Polygons it must stay out of. */
  outside: [readonly Pt[], number][];
}

function roomAt(p: Pt, region: Region): number {
  let room = Infinity;
  for (const [polygon, margin] of region.inside) room = Math.min(room, roomInside(p, polygon) - margin);
  for (const [polygon, margin] of region.outside) room = Math.min(room, -roomInside(p, polygon) - margin);
  return room;
}

const directions: Pt[] = [[0, -1], [0, 1], [-1, 0], [1, 0], [-S, -S], [S, -S], [-S, S], [S, S]];

/** The radius a charge is given when it has all the room it could want, by how many share the place. */
const WANT = [0, 200, 112, 96, 84, 74, 66];

/**
 * From their traditional spots, charges move a little way towards more room, until each has
 * what it wants or can find no better. Room is what the region leaves and what the
 * neighbours leave, so two charges looking for space never crowd into the same gap. Shapes
 * are symmetrical: a charge on the right that has a twin on the left simply mirrors it, and a
 * charge on the middle line stays on it.
 */
function place(ideals: Pt[], want: number, region: Region, cx: number, mirror: boolean, reach: number, rot = 0): Slot[] {
  const across = (p: Pt): Pt => [2 * cx - p[0], p[1]];
  const twin = ideals.map((p, i) => (mirror && p[0] > cx + 0.5 ? ideals.findIndex((q, j) => j !== i && dist(q, across(p)) < 0.5) : -1));
  const spots = ideals.slice();

  const roomFor = (i: number, p: Pt): number => {
    let room = roomAt(p, region);
    for (let j = 0; j < spots.length; j++) {
      if (j === i) continue;
      const other = twin[j] === i ? across(p) : spots[j]!;
      room = Math.min(room, dist(p, other) / 2 - GAP / 2);
    }
    return room;
  };

  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < spots.length; i++) {
      if (twin[i]! >= 0) continue;
      const onAxis = mirror && Math.abs(ideals[i]![0] - cx) < 0.5;
      let p = spots[i]!;
      let room = roomFor(i, p);
      for (const step of [24, 12, 6, 3, 1.5]) {
        for (let tries = 0; tries < 8 && room < want; tries++) {
          let best: { p: Pt; room: number } | undefined;
          for (const direction of onAxis ? directions.slice(0, 2) : directions) {
            const q = add(p, direction, step);
            if (dist(q, ideals[i]!) > reach) continue;
            const r = roomFor(i, q);
            if (r > (best?.room ?? room) + 1e-6) best = { p: q, room: r };
          }
          if (!best) break;
          ({ p, room } = best);
        }
      }
      spots[i] = p;
      for (let j = 0; j < spots.length; j++) if (twin[j] === i) spots[j] = across(p);
    }
  }

  const r = Math.max(6, Math.min(want, ...spots.map((p, i) => roomFor(i, p))));
  return spots.map((p) => ({ x: p[0], y: p[1], r, rot }));
}

export function slotsOf(arms: Arms): Slots {
  const s = shield(arms.shape);
  const F = frameOf(arms);
  const { cx, cy, k } = F;
  const c: Pt = [cx, cy];
  const edge = arms.bordure ? BORDURE + lineMargin[arms.bordure.line] : 0;
  const ordinary = arms.ordinary ? buildOrdinary(arms.ordinary.type, F, s) : undefined;
  const type = arms.ordinary?.type;
  const ordinaryMargin = arms.ordinary ? lineMargin[arms.ordinary.line] : 0;
  const chief = chiefPiece(arms);
  const chiefMargin = arms.chief ? lineMargin[arms.chief.line] : 0;

  // The box the field's charges are laid out in, and the shield's half-width at a height.
  const top = F.top + (arms.chief ? chiefMargin : edge);
  const bottom = s.bottom - edge;
  const squeeze = arms.shape === 'lozenge' ? 0.66 : arms.shape === 'roundel' ? 0.8 : 1;
  const yAt = (fraction: number): number => top + (bottom - top) * (0.5 + (fraction - 0.5) * squeeze);
  const hw = (y: number): number => {
    const span = spanAt(s.outline, y);
    return span ? Math.max(0, (span[1] - span[0]) / 2 - edge) : 0;
  };
  const at = (fx: number, fy: number): Pt => [cx + fx * hw(yAt(fy)), yAt(fy)];
  const pair = (fx: number, fy: number): Pt[] => [at(-fx, fy), at(fx, fy)];
  /** Halfway between something `inner` from the middle and the shield's edge, on both sides. */
  const flanks = (inner: number, y: number): Pt[] => [[cx - (inner + hw(y)) / 2, y], [cx + (inner + hw(y)) / 2, y]];

  const fieldRegion: Region = {
    inside: [[s.outline, edge + GAP]],
    outside: [...(ordinary ? [[ordinary.polygon, ordinaryMargin + GAP] as [Pt[], number]] : []), ...(chief ? [[chief.polygon, chiefMargin + GAP] as [Pt[], number]] : [])],
  };
  const mirror = type !== 'bend';

  const slots: Slots = { field: [], ordinary: [], chief: [] };

  if (arms.charges) {
    const n = arms.charges.count;
    let ideals: Pt[] = [];
    let want = WANT[n] ?? 60;
    if (!type) {
      ideals = openField(arms.charges, c, at, pair, hw, yAt);
    } else {
      want = Math.min(want, 88);
      const [u, normal]: [Pt, Pt] = [[S, S], [S, -S]];
      switch (type) {
        case 'pale': {
          const rows = n === 2 ? [cy] : n === 4 ? [yAt(0.2), yAt(0.58)] : [yAt(0.14), yAt(0.4), yAt(0.66)];
          ideals = rows.flatMap((y) => flanks(HALF.pale * k, y));
          break;
        }
        case 'fess': {
          const h = HALF.fess * k;
          const above = (top + cy - h) / 2;
          const below = cy + h + 0.42 * (bottom - cy - h);
          const row = (fractions: number[], y: number): Pt[] => fractions.map((fx) => [cx + fx * hw(y), y] as Pt);
          ideals =
            n === 2
              ? [[cx, above], [cx, below]]
              : n === 3
                ? [...row([-0.5, 0.5], above), [cx, below]]
                : n === 4
                  ? [...row([-0.5, 0.5], above), ...row([-0.45, 0.45], below)]
                  : [...row([-0.66, 0, 0.66], above), ...row([-0.6, 0, 0.6], below)];
          break;
        }
        case 'bend': {
          const out = HALF.bend * k;
          const along = n === 2 ? [0] : n === 4 ? [-88, 88] : [-150, 0, 150];
          const off = out + (n === 2 ? 110 : n === 4 ? 96 : 84);
          ideals = [1, -1].flatMap((side) => along.map((a) => add(add(c, normal, side * off), u, a)));
          break;
        }
        case 'chevron': {
          const { outer, inner } = chevronApex(F);
          const y = (top + outer) / 2 + 4;
          ideals = [[cx - 0.54 * hw(y), y], [cx + 0.54 * hw(y), y], [cx, inner + 0.44 * (bottom - inner)]];
          break;
        }
        case 'cross': {
          const h = HALF.cross * k;
          ideals = [...flanks(h, (top + cy - h) / 2), ...flanks(h, cy + h + 0.4 * (bottom - cy - h))];
          break;
        }
        case 'saltire': {
          const d = HALF.saltire * k * Math.SQRT2 + 108;
          ideals = [[cx, cy - d], [cx - d, cy], [cx + d, cy], [cx, cy + d]];
          break;
        }
        case 'pile': {
          const { tip, half } = pileOf(F, s);
          const y = F.top + 0.62 * (tip - F.top);
          ideals = flanks((half * (tip - y)) / (tip - F.top), y);
          break;
        }
      }
    }
    slots.field = place(ideals, want, fieldRegion, cx, mirror, n === 1 ? 70 : 60);
  }

  if (arms.onOrdinary && ordinary && type) {
    const n = arms.onOrdinary.count;
    const region: Region = {
      inside: [[s.outline, edge + GAP], [ordinary.polygon, ordinaryMargin + GAP * 0.7]],
      outside: chief ? [[chief.polygon, chiefMargin + GAP]] : [],
    };
    let ideals: Pt[] = [];
    let rot = 0;
    switch (type) {
      case 'pale':
        ideals = (n === 1 ? [0.42] : n === 2 ? [0.24, 0.62] : [0.15, 0.42, 0.69]).map((fy) => [cx, yAt(fy)] as Pt);
        if (n === 1) ideals = [c];
        break;
      case 'fess':
        ideals = Array.from({ length: n }, (_, i) => [cx + hw(cy) * 0.9 * ((2 * i + 1) / n - 1), cy] as Pt);
        break;
      case 'bend': {
        const gap = Math.min(150, 520 / n);
        ideals = Array.from({ length: n }, (_, i) => add(c, [S, S], (i - (n - 1) / 2) * gap - 24));
        rot = 45;
        break;
      }
      case 'chevron': {
        const { outer, inner } = chevronApex(F);
        const mid = (outer + inner) / 2;
        const offsets = n === 1 ? [0] : n === 3 ? [-175, 0, 175] : [-225, -115, 0, 115, 225];
        ideals = offsets.map((dx) => [cx + dx, mid + SLOPE * Math.abs(dx) + (dx ? 0 : 10)] as Pt);
        break;
      }
      case 'cross': {
        const h = HALF.cross * k;
        ideals = [c];
        if (n === 5) ideals.push([cx, (top + cy - h) / 2], ...flanks(h, cy), [cx, cy + h + 0.42 * (bottom - cy - h)]);
        break;
      }
      case 'saltire':
        ideals = [c];
        if (n === 5) for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as Pt[]) ideals.push(add(c, [dx * S, dy * S], 160));
        break;
      case 'pile': {
        const { tip } = pileOf(F, s);
        const down = (fraction: number): number => F.top + fraction * (tip - F.top);
        ideals = n === 1 ? [[cx, down(0.3)]] : [[cx - 75, down(0.16)], [cx + 75, down(0.16)], [cx, down(0.47)]];
        break;
      }
    }
    slots.ordinary = place(ideals, 90, region, cx, mirror, 40, rot);
  }

  if (arms.onChief && chief) {
    const n = arms.onChief.count;
    const y = (s.top + edge + chiefLine(s) - chiefMargin) / 2 + (arms.shape === 'polish' ? 16 : arms.shape === 'lozenge' || arms.shape === 'roundel' ? 22 : 0);
    const region: Region = { inside: [[s.outline, edge + GAP], [chief.polygon, chiefMargin + GAP * 0.7]], outside: [] };
    const ideals = Array.from({ length: n }, (_, i) => [cx + hw(y) * 0.9 * ((2 * i + 1) / n - 1), y] as Pt);
    slots.chief = place(ideals, 84, region, cx, true, 36);
  }

  return slots;
}

/** The traditional spots for charges on a field with no ordinary to work around. */
function openField(
  group: ChargeGroup,
  c: Pt,
  at: (fx: number, fy: number) => Pt,
  pair: (fx: number, fy: number) => Pt[],
  hw: (y: number) => number,
  yAt: (fraction: number) => number,
): Pt[] {
  const [cx, cy] = c;
  const row = (fractions: number[]): Pt[] => fractions.map((fx) => [cx + fx * hw(cy), cy] as Pt);
  const slant = (steps: number[]): Pt[] => steps.map((step) => add(c, [S, S], step));
  /** Above and below the middle, the same distance each way. */
  const rise = 0.29 * (yAt(1) - yAt(0));
  switch (group.count === 1 ? 'single' : group.arrangement) {
    case 'single':
      return [c];
    case 'inPale':
      return (group.count === 2 ? [0.25, 0.66] : [0.14, 0.43, 0.72]).map((fy) => at(0, fy));
    case 'inFess':
      return row(group.count === 2 ? [-0.5, 0.5] : [-0.64, 0, 0.64]);
    case 'inBend':
      return slant(group.count === 2 ? [-140, 140] : [-200, 0, 200]);
    case 'twoAndOne':
      return [...pair(0.5, 0.22), at(0, 0.64)];
    case 'oneAndTwo':
      return [at(0, 0.2), ...pair(0.46, 0.58)];
    case 'twoAndTwo':
      return [...pair(0.5, 0.2), ...pair(0.45, 0.58)];
    case 'inCross': {
      const arms: Pt[] = [[cx, cy - rise], ...row([-0.62, 0.62]), [cx, cy + rise]];
      return group.count === 5 ? [arms[0]!, arms[1]!, c, arms[2]!, arms[3]!] : arms;
    }
    case 'inSaltire':
      return [...pair(0.56, 0.16), at(0, 0.39), ...pair(0.44, 0.62)];
    case 'threeTwoOne':
      return [at(-0.66, 0.14), at(0, 0.14), at(0.66, 0.14), ...pair(0.36, 0.41), at(0, 0.66)];
    default:
      return [c];
  }
}
