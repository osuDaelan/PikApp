# PikApp TODOs

Goal: expand PikApp as an all-in-one Pikmin Bloom companion. The current focus is reliable browser autosave, returning visits, manual full-progress file transfer and public GitHub feedback, alongside decor-map refinement. Accounts and automatic cloud synchronization are deferred.

Last reviewed October 22, 2026. Checked tasks are completed milestones; unchecked tasks are remaining work. See [the project guide](docs/PROJECT_GUIDE.md) for current architecture and [the map plan](docs/DECOR_MAP_PLAN.md) for proposed map boundaries. At the user's request, Google sign-in is hidden entirely; its code is retained but unmounted, and Firebase configuration/cloud sync are deferred. Browser-local calculator, checklist and map progress remain available without an account. The map uses the chosen OSM/Overpass approach. The repository is public and HTTPS GitHub Pages uses GitHub Actions; pushes to `main` test, build and deploy the app to [PikApp](https://osuDaelan.github.io/PikApp/).

## 1. Organize the existing app for new sections

- [x] Move decor catalogue data out of `src/App.jsx` into a dedicated data module.
- [x] Separate the decor tracker components from the calculator components.
- [x] Put shared navigation, controls, and visual styles in shared modules.
- [x] Introduce a storage layer that can support both guest data and signed-in accounts.
- [x] Keep the current calculator and existing saved collections working during the changes.
- [x] Preserve existing collection IDs when moving data. Add a migration if any IDs must change.

Completed: feature modules, shared controls/styles, and a storage interface with legacy guest keys and isolated local account caches. No ID migration was needed. Account authentication and cloud synchronization remain in steps 4–5. See `docs/PROJECT_GUIDE.md` for the current folder map and `README.md` for the storage contract.

- [x] Audit and document the current project before starting the third section.
- [x] Separate current behavior, historical experiments, remaining tasks and map planning notes.

## 2. Add images to the decor tracker

Images now cover all 896 existing checklist entries, including regular, rare, special/event, and numbered designs. Original Pikipedia PNGs use the approved pop/confetti tile with lazy loading, memoized rendering, and confetti only during interaction. Sources/checksums are recorded per asset; 36 grouped entries use a marked representative design. See `docs/DECOR_IMAGE_ROLLOUT.md` for verification and remaining real-device performance checks. Existing IDs and saved progress are unchanged.

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
- [ ] Add search and filters for category, color, collected, and missing items as the catalogue grows.

## 3. Decor map: initial slice and follow-ups

The first slice is implemented in its own lazy React feature: 39 OSM location categories, map/details, local personal pins and pin export/import. See [current implementation](docs/DECOR_MAP_IMPLEMENTATION.md), [map plan](docs/DECOR_MAP_PLAN.md) and [reference investigation](docs/DECOR_MAP_REFERENCE.md). Public example testing starts in Boston; no personal location is committed.

