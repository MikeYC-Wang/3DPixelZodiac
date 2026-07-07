import { Grid } from "./grid";

/**
 * Renders a color-key grid to a string of adjacent-run-merged <rect> tags
 * (merging horizontal runs of the same color keeps the output small).
 */
export function gridToRects(
  grid: Grid,
  palette: Record<string, string>,
  cell: number,
  originX: number,
  originY: number
): string {
  let out = "";
  for (let y = 0; y < grid.length; y++) {
    let x = 0;
    const row = grid[y];
    while (x < row.length) {
      const key = row[x];
      if (key === null) {
        x++;
        continue;
      }
      let runEnd = x + 1;
      while (runEnd < row.length && row[runEnd] === key) runEnd++;
      const color = palette[key] ?? key;
      const rx = originX + x * cell;
      const ry = originY + y * cell;
      const rw = (runEnd - x) * cell;
      out += `<rect x="${rx}" y="${ry}" width="${rw}" height="${cell}" fill="${color}"/>`;
      x = runEnd;
    }
  }
  return out;
}
