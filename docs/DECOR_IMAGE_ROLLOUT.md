# Decor image rollout and performance checks

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
