import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('illustrated souvenirs open a conceptual photo album with keyboard and scroll restoration', async ({ page }) => {
  await openLanding(page, '#galeria-wonderpop');
  const dialog = page.locator('[data-keepsake-dialog]');
  for (const item of ['bunny', 'cosplay', 'music']) {
    const trigger = page.locator('[data-keepsake="' + item + '"]');
    await trigger.focus(); await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src', '/image/journey/photo-' + item + '-v20.webp');
    await expect(dialog).toContainText('Sin venta');
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600); await page.waitForTimeout(100);
    expect(await page.evaluate(() => scrollY)).toBe(before);
    expect(Math.abs((await page.locator('[data-stage]').boundingBox()).y)).toBeLessThan(1);
    await page.keyboard.press('Escape'); await expect(dialog).toBeHidden(); await expect(trigger).toBeFocused();
  }
});

test('friends, interview and ending work across viewport sizes without the player covering controls', async ({ page, request }) => {
  await openLanding(page);
  for (const [width, height] of [[1440,900], [2559,1303], [800,900], [390,844], [390,640]]) {
    await page.setViewportSize({ width, height });
    await goWorld(page, 1.59);
    for (const name of ['Luna', 'Mika', 'Leo']) {
      const button = page.getByRole('button', { name: new RegExp('^' + name) });
      await button.click(); await expect(button).toHaveAttribute('aria-pressed', 'true');
    }
    await goWorld(page, 1.89);
    for (const index of [0, 1, 2, 3]) {
      await page.locator('#question-' + index).click();
      await expect(page.locator('#question-' + index)).toHaveAttribute('aria-expanded', 'true');
      await page.locator('#wonderpop-answer a').click({ trial: true });
    }
    expect(await page.locator('[data-stage]').evaluate(el => el.scrollTop)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    await goWorld(page, 2.18);
    const end = page.locator('[data-world-farewell]');
    await expect(end).toBeVisible();
    for (const link of await end.locator('nav a').all()) await link.click({ trial: true });
    await expect(page.locator('[data-compact-player]')).toBeVisible();
  }
  for (const route of ['/bebidas','/hexy','/wonderpop-plaza','/nosotros']) expect((await request.get(route)).ok()).toBe(true);
});

test('golden sign covers scene crossings in both directions', async ({ page }) => {
  await openLanding(page);
  for (const cut of [1.075,1.43,1.75]) {
    for (const progress of [cut-.001,cut+.001,cut+.07,cut+.001,cut-.001]) {
      await goWorld(page, progress);
      expect(await page.locator('[data-stage]').evaluate(el => el.scrollTop)).toBe(0);
      if (Math.abs(progress-cut)<.01) {
        const box = await page.locator('[data-story-transition]').boundingBox();
        expect(box.width).toBeGreaterThan(1440*4);
        expect(box.x).toBeLessThan(-1440);
      }
    }
  }
});

test('English reduced motion retains every chapter and all useful actions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await openLanding(page);
  await page.getByRole('button',{name:'EN',exact:true}).first().click();
  for (const scene of ['gallery','visitors','interview']) {
    const section = page.locator('[data-world-scene="' + scene + '"]');
    await section.scrollIntoViewIfNeeded(); await expect(section).toBeVisible();
  }
  await page.locator('#question-3').click();
  await expect(page.locator('#wonderpop-answer')).toContainText('fictional universe');
  await page.locator('[data-world-scene="gallery"]').scrollIntoViewIfNeeded();
  await page.locator('[data-keepsake="bunny"]').click();
  await expect(page.locator('[data-keepsake-dialog]')).toContainText('Not for sale');
  await page.keyboard.press('Escape');
  expect(await page.locator('[data-journey]').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
});
