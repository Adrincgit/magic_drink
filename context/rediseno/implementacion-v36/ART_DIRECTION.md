# Hexy: connected interior scenes — v36

## Direction

Keep the approved hero. Continue into a dressing room, recording control room, and record lounge, ending at the concert encore. A single sticky environment spans the lower page; doorway progress drives reversible crossfades, while longer sections let each room breathe. Foreground text and controls remain readable HTML. Reduced motion switches environments without camera motion.

## Generated assets

Mode: built-in image_gen. The existing `public/image/hexy/world-v34/theatre.webp` was used only as an art-style reference. Each new illustration depicts a distinct room.

- `public/image/hexy/world-v36/backstage.webp`
- `public/image/hexy/world-v36/studio.webp`
- `public/image/hexy/world-v36/records.webp`

Original PNG outputs remain in the local generated-images folder. `prepare-assets.mjs` records the sources and WebP encoding.

## Exact generation prompts

### Backstage

Use case: illustration-story. Asset type: full-bleed 16:9 painted anime environment for a scroll-driven website. The supplied theatre image is a STYLE reference: keep its rich violet wood, warm brass and gold trim, rose accents, star motifs and hand-painted anime polish, but depict a distinctly DIFFERENT ROOM in that SAME BUILDING. Eye-level front view, elegant spatial perspective. No characters, no readable text, no logos, no inset panels, no UI. Central 65 percent should be quieter and darker to allow HTML content; strong interesting environmental detail at outer edges and upper/lower edges. Make the environment warm and inhabited, not an empty generic purple gradient. Wide landscape. Hexy's intimate dressing room behind the stage. On the LEFT edge a large curved vanity mirror framed in warm round incandescent bulbs, a violet upholstered chair and a dressing table with hair ribbons, brushes and closed notebooks. On the RIGHT edge a clothes rail with a navy sailor blouse with red bow and a navy witch hat with a gold star resting on a stand; rich burgundy velvet drapes frame a glimpse of the theatre entrance. Center back wall muted dusky plum paneled wood with subtle brass stars, nothing large or bright in center. Lower edge polished dark vanity counter and pink flowers. Amber rose lighting, personal backstage atmosphere.

### Studio

Use case: illustration-story. Asset type: full-bleed 16:9 painted anime environment for a scroll-driven website. The supplied theatre image is a STYLE reference: keep its rich violet wood, warm brass and gold trim, rose accents, star motifs and hand-painted anime polish, but depict a distinctly DIFFERENT ROOM in that SAME BUILDING. Eye-level front view, elegant spatial perspective. No characters, no readable text, no logos, no inset panels, no UI. Central 65 percent should be quieter and darker to allow HTML content; strong interesting environmental detail at outer edges and upper/lower edges. Make the environment warm and inhabited, not an empty generic purple gradient. Wide landscape. The control room of Hexy's magical recording studio, NOT the stage or a dressing room. Curved violet acoustic panels on upper and side walls, warm gold trim, small star-shaped lamps. At LEFT edge the brass-framed arched soundproof glass window to a quiet recording booth, no people. At RIGHT edge racks of charming analog sound equipment with small warm amber meters, coiled microphone cable and a hanging pair of navy headphones. An ornate dark-purple mixing console runs along the very bottom edge with tiny gold and blush indicator lights. Center is quiet deep smoky indigo wall and glass with reflections, uncluttered. Warm late-night creative atmosphere, painted anime, no neon cyberpunk.

### Records

Use case: illustration-story. Asset type: full-bleed 16:9 painted anime environment for a scroll-driven website. The supplied theatre image is a STYLE reference: keep its rich violet wood, warm brass and gold trim, rose accents, star motifs and hand-painted anime polish, but depict a distinctly DIFFERENT ROOM in that SAME BUILDING. Eye-level front view, elegant spatial perspective. No characters, no readable text, no logos, no inset panels, no UI. Central 65 percent should be quieter and darker to allow HTML content; strong interesting environmental detail at outer edges and upper/lower edges. Make the environment warm and inhabited, not an empty generic purple gradient. Wide landscape. A cozy listening lounge and record library connected to the studio. Tall violet wooden shelves filled with tightly packed vinyl sleeves along far LEFT and RIGHT edges, a few brass circular gold-record plaques high on the walls. Amber string lights and delicate hanging stars at the top. Near lower LEFT a charming brass and violet vintage record player on a sideboard; lower RIGHT edge a cozy velvet armchair and small plant. Center back wall calm warm plum with gold architectural molding, no repeated windows or palace exterior. Dark polished wooden floor along bottom edge. Intimate golden late-evening lighting with gentle mauve accents. No illustrated album covers readable at center, no characters, no text.

## Validation

- 30 Playwright tests passed, including four new cases for continuous environments, reversible transitions, direct navigation and reduced motion.
- Production build passed.
- Browser screenshots inspected at 390 × 844, 1440 × 1000 and 2559 × 1311.
- No browser errors or horizontal overflow in the three viewport checks.
- Review script: `review-passages.mjs`. Screenshots and build log are in this directory.
