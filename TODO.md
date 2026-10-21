# PikApp TODOs

Goal: expand PikApp as an all-in-one Pikmin Bloom companion. The next major section is a decor map for location discovery and personal pins, followed by reliable account progress saving across devices.

Last reviewed October 21, 2026. Checked tasks are completed milestones; unchecked tasks are remaining work. See [the project guide](docs/PROJECT_GUIDE.md) for current architecture and [the map plan](docs/DECOR_MAP_PLAN.md) for proposed map boundaries. Google sign-in remains intended; authentication/database providers have not been selected. The map will use the user's chosen OSM/Overpass discovery approach; exact services remain open. A GitHub Pages workflow is prepared, but activation is unconfirmed after a private-repository plan/visibility restriction.

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

## 3. Add the decor map (next major feature)

Confirmed direction: both location discovery and personal pins, following Pixelpirate's OSM tag-based map approach. The detailed first slice and service endpoints remain undecided. See [Decor map plan](docs/DECOR_MAP_PLAN.md) and [source investigation](docs/DECOR_MAP_REFERENCE.md); no map implementation has started.

- [x] Record the existing shell/data/storage boundaries and the desktop navigation limitation.
- [x] Confirm the map's overall purpose: discovery plus personal pins.
- [x] Trace the chosen OSM reference's frontend, rule table, query/classification/geometry pipeline and optional server mirror; record integration gaps and live-test limits.
- [ ] Define the first test area, priority categories and the smallest useful version of discovery/pins.
- [ ] Confirm the recommended Leaflet dependency and select tile, Overpass and search services/configuration after checking coverage, accuracy, deployment fit, attribution and cost. Do not copy prohibited public Nominatim autocomplete or assume access to the reference's restricted mirror.
- [ ] Decide desktop map layout and how to retain the Now + Decor split view.
- [ ] Make all three sections reachable at every screen width; decide whether section/map URLs are required.
- [ ] Implement the map feature separately from the shell and checklist, with adapters for source places and decor categories.
- [ ] Validate normalized tag matching, unique category matches, country rules and original OSM object IDs; preserve proper polygon/relation geometry and holes.
- [ ] Display one representative category/area with loading, empty, error and retry states before expanding.
- [ ] Add selected-place details and category filters; reuse existing catalogue/artwork and one collection state owner.
- [ ] Implement explicit location permission controls and a denied/unavailable fallback if Locate me is included.
- [ ] Define personal pin IDs, fields, separate durable storage, recovery/export and privacy defaults; implement basic add/edit/delete.
- [ ] Bound requests and markers; cancel obsolete fetches and clean up listeners/map instances.
- [ ] Verify phone/desktop usability, pan/zoom responsiveness, dense results, production asset paths and unchanged existing saves.
- [ ] Document source limitations; candidate locations must not be presented as guaranteed in-game decor results.

## 4. Add accounts with Google sign-in

Google sign-in establishes who the user is. A separate database/storage layer saves their progress.

- [ ] Select an authentication and database provider after comparing deployment fit, cost, maintenance, and Google sign-in support.
- [ ] Define which data belongs to an account: decor collection, player stats, daily averages, and lasting preferences.
- [ ] Set up separate development and production configuration.
- [ ] Configure Google sign-in and approved local/production callback URLs.
- [ ] Add sign-in, sign-out, and account status controls in the shared app shell.
- [ ] Handle cancelled sign-in, expired sessions, loading, and sign-in failures.
- [ ] Restore the session when the user returns.
- [ ] Keep guest use available without requiring an account.
- [ ] Keep privileged server credentials out of the frontend and Git.
- [ ] Enforce per-user access in the database/backend so users can only read and change their own progress.
- [ ] Explain what account data is saved and how users can delete it.

## 5. Save and synchronize progress

### Data model and guest migration

- [ ] Define a versioned saved-progress schema with stable decor IDs and update timestamps.
- [x] Continue saving guest calculator/collection progress in browser storage with legacy keys.
- [x] Add a private development-only calculator file backup and startup restore; exclude personal data and the endpoint from production.
- [ ] Add portable export/import and decide whether to expand file backup beyond calculator data.
- [ ] On first sign-in, offer to import the collection already saved in that browser.
- [ ] Define what happens if both guest progress and account progress exist; preview the merge and avoid silently replacing either collection.
- [ ] Keep a local recovery copy until the import has succeeded.
- [x] Provide isolated guest/account local cache namespaces without automatically importing guest data.
- [ ] Integrate and test those namespaces with real authentication, including account switching and sign-out.
- [ ] Decide whether to record when an item was collected, in addition to its collected/uncollected state.

### Cloud persistence

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
- [ ] Verify progress saved on one device is restored on another.
- [ ] Verify one account cannot access another account's data, including through direct requests.
- [ ] Test offline edits, failed saves, reconnects, and conflicting updates.
- [x] Add a regression check for the original catalogue IDs and totals.
- [ ] Continue checking ID compatibility for each future catalogue expansion or migration.
- [ ] Check image loading, touch targets, keyboard navigation, and mobile performance.
- [x] Establish the current test/build baseline: 30 Node tests passed and production build succeeded after local backup implementation.
- [ ] Add focused map checks and later migration/merge tests when those behaviors exist; run relevant tests/builds for each feature change.
- [x] Document current local setup and prepared GitHub Pages workflow.
- [ ] Confirm hosting activation and a successful deployment; document selected map/auth providers and required configuration when added.

## Suggested implementation order

1. Keep the existing feature structure, project guide and accepted visual notes current (baseline complete).
2. Define the map's first slice and data source, then make the third section reachable on every layout.
3. Implement and test a small map slice, then expand discovery, personal pins and collection-aware filters incrementally.
4. Confirm deployment and measure real-device performance; optimize measured bottlenecks.
5. Choose auth/database providers and implement Google sign-in with per-user access.
6. Implement explicit guest import, account autosave, cross-device conflicts and recovery.
7. Verify account isolation, accessibility, location-data behavior and release configuration.

## Decisions to make when implementation starts

- Which tile/Overpass/search services to use within the chosen OSM approach, which areas/categories to start with, and how personal pins will persist.
- How desktop navigation and optional shareable map URLs should work.
- How to activate hosting and which auth/database service to use.
- How to resolve artwork redistribution permission; the current images and display style are already chosen.
- Whether progress logging needs collection dates/history or only the current checklist.
- How guest and account progress should merge, and how concurrent edits should resolve.

Work on these tasks can proceed incrementally; the app does not need a complete rewrite.
