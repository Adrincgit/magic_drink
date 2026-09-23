import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';
import { filmShots, FILM_START, FILM_END } from '../src/data/wonderpopFilm';
const position = (i, p = .5) => FILM_START + (i + p) * (FILM_END - FILM_START) / filmShots.length;

test('the comic burst moves at rest behind a stable new can and releases animation after the shot', async ({ page }) => {
  const oldBackdrop = [];
  page.on('request', req => { if (req.url().includes('magic-drink-backdrop-v28')) oldBackdrop.push(req.url()); });
  await openLanding(page, '#directorio-wonderpop');
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await goWorld(page, position(9));
    const can = page.locator('[data-film-can]');
    await expect.poll(() => can.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const before = await can.boundingBox();
    const burst = page.locator('[data-product-burst]');
    const first = await sharp(await burst.screenshot()).resize(240, 150).removeAlpha().raw().toBuffer();
    await page.waitForTimeout(800);
    const second = await sharp(await burst.screenshot()).resize(240, 150).removeAlpha().raw().toBuffer();
    let difference = 0;
    for (let i = 0; i < first.length; i++) difference += Math.abs(first[i] - second[i]);
    expect(difference / first.length).toBeGreaterThan(.5);
    const after = await can.boundingBox();
    expect(after).toEqual(before);
    const frame = await page.locator('[data-film-frame]').boundingBox();
    expect(after.y).toBeGreaterThan(frame.y);
    expect(after.y + after.height).toBeLessThan(frame.y + frame.height);
    expect(await page.locator('[data-wonderpop-film]').evaluate(el => el.filmDiagnostics.running)).toBe(false);
  }
  expect(oldBackdrop).toEqual([]);
  await goWorld(page, position(10));
  await expect(page.locator('[data-film-product]')).toHaveCount(0);
  await expect.poll(() => page.locator('[data-wonderpop-film]').evaluate(el => el.filmDiagnostics.running)).toBe(true);
});

test('the reduced-motion product keeps the composition without any ambient loop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page, '#directorio-wonderpop');
  const product = page.locator('[data-film-product]');
  await product.scrollIntoViewIfNeeded();
  await expect(product).toBeVisible();
  expect(await product.evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0);
  await expect(product.locator('[data-film-can]')).toBeVisible();
});
