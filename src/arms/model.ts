/**
 * Arms, as data: a shield shape, a field, at most one principal ordinary with a chief and a
 * bordure beside it, and up to three groups of charges (on the field, on the ordinary, on the
 * chief). The model is deliberately the size of the blazon subset this tool can write, read
 * and draw: anything it can hold, blazon.ts can say and parse.ts can read back.
 *
 * `cleanArms` turns anything at all into valid arms. Links, files and typed blazons are
 * someone else's input, so everything goes through it, and two designs are the same arms when
 * their cleaned forms are equal.
 */
import { isCharge } from './catalogue';
import { cleanTincture, type Tincture, type TinctureId } from './tinctures';

export const shapes = ['heater', 'french', 'spanish', 'polish', 'lozenge', 'roundel'] as const;
export type Shape = (typeof shapes)[number];

export const lines = ['straight', 'engrailed', 'indented', 'wavy', 'embattled'] as const;
export type Line = (typeof lines)[number];

export const divisions = [
  'perPale',
  'perFess',
  'perBend',
  'perBendSinister',
  'perChevron',
  'perSaltire',
  'quarterly',
  'tiercedPale',
  'tiercedFess',
  'tiercedPall',
] as const;
export type Division = (typeof divisions)[number];

/** Divisions whose single dividing line can be engrailed, wavy and so on. */
export const linedDivisions: readonly Division[] = ['perPale', 'perFess', 'perBend', 'perBendSinister', 'perChevron'];
/** Divisions of three tinctures; the rest have two. */
export const tierced: readonly Division[] = ['tiercedPale', 'tiercedFess', 'tiercedPall'];

export const patterns = ['barry', 'paly', 'bendy', 'chequy'] as const;
export type Pattern = (typeof patterns)[number];

/** How many pieces a pattern may have (always even), and how many it has unless told. */
export const patternCounts: Readonly<Record<Pattern, { min: number; max: number; usual: number }>> = {
  barry: { min: 4, max: 10, usual: 6 },
  paly: { min: 4, max: 8, usual: 6 },
  bendy: { min: 4, max: 8, usual: 6 },
  chequy: { min: 6, max: 6, usual: 6 },
};

export type Field =
  | { kind: 'plain'; tincture: TinctureId }
  | { kind: 'divided'; division: Division; tinctures: TinctureId[]; line: Line }
  | { kind: 'patterned'; pattern: Pattern; count: number; tinctures: [TinctureId, TinctureId] };

/** The principal ordinaries. The chief and the bordure sit beside one of these, or alone. */
export const ordinaries = ['pale', 'fess', 'bend', 'chevron', 'cross', 'saltire', 'pile'] as const;
export type OrdinaryType = (typeof ordinaries)[number];

/** A chief or a bordure: a tincture and the line of its edge. */
export interface Edge {
  tincture: TinctureId;
  line: Line;
}

export interface Ordinary extends Edge {
  type: OrdinaryType;
}

export const arrangements = ['inPale', 'inFess', 'inBend', 'twoAndOne', 'oneAndTwo', 'twoAndTwo', 'inCross', 'inSaltire', 'threeTwoOne'] as const;
export type Arrangement = (typeof arrangements)[number];

/** How a lion stands, sits or lies. "Guardant" turns its face to the viewer. The first is the usual one. */
export const lionAttitudes = [
  'rampant',
  'rampantGuardant',
  'passant',
  'passantGuardant',
  'statant',
  'statantGuardant',
  'salient',
  'sejant',
  'sejantErect',
  'couchant',
  'dormant',
  'courant',
] as const;
/** How an eagle holds its wings. */
export const eagleAttitudes = ['displayed', 'rising'] as const;
export const attitudes = [...lionAttitudes, ...eagleAttitudes] as const;
export type Attitude = (typeof attitudes)[number];

/** The attitudes a charge can take: none, for all but the beasts. */
export function attitudesFor(charge: string): readonly Attitude[] {
  return charge === 'lion' ? lionAttitudes : charge === 'eagle' ? eagleAttitudes : [];
}

export const mulletPoints = [5, 6, 8] as const;
export type MulletPoints = (typeof mulletPoints)[number];

export interface ChargeGroup {
  /** Which charge (see catalogue.ts). */
  charge: string;
  count: number;
  tincture: Tincture;
  /** Only for two or more charges on a field with no principal ordinary; otherwise their places follow from where they lie. */
  arrangement?: Arrangement;
  /** Mullets only. */
  points?: MulletPoints;
  /** Lions and eagles only. */
  attitude?: Attitude;
}

