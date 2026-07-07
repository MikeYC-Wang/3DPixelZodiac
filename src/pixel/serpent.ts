/**
 * Builds a smooth, continuous serpentine tube (used for the snake and
 * dragon sprites) by stamping overlapping circles along a path of control
 * points, instead of a chain of separate blobs - this avoids the "beaded
 * caterpillar" look and reads as one connected body with a single outline.
 */
import { Grid, fillEllipse } from "./grid";

export interface SerpentPoint {
  x: number;
  y: number;
  r: number;
}

/** Stamps a smooth tapering tube through the given control points onto `grid`. */
export function drawSerpentTube(grid: Grid, points: SerpentPoint[], color: string, samplesPerSegment = 10): void {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    for (let s = 0; s <= samplesPerSegment; s++) {
      const t = s / samplesPerSegment;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const r = a.r + (b.r - a.r) * t;
      fillEllipse(grid, x, y, r, r, color);
    }
  }
}

/** Adds a row of small alternating diamond/spot markings along the top of the tube. */
export function drawSerpentMarkings(
  grid: Grid,
  points: SerpentPoint[],
  color: string,
  everyNth = 2,
  samplesPerSegment = 10
): void {
  let step = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    for (let s = 0; s <= samplesPerSegment; s++, step++) {
      if (step % everyNth !== 0) continue;
      const t = s / samplesPerSegment;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      const r = a.r + (b.r - a.r) * t;
      fillEllipse(grid, x, y - r * 0.4, Math.max(0.5, r * 0.4), Math.max(0.5, r * 0.4), color);
    }
  }
}
