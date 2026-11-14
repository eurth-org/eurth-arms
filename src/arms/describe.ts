/**
 * Arms in plain words, for people who don't read blazon and for screen readers: "A blue shield
 * with a gold chevron between three white five-pointed stars." Left and right are the viewer's
 * here, not the bearer's, because that is what a description of a picture means by them.
 * Used as the picture's description, for Copy description, and as the profile's summary.
 */
import { charge } from './catalogue';
import { arrangementsFor, cleanArms, type Arms, type Arrangement, type ChargeGroup, type Division, type Edge, type Field, type Line, type OrdinaryType } from './model';
import { plainName } from './tinctures';

const numerals = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const a = (phrase: string): string => (/^(?:[aeiou]|hour)/i.test(phrase) ? `an ${phrase}` : `a ${phrase}`);
const list = (items: string[]): string => (items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

const edged: Readonly<Record<Line, string>> = {
  straight: '',
  engrailed: 'scallop-edged ',
  indented: 'saw-toothed ',
  wavy: 'wavy ',
  embattled: 'battlemented ',
};

const dividing: Readonly<Record<Line, string>> = {
  straight: '',
  engrailed: ' along a scalloped line',
  indented: ' along a saw-toothed line',
  wavy: ' along a wavy line',
  embattled: ' along a battlemented line',
};

const divided: Readonly<Record<Division, (t: string[], line: string) => string>> = {
  perPale: ([x, y], line) => `split down the middle${line}, ${x} on the left and ${y} on the right`,
  perFess: ([x, y], line) => `split across the middle${line}, ${x} above and ${y} below`,
  perBend: ([x, y], line) => `split diagonally from the top left${line}, ${x} above and ${y} below`,
  perBendSinister: ([x, y], line) => `split diagonally from the top right${line}, ${x} above and ${y} below`,
  perChevron: ([x, y], line) => `split by a chevron-shaped line${line.replace(' along a', ', a').replace(' line', ' one')}, ${x} above and ${y} below`,
  perSaltire: ([x, y]) => `split into four by its diagonals, ${x} at the top and bottom and ${y} at the sides`,
  quarterly: ([x, y]) => `quartered, ${x} at the top left and bottom right and ${y} in the other two quarters`,
  tiercedPale: (t) => `in three upright bands of ${list(t)}`,
  tiercedFess: (t) => `in three level bands of ${list(t)}`,
  tiercedPall: ([x, y, z]) => `split in three by a Y-shaped line, ${x} at the top, ${y} on the left and ${z} on the right`,
};

function describeField(field: Field, shield: string): string {
  if (field.kind === 'plain') return `${a(`${plainName(field.tincture)} ${shield}`)}`;
  const t = field.tinctures.map(plainName);
  if (field.kind === 'divided') return `${a(shield)} ${divided[field.division](t, dividing[field.line])}`;
  if (field.pattern === 'chequy') return `${a(shield)} chequered ${t[0]} and ${t[1]}`;
  const way = field.pattern === 'barry' ? 'level' : field.pattern === 'paly' ? 'upright' : 'diagonal';
  return `${a(shield)} of ${numerals[field.count]} ${way} stripes, ${t[0]} and ${t[1]} by turns`;
}

const ordinaryWords: Readonly<Record<OrdinaryType, string>> = {
  pale: 'upright band down the middle',
  fess: 'band across the middle',
  bend: 'diagonal band from the top left',
  chevron: 'chevron',
  cross: 'cross',
  saltire: 'diagonal cross',
  pile: 'wedge pointing down from the top',
};

const describeEdge = (edge: Edge, words: string): string => a(`${edged[edge.line]}${plainName(edge.tincture)} ${words}`);

/** A charge in plain words: one of it, and several. */
function chargeWords(group: ChargeGroup): [string, string] {
  switch (group.charge) {
    case 'mullet': {
      const star = `${numerals[group.points ?? 5]}-pointed star`;
      return [star, `${star}s`];
    }
    case 'roundel':
      return ['disc', 'discs'];
    case 'annulet':
      return ['ring', 'rings'];
    case 'fleurDeLis':
      return ['fleur-de-lis', 'fleurs-de-lis'];
    case 'lion':
      return group.attitude === 'passant' ? ['walking lion', 'walking lions'] : ['rearing lion', 'rearing lions'];
    case 'eagle':
      return ['eagle with spread wings', 'eagles with spread wings'];
    default: {
      const def = charge(group.charge);
      return [def.name, def.plural];
    }
  }
}

const lying: Readonly<Partial<Record<Arrangement, string>>> = {
  inPale: 'one above the other',
  inFess: 'side by side',
  inBend: 'in a diagonal row',
  oneAndTwo: 'one above two',
  inCross: 'in the shape of a cross',
};

function describeGroup(group: ChargeGroup): string {
  const [one, many] = chargeWords(group);
  if (group.tincture === 'proper') return `${group.count === 1 ? a(one) : `${numerals[group.count]} ${many}`} in ${group.count === 1 ? 'its' : 'their'} natural colours`;
  const noun = `${plainName(group.tincture)} ${group.count === 1 ? one : many}`;
  const counted = group.count === 1 ? a(noun) : `${numerals[group.count]} ${noun}`;
  const usual = group.arrangement === arrangementsFor(group.count)[0] && group.count !== 2;
  const how = group.arrangement && !usual ? lying[group.arrangement] : undefined;
  return how ? `${counted}, ${how}` : counted;
}

/** The whole design in one to three plain sentences. */
export function describeArms(design: Arms): string {
  const arms = cleanArms(design);
  const shield = arms.shape === 'lozenge' ? 'diamond-shaped shield' : arms.shape === 'roundel' ? 'round shield' : 'shield';
  let first = describeField(arms.field, shield);

  if (arms.ordinary) {
    first += `${arms.field.kind === 'plain' ? '' : ','} with ${describeEdge(arms.ordinary, ordinaryWords[arms.ordinary.type])}`;
    if (arms.charges) first += ` between ${describeGroup(arms.charges)}`;
    if (arms.onOrdinary) first += `, and on it ${describeGroup(arms.onOrdinary)}`;
  } else if (arms.charges) {
    first += `${arms.field.kind === 'plain' ? '' : ','} with ${describeGroup(arms.charges)}`;
  }

  const sentences = [`${first}.`];
  if (arms.chief) {
    const chief = describeEdge(arms.chief, 'band').replace(/^an? /, '');
    sentences.push(`Across the top is ${a(chief)}${arms.onChief ? `, with ${describeGroup(arms.onChief)} on it` : ''}.`);
  }
  if (arms.bordure) sentences.push(`${describeEdge(arms.bordure, 'border').replace(/^a/, 'A')} runs round the edge.`);
  return sentences.join(' ');
}
