import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_BY_ID } from "./categories.js";
import { MAP_TILES } from "./providers.js";
import { featureStyle, markerColors, placeCategory } from "./mapPresentation.js";
import { categoryImageUrl } from "./categoryImages.js";

function markerIcon(categoryId, saved = false, selected = false, completed = false) {
  const url = categoryImageUrl(categoryId, import.meta.env.BASE_URL);
  const element = document.createElement("span");
  element.className = `decor-map-marker${saved ? " decor-map-marker--saved" : ""}${selected ? " decor-map-marker--selected" : ""}${completed && url ? " decor-map-marker--complete" : ""}`;
  const colors = markerColors(categoryId, saved);
  element.style.setProperty("--marker-accent", colors.accent);
  element.style.setProperty("--marker-tint", colors.tint);
  if (url && completed) {
    const symbol = document.createElement("span");
    symbol.className = "decor-map__completion-symbol";
    symbol.style.setProperty("--decor-category-image", `url("${url}")`);
    symbol.setAttribute("aria-hidden", "true");
    element.append(symbol);
  } else if (url) {
    const image = document.createElement("img");
    image.src = url;
    image.alt = "";
    image.width = 22;
    image.height = 22;
    image.decoding = "async";
    image.setAttribute("aria-hidden", "true");
    element.append(image);
  } else element.textContent = "📍";
  return L.divIcon({ html: element, className: "decor-map-marker-host", iconSize: [32, 32], iconAnchor: [16, 16] });
}

function completionLabel(label, completed) {
  return `${label}${completed ? " · category complete" : ""}`;
}

function configureMarkerElement(marker, label, selected = false) {
  const element = marker.getElement();
  element?.setAttribute("aria-label", label);
  if (selected) element?.setAttribute("aria-current", "true");
  else element?.removeAttribute("aria-current");
  if (element) element.onkeydown = event => {
    if (!["Enter", " "].includes(event.key) || event.repeat) return;
    event.preventDefault();
    event.stopPropagation();
    marker.fire("click", { originalEvent: event });
  };
}

