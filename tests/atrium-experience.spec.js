import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';

test('speaker cones and notes move at rest; the stage roof really occludes the airship', async ({ page }) => {
  await openLanding(page);
  await goWorld(page, .49);
  const cone = page.locator('[data-speaker="left"] span img').first();
  const note = page.locator('[data-music-notes] span').first();
  const transform = await cone.evaluate(el => getComputedStyle(el).transform);
  const noteY = (await note.boundingBox()).y;
  await expect.poll(() => cone.evaluate(el => getComputedStyle(el).transform)).not.toBe(transform);
  await expect.poll(async () => (await note.boundingBox()).y).not.toBe(noteY);
  await page.addStyleTag({ content: '* { animation-play-state: paused !important; transition: none !important; }' });
  const clip = await page.evaluate(() => {
    const stage = document.querySelector('[data-festival-rig]').getBoundingClientRect();
    const ship = document.querySelector('[data-airship]');
    const x = stage.x + stage.width * .5, y = stage.y + stage.height * .13;
    Object.assign(ship.style, { left: `${x - 140}px`, top: `${y - 280 / 3}px`, width: '280px', transform: 'none', translate: 'none' });
    Object.assign(ship.firstElementChild.style, { animation: 'none', transform: 'none' });
    return { x: Math.round(x - 20), y: Math.round(y - 15), width: 40, height: 30 };
  });
  const before = await sharp(await page.screenshot({ clip })).raw().toBuffer();
  await page.locator('[data-airship]').evaluate(el => el.style.zIndex = '3');
  const inFront = await sharp(await page.screenshot({ clip })).raw().toBuffer();
  await page.locator('[data-airship]').evaluate(el => el.style.display = 'none');
  const after = await sharp(await page.screenshot({ clip })).raw().toBuffer();
  const difference = (a, b) => a.reduce((n, byte, i) => n + (Math.abs(byte - b[i]) > 8 ? 1 : 0), 0) / a.length;
  expect(difference(before, after)).toBeLessThan(.01);
  expect(difference(inFront, after)).toBeGreaterThan(.1);
});

test('the entrance reveals the atrium through an expanding doorway and reverses cleanly', async ({ page }) => {
  await openLanding(page);
  const garden = page.locator('[data-garden-world]');
  for (const progress of [.80, .84, .852]) {
    await goWorld(page, progress);
    await expect(garden).toHaveAttribute('data-renderer', 'webgl');
    expect(await garden.evaluate(el => getComputedStyle(el).clipPath)).toContain('evenodd');
    await expect(page.locator('[data-atrium-engine]')).toBeVisible();
  }
  await goWorld(page, .878);
  await expect(garden).toBeHidden();
  await expect(page.locator('[data-world-copy="interior"]')).toContainText('Bienvenido a');
  await goWorld(page, .76);
  expect(await garden.evaluate(el => getComputedStyle(el).clipPath)).toBe('none');
  await expect(page.locator('[data-world-interior]')).toBeHidden();
  await goWorld(page, .84);
  await garden.locator('canvas').evaluate(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await expect(garden).toHaveAttribute('data-renderer', 'fallback');
  expect(await garden.evaluate(el => getComputedStyle(el).clipPath)).toBe('none');
  await goWorld(page, 1);
  await expect(page.locator('[data-atrium-engine]')).toBeVisible();
});
