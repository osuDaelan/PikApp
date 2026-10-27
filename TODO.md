# PikApp TODOs

Goal: expand PikApp as an all-in-one Pikmin Bloom companion. The current focus is reliable browser autosave, returning visits, manual full-progress file transfer and one private feedback form, alongside decor-map refinement. Accounts and automatic cloud synchronization are deferred.

Last reviewed October 27, 2026, after matching regular gallery order and expanding all six Theme Park tickets. Checked tasks are completed milestones; unchecked tasks are remaining work. See [the project guide](docs/PROJECT_GUIDE.md) for current architecture and [the map plan](docs/DECOR_MAP_PLAN.md) for proposed map boundaries. At the user's request, Google sign-in is hidden entirely; its code is retained but unmounted, and Firebase configuration/cloud sync are deferred. Browser-local calculator, checklist and map progress remain available without an account. The map uses the chosen OSM/Overpass approach. The repository is public and HTTPS GitHub Pages uses GitHub Actions; pushes to `main` test, build and deploy the app to [PikApp](https://osuDaelan.github.io/PikApp/).

## 1. Organize the existing app for new sections

- [x] Move decor catalogue data out of `src/App.jsx` into a dedicated data module.
- [x] Separate the decor tracker components from the calculator components.
- [x] Put shared navigation, controls, and visual styles in shared modules.
- [x] Introduce a storage layer that can support both guest data and signed-in accounts.
- [x] Keep the current calculator and existing saved collections working during the changes.
- [x] Preserve existing collection IDs when moving data. Add a migration if any IDs must change.

Completed: feature modules, shared controls/styles, and a storage interface with legacy guest keys and isolated local account caches. No ID migration was needed. Account authentication and cloud synchronization remain in steps 4–5. See `docs/PROJECT_GUIDE.md` for the current folder map and `docs/DEVELOPMENT.md` for the storage contract.

- [x] Audit and document the current project before starting the third section.
- [x] Separate current behavior, historical experiments, remaining tasks and map planning notes.

## 2. Add images to the decor tracker

- [x] Keep collection-based rare unlocks, with Coffee Cup, Chef Hat, Toothbrush, Ticket, Ball Keychain, Clover and Four-Leaf Clover requiring only their original seven base colors (Ice excluded). Forest requires both complete Stag Beetle and Acorn sets, and Park requires both seven-color Clover and Four-Leaf Clover sets, before revealing either rare row. Removed the per-category Auto / Show / Hide experiment at the owner’s request; old progress backups remain importable. Search respects unlock rules and hides locked rare matches/counts/bulk targets unless Show all is explicitly enabled.

- [x] Add searchable ranks/suits for all 27 Playing Cards without changing saved IDs.
- [ ] Verify Hanafuda month names and Mahjong tile names before restoring descriptive labels. At owner request these 67 tiles use species + number for now; draft names are preserved in commit `7e77844`.
- [x] Recognize decor names containing species words without quotes, including Ice Cream and Shaved Ice.
- [x] Make Shrine & Temple a browser-persisted option, off by default, excluded from hidden results/totals/bulk actions while preserving saved marks.

Images cover all 1,056 current checklist entries (527 regular/rare, 529 special/event), including numbered designs. Original Pikipedia PNGs use the approved pop/confetti tile with lazy loading and memoized rendering. Sources/checksums are recorded per asset; all active entries use exact design artwork. The October 27 card, Leaf Hat, Chess and Theme Park expansions retain old grouped marks for explicit review rather than guessing ownership; unaffected IDs stay unchanged. See `docs/DECOR_IMAGE_ROLLOUT.md` for verification and remaining performance checks.

