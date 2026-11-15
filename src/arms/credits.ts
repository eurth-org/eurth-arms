/**
 * Whose work Arms draws with, in one place, for the site's footer and its credits. The lions
 * are Sodacan's, under CC BY-SA 3.0: that licence asks for the author's name, a link to the
 * licence and a note of changes wherever a lion is shown or saved, and asks that pictures
 * made with one are shared on the same terms. The renderer writes that credit into every
 * picture that uses a beast (render.ts, creditLine); the maker must show it beside the
 * download buttons too.
 */
import { beastCredits } from './beasts/list';

export interface ArtCredit {
  /** What it is, for the sentence: "Lions". */
  what: string;
  author: string;
  licence: string;
  /** Empty for public-domain work. */
  licenceUrl: string;
  /** Where the work can be found. */
  source: string;
}

export const artCredits: readonly ArtCredit[] = [
  {
    what: 'Lions',
    author: 'Sodacan',
    licence: 'CC BY-SA 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    source: 'https://commons.wikimedia.org/wiki/User:Sodacan',
  },
  {
    what: 'Eagle displayed',
    author: 'Madboy74',
    licence: 'Public domain',
    licenceUrl: '',
    source: beastCredits['eagle-displayed']?.source ?? '',
  },
  {
    what: 'Eagle rising',
    author: 'Arthur Charles Fox-Davies, A Complete Guide to Heraldry (1909)',
    licence: 'Public domain',
    licenceUrl: '',
    source: beastCredits['eagle-rising']?.source ?? '',
  },
  {
    what: 'Modern charges',
    author: 'Font Awesome Free',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    source: 'https://fontawesome.com',
  },
];

/** The footer's line of credit for the pictures, in words. */
export const footerCredit =
  'Lions by Sodacan (CC BY-SA 3.0) and eagles by Madboy74 and after A. C. Fox-Davies (public domain), from Wikimedia Commons, recoloured. Arms with a lion in them carry the lion’s licence: credit Sodacan and share them on the same terms.';
