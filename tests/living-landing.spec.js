import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('cold entry waits for decoded art and then releases the scene without a timer', async ({ page }) => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/cafe-table-v13.webp', async route => { await held; await route.continue(); });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-journey]')).toHaveAttribute('data-ready', 'true');
  const curtain = page.locator('[data-journey-loader]');
  await expect(curtain).toBeVisible();
  await expect(page.locator('[data-journey]')).toHaveAttribute('data-assets-ready', 'false');
  expect(await page.locator('[data-stage]').evaluate(el => el.inert)).toBe(true);
  await page.screenshot({ path: 'context/rediseno/implementacion-v13/capturas/loading.png' });
  release();
  await expect(curtain).toBeHidden();
  expect(await page.locator('[data-stage]').evaluate(el => el.inert)).toBe(false);
  expect(await page.locator('[data-critical]').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await page.getByRole('link', { name: 'Descubre por qué', exact: true }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test('failed images and a stalled request do not trap the visitor in loading', async ({ page }) => {
  await page.route('**/potted-jasmine-v13.webp', route => route.abort());
  await openLanding(page);
  await expect(page.locator('[data-journey-loader]')).toBeHidden();
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/cafe-table-v13.webp', async route => { await held; await route.abort(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Entrar ahora' }).click({ timeout: 8000 });
  await expect(page.locator('[data-journey-loader]')).toBeHidden();
  expect(await page.locator('[data-stage]').evaluate(el => el.inert)).toBe(false);
  release();
  await goWorld(page, .162);
});

test('wheel input has intermediate Lenis frames and reduced motion returns to native scrolling', async ({ page }) => {
  await openLanding(page);
  await expect(page.locator('[data-journey]')).toHaveAttribute('data-scroll-engine', 'lenis');
  await page.evaluate(() => {
    window.wheelPositions = [];
    const end = performance.now() + 900;
    function frame() { window.wheelPositions.push(scrollY); if (performance.now() < end) requestAnimationFrame(frame); }
    requestAnimationFrame(frame);
  });
  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 900);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(900, -1);
  const positions = await page.evaluate(() => window.wheelPositions.filter(y => y > 0 && y < 899));
  expect(new Set(positions).size).toBeGreaterThan(8);
  for (let i = 1; i < positions.length; i++) expect(positions[i]).toBeGreaterThanOrEqual(positions[i - 1]);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-journey]')).toHaveAttribute('data-scroll-engine', 'native');
  expect(await page.locator('html').getAttribute('class')).not.toContain('lenis');
  expect(await page.locator('[data-depth="water"] div').evaluate(el => getComputedStyle(el, '::before').animationName)).toBe('none');
});

test('the can responds to keyboard, repeated bursts stay bounded, and star positions do not tile', async ({ page }) => {
  await openLanding(page);
  const button = page.locator('[data-can-button]');
  await button.focus();
  await button.press('Enter');
  await expect(page.locator('[data-can-burst]')).toBeVisible();
  await button.press('Space');
  await button.press('Enter');
  await expect(page.locator('[data-can-burst]')).toHaveCount(1);
  const positions = await page.locator('[data-journey-stars] i').evaluateAll(nodes => nodes.map(node => [parseFloat(node.style.left), parseFloat(node.style.top)]));
  expect(new Set(positions.map(([x]) => x)).size).toBe(positions.length);
  expect(new Set(positions.map(([, y]) => y)).size).toBe(positions.length);
  await goWorld(page, .162);
  await expect(page.locator('[data-can-burst]')).toHaveCount(0);
  await expect(button).toBeDisabled();
});

test('playlist and compact player share one continuing audio element, including next and close', async ({ page }) => {
  await openLanding(page, '#hexy');
  const audio = page.locator('audio');
  await audio.evaluate(el => { el.dataset.identity = 'same-audio'; });
  const main = page.locator('[data-scene-player]');
  const toggle = main.getByRole('button', { name: 'Lista de canciones' });
  await toggle.click();
  await main.getByRole('button', { name: /Hexy Wow Hexy/ }).click();
  await expect.poll(() => audio.evaluate(el => !el.paused && el.currentTime > .1)).toBe(true);
  await expect(audio).toHaveAttribute('src', '/audio/demos/hexy_wow_demo.mp3');
  await audio.evaluate(el => { el.currentTime = 10; });
  await goWorld(page, .49);
  const compact = page.locator('[data-compact-player]');
  await expect(compact).toBeVisible();
  await expect(compact).toContainText('Hexy Wow');
  expect(await audio.evaluate(el => el.currentTime)).toBeGreaterThanOrEqual(10);
  await expect(audio).toHaveAttribute('data-identity', 'same-audio');
  await expect(audio).toHaveCount(1);
  await compact.getByRole('button', { name: 'Lista de canciones' }).click();
  await compact.getByRole('button', { name: /Roundy-Round Hexy/ }).scrollIntoViewIfNeeded();
  await page.keyboard.press('Escape');
  await expect(compact.getByRole('button', { name: 'Lista de canciones' })).toBeFocused();
  await compact.getByRole('button', { name: 'Siguiente canción' }).click();
  await expect(audio).toHaveAttribute('src', '/audio/demos/dancing_rere_demo.mp3');
  await goWorld(page, .3132);
  await expect(compact).toHaveCount(0);
  await expect(main).toContainText('Dancing Re-Re');
  await main.locator('summary').click();
  await expect(main.locator('details div')).toHaveText('DJ Sweet Hex');
  await goWorld(page, .68);
  await compact.getByRole('button', { name: 'Cerrar y detener la música' }).click();
  expect(await audio.evaluate(el => el.paused)).toBe(true);
  await expect(compact).toHaveCount(0);
});

test('reduced-motion reader keeps the player accessible and avoids duplicate compact controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLanding(page, '#hexy');
  await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
  await expect(page.locator('[data-compact-player]')).toHaveCount(0);
  await page.locator('#wonderpop').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-compact-player]')).toBeVisible();
  await page.locator('[data-compact-player]').getByRole('button', { name: 'Cerrar y detener la música' }).click();
});
