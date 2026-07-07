import { Grid, createGrid, fillEllipse, fillEllipseMasked, fillRect, setPixel } from "./pixel/grid";
import { buildMammalBody, GRID_W, GRID_H } from "./pixel/mammal";
import { SerpentPoint, drawSerpentTube, drawSerpentMarkings } from "./pixel/serpent";

export type Lang = "zh" | "en" | "ja" | "ko";
export type Locomotion = "walk" | "hop" | "biped" | "slither";

export interface Palette {
  outline: string;
  body: string;
  belly: string;
  accent: string;
  eye: string;
}

export const SERPENT_GRID_W = 38;
export const SERPENT_GRID_H = 22;

export interface LegRigOverride {
  frontX: number;
  backX: number;
  groundY?: number;
  length?: number;
  width?: number;
  pawColor?: string;
}

export interface AnimalSpec {
  key: string;
  order: number; // 0 = rat ... 11 = pig, matches the 12-year cycle
  name: Record<Lang, string>;
  palette: Palette;
  locomotion: Locomotion;
  /** walk / hop / biped: builds the torso+head silhouette (legs/wings added separately). */
  buildBody?: () => Grid;
  /** slither (snake / dragon): one continuous tube silhouette, outlined once then sliced into animated bands. */
  buildSlitherGrid?: () => Grid;
  /**
   * slither only: how many logical columns from the RIGHT edge (the head end) stay as one rigid,
   * non-animated piece - keeps the head/horns/face from being chopped into wiggling slices. Only the
   * body/tail to the left of this cutoff undulates.
   */
  headStaticWidth?: number;
  /** Overrides the shared quadruped leg anchor points/size (used by the rooster and monkey's custom bodies). */
  legRig?: LegRigOverride;
  /** biped only: also draws a flapping wing (rooster). Monkey (also biped) draws its arms directly in the body grid instead. */
  wings?: boolean;
}

const zh = (s: string) => s;

