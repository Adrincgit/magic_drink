import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

for (const { name, viewport, reducedMotion } of [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' },
  { name: 'phone', viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' },
  { name: 'reduced motion', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' },
]) {
  test(`the mini player appears without prior playback and respects explicit dismissal (${name})`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion });
    await openLanding(page, '#festival');
    const player = page.locator('[data-compact-player]');
    const audio = page.locator('audio');
    const visit = async (progress, selector) => {
      if (reducedMotion === 'reduce') {
        await page.locator(selector).evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
      } else await goWorld(page, progress);
    };
    for (const [progress, selector] of [[.49, '#festival'], [.68, '#wonderpop'], [.96, '[data-world-copy="interior"]'], [1.2, '[data-world-scene="gallery"]']]) {
      await visit(progress, selector);
      await expect(player).toBeVisible();
      await expect(player.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' })).toBeVisible();
      expect(await audio.evaluate(el => el.paused && el.currentTime === 0)).toBe(true);
    }
    await player.getByRole('button', { name: 'Cerrar y detener la música' }).click();
    await expect(player).toHaveCount(0);
    await visit(.49, '#festival');
    await expect(player).toHaveCount(0);
    await visit(1.2, '[data-world-scene="gallery"]');
    await expect(player).toHaveCount(0);
    await visit(.3132, '#hexy');
    await expect(player).toHaveCount(0);
    await page.locator('[data-scene-player]').getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
    await expect.poll(() => audio.evaluate(el => el.paused)).toBe(false);
    await visit(.49, '#festival');
    await expect(player).toBeVisible();
    await player.getByRole('button', { name: 'Pausar No Brain, Just Vibes!' }).click();
    await expect(player).toBeVisible();
    await player.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
    await expect.poll(() => audio.evaluate(el => el.paused)).toBe(false);
    await player.getByRole('button', { name: 'Cerrar y detener la música' }).click();
    await expect(player).toHaveCount(0);
    expect(await audio.evaluate(el => el.paused)).toBe(true);
    await visit(.96, '[data-world-copy="interior"]');
    await expect(player).toHaveCount(0);
  });
}

test('one navigation spans all nine scenes, works backwards and reflects the complete journey', async ({ page }) => {
  await openLanding(page);
  const nav = page.locator('[data-journey-navigation]');
  const stops = [0, .162, .3132, .49, .68, .96, 1.25, 1.59, 1.89];
  await expect(nav.getByRole('button')).toHaveCount(9);
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const index of [3, 4, 5, 6, 7, 8, 5, 2, 1, 0]) {
      await nav.getByRole('button').nth(index).click();
      await expect.poll(() => page.locator('[data-journey]').evaluate(el => Number(el.dataset.worldProgress))).toBeCloseTo(stops[index], 2);
      await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
      await expect(nav.locator('[aria-current="step"]')).toHaveCount(1);
      await expect(nav.getByRole('button').nth(index)).toHaveAttribute('aria-pressed', 'true');
      await expect(nav.locator('[data-journey-label] b')).toHaveText(`${String(index + 1).padStart(2, '0')} / 09`);
    }
    await goWorld(page, 2.18);
    await expect.poll(() => nav.locator('[data-progress-bar]').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).m11)).toBe(1);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await goWorld(page, 2.18);
  await page.getByRole('button', { name: 'EN', exact: true }).first().click();
  await expect(nav).toHaveAttribute('aria-label', 'Journey scenes');
  await expect(nav.locator('[data-journey-label]')).toContainText('BEFORE YOU GO');
});

test('a single atrium fills the viewport throughout the doorway, including reverse scrolling', async ({ page }) => {
  await openLanding(page);
  for (const [width, height] of [[1440, 900], [2559, 1303], [390, 844]]) {
    await page.setViewportSize({ width, height });
    for (const progress of [.8, .825, .84, .848, .852, .86, .878, .95, .852, .825]) {
      await goWorld(page, progress);
      const room = await page.locator('[data-world-interior]').evaluate(el => ({
        backdrop: getComputedStyle(el).backgroundImage,
        bounds: el.querySelector('[data-atrium]').getBoundingClientRect().toJSON(),
      }));
      expect(room.backdrop).toBe('none');
      expect(room.bounds.top).toBeLessThanOrEqual(.5);
      expect(room.bounds.left).toBeLessThanOrEqual(.5);
      expect(room.bounds.right).toBeGreaterThanOrEqual(width - .5);
      expect(room.bounds.bottom).toBeGreaterThanOrEqual(height - .5);
    }
  }
});

test('the compact cover follows next song and playlist selection; artwork cannot be dragged', async ({ page }) => {
  await openLanding(page, '#hexy');
  await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
  await goWorld(page, .49);
  const player = page.locator('[data-compact-player]');
  await expect(player.locator('[data-current-cover]')).toHaveAttribute('src', '/image/music_covers/nobrain_just_vibes.webp');
  await player.getByRole('button', { name: 'Siguiente canción' }).click();
  await expect(player.locator('[data-current-cover]')).toHaveAttribute('src', '/image/music_covers/hexy_wow.webp');
  await player.getByRole('button', { name: 'Lista de canciones' }).click();
  await player.getByRole('button', { name: /Dancing Re-Re/ }).click();
  await expect(player.locator('[data-current-cover]')).toHaveAttribute('src', '/image/music_covers/dancing_rere.webp');
  await expect(player).toContainText('Dancing Re-Re');
  await expect(page.locator('audio')).toHaveAttribute('src', '/audio/demos/dancing_rere_demo.mp3');
  const images = page.locator('[data-journey] img');
  expect(await images.evaluateAll(els => els.every(el => {
    const event = new DragEvent('dragstart', { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
    return event.defaultPrevented;
  }))).toBe(true);
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await goWorld(page, 1);
    for (const button of await page.locator('[data-journey-navigation] button, [data-atrium-directory] a').all()) await button.click({ trial: true });
    await goWorld(page, 2.18);
    await page.locator('[data-world-farewell] button').click({ trial: true });
    const cover = await player.locator('[data-current-cover]').boundingBox();
    const text = await player.locator('strong').first().boundingBox();
    expect(cover.x + cover.width).toBeLessThan(text.x);
    expect(await page.locator('audio').evaluate(el => el.paused)).toBe(false);
  }
});
