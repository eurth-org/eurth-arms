/**
 * The tinctures: heraldry's palette. Two metals, five colours and two furs. The rule of
 * tincture (check.ts) only needs each one's class; the paints are how this tool draws them:
 * flat, with azure in Eurth's own blue, and far enough apart in lightness that red and green,
 * gold and green, or blue and purple can be told apart without their hue (a test holds them to
 * it). Names are data too: a swatch always carries its name.
 */
export const tinctureIds = ['or', 'argent', 'gules', 'azure', 'vert', 'sable', 'purpure', 'ermine', 'vair'] as const;

export type TinctureId = (typeof tinctureIds)[number];
/** "Proper" (in its natural colours) exists for one charge only: the emu. */
export type Tincture = TinctureId | 'proper';
export type TinctureClass = 'metal' | 'colour' | 'fur' | 'proper';

export interface TinctureDef {
  id: TinctureId;
  /** As a swatch names it: "Or", "Argent". */
  name: string;
  /** As a blazon writes it: "Or" keeps its capital so it can't be read as the word "or". */
  blazon: string;
  /** In plain words, for the description: "gold", "white". */
  plain: string;
  class: Exclude<TinctureClass, 'proper'>;
  /** The flat paint. For a fur, the ground; its spots or bells are drawn over it (render.ts). */
  paint: string;
  /** For a fur, the paint of its spots or bells. */
  second?: string;
}

export const tinctures: readonly TinctureDef[] = [
  { id: 'or', name: 'Or', blazon: 'Or', plain: 'gold', class: 'metal', paint: '#f7cf57' },
  { id: 'argent', name: 'Argent', blazon: 'argent', plain: 'white', class: 'metal', paint: '#fcf6e1' },
  { id: 'gules', name: 'Gules', blazon: 'gules', plain: 'red', class: 'colour', paint: '#b3192b' },
  { id: 'azure', name: 'Azure', blazon: 'azure', plain: 'blue', class: 'colour', paint: '#2698d4' },
  { id: 'vert', name: 'Vert', blazon: 'vert', plain: 'green', class: 'colour', paint: '#2fa046' },
  { id: 'sable', name: 'Sable', blazon: 'sable', plain: 'black', class: 'colour', paint: '#030303' },
  { id: 'purpure', name: 'Purpure', blazon: 'purpure', plain: 'purple', class: 'colour', paint: '#6f4a9c' },
  { id: 'ermine', name: 'Ermine', blazon: 'ermine', plain: 'ermine', class: 'fur', paint: '#fcf6e1', second: '#030303' },
  { id: 'vair', name: 'Vair', blazon: 'vair', plain: 'vair', class: 'fur', paint: '#fcf6e1', second: '#2698d4' },
];

const byId = new Map<string, TinctureDef>(tinctures.map((t) => [t.id, t]));

export const isTinctureId = (value: unknown): value is TinctureId => typeof value === 'string' && byId.has(value);

export function tincture(id: TinctureId): TinctureDef {
  return byId.get(id)!;
}

/** Anything into a tincture: what arrives from a link or a file is someone else's input. */
export function cleanTincture(value: unknown, fallback: TinctureId = 'argent'): TinctureId {
  return isTinctureId(value) ? value : fallback;
}

export function tinctureClass(t: Tincture): TinctureClass {
  return t === 'proper' ? 'proper' : tincture(t).class;
}

export const metals: readonly TinctureId[] = tinctures.filter((t) => t.class === 'metal').map((t) => t.id);
export const colours: readonly TinctureId[] = tinctures.filter((t) => t.class === 'colour').map((t) => t.id);
export const furs: readonly TinctureId[] = tinctures.filter((t) => t.class === 'fur').map((t) => t.id);

/** How a blazon writes a tincture. */
export const blazonName = (t: Tincture): string => (t === 'proper' ? 'proper' : tincture(t).blazon);
/** How the description says it. */
export const plainName = (t: Tincture): string => (t === 'proper' ? 'natural-coloured' : tincture(t).plain);

/** Relative luminance of a #rrggbb paint (WCAG). */
export function luminance(hex: string): number {
  const channel = (i: number): number => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** Contrast between two paints, from 1 (the same) to 21 (black on white). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
