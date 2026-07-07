import * as fs from "fs";
import * as path from "path";
import { getCurrentZodiacInfo, getAnimalByKey } from "./zodiacInfo";
import { renderZodiacSvg } from "./render";

function parseArgs(argv: string[]): { output: string; animal?: string } {
  let output = "dist/zodiac.svg";
  let animal: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--output" && argv[i + 1]) {
      output = argv[i + 1];
      i++;
    } else if (argv[i] === "--animal" && argv[i + 1]) {
      animal = argv[i + 1];
      i++;
    }
  }
  return { output, animal };
}

function main(): void {
  const { output, animal } = parseArgs(process.argv.slice(2));

  const spec = animal ? getAnimalByKey(animal) : getCurrentZodiacInfo().animal;
  if (!spec) throw new Error(`Unknown animal: ${animal}`);

  const svg = renderZodiacSvg(spec);
  const outputPath = path.resolve(process.cwd(), output);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, svg, "utf-8");
  console.log(`Zodiac SVG (${spec.key}) written to ${outputPath}`);
}

main();
