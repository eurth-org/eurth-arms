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
  // The tail: up behind the back, curling over, with a tuft.
  { d: 'M62 66C74 68 86 60 85 48C84 38 76 34 77 26C78 21 83 20 86 23C89 14 81 9 74 13C66 19 68 30 74 40C78 48 74 58 62 60Z' },
  // The body, rearing.
  { d: 'M34 30C44 22 58 28 64 42C70 56 70 68 62 76C54 80 44 72 40 60C36 48 30 38 34 30Z' },
  // The far hind leg, planted.
  { d: 'M54 66C62 70 64 80 60 87L62 93L64 97L44 97L43 92L52 90C54 84 50 78 46 72Z' },
  // The near hind leg, stepping forward.
  { d: 'M46 64C40 72 34 77 27 77L22 73L23 79L17 79L22 83L19 88L27 86C36 86 46 82 54 74Z' },
  // The upper forepaw, raised to strike.
  { d: 'M40 33C32 31 22 28 14 25L10 20L11 27L5 27L10 31L6 35L14 35C22 38 32 41 40 43Z' },
  // The lower forepaw.
  { d: 'M42 45C34 47 26 49 18 49L13 45L14 51L8 52L14 56L11 61L19 58C28 58 36 56 45 54Z' },
  // The head and mane.
  { d: 'M42 31C35 32 28 28 26 21C24 13 29 6 37 5C46 4 53 11 52 20C51 26 48 30 42 31Z' },
  // The ear.
  { d: 'M40 7L45 0L48 9Z' },
  // The open jaws.
  { d: 'M29 14L15 14L21 19L14 23L26 26L32 21Z' },
];

const lionPassant: Art = [
  // The tail, curved over the back.
  { d: 'M80 44C89 40 95 32 93 24C92 18 87 16 83 19C81 11 89 7 95 12C101 18 101 34 93 44C89 50 85 52 80 52Z' },
  // The body, level.
  { d: 'M20 38C34 32 62 32 78 38C86 44 86 58 78 62C62 67 36 66 24 61C16 55 15 45 20 38Z' },
  // The far foreleg, down.
  { d: 'M32 58L44 60L42 79L45 86L30 86L29 81L34 79Z' },
  // The near foreleg, raised.
  { d: 'M27 55C22 60 16 62 10 60L5 56L6 62L1 64L6 67L4 72L12 69C20 69 28 66 36 60Z' },
  // The hind legs, striding.
  { d: 'M60 60L72 62L68 79L71 86L56 86L55 81L61 79Z' },
  { d: 'M72 56C82 58 87 66 84 75L87 86L72 86L71 81L77 79C78 72 75 66 68 62Z' },
  // The head and mane.
  { d: 'M26 46C17 47 9 42 8 33C7 24 13 17 22 17C31 17 37 24 36 33C35 41 32 45 26 46Z' },
  // The ear.
  { d: 'M23 18L27 10L31 19Z' },
  // The open jaws.
  { d: 'M10 27L0 28L4 32L0 36L9 38L15 33Z' },
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
