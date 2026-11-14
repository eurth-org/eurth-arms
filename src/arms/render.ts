/**
 * Draws arms as SVG text. One renderer serves the maker's preview, the downloads, the
 * template and guide pages (at build time) and the tests. Only numbers, tincture paints and
 * our own path data reach the markup: nothing typed, linked or loaded is ever written into it
 * except through the blazon and the description, which are escaped.
 *
 * Layers, from the bottom: the field, the ordinary, the charges around it, the charges on it,
 * the chief and its charges, the bordure; all clipped to the shield, whose outline is drawn
 * last.
 */
import { beastCredits, beasts } from './beasts';
import type { BeastCredit } from './beasts/types';
import { blazon } from './blazon';
import { drawnArt } from './charges';
import { describeArms } from './describe';
import { f } from './geometry';
import { bordureInner, chiefPiece, fieldPieces, frameOf, ordinaryPiece, slotsOf, type Slot } from './layout';
import { loopPath, polygonPath } from './lines';
import { cleanArms, type Arms, type ChargeGroup, type Shape } from './model';
import { modernArt } from './modern';
import { HEIGHT, shield, WIDTH } from './shapes';
import { tincture, type Tincture } from './tinctures';

export { HEIGHT, WIDTH };

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const OUTLINE = '#030303';

/** An ermine spot: three dots over a tail. */
const SPOT = 'M-3.4 -15a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0-6.8 0ZM-10.9 -8a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0-6.8 0ZM4.1 -8a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0-6.8 0ZM0-6C3 4 9 13 12 20L4 16L0 25L-4 16L-12 20C-9 13-3 4 0-6Z';

/** The furs are patterns laid over a ground; each is defined once per picture, and only if used. */
const furs: Readonly<Record<string, () => string>> = {
  ermine: () => {
    const t = tincture('ermine');
    return (
      `<pattern id="arms-ermine" width="84" height="100" patternUnits="userSpaceOnUse"><rect width="84" height="100" fill="${t.paint}"/>` +
      `<path transform="translate(21 28)" d="${SPOT}" fill="${t.second}"/><path transform="translate(63 78)" d="${SPOT}" fill="${t.second}"/></pattern>`
    );
  },
  // Vair: rows of bells, each row set half a bell along from the one above.
  vair: () => {
    const t = tincture('vair');
    return (
      `<pattern id="arms-vair" width="60" height="120" patternUnits="userSpaceOnUse"><rect width="60" height="120" fill="${t.paint}"/>` +
      `<path d="M0 60L15 45V15L30 0L45 15V45L60 60ZM-30 120L-15 105V75L0 60L15 75V105L30 120ZM30 120L45 105V75L60 60L75 75V105L90 120Z" fill="${t.second}"/></pattern>`
    );
  },
};

/** The beast drawing for a charge in its attitude: "lion-passant-guardant". */
const beastId = (group: ChargeGroup): string => `${group.charge}-${(group.attitude ?? '').replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/** The drawings from Wikimedia Commons a design uses, for giving credit where it is shown or saved. */
export function creditsFor(design: Arms): BeastCredit[] {
  const arms = cleanArms(design);
  const found = new Map<string, BeastCredit>();
  for (const group of [arms.charges, arms.onOrdinary, arms.onChief]) {
    const credit = group ? beastCredits[beastId(group)] : undefined;
    if (credit) found.set(credit.title, credit);
  }
  return [...found.values()];
}

/** One line of credit for a picture: who drew its beasts, and under which licence. */
export function creditLine(design: Arms): string {
  return creditsFor(design)
    .map((c) => `"${c.title.replace(/\.svg$/, '')}" by ${c.author}, from Wikimedia Commons, ${c.licence === 'Public domain' ? 'public domain' : `${c.licence} (${c.licenceUrl})`}, recoloured.`)
    .join(' ');
}

class Picture {
  private used = new Set<string>();
  private beasts = new Map<string, string>();

  /**
   * A beast in a tincture, defined once and used wherever it stands. Its id says what it is
   * and how it is painted, so the same id on another picture on the page is the same drawing.
   */
  beast(id: string, worn: Tincture): string {
    const key = `arms-${id}-${worn}`;
    if (!this.beasts.has(key)) {
      const roles: Record<string, string> = {
        B: this.paint(worn),
        // Claws, teeth and eyes stay pale; the tongue is red, or blue on a red beast, as heralds paint it.
        W: worn === 'argent' ? '#ffffff' : tincture('argent').paint,
        T: worn === 'gules' ? tincture('azure').paint : tincture('gules').paint,
        // A black beast is drawn with pale lines, or nothing of it could be seen.
        K: worn === 'sable' ? '#b9b9b9' : OUTLINE,
      };
      const body = beasts[id]!.body.replace(/%([BWTK])/g, (_, role: string) => roles[role]!);
      this.beasts.set(key, `<g id="${key}" fill="none" fill-rule="evenodd" stroke="${roles.K}" stroke-width="2.5" stroke-linejoin="round">${body}</g>`);
    }
    return key;
  }

  get linked(): boolean {
    return this.beasts.size > 0;
  }

  paint(t: Tincture): string {
    if (t === 'proper') return OUTLINE;
    if (t in furs) {
      this.used.add(t);
      return `url(#arms-${t})`;
    }
    return tincture(t).paint;
  }

  defs(shape: Shape): string {
    const made = [...this.beasts.values()].join('');
    return `<defs><clipPath id="arms-clip-${shape}"><path d="${shield(shape).d}"/></clipPath>${[...this.used].map((fur) => furs[fur]!()).join('')}${made}</defs>`;
  }
}

