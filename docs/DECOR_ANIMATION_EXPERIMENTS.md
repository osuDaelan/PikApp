# Decor animation experiments

These are PikApp's own UI experiments on the Restaurant → Chef Hat → Red image pilot. Each uses one complete PNG; body and hat move together. Retired styles stay in this document for reference and are not imported by the app.

## 01 — Pop and sway (retired October 18, 2026)

The first style: a curious lean on hover or keyboard focus, a celebratory lift with a fading gold ring and a drawn checkmark on collection, and a gentle settle on removal. No continuous idle loop. Reduced-motion preferences disable motion, and loading saved progress does not replay the celebration.

- Hover/focus: −2px vertical offset, −3° rotation, 1.03× scale; 240ms transition, pivot at 50% 90%.
- Collect: 620ms lift, peaking at −6px / −3° / 1.07×; gold ring expands over 560ms; check draws over 260ms after a 130ms delay.
- Uncollect: 380ms settle with a small lean and vertical dip.
- Image opacity and saturation transition over 260ms.
- Decision: logged for comparison and removed from the running app at the user's request. No final style chosen.

### Exact source snapshot

To restore this experiment, replace the three files below with their snapshots. Base tile CSS, PNG mapping, storage, and collection IDs do not need changes. These fenced blocks are archived reference text, not active application code.

#### src/features/decor/DecorImageTile.jsx

~~~jsx
import React, { useState } from "react";
import { decorImageUrl } from "./decorImages.js";
import useDecorTileMotion from "./useDecorTileMotion.js";
import "./decor-image-tile.css";
import "./decor-tile-motion.css";

export default function DecorImageTile({ image, color, label, collected, onToggle }) {
  const [failedSource, setFailedSource] = useState(null);
  const motion = useDecorTileMotion(collected);
  const src = decorImageUrl(image, import.meta.env.BASE_URL);
  return (
    <button type="button" className="decor-image-tile" aria-label={label} {...motion}
      aria-pressed={collected} onClick={onToggle}
      title={`${label} · ${collected ? "Collected — click to uncollect" : "Not collected — click to collect"}`}>
      <span className="decor-image-tile__halo" aria-hidden="true" />
      <span className="decor-image-tile__status" aria-hidden="true">
        {collected
          ? <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path className="decor-image-tile__check" d="M3 8.5 6.3 12 13 4" pathLength="1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          : "+"}
      </span>
      <span className="decor-image-tile__art">
        {failedSource === src
          ? <span className="decor-image-tile__fallback" aria-hidden="true">{color[0]}</span>
          : <img src={src} alt={image.alt} width={153} height={361} loading="lazy" decoding="async"
              onError={() => setFailedSource(src)} />}
      </span>
      <span className="decor-image-tile__label">{color}</span>
    </button>
  );
}
~~~

#### src/features/decor/useDecorTileMotion.js

~~~js
import { useEffect, useRef, useState } from "react";

// Experimental presentation only. No collection/storage logic belongs here.
export default function useDecorTileMotion(collected) {
  const previous = useRef(collected);
  const [motion, setMotion] = useState("");

  useEffect(() => {
    if (previous.current === collected) return;
    previous.current = collected;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMotion("");
      return;
    }
    setMotion(collected ? "collect" : "release");
  }, [collected]);

  return {
    "data-motion": motion || undefined,
    onAnimationEnd(event) {
      if (event.target.classList.contains("decor-image-tile__art")
          && ["chef-proud", "chef-settle"].includes(event.animationName)) {
        setMotion("");
      }
    },
  };
}
~~~

#### src/features/decor/decor-tile-motion.css