export const ANIMALS: AnimalSpec[] = [
  {
    key: "rat",
    order: 0,
    name: { zh: "鼠", en: "Rat", ja: "ネズミ", ko: "쥐" },
    palette: { outline: "#241f24", body: "#8d8a94", belly: "#ded9e0", accent: "#e8a9b8", eye: "#141116" },
    locomotion: "walk",
    legRig: { frontX: 20, backX: 9, length: 16, width: 14 },
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#8d8a94",
        bellyColor: "#ded9e0",
        eyeColor: "#141116",
        earStyle: "round",
        earColor: "#8d8a94",
        drawTail: (grid) => {
          const pts: SerpentPoint[] = [
            { x: 6, y: 15, r: 0.9 },
            { x: 4, y: 16, r: 0.7 },
            { x: 2, y: 15.5, r: 0.6 },
            { x: 0.5, y: 14, r: 0.5 },
          ];
          drawSerpentTube(grid, pts, "#8d8a94");
          fillEllipse(grid, 0, 13.3, 0.8, 0.8, "#e8a9b8");
        },
      }),
  },
  {
    key: "ox",
    order: 1,
    name: { zh: "牛", en: "Ox", ja: "ウシ", ko: "소" },
    palette: { outline: "#241608", body: "#b86a31", belly: "#e7d8c3", accent: "#8a3e1f", eye: "#141116" },
    locomotion: "walk",
    legRig: { frontX: 20, backX: 9, pawColor: "#f1ece3" },
    buildBody: () => buildOxBody(),
  },
  {
    key: "tiger",
    order: 2,
    name: { zh: "虎", en: "Tiger", ja: "トラ", ko: "호랑이" },
    palette: { outline: "#241206", body: "#f0821e", belly: "#fff3df", accent: "#000000", eye: "#141116" },
    locomotion: "biped",
    legRig: { frontX: 13, backX: 19, groundY: 24, length: 16, width: 14, pawColor: "#fff3df" },
    buildBody: () => buildTigerBody(),
  },
  {
    key: "rabbit",
    order: 3,
    name: { zh: "兔", en: "Rabbit", ja: "ウサギ", ko: "토끼" },
    palette: { outline: "#453a2f", body: "#f6f1e9", belly: "#ffffff", accent: "#f2a6c1", eye: "#141116" },
    locomotion: "hop",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#f6f1e9",
        bellyColor: "#ffffff",
        snoutColor: "#f2a6c1",
        eyeColor: "#141116",
        earStyle: "long",
        earColor: "#f6f1e9",
        hornColor: "#f2a6c1",
        snoutScale: 0.6,
        drawTail: (grid) => {
          fillEllipse(grid, 5, 16, 1.8, 1.8, "#ffffff");
        },
      }),
  },
  {
    key: "dragon",
    order: 4,
    name: { zh: "龍", en: "Dragon", ja: "タツ", ko: "용" },
    palette: { outline: "#0d2e1c", body: "#2f9e5f", belly: "#d8f5c4", accent: "#e8c94b", eye: "#141116" },
    locomotion: "slither",
    headStaticWidth: 13,
    buildSlitherGrid: () => {
      const grid = createGrid(SERPENT_GRID_W, SERPENT_GRID_H);
      const points: SerpentPoint[] = [
        { x: 30, y: 11, r: 4 },
        { x: 25, y: 10.5, r: 3.1 },
        { x: 20, y: 11.5, r: 2.6 },
        { x: 15, y: 10.5, r: 2.1 },
        { x: 10, y: 11.5, r: 1.6 },
        { x: 5.5, y: 10.5, r: 1.1 },
        { x: 2.5, y: 11, r: 0.6 },
      ];
      drawSerpentTube(grid, points, "#2f9e5f");
      const head = points[0];
      const neck1 = points[1];
      const neck2 = points[2];
      // spine spikes running from the head back down the neck, for a fiercer silhouette
      fillRect(grid, neck1.x - 0.7, neck1.y - neck1.r - 1.8, 1.3, 2.4, "#e8c94b");
      fillRect(grid, neck2.x - 0.6, neck2.y - neck2.r - 1.5, 1.1, 2, "#e8c94b");
      // two thick curved horns, each a wide base + back-swept tip so they read clearly as horns
      fillRect(grid, head.x - 2.6, head.y - 7, 2, 3.6, "#e8c94b");
      fillRect(grid, head.x - 3.8, head.y - 8.6, 2, 2.2, "#e8c94b");
      fillRect(grid, head.x + 0.6, head.y - 7, 2, 3.6, "#e8c94b");
      fillRect(grid, head.x + 1.8, head.y - 8.6, 2, 2.2, "#e8c94b");
      // angled fierce brow above the eye
      fillRect(grid, head.x - 2, head.y - 2.7, 3, 1, "#12240f");
      // snout + jaw + fang + a single trailing whisker
      fillEllipse(grid, head.x + 3.2, head.y + 1, 1.8, 1.5, "#2f9e5f");
      fillRect(grid, head.x + 3, head.y + 2.1, 2.4, 1, "#e8c94b");
      fillRect(grid, head.x + 4.6, head.y + 2.6, 0.8, 1.1, "#fff3df");
      fillRect(grid, head.x + 3.8, head.y + 3.2, 3.2, 0.8, "#e8c94b");
      fillEllipse(grid, head.x, head.y - 1.4, 0.9, 0.9, "#c0392b");
      setPixel(grid, head.x, head.y - 1.4, "#141116");
      return grid;
    },
  },
  {
    key: "snake",
    order: 5,
    name: { zh: "蛇", en: "Snake", ja: "ヘビ", ko: "뱀" },
    palette: { outline: "#12240f", body: "#4c9a3f", belly: "#d9e8a8", accent: "#c0392b", eye: "#141116" },
    locomotion: "slither",
    headStaticWidth: 11,
    buildSlitherGrid: () => {
      const grid = createGrid(SERPENT_GRID_W, SERPENT_GRID_H);
      const points: SerpentPoint[] = [
        { x: 31, y: 11, r: 2.6 },
        { x: 27, y: 9.8, r: 2.3 },
        { x: 23, y: 11.8, r: 2.0 },
        { x: 19, y: 9.8, r: 1.7 },
        { x: 15, y: 11.5, r: 1.4 },
        { x: 11, y: 10, r: 1.1 },
        { x: 7, y: 11.2, r: 0.8 },
        { x: 3.5, y: 10.3, r: 0.4 },
      ];
      drawSerpentTube(grid, points, "#4c9a3f");
      drawSerpentMarkings(grid, points, "#e8e2a0", 4);
      const head = points[0];
      // cobra-style hood flare behind the head, for a fiercer silhouette
      fillEllipse(grid, head.x - 1.2, head.y, 2.6, 3.3, "#4c9a3f");
      fillEllipseMasked(grid, head.x - 1.2, head.y, 2.4, 3, "#3f8a34", ["#4c9a3f"]);
      // forked tongue + small fangs
      fillRect(grid, head.x + 2, head.y, 2.6, 0.8, "#c0392b");
      fillRect(grid, head.x + 4.2, head.y - 0.5, 0.9, 0.6, "#c0392b");
      fillRect(grid, head.x + 4.2, head.y + 0.7, 0.9, 0.6, "#c0392b");
      fillRect(grid, head.x + 1.6, head.y + 1.1, 0.6, 0.9, "#fff8e0");
      setPixel(grid, head.x + 0.5, head.y - 1.3, "#141116");
      fillRect(grid, head.x - 1.5, head.y - 1.8, 1.8, 1, "#d9e8a8");
      return grid;
    },
  },
  {
    key: "horse",
    order: 6,
    name: { zh: "馬", en: "Horse", ja: "ウマ", ko: "말" },
    palette: { outline: "#241608", body: "#b06a35", belly: "#e8c79a", accent: "#3b2412", eye: "#141116" },
    locomotion: "walk",
    legRig: { frontX: 21, backX: 9, groundY: 21, length: 30, width: 12, pawColor: "#241608" },
    buildBody: () => buildHorseBody(),
  },
  {
    key: "goat",
    order: 7,
    name: { zh: "羊", en: "Goat", ja: "ヒツジ", ko: "양" },
    palette: { outline: "#3a3226", body: "#efe6d6", belly: "#ffffff", accent: "#cbbfa0", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#efe6d6",
        bellyColor: "#ffffff",
        eyeColor: "#141116",
        earStyle: "horns-swept",
        hornColor: "#8a7a54",
        earColor: "#efe6d6",
        drawHeadExtras: (grid) => {
          // beard, hanging below the chin
          fillRect(grid, 26.5, 15, 1.8, 3.2, "#cbbfa0");
        },
        drawTail: (grid) => {
          fillEllipse(grid, 5, 15.5, 1.4, 1.4, "#efe6d6");
        },
      }),
  },
  {
    key: "monkey",
    order: 8,
    name: { zh: "猴", en: "Monkey", ja: "サル", ko: "원숭이" },
    palette: { outline: "#241a10", body: "#8a5a3c", belly: "#e8c9a0", accent: "#8a5a3c", eye: "#141116" },
    locomotion: "biped",
    legRig: { frontX: 13, backX: 19, groundY: 22, length: 20, width: 16 },
    buildBody: () => buildMonkeyBody(),
  },
  {
    key: "rooster",
    order: 9,
    name: { zh: "雞", en: "Rooster", ja: "トリ", ko: "닭" },
    palette: { outline: "#241206", body: "#c0392b", belly: "#f2c94c", accent: "#f2c94c", eye: "#141116" },
    locomotion: "biped",
    legRig: { frontX: 17, backX: 12, groundY: 20, length: 30, width: 10 },
    wings: true,
    buildBody: () => buildRoosterBody(),
  },
  {
    key: "dog",
    order: 10,
    name: { zh: "狗", en: "Dog", ja: "イヌ", ko: "개" },
    palette: { outline: "#2a1a0c", body: "#d9822b", belly: "#fdf6ea", accent: "#fdf6ea", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        // shiba inu: warm red/tan coat, cream "urajiro" markings, upright pointed ears, curled tail
        bodyColor: "#d9822b",
        bellyColor: "#fdf6ea",
        snoutColor: "#fdf6ea",
        eyeColor: "#141116",
        earStyle: "pointy",
        earColor: "#d9822b",
        snoutScale: 0.8,
        drawHeadExtras: (grid) => {
          // small brow accent only - the white snout already reads as the urajiro muzzle marking
          setPixel(grid, 24.2, 9.6, "#fdf6ea");
        },
        drawTail: (grid) => {
          // tail curling up and over the back, spitz-style, with a fluffy cream tip
          const pts: SerpentPoint[] = [
            { x: 3, y: 13.5, r: 1.5 },
            { x: 1.2, y: 11.2, r: 1.3 },
            { x: 1.3, y: 8.5, r: 1.2 },
            { x: 3.2, y: 6.8, r: 1.1 },
            { x: 5.5, y: 7, r: 0.9 },
          ];
          drawSerpentTube(grid, pts, "#d9822b");
          fillEllipse(grid, 5.5, 7, 1, 1, "#fdf6ea");
        },
      }),
  },
  {
    key: "pig",
    order: 11,
    name: { zh: "豬", en: "Pig", ja: "イノシシ", ko: "돼지" },
    palette: { outline: "#4a1e24", body: "#f3a6b0", belly: "#ffe1e6", accent: "#c96b78", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#f3a6b0",
        bellyColor: "#ffe1e6",
        snoutColor: "#f7bcc4",
        eyeColor: "#141116",
        earStyle: "small-pointed",
        earColor: "#e88fa0",
        drawHeadExtras: (grid) => {
          setPixel(grid, 27.2, 12.6, "#8a4650");
          setPixel(grid, 28.6, 12.6, "#8a4650");
        },
        drawTail: (grid) => {
          const pts: SerpentPoint[] = [
            { x: 4, y: 13, r: 0.9 },
            { x: 3, y: 12, r: 0.8 },
            { x: 4, y: 11.3, r: 0.7 },
            { x: 5, y: 11, r: 0.6 },
          ];
          drawSerpentTube(grid, pts, "#f3a6b0");
        },
      }),
  },
];

