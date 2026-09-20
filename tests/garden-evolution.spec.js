import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';
import sharp from 'sharp';

test('billboard cycles decoded poses at rest, skips a failed frame and respects reduced motion', async ({ page }) => {
  await page.route('**/hexy-poster-wave-v3.webp', route => route.abort());
  await openLanding(page, '#hexy');
  const screen = page.locator('[data-billboard]');
  await expect.poll(() => screen.getAttribute('data-frame'), { timeout: 10000 }).toBe('2');
  const scroll = await page.evaluate(() => scrollY);
  await expect.poll(() => screen.getAttribute('data-frame'), { timeout: 6000 }).toBe('3');
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  const current = screen.locator('[data-visible="true"]');
  expect(await current.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(screen).toHaveAttribute('data-frame', '0');
  await page.waitForTimeout(3400);
  await expect(screen).toHaveAttribute('data-frame', '0');
});

test('audience rows have independent depth and the street covers wide and narrow viewports', async ({ page }) => {
  await openLanding(page);
  for (const viewport of [{ width: 2560, height: 1300 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await goWorld(page, 0.45);
    const positions = () => page.locator('[data-audience-row]').evaluateAll(rows => rows.map(row => new DOMMatrix(getComputedStyle(row).transform).m41));
    const before = await positions();
    await goWorld(page, 0.56);
    const after = await positions();
    const movement = after.map((x, i) => Math.abs(x - before[i]));
    expect(movement).toHaveLength(4);
    expect(movement[0]).toBeGreaterThan(2);
    movement.slice(1).forEach((d, i) => expect(d).toBeGreaterThan(movement[i]));
    const street = await page.locator('[data-courtyard]').boundingBox();
    expect(street.x).toBeLessThan(-10);
    expect(street.x + street.width).toBeGreaterThan(viewport.width + 10);
    const dj = await page.locator('[data-dj]').boundingBox();
    expect((dj.x + dj.width / 2) / viewport.width).toBeGreaterThan(0.46);
    expect((dj.x + dj.width / 2) / viewport.width).toBeLessThan(0.59);
  }
});

test('foliage completely covers the scene swap in both scroll directions', async ({ page }) => {
  await openLanding(page);
  await page.locator('[data-canopy-veil]').evaluate(async image => {
    image.loading = 'eager';
    await image.decode();
  });
  await page.addStyleTag({ content: '* { animation-play-state: paused !important; transition: none !important; }' });
  await page.locator('[data-continuation]').evaluate(world => {
    const backdrop = document.createElement('div');
    backdrop.dataset.coverageProbe = '';
    Object.assign(backdrop.style, { position: 'absolute', inset: '0', zIndex: '19', pointerEvents: 'none' });
    world.append(backdrop);
  });
  for (const viewport of [{ width: 2560, height: 1300 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    for (const progress of [0.59, 0.613, 0.616, 0.619, 0.68, 0.619, 0.616, 0.613]) {
      await goWorld(page, progress);
      if (progress < 0.613 || progress > 0.619) continue;
      // Compare actual browser composites over opposing colors. This catches
      // transparent holes and uncovered edges, including CSS backgrounds.
      const buffers = [];
      for (const color of ['#ff0000', '#0000ff']) {
        await page.locator('[data-coverage-probe]').evaluate((el, value) => el.style.background = value, color);
        buffers.push(await sharp(await page.screenshot()).removeAlpha().raw().toBuffer());
      }
      let maximumDifference = 0;
      for (let i = 0; i < buffers[0].length; i++) {
        maximumDifference = Math.max(maximumDifference, Math.abs(buffers[0][i] - buffers[1][i]));
      }
      expect(maximumDifference).toBeLessThanOrEqual(2);
    }
  }
});
