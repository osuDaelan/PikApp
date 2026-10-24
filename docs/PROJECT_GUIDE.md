# PikApp project guide

Last reviewed: October 24, 2026, after the Mushrooms reference/comparison page, checklist search and its undo window, the catalog refresh and the rapid audit repairs. This is the current project overview; implementation details remain in the linked modules and focused notes. Proposed work is labeled separately from existing behavior.

## Purpose and current status

PikApp is an all-in-one Pikmin Bloom companion. Different tools belong in separate features; navigation, shared controls, visual theme, and progress storage connect them.

| Area | Implemented now | Remaining work |
| --- | --- | --- |
| Now / calculator | Level requirements through 120, daily averages, step/flower forecasts, coin estimates, stats editor; new visitors start at level 1 with zeroed stats | Separate forecast correctness review; requirements above 120 are not in the dataset |
| Decor checklist | 975 entries (896 original IDs preserved), local artwork, collection totals, filtered bulk selection, rare unlock rules and expression-based search | Real-device performance measurements, individual older grouped designs, future catalogue expansion |
| Decor effects | Regular pop/confetti, rare stars, three-second new-item sparkles, set-completion celebration | Further appearance changes only as needed; archive replaced experiments |
| Appearance | Official app icon and three Nintendo Garden wallpapers selected by local time | No active wallpaper or particle debug controls |
| Progress | Browser autosave with saved/error feedback and retry; manual full-progress JSON export/import with preview, explicit replacement and previous-save recovery; separate map saves; private development calculator backup | Automatic full-progress backups and cloud sync remain deferred |
| Sign-in | Auth groundwork retained for later; all account controls are hidden and unmounted | Google sign-in, Firebase configuration and cloud progress sync are deferred at the user's request |
| Feedback | One header feedback form/review and local spam controls; configured Formspree POST, no destination selector or GitHub links in the app | Endpoint/inbox are not connected; configure/check provider CAPTCHA/domain/quota and verify delivery before claiming availability |
| Hosting | Public repository; HTTPS GitHub Pages configured with automatic test/build/deployment on pushes to `main` | Check the deployment workflow when publishing future changes |
| Decor map | OSM discovery for 39 categories, place details, personal pins, local save and pin export/import | Address search provider, region rules, real-phone/dense-area profiling, cloud sync |
| Mushrooms | Full nectar reference for 34 type/size combinations at 1–4 stars, plus a separate comparison for up to 20 available mushrooms and desired nectar colors | Giant/event rewards, real-game checks of researched fruit bounds, optional saved comparison drafts |

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
| [Feedback](FEEDBACK.md) | Single-form decision, private Formspree setup/native handoff, local/provider spam limits, retained helper history and pending delivery checks |
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
| `src/shared/components/Navigation.jsx`, `src/shared/sections.js` / `SECTIONS` | Overview, Decor, Map and Mushrooms section buttons and hash validation |
| `src/features/calculator/levelData.js` / `MAX_KNOWN` | Level requirements and current dataset limit |
| `src/features/calculator/calculations.js` | Pure requirements, forecasts, and coin calculations |
| `src/features/calculator/useCalculator.js` | Saved calculator values, editor drafts/actions, derived projections |
| `src/features/calculator/{CalculatorSection,StatsEditor,LevelBadge}.jsx` | Calculator presentation and editing controls |
| `src/features/decor/catalog.js` | Category/costume/color/design definitions, icons, species order |
| `src/features/decor/collection.js` / `decorId`, `isRareLocked` | Stable collection IDs, counts, base/rare rules |
| `src/features/decor/useDecorCollection.js` | One collection state owner, single/bulk changes, completion detection wiring |
| `src/features/decor/{DecorSection,DecorGroup}.jsx` | Tracker sections, costume rows, availability and rare visibility |
| `src/features/decor/search.js` / `DecorSearch.jsx`, `decor-search.css` | Immutable catalog search index, bounded expression parser, variant filtering and accessible search controls/help |
| `src/features/decor/{decorImages,decorImageData}.js` | Stable ID to image metadata; base-path-aware image URLs |
| `src/features/decor/DecorImageTile.jsx`, `decor-image-tile.css` | Memoized accessible image button, collected state, image fallback |
| `src/features/decor/useDecorTileMotion.js`, `decor-tile-motion.css` | Selection/removal animation lifecycle and regular pop/confetti |
| `src/features/decor/{RareTileStars,NewDecorSparkles}.jsx`, `new-decor-sparkles.css`, `sparkleLayout.js` | SVG particles, three-second glow/twinkles, random positions and protected center |
| `src/features/decor/{setCompletion,useSetCompletion,setConfetti}.js`, `SetCompletionCelebration.jsx`, `set-completion.css` | Set transitions, global canvas burst, completion message |
| `src/features/wallpapers/` | Official image catalogue, local-time schedule, refresh on time/focus/visibility changes |
| `src/features/decor-map/` | Lazy map section, category adapter, Overpass client, GeoJSON/layers, separate pin/preferences storage; detailed ownership in the map implementation notes |
| `src/features/decor-map/osmId.js` | Lightweight saved-pin source-ID validation, shared without loading the geometry converter; `osm.js` re-exports the same symbol |
| `src/features/mushrooms/{data,rewardRecipes}.js` | Reviewed fruit yields, types, source revisions and 136 reward recipes for 34 type/size combinations |
| `src/features/mushrooms/calculations.js` | Fruit size/color pools, min–max nectar, separate Special Nectar, choice validation and desired-color rankings/ties |
| `src/features/mushrooms/selection.js` | Stable type/size reference rows with all ratings, bounded plain-text/comma search and checked-row toggles |
| `src/features/mushrooms/{MushroomImage.jsx,images.js}`, `public/images/mushrooms/`, `docs/mushroom-image-sources.json` | Local Pikipedia type icons, base-path-aware URLs, fixed-size lazy images and asset provenance |
| `src/features/mushrooms/{MushroomsSection,MushroomReference,MushroomComparison,MushroomOptions}.jsx`, `mushrooms.css` | Lazy page, searchable reward table, selected-mushroom settings and ranked results with Add another controls |
| `src/shared/sections.js`, `src/shared/hooks/useSectionNavigation.js` | All-width navigation, desktop Overview, hash links and back/forward behavior |
| `src/shared/components/` | Header/clock, navigation, inputs, rings, local backup status |
| `src/shared/components/BrowserSaveStatus.jsx`, `browser-save.css` | Calculator/checklist browser-save badge, explanatory dialog and retry action; separate from map saving |
| `src/shared/components/ProgressTransfer.jsx` | Full-progress JSON export/import controls, validated preview, explicit replacement and previous-save download inside Browser saves |
| `src/features/auth/` | Retained, unmounted account dialog/session controller, Firebase web config/adapter and session hook; never reads or writes app progress |
| `src/features/feedback/FeedbackButton.jsx`, `feedback.css` | Header button, single responsive feedback form/review and configured private POST; no destination selector or GitHub UI route |
| `src/features/feedback/feedback.js` | Allowed fields, endpoint validation, POST fields and local limits; older GitHub URL helper retained only for compatibility/history, not called by the UI |
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

