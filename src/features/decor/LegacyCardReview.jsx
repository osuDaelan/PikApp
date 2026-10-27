import React from "react";
import { pendingLegacyCards } from "./legacyCards.js";

export default function LegacyCardReview({ collected, onReviewed }) {
  const pending = pendingLegacyCards(collected);
  if (!pending.length) return null;
  return <details style={{ marginTop: 12, padding: 12, border: "1px solid #d5dfca", borderRadius: 10, background: "#f4f8ed", fontSize: 12, lineHeight: 1.5 }}>
    <summary style={{ cursor: "pointer", fontWeight: 800 }}>Review {pending.length} previous card selections</summary>
    <p>Cards now have separate checkboxes for every design. Your previous selections are saved below, but did not specify which designs you owned. Check the individual cards you own, then mark this review complete.</p>
    <ul>{pending.map(entry => <li key={entry.id}>{entry.costume} · {entry.color}</li>)}</ul>
    <p>Totals count individual designs only. Completing this review clears the old grouped marks; it does not change your individual card selections.</p>
    <button type="button" style={{ font: "inherit", fontWeight: 700, color: "#245937", background: "#fff", border: "1px solid #bed4b4", borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}
      onClick={() => onReviewed(pending.map(entry => entry.id))}>Mark previous card selections reviewed</button>
  </details>;
}
