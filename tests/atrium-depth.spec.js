import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('independent rigid cels separate in depth without stretching the illustration', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await page.mouse.move(720, 450);
  await page.waitForTimeout(400);
  const initial = await world.evaluate(el => el.atriumDiagnostics);
  expect(initial.source).toBe('wonderpop-atrium-v15.webp');
  expect(initial.technique).toBe('independent-transparent-planes');
  expect(initial.layers.length).toBeGreaterThanOrEqual(17);
  expect(new Set(initial.layers.map(layer => layer.asset)).size).toBe(initial.layers.length);
  for (const progress of [.87, .96, 1.02, .96]) {
    await goWorld(page, progress);
    expect((await world.evaluate(el => el.atriumDiagnostics.camera))[2]).toBe(initial.camera[2]);
    await expect(page.locator('[data-world-copy="interior"]')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-world-copy="interior"] a')).toHaveAttribute('href', '/wonderpop-plaza');
  }
  const scroll = await page.evaluate(() => scrollY);
  await page.mouse.move(1350, 700);
  await expect.poll(() => world.evaluate(el => Math.abs(el.atriumDiagnostics.camera[0]))).toBeGreaterThan(.15);
  const moved = await world.evaluate(el => el.atriumDiagnostics);
  expect(Math.abs(moved.nearShift)).toBeGreaterThan(Math.abs(moved.layers.find(layer => layer.id === 'gallery-left').shift[0]) * 2);
  expect(Math.abs(moved.farShift)).toBeGreaterThan(0);
  expect(Math.abs(moved.nearShift)).toBeGreaterThan(Math.abs(moved.farShift) * 3);
  for (const layer of moved.layers) {
    if (layer.floorPlane) continue;
    const before = initial.layers.find(item => item.id === layer.id);
    expect(layer.projected[2] - layer.projected[0]).toBeCloseTo(before.projected[2] - before.projected[0], 3);
    expect(layer.projected[1] - layer.projected[3]).toBeCloseTo(before.projected[1] - before.projected[3], 3);
  }
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await goWorld(page, 1.25);
  await page.waitForTimeout(100);
  const frames = await world.evaluate(el => el.atriumDiagnostics.frames);
  await page.waitForTimeout(200);
  expect(await world.evaluate(el => el.atriumDiagnostics.frames)).toBe(frames);
});

test('missing a structural cel retains the complete original illustration and readable information', async ({ page }) => {
  await page.route('**/atrium-gallery-left-v*.webp', route => route.abort());
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'fallback');
  await expect(world.locator('img')).toBeVisible();
  await expect(page.locator('[data-world-copy="interior"]')).toHaveCSS('opacity', '1');
  await goWorld(page, 1.25);
  await expect(page.locator('[data-keepsake="bunny"]')).toBeVisible();
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
