/**
 * Our own charges, drawn here as path data: the mullet, crescent, roundel, annulet,
 * fleur-de-lis and one emu. (The lions and eagles are heraldic art from Wikimedia Commons:
 * see beasts/.) Each is drawn in a
 * box 100 units square, to sit inside the circle that touches its sides, and each is flat:
 * one tincture, no outline, no shading, as arms were painted on shields. Beasts face dexter
 * (the viewer's left), as heraldic beasts do.
 *
 * A drawing is a list of parts, painted one over the other. A part with no colour of its own
 * takes the charge's tincture; only the emu, which comes "proper", brings its own.
 */
import type { MulletPoints } from './model';

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
export function drawnArt(charge: string, details: { points?: MulletPoints } = {}): Art | undefined {
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
    case 'emu':
      return emu;
    default:
      return undefined;
  }
}