The stats editor keeps numeric values and step-entry mode in drafts until **Save** applies them; **Cancel** changes neither. Switching modes converts the draft while preserving remaining steps through `convertStepEntryMode()`. Daily averages save directly. Below level 100, step input can represent lifetime total or remaining steps depending on the mode; at level 100 and above it represents remaining steps. Flower input represents remaining flowers. Shared `numericInput.js` rejects non-whole values and values above 999,999,999 before changing live state. Preserve these meanings when extending storage or using projections elsewhere.

Fresh calculator saves use level 1 and zero steps, flowers, daily averages and coins. Existing valid fields, including saved zeros, take priority; no reset or migration is performed. The editor initializes from loaded stats and uses the draft level to choose flower inputs. Outstanding work needs a positive corresponding average: when steps are already complete, a zero step average does not prevent a flower-only forecast. Fresh all-zero saves still show setup. Later timeline rows stop before a requirement with an unknown rate. Typed zero averages and slider zeros both work. Private localhost backup restoration still applies in development; it is excluded from the public build.

### Current section layout

- Below 720px: section navigation spans the bottom of the screen.
- From 720px: navigation floats at the bottom center in every section and calculator cards can use a wider layout. Wide navigation uses `50vw` so appearing/disappearing page scrollbars do not move it sideways.
- At 1100px and above: Overview renders Now + Decor side by side. Decor opens its own view. Map uses the full window width with 14px side gutters and a 90px bottom allowance for the shared fixed navigation; its sidebar remains 300px while the map canvas expands. Opening Map no longer moves navigation into the header.
- Active section follows `#now`, `#decor`, `#map`, or `#mushrooms` and browser history. Map view query parameters support a shareable viewport without including pins.
- Map and Mushrooms hide calculator-specific controls; the calculator/collection hooks and development backup lifecycle remain mounted in the shell.
- Mushrooms places both charts on the left and options on the right from 900px; below 900px options come first, followed by the full reference and comparison.

The map and its libraries mount on entry and clean up on exit. See [the implementation notes](DECOR_MAP_IMPLEMENTATION.md) for details.

