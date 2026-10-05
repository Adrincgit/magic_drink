import { test, expect } from '@playwright/test';
import sharp from 'sharp';

async function open(page) {
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
}

async function boundaryAt(page, room, fraction) {
  await page.locator(`[data-room-scene="${room}"]`).evaluate((el, fraction) => {
    scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * fraction);
  }, fraction);
}

test('each opaque room keeps its scenery inside its own document bounds', async ({ page }) => {
  await open(page);
  const srcs = await page.locator('[data-room-plate]').evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
  expect(new Set(srcs).size).toBe(3);
  for (const room of ['backstage', 'studio', 'encore']) {
    await page.locator(`[data-hexy-scene="${room}"]`).evaluate(el => el.scrollIntoView());
    await expect(page.locator(`[data-room-backdrop="${room}"]`)).toHaveAttribute('data-room-visible', 'true');
    const bounds = await page.locator(`[data-room-scene="${room}"]`).boundingBox();
    const camera = await page.locator(`[data-room-viewport="${room}"]`).boundingBox();
    expect(camera.y).toBeGreaterThanOrEqual(bounds.y - 1);
    expect(camera.y + camera.height).toBeLessThanOrEqual(bounds.y + bounds.height + 1);
    await expect(page.locator(`[data-room-backdrop="${room}"]`)).toHaveCSS('opacity', '1');
  }
});

for (const width of [390, 1440, 2559]) {
  test(`room boundaries never composite future or previous scenery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    // Pixel probes retain real scrolling, cameras and clipping. Only common
    // ornament/finish is hidden to measure which room paints each pixel.
    await page.addStyleTag({ content: '[data-hexy-finish], .cinematic-grain::before { display: none !important; } [data-passage-overlap] { visibility: hidden !important; }' });
    const colors = ['#ff0000', '#00ff00', '#0000ff'];
    await page.locator('[data-room-backdrop]').evaluateAll((els, colors) => els.forEach((el, i) => {
      const probe = document.createElement('div');
      probe.style.cssText = `position:absolute;inset:0;z-index:9999;background:${colors[i]}`;
      el.append(probe);
    }), colors);
    const rgb = [[255, 0, 0], [0, 255, 0], [0, 0, 255]];
    for (const [i, room] of ['studio', 'encore'].entries()) {
      await boundaryAt(page, room, 1.05);
      await expect(page.locator(`[data-room-backdrop="${room}"]`)).toHaveAttribute('data-room-visible', 'false');
      for (const fraction of [.7, .3, .7]) {
        await boundaryAt(page, room, fraction);
        await expect(page.locator(`[data-room-backdrop="${room}"]`)).toHaveAttribute('data-room-visible', 'true');
        const { data, info } = await sharp(await page.screenshot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        const sample = y => [...data.subarray((y * info.width + 4) * 3, (y * info.width + 4) * 3 + 3)];
        // Allow tiny ambient-light rounding; a crossfade or the wrong room
        // changes an entire color channel, not a few intensity levels.
        const colorDistance = (actual, expected) => Math.max(...actual.map((value, channel) => Math.abs(value - expected[channel])));
        expect(colorDistance(sample(Math.round(1000 * fraction - 45)), rgb[i])).toBeLessThanOrEqual(6);
        expect(colorDistance(sample(Math.round(1000 * fraction + 45)), rgb[i + 1])).toBeLessThanOrEqual(6);
        expect(await page.locator('[data-room-backdrop]').evaluateAll(els => els.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
      }
      await boundaryAt(page, room, 1.05);
      await expect(page.locator(`[data-room-backdrop="${room}"]`)).toHaveAttribute('data-room-visible', 'false');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}

test('the listening room preserves the current scenery and audio after resizing', async ({ page }) => {
  await open(page);
  await page.locator('#estudio').evaluate(el => el.scrollIntoView());
  await expect(page.locator('[data-hexy-passages]')).toHaveAttribute('data-active-room', 'studio');
  await page.locator('#estudio').getByRole('button', { name: 'Let me hear those choruses' }).click();
  await page.locator('#canciones').getByRole('button', { name: 'Play Hexy Wow', exact: true }).click();
  await expect.poll(() => page.locator('audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
  await page.setViewportSize({ width: 550, height: 1000 });
  await expect(page.locator('[data-listening-room]')).toBeVisible();
  const bounds = await page.locator('[data-listening-room]').boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.width + bounds.x).toBeLessThanOrEqual(550);
  await page.keyboard.press('Escape');
  await page.locator('#estudio').evaluate(el => el.scrollIntoView());
  await expect(page.locator('[data-room-backdrop=studio]')).toHaveAttribute('data-room-visible', 'true');
  await expect(page.getByRole('complementary', { name: 'Mini player' })).toContainText('Hexy Wow');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('reduced motion retains opaque physical boundaries and stops parallax', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await boundaryAt(page, 'studio', .5);
  const cameras = page.locator('[data-room-layer]');
  expect(await cameras.evaluateAll(els => els.every(el => getComputedStyle(el).transform === 'none'))).toBe(true);
  await expect(page.locator('[data-room-backdrop=studio]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-room-backdrop=backstage]')).toHaveCSS('opacity', '1');
  await expect(page.locator('#estudio')).toHaveCSS('opacity', '1');
});
