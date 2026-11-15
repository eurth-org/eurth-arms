/**
 * The Eurth profile's "arms" section: what Arms writes into <nation>.eurth.json, and how it
 * reads its own section back. The section holds the blazon, the design's link (which brings
 * the whole design back), the picture as SVG, a plain-word summary and the time. Arms owns
 * this section and nothing else: the site hands these functions to @eurth/profile's
 * setSection and getSection, which leave every other section alone.
 *
 * A loaded file is someone else's input. Reading a section trusts nothing in it: the link is
 * opened only if it is one of ours, and the blazon is parsed like any typed blazon.
 */
import { blazon } from './blazon';
import { describeArms } from './describe';
import { expand, openLink } from './link';
import { cleanArms, type Arms } from './model';
import { armsSvg } from './render';

/** The limits the profile's schema sets. */
export const LIMITS = { link: 4000, summary: 600, svg: 524_288, blazon: 400 } as const;

/** Where Arms lives: the only address a section's link is opened from. */
export const HOME = 'https://arms.eurth.org';

export interface ArmsSection {
  link?: string;
  summary?: string;
  updated?: string;
  svg?: string;
  blazon?: string;
  /** Not in the schema's short list, and allowed by it: the shield's shape, which no blazon names. */
  shape?: string;
  [key: string]: unknown;
}

/**
 * The section for a design. `link` is the design's share link, made by the site; `previous`
 * is the section already in the file, whose unknown keys are kept in case a later version of
 * Arms put them there.
 */
export function toSection(design: Arms, link: string, previous: unknown = {}, now: Date = new Date()): ArmsSection {
  const arms = cleanArms(design);
  const kept = typeof previous === 'object' && previous !== null && !Array.isArray(previous) ? (previous as ArmsSection) : {};
  const section: ArmsSection = { ...kept, summary: describeArms(arms).slice(0, LIMITS.summary), updated: now.toISOString(), blazon: blazon(arms).slice(0, LIMITS.blazon), shape: arms.shape };
  if (link.startsWith('https://') && link.length <= LIMITS.link) section.link = link;
  else delete section.link;
  const svg = armsSvg(arms);
  if (svg.length <= LIMITS.svg) section.svg = svg;
  else delete section.svg;
  return section;
}

/**
 * The design a section holds, or undefined if it holds none that can be read. The link is
 * tried first, since it carries everything; then the blazon, with the shape beside it.
 * `decode` turns the link's ?d= value into its state (@eurth/style's decodeState does).
 */
export function fromSection(section: unknown, decode: (value: string) => unknown): Arms | undefined {
  if (typeof section !== 'object' || section === null || Array.isArray(section)) return undefined;
  const { link, blazon: text, shape } = section as ArmsSection;

  if (typeof link === 'string' && link.length <= LIMITS.link) {
    try {
      const url = new URL(link);
      if (url.origin === HOME) {
        const typed = url.searchParams.get('blazon');
        const packed = url.searchParams.get('d');
        if (typed) {
          const opened = openLink({ blazon: typed, shape: url.searchParams.get('shape') });
          if (!opened.problem) return opened.arms;
        } else if (packed) {
          const state = decode(packed);
          if (state !== null && state !== undefined) return expand(state);
        } else if (typeof text !== 'string') {
          // The plain address is the default arms.
          return expand({});
        }
      }
    } catch {
      // Not a link at all: fall through to the blazon.
    }
  }

  if (typeof text === 'string' && text.length <= LIMITS.blazon) {
    const opened = openLink({ blazon: text, shape: typeof shape === 'string' ? shape : null });
    if (!opened.problem) return opened.arms;
  }
  return undefined;
}
