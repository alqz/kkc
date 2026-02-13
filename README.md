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
| Red | 長期滞在 | Long stay (2 weeks+) | 5 |
| Purple | 居住 | Lived there (6 months+) | 6 |

Max score: 282 (47 × 6).

## Usage

Open `index.html` in a browser. Click a prefecture to set its level. Zoom and pan with scroll wheel / drag.

State persists in localStorage. Share via URL: `?d=00000000000000000000000000000000000000000000000` (47 digits, one per prefecture).

## Dev Notes

**Map centering.** The SVG viewBox is `0 0 1537 1760` (full map bounds). On load, we set a tighter initial viewBox `200 150 1100 1100` to center on Honshu. Zoom/pan manipulates the viewBox directly — no CSS transforms.

**Gap fix.** Adjacent prefectures leave hairline gaps where three borders meet. `paint-order: stroke fill` with `stroke-width: 1.5` draws the stroke behind the fill, so neighboring strokes overlap and cover the gaps.

**Drag tracking.** The scale factor (viewBox units per screen pixel) is captured once at mousedown and reused for all mousemove events. Recalculating from `getBoundingClientRect()` each frame causes lag because the rect updates asynchronously.

**Pan limits.** `clampViewBox()` restricts panning so at least 50% of the map remains visible in each axis.

**Design system.** One text color (`--text`), one border color (`--border`), one border radius (`--radius`), three font sizes (`--font-s`, `--font-m`, `--font-l`). No shadows, no bold/light weights, `system-ui` font.

**Share encoding.** The `?d=` parameter is a raw 47-digit string (one digit per prefecture, codes 1–47 in JIS order). No base64 or compression — human-readable and easy to debug.

**Geographic accuracy.** Map geometry from PA4KEV/japan-vector-map places Okinawa and Kagoshima's islands at their true geographic positions (not as insets).

## Credits

Map geometry from [PA4KEV/japan-vector-map](https://github.com/PA4KEV/japan-vector-map) (MIT).
