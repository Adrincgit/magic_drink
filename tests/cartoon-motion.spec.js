import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { openLanding, goWorld } from './landing.helpers';

test('smaller can keeps its foot on the table through hover, scroll and viewport changes', async ({ page }) => {
  await openLanding(page);
  for (const [width, height, ratio] of [[1440, 900, .455], [900, 900, .406], [390, 844, .28]]) {
    await page.setViewportSize({ width, height });
    await goWorld(page, 0);
    await page.mouse.move(1, 1);
    const geometry = () => page.evaluate(() => {
      const can = document.querySelector('[data-can-button]').getBoundingClientRect();
      const table = document.querySelector('[data-hero-table]').getBoundingClientRect();
      return { height: can.height, foot: can.y + can.height * .94, tableY: table.y, deltaX: can.x + can.width / 2 - table.x, deltaY: can.y + can.height * .94 - table.y, tableHeight: table.height };
    });
    const before = await geometry();
    expect(before.height / height).toBeCloseTo(ratio, 2);
    expect(before.deltaY).toBeGreaterThan(0);
    expect(before.deltaY / before.tableHeight).toBeLessThan(.18);
    await page.locator('[data-can-button]').hover();
    await page.waitForTimeout(400);
    const hovered = await geometry();
    // Pointer parallax moves can and table together; hover grows from the foot.
    expect(hovered.deltaY).toBeCloseTo(before.deltaY, 0);
    expect(hovered.deltaX).toBeCloseTo(before.deltaX, 0);
    await page.mouse.move(1, 1);
    await page.waitForTimeout(400);
    await goWorld(page, .025);
    const scrolled = await geometry();
    expect(scrolled.deltaY).toBeCloseTo(before.deltaY, 0);
    expect(scrolled.deltaX).toBeCloseTo(before.deltaX, 0);
  }
});

test('condensation changes drawn poses and vapor travels behind the can and above the viewport', async ({ page }) => {
  await openLanding(page);
  const dew = page.locator('[data-condensation]');
  const pose = await dew.getAttribute('data-frame');
  await expect.poll(() => dew.getAttribute('data-frame')).not.toBe(pose);
  await page.locator('[data-can-button]').click();
  const burst = page.locator('[data-can-burst]');
  expect(await burst.evaluate(el => +getComputedStyle(el).zIndex)).toBeLessThan(await page.locator('[data-can-button]').evaluate(el => +getComputedStyle(el).zIndex));
  const note = burst.locator(':scope > span').first();
  const initial = await note.boundingBox();
  await expect.poll(async () => (await note.boundingBox())?.y, { timeout: 6000 }).toBeLessThan(-40);
  expect(initial.y).toBeGreaterThan(100);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(dew).toHaveAttribute('data-frame', '0');
  await page.waitForTimeout(400);
  await expect(dew).toHaveAttribute('data-frame', '0');
});

test('water pixels ripple while bridge, sun and floor anchors remain stable; lost context falls back', async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await openLanding(page);
  const water = page.locator('[data-water-motion]');
  await expect(water).toHaveAttribute('data-renderer', 'webgl');
  await page.addStyleTag({ content: '* { animation-play-state: paused !important; transition: none !important; }' });
  // Compare real pixels: these clips contain river and an unmoving bridge pier.
  const riverClip = { x: 560, y: 685, width: 85, height: 35 };
  const bridgeClip = { x: 570, y: 627, width: 38, height: 20 };
  const pixels = async clip => sharp(await page.screenshot({ clip })).raw().toBuffer();
  const riverBefore = await pixels(riverClip), bridgeBefore = await pixels(bridgeClip);
  await page.waitForTimeout(500);
  const riverAfter = await pixels(riverClip), bridgeAfter = await pixels(bridgeClip);
  const changed = (a, b) => a.reduce((n, byte, i) => n + (Math.abs(byte - b[i]) > 8 ? 1 : 0), 0) / a.length;
  expect(changed(riverBefore, riverAfter)).toBeGreaterThan(.005);
  expect(changed(bridgeBefore, bridgeAfter)).toBeLessThan(.005);
  for (const progress of [.025, .162, .30]) {
    await goWorld(page, progress);
    const transforms = await page.locator('[data-depth]').evaluateAll(els => Object.fromEntries(els.map(el => [el.dataset.depth, { transform: getComputedStyle(el).transform, pivot: getComputedStyle(el).transformOrigin, look: getComputedStyle(el).translate }])));
    expect(transforms.water.transform).toBe(transforms.distance.transform);
    expect(transforms.sun.transform).toBe(transforms.distance.transform);
    expect(transforms.furniture).toEqual(transforms.street);
  }
  await water.locator('canvas').evaluate(canvas => { window.riverContext = canvas.getContext('webgl2').getExtension('WEBGL_lose_context'); window.riverContext.loseContext(); });
  await expect(water).toHaveAttribute('data-renderer', 'fallback');
  await expect(water.locator('img')).toBeVisible();
  await page.waitForTimeout(100);
  await page.evaluate(() => window.riverContext.restoreContext());
  await expect(water).toHaveAttribute('data-renderer', 'webgl');
  await goWorld(page, .49);
  const stopped = await water.evaluate(el => el.waterDiagnostics().frames);
  await page.waitForTimeout(250);
  expect(await water.evaluate(el => el.waterDiagnostics().frames)).toBe(stopped);
  expect(errors).toEqual([]);
});

