/**
 * Our own charges, drawn here as path data: the mullet, crescent, roundel, annulet,
 * fleur-de-lis, lion (rampant and passant), eagle displayed, and one emu. Each is drawn in a
 * box 100 units square, to sit inside the circle that touches its sides, and each is flat:
 * one tincture, no outline, no shading, as arms were painted on shields. Beasts face dexter
 * (the viewer's left), as heraldic beasts do.
 *
 * A drawing is a list of parts, painted one over the other. A part with no colour of its own
 * takes the charge's tincture; only the emu, which comes "proper", brings its own.
 */
import type { Attitude, MulletPoints } from './model';

export interface ArtPart {
  d: string;
  /** A paint of its own, for a charge "proper". Otherwise the charge's tincture. */
  fill?: string;
  /** Set for parts with holes cut out. */
  evenodd?: boolean;
}

export type Art = readonly ArtPart[];

const n = (v: number): string => String(Math.round(v * 100) / 100);

/** The same part, facing the other way. Only for paths written with M, L, C, Q and Z, in absolute numbers. */
function mirror(d: string): string {
  return d.replace(/([MLCQ])([^MLCQZ]*)/g, (_, command: string, rest: string) => {
    const values = rest.trim().split(/[\s,]+/).map(Number);
    return command + values.map((v, i) => n(i % 2 === 0 ? 100 - v : v)).join(' ');
  });
}

const both = (d: string): ArtPart[] => [{ d }, { d: mirror(d) }];

/** A star of straight rays: the spur-rowel of heraldry. */
function mullet(points: MulletPoints): Art {
  const inner = points === 5 ? 0.382 : points === 6 ? 0.577 : 0.52;
  const list: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = 50 * (i % 2 ? inner : 1);
    const a = (Math.PI * i) / points;
    list.push(`${n(50 + r * Math.sin(a))} ${n(50 - r * Math.cos(a))}`);
  }
  return [{ d: `M${list.join('L')}Z` }];
}

const roundel: Art = [{ d: 'M4 50a46 46 0 1 0 92 0a46 46 0 1 0-92 0Z' }];

const annulet: Art = [{ d: 'M4 50a46 46 0 1 0 92 0a46 46 0 1 0-92 0ZM21 50a29 29 0 1 0 58 0a29 29 0 1 0-58 0Z', evenodd: true }];

/** A crescent, horns up: a disc with a smaller disc taken out of its upper part. */
const crescent: Art = [{ d: 'M21.2 18.4A45 45 0 1 0 78.8 18.4A34 34 0 1 1 21.2 18.4Z' }];

const fleurDeLis: Art = [
  // The middle petal.
  { d: 'M50 1C58 13 66 24 66 37C66 46 60 53 56 61L44 61C40 53 34 46 34 37C34 24 42 13 50 1Z' },
  // The side petals, curling out and down.
  ...both('M57 61C59 49 65 39 76 36C88 33 98 41 97 52C96 60 90 65 83 63C88 59 89 52 84 49C77 46 71 53 69 61Z'),
  // The band that ties them.
  { d: 'M29 60L71 60L71 70L29 70Z' },
  // The three tails below it.
  { d: 'M44 69L56 69C56 80 53 91 50 99C47 91 44 80 44 69Z' },
  ...both('M58 69L69 69C71 78 77 84 85 84C79 91 66 90 60 80Z'),
];

const eagle: Art = [
  // Body and tail.
  { d: 'M50 28C58 28 62 38 61 52C60 62 56 68 54 72L62 94L55 88L50 98L45 88L38 94L46 72C44 68 40 62 39 52C38 38 42 28 50 28Z' },
  // The head, turned to dexter, with a hooked beak.
  { d: 'M43 34C42 26 43 18 48 14C44 11 38 12 34 15L27 17L34 20L30 24L38 23C39 27 41 31 43 36L55 36C57 28 56 20 52 16C50 14 48 14 48 14Z' },
  // The wings, raised, with five feathers each.
  ...both('M57 36C62 24 72 11 90 4C87 12 89 17 94 20C89 23 88 28 92 33C87 34 85 39 88 45C83 44 80 48 82 54C77 52 73 55 73 61C69 56 64 55 60 58Z'),
  // The legs, with open talons.
  ...both('M57 62L70 73L79 70L75 76L82 80L73 80L73 88L67 80L54 70Z'),
];

