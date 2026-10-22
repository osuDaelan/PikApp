# PikApp project guide

Last reviewed: October 22, 2026, including manual full-progress transfer, the user's decision to hide sign-in and focus on browser autosave, public hosting and neutral first-visit calculator defaults. This is the current project overview; implementation details remain in the linked modules and focused notes. Proposed work is labeled separately from existing behavior.

## Purpose and current status

PikApp is an all-in-one Pikmin Bloom companion. Different tools belong in separate features; navigation, shared controls, visual theme, and progress storage connect them.

| Area | Implemented now | Remaining work |
| --- | --- | --- |
| Now / calculator | Level requirements through 120, daily averages, step/flower forecasts, coin estimates, stats editor; new visitors start at level 1 with zeroed stats | Separate forecast correctness review; requirements above 120 are not in the dataset |
| Decor checklist | 896 stable entries, regular/rare/event and numbered designs, local artwork, collection totals, bulk selection, rare unlock rules | Search/filters, real-device performance measurements, any future catalogue expansion |
| Decor effects | Regular pop/confetti, rare stars, three-second new-item sparkles, set-completion celebration | Further appearance changes only as needed; archive replaced experiments |
| Appearance | Official app icon and three Nintendo Garden wallpapers selected by local time | No active wallpaper or particle debug controls |
| Progress | Browser autosave with saved/error feedback and retry; manual full-progress JSON export/import with preview, explicit replacement and previous-save recovery; separate map saves; private development calculator backup | Automatic full-progress backups and cloud sync remain deferred |
| Sign-in | Auth groundwork retained for later; all account controls are hidden and unmounted | Google sign-in, Firebase configuration and cloud progress sync are deferred at the user's request |
| Hosting | Public repository; HTTPS GitHub Pages configured with automatic test/build/deployment on pushes to `main` | Check the deployment workflow when publishing future changes |
| Decor map | OSM discovery for 39 categories, place details, personal pins, local save and pin export/import | Address search provider, region rules, real-phone/dense-area profiling, cloud sync |

The map uses Leaflet and an OSM-to-GeoJSON converter, with explicit one-shot geolocation and public Overpass queries. React and React DOM render the app; Vite provides development and builds. Firebase remains installed for retained authentication groundwork, but its feature is not mounted, no Firebase initialization runs, and its auth SDK is excluded from the production app bundle. Hash sections do not require a router dependency. There is no cloud progress database or bundled location dataset. See [package.json](../package.json).

## Where to find project knowledge

| Document | Responsibility |
| --- | --- |
| [README](../README.md) | Setup commands, storage compatibility reference, hosting instructions, and the existing reference-site investigation |
| This guide | Current architecture, decisions, ownership, limitations, and change workflow |
| [TODO](../TODO.md) | Completed milestones and actionable remaining work |
| [Decor map plan](DECOR_MAP_PLAN.md) | Proposed map boundary, decisions still needed, and implementation sequence |
| [Decor map implementation](DECOR_MAP_IMPLEMENTATION.md) | Current controls, module ownership, providers, saved pin schema and verification |
| [Google sign-in](GOOGLE_SIGN_IN.md) | Deferred auth groundwork, future Firebase setup/reactivation reference and historical verification limits |
| [OSM map reference](DECOR_MAP_REFERENCE.md) | Pixelpirate investigation plus Bekkan Spot Searcher's boundary/node pipeline, differences from PikApp and proposed area-highlight improvements |
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
| `src/App.jsx` | App shell, feature state instances, active section, responsive layout, global celebration mounting and state remount after a full-progress import |
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
| `src/features/decor-map/` | Lazy map section, category adapter, Overpass client, GeoJSON/layers, separate pin/preferences storage; detailed ownership in the map implementation notes |
| `src/features/decor-map/osmId.js` | Lightweight saved-pin source-ID validation, shared without loading the geometry converter; `osm.js` re-exports the same symbol |
| `src/shared/sections.js`, `src/shared/hooks/useSectionNavigation.js` | All-width navigation, desktop Overview, hash links and back/forward behavior |
| `src/shared/components/` | Header/clock, navigation, inputs, rings, local backup status |
| `src/shared/components/BrowserSaveStatus.jsx`, `browser-save.css` | Calculator/checklist browser-save badge, explanatory dialog and retry action; separate from map saving |
| `src/shared/components/ProgressTransfer.jsx` | Full-progress JSON export/import controls, validated preview, explicit replacement and previous-save download inside Browser saves |
| `src/features/auth/` | Retained, unmounted account dialog/session controller, Firebase web config/adapter and session hook; never reads or writes app progress |
| `src/shared/{hooks,styles}/`, `src/shared/format.js` | Persisted-state/window hooks, theme/layout helpers, formatting |
| `src/storage/progressStore.js` / `createProgressStore` | Synchronous browser storage contract, save-status subscriptions/retry and future account cache namespaces |
| `src/storage/progressTransfer.js` | Versioned full-progress format, validation, local previous-save recovery, replacement/rollback and development-backup freshness marker |
| `src/storage/{calculatorBackupData,localCalculatorBackup}.js` | Calculator backup schema, browser client and startup restoration |
| `dev/localCalculatorBackup.js`, `vite.config.js` | Development-only file endpoint and private-file protection |
| `public/images/` | Decor PNGs, app icon JPG, Garden WebP wallpapers |
| `tests/` | Node regression tests for pure logic, catalogue/assets, storage, effects layout, and backup behavior |
| `.github/workflows/deploy.yml` | Dependency install, tests, repository-base-path build, Pages deployment |

