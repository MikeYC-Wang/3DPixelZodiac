# 🐉 3D Pixel Zodiac

[繁體中文](README.md) | [English](README.en.md) | 日本語 | [한국어](README.ko.md)

「今年の干支」を自動判定し、歩行／羽ばたき／浮遊のループアニメーションを再生するレトロなピクセルアート SVG です。SMIL（`<animate>` / `<animateTransform>`）だけで動作し、JavaScript は一切使用していないため、GitHub の `README.md` に `<img>` として埋め込むだけでそのままアニメーションが再生されます。

![preview](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac.svg)

## クイック埋め込み

以下を `README.md` にコピーしてください（旧暦の年から自動計算された「今年の干支」が表示されます）：

```md
![今年の干支](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac.svg)
```

## ギャラリー（十二支すべて）

年に関係なく特定の動物を固定表示することもできます。URL のパターン：

```
https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-{animal}.svg
```

| コード | 干支 | アニメーション | プレビュー |
| --- | --- | --- | --- |
| `rat` | 子（ネズミ） | 歩行 | ![rat](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-rat.svg) |
| `ox` | 丑（ウシ） | 歩行 | ![ox](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-ox.svg) |
| `tiger` | 寅（トラ） | 歩行 | ![tiger](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-tiger.svg) |
| `rabbit` | 卯（ウサギ） | ジャンプ | ![rabbit](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-rabbit.svg) |
| `dragon` | 辰（タツ） | 浮遊 | ![dragon](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-dragon.svg) |
| `snake` | 巳（ヘビ） | 浮遊 | ![snake](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-snake.svg) |
| `horse` | 午（ウマ） | 歩行 | ![horse](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-horse.svg) |
| `goat` | 未（ヒツジ） | 歩行 | ![goat](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-goat.svg) |
| `monkey` | 申（サル） | 歩行 | ![monkey](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-monkey.svg) |
| `rooster` | 酉（トリ） | 羽ばたき | ![rooster](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-rooster.svg) |
| `dog` | 戌（イヌ） | 歩行 | ![dog](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-dog.svg) |
| `pig` | 亥（イノシシ） | 歩行 | ![pig](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-pig.svg) |

例：

```md
<!-- 年に関係なく常にトラを表示 -->
![tiger](https://cdn.jsdelivr.net/gh/MikeYC-Wang/3DPixelZodiac@output/dist/zodiac-tiger.svg)
```

## 3DPixelCalendar との関係

[3DPixelCalendar](https://github.com/MikeYC-Wang/3DPixelCalendar) は同じ作者による別のサイドプロジェクト（毎日自動更新されるピクセルカレンダーカード）です。3DPixelZodiac は完全に独立した画像で、カレンダーカードには統合されておらず、それぞれ個別に埋め込んで利用できます。

## 仕組み

- [lunar-javascript](https://www.npmjs.com/package/lunar-javascript) を使って現在の西暦日付を旧暦の年に変換し、十二支の周期（基準となる子年からの周期計算）に当てはめて今年の干支を判定します。
- 各動物の本体は単純な SVG `<rect>` によるピクセルグリッド（24×24 セル）で描かれています。歩行／羽ばたき／浮遊のアニメーションはすべて SMIL の `<animate>` / `<animateTransform>`（`calcMode="discrete"` により、滑らかな呼吸のような拡大縮小ではなく、決まったポーズ間をカクカクと切り替える方式）で駆動されているため、GitHub README の `<img>` タグ内でもアニメーションし続けます。
- GitHub Actions のスケジュールが毎日すべての干支 SVG を再生成し、`output` ブランチの `dist/` フォルダにプッシュします。`main` ブランチには生成用のソースコードのみが置かれています。

## ローカル開発

```bash
npm install
npm run build

# 「今年」の干支を生成
node dist/index.js --output dist/zodiac.svg

# 日付に関係なく特定の動物を生成
node dist/index.js --output dist/zodiac-tiger.svg --animal tiger

# 十二支すべて + 今年のエイリアス zodiac.svg を一括生成
npm run generate:all
```

## プロジェクト構成

```
src/
  zodiacInfo.ts         # 西暦 -> 旧暦年 -> 干支判定 (lunar-javascript)
  animals.ts            # 十二支すべての美術データ（配色・形状・アニメーション種別）
  pixel/grid.ts          # ピクセルグリッド描画プリミティブ + 自動輪郭線生成
  pixel/mammal.ts        # 共通の哺乳類の胴体/頭部/耳テンプレート
  pixel/limbAnimation.ts # SMIL 歩行/羽ばたき/ジャンプ/スライドアニメーション生成
  render.ts              # 最終的な SVG を組み立てる
  index.ts               # CLI：単一の SVG を生成
  generateAll.ts          # CLI：十二支すべて + 今年のエイリアスを生成
```