~~~css
/* Experimental style: remove this import + useDecorTileMotion to return to static tiles. */
.decor-image-tile__art {
  position: relative;
  transform-origin: 50% 90%;
  transform: translateY(var(--chef-y, 0px)) rotate(var(--chef-lean, 0deg)) scale(var(--chef-scale, 1));
  transition: transform 240ms ease-out;
}
.decor-image-tile__art img { transition: opacity 260ms ease, filter 260ms ease; }
.decor-image-tile__halo {
  position: absolute; left: 50%; bottom: 30px; width: 42px; height: 42px;
  margin-left: -21px; border: 2px solid #e6bc55; border-radius: 50%;
  background: radial-gradient(circle, #fff4c080, #fff4c000 70%);
  opacity: 0; pointer-events: none;
}
.decor-image-tile__halo::before, .decor-image-tile__halo::after {
  content: ""; position: absolute; width: 4px; height: 4px; background: #d9a538;
  border-radius: 1px; transform: rotate(45deg);
}
.decor-image-tile__halo::before { top: -8px; left: 2px; }
.decor-image-tile__halo::after { top: 7px; right: -8px; }
.decor-image-tile:focus-visible { --chef-y: -2px; --chef-lean: -3deg; --chef-scale: 1.03; }
@media (hover: hover) and (pointer: fine) {
  .decor-image-tile:hover { --chef-y: -2px; --chef-lean: -3deg; --chef-scale: 1.03; }
}
.decor-image-tile[data-motion="collect"] .decor-image-tile__art { animation: chef-proud 620ms ease-out; }
.decor-image-tile[data-motion="release"] .decor-image-tile__art { animation: chef-settle 380ms ease-out; }
.decor-image-tile[data-motion="collect"] .decor-image-tile__halo { animation: chef-halo 560ms ease-out; }
.decor-image-tile[data-motion="collect"] .decor-image-tile__check {
  stroke-dasharray: 1; animation: chef-check 260ms 130ms ease-out both;
}
@keyframes chef-proud {
  0% { transform: translateY(2px) rotate(2deg) scale(.98); }
  42% { transform: translateY(-6px) rotate(-3deg) scale(1.07); }
  72% { transform: translateY(-3px) rotate(1deg) scale(1.03); }
  100% { transform: translateY(var(--chef-y, 0px)) rotate(var(--chef-lean, 0deg)) scale(var(--chef-scale, 1)); }
}
@keyframes chef-settle {
  0% { transform: translateY(-3px) rotate(-2deg); }
  60% { transform: translateY(2px) rotate(1deg); }
  100% { transform: translateY(var(--chef-y, 0px)) rotate(var(--chef-lean, 0deg)) scale(var(--chef-scale, 1)); }
}
@keyframes chef-halo {
  0% { opacity: 0; transform: scale(.45); }
  28% { opacity: .85; }
  100% { opacity: 0; transform: scale(1.6); }
}
@keyframes chef-check {
  from { stroke-dashoffset: 1; }
  to { stroke-dashoffset: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .decor-image-tile__art { transform: none !important; }
  .decor-image-tile__art, .decor-image-tile__halo, .decor-image-tile__check { animation: none !important; }
  .decor-image-tile__art, .decor-image-tile__art img { transition: none; }
}
~~~
## 02 — Float and turn (retired October 18, 2026)

Collected artwork floats gently 4px above a soft ground shadow on a 3.6-second loop. Hover/focus pauses the float and angles the flat image with CSS perspective. Collecting plays a 720ms left/right turn; removing collection plays a 420ms turn back. The checkmark stays static. There is no gold ring, checkmark drawing, or pop-and-sway sequence.

Only the Red Chef Hat image pilot currently uses this style. Reduced-motion preferences disable the loop, turns, and transitions. Collection and persistence behavior are unchanged; initial saved state does not trigger the selection turn (a saved collected image can still float). The current implementation remains in `src/features/decor/decor-tile-motion.css` and `useDecorTileMotion.js`, with the shadow markup in `DecorImageTile.jsx`. This is motion of a flat PNG, not a rig or a rotatable 3D Pikmin model.

Decision: user disliked this style; replaced with a subtle screenward pop and flash. Exact source archived below.


### Exact source snapshot

#### src/features/decor/DecorImageTile.jsx

~~~jsx
import React, { useState } from "react";
import { decorImageUrl } from "./decorImages.js";
import useDecorTileMotion from "./useDecorTileMotion.js";
import "./decor-image-tile.css";
import "./decor-tile-motion.css";

export default function DecorImageTile({ image, color, label, collected, onToggle }) {
  const [failedSource, setFailedSource] = useState(null);
  const motion = useDecorTileMotion(collected);
  const src = decorImageUrl(image, import.meta.env.BASE_URL);
  return (
    <button type="button" className="decor-image-tile" aria-label={label} {...motion}
      aria-pressed={collected} onClick={onToggle}
      title={`${label} · ${collected ? "Collected — click to uncollect" : "Not collected — click to collect"}`}>
      <span className="decor-image-tile__shadow" aria-hidden="true" />
      <span className="decor-image-tile__status" aria-hidden="true">
        {collected
          ? <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5 6.3 12 13 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          : "+"}
      </span>
      <span className="decor-image-tile__art">
        {failedSource === src
          ? <span className="decor-image-tile__fallback" aria-hidden="true">{color[0]}</span>
          : <img src={src} alt={image.alt} width={153} height={361} loading="lazy" decoding="async"
              onError={() => setFailedSource(src)} />}
      </span>
      <span className="decor-image-tile__label">{color}</span>
    </button>
  );
}
~~~

#### src/features/decor/useDecorTileMotion.js

~~~js
import { useEffect, useRef, useState } from "react";

// Experimental presentation only. No collection/storage logic belongs here.
export default function useDecorTileMotion(collected) {
  const previous = useRef(collected);
  const [motion, setMotion] = useState("");

  useEffect(() => {
    if (previous.current === collected) return;
    previous.current = collected;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMotion("");
      return;
    }
    setMotion(collected ? "collect" : "release");
  }, [collected]);

  return {
    "data-motion": motion || undefined,
    onAnimationEnd(event) {
      if (event.target.classList.contains("decor-image-tile__art")
          && ["chef-turn", "chef-return"].includes(event.animationName)) {
        setMotion("");
      }
    },
  };
}
~~~

#### src/features/decor/decor-tile-motion.css

~~~css
/* Trial 02: Float and turn. Retired styles are archived in docs/DECOR_ANIMATION_EXPERIMENTS.md. */
.decor-image-tile__art {
  position: relative;
  transform-origin: 50% 75%;
}
.decor-image-tile__art img {
  transition: opacity 260ms ease, filter 260ms ease, transform 280ms ease;
}
.decor-image-tile__shadow {
  position: absolute; left: 50%; bottom: 21px; width: 24px; height: 5px;
  margin-left: -12px; border-radius: 50%; pointer-events: none;
  background: #38533b; opacity: .12; filter: blur(2px);
}
.decor-image-tile[aria-pressed="true"] .decor-image-tile__art {
  animation: chef-float 3600ms ease-in-out infinite;
}
.decor-image-tile[aria-pressed="true"] .decor-image-tile__shadow {
  animation: chef-shadow 3600ms ease-in-out infinite;
}
.decor-image-tile:focus-visible .decor-image-tile__art img {
  transform: perspective(240px) rotateY(-16deg) rotateX(4deg);
}
.decor-image-tile:focus-visible .decor-image-tile__art,
.decor-image-tile:focus-visible .decor-image-tile__shadow { animation-play-state: paused; }
@media (hover: hover) and (pointer: fine) {
  .decor-image-tile:hover .decor-image-tile__art img {
    transform: perspective(240px) rotateY(-16deg) rotateX(4deg);
  }
  .decor-image-tile:hover .decor-image-tile__art,
  .decor-image-tile:hover .decor-image-tile__shadow { animation-play-state: paused; }
}
.decor-image-tile[data-motion="collect"] .decor-image-tile__art {
  animation: chef-turn 720ms ease-in-out;
  animation-play-state: running;
}
.decor-image-tile[data-motion="release"] .decor-image-tile__art {
  animation: chef-return 420ms ease-out;
  animation-play-state: running;
}
@keyframes chef-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes chef-shadow {
  0%, 100% { transform: scaleX(1); opacity: .18; }
  50% { transform: scaleX(.7); opacity: .09; }
}
@keyframes chef-turn {
  0% { transform: perspective(240px) rotateY(0); }
  35% { transform: perspective(240px) rotateY(-38deg); }
  72% { transform: perspective(240px) rotateY(22deg); }
  100% { transform: perspective(240px) rotateY(0); }
}
@keyframes chef-return {
  0% { transform: perspective(240px) rotateY(22deg); }
  100% { transform: perspective(240px) rotateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .decor-image-tile__art, .decor-image-tile__shadow { animation: none !important; }
  .decor-image-tile__art, .decor-image-tile__art img { transform: none !important; }
  .decor-image-tile__art img { transition: none; }
}
~~~

## 03 — Soft pop and flash (retired October 18, 2026)

Requested direction: a subtle pop toward the screen with a flash. Collecting enlarges the artwork to 1.075×, then returns it to normal over 360ms, with a single soft white/gold radial flash behind it over 300ms. Uncollecting uses a restrained 220ms 0.985× scale dip. No rotation, floating loop, or ground shadow. The checkmark stays static. Reduced-motion preferences disable both the pop and flash, and saved progress does not replay the effect on initial load.

Only the Red Chef Hat image pilot is affected. CSS animates the complete PNG as one piece. Collection IDs, persistence, and layout are unchanged. Presentation remains isolated in `src/features/decor/decor-tile-motion.css` and `useDecorTileMotion.js`, with the flash markup in `DecorImageTile.jsx`. Decision: user clarified that the flash should be a small confetti ring; replaced the radial glow. Exact source archived below.


### Exact source snapshot

#### src/features/decor/DecorImageTile.jsx

~~~jsx
import React, { useState } from "react";
import { decorImageUrl } from "./decorImages.js";
import useDecorTileMotion from "./useDecorTileMotion.js";
import "./decor-image-tile.css";
import "./decor-tile-motion.css";

export default function DecorImageTile({ image, color, label, collected, onToggle }) {
  const [failedSource, setFailedSource] = useState(null);
  const motion = useDecorTileMotion(collected);
  const src = decorImageUrl(image, import.meta.env.BASE_URL);
  return (
    <button type="button" className="decor-image-tile" aria-label={label} {...motion}
      aria-pressed={collected} onClick={onToggle}
      title={`${label} · ${collected ? "Collected — click to uncollect" : "Not collected — click to collect"}`}>
      <span className="decor-image-tile__flash" aria-hidden="true" />
      <span className="decor-image-tile__status" aria-hidden="true">
        {collected
          ? <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8.5 6.3 12 13 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          : "+"}
      </span>
      <span className="decor-image-tile__art">
        {failedSource === src
          ? <span className="decor-image-tile__fallback" aria-hidden="true">{color[0]}</span>
          : <img src={src} alt={image.alt} width={153} height={361} loading="lazy" decoding="async"
              onError={() => setFailedSource(src)} />}
      </span>
      <span className="decor-image-tile__label">{color}</span>
    </button>
  );
}
~~~

#### src/features/decor/useDecorTileMotion.js

~~~js
import { useEffect, useRef, useState } from "react";

// Experimental presentation only. No collection/storage logic belongs here.
export default function useDecorTileMotion(collected) {
  const previous = useRef(collected);
  const [motion, setMotion] = useState("");

  useEffect(() => {
    if (previous.current === collected) return;
    previous.current = collected;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMotion("");
      return;
    }
    setMotion(collected ? "collect" : "release");
  }, [collected]);

  return {
    "data-motion": motion || undefined,
    onAnimationEnd(event) {
      if (event.target.classList.contains("decor-image-tile__art")
          && ["chef-soft-pop", "chef-soft-release"].includes(event.animationName)) {
        setMotion("");
      }
    },
  };
}
~~~

#### src/features/decor/decor-tile-motion.css

~~~css
/* Trial 03: Soft pop and flash. Retired styles are archived in docs/DECOR_ANIMATION_EXPERIMENTS.md. */
.decor-image-tile__art {
  position: relative;
  transform-origin: 50% 55%;
}
.decor-image-tile__art img { transition: opacity 180ms ease, filter 180ms ease; }
.decor-image-tile__flash {
  position: absolute; inset: 6px 4px 20px; border-radius: 50%;
  pointer-events: none; opacity: 0;
  background: radial-gradient(ellipse, #fff 0%, #fff9dc 35%, #fff3bf00 72%);
}
.decor-image-tile[data-motion="collect"] .decor-image-tile__art {
  animation: chef-soft-pop 360ms cubic-bezier(.2, .65, .3, 1);
}
.decor-image-tile[data-motion="collect"] .decor-image-tile__flash {
  animation: chef-soft-flash 300ms ease-out;
}
.decor-image-tile[data-motion="release"] .decor-image-tile__art {
  animation: chef-soft-release 220ms ease-out;
}
@keyframes chef-soft-pop {
  0%, 100% { transform: scale(1); }
  38% { transform: scale(1.075); }
}
@keyframes chef-soft-flash {
  0% { opacity: 0; transform: scale(.88); }
  28% { opacity: .6; }
  100% { opacity: 0; transform: scale(1.08); }
}
@keyframes chef-soft-release {
  0%, 100% { transform: scale(1); }
  40% { transform: scale(.985); }
}
@media (prefers-reduced-motion: reduce) {
  .decor-image-tile__art, .decor-image-tile__flash { animation: none !important; }
  .decor-image-tile__art img { transition: none; }
}
~~~

## 04 — Soft pop and confetti ring (active for regular tiles, October 18, 2026)

Collecting keeps the subtle 1.075× screenward scale pop, now over 400ms, and replaces the glow with eight tiny pastel confetti pieces. The pieces start in a small ring around the artwork and spread from 12px to 29px radius, fading over 380ms. No repeated bursts, radial light flash, idle loop, or rotation of the Pikmin. Uncollecting keeps the 220ms scale dip.

Approved by the user, first expanded to all eight standard Chef Hat colors, then applied to all 896 existing checklist image entries on October 18, 2026. Reduced-motion preferences disable the pop and confetti. Initial load does not replay the selection effect, and collection/storage behavior stays unchanged. Confetti markup now exists only during a burst; memoized tiles skip unchanged collection rerenders. Implementation: `src/features/decor/decor-tile-motion.css`, `DecorImageTile.jsx`, and `useDecorTileMotion.js`. Archive the current source here before replacing it.

## 05 — In-game celebration reference (additive, October 19, 2026)

Regular tiles keep style 04. Rare costumes replace its confetti ring with five white, blue-glowing stars and three gold glints, retaining the small pop with a longer 720ms envelope. Separately, completing an entire costume row produces two sprays of falling confetti/sparkles on one temporary canvas. Both are based on the user's supplied recording and skip motion when reduced motion is requested. Neither replays for saved completed progress. Full behavior, source references, tuning points, and checks are in [Decor celebration effects](DECOR_CELEBRATIONS.md). These effects are active for review and can be revised independently of storage.
