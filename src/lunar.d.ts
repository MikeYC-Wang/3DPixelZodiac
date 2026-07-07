declare module "lunar-javascript" {
  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getYearShengXiao(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getJieQi(): string;
    getFestivals(): string[];
  }

  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    getWeek(): number;
    getFestivals(): string[];
    toFullString(): string;
  }
}
