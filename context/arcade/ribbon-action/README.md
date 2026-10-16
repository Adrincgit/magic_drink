# Ribbon action — 2026-10-11

Ribbon is a short-range dance weapon while equipped. Sixteen registered drawings cover forward/return lashes and an overhead finisher; eight additional drawings turn Hexy through front, profile and back views. Knees, hips, torso, hair and hat change pose. A supporting two-handed wand grip stays consistent. Collision follows the painted ribbon and the body attack phase.

| Xbox input | Action | Damage per reached target |
| --- | --- | --- |
| X (tap or hold) | Alternate two lashes; holding chains them. | 1.25 |
| X, Y | Tug a small enemy closer while Hexy steps back. | 1.5 finisher |
| X, X, Y | Full turn, then tie up to three small clowns actually contacted. | 1 turn + 1 finisher |
| Y | Launch a small clown; it survives with normal campaign health. | 2.5 |
| Y, Y | Launch, then cancel recovery into a downward slam. | 2.5 + 5 |
| Horizontal direction + Y | Push away. | 2.5 |
| Down + Y | Slam directly, including an airborne target. | 5 |
| Up + Y | Explicit launcher. | 2.5 |
| Hold Y | Extend the turn to two revolutions maximum, then perform the selected finisher. | The turn deals 1 only once, even for two revolutions. |

Keyboard equivalents: **Z = X**, **C = Y**, arrows select direction. Basics cost one ammo; each Y costs five ammo and 34.5 magic. Controls appear in the shop. The automatic demonstration shows spin/bind then launch/slam. An ordinary XXY can leave a normal 4.6-health clown alive and bound.

Basic combo window: 0.3 seconds after a swing; recovery input buffer: 0.16 seconds. A new Y can interrupt a strong attack's recovery after 57% of its non-spin animation, never its anticipation. Neutral Y after a launcher selects the slam within its 0.65-second follow-up window. Holding cannot repeatedly retrigger Y. Guard, dash, damage and swapping cancel the ribbon. The paid last shot completes. No invulnerability or extra jump is granted.

## Mastery and physical reactions

- Level I: short grounded steps (10 pixels basic / 16 finisher maximum).
- Level II: 19 / 30 pixel step budgets, airborne horizontal steering, 12% faster attacks.
- Level III: 28 / 44 pixel step budgets, stronger airborne steering, 22% faster attacks.

Automatic steps and enemy tugs/pushes stop at disconnected floors and walls. Input movement still belongs to the player. Air steering changes horizontal velocity only; gravity continues normally. Damage and target cap do not increase with mastery.

Binding lasts 1.35 / 1.5 / 1.65 seconds, stays on the enemy's torso, cannot refresh itself, and grants 0.75 seconds of resistance after release. Maximum three bound clowns. The spin records successful enemy contacts separately from blocked hits.

A slammed enemy accelerates down to its floor, then emits a painted impact and pushes nearby basic clowns. The wave does not multiply damage or recursively create slams. A lethally struck clown still lands before its defeat animation finishes; score is awarded once. Machinery and bosses receive damage only; an open umbrella still protects its wearer. Ordinary moving projectiles touched by the strong ribbon are cleared; persistent fire and area hazards remain dangerous.

Small contact pauses and dedicated sounds distinguish lash, spin and floor impact. No added camera shake.

## Artwork and reproduction

Generated with the **built-in imagegen tool**. Exact prompts and selected source filenames: [prompts.json](prompts.json), [bind-prompt.json](bind-prompt.json).

`node scripts/arcade/pack-ribbon-action.mjs` packs the chosen sheets, registers foot pivots and wand tips, and excludes disconnected neighbouring-cel pixels during technical extraction. The packer does not repaint artwork.

Final project assets:

- `public/arcade/sprites/hexy/ribbon-action.webp`
- `public/arcade/sprites/hexy/ribbon-spin.webp`
- `public/arcade/sprites/effects/ribbon-slam.webp`
- `public/arcade/sprites/effects/ribbon-bind.webp`

Runtime recordings and contact frames: `tests/artifacts/arcade/ribbon-action/`, especially `ribbon-dance.webm`. They use the actual canvas renderer, fixed-step simulation and standard Xbox button mapping. Automated gamepad input is simulated, not a physical controller session.

## Validation

- 75 combat/drink/mod regression checks passed; the final focused run passed 25 checks including one additional umbrella-block regression (76 distinct engine checks overall).
- Browser checks passed for the recorded combo sequence and the real shop/practice flow at 1920 and 2560 pixels. Practice did not alter the wallet/save or advance the paused campaign.
- Reviewed rendered pull, bind, launch, impact, full-turn frames, a contact sheet from the recording, and the 1920-pixel shop layout.
- `npm run build` passed: Astro reported 0 errors, 0 warnings and 23 existing hints; production output completed.

Logs: `ribbon-action-tests.log`, `ribbon-action-final-check.log`, `ribbon-action-browser.log`, `ribbon-action-build.log` in `tests/artifacts/arcade/`.