## Runtime and state flow

1. In development, `main.jsx` attempts to restore the private calculator backup before mounting React. Production skips that restore.
2. `App.jsx` owns `useCalculator()` and `useDecorCollection()`. Section changes use the same state owners rather than making independent copies. A successful full-progress import deliberately remounts saved state so the imported calculator, collection and map values take effect without a page reload.
3. Saved fields initialize through `useProgressState()` and `progressStore.read()`. Committed state changes write through `progressStore.write()`.
4. Feature components receive state and actions. Calculator calculations stay in the calculator feature; catalogue/counting/rarity rules stay in the decor feature.
5. Decor state transitions trigger temporary effects. Loading existing collected entries does not replay selection or set-completion effects.
6. `AppHeader` owns its one-second clock. Wallpaper timing lives in its own feature. Neither belongs in collection logic.

The stats editor keeps drafts until **Save** applies them. Daily averages save directly. Below level 100, step input can represent lifetime total or remaining steps depending on the mode; at level 100 and above it represents remaining steps. Flower input represents remaining flowers. Preserve these meanings when extending storage or using projections elsewhere.

Fresh calculator saves use level 1 and zero steps, flowers, daily averages and coins. Existing fields, including saved zeros, take priority; no reset or migration is performed. The editor initializes from loaded stats and uses the draft level to choose flower inputs. With no daily step average or no average for outstanding flowers, show the setup prompt instead of estimates. Later timeline rows stop before a requirement with an unknown rate, with a prompt for the missing flower average. Typed zero averages and slider zeros both work. Private localhost backup restoration still overrides missing fields in development; it is excluded from the public build.

### Current section layout

- Below 720px: section navigation spans the bottom of the screen.
- From 720px: navigation floats and calculator cards can use a wider layout.
- At 1100px and above: Overview renders Now + Decor side by side. Decor opens its own view. Map uses the full window width with 14px side/bottom gutters and navigation in the top-right header; its sidebar remains 300px while the map canvas expands.
- Active section follows `#now`, `#decor`, or `#map` and browser history. Map view query parameters support a shareable viewport without including pins.
- Map hides calculator-specific controls; the calculator/collection hooks and development backup lifecycle remain mounted in the shell.

The map and its libraries mount on entry and clean up on exit. See [the implementation notes](DECOR_MAP_IMPLEMENTATION.md) for details.

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
| Bulk mode, effect state and selected map place | In memory | Not durable saved progress |
| Map view, filters, source and personal pins | Separate versioned `pb_decorMap_v1` browser entry; pin JSON export/import available | No cloud copy; not part of the private calculator file backup |
| Full-progress export | User-downloaded versioned JSON with calculator values, checklist values/visibility and map pins/preferences | Manual transfer; plaintext file can contain private coordinates and notes; no automatic upload/sync |
| Previous-save recovery | Local browser copy created before full-progress replacement, available through **Download previous save** | Same-browser recovery only; not an independent backup if site data is cleared |

`progressStore` exposes `read(field, fallback)` and `write(field, value)` returning a success flag. It only accepts its declared fields and falls back on malformed collection data or inaccessible storage. `getSaveStatus()` and `subscribeSaveStatus()` supply the calculator/checklist badge's **Autosave ready**, **Saved in this browser** or **Changes not saved** status. Its **Browser saves** dialog offers **Try saving again** through `retryFailedWrites()`. Failed values remain in memory, so the tab needs to remain open until retry succeeds; a later successful write to a different field does not hide an unresolved failure. The development file backup and map save/recovery flow have their own status.