/** Tiger faces the viewer (front-facing, symmetric) rather than side-view, like the monkey. */
function buildTigerBody(): Grid {
  const grid = createGrid(GRID_W, GRID_H);
  const body = "#f0821e";
  const stripe = "#000000";
  const white = "#fff3df";
  // torso
  fillEllipse(grid, 16, 18, 7.5, 6.5, body);
  fillEllipse(grid, 16, 20.5, 4.5, 4, white);
  // body stripes flanking the white belly patch
  fillRect(grid, 9.5, 13.5, 1.4, 8, stripe);
  fillRect(grid, 12.2, 12.8, 1.4, 9, stripe);
  fillRect(grid, 18.4, 12.8, 1.4, 9, stripe);
  fillRect(grid, 21.1, 13.5, 1.4, 8, stripe);
  // front paws resting together
  fillEllipse(grid, 11.8, 22.5, 1.9, 1.6, white);
  fillEllipse(grid, 20.2, 22.5, 1.9, 1.6, white);
  setPixel(grid, 11.4, 22.5, stripe);
  setPixel(grid, 20.6, 22.5, stripe);
  // tail curling out from behind, staying below the head/ears (chest height, not up by the face)
  const tailPts: SerpentPoint[] = [
    { x: 23, y: 19, r: 1.6 },
    { x: 25.8, y: 17.6, r: 1.4 },
    { x: 27, y: 15.6, r: 1.2 },
    { x: 26, y: 13.8, r: 1.0 },
  ];
  drawSerpentTube(grid, tailPts, body);
  fillRect(grid, 25.2, 14.3, 1.6, 1.2, stripe);
  fillEllipse(grid, 25.9, 13.1, 1, 1, stripe);
  // head, centered above the torso, facing the viewer
  fillEllipse(grid, 16, 8.2, 6, 6, body);
  fillEllipse(grid, 8, 4.6, 2.8, 2.8, body);
  fillEllipse(grid, 24, 4.6, 2.8, 2.8, body);
  fillEllipse(grid, 8, 2.1, 0.9, 0.9, stripe);
  fillEllipse(grid, 24, 2.1, 0.9, 0.9, stripe);
  // forehead stripes, kept clear of the ears on either side
  fillRect(grid, 11.5, 2.6, 1.2, 3.4, stripe);
  fillRect(grid, 14.3, 2.2, 1.2, 3.8, stripe);
  fillRect(grid, 17.1, 2.2, 1.2, 3.8, stripe);
  fillRect(grid, 19.9, 2.6, 1.2, 3.4, stripe);
  // white muzzle + cheek stripes + nose
  fillEllipse(grid, 16, 11.2, 4.2, 3.4, white);
  fillRect(grid, 10.8, 9.8, 1.1, 2.2, stripe);
  fillRect(grid, 20.1, 9.8, 1.1, 2.2, stripe);
  fillRect(grid, 15.2, 10.4, 1.6, 1.2, stripe);
  // fangs peeking out from the muzzle, and angled fierce brows above each eye
  fillRect(grid, 13.6, 12.6, 0.9, 1.3, white);
  fillRect(grid, 17.5, 12.6, 0.9, 1.3, white);
  fillRect(grid, 12, 6.6, 2, 0.9, stripe);
  fillRect(grid, 18, 6.6, 2, 0.9, stripe);
  setPixel(grid, 12.8, 7.6, "#141116");
  setPixel(grid, 19.2, 7.6, "#141116");
  return grid;
}

