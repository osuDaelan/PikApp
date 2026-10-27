# Decor image rollout and performance checks

## Rainy Day Leaf Hats and Chess Pieces — October 27, 2026

Current coverage is **1,053 entries: 524 regular/rare and 529 special/event**. The regular gallery has three separate Blue Leaf Hat rows, referencing `Decor_Blue_Leaf_Hat_1.png`, `_2.png` and `_3.png`. Weather → Rainy Day now uses three numbered design tiles, each with independent collection state and artwork. The existing design-1 PNG is reused and two original PNGs were added (37,035 bytes combined).

The [special gallery's Chess table](https://www.pikminwiki.com/Special_Decor_Pikmin#Chess_Piece) labels the `_1.png` row White and `_2.png` row Black, each with seven species and no Ice. Chess now has distinct `Chess Piece: White` and `Chess Piece: Black` rows, each with independent species checkboxes and set completion. Seven original white PNGs were reused and seven black PNGs added. All active PNGs total 33,204,751 bytes. Lazy loading and memoization are unchanged; no dependencies or persistent animation loops were added.

The old `weather__rainy_day_leaf_hat__Blue` mark and seven `chess_piece__chess_piece__<species>` marks did not identify a design/side. `legacyDecor.js` retains them alongside the 25 retired card marks; `LegacyDecorReview` shows reminders in their respective Regular and Special & Event panels. Version-1 export/import preserves all 33 old marks and exact design choices. No ownership is guessed. Old artwork provenance remains under `legacyGroupedImages` and `legacyCardImages`; active `images` contains 1,053 records. Three representative entries remain for Theme Park tickets.

Verification: **174 Node tests and the production `/PikApp/` build pass**. Tests cover three independent Leaf Hat choices, Blue-only availability, separate seven-species Chess rows, design/side/species/collected/missing search, independent set completion, review separation, old/new save round-trips and PNG source/checksum coverage. Earlier milestones below retain their original counts.

## Individual card designs — October 27, 2026

Current coverage is **1,044 entries: 522 regular/rare and 522 special/event**. Hanafuda Volume 1 now has 24 designs and Volume 2 has 16; Playing Card and Mahjong Tile have 27 each. These counts and species/design combinations were checked against the actual image tables on [Special Decor Pikmin](https://www.pikminwiki.com/Special_Decor_Pikmin), not inferred from filenames alone. `cardCatalog.js` gives each species its own numbered-design row; every design has a distinct checkbox and PNG. Twenty-five matching existing PNGs were reused and 69 downloaded from the original Pikipedia asset URLs. No dependencies or animation loops were added. Existing lazy loading, asynchronous decoding and memoized image buttons remain.

The 25 older color-level card IDs are retained by `legacyDecor.js` (originally `legacyCards.js`) and accepted by version-1 full-progress transfer, but excluded from the active catalogue and detailed totals. No old checkmark is assigned to a numbered design automatically. A review reminder lists the user's old grouped marks until they explicitly acknowledge review after selecting their exact cards. This sets only the old marks to false; it does not change exact-design selections. Import previews show the older-selection review count separately. Source records for the old mappings remain under `legacyCardImages` in the provenance inventory; active `images` has exactly 1,044 records. All 896 original IDs remain recognized, including the retired 25; unaffected original IDs remain active and unchanged.

Eleven representative entries remain for Theme Park tickets, Rainy Day Leaf Hats and Chess Pieces. Those expansions and regional filtering are separate work, not included in this card fix. The historical rollout and October 22 numbers below describe earlier milestones.

Verification: **167 Node tests and the production `/PikApp/` build pass**. Tests cover exact catalogue counts/species, all 1,044 PNG signatures/dimensions/checksums/source records, retained original IDs, per-design/species/volume/ownership search and old/new full-progress backup round-trips. An isolated browser imported a synthetic old save with three grouped marks; no exact designs were selected and the review reminder persisted across reload. One exact Playing Card choice persisted independently; acknowledging review removed the reminder while retaining that card. Search returned 40 Hanafuda, 27 Mahjong and 27 Playing Card entries; all 27 Playing Card images loaded. Filtered bulk selection changed only four visible Red Playing Cards. A 390×844 Hanafuda check wrapped all eight Red designs without horizontal overflow. No browser warnings/errors or changes to actual user progress occurred. These viewport checks do not replace physical-phone performance tests.

October 18, 2026. This work expands the approved Chef Hat image tile to **all 896 existing checklist entries**: 469 regular/rare and 427 special/event entries. Collection IDs, counts, ordering, rare unlock rules, and saved-progress formats are unchanged. This is image coverage of the existing catalog, not an expansion to every newer in-game variant.

## Artwork and mappings

- 896 local transparent PNGs in `public/images/decor/`; 28,340,828 bytes in total (about 27 MiB). No AI artwork, external image requests at runtime, sprite player, or 3D renderer.
- `src/features/decor/decorImageData.js` supplies each existing ID's filename, original dimensions, accessible description, and representative-design flag.
- `docs/decor-image-sources.json` records all 896 IDs with the Pikipedia source page, original asset URL, gallery, dimensions, local byte size, and SHA-256 checksum. Artwork was matched to the actual regular and special gallery file references; aliases were checked against gallery labels.
- 36 existing entries group multiple in-game designs: Theme Park Ticket, Rainy Day Leaf Hat, Chess Piece, both Hanafuda volumes, Mahjong Tile, and Playing Card. These show one verified representative design, flagged in the manifest, alt text, and tooltip. Adding separate collectable designs would require an explicit catalog/save migration rather than silently changing the existing IDs.
- Puzzle mappings follow their actual gallery sections: 2021 Fall → file series 1, 2022 Summer → 2, 2023 Summer → 4, and 2024 Fall → 3.
- Existing numbered Battery/Fairy Lights entries now use individual image tiles. Captions retain their design numbers. Color entries retain their labels. Rows render only available species in the usual color order, packed from the first slot; unavailable colors no longer add dash placeholders. This also applies to single-species rows such as Ice Cream: Extra Flavor. Collection IDs, counts, and saves are unchanged.
- Pikmin artwork belongs to Nintendo; source attribution is recorded in `public/images/ATTRIBUTION.md` and is not a redistribution license.

## Rendering and measured improvements

The rollout was first connected using the existing tile, then tested before adding targeted optimizations.

1. Images retain native `loading="lazy"`, asynchronous decoding, actual intrinsic dimensions, and the fixed 76×120px tile footprint. Browser checks shortly after opening the desktop gallery found about 60–66 images ready, rather than all 800+ visible-entry images. This is a loaded-image observation, not a cold-network byte benchmark; browser caching and proximity thresholds affect it.
2. The first full-gallery version created eight hidden confetti pieces and their wrapper for every image tile. Confetti now mounts only for the active collection animation and is removed afterward. With all 896 entries shown, this avoids **8,064 idle DOM elements**. Checks confirmed zero idle confetti pieces.
3. `DecorImageTile` is memoized. `useDecorCollection` supplies a stable toggle callback, with the ID passed separately, so unchanged image tiles skip a parent's collection rerender. No custom comparator discards callbacks or state changes.
4. The approved 400ms pop / 380ms confetti burst remains interaction-only, with reduced-motion support and no persistent animation loops.

All art is still the original PNG size. WebP conversion, reduced-resolution derivatives, content-visibility, and virtualization have deliberately not been added. The total PNG decoded pixel footprint would be about 191 MiB if every image were simultaneously decoded to RGBA; actual browser retention varies. Consider responsive thumbnails or virtualization if real-device scrolling or memory measurements justify them.

## Verification

- Automated: all 896 IDs resolve to distinct existing PNGs with matching signature, dimensions, source record, and checksum. Rare, numbered, representative-event, base-path URL handling, and the original saved ID digest are covered. All 17 tests pass; the production build passes.
- Browser: Show all renders exactly 896 image tiles, including rare artwork; no image fallback was present in that check. Regular, rare, numbered Battery, and representative Playing Card artwork were inspected.
- Numbered-image Enter toggling survives reload. Fairy Lights bulk selection updates both numbered tiles. Test selections and bulk/Show all modes were restored.
- A blocked Café image produced its R fallback and remained keyboard-toggleable. Blocking and cache overrides were removed; normal image loading and the original collection state were restored.
- A 375px phone viewport wrapped the gallery with 375px document width, no horizontal overflow, and zero broken images among the 435 loaded during navigation. This is browser viewport emulation, not a physical-phone performance test.
- Local scrolling and selection were spot-checked; DevTools-assisted timings include automation overhead and are not a reliable FPS or low-end-phone benchmark. Real-device testing is the next useful performance check.

## Next checks if needed

- Test long scrolling on a physical phone and record frame drops, decoded-image memory, and cold-cache transfer sizes.
- If network/decode costs are high, generate small transparent derivatives at approximately 2× display size while retaining originals/provenance.
- If rendering remains slow after image sizing, measure category-level content visibility or virtualization before adopting it.
- Expand grouped designs only as a separate catalog task with explicit migration rules.

## Catalog refresh: October 22, 2026

Rechecked the current [regular](https://www.pikminwiki.com/Decor_Pikmin) and [special/event](https://www.pikminwiki.com/Special_Decor_Pikmin) galleries, species columns and release descriptions. Added **79 entries** with verified original PNGs: **53 regular/rare** and **26 event**, bringing the checklist to **975** (522 regular/rare, 453 event).

| Category | Additions | Entries |
| --- | --- | ---: |
| Pharmacy | Ice Toothbrush and Ice Toothbrush (Rare) | 2 |
| Forest | Stag Beetle (Rare) and Acorn (Rare), all eight species | 16 |
| Airport | Luggage Tag, all eight species | 8 |
| Station | Ticket (Rare), all eight species, plus Ice Ticket | 9 |
| Bakery | Pastry, all eight species, plus Ice Baguette | 9 |
| Stadium | Ball Keychain (Rare), all eight species, plus Ice Ball Keychain | 9 |
| Halloween: Stained Glass | All eight species | 8 |
| Balinese Carving | All eight species | 8 |
| Wurst | All eight species | 8 |
| Shaved Ice / Mooncake | Ice variant of each | 2 |

Café Coffee Cup (Rare) and Bakery Baguette (Rare) still exclude Ice, matching the current galleries. Existing grouped/representative designs remain unchanged; this refresh does not split Chess Pieces, Hanafuda, Mahjong, Playing Cards, Theme Park Tickets or Leaf Hats into separate saved entries. The 36 representative entries are still marked. The checklist should not be described as every individual in-game design.

All 896 original IDs and their relative order are preserved; the frozen fixture in `tests/fixtures/decor-legacy-ids.json` is checked against the original digest. New entries start uncollected. No progress-key or backup-version migration is required; tests cover old partial saves and new IDs through export/import and applied storage. Added base species may affect when an existing rare row unlocks under the unchanged base-completion rule; saved rare selections are retained and Show all still reveals them. Map category counts reuse the expanded catalog; no new map query categories were needed.

The 79 new PNGs add **2,668,334 bytes**. All 975 originals total **31,009,162 bytes**, with a theoretical all-images-decoded RGBA footprint around **208 MiB**; actual retention is browser-dependent. Lazy loading, async decoding, memoized tiles and transient effects remain in place. No new library, model renderer, image conversion or persistent animation was introduced. New source records include retrieval date, original URLs, dimensions, bytes and SHA-256; old records/assets were preserved.

Verification: all **114 tests** and the production `/PikApp/` build pass. Every current ID resolves to a distinct PNG with matching dimensions/checksum/source; original IDs remain compatible. An isolated browser rendered 975 tiles with Show all, reported no fallbacks or horizontal page overflow, loaded the new Forest/Luggage Tag/Halloween/Balinese/Wurst rows, and retained an original Red Chef Hat plus new Ice Luggage Tag, Ice rare Acorn and Red Stained Glass selections after reload. Console was clean; real user saves were untouched. Initial navigation had 254 images loaded out of 975 after targeted selections; this is a lazy-loading observation, not a cold-network or physical-phone benchmark. Real-phone profiling and separate tracking for older grouped designs remain follow-ups.
