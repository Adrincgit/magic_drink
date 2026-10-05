import { test, expect } from '@playwright/test';
import sharp from 'sharp';

async function open(page) {
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
  await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('[data-finish-lens]')).toHaveAttribute('data-ready', 'true');
}

const pixels = buffer => sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const mean = values => values.reduce((total, value) => total + value, 0) / values.length;

test('the expanded player receives real optical dispersion and returns one grain canvas to the page', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Explore songs', exact: true }).click();
  const room = page.locator('[data-listening-room]');
  await expect(room.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state', 'running');
  await expect(page.locator('[data-finish-grain]')).toHaveCount(1);
  await page.addStyleTag({ content: '[data-hexy-finish] > :not([data-finish-lens]) { visibility: hidden !important; }' });
  await room.evaluate(el => {
    const button = document.createElement('button');
    button.setAttribute('data-lens-probe', '');
    button.style.cssText = 'position:fixed;left:680px;top:400px;width:80px;height:100px;padding:0;border:0;background:linear-gradient(90deg,#000 50%,#fff 50%);z-index:9999';
    el.append(button);
  });
  const { data, info } = await pixels(await page.screenshot());
  const dispersion = Array.from({ length: 10 }, (_, i) => {
    const index = (450 * info.width + 715 + i) * info.channels;
    const rgb = [...data.subarray(index, index + 3)];
    return Math.max(...rgb) - Math.min(...rgb);
  });
  expect(Math.max(...dispersion)).toBeGreaterThan(20);
  await page.keyboard.press('Escape');
  await expect(room).not.toBeVisible();
  await expect(room.locator('[data-finish-grain]')).toHaveCount(0);
  await expect(page.locator('[data-finish-grain]')).toHaveCount(1);
  await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state', 'running');
  await expect(page.locator('[data-finish-lens]')).toHaveCSS('clip-path', 'none');
});

for (const width of [390, 1440]) {
  test(`lens refracts actual pixels at the edges and central components at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page);
    await page.addStyleTag({ content: '[data-hexy-finish] > :not([data-finish-lens]) { display: none !important; }' });
    const edges = [45, Math.floor(width / 2), width - 45];
    await page.evaluate(edges => {
      for (const x of edges) {
        const probe = document.createElement('div');
        probe.style.cssText = `position:fixed;left:${x - 40}px;top:400px;width:80px;height:100px;background:linear-gradient(90deg,#000 50%,#fff 50%);z-index:9999`;
        document.querySelector('[data-hexy-world]').append(probe);
      }
    }, edges);
    const { data, info } = await pixels(await page.screenshot());
    const bands = edges.map(edge => Array.from({ length: 10 }, (_, i) => {
      const index = (450 * info.width + edge - 5 + i) * info.channels;
      return [...data.subarray(index, index + 3)];
    }));
    const dispersion = bands.map(band => Math.max(...band.map(rgb => Math.max(...rgb) - Math.min(...rgb))));
    expect(dispersion[0]).toBeGreaterThan(20);
    expect(dispersion[2]).toBeGreaterThan(20);
    expect(dispersion[1]).toBeGreaterThan(20);
    expect(bands[1].some(([r, , b]) => Math.abs(b - r) > 20)).toBe(true);
  });
}

test('grain regenerates independent exposures instead of moving a texture', async ({ page }) => {
  await open(page);
  await page.addStyleTag({ content: '[data-finish-grain] { opacity: 1 !important; mix-blend-mode: normal !important; } [data-hexy-finish]>div { display: none !important; }' });
  const clip = { x: 500, y: 350, width: 192, height: 192 };
  const a = await pixels(await page.screenshot({ clip }));
  const first = Array.from(a.data).filter((_, i) => i % 3 === 0);
  const average = mean(first);
  expect(average).toBeGreaterThan(120);
  expect(average).toBeLessThan(135);
  expect(Math.sqrt(mean(first.map(value => (value - average) ** 2)))).toBeGreaterThan(30);
  for (let exposure = 0; exposure < 8; exposure++) {
    await page.waitForTimeout(110);
    const b = await pixels(await page.screenshot({ clip }));
    const second = Array.from(b.data).filter((_, i) => i % 3 === 0);
    expect(Math.abs(average - mean(second))).toBeLessThan(2);
    // A translated texture would retain high correlation at its displacement.
    const correlations = [[0, 0], [1, 0], [0, 1], [23, -17], [-19, 31], [36, 11], [-28, -24]].map(([dx, dy]) => {
      let sum = 0, energyA = 0, energyB = 0;
      for (let y = 40; y < 150; y++) for (let x = 40; x < 150; x++) {
        const va = first[y * 192 + x] - 127.5, vb = second[(y + dy) * 192 + x + dx] - 127.5;
        sum += va * vb; energyA += va * va; energyB += vb * vb;
      }
      return Math.abs(sum / Math.sqrt(energyA * energyB));
    });
    expect(Math.max(...correlations)).toBeLessThan(.12);
  }
  await expect(page.locator('[data-finish-grain]')).toHaveCSS('transform', 'none');
});

test('grain respects reduced motion, toggle and intensity without restarting the scene', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const grain = page.locator('[data-finish-grain]');
  await expect(grain).toHaveAttribute('data-grain-state', 'still');
  await page.addStyleTag({ content: '[data-finish-grain] { opacity: 1 !important; mix-blend-mode: normal !important; } [data-hexy-finish]>div { display: none !important; }' });
  const clip = { x: 500, y: 350, width: 120, height: 120 };
  const first = await page.screenshot({ clip });
  await page.waitForTimeout(150);
  expect((await page.screenshot({ clip })).equals(first)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(grain).toHaveAttribute('data-grain-state', 'running');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const toggle = page.getByRole('button', { name: /Illustrated finish/ });
  const intensity = page.getByRole('slider', { name: /Film grain/ });
  await intensity.focus(); await page.keyboard.press('End');
  await expect(intensity).toHaveValue('100');
  await toggle.click();
  await expect(grain).toHaveAttribute('data-grain-state', 'paused');
  await expect(intensity).toBeDisabled();
  await toggle.click();
  await expect(grain).toHaveAttribute('data-grain-state', 'running');
  await expect(intensity).toHaveValue('100');
});

test('grain recovers its context and caps resolution on a large screen', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await open(page);
  const grain = page.locator('[data-finish-grain]');
  expect(await grain.evaluate(el => el.width * el.height)).toBeLessThan(1803000);
  await grain.evaluate(el => {
    const extension = el.getContext('webgl').getExtension('WEBGL_lose_context');
    el.addEventListener('test-restore-grain', () => extension.restoreContext(), { once: true });
    extension.loseContext();
  });
  await expect(grain).toHaveAttribute('data-grain-state', 'paused');
  await expect(grain).toHaveCSS('visibility', 'hidden');
  await page.waitForTimeout(150);
  await grain.evaluate(el => el.dispatchEvent(new Event('test-restore-grain')));
  await expect(grain).toHaveAttribute('data-grain-state', 'running');
  await expect(grain).toHaveCSS('visibility', 'visible');
});
