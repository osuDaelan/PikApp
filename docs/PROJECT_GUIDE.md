# PikApp project guide

Last reviewed: October 21, 2026, against the local source before starting the decor map. This is the current project overview; implementation details remain in the linked modules and focused notes. Proposed work is labeled separately from existing behavior.

## Purpose and current status

PikApp is an all-in-one Pikmin Bloom companion. Different tools belong in separate features; navigation, shared controls, visual theme, and progress storage connect them.

| Area | Implemented now | Remaining work |
| --- | --- | --- |
| Now / calculator | Level requirements through 120, daily averages, step/flower forecasts, coin estimates, stats editor | Separate forecast correctness review; requirements above 120 are not in the dataset |
| Decor checklist | 896 stable entries, regular/rare/event and numbered designs, local artwork, collection totals, bulk selection, rare unlock rules | Search/filters, real-device performance measurements, any future catalogue expansion |
| Decor effects | Regular pop/confetti, rare stars, three-second new-item sparkles, set-completion celebration | Further appearance changes only as needed; archive replaced experiments |
| Appearance | Official app icon and three Nintendo Garden wallpapers selected by local time | No active wallpaper or particle debug controls |
| Progress | Browser autosave for calculator and collection; private calculator file backup during localhost development | Collection file backup, portable export/import, account login, cloud sync |
| Hosting | GitHub Pages build/deployment workflow prepared | Successful public deployment has not been confirmed; last setup showed a private-repository plan/visibility restriction |
| Decor map | Planning only; confirmed direction is location discovery and personal pins | Define the first slice and data source, then implement incrementally |

There is currently no map library, router, authentication SDK, cloud database, geolocation flow, or location dataset. Runtime dependencies are React and React DOM; Vite provides development and builds. See [package.json](../package.json).

## Where to find project knowledge

| Document | Responsibility |
| --- | --- |
| [README](../README.md) | Setup commands, storage compatibility reference, hosting instructions, and the existing reference-site investigation |
| This guide | Current architecture, decisions, ownership, limitations, and change workflow |
| [TODO](../TODO.md) | Completed milestones and actionable remaining work |
| [Decor map plan](DECOR_MAP_PLAN.md) | Proposed map boundary, decisions still needed, and implementation sequence |
| [Image rollout](DECOR_IMAGE_ROLLOUT.md) | Artwork rollout, representative-image limitations, performance work and measurements |
| [Celebrations](DECOR_CELEBRATIONS.md) | In-game reference observations and implemented particle/celebration behavior |
| [Animation experiments](DECOR_ANIMATION_EXPERIMENTS.md) | Retired styles, source snapshots, and the accepted regular-tile style |
| [Asset inventory](decor-image-sources.json) / [attribution](../public/images/ATTRIBUTION.md) | Per-image source URLs, dimensions, bytes, checksums, representative flags, and source acknowledgements |

Keep one owner for each kind of note: record current behavior here, tasks in TODO, map decisions in the map plan, and detailed effect trials in their existing logs. Historical notes describe earlier experiments and are not specifications for current behavior.

## Source ownership

Paths below are relative to the project root.

