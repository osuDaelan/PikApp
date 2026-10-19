// Coordinates inside a 76×120 tile's border. Leave the label below y=104 clear.
export const SPARKLE_AREA = { width: 72, height: 104 };
export const SPARKLE_DEAD_ZONE = { x: 36, y: 52, rx: 16, ry: 38 };

function clearsArtwork(x, y, radius, zone) {
  // Nearest point of the particle's bounding box to the oval's center.
  // Keeping that point outside protects the whole glyph, not just its center.
  const nx = Math.max(0, Math.abs(x - zone.x) - radius) / zone.rx;
  const ny = Math.max(0, Math.abs(y - zone.y) - radius) / zone.ry;
  return nx * nx + ny * ny >= 1;
}

export function createSparkleLayout(particles, random = Math.random, zone = SPARKLE_DEAD_ZONE) {
  const positions = [];
  return particles.map(({ radius, dx = 0, dy = 0 }) => {
    const { width, height } = SPARKLE_AREA;
    let best;
    let bestGap = -1;
    const consider = point => {
      if (!clearsArtwork(point.x, point.y, radius, zone)) return false;
      const gap = Math.min(...positions.map(p => Math.hypot(point.x - p.x, point.y - p.y)));
      if (gap > bestGap) { best = point; bestGap = gap; }
      return gap >= 12;
    };
    // Rejection sampling leaves an oval hole without fixed angular slots.
    for (let attempt = 0; attempt < 96; attempt++) {
      if (consider({ x: radius + random() * (width - 2 * radius),
        y: radius + random() * (height - 2 * radius) })) break;
    }
    // Bounded fallback for an unlucky/constant RNG; never fall into the oval.
    if (!best) {
      for (const x of [radius, width - radius]) {
        for (const y of [radius, height - radius]) consider({ x, y });
      }
    }
    const { x, y } = best;
    positions.push(best);
    // Keep the familiar drift length, directed away from the artwork and
    // shortened at the tile edge. Neither axis can move back into the oval.
    return { x, y,
      dx: Math.max(radius - x, Math.min(width - radius - x,
        Math.sign(x - zone.x) * Math.abs(dx))),
      dy: Math.max(radius - y, Math.min(height - radius - y,
        Math.sign(y - zone.y) * Math.abs(dy))),
    };
  });
}
