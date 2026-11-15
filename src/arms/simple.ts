/**
 * Simple mode: arms in four choices. Pick a shield, a field, an ordinary and a charge, and
 * tincture each; `fromSimple` turns the choices into full arms, which Advanced mode can then
 * take further (lines of partition, a chief and a bordure together, charges on the ordinary
 * and on the chief, arrangements). Every choice is a preset below, so adding one is adding a
 * line.
 */
import { attitudesFor, cleanArms, patternCounts, sameArms, tierced, type Arms, type Attitude, type Division, type Field, type OrdinaryType, type Pattern, type Shape } from './model';
import { cleanTincture, type TinctureId } from './tinctures';

export interface Simple {
  shape: Shape;
  /** A field preset, and its three tinctures (a preset uses the first one, two or three). */
  field: string;
  tinctures: [TinctureId, TinctureId, TinctureId];
  /** An ordinary preset: one of the nine ordinaries, or 'none'. */
  ordinary: string;
  ordinaryTincture: TinctureId;
  /** A charge (see catalogue.ts), or 'none'. */
  charge: string;
  /** One, two or three of it; an ordinary may ask for another number (two beside a pale, four round a cross). */
  count: number;
  chargeTincture: TinctureId;
  /** For a lion or an eagle: how it stands. */
  attitude?: Attitude;
}

export interface FieldPreset {
  id: string;
  name: string;
  /** How many of the three tinctures it shows. */
  uses: 1 | 2 | 3;
  make: (t: [TinctureId, TinctureId, TinctureId]) => Field;
}

const divided = (id: Division, name: string): FieldPreset => ({
  id,
  name,
  uses: tierced.includes(id) ? 3 : 2,
  make: (t) => ({ kind: 'divided', division: id, tinctures: tierced.includes(id) ? [...t] : [t[0], t[1]], line: 'straight' }),
});

const patterned = (id: Pattern, name: string): FieldPreset => ({
  id,
  name,
  uses: 2,
  make: ([a, b]) => ({ kind: 'patterned', pattern: id, count: patternCounts[id].usual, tinctures: [a, b] }),
});

export const fieldPresets: readonly FieldPreset[] = [
  { id: 'plain', name: 'Plain', uses: 1, make: ([a]) => ({ kind: 'plain', tincture: a }) },
  divided('perPale', 'Per pale'),
  divided('perFess', 'Per fess'),
  divided('perBend', 'Per bend'),
  divided('perBendSinister', 'Per bend sinister'),
  divided('perChevron', 'Per chevron'),
  divided('perSaltire', 'Per saltire'),
  divided('quarterly', 'Quarterly'),
  divided('tiercedPale', 'Tierced per pale'),
  divided('tiercedFess', 'Tierced per fess'),
  divided('tiercedPall', 'Tierced per pall'),
  patterned('barry', 'Barry'),
  patterned('paly', 'Paly'),
  patterned('bendy', 'Bendy'),
  patterned('chequy', 'Chequy'),
];

export interface OrdinaryPreset {
  id: string;
  name: string;
}

/** The nine ordinaries of the brief, in the order heralds usually list them, and none at all. */
export const ordinaryPresets: readonly OrdinaryPreset[] = [
  { id: 'none', name: 'None' },
  { id: 'chief', name: 'Chief' },
  { id: 'pale', name: 'Pale' },
  { id: 'fess', name: 'Fess' },
  { id: 'bend', name: 'Bend' },
  { id: 'chevron', name: 'Chevron' },
  { id: 'cross', name: 'Cross' },
  { id: 'saltire', name: 'Saltire' },
  { id: 'pile', name: 'Pile' },
  { id: 'bordure', name: 'Bordure' },
];

/** The choices a new visit starts with: the mock-up's "Azure, a chevron Or between three mullets argent". */
export function defaultSimple(): Simple {
  return { shape: 'heater', field: 'plain', tinctures: ['azure', 'argent', 'gules'], ordinary: 'chevron', ordinaryTincture: 'or', charge: 'mullet', count: 3, chargeTincture: 'argent' };
}

