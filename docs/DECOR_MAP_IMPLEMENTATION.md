# Decor map implementation

Initial working slice: October 21, 2026. This describes PikApp's implementation; [DECOR_MAP_REFERENCE.md](DECOR_MAP_REFERENCE.md) remains the historical investigation of Pixelpirate's site. Our React feature and UI were written for PikApp.

## Using the map

- Open **Map** in the navigation. On desktop (1100px and wider), the map fills the available window with 14px side/bottom gutters; navigation moves into the top-right header so it does not reserve a bottom strip or cover map controls. The sidebar stays 300px wide while the canvas takes the extra space. Smaller screens retain bottom navigation and the responsive map layout. Desktop **Overview** retains Now + Decor side by side; **Decor** opens the checklist on its own. All three remain reachable at every width.
- The first visit opens a public example area in Boston. Later visits restore the saved map view. Use **Map options & location** to enter `latitude, longitude` or paste a map link with `lat`, `lng`, `zoom` parameters. This first version does not offer address/city-name geocoding.
- Choose any combination of 39 location categories, optionally **Missing only**, then press **Search this area**. Moving the map or changing filters cancels the previous request, clears old results and waits for another deliberate search. No automatic search on startup, every pan, or every keystroke.
- Select a marker or result-list place for its candidate categories and current checklist counts. **Save this place** creates a personal pin; saving a place does not collect Pikmin.
- **Add pin** / **Place a new pin** enters placement mode; tap the map, then set a name, notes, optional categories and coordinates. **My pins** supports editing and confirmed deletion.
- **Export pins** downloads a versioned JSON backup. **Import pins** validates the whole file, previews the merge, then imports only on confirmation. Matching pin IDs keep the newer edit; different IDs remain separate pins.
- **Locate me** requests a one-time browser position only after a click. Denial/unavailability has a manual-location fallback; no continuing position watch is created.
- **Copy map link** shares the viewport, not pins/notes. Hash sections and view query parameters work under the GitHub Pages project path without a routing library. View changes replace history; switching sections adds a history entry.

## Code boundaries

Paths are under `src/features/decor-map/` unless stated otherwise.

| Module | Responsibility |
| --- | --- |
| `DecorMapSection.jsx` | Page wiring, panel selection, location controls, pin operations, export/import UI |
| `MapCanvas.jsx` | Leaflet instance/layers, markers, GeoJSON shapes, resize behavior, cleanup |
| `MapSidebar.jsx`, `PinEditor.jsx`, `decor-map.css` | Filters/results/place details/pins and responsive presentation |
| `categories.js` | Independent map category IDs and OSM tag hypotheses; explicit link to existing checklist groups/icons |
| `coordinates.js` | Coordinate/link validation, supported view ranges and area limits, shareable view URLs |
| `osm.js` | Safe query generation from known rules, normalization, unique matches, source identities, representative positions |
| `providers.js` | Independent tile settings and public Overpass endpoints; France is the default, Germany and Private Coffee are manual alternatives |
| `placeClient.js` | HTTP requests, deadlines/cancellation, per-client throttling, bounded in-memory result cache |
| `usePlaceSearch.js` | Request generations and UI states; obsolete results cannot replace a newer search |
| `mapStorage.js`, `useMapProgress.js` | Versioned map preferences/pins, validation, recovery protection, merge and browser persistence |
| `src/shared/sections.js`, `hooks/useSectionNavigation.js` | Section definitions and hash/back/forward navigation |
| `src/App.jsx` | Shared collection owner, desktop layout and lazy map mount; no map queries/geometry logic |

Dependencies: Leaflet **1.9.4** and `osmtogeojson` **3.0.0-beta.5** (MIT). The converter handles OSM ways and multipolygons, including holes, instead of flattening relation members ourselves. Its CLI's unused XML dependency is overridden to `@xmldom/xmldom` **0.9.12** because the upstream pinned version had advisories; the app imports the JSON converter API, not the CLI/XML parser. Production dependency audit passed with zero reported vulnerabilities at implementation time. Existing development-tool advisories are a separate maintenance task; no forced toolchain upgrade was made.

## Discovery contract and limits

Rules are OR alternatives of AND predicates, with semicolon tokens normalized and category IDs deduplicated. They refer to existing checklist groups but never rename collection IDs. The Burger hypothesis requires a burger cuisine tag rather than treating every fast-food business as a burger location. Country-dependent Fortune, Roadside outcomes, weather and event variants are excluded from this first location rule set. Adding a region-dependent rule requires real regional validation, not an approximate country rectangle.

Queries use the current bounding box, a 20-second Overpass server timeout and at most 501 top-level OSM objects. Search requires zoom 13 or closer and a viewport no larger than 200 km². The HTTP client has a 25-second deadline and a five-second minimum between uncached searches. No selected categories means the search button is disabled.

