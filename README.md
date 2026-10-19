# PikApp

An all-in-one Pikmin Bloom companion. Current sections: level calculator and decor collection tracker. See `TODO.md` for planned images, Google sign-in, and cloud progress saving.

## Local development

Use Node.js with npm and the built-in Node test runner (`node --test`).

```powershell
npm.cmd ci
npm.cmd run dev
```

Open the local URL printed by Vite. Saved source changes appear through hot reload. In PowerShell, `npm.cmd` avoids the script execution policy restriction on `npm.ps1`.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

## Commit workflow

Starting October 19, 2026, create a descriptive local Git commit after each major, cohesive change and its appropriate checks. Keep unrelated changes in separate commits. The initial checkpoint captures the already accepted app work; subsequent changes get their own checkpoints. Committing and pushing to GitHub are separate actions.

## Source organization

```text
src/
  App.jsx                       App shell, section wiring, responsive layout
  features/
    calculator/
      levelData.js              Level requirements
      calculations.js           Forecast and coin calculations
      useCalculator.js          Calculator state and edit actions
      CalculatorSection.jsx     Now view
      StatsEditor.jsx           Player-stat editing
      LevelBadge.jsx            Current/next level controls
    decor/
      catalog.js                Locations, costumes, colors, designs, icons
      collection.js             Stable IDs, counting, rare-unlock rules
      useDecorCollection.js     Collection state and toggle/bulk actions
      DecorGroup.jsx            Group, costume, and variant tiles
      DecorSection.jsx          Regular and special/event tracker sections
  shared/
    components/                 Header, navigation, reusable inputs, progress ring
    hooks/                      Window sizing and persisted-state hooks
    styles/theme.js             Shared palette, card surface, shell/pane styles
    format.js                   Number, date, and duration formatting
  storage/
    progressStore.js            Storage interface and local cache implementation
tests/                          Calculation, collection, and storage regression tests
```

Feature-specific layouts stay with each feature. Reusable controls, styles, and persistence belong in shared modules. Add future tools under `features/` and connect them through the shell/navigation.

Calculator and decor state hooks currently mount in the shell so switching tabs or responsive layouts preserves in-memory state. The header owns its clock so its one-second updates do not rerender the whole tracker.

## Level projection data