- [x] Recheck regular/event galleries on October 22 and add 79 missing entries with verified artwork: 975 total (522 regular/rare, 453 event).
- [x] Preserve all 896 original IDs and test old/new full-progress backup compatibility. Full suite: 114 tests; production build and ordinary browser persistence checks pass.
- [ ] Recheck species and rare rows as well as category names when new decor is released; do not infer availability solely from a filename elsewhere.
- [x] Expand Hanafuda (24 + 16), Playing Card (27) and Mahjong (27) into individual pictured designs. Preserve the 25 older grouped marks for explicit review and keep old/new progress backups compatible.
- [x] Expand Rainy Day into three pictured Blue Leaf Hat designs; retain the previous grouped mark for explicit review and backup compatibility.
- [x] Separate Chess Pieces into white and black sets of seven, with local artwork and safe review of older species-level marks.
- [x] Expand all six Theme Park tickets, preserving three old grouped marks for review; no representative entries remain.
- [x] Match regular category/costume/design order to the wiki gallery, with Winged before Rock. Retain Weather/Fortune save namespaces under the new display headings. Verify all 527 regular tiles against a source-derived gallery fixture.

### Asset preparation

- [x] Decide the image style: individual Pikmin artwork for each color/design, with a consistent crop and background.
- [ ] Identify a permitted source for artwork and record source links, usage terms, and any required attribution.
- [x] Start with one decor category to validate the appearance before importing the full catalogue.
- [x] Create a consistent file naming convention and store image assets separately from UI code.
- [x] Map each existing collection ID to its image, display name, and accessible description.
- [x] Track which catalogue entries still need an image.
- [ ] Optimize image dimensions and file sizes for mobile use.

### Tracker interface

