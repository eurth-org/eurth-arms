import { pickable } from '../src/arms/catalogue';
import { arrangements, attitudes, cleanArms, divisions, lines, ordinaries, patterns, shapes, type Arms } from '../src/arms/model';
import { tinctureIds } from '../src/arms/tinctures';

export type Rng = () => number;

/** A repeatable random number generator (mulberry32), so random arms can be tested. */
export function seeded(seed: number): Rng {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;

/**
 * Arms with no taste at all: every feature the model has, in any mix, rules of tincture be
 * damned. For testing that whatever the model can hold can be written, read back and drawn.
 */
export function wildArms(rng: Rng): Arms {
  const t = () => pick(rng, tinctureIds);
  const group = () => ({
    charge: rng() < 0.6 ? pick(rng, pickable.slice(0, 7)).id : pick(rng, pickable).id,
    count: 1 + Math.floor(rng() * 6),
    tincture: t(),
    arrangement: pick(rng, arrangements),
    points: pick(rng, [5, 6, 8]),
    attitude: pick(rng, attitudes),
  });
  const kind = pick(rng, ['plain', 'plain', 'divided', 'patterned']);
  const field =
    kind === 'plain'
      ? { kind, tincture: t() }
      : kind === 'divided'
        ? { kind, division: pick(rng, divisions), tinctures: [t(), t(), t()], line: pick(rng, lines) }
        : { kind, pattern: pick(rng, patterns), count: 4 + 2 * Math.floor(rng() * 4), tinctures: [t(), t()] };
  return cleanArms({
    shape: pick(rng, shapes),
    field,
    ordinary: rng() < 0.6 ? { type: pick(rng, ordinaries), tincture: t(), line: pick(rng, lines) } : undefined,
    charges: rng() < 0.7 ? group() : undefined,
    onOrdinary: rng() < 0.4 ? group() : undefined,
    chief: rng() < 0.3 ? { tincture: t(), line: pick(rng, lines) } : undefined,
    onChief: rng() < 0.5 ? group() : undefined,
    bordure: rng() < 0.25 ? { tincture: t(), line: pick(rng, lines) } : undefined,
  });
}