export interface Arms {
  shape: Shape;
  field: Field;
  ordinary?: Ordinary;
  /** On the field: around the ordinary if there is one ("between"). */
  charges?: ChargeGroup;
  /** On the principal ordinary. */
  onOrdinary?: ChargeGroup;
  chief?: Edge;
  onChief?: ChargeGroup;
  bordure?: Edge;
}

/** Where a group of charges lies. */
export type Place = 'field' | 'ordinary' | 'chief';

/** The ways a number of charges can be arranged on an open field; the first is the usual one. */
export function arrangementsFor(count: number): readonly Arrangement[] {
  switch (count) {
    case 2:
      return ['inPale', 'inFess', 'inBend'];
    case 3:
      return ['twoAndOne', 'oneAndTwo', 'inPale', 'inFess', 'inBend'];
    case 4:
      return ['twoAndTwo', 'inCross'];
    case 5:
      return ['inSaltire', 'inCross'];
    case 6:
      return ['threeTwoOne'];
    default:
      return [];
  }
}

const betweenCounts: Readonly<Record<OrdinaryType, readonly number[]>> = {
  pale: [2, 4, 6],
  fess: [2, 3, 4, 6],
  bend: [2, 4, 6],
  chevron: [3],
  cross: [4],
  saltire: [4],
  pile: [2],
};

const onCounts: Readonly<Record<OrdinaryType, readonly number[]>> = {
  pale: [1, 2, 3],
  fess: [1, 2, 3, 4, 5],
  bend: [1, 2, 3, 4, 5],
  chevron: [1, 3, 5],
  cross: [1, 5],
  saltire: [1, 5],
  pile: [1, 3],
};

/** How many charges a place can hold, given the principal ordinary. */
export function countsFor(place: Place, ordinary?: OrdinaryType): readonly number[] {
  if (place === 'chief') return [1, 2, 3];
  if (place === 'ordinary') return ordinary ? onCounts[ordinary] : [];
  return ordinary ? betweenCounts[ordinary] : [1, 2, 3, 4, 5, 6];
}

const oneOf = <T extends string>(list: readonly T[], value: unknown, fallback: T): T =>
  typeof value === 'string' && (list as readonly string[]).includes(value) ? (value as T) : fallback;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** The allowed count nearest to what was asked; the lower one when two are as near. */
function nearest(allowed: readonly number[], value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : (allowed[0] ?? 1);
  return allowed.reduce((best, c) => (Math.abs(c - n) < Math.abs(best - n) ? c : best), allowed[0] ?? 1);
}

export function cleanField(value: unknown): Field {
  const v = isObject(value) ? value : {};
  const list = Array.isArray(v.tinctures) ? v.tinctures : [];
  if (v.kind === 'divided') {
    const division = oneOf(divisions, v.division, 'perPale');
    const fallbacks: TinctureId[] = ['argent', 'azure', 'gules'];
    const n = tierced.includes(division) ? 3 : 2;
    return {
      kind: 'divided',
      division,
      tinctures: fallbacks.slice(0, n).map((fallback, i) => cleanTincture(list[i], fallback)),
      line: linedDivisions.includes(division) ? oneOf(lines, v.line, 'straight') : 'straight',
    };
  }
  if (v.kind === 'patterned') {
    const pattern = oneOf(patterns, v.pattern, 'barry');
    const { min, max, usual } = patternCounts[pattern];
    const asked = typeof v.count === 'number' && Number.isFinite(v.count) ? v.count : usual;
    return {
      kind: 'patterned',
      pattern,
      count: Math.min(max, Math.max(min, Math.round(asked / 2) * 2)),
      tinctures: [cleanTincture(list[0], 'argent'), cleanTincture(list[1], 'azure')],
    };
  }
  return { kind: 'plain', tincture: cleanTincture(v.tincture, 'azure') };
}

function cleanEdge(value: unknown, fallback: TinctureId): Edge | undefined {
  if (!isObject(value)) return undefined;
  return { tincture: cleanTincture(value.tincture, fallback), line: oneOf(lines, value.line, 'straight') };
}

function cleanGroup(value: unknown, place: Place, ordinary?: OrdinaryType): ChargeGroup | undefined {
  if (!isObject(value) || !isCharge(value.charge)) return undefined;
  const allowed = countsFor(place, ordinary);
  if (!allowed.length) return undefined;
  const charge = value.charge;
  const count = nearest(allowed, value.count);
  const group: ChargeGroup = { charge, count, tincture: charge === 'emu' ? 'proper' : cleanTincture(value.tincture, 'or') };
  if (place === 'field' && !ordinary && count > 1) {
    const ways = arrangementsFor(count);
    group.arrangement = oneOf(ways, value.arrangement, ways[0]!);
  }
  if (charge === 'mullet') group.points = mulletPoints.find((p) => p === value.points) ?? 5;
  const stances = attitudesFor(charge);
  if (stances.length) group.attitude = oneOf(stances, value.attitude, stances[0]!);
  return group;
}

