import { AnimalSpec } from "./animals";
import { createGrid, fillEllipse, outlineGrid } from "./pixel/grid";
import { gridToRects } from "./pixel/svg";
import { CELL, GRID_W, GRID_H, GROUND_Y, FRONT_LEG_X, BACK_LEG_X } from "./pixel/mammal";
import { legGroup, wingGroup, bounceTransform, opacitySwap, segmentUndulation } from "./pixel/limbAnimation";

const LEG_LENGTH = 56;
const LEG_WIDTH = 18;
const CANVAS_W = GRID_W * CELL;
const CANVAS_H = Math.max(GRID_H * CELL, GROUND_Y * CELL + LEG_LENGTH + 16);

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

const SEGMENT_GRID = 18;

function renderSlither(spec: AnimalSpec): string {
  const segments = spec.segments!;
  const amplitude = 10;
  let out = "";
  // draw tail-to-head so the head segment paints on top
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    const grid = createGrid(SEGMENT_GRID, SEGMENT_GRID);
    const localCx = SEGMENT_GRID / 2;
    const localCy = SEGMENT_GRID / 2;
    fillEllipse(grid, localCx, localCy, seg.rx, seg.ry, seg.color);
    if (seg.extra) seg.extra(grid, localCx, localCy);
    const outlined = outlineGrid(grid, spec.palette.outline, [spec.palette.eye]);
    const rects = gridToRects(outlined, {}, CELL, 0, 0);
    const ax = (seg.cx - localCx) * CELL;
    const ay = (seg.cy - localCy) * CELL;
    out += `<g transform="translate(${ax},${ay})"><g>${rects}${segmentUndulation(i, amplitude)}</g></g>`;
  }
  return out;
}

export function renderZodiacSvg(spec: AnimalSpec): string {
  const inner = spec.locomotion === "slither" ? renderSlither(spec) : renderWalkOrHop(spec);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">
  <title>${escapeXml(spec.name.en)} - 3DPixelZodiac</title>
  ${inner}
</svg>`;
}

function escapeXml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
