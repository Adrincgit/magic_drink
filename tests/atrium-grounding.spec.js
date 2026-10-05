import { test, expect } from '@playwright/test';
import { openLanding } from './landing.helpers';
import { readPixels, trackPatch } from './pixel-motion.helpers';

test('floor follows the same camera and keeps contacts aligned at 40 percent pointer travel', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await page.mouse.move(720, 450);
  await page.waitForTimeout(700);
  const initial = await world.evaluate(el => el.atriumDiagnostics);
  for (const [x, y] of [[60, 80], [1380, 830]]) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(800);
    const moved = await world.evaluate(el => el.atriumDiagnostics);
    const floor = moved.layers.find(l => l.id === 'floor');
    expect(floor.floorPlane).toBe(true);
    expect(Math.abs(floor.shift[0])).toBeGreaterThan(10);
    expect(Math.abs(floor.shift[1])).toBeGreaterThan(2);
    for (const layer of moved.layers.filter(l => l.grounded)) {
      expect(layer.contactError).toBeLessThan(.01);
      expect(layer.visibleFloorOpacity).toBe(1);
      const before = initial.layers.find(l => l.id === layer.id);
      // The corresponding patch of pavement and the feet must travel together.
      expect(layer.floorContact[0] - before.floorContact[0]).toBeCloseTo(layer.projected[0] - before.projected[0], 4);
      expect(layer.floorContact[1]).toBeCloseTo(layer.footY, 4);
    }
    for (const id of ['tree-left', 'tree-right', 'visitors-right', 'visitors-left', 'gallery-left', 'gallery-right']) {
      const layer = moved.layers.find(l => l.id === id), before = initial.layers.find(l => l.id === id);
      expect(Math.abs(layer.projected[1] - before.projected[1])).toBeLessThan(11);
      expect(Math.abs(layer.projected[3] - before.projected[3])).toBeLessThan(11);
      expect(Math.abs(layer.shift[1])).toBeGreaterThan(2);
    }
    expect(Math.abs(moved.camera[0])).toBeLessThanOrEqual(.38);
    expect(Math.abs(moved.camera[1])).toBeLessThanOrEqual(.1152);
    expect(Math.abs(moved.camera[1])).toBeGreaterThan(.08);
  }
});

test('visible planter rims travel with the visible pavement at pointer limits', async ({ page }, testInfo) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await page.mouse.move(720, 450);
  await page.waitForTimeout(900);
  const supports = await world.evaluate(el => el.atriumDiagnostics.layers.filter(l => l.id === 'tree-left' || l.id === 'tree-right'));
  const original = await readPixels(await page.screenshot());
  const measurements = [];
  for (const [pointerX, pointerY] of [[30, 30], [1410, 870], [720, 30], [720, 870]]) {
    await page.mouse.move(pointerX, pointerY);
    await page.waitForTimeout(1100);
    const moved = await readPixels(await page.screenshot());
    for (const tree of supports) {
      const right = tree.id === 'tree-right', x = Math.round(tree.footX), y = Math.round(tree.footY);
      // The couple overlaps the right planter's middle; use its exposed edge.
      const rim = trackPatch(original, moved, { x: x + (right ? 19 : -15), y: y - 13, w: right ? 12 : 30, h: 10 });
      const pavement = trackPatch(original, moved, { x: x + (right ? 23 : -12), y: y + 12, w: 24, h: 14 });
      const slip = Math.hypot(rim.dx - pavement.dx, rim.dy - pavement.dy);
      measurements.push({ tree: tree.id, pointer: [pointerX, pointerY], rim, pavement, slip });
      expect(rim.score).toBeGreaterThan(.9);
      expect(pavement.score).toBeGreaterThan(.9);
      // One pixel of rounding plus the slight perspective change across the
      // 25-pixel gap between samples is allowed. Old scene slipped 9–10 pixels.
      expect(slip).toBeLessThanOrEqual(2);
    }
  }
  await testInfo.attach('visible-ground-tracking', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
});

test('all three existing shopper drawings play with one fixed foot baseline', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  const read = () => world.evaluate(el => el.atriumDiagnostics.layers.find(l => l.id === 'visitors-right'));
  const before = await read();
  expect(before.asset).toBe('atrium-shoppers-v19.webp');
  const seen = new Set();
  await expect.poll(async () => {
    const layer = await read();
    expect(layer.footY).toBeCloseTo(before.footY, 4);
    seen.add(layer.pose);
    return seen.size;
  }, { timeout: 11000, intervals: [180] }).toBe(3);
});

test('the central pendant stays below the navigation on a wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 2559, height: 1311 });
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  const star = await world.evaluate(el => el.atriumDiagnostics.layers.find(l => l.id === 'star-center'));
  expect(star.bodyCenterY).toBeGreaterThan(150);
  expect(star.bodyCenterY).toBeLessThan(260);
});