`src/features/calculator/levelData.js` contains requirements through level 120, verified against [Pikipedia's Level table](https://www.pikminwiki.com/Level) on October 18, 2026. Levels 101–120 use per-level step and flower requirements. Projections stop at 120; levels 121–130 remain undocumented. Missing-data notices and level-entry validation derive their limit from `MAX_KNOWN` so they follow the dataset.

## Saved-progress compatibility

The storage interface is `read(field, fallback)` / `write(field, value)`. It currently uses a synchronous local browser cache; it does not authenticate users or upload data.

Guest fields keep the original keys and formats:

| Field | Existing localStorage key | Format |
| --- | --- | --- |
| level | `pb_level` | Integer string |
| stepsInput | `pb_stepsInput` | Integer string |
| flowersInput | `pb_flowersInput` | Integer string |
| dSteps | `pb_dSteps` | Integer string |
| dFlowers | `pb_dFlowers` | Integer string |
| coinsNow | `pb_coinsNow` | Integer string |
| decorCollected | `pb_decorCollected` | JSON object of collection IDs to booleans |
| showAllDecor | `pb_showAllDecor` | `true` / `false` string |
| totalStepsMode | `pb_totalStepsMode` | `true` / `false` string |

Collection names, variants, and ID generation remain unchanged, so existing valid saves need no migration. Tests verify the original 896 IDs. Browser saves remain tied to the origin: changing hostname or port creates a separate browser storage area.

`createProgressStore({ accountId })` provides a separate local cache namespace for a future account. It never automatically imports guest data. This is an organizational boundary, **not authentication or access control**. Future cloud sync must authenticate users, enforce server-side per-user access, handle conflicts/retries, and explicitly import guest progress. Mount fresh state hooks when changing stores/accounts to avoid carrying one session's in-memory state into another. Inject `getStorage` when testing.

Writes return a success flag; the current UI retains its existing silent local-save behavior. Saving/error indicators and remote sync are in later TODO phases. Invalid stored collection shapes fall back to an empty collection instead of crashing the app.

## Decor images

All **896 existing checklist entries** now use local Pikipedia PNGs, including regular, rare, special/event, and numbered designs. `src/features/decor/decorImages.js` looks up `decorImageData.js`; `DecorImageTile.jsx` displays the artwork without changing collection IDs or storage. Files live in `public/images/decor/`, with attribution in `public/images/ATTRIBUTION.md` and an exact per-image source/checksum inventory in `docs/decor-image-sources.json`. The current catalog groups some in-game designs into one entry; 36 such entries use explicitly marked representative artwork. This rollout does not add new catalog variants.

The tiles are 76×120px with contained artwork and a color/design label, wrapping to fit narrow screens. Uncollected artwork is muted; collected artwork is full color with a checkmark. The native buttons support keyboard interaction and `aria-pressed`; rows are labeled groups. Missing images retain a usable fallback. Regular tiles use the approved soft pop and confetti ring; rare tiles use blue-halo stars and gold sparkles instead. There is no plus badge.

Images load lazily and decode asynchronously. Tile memoization and stable callbacks avoid rerendering unchanged artwork; confetti elements exist only during the brief collection burst. The complete original PNG set is about 27 MiB, with no continuous idle animation. See [Decor image rollout and performance checks](docs/DECOR_IMAGE_ROLLOUT.md) for verification results, representative-design limitations, and follow-up profiling options. Image resizing, format conversion, and virtualization remain deferred pending real-device measurements.

Animation styles are being tried one at a time. Trials **01 — Pop and sway**, **02 — Float and turn**, and **03 — Soft pop and flash** are retired; their behavior, timing, and exact source are saved in [Decor animation experiments](docs/DECOR_ANIMATION_EXPERIMENTS.md). **04 — Soft pop and confetti ring** remains the regular-tile style: collecting briefly enlarges the artwork by 7.5% with a small outward burst of eight pastel confetti pieces. There is no glow flash, idle loop, or rotation of the Pikmin. Reduced-motion preferences disable both effects, and loading saved progress does not replay the selection effect. Presentation lives in `src/features/decor/useDecorTileMotion.js` and `decor-tile-motion.css`, separate from collection and storage. To return to static tiles, remove their imports, the hook call, and its button spread from `DecorImageTile.jsx` (the decorative confetti can also be removed). Archive each trial in the experiment log before replacing it.

Every newly collected tile also gets a mint glow and six small twinkles that fade out over three seconds. This separate layer outlasts the short pop/confetti or rare stars; uncollecting cancels it and saved progress does not replay it. Rare stars and new-item twinkles choose fresh angles and distances in a narrow band around a 34×34px central dead zone, accounting for particle size and outward drift while staying inside the tile. Shared placement lives in `src/features/decor/sparkleLayout.js`; the temporary visual debug overlay and controls have been removed.

Completing the last required item in a costume row now triggers a brief set-completion confetti blast inspired by the supplied in-game recording. Manual and bulk selections share the same transition detection, and saved complete sets do not replay it on load. One temporary canvas handles the two sprays; reduced-motion users get a short message without particles. See [Decor celebration effects](docs/DECOR_CELEBRATIONS.md) for observations from all three reference recordings, the rare-star variant and new-item sparkles, source files, tuning points, performance limits, and verification.

## Pikmin Decor Visuals and Animations

Reference research, October 18, 2026: [maggie62755/Pikmin-Bloom-Decor-Tracker](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker), examined at commit [`b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/tree/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f). This section describes that reference project, not features already added to PikApp. PikApp's decor image rollout is documented separately above.

### Overview

The reference tracker is a **2D image interface**. Each visible Pikmin already includes its decor in one PNG. React chooses the correct PNG and collection state; ordinary HTML images display it; CSS supplies hover movement, collection bounces, shakes, fades, and shadows. The apparent depth comes from the artwork and CSS effects. There is no live 3D body, separate attached hat, rig, skeletal clip, camera, or lighting engine in this pipeline.

Verification included the actual source/import chain, package manifest and lockfile, complete Git tree inventory, catalogue-to-file matching, asset downloader/update scripts, three PNG binaries inspected in memory, deployed stylesheet, and the live Restaurant category. No repository scripts were executed, and the reference site's collection statuses were not changed. Its deployed first card used `Restaurant/ChefHat_Red.png`, `object-fit: contain`, grayscale filtering and opacity `0.35`; Restaurant rendered 16 cards with zero canvas/video elements.

### Key files and assets

Paths below belong to the reference repository. Source links are pinned to the examined commit.

| File / asset | Role and evidence |
| --- | --- |
| [`src/data/decors.json:3–42`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/data/decors.json#L3-L42) | Category/variant IDs, available colors, image folder and filename prefix. Restaurant and normal/rare Chef Hat mappings. |
| [`src/constants.js:3–25`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/constants.js#L3-L25) | Imports the catalogue; defines eight species/color IDs and four collection statuses. |
| [`src/pages/Tracker.jsx:14–28, 53–89`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/pages/Tracker.jsx#L14-L89) | Connects category, collection state and card callbacks; warms image URLs when a category opens. |
| [`src/components/DecorGrid.jsx:7–73`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/components/DecorGrid.jsx#L7-L73) | `VariantRow` maps available colors or numbered designs to `PikminCard` instances. |
| [`src/components/PikminCard.jsx:10–174`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/components/PikminCard.jsx#L10-L174) | Constructs the image URL, responds to input, chooses transient animation classes, renders image, status badge and menu. |
| [`src/components/PikminCard.css:24–180`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/components/PikminCard.css#L24-L180) | Actual card animation keyframes, hover transforms, state filters, sizing and focus styles. |
| [`src/components/shared/SmartImage.jsx:4–46`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/components/shared/SmartImage.jsx#L4-L46), [`src/utils/imagePrefetch.js:1–69`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/utils/imagePrefetch.js#L1-L69) | Visibility-based loading, remembered successful URLs, deduplicated in-flight preloads and a three-task prefetch queue. |
| [`src/components/shared/StatusIcon.jsx:19–39`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/src/components/shared/StatusIcon.jsx#L19-L39) | Separate sprout, heart and checkmark UI overlays; growing badge pulses. |
| [`public/images/decors_images/Restaurant/ChefHat_Red.png`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/public/images/decors_images/Restaurant/ChefHat_Red.png) | Complete standard Red Chef Hat picture: 153×361 RGBA PNG, transparent corner, no APNG animation-control chunk. |
| [`public/images/decors_images/Restaurant/ChefHat(Rare)_Red.png`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/public/images/decors_images/Restaurant/ChefHat%28Rare%29_Red.png) | Separate complete rare picture: 63×149 RGBA PNG, transparent corner, no APNG animation-control chunk. |
| [`public/images/decors_images/AppliancesStore/Battery_Yellow1.png`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/public/images/decors_images/AppliancesStore/Battery_Yellow1.png) | Separate numbered design, not an animation frame: 150×206 RGBA PNG, transparent corner, no APNG animation-control chunk. |
| [`public/images/icons/Restaurant.png`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/public/images/icons/Restaurant.png) | Category symbol, rendered as a CSS mask, not part of the Pikmin image or rig. |

### Rendering, assets and loading

The chain is `decors.json → constants → Tracker → DecorGridCategory → DecorGrid / VariantRow → PikminCard → SmartImage → <img>`. React Router mounts `Tracker` at `/tracker` (`src/App.jsx:28–39`). `DecorGridCategory` mounts its child cards only while open (`src/components/DecorGridCategory.jsx:49–55`); closing a category therefore destroys its local animation state.

The application implements the catalogue mapping, loading policy and interaction classes. **The browser** decodes PNGs, lays out HTML, interpolates CSS keyframes and composites filters/shadows. **React** manages state/DOM and memoized components. **Tailwind/PostCSS** generate utility styles; **Lucide React** provides SVG status/navigation icons; **Vite** builds and supplies the project base URL. These are not character-rendering engines. The manifest declares no Three.js, Babylon.js, Pixi, Lottie, GSAP or Framer Motion dependency ([`package.json:15–36`](https://github.com/maggie62755/Pikmin-Bloom-Decor-Tracker/blob/b0e3a4fc31d084d4bc91756d1cba8d9a45c9d73f/package.json#L15-L36)); the lockfile check likewise found none of those packages. The complete file inventory contained no GLB, glTF, FBX, OBJ, skeletal-animation, video or GIF assets.

At this revision there are **88 catalogue categories and 829 referenced visual entries**. Reconstructing every image path with the application's formula found **zero missing paths** in the Git tree. The repository contains **1,014 decor PNG files**, so some committed PNGs are not selected by the current catalogue. File presence alone does not prove the contents of every image are correct; binary checks were limited to the three samples above.

Browser URLs are built by `PikminCard` at lines 28–30:

`BASE_URL + images/decors_images/ + category.image_path + / + variant.image_name + _ + capitalizedColorId + .png`

`vite.config.js:5–7` sets the base to `/Pikmin-Bloom-Decor-Tracker/`. Files are committed under `public/` and served by the deployed site; the running tracker does not ask Pikipedia or a model-rendering service to create a character. `.github/workflows/deploy.yml:30–45` builds the site and publishes `dist`. `scripts/build-route-pages.mjs:1–10` also creates physical route entry pages for GitHub Pages.

`SmartImage` delays assigning `src` until the element approaches the viewport, using `IntersectionObserver` with a 240px root margin; cached images or browsers without that API load immediately. It uses asynchronous decoding and marks successful URLs in a module-level set. Opening a category calls `warmImages(..., 20)` (`Tracker.jsx:85–89`), with three concurrent **prefetch tasks**. That is not a global three-request cap: visible `SmartImage` requests are still scheduled separately by the browser. Errors replace the picture with `MissingImageFallback`, a color-tinted panel, Lucide sprout and localized text (`MissingImageFallback.jsx:6–80`).

### Asset provenance and decor attachment

The maintenance scripts obtain **existing PNGs from Pikipedia**. `image_download_helper/download_decor.py:9–10, 37–43, 46–133` reads the Decor Pikmin table, expands its rowspans and converts thumbnail links to original-image URLs. Numbered files are mapped to stable design suffixes at lines 109–124. `download_special_decor.py:24–29, 59–107` uses the wiki's parse/imageinfo API to locate Special Decor images; lines 170–197 download and name the files.

The consolidated updater defaults to `public/images/decors_images` and `src/data/decors.json` (`update_decors.py:44–46`). Its standard-category path preserves IDs, creates variant metadata and destination names, stages downloads, validates the PNG signature and commits images plus catalogue updates (`update_decors.py:561–729`; validation at 374–382). The GUI manager calls that same downloader/validator (`decor_manager.py:273–281`). These tools download/rename files; they do not extract game packages, build meshes, bake materials, render new poses or manufacture animation frames. The older standalone downloaders use their own output arguments/current-directory behavior; the consolidated updater is what supplies the project defaults.

**The body, hat and leaf are already flattened together in each picture.** There is no separate hat object, head bone, attachment socket, per-decor position/rotation/scale, texture map or material definition. Moving/scaling the card moves the entire image together. The status badge is a separate DOM overlay, not a wearable attached to the Pikmin. To move only the chef hat, one must change the source artwork or introduce a new layered/3D representation; changing a CSS bone offset is not possible because no such offset exists.

### Animation behavior

The four values are collection UI states—missing `0`, seedling `1`, growing `2`, collected `3`—not an idle/walk/attack character state machine (`constants.js:20–25`). The same PNG stays loaded across those states; CSS changes its presentation.

| Trigger | Actual behavior | Implementation |
| --- | --- | --- |
| Hover | Card lifts 4px and tilts −2°; inner image container scales to 1.08. | `PikminCard.css:24–34, 108–120`; card transition 300ms, container transition 200ms. |
| Collect | Whole card bounces: scale 1 → 1.2 at 40% → .95 at 70% → 1, with −5°/+3° rotation; badge pops in. | `PikminCard.jsx:43–51, 59–68`; CSS 65–81, 91–94. Card 500ms spring-like cubic-bezier; badge 300ms. |
| Uncollect | Whole card shakes left/right by 3px and rotates slightly. | CSS 69, 82–86: 300ms ease-out. |
| Choose seedling/growing | Whole card briefly scales to 1.06 and back. | CSS 70, 87–90: 300ms ease-out. |
| Growing badge | Heart badge pulses continuously, independently of the PNG. | `StatusIcon.jsx:27–31`, Tailwind `pulse_2s_infinite` utility. |

Collection/change/shake animations run once: no infinite count or fill mode is specified. `onAnimationEnd` clears only the three recognized **root-card** animations (`PikminCard.jsx:123–126`); the badge's child animation does not clear the card. Hover's resting transform is incorporated through `--card-rest-transform`. There are no clips to load, skeletons, animation mixers, blend weights, per-species speeds, random idles or frame-update loops. CSS easing resembles a spring, but no physics solver is used. The 300ms image-opacity transition is a fade, not skeletal blending. Body parts never move independently.

Normal click/tap or Enter/Space toggles missing ↔ collected; a seedling/growing entry also becomes collected on normal click. Right-click, ContextMenu key, or a 500ms touch hold opens a four-state menu. A supported device may vibrate for 50ms. Choosing a menu state triggers its animation and calls the state callback. The context menu itself is a portal with opacity/scale/translation transitions; close/select callbacks wait 200ms (`ContextMenu.jsx:12–28, 37–55, 114`). The context's generic `toggleStatus` can cycle four states, but these cards explicitly supply the desired state (`PikminContext.jsx:49–68`), so the README's broad “cycle” description does not describe ordinary card clicks accurately.

**List view differs:** `DecorList.jsx:12–108, 142–170` uses `MiniCard`, the same complete PNGs, `SmartImage`, status icons and menu, but does not attach the grid's transient collect/shake classes. `DecorList.css:154–240` supplies 44px/48px cards, hover scale 1.1, state filtering and a clipped image container. Its images are sized 150% on larger screens and 110% on mobile, so framing differs from the grid. Its minimal growing status icon has no continuous pulse. This is a second presentation of the same assets, not another rendering engine.

Reduced-motion behavior is explicit: the global rule makes durations nearly instantaneous and limits iterations (`src/index.css:72–81`), with additional card rules at `PikminCard.css:176–180`. Merely finding the generic `float` animation in `tailwind.config.js:26–37` does not establish floating characters: the inspected tracker card chain does not apply it.

### Variant selection and one complete walkthrough

For **Restaurant → Chef Hat → Red**:

1. `decors.json:3–24` supplies category `restaurant`, folder `Restaurant`, variant `chef_hat`, prefix `ChefHat`, and color `red`. The rare variant uses `shiny_chef_hat` / `ChefHat(Rare)` at lines 27–41; it is a different image mapping, not a material/shader switch.
2. Opening Restaurant mounts its two variant rows. `VariantRow` finds the red color definition and obtains `collection.chef_hat.red`, defaulting to missing (`DecorGrid.jsx:26–54`).
3. `PikminCard` capitalizes `red` and builds `/Pikmin-Bloom-Decor-Tracker/images/decors_images/Restaurant/ChefHat_Red.png`. `SmartImage` loads the committed PNG; the browser renders the full body, chef hat and leaf together.
4. The image fits inside a responsive container using `object-fit: contain`. Missing state is grayscale, brightness .9 and opacity .35. Seedling/growing use opacity .8; collected uses opacity 1 and a slightly stronger drop shadow (`PikminCard.css:38–63, 97–131`).
5. Clicking computes status `3`, assigns `just-collected`, and calls `toggleStatus('chef_hat', 'red', 3)`. Context updates `collection.chef_hat.red`; React updates status class/badge; CSS runs the bounce. The image URL does not change. After the root animation ends, the transient class clears.

Numbered designs are an important mapping exception, not animation frames. `decors.json:1319–1347` lists Battery as `yellow`, `yellow1` … `yellow5`. `getBaseColorId` strips the numeric meaning for species styling, but the original `colorId` is preserved for storage and filenames (`DecorGrid.jsx:9–39`). The second yellow design therefore loads `AppliancesStore/Battery_Yellow1.png`; it does not play the next frame of `Battery_Yellow.png`. Rows with repeated base species use sequential placement. The current grid iterates the eight color definitions, so a future variant with more than eight entries would need layout changes or splitting; none currently exceeds eight.

### Presentation and practical modification points

No camera settings or scene lights exist. Viewing angle, pose and genuine character shading are baked into each PNG. The grid uses CSS layout: 3 columns at ≤420px, normally 4, 5 from 480–639px, and 8 at ≥640px (`DecorGrid.css:37–62`). Image containers are approximately 54–80px high on small screens and 86–112px on larger screens (`PikminCard.css:97–116`). These are pixel-layout decisions, not projection or model scaling.

The surrounding garden/journal look comes from cream/green theme variables, radial glows and a faint 24px grid background (`src/index.css:8–58`), translucent category panels and CSS shadows. Category icons use PNG masks, colored by CSS (`DecorGridCategory.jsx:20–27`; `index.css:276–284`). The footer separately repeats `public/assets/footer.png` at 400px width (`footer.jsx:9–20`). None of these is an environment map or 3D texture.

| Desired change | Where to change it / what is required |
| --- | --- |
| Change a decor's actual appearance | Replace the complete PNG under `public/images/decors_images/<folder>/`, or edit `image_path` / `image_name` in `src/data/decors.json` to select another file. Keep IDs stable to preserve collection state. |
| Reposition hat relative to head | No attachment parameter exists. Edit/create composite artwork externally, or build a new layered representation with authored anchors. Real head motion would additionally need animation frames or a rigged system. |
| Change overall framing / size | `PikminCard.css:97–131` and `DecorGrid.css:37–62`. For list framing use `DecorList.css:154–240`. Camera-angle changes require different source artwork, not `object-position`. |
| Change which effect plays | `triggerAnimation` in `PikminCard.jsx:43–51`, plus the click/menu handlers at 59–100. Update the recognized end-animation names at 123–126 if renaming root effects. |
| Change animation speed / motion | Durations/easing at `PikminCard.css:65–94`; keyframes there define scale/translation/rotation. Change growing badge cadence in `StatusIcon.jsx:29`. No asset animation-speed field exists. |
| Change brightness, shadows or background | State filters and drop shadows in `PikminCard.css:38–63, 122–143`; background/theme in `src/index.css:8–58`, `src/theme/colors.js`, `tailwind.config.js`. Physically different lighting needs a new image or a new renderer. |
| Add a new decor | Add stable category/variant metadata and allowed color/design IDs to `decors.json`; supply each complete PNG with exact folder/name/case; optionally add a category icon. Existing Pikipedia art can be downloaded with the maintenance tools. Art not already available must be drawn/rendered externally; the application cannot synthesize a decorated body. |
| Add true character animation | New assets and rendering logic are required: authored image sequences, animated images, layered motion, or models/rigs/clips plus a rendering engine. Current code cannot animate the hat/limbs independently. |

### Remaining unknowns and implications for PikApp

- The upstream game models, rigs, materials, authoring files and original rendering/capture process are not included. The code proves it displays pre-composited pictures; it cannot establish how Nintendo originally produced every PNG.
- PNG dimensions/transparency/static-frame checks were performed for three samples, not all 1,014 decor files. The normal/rare Red Chef Hat images already show inconsistent resolution (153×361 versus 63×149), so image quality needs reviewing during any bulk import.
- No catalogue reference was missing from the examined Git tree. This does not validate the visual identity or provenance of every file, nor prove that all historical assets were fetched by the current scripts.
- The live tracker and deployed CSS matched the inspected URL formula, sizing, state filters and keyframe names. The deployed site did not expose its Git commit, so exact whole-build parity with the pinned source revision is not established.
- The named card effects were verified in source and deployed CSS. This review opened Restaurant but did not change its collection states; it did not benchmark frame rate, mobile long-press reliability or rapid interrupted animations.
- Asset visibility and a public repository do not establish permission to redistribute the artwork. No explicit asset-use grant was established during this review.

For PikApp, the reference supports our current one-PNG-per-existing-ID approach. Comparable sticker movement can be added with CSS to the image tile without introducing a 3D engine. Importing its catalogue IDs directly would be a separate migration decision: our pilot key is `restaurant__chef_hat__Red`, while this reference stores `collection.chef_hat.red`. This investigation changed project notes only; no reference code/assets were imported into PikApp.

## Local-time Garden wallpapers

All screen sizes use only the three official Nintendo Garden backgrounds. The visitor's device clock selects the image:

- **Day:** 6:00 AM–4:59 PM (includes morning).
- **Evening:** 5:00 PM–9:59 PM.
- **Night:** 10:00 PM–5:59 AM.

The image updates at minute boundaries and when the tab regains focus or visibility, including after sleep or a timezone change. This schedule also runs in production; it does not require location permission or a server timezone.

Wallpapers use the approved framing on every device: fill the screen, center the image, and apply an 18% dark overlay. The temporary debug picker, overrides, preview settings, and enable flag have been removed. Legacy `pb_wallpaperDebug` browser data is ignored; collection and calculator saves are unaffected.

The schedule runs in development and production. Implementation lives in `src/features/wallpapers/`: `catalog.js` defines the three official images, `timeOfDay.js` defines the schedule, and `useWallpaper.js` keeps it current. Source links are in `public/images/ATTRIBUTION.md`.

## Scope of the organization refactor

This step moves existing data, behavior, and UI into modules. It does not change game requirements, forecast assumptions, or add account features. Known calculation edge cases and data updates from the project analysis still need a separate correctness pass before relying on all forecasts. All production dependencies remain unchanged.