October 24 navigation check: an isolated production preview measured identical navigation rectangles across Overview/Now, Decor, Mushrooms and Map: `(472, 647, 336, 57)` at 1280×720 and `(0, 781, 375, 63)` at a 390×844 browser viewport. The 1100×650 map also fit without page overflow; the card, zoom controls and attribution stayed above the navigation. The 147-test suite and `/PikApp/` build passed, with no browser warnings/errors. No Overpass search, geolocation or existing user-save edits were performed.

## Mushroom nectar reference and comparison

The fourth section, `#mushrooms`, is lazy loaded and owns its UI/data/calculations under `src/features/mushrooms/`. It adds no dependency, chart library or runtime wiki request. At the user's request, the initial range-bar charts and add form were replaced with plain numeric tables and checkbox selection, closer to the text reference notes. Calculator, collection, map saves and full-progress transfer formats remain unchanged.

The reward table is the single place to select from the **34** supported type/size combinations. It shows **1★, 2★, 3★, 4★ nectar ranges and four-star Special Nectar** together. Check a checkbox or click a row to select it. Search is directly above the table: terms match type/size in any order, commas join alternatives, and Ice Blue also accepts `ice-blue`/`iceblue`. It filters displayed rows while keeping existing selections and comparisons intact; Clear search restores all 34. No matches has an explicit empty row. Nectar preferences do not filter the table. A highlighted star cell identifies each rating used by a selected mushroom.

The reference uses a 200px mushroom-name column, centered reward amounts and roughly 47px desktop rows to reduce the gap between names and star columns. Its height is unrestricted and it uses normal page scrolling; there is no internal table scrollbar or clipped Special column. Mobile retains labeled cards with normal page scrolling. The sidebar's selected list remains independently bounded.

