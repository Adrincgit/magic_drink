import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('the lookout explores the same animated waterfront and restores the walk on close', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await openLanding(page);
  const trigger = page.locator('[data-lookout-trigger]');
  const before = await page.evaluate(() => scrollY);
  await trigger.locator('span').click();
  const dialog = page.locator('[data-city-lookout]');
  await expect(dialog).toBeVisible();
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
  const water = dialog.locator('[data-lookout-water]');
  await expect(water).toHaveAttribute('data-renderer', 'webgl');
  const time = await water.evaluate(el => el.waterDiagnostics().time);
  await expect.poll(() => water.evaluate(el => el.waterDiagnostics().time)).toBeGreaterThan(time);
  const cloud = dialog.locator('img[src$="clouds.webp"]');
  const cloudStart = await cloud.evaluate(el => getComputedStyle(el).transform);
  await expect.poll(() => cloud.evaluate(el => getComputedStyle(el).transform)).not.toBe(cloudStart);
  const scene = dialog.locator('[data-lookout-panorama]');
  const aim = await scene.getAttribute('data-aim');
  const view = dialog.locator('[data-lookout-view]');
  await view.focus(); await page.keyboard.press('ArrowRight');
  await expect(scene).not.toHaveAttribute('data-aim', aim);
  const afterKey = await scene.getAttribute('data-aim');
  await page.mouse.move(650, 450); await page.mouse.down(); await page.mouse.move(420, 465, { steps: 8 }); await page.mouse.up();
  await expect(scene).not.toHaveAttribute('data-aim', afterKey);
  const width = await scene.evaluate(el => el.offsetWidth);
  await dialog.getByRole('slider').focus(); await page.keyboard.press('End');
  expect(await scene.evaluate(el => el.offsetWidth)).toBeGreaterThan(width * 1.5);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible(); await expect(trigger).toBeFocused();
  await expect(dialog.locator('canvas')).toHaveCount(0);
  expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(2);
  await goWorld(page, .162);
  await expect(trigger).toBeVisible();
  expect(await page.locator('[data-depth="lookout"]').evaluate(el => getComputedStyle(el).transform)).toBe(await page.locator('[data-depth="street"]').evaluate(el => getComputedStyle(el).transform));
  await trigger.locator('span').click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test.describe('touch lookout and seated interview', () => {
  test.use({ hasTouch: true, isMobile: true });
  for (const [width, height] of [[360, 640], [390, 844], [550, 1180], [820, 1180]]) {
    test(`${width} × ${height}: touch controls work and every portrait joins the dialogue`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await openLanding(page);
      const trigger = page.locator('[data-lookout-trigger]');
      const plaque = await trigger.locator('span').boundingBox();
      expect(plaque.x).toBeGreaterThanOrEqual(0); expect(plaque.x + plaque.width).toBeLessThan(width);
      await trigger.locator('span').tap();
      const dialog = page.locator('[data-city-lookout]');
      await expect(dialog).toBeVisible();
      const scene = dialog.locator('[data-lookout-panorama]');
      await expect(scene).toHaveAttribute('data-aim', /,/);
      const aim = await scene.getAttribute('data-aim');
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: width * .75, y: height * .42 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: width * .25, y: height * .42 }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect(scene).not.toHaveAttribute('data-aim', aim);
      await cdp.detach();
      await dialog.getByRole('button', { name: 'Volver al paseo' }).tap();
      await expect(dialog).not.toBeVisible();
      await goWorld(page, .162);
      await expect(trigger).toBeVisible();
      await trigger.locator('span').tap();
      await expect(dialog).toBeVisible();
      await dialog.getByRole('button', { name: 'Volver al paseo' }).tap();
      for (const progress of [2.7352, 2.9702, 3.2052]) {
        await goWorld(page, progress);
        const interview = page.locator('[data-hexy-interview]');
        await expect(interview.locator('[data-interview-layer="lantern"]')).toBeHidden();
        await expect.poll(() => interview.locator('[data-interview-layer="hexy"] img').evaluateAll(imgs => imgs.every(i => i.complete && i.naturalWidth))).toBe(true);
        const portrait = await interview.locator('[data-interview-layer="hexy"]').boundingBox();
        const copy = await interview.locator('[data-world-copy]').boundingBox();
        expect(portrait.y).toBeGreaterThanOrEqual(72);
        expect(portrait.y + portrait.height).toBeGreaterThan(copy.y + 18);
        expect(portrait.y + portrait.height).toBeLessThan(copy.y + 30);
        expect(copy.y + copy.height).toBeLessThan(height - 65);
        const faceBottom = portrait.y + portrait.height * .48;
        expect(faceBottom).toBeLessThan(copy.y - 15);
      }
      const interview = page.locator('[data-hexy-interview]');
      await interview.getByRole('button', { name: 'Hazle otra pregunta' }).tap();
      await interview.locator('[data-ask="cost"]').tap();
      await expect(interview).toHaveAttribute('data-question', 'cost');
      const portrait = await interview.locator('[data-interview-layer="hexy"]').boundingBox();
      const copy = await interview.locator('[data-world-copy]').boundingBox();
      expect(portrait.y + portrait.height).toBeGreaterThan(copy.y + 18);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
});

test('reduced-motion mobile portraits stay attached after scrolling and choosing longer answers', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page);
  const scene = page.locator('[data-hexy-interview]');
  await scene.scrollIntoViewIfNeeded();
  await scene.getByRole('button', { name: 'Hazle otra pregunta' }).click();
  await scene.locator('[data-ask="cost"]').click();
  const portrait = await scene.locator('[data-interview-layer="hexy"]').boundingBox();
  const heading = await scene.locator('[data-interview-heading]').boundingBox();
  expect(portrait.y + portrait.height).toBeGreaterThan(heading.y + 18);
  expect(portrait.y + portrait.height).toBeLessThan(heading.y + 30);
  const bounds = await scene.boundingBox();
  expect(portrait.y - bounds.y).toBeGreaterThan(65);
});

test('reduced motion keeps the lookout available, static and translated', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page);
  const trigger = page.locator('[data-lookout-trigger]');
  await expect(trigger).toHaveAttribute('data-inline', 'true');
  await trigger.click();
  const dialog = page.locator('[data-city-lookout]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-lookout-water]')).toHaveAttribute('data-renderer', 'fallback');
  await expect(dialog.locator('[data-lookout-water] canvas')).toHaveCount(0);
  await expect(dialog.locator('img[src$="clouds.webp"]')).toHaveCSS('animation-name', 'none');
  const scene = dialog.locator('[data-lookout-panorama]');
  const aim = await scene.getAttribute('data-aim');
  await dialog.getByRole('button', { name: 'Mirar a la derecha' }).click();
  await expect(scene).not.toHaveAttribute('data-aim', aim);
  await page.keyboard.press('Escape');
  await page.locator('[data-journey-menu-trigger]').click();
  await page.getByRole('button', { name: 'EN', exact: true }).first().click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Look through the binoculars' }).click();
  await expect(dialog.getByRole('heading')).toHaveText('The city, through your eyes.');
  await dialog.getByRole('button', { name: 'Leave the lookout' }).click();
  await expect(trigger).toBeFocused();
});
