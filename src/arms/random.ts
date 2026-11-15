/**
 * Random arms that look like arms: most are simple, most carry one of the old charges, and
 * every one of them respects the rule of tincture. Works in Simple mode's terms, so a random
 * design can be adjusted with the same few choices.
 */
import { pickable } from './catalogue';
import { checkTincture, fixAll } from './check';
import { attitudesFor, shapes, type Arms } from './model';
import { cleanSimple, fieldPresets, fromSimple, ordinaryPresets, toSimple, type Simple } from './simple';
import { colours, metals, tinctureClass, type TinctureId } from './tinctures';

export type Rng = () => number;

const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;

/** A choice by weight: [value, how often]. */
function weighted<T>(rng: Rng, options: readonly (readonly [T, number])[]): T {
  const total = options.reduce((sum, [, weight]) => sum + weight, 0);
  let at = rng() * total;
  for (const [value, weight] of options) {
    at -= weight;
    if (at < 0) return value;
  }
  return options[options.length - 1]![0];
}

const classic = pickable.filter((c) => c.kind === 'drawn');
const modern = pickable.filter((c) => c.kind === 'modern');

/** A tincture that may lie on a ground of these tinctures, other than those already taken. */
function onTopOf(rng: Rng, ground: TinctureId[], taken: TinctureId[] = []): TinctureId {
  const classes = new Set(ground.map(tinctureClass));
  const pool = classes.size > 1 ? [...metals, ...colours] : classes.has('metal') ? colours : classes.has('colour') ? metals : [...metals, ...colours];
  const free = pool.filter((t) => !ground.includes(t) && !taken.includes(t));
  return pick(rng, free.length ? free : pool);
}

export function randomSimple(rng: Rng = Math.random): Simple {
  const field = weighted(rng, [
    ['plain', 58],
    ...fieldPresets.filter((p) => p.id !== 'plain').map((p) => [p.id, p.uses === 3 ? 1.5 : p.id === 'chequy' || p.id === 'bendy' ? 2 : 4] as const),
  ]);
  const uses = fieldPresets.find((p) => p.id === field)!.uses;

  // A field of one tincture is now and then a fur; a parted field pairs a metal with a colour
  // more often than not, as real arms do.
  const first = uses === 1 && rng() < 0.07 ? pick(rng, ['ermine', 'vair'] as const) : pick(rng, [...metals, ...colours]);
  const second = rng() < 0.75 ? onTopOf(rng, [first]) : pick(rng, [...metals, ...colours].filter((t) => t !== first));
  const third = pick(rng, [...metals, ...colours].filter((t) => t !== first && t !== second));
  const ground = [first, second, third].slice(0, uses);

  let ordinary = weighted(rng, [['none', 40], ...ordinaryPresets.filter((p) => p.id !== 'none').map((p) => [p.id, p.id === 'pile' ? 3 : 7] as const)]);
  let charge = rng() < 0.72 ? (rng() < 0.74 ? pick(rng, classic).id : pick(rng, modern).id) : 'none';
  // Arms need something on them: a bare field gets a charge.
  if (ordinary === 'none' && charge === 'none' && field === 'plain') charge = pick(rng, classic).id;
  // A busy field carries less.
  if (uses > 1 && ordinary !== 'none' && charge !== 'none' && rng() < 0.6) ordinary = 'none';

  const ordinaryTincture = rng() < 0.06 ? 'ermine' : onTopOf(rng, ground);
  const simple: Simple = {
    shape: weighted(rng, shapes.map((shape) => [shape, shape === 'heater' ? 10 : 2] as const)),
    field,
    tinctures: [first, second, third],
    ordinary,
    ordinaryTincture,
    charge,
    count: weighted(rng, [[1, 50], [3, 36], [2, 14]]),
    chargeTincture: onTopOf(rng, ground, ordinary === 'none' ? [] : [ordinaryTincture]),
  };
  const stances = attitudesFor(charge);
  // Lions are mostly rampant and eagles mostly displayed; the other attitudes turn up now and then.
  if (stances.length) simple.attitude = rng() < 0.55 ? stances[0] : pick(rng, stances);

  // Whatever chance let through, the rule of tincture has the last word.
  const arms = fromSimple(simple);
  return checkTincture(arms).status === 'broken' ? (toSimple(fixAll(arms)) ?? cleanSimple(simple)) : (toSimple(arms) ?? cleanSimple(simple));
}

/** Random arms, as full arms. */
export const randomArms = (rng: Rng = Math.random): Arms => fromSimple(randomSimple(rng));
