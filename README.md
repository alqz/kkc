# 経県値 KKC

Interactive map of Japan's 47 prefectures, color-coded by how deeply you've visited each one. Static HTML/CSS/JS — no build tools, no dependencies.

**[Try it live](https://alqz.github.io/kkc/)** · [Example](https://alqz.github.io/kkc/?d=40000003112434002440041004433400400000000000000)

## Levels

| Color | Label | Meaning | Points |
|-------|-------|---------|--------|
| White | 未踏 | Never been | 0 |
| Blue | 通過 | Passed through | 1 |
| Green | 接地 | Brief stop | 2 |
| Yellow | 散策 | Walked around | 3 |
| Orange | 宿泊 | Stayed overnight | 4 |
| Red | 長期滞在 | Long stay | 5 |
| Purple | 居住 | Lived there | 6 |

Max score: 282 (47 × 6).

## Usage

Open `index.html` in a browser. Click a prefecture to set its level. Zoom and pan with scroll wheel / drag.

State persists in localStorage. Share via URL: `?d=00000000000000000000000000000000000000000000000` (47 digits, one per prefecture).

## Credits

Map geometry from [PA4KEV/japan-vector-map](https://github.com/PA4KEV/japan-vector-map) (MIT).
