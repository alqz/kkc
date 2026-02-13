# Mobile map labels

## Problem

On desktop, hovering over a prefecture/state shows a tooltip with the region name. This doesn't work on mobile (no hover), so users have no way to identify regions without tapping each one.

## Goal

On mobile (touch devices), display short text labels on each region of the map so users can identify them at a glance.

- Japan: kanji name (e.g. 東京, 北海道) — 2-3 characters, compact
- USA: state abbreviation (e.g. CA, NY) — 2 characters

## What we tried

Added SVG `<text>` elements inside each `<g data-code>` group, positioned at the bounding box centroid (`getBBox()` center). Shown only on touch devices via `@media (hover: none)`.

### Files changed

- **kkc.js**: Added `shortLabel` to config destructuring. Added `addMobileLabels()` that loops through regions, computes `getBBox()` center, and appends a `<text class="map-label">` to each `<g>`.
- **app.js**: Added `shortLabel: (r) => r.name` (kanji name).
- **usa.js**: Added `shortLabel: (r) => r.abbr` (state abbreviation).
- **style.css**: Added `.map-label` (hidden by default, `display: initial` inside `@media (hover: none)`). Key properties: `stroke: none` (to prevent inheriting the parent group's stroke), `pointer-events: none`, `text-anchor: middle`, `dominant-baseline: central`.

### Why it was reverted

Bounding box centroids don't produce good label positions for irregularly shaped regions. The center of a bounding box can land outside the actual shape (e.g. concave coastlines, island chains like Okinawa/Hawaii, L-shaped prefectures). Getting this right requires **visual centroids** — hand-tuned (x, y) coordinates for each region that place the label where a human would naturally read it.

## To finish this

1. Define a `labelPos` coordinate for each region in `app.js` and `usa.js` — these are hand-picked (x, y) positions in SVG coordinate space where labels look good. This is tedious but necessary.
2. Pass `labelPos` through the config and use it instead of `getBBox()` centroids in `addMobileLabels()`.
3. Consider sizing labels relative to each region's area so small prefectures get smaller text.
