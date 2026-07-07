# 🐉 3D Pixel Zodiac

[繁體中文](README.md) | English | [日本語](README.ja.md) | [한국어](README.ko.md)

A retro pixel-art SVG that automatically figures out "this year's" Chinese zodiac animal and plays a walking / wing-flapping / slithering loop animation, driven entirely by SMIL (`<animate>` / `<animateTransform>`) — no JavaScript at all, so it plays perfectly as a plain `<img>` embedded in your GitHub `README.md`.

![preview](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac.svg)

## Quick embed

Copy this into your `README.md` (automatically shows "this year's" animal, computed from the Lunar calendar year):

```md
![this year's zodiac](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac.svg)
```

## Gallery — all 12 animals

You can also pin any specific animal regardless of the year. URL pattern:

```
https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-{animal}.svg
```

| Code | Animal | Animation | Preview |
| --- | --- | --- | --- |
| `rat` | Rat | walk | ![rat](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-rat.svg) |
| `ox` | Ox | walk | ![ox](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-ox.svg) |
| `tiger` | Tiger | walk | ![tiger](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-tiger.svg) |
| `rabbit` | Rabbit | hop | ![rabbit](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-rabbit.svg) |
| `dragon` | Dragon | slither | ![dragon](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-dragon.svg) |
| `snake` | Snake | slither | ![snake](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-snake.svg) |
| `horse` | Horse | walk | ![horse](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-horse.svg) |
| `goat` | Goat | walk | ![goat](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-goat.svg) |
| `monkey` | Monkey | walk | ![monkey](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-monkey.svg) |
| `rooster` | Rooster | wing flap | ![rooster](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-rooster.svg) |
| `dog` | Dog | walk | ![dog](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-dog.svg) |
| `pig` | Pig | walk | ![pig](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-pig.svg) |

Example:

```md
<!-- Always shows the Tiger, regardless of the current year -->
![tiger](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-tiger.svg)
```

## How does this relate to 3DPixelCalendar?

[3DPixelCalendar](https://github.com/MikeYC-Wang/3DPixelCalendar) is a separate side project by the same author (a daily auto-updating pixel calendar card). 3DPixelZodiac is a completely independent image — it is not merged into the calendar card, and each can be embedded on its own.

## How it works

- [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) converts today's Gregorian date into its Lunar calendar year, which is then mapped onto the 12-year zodiac cycle (anchored on a known Rat year).
- Every animal's body is a plain SVG `<rect>` pixel grid (24×24 cells). The walking / wing-flapping / slithering motion is driven entirely by SMIL `<animate>` / `<animateTransform>` with `calcMode="discrete"` (snapping between fixed poses, not a smooth breathing tween), so it keeps animating even inside a GitHub README `<img>` tag.
- A GitHub Actions schedule regenerates every animal's SVG daily and pushes them to the `dist/` folder of the `output` branch; the `main` branch only holds the generator source code.

## Local development

```bash
npm install
npm run build

# Generate "this year's" animal
node dist/index.js --output dist/zodiac.svg

# Generate a specific animal regardless of date
node dist/index.js --output dist/zodiac-tiger.svg --animal tiger

# Generate all 12 animals + the current-year alias zodiac.svg
npm run generate:all
```

## Project structure

```
src/
  zodiacInfo.ts         # Gregorian -> Lunar year -> zodiac animal (lunar-javascript)
  animals.ts            # Art data for all 12 animals (palette, shape, animation type)
  pixel/grid.ts          # Pixel-grid drawing primitives + automatic outline generation
  pixel/mammal.ts        # Shared mammal torso/head/ear template
  pixel/limbAnimation.ts # SMIL walk/flap/hop/slither animation generators
  render.ts              # Composes the final SVG
  index.ts               # CLI: generate a single SVG
  generateAll.ts          # CLI: generate all 12 animals + the current-year alias
```
