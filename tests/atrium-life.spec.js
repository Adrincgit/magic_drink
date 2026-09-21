import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('existing visitors change held drawings without walking or moving the camera', async ({ page }) => {
  await openLanding(page, '#directorio-wonderpop');
  const world = page.locator('[data-atrium-engine]');
  await expect(world).toHaveAttribute('data-renderer', 'webgl');
  const before = await world.evaluate(el => el.atriumDiagnostics);
  await expect.poll(() => world.evaluate(el => el.atriumDiagnostics.ambientFrame), { timeout: 9000 }).not.toBe(before.ambientFrame);
  expect(await world.evaluate(el => el.atriumDiagnostics.camera)).toEqual(before.camera);
  await goWorld(page, 1.89);
  const interview = page.locator('[data-illustration="interview"]');
  await expect(interview).toHaveAttribute('data-renderer', 'webgl');
  await page.locator('#question-1').click();
  await expect.poll(() => interview.evaluate(el => el.illustrationDiagnostics.ambientFrame)).toBe(1);
  await page.locator('#question-2').click();
  await expect.poll(() => interview.evaluate(el => el.illustrationDiagnostics.ambientFrame)).toBe(0);
});
