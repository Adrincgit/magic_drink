import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

const gallerySelector = '[data-world-scene="gallery"]';
async function arrive(page, progress) {
  await expect.poll(() => page.locator('[data-journey]').evaluate(el => Number(el.dataset.worldProgress))).toBeCloseTo(progress, 2);
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
}

test('the map selects a real showcase, locks its background and returns to the atrium', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  await arrive(page, .99);
  const button = page.locator('[data-atrium-directory]').getByRole('button', { name: 'Mapa de la plaza' });
  await button.click();
  const map = page.getByRole('dialog', { name: 'Un mundo por recorrer' });
  await expect(map).toBeVisible();
  await expect(map.locator('[aria-current="location"]')).toContainText('El atrio');
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBe(before);
  await page.keyboard.press('Escape');
  await expect(button).toBeFocused();
  await button.click();
  await map.getByRole('button', { name: /Música de Hexy/ }).click();
  await expect(map).toBeHidden();
  await arrive(page, 1.2);
  const gallery = page.locator(gallerySelector);
  await expect(gallery.getByRole('button', { name: 'Hexy', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await gallery.getByRole('button', { name: 'Escucha a Hexy' }).click();
  await expect.poll(() => page.locator('audio').evaluate(el => el.paused)).toBe(false);
  await gallery.getByRole('button', { name: 'Volver al atrio' }).click();
  await arrive(page, .99);
  await expect(page.locator('[data-atrium-directory]')).toBeVisible();
  expect(await page.locator('audio').evaluate(el => el.paused)).toBe(false);
  await page.getByRole('navigation', { name: 'Directorio de la plaza' }).getByRole('link', { name: /Magic Drink/ }).click();
  await arrive(page, 1.2);
  await expect(gallery.getByRole('button', { name: 'Magic Drink', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(gallery.getByRole('link', { name: 'Conoce Magic Drink' })).toHaveAttribute('href', '/bebidas');
});

test('showcase arrows wrap, details support Escape and WebGL has a working context-loss fallback', async ({ page }) => {
  await openLanding(page, '#galeria-wonderpop');
  const gallery = page.locator(gallerySelector), screen = gallery.locator('[data-exhibit-screen]');
  await expect(screen).toHaveAttribute('data-renderer', 'webgl');
  await gallery.getByRole('button', { name: 'Pieza anterior' }).click();
  await expect(gallery.getByRole('status')).toHaveText('Nos vemos en la plaza, 6 de 6');
  await page.keyboard.press('ArrowRight');
  await expect(gallery.getByRole('status')).toHaveText('Hexy, en miniatura, 1 de 6');
  await gallery.getByRole('button', { name: 'Siguiente pieza' }).click();
  await expect(gallery.getByRole('status')).toHaveText('Siempre cerca, 2 de 6');
  await expect.poll(() => screen.evaluate(el => el.exhibitDiagnostics().transition)).toBe(1);
  const zoom = gallery.getByRole('button', { name: 'Ver detalle: Siempre cerca' });
  await zoom.click();
  await expect(page.getByRole('dialog')).toContainText('Siempre cerca');
  expect((await page.locator('[data-stage]').boundingBox()).y).toBe(0);
  await page.keyboard.press('Escape');
  await expect(zoom).toBeFocused();
  await screen.locator('canvas').evaluate(canvas => {
    canvas.loss = canvas.getContext('webgl2').getExtension('WEBGL_lose_context');
    canvas.loss.loseContext();
  });
  await expect(screen).toHaveAttribute('data-renderer', 'fallback');
  expect(await screen.locator('img').evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  await gallery.getByRole('button', { name: 'Siguiente pieza' }).click();
  await expect(screen.locator('img')).toHaveAttribute('src', /hexy-backpack/);
  await screen.locator('canvas').evaluate(canvas => canvas.loss.restoreContext());
  await expect(screen).toHaveAttribute('data-renderer', 'webgl');
  await goWorld(page, .49);
  const frames = await screen.evaluate(el => el.exhibitDiagnostics().frames);
  await page.waitForTimeout(300);
  expect(await screen.evaluate(el => el.exhibitDiagnostics().frames)).toBe(frames);
});

test('all controls fit with music, short screens scroll the cabinet, and focus cannot displace the stage', async ({ page }) => {
  await openLanding(page, '#hexy');
  await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
  const gallery = page.locator(gallerySelector);
  for (const [width, height] of [[1440, 900], [2559, 1303], [800, 900], [390, 844], [360, 740], [390, 640]]) {
    await page.setViewportSize({ width, height });
    await goWorld(page, 1.4);
    await gallery.getByRole('button', { name: 'Hexy', exact: true }).click();
    const cabinet = gallery.locator('[data-gallery-cabinet]');
    const cabinetBox = await cabinet.boundingBox();
    if (width > 1100) {
      const surface = await gallery.evaluate(el => parseFloat(el.style.getPropertyValue('--counter-y')));
      expect(Math.abs(cabinetBox.y + cabinetBox.height - surface)).toBeLessThan(1);
    }
    const heading = await gallery.locator('h2').first().boundingBox();
    const map = gallery.getByRole('button', { name: 'Mapa de la plaza' });
    const mapBox = await map.boundingBox();
    const player = await page.locator('[data-compact-player]').boundingBox();
    expect(heading.y).toBeGreaterThan(65);
    expect(heading.y + heading.height).toBeLessThan(cabinetBox.y);
    expect(cabinetBox.y + cabinetBox.height).toBeLessThan(mapBox.y);
    expect(mapBox.x).toBeGreaterThanOrEqual(0);
    if (width <= 1100) expect(mapBox.y + mapBox.height).toBeLessThan(player.y);
    await gallery.getByRole('button', { name: 'Volver al atrio' }).click({ trial: true });
    await gallery.getByRole('button', { name: 'Escucha a Hexy' }).click();
    await gallery.getByRole('link', { name: 'Conoce a Hexy' }).click({ trial: true });
    await map.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    // The fractional runway height can put the final sticky edge < 1px above 0.
    expect(Math.abs((await page.locator('[data-stage]').boundingBox()).y)).toBeLessThan(1);
    await page.keyboard.press('Escape');
    expect(await page.locator('[data-stage]').evaluate(el => el.scrollTop)).toBe(0);
    await page.locator('[data-world-footer] button').click({ trial: true });
  }
});

test('the new room crosses behind a covering pier in either direction and supports English reduced motion', async ({ page }) => {
  await openLanding(page);
  for (const p of [1.074, 1.076, 1.2, 1.076, 1.074, .99]) {
    await goWorld(page, p);
    expect(await page.locator('[data-stage]').evaluate(el => el.scrollTop)).toBe(0);
    if (p > 1.07 && p < 1.08) {
      const box = await page.locator('[data-plaza-passage] img').boundingBox();
      expect(box.x + box.width * .28).toBeLessThan(0);
      expect(box.x + box.width * .72).toBeGreaterThan(1440);
    }
  }
  await goWorld(page, 1.2);
  await page.getByRole('button', { name: 'EN', exact: true }).first().click();
  const gallery = page.locator(gallerySelector);
  await expect(gallery).toContainText('A little WonderPop to take with you.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery.getByRole('button', { name: 'Next item' })).toBeVisible();
  await gallery.getByRole('button', { name: 'Next item' }).click();
  await expect(gallery.getByRole('status')).toHaveText('Always close, 2 of 6');
  await expect(gallery.locator('[data-exhibit-screen]')).toHaveAttribute('data-renderer', 'fallback');
  await gallery.getByRole('button', { name: 'Plaza map' }).click();
  await expect(page.getByRole('dialog').locator('[aria-current="location"]')).toContainText('The gallery');
  await page.keyboard.press('Escape');
  expect(await page.locator('[data-journey]').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
});
