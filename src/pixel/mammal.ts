/**
 * Shared 32x26 authoring canvas for every mammal-type zodiac sprite
 * (rat, ox, tiger, rabbit, horse, goat, monkey, dog, pig). All animals
 * face right and share the same torso/head/leg anchor coordinates so the
 * walk-cycle rigging in `limbAnimation.ts` lines up consistently; ears,
 * horns, snout, tail and markings are what make each animal distinct -
 * they are drawn deliberately large/high-contrast so they stay readable
 * at the sprite's final on-screen size.
 */
import { Grid, createGrid, fillEllipse, fillRect, setPixel } from "./grid";

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
  headColor?: string;
  bellyColor?: string;
  snoutColor?: string;
  eyeColor: string;
  earStyle:
    | "round"
    | "pointy"
    | "floppy"
    | "long"
    | "horns-curved"
    | "horns-swept"
    | "big-round"
    | "small-pointed"
    | "small-tuft";
  earColor?: string;
  hornColor?: string;
  drawTail?: (grid: Grid) => void;
  drawMarkings?: (grid: Grid) => void;
  drawHeadExtras?: (grid: Grid) => void;
  headOffsetY?: number;
  /** Scales the default snout ellipse (1 = default size); use e.g. 0.6 for a smaller/cuter nose. */
  snoutScale?: number;
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

  fillEllipse(grid, HEAD.cx, headCy, HEAD.r, HEAD.r, opts.headColor ?? opts.bodyColor);
  const snoutScale = opts.snoutScale ?? 1;
  fillEllipse(
    grid,
    SNOUT.cx,
    headCy + (SNOUT.cy - HEAD.cy),
    SNOUT.rx * snoutScale,
    SNOUT.ry * snoutScale,
    opts.snoutColor ?? opts.bodyColor
  );

  if (opts.drawHeadExtras) opts.drawHeadExtras(grid);
  if (opts.drawMarkings) opts.drawMarkings(grid);
  if (opts.drawTail) opts.drawTail(grid);

  // eye on top, after markings/tail so it's never covered
  setPixel(grid, EYE.x, headCy - 0.5, opts.eyeColor);

  return grid;
}

/**
 * Draws one triangular ear as 4 explicit stacked rects tapering to a point - deliberately not using
 * the generic `fillWedge` helper, which produces a distorted spike ("unicorn horn") at these larger
 * ear sizes. `leanToward` bends the tip left/right so a left/right ear pair angles in toward center.
 */
function drawTaperedEar(
  grid: Grid,
  baseX: number,
  baseY: number,
  width: number,
  height: number,
  color: string,
  leanToward: "left" | "right"
): void {
  const rows = 4;
  const rowH = height / rows;
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const rowW = Math.max(0.5, width * (1 - t * 0.85));
    const rowY = baseY + height - (i + 1) * rowH;
    const offset = leanToward === "right" ? width - rowW : 0;
    fillRect(grid, baseX + offset, rowY, rowW, rowH + 0.1, color);
  }
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
    case "big-round":
      // monkey: larger ears set further out from the head
      fillEllipse(grid, HEAD.cx - 3, top + 3, 2.8, 3, earColor);
      fillEllipse(grid, HEAD.cx + 4.5, top + 2.5, 2.8, 3, earColor);
      break;
    case "small-pointed":
      // pig: small round ears close to the head
      fillEllipse(grid, HEAD.cx - 2.2, top + 4, 1.7, 1.9, earColor);
      fillEllipse(grid, HEAD.cx + 3.3, top + 3.6, 1.7, 1.9, earColor);
      break;
    case "small-tuft": {
      // ox/cow: two small pointy horns poking up clearly above the top of the head
      const hbx = HEAD.cx - 2.2;
      const hby = top + 0.5;
      drawTaperedEar(grid, hbx, hby, 1.7, 4.2, hornColor, "right");
      drawTaperedEar(grid, hbx + 3.2, hby, 1.7, 4.2, hornColor, "left");
      break;
    }
    case "pointy":
      drawTaperedEar(grid, HEAD.cx - 4.2, top, 3.4, 6, earColor, "right");
      drawTaperedEar(grid, HEAD.cx + 0.8, top, 3.4, 6, earColor, "left");
      break;
    case "long":
      // rabbit: white outer ear stays clearly visible with a narrower pink inner-ear stripe
      fillRect(grid, HEAD.cx - 3.6, top - 2, 2.8, 7, earColor);
      fillRect(grid, HEAD.cx + 3.4, top - 2, 2.8, 7, earColor);
      fillRect(grid, HEAD.cx - 3, top - 0.5, 1.2, 4.6, hornColor);
      fillRect(grid, HEAD.cx + 4, top - 0.5, 1.2, 4.6, hornColor);
      break;
    case "floppy":
      // dog: big ears hanging down past the jaw line
      fillRect(grid, HEAD.cx - 5, top + 3, 2.6, 8, earColor);
      fillRect(grid, HEAD.cx + 4.5, top + 3, 2.6, 8, earColor);
      break;
    case "horns-curved": {
      // ox: thick horns curving outward and up in a visible hook, not just a straight stack
      const bx = HEAD.cx - 4.5;
      const by = top + 5;
      fillRect(grid, bx, by, 2.6, 2.4, hornColor);
      fillRect(grid, bx - 1.2, by - 2, 2.6, 2.4, hornColor);
      fillRect(grid, bx - 1.8, by - 4, 2.4, 2.2, hornColor);
      fillRect(grid, bx - 1, by - 5.8, 2, 2, hornColor);
      const bx2 = HEAD.cx + 3.5;
      fillRect(grid, bx2, by - 0.5, 2.6, 2.4, hornColor);
      fillRect(grid, bx2 + 1.2, by - 2.5, 2.6, 2.4, hornColor);
      fillRect(grid, bx2 + 1.6, by - 4.5, 2.4, 2.2, hornColor);
      fillRect(grid, bx2 + 0.8, by - 6.2, 2, 2, hornColor);
      fillEllipse(grid, HEAD.cx - 1.5, top + 2.5, 1.6, 1.8, earColor);
      fillEllipse(grid, HEAD.cx + 3.5, top + 2, 1.6, 1.8, earColor);
      break;
    }
    case "horns-swept": {
      // goat: horns curving up and sweeping back, like a ram
      const bx = HEAD.cx - 1;
      const by = top + 1;
      fillRect(grid, bx, by, 2, 2.2, hornColor);
      fillRect(grid, bx - 1.4, by - 1.8, 2, 2.2, hornColor);
      fillRect(grid, bx - 1.8, by - 3.8, 1.8, 2, hornColor);
      fillRect(grid, bx - 1.2, by - 5.4, 1.6, 1.8, hornColor);
      const bx2 = HEAD.cx + 2.5;
      fillRect(grid, bx2, by - 0.5, 2, 2.2, hornColor);
      fillRect(grid, bx2 + 1.6, by - 2.2, 2, 2.2, hornColor);
      fillRect(grid, bx2 + 2.2, by - 4.2, 1.8, 2, hornColor);
      fillRect(grid, bx2 + 1.8, by - 5.8, 1.6, 1.8, hornColor);
      fillRect(grid, HEAD.cx - 4.5, top + 4, 2, 4, earColor);
      fillRect(grid, HEAD.cx + 6, top + 3.5, 2, 4, earColor);
      break;
    }
  }
}