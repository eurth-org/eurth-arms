/**
 * The beasts that are ready to draw. The drawings are large (about 450 KB between them), so
 * the renderer doesn't carry them: it draws whichever are registered here. The build and the
 * tests register them all at once by importing ./index; the browser fetches one when a design
 * first needs it, with loadBeast() from ./lazy.
 */
import type { BeastArt } from './types';

const ready = new Map<string, BeastArt>();

export const beastArt = (id: string): BeastArt | undefined => ready.get(id);

export function registerBeast(id: string, art: BeastArt): void {
  ready.set(id, art);
}