function chargeSvg(group: ChargeGroup, slots: Slot[], picture: Picture): string {
  const beast = beasts[beastId(group)];
  if (beast) {
    const id = picture.beast(beastId(group), group.tincture);
    return slots
      .map((slot) => {
        // Fitted by its diagonal, and a little over: a beast never fills the corners of its drawing.
        const k = Math.max(0.001, Math.round(((2.5 * slot.r) / Math.hypot(beast.w, beast.h)) * 10000) / 10000);
        const turn = slot.rot ? ` rotate(${f(slot.rot)})` : '';
        return `<use href="#${id}" xlink:href="#${id}" transform="translate(${f(slot.x)} ${f(slot.y)})${turn} scale(${k}) translate(${f(-beast.w / 2)} ${f(-beast.h / 2)})"/>`;
      })
      .join('');
  }
  const drawn = drawnArt(group.charge, group);
  const icon = drawn ? undefined : modernArt(group.charge);
  if (!drawn && !icon) return '';
  const fill = picture.paint(group.tincture);
  // One drawing, however many times the charge appears, would need an id; ids clash when
  // several pictures share a page, so each charge carries its own paths.
  const parts = drawn
    ? drawn.map((part) => `<path d="${part.d}"${part.fill ? ` fill="${part.fill}"` : ''}${part.evenodd ? ' fill-rule="evenodd"' : ''}/>`).join('')
    : `<path d="${icon!.d}"/>`;
  return slots
    .map((slot) => {
      // Our own charges fill a box 100 square; an icon is fitted by its diagonal.
      const [scale, dx, dy] = drawn ? [slot.r / 50, -50, -50] : [(2.2 * slot.r) / Math.hypot(icon!.w, icon!.h), -icon!.w / 2, -icon!.h / 2];
      const turn = slot.rot ? ` rotate(${f(slot.rot)})` : '';
      const k = Math.max(0.001, Math.round(scale * 10000) / 10000);
      return `<g transform="translate(${f(slot.x)} ${f(slot.y)})${turn} scale(${k}) translate(${f(dx)} ${f(dy)})" fill="${fill}">${parts}</g>`;
    })
    .join('');
}

export interface RenderOptions {
  /** Leave out the title and description, for a picture that is labelled where it is shown. */
  bare?: boolean;
}

/** The arms as a complete SVG document, 600 by 720. */
export function armsSvg(design: Arms, options: RenderOptions = {}): string {
  const arms = cleanArms(design);
  const s = shield(arms.shape);
  const picture = new Picture();
  const everything = `<rect width="${WIDTH}" height="${HEIGHT}"`;
  let body = '';

  if (arms.field.kind === 'plain') {
    body += `${everything} fill="${picture.paint(arms.field.tincture)}"/>`;
  } else {
    const field = arms.field;
    const { base, pieces } = fieldPieces(field, frameOf(arms), s);
    const line = field.kind === 'divided' ? field.line : 'straight';
    body += `${everything} fill="${picture.paint(field.tinctures[base]!)}"/>`;
    // Pieces of one tincture go into one path.
    for (const index of [...new Set(pieces.map((piece) => piece.tincture))]) {
      const d = pieces.filter((piece) => piece.tincture === index).map((piece) => polygonPath(piece.polygon, line, piece.fancy)).join('');
      body += `<path d="${d}" fill="${picture.paint(field.tinctures[index]!)}"/>`;
    }
  }

  const slots = slotsOf(arms);
  const ordinary = ordinaryPiece(arms);
  if (arms.ordinary && ordinary) body += `<path d="${polygonPath(ordinary.polygon, arms.ordinary.line, ordinary.fancy)}" fill="${picture.paint(arms.ordinary.tincture)}"/>`;
  if (arms.charges) body += chargeSvg(arms.charges, slots.field, picture);
  if (arms.onOrdinary) body += chargeSvg(arms.onOrdinary, slots.ordinary, picture);

  const chief = chiefPiece(arms);
  if (arms.chief && chief) body += `<path d="${polygonPath(chief.polygon, arms.chief.line, chief.fancy)}" fill="${picture.paint(arms.chief.tincture)}"/>`;
  if (arms.onChief) body += chargeSvg(arms.onChief, slots.chief, picture);

  if (arms.bordure) {
    const inner = loopPath(bordureInner(arms), arms.bordure.line);
    body += `<path fill-rule="evenodd" d="M-80-80H680V800H-80Z${inner}" fill="${picture.paint(arms.bordure.tincture)}"/>`;
  }

  const text = blazon(arms);
  const label = options.bare ? ' aria-hidden="true"' : ` role="img" aria-label="${esc(text)}"`;
  // A saved picture says who drew its beasts: their licence asks for it.
  const credit = creditLine(arms);
  const words = options.bare ? '' : `<title>${esc(text)}</title><desc>${esc(describeArms(arms))}${credit ? ` ${esc(credit)}` : ''}</desc>`;
  const defs = picture.defs(arms.shape);
  const xlink = picture.linked ? ' xmlns:xlink="http://www.w3.org/1999/xlink"' : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg"${xlink} viewBox="0 0 ${WIDTH} ${HEIGHT}"${label}>${words}${defs}` +
    `<g clip-path="url(#arms-clip-${arms.shape})">${body}</g>` +
    `<path d="${s.d}" fill="none" stroke="${OUTLINE}" stroke-width="6" stroke-linejoin="round"/></svg>`
  );
}
