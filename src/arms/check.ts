/**
 * The rule of tincture: no colour on colour, no metal on metal. Heraldry's one design rule,
 * and a practical one: gold and silver are light, the colours are dark, and light on dark can
 * be read across a field.
 *
 * Every layer is checked against what it lies on: the ordinary, the chief and the bordure on
 * the field; charges on the field, on the ordinary or on the chief. As heralds do, the check
 * lets furs and "proper" lie on anything, and lets anything lie on a field parted of a metal
 * and a colour. It adds one thing the old rule takes for granted: a layer in the very
 * tincture it lies on can't be seen at all.
 *
 * Each finding carries a fix: the same arms with that one layer repainted.
 */
import { charge } from './catalogue';
import { cleanArms, type Arms, type ChargeGroup } from './model';
import { blazonName, colours, metals, tinctureClass, type Tincture, type TinctureId } from './tinctures';

export type Clash = 'colourOnColour' | 'metalOnMetal' | 'lost';

/** The layers that lie on something. */
export type Layer = 'ordinary' | 'charges' | 'onOrdinary' | 'chief' | 'onChief' | 'bordure';

export interface Finding {
  layer: Layer;
  clash: Clash;
  /** "Colour on colour", "Metal on metal" or "Lost from sight": the word that goes with the icon. */
  label: string;
  /** The whole finding as a sentence. */
  text: string;
  fix: {
    tincture: TinctureId;
    /** For the button: "Make the chevron Or". */
    label: string;
    arms: Arms;
  };
}

export interface Check {
  /** 'empty' when nothing lies on anything yet. */
  status: 'respected' | 'broken' | 'empty';
  /** One line for the status: a word first, never colour alone. */
  summary: string;
  findings: Finding[];
}

const labels: Readonly<Record<Clash, string>> = {
  colourOnColour: 'Colour on colour',
  metalOnMetal: 'Metal on metal',
  lost: 'Lost from sight',
};

interface Ground {
  tinctures: Tincture[];
  name: string;
}

interface Pair {
  layer: Layer;
  upper: Tincture;
  /** "chevron", "mullets". */
  noun: string;
  plural: boolean;
  lower: Ground;
}

const groupNoun = (group: ChargeGroup): { noun: string; plural: boolean } => {
  const def = charge(group.charge);
  return group.count === 1 ? { noun: def.name, plural: false } : { noun: def.plural, plural: true };
};

