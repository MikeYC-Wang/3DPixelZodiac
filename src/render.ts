import { AnimalSpec, SERPENT_GRID_W, SERPENT_GRID_H } from "./animals";
import { Grid, outlineGrid, SCALE } from "./pixel/grid";
import { gridToRects } from "./pixel/svg";
import { CELL, GRID_W, GRID_H, GROUND_Y, FRONT_LEG_X, BACK_LEG_X } from "./pixel/mammal";
import { legGroup, wingGroup, bounceTransform, opacitySwap, CYCLE_SECONDS } from "./pixel/limbAnimation";

const FINE_CELL = CELL / SCALE;
const LEG_LENGTH = 32;
const LEG_WIDTH = 20;
const LEG_OVERLAP = 6; // legs start slightly above the body's bottom edge so there's no visible seam/gap
const MAX_LEG_LENGTH = 46;
const CANVAS_W = GRID_W * CELL;
const CANVAS_H = Math.max(GRID_H * CELL, GROUND_Y * CELL - LEG_OVERLAP + MAX_LEG_LENGTH + 16);
const SERPENT_CANVAS_W = SERPENT_GRID_W * CELL;
const SERPENT_CANVAS_H = SERPENT_GRID_H * CELL;

function renderWalkOrHop(spec: AnimalSpec): string {
  const body = spec.buildBody!();
  const outlined = outlineGrid(body, spec.palette.outline);
  const bodyRects = gridToRects(outlined, {}, FINE_CELL, 0, 0);
  const footColor = spec.palette.outline;
  const rig = spec.legRig;
  const frontX = rig?.frontX ?? FRONT_LEG_X;
  const backX = rig?.backX ?? BACK_LEG_X;
  const groundY = rig?.groundY ?? GROUND_Y;
  const legLength = rig?.length ?? LEG_LENGTH;
  const legWidth = rig?.width ?? LEG_WIDTH;
  const groundPx = groundY * CELL - LEG_OVERLAP;

  if (spec.locomotion === "hop") {
    const extendedLegs = `<g opacity="1">${legStub(frontX, groundPx, legWidth, footColor, spec.palette.body, 16)}${legStub(
      backX,
      groundPx,
      legWidth,
      footColor,
      spec.palette.body,
      16
    )}${opacitySwap(true)}</g>`;
    const tuckedLegs = `<g opacity="0">${legStub(frontX, groundPx, legWidth, footColor, spec.palette.body, 5)}${legStub(
      backX,
      groundPx,
      legWidth,
      footColor,
      spec.palette.body,
      5
    )}${opacitySwap(false)}</g>`;
    return `<g>
      <g>${bodyRects}${bounceTransform(30)}</g>
      ${extendedLegs}
      ${tuckedLegs}
    </g>`;
  }

  const isBiped = spec.locomotion === "biped";
  const legColor = isBiped ? spec.palette.accent : spec.palette.body;

  const frontLeg = legGroup(frontX * CELL, groundPx, legWidth, legLength, legColor, footColor, 18, 0, rig?.pawColor);
  const backLeg = legGroup(backX * CELL, groundPx, legWidth, legLength, legColor, footColor, 18, 1, rig?.pawColor);

  let wings = "";
  if (isBiped && spec.wings) {
    wings = wingGroup(17 * CELL, 11 * CELL, 7 * CELL, 6 * CELL, spec.palette.body, spec.palette.outline, 22);
  }

  return `${backLeg}${wings}${bodyRects}${frontLeg}`;
}

function legStub(
  x: number,
  groundPx: number,
  width: number,
  footColor: string,
  bodyColor: string,
  lengthPx: number
): string {
  const px = x * CELL;
  return `<rect x="${px - width / 2}" y="${groundPx}" width="${width}" height="${lengthPx}" fill="${bodyColor}"/><rect x="${
    px - width / 2
  }" y="${groundPx + lengthPx - 5}" width="${width}" height="5" fill="${footColor}"/>`;
}

function renderSlither(spec: AnimalSpec): string {
  const grid = spec.buildSlitherGrid!();
  // outlined once on the whole body so dragon/snake read as a single silhouette.
  const outlined = outlineGrid(grid, spec.palette.outline, [spec.palette.eye]);
  const rects = gridToRects(outlined, {}, FINE_CELL, 0, 0);
  if (!rects) return "";
  // user-requested behavior: no swimming undulation, only whole-body vertical float.
  const values = ["0 -6", "0 -3", "0 0", "0 3", "0 0", "0 -3"];
  return `<g>
    ${rects}
    <animateTransform attributeName="transform" type="translate" calcMode="discrete" values="${values.join(
      ";"
    )}" keyTimes="0;0.1667;0.3333;0.5000;0.6667;0.8333" dur="${CYCLE_SECONDS}s" repeatCount="indefinite"/>
  </g>`;
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