test('stage responds to real audio energy, resets on pause and airship crosses horizontally at rest', async ({ page }) => {
  await openLanding(page, '#hexy');
  await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
  await goWorld(page, .49);
  const root = page.locator('[data-journey]');
  await expect(root).toHaveAttribute('data-audio-reactive', 'true');
  await expect.poll(() => root.evaluate(el => el.audioEnergy)).toBeGreaterThan(.1);
  const lights = page.locator('[data-stage-lights]');
  expect(await lights.evaluate(el => Number(getComputedStyle(el).opacity))).toBeGreaterThan(.7);
  const ship = page.locator('[data-airship] img');
  const x = (await ship.boundingBox()).x;
  await page.waitForTimeout(700);
  expect((await ship.boundingBox()).x).toBeLessThan(x - 10);
  await page.locator('[data-compact-player]').getByRole('button', { name: 'Pausar No Brain, Just Vibes!' }).click();
  await expect(root).toHaveAttribute('data-audio-reactive', 'false');
  expect(await root.evaluate(el => el.audioEnergy)).toBe(0);
  expect(await lights.evaluate(el => Number(getComputedStyle(el).opacity))).toBe(.7);
  await page.locator('[data-compact-player]').getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
  await expect.poll(() => root.evaluate(el => el.audioEnergy)).toBeGreaterThan(.1);
  await goWorld(page, .68);
  expect(await page.locator('audio').evaluate(el => el.paused)).toBe(false);
  expect(await root.evaluate(el => el.audioEnergy)).toBe(0);
});

test('finishing a playing track advances, but seeking a paused track to its end stays paused', async ({ page }) => {
  await openLanding(page, '#hexy');
  const audio = page.locator('audio');
  await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
  await expect.poll(() => audio.evaluate(el => Number.isFinite(el.duration))).toBe(true);
  await audio.evaluate(el => { el.currentTime = el.duration - .15; });
  await expect(audio).toHaveAttribute('src', '/audio/demos/hexy_wow_demo.mp3');
  await expect.poll(() => audio.evaluate(el => !el.paused && el.currentTime > .1)).toBe(true);
  await page.getByRole('button', { name: 'Pausar Hexy Wow' }).click();
  await page.getByRole('slider', { name: 'Posición de la canción' }).press('End');
  await page.waitForTimeout(350);
  await expect(audio).toHaveAttribute('src', '/audio/demos/hexy_wow_demo.mp3');
  expect(await audio.evaluate(el => el.paused)).toBe(true);
  expect(await audio.evaluate(el => Math.abs(el.currentTime - el.duration))).toBeLessThan(1);
  // A range step may round just below duration. Exercise exact completion too.
  await audio.evaluate(el => { el.currentTime = el.duration; });
  await page.waitForTimeout(350);
  await expect(audio).toHaveAttribute('src', '/audio/demos/hexy_wow_demo.mp3');
  expect(await audio.evaluate(el => el.paused)).toBe(true);
});
