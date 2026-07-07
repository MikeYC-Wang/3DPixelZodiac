/**
 * Shared 32x22 authoring canvas for every mammal-type zodiac sprite
 * (rat, ox, tiger, rabbit, horse, goat, monkey, dog, pig). All animals
 * face right and share the same torso/head/leg anchor coordinates so the
 * walk-cycle rigging in `limbAnimation.ts` lines up consistently; ears,
 * snout, tail and markings are what make each animal distinct.
 */
import { Grid, createGrid, fillEllipse, fillRect, fillWedge, setPixel } from "./grid";

export const GRID_W = 32;
export const GRID_H = 22;
export const CELL = 8;

export const TORSO = { cx: 14, cy: 12, rx: 8, ry: 4.5 };
export const HEAD = { cx: 23, cy: 9, r: 4.3 };
export const SNOUT = { cx: 27.2, cy: 10, rx: 2, ry: 1.6 };
export const EYE = { x: 24, y: 8 };
export const GROUND_Y = 17;
export const FRONT_LEG_X = 20;
export const BACK_LEG_X = 9;

export interface MammalOptions {
  bodyColor: string;
  bellyColor?: string;
  snoutColor?: string;
  eyeColor: string;
  earStyle: "round" | "pointy" | "floppy" | "long";
  earColor?: string;
  drawTail?: (grid: Grid) => void;
  drawMarkings?: (grid: Grid) => void;
  drawHeadExtras?: (grid: Grid) => void;
  headOffsetY?: number;
}

/** Draws the shared torso/head/snout/eye base that every mammal sprite starts from. */
export function buildMammalBody(opts: MammalOptions): Grid {
  const grid = createGrid(GRID_W, GRID_H);
  const headCy = HEAD.cy + (opts.headOffsetY ?? 0);

  fillEllipse(grid, TORSO.cx, TORSO.cy, TORSO.rx, TORSO.ry, opts.bodyColor);
  if (opts.bellyColor) {
    fillEllipse(grid, TORSO.cx - 0.5, TORSO.cy + 2.2, TORSO.rx - 2.5, TORSO.ry - 2, opts.bellyColor);
  }

  // ears (drawn before head so the head circle overlaps their base)
  drawEars(grid, opts.earStyle, opts.earColor ?? opts.bodyColor, headCy);

  fillEllipse(grid, HEAD.cx, headCy, HEAD.r, HEAD.r, opts.bodyColor);
  fillEllipse(grid, SNOUT.cx, headCy + (SNOUT.cy - HEAD.cy), SNOUT.rx, SNOUT.ry, opts.snoutColor ?? opts.bodyColor);

  if (opts.drawHeadExtras) opts.drawHeadExtras(grid);
  if (opts.drawMarkings) opts.drawMarkings(grid);
  if (opts.drawTail) opts.drawTail(grid);

  // eye on top, after markings/tail so it's never covered
  setPixel(grid, EYE.x, headCy - 1, opts.eyeColor);

  return grid;
}

function drawEars(grid: Grid, style: MammalOptions["earStyle"], color: string, headCy: number): void {
  const top = headCy - 7;
  switch (style) {
    case "round":
      fillEllipse(grid, HEAD.cx - 1.5, top + 1.5, 1.7, 1.7, color);
      fillEllipse(grid, HEAD.cx + 3, top + 1.2, 1.7, 1.7, color);
      break;
    case "pointy":
      fillWedge(grid, HEAD.cx - 3, top, 3, 4, color, "up-right");
      fillWedge(grid, HEAD.cx + 2, top, 3, 4, color, "up-left");
      break;
    case "long":
      fillRect(grid, HEAD.cx - 3, top - 2, 2, 6, color);
      fillRect(grid, HEAD.cx + 3, top - 2, 2, 6, color);
      break;
    case "floppy":
      fillRect(grid, HEAD.cx - 4, top + 2, 2, 5, color);
      fillRect(grid, HEAD.cx + 4, top + 2, 2, 5, color);
      break;
  }
}
