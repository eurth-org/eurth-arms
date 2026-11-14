/**
 * The six shields. Each is an outline (true curves for drawing, a polygon for measuring) and
 * the point everything is built around: where a cross would cross, where a fess would lie.
 * All share one space, 600 by 720, so a design keeps its place when the shape changes.
 */
import { Outline, type Pt } from './geometry';
import type { Shape } from './model';

export const WIDTH = 600;
export const HEIGHT = 720;

export interface Shield {
  /** SVG path data for the outline. */
  d: string;
  /** The same outline as a polygon, clockwise on screen. */
  outline: readonly Pt[];
  /** The middle of the design: the fess point. */
  centre: Pt;
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const L = 30;
const R = 570;
const T = 30;
const B = 690;
const MID = 300;
/** How far a Bézier handle reaches to draw a quarter circle. */
const K = 0.5523;

const outlines: Readonly<Record<Shape, () => { outline: Outline; centre: Pt }>> = {
  // The classic: flat top, straight sides, curving to a point. Named after the clothes iron.
  heater: () => ({
    outline: new Outline()
      .move([L, T])
      .line([R, T])
      .line([R, 330])
      .cubic([R, 540], [420, 645], [MID, B])
      .cubic([180, 645], [L, 540], [L, 330])
      .close(),
    centre: [MID, 300],
  }),
  // Square, with rounded lower corners and a small point at the foot.
  french: () => ({
    outline: new Outline()
      .move([L, T])
      .line([R, T])
      .line([R, 600])
      .quad([R, 655], [515, 655])
      .line([345, 655])
      .quad([312, 658], [MID, B])
      .quad([288, 658], [255, 655])
      .line([85, 655])
      .quad([L, 655], [L, 600])
      .close(),
    centre: [MID, 325],
  }),
  // Square at the top, a half circle at the foot.
  spanish: () => ({
    outline: new Outline()
      .move([L, T])
      .line([R, T])
      .line([R, 420])
      .cubic([R, 420 + 270 * K], [MID + 270 * K, B], [MID, B])
      .cubic([MID - 270 * K, B], [L, 420 + 270 * K], [L, 420])
      .close(),
    centre: [MID, 325],
  }),
  // Baroque: pointed ears, a scalloped top, a waist, and a full belly.
  polish: () => ({
    outline: new Outline()
      .move([L, T])
      .quad([150, 105], [MID, 52])
      .quad([450, 105], [R, T])
      .quad([505, 150], [548, 300])
      .cubic([585, 470], [450, 640], [MID, B])
      .cubic([150, 640], [15, 470], [52, 300])
      .quad([95, 150], [L, T])
      .close(),
    centre: [MID, 345],
  }),
  // A diamond: by custom, the shield of women's arms.
  lozenge: () => ({
    outline: new Outline().move([MID, T]).line([R, 360]).line([MID, B]).line([L, 360]).close(),
    centre: [MID, 360],
  }),
  // A disc: arms as a seal or a badge shows them.
  roundel: () => ({
    outline: new Outline()
      .move([MID, 90])
      .cubic([MID + 270 * K, 90], [R, 360 - 270 * K], [R, 360])
      .cubic([R, 360 + 270 * K], [MID + 270 * K, 630], [MID, 630])
      .cubic([MID - 270 * K, 630], [L, 360 + 270 * K], [L, 360])
      .cubic([L, 360 - 270 * K], [MID - 270 * K, 90], [MID, 90])
      .close(),
    centre: [MID, 360],
  }),
};

const made = new Map<Shape, Shield>();

export function shield(shape: Shape): Shield {
  let found = made.get(shape);
  if (!found) {
    const { outline, centre } = outlines[shape]();
    const xs = outline.points.map((p) => p[0]);
    const ys = outline.points.map((p) => p[1]);
    found = { d: outline.d, outline: outline.points, centre, top: Math.min(...ys), bottom: Math.max(...ys), left: Math.min(...xs), right: Math.max(...xs) };
    made.set(shape, found);
  }
  return found;
}
