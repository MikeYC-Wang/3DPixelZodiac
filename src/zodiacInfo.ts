import { Solar } from "lunar-javascript";
import { ANIMALS, AnimalSpec } from "./animals";

export interface ZodiacInfo {
  lunarYear: number;
  yearGanZhi: string;
  yearShengXiao: string;
  animal: AnimalSpec;
}

const ANIMALS_BY_ORDER = [...ANIMALS].sort((a, b) => a.order - b.order);

/** 2020 was a Rat year (order 0), so (year - 2020) mod 12 gives the cycle index. */
function animalIndexForLunarYear(lunarYear: number): number {
  return (((lunarYear - 2020) % 12) + 12) % 12;
}

function readWallClockYmd(ianaTimeZone: string): { year: number; month: number; day: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ianaTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const lookup: Record<string, string> = {};
  for (const part of parts) lookup[part.type] = part.value;
  return { year: Number(lookup.year), month: Number(lookup.month), day: Number(lookup.day) };
}

/** Resolves "this year's" zodiac animal based on the current lunar year (Chinese New Year rolls the year, not Jan 1). */
export function getCurrentZodiacInfo(ianaTimeZone = "Asia/Taipei"): ZodiacInfo {
  const { year, month, day } = readWallClockYmd(ianaTimeZone);
  return getZodiacInfoForSolarDate(year, month, day);
}

export function getZodiacInfoForSolarDate(year: number, month: number, day: number): ZodiacInfo {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const lunarYear = lunar.getYear();
  const animal = ANIMALS_BY_ORDER[animalIndexForLunarYear(lunarYear)];
  return {
    lunarYear,
    yearGanZhi: lunar.getYearInGanZhi(),
    yearShengXiao: lunar.getYearShengXiao(),
    animal,
  };
}

export function getAnimalByKey(key: string): AnimalSpec | undefined {
  return ANIMALS.find((a) => a.key === key);
}
