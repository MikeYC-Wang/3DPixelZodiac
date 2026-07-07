import { AnimalSpec, SERPENT_GRID_W, SERPENT_GRID_H } from "./animals";
import { Grid, outlineGrid } from "./pixel/grid";
import { gridToRects } from "./pixel/svg";
import { CELL, GRID_W, GRID_H, GROUND_Y, FRONT_LEG_X, BACK_LEG_X } from "./pixel/mammal";
import { legGroup, wingGroup, bounceTransform, opacitySwap, segmentUndulation } from "./pixel/limbAnimation";

const LEG_LENGTH = 56;
const LEG_WIDTH = 18;
const CANVAS_W = GRID_W * CELL;
const CANVAS_H = Math.max(GRID_H * CELL, GROUND_Y * CELL + LEG_LENGTH + 16);
const SERPENT_CANVAS_W = SERPENT_GRID_W * CELL;
const SERPENT_CANVAS_H = SERPENT_GRID_H * CELL;

function renderWalkOrHop(spec: AnimalSpec): string {
  const body = spec.buildBody!();
  const outlined = outlineGrid(body, spec.palette.outline);
  const bodyRects = gridToRects(outlined, {}, CELL, 0, 0);
  const footColor = spec.palette.outline;

  if (spec.locomotion === "hop") {
    const extendedLegs = `<g opacity="1">${legStub(FRONT_LEG_X, footColor, spec.palette.body, 14)}${legStub(
      BACK_LEG_X,
      footColor,
      spec.palette.body,
      14
    )}${opacitySwap(true)}</g>`;
    const tuckedLegs = `<g opacity="0">${legStub(FRONT_LEG_X, footColor, spec.palette.body, 4)}${legStub(
      BACK_LEG_X,
      footColor,
      spec.palette.body,
      4
    )}${opacitySwap(false)}</g>`;
    return `<g>
      <g>${bodyRects}${bounceTransform(30)}</g>
      ${extendedLegs}
      ${tuckedLegs}
    </g>`;
  }

  const isBiped = spec.locomotion === "biped";
  const legWidth = isBiped ? 10 : LEG_WIDTH;
  const legColor = isBiped ? spec.palette.accent : spec.palette.body;

  const frontLeg = legGroup(FRONT_LEG_X * CELL, GROUND_Y * CELL, legWidth, LEG_LENGTH, legColor, footColor, 18, 0);
  const backLeg = legGroup(BACK_LEG_X * CELL, GROUND_Y * CELL, legWidth, LEG_LENGTH, legColor, footColor, 18, 1);

  let wings = "";
  if (isBiped) {
    wings = wingGroup(17 * CELL, 11 * CELL, 7 * CELL, 6 * CELL, spec.palette.body, spec.palette.outline, 22);
  }

  return `${backLeg}${wings}${bodyRects}${frontLeg}`;
}

function legStub(x: number, footColor: string, bodyColor: string, lengthPx: number): string {
  const px = x * CELL;
  const py = GROUND_Y * CELL;
  return `<rect x="${px - LEG_WIDTH / 2}" y="${py}" width="${LEG_WIDTH}" height="${lengthPx}" fill="${bodyColor}"/><rect x="${
    px - LEG_WIDTH / 2
  }" y="${py + lengthPx - 5}" width="${LEG_WIDTH}" height="5" fill="${footColor}"/>`;
}

const SERPENT_BAND_WIDTH = 2; // cells per animated column band

/** Slices a grid's columns [startCol, startCol+width) into a standalone sub-grid, keeping all rows. */
function sliceColumnBand(grid: Grid, startCol: number, width: number): Grid {
  return grid.map((row) => row.slice(startCol, startCol + width));
}

function renderSlither(spec: AnimalSpec): string {
  const grid = spec.buildSlitherGrid!();
  // outlined ONCE on the whole continuous tube, so the silhouette reads as
  // one smooth body instead of a chain of separately-outlined blobs
  const outlined = outlineGrid(grid, spec.palette.outline, [spec.palette.eye]);
  const amplitude = 9;
  const totalCols = outlined[0].length;
  const bandCount = Math.ceil(totalCols / SERPENT_BAND_WIDTH);
  let out = "";
  for (let b = 0; b < bandCount; b++) {
    const startCol = b * SERPENT_BAND_WIDTH;
    const width = Math.min(SERPENT_BAND_WIDTH, totalCols - startCol);
    const band = sliceColumnBand(outlined, startCol, width);
    const rects = gridToRects(band, {}, CELL, 0, 0);
    if (!rects) continue;
    const ax = startCol * CELL;
    out += `<g transform="translate(${ax},0)"><g>${rects}${segmentUndulation(b, amplitude)}</g></g>`;
  }
  return out;
}

export function renderZodiacSvg(spec: AnimalSpec): string {
  const isSlither = spec.locomotion === "slither";
  const inner = isSlither ? renderSlither(spec) : renderWalkOrHop(spec);
  const width = isSlither ? SERPENT_CANVAS_W : CANVAS_W;
  const height = isSlither ? SERPENT_CANVAS_H : CANVAS_H;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <title>${escapeXml(spec.name.en)} - 3DPixelZodiac</title>
  ${inner}
</svg>`;
}


function escapeXml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