export default function MapCanvas({ initialViewport, places, scannedBounds, pins, selectedCategoryIds, completedCategoryIds, selectedPlaceId, focus, addingPin,
  onViewport, onPlace, onPin, onNewPin }) {
  const element = useRef(null);
  const mapRef = useRef(null);
  const callbacks = useRef({});
  const addMode = useRef(addingPin);
  const discoveries = useRef(new Map());
  const previousSelection = useRef(null);
  const completedRef = useRef(completedCategoryIds);
  const selectedRef = useRef(selectedPlaceId);
  completedRef.current = completedCategoryIds;
  selectedRef.current = selectedPlaceId;
  const [tileError, setTileError] = useState(false);
  callbacks.current = { onViewport, onPlace, onPin, onNewPin };
  addMode.current = addingPin;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const map = L.map(element.current, { zoomControl: false, minZoom: 2, maxZoom: 19,
      preferCanvas: true, worldCopyJump: true, zoomAnimation: !reduced, fadeAnimation: !reduced, markerZoomAnimation: !reduced });
    mapRef.current = map;
    // Keep water blue when a surrounding park is selected and brought forward.
    map.createPane("decor-map-land").style.zIndex = 410;
    map.createPane("decor-map-water").style.zIndex = 420;
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const tiles = L.tileLayer(MAP_TILES.url, { maxZoom: 19, attribution: MAP_TILES.attribution,
      keepBuffer: 1, updateWhenIdle: true });
    tiles.on("tileerror", () => setTileError(true));
    tiles.on("tileload", () => setTileError(false));
    tiles.addTo(map);
    const publish = () => {
      const center = map.getCenter().wrap(), bounds = map.getBounds();
      callbacks.current.onViewport({ lat: center.lat, lng: center.lng, zoom: map.getZoom() },
        [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()]);
    };
    map.on("moveend", publish);
    map.on("click", event => {
      if (addMode.current) callbacks.current.onNewPin({ lat: event.latlng.lat, lng: event.latlng.lng });
    });
    map.setView([initialViewport.lat, initialViewport.lng], initialViewport.zoom);
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(element.current);
    return () => { observer.disconnect(); tiles.off(); map.off(); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!scannedBounds || !mapRef.current) return;
    const [south, west, north, east] = scannedBounds;
    const outline = L.rectangle([[south, west], [north, east]], {
      color: "#537c61", weight: 2, opacity: .8, dashArray: "7 7", fill: false, interactive: false,
    }).addTo(mapRef.current);
    return () => outline.remove();
  }, [scannedBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    const entries = new Map();
    for (const place of places) {
      const categoryId = placeCategory(place, selectedCategoryIds);
      let shape = null;
      if (place.geometry.type !== "Point") {
        shape = L.geoJSON({ type: "Feature", properties: {}, geometry: place.geometry }, {
          pane: categoryId === "waterside" ? "decor-map-water" : "decor-map-land",
          style: featureStyle(place, selectedCategoryIds),
          onEachFeature: (feature, path) => path.on("click", () => { if (!addMode.current) callbacks.current.onPlace(place); }),
        }).addTo(layer);
      }
      const label = `${place.name} · ${place.categoryIds.map(id => CATEGORY_BY_ID.get(id)?.label).join(", ")}`;
      const completed = completedRef.current.has(categoryId);
      const marker = L.marker([place.lat, place.lng], { icon: markerIcon(categoryId, false, false, completed), title: completionLabel(place.name, completed),
        alt: completionLabel(label, completed),
        keyboard: true, bubblingMouseEvents: false, riseOnHover: true })
        .on("click", () => addMode.current ? callbacks.current.onNewPin({ lat: place.lat, lng: place.lng }) : callbacks.current.onPlace(place)).addTo(layer);
      configureMarkerElement(marker, completionLabel(label, completed));
      entries.set(place.id, { place, categoryId, shape, marker, label, completed });
    }
    discoveries.current = entries;
    return () => { discoveries.current = new Map(); layer.remove(); };
  }, [places, selectedCategoryIds]);

  // Update only the old/new selection; do not rebuild hundreds of markers.
  useEffect(() => {
    for (const id of new Set([previousSelection.current, selectedPlaceId])) {
      const entry = discoveries.current.get(id);
      if (!entry) continue;
      const selected = id === selectedPlaceId;
      entry.shape?.setStyle(featureStyle(entry.place, selectedCategoryIds, selected));
      if (selected) entry.shape?.bringToFront();
      entry.marker.setIcon(markerIcon(entry.categoryId, false, selected, entry.completed));
      entry.marker.setZIndexOffset(selected ? 1000 : 0);
      configureMarkerElement(entry.marker, completionLabel(entry.label, entry.completed), selected);
    }
    previousSelection.current = selectedPlaceId;
  }, [selectedPlaceId, places, selectedCategoryIds]);

  // A collection change only updates affected icons; keep scan geometries intact.
  useEffect(() => {
    for (const entry of discoveries.current.values()) {
      const completed = completedCategoryIds.has(entry.categoryId);
      if (entry.completed === completed) continue;
      entry.completed = completed;
      const selected = entry.place.id === selectedRef.current;
      entry.marker.options.title = completionLabel(entry.place.name, completed);
      entry.marker.options.alt = completionLabel(entry.label, completed);
      entry.marker.setIcon(markerIcon(entry.categoryId, false, selected, completed));
      configureMarkerElement(entry.marker, completionLabel(entry.label, completed), selected);
      entry.marker.getElement()?.setAttribute("title", completionLabel(entry.place.name, completed));
    }
  }, [completedCategoryIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    for (const pin of pins) {
      const completed = completedCategoryIds.has(pin.categoryIds[0]);
      const marker = L.marker([pin.lat, pin.lng], { icon: markerIcon(pin.categoryIds[0], true, false, completed),
        title: completionLabel(pin.name, completed), alt: completionLabel(`Saved pin: ${pin.name}`, completed), keyboard: true, bubblingMouseEvents: false, riseOnHover: true })
        .on("click", () => callbacks.current.onPin(pin)).addTo(layer);
      configureMarkerElement(marker, completionLabel(`Saved pin: ${pin.name}`, completed));
    }
    return () => layer.remove();
  }, [pins, completedCategoryIds]);

  useEffect(() => {
    if (!focus || !mapRef.current) return;
    const map = mapRef.current;
    const animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shapeBounds = discoveries.current.get(focus.id)?.shape?.getBounds();
    if (shapeBounds?.isValid()) {
      map.fitBounds(shapeBounds, { paddingTopLeft: [32, 60], paddingBottomRight: [32, 120], maxZoom: 17, animate });
    } else map.setView([focus.lat, focus.lng], focus.zoom, { animate });
  }, [focus]);

  return <>
    {/* Keep className stable: Leaflet adds its own layout classes to this node. */}
    <div ref={element} className="decor-map__canvas" data-adding-pin={addingPin || undefined}
      role="region" aria-label="Interactive decor map" />
    {tileError && <div className="decor-map__tile-error" role="status">Background tiles could not load. Check your connection.</div>}
  </>;
}
