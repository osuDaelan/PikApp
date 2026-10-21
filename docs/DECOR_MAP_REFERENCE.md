# OSM decor map reference: Pixelpirate

Reviewed October 21, 2026. This investigation follows the actual frontend, category data and optional mirror implementation. It records a reference architecture for PikApp; no reference application code or game icons were imported into PikApp.

## Source versions and scope

- Frontend: [pixlpirate/pikmin-map, revision fe416ef](https://github.com/pixlpirate/pikmin-map/tree/fe416ef44377d8b62276b782c611e9289cfe69d7), latest fetched revision during this review.
- Optional data mirror: [pixlpirate/pikmin-map-data, revision 7c6db49](https://github.com/pixlpirate/pikmin-map-data/tree/7c6db49b1c7045be74c010c394cde5eb7f98b15a).
- Live site: [Pikmin Map](https://www.pikmin-map.pixelpirate.fr/). The supplied viewport was inspected without requesting the user's physical location. Personal coordinates are deliberately omitted from these committed notes.
- The live category list, About table and v1.0.17 changelog agree with the inspected features. The deployed site's exact Git revision is not exposed, so full source/build parity is unverified.

The user wants this **OSM tag-based discovery approach** for PikApp, alongside personal saved pins. The reference is a candidate-location finder, not a collection tracker or a connection to the game's servers.

## Plain-English pipeline

The map has two separate kinds of data. Background tiles supply the roads, buildings, labels and terrain you see. A separate query supplies the places to highlight as potential decor locations. Those overlays are not extracted from the background image.

```text
Choose decor categories + move/zoom to an area
    -> category rules supply relevant OSM tags
    -> build one Overpass query for the visible bounding box
    -> public Overpass server returns tagged nodes/ways/relations
       (optional SQLite/PHP mirror can answer the same query)
    -> normalize geometry and match tags to candidate decor categories
    -> Leaflet draws category markers and line/area outlines
    -> selecting a marker opens place name, OSM link and other matches
```

Angular manages components and forms; RxJS coordinates changing selections and cancelable requests; Leaflet supplies the map engine, map gestures, tiles, vector shapes, markers and popups. The application itself supplies the tag rules, queries, classification, icons and request/error policy. There is no Pikmin animation/3D engine in this pipeline. Dependencies are in [package.json](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/package.json#L15-L35).

## Key source files

All linked frontend line references below are pinned to the reviewed revision.

| File / symbols | Role |
| --- | --- |
| [assets/decors/decors.json, lines 1–327](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/assets/decors/decors.json#L1-L327) | Complete category-to-OSM rule table: 40 categories, 72 alternative rules, including four two-tag AND rules |
| [decor.service.ts: getDecors/loadDecors, lines 24–42](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/decor/decor.service.ts#L24-L42) | Loads the static JSON catalogue |
| [decor-selection.component.ts, lines 47–99](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/components/organisms/decor-selection/decor-selection.component.ts#L47-L99) | Checkbox selection, query dispatch and clearing empty selection |
| [page-map.component.ts, lines 29–44](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/components/templates/page-map/page-map.component.ts#L29-L44) / [event-bus.service.ts](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/event-bus/event-bus.service.ts) | Map changes trigger queries; BehaviorSubjects carry checked categories, results and map-change events |
| [overpass-turbo.service.ts, lines 87–124, 150–282, 321–388](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/overpass-turbo/overpass-turbo.service.ts#L87-L124) | Debouncing/cancellation, bounds, server/fallback requests, result normalization, query construction and category matching |
| [map.component.ts, lines 38–76](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/components/organisms/map/map.component.ts#L38-L76) | Initializes the map; clears and redraws the result layer; saves viewport/URL |
| [map.service.ts, lines 43–76, 133–294, 320–385](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/map/map.service.ts#L43-L76) | Leaflet setup, tiles, markers, category priority, popups, outlines, optional radii and viewport links |
| [nominatim.service.ts, lines 20–49](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/nominatim/nominatim.service.ts#L20-L49) / [search-bar.component.ts, lines 44–80](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/components/organisms/search-bar/search-bar.component.ts#L44-L80) | Address/place search, separate from decor lookup |
| [locate.component.ts, lines 26–49](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/components/molecules/locate/locate.component.ts#L26-L49) | Explicit locate action, ongoing browser location watch, location dot and accuracy popup |
| [advanced-options.service.ts, lines 7–59](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/advanced-options/advanced-options.service.ts#L7-L59) | Persisted marker/path visibility and optional radius size |
| [environment.ts](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/environments/environment.ts) | Default public Overpass and optional mirror URLs |
| [icons/README.md](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/assets/icons/README.md) / [markers.scss](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/styles/atoms/markers.scss#L25-L48) | Category icon assets excluded from Git; pin background and icon layout |

## Category rules: what a match actually means

Each rule entry has `label`, `icon`, `tags`, and occasionally `area`. Separate entries in `tags` are alternatives (**OR**). A nested array means every tag in that array must match (**AND**). Selecting several categories unions their selectors; it does not require a place to match every selected category.

Representative rules, directly from the JSON:

| Candidate decor | OSM condition used by the reference |
| --- | --- |
| Restaurant | `amenity=restaurant` |
| Café | `amenity=cafe` OR `cuisine=coffee_shop` |
| Forest | `landuse=forest` OR `natural=wood` |
| Waterside | `natural=water` |
| Park | `leisure=park` |
| Burger Place | `amenity=fast_food` OR `cuisine=burger` (broad; fast food need not serve burgers) |
| Italian Restaurant | `cuisine=italian` OR `cuisine=pasta` OR `cuisine=pizza` |
| Makeup Store, internally Cosmetic Shop | `amenity=pharmacy` OR `shop=cosmetics` OR `shop=department_store` |
| Library/bookstore | `amenity=library` OR `shop=books` |
| Stationery Store | `shop=stationery` OR `shop=books` |
| Shrines and Temples | In Japan, shrine/temple building AND shinto/buddhist religion, expanded into four combinations |

The remaining categories use the same data-driven mechanism, not extra rendering code. These are community-maintained approximations. Neither the code nor the About text establishes the game's exact tag rules, data snapshot, probabilities, spawn positions or detection boundary. Its statements about Foursquare and game refresh timing are reference-author explanations, not verified Niantic specifications.

Matching is category-level only. It does not determine Pikmin species, costume variation, rare eligibility, events, weather, or which specific variant will be obtained. A park or restaurant POI is not proof that the game will return that decor there.

## Querying and refreshing

`MapService.init()` sets a Leaflet map and emits changes on `moveend` and `zoomend`. The selection component requests results on category changes; the map page requests again after movement when at least one category is selected. No categories selected means no OSM query and an empty overlay layer.

`fetchOverpassTurboResults()` reads the visible bounds in **south, west, north, east** order. Its stream debounces by **300ms**, suppresses identical serialized queries, and uses RxJS `switchMap` to unsubscribe the previous HTTP request when the next debounced query starts. This is not a persistent place-data cache.

`prepareOverpassTurboQuery()` produces Overpass QL with JSON output, a five-second server query timeout, a bounding box, a union of `nwr` selectors, and `out geom;`. Here `nwr` means nodes, ways and relations. A country-limited rule adds an ISO country area selector. The service name says Overpass Turbo, but requests go directly to **Overpass interpreter APIs**, not through the Overpass Turbo website.

Each simple tag is turned into a semicolon-aware regex selector; nested rules use consecutive exact-match predicates. The request is a browser `HttpClient.get()` with the query encoded in `?data=...` ([request and query builder](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/overpass-turbo/overpass-turbo.service.ts#L204-L280), [builder lines 321–356](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/services/overpass-turbo/overpass-turbo.service.ts#L321-L356)). This frontend flow has no secret API key and does not require a personal account.

The chosen instance is stored locally. HTTP **429** or **504** from a public instance triggers one retry against the configured mirror. After a successful response, that endpoint becomes the in-memory active endpoint for subsequent requests. This does not probe every public instance. The user's chosen endpoint remains the saved preference; selecting an instance explicitly resets the active endpoint. Other failures do not trigger that automatic mirror fallback. There is no explicit frontend request deadline beyond the server query timeout directive.

Loading, no-result and over-1000 warnings use toasts. Normalized elements are truncated to the first **1000 after downloading**, not limited before the public request executes. Therefore the cap bounds rendering more than network/query cost. Prior results are replaced on success; errors do not explicitly clear the old layer or mark its viewport as stale. Unknown errors are logged without a useful general error toast.

## Geometry, classification and display

1. Direct node/way results are retained. For each relation, node/way members are flattened, inner members discarded, parent relation tags copied, and member refs used as IDs. This is a simplified geometry conversion, not full multipolygon reconstruction.
2. Geometry points become Leaflet `LatLng` values. A node without geometry uses its own coordinates. Missing place names get a translated unknown-name label.
3. `getDecors(tags)` splits semicolon values, trims them and checks against **all** category definitions, not only selected categories. This explains why selecting Restaurant can reveal an Italian category in its popup.
4. `MapComponent` clears the decor LayerGroup and redraws the complete normalized result list. Nodes get icon markers. Ways get polylines, with a fill if endpoints are judged closed, plus a marker at the arithmetic mean of their vertices.
5. Markers are 38×50 Leaflet `divIcon` elements. The pin image background is combined with a category PNG. The displayed category is the **first matching category in selection order**: the source comment says last, but `.find()` implements first. A `+N` label represents additional category matches, not a geographic marker cluster.
6. Popups link the object to OSM and show its name and other matched category icons. The centroid is only an approximate label position; it can fall outside a concave shape and is not a spawn location.
7. Advanced options can hide markers, hide paths, or draw circles around markers, default radius 100m. Hiding paths also skips their center marker because `addPolyline()` returns early. Circles illustrate proximity only; they do not calculate detector eligibility or decor probabilities.

Leaflet handles pan/zoom, projection, touch interaction and actual layer rendering. The [Leaflet API](https://leafletjs.com/reference.html) confirms that SVG is the normal path renderer unless configured otherwise. No clustering library, spatial deduplication pass or application-level result cache is present in the inspected frontend.

Background tiles come from `https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`, separate from Overpass. The [Leaflet CSS adjustment](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/src/app/styles/vendor-fix/leaflet.scss) applies slight contrast/saturation changes. The repository includes `_Background.png` but omits the game category icons. Code expects `assets/icons/map/<icon>.png` for markers and `assets/icons/picture-book/<icon>.png` for selection. The live deployment has these files; a fresh clone alone will not reproduce its category artwork.

## Search, location, persistence and offline scope

- Search is **geocoding**, separate from tag-based decor discovery. The reference sends text to public Nominatim after 300ms of typing, then flies to a chosen result's bounding box over 1.5 seconds. It uses `mergeMap`, so older responses can arrive after newer ones. Search error handling is limited.
- **Do not reproduce that public Nominatim autocomplete.** Its [current usage policy](https://operations.osmfoundation.org/policies/nominatim/) prohibits client autocomplete, caps public use at one request/second across an application, requires attribution/identification, and requires being able to switch services. A 300ms debounce is insufficient. Choose a suitable search service or a compliant deliberate submit-search design only after an informed provider decision.
- **Locate me** starts a continuing browser location watch. It adds a pulsing blue dot, updates its position and accuracy text, and flies to zoom 18 on the first fix. No stop-watch, denial/error UI, listener deduplication or destruction cleanup is visible in this component. PikApp should have explicit permission/failure behavior and cleanup.
- Center/zoom are saved in localStorage. URL `lat`, `lng`, `zoom` override the saved viewport; map changes use `history.replaceState`, so the URL shares a view but does not create a navigation entry per movement. Parsing has no robust finite/range validation.
- Other saved values are locale, selected Overpass instance and advanced options. Category selection is transient and cleared when leaving Map. There is no personal pin/bookmark/note store, collection progress integration, account login or cloud synchronization in the inspected code.
- The production Angular service worker caches application/static assets ([ngsw-config.json](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/ngsw-config.json)); it has no data-group caching for tile, geocoder or Overpass results. Installing the app does not make discovery an offline OSM database.

## Optional mirror: what needs a server

The companion repository is an alternative **OSM read service**, not an account database. Its frontend config points to an `api.` host; a development proxy forwards `/api/overpass.php` to a separate PHP server. This is optional when public Overpass works.

Actual implementation:

- [importer/config/settings.json](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/importer/config/settings.json) and [importer/lib/tags.js](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/importer/lib/tags.js) load the frontend rule table, derive a unique tag vocabulary, and configure QLever's OSM SPARQL endpoint. Selected countries are downloaded into local SQLite files, not bundled with the frontend.
- [pipeline.js](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/importer/lib/pipeline.js#L23-L73) prepares simplified, quantized geometry and coarse geographic cells. Defaults use a 1e-5-degree coordinate grid and zoom-12 cell indexing. [db.js](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/importer/lib/db.js) stores features, tags, names and cell/tag lookup tables; this avoids requiring a spatial extension. Build/update scripts populate and refresh the snapshots.
- [api/overpass.php, lines 19–69, 103–126](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/api/overpass.php#L19-L69) validates origin and query, sets a one-hour public cache header, and dispatches to the parser/query engine. It returns Overpass-shaped JSON, up to 1001 elements so the frontend can detect truncation.
- [OverpassQL.php](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/api/lib/OverpassQL.php) parses the subset of queries used by this map. It is not a general-purpose Overpass replacement.
- [Mirror.php: openRelevant/runOne/matchStatement/buildElements/rowToElements](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/api/lib/Mirror.php#L32-L175) chooses country files intersecting the viewport, matches indexed tags/cells, applies bounding-box checks, decodes geometry and returns results. Multiple country snapshots can contribute.

Important differences: coverage is limited to installed country files, geometry is simplified, and snapshot freshness depends on imports. Relations are emitted as way-like rings retaining the relation's numeric ID, so the frontend may create the wrong OSM object permalink. Exact source object identity must be preserved in PikApp. Snapshot data and deployed configuration were not present for inspection; the number/age of actually served countries is unknown. The API's `timestamp_osm_base` is generated from request time in `respond()`, not read from an imported OSM snapshot, so it should not be treated as freshness evidence.

Default CORS allows the author's site and specified local origins, **not PikApp's localhost:5173 or GitHub Pages origin**. Private configuration may differ, but was unavailable. Do not assume this hosted mirror is available as PikApp's backend or work around the allowlist. Use approved public services initially or arrange a separately hosted endpoint. GitHub Pages serves static files and [does not run PHP or other server-side code](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages); this optional mirror needs separate hosting and maintenance.

## Verified implementation issues to avoid carrying over

These are source-level findings, not claims that every user will encounter each issue:

| Issue / evidence | PikApp response |
| --- | --- |
| `getDecors()` pushes once for each matching rule without deduplication (overpass service lines 365–388) | Return unique category IDs. Synthetic `amenity=restaurant`, `cuisine=italian;pizza` produced Restaurant + Italian + Italian, inflating `+N`. |
| Builder emits `(^|;)?value($|;)`; leading group is optional (lines 344–346) | Use consistently normalized, properly bounded token matching in both query and client classifier. The reference regex matches `toy_library`, while its client classifier does not. |
| JSON contains `cuisine='tex-mex'` (lines 296–302); client classifier expects the literal quotes | Store unquoted values. Synthetic normal `cuisine=tex-mex` matched no category. The mirror strips these quotes but the frontend still cannot classify that value correctly. |
| `getDecors()` checks all definitions without their country restriction | Apply any regional constraint consistently during classification as well as querying. |
| Relations flattened to member ways and inner rings discarded | Normalize to GeoJSON preserving original node/way/relation identity, multipolygon structure and holes; deduplicate objects returned through several routes. |
| Popup HTML concatenates OSM names directly (`map.service.ts` lines 208–233) | Render names as text/escaped content; treat external tags as untrusted data. |
| Full layer clear/redraw; post-download cap; no zoom/area gate or result cache | Add bounded-area queries, cancellation, cache and incremental updates where useful; cluster or limit dense point layers based on measurements. |
| `PageMapComponent` does not assign its map subscription; per-control subscriptions overwrite one field; map destruction only clears layers | Explicitly clean up subscriptions, listeners, map instances, location watches and requests when a React section mounts/unmounts. |
| Radius is illustrative; `getDistanceBetweenLatLngs()` also uses degree values in a radian formula | Use correct geometry/library distance helpers. Do not turn approximate circles or centroids into game guarantees. |
| Core service tests shown are only creation checks | Add meaningful query, matching, geometry, identity, stale-response and persistence tests for our implementation. |

The query builder and classifier were exercised locally with synthetic tags, without requesting live OSM data or changing reference files. The duplicate/category/quoted-value results above came from those actual method bodies, not a guessed reimplementation. Neither reference application was installed or built, and no country database/import job was run.

## What this means for PikApp

Use the same **architecture**, with our own React implementation and interface:

1. Leaflet is a suitable starting renderer; React can mount it directly behind a small feature adapter. Angular and the reference's event-bus architecture are not required.
2. Keep OSM tag rules separate from the checklist catalogue. Map category IDs to our existing groups explicitly: e.g. reference Cosmetic Shop → Makeup Store, Hardware Store → DIY Store, University → University & College, Laundry → Laundromats & Dry Cleaners, and Library/bookstore → Library & Bookstore. Trim the reference's trailing space in Post Office. Japan shrine/temple rules relate to our Fortune category and need an explicit reviewed mapping, not a renamed save key.
3. Discovery applies to location-based categories. Do not invent OSM rules for weather, event decors, rare variants, or every Roadside outcome merely because they appear in the checklist. Counts can still summarize missing items for a category.
4. Use bounded Overpass queries for selected categories; add robust loading/error/stale-result state, request deadlines, deduplication, cleanup and a small cache. Keep tile, geocoder and decor-data providers independently configurable. Set reasonable minimum zoom/area limits before making broad queries.
5. Keep lightweight category markers and optional outlines on the map. Reuse PikApp artwork in selected-place details if useful, rather than mounting hundreds of full animated checklist tiles as markers.
6. Personal pins are additional scope: a separate local ID, coordinates/source reference, category/note fields, edit/delete, versioned storage and export/recovery. Saving a place must not collect every Pikmin in that category. Cloud synchronization comes later through the account plan.
7. Load the map feature on entry, retain one collection state owner, and update desktop navigation/layout as already documented in [the map plan](DECOR_MAP_PLAN.md).

Before deploying, select tile hosting and search services deliberately. OSM data attribution, tile-host terms and geocoding limits are separate concerns. The reference HOT tiles are hosted by OSM France; consult [OSM France's service policy](https://www.openstreetmap.fr/usage/) for that host, rather than assuming the [OSMF standard tile policy](https://operations.osmfoundation.org/policies/tiles/) covers it. Public Overpass has shared capacity; the [OSM documentation](https://wiki.openstreetmap.org/wiki/Overpass_API) recommends caching/rate limiting, not uncontrolled requests while dragging.

Both inspected repositories' actual `LICENSE` files say **GNU Affero General Public License v3**, although their README descriptions say GPLv3. Record the actual license text when considering reuse ([frontend LICENSE](https://github.com/pixlpirate/pikmin-map/blob/fe416ef44377d8b62276b782c611e9289cfe69d7/LICENSE), [mirror LICENSE](https://github.com/pixlpirate/pikmin-map-data/blob/7c6db49b1c7045be74c010c394cde5eb7f98b15a/LICENSE)). This review does not resolve licensing for copying code or game assets. The intended implementation remains our own, using the reference to understand behavior and OSM concepts.

## Live verification and remaining unknowns

The supplied site opened with map tiles, 40 category controls, search, locate and About. At the user's request, several categories were selected together, including point categories and Forest/Waterside/Park area categories. Ten checkboxes were confirmed checked in the live DOM. Loading feedback appeared; one initial request logged an Overpass error. During this review the selected test queries did not yield rendered decor overlays, so marker overlap/popups/outlines are **source-confirmed**, not claimed as successfully observed live. Alternate built-in sources and a fresh page lifecycle were tried; this does not establish a global service outage or its cause. Exact network status, live mirror configuration and deployed data freshness remain unknown.

No physical location permission was requested, no account or pin data was created, and no dependency or service endpoint was configured in PikApp. The next implementation should test a point, a closed area, a line, an overlapping category match and a relation against actual successful responses, then record the result separately from this reference analysis.

## Additional reference: Bekkan Decor Spot Searcher

Reviewed October 21, 2026: [English site](https://bekkan.youton-wiki.com/?PikminBloomSpotSearcher_English), its deployed [map script](https://bekkan.youton-wiki.com/js/dst/pikminbloom_spot_searcher.min.js?250509) and [English UI script](https://bekkan.youton-wiki.com/js/dst/pikminbloom_spot_searcher_english.min.js?250509). These are minified files; symbol references below refer to their deployed bodies, principally line 1. The cache parameter is not an immutable revision. No reference code or icons were copied into PikApp.

### How whole-area highlighting works

- Decor choices populate OSM tag expressions; Waterside uses `natural=water`, Park uses `leisure=park`, with playground offered separately. `I.sendRequest` queries nodes, ways and relations through Overpass Germany, using either visible bounds or a named administrative area obtained through Nominatim.
- The query prints tagged objects, recursively fetches their component members, then prints coordinate/member data: `out body; >; out skel qt;`. `I.onLoad` builds node-ID and way-ID lookup tables. Boundary nodes supply coordinates; tagged standalone nodes are point results.
- For ways, it resolves their ordered node IDs to coordinates and calls helper `E`, which draws a Leaflet polygon. It also adds a blue category marker using helper `L`; point objects receive red markers. This is a real boundary shape, not a radius circle around the marker.
- For relations, it separates member ways with `outer` and `inner` roles, resolves their nodes, and passes nested coordinate arrays to Leaflet. The implementation assumes each member way is an already usable ring and puts inner rings under the first outer ring. It does not visibly stitch split outer members or associate holes with their containing outer ring. Its conversion of all ways to polygons is also unsuitable for genuine open lines. Preserve PikApp's converter rather than copying this assembly.
- A successful new search removes previous marker/polygon layers, creates a result list and fits the map to received node extents. Map movement saves view bounds; it does not itself dispatch another decor search. The reference has a 30-second server timeout but no explicit top-level result cap in this builder.

Nodes are individual coordinates; ways join nodes into lines or boundaries; relations organize multiple pieces and holes. A lone point cannot supply a park's footprint. See [OSM's element definitions](https://wiki.openstreetmap.org/wiki/Elements).

### Comparison with PikApp and proposed improvements

PikApp already requests full coordinates through `buildOverpassQuery` in `src/features/decor-map/osm.js:21` using geometry output, rather than fetching node tables separately. `normalizeOsmResults` uses `osmtogeojson` and retains shapes/OSM identities. `MapCanvas.jsx:65` draws non-point GeoJSON with a filled overlay and clickable details; relation-hole behavior is covered by `tests/decorMap.test.js`. [Overpass's geometry-output documentation](https://dev.overpass-api.de/overpass-doc/en/targets/formats.html) explains the alternative representation. Our query does not specify an output clipping box, so successfully returned shapes can extend beyond the scan rectangle.

The present style uses the same green stroke and 24% green fill for every area (`MapCanvas.jsx:67`), making water/parks difficult to distinguish among markers. Proposed: distinct park-green and water-blue fills, a stronger selected-area outline and optional point-marker visibility, while preserving holes and open lines. These are proposed presentation changes, not implemented by this review.

Review the query/result budgets separately: PikApp requests at most 501 objects and displays at most 400 places (`osm.js:5–6,21,79–81`). A truncated mixed-category scan can omit area features as well as points; do not assume a blank overlay means no mapped boundary. Consider reserving part of a bounded result budget for ways/relations, with explicit partial-result warnings, rather than removing limits. This is a possible cause of missing area overlays, not a verified explanation of the user's specific current view. Large enclosing areas whose boundaries fall outside the query also need a deliberate discovery strategy; merely drawing their geometry cannot make an unfound object appear.

OSM boundaries remain candidate source areas, not confirmed Pikmin Bloom detection or seedling-spawn boundaries.

### Verification limits

The live English page, multi-select Park/Waterside choices and resulting tag field were verified. An advertising overlay prevented completing the live search interaction; no successful live polygon response from this reference site is claimed. Drawing/query behavior above is confirmed from the deployed JavaScript. Its source-map request returned HTTP 503; original unminified sources and deployed version parity are unverified. A separate bounded public example request against PikApp's French endpoint returned HTTP 403 during this review, so it did not confirm the result-budget hypothesis. Neither response establishes a global service outage. No physical location permission was requested and application code/assets were unchanged.
