import { test, expect } from '@playwright/test';

async function openHexy(page) {
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
}
const audioState = (page) => page.locator('audio').evaluate(audio => ({
  paused: audio.paused, time: audio.currentTime, duration: audio.duration, src: audio.currentSrc, loop: audio.loop,
}));

for (const width of [320, 390]) {
  test(`the expanded player scrolls its complete queue inside the phone at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openHexy(page);
    const trigger = page.getByRole('button', { name: 'Explore songs', exact: true });
    await trigger.click();
    const room = page.locator('[data-listening-room]');
    const bounds = await room.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
    const previousScroll = await page.evaluate(() => scrollY);
    await room.getByRole('button', { name: 'Play Roundy-Round' }).click();
    await expect.poll(async () => (await audioState(page)).paused).toBe(false);
    expect(await page.evaluate(() => scrollY)).toBe(previousScroll);
    expect(await room.evaluate(el => el.scrollWidth - el.clientWidth)).toBe(0);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    expect((await audioState(page)).paused).toBe(false);
  });
}

test('hero playback, pause and keyboard seeking control one real audio element', async ({ page }) => {
  await openHexy(page);
  await expect(page.locator('audio')).toHaveCount(1);
  expect((await audioState(page)).paused).toBe(true);
  await expect.poll(async () => (await audioState(page)).duration).toBeGreaterThan(10);
  await page.getByRole('button', { name: 'Listen to music', exact: true }).click();
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(.1);
  await expect(page.getByRole('button', { name: 'Pause music', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause music', exact: true }).click();
  expect((await audioState(page)).paused).toBe(true);
  const slider = page.getByRole('slider', { name: 'Song position' });
  await slider.focus();
  await page.keyboard.press('Home');
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await audioState(page)).time).toBeCloseTo(5, 0);
});

test('expanded listening room preserves playback, focus and scroll, and shares the mini player', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await openHexy(page);
  const trigger = page.getByRole('button', { name: 'Explore songs', exact: true });
  const beforeScroll = await page.evaluate(() => scrollY);
  await trigger.click();
  const songs = page.locator('[data-listening-room]');
  await expect(songs).toBeVisible();
  await expect(songs.getByRole('group', { name: 'Choose a song' }).getByRole('button')).toHaveCount(6);
  await songs.getByRole('button', { name: 'Play Hexy Wow', exact: true }).click();
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(.1);
  await page.locator('audio').evaluate(audio => { audio.currentTime = 20; });
  await page.keyboard.press('Escape');
  await expect(songs).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(beforeScroll, 0);
  expect((await audioState(page)).paused).toBe(false);
  expect((await audioState(page)).time).toBeGreaterThanOrEqual(20);
  await page.locator('#estudio').scrollIntoViewIfNeeded();
  const mini = page.getByRole('complementary', { name: 'Mini player' });
  await expect(mini).toContainText('Hexy Wow');
  const expand = mini.getByRole('button', { name: 'Expand player' });
  await expand.click();
  await expect(songs.getByRole('heading')).toHaveText('Hexy Wow');
  await expect(songs.locator('[data-vinyl]')).toHaveCSS('animation-play-state', 'running');
  await songs.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(songs.locator('[data-vinyl]')).toHaveCSS('animation-play-state', 'paused');
  const slider = songs.getByRole('slider', { name: 'Song position' });
  await slider.focus(); await page.keyboard.press('Home'); await page.keyboard.press('ArrowRight');
  expect((await audioState(page)).time).toBeCloseTo(1, 0);
  await songs.getByRole('button', { name: 'Play Dancing Re-Re' }).click();
  await songs.getByRole('button', { name: 'Close listening room' }).click();
  await expect(expand).toBeFocused();
  await expect(mini).toContainText('Dancing Re-Re');
  await mini.getByRole('button', { name: 'Close player and pause' }).click();
  await expect(mini).toHaveCount(0);
  expect((await audioState(page)).paused).toBe(true);
  await expect(page.locator('audio')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('playlist resumes its current paused song and Escape returns focus', async ({ page }) => {
  await openHexy(page);
  const toggle = page.getByRole('button', { name: 'Full playlist' });
  await toggle.click();
  await page.getByRole('group', { name: 'Choose a song' }).getByRole('button', { name: /No Brain, Just Vibes!/ }).click();
  await expect.poll(async () => (await audioState(page)).paused).toBe(false);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await page.locator('#hexy-player').getByRole('button', { name: 'Pause', exact: true }).click();
  await toggle.click();
  await page.getByRole('group', { name: 'Choose a song' }).getByRole('button', { name: /No Brain, Just Vibes!/ }).click();
  await expect.poll(async () => (await audioState(page)).paused).toBe(false);
  await toggle.click();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('next, repeat, shuffle and automatic advance stay synchronized', async ({ page }) => {
  await openHexy(page);
  const player = page.locator('#hexy-player');
  await player.getByRole('button', { name: 'Next song' }).click();
  expect((await audioState(page)).paused).toBe(true);
  await player.getByRole('button', { name: 'Play', exact: true }).click();
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(.1);
  await expect(player).toContainText('Hexy Wow');
  await player.getByRole('button', { name: 'Repeat song' }).click();
  await expect(player.getByRole('button', { name: 'Repeat song' })).toHaveAttribute('aria-pressed', 'true');
  expect((await audioState(page)).loop).toBe(true);
  await player.getByRole('button', { name: 'Repeat song' }).click();
  await page.locator('audio').evaluate(audio => { audio.currentTime = audio.duration - .15; });
  await expect(player).toContainText('Dancing Re-Re');
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(.1);
  await player.getByRole('button', { name: 'Shuffle' }).click();
  const previous = (await audioState(page)).src;
  await player.getByRole('button', { name: 'Next song' }).click();
  await expect.poll(async () => (await audioState(page)).src).not.toBe(previous);
  await expect(player.getByRole('button', { name: 'Shuffle' })).toHaveAttribute('aria-pressed', 'true');
});

test('a failed song shows retry and recovers without creating another player', async ({ page }) => {
  await openHexy(page);
  await page.route('**/hexy_wow_demo.mp3', route => route.abort());
  await page.getByRole('button', { name: 'Explore songs', exact: true }).click();
  await page.locator('#canciones').getByRole('button', { name: 'Play Hexy Wow', exact: true }).click();
  const mini = page.locator('[data-listening-room]');
  await expect(mini.getByRole('status')).toContainText('could not be loaded');
  await page.unroute('**/hexy_wow_demo.mp3');
  await mini.getByRole('button', { name: 'Try again' }).click();
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(.1);
  await expect(mini.getByRole('status')).toHaveCount(0);
  await expect(page.locator('audio')).toHaveCount(1);
});

test('reduced motion keeps the hero and decorative effects still while audio plays', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHexy(page);
  await page.getByRole('button', { name: 'Listen to music', exact: true }).click();
  await expect.poll(async () => (await audioState(page)).time).toBeGreaterThan(.1);
  await expect(page.locator('[data-hexy-world]')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(page.locator('[data-blob]')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveClass(/hexy-playing/);
});

test('Spanish playback labels and headline follow the language switch', async ({ page }) => {
  await openHexy(page);
  await page.getByRole('button', { name: 'ES', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Bienvenido al mundo de');
  await page.getByRole('button', { name: 'Escuchar música' }).click();
  await expect(page.getByRole('button', { name: 'Pausar música' })).toBeVisible();
  await expect(page.getByRole('slider', { name: 'Posición de la canción' })).toBeVisible();
  await page.getByRole('button', { name: 'Explorar canciones', exact: true }).click();
  await expect(page.locator('#canciones').getByRole('button', { name: 'Pausar No Brain, Just Vibes!' })).toHaveAttribute('aria-pressed', 'true');
});

for (const width of [320, 390, 768, 1024]) {
  test(`playback and page content fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await openHexy(page);
    await page.getByRole('button', { name: 'Listen to music', exact: true }).click();
    await expect.poll(async () => (await audioState(page)).paused).toBe(false);
    await page.locator('#estudio').scrollIntoViewIfNeeded();
    const mini = page.getByRole('complementary', { name: 'Mini player' });
    await expect(mini).toBeVisible();
    const bounds = await mini.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await mini.getByRole('button', { name: 'Pause', exact: true }).click();
    expect((await audioState(page)).paused).toBe(true);
  });
}