const listed = (items: string[]): string => (items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

function pairs(arms: Arms): Pair[] {
  const fieldTinctures: Tincture[] = arms.field.kind === 'plain' ? [arms.field.tincture] : [...new Set(arms.field.tinctures)];
  const field: Ground = {
    tinctures: fieldTinctures,
    name: fieldTinctures.length === 1 ? `the ${blazonName(fieldTinctures[0]!)} field` : `the field of ${listed(fieldTinctures.map(blazonName))}`,
  };
  const list: Pair[] = [];
  if (arms.ordinary) list.push({ layer: 'ordinary', upper: arms.ordinary.tincture, noun: arms.ordinary.type, plural: false, lower: field });
  if (arms.charges) list.push({ layer: 'charges', upper: arms.charges.tincture, ...groupNoun(arms.charges), lower: field });
  if (arms.ordinary && arms.onOrdinary) {
    const lower = { tinctures: [arms.ordinary.tincture], name: `the ${blazonName(arms.ordinary.tincture)} ${arms.ordinary.type}` };
    list.push({ layer: 'onOrdinary', upper: arms.onOrdinary.tincture, ...groupNoun(arms.onOrdinary), lower });
  }
  if (arms.chief) list.push({ layer: 'chief', upper: arms.chief.tincture, noun: 'chief', plural: false, lower: field });
  if (arms.chief && arms.onChief) {
    const lower = { tinctures: [arms.chief.tincture], name: `the ${blazonName(arms.chief.tincture)} chief` };
    list.push({ layer: 'onChief', upper: arms.onChief.tincture, ...groupNoun(arms.onChief), lower });
  }
  if (arms.bordure) list.push({ layer: 'bordure', upper: arms.bordure.tincture, noun: 'bordure', plural: false, lower: field });
  return list;
}

/** What goes wrong, if anything, when one tincture lies on a ground. */
export function clash(upper: Tincture, lower: readonly Tincture[]): Clash | undefined {
  if (lower.includes(upper)) return 'lost';
  const over = tinctureClass(upper);
  if (over === 'fur' || over === 'proper') return undefined;
  const under = new Set(lower.map(tinctureClass));
  // A ground of one class only. Parted of a metal and a colour, or with a fur in it, anything may lie on it.
  if (under.size !== 1 || !under.has(over)) return undefined;
  return over === 'metal' ? 'metalOnMetal' : 'colourOnColour';
}

const repaint = (arms: Arms, layer: Layer, tincture: TinctureId): Arms => cleanArms({ ...arms, [layer]: { ...arms[layer], tincture } });

/** The tinctures that lie on a layer, which a repaint of it must not clash with. */
function riders(arms: Arms, layer: Layer): Tincture[] {
  if (layer === 'ordinary' && arms.onOrdinary) return [arms.onOrdinary.tincture];
  if (layer === 'chief' && arms.onChief) return [arms.onChief.tincture];
  return [];
}

/**
 * The tincture to repaint a layer in: one that sits well on its ground, doesn't upset what
 * lies on it in turn, and, where there is a choice, one the shield doesn't use yet.
 */
function remedy(arms: Arms, pair: Pair): TinctureId {
  const plain = [...metals, ...colours];
  const fits = plain.filter((t) => !clash(t, pair.lower.tinctures));
  const candidates = fits.length ? fits : plain;
  const used = new Set<Tincture>(pairs(arms).flatMap((p) => [p.upper, ...p.lower.tinctures]));
  const over = riders(arms, pair.layer);
  const score = (t: TinctureId): number => (over.some((rider) => clash(rider, [t])) ? 2 : 0) + (used.has(t) ? 1 : 0);
  return candidates.reduce((best, t) => (score(t) < score(best) ? t : best), candidates[0]!);
}

export function checkTincture(design: Arms): Check {
  const arms = cleanArms(design);
  const all = pairs(arms);
  const findings: Finding[] = [];
  for (const pair of all) {
    const found = clash(pair.upper, pair.lower.tinctures);
    if (!found) continue;
    const tincture = remedy(arms, pair);
    const subject = `the ${blazonName(pair.upper)} ${pair.noun}`;
    const text =
      found === 'lost'
        ? `${labels.lost}: ${subject} can't be seen against ${pair.lower.name}.`
        : `${labels[found]}: ${subject} ${pair.plural ? 'lie' : 'lies'} on ${pair.lower.name}.`;
    findings.push({
      layer: pair.layer,
      clash: found,
      label: labels[found],
      text,
      fix: { tincture, label: `Make the ${pair.noun} ${blazonName(tincture)}`, arms: repaint(arms, pair.layer, tincture) },
    });
  }
  if (!all.length) return { status: 'empty', summary: 'Nothing lies on the field yet, so there is no rule to break.', findings };
  if (!findings.length) return { status: 'respected', summary: 'Rule of tincture respected: metal on colour, colour on metal.', findings };
  const places = findings.length === 1 ? 'one place' : `${['', '', 'two', 'three', 'four', 'five', 'six'][findings.length]} places`;
  return { status: 'broken', summary: `Rule of tincture broken in ${places}.`, findings };
}

/** Every finding fixed, one after another, until the arms pass. */
export function fixAll(design: Arms): Arms {
  let arms = cleanArms(design);
  for (let i = 0; i < 12; i++) {
    const first = checkTincture(arms).findings[0];
    if (!first) break;
    arms = first.fix.arms;
  }
  return arms;
}
