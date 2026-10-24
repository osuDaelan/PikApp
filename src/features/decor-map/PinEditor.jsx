import React, { useState } from "react";
import { MAP_CATEGORIES } from "./categories.js";
import { validPoint } from "./coordinates.js";
import { MAX_PIN_NAME_LENGTH } from "./mapStorage.js";
import CategoryIcon from "./CategoryIcon.jsx";

export default function PinEditor({ draft, onSave, onCancel, onDelete }) {
  const [name, setName] = useState(draft.name || "New pin");
  const [notes, setNotes] = useState(draft.notes || "");
  const [lat, setLat] = useState(String(draft.lat));
  const [lng, setLng] = useState(String(draft.lng));
  const [categories, setCategories] = useState(draft.categoryIds || []);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  function submit(event) {
    event.preventDefault();
    if (!name.trim()) { setError("Give this pin a name."); return; }
    if (!lat.trim() || !lng.trim() || !validPoint(Number(lat), Number(lng))) { setError("Enter valid latitude and longitude coordinates."); return; }
    const timestamp = new Date().toISOString();
    onSave({ id: draft.id || crypto.randomUUID(), name: name.trim(), notes,
      lat: Number(lat), lng: Number(lng), categoryIds: categories, osmId: draft.osmId || null,
      createdAt: draft.createdAt || timestamp, updatedAt: timestamp });
  }
  return <form className="decor-map__pin-form" onSubmit={submit}>
    <div className="decor-map__panel-heading"><h3>{draft.id ? "Edit pin" : "Save a pin"}</h3><button type="button" onClick={onCancel}>Cancel</button></div>
    <label>Pin name<input autoFocus required maxLength={MAX_PIN_NAME_LENGTH} value={name} onChange={event => setName(event.target.value)} /></label>
    <label>Notes<textarea maxLength={2000} rows={4} value={notes} onChange={event => setNotes(event.target.value)} placeholder="What would you like to remember?" /></label>
    <div className="decor-map__coordinates">
      <label>Latitude<input inputMode="decimal" value={lat} onChange={event => setLat(event.target.value)} /></label>
      <label>Longitude<input inputMode="decimal" value={lng} onChange={event => setLng(event.target.value)} /></label>
    </div>
    <fieldset><legend>Decor categories (optional)</legend><div className="decor-map__pin-categories">
      {MAP_CATEGORIES.map(category => <label key={category.id}><input type="checkbox" checked={categories.includes(category.id)}
        onChange={() => setCategories(previous => previous.includes(category.id) ? previous.filter(id => id !== category.id) : [...previous, category.id])} />
        <CategoryIcon categoryId={category.id} /><span>{category.label}</span></label>)}
    </div></fieldset>
    {draft.osmId && <a href={`https://www.openstreetmap.org/${draft.osmId}`} target="_blank" rel="noopener noreferrer">Original OSM place ↗</a>}
    {error && <p role="alert" className="decor-map__error">{error}</p>}
    <button className="decor-map__primary" type="submit">Save pin</button>
    <p className="decor-map__hint">Saved in this browser. Export pins for a backup or to move them to another device.</p>
    {draft.id && (confirmDelete ? <div className="decor-map__delete-confirm" role="group" aria-label="Confirm pin deletion">
      <p>Delete “{name}”?</p><button type="button" onClick={() => onDelete(draft.id)}>Delete pin</button>
      <button type="button" onClick={() => setConfirmDelete(false)}>Keep pin</button>
    </div> : <button className="decor-map__danger" type="button" onClick={() => setConfirmDelete(true)}>Delete pin…</button>)}
  </form>;
}