Thirteen existing mushroom type icons from [Pikipedia's Mushroom battle page](https://www.pikminwiki.com/Mushroom_battle) appear in the reference and comparison. Each type reuses one image across its sizes. Local PNGs are at most 96px on the longest edge and total **197,315 bytes (about 193 KiB)**. `MushroomImage` reserves its dimensions, loads lazily, decodes asynchronously and uses an empty alt because the adjacent text already names the type. URLs respect `/PikApp/`; browsers reuse the same files across repeated rows. The [source inventory](mushroom-image-sources.json) records source/thumbnail URLs, actual dimensions and checksums. No AI-generated imagery or image service is used at runtime.

The right menu is now **Comparison settings**, containing selected mushrooms, optional names, individual expected stars, removal, desired nectar colors and ranking. Its duplicate catalog/search was removed. Stars for new selections defaults to four and affects only newly checked mushrooms. **Add another** is on each row in the best-options table below the reference. It creates another independent available mushroom of the same type/size, initially copying its name/stars; users can then give it different expected stars or a name in settings. Two or more copies show `(1/2)`, `(2/2)`, etc. in both selected items and results. The limit remains 20 total mushrooms; Add another disables at the limit and re-enables after removal. A type/size stays checked while any copy exists; unchecking removes all its copies, while Remove affects one. Clear selections leaves nectar preferences intact. Copies are individual alternatives, not multiplied/combined battle rewards.

The best-options table has explicit **Minimum, Maximum and Special** columns, with per-color winner cards and ties. Ranking sums only desired nectar colors within each mushroom's rewards and uses highest documented minimum (default) or maximum; zero-yield options never receive a best badge. Special Nectar stays separate. Reward details retain score thresholds and minimum carriers. Expected stars are entered manually; there is no battle-score prediction.

`AppSession` keeps the comparison choices, new-selection star setting and nectar preferences while navigating between sections. They reset on refresh, closing the page, or full-progress import; the UI states the refresh/close limit. They are not autosaved or included in progress exports. The temporary search resets when the section remounts. Desktop keeps reference/results left and options right; mobile puts options first in both DOM and visual order and displays table rows as compact cards with all star labels. No personal stats or other private vault contents are bundled, and the Obsidian vault remains unchanged.

### Reward sources and interpretation

Reviewed October 24, 2026: [Mushroom battle revision 352625](https://www.pikminwiki.com/index.php?title=Mushroom_battle&oldid=352625#Rewards), [Fruit revision 355926](https://www.pikminwiki.com/index.php?title=Fruit_(Pikmin_Bloom)&oldid=355926), and [official reward rules](https://niantic.helpshift.com/hc/en/23-pikmin-bloom/faq/4045-rewards-for-clearing-mushrooms/). Eight regular types support Small/Normal/Large; five elemental types support Normal/Large. Giant and event mushrooms are deliberately outside this dataset.

The reward table says its fruit icons indicate **size and color**, rather than a guaranteed specific fruit. `fruitPool()` therefore takes the lowest and highest researched yields among all fruits of that size/color. For example, giant white spans Muscat grapes and Melon (33–147), large yellow spans Lemon and Orange (14–53), and small red spans Cherry and Strawberry (1–7). Counts from the reward table multiply these bounds. These are outer researched bounds, not averages, probabilities or guarantees; their application to every size/color group follows the wiki rule and has not been independently verified in-game. Ranges include regular or seasonal nectar of a color and do not promise a particular flower species. They assume every reward is returned; rewards are not divided among participants, but insufficient carriers can reduce what is collected.

Some ranges therefore differ from the older text chart: four-star Large White/Gray is 120–499 (was 120–302), Large Yellow 194–452 (was 194–435), Large Red/Pink 194–420 (was 194–412), and Small White/Gray 25–74 (was 25–72; Green Apple now has a documented maximum of 58). Normal Ice Blue four-star uses three Plums (24–63), whereas Normal Blue/Purple uses giant plus large blue fruit (45–104). Preserve that source exception. Special Nectar applies at four stars: regular Large gives one, elemental Normal one and elemental Large two; it does not inflate colored nectar totals.

Fifteen focused Node tests cover dataset completeness, all 136 outcomes and carry counts, fruit alternatives, representative independent numeric results, the Ice Blue exception, Special Nectar, invalid inputs, color-specific/combined rankings, ties, duplicate choices, checkbox synchronization/removal semantics, search alternatives/aliases, limits and reference immutability. Two image checks cover all 13 PNGs, dimensions/size/checksums, source coverage and deployment paths. The full suite is **147 passing tests**, and the production `/PikApp/` build passes.

An isolated production preview confirmed exactly one search field above the reward table, no sidebar search/catalog, and only the four nectar-color checkboxes in settings. It checked the Small Blue / Normal Yellow / Normal Water example, two and three copies of Small Blue from Add another below the reference, copy labels and independent stars. A no-match search kept all five selected mushrooms/comparison rows; clearing it restored all 34 reference rows. Adding up to 20 disabled duplicate buttons; removing one re-enabled them. At 390px, the no-match row and real rows fit without page overflow, settings stayed first, and adding a third copy and Space-key selection worked. The console had no warnings/errors. Earlier 900px image/spacing checks confirmed every local type icon and no clipped reward cells. These are viewport checks, not physical-phone measurements. The lazy feature is about 7.6 KB gzip JS plus 2.4 KB gzip CSS and separate lazy PNGs. Reward data and existing saves were unchanged. The initial bar-chart implementation is recoverable from commit `df36d4d`.

## Decor data and visual pipeline

`catalog.js` defines groups, each containing costumes and either species colors or numbered designs. `decorId(location, costume, variant)` creates the saved key; for example `restaurant__chef_hat__Red`. It slugifies the location and costume and preserves the variant. Renaming a category/costume or variant can therefore change saved IDs even if it looks like a harmless label change. Keep IDs stable or supply an explicit tested migration.

`DecorGroup.jsx` selects applicable variants, constructs their IDs, looks up image metadata, and passes each to `DecorImageTile.jsx`. Only available species render, packed from the first position in the shared species order. Numbered designs render their own entries. Rare costume detection currently depends on the name ending in ` (Rare)`; a matching base costume must be complete unless **Show all** bypasses the visibility rule.

### Decor checklist search

Added October 23, 2026, using [Pikipedia's in-game search guide](https://www.pikminwiki.com/Pikmin_Bloom_interface#Pikmin) as a syntax reference. The search bar is shared across regular and special/event checklist results in both Overview and Decor. The query lives in `useDecorCollection` as transient UI state: section navigation keeps it; reload/import clears it. It is not saved in progress exports or sent to a server.

- Search the eight species, category/costume names, and numbered labels such as `yellow battery "design 2"`. Case and accents are normalized, so `cafe` finds Café. Bare species keywords filter species strictly; quoted terms are literal text. This avoids a search for `ice` returning every color in Ice Cream.
- PikApp-specific filters are `collected`, `missing`, `rare`, `regular`, `event` and the alias `special`. Regular means the regular section, including rare costumes; use `regular & !rare` for base entries. Event and special both select the special/event section, including promotional entries. Collected/missing reads the current collection state on every change.
- Spaces (including full-width spaces), `&` and commas mean AND. `|` and `;` mean OR. `!` negates; parentheses group expressions. Precedence is parentheses, NOT, AND, OR. Straight double quotes protect phrases/special characters; `=` requires an exact field, for example `="Chef Hat"` excludes the rare costume. Quoted `"missing"` is literal costume/category text rather than a collection filter. Quotes allow escaped `\"` and `\\`.
- A nonempty valid search includes locked rare variants. The Show all toggle is hidden during search; clearing restores its unchanged preference and normal unlock rules. Global collection totals stay visible; the search status reports true matches plus any recently collected tiles temporarily retained for undo. Section totals marked "shown" and filtered group/row counts include those retained tiles. Empty results and malformed expressions have explicit messages; errors expose no tiles or bulk-action targets. Clear search and Escape return focus to the input.
- Missing-result undo window: after a tile is collected it stays in place, checked and clickable, for **three seconds** so a second tap or keyboard activation can uncollect it without editing the query. This also works for `!collected`, nested equivalent expressions and bulk selection. Progress saves immediately; only visibility is delayed. The selector retains a recently edited collected entry only if changing its collection flag alone back to missing would satisfy the entire query, so species/category/design filters still apply. Results that still truly match an OR branch need no grace. A live hint separates the true match count from recently collected entries. Undo returns the tile to an ordinary missing match.
- The transient `recentDecorEdits` deadline map lives in `useDecorCollection`, outside storage/exports. Each edit has its own monotonic three-second deadline; one timer handles the nearest expiry, with cleanup on unmount/import. Changing or clearing the query discards old grace immediately. Saved selections do not receive a grace window on reload. Toggling a tile again restarts its own edit window; editing another tile does not extend the first tile's window.
- Filtered catalog copies retain every original saved ID and never alter catalog or collection data. Both category and costume bulk buttons act only on displayed variants. Outside search, category bulk selection also excludes currently hidden rare rows. Completion detection continues using the full original catalog, so finishing a filtered subset does not falsely complete a set.
- `search.js` indexes static text once. The local parser evaluates no code or user regular expressions; limits are 512 characters, 256 tokens and 32 nested parentheses/NOT levels. There are no new dependencies, requests or changes to image loading/storage formats. `DecorSearch.jsx` supplies an accessible search landmark, labeled 44px-high controls, live status/error text and expandable help. Individual Pikmin nicknames, locations, friendship, squad, flower states and game account data are not tracked or searchable.

Initial search verification: 11 new Node search tests covered species/designs, category/costume text, normalization, live statuses, operator aliases/precedence, quoting/exact fields, invalid/bounded expressions, counts, filtered bulk targets and immutable catalog/IDs. Full suite: **125 passed**; `/PikApp/` production build passed. An isolated production-preview browser confirmed two filtered Chef Hat variants were the only bulk-selected entries, persisted after reload, and disappeared from matching missing results; section navigation retained the query. Invalid syntax, numbered designs, Escape-to-clear and restored rare locks worked. At a 390px browser viewport the search and expanded help had no horizontal overflow; console warnings/errors were empty. This was browser viewport validation, not physical-phone performance profiling. Existing user saves were untouched.

Undo-window verification: five additional Node tests cover retained slots/counts, undo and reselection, equivalent/negated expressions, OR branches, independent candidate removal, bulk targets, rare/event/numbered entries, catalog immutability and rejecting unrelated or invalid-query results. **130 tests and the `/PikApp/` build pass.** An isolated browser checked immediate checked state, second-click undo, disappearance after expiry, persistence after reload, bulk select/clear, immediate grace clearing when the query changes, and staggered selections where the older tile disappeared while the newer tile remained undoable. Keyboard Enter undid a selection at a 390px viewport; the hint wrapped without horizontal overflow and console warnings/errors were empty. Screenshot: `outputs/pikapp-missing-undo-mobile.png`. All selection tests used a separate preview origin; existing user saves were untouched.

The 975 entries comprise 522 regular/rare and 453 special/event entries. They have 975 local transparent PNG mappings in `decorImageData.js`. Files total 31,009,162 bytes (about 29.6 MiB). The October 22 source review added 53 regular/rare and 26 event entries, including newer Ice variants, without renaming or removing the original 896 saved IDs. See [the catalog refresh record](DECOR_IMAGE_ROLLOUT.md#catalog-refresh-october-22-2026). Thirty-six catalogue entries group multiple in-game designs and deliberately use representative artwork; this does not mean all possible in-game designs have separate checklist entries. Provenance and flags live in the asset inventory.

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
| Feedback handoff limits | `pb_feedback_v1` fingerprint/timestamp metadata, with memory fallback if storage is unavailable | Best-effort per-browser limits, not a global spam barrier; feedback text is not saved here |

`progressStore` exposes `read(field, fallback)` and `write(field, value)` returning a success flag. It only accepts its declared fields and falls back on malformed collection data or inaccessible storage. `getSaveStatus()` and `subscribeSaveStatus()` supply the calculator/checklist badge's **Autosave ready**, **Saved in this browser** or **Changes not saved** status. Its **Browser saves** dialog offers **Try saving again** through `retryFailedWrites()`. Failed values remain in memory, so the tab needs to remain open until retry succeeds; a later successful write to a different field does not hide an unresolved failure. The development file backup and map save/recovery flow have their own status.

An invalid or failed initial read marks that field unreadable. Mount autosave and retry cannot overwrite its original raw value with the fallback. `useProgressState` distinguishes explicit setters, including unchanged-value saves, and only those may replace the affected field through `allowUnreadable`. This replaces that field; it does not reconstruct the unreadable collection. `assertReadable()` blocks full-progress snapshots while an unreadable field remains, so an empty fallback cannot be exported as complete progress. Restore storage access and reload before editing when recovery of the original matters. Missing keys are normal first-visit defaults, not unreadable saves.

The development backup debounces applied calculator changes by 400ms, restores before mount, compares timestamps, validates an allowlist of fields, rejects stale writes, and atomically replaces the file. Its endpoint accepts same-origin loopback requests only; Vite denies static access to `.local/`. The endpoint, restore and status UI are development-only. See [README autosave details](../README.md#local-calculator-autosave) and `localCalculatorBackup.test.js`.

Startup restoration now snapshots the calculator keys and freshness marker, verifies replacement, and rolls back partial writes. A failed restore keeps the file protected and reports incomplete rollback explicitly. `assertLocalCalculatorRestoreVerified()` / `RESTORE_UNVERIFIED` block file POSTs until startup restoration succeeds. `LocalCalculatorSave` pauses instead of retrying an unverified startup: the initial fallback must not advance its freshness marker, while later user edits still mark browser freshness. Restore the service/storage and reload to retry startup restoration. Ordinary file-write failures after a verified startup retain their retry behavior.

Returning to the same site in the same normal browser/profile on the same device restores saved calculator values, collection choices and map pins/preferences without an account. Closing a tab does not intentionally clear those saves. Localhost, different ports/hostnames and a deployed site have separate browser storage; another browser/device has a different save. Clearing site data or private-browsing storage limits can discard progress. **Browser saves → Export progress / Import progress** moves the full save manually between those environments. The user transfers the downloaded file; PikApp does not upload it. Map-only pin export/import also remains available. Automatic cross-device sync is deferred.

Full-progress import validates a versioned JSON file and previews level, collected count and pin count before the explicit **Replace browser progress** action. It replaces the seven calculator fields, checklist booleans and rare-visibility preference, and map pins/preferences; it does not merge collections or pins, so uncollecting items and deleting pins can be transferred. OSM scan results, artwork and auth data are excluded. The file can include precise coordinates and private notes and should be treated as private, unencrypted data.

Before replacement, keep the previous save locally for **Download previous save**. Replacement writes use a guarded rollback path: failures report whether restoration was incomplete rather than claiming success. A successful import remounts the app's saved state without reloading the page and updates the local calculator freshness marker so an older development backup cannot overwrite imported data. The local recovery copy shares browser-storage limits; an exported file is the separate backup. Import validation or preview does not alter the current save.

The portable format is `pikapp-progress`, version 1, limited to 20 MB of UTF-8 JSON. Import rejects unknown decor IDs, unsupported versions, malformed values and unrelated fields. The `pb_progressRecovery_v1` entry holds a readable previous backup plus exact originals for the 11 replaced storage keys. It excludes unrelated account/auth keys. If a rollback is incomplete, the UI offers recovery details for troubleshooting; that raw envelope is not accepted as a normal progress import. Export uses applied live calculator/checklist state and the latest mounted map state (or the saved map before first mount), so failed browser writes need not hide recent changes. The map bridge passes a reader that calls `createMapStore.getTransferState()`: an initial read failure remains blocked even when no raw bytes were available and storage access later recovers. Reopen/reload or explicit successful map recovery clears that protection; ordinary write failures still allow live unsaved pins to be exported. Closing Browser saves resets import previews and pending file reads.

On October 22, the user asked to hide Google sign-in entirely and prioritize browser autosave. Auth/session code remains implemented but unmounted, with no Firebase initialization or auth SDK in the production app bundle. Do not request Firebase setup as an active prerequisite for the current app. Future account progress would still require a database, access rules, migration, conflict handling and recovery; the existing account cache namespaces are not selected automatically. Do not put personal progress, precise locations, private notes or credentials into committed documentation or assets.

Feedback is separate from app progress and retained auth. At the user's latest request, there is one form with no destination selector, GitHub links or public route in the app. The header collects type, section, title and details for review; **Continue to send ↗** uses a native HTML POST in a new tab to an owner-controlled Formspree form. Hosted CAPTCHA/confirmation/errors are handled there. It needs the owner's `VITE_FEEDBACK_ENDPOINT`, verified inbox and provider spam/domain configuration, which are not yet connected. Blank/invalid configuration keeps sending disabled. There is no AJAX client, new dependency, embedded secret or Google login. The public form ID is safe in the built client but does not enforce access. Pages reads the repository Actions variable at build time; localhost uses `.env.local` plus a Vite restart. Actual inbox delivery remains unverified.

Only the prepared fields are included; stats, collection, pins, coordinates, current URL and device details are not attached. Formspree receives ordinary network information/site origin for its service checks. PikApp cannot inspect the cross-origin provider result or confirm delivery. Local three-second review/honeypot/validation and 60-second, three-per-hour, duplicate-within-24-hours limits count handoffs even when the hosted step is canceled/fails. These client limits are bypassable; configured Formspree filtering/CAPTCHA supplies service-side enforcement. GitHub issues remain directly available on the repository, outside this UI; the older GitHub URL helper, cap and fingerprints remain only for compatibility/history. See [Feedback](FEEDBACK.md) for setup, the 50/month free-plan quota and over-limit storage without email.

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

The current baseline is **147 passing Node tests** and a production build with the `/PikApp/` base. The 16 feedback tests cover endpoint and POST-field validation, Unicode private text, separate-route duplicates with legacy compatibility, fixed/encoded GitHub URLs, text/URL limits, cooldown/hour/day boundaries, metadata privacy, persistent/memory fallback and bounded corrupt/future/oversized-history repair. Transfer tests cover strict format validation, UTF-8 limits, maximum pin collections, explicit unchecks/removals, readable and exact raw recovery, unchanged unrelated storage, recovery-write protection, rollback including absent keys, explicit rollback failures and supported timestamps. A development regression check preserves imported progress when the clock moves backwards; the file backup uses the effective monotonic timestamp. The browser-save tests cover stable status subscriptions, failures that remain visible despite unrelated successful writes, retrying the latest failed values, partial recovery and successful replacement without replaying stale values. Existing tests cover calculator requirements/projections, legacy IDs/counts/rare rules, assets/base paths, celebrations, wallpaper boundaries, browser storage, development backup, map query/matching/geometry, retained-search lifecycle, presentation, URL validation and pin storage/import. Retained auth controller checks use controlled clients; real Google OAuth remains unverified and deferred.

On October 22, a separate production-preview origin confirmed fresh level-1/zero defaults, applied calculator values and daily averages, a collected Red Chef Hat, and a public test pin with its category/notes surviving a complete tab close and reopen. Existing user saves were not changed. The browser-save dialog opened, Escape closed it and returned focus, and the badge fit a 390px viewport without horizontal overflow. The build excludes the unmounted authentication feature/SDK and retains lazy map loading. Storage failures/retry were checked with controlled storage in Node tests rather than a forced browser quota failure. These checks are not comprehensive automated end-to-end coverage, a full browser restart, physical-phone performance results, or proof of cloud isolation. Manual map checks distinguish controlled responses from successful live public-service data.

The manual-transfer browser check exported that synthetic save, previewed it against an empty second preview origin, confirmed replacement, and verified calculator inputs/averages, the selected decor, pin category/notes and persistence after reload. The transfer dialog fitted a 390px viewport without horizontal overflow. A further browser check rejected an unsupported-version file, canceled a valid preview without changes, imported the actual exported file, downloaded the readable previous save and imported that recovery file. This restored level 1/zero stats, the unchecked decor and zero pins, which persisted after reload. Existing user data was untouched. Independent isolated-store checks also transferred the actual downloaded file, restored all fields/preferences, retained unrelated/auth sentinels and verified exact raw recovery; a silently ignored write triggered a complete rollback. Quota/rollback failures and the initial map-read failure were checked with controlled storage in Node; physical-phone file selection remains unverified. The production build keeps Leaflet and the geometry converter in the lazy map chunk, with no Firebase or development backup endpoint in production JavaScript.

Historical feedback checks covered the retired GitHub-only flow (review/navigation/cooldown/focus and 390px/1100px layouts) and later private/public selector. A configured preview checked reviewed private fields and native POST/new-tab/`noopener` attributes with a clean console, without submitting to Formspree. After single-form simplification, all 112 tests/build passed; an isolated browser confirmed only type/section/title/details, no destination selector or GitHub links, disabled unconfigured sending and a clean console. Provider setup, hosted CAPTCHA/errors/cancel behavior, actual inbox delivery and physical-phone behavior remain pending. No repository restrictions or real user saves were changed. See [feedback verification](FEEDBACK.md#verification-and-remaining-work).

For changes, run checks appropriate to the behavior changed; use browser checks for layout/interaction and production builds for import/asset/build changes. For documentation-only changes, check paths, links, consistency and the diff. Avoid writing tests that merely repeat the implementation.

Follow `CLAUDE.md` and the standing user instruction: automatically commit each major cohesive change and push to `origin main`, without asking again. Update relevant notes in the same change. Commit and push are separate operations; only a successful push and Pages deployment publish the change. The October 22 repair commits were pushed and deployed successfully; this is a dated verification, not a permanent repository status.

GitHub remote: `https://github.com/osuDaelan/PikApp.git`. The Pages workflow builds with `/PikApp/` as the Vite base and deploys `dist`; asset helpers already accept `import.meta.env.BASE_URL`. Keep new map assets compatible with that base. On October 21, 2026, the user authorized public visibility and website publication. The repository is public and Pages uses GitHub Actions with HTTPS enforced at [PikApp](https://osuDaelan.github.io/PikApp/). [Deployment runs](https://github.com/osuDaelan/PikApp/actions/workflows/deploy.yml) identify the published commit. Only production output is deployed; development calculator files stay local. Localhost and the public website have separate browser saves; cloud sync is not implemented.

## October 22 rapid audit and repair

Completed in about 17 minutes, in four cohesive commits: `5bef076` (dependencies), `99767e0` (calculator), `a67a1d1` (save protection), and `c942d52` (map). [Combined diff](https://github.com/osuDaelan/PikApp/compare/142d1e2...c942d52). Pages deployment [39830182276](https://github.com/osuDaelan/PikApp/actions/runs/39830182276) succeeded.

- Critical: protected unreadable initial saves from fallback autosave/retry and full backup snapshots; added transactional development restore and a gate against overwriting the file after failed startup restoration.
- High: staged step mode until Save, preserved remaining steps during conversion, rejected overflowing numeric input, allowed flower-only forecasts with zero step average, and added three missing early flower tasks. OSM names now share the 120-character saved-pin limit.
- Maintenance: Vite moved from 5.4.21 to 6.4.5; compatible transitive patches and the scoped Firestore gRPC override removed the reported advisories. Both full and production-only npm audits reported zero findings at verification time. The override is `^1.13.6`, resolving to 1.14.6 in the lockfile; reconsider it when upstream Firebase updates its range. Firebase modules import successfully; real OAuth/database behavior remains untested and deferred.
- Medium: new pin-file selections invalidate older reads/previews and show the filename; blocked map history updates no longer escape the effect.

Verification: 112 Node tests (11 more than before), production build with `/PikApp/`, dependency audits and diff checks passed. Controlled storage tests exercised invalid/transient reads, partial writes, rollback failures and backup-write blocking. Browser checks used an isolated preview: level 50 with 5,000 steps remaining survived mode conversion, Cancel, Save and reload; a 400-digit average was rejected without persisting overflow; the lazy map loaded, and a reviewed synthetic pin import persisted after reload. The deployed app loaded without console errors and existing user stats remained intact.

Limits: no physical-phone performance measurement, forced browser history rejection, deterministic overlapping-file browser test or real OAuth/feedback delivery test was performed. Unit failure injection and code review do not replace those checks. No dedicated lint/type-check script is configured. No app or asset rewrite was needed. Prior test counts elsewhere describe their dated milestones; 112 is the current baseline.

## Map feature boundaries

October 24 icon decision: map markers always use original Pikmin Bloom decor-category symbols, replacing the first custom SVG drawings. The temporary **Debug icons: Pikmin Bloom / Emoji** button compares sidebar symbols with the previous emoji, including place details and pin editing; it defaults to the game symbols and resets when Map remounts. The debug state is separate from searches and persistence. Remove the button/state/prop plumbing after a sidebar style is approved; keep the shared image lookup used by markers.

All 39 local transparent PNGs live in `public/images/decor-categories/`, at most 64px each and **43,247 bytes total (about 42 KiB)**. `categoryImages.js` respects the Pages base and `CategoryIcon.jsx` reserves space and uses lazy loading/async decoding. Browsers reuse images across markers and lists; no runtime wiki request is needed. Exact sources/checksums are in [the category icon inventory](map-category-icon-sources.json), with attribution in `public/images/ATTRIBUTION.md`. The 149-test suite/build and isolated desktop/390px checks passed; a 377-place real scan retained all map icon paths/labels when toggling. See [the map verification details](DECOR_MAP_IMPLEMENTATION.md#verification). Existing user saves were untouched.

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
- Level requirements through 120 were checked previously; October 22 added the missing flower tasks for reaching levels 7, 13 and 18 from [Pikipedia](https://www.pikminwiki.com/Level). Whether flower tasks below level 100 reset per level remains unconfirmed. `projectLevels()` currently subtracts consecutive flower requirements in that range; do not treat this as verified game behavior. Check an actual in-game transition before changing it. Other tasks such as growing Pikmin or clearing mushrooms are not forecast inputs.
- Firebase activation, a progress database, account guest-import/merge, automatic multi-device conflicts, automatic full-progress backups and collection history remain deferred. Browser saving and manual full-progress transfer require no account. These features do not require a rewrite of the existing app.
