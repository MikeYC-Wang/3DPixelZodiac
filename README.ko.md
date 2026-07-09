# 🐉 3D Pixel Zodiac

[繁體中文](README.md) | [English](README.en.md) | [日本語](README.ja.md) | 한국어

"올해의 띠"를 자동으로 판별해서 걷기 / 날개짓 / 부유 반복 애니메이션을 재생하는 레트로 픽셀 아트 SVG입니다. 오직 SMIL(`<animate>` / `<animateTransform>`)만으로 동작하며 JavaScript는 전혀 사용하지 않으므로, GitHub `README.md`에 `<img>`로 삽입하기만 해도 애니메이션이 그대로 재생됩니다.

![preview](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac.svg)

## 빠른 삽입

아래 내용을 `README.md`에 복사하세요 (음력 연도를 기준으로 계산된 "올해의 띠"가 자동으로 표시됩니다):

```md
![올해의 띠](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac.svg)
```

## 갤러리 — 12지신 전체

연도와 상관없이 특정 동물을 고정해서 보여줄 수도 있습니다. URL 형식:

```
https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-{animal}.svg
```

| 코드 | 띠 | 애니메이션 | 미리보기 |
| --- | --- | --- | --- |
| `rat` | 쥐 | 걷기 | ![rat](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-rat.svg) |
| `ox` | 소 | 걷기 | ![ox](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-ox.svg) |
| `tiger` | 호랑이 | 걷기 | ![tiger](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-tiger.svg) |
| `rabbit` | 토끼 | 뛰기 | ![rabbit](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-rabbit.svg) |
| `dragon` | 용 | 부유 | ![dragon](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-dragon.svg) |
| `snake` | 뱀 | 부유 | ![snake](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-snake.svg) |
| `horse` | 말 | 걷기 | ![horse](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-horse.svg) |
| `goat` | 양 | 걷기 | ![goat](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-goat.svg) |
| `monkey` | 원숭이 | 걷기 | ![monkey](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-monkey.svg) |
| `rooster` | 닭 | 날개짓 | ![rooster](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-rooster.svg) |
| `dog` | 개 | 걷기 | ![dog](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-dog.svg) |
| `pig` | 돼지 | 걷기 | ![pig](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-pig.svg) |

예시:

```md
<!-- 연도와 상관없이 항상 호랑이를 표시 -->
![tiger](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-tiger.svg)
```

## 3DPixelCalendar와의 관계

[3DPixelCalendar](https://github.com/MikeYC-Wang/3DPixelCalendar)는 같은 작성자의 또 다른 사이드 프로젝트(매일 자동 업데이트되는 픽셀 캘린더 카드)입니다. 3DPixelZodiac은 완전히 독립적인 이미지이며, 캘린더 카드에 통합되지 않고 각각 따로 삽입해서 사용할 수 있습니다.

## 작동 원리

- [lunar-javascript](https://www.npmjs.com/package/lunar-javascript)를 사용해 오늘의 양력 날짜를 음력 연도로 변환하고, 12년 주기(기준이 되는 쥐띠 해를 기점으로)에 대입해 올해의 띠를 계산합니다.
- 각 동물의 몸체는 단순한 SVG `<rect>` 픽셀 그리드(24×24 셀)로 그려집니다. 걷기 / 날개짓 / 부유 애니메이션은 모두 SMIL `<animate>` / `<animateTransform>`(`calcMode="discrete"`로 부드러운 호흡 같은 확대/축소가 아니라 정해진 포즈 사이를 딱딱 끊어서 전환)으로 구동되므로, GitHub README의 `<img>` 태그 안에서도 계속 애니메이션됩니다.
- GitHub Actions 스케줄이 매일 모든 띠의 SVG를 다시 생성해서 `output` 브랜치의 `dist/` 폴더에 푸시합니다. `main` 브랜치에는 생성기 소스 코드만 있습니다.

## 로컬 개발

```bash
npm install
npm run build

# "올해"의 띠 생성
node dist/index.js --output dist/zodiac.svg

# 날짜와 상관없이 특정 동물 생성
node dist/index.js --output dist/zodiac-tiger.svg --animal tiger

# 12지신 전체 + 올해 별칭(zodiac.svg) 한 번에 생성
npm run generate:all
```

## 프로젝트 구조

```
src/
  zodiacInfo.ts         # 양력 -> 음력 연도 -> 띠 판정 (lunar-javascript)
  animals.ts            # 12지신 전체의 아트 데이터 (색상, 형태, 애니메이션 종류)
  pixel/grid.ts          # 픽셀 그리드 드로잉 유틸 + 자동 윤곽선 생성
  pixel/mammal.ts        # 공통 포유류 몸통/머리/귀 템플릿
  pixel/limbAnimation.ts # SMIL 걷기/날개짓/뛰기/스르르 움직임 애니메이션 생성기
  render.ts              # 최종 SVG 조합
  index.ts               # CLI: 단일 SVG 생성
  generateAll.ts          # CLI: 12지신 전체 + 올해 별칭 생성
```