OSM JSON becomes GeoJSON through the converter. Results retain `node/id`, `way/id`, `relation/id`, including their correct source URL, and unique category matches. Incomplete geometries are skipped with a status note. A response remark is treated as an incomplete search/error rather than quietly displaying partial data as complete. Results are capped at 400 displayed places, with a warning to zoom in when truncated. A line/area marker is an approximate label/pin position, not a seedling spawn point; polygon holes remain in the rendered geometry.

Leaflet uses canvas for vector paths and lightweight category emoji markers; the checklist's animated image tiles are not mounted per marker. Five-minute cached results retain at most 12 area/query/source combinations in memory. Source configuration is part of the cache key. Clearing/replacing layers, aborting requests, disposing resize observers and `map.remove()` happen when the feature unmounts. React lazy loading puts the map library, converter and CSS in a separate production chunk.

Background tiles use the standard OSM HTTPS endpoint with visible contributor attribution and normal browser HTTP caching. There is no tile prefetch, offline map download, personal API key or hosted mirror in this implementation. Public service capacity/terms still matter; provider settings are centralized for later changes. Review [OSMF's tile policy](https://operations.osmfoundation.org/policies/tiles/) and the chosen data operator before scaling traffic. No public Nominatim autocomplete was added.

## Saved map data

`pb_decorMap_v1` is a separate localStorage entry:

```text
version: 1
viewport: { lat, lng, zoom }
categoryIds: known map category IDs
sourceId: a configured public data source
pins: [{ id, name, notes, lat, lng, categoryIds, osmId|null,
         createdAt, updatedAt }]
```

Pin IDs are local UUIDs; an optional OSM reference is a separate field. Limits: 1000 pins, names up to 120 characters, notes up to 2000 characters, imports under 16 MB. The file limit accommodates a full legal export, including multibyte notes. File imports reject unsupported versions, invalid pins and duplicate IDs as a whole. Browser saves are normalized to this schema; unrelated object fields are not retained.

Malformed/unsupported existing map data is kept untouched and blocks automatic replacement. Its raw recovery download remains available, and an explicit validated import can replace it. Storage-write errors keep in-memory edits usable and prompt export; they do not report a successful durable save. Existing calculator/collection `pb_*` keys and the private calculator development backup are untouched.

Pins are local to the browser origin, with no sign-in or cloud copy. `localhost`, a different port, and a deployed site have separate storage. The calculator's `.local/calculator-progress.json` backup does not contain pins. Export pins for a separate copy. Location/pin records and test files are not committed.

## Verification

- **41 Node tests passed**: the prior 30 plus 11 map tests covering rules, bounded queries, token matching, unique category matches, relation identity and holes, input/URL validation, request cache/throttle/deadline/cancellation, isolated saves, unreadable/future save protection, complete import validation/merging and round-trip import of a maximum-size collection with multibyte notes.
- Production build succeeds; map JS/CSS are separate lazy chunks. Project-base-path build is checked before committing the feature.
- Browser: desktop navigation and Overview, responsive 390px phone layout without horizontal overflow, existing level/step/flower/coin values retained, and checklist counts visible in map details.
- Desktop space update: at 1920×1080 the map card is 1892×968px and the canvas is 1590×844px, with no page overflow. The 1100×650 layout also fits the viewport; 390×844 retains the stacked map/sidebar and bottom navigation without horizontal overflow. Switching to Overview restores its existing layout/navigation. Production build and all 41 tests passed after this change.
- Controlled browser OSM response: point markers, park outline, water multipolygon with a hole, overlapping Restaurant/Italian categories, place details and save-as-pin flow. Interception was removed afterward; these fixtures are not live service evidence or application data.
- Personal pin: name/notes survived full reload; export JSON contained the expected schema and notes; delete then import-preview/merge restored the test pin; tap-to-place opened a new pin editor. Temporary test pins were removed.
- Live public service: the French endpoint returned **86 real places** for a bounded public example query, including points, polygons and multipolygons, using the actual query builder/normalizer. The app's browser search then displayed **188 real candidate places** with area geometry for the desktop example view and four selected categories, and **58 places** in the phone view. A fresh-load check had no new browser errors. Germany returned HTTP 406 in the shell; initial browser requests and Private Coffee checks timed out or were rate-limited. Those failures are not evidence of a global outage. France became the default after successful shell and browser verification.

## Follow-up work

- A deliberate provider choice for address/city-name search; coordinate links and manual navigation cover the initial slice.
- Real-phone GPS/touch testing and measured performance in dense areas; clustering/pin-list pagination if results justify it. Viewport emulation is not a physical-device benchmark.
- Region-aware Fortune rules, further tag accuracy review and clearer per-rule provenance/confidence if needed.
- Cloud pin synchronization, cross-tab conflict handling, map/pin offline behavior, broader recovery tooling and any public sharing/moderation.
- Hosted `/PikApp/` deployment remains unconfirmed; this map does not activate hosting or change repository visibility.
