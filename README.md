# KKC

Interactive map for tracking visits to Japan's 47 prefectures (or USA's 50 states), color-coded by experience level. Static HTML/CSS/JS — no build tools, no dependencies. Also available as a [USA version](https://alqz.github.io/kkc/usa.html).

[Try it live](https://alqz.github.io/kkc/) | [Example colored map](https://alqz.github.io/kkc/index.html?d=54440010412353124014414014444400141000040000000)

## Levels

| Level | Japanese | English | Points |
|-------|----------|---------|--------|
| 0 | 未踏 | Never been | 0 |
| 1 | 通過 | Passed through | 1 |
| 2 | 接地 | Set foot on | 2 |
| 3 | 訪問 | Walked around | 3 |
| 4 | 宿泊 | Stayed overnight | 4 |
| 5 | 長期滞在 | Extended stay (2w+) | 5 |
| 6 | 居住 | Lived there (6m+) | 6 |

Max score: 282 (47 × 6) for Japan, 300 (50 × 6) for USA.

## Usage

Open `index.html` (Japan) or `usa.html` (USA) in a browser. Click a region to set its level. Zoom with scroll wheel or pinch, pan by dragging.

State persists in localStorage and the URL. Share via `?d=` parameter — a raw digit string (one digit per region in code order). No base64 or compression.

## Architecture

- **`kkc.js`** — Shared engine. Handles state, rendering, modals, tooltips, and zoom/pan. Configured via `initKKC(cfg)`.
- **`app.js`** — Japan config (47 prefectures, JIS codes 1–47).
- **`usa.js`** — USA config (50 states, alphabetical codes 1–50).
- **`style.css`** — CSS variables and SVG interaction styles that can't be expressed as Tailwind utilities.
- **`index.html` / `usa.html`** — SVG map geometry and HTML shell.

## Dev notes

**ViewBox zoom/pan.** Zoom and pan manipulate the SVG `viewBox` directly — no CSS transforms. The scale factor is captured once at mousedown/touchstart and reused for all move events to avoid async lag from `getBoundingClientRect()`.

**Gap fix.** `paint-order: stroke fill` with `stroke-width: 1.2` draws strokes behind fills, so neighboring region strokes overlap and cover hairline gaps at triple borders.

**Pan limits.** `clampViewBox()` keeps at least 50% of the map visible in each axis.

## Credits

Japan map geometry from [PA4KEV/japan-vector-map](https://github.com/PA4KEV/japan-vector-map) (MIT).
