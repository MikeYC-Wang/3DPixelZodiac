/**
 * SMIL animation helpers shared by every zodiac sprite. Everything uses
 * calcMode="discrete" so limbs snap between fixed pixel-art poses instead
 * of smoothly tweening - this keeps the "walking/flapping" motion feeling
 * like a real multi-frame sprite flip-book rather than a soft breathing
 * pulse, while still being implemented efficiently via <animateTransform>
 * instead of hand-drawing a full redraw per frame.
 */

export const STEPS = 6;
export const FRAME_SECONDS = 0.2;
export const CYCLE_SECONDS = STEPS * FRAME_SECONDS; // 1.2s

const KEY_TIMES = Array.from({ length: STEPS }, (_, i) => (i / STEPS).toFixed(4)).join(";");

/** A 6-sample triangle wave used for limb swings / body undulation. */
const WAVE6 = [-1, -0.33, 0.33, 1, 0.33, -0.33];

function rotated<T>(arr: T[], by: number): T[] {
  const n = arr.length;
  const shift = ((by % n) + n) % n;
  return arr.slice(shift).concat(arr.slice(0, shift));
}

function animateTransform(
  type: "rotate" | "translate",
  values: string[],
  extraAttrs = ""
): string {
  return `<animateTransform attributeName="transform" type="${type}" calcMode="discrete" values="${values.join(
    ";"
  )}" keyTimes="${KEY_TIMES}" dur="${CYCLE_SECONDS}s" repeatCount="indefinite" ${extraAttrs}/>`;
}

/** A single animated leg (rect body + darker foot) swinging about a hip pivot. phase 0 or 1 (opposite). */
export function legGroup(
  pivotX: number,
  pivotY: number,
  width: number,
  length: number,
  color: string,
  footColor: string,
  amplitudeDeg: number,
  phase: 0 | 1
): string {
  const wave = phase === 0 ? WAVE6 : rotated(WAVE6, STEPS / 2);
  const values = wave.map((v) => `${(v * amplitudeDeg).toFixed(1)} ${pivotX} ${pivotY}`);
  const footH = Math.max(3, Math.round(width * 0.7));
  return `<g transform="rotate(0 ${pivotX} ${pivotY})">
    <rect x="${pivotX - width / 2}" y="${pivotY}" width="${width}" height="${length - footH}" fill="${color}"/>
    <rect x="${pivotX - width / 2}" y="${pivotY + length - footH}" width="${width}" height="${footH}" fill="${footColor}"/>
    ${animateTransform("rotate", values)}
  </g>`;
}

/** A wing/arm swinging about a shoulder pivot - same mechanism as a leg but usually wider amplitude. */
export function wingGroup(
  pivotX: number,
  pivotY: number,
  widthPx: number,
  heightPx: number,
  color: string,
  outlineColor: string,
  amplitudeDeg: number
): string {
  const values = WAVE6.map((v) => `${(v * amplitudeDeg).toFixed(1)} ${pivotX} ${pivotY}`);
  return `<g transform="rotate(0 ${pivotX} ${pivotY})">
    <rect x="${pivotX - 1}" y="${pivotY - 1}" width="${widthPx + 2}" height="${heightPx + 2}" fill="${outlineColor}"/>
    <rect x="${pivotX}" y="${pivotY}" width="${widthPx}" height="${heightPx}" fill="${color}"/>
    ${animateTransform("rotate", values)}
  </g>`;
}

/** Vertical bounce for a whole group (used for the rabbit's hop). Amplitude in px (positive = upward travel). */
export function bounceTransform(amplitudePx: number): string {
  const values = WAVE6.map((v) => `0 ${(-(v + 1) * (amplitudePx / 2)).toFixed(1)}`);
  return animateTransform("translate", values);
}

/** Complementary opacity flicker between two swappable pose groups (e.g. legs extended vs. tucked mid-hop). */
export function opacitySwap(showFirstHalf: boolean): string {
  const on = showFirstHalf ? [1, 1, 0, 0, 0, 1] : [0, 0, 1, 1, 1, 0];
  return `<animate attributeName="opacity" calcMode="discrete" values="${on.join(
    ";"
  )}" keyTimes="${KEY_TIMES}" dur="${CYCLE_SECONDS}s" repeatCount="indefinite"/>`;
}

/** Vertical undulation for one body segment of a slithering snake/dragon, phase-shifted by its index along the body. */
export function segmentUndulation(segmentIndex: number, amplitudePx: number): string {
  const wave = rotated(WAVE6, segmentIndex);
  const values = wave.map((v) => `0 ${(v * amplitudePx).toFixed(1)}`);
  return animateTransform("translate", values);
}
