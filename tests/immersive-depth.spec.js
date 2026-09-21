import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('pointer depth moves artwork by distance without moving copy or scrolling', async ({
  page,
}) => {
  await openLanding(page);
  await page.mouse.move(720, 450);
  const copy = page.locator('[data-chapter="0"]');
  const before = await copy.boundingBox();
  await page.mouse.move(1260, 710);
  await expect
    .poll(() =>
      page
        .locator('[data-journey]')
        .evaluate((el) => Math.abs(parseFloat(el.style.getPropertyValue('--look-x')))),
    )
    .toBeGreaterThan(5);
  const translations = await page
    .locator('[data-look]')
    .evaluateAll((elements) =>
      Object.fromEntries(
        elements.map((el) => [el.dataset.look, parseFloat(getComputedStyle(el).translate)]),
      ),
    );
  expect(Math.abs(translations.near)).toBeGreaterThan(Math.abs(translations.far) * 4);
  expect(await copy.boundingBox()).toEqual(before);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page.locator('[data-journey]').evaluate((el) => el.style.getPropertyValue('--look-x')),
    )
    .toBe('0px');
  await page.mouse.move(100, 600);
  expect(
    await page.locator('[data-depth="street"]').evaluate((el) => getComputedStyle(el).translate),
  ).toBe('none');
});

test('the performer stays centered on the stage through scroll, pointer and viewport changes', async ({
  page,
}) => {
  await openLanding(page);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    for (const progress of [0.46, 0.56]) {
      await goWorld(page, progress);
      const position = await page.evaluate(() => {
        const stage = document.querySelector('[data-festival-rig]').getBoundingClientRect();
        const dj = document.querySelector('[data-dj]').getBoundingClientRect();
        return {
          center: (dj.x + dj.width / 2 - stage.x) / stage.width,
          feet: (dj.bottom - stage.y) / stage.height,
          height: dj.height / stage.height,
        };
      });
      expect(position.center).toBeCloseTo(0.5, 2);
      expect(position.feet).toBeCloseTo(0.745, 2);
      expect(position.height).toBeLessThan(0.32);
    }
    await goWorld(page, 0.68);
    const garden = page.locator('[data-garden-world]');
    await expect(garden).toHaveAttribute('data-renderer', 'webgl');
    const center = await garden.evaluate(el => el.gardenDiagnostics().buildingFoot.x);
    expect(center).toBeCloseTo(0.5, 2);
  }
});

test('new ambient movement continues at rest while depth follows scroll', async ({ page }) => {
  await openLanding(page);
  await goWorld(page, 0.49);
  const beam = page.locator('[data-stage-lights] i').first();
  const beamBefore = await beam.evaluate((el) => getComputedStyle(el).transform);
  const rigBefore = await page
    .locator('[data-festival-rig]')
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(350);
  expect(await beam.evaluate((el) => getComputedStyle(el).transform)).not.toBe(beamBefore);
  expect(
    await page.locator('[data-festival-rig]').evaluate((el) => getComputedStyle(el).transform),
  ).toBe(rigBefore);
  await goWorld(page, 0.56);
  const distances = await page
    .locator('[data-courtyard],[data-festival-rig],[data-crowd]')
    .evaluateAll((elements) =>
      elements.map((el) => new DOMMatrix(getComputedStyle(el).transform).m41),
    );
  expect(new Set(distances.map((x) => Math.round(x))).size).toBe(3);
  await goWorld(page, 0.878);
  const atrium = page.locator('[data-atrium-engine]');
  await expect(atrium).toHaveAttribute('data-renderer', 'webgl');
  const before = await atrium.evaluate(el => el.atriumDiagnostics());
  await expect.poll(() => atrium.evaluate(el => el.atriumDiagnostics().pendants)).not.toEqual(before.pendants);
  expect(await atrium.evaluate(el => el.atriumDiagnostics().camera)).toEqual(before.camera);
});
