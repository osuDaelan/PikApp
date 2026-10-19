import test from "node:test";
import assert from "node:assert/strict";
import { createSparkleLayout } from "../src/features/decor/sparkleLayout.js";

const particles = [
  { radius: 10, dx: -6, dy: -8 }, { radius: 10, dx: 7, dy: -6 },
  { radius: 10, dx: -7, dy: 5 }, { radius: 10, dx: 6, dy: 7 },
  { radius: 10, dx: 0, dy: 7 }, { radius: 7, dx: 2, dy: -6 },
  { radius: 7, dx: 5, dy: 1 }, { radius: 7, dx: -2, dy: 5 },
  ...[12, 8, 10, 7, 11, 8].map(size => ({ radius: size / 2 + 2, dy: 3 })),
];

function assertClear(layout, zone = { x: 36, y: 52, rx: 17, ry: 17 }) {
  layout.forEach(({ x, y, dx, dy }, i) => {
    const { radius } = particles[i];
    for (const progress of [0, .25, .5, .75, 1]) {
      const px = x + dx * progress, py = y + dy * progress;
      assert.ok(px - radius >= -1e-9 && px + radius <= 72 + 1e-9, "glyph stays within tile width");
      assert.ok(py - radius >= -1e-9 && py + radius <= 104 + 1e-9, "glyph avoids label and tile edges");
      const nx = Math.max(0, Math.abs(px - zone.x) - radius) / zone.rx;
      const ny = Math.max(0, Math.abs(py - zone.y) - radius) / zone.ry;
      assert.ok(nx * nx + ny * ny >= 1 - 1e-9, "whole glyph clears central oval throughout drift");
    }
  });
}

test("random star and twinkle layouts protect the Pikmin throughout their movement", () => {
  let seed = 1831;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const layouts = new Set();
  for (let burst = 0; burst < 300; burst++) {
    const layout = createSparkleLayout(particles, random);
    assert.equal(layout.length, particles.length);
    assertClear(layout);
    layouts.add(JSON.stringify(layout));
  }
  assert.equal(layouts.size, 300, "bursts use fresh layouts rather than fixed slots");
});

test("an unlucky random source still finishes outside the dead zone", () => {
  assertClear(createSparkleLayout(particles, () => .5));
});

test("stars vary around the 34px dead zone instead of the distant tile corners", () => {
  let seed = 9401;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  const quadrants = new Set();
  for (let burst = 0; burst < 100; burst++) {
    const layout = createSparkleLayout(particles, random);
    layout.forEach(({ x, y }, index) => {
      const distance = Math.hypot(x - 36, y - 52);
      assert.ok(distance >= 17 + particles[index].radius - 1e-9);
      assert.ok(distance <= 17 + particles[index].radius + 8 + 1e-9, "spawn stays in the nearby band");
      quadrants.add(`${x < 36}:${y < 52}`);
    });
    assertClear(layout);
  }
  assert.equal(quadrants.size, 4, "random placement reaches every side of the dead zone");
  createSparkleLayout(particles, () => .5).forEach(({ x, y }, index) => {
    assert.ok(Math.hypot(x - 36, y - 52) <= 17 + particles[index].radius + 8 + 1e-9,
      "fallback also stays near the dead zone");
  });
});
