import { test, expect } from '@playwright/test';
import { openLanding, goTo, goWorld } from './landing.helpers';

const errors = new WeakMap();
test.beforeEach(async ({ page }) => {
  errors.set(page, []);
  page.on('pageerror', (e) => errors.get(page).push(e.message));
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

test('depth planes move independently and ambient clouds keep moving at rest', async ({ page }) => {
  await openLanding(page);
  const transforms = () =>
    page
      .locator('[data-depth]')
      .evaluateAll((els) =>
        Object.fromEntries(
          els.map((el) => [el.dataset.depth, new DOMMatrix(getComputedStyle(el).transform).m41]),
        ),
      );
  const before = await transforms();
  await goTo(page, '[data-runway]', 0.45);
  const after = await transforms();
  expect(Math.abs(after.street - before.street)).toBeGreaterThan(150);
  expect(Math.abs(after.distance - before.distance)).toBeLessThan(
    Math.abs(after.street - before.street) * 0.5,
  );
  await expect(page.locator('[data-garden-world]')).toBeHidden();
  // A lamp and the pavement supporting it must share their camera transform.
  expect(after.furniture - before.furniture).toBeCloseTo(after.street - before.street, 2);
  const cloud = page.locator('[data-depth="cloud-near"] img');
  const ambientBefore = await cloud.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(300);
  const ambientAfter = await cloud.evaluate((el) => getComputedStyle(el).transform);
  expect(ambientAfter).not.toBe(ambientBefore);
  expect((await transforms()).street).toBeCloseTo(after.street, 2);
  await goWorld(page, 0.49);
  await expect(page.locator('[data-world-scene="festival"]')).toHaveAttribute(
    'data-world-active',
    'true',
  );
});

test('navigation, languages and user-initiated audio work; navigation remains above later sections', async ({
  page,
}) => {
  await openLanding(page);
  expect(await page.locator('audio').evaluate((a) => a.paused)).toBe(true);
  await page.getByRole('button', { name: 'HEXY', exact: true }).click();
  await expect
    .poll(() => page.locator('[data-journey]').evaluate((el) => Number(el.dataset.progress)))
    .toBeCloseTo(0.87, 2);
  await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
  await expect.poll(() => page.locator('audio').evaluate((a) => a.paused)).toBe(false);
  await page.getByRole('button', { name: 'Pausar No Brain, Just Vibes!' }).click();
  await expect.poll(() => page.locator('audio').evaluate((a) => a.paused)).toBe(true);
  await page.locator('header').getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('[data-chapter="2"] h2')).toContainText('This is Hexy.');
  await expect(page.locator('#festival h2')).toContainText('Magic Drink');
  // Finish the user-triggered Lenis journey before the test's native scroll jump.
  // Otherwise its final interpolation frame can overwrite that forced position.
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
  await goWorld(page, 0.49);
  const nav = page.locator('header').getByRole('button', { name: 'EN', exact: true });
  await nav.click({ trial: true });
  const onTop = await nav.evaluate((el) => {
    const b = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2));
  });
  expect(onTop).toBe(true);
  await goWorld(page, 1);
  await page.getByRole('button', { name: 'Return to the start' }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3);
});

test('phone compositions fit and remain navigable after resizing', async ({ page }) => {
  await openLanding(page);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 360, height: 740 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const progress of [0, 0.45, 0.87]) {
      await goTo(page, '[data-runway]', progress);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (progress === 0) {
        const fits = await page.locator('[data-chapter="0"] h1').evaluate((el) => {
          const r = document.createRange();
          r.selectNodeContents(el);
          const b = r.getBoundingClientRect();
          return b.left >= 0 && b.right <= innerWidth;
        });
        expect(fits).toBe(true);
      }
    }
  }
});

test('reduced motion exposes the story as ordinary readable sections', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page);
  await expect(page.locator('[data-journey]')).toHaveAttribute('data-reduced', 'true');
  for (let i = 0; i < 3; i++) {
    const section = page.locator(`[data-chapter="${i}"]`);
    expect(
      await section.evaluate((el) => !el.inert && getComputedStyle(el).visibility === 'visible'),
    ).toBe(true);
  }
  expect(
    await page
      .locator('[data-journey]')
      .evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  expect(await page.locator('[data-stage]').evaluate((el) => getComputedStyle(el).position)).toBe(
    'relative',
  );
  for (const name of ['festival', 'plaza', 'interior', 'closing']) {
    expect(
      await page
        .locator(`[data-world-copy="${name}"]`)
        .evaluate((el) => !el.inert && getComputedStyle(el).visibility === 'visible'),
    ).toBe(true);
  }
});

test('Hexy deep link opens its scene and the product route offers only Magic Drink', async ({
  page,
}) => {
  await openLanding(page, '#hexy');
  await expect
    .poll(() => page.locator('[data-journey]').evaluate((el) => Number(el.dataset.progress)))
    .toBeCloseTo(0.87, 2);
  await page.goto('/bebidas', { waitUntil: 'networkidle' });
  await expect(page.locator('main h1')).toHaveText(/Magic\s*Drink\./);
  await expect(page.locator('body')).not.toContainText(
    /Original|Bubble Tape|Dragon Grape|Banana Drama|6 sabores|6 official flavors/,
  );
  await expect(page.locator('img[src="/image/journey/original.webp"]')).toBeVisible();
});
