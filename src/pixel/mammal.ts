/**
 * Shared 32x26 authoring canvas for every mammal-type zodiac sprite
 * (rat, ox, tiger, rabbit, horse, goat, monkey, dog, pig). All animals
 * face right and share the same torso/head/leg anchor coordinates so the
 * walk-cycle rigging in `limbAnimation.ts` lines up consistently; ears,
 * horns, snout, tail and markings are what make each animal distinct -
 * they are drawn deliberately large/high-contrast so they stay readable
 * at the sprite's final on-screen size.
 */
import { Grid, createGrid, fillEllipse, fillRect, fillWedge, setPixel } from "./grid";

export const GRID_W = 32;
export const GRID_H = 26;
export const CELL = 8;

export const TORSO = { cx: 14, cy: 15, rx: 8.5, ry: 5 };
export const HEAD = { cx: 23, cy: 12, r: 4.6 };
export const SNOUT = { cx: 27.6, cy: 13, rx: 2.3, ry: 1.8 };
export const EYE = { x: 24.2, y: 11 };
export const GROUND_Y = 20;
export const FRONT_LEG_X = 20;
export const BACK_LEG_X = 9;

export interface MammalOptions {
  bodyColor: string;
  bellyColor?: string;
  snoutColor?: string;
  eyeColor: string;
  earStyle: "round" | "pointy" | "floppy" | "long" | "horns-curved" | "horns-swept";
  earColor?: string;
  hornColor?: string;
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
    fillEllipse(grid, TORSO.cx - 0.5, TORSO.cy + 2.4, TORSO.rx - 2.5, TORSO.ry - 2, opts.bellyColor);
  }

  // ears/horns (drawn before head so the head circle overlaps their base cleanly)
  drawEars(grid, opts.earStyle, opts.earColor ?? opts.bodyColor, opts.hornColor ?? "#e9e0cb", headCy);

  fillEllipse(grid, HEAD.cx, headCy, HEAD.r, HEAD.r, opts.bodyColor);
  fillEllipse(grid, SNOUT.cx, headCy + (SNOUT.cy - HEAD.cy), SNOUT.rx, SNOUT.ry, opts.snoutColor ?? opts.bodyColor);

  if (opts.drawHeadExtras) opts.drawHeadExtras(grid);
  if (opts.drawMarkings) opts.drawMarkings(grid);
  if (opts.drawTail) opts.drawTail(grid);

  // eye on top, after markings/tail so it's never covered
  setPixel(grid, EYE.x, headCy - 0.5, opts.eyeColor);

  return grid;
}

function drawEars(
  grid: Grid,
  style: MammalOptions["earStyle"],
  earColor: string,
  hornColor: string,
  headCy: number
): void {
  const top = headCy - 8;
  switch (style) {
    case "round":
      fillEllipse(grid, HEAD.cx - 2, top + 2.5, 2.2, 2.4, earColor);
      fillEllipse(grid, HEAD.cx + 3.5, top + 2, 2.2, 2.4, earColor);
      break;
    case "pointy":
      fillWedge(grid, HEAD.cx - 4, top, 3.5, 6, earColor, "up-right");
      fillWedge(grid, HEAD.cx + 2.5, top, 3.5, 6, earColor, "up-left");
      break;
    case "long":
      // rabbit: tall ears reaching all the way to the top of the canvas
      fillRect(grid, HEAD.cx - 3.5, top - 6, 2.4, 11, earColor);
      fillRect(grid, HEAD.cx + 3.5, top - 6, 2.4, 11, earColor);
      fillRect(grid, HEAD.cx - 3.1, top - 4, 1.6, 8, hornColor);
      fillRect(grid, HEAD.cx + 3.9, top - 4, 1.6, 8, hornColor);
      break;
    case "floppy":
      // dog: big ears hanging down past the jaw line
      fillRect(grid, HEAD.cx - 5, top + 3, 2.6, 8, earColor);
      fillRect(grid, HEAD.cx + 4.5, top + 3, 2.6, 8, earColor);
      break;
    case "horns-curved":
      // ox: thick horns curving outward and up from the sides of the head
      fillRect(grid, HEAD.cx - 5.5, top + 4, 2.4, 2.2, hornColor);
      fillRect(grid, HEAD.cx - 6.5, top + 1.5, 2.4, 3, hornColor);
      fillRect(grid, HEAD.cx - 5.5, top - 0.5, 2.4, 2.6, hornColor);
      fillRect(grid, HEAD.cx + 4, top + 3.5, 2.4, 2.2, hornColor);
      fillRect(grid, HEAD.cx + 5, top + 1, 2.4, 3, hornColor);
      fillRect(grid, HEAD.cx + 4.2, top - 1, 2.4, 2.6, hornColor);
      fillEllipse(grid, HEAD.cx - 1.5, top + 2.5, 1.6, 1.8, earColor);
      fillEllipse(grid, HEAD.cx + 3.5, top + 2, 1.6, 1.8, earColor);
      break;
    case "horns-swept":
      // goat: slim horns swept straight back
      fillRect(grid, HEAD.cx - 1, top - 2, 2, 6, hornColor);
      fillRect(grid, HEAD.cx - 2.5, top - 3.5, 2, 3, hornColor);
      fillRect(grid, HEAD.cx + 2.5, top - 1.5, 2, 6, hornColor);
      fillRect(grid, HEAD.cx + 4, top - 3, 2, 3, hornColor);
      fillRect(grid, HEAD.cx - 4.5, top + 4, 2, 4, earColor);
      fillRect(grid, HEAD.cx + 6, top + 3.5, 2, 4, earColor);
      break;
  }
}
