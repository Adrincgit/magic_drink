import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';

test('the frontal stage travels left without zooming and keeps the console on its floor', async ({ page }) => {
  await openLanding(page);
  for (const size of [{ width: 2559, height: 1304 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    let previous;
    for (const p of [.422, .49, .59]) {
      await goWorld(page, p);
      const rig = await page.locator('[data-festival-rig]').boundingBox();
      if (previous) {
        expect(rig.width).toBeCloseTo(previous.width, 1);
        expect(rig.height).toBeCloseTo(previous.height, 1);
        expect(rig.y).toBeCloseTo(previous.y, 1);
        expect(rig.x).toBeLessThan(previous.x - 1);
      }
      previous = rig;
    }
  }
});

test('crowd glow sticks visibly move at rest, pause offstage and survive context loss', async ({ page }) => {
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  await openLanding(page);
  await goWorld(page, .49);
  const crowd = page.locator('[data-crowd-motion]');
  await expect(crowd).toHaveAttribute('data-renderer', 'webgl');
  await page.addStyleTag({ content: '* { animation-play-state: paused !important; transition: none !important; }' });
  // Inspect rendered audience pixels, not only the animation's clock.
  const clip = { x: 700, y: 700, width: 500, height: 190 };
  const before = await sharp(await page.screenshot({ clip })).raw().toBuffer();
  const scroll = await page.evaluate(() => scrollY);
  const transforms = await page.locator('[data-audience-row]').evaluateAll(rows => rows.map(row => row.style.transform));
  await page.waitForTimeout(460);
  const after = await sharp(await page.screenshot({ clip })).raw().toBuffer();
  let changed = 0;
  for (let i = 0; i < before.length; i++) if (Math.abs(before[i] - after[i]) > 12) changed++;
  expect(changed / before.length).toBeGreaterThan(.015);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  expect(await page.locator('[data-audience-row]').evaluateAll(rows => rows.map(row => row.style.transform))).toEqual(transforms);
  await crowd.locator('canvas').evaluate(canvas => {
    window.crowdTestContext = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
    window.crowdTestContext.loseContext();
  });
  await expect(crowd).toHaveAttribute('data-renderer', 'fallback');
  await expect(page.locator('[data-audience-row="4"] img')).toBeVisible();
  await page.waitForTimeout(100);
  await page.evaluate(() => window.crowdTestContext.restoreContext());
  await expect(crowd).toHaveAttribute('data-renderer', 'webgl');
  await goWorld(page, .68);
  const stopped = await crowd.evaluate(el => el.crowdDiagnostics().frames);
  await page.waitForTimeout(200);
  expect(await crowd.evaluate(el => el.crowdDiagnostics().frames)).toBe(stopped);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(crowd).toHaveAttribute('data-renderer', 'fallback');
  expect(errors).toEqual([]);
});

test('Hexy cycles available poses with a stationary desk and respects reduced motion', async ({ page }) => {
  await page.route('**/hexy-dj-mix-v11.webp', route => route.abort());
  await openLanding(page);
  await goWorld(page, .49);
  const dj = page.locator('[data-dj-sequence]');
  const desk = await dj.locator('[data-static-desk]').boundingBox();
  await expect.poll(() => dj.getAttribute('data-frame'), { timeout: 9000 }).toBe('2');
  expect(await dj.locator('[data-static-desk]').boundingBox()).toEqual(desk);
  expect(await dj.locator('[data-visible=true]').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  await goWorld(page, .68);
  const frame = await dj.getAttribute('data-frame');
  await page.waitForTimeout(2000);
  await expect(dj).toHaveAttribute('data-frame', frame);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(dj).toHaveAttribute('data-frame', '0');
});
