/**
 * Minimal pixel-grid primitives shared by every zodiac animal sprite.
 *
 * A grid is a 2D array of color-key strings (or null for "empty/transparent").
 * Animals are authored as a handful of filled ellipses/rects (torso, head,
 * ears, markings, ...) and then run through `outlineGrid`, which grows a
 * 1px outline ring around the silhouette automatically - this keeps each
 * animal's source short while still producing a clean retro outlined look.
 */

export type Grid = (string | null)[][];

export function createGrid(width: number, height: number): Grid {
  return Array.from({ length: height }, () => Array<string | null>(width).fill(null));
}

export function inBounds(grid: Grid, x: number, y: number): boolean {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

export function setPixel(grid: Grid, x: number, y: number, color: string): void {
  if (inBounds(grid, x, y)) grid[Math.round(y)][Math.round(x)] = color;
}

export function fillRect(
  grid: Grid,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(grid, x + dx, y + dy, color);
    }
  }
}

/** Fills an axis-aligned ellipse centered at (cx, cy) with radii (rx, ry), in grid cells. */
export function fillEllipse(
  grid: Grid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string
): void {
  const minX = Math.floor(cx - rx);
  const maxX = Math.ceil(cx + rx);
  const minY = Math.floor(cy - ry);
  const maxY = Math.ceil(cy + ry);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const nx = (x + 0.5 - cx) / rx;
      const ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) setPixel(grid, x, y, color);
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
  for (let row = 0; row < h; row++) {
    const t = row / Math.max(1, h - 1);
    let rowW: number;
    let offset: number;
    if (dir === "up") {
      rowW = Math.max(1, Math.round(w * (1 - t)));
      offset = Math.round((w - rowW) / 2);
    } else if (dir === "up-left") {
      rowW = Math.max(1, Math.round(w * (1 - t)));
      offset = w - rowW;
    } else {
      rowW = Math.max(1, Math.round(w * (1 - t)));
      offset = 0;
    }
    fillRect(grid, x + offset, y + (h - 1 - row), rowW, 1, color);
  }
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

/** Copies every non-null cell from `src` onto `dest` (later layers paint over earlier ones). */
export function paintOver(dest: Grid, src: Grid): void {
  for (let y = 0; y < src.length; y++) {
    for (let x = 0; x < src[y].length; x++) {
      if (src[y][x] !== null) setPixel(dest, x, y, src[y][x] as string);
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
