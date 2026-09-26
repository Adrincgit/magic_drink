import { test, expect } from '@playwright/test';

async function openWorld(page) {
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
  await expect(page.locator('[data-hexy-world]')).toHaveAttribute('data-reduced-motion', 'false');
}

test('the stage has distinct pointer and scroll depth without moving the text', async ({ page }) => {
  await openWorld(page);
  const scene = page.locator('[data-hexy-scene="stage"]');
  const layers = scene.locator('[data-parallax-depth]');
  await expect(layers).toHaveCount(14);
  const heading = page.getByRole('heading', { level: 1 });
  const beforeCopy = await heading.boundingBox();
  const positions = () => layers.evaluateAll(els => els.map(el => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return { name: el.dataset.scenery, x: matrix.m41, y: matrix.m42 };
  }));
  await page.mouse.move(150, 300); await page.waitForTimeout(1100);
  const left = await positions();
  await page.mouse.move(1270, 500); await page.waitForTimeout(1100);
  const right = await positions();
  const moves = right.map((point, i) => Math.abs(point.x - left[i].x));
  expect(moves[0]).toBeGreaterThan(4);
  const characterMove = moves[right.findIndex(layer => layer.name === 'hexy')];
  const palaceMove = moves[right.findIndex(layer => layer.name === 'palaces')];
  expect(characterMove).toBeGreaterThan(moves[0] * 2.5);
  expect(palaceMove).toBeLessThan(characterMove * .3);
  expect((await heading.boundingBox()).x).toBeCloseTo(beforeCopy.x, 1);
  await page.mouse.wheel(0, 280); await page.waitForTimeout(500);
  const scrolled = await positions();
  expect(Math.abs(scrolled[0].y - right[0].y)).toBeGreaterThan(2);
});

test('Hexy reacts to music and greetings using loaded character frames', async ({ page }) => {
  await openWorld(page);
  const character = page.locator('[data-hexy-character]');
  await expect(character).toHaveAttribute('data-pose', 'listen');
  await expect.poll(() => character.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
  await page.getByRole('button', { name: 'Listen to music' }).click();
  await expect(character).toHaveAttribute('data-pose', 'excited');
  await character.click();
  await expect(character).toHaveAttribute('data-pose', 'explain');
  await expect(page.locator('[aria-live="polite"]')).toContainText('saved you a spot');
  await page.waitForTimeout(3100);
  await expect(character).toHaveAttribute('data-pose', 'excited');
  await page.getByRole('button', { name: 'Pause music' }).click();
  await expect(character).toHaveAttribute('data-pose', 'listen');
});

test('the illustrated menu supports navigation, keyboard exit and language persistence', async ({ page }) => {
  await openWorld(page);
  const trigger = page.getByRole('button', { name: 'Menu', exact: true });
  await trigger.click();
  const menu = page.getByRole('dialog');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: /Magic Drink/ })).toHaveAttribute('href', '/bebidas');
  await expect(menu.getByRole('link', { name: /Wonderpop Plaza/ })).toHaveAttribute('href', '/wonderpop-plaza');
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Menú', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'ES', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('backstage notes work by keyboard and the studio has an expressive frame', async ({ page }) => {
  await openWorld(page);
  const tabs = page.getByRole('tablist', { name: 'Meet Hexy' });
  const first = tabs.getByRole('tab').first();
  await first.scrollIntoViewIfNeeded();
  await first.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tabpanel').filter({ visible: true })).toContainText('Small songs. Big feelings.');
  await page.keyboard.press('End');
  await expect(page.getByRole('tabpanel').filter({ visible: true })).toContainText('The chorus is yours');
  await page.getByRole('button', { name: 'Meet the Magic Bunnies' }).click();
  const studio = page.locator('#estudio');
  await expect(studio).toBeInViewport();
  await studio.getByRole('button', { name: /A little smile/ }).click();
  await expect(studio).toHaveAttribute('data-take', 'true');
  await expect(studio.getByRole('button')).toContainText('La-la');
  await expect(studio.locator('img[src*="studio-blink"]')).toHaveCSS('opacity', '1');
});