const lionRampant: Art = [
  // The tail: out behind the back and up in an S, ending in a tuft.
  { d: 'M66 62C74 64 82 60 84 52C86 44 80 38 80 30C80 24 83 20 87 20L86 24C84 24 84 27 84 30C84 36 90 42 88 52C86 62 76 68 66 68Z' },
  { d: 'M87 20C90 14 96 14 98 18C94 18 94 22 96 26C92 26 88 24 86 24Z' },
  // The body, rearing: a deep chest, a narrow waist.
  { d: 'M50 23C57 26 62 33 63 42C63 48 62 52 64 57C67 62 70 68 67 76C64 82 56 80 54 73C53 67 52 62 49 58C45 54 38 52 34 46C30 40 31 32 36 27C40 24 46 22 50 23Z' },
  // The far hind leg, planted.
  { d: 'M60 72C66 76 68 82 65 88L64 92L68 96L52 97L48 94L55 92L58 90C59 86 57 82 53 78Z' },
  // The near hind leg, stepping forward.
  { d: 'M56 66C50 70 44 76 36 78L31 78L26 74L26 80L20 80L24 85L20 89L28 88L32 86C42 86 52 82 60 74Z' },
  // The upper forepaw, raised to strike.
  { d: 'M41 29C34 27 27 24 20 19L17 13L15 19L9 17L13 22L7 25L15 26L16 27C23 31 31 35 39 37Z' },
  // The lower forepaw.
  { d: 'M39 38C32 40 25 40 19 38L14 33L13 39L7 38L11 43L6 47L14 46L16 46C24 48 33 48 41 46Z' },
  // The mane: tufts down the neck and on the chest.
  { d: 'M46 12L55 13L50 18L58 21L51 24L58 29L50 30L46 28Z' },
  { d: 'M33 30L26 33L32 35L26 39L33 40L29 45L36 44Z' },
  // The head, jaws open.
  { d: 'M47 24C49 18 47 10 41 7C36 5 30 6 27 10L18 11L22 15L26 15L23 18L17 21L26 23C28 26 32 28 36 28C40 28 45 27 47 24Z' },
  // The ear and the tongue.
  { d: 'M40 8L42 1L47 9Z' },
  { d: 'M24 16C20 16 17 17 15 19C19 19 22 18 25 18Z' },
];

const lionPassant: Art = [
  // The tail, curved over the back, ending in a tuft.
  { d: 'M84 44C90 40 94 34 92 26C91 21 86 18 82 20L83 24C86 23 88 25 88 28C89 34 86 38 80 42Z' },
  { d: 'M82 20C78 16 72 17 70 21C74 21 76 24 75 28C79 27 82 25 83 24Z' },
  // The body, level.
  { d: 'M24 40C30 34 40 34 50 36C60 38 70 36 78 38C85 40 88 48 86 56C84 62 76 62 70 60C62 58 56 60 48 62C40 64 30 64 25 58C20 52 20 44 24 40Z' },
  // The far foreleg, down.
  { d: 'M34 58L41 60L40 78L43 80L46 86L32 86L30 82L35 80Z' },
  // The near foreleg, raised.
  { d: 'M30 54C26 58 22 62 16 62L11 58L11 64L5 64L9 69L5 73L13 72L15 70C22 70 30 66 36 60Z' },
  // The hind legs, striding.
  { d: 'M68 58L76 60L73 78L76 80L79 86L64 86L63 82L68 80Z' },
  { d: 'M78 54C85 58 90 64 88 72L88 80L92 86L78 86L76 82L82 80C83 74 80 68 74 62Z' },
  // The mane.
  { d: 'M26 26L34 27L30 32L37 35L31 38L36 43L28 43Z' },
  // The head, jaws open.
  { d: 'M27 40C30 34 28 26 22 23C17 21 12 22 9 26L1 27L5 31L9 31L6 34L1 37L9 39C11 42 15 44 19 44C23 44 26 42 27 40Z' },
  // The ear and the tongue.
  { d: 'M21 23L23 16L28 24Z' },
  { d: 'M7 32C4 32 1 33 0 35C3 35 6 34 8 34Z' },
];

/** The emu, proper: brown plumage, a blue-grey neck, dark legs and beak. */
const emu: Art = [
  // Legs.
  { d: 'M50 62L55 62L53 80L55 93L46 96L46 93L50 91L49 80Z', fill: '#3d3a36' },
  { d: 'M62 62L67 62L68 80L72 93L63 96L63 93L67 91L64 80Z', fill: '#3d3a36' },
  // Neck.
  { d: 'M36 52C29 42 27 28 28 14L35 14C35 27 38 37 46 44Z', fill: '#5d7384' },
  // Body, shaggy at the tail.
  { d: 'M35 46C38 33 56 28 72 33C85 37 93 47 92 58C91 64 86 62 84 67C80 64 77 68 72 70C60 73 44 70 37 60C34 55 34 50 35 46Z', fill: '#6f5237' },
  // Head.
  { d: 'M25 9C27 4 34 4 36 9C38 13 35 17 30 17C26 17 24 13 25 9Z', fill: '#5d7384' },
  // Beak.
  { d: 'M26 9L14 13L26 14Z', fill: '#3d3a36' },
  // Eye.
  { d: 'M29 9a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0-3.2 0Z', fill: '#f7cf57' },
];

/** The drawing for one of our own charges, or undefined for a modern charge (see modern.ts). */
export function drawnArt(charge: string, details: { points?: MulletPoints; attitude?: Attitude } = {}): Art | undefined {
  switch (charge) {
    case 'mullet':
      return mullet(details.points ?? 5);
    case 'crescent':
      return crescent;
    case 'roundel':
      return roundel;
    case 'annulet':
      return annulet;
    case 'fleurDeLis':
      return fleurDeLis;
    case 'lion':
      return details.attitude === 'passant' ? lionPassant : lionRampant;
    case 'eagle':
      return eagle;
    case 'emu':
      return emu;
    default:
      return undefined;
  }
}
