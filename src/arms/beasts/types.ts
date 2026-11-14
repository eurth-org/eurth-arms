/**
 * A beast drawn by someone else: heraldic art from Wikimedia Commons, reduced by
 * tools/beasts.py to paths and groups. The body is an SVG fragment in which four roles stand
 * in for colours, so the renderer can paint the beast in any tincture:
 * %B the body, %W the claws, teeth and eyes, %T the tongue, %K the outline.
 */
export interface BeastArt {
  /** The size of the drawing the fragment was made in. */
  w: number;
  h: number;
  body: string;
}

/** Who drew it, and the terms it is used on. */
export interface BeastCredit {
  /** The file's name on Wikimedia Commons. */
  title: string;
  /** Its page there. */
  source: string;
  author: string;
  licence: string;
  /** Empty for public-domain work. */
  licenceUrl: string;
}
