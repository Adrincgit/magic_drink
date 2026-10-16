# Combat polish

Scope: catalog charm alignment, Ribbon acting and strong sweep, continuous Volt connections, switchable Echo companions, Jelly/Orbit utility upgrades, basic clown elemental reactions, downward dash and overhead guard acting.

The four legacy charms use individual square crops, so catalog markers cannot apply their automatic margin to the artwork. Details use an image with `object-fit: contain`.

Ribbon now uses articulated basic/overhead poses and a full-turn atlas, with a supporting two-handed wand grip. See [Ribbon action](../ribbon-action/README.md) for the current combos, spin timing, impact and damage rules. The previous eight arm-only poses remain as source history and are not used for Ribbon's current attacks.

Volt draws a complete raster discharge per connection. A chained connection begins exactly at the previous impact; target selection still measures the original centre-to-centre range.

Echo is a toggle on Xbox Y / keyboard C. It summons 1/2/3 followers whose movement trails Hexy, but whose shots occur on the same frame as her actual basic shots. There is no autonomous firing or idle ammo drain. Each companion spends one Echo charge per copied volley (not per pellet), including when Echo is in the second pocket. The held Volt beam shares the player's firing window, warm-up and billing cadence. Combined clone damage remains capped at 50/64/75% per volley. Pressing Y / C again with Echo selected dismisses companions without spending magic or ammo. Depletion dismisses them automatically.

Jelly cherries collide with the spring's sides and top from level I. Level II permits two concurrent pads; III increases upward cherry velocity from 520 to 650. Each pad lasts 6s and has three character/enemy bounce charges. A cherry can use each pad once.

Orbit II can launch its surviving shields in the aimed direction by pressing strong again. III adds a fourth smaller satellite and widens that fan. Launching spends the shields, retains the 12-point total damage budget and cannot duplicate satellites.

Only red foot soldiers (`type 0`) use the electric/fire/water/honey reaction sheet. Four cels finish before the same element can restart the reaction. Machinery and bosses retain their own drawings and collisions.

Art sources and registered outputs are recorded in `assets.json`; reproduce technical packing with `node scripts/arcade/pack-combat-polish.mjs`. The original AI outputs remain in the generator directory. Rejected handedness drafts are not used by the game. Verification captures and playback are in `tests/artifacts/arcade/combat-polish/`.

Validation on 2026-10-11: 72 checks passed across combat, workshop, shop navigation and tactical mods. A final focused run passed 39 checks, including one additional real horizontal Jelly shot test (73 unique checks overall). Chrome used one worker. Reviewed rendered desktop shop at 1920 and 2560 widths, eight-cel Ribbon sequences, sustained/chained and long Volt attacks, four elemental reaction sequences, overhead guard, downward kick and real-time recorded playback. `npm run build` completed with zero errors; Astro reported 23 existing hints. No physical gamepad session was used.

Echo synchronization correction on 2026-10-11: 55 engine regression checks and one Chrome rendering/input check passed, using one worker. Coverage includes Xbox Y hold/repress, X firing, same-frame copies at all mastery levels, no idle drain, independent pocket reserves, depletion, spread billing, blocked attacks and held Volt warm-up/release. Reviewed frames from `tests/artifacts/arcade/combat-polish/echo-sync.webm`. Xbox inputs were simulated; no physical controller was used. Build completed with zero errors and 23 existing hints.
