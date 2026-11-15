// Every figure on the site as a file of its own: /figures/azure-a-bend-or.svg. Made when the
// site is built, from the same blazons the pages show.
import type { APIRoute, GetStaticPaths } from 'astro';
import { allFigures, figureFile, figureSvg, type FigureRef } from '../../lib/figures';

export const getStaticPaths: GetStaticPaths = () => allFigures().map((figure) => ({ params: { file: figureFile(figure.blazon, figure.shape) }, props: { ...figure } }));

export const GET: APIRoute = ({ props }) => {
  const { blazon, shape } = props as FigureRef;
  return new Response(figureSvg(blazon, shape), { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
};
