import { Grid, createGrid, fillEllipse, fillRect, setPixel } from "./pixel/grid";
import { buildMammalBody } from "./pixel/mammal";

export type Lang = "zh" | "en" | "ja" | "ko";
export type Locomotion = "walk" | "hop" | "biped" | "slither";

export interface Palette {
  outline: string;
  body: string;
  belly: string;
  accent: string;
  eye: string;
}

export interface SegmentDef {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  isHead?: boolean;
  /** Extra local details (horns/eye/tongue/...) drawn onto this segment's own small grid, in local coords. */
  extra?: (grid: Grid, localCx: number, localCy: number) => void;
}

export interface AnimalSpec {
  key: string;
  order: number; // 0 = rat ... 11 = pig, matches the 12-year cycle
  name: Record<Lang, string>;
  palette: Palette;
  locomotion: Locomotion;
  /** walk / hop / biped: builds the torso+head silhouette (legs/wings added separately). */
  buildBody?: () => Grid;
  /** slither (snake / dragon): each segment animates independently. */
  segments?: SegmentDef[];
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
            [6, 12],
            [4, 13],
            [2, 12.5],
            [0.5, 11],
          ];
          for (const [x, y] of pts) setPixel(grid, x, y, "#8d8a94");
          setPixel(grid, 0, 10.5, "#e8a9b8");
        },
      }),
  },
  {
    key: "ox",
    order: 1,
    name: { zh: "牛", en: "Ox", ja: "ウシ", ko: "소" },
    palette: { outline: "#241608", body: "#7d5330", belly: "#c99a63", accent: "#e9e0cb", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#7d5330",
        bellyColor: "#c99a63",
        eyeColor: "#141116",
        earStyle: "round",
        drawHeadExtras: (grid) => {
          fillRect(grid, 21, 2, 2, 2, "#e9e0cb");
          fillRect(grid, 25, 2, 2, 2, "#e9e0cb");
        },
        drawTail: (grid) => {
          fillRect(grid, 3, 12, 3, 1, "#7d5330");
          fillEllipse(grid, 2, 14, 1.3, 1.3, "#e9e0cb");
        },
      }),
  },
  {
    key: "tiger",
    order: 2,
    name: { zh: "虎", en: "Tiger", ja: "トラ", ko: "호랑이" },
    palette: { outline: "#241206", body: "#ea7c1e", belly: "#fff3df", accent: "#221008", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#ea7c1e",
        bellyColor: "#fff3df",
        eyeColor: "#141116",
        earStyle: "pointy",
        drawMarkings: (grid) => {
          const stripes: [number, number, number][] = [
            [9, 8, 2],
            [12, 7, 2],
            [16, 8, 3],
            [19, 9, 2],
            [22, 4, 2],
          ];
          for (const [x, y, h] of stripes) fillRect(grid, x, y, 1, h, "#221008");
        },
        drawTail: (grid) => {
          fillRect(grid, 3, 11, 3, 1, "#ea7c1e");
          fillRect(grid, 1, 10, 1, 2, "#221008");
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
        drawHeadExtras: (grid) => {
          fillRect(grid, 21, 0, 1, 5, "#f2a6c1");
          fillRect(grid, 25, 0, 1, 5, "#f2a6c1");
        },
        drawTail: (grid) => {
          fillEllipse(grid, 5, 13, 1.6, 1.6, "#ffffff");
        },
      }),
  },
  {
    key: "dragon",
    order: 4,
    name: { zh: "龍", en: "Dragon", ja: "タツ", ko: "용" },
    palette: { outline: "#0d2e1c", body: "#2f9e5f", belly: "#d8f5c4", accent: "#e8c94b", eye: "#141116" },
    locomotion: "slither",
    segments: buildSerpentSegments({
      count: 6,
      color: "#2f9e5f",
      startX: 27,
      startY: 10,
      stepX: -4.2,
      wave: 2.2,
      rx: 3.1,
      ry: 2.5,
      shrink: 0.32,
      headExtra: (grid, cx, cy) => {
        fillRect(grid, cx - 1, cy - 5, 1, 3, "#e8c94b");
        fillRect(grid, cx + 2, cy - 5, 1, 3, "#e8c94b");
        setPixel(grid, cx + 2, cy - 1, "#141116");
        fillRect(grid, cx + 3, cy + 1, 2, 1, "#e8c94b");
      },
    }),
  },
  {
    key: "snake",
    order: 5,
    name: { zh: "蛇", en: "Snake", ja: "ヘビ", ko: "뱀" },
    palette: { outline: "#12240f", body: "#4c9a3f", belly: "#d9e8a8", accent: "#c0392b", eye: "#141116" },
    locomotion: "slither",
    segments: buildSerpentSegments({
      count: 7,
      color: "#4c9a3f",
      startX: 28,
      startY: 11,
      stepX: -3.6,
      wave: 3,
      rx: 2.4,
      ry: 2,
      shrink: 0.22,
      headExtra: (grid, cx, cy) => {
        fillRect(grid, cx + 2, cy, 2, 1, "#c0392b");
        setPixel(grid, cx + 1, cy - 1, "#141116");
      },
    }),
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
          fillRect(grid, 18, 2, 8, 2, "#3b2412");
          fillRect(grid, 16, 4, 2, 6, "#3b2412");
        },
        drawTail: (grid) => {
          fillRect(grid, 2, 9, 2, 8, "#3b2412");
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
        earStyle: "floppy",
        drawHeadExtras: (grid) => {
          fillRect(grid, 22, 1, 1, 3, "#cbbfa0");
          fillRect(grid, 26, 1, 1, 3, "#cbbfa0");
          fillRect(grid, 24, 11, 1, 2, "#cbbfa0");
        },
        drawTail: (grid) => {
          fillEllipse(grid, 5, 12.5, 1.4, 1.4, "#efe6d6");
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
        earStyle: "round",
        drawTail: (grid) => {
          const pts: [number, number][] = [
            [4, 11],
            [2, 9],
            [1.5, 6],
            [3, 4],
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
    palette: { outline: "#241a10", body: "#a9713f", belly: "#e9cfa0", accent: "#4a2f18", eye: "#141116" },
    locomotion: "walk",
    buildBody: () =>
      buildMammalBody({
        bodyColor: "#a9713f",
        bellyColor: "#e9cfa0",
        eyeColor: "#141116",
        earStyle: "floppy",
        earColor: "#4a2f18",
        drawTail: (grid) => {
          fillRect(grid, 3, 8, 2, 5, "#a9713f");
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
        snoutColor: "#f3a6b0",
        eyeColor: "#141116",
        earStyle: "round",
        drawHeadExtras: (grid) => {
          setPixel(grid, 26, 10, "#c96b78");
          setPixel(grid, 28, 10, "#c96b78");
        },
        drawTail: (grid) => {
          setPixel(grid, 4, 10, "#f3a6b0");
          setPixel(grid, 3, 9, "#f3a6b0");
          setPixel(grid, 4, 8.5, "#f3a6b0");
        },
      }),
  },
];

/** Builds a chain of overlapping segment ellipses for a slithering snake/dragon, largest at the head end. */
function buildSerpentSegments(opts: {
  count: number;
  color: string;
  startX: number;
  startY: number;
  stepX: number;
  wave: number;
  rx: number;
  ry: number;
  shrink: number;
  headExtra: (grid: Grid, cx: number, cy: number) => void;
}): SegmentDef[] {
  const out: SegmentDef[] = [];
  for (let i = 0; i < opts.count; i++) {
    const cx = opts.startX + i * opts.stepX;
    const cy = opts.startY + Math.sin(i * 1.1) * opts.wave;
    const scale = 1 - i * opts.shrink * 0.5;
    out.push({
      cx,
      cy,
      rx: Math.max(1.4, opts.rx * scale),
      ry: Math.max(1.2, opts.ry * scale),
      color: opts.color,
      isHead: i === 0,
      extra: i === 0 ? opts.headExtra : undefined,
    });
  }
  return out;
}

function buildRoosterBody(): Grid {
  const grid = createGrid(32, 22);
  const body = "#c0392b";
  const belly = "#8a2416";
  const comb = "#f2c94c";
  const beak = "#f2a71b";
  fillEllipse(grid, 15, 12, 6.5, 5, body);
  fillEllipse(grid, 15, 15, 4.5, 2.6, belly);
  fillEllipse(grid, 22, 9, 4, 4, body);
  fillRect(grid, 25.5, 9, 2, 1, beak);
  fillRect(grid, 19.5, 3, 1, 2, comb);
  fillRect(grid, 21, 2, 1, 3, comb);
  fillRect(grid, 22.5, 2.5, 1, 2.5, comb);
  fillRect(grid, 20, 11, 1, 1.5, "#c0392b");
  setPixel(grid, 23, 8, "#141116");
  // tail feather plume
  fillRect(grid, 6, 6, 2, 8, "#8a2416");
  fillRect(grid, 4, 5, 2, 8, comb);
  fillRect(grid, 2, 6, 2, 7, body);
  return grid;
}