export function fromSimple(simple: Simple): Arms {
  const preset = fieldPresets.find((p) => p.id === simple.field) ?? fieldPresets[0]!;
  const edge = { tincture: simple.ordinaryTincture, line: 'straight' };
  const principal = simple.ordinary !== 'none' && simple.ordinary !== 'chief' && simple.ordinary !== 'bordure';
  return cleanArms({
    shape: simple.shape,
    field: preset.make(simple.tinctures),
    ordinary: principal ? { type: simple.ordinary, ...edge } : undefined,
    chief: simple.ordinary === 'chief' ? edge : undefined,
    bordure: simple.ordinary === 'bordure' ? edge : undefined,
    charges: simple.charge === 'none' ? undefined : { charge: simple.charge, count: simple.count, tincture: simple.chargeTincture, attitude: simple.attitude },
  });
}

/**
 * The simple choices that make these arms, if any do: for stepping back from Advanced mode
 * without losing anything. Arms that Simple mode can't express give undefined.
 */
export function toSimple(arms: Arms): Simple | undefined {
  const base = defaultSimple();
  const field = arms.field;
  const tinctures: [TinctureId, TinctureId, TinctureId] =
    field.kind === 'plain'
      ? [field.tincture, base.tinctures[1], base.tinctures[2]]
      : [field.tinctures[0]!, field.tinctures[1]!, field.tinctures[2] ?? base.tinctures[2]];
  const edge = arms.ordinary ?? arms.chief ?? arms.bordure;
  const simple: Simple = {
    shape: arms.shape,
    field: field.kind === 'plain' ? 'plain' : field.kind === 'divided' ? field.division : field.pattern,
    tinctures,
    ordinary: arms.ordinary?.type ?? (arms.chief ? 'chief' : arms.bordure ? 'bordure' : 'none'),
    ordinaryTincture: edge?.tincture ?? base.ordinaryTincture,
    charge: arms.charges?.charge ?? 'none',
    count: arms.charges?.count ?? base.count,
    chargeTincture: cleanTincture(arms.charges?.tincture, base.chargeTincture),
  };
  if (arms.charges?.attitude) simple.attitude = arms.charges.attitude;
  return sameArms(fromSimple(simple), arms) ? simple : undefined;
}

/** Anything into valid simple choices: for whatever a link or a file brings. */
export function cleanSimple(value: unknown): Simple {
  const base = defaultSimple();
  const v = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  const list = Array.isArray(v.tinctures) ? v.tinctures : [];
  const arms = cleanArms({ shape: v.shape });
  const charge = typeof v.charge === 'string' && (v.charge === 'none' || cleanArms({ field: {}, charges: { charge: v.charge, count: 1 } }).charges) ? v.charge : base.charge;
  const simple: Simple = {
    shape: arms.shape,
    field: fieldPresets.some((p) => p.id === v.field) ? (v.field as string) : base.field,
    tinctures: [cleanTincture(list[0], base.tinctures[0]), cleanTincture(list[1], base.tinctures[1]), cleanTincture(list[2], base.tinctures[2])],
    ordinary: ordinaryPresets.some((p) => p.id === v.ordinary) ? (v.ordinary as string) : base.ordinary,
    ordinaryTincture: cleanTincture(v.ordinaryTincture, base.ordinaryTincture),
    charge,
    count: typeof v.count === 'number' && Number.isFinite(v.count) ? Math.min(6, Math.max(1, Math.round(v.count))) : base.count,
    chargeTincture: cleanTincture(v.chargeTincture, base.chargeTincture),
  };
  const stances = attitudesFor(charge);
  if (stances.length) simple.attitude = stances.find((a) => a === v.attitude) ?? stances[0];
  return simple;
}

/** The principal ordinaries among the presets, for code that needs to tell them from the chief and bordure. */
export const isPrincipal = (id: string): id is OrdinaryType => id !== 'none' && id !== 'chief' && id !== 'bordure' && ordinaryPresets.some((p) => p.id === id);