/** Anything into valid arms, with its keys always in the same order. */
export function cleanArms(value: unknown): Arms {
  const v = isObject(value) ? value : {};
  const arms: Arms = { shape: oneOf(shapes, v.shape, 'heater'), field: cleanField(v.field) };

  const base = cleanEdge(v.ordinary, 'or');
  const type = isObject(v.ordinary) ? oneOf(ordinaries, v.ordinary.type, 'fess') : undefined;
  if (base && type) arms.ordinary = { type, ...base };

  const charges = cleanGroup(v.charges, 'field', type);
  if (charges) arms.charges = charges;
  const onOrdinary = cleanGroup(v.onOrdinary, 'ordinary', type);
  if (onOrdinary) arms.onOrdinary = onOrdinary;

  const chief = cleanEdge(v.chief, 'or');
  if (chief) {
    arms.chief = chief;
    const onChief = cleanGroup(v.onChief, 'chief', type);
    if (onChief) arms.onChief = onChief;
  }
  const bordure = cleanEdge(v.bordure, 'or');
  if (bordure) arms.bordure = bordure;
  return arms;
}

/** Where every new visit starts: "Azure, a chevron Or between three mullets argent". */
export function defaultArms(): Arms {
  return cleanArms({
    shape: 'heater',
    field: { kind: 'plain', tincture: 'azure' },
    ordinary: { type: 'chevron', tincture: 'or', line: 'straight' },
    charges: { charge: 'mullet', count: 3, tincture: 'argent' },
  });
}

/** Whether two designs are the same arms. */
export const sameArms = (a: Arms, b: Arms): boolean => JSON.stringify(cleanArms(a)) === JSON.stringify(cleanArms(b));

/** Every tincture a design uses, in the order a blazon would name them. */
export function tincturesOf(arms: Arms): Tincture[] {
  const list: Tincture[] = arms.field.kind === 'plain' ? [arms.field.tincture] : [...arms.field.tinctures];
  for (const part of [arms.ordinary, arms.charges, arms.onOrdinary, arms.chief, arms.onChief, arms.bordure]) {
    if (part) list.push(part.tincture);
  }
  return [...new Set(list)];
}

/** The names the maker shows for each choice. */
export const names = {
  shape: {
    heater: 'Heater',
    french: 'French',
    spanish: 'Spanish',
    polish: 'Polish',
    lozenge: 'Lozenge',
    roundel: 'Roundel',
  } satisfies Record<Shape, string>,
  line: {
    straight: 'Straight',
    engrailed: 'Engrailed',
    indented: 'Indented',
    wavy: 'Wavy',
    embattled: 'Embattled',
  } satisfies Record<Line, string>,
  division: {
    perPale: 'Per pale',
    perFess: 'Per fess',
    perBend: 'Per bend',
    perBendSinister: 'Per bend sinister',
    perChevron: 'Per chevron',
    perSaltire: 'Per saltire',
    quarterly: 'Quarterly',
    tiercedPale: 'Tierced per pale',
    tiercedFess: 'Tierced per fess',
    tiercedPall: 'Tierced per pall',
  } satisfies Record<Division, string>,
  pattern: {
    barry: 'Barry',
    paly: 'Paly',
    bendy: 'Bendy',
    chequy: 'Chequy',
  } satisfies Record<Pattern, string>,
  ordinary: {
    pale: 'Pale',
    fess: 'Fess',
    bend: 'Bend',
    chevron: 'Chevron',
    cross: 'Cross',
    saltire: 'Saltire',
    pile: 'Pile',
  } satisfies Record<OrdinaryType, string>,
  arrangement: {
    inPale: 'In pale',
    inFess: 'In fess',
    inBend: 'In bend',
    twoAndOne: 'Two and one',
    oneAndTwo: 'One and two',
    twoAndTwo: 'Two and two',
    inCross: 'In cross',
    inSaltire: 'In saltire',
    threeTwoOne: 'Three, two and one',
  } satisfies Record<Arrangement, string>,
  attitude: {
    rampant: 'Rampant',
    rampantGuardant: 'Rampant guardant',
    passant: 'Passant',
    passantGuardant: 'Passant guardant',
    statant: 'Statant',
    statantGuardant: 'Statant guardant',
    salient: 'Salient',
    sejant: 'Sejant',
    sejantErect: 'Sejant erect',
    couchant: 'Couchant',
    dormant: 'Dormant',
    courant: 'Courant',
    displayed: 'Displayed',
    rising: 'Rising',
  } satisfies Record<Attitude, string>,
} as const;
