import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('the camera passes fixed lamp rows and keeps WonderPop grounded across wide and portrait views', async ({ page }) => {
  await openLanding(page);
  const garden = page.locator('[data-garden-world]');
  await expect(garden.locator('canvas')).toHaveCount(0);
  for (const viewport of [{ width: 2559, height: 1304 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    let previous;
    for (const p of [.635, .68, .735, .77, .80]) {
      await goWorld(page, p);
      await expect(garden).toHaveAttribute('data-renderer', 'webgl');
      const view = await garden.evaluate(el => el.gardenDiagnostics());
      expect(view.buildingFoot.x).toBeCloseTo(.5, 2);
      expect(view.buildingFoot.y).toBeGreaterThan(.65);
      expect(view.buildingFoot.y).toBeLessThan(1.05);
      expect(view.lamps).toHaveLength(28);
      if (previous) {
        expect(view.camera[2]).toBeLessThan(previous.camera[2]);
        expect(view.lamps.map(lamp => lamp.z)).toEqual(previous.lamps.map(lamp => lamp.z));
        const passed = state => state.lamps.filter(lamp => lamp.z > state.camera[2]).length;
        expect(passed(view)).toBeGreaterThan(passed(previous));
      }
      previous = view;
    }
    await goWorld(page, .68);
    const before = await garden.evaluate(el => el.gardenDiagnostics());
    await page.waitForTimeout(180);
    const after = await garden.evaluate(el => el.gardenDiagnostics());
    expect(after.camera).toEqual(before.camera);
    expect(after.frames).toBeGreaterThan(before.frames);
    await goWorld(page, .313);
    const stopped = await garden.evaluate(el => el.gardenDiagnostics().frames);
    await page.waitForTimeout(150);
    expect(await garden.evaluate(el => el.gardenDiagnostics().frames)).toBe(stopped);
  }
});

test('a missing garden texture retains the complete illustration and does not block following chapters', async ({ page }) => {
  await page.route('**/garden-tree-v10.webp', route => route.abort());
  await openLanding(page);
  await goWorld(page, .68);
  const garden = page.locator('[data-garden-world]');
  await expect(garden).toHaveAttribute('data-renderer', 'fallback');
  await garden.locator('img[src*="garden-static"]').evaluate(image => image.decode());
  await expect(page.locator('[data-world-copy="plaza"]')).toBeVisible();
  await goWorld(page, .878);
  await expect(page.locator('[data-world-copy="interior"]')).toBeVisible();
});

test('context loss and reduced motion show the still garden without rendering or trapping scroll', async ({ page }) => {
  await openLanding(page);
  await goWorld(page, .68);
  const garden = page.locator('[data-garden-world]');
  await expect(garden).toHaveAttribute('data-renderer', 'webgl');
  await garden.locator('canvas').evaluate(canvas => {
    window.gardenTestContext = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
    window.gardenTestContext.loseContext();
  });
  await expect(garden).toHaveAttribute('data-renderer', 'fallback');
  await garden.locator('img[src*="garden-static"]').evaluate(image => image.decode());
  await page.waitForTimeout(100);
  await page.evaluate(() => window.gardenTestContext.restoreContext());
  await expect(garden).toHaveAttribute('data-renderer', 'webgl');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(garden).toHaveAttribute('data-renderer', 'fallback');
  const before = await garden.evaluate(el => el.gardenDiagnostics().frames);
  await page.waitForTimeout(150);
  expect(await garden.evaluate(el => el.gardenDiagnostics().frames)).toBe(before);
  await expect(page.locator('[data-world-copy="plaza"]')).toBeVisible();
});

test('audience layers are opaque and opening chapters have no full-screen side curtains', async ({ page }) => {
  await openLanding(page);
  for (const viewport of [{ width: 2559, height: 1304 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const p of [0, .162, .313]) {
      await goWorld(page, p);
      const overlays = await page.locator('[data-shade="left"],[data-shade="right"]').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundImage));
      expect(overlays).toEqual(['none', 'none']);
    }
    await goWorld(page, .49);
    await expect(page.locator('[data-crowd-far]')).toHaveCount(0);
    const opacity = await page.locator('[data-audience-row]').evaluateAll(rows => rows.map(row => getComputedStyle(row).opacity));
    expect(opacity).toEqual(['1', '1', '1', '1']);
  }
});
