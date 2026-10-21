import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_BY_ID } from "./categories.js";
import { MAP_TILES } from "./providers.js";

function markerIcon(icon, saved = false) {
  const element = document.createElement("span");
  element.className = `decor-map-marker${saved ? " decor-map-marker--saved" : ""}`;
  element.textContent = icon;
  return L.divIcon({ html: element, className: "decor-map-marker-host", iconSize: [34, 40], iconAnchor: [17, 38] });
}

export default function MapCanvas({ initialViewport, places, pins, selectedCategoryIds, focus, addingPin,
  onViewport, onPlace, onPin, onNewPin }) {
  const element = useRef(null);
  const mapRef = useRef(null);
  const callbacks = useRef({});
  const addMode = useRef(addingPin);
  const [tileError, setTileError] = useState(false);
  callbacks.current = { onViewport, onPlace, onPin, onNewPin };
  addMode.current = addingPin;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const map = L.map(element.current, { zoomControl: false, minZoom: 2, maxZoom: 19,
      preferCanvas: true, worldCopyJump: true, zoomAnimation: !reduced, fadeAnimation: !reduced, markerZoomAnimation: !reduced });
    mapRef.current = map;
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
    const map = mapRef.current;
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    for (const place of places) {
      const category = CATEGORY_BY_ID.get(selectedCategoryIds.find(id => place.categoryIds.includes(id)) || place.categoryIds[0]);
      if (place.geometry.type !== "Point") {
        L.geoJSON({ type: "Feature", properties: {}, geometry: place.geometry }, {
          style: { color: "#448961", weight: 2, fillColor: "#9bd2b1", fillOpacity: 0.24 },
          onEachFeature: (feature, shape) => shape.on("click", () => callbacks.current.onPlace(place)),
        }).addTo(layer);
      }
      L.marker([place.lat, place.lng], { icon: markerIcon(category?.icon || "🌱"), title: place.name,
        alt: `${place.name} · ${place.categoryIds.map(id => CATEGORY_BY_ID.get(id)?.label).join(", ")}`,
        keyboard: true, bubblingMouseEvents: false, riseOnHover: true })
        .on("click", () => callbacks.current.onPlace(place)).addTo(layer);
    }
    return () => layer.remove();
  }, [places, selectedCategoryIds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    for (const pin of pins) {
      const category = CATEGORY_BY_ID.get(pin.categoryIds[0]);
      L.marker([pin.lat, pin.lng], { icon: markerIcon(category?.icon || "📍", true),
        title: pin.name, alt: `Saved pin: ${pin.name}`, keyboard: true, bubblingMouseEvents: false, riseOnHover: true })
        .on("click", () => callbacks.current.onPin(pin)).addTo(layer);
    }
    return () => layer.remove();
  }, [pins]);

  useEffect(() => {
    if (!focus || !mapRef.current) return;
    const map = mapRef.current;
    map.setView([focus.lat, focus.lng], focus.zoom, { animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }, [focus]);

  return <>
    <div ref={element} className={`decor-map__canvas${addingPin ? " decor-map__canvas--adding" : ""}`}
      role="region" aria-label="Interactive decor map" />
    {tileError && <div className="decor-map__tile-error" role="status">Background tiles could not load. Check your connection.</div>}
  </>;
}
