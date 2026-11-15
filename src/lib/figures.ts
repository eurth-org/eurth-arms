/**
 * The pictures on the guide, glossary and template pages. Each is a blazon, drawn by the engine
 * when the site is built and written to /figures/ as a file of its own, named after the blazon.
 * A page then shows it as an ordinary image, which the browser can load when it scrolls into
 * view and keep for next time. Build time only.
 */
import '../arms/beasts';
import { describeArms } from '../arms/describe';
import type { Arms, Shape } from '../arms/model';
import { parseBlazon } from '../arms/parse';
import { armsSvg, HEIGHT, WIDTH } from '../arms/render';
import { templates } from '../arms/templates';
import { glossary } from '../content/glossary';
import { guidePages } from './guide';

export { HEIGHT, WIDTH };

/** The arms a figure shows. A figure's blazon is ours, so one that can't be read is a mistake in the content: the build stops. */
export function figureArms(blazon: string, shape: Shape = 'heater'): Arms {
  const result = parseBlazon(blazon, shape);
  if (!result.ok) throw new Error(`A figure's blazon can't be read: "${blazon}": ${result.problem.message}`);
  return result.arms;
}

/** A figure's file name, without its ending: the blazon in lower case and hyphens, and the shield if it isn't the usual one. */
export function figureFile(blazon: string, shape: Shape = 'heater'): string {
  const words = blazon
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return shape === 'heater' ? words : `${words}-on-a-${shape}`;
}

export const figureSrc = (blazon: string, shape: Shape = 'heater'): string => `/figures/${figureFile(blazon, shape)}.svg`;

/** What a figure's image says to someone who can't see it. */
export const figureAlt = (blazon: string, shape: Shape = 'heater'): string => describeArms(figureArms(blazon, shape));

export const figureSvg = (blazon: string, shape: Shape = 'heater'): string => armsSvg(figureArms(blazon, shape));

export interface FigureRef {
  blazon: string;
  shape: Shape;
}

/** Every figure the site shows, once each. */
export function allFigures(): FigureRef[] {
  const list: FigureRef[] = [
    ...guidePages.flatMap((page) => page.blocks.flatMap((block) => (block.type === 'figures' ? block.items.map(({ blazon, shape }) => ({ blazon, shape })) : []))),
    ...glossary.flatMap((entry) => (entry.figure ? [{ blazon: entry.figure, shape: entry.shape ?? ('heater' as Shape) }] : [])),
    ...templates.map(({ blazon, shape }) => ({ blazon, shape })),
  ];
  const seen = new Set<string>();
  return list.filter((figure) => {
    const file = figureFile(figure.blazon, figure.shape);
    if (seen.has(file)) return false;
    seen.add(file);
    return true;
  });
}
