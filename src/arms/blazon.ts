/**
 * Writes the blazon: arms in the language of heraldry, in the order heralds use (the field,
 * the principal ordinary and the charges around and on it, the chief, the bordure) and in one
 * fixed style, so the same arms always give the same words:
 *
 *   Azure, a chevron Or between three mullets argent
 *   Or, on a bend engrailed sable three bezants
 *   Per pale gules and azure, a lion rampant Or, a chief ermine
 *
 * parse.ts reads every one of these back to the arms it came from.
 */
import { charge, roundelNames } from './catalogue';
import { arrangementsFor, cleanArms, names, patternCounts, type Arms, type Arrangement, type Attitude, type ChargeGroup, type Division, type Edge, type Field, type Line, type OrdinaryType, type Pattern } from './model';
import { blazonName } from './tinctures';

export const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'] as const;

export const divisionWords: Readonly<Record<Division, string>> = {
  perPale: 'per pale',
  perFess: 'per fess',
  perBend: 'per bend',
  perBendSinister: 'per bend sinister',
  perChevron: 'per chevron',
  perSaltire: 'per saltire',
  quarterly: 'quarterly',
  tiercedPale: 'tierced per pale',
  tiercedFess: 'tierced per fess',
  tiercedPall: 'tierced per pall',
};

export const patternWords: Readonly<Record<Pattern, string>> = {
  barry: 'barry',
  paly: 'paly',
  bendy: 'bendy',
  chequy: 'chequy',
};

export const ordinaryWords: Readonly<Record<OrdinaryType, string>> = {
  pale: 'pale',
  fess: 'fess',
  bend: 'bend',
  chevron: 'chevron',
  cross: 'cross',
  saltire: 'saltire',
  pile: 'pile',
};

export const arrangementWords: Readonly<Record<Arrangement, string>> = {
  inPale: 'in pale',
  inFess: 'in fess',
  inBend: 'in bend',
  twoAndOne: 'two and one',
  oneAndTwo: 'one and two',
  twoAndTwo: 'two and two',
  inCross: 'in cross',
  inSaltire: 'in saltire',
  threeTwoOne: 'three, two and one',
};

/** An attitude as a blazon writes it: "passant guardant". */
export const attitudeWord = (attitude: Attitude): string => names.attitude[attitude].toLowerCase();

const lineWord = (line: Line): string => (line === 'straight' ? '' : ` ${line}`);

/** "a mullet", "an eagle", "an hourglass". */
export const article = (noun: string): string => (/^(?:[aeiou]|hour)/i.test(noun) ? `an ${noun}` : `a ${noun}`);

export function fieldBlazon(field: Field): string {
  if (field.kind === 'plain') return blazonName(field.tincture);
  const [a, b, c] = field.tinctures.map(blazonName) as [string, string, string | undefined];
  if (field.kind === 'patterned') {
    const of = patternCounts[field.pattern].min === patternCounts[field.pattern].max ? '' : ` of ${numberWords[field.count]}`;
    return `${patternWords[field.pattern]}${of} ${a} and ${b}`;
  }
  const words = `${divisionWords[field.division]}${lineWord(field.line)}`;
  return c ? `${words} ${a}, ${b} and ${c}` : `${words} ${a} and ${b}`;
}

/** A roundel in a plain metal or colour goes by its own name: a bezant, a hurt. */
function roundelName(group: ChargeGroup): { name: string; plural: string } | undefined {
  return group.charge === 'roundel' ? roundelNames[group.tincture] : undefined;
}

export function groupBlazon(group: ChargeGroup): string {
  const named = roundelName(group);
  const def = named ?? charge(group.charge);
  let words = group.count === 1 ? article(def.name) : `${numberWords[group.count]} ${def.plural}`;
  if (group.charge === 'mullet' && group.points && group.points !== 5) words += ` of ${numberWords[group.points]} points`;
  if (group.attitude) words += ` ${attitudeWord(group.attitude)}`;
  // Two charges always say how they lie; more than two only when it isn't the usual way.
  if (group.arrangement && (group.count === 2 || group.arrangement !== arrangementsFor(group.count)[0])) {
    words += ` ${arrangementWords[group.arrangement]}`;
  }
  return named ? words : `${words} ${blazonName(group.tincture)}`;
}

const edgeBlazon = (word: string, edge: Edge): string => `a ${word}${lineWord(edge.line)} ${blazonName(edge.tincture)}`;

/** The blazon of a design. */
export function blazon(design: Arms): string {
  const arms = cleanArms(design);
  const parts = [fieldBlazon(arms.field)];

  const around = arms.charges ? groupBlazon(arms.charges) : '';
  if (arms.ordinary) {
    const ordinary = edgeBlazon(ordinaryWords[arms.ordinary.type], arms.ordinary);
    if (arms.onOrdinary) {
      const on = groupBlazon(arms.onOrdinary);
      parts.push(around ? `on ${ordinary} between ${around}, ${on}` : `on ${ordinary} ${on}`);
    } else {
      parts.push(around ? `${ordinary} between ${around}` : ordinary);
    }
  } else if (around) {
    parts.push(around);
  }

  if (arms.chief) {
    const chief = edgeBlazon('chief', arms.chief);
    parts.push(arms.onChief ? `on ${chief} ${groupBlazon(arms.onChief)}` : chief);
  }
  if (arms.bordure) parts.push(edgeBlazon('bordure', arms.bordure));

  const text = parts.join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

