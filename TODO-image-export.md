# Image export

## Status

Temporarily removed. The exported PNG needs a visual redesign before shipping.

## Previous implementation

`downloadImage()` in `kkc.js` rendered a 1080x1350 canvas PNG with the map, title, score, legend, and URL. It cloned the SVG, inlined strokes, and used `canvas.toBlob()` to download.

## Config properties (to re-add)

- **`imageVB`** — viewBox for the export crop. Japan: `{ x: 50, y: 0, w: 1437, h: 1500 }` (excludes Okinawa). USA: same as `fullVB`.
- **`imageInset`** — optional inset for cropped regions. Japan: `{ vb: { x: 0, y: 1450, w: 400, h: 350 }, label: '沖縄' }`.
- **`siteUrl`** — URL shown on image. Japan: `'alqz.github.io/kkc'`, USA: `'alqz.github.io/kkc/usa'`.

## Design goals

1. No rectangular ocean border — map sits on blue ocean fill, surrounding area is beige
2. Bigger title/score/legend to fill the vertical space
3. Okinawa in an inset box (bottom-left, like standard Japanese map convention) instead of stretching the full viewBox
4. URL at the bottom
5. Title should say "KKC Japan" / "KKC USA"

## Key helpers (reusable when re-implementing)

```js
function cloneSvg(vb) {
  const svg = document.querySelector('#mapContainer svg').cloneNode(true);
  svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  svg.removeAttribute('style');
  svg.removeAttribute('class');
  svg.setAttribute('width', vb.w);
  svg.setAttribute('height', vb.h);
  svg.querySelectorAll('polygon, path').forEach(el => {
    el.setAttribute('stroke', imgBorder);
    el.setAttribute('stroke-width', '1.5');
    el.style.cssText = '';
  });
  svg.querySelectorAll('g[data-code]').forEach(g => { g.style.cssText = ''; });
  return svg;
}

function svgToImage(svg) {
  return new Promise((resolve, reject) => {
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}
```

## What still needs work

- Layout proportions — the title, map, legend, and URL spacing needs visual tuning
- Inset box size and position needs to look natural
- The overall image should feel as polished as the interactive page