The development backup debounces applied calculator changes by 400ms, restores before mount, compares timestamps, validates an allowlist of fields, rejects stale writes, and atomically replaces the file. Its endpoint accepts same-origin loopback requests only; Vite denies static access to `.local/`. The endpoint, restore and status UI are development-only. See [README autosave details](../README.md#local-calculator-autosave) and `localCalculatorBackup.test.js`.

Returning to the same site in the same normal browser/profile on the same device restores saved calculator values, collection choices and map pins/preferences without an account. Closing a tab does not intentionally clear those saves. Localhost, different ports/hostnames and a deployed site have separate browser storage; another browser/device has a different save. Clearing site data or private-browsing storage limits can discard progress. **Browser saves → Export progress / Import progress** moves the full save manually between those environments. The user transfers the downloaded file; PikApp does not upload it. Map-only pin export/import also remains available. Automatic cross-device sync is deferred.

Full-progress import validates a versioned JSON file and previews level, collected count and pin count before the explicit **Replace browser progress** action. It replaces the seven calculator fields, checklist booleans and rare-visibility preference, and map pins/preferences; it does not merge collections or pins, so uncollecting items and deleting pins can be transferred. OSM scan results, artwork and auth data are excluded. The file can include precise coordinates and private notes and should be treated as private, unencrypted data.

Before replacement, keep the previous save locally for **Download previous save**. Replacement writes use a guarded rollback path: failures report whether restoration was incomplete rather than claiming success. A successful import remounts the app's saved state without reloading the page and updates the local calculator freshness marker so an older development backup cannot overwrite imported data. The local recovery copy shares browser-storage limits; an exported file is the separate backup. Import validation or preview does not alter the current save.

The portable format is `pikapp-progress`, version 1, limited to 20 MB of UTF-8 JSON. Import rejects unknown decor IDs, unsupported versions, malformed values and unrelated fields. The `pb_progressRecovery_v1` entry holds a readable previous backup plus exact originals for the 11 replaced storage keys. It excludes unrelated account/auth keys. If a rollback is incomplete, the UI offers recovery details for troubleshooting; that raw envelope is not accepted as a normal progress import. Export uses applied live calculator/checklist state and the latest mounted map snapshot (or the saved map before first mount), so failed browser writes need not hide recent changes. An unreadable saved map blocks full transfer until its map recovery flow is resolved. Closing Browser saves resets import previews and pending file reads.

On October 22, the user asked to hide Google sign-in entirely and prioritize browser autosave. Auth/session code remains implemented but unmounted, with no Firebase initialization or auth SDK in the production app bundle. Do not request Firebase setup as an active prerequisite for the current app. Future account progress would still require a database, access rules, migration, conflict handling and recovery; the existing account cache namespaces are not selected automatically. Do not put personal progress, precise locations, private notes or credentials into committed documentation or assets.

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

Use `npm.cmd` in PowerShell to avoid the `npm.ps1` execution-policy issue. Use Node 24.12 or newer for the Firebase SDK; Node 24 is used by the deployment workflow. There is no separate lint, typecheck or browser-test command configured.

The current baseline is **83 passing Node tests** and a production build with the `/PikApp/` base. New transfer tests cover strict format validation, UTF-8 limits, maximum pin collections, explicit unchecks/removals, readable and exact raw recovery, unchanged unrelated storage, recovery-write protection, rollback including absent keys, explicit rollback failures and supported timestamps. A development regression check preserves imported progress when the clock moves backwards; the file backup uses the effective monotonic timestamp. The browser-save tests cover stable status subscriptions, failures that remain visible despite unrelated successful writes, retrying the latest failed values, partial recovery and successful replacement without replaying stale values. Existing tests cover calculator requirements/projections, legacy IDs/counts/rare rules, assets/base paths, celebrations, wallpaper boundaries, browser storage, development backup, map query/matching/geometry, retained-search lifecycle, presentation, URL validation and pin storage/import. Retained auth controller checks use controlled clients; real Google OAuth remains unverified and deferred.

On October 22, a separate production-preview origin confirmed fresh level-1/zero defaults, applied calculator values and daily averages, a collected Red Chef Hat, and a public test pin with its category/notes surviving a complete tab close and reopen. Existing user saves were not changed. The browser-save dialog opened, Escape closed it and returned focus, and the badge fit a 390px viewport without horizontal overflow. The build excludes the unmounted authentication feature/SDK and retains lazy map loading. Storage failures/retry were checked with controlled storage in Node tests rather than a forced browser quota failure. These checks are not comprehensive automated end-to-end coverage, a full browser restart, physical-phone performance results, or proof of cloud isolation. Manual map checks distinguish controlled responses from successful live public-service data.

The manual-transfer browser check exported that synthetic save, previewed it against an empty second preview origin, confirmed replacement, and verified calculator inputs/averages, the selected decor, pin category/notes and persistence after reload. The previous-save download control remained available after reload. The transfer dialog fitted a 390px viewport without horizontal overflow. Invalid files, recovery restoration and quota/rollback failure paths were tested with controlled storage in Node, not forced through the browser; physical-phone file selection remains unverified. The production build keeps Leaflet and the geometry converter in the lazy map chunk, with no Firebase or development backup endpoint in production JavaScript.

For changes, run checks appropriate to the behavior changed; use browser checks for layout/interaction and production builds for import/asset/build changes. For documentation-only changes, check paths, links, consistency and the diff. Avoid writing tests that merely repeat the implementation.

Create a descriptive local commit after each major cohesive change, following the user's October 19 instruction. Update the relevant notes in the same change. Commit and push are separate actions; a local commit does not update GitHub. At this audit's start, local `main` was one commit ahead of `origin/main` (the development calculator backup). This is a point-in-time observation, not a permanent status.

GitHub remote: `https://github.com/osuDaelan/PikApp.git`. The Pages workflow builds with `/PikApp/` as the Vite base and deploys `dist`; asset helpers already accept `import.meta.env.BASE_URL`. Keep new map assets compatible with that base. On October 21, 2026, the user authorized public visibility and website publication. The repository is public and Pages uses GitHub Actions with HTTPS enforced at [PikApp](https://osuDaelan.github.io/PikApp/). [Deployment runs](https://github.com/osuDaelan/PikApp/actions/workflows/deploy.yml) identify the published commit. Only production output is deployed; development calculator files stay local. Localhost and the public website have separate browser saves; cloud sync is not implemented.

## Map feature boundaries

1. Keep map UI, map state and location-data adapters in `features/decor-map/`. Keep `App.jsx` responsible for wiring and layout.
2. Keep one catalogue and one collection state owner. Reuse stable collection IDs and existing artwork lookup; add a category adapter rather than copying all decor data into the map.
3. Distinguish a geographical place ID, a decor category and an individual collected Pikmin ID. One place may map to several candidate categories; a pin is not proof of an in-game result.
4. Keep viewport, selected place, fetch status and map filters within the map feature. Define separate versioned storage for any lasting pins/preferences; do not insert location records into `pb_decorCollected`.
5. Keep map imports and location requests off the calculator/checklist startup path where practical. Load on opening the section, cancel obsolete requests, and bound/cluster visible markers as needed.
6. Preserve collection toggles, IDs, saves, reduced-motion behavior, existing layouts and development backup while adding navigation. Add shared abstractions only when both features actually need them.
7. Extend the tested initial slice incrementally. Validate regional rules, provider changes and account-dependent features before expanding their scope.

## Open questions and known limits

- Map discovery and local pins are implemented using the chosen OSM approach. Public endpoints are configured; tag accuracy, address search, region-aware Fortune rules and physical-device performance remain follow-ups.
- Map has its own desktop view; Overview retains the two-pane dashboard. Section URLs and map-view sharing exist; public pin sharing and community submissions do not.
- Location is requested only by Locate me. Pins/views remain local unless explicitly exported/copied; account sync and public sharing require separate implementation.
- Artwork usage permission remains unresolved despite recorded attribution. Some images represent grouped designs, and source resolutions vary.
- Real-phone image memory/scroll performance has not been measured for the complete catalogue. Browser-only decor progress can be lost if storage is cleared.
- Calculator data was last checked against Pikipedia on October 18, 2026. The earlier project analysis called for a separate correctness pass; existing tests do not establish every forecast edge case.
- Firebase activation, a progress database, account guest-import/merge, automatic multi-device conflicts, automatic full-progress backups and collection history remain deferred. Browser saving and manual full-progress transfer require no account. These features do not require a rewrite of the existing app.
