import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

const errors = new WeakMap();
test.beforeEach(async ({ page }) => {
  errors.set(page, []);
  page.on('pageerror', (error) => errors.get(page).push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(errors.get(page)).toEqual([]);
});

test('one persistent viewport carries every chapter across the former section boundary', async ({
  page,
}) => {
  await openLanding(page);
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (const p of [0.313, 0.35, 0.37, 0.39, 0.41, 0.49, 0.6, 0.68, 0.8, 0.878, 1, 0.49, 0.313]) {
    await goWorld(page, p);
    await expect(page.locator('[data-stage]')).toHaveCount(1);
    expect(
      await page
        .locator('[data-stage]')
        .evaluate((element) => Math.abs(element.getBoundingClientRect().top)),
    ).toBeLessThan(2);
    expect(await page.evaluate(() => document.body.scrollHeight)).toBe(height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await expect(page.locator('main video')).toHaveCount(0);
});

test('WonderPop appears only in the garden and approaches without shrinking', async ({
  page,
}) => {
  await openLanding(page);
  const landmark = page.locator('[data-garden-world]');
  for (const p of [0, 0.162, 0.313, 0.49, 0.59]) {
    await goWorld(page, p);
    await expect(landmark).toBeHidden();
  }
  let previousWidth = 0;
  for (const p of [0.635, 0.65, 0.68, 0.72, 0.76, 0.80, 0.82]) {
    await goWorld(page, p);
    await expect(landmark).toHaveAttribute('data-renderer', 'webgl');
    const view = await landmark.evaluate(el => el.gardenDiagnostics());
    const width = view.buildingRight.x - view.buildingLeft.x;
    expect(width).toBeGreaterThanOrEqual(previousWidth);
    expect(view.buildingFoot.x).toBeCloseTo(0.5, 2);
    expect(view.buildingFoot.y).toBeGreaterThan(0.6);
    expect(view.groundY).toBe(0);
    previousWidth = width;
  }
  await goWorld(page, 0.68);
  await expect(page.locator('[data-world-copy="plaza"]')).toBeVisible();
  await goWorld(page, 0.878);
  await expect(page.locator('[data-world-copy="interior"]')).toBeVisible();
  await expect(landmark).toBeHidden();
});

test('late or failed artwork cannot change the scroll distance or skip a chapter', async ({
  page,
}) => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route('**/image/journey/hexy-dj-v2.webp', (route) => route.abort());
  await page.route('**/image/journey/atrium-distance.webp', async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await openLanding(page);
    await goWorld(page, 0.49);
    await expect(page.locator('[data-world-copy="festival"]')).toBeVisible();
    await goWorld(page, 0.878);
    const before = await page.evaluate(() => ({ y: scrollY, height: document.body.scrollHeight }));
    release();
    await page.locator('[data-atrium]').evaluate((image) => image.decode());
    const after = await page.evaluate(() => ({ y: scrollY, height: document.body.scrollHeight }));
    expect(after).toEqual(before);
    await goWorld(page, 0.49);
    await expect(page.locator('[data-world-copy="festival"]')).toBeVisible();
  } finally {
    release();
  }
});

test('the restored mobile navbar and all new chapters remain usable after resizing', async ({
  page,
}) => {
  await openLanding(page);
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 360, height: 740 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    for (const p of [0.37, 0.49, 0.68, 0.878, 1]) {
      await goWorld(page, p);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page
          .locator('[data-stage]')
          .evaluate((element) => Math.abs(element.getBoundingClientRect().top)),
      ).toBeLessThan(2);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(
    page.locator('header').getByRole('link', { name: 'Wonderpop Plaza', exact: true }).last(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar menú' }).click();
  await expect(page.getByRole('button', { name: 'Toggle menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});
