# Decor celebration effects

October 19, 2026. Reference: the user's supplied screen recording. The rare reveal around 6.4 seconds shows white five-point stars with blue halos and smaller gold glints. The set-card sequence around 10 seconds adds two sprays of tumbling colorful confetti and a few sparkles. These effects are recreated with application code; no frames or game animation files are shipped.

## Completing a set

A set is one existing costume/design row: for example, standard Chef Hat and rare Chef Hat are separate sets. Only the available colors or numbered designs in that row are required. `setCompletion.js` precomputes the sets and detects incomplete → complete transitions. `useSetCompletion.js` watches collection updates, so manual toggles and bulk selection use the same rule. Existing complete saves do not celebrate on initial load; revealing a rare row or removing an item also does not count. Uncollecting and later completing the set again does count. A bulk update that completes several sets produces one event containing all newly completed sets.

`SetCompletionCelebration.jsx` mounts one pointer-transparent viewport canvas and a short accessible confirmation message. It anchors the sprays to the first newly completed row visible in the viewport, with a viewport fallback. `setConfetti.js` draws two upward/inward sprays of small pink, yellow, green, blue, and cream pieces, with gravity, drag, tumbling, and nine small gold glints. The burst lasts about 2.2 seconds; the message/cleanup fallback lasts at most 2.4 seconds. A newer completion replaces the active effect rather than accumulating canvases. Resize, hidden-tab transitions, and unmount stop the drawing. Reduced-motion users get the message without particles.

Performance: no new library or image assets; 76 confetti particles on narrow viewports or 112 on desktop, plus nine sparkles. Canvas backing resolution is capped at 2× device scale. One RAF loop exists only during a burst; the canvas and message are removed afterward. Controls remain usable throughout. Source: `setConfetti.js`, `SetCompletionCelebration.jsx`, `set-completion.css`, `setCompletion.js`, and `useSetCompletion.js` under `src/features/decor/`. The app shell mounts the overlay once; costume rows expose a stable `data-decor-set` anchor. Collection IDs/storage are unchanged.

## Selecting a rare tile

Only costumes whose names end with ` (Rare)` use the star variant (`isRareCostume` in `collection.js`), covering 74 existing entries. Gold-themed event costumes do not automatically qualify. `DecorGroup.jsx` passes a stable boolean to the memoized image tile. `RareTileStars.jsx` draws five white SVG stars with blue glow and three smaller gold four-point glints; CSS supplies staggered expansion, slight outward movement, rotation, and fade over 600ms plus up to 90ms delay. The tile keeps its small 7.5% pop with a 720ms duration so the stars can finish. Rare collection renders no confetti-ring pieces.

Regular tiles retain the approved 400ms pop / 380ms confetti ring. Uncollecting retains the 220ms settling dip. Stars/confetti are created only during collection and removed at animation end. `useDecorTileMotion.js` also clears interrupted effects after 900ms or when reduced motion becomes enabled, with no idle listener/timer per tile. Reduced motion skips both tile effects. Saved collected tiles load without particles.

Each rare burst now varies every star/glint's starting position by up to 3px on each axis around its original anchor. `RareTileStars.jsx` chooses the offsets once when the burst mounts, holds them steady through rerenders, and generates fresh positions on the next collection. Star count, sizes, colors, glow, delays, duration, and movement relative to each starting point are unchanged. This adds no animation loop or work to idle tiles.

To tune the rare effect, edit the anchor positions and 3px random offset range in `RareTileStars.jsx` and sizes, glow, timing, and `rare-star-burst` in `decor-tile-motion.css`. To restore fixed positions, map `STARS` directly instead of the per-burst state. To tune the set blast, edit the palette, counts, velocity/gravity, duration, and sparkles in `setConfetti.js`; message styling is in `set-completion.css`. Set detection and storage do not need changes for visual revisions.

## Verification

- October 19 position variation: two browser bursts each rendered eight stars/glints, with fresh coordinates within 3px of every original anchor. Movement offsets and delays matched between bursts. Removing the test selection restored its original uncollected state and left zero star nodes. Production build passed; no CSS or collection/storage changes were needed.
- All 23 automated tests and the production build pass. Tests cover the last required color, saved complete sets, unrelated edits/removals, combined bulk completion, numbered/single-color sets, true recompletion, and rare-only classification alongside the existing 896-image and progress tests.
- Browser: partial Fairy Lights collection had no set celebration; selecting the last design mounted one canvas/message. Reloading its saved complete state did not replay it. Bulk selection also mounted one celebration. Timed cleanup removed the canvas.
- Reduced-motion testing kept the completion message with no drawing, and rare selection produced no star/confetti nodes. Regular selection still produced eight confetti pieces and no stars; rare selection produced eight star/glint SVGs and no confetti pieces. Saved rare selections loaded without stars.
- Phone viewport: 375px content width matched the viewport; the set message fit and the star burst did not cause horizontal overflow. This is viewport emulation rather than physical-phone frame-rate testing.
- Test selections, Show all/Quick select modes, reduced-motion emulation, and viewport overrides were restored.

The existing animation experiment log retains prior visual trials; this addition keeps the approved regular tile style and layers the requested rare and set-completion behaviors alongside it.
