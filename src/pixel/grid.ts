/**
 * Minimal pixel-grid primitives shared by every zodiac animal sprite.
 *
 * A grid is a 2D array of color-key strings (or null for "empty/transparent").
 * Animals are authored as a handful of filled ellipses/rects (torso, head,
 * ears, markings, ...) and then run through `outlineGrid`, which grows a
 * 1px outline ring around the silhouette automatically - this keeps each
 * animal's source short while still producing a clean retro outlined look.
 *
 * All shape-drawing functions take coordinates in "logical" cell units (the
 * same units used throughout mammal.ts/animals.ts), but internally rasterize
 * at `SCALE`x that resolution - this makes curved edges (ellipses) and the
 * auto-generated outline noticeably crisper/more detailed without requiring
 * every animal's hand-authored coordinates to be rewritten.
 */

export type Grid = (string | null)[][];

export const SCALE = 2;

export function createGrid(width: number, height: number): Grid {
  return Array.from({ length: height * SCALE }, () => Array<string | null>(width * SCALE).fill(null));
}

export function inBounds(grid: Grid, x: number, y: number): boolean {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

/** Sets a single raw (already-scaled) cell. */
function setRaw(grid: Grid, x: number, y: number, color: string): void {
  if (inBounds(grid, x, y)) grid[y][x] = color;
}

/** Sets one logical pixel (fills the full SCALE x SCALE block it maps to). */
export function setPixel(grid: Grid, x: number, y: number, color: string): void {
  fillRect(grid, x, y, 1, 1, color);
}

export function fillRect(
  grid: Grid,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  const sx = Math.round(x * SCALE);
  const sy = Math.round(y * SCALE);
  const sw = Math.max(1, Math.round(w * SCALE));
  const sh = Math.max(1, Math.round(h * SCALE));
  for (let dy = 0; dy < sh; dy++) {
    for (let dx = 0; dx < sw; dx++) {
      setRaw(grid, sx + dx, sy + dy, color);
    }
  }
}

/** Fills an axis-aligned ellipse centered at (cx, cy) with radii (rx, ry), in logical grid cells. */
export function fillEllipse(
  grid: Grid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string
): void {
  const scx = cx * SCALE;
  const scy = cy * SCALE;
  const srx = Math.max(0.5, rx * SCALE);
  const sry = Math.max(0.5, ry * SCALE);
  const minX = Math.floor(scx - srx);
  const maxX = Math.ceil(scx + srx);
  const minY = Math.floor(scy - sry);
  const maxY = Math.ceil(scy + sry);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x + 0.5 - scx) / srx;
      const ny = (y + 0.5 - scy) / sry;
      if (nx * nx + ny * ny <= 1) setRaw(grid, x, y, color);
    }
  }
}

/**
 * Same as `fillEllipse`, but only overwrites cells that are already one of `allowedColors` - use this
 * for decorative markings (spots/patches) so they can never bleed past the base silhouette's edge,
 * regardless of how the marking's own center/radius lines up against the body shape.
 */
export function fillEllipseMasked(
  grid: Grid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
  allowedColors: string[]
): void {
  const allowed = new Set(allowedColors);
  const scx = cx * SCALE;
  const scy = cy * SCALE;
  const srx = Math.max(0.5, rx * SCALE);
  const sry = Math.max(0.5, ry * SCALE);
  const minX = Math.floor(scx - srx);
  const maxX = Math.ceil(scx + srx);
  const minY = Math.floor(scy - sry);
  const maxY = Math.ceil(scy + sry);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x + 0.5 - scx) / srx;
      const ny = (y + 0.5 - scy) / sry;
      if (nx * nx + ny * ny <= 1 && inBounds(grid, x, y)) {
        const current = grid[y][x];
        if (current !== null && allowed.has(current)) setRaw(grid, x, y, color);
      }
    }
  }
}

/** Fills a right triangle-ish wedge; used for ears/horns/spikes. dir controls which corner is pointed. */
export function fillWedge(
  grid: Grid,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  dir: "up" | "up-left" | "up-right" = "up"
): void {
  const steps = Math.max(2, Math.round(h * 2));
  for (let row = 0; row < steps; row++) {
    const t = row / (steps - 1);
    const rowY = y + (h - h * (row / steps));
    let rowW: number;
    let offset: number;
    if (dir === "up") {
      rowW = Math.max(0.5, w * (1 - t));
      offset = (w - rowW) / 2;
    } else if (dir === "up-left") {
      rowW = Math.max(0.5, w * (1 - t));
      offset = w - rowW;
    } else {
      rowW = Math.max(0.5, w * (1 - t));
      offset = 0;
    }
    fillRect(grid, x + offset, y + h - (row + 1) * (h / steps), rowW, h / steps + 0.05, color);
  }
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

/**
 * Paints a hand-authored pixel map onto the grid. Each character in `map` is one
 * logical cell; characters are looked up in `legend` ('.'/space = transparent).
 * This lets sprites be drawn shape-accurately cell-by-cell instead of approximated
 * from overlapping ellipses/rects.
 */
export function drawPixelMap(
  grid: Grid,
  map: string[],
  legend: Record<string, string>,
  offsetX = 0,
  offsetY = 0
): void {
  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || ch === " ") continue;
      const color = legend[ch];
      if (color) setPixel(grid, offsetX + x, offsetY + y, color);
    }
  }
}

/** Copies every non-null cell from `src` onto `dest` (both grids must be the same size; later layers paint over earlier ones). */
export function paintOver(dest: Grid, src: Grid): void {
  for (let y = 0; y < src.length; y++) {
    for (let x = 0; x < src[y].length; x++) {
      if (src[y][x] !== null) dest[y][x] = src[y][x];
    }
  }
}


/**
 * Grows a 1px outline ring (in `outlineColor`) around every filled region,
 * by filling empty cells that are orthogonally adjacent to a filled cell.
 * `skipColors` lets small detail colors (e.g. eye highlights) opt out of
 * generating their own outline ring so they don't get a halo inside the body.
 */
export function outlineGrid(grid: Grid, outlineColor: string, skipColors: string[] = []): Grid {
  const out = cloneGrid(grid);
  const height = grid.length;
  const width = grid[0].length;
  const skip = new Set(skipColors);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] !== null) continue;
      const neighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ];
      const touchesBody = neighbors.some(([nx, ny]) => {
        if (!inBounds(grid, nx, ny)) return false;
        const cell = grid[ny][nx];
        return cell !== null && !skip.has(cell);
      });
      if (touchesBody) out[y][x] = outlineColor;
    }
  }
  return out;
}
