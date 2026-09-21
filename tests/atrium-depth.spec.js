import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('the original populated illustration has depth while scroll keeps the same viewpoint', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await page.mouse.move(720, 450);
  const initial = await world.evaluate(el => el.atriumDiagnostics);
  expect(initial.source).toBe('wonderpop-atrium-v15.webp');
  expect(initial.depthBands).toBeGreaterThanOrEqual(8);
  for (const progress of [.87, .96, 1.02, .96]) {
    await goWorld(page, progress);
    expect((await world.evaluate(el => el.atriumDiagnostics.camera))[2]).toBe(12);
  }
  const scroll = await page.evaluate(() => scrollY);
  await page.mouse.move(1350, 700);
  await expect.poll(() => world.evaluate(el => Math.abs(el.atriumDiagnostics.camera[0]))).toBeGreaterThan(.15);
  const moved = await world.evaluate(el => el.atriumDiagnostics);
  expect(Math.abs(moved.nearShift)).toBeGreaterThan(Math.abs(moved.farShift) * 1.4);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await goWorld(page, 1.25);
  await page.waitForTimeout(100);
  const frames = await world.evaluate(el => el.atriumDiagnostics.frames);
  await page.waitForTimeout(200);
  expect(await world.evaluate(el => el.atriumDiagnostics.frames)).toBe(frames);
});

test('context loss leaves original art visible and scrolling still reaches the boutique', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await world.locator('canvas').evaluate(canvas => {
    canvas.loss = canvas.getContext('webgl2').getExtension('WEBGL_lose_context'); canvas.loss.loseContext();
  });
  await expect(world).toHaveAttribute('data-renderer', 'fallback');
  await expect(world.locator('img')).toBeVisible();
  await world.locator('canvas').evaluate(canvas => canvas.loss.restoreContext());
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await goWorld(page, 1.25);
  await page.locator('[data-keepsake="bunny"]').click();
  await expect(page.locator('[data-keepsake-dialog]')).toBeVisible();
});
