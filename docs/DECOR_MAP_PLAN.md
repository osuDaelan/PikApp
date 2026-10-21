# Decor map plan

Status: planning only, October 21, 2026. No map code, dependency, API credentials or location dataset has been added. The user has selected the OSM tag-based discovery approach described below; endpoint/hosting and search choices remain open. Proposed implementation details are recommendations, not completed features.

## Purpose and first decision

The decor map will be PikApp's third section. On October 21, the user confirmed **both location discovery and personal pins**. Start with a small geographic-map slice, then add durable personal pins incrementally. The first area, categories and detailed pin fields still need definition. Keep accounts and community sharing outside the first slice unless explicitly requested.

## Chosen reference approach: OSM decor discovery

The user identified [Pixelpirate's map](https://www.pikmin-map.pixelpirate.fr/) and [repository](https://github.com/pixlpirate/pikmin-map) as the desired discovery model. See [the source investigation](DECOR_MAP_REFERENCE.md) for pinned files/lines, actual rule/query behavior, optional mirror architecture, verification limits and improvements to make.

- Use OSM tags to identify **candidate decor locations** in the visible map area through Overpass queries. Background map tiles are a separate service.
- Recommend Leaflet as the starting map engine, mounted within our React feature. The reference's Angular components do not need to be adopted.
- Allow multiple decor categories together; support point markers and suitable line/area geometry, with a selected-place panel and overlapping category matches.
- Keep category rules separate from checklist data and explicitly map them to PikApp's existing category IDs. The map predicts categories, not species, rare variants or guaranteed game results.
- Personal saved pins are our additional feature. The reference does not implement durable user pins or collection sync.
- Implement deduplication, preserved OSM object identities and multipolygon holes, bounded requests/cache, safe popup text and full lifecycle cleanup. Avoid the reference's verified matching and cleanup issues.
- Do not copy its 300ms autocomplete against public Nominatim; that service prohibits autocomplete. Select a suitable search service/design deliberately.
- Do not use the author's restricted mirror as our backend by assumption. Public Overpass or a separately hosted/approved service remains to be configured; a PHP/SQLite mirror would require hosting outside GitHub Pages.

The current reference has 40 category definitions. Weather, special events and every checklist variant do not automatically correspond to an OSM query. Validate the rules against successful real responses and describe uncertainty in the interface.

## Integration with the existing app

The existing feature structure is sufficient. Add `src/features/decor-map/` when there is real code to put there; avoid empty scaffolding or moving unrelated calculator/checklist modules.

| Existing boundary | Map change to make when implementation starts |
| --- | --- |
| `App.jsx` and `Navigation.jsx` | Centralize section definitions, expose Map at all widths, and explicitly handle desktop layout |
| Desktop Now + Decor split | Recommend full-width Map with navigation still reachable; preserve the two-pane view through an explicit layout/view decision |
| Shell level badge/editor/status | Decide which controls remain relevant on Map and keep content space predictable |
| `features/decor/catalog.js`, `collection.js` | Reuse category definitions and stable IDs; introduce a narrow category mapping adapter if map data uses different labels |
| `useDecorCollection()` | Share the shell's existing collection instance for missing/collected information; do not instantiate a second copy in Map |
| `decorImages.js` | Reuse artwork lookup for selected-place details where useful; avoid mounting the full image catalogue on a map |
| `storage/progressStore.js` | Preserve existing fields. Add an explicit storage contract/migration only if map preferences or pins must persist |
| Vite / Pages base path | Keep map icons/data URLs compatible with `import.meta.env.BASE_URL` and static hosting |

Current navigation is local React state, not routing. Choose whether the first map needs a shareable URL. If it does, decide URL/base-path and static-host fallback behavior before adding a routing dependency.

## Proposed responsibility split

Possible modules, to create only when needed:

- `DecorMapSection.jsx`: section layout, map, filter controls, selected-place panel and accessible status.
- `useDecorMap.js`: viewport, selected place, filters and request lifecycle.
- A provider adapter: map engine setup, marker/event translation and cleanup.
- A location-data adapter: request/parse/normalize source places independently of the map engine.
- A category adapter: translate source tags/categories into existing decor categories without duplicating the checklist catalogue.
- Pin storage when implementing personal pins, separate from collection storage.

Avoid choosing abstractions before a real implementation requires them. Map engine, place-data source and personal pin persistence are distinct responsibilities even if one service can provide several.

## Data contracts to define

| Concept | Proposed meaning |
| --- | --- |
| Source place | Stable source/provider ID, coordinates, source name, display label and source categories/tags |
| Decor match | One or more candidate existing decor categories with the basis/limitations of the match |
| Personal pin | Separate pin ID, coordinates/place reference and optional private note; fields and storage decided separately |
| Collection progress | Existing `decorCollected` ID-to-boolean record, unchanged |
| Transient UI | Viewport, query, selected place and loading/error state, kept in the map feature |

Map POIs are candidate locations. Do not present a source classification as a guarantee of what Pikmin Bloom will detect. Determine and document source coverage, update behavior and limitations before displaying results.

## Performance and interaction requirements

- Load the map engine/data on entering Map where practical. Preserve calculator/checklist responsiveness when Map is closed.
- Fetch within a bounded visible area, debounce map movement and cancel obsolete requests. Show useful loading, empty, failed and retry states.
- Limit or cluster dense markers; avoid one full decor tile and particle system per marker.
- Clean up map instances, listeners and requests when appropriate. Decide whether reopening should retain viewport without leaving expensive hidden rendering running.
- Offer an explicit **Locate me** action if geolocation is included; decide denied/unavailable fallback. Location access is not part of current startup.
- Keep controls usable on narrow phones and desktop, with readable selected-place details and keyboard-accessible alternatives to marker-only information.
- Test real-phone pan/zoom, slow requests, denied permissions and dense areas before expanding coverage. Measure before adding speculative optimization.

## Suggested implementation sequence

1. Define the first discovery/pins slice and a test area; document what is excluded from the first version.
2. Start from the agreed OSM/Overpass approach and recommended Leaflet renderer. Choose the actual tile host, Overpass endpoint policy and search service/design against coverage, deployment fit, attribution, request limits and any cost; keep them separately configurable.
3. Adjust shell/navigation so all three sections are reachable at phone and desktop widths. Preserve existing state and the accepted two-pane experience through an explicit layout choice.
4. Add a map with one representative category, clear data provenance and basic place details. Keep data access separate from rendering.
5. Validate mobile/desktop layout, production base paths, request cleanup and existing calculator/checklist saves. Commit this working slice.
6. Add category filtering and collection-aware information; then expand the data mapping after verifying real source records.
7. Add personal pins with durable storage/export and basic add/edit/delete. Define any eventual account sync separately; do not imply browser-only pins are backed up across devices.

## Decisions still open

- First implementation slice, initial region and priority categories within the confirmed discovery/pins scope.
- Final dependency/version and tile/Overpass/search endpoints, hosting, API access and required attribution/usage terms within the agreed OSM approach.
- Candidate-place accuracy and any connection to the game's actual decor classifications.
- Desktop full-width Map and the final way to retain/select Now + Decor split view.
- Shareable section/map URLs and browser back/forward behavior.
- Geolocation controls, retention and defaults.
- Personal pin fields/storage, offline behavior, export and future sync.
- Whether community contributions are ever wanted; moderation and public sharing are separate later scope.

Track actionable work in [TODO](../TODO.md); see [the project guide](PROJECT_GUIDE.md) for current architecture and compatibility requirements.
