# 🐉 3D Pixel Zodiac

[English](README.en.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | 繁體中文

一張會自動判斷「今年生肖」並播放走路/拍翅/漂浮循環動畫的復古像素風 SVG，用純 SMIL（`<animate>` / `<animateTransform>`）驅動、完全不用 JavaScript，任何人都可以直接嵌入自己的 GitHub `README.md` 播放動畫。

![preview](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac.svg)

## 快速嵌入

複製下面的 Markdown 到你的 `README.md`（自動顯示「今年」的生肖，依農曆年份計算）：

```md
![今年生肖](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac.svg)
```

## 十二生肖圖鑑

也可以指定任一生肖，不隨年份改變。網址格式：

```
https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-{animal}.svg
```

| 代碼 | 生肖 | 動畫 | 預覽 |
| --- | --- | --- | --- |
| `rat` | 鼠 | 走路 | ![rat](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-rat.svg) |
| `ox` | 牛 | 走路 | ![ox](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-ox.svg) |
| `tiger` | 虎 | 走路 | ![tiger](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-tiger.svg) |
| `rabbit` | 兔 | 跳躍 | ![rabbit](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-rabbit.svg) |
| `dragon` | 龍 | 漂浮 | ![dragon](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-dragon.svg) |
| `snake` | 蛇 | 漂浮 | ![snake](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-snake.svg) |
| `horse` | 馬 | 走路 | ![horse](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-horse.svg) |
| `goat` | 羊 | 走路 | ![goat](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-goat.svg) |
| `monkey` | 猴 | 走路 | ![monkey](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-monkey.svg) |
| `rooster` | 雞 | 拍翅 | ![rooster](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-rooster.svg) |
| `dog` | 狗 | 走路 | ![dog](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-dog.svg) |
| `pig` | 豬 | 走路 | ![pig](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-pig.svg) |

範例：

```md
<!-- 固定顯示虎，不隨年份改變 -->
![tiger](https://raw.githubusercontent.com/MikeYC-Wang/3DPixelZodiac/output/dist/zodiac-tiger.svg)
```

## 這跟 3DPixelCalendar 是什麼關係？

[3DPixelCalendar](https://github.com/MikeYC-Wang/3DPixelCalendar) 是同一作者的另一個獨立側專案（每日自動更新的像素日曆卡片）。3DPixelZodiac 是完全分開的圖片，不整合進日曆卡片裡，各自嵌入、各自使用。

## 運作原理

- 用 [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) 把目前的國曆日期換算成農曆年份，再依十二年循環（鼠年為基準）換算出今年生肖。
- 動物本體是純 SVG `<rect>` 像素網格拼出來的（24×24 格），走路/拍翅/漂浮動畫全部用 SMIL `<animate>` / `<animateTransform>`（`calcMode="discrete"`，逐格切換，不是平滑呼吸縮放）驅動，因此嵌入 GitHub README 的 `<img>` 也能直接播放。
- GitHub Actions 排程每天重新產生所有生肖 SVG，推送到 `output` 分支的 `dist/` 目錄；`main` 分支只放產生器原始碼。

## 本機開發

```bash
npm install
npm run build

# 產生「今年」的生肖
node dist/index.js --output dist/zodiac.svg

# 指定生肖（不依日期）
node dist/index.js --output dist/zodiac-tiger.svg --animal tiger

# 一次產生 12 生肖 + 今年別名 zodiac.svg
npm run generate:all
```

## 專案結構

```
src/
  zodiacInfo.ts         # 國曆 -> 農曆年份 -> 十二生肖判定 (lunar-javascript)
  animals.ts            # 12 隻生肖的美術資料（配色、造型、動畫類型）
  pixel/grid.ts          # 像素網格繪製工具 + 自動輪廓線
  pixel/mammal.ts        # 共用的哺乳類軀幹/頭部/耳朵版型
  pixel/limbAnimation.ts # SMIL 走路/拍翅/跳躍/游動動畫產生器
  render.ts              # 組合成最終 SVG
  index.ts               # CLI：產生單一 SVG
  generateAll.ts         # CLI：產生全部 12 生肖 + 今年別名
```
