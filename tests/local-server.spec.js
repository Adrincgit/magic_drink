import { test, expect } from '@playwright/test';
import { goWorld } from './landing.helpers';

test('localhost and IPv4 hydrate navigation and the journey after reloads', async ({ page }) => {
  const failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(message.text());
  });
  page.on('response', (response) => {
    if (response.request().resourceType() === 'script' && response.status() >= 400) {
      failures.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const origin of ['http://localhost:4321', 'http://127.0.0.1:4321']) {
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    for (let load = 0; load < 2; load++) {
      if (load) await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-journey]')).toHaveAttribute('data-ready', 'true');
      await page.locator('header').getByRole('button', { name: 'EN', exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await page.locator('header').getByRole('button', { name: 'ES', exact: true }).click();
      await expect(page.locator('html')).toHaveAttribute('lang', 'es');
      await goWorld(page, 0.49);
      await expect(page.locator('[data-world-scene="festival"]')).toHaveAttribute(
        'data-world-active', 'true',
      );
      await goWorld(page, 1.4);
      await page.getByRole('button', { name: 'Volver al inicio' }).click();
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3);
    }
  }
  expect(failures).toEqual([]);
});
