/**
 * Arms live in their link: the whole design goes into the query string, compact and with a
 * version in front, so sharing arms is sharing a link and nothing is kept on a server. This
 * module turns arms into the smallest JSON that says them, and back; the site wraps that in
 * @eurth/style's link encoding (?d=1.…).
 *
 * The compact form says only what differs from the arms every visit starts with, so the plain
 * address is those arms. It names shapes, lines, divisions and the rest by their place in the
 * model's lists, which makes those lists part of the format: only ever add to their ends. A
 * test holds the order still.
 *
 * Whatever arrives is checked and clamped before it is drawn: a link is someone else's input.
 * A typed blazon can travel as a link too (?blazon=Or, an emu proper).
 */
import { arrangements, attitudes, cleanArms, defaultArms, divisions, lines, ordinaries, patterns, shapes, type Arms, type ChargeGroup, type Edge, type Field, type Shape } from './model';
import { parseBlazon, type ParseProblem } from './parse';
import { tinctureIds, type Tincture } from './tinctures';

/** The version of the compact form. Raise it when the shape changes, and keep reading the old ones. */
export const LINK_VERSION = 1;

/** The longest link the tool makes or reads, in characters of the encoded state. */
export const MAX_LINK = 1500;

const tinctureCodes: readonly Tincture[] = [...tinctureIds, 'proper'];
const code = (t: Tincture): number => tinctureCodes.indexOf(t);
const at = <T>(list: readonly T[], index: unknown): T | undefined => (typeof index === 'number' && Number.isInteger(index) ? list[index] : undefined);

function packField(field: Field): unknown {
  if (field.kind === 'plain') return code(field.tincture);
  if (field.kind === 'divided') return [0, divisions.indexOf(field.division), lines.indexOf(field.line), ...field.tinctures.map(code)];
  return [1, patterns.indexOf(field.pattern), field.count, ...field.tinctures.map(code)];
}

function unpackField(value: unknown): unknown {
  if (typeof value === 'number') return { kind: 'plain', tincture: at(tinctureCodes, value) };
  if (!Array.isArray(value)) return undefined;
  if (value[0] === 0) return { kind: 'divided', division: at(divisions, value[1]), line: at(lines, value[2]), tinctures: value.slice(3, 6).map((t) => at(tinctureCodes, t)) };
  return { kind: 'patterned', pattern: at(patterns, value[1]), count: value[2], tinctures: value.slice(3, 5).map((t) => at(tinctureCodes, t)) };
}

const packEdge = (edge: Edge): unknown[] => (edge.line === 'straight' ? [code(edge.tincture)] : [code(edge.tincture), lines.indexOf(edge.line)]);
const unpackEdge = (value: unknown): unknown => (Array.isArray(value) ? { tincture: at(tinctureCodes, value[0]), line: at(lines, value[1]) ?? 'straight' } : undefined);

function packGroup(group: ChargeGroup): unknown[] {
  // The charge by name (the catalogue grows), then count, tincture, arrangement, and the one
  // detail a charge can have: a mullet's points or a beast's attitude.
  const detail = group.points ?? (group.attitude ? attitudes.indexOf(group.attitude) : -1);
  const packed: unknown[] = [group.charge, group.count, code(group.tincture), group.arrangement ? arrangements.indexOf(group.arrangement) : -1, detail];
  while (packed.length > 3 && packed[packed.length - 1] === -1) packed.pop();
  return packed;
}

function unpackGroup(value: unknown): unknown {
  if (!Array.isArray(value)) return undefined;
  return { charge: value[0], count: value[1], tincture: at(tinctureCodes, value[2]), arrangement: at(arrangements, value[3]), points: value[4], attitude: at(attitudes, value[4]) };
}

type Packer = [key: string, part: keyof Arms, pack: (value: never) => unknown, unpack: (value: unknown) => unknown];

const parts: Packer[] = [
  ['s', 'shape', (shape: Shape) => shapes.indexOf(shape), (value) => at(shapes, value)],
  ['f', 'field', packField, unpackField],
  ['o', 'ordinary', (o: NonNullable<Arms['ordinary']>) => [ordinaries.indexOf(o.type), ...packEdge(o)], (value) => (Array.isArray(value) ? { type: at(ordinaries, value[0]), ...(unpackEdge(value.slice(1)) as object) } : undefined)],
  ['c', 'charges', packGroup, unpackGroup],
  ['oc', 'onOrdinary', packGroup, unpackGroup],
  ['h', 'chief', packEdge, unpackEdge],
  ['hc', 'onChief', packGroup, unpackGroup],
  ['b', 'bordure', packEdge, unpackEdge],
];

/**
 * Arms as the smallest JSON that says them: only what differs from the default arms, under
 * short keys. A part the default has and these arms lack is a 0.
 */
export function compact(design: Arms): Record<string, unknown> {
  const arms = cleanArms(design);
  const base = defaultArms();
  const state: Record<string, unknown> = {};
  for (const [key, part, pack] of parts) {
    const [mine, usual] = [arms[part], base[part]];
    if (JSON.stringify(mine) === JSON.stringify(usual)) continue;
    state[key] = mine === undefined ? 0 : pack(mine as never);
  }
  return state;
}

/** Arms back from their compact form. Anything that isn't one gives the default arms. */
export function expand(state: unknown): Arms {
  const base: Record<string, unknown> = { ...defaultArms() };
  if (typeof state === 'object' && state !== null && !Array.isArray(state)) {
    for (const [key, part, , unpack] of parts) {
      if (!Object.prototype.hasOwnProperty.call(state, key)) continue;
      const value = (state as Record<string, unknown>)[key];
      base[part] = value === 0 && part !== 'shape' && part !== 'field' ? undefined : (unpack(value) ?? (part === 'shape' || part === 'field' ? base[part] : undefined));
    }
  }
  return cleanArms(base);
}

/** A name for the arms (a nation, a house): plain text, no markup, at most 60 characters. */
export function cleanName(value: unknown): string {
  return typeof value === 'string'
    ? value
        .replace(/[<>\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ')
        .trimStart()
        .slice(0, 60)
    : '';
}

export interface Opened {
  arms: Arms;
  /** Set when a blazon in the link couldn't be read; the arms are then the default ones. */
  problem?: ParseProblem;
  /** Things a blazon in the link had adjusted on the way in. */
  notes: string[];
}

/**
 * Opens what a link carries: its decoded state (from ?d=), or a blazon (from ?blazon=, with
 * ?shape= beside it). The blazon wins when both are there, because someone typed it.
 */
export function openLink(link: { state?: unknown; blazon?: string | null; shape?: string | null }): Opened {
  if (typeof link.blazon === 'string' && link.blazon.trim()) {
    const shape = cleanArms({ shape: link.shape }).shape;
    const read = parseBlazon(link.blazon, shape);
    return read.ok ? { arms: read.arms, notes: read.notes } : { arms: cleanArms({ ...defaultArms(), shape }), problem: read.problem, notes: [] };
  }
  return { arms: expand(link.state), notes: [] };
}
