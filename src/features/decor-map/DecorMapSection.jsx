import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapCanvas from "./MapCanvas.jsx";
import PinEditor from "./PinEditor.jsx";
import { CategoryPanel, PinsPanel, PlaceDetails } from "./MapSidebar.jsx";
import { MAP_CATEGORIES } from "./categories.js";
import { countDecorGroups } from "../decor/collection.js";
import { parseMapLocation, mapViewUrl, searchAreaProblem, validPoint, bufferedSearchBounds, boundsContain } from "./coordinates.js";
import { DATA_SOURCES } from "./placeClient.js";
import { MAX_IMPORT_BYTES, MAX_PINS, mergePins, parsePinBackup, pinBackup } from "./mapStorage.js";
import useMapProgress from "./useMapProgress.js";
import usePlaceSearch from "./usePlaceSearch.js";
import "./decor-map.css";

function download(text, name) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DecorMapSection({ decorCollected }) {
  const progress = useMapProgress();
  const { state, setState } = progress;
  const [initialViewport] = useState(state.viewport);
  const [bounds, setBounds] = useState(null);
  const [focus, setFocus] = useState(null);
  const [locationText, setLocationText] = useState("");
  const [panel, setPanel] = useState("discover");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [editing, setEditing] = useState(null);
  const [addingPin, setAddingPin] = useState(false);
  const [missingOnly, setMissingOnly] = useState(false);
  const [notice, setNotice] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [copyUrl, setCopyUrl] = useState("");
  const [locating, setLocating] = useState(false);
  const sidebar = useRef(null);
  const alive = useRef(true);
  const locateRequest = useRef(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; locateRequest.current++; }; }, []);
  const stats = useMemo(() => new Map(MAP_CATEGORIES.map(category => [category.id, countDecorGroups([category.group], decorCollected)])), [decorCollected]);
  const effectiveIds = useMemo(() => state.categoryIds.filter(id => !missingOnly || stats.get(id).done < stats.get(id).total), [state.categoryIds, stats, missingOnly]);
  const searchBounds = useMemo(() => bufferedSearchBounds(bounds), [bounds]);
  const results = usePlaceSearch({ bounds: searchBounds, categoryIds: effectiveIds, sourceId: state.sourceId });
  const areaProblem = searchAreaProblem(bounds, state.viewport.zoom);
  const insideScan = boundsContain(results.scannedBounds, bounds);
  useEffect(() => { setSelectedPlace(previous => previous ? results.places.find(place => place.id === previous.id) || null : null); }, [results.places]);

  const onViewport = useCallback((viewport, nextBounds) => {
    setBounds(nextBounds);
    setState(previous => previous.viewport.lat === viewport.lat && previous.viewport.lng === viewport.lng && previous.viewport.zoom === viewport.zoom
      ? previous : { ...previous, viewport });
  }, [setState]);

  function showPanel() {
    if (sidebar.current) sidebar.current.scrollTop = 0;
  }
  function centerOn(point, zoom = 17) { setFocus({ ...point, zoom, nonce: crypto.randomUUID() }); }
  function choosePlace(place) { setSelectedPlace(place); setEditing(null); setPanel("discover"); showPanel(); }
  function choosePin(pin) { setEditing(pin); setPanel("pins"); setAddingPin(false); centerOn(pin); showPanel(); }
  function newPin(point) {
    setAddingPin(false);
    setEditing({ ...point, categoryIds: [], nonce: crypto.randomUUID() });
    setPanel("pins"); showPanel();
  }
  function startPin() { setAddingPin(value => !value); setEditing(null); setNotice(""); }
  function savePlace() {
    const existing = state.pins.find(pin => pin.osmId === selectedPlace.id);
    setEditing(existing || { name: selectedPlace.name, lat: selectedPlace.lat, lng: selectedPlace.lng,
      categoryIds: selectedPlace.categoryIds, osmId: selectedPlace.id, nonce: crypto.randomUUID() });
    setPanel("pins"); setAddingPin(false); showPanel();
  }
  function savePin(pin) {
    const existing = state.pins.some(item => item.id === pin.id);
    if (!existing && state.pins.length >= MAX_PINS) { setNotice(`You can save up to ${MAX_PINS} pins. Export a backup before removing any.`); return; }
    setState(previous => ({ ...previous, pins: existing ? previous.pins.map(item => item.id === pin.id ? pin : item) : [...previous.pins, pin] }));
    setEditing(null); setNotice(existing ? "Pin updated." : "Pin added to My pins.");
  }
  function goTo(event) {
    event.preventDefault();
    const viewport = parseMapLocation(locationText);
    if (!viewport) { setNotice("Enter latitude, longitude (for example 42.36, -71.06), or paste a map link containing lat and lng."); return; }
    locateRequest.current++; setLocating(false);
    setNotice(""); centerOn(viewport, viewport.zoom);
  }
  function locate() {
    if (!navigator.geolocation) { setNotice("Location is unavailable here. Enter coordinates or paste a map link instead."); return; }
    const request = ++locateRequest.current;
    setLocating(true); setNotice("");
    navigator.geolocation.getCurrentPosition(position => {
      if (!alive.current || request !== locateRequest.current) return;
      setLocating(false);
      const point = { lat: position.coords.latitude, lng: position.coords.longitude };
      if (!validPoint(point.lat, point.lng)) { setNotice("This location is outside the map's supported range."); return; }
      centerOn(point, 16);
    }, error => {
      if (!alive.current || request !== locateRequest.current) return;
      setLocating(false);
      setNotice(error.code === 1 ? "Location permission was declined. You can still move the map or paste coordinates." : "Your location could not be found. Try coordinates or a map link.");
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }
  async function copyMapLink() {
    const url = mapViewUrl(window.location.href, state.viewport);
    try { await navigator.clipboard.writeText(url); setNotice("Map view link copied. Personal pins and notes are not included."); setCopyUrl(""); }
    catch { setCopyUrl(url); setNotice("Copy the map view link below. Personal pins and notes are not included."); }
  }
  async function readImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error("Choose a JSON pin backup smaller than 16 MB.");
      const imported = parsePinBackup(await file.text());
      const merged = mergePins(state.pins, imported);
      if (alive.current) { setImportPreview({ imported, added: merged.length - state.pins.length }); setNotice(""); }
    } catch (error) { if (alive.current) setNotice(error.message); }
  }
  function confirmImport() {
    try {
      if (progress.importPins(importPreview.imported)) { setImportPreview(null); setNotice("Pin backup imported."); }
    } catch (error) { setNotice(error.message); }
  }

  let mapStatus = "Search this area to load nearby decor locations. Results stay while you pan.";
  if (addingPin) mapStatus = "Tap a spot on the map to place your pin.";
  else if (!bounds) mapStatus = "Preparing the map…";
  else if (results.phase === "loading") mapStatus = `Finding nearby decor locations…${results.hasScan ? " Previous scan stays visible." : ""}`;
  else if (results.phase === "error") mapStatus = `${results.message}${results.hasScan ? " Previous scan kept." : ""}`;
  else if (results.hasScan) {
    mapStatus = `${results.places.length} candidate places in last scan${results.cached ? " · cached" : ""}`;
    mapStatus += insideScan ? " · view inside scanned area" : ` · ${areaProblem || "view extends beyond scan; search here again"}`;
    if (results.truncated) mapStatus += " · partial results; zoom in and search again";
    if (results.incomplete) mapStatus += " · incomplete shapes skipped";
  }
  else if (!effectiveIds.length) mapStatus = missingOnly && state.categoryIds.length ? "Selected categories are complete in your checklist. Turn off Missing only to search them." : "Choose at least one decor category.";
  else if (areaProblem) mapStatus = areaProblem;

  return <section className="decor-map" aria-labelledby="decor-map-title">
    <header className="decor-map__header">
      <div><p className="decor-map__eyebrow">EXPLORE & REMEMBER</p><h2 id="decor-map-title">Decor map <span>📍</span></h2><p>Find possible decor locations and keep your favorite spots.</p></div>
      <button type="button" onClick={copyMapLink}>Copy map link ↗</button>
    </header>
    <div className="decor-map__layout">
      <aside className="decor-map__sidebar" ref={sidebar} aria-label="Map filters and saved places">
        <div className="decor-map__tabs" role="group" aria-label="Map panels">
          <button type="button" aria-pressed={panel === "discover"} onClick={() => { setPanel("discover"); setEditing(null); }}>Discover</button>
          <button type="button" aria-pressed={panel === "pins"} onClick={() => { setPanel("pins"); setEditing(null); }}>My pins <span>{state.pins.length}</span></button>
        </div>
        <p className={`decor-map__save-status${progress.saveError ? " decor-map__save-status--error" : ""}`} role="status">{progress.saveError || "Pins & map preferences save in this browser"}</p>
        {progress.recoveryRaw !== null && <button type="button" onClick={() => download(progress.recoveryRaw, "pikapp-map-recovery.json")}>Download recovery file</button>}
        {notice && <div className="decor-map__notice" role="status">{notice}<button type="button" aria-label="Dismiss map message" onClick={() => setNotice("")}>×</button></div>}
        {copyUrl && <input aria-label="Map view link" readOnly value={copyUrl} onFocus={event => event.target.select()} />}
        {importPreview && <div className="decor-map__import-preview" role="group" aria-label="Review pin import">
          <h3>Import {importPreview.imported.length} pins?</h3><p>{importPreview.added} new pins. Matching IDs keep the newer edit.</p>
          <button type="button" onClick={confirmImport}>{progress.recoveryRaw !== null ? "Replace unreadable map data with import" : "Merge imported pins"}</button>
          <button type="button" onClick={() => setImportPreview(null)}>Cancel import</button>
        </div>}
        {editing ? <PinEditor key={editing.id || editing.nonce} draft={editing} onSave={savePin} onCancel={() => setEditing(null)}
          onDelete={id => { setState(previous => ({ ...previous, pins: previous.pins.filter(pin => pin.id !== id) })); setEditing(null); setNotice("Pin removed."); }} />
          : panel === "pins" ? <PinsPanel pins={state.pins} onSelect={choosePin} onAdd={startPin} onImport={readImport}
            onExport={() => download(pinBackup(state.pins), `pikapp-pins-${new Date().toISOString().slice(0, 10)}.json`)} />
          : selectedPlace ? <PlaceDetails place={selectedPlace} stats={stats} saved={state.pins.some(pin => pin.osmId === selectedPlace.id)}
            onSave={savePlace} onBack={() => setSelectedPlace(null)} onFocus={() => centerOn(selectedPlace)} />
          : <CategoryPanel selectedIds={state.categoryIds} stats={stats} results={results} onPlace={place => { choosePlace(place); centerOn(place); }}
            missingOnly={missingOnly} onMissingOnly={() => setMissingOnly(value => !value)}
            onToggle={id => setState(previous => ({ ...previous, categoryIds: previous.categoryIds.includes(id) ? previous.categoryIds.filter(value => value !== id) : [...previous.categoryIds, id] }))}
            onSelectAll={() => setState(previous => ({ ...previous, categoryIds: MAP_CATEGORIES.map(category => category.id) }))}
            onClear={() => setState(previous => ({ ...previous, categoryIds: [] }))} />}
        <details className="decor-map__options"><summary>Map options & location</summary>
          <form onSubmit={goTo}><label>Coordinates or a map link<input value={locationText} onChange={event => setLocationText(event.target.value)} placeholder="Latitude, longitude or map link" /></label><button type="submit">Go to location</button></form>
          <label>Map data source<select value={state.sourceId} onChange={event => setState(previous => ({ ...previous, sourceId: event.target.value }))}>{DATA_SOURCES.map(source => <option key={source.id} value={source.id}>{source.label}</option>)}</select></label>
          <p className="decor-map__hint">Search includes the visible area plus a surrounding buffer, up to 200 km². Results stay while you pan or zoom. Search again to replace them; changing categories or data source clears them. Public services may be busy; try the other source if a search fails.</p>
          <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">Report an OSM map issue ↗</a>
        </details>
      </aside>
      <div className="decor-map__map-area">
        <MapCanvas initialViewport={initialViewport} places={results.places} scannedBounds={results.scannedBounds} pins={state.pins} selectedCategoryIds={effectiveIds}
          selectedPlaceId={panel === "discover" && !editing ? selectedPlace?.id : null}
          focus={focus} addingPin={addingPin} onViewport={onViewport} onPlace={choosePlace} onPin={choosePin} onNewPin={newPin} />
        <div className="decor-map__map-tools">
          <button type="button" className="decor-map__primary" title="Includes a surrounding buffer; results stay while you pan" disabled={!bounds || !!areaProblem || !effectiveIds.length || results.phase === "loading"} onClick={results.search}>Search this area</button>
          <button type="button" aria-pressed={addingPin} onClick={startPin}>{addingPin ? "Cancel pin" : "📍 Add pin"}</button>
          <button type="button" disabled={locating} onClick={locate}>{locating ? "Locating…" : "◎ Locate me"}</button>
        </div>
        <div className={`decor-map__map-status${results.phase === "error" ? " decor-map__map-status--error" : ""}`} role="status">
          {results.phase === "loading" && <span className="decor-map__spinner" aria-hidden="true" />}{mapStatus}
          {results.hasScan && <small>Dashed outline: last scanned area</small>}
          {results.phase === "loading" && <button type="button" onClick={results.cancel}>Cancel</button>}
          {results.phase === "error" && <button type="button" disabled={!bounds || !!areaProblem || !effectiveIds.length} onClick={results.search}>Retry</button>}
        </div>
      </div>
    </div>
    <footer className="decor-map__footnote">Candidate locations from OSM · game results may differ · pins save locally</footer>
  </section>;
}
