import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('the camera crosses physical arches, keeps the floor grounded and reverses the same path', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('[data-magic-bunny]')).toHaveCount(0);
  const samples = [];
  for (const progress of [.865, .9, .935, .99, .935, .9, .865]) {
    await goWorld(page, progress);
    samples.push(await world.evaluate(el => el.atriumDiagnostics()));
  }
  expect(samples[0].camera[2] - samples[3].camera[2]).toBeGreaterThan(35);
  expect(samples[0].arches.filter(a => a.foot.behind)).toHaveLength(0);
  expect(samples[3].arches.filter(a => a.foot.behind)).toHaveLength(2);
  for (const s of samples) expect(s.floorY).toBe(0);
  for (const [a, b] of [[0, 6], [1, 5], [2, 4]]) {
    expect(samples[a].camera[2]).toBeCloseTo(samples[b].camera[2], 1);
    expect(samples[a].anchors['door-drink'].x).toBeCloseTo(samples[b].anchors['door-drink'].x, 0);
  }
  // The lectern is nearer than the signs: it grows faster while approaching.
  const travel = [samples[1], samples[2]].map(s => ({
    near: Math.abs(720 - s.anchors.lectern.x), far: Math.abs(720 - s.anchors['door-drink'].x),
  }));
  expect(travel[1].near / travel[0].near).toBeGreaterThan(travel[1].far / travel[0].far);
  await goWorld(page, 1.2);
  const frames = await world.evaluate(el => el.atriumDiagnostics().frames);
  await page.waitForTimeout(350);
  expect(await world.evaluate(el => el.atriumDiagnostics().frames)).toBe(frames);
});

test('the lectern controls follow the painted support, survive resize and restore from context loss', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  for (const [width, height] of [[1440, 900], [2559, 1303], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await goWorld(page, 1);
    const d = await world.evaluate(el => el.atriumDiagnostics());
    for (const control of await page.locator('[data-atrium-anchor]').all()) {
      const key = await control.getAttribute('data-atrium-anchor'), box = await control.boundingBox();
      expect(Math.abs(box.x + box.width / 2 - d.anchors[key].x)).toBeLessThan(2);
      expect(Math.abs(box.y + box.height / 2 - d.anchors[key].y)).toBeLessThan(2);
    }
    const trigger = page.locator('[data-atrium-directory]').getByRole('button', { name: 'Mapa de la plaza' });
    await trigger.click();
    await expect(page.getByRole('dialog')).toContainText('Al fondo te esperan los tres escaparates');
    expect((await page.locator('[data-stage]').boundingBox()).y).toBe(0);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  }
  await world.locator('canvas').evaluate(canvas => {
    canvas.loss = canvas.getContext('webgl2').getExtension('WEBGL_lose_context'); canvas.loss.loseContext();
  });
  await expect(world).toHaveAttribute('data-renderer', 'fallback');
  await expect(world.locator('img')).toBeVisible();
  await page.getByRole('navigation', { name: 'Directorio de la plaza' }).getByRole('link', { name: /Magic Drink/ }).click({ trial: true });
  await world.locator('canvas').evaluate(canvas => canvas.loss.restoreContext());
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(world).toHaveAttribute('data-renderer', 'fallback');
  const directory = page.locator('[data-atrium-directory]');
  await directory.scrollIntoViewIfNeeded();
  await directory.getByRole('button', { name: 'Mapa de la plaza' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
});

test('unavailable architectural artwork leaves a navigable static plaza', async ({ page }) => {
  await page.route('**/atrium-facade-v18.webp', route => route.abort());
  await openLanding(page, '#directorio-wonderpop');
  await expect(page.locator('[data-atrium-engine]')).toHaveAttribute('data-renderer', 'fallback');
  await page.getByRole('navigation', { name: 'Directorio de la plaza' }).getByRole('link', { name: /Hexy/ }).click();
  await expect(page.locator('[data-world-scene="gallery"]').getByRole('button', { name: 'Hexy', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
