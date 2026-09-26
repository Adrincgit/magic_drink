import { test, expect } from '@playwright/test';

async function open(page) {
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
}
async function enter(page, room, progress) {
  await page.locator(`[data-room-door="${room}"]`).evaluate((el, t) => {
    const rect = el.getBoundingClientRect();
    // Scroll offsets round to device pixels; place endpoint samples just past
    // the boundary so a fractional layout coordinate cannot leave a tiny blend.
    const edge = t === 0 ? 2 : t === 1 ? -2 : 0;
    const targetTop = innerHeight * .9 - t * (rect.height + innerHeight * .6) + edge;
    scrollTo(0, scrollY + rect.top - targetTop);
  }, progress);
}
const opacity = (page, room) => page.locator(`[data-room-backdrop="${room}"]`).evaluate(el => Number(getComputedStyle(el).opacity));

test('each room has its own illustrated setting and the scenery stays in the viewport', async ({ page }) => {
  await open(page);
  const srcs = await page.locator('[data-room-backdrop] img').evaluateAll(imgs => imgs.map(img => img.getAttribute('src')));
  expect(new Set(srcs).size).toBe(4);
  expect(srcs.some(src => src.includes('theatre.webp'))).toBe(false);
  await enter(page, 'studio', 1);
  await expect.poll(() => opacity(page, 'studio')).toBe(1);
  const viewport = page.locator('[data-room-viewport]');
  expect((await viewport.boundingBox()).y).toBeCloseTo(0, 0);
  await page.mouse.wheel(0, 200);
  await expect.poll(async () => Math.abs((await viewport.boundingBox()).y)).toBeLessThan(1);
  await expect(page.locator('#estudio')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('the doorway blends rooms gradually, reversibly, without fading the content', async ({ page }) => {
  await open(page);
  await enter(page, 'studio', 0);
  await expect.poll(() => opacity(page, 'backstage')).toBe(1);
  await expect.poll(() => opacity(page, 'studio')).toBe(0);
  await enter(page, 'studio', .5);
  await expect.poll(() => opacity(page, 'studio')).toBeCloseTo(.5, 1);
  expect(await opacity(page, 'backstage')).toBe(1);
  await expect(page.locator('#estudio')).toHaveCSS('opacity', '1');
  await enter(page, 'studio', 1);
  await expect.poll(() => opacity(page, 'studio')).toBe(1);
  await expect.poll(() => opacity(page, 'backstage')).toBe(0);
  await enter(page, 'studio', .25);
  await expect.poll(() => opacity(page, 'studio')).toBeCloseTo(.15625, 1);
  expect(await opacity(page, 'backstage')).toBe(1);
});

test('jumping to songs selects the right room and preserves playback', async ({ page }) => {
  await open(page);
  await page.getByRole('link', { name: 'Explore songs', exact: true }).click();
  await expect.poll(() => opacity(page, 'records')).toBe(1);
  await expect(page.locator('[data-hexy-passages]')).toHaveAttribute('data-active-room', 'records');
  await page.locator('#canciones').getByRole('button', { name: 'Play Hexy Wow', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Mini player' })).toContainText('Hexy Wow');
  await expect.poll(() => page.locator('audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
  await page.setViewportSize({ width: 550, height: 1000 });
  await page.locator('#canciones').evaluate(el => el.scrollIntoView());
  await expect.poll(() => opacity(page, 'records')).toBe(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

test('reduced motion switches the decor without camera travel or intermediate blends', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await enter(page, 'studio', .25);
  await expect.poll(() => opacity(page, 'studio')).toBe(0);
  await enter(page, 'studio', .75);
  await expect.poll(() => opacity(page, 'studio')).toBe(1);
  const cameras = page.locator('[data-room-backdrop] > div');
  expect(await cameras.evaluateAll(els => els.every(el => getComputedStyle(el).transform === 'none'))).toBe(true);
  await expect(page.locator('#estudio')).toHaveCSS('opacity', '1');
});
