import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { startSetConfetti } from "./setConfetti.js";
import "./set-completion.css";

function burstOrigin(sets) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const rect = sets.map(set => document.querySelector(`[data-decor-set="${set.id}"]`)?.getBoundingClientRect())
    .find(box => box && box.top < height - 80 && box.bottom > 80);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  return rect ? {
    left: clamp(rect.left + 24, 24, width - 48),
    right: clamp(rect.right - 24, 48, width - 24),
    y: clamp(rect.top + 30, 140, height - 100),
  } : { left: width * .2, right: width * .8, y: height * .4 };
}

export default function SetCompletionCelebration({ completion, onFinish }) {
  const canvas = useRef(null);
  useEffect(() => {
    if (!completion) return;
    const finish = () => onFinish(completion.id);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Keep the short accessible message, but skip particles for reduced motion.
    const stop = media.matches ? () => {} : startSetConfetti(canvas.current, burstOrigin(completion.sets), finish);
    const timer = window.setTimeout(finish, 2400);
    const onMotionChange = () => { if (media.matches) stop(); };
    media.addEventListener("change", onMotionChange);
    return () => {
      stop();
      window.clearTimeout(timer);
      media.removeEventListener("change", onMotionChange);
    };
  }, [completion, onFinish]);

  if (!completion) return null;
  const label = completion.sets.length === 1
    ? `${completion.sets[0].label} set complete!`
    : `${completion.sets.length} decor sets complete!`;
  return createPortal(
    <div className="set-completion" key={completion.id}>
      <canvas ref={canvas} className="set-completion__canvas" aria-hidden="true" />
      <div className="set-completion__message" role="status" aria-live="polite" aria-atomic="true">
        <span aria-hidden="true">✦</span> {label}
      </div>
    </div>, document.body);
}
