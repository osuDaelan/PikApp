const COLORS = ["#ffd84d", "#f59bc0", "#d0e85b", "#90d8b0", "#8acfe9", "#fff8ce"];
const DURATION = 2200;

// One short-lived canvas, bounded particles, and no animation work between completions.
export function startSetConfetti(canvas, origin, onComplete) {
  const ctx = canvas.getContext("2d");
  if (!ctx) { onComplete(); return () => {}; }
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);

  const count = width < 600 ? 76 : 112;
  const particles = Array.from({ length: count }, (_, i) => {
    const side = i % 2;
    return {
      x: side ? origin.right : origin.left,
      y: origin.y,
      vx: (side ? -1 : 1) * (65 + Math.random() * 235),
      vy: -(180 + Math.random() * 280),
      w: 3 + Math.random() * 2,
      h: 5 + Math.random() * 5,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * 10,
      phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(i / 2) % COLORS.length],
      delay: Math.random() * 90,
    };
  });
  const sparkles = Array.from({ length: 9 }, (_, i) => ({
    x: origin.left + Math.random() * (origin.right - origin.left),
    y: origin.y - 60 + Math.random() * 100,
    size: 4 + Math.random() * 5,
    delay: 80 + i * 85,
  }));

  let frame;
  let stopped = false;
  let start;
  let last;
  function stop() {
    stopped = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", finish);
    document.removeEventListener("visibilitychange", onVisibility);
    ctx.clearRect(0, 0, width, height);
  }
  function finish() {
    if (stopped) return;
    stop();
    onComplete();
  }
  function onVisibility() { if (document.hidden) finish(); }
  function draw(now) {
    if (stopped) return;
    start ??= now;
    const elapsed = now - start;
    const dt = Math.min((now - (last ?? now)) / 1000, .033);
    last = now;
    if (elapsed >= DURATION) { finish(); return; }
    ctx.clearRect(0, 0, width, height);
    const fade = Math.min(1, (DURATION - elapsed) / 700);
    for (const p of particles) {
      if (elapsed < p.delay) continue;
      p.vy += 510 * dt;
      p.vx *= Math.exp(-.55 * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.angle += p.spin * dt;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(1, .25 + .75 * Math.abs(Math.cos(elapsed / 135 + p.phase)));
      ctx.globalAlpha = Math.min(1, (elapsed - p.delay) / 55) * fade;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    for (const s of sparkles) {
      const age = (elapsed - s.delay) / 520;
      if (age <= 0 || age >= 1) continue;
      const size = s.size * Math.sin(age * Math.PI);
      ctx.globalAlpha = Math.sin(age * Math.PI) * .85;
      ctx.fillStyle = "#e9c65a";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - size);
      ctx.lineTo(s.x + size * .24, s.y - size * .24);
      ctx.lineTo(s.x + size, s.y);
      ctx.lineTo(s.x + size * .24, s.y + size * .24);
      ctx.lineTo(s.x, s.y + size);
      ctx.lineTo(s.x - size * .24, s.y + size * .24);
      ctx.lineTo(s.x - size, s.y);
      ctx.lineTo(s.x - size * .24, s.y - size * .24);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }
  window.addEventListener("resize", finish);
  document.addEventListener("visibilitychange", onVisibility);
  frame = requestAnimationFrame(draw);
  return stop;
}
