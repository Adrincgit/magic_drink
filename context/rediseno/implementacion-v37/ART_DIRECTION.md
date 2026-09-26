# Hexy — shared foreground across section boundaries (v37)

## Change

The page needs objects to extend across adjacent sections. A backdrop dissolve alone does not achieve that.

- Move the existing foreground foliage out of the hero's clipped room.
- Preserve its upper crown and add a matching transparent trailing silhouette that extends into the camerino.
- Allow the foreground to overflow its section while the page still clips horizontal overflow.
- Remove the large standalone passage arches and light threads.
- Shorten the passages and excessive section whitespace.
- Add hanging stars, musical ribbons and a record/sleeve ornament that extend above and below each lower join. Decorative objects ignore pointer events.
- Keep the existing room art, accessible HTML content, audio controls, character and camera interactions.

## Asset

Mode: built-in image_gen edit, using `public/image/hexy/world-v35/plants.webp` as the edit reference.

Final asset: `public/image/hexy/world-v37/trailing-plants.webp` (1672 × 941, genuine RGBA alpha; WebP quality 90, alpha quality 100).

Source retained at `C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/exec-4b14e39e-f3de-40f0-9f9f-713a5d145506.png`.

### Exact prompt

Use case: precise-object-edit. Edit the supplied transparent anime foliage overlay into a complete foreground bridge for two adjoining website sections. Preserve the same painted dark plum and olive leaves, warm golden edge lighting, pink and cream flowers, visual richness and left/right corner arrangement. The source currently stops in two straight cropped bottom edges; replace those cutoffs with natural tapered trailing vines and individual leaves extending down, so the entire lower silhouette is organic with genuine transparent gaps. Build two substantial asymmetrical clusters anchored at the far LEFT and far RIGHT sides around the upper third, cascading downward along their respective edges; leave the middle 65 percent entirely empty transparent for page text and a player. Leaf clusters should get progressively thinner downward and end in a few delicate dangling flower sprigs before the bottom of the canvas; nothing cropped at the bottom. Left and right clusters may touch the lateral canvas edges at their thickest parts. The TOP should also have irregular leaf silhouettes, not a solid rectangular block. No connecting horizontal band, no frame, no room background, no pots, no floor, no new objects, no text. Wide landscape 16:9 composition, same detailed painterly anime style as source. Output truly transparent RGBA, no checkerboard or colored background. This is the same foliage continued into the next section, not a new environment.

## Review

`review-passages.mjs` captures the entry and all lower joins at mobile 390 × 844, desktop 1440 × 1000 and wide 2559 × 1311. Images are saved in this directory. Production build log: `build.log`.

Production build passed. Browser review found no runtime errors or horizontal overflow at the three viewports. All 30 regression cases passed across the full run and targeted rerun: 28 initially passed, then the two updated cases passed. The obsolete hero-clipping expectation now verifies that foliage physically reaches the camerino while leaving Hexy interactive. Transition endpoint sampling now accounts for fractional layout positions rounding to device pixels.