test('reduced motion keeps layers still and lets visitors trigger expressions themselves', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
  const layers = page.locator('[data-hexy-scene="stage"] [data-parallax-depth]');
  await page.mouse.move(100, 300); await page.mouse.move(1200, 500);
  await expect.poll(() => layers.evaluateAll(els => els.every(el => getComputedStyle(el).transform === 'none'))).toBe(true);
  await page.getByRole('button', { name: 'Say hello to Hexy' }).click();
  await expect(page.locator('[data-hexy-character]')).toHaveAttribute('data-pose', 'explain');
  expect(await page.locator('[data-hexy-character] img[src*="hexy-blink"]').evaluate(img => getComputedStyle(img).animationName)).toBe('none');
});

test('vinyl rotates with actual playback and keeps its angle when paused, including the mini player', async ({ page }) => {
  await openWorld(page);
  const disc = page.locator('#hexy-player [data-vinyl]');
  await expect(disc).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Listen to music' }).click();
  await expect(disc).toHaveCSS('animation-play-state', 'running');
  const rotation = await disc.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(240);
  expect(await disc.evaluate(el => getComputedStyle(el).transform)).not.toBe(rotation);
  await page.getByRole('button', { name: 'Pause music' }).click();
  await expect(disc).toHaveCSS('animation-play-state', 'paused');
  const paused = await disc.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(240);
  expect(await disc.evaluate(el => getComputedStyle(el).transform)).toBe(paused);
  await page.locator('#canciones').getByRole('button', { name: 'Play Hexy Wow', exact: true }).click();
  const miniDisc = page.getByRole('complementary', { name: 'Mini player' }).locator('[data-vinyl]');
  await expect(miniDisc).toHaveCSS('animation-play-state', 'running');
  await page.getByRole('complementary', { name: 'Mini player' }).getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(miniDisc).toHaveCSS('animation-play-state', 'paused');
});

test('clouds move while idle and foreground plants reach into the next section without covering Hexy', async ({ page }) => {
  await openWorld(page);
  const clouds = page.locator('[data-scenery="clouds-far"] img');
  const first = await clouds.evaluate(el => getComputedStyle(el).transform);
  await page.waitForTimeout(300);
  expect(await clouds.evaluate(el => getComputedStyle(el).transform)).not.toBe(first);
  expect(await page.locator('[data-hexy-character]').evaluate(el => {
    const r = el.getBoundingClientRect();
    return el.contains(document.elementFromPoint(r.x + r.width * .5, r.y + r.height * .3));
  })).toBe(true);
  await page.mouse.wheel(0, 400); await page.waitForTimeout(600);
  await expect(page.locator('#camerino')).toHaveCSS('overflow', 'clip');
  const hero = await page.locator('#hexy-stage').boundingBox();
  const next = await page.locator('#camerino').boundingBox();
  const foliage = await page.locator('[data-foliage-bridge] img[src$="trailing-plants.webp"]').boundingBox();
  expect(foliage.y).toBeLessThan(hero.y + hero.height);
  expect(foliage.y + foliage.height).toBeGreaterThan(next.y + 30);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
});

for (const width of [320, 550, 680, 820, 1024, 1440, 1920, 2559]) {
  test(`Hexy's full horizontal silhouette remains in frame at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openWorld(page);
    const character = page.locator('[data-hexy-character]');
    await character.scrollIntoViewIfNeeded();
    await page.mouse.move(width - 2, 600);
    await page.waitForTimeout(800);
    const bounds = await character.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    const stats = await page.locator('[class*="fameStrip"]').boundingBox();
    if (width <= 900) expect(bounds.y).toBeGreaterThan(stats.y + stats.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });
}