/** Monkey sits/stands upright (tall torso, head centered on top) instead of the horizontal quadruped pose. */
function buildMonkeyBody(): Grid {
  const grid = createGrid(GRID_W, GRID_H);
  const body = "#8a5a3c";
  const face = "#e8c9a0";
  // upright torso
  fillEllipse(grid, 16, 16, 5, 6, body);
  fillEllipse(grid, 16, 18, 3, 3.5, face);
  // arms hanging at the sides, with visible hands
  fillRect(grid, 10, 11, 2, 8, body);
  fillRect(grid, 20, 11, 2, 8, body);
  fillEllipse(grid, 10.8, 19.2, 1.4, 1.4, face);
  fillEllipse(grid, 21, 19.2, 1.4, 1.4, face);
  // tail curling up from behind the body and over the back
  const tailPts: SerpentPoint[] = [
    { x: 20.5, y: 13, r: 1.3 },
    { x: 22.5, y: 10.5, r: 1.2 },
    { x: 23, y: 7, r: 1.1 },
    { x: 21, y: 4.5, r: 1.0 },
    { x: 18.3, y: 4.5, r: 0.9 },
  ];
  drawSerpentTube(grid, tailPts, body);
  // head, centered above the torso
  fillEllipse(grid, 16, 7.2, 4.2, 4.2, body);
  // ears are mostly body-colored on the outside, with a smaller inner-ear patch,
  // and are pushed further out so they don't touch the central face patch -
  // otherwise the same-colored regions fuse into one blob with no outline between them
  fillEllipse(grid, 10.6, 6.8, 2.2, 2.4, body);
  fillEllipse(grid, 21.4, 6.8, 2.2, 2.4, body);
  fillEllipse(grid, 10.8, 7, 1.1, 1.3, face);
  fillEllipse(grid, 21.2, 7, 1.1, 1.3, face);
  fillEllipse(grid, 16, 8.2, 2.5, 2.3, face);
  setPixel(grid, 14.3, 7, "#141116");
  setPixel(grid, 17.7, 7, "#141116");
  return grid;
}

