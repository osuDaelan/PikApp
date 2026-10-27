# PikApp development reference

Setup, deployment and storage details moved from the README on October 25, 2026. See [the project guide](PROJECT_GUIDE.md) for current architecture, feature ownership and verification history. User instructions are in [the README](../README.md).

## Local development

Use Node.js 24.12 or newer with npm and the built-in Node test runner (`node --test`); GitHub Pages builds use Node 24. The Firebase SDK requires this runtime for development/build tooling.

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

## Local calculator autosave

When running `npm.cmd run dev` on localhost, applied calculator changes automatically back up to `.local/calculator-progress.json` after 400ms. The file contains level, steps/flowers input, daily averages, coins, and step-entry mode. The Update Stats form's **Save** button still applies its edits; daily-average changes save directly. A small status below the level badge shows saving, successful file backup, or retrying after failure.

On startup, the app reads this file before mounting the calculator. It restores a newer backup into the existing `pb_*` browser keys; timestamped newer browser edits take priority over an older file. This supports refreshing/restarting the dev server, cleared calculator storage, and fresh local browsers using the same project. Decor progress stays in browser storage and is not included in this calculator-only file.

The `.local/` directory is Git-ignored and denied by Vite's static file server. The development middleware accepts only same-origin loopback requests and validated calculator fields, serializes atomic file replacement, rejects stale writes, and preserves an existing malformed file rather than overwriting it. Browser saves continue if the backup service is unavailable. Failed startup restoration pauses file writes until the service/storage is restored and the page reloads; ordinary write failures after verified startup still retry. Partial startup restores roll back, and unreadable browser saves cannot overwrite the file with fallback values. This file endpoint, startup restore, and status UI are excluded from production builds. Implementation: `dev/localCalculatorBackup.js`, `src/storage/calculatorBackupData.js`, `src/storage/localCalculatorBackup.js`, and `src/shared/components/LocalCalculatorSave.jsx`.

Verified with 30 tests and a production build. Browser checks confirmed an edited average reached disk and survived reload, original calculator fields returned after clearing only those browser keys, decor data remained intact, and the private file URL returned 403. Personal progress files are not committed.

## Commit workflow

Starting October 19, 2026, create a descriptive local Git commit after each major, cohesive change and its appropriate checks. Keep unrelated changes in separate commits. The initial checkpoint captures the already accepted app work; subsequent changes get their own checkpoints. Per the owner's standing instruction, automatically commit major cohesive changes and push to `origin main` without asking again. A successful Pages deployment publishes the pushed commit.

## GitHub Pages hosting