- [x] Record the existing shell/data/storage boundaries and the desktop navigation limitation.
- [x] Confirm the map's overall purpose: discovery plus personal pins.
- [x] Trace the chosen OSM reference's frontend, rule table, query/classification/geometry pipeline and optional server mirror; record integration gaps and live-test limits.
- [x] Define the first public test area, location categories, discovery flow and basic personal pins.
- [x] Install Leaflet/converter and configure independent tile/Overpass providers with attribution. Use the working French source by default; keep manual alternatives.
- [ ] Select a provider/design for address/city-name search. Current controls accept coordinates/map links; no public Nominatim autocomplete or restricted author mirror is used.
- [x] Keep Now + Decor in desktop Overview, with dedicated Decor and Map views.
- [x] Make all three sections reachable at every width, with section hashes/back/forward and shareable map-view URLs.
- [x] Implement the map separately from the shell/checklist, with source and category adapters.
- [x] Test normalized tag matching, unique categories, source IDs and polygon/relation holes.
- [ ] Implement actual regional validation before adding country-dependent Fortune rules; weather/event outcomes remain outside OSM discovery.
- [x] Add loading, empty, error, timeout, cancellation and retry states, with explicit Search this area requests.
- [x] Retain the last scan while panning/zooming or replacing a search; include a bounded surrounding buffer and show its scanned-area outline.
- [x] Implement approved green park/blue water fills and a stronger selected-area outline; reserve room for area results within bounded searches. See [approved visual direction](docs/DECOR_MAP_PLAN.md#approved-visual-direction--october-21-2026).
- [x] Replace disliked pale, green-bordered emoji discovery pins with a first design of compact SVG category circles; keep the design isolated for revision.
- [ ] Review the new circular map markers with the user; their final preferred style remains open.
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

- [ ] Recheck Firebase's unused Firestore/Node gRPC dependency advisories before adding database functionality; see the sign-in setup notes.

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
- [x] Establish the current test/build baseline: 30 Node tests passed and production build succeeded after local backup implementation.
- [ ] Add focused map checks and later migration/merge tests when those behaviors exist; run relevant tests/builds for each feature change.
- [x] Document current local setup and prepared GitHub Pages workflow.
- [ ] Confirm hosting activation and a successful deployment; document selected map/auth providers and required configuration when added.

## 7. Public feedback through GitHub

- [x] Use GitHub issues for public feedback, requiring the visitor's GitHub account on GitHub; keep Google sign-in deferred.
- [x] Add a responsive header feedback dialog with type, section, title/details, review and explicit **Continue on GitHub**. Open a draft only; the visitor makes the final submission on GitHub.
- [x] Use the fixed `osuDaelan/PikApp` issue target with encoded title/body only; require no token, API server or extra GitHub permissions.
- [x] State that submitted reports are public and omit automatic stats, checklist, pins, location, page URL and device details.
- [x] Add validation, a three-second review delay, honeypot and 7,500-character encoded URL cap; add local 60-second, three-per-hour and duplicate-within-24-hours draft limits with metadata-only storage/memory fallback.
- [x] Document that limits count draft opens, including canceled drafts, and can be bypassed; GitHub sign-in and repository moderation provide the enforcement boundary. See [Feedback](docs/FEEDBACK.md).
- [x] Verify form validation/review, GitHub draft navigation, cooldown after reload, Escape/focus return and 390px/1100px layouts; 97 Node tests and the production build pass. No public test issue was submitted; physical-phone and authenticated final submission checks remain separate.
- [ ] Monitor actual feedback after release. Consider GitHub's temporary repository interaction limits if abuse occurs; no new repository restrictions are enabled as part of this feature.

## Suggested implementation order

1. Keep feature boundaries, the project guide and accepted visual notes current (baseline and initial map complete).
2. Review the first map slice, including real public-service behavior and the local pin workflow.
3. Refine discovery/regions, choose address search if wanted, and add features incrementally.
4. Verify browser autosave/status/retry, returning-visitor restoration and full-progress JSON transfer/recovery; document explicit replacement, private coordinates/notes, storage-clearing and private-browsing limits. No Firebase setup is needed.
5. Measure real-device performance and optimize measured bottlenecks.
6. Resume Google sign-in/Firebase configuration only when the user brings accounts back into scope; then plan database authorization, explicit guest import and cloud conflicts/recovery.
7. Verify accessibility, location-data behavior and release configuration; verify account isolation when account storage exists.

## Decisions to make when implementation starts

- Which tile/Overpass/search services to use within the chosen OSM approach, which areas/categories to start with, and how personal pins will persist.
- How desktop navigation and optional shareable map URLs should work.
- How to activate hosting and which auth/database service to use.
- How to resolve artwork redistribution permission; the current images and display style are already chosen.
- Whether progress logging needs collection dates/history or only the current checklist.
- How guest and account progress should merge, and how concurrent edits should resolve.

Work on these tasks can proceed incrementally; the app does not need a complete rewrite.