function buildHorseBody(): Grid {
  const grid = createGrid(GRID_W, GRID_H);
  const body = "#b06a35";
  const belly = "#e8c79a";
  const mane = "#3b2412";

  // longer torso with a slightly slimmer belly than ox/dog to avoid a rodent-like silhouette
  fillEllipse(grid, 14.3, 15.4, 9.2, 5.2, body);
  fillEllipse(grid, 14.8, 18.2, 5.4, 2.8, belly);

  // neck bridge into head
  fillRect(grid, 19.2, 10.7, 4.8, 3.4, body);

  // horse head: longer face / muzzle, not a compact round snout
  fillEllipse(grid, 24, 11.4, 4.7, 4, body);
  fillRect(grid, 27.7, 11.6, 3.4, 2.3, body);
  fillRect(grid, 29, 13.6, 2.4, 1.2, belly);
  setPixel(grid, 24.8, 10.3, "#141116");
  setPixel(grid, 30.3, 13.8, "#3b2412");

  // upright ears + a short forelock and neck mane
  fillRect(grid, 21.6, 5.7, 1.3, 3.2, body);
  fillRect(grid, 24.8, 5.6, 1.3, 3.1, body);
  fillRect(grid, 20.1, 7, 2.6, 1.1, mane);
  fillRect(grid, 18.5, 8.4, 1.5, 5.9, mane);

  // tail should be a short rear tail with a dark tuft, not a thin rat tail
  fillRect(grid, 3.1, 12.6, 1.4, 5.2, mane);
  fillEllipse(grid, 3.3, 18.6, 1.3, 1.8, mane);

  return grid;
}

