import * as fs from "fs";
import * as path from "path";
import { ANIMALS } from "./animals";
import { getCurrentZodiacInfo } from "./zodiacInfo";
import { renderZodiacSvg } from "./render";

const OUTPUT_DIR = path.resolve(process.cwd(), "dist");

function main(): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const animal of ANIMALS) {
    const svg = renderZodiacSvg(animal);
    fs.writeFileSync(path.join(OUTPUT_DIR, `zodiac-${animal.key}.svg`), svg, "utf-8");
  }

  const current = getCurrentZodiacInfo();
  const defaultSvg = renderZodiacSvg(current.animal);
  fs.writeFileSync(path.join(OUTPUT_DIR, "zodiac.svg"), defaultSvg, "utf-8");

  console.log(
    `Generated ${ANIMALS.length} zodiac SVGs + 1 default alias (currently: ${current.animal.key}, lunar year ${current.lunarYear} ${current.yearGanZhi}${current.yearShengXiao}) in ${OUTPUT_DIR}`
  );
}

main();
