# KKC Design

A verbal wireframe describing what every screen and component should look like.
Use this as the source of truth when building or modifying UI.

## Main screen

The entire viewport is a warm beige background with an interactive SVG map filling the full width and height. The map can be panned by dragging and zoomed with scroll or pinch. Region borders are a soft warm gray, thin enough not to dominate.

Three floating panels sit over the map. They all share the same frosted-glass treatment: a translucent white background that blurs whatever is behind it, with a very subtle shadow. They feel like they're hovering above the map, not sitting on it.

**Top-left panel (header):** Contains the app title in bold on the first line, and the score on the second line. The score is the large bold number followed by the smaller muted denominator (like "42 / 282"). The number and denominator sit on the same text baseline. The panel hugs its content and never exceeds 45% of the viewport width.

**Top-right panel (legend):** A vertical stack of 7 color chips, one for each visit level. Each chip is a small colored square followed by the level label in small text. The chips are tightly spaced. The panel scrolls vertically if the screen is too short. It also never exceeds 45% of the viewport width, which prevents it from overlapping the header on narrow screens.

**Bottom-center bar (controls):** A horizontal row of buttons: Reset View, Share, Clear Map, More. They are centered and have small gaps between them. If the screen is too narrow, they wrap to a second row. Each button has the same frosted-glass look as the panels.

**Tooltip:** When hovering over a region on the map, a small white card appears near the cursor showing the region name in medium-weight text and the current visit level + points below it in smaller muted text. The tooltip flips to the other side of the cursor if it would go off the edge of the screen.

## Region selection modal

Tapping a region on the map opens a centered modal over a dimmed, slightly blurred backdrop. The modal is a white card with rounded corners and a soft shadow.

At the top is the region name as a bold heading, with a small muted subtitle below it saying "Select your experience level". There is a small gap between the subtitle and the first option.

Below that are 7 option rows, tightly stacked with a tiny gap between each. Each row has a colored square on the left and the level label on the right, with the point value in smaller muted text underneath the label. The currently selected level has a light blue-tinted background and a subtle blue border. Hovering over any row gives it a light gray tint.

At the bottom, separated by a bit of space from the options, is a Close button. Clicking an option selects it and closes the modal. Clicking the Close button, clicking outside the modal, or pressing Escape also closes it without changing anything.

## Share modal

A centered white card, same style as the region modal. The heading says "Share Your Map" and a muted subtitle explains what the share options do.

Below the subtitle is a read-only text input showing the shareable URL. The input has a beige background (matching the page background) so it's visually recessed compared to the white card around it.

Below the input is a row of buttons: Copy URL, Download Image, and Close. The first two fill the available width equally, and the Close button is just as wide as its text. All buttons are white with a light border, visually consistent with each other.

## More modal

A centered white card. The heading says "More".

If there are links to other versions (like "USA Version"), they appear as buttons in a horizontal row below the heading.

Below the links is a block of body text in small muted type, explaining the philosophy of the project. The text has generous line spacing for readability.

At the bottom is a Close button.

There are no horizontal lines or separators anywhere in this modal. Spacing alone creates the visual grouping.

## Buttons

All buttons across the app share the same size, font, padding, and rounded shape. They differ only in their fill treatment depending on context:

- **Over the map** (bottom controls): Frosted-glass background, matching the floating panels. On hover they become nearly opaque white. On press they become fully opaque white and shrink slightly.
- **Inside modals**: White background with a light border, blending into the white card. On hover they get a subtle gray tint. On press the tint darkens and they shrink slightly.
- **Standalone** (outside both contexts): Beige background matching the page, with a visible border. On hover the background shifts to a lighter warm gray.

In all cases, keyboard focus shows a blue outline ring.

## Color swatches

Swatches appear in the legend panel, the region selection modal options, and the downloaded image. They are small rounded squares with a visible warm-gray border slightly thicker than a hairline. This border is important because the white ("Never been") and yellow ("Walked around") swatches would otherwise disappear against light backgrounds.

## Level colors

From least to most visited: white, blue, green, yellow, orange, red, purple. The specific hex values are defined in the LEVELS array in kkc.js.

## Map interaction states

Regions start white (unvisited). When filled with a level color, the color transitions smoothly. Hovering over any region dims it slightly. The cursor changes to a pointer over regions and to a grab hand over empty map space.

## Downloaded image

A tall portrait-format PNG. The page background color fills the canvas. At the top left is the title in bold, at the top right is the score. The map is drawn in the center, scaled to fit. Along the bottom is a row of 7 small circles (one per level color) each followed by the level label. All colors in the image are read from the CSS tokens at export time, so if the tokens change, the image changes too.

## Responsive behavior

On screens 600px wide or narrower, all floating panels shrink their padding and move closer to the screen edges. The header title and score text get smaller. The button row wraps if needed. The header and legend are each capped at 45% viewport width so they never crash into each other.

## General rules

1. No raw color, size, or spacing values. Everything references a CSS token.
2. Floating elements over the map use the `.glass` class.
3. All buttons use `.btn`. Context (`.glass` or `.modal`) determines the fill variant.
4. No horizontal lines or separators inside modals.
5. Every interactive element has hover, active, and focus-visible states.
6. Tooltips bounds-check against viewport edges.
7. All modals close on Escape, overlay click, and a Close button.
