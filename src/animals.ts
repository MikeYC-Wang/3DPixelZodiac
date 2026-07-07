import { Grid, createGrid, fillEllipse, fillRect, setPixel } from "./pixel/grid";
import { buildMammalBody } from "./pixel/mammal";
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
}

const zh = (s: string) => s;

export const ANIMALS: AnimalSpec[] = [
  {
    key: "rat",
    order: 0,
    name: { zh: "鼠", en: "Rat", ja: "ネズミ", ko: "쥐" },
    palette: { outline: "#241f24", body: "#8d8a94", belly: "#ded9e0", accent: "#e8a9b8", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#8d8a94",
        bellyColor: "#ded9e0",
        eyeColor: "#141116",
        earStyle: "round",
        earColor: "#8d8a94",
        drawTail: (grid) => {
          const pts: [number, number][] = [
            [6, 15],
            [4, 16],
            [2, 15.5],
            [0.5, 14],
          ];
          for (const [x, y] of pts) setPixel(grid, x, y, "#8d8a94");
          setPixel(grid, 0, 13.5, "#e8a9b8");
        },
      }),
  },
  {
    key: "ox",
    order: 1,
    name: { zh: "牛", en: "Ox", ja: "ウシ", ko: "소" },
    palette: { outline: "#20140a", body: "#7d5330", belly: "#c99a63", accent: "#f0e9d6", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#7d5330",
        bellyColor: "#c99a63",
        snoutColor: "#4a3626",
        eyeColor: "#141116",
        earStyle: "horns-curved",
        hornColor: "#f0e9d6",
        drawHeadExtras: (grid) => {
          // nose ring
          setPixel(grid, 29, 13.5, "#f0e9d6");
        },
        drawTail: (grid) => {
          fillRect(grid, 3, 15, 3, 1, "#7d5330");
          fillEllipse(grid, 2, 17, 1.3, 1.3, "#241a10");
        },
      }),
  },
  {
    key: "tiger",
    order: 2,
    name: { zh: "虎", en: "Tiger", ja: "トラ", ko: "호랑이" },
    palette: { outline: "#241206", body: "#f0821e", belly: "#fff3df", accent: "#000000", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#f0821e",
        bellyColor: "#fff3df",
        eyeColor: "#141116",
        earStyle: "pointy",
        earColor: "#f0821e",
        drawHeadExtras: (grid) => {
          // black ear tips + face stripes
          fillRect(grid, 19, 4, 2, 2, "#000000");
          fillRect(grid, 25.5, 3.5, 2, 2, "#000000");
          fillRect(grid, 22, 9, 1, 2, "#000000");
          fillRect(grid, 25, 9, 1, 2, "#000000");
        },
        drawMarkings: (grid) => {
          const stripes: [number, number, number][] = [
            [8, 11, 3],
            [11, 10, 4],
            [14, 11, 4],
            [17, 10, 4],
            [20, 11, 3],
          ];
          for (const [x, y, h] of stripes) fillRect(grid, x, y, 2, h, "#000000");
        },
        drawTail: (grid) => {
          fillRect(grid, 2, 13, 4, 1.5, "#f0821e");
          fillRect(grid, 1, 12, 1.5, 2, "#000000");
        },
      }),
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
    buildSlitherGrid: () => {
      const grid = createGrid(SERPENT_GRID_W, SERPENT_GRID_H);
      const points: SerpentPoint[] = [
        { x: 30, y: 11, r: 3.5 },
        { x: 25, y: 9, r: 3.1 },
        { x: 20, y: 12.5, r: 2.6 },
        { x: 15, y: 9, r: 2.1 },
        { x: 10, y: 12, r: 1.6 },
        { x: 5.5, y: 9.5, r: 1.1 },
        { x: 2.5, y: 11, r: 0.6 },
      ];
      drawSerpentTube(grid, points, "#2f9e5f");
      drawSerpentMarkings(grid, points, "#1f7a46", 3);
      const head = points[0];
      // two curved horns, each a short base + back-swept tip so they read clearly against the sky
      fillRect(grid, head.x - 2.2, head.y - 6.6, 1.5, 3.2, "#e8c94b");
      fillRect(grid, head.x - 3.2, head.y - 8, 1.5, 2, "#e8c94b");
      fillRect(grid, head.x + 0.8, head.y - 6.6, 1.5, 3.2, "#e8c94b");
      fillRect(grid, head.x + 1.8, head.y - 8, 1.5, 2, "#e8c94b");
      // snout + jaw + a single trailing whisker
      fillEllipse(grid, head.x + 3, head.y + 1, 1.7, 1.4, "#2f9e5f");
      fillRect(grid, head.x + 2.8, head.y + 2, 2.2, 1, "#e8c94b");
      fillRect(grid, head.x + 3.6, head.y + 3, 3.2, 0.8, "#e8c94b");
      setPixel(grid, head.x, head.y - 1.5, "#141116");
      return grid;
    },
  },
  {
    key: "snake",
    order: 5,
    name: { zh: "蛇", en: "Snake", ja: "ヘビ", ko: "뱀" },
    palette: { outline: "#12240f", body: "#4c9a3f", belly: "#d9e8a8", accent: "#c0392b", eye: "#141116" },
    locomotion: "slither",
    buildSlitherGrid: () => {
      const grid = createGrid(SERPENT_GRID_W, SERPENT_GRID_H);
      const points: SerpentPoint[] = [
        { x: 31, y: 11, r: 2.6 },
        { x: 27, y: 9, r: 2.3 },
        { x: 23, y: 12.5, r: 2.0 },
        { x: 19, y: 9, r: 1.7 },
        { x: 15, y: 12, r: 1.4 },
        { x: 11, y: 9.5, r: 1.1 },
        { x: 7, y: 11.5, r: 0.8 },
        { x: 3.5, y: 10.5, r: 0.4 },
      ];
      drawSerpentTube(grid, points, "#4c9a3f");
      drawSerpentMarkings(grid, points, "#2f6e28", 2);
      const head = points[0];
      // forked tongue
      fillRect(grid, head.x + 2, head.y, 2.6, 0.8, "#c0392b");
      fillRect(grid, head.x + 4.2, head.y - 0.5, 0.9, 0.6, "#c0392b");
      fillRect(grid, head.x + 4.2, head.y + 0.7, 0.9, 0.6, "#c0392b");
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
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#b06a35",
        bellyColor: "#e8c79a",
        eyeColor: "#141116",
        earStyle: "pointy",
        drawHeadExtras: (grid) => {
          fillRect(grid, 18, 5, 9, 2.2, "#3b2412");
          fillRect(grid, 16, 7, 2.2, 6, "#3b2412");
        },
        drawTail: (grid) => {
          fillRect(grid, 1.5, 12, 2.4, 9, "#3b2412");
        },
      }),
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
    palette: { outline: "#241a10", body: "#8a5a3c", belly: "#e8c9a0", accent: "#e8c9a0", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#8a5a3c",
        bellyColor: "#e8c9a0",
        snoutColor: "#e8c9a0",
        eyeColor: "#141116",
        earStyle: "big-round",
        earColor: "#e8c9a0",
        drawHeadExtras: (grid) => {
          // pale face mask covering most of the face, not just the muzzle
          fillEllipse(grid, 24.3, 12.6, 3.6, 3.4, "#e8c9a0");
        },
        drawTail: (grid) => {
          const pts: [number, number][] = [
            [4, 14],
            [2, 12],
            [1.3, 9],
            [2.2, 6.5],
            [4, 5.5],
            [5.8, 5.8],
          ];
          for (const [x, y] of pts) setPixel(grid, x, y, "#8a5a3c");
        },
      }),
  },
  {
    key: "rooster",
    order: 9,
    name: { zh: "雞", en: "Rooster", ja: "トリ", ko: "닭" },
    palette: { outline: "#241206", body: "#c0392b", belly: "#f2c94c", accent: "#f2c94c", eye: "#141116" },
    locomotion: "biped",
    buildBody: () => buildRoosterBody(),
  },
  {
    key: "dog",
    order: 10,
    name: { zh: "狗", en: "Dog", ja: "イヌ", ko: "개" },
    palette: { outline: "#241a10", body: "#a9713f", belly: "#e9cfa0", accent: "#c0392b", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#a9713f",
        bellyColor: "#e9cfa0",
        snoutColor: "#5a3a20",
        eyeColor: "#141116",
        earStyle: "floppy",
        earColor: "#5a3a20",
        drawHeadExtras: (grid) => {
          // red collar band across the neck/chest
          fillRect(grid, 18, 17, 3, 1.6, "#c0392b");
        },
        drawTail: (grid) => {
          fillRect(grid, 3, 10, 2.2, 4, "#a9713f");
          fillRect(grid, 2, 8.5, 2.2, 2.4, "#a9713f");
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
          setPixel(grid, 4, 13, "#f3a6b0");
          setPixel(grid, 3, 12, "#f3a6b0");
          setPixel(grid, 4, 11.3, "#f3a6b0");
          setPixel(grid, 5, 11, "#f3a6b0");
        },
      }),
  },
];

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