function buildOxBody(): Grid {
  const grid = createGrid(GRID_W, GRID_H);
  const body = "#b86a31";
  const bodyHi = "#d58436";
  const shade = "#8a3e1f";
  const muzzle = "#d8cec0";
  const horn = "#e8e1d4";

  // flatter back profile: keep a long straight top line and reduce roundness.
  fillRect(grid, 7.2, 10.6, 16.2, 8.2, body);
  fillEllipse(grid, 7.3, 14.8, 2.4, 4.3, body);
  fillEllipse(grid, 23.3, 14.8, 2.8, 4.3, body);
  // low shoulder bump while preserving a mostly flat back silhouette
  fillRect(grid, 10.4, 9.6, 6.6, 1.2, bodyHi);
  fillRect(grid, 17, 10.1, 2.3, 0.9, bodyHi);

  // neck/dewlap shadow under the head
  fillRect(grid, 19.6, 12.8, 2, 6.2, shade);
  fillRect(grid, 20.8, 15.4, 1.7, 4.8, shade);

  // head with blocky front and light muzzle
  fillEllipse(grid, 24, 12.8, 4.5, 4.1, body);
  fillRect(grid, 26.9, 12.8, 3.3, 2.9, muzzle);
  setPixel(grid, 28.2, 14.2, "#4b433c");
  setPixel(grid, 29.5, 14.2, "#4b433c");
  setPixel(grid, 24.8, 11.3, "#141116");

  // horns attached to the head crown: roots overlap head pixels so they don't float
  fillRect(grid, 21.6, 8.1, 1.4, 1.2, horn);
  fillRect(grid, 20.8, 7, 1.3, 1.2, horn);
  setPixel(grid, 20.3, 6.5, horn);
  fillRect(grid, 24.6, 8.1, 1.4, 1.2, horn);
  fillRect(grid, 25.7, 7, 1.3, 1.2, horn);
  setPixel(grid, 27.1, 6.5, horn);
  fillRect(grid, 22.9, 9.2, 1.4, 1, shade);

  // smaller underside mass so the belly doesn't look too bulky
  fillEllipse(grid, 16.1, 19.1, 4.2, 1.7, shade);

  // detached short tail with white tip (leave a visible gap from body)
  fillRect(grid, 2.2, 12.8, 1.1, 4.4, body);
  fillRect(grid, 1.9, 17, 1.7, 1.7, "#f2efe8");

  return grid;
}

function buildRoosterBody(): Grid {
  const grid = createGrid(32, 26);
  const body = "#c0392b";
  const belly = "#8a2416";
  const comb = "#ff5b45";
  const beak = "#f2a71b";
  const feather1 = "#f2c94c";
  const feather2 = "#2f9e5f";
  fillEllipse(grid, 15, 15, 6.5, 5, body);
  fillEllipse(grid, 15, 18, 4.5, 2.6, belly);
  fillEllipse(grid, 22, 12, 4, 4, body);
  fillRect(grid, 25.5, 12, 2.2, 1.2, beak);
  fillRect(grid, 24.6, 13.6, 1.2, 2, belly);
  fillRect(grid, 19.3, 6, 1.4, 3, comb);
  fillRect(grid, 21, 5, 1.4, 3.5, comb);
  fillRect(grid, 22.7, 5.5, 1.4, 3, comb);
  setPixel(grid, 23, 11, "#141116");
  // layered tail feathers sweeping up and back
  fillRect(grid, 5, 7, 2.2, 10, feather2);
  fillRect(grid, 3, 6, 2.2, 10, feather1);
  fillRect(grid, 1, 8, 2.2, 8, body);
  return grid;
}

