import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';
import { FILM_START, FILM_END, filmShots } from '../src/data/wonderpopFilm';
const position = (i, local = .5) => FILM_START + (i + local) * (FILM_END - FILM_START) / filmShots.length;

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 640 }]) {
  test(`menu preserves the current scene, traps focus and translates without restarting (${viewport.width})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openLanding(page, '#directorio-wonderpop');
    await goWorld(page, position(1));
    await expect(page.locator('header nav')).toHaveCount(0);
    const trigger = page.locator('[data-journey-menu-trigger]');
    const menu = page.locator('[data-journey-menu]');
    const before = await page.evaluate(() => scrollY);
    await trigger.click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('link')).toHaveCount(4);
    await expect(menu.getByRole('button', { name: 'Cerrar menú' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(menu.getByRole('button', { name: 'Seguir el recorrido' })).toBeFocused();
    await page.mouse.wheel(0, 650);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    expect((await page.locator('[data-stage]').boundingBox()).y).toBe(0);
    await menu.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(menu.getByRole('link', { name: /About us/ })).toHaveAttribute('href', '/nosotros');
    expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('en');
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => scrollY)).toBe(before);
    await expect(page.locator('[data-film-caption] h3')).toHaveText('Fifty years. One formula.');
    await page.mouse.wheel(0, 250);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
    await trigger.click();
    await menu.getByRole('link', { name: /Wonderpop Plaza/ }).click();
    await expect(page).toHaveURL(/\/wonderpop-plaza\/?$/);
    await expect(page.locator('header nav')).toBeVisible();
  });
}

test('all journey controls follow the film color, including reverse scroll and the cover artwork', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const controls = page.locator('[data-journey-navigation], [data-compact-player], [data-journey-menu-trigger], [data-journey-menu]');
  for (const [progress, amount] of [[position(1), 1], [position(8), .36], [position(13), 0], [position(1), 1], [.68, 0]]) {
    await goWorld(page, progress);
    for (const control of await controls.all()) await expect(control).toHaveCSS('filter', `grayscale(${amount})`);
  }
  await goWorld(page, position(1));
  const cover = page.locator('[data-compact-player] [data-current-cover]');
  const pixels = await sharp(await cover.screenshot()).removeAlpha().raw().toBuffer();
  let color = 0;
  for (let i = 0; i < pixels.length; i += 3) color += Math.max(pixels[i], pixels[i+1], pixels[i+2]) - Math.min(pixels[i], pixels[i+1], pixels[i+2]);
  expect(color / (pixels.length / 3)).toBeLessThan(2);
  const player = page.locator('[data-compact-player]');
  await player.getByRole('button', { name: 'Lista de canciones' }).click();
  await expect(player.getByRole('button', { name: /Dancing Re-Re/ })).toBeVisible();
  expect(await page.locator('audio').evaluate(el => el.paused)).toBe(true);
});

test('new artwork fills the projection; the new illustrated can grows and reverses with scroll', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  for (const i of [2, 11]) {
    await goWorld(page, position(i));
    const film = page.locator('[data-wonderpop-film]');
    await expect(film).toHaveAttribute('data-film-renderer', 'webgl');
    const photo = film.locator('[data-film-surface] img');
    await expect(photo).toHaveAttribute('src', /v28\.webp$/);
    await expect(photo).toHaveCSS('object-fit', 'cover');
    expect((await page.locator('[data-film-frame]').boundingBox()).y).toBeLessThan(70);
  }
  const can = page.locator('[data-film-can]');
  await goWorld(page, position(9, .1));
  await expect(can).toHaveAttribute('src', '/image/journey/wonderpop-film/magic-drink-comic-can-v29.webp');
  const start = await can.boundingBox();
  await goWorld(page, position(9, .9));
  expect((await can.boundingBox()).height).toBeGreaterThan(start.height * 1.08);
  await goWorld(page, position(9, .1));
  expect((await can.boundingBox()).height).toBeCloseTo(start.height, 0);
});

test('reduced motion uses visible articles to theme the menu and retains its scroll position', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page, '#directorio-wonderpop');
  for (const [index, amount] of [[1, 1], [12, 0], [1, 1]]) {
    await page.locator('[data-wonderpop-film] article').nth(index).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await expect(page.locator('[data-journey-menu-trigger]')).toHaveCSS('filter', `grayscale(${amount})`);
  }
  const before = await page.evaluate(() => scrollY);
  await page.locator('[data-journey-menu-trigger]').click();
  await page.locator('[data-journey-menu]').getByRole('button', { name: 'Seguir el recorrido' }).click();
  expect(await page.evaluate(() => scrollY)).toBe(before);
});
