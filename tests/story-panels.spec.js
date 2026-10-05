import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

const scenes = [[.162, '#ciudad'], [.3132, '#hexy'], [.49, '[data-world-copy="festival"]'], [.68, '[data-world-copy="plaza"]']];
const rectanglesOverlap = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

for (const [width, height] of [[360, 640], [820, 1180], [2559, 1300]]) {
  test(`narration, buttons and music remain readable and separate at ${width}px in ES and EN`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await openLanding(page);
    for (const lang of ['es', 'en']) {
      if (lang === 'en') {
        await page.locator('[data-journey-menu-trigger]').click();
        await page.getByRole('button', { name: 'EN', exact: true }).click();
        await page.keyboard.press('Escape');
      }
      for (const [progress, selector] of scenes) {
        await goWorld(page, progress);
        const scene = page.locator(selector), panel = scene.locator('[data-story-panel]');
        await expect(scene).toHaveAttribute('data-story-active', 'true');
        await expect(page.locator('[data-story-active=true]')).toHaveCount(1);
        await panel.evaluate(async el => { await Promise.all(el.getAnimations().map(animation => animation.finished)); });
        const box = await panel.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(12);
        expect(box.x + box.width).toBeLessThanOrEqual(width - 12);
        expect(box.y).toBeGreaterThan(75);
        expect(box.y + box.height).toBeLessThan(height - 65);
        const content = await panel.locator('h2, a, [data-scene-label], [data-scene-note], [data-scene-control], [data-scene-player]').evaluateAll(els => els.filter(el => el.checkVisibility()).map(el => {
          const b = el.getBoundingClientRect(); return { text: el.textContent.slice(0, 30), x: b.x, y: b.y, right: b.right, bottom: b.bottom };
        }));
        for (const item of content) {
          expect(item.x, item.text).toBeGreaterThan(box.x + 12);
          expect(item.right, item.text).toBeLessThan(box.x + box.width - 12);
          expect(item.y, item.text).toBeGreaterThan(box.y + 10);
          expect(item.bottom, item.text).toBeLessThan(box.y + box.height - 12);
        }
        if (await page.locator('[data-compact-player]').count()) {
          const dock = await page.locator('[data-compact-player]').boundingBox();
          expect(rectanglesOverlap(box, dock)).toBe(false);
          expect(rectanglesOverlap(await page.locator('[data-journey-menu-trigger]').boundingBox(), dock)).toBe(false);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
      }
    }
    expect(errors).toEqual([]);
  });
}

test('the next page waits for arrival, animates once, and its buttons navigate with the keyboard', async ({ page }) => {
  await openLanding(page);
  const city = page.locator('#ciudad');
  await city.locator('[data-story-panel]').evaluate(el => {
    el.dataset.entrances = '0';
    el.addEventListener('animationstart', e => { if (e.target === el) el.dataset.entrances = String(Number(el.dataset.entrances) + 1); });
  });
  await goWorld(page, .1);
  await expect(city).toBeHidden();
  expect(await city.evaluate(el => el.inert)).toBe(true);
  await goWorld(page, .162);
  await expect(city.locator('[data-story-panel]')).toHaveAttribute('data-entrances', '1');
  await goWorld(page, .17);
  await expect(city.locator('[data-story-panel]')).toHaveAttribute('data-entrances', '1');
  const follow = city.getByRole('link', { name: 'Sigue la música' });
  await follow.focus(); await follow.press('Enter');
  await expect(page.locator('#hexy')).toHaveAttribute('data-story-active', 'true');
  await expect(city).toBeHidden();
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
  await goWorld(page, .162);
  await expect(city.locator('[data-story-panel]')).toHaveAttribute('data-entrances', '2');
  await goWorld(page, .68);
  const enter = page.getByRole('link', { name: 'Vamos a entrar' });
  await enter.focus(); await enter.press('Enter');
  await expect.poll(() => page.locator('[data-journey]').evaluate(el => Number(el.dataset.worldProgress))).toBeCloseTo(.92, 2);
});

test('world motes travel with the street instead of remaining on the camera', async ({ page }) => {
  await openLanding(page);
  await page.addStyleTag({ content: '[data-world-motes] i {animation:none!important}' });
  const position = () => page.locator('[data-world-motes] i').nth(4).evaluate(el => {
    const b = el.getBoundingClientRect(), plane = el.closest('[data-depth="furniture"]').getBoundingClientRect();
    return { x: b.x, localX: (b.x - plane.x) / plane.width, localY: (b.y - plane.y) / plane.height };
  });
  await goWorld(page, 0); const before = await position();
  await goWorld(page, .162); const after = await position();
  expect(Math.abs(after.x - before.x)).toBeGreaterThan(80);
  expect(after.localX).toBeCloseTo(before.localX, 4);
  expect(after.localY).toBeCloseTo(before.localY, 4);
});

test('the relocated music dock opens a reachable playlist and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await openLanding(page); await goWorld(page, .49);
  const dock = page.locator('[data-compact-player]');
  const toggle = dock.getByRole('button', { name: 'Lista de canciones', exact: true });
  await toggle.click();
  const playlist = dock.locator('[data-song-list]');
  await expect(playlist).toBeVisible();
  const bounds = await playlist.boundingBox();
  expect(bounds.y).toBeGreaterThan(65);
  expect(bounds.y + bounds.height).toBeLessThan(640 - 60);
  await page.keyboard.press('Escape');
  await expect(playlist).toBeHidden(); await expect(toggle).toBeFocused();
});

test('reduced motion presents every page in normal flow and restores the cinematic version', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLanding(page); await goWorld(page, .162);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [, selector] of scenes) {
    const scene = page.locator(selector), panel = scene.locator('[data-story-panel]');
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();
    expect(await scene.evaluate(el => el.inert)).toBe(false);
    await expect(panel).toHaveCSS('animation-name', 'none');
    const b = await panel.boundingBox();
    expect(b.x).toBeGreaterThanOrEqual(12);
    expect(b.x + b.width).toBeLessThanOrEqual(378);
    await expect(scene).not.toHaveAttribute('aria-hidden', 'true');
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await goWorld(page, .162);
  await expect(page.locator('[data-story-active=true]')).toHaveCount(1);
});
