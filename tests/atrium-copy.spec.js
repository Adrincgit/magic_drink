import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('the welcome plaque remains readable and its link reachable in small viewports', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const copy = page.locator('[data-world-copy="interior"]');
  for (const [width, height] of [[1440, 900], [390, 844], [390, 640], [844, 390]]) {
    await page.setViewportSize({ width, height });
    await goWorld(page, .96);
    const link = copy.getByRole('link', { name: 'Conoce la plaza' });
    await expect(link).toBeVisible();
    const box = await link.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThan(65);
    expect(box.x + box.width).toBeLessThan(width);
    expect(box.y + box.height).toBeLessThan(height - 35);
    expect(await link.evaluate(el => {
      const box = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    })).toBe(true);
  }
  await copy.getByRole('link', { name: 'Conoce la plaza' }).click();
  await expect(page).toHaveURL(/\/wonderpop-plaza\/?$/);
});

test('English and reduced motion preserve the atrium information in normal document flow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page);
  await page.getByRole('button', { name: 'EN', exact: true }).first().click();
  const copy = page.locator('[data-world-copy="interior"]');
  await copy.scrollIntoViewIfNeeded();
  await expect(copy.getByRole('heading')).toContainText('Welcome to');
  await expect(copy.getByRole('link', { name: 'Get to know the plaza' })).toBeVisible();
  await expect(page.locator('[data-atrium-engine] canvas')).toHaveCount(0);
});
