/**
 * The glossary: every term the maker and the guide use. Each entry's id is its anchor on the
 * glossary page (/glossary/#fess); a figure is a blazon the engine draws beside the definition.
 */
export interface GlossaryEntry {
  /** The anchor: lower case, hyphens. */
  id: string;
  term: string;
  /** Plain text, one to three sentences. */
  definition: string;
  /** A blazon to draw, exactly as the maker writes it. */
  figure?: string;
  /** Related entries, by id. */
  see?: string[];
}

// Not written yet: see roadmap.md, "Where to pick up".
export const glossary: readonly GlossaryEntry[] = [];