- [x] Replace placeholder color/design tiles with image tiles while preserving collection toggles.
- [x] Distinguish collected/uncollected items and control locked rare visibility; omit unavailable species instead of leaving empty slots.
- [x] Keep a useful fallback when an image is missing or fails to load.
- [x] Lazy-load images and reserve their dimensions to avoid layout shifts.
- [x] Give each toggle an accessible name and pressed state; support keyboard operation.
- [x] Verify regular decor, rare decor, event decor, and numbered design variants.
- [x] Verify narrow phone layouts, desktop split view, and bulk selection.
- [x] Add a set-completion confetti blast and rare-only tile stars inspired by the in-game reference video, with reduced-motion support and no persistent particle loop.
- [x] Add checklist search for species, category, costume/design text, collected/missing and regular/rare/event status. Support AND/OR/NOT, grouping, straight-quoted literals and exact fields, with syntax help/errors, live result counts and bulk actions scoped to visible variants. Search respects rare unlock rules; only Show all previews locked rare decor. See [search behavior](docs/PROJECT_GUIDE.md#decor-checklist-search).

- [x] Keep newly collected missing-search results clickable for three seconds to undo mistakes, including `!collected` and bulk edits; save immediately, expire each tile independently and clear grace when the query changes.

## 3. Decor map: initial slice and follow-ups

The first slice is implemented in its own lazy React feature: 39 OSM location categories, map/details, local personal pins and pin export/import. See [current implementation](docs/DECOR_MAP_IMPLEMENTATION.md), [map plan](docs/DECOR_MAP_PLAN.md) and [reference investigation](docs/DECOR_MAP_REFERENCE.md). Public example testing starts in Boston; no personal location is committed.

- [x] Record the existing shell/data/storage boundaries and the desktop navigation limitation.
- [x] Confirm the map's overall purpose: discovery plus personal pins.
- [x] Trace the chosen OSM reference's frontend, rule table, query/classification/geometry pipeline and optional server mirror; record integration gaps and live-test limits.
- [x] Define the first public test area, location categories, discovery flow and basic personal pins.
- [x] Install Leaflet/converter and configure independent tile/Overpass providers with attribution. Use the working French source by default; keep manual alternatives.
- [ ] Select a provider/design for address/city-name search. Current controls accept coordinates/map links; no public Nominatim autocomplete or restricted author mirror is used.
- [x] Replace desktop Overview with a calculator-only page; order navigation Decor, Map, Mushroom, Calculator, with Decor as the default and old `#now` links still working.
- [x] Keep section navigation in the same bottom position on Map and every other section, including scrollbar-related centering. Reserve space below the desktop map so controls remain unobstructed; verify desktop and mobile switching.
- [x] Make all four sections reachable at every width, with section hashes/back/forward and shareable map-view URLs.
- [x] Implement the map separately from the shell/checklist, with source and category adapters.
- [x] Fix Add pin replacing Leaflet's layout classes; verify placing, canceling, saving, editing, reload and confirmed deletion in an isolated desktop/mobile preview. New visitors start in Boston at zoom 12 with all 39 categories selected; saved preferences and shared views remain respected.
- [x] Test normalized tag matching, unique categories, source IDs and polygon/relation holes.
- [ ] Implement actual regional validation before adding country-dependent Fortune rules; weather/event outcomes remain outside OSM discovery.
- [x] Add loading, empty, error, timeout, cancellation and retry states, with explicit Search this area requests.
- [x] Retain the last scan while panning/zooming or replacing a search; include a bounded surrounding buffer and show its scanned-area outline.
- [x] Implement approved green park/blue water fills and a stronger selected-area outline; reserve room for area results within bounded searches. See [approved visual direction](docs/DECOR_MAP_PLAN.md#approved-visual-direction--october-21-2026).
- [x] Replace disliked pale emoji discovery pins with original Pikmin Bloom category symbols in compact circles; this supersedes the first custom SVG design. Keep selected rings and saved-pin badges.
- [x] Add a temporary sidebar debug button to compare original game category symbols with emoji; keep map markers on game symbols regardless of the comparison setting.
- [x] Choose original Pikmin Bloom category icons throughout the map section; remove the temporary emoji comparison button/state/props/CSS after approval.
- [x] Apply the approved yellow-to-lime icon on dark teal for fully collected map categories, including all colors/designs/rares. Reuse local PNGs as masks in map markers, category/place/pin lists and pin editing. Preserve black incomplete icons, selection rings, saved-pin badges and Missing only behavior.
- [x] Add selected-place details, category filtering and Missing only using the single existing collection state owner.
- [x] Implement explicit one-shot Locate me and denied/unavailable fallbacks.
- [x] Add versioned separate pin/preferences storage, protected unreadable saves, add/edit/confirmed delete, export and reviewed import/merge.
- [x] Bound searches/results, cache/throttle requests, cancel obsolete work and clean up map instances/listeners.
- [x] Verify desktop/390px layouts, controlled map geometry/details, pin reload/export/import and unchanged existing calculator/checklist values.
- [ ] Profile dense real-world results and GPS/touch behavior on a physical phone; add clustering or list pagination if measurements justify it.
- [x] Document data uncertainty and keep candidate locations distinct from guaranteed game results.

## 4. Deferred accounts with Google sign-in

On October 22 the user chose to hide sign-in entirely and focus on browser autosave and returning visits. The completed auth groundwork below is retained for later; it is not mounted and does not initialize Firebase or enter the production app bundle. Configuration and real OAuth verification are deferred, not current user setup tasks. Google sign-in would establish identity; a separate database/storage layer would save account progress.

- [x] Select Firebase Authentication with Google for the sign-in foundation. Firestore is proposed for the separate cloud-sync phase.
- [ ] Define which data belongs to an account: decor collection, player stats, daily averages, and lasting preferences.
- [ ] Set up separate development and production configuration.
- [ ] Configure Google sign-in and approved local/production callback URLs.
- [x] Implement sign-in, sign-out, and account status controls; retain them unmounted with no visible account control, at the user's request.
- [x] Implement cancelled sign-in, expired-session/error messages and loading/retry handling; cover the session controller with controlled-client tests.
- [x] Implement Firebase's session observer and cleanup for future account use; do not mount it while sign-in is deferred.
- [ ] Verify real Google sign-in, restoration, sign-out and mobile popup behavior after configuring Firebase. See [setup and verification](docs/GOOGLE_SIGN_IN.md).
- [x] Keep guest use available without requiring an account.
- [x] Keep privileged server credentials out of the frontend and Git; commit a blank Web-config template and ignore local env files.
- [ ] Enforce per-user access in the database/backend so users can only read and change their own progress.
- [ ] Explain what account data is saved and how users can delete it.

## 5. Save and synchronize progress

### Data model and guest migration

- [x] Define a versioned portable full-progress JSON format with stable decor IDs and an export timestamp.
- [ ] Define future account-sync update timestamps/revisions and conflict metadata separately from the portable browser-save format.
- [x] Continue saving guest calculator/collection progress in browser storage with legacy keys.
- [x] Show calculator/checklist browser-save success or error status and let failed writes be retried; keep map saving in its existing separate flow.
- [x] Verify saved calculator edits, daily averages, checklist choices and a test map pin/category/notes after closing and reopening a separate production-preview site's tab; retain existing user data during the check. Full browser restart and physical-device checks remain future validation.
- [x] Add a private development-only calculator file backup and startup restore; exclude personal data and the endpoint from production.
- [x] Add **Browser saves → Export progress / Import progress** for calculator values, checklist/visibility and map pins/preferences; leave OSM results, artwork and auth data out.
- [x] Validate and preview imports before explicit **Replace browser progress**; replace rather than merge so unchecked items and deleted pins can transfer.
- [x] Keep a local previous-save recovery copy, offer **Download previous save**, and report replacement/rollback failures.
- [x] Remount app progress after successful import without reloading the page; protect imported calculator values from an older development file backup.
- [x] Verify export, reviewed import and restored values/pin details after reload across isolated browser origins, without changing real user saves. Node tests cover invalid files, explicit unchecks/deletions, recovery round-trips and failed-write rollback; physical-phone file selection remains to be checked.
- [ ] Decide whether to expand the private development file backup beyond calculator data; full-progress exports are manual downloaded files.
- [ ] On first sign-in, offer to import the collection already saved in that browser.
- [ ] Define what happens if both guest progress and account progress exist; preview the merge and avoid silently replacing either collection.
- [ ] Keep a local recovery copy until any future guest-to-account import has succeeded.
- [x] Provide isolated guest/account local cache namespaces without automatically importing guest data.
- [ ] Integrate and test those namespaces with real authentication, including account switching and sign-out.
- [ ] Decide whether to record when an item was collected, in addition to its collected/uncollected state.

### Cloud persistence

- [x] Patch the October 22 dependency advisories: Vite 6.4.5, compatible transitive updates and a scoped Firestore gRPC override; full and production-only audits report zero findings. Recheck before future database activation.

- [ ] Load saved account progress after sign-in.
- [ ] Automatically save collection changes and profile updates.
- [ ] Show clear saving, saved, offline, and retry states.
- [ ] Handle failed requests without losing the user's recent changes.
- [ ] Define conflict handling for edits made in multiple tabs or on multiple devices, including uncollecting an item.
- [ ] Batch rapid changes and bulk selections to avoid unnecessary writes.
- [ ] Extend the portable export/import flow above to account progress so users can back up and move it.
- [ ] Provide account-data deletion and a clear confirmation before clearing a collection.

## 6. Verification before release

- [x] Verify existing localStorage formats and original 896 collection IDs during the feature/image changes.
- [ ] Recheck saved progress and layout after map integration and later schema/account changes.
- [ ] Test guest use, first sign-in, guest import, returning sign-in, sign-out, and account switching.
- [ ] Verify future account progress is automatically restored on another signed-in device; manual full-progress transfer is a separate flow.
- [ ] Verify one account cannot access another account's data, including through direct requests.
- [ ] Test offline edits, failed saves, reconnects, and conflicting updates.
- [x] Add a regression check for the original catalogue IDs and totals.
- [ ] Continue checking ID compatibility for each future catalogue expansion or migration.
- [ ] Check image loading, touch targets, keyboard navigation, and mobile performance.
- [x] Establish the current test/build baseline: 114 Node tests and the production `/PikApp/` build pass after the October 22 catalog refresh (the earlier audit baseline was 112). Earlier milestone counts remain historical.
- [x] Add focused map query, geometry, search lifecycle, pin storage and import checks. Add future account migration/merge tests when those behaviors exist.
- [x] Document current local setup and prepared GitHub Pages workflow.
- [x] Confirm public Pages hosting and successful deployment through repair commit `c942d52`; provider setup and pending auth/feedback work are documented. Check each later deployment separately.

## 7. In-app feedback form

- [x] Record the latest user decision: keep one in-app feedback form with no destination selector, GitHub links or public route. Repository issues remain accessible directly outside the app; Google sign-in remains deferred.
- [x] Keep the header type/section/title/details review flow, configured private POST and metadata-only client limits. Retain the older GitHub URL helper/tests only for compatibility/history, with no UI entry point.
- [x] Omit automatic stats, checklist, pins, coordinates, page URL and device details from reports; distinguish normal provider network/origin information.
- [x] Document owner Formspree setup, native POST/hosted CAPTCHA handoff, blank configuration, free-plan quota and lack of delivery confirmation in PikApp. See [Feedback](docs/FEEDBACK.md).
- [x] Preserve historical GitHub-only verification: 97 tests/build, validation/review/navigation, cooldown after reload, Escape/focus and 390px/1100px layouts. No public issue was submitted; this does not verify private delivery.
- [x] Preserve the earlier selector-version checks: 101 tests passed; blank private configuration was disabled, public review worked, and a configured preview had reviewed allowlisted fields and native POST/new-tab/`noopener` attributes. No provider submission was sent; this is historical verification.
- [x] Verify the simplified form has only type/section/title/details, no selector or GitHub links, sending disabled when unconfigured and a clean browser console; all 112 tests and the production build pass. No provider submission was sent.
- [x] Create the owner's PikApp Feedback form, connect its public endpoint to the Pages workflow, verify an email delivery action exists and enable/check Formshield, CAPTCHA and the production domain restriction. Local sending stays disabled unless deliberately configured; actual inbox receipt remains the next check.
- [ ] Verify hosted CAPTCHA/errors/cancel flow and actual delivery to the intended inbox/dashboard after owner setup. Keep handoff wording distinct from delivery success.
- [ ] Test physical-phone form layout/touch.
- [ ] Monitor private inbox/spam/quota after release. Any moderation of direct repository issues is separate; this form does not enable repository restrictions.

## 8. Mushroom nectar reference and comparison

- [x] Add a separate, lazy-loaded `#mushrooms` section with isolated data, calculations and presentation; no new dependencies or runtime wiki downloads.
- [x] Keep the main reference intact with all 34 Small–Large combinations, every 1–4-star range and Special Nectar in a plain table like the text notes. Replace the initial range bars and star selector.
- [x] Keep one selection catalog in the reward table, with search above it. Remove the duplicate sidebar search/checkbox list; retain selected-mushroom controls and nectar/ranking settings. Search supports unordered terms and comma alternatives without clearing selections; table rows also toggle on click.
- [x] Implement the approved Unified comparison: editable type/size groups, quantity-based combined nectar and Special Nectar totals, group or individual stars, optional names and removal. New-selection stars do not overwrite existing selections.
- [x] Filter comparisons by desired nectar colors, rank by highest minimum or maximum, retain ties, show per-color winners, and count Special Nectar separately.
- [x] Replace the three floating panels with one workspace: reference left and editable comparison right from 900px; comparison/controls first and reference below on mobile. Keep normal page scrolling and drafts across navigation; clearly label the refresh/close reset.
- [x] Review reward/fruit source revisions, include fruit size/color alternatives and document differences from the older chart. Preserve the Normal Ice Blue recipe exception; add 11 focused tests (141 total passing) and pass the `/PikApp/` build.
- [x] Verify checkbox selection/search, shared state, duplicate unchecking, limits and reference immutability with four additional tests (145 total); check desktop and compact mobile tables in the browser.
- [x] Tighten the name/star spacing and desktop row padding; remove the reference table's internal scrollbar so its full contents use page scrolling.
- [x] Add Pikipedia artwork for all 13 mushroom types to reference/search/results, with local lazy PNGs (about 193 KiB total), provenance/checksums and two asset tests (147 total passing). Verify image selection and 900px/390px layouts without clipped columns or page overflow.
- [x] Add compact −/quantity/＋ controls; quantities change reward totals/ranking while individual names/stars stay expandable. Preserve the 20-copy limit, keyboard use and 44px touch targets. Verify mixed stars, minimum/maximum winners, filters, search retention and large totals at 320px; eight new tests bring the suite to 159.
- [ ] Compare the calculated outer bounds with real in-game fruit rewards, especially small red and giant white alternatives; update sources/data when observations change.
- [ ] Add Giant/event mushrooms only after reviewing their own recipes, color rules and current event behavior.
- [ ] Consider saving comparison drafts if requested; they currently do not alter autosaves or the portable progress schema.

## October 22 audit follow-ups

- [x] Protect unreadable initial calculator/checklist saves from fallback autosave and retry; block full snapshots of unreadable progress. Explicit edits can replace the affected field, including unchanged-value saves.
- [x] Roll back partial local calculator restores and block file writes after failed startup restoration; avoid advancing the initial fallback's freshness marker.
- [x] Keep step-entry mode in the stats draft until Save, convert values without changing remaining steps, reject overflow, and allow flower-only projections with zero daily steps.
- [x] Add the verified flower tasks for reaching levels 7, 13 and 18; preserve existing IDs and user saves.
- [x] Align OSM and saved-pin name limits, invalidate obsolete pin-file reads/previews, show the filename and tolerate blocked map history updates.
- [x] Publish four cohesive repair commits; record the 112-test/build/audit results and browser verification limits in the [project guide](docs/PROJECT_GUIDE.md#october-22-rapid-audit-and-repair).
- [ ] Verify below-level-100 flower-task reset behavior against an actual in-game transition. `projectLevels()` currently subtracts consecutive flower requirements; update only after confirming whether that is correct. Other game tasks are not forecast inputs.
- [ ] Add browser regressions for stats mode Cancel/Save, unchanged-value recovery, failed startup restoration, overlapping pin-file reads and blocked history. Current controlled-storage tests cover failure logic; the audit's browser checks covered ordinary flows.
- [ ] Consider a raw calculator/checklist recovery download before allowing replacement of unreadable data, following the existing map recovery pattern. Currently full snapshots are blocked and explicit edits replace the affected field; they cannot recover its original contents.
- [ ] Measure checklist scrolling/image memory and dense-map interactions on a physical phone before adding virtualization, clustering or image conversion.
- [ ] Consider dependency update alerts and a lightweight lint check. Keep the gRPC override until upstream compatibility and advisories are reviewed; avoid forced Firebase downgrades.

## Suggested implementation order

1. Confirm flower-task reset semantics in-game and correct the forecast if needed; avoid guessing about progress calculations.
2. Verify hosted CAPTCHA and actual delivery for the now-configured owner Formspree inbox. Keep Google hidden; repository issues stay outside the app's feedback UI.
3. Add the targeted browser regressions above and improve unreadable-save recovery before expanding persistence behavior.
4. Measure physical-phone checklist/map performance, touch and accessibility; optimize the measured bottlenecks.
5. Refine map discovery/regions or add address search when wanted, preserving existing feature/storage boundaries.
6. Keep dependency checks, notes and deployment verification current. Continue manual full-progress transfer without Firebase setup.
7. Resume Google sign-in and cloud sync only when the user brings accounts back into scope; first define authorization, guest import, conflict resolution, deletion and recovery.

## Decisions to make when implementation starts

- Whether to add address search and which provider/region rules to use; OSM tiles, selectable Overpass endpoints, local pins and map-view sharing already exist.
- Which account/database configuration to activate if deferred Google/Firebase work resumes; public Pages hosting is already active.
- How to resolve artwork redistribution permission; the current images and display style are already chosen.
- Whether progress logging needs collection dates/history or only the current checklist.
- How guest and account progress should merge, and how concurrent edits should resolve.

Work on these tasks can proceed incrementally; the app does not need a complete rewrite.