| Path / important symbols | Owns |
| --- | --- |
| `src/main.jsx` | Development backup restore before React mounts; production entry point |
| `src/App.jsx` | App shell, feature state instances, active section, responsive layout, global celebration mounting |
| `src/shared/components/Navigation.jsx` / `TABS` | Current Now and Decor section buttons |
| `src/features/calculator/levelData.js` / `MAX_KNOWN` | Level requirements and current dataset limit |
| `src/features/calculator/calculations.js` | Pure requirements, forecasts, and coin calculations |
| `src/features/calculator/useCalculator.js` | Saved calculator values, editor drafts/actions, derived projections |
| `src/features/calculator/{CalculatorSection,StatsEditor,LevelBadge}.jsx` | Calculator presentation and editing controls |
| `src/features/decor/catalog.js` | Category/costume/color/design definitions, icons, species order |
| `src/features/decor/collection.js` / `decorId`, `isRareLocked` | Stable collection IDs, counts, base/rare rules |
| `src/features/decor/useDecorCollection.js` | One collection state owner, single/bulk changes, completion detection wiring |
| `src/features/decor/{DecorSection,DecorGroup}.jsx` | Tracker sections, costume rows, availability and rare visibility |
| `src/features/decor/{decorImages,decorImageData}.js` | Stable ID to image metadata; base-path-aware image URLs |
| `src/features/decor/DecorImageTile.jsx`, `decor-image-tile.css` | Memoized accessible image button, collected state, image fallback |
| `src/features/decor/useDecorTileMotion.js`, `decor-tile-motion.css` | Selection/removal animation lifecycle and regular pop/confetti |
| `src/features/decor/{RareTileStars,NewDecorSparkles}.jsx`, `new-decor-sparkles.css`, `sparkleLayout.js` | SVG particles, three-second glow/twinkles, random positions and protected center |
| `src/features/decor/{setCompletion,useSetCompletion,setConfetti}.js`, `SetCompletionCelebration.jsx`, `set-completion.css` | Set transitions, global canvas burst, completion message |
| `src/features/wallpapers/` | Official image catalogue, local-time schedule, refresh on time/focus/visibility changes |
| `src/shared/components/` | Header/clock, navigation, inputs, rings, local backup status |
| `src/shared/{hooks,styles}/`, `src/shared/format.js` | Persisted-state/window hooks, theme/layout helpers, formatting |
| `src/storage/progressStore.js` / `createProgressStore` | Synchronous browser storage contract and guest/account cache namespaces |
| `src/storage/{calculatorBackupData,localCalculatorBackup}.js` | Calculator backup schema, browser client and startup restoration |
| `dev/localCalculatorBackup.js`, `vite.config.js` | Development-only file endpoint and private-file protection |
| `public/images/` | Decor PNGs, app icon JPG, Garden WebP wallpapers |
| `tests/` | Node regression tests for pure logic, catalogue/assets, storage, effects layout, and backup behavior |
| `.github/workflows/deploy.yml` | Dependency install, tests, repository-base-path build, Pages deployment |

## Runtime and state flow

1. In development, `main.jsx` attempts to restore the private calculator backup before mounting React. Production skips that restore.
2. `App.jsx` creates `useCalculator()` and `useDecorCollection()` once. Section changes use these same state owners rather than making independent copies.
3. Saved fields initialize through `useProgressState()` and `progressStore.read()`. Committed state changes write through `progressStore.write()`.
4. Feature components receive state and actions. Calculator calculations stay in the calculator feature; catalogue/counting/rarity rules stay in the decor feature.
5. Decor state transitions trigger temporary effects. Loading existing collected entries does not replay selection or set-completion effects.
6. `AppHeader` owns its one-second clock. Wallpaper timing lives in its own feature. Neither belongs in collection logic.

The stats editor keeps drafts until **Save** applies them. Daily averages save directly. Below level 100, step input can represent lifetime total or remaining steps depending on the mode; at level 100 and above it represents remaining steps. Flower input represents remaining flowers. Preserve these meanings when extending storage or using projections elsewhere.

### Layout constraints before a third section

- Below 720px: section navigation spans the bottom of the screen.
- From 720px: navigation floats and calculator cards can use a wider layout.
- At 1100px and above: `App.jsx` always renders Now and Decor side by side and hides navigation. The selected tab is ignored in this layout.
- Active section is component state initialized to `now`; there are no URL routes or shareable section links.
- The level badge, stats editor and development backup status are currently wired into the shared shell. Decide which belong on a map view rather than automatically placing every existing control above it.

Adding a Map button alone would leave the map inaccessible on desktop. Update shell layout and navigation together. The proposed approach is in [the map plan](DECOR_MAP_PLAN.md).

## Decor data and visual pipeline

`catalog.js` defines groups, each containing costumes and either species colors or numbered designs. `decorId(location, costume, variant)` creates the saved key; for example `restaurant__chef_hat__Red`. It slugifies the location and costume and preserves the variant. Renaming a category/costume or variant can therefore change saved IDs even if it looks like a harmless label change. Keep IDs stable or supply an explicit tested migration.

`DecorGroup.jsx` selects applicable variants, constructs their IDs, looks up image metadata, and passes each to `DecorImageTile.jsx`. Only available species render, packed from the first position in the shared species order. Numbered designs render their own entries. Rare costume detection currently depends on the name ending in ` (Rare)`; a matching base costume must be complete unless **Show all** bypasses the visibility rule.