The public website uses [GitHub Pages](https://osuDaelan.github.io/PikApp/). `.github/workflows/deploy.yml` installs locked dependencies, runs tests, builds the app, and publishes only `dist` on pushes to `main` or manual workflow runs. The build uses the repository name as its Vite base path (`/PikApp/`), so scripts, decor images, the icon, and wallpapers load correctly under the project URL. Local development still runs at `http://localhost:5173/`.

On October 21, 2026, the user authorized making the repository public and publishing the app. GitHub Pages is configured to use **GitHub Actions**, with HTTPS enforced. Follow deployments in [Actions → Deploy PikApp to GitHub Pages](https://github.com/osuDaelan/PikApp/actions/workflows/deploy.yml). A successful run publishes that commit; a local commit alone does not publish it. Future pushes to `main` automatically run the same checks and deployment.

The site is available on mobile and other computers without the development PC running. Progress remains in each browser's local storage. Existing localhost saves do not automatically transfer to the published site; full-progress JSON export/import provides manual transfer. Devices do not sync automatically. Google sign-in is hidden and cloud saving is deferred. GitHub Pages hosts the frontend rather than an account database.

To check the hosted path locally:

```powershell
npm.cmd run build -- --base /PikApp/
npm.cmd run preview -- --base /PikApp/
```

Open the preview server's `/PikApp/` URL. GitHub Pages setup follows [Vite's deployment guide](https://vite.dev/guide/static-deploy.html#github-pages) and [GitHub's Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

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
| showShrineDecor | `pb_showShrineDecor` | `true` / `false` string; browser display preference, default `false` |
| totalStepsMode | `pb_totalStepsMode` | `true` / `false` string |

Unaffected collection names, variants and ID generation remain unchanged. The October 27 card, Leaf Hat, Chess and Theme Park expansions retire 36 ambiguous color-level IDs from the active checklist while retaining them in `legacyDecor.js` for browser-save and version-1 backup compatibility. A checked old grouped mark requires explicit user review; it does not select any exact design. The other 860 original IDs remain active. `LegacyDecorReview` shows regular and special/event reminders in their respective panels; import previews show their combined pending-review count. Tests cover this boundary, exact-design toggles, pending-review counts and transfer of old/new marks. `decorStorageLocation(group)` resolves stable ID namespaces separately from display names: Rainy Day and Snowy Day retain `Weather`, and Shrine & Temple retains `Fortune`. Counting, search, image lookup/toggles, set completion and backup validation use this identity; search accepts both old and new category labels. Category, costume and species reordering changes no other IDs. Browser saves remain tied to the origin: changing hostname or port creates a separate browser storage area.

`createProgressStore({ accountId })` provides a separate local cache namespace for a future account. It never automatically imports guest data. This is an organizational boundary, **not authentication or access control**. Future cloud sync must authenticate users, enforce server-side per-user access, handle conflicts/retries, and explicitly import guest progress. Mount fresh state hooks when changing stores/accounts to avoid carrying one session's in-memory state into another. Inject `getStorage` when testing.

Writes return a success flag. `getSaveStatus()` and `subscribeSaveStatus()` expose successful/failed browser writes to the calculator/checklist status UI; failed values remain retryable through `retryFailedWrites()` without clearing other saved fields. `src/storage/progressTransfer.js` owns the separate versioned full-progress format, validation, previous-save recovery and replacement/rollback path; `src/shared/components/ProgressTransfer.jsx` owns its dialog controls. After a successful import, the app remounts its progress owners to read the imported values. The development calculator freshness marker is updated so an older development file cannot replace the imported calculator save. The development calculator file backup has a separate saving/saved/retry indicator, described above, and map saving has its own error/recovery flow. Remote sync remains deferred. Invalid stored collection shapes fall back to an empty collection instead of crashing the app.

## Rare unlock and transfer compatibility

`src/features/decor/collection.js:isRareLocked` requires the matching base costume to be complete. The explicit `ORIGINAL_SEVEN_RARE_BASES` map excludes Ice for Café / Coffee Cup, Restaurant / Chef Hat, Pharmacy / Toothbrush, Station / Ticket, Stadium / Ball Keychain, and Park / Clover and Four-Leaf Clover. The seven-color sets require every original color. `SHARED_RARE_REQUIREMENTS` couples Forest / Stag Beetle + Acorn (eight base colors each, including Ice) and Park / Clover + Four-Leaf Clover (seven base colors each, excluding Ice): neither rare row appears until both required base sets are complete. Unlisted costumes retain their full matching-base requirements. Ice remains in the collection and totals. Unchecking any required color hides the rare row again; existing rare marks remain saved. Search obeys the same unlock rules; only global Show all previews locked rare rows. Search evaluates the complete category before trimming species/status results, and the renderer also checks the full source group to avoid false unlocks or hiding unlocked rare-only results. The Show all toggle remains available while searching.

The per-category Auto / Show / Hide experiment was retired at the owner’s request. Its `pb_rareVisibility` browser key is no longer read by the app or written by imports. Version-1 backups containing optional `decor.rareVisibility` still validate, but normalization discards the retired options while preserving all collected flags. Current exports omit the options. Raw recovery retains the legacy browser key for exact recovery; both old and expanded recovery schemas remain readable. The Shrine display preference remains separate.
