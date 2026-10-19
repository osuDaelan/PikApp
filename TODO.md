# PikApp TODOs

Goal: expand PikApp as an all-in-one Pikmin Bloom companion, starting with decor images and reliable progress saving across visits and devices.

This is a planning document. Tasks below are proposed work, not completed features. Google sign-in is the intended sign-in experience; the hosting, authentication, and database providers have not been selected.

## 1. Organize the existing app for new sections

- [x] Move decor catalogue data out of `src/App.jsx` into a dedicated data module.
- [x] Separate the decor tracker components from the calculator components.
- [x] Put shared navigation, controls, and visual styles in shared modules.
- [x] Introduce a storage layer that can support both guest data and signed-in accounts.
- [x] Keep the current calculator and existing saved collections working during the changes.
- [x] Preserve existing collection IDs when moving data. Add a migration if any IDs must change.

Completed: feature modules, shared controls/styles, and a storage interface with legacy guest keys and isolated local account caches. No ID migration was needed. Account authentication and cloud synchronization remain in steps 3–4. See `README.md` for the folder map and storage contract.

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
- [x] Make collected, uncollected, unavailable, and locked items visually distinguishable.
- [x] Keep a useful fallback when an image is missing or fails to load.
- [x] Lazy-load images and reserve their dimensions to avoid layout shifts.
- [x] Give each toggle an accessible name and pressed state; support keyboard operation.
- [x] Verify regular decor, rare decor, event decor, and numbered design variants.
- [x] Verify narrow phone layouts, desktop split view, and bulk selection.
- [x] Add a set-completion confetti blast and rare-only tile stars inspired by the in-game reference video, with reduced-motion support and no persistent particle loop.
- [ ] Add search and filters for category, color, collected, and missing items as the catalogue grows.

## 3. Add accounts with Google sign-in

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

## 4. Save and synchronize progress

### Data model and guest migration

- [ ] Define a versioned saved-progress schema with stable decor IDs and update timestamps.
- [ ] Continue saving guest progress locally.
- [ ] On first sign-in, offer to import the collection already saved in that browser.
- [ ] Define what happens if both guest progress and account progress exist; preview the merge and avoid silently replacing either collection.
- [ ] Keep a local recovery copy until the import has succeeded.
- [ ] Keep guest data separate from signed-in account data, including when switching accounts or signing out.
- [ ] Decide whether to record when an item was collected, in addition to its collected/uncollected state.

### Cloud persistence

- [ ] Load saved account progress after sign-in.
- [ ] Automatically save collection changes and profile updates.
- [ ] Show clear saving, saved, offline, and retry states.
- [ ] Handle failed requests without losing the user's recent changes.
- [ ] Define conflict handling for edits made in multiple tabs or on multiple devices, including uncollecting an item.
- [ ] Batch rapid changes and bulk selections to avoid unnecessary writes.
- [ ] Add export/import so users can back up and move their progress.
- [ ] Provide account-data deletion and a clear confirmation before clearing a collection.

## 5. Verification before release

- [ ] Confirm existing localStorage progress survives the update.
- [ ] Test guest use, first sign-in, guest import, returning sign-in, sign-out, and account switching.
- [ ] Verify progress saved on one device is restored on another.
- [ ] Verify one account cannot access another account's data, including through direct requests.
- [ ] Test offline edits, failed saves, reconnects, and conflicting updates.
- [ ] Confirm catalogue updates preserve previously collected items.
- [ ] Check image loading, touch targets, keyboard navigation, and mobile performance.
- [ ] Run the production build and focused tests for persistence, migration, and merging.
- [ ] Document local setup, required environment variables, provider configuration, and deployment steps.

## Suggested implementation order

1. Extract the decor data/components and preserve current saves.
2. Add images for one category and review the result.
3. Roll images out to the remaining catalogue.
4. Choose providers and implement Google sign-in with per-user data access.
5. Implement guest import, automatic saving, and cross-device sync.
6. Verify recovery, account isolation, accessibility, and deployment.

## Decisions to make when implementation starts

- Where the app will be hosted and which auth/database service it will use.
- Which image source and display style to use.
- Whether progress logging needs collection dates/history or only the current checklist.
- How guest and account progress should merge, and how concurrent edits should resolve.

Work on these tasks can proceed incrementally; the app does not need a complete rewrite.