The 896 entries comprise 469 regular/rare and 427 special/event entries. They have 896 local transparent PNG mappings in `decorImageData.js`. Files total about 27 MiB. Thirty-six catalogue entries group multiple in-game designs and deliberately use representative artwork; this does not mean all possible in-game designs have separate checklist entries. Provenance and flags live in the asset inventory.

Pikmin and decor are already combined in each image. PikApp has no 3D models, skeletons, bone attachments, or animation clips. React displays an image; CSS moves the image and decorative elements; SVG draws tile stars; canvas draws the set-completion burst. The external tracker was investigated for reference, not copied as an implementation template. See the existing [Pikmin Decor Visuals and Animations research](../README.md#pikmin-decor-visuals-and-animations).

### Accepted visual decisions

- Official existing Nintendo/game artwork, rather than AI-generated images. Sources are recorded; redistribution permission is still unresolved.
- Image tiles are 76×120px with contained artwork. Uncollected art is muted; collected art is full color with a checkmark. No plus badge or empty unavailable-species slots.
- Regular collection: subtle 7.5% pop and eight-piece pastel confetti ring. Removal uses a brief dip.
- Rare collection: blue-halo white stars and gold sparkles in place of the small confetti ring. Rare detection comes from `isRareCostume()`.
- Every new collection also gets a mint glow and six small twinkles that fade over three seconds.
- Particle positions randomize around a **34×34px central dead zone**, centered at `(36, 52)` in a `72×104px` effect area. `sparkleLayout.js` accounts for particle size, spacing and outward drift so glyphs avoid the center and tile boundary. Debug overlays and size buttons were removed.
- Completing a costume row triggers the global upward confetti burst and message. Base and rare rows are separate sets; bulk completion is combined into one event. Reloading a complete set does not trigger it.
- Reduced-motion preferences suppress moving tile effects; set completion retains its message. Effects are temporary and have no continuous idle particle loop.

Images use lazy loading and async decoding. Memoized tiles and stable toggle callbacks reduce unnecessary image rerenders. The catalogue is not virtualized, and originals have not been resized or converted. Measure scrolling, image memory and loading on real phones before choosing further optimization; a successful build is not a performance benchmark.

### Wallpaper decisions

All sizes use Nintendo Garden: day 6:00 AM–4:59 PM, evening 5:00 PM–9:59 PM, night 10:00 PM–5:59 AM. This uses device local time, not geolocation. Images fill the screen with an 18% dark overlay. The debug picker was removed. Schedule and refresh behavior live in `features/wallpapers/`.

## Persistence and privacy boundaries

| Data | Current location / behavior | Limitation |
| --- | --- | --- |
| Seven calculator values | `pb_level`, `pb_stepsInput`, `pb_flowersInput`, `pb_dSteps`, `pb_dFlowers`, `pb_coinsNow`, `pb_totalStepsMode` in localStorage | Saved per browser origin; editor drafts are not the saved values |
| Collection | `pb_decorCollected`, JSON record of stable IDs to booleans | No collection dates/history or cloud copy |
| Rare visibility preference | `pb_showAllDecor`, boolean string | Per browser origin |
| Development calculator backup | Git-ignored `.local/calculator-progress.json`; backup timestamp tracked by `pb_localCalculatorUpdatedAt` in the browser | Localhost development only, calculator only; one project file shared by local browsers |
| Future account cache | `pb_account:<encoded account ID>:` namespace available through `createProgressStore({ accountId })` | Cache separation only; no authentication or server access control |
| Navigation, bulk mode, effect state | In memory | Not durable saved progress |

`progressStore` exposes `read(field, fallback)` and `write(field, value)` returning a success flag. It only accepts its declared fields and falls back on malformed collection data or inaccessible storage. Browser write failures currently have no general UI status. The development file backup has its own saving/saved/retry status.

The development backup debounces applied calculator changes by 400ms, restores before mount, compares timestamps, validates an allowlist of fields, rejects stale writes, and atomically replaces the file. Its endpoint accepts same-origin loopback requests only; Vite denies static access to `.local/`. The endpoint, restore and status UI are development-only. See [README autosave details](../README.md#local-calculator-autosave) and `localCalculatorBackup.test.js`.

Localhost, different ports/hostnames and a deployed site have separate browser storage. Google login alone would not save progress: authentication, a database, access rules, migration, conflict handling and recovery still need implementation. Do not put personal progress, precise locations, private notes or credentials into committed documentation or assets.

## Development, validation and Git

Project folder: `C:\Users\Daelan\Documents\Codex\PikApp`.

```powershell
cd C:\Users\Daelan\Documents\Codex\PikApp
npm.cmd ci
npm.cmd run dev
# Use the URL printed by Vite, usually http://localhost:5173/

npm.cmd test
npm.cmd run build
```

Use `npm.cmd` in PowerShell to avoid the `npm.ps1` execution-policy issue. Node 22 is used by the deployment workflow. There is no separate lint, typecheck or browser-test command configured.

The last implementation verification recorded **30 passing Node tests** and a production build. Tests cover requirements/projections, legacy IDs/counts/rare rules, PNG inventory/base paths, completion transitions, particle bounds/dead zone, wallpaper boundaries, browser storage and development backup. Prior manual checks covered local backup restore and tracker interactions. These are not automated end-to-end coverage, map tests, a mobile performance result, or proof of cloud isolation.

For changes, run checks appropriate to the behavior changed; use browser checks for layout/interaction and production builds for import/asset/build changes. For documentation-only changes, check paths, links, consistency and the diff. Avoid writing tests that merely repeat the implementation.

Create a descriptive local commit after each major cohesive change, following the user's October 19 instruction. Update the relevant notes in the same change. Commit and push are separate actions; a local commit does not update GitHub. At this audit's start, local `main` was one commit ahead of `origin/main` (the development calculator backup). This is a point-in-time observation, not a permanent status.

GitHub remote: `https://github.com/osuDaelan/PikApp.git`. The Pages workflow builds with `/PikApp/` as the Vite base and deploys `dist`; asset helpers already accept `import.meta.env.BASE_URL`. Keep new map assets compatible with that base. The expected hosted URL is `https://osuDaelan.github.io/PikApp/`, but deployment is unconfirmed. The last Pages setup screen required changing repository visibility or plan; neither change is authorized by this planning pass.

## Rules for the next feature

1. Put map UI, map state and location-data adapters in a new `features/decor-map/` feature when implementation starts. Keep `App.jsx` responsible for wiring and layout.
2. Keep one catalogue and one collection state owner. Reuse stable collection IDs and existing artwork lookup; add a category adapter rather than copying all decor data into the map.
3. Distinguish a geographical place ID, a decor category and an individual collected Pikmin ID. One place may map to several candidate categories; a pin is not proof of an in-game result.
4. Keep viewport, selected place, fetch status and map filters within the map feature. Define separate versioned storage for any lasting pins/preferences; do not insert location records into `pb_decorCollected`.
5. Keep map imports and location requests off the calculator/checklist startup path where practical. Load on opening the section, cancel obsolete requests, and bound/cluster visible markers as needed.
6. Preserve collection toggles, IDs, saves, reduced-motion behavior, existing layouts and development backup while adding navigation. Add shared abstractions only when both features actually need them.
7. Implement a small slice first: usable third-section navigation, a map and one representative category/area. Test it before adding every category or account-dependent features.

## Open questions and known limits

- The map will support both candidate-location discovery and personal pins. The first implementation slice, geographic scope, provider/data source and relationship to in-game decor detection are not defined yet.
- Should Map get the full desktop content area, and should the existing Now + Decor split remain a separate dashboard view? Section URLs and shareable map locations are not implemented.
- No location permission, location retention, public submission or sharing behavior has been approved. Decide these when the corresponding feature is in scope.
- Artwork usage permission remains unresolved despite recorded attribution. Some images represent grouped designs, and source resolutions vary.
- Real-phone image memory/scroll performance has not been measured for the complete catalogue. Browser-only decor progress can be lost if storage is cleared.
- Calculator data was last checked against Pikipedia on October 18, 2026. The earlier project analysis called for a separate correctness pass; existing tests do not establish every forecast edge case.
- Hosting activation, authentication/database choice, guest import, multi-device conflicts, progress export/import and collection history remain pending. They do not require a rewrite of the existing features.
