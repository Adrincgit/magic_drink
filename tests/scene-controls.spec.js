import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';

test('illustrated links work with keyboard; the player seeks and keeps its signature in credits', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await openLanding(page);
  const enter = page.getByRole('link', { name: 'Descubre por qué', exact: true });
  await enter.focus();
  await expect(enter).toBeFocused();
  await enter.press('Enter');
  await expect.poll(() => page.locator('[data-journey]').evaluate(el => Number(el.dataset.progress))).toBeCloseTo(.45, 2);
  const follow = page.getByRole('link', { name: 'Sigue la música', exact: true });
  await follow.focus();
  await follow.press('Enter');
  await expect(page.locator('[data-scene-player]')).toBeVisible();
  const credits = page.locator('[data-scene-player] details');
  await expect(credits.locator('strong')).toBeHidden();
  await credits.locator('summary').focus();
  await credits.locator('summary').press('Enter');
  await expect(credits.locator('strong')).toHaveText('DJ Sweet Hex');
  await expect(credits.locator('strong')).toBeVisible();
  await credits.locator('summary').press('Enter');
  const audio = page.locator('audio');
  expect(await audio.evaluate(el => el.paused)).toBe(true);
  const play = page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' });
  await play.focus();
  await play.press('Space');
  await expect.poll(() => audio.evaluate(el => el.paused)).toBe(false);
  await page.getByRole('button', { name: 'Pausar No Brain, Just Vibes!' }).click();
  const seek = page.getByRole('slider', { name: 'Posición de la canción' });
  await expect(seek).toBeEnabled();
  await seek.focus();
  await seek.press('End');
  expect(await audio.evaluate(el => Math.abs(el.currentTime - el.duration))).toBeLessThan(1);
  expect(await audio.evaluate(el => el.paused)).toBe(true);
  expect(errors).toEqual([]);
});

test('Magic Drink is the sole public name across all routes, navigation and metadata in ES and EN', async ({ page }) => {
  for (const lang of ['es', 'en']) {
    await page.addInitScript(lang => localStorage.setItem('lang', lang), lang);
    for (const route of ['/', '/bebidas', '/hexy', '/wonderpop-plaza', '/nosotros', '/magicdrinkday', '/contacto']) {
      await page.goto(route, { waitUntil: 'networkidle' });
      if (route === '/') {
        await page.locator('[data-journey-menu-trigger]').click();
        await expect(page.locator('[data-journey-menu] a[href="/bebidas"]')).toContainText('Magic Drink');
        await page.keyboard.press('Escape');
      } else await expect(page.locator('header a[href="/bebidas"]').first()).toHaveText('Magic Drink');
      await expect(page.locator('body')).not.toContainText(/\bOriginal\b|línea de bebidas|drink line/i);
      expect(await page.title()).not.toMatch(/Original/i);
      expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toMatch(/Original/i);
      if (route === '/bebidas') {
        await expect(page.locator('main')).toContainText(lang === 'es' ? 'Saludable. Sin cafeína.' : 'Healthy. Caffeine free.');
      }
    }
  }
});

test('information and decorated controls fit phones and stay clear of navigation', async ({ page }) => {
  for (const viewport of [{ width: 360, height: 740 }, { width: 390, height: 844 }, { width: 820, height: 1180 }]) {
    await page.setViewportSize(viewport);
    await openLanding(page);
    for (const [progress, copy] of [[0, '[data-chapter="0"]'], [.162, '[data-chapter="1"]'], [.3132, '[data-chapter="2"]'], [.49, '[data-world-copy="festival"]'], [.68, '[data-world-copy="plaza"]']]) {
      await goWorld(page, progress);
      const rectangles = await page.locator(copy).locator('[data-scene-control], [data-scene-note], [data-scene-player], [data-scene-label]').evaluateAll(els => els.filter(el => getComputedStyle(el).display !== 'none').map(el => {
        const b = el.getBoundingClientRect();
        return { text: el.textContent.slice(0, 35), left: b.left, right: b.right, top: b.top, bottom: b.bottom };
      }));
      for (const box of rectangles) {
        expect(box.left, box.text).toBeGreaterThanOrEqual(8);
        expect(box.right, box.text).toBeLessThanOrEqual(viewport.width - 8);
        expect(box.top, box.text).toBeGreaterThan(70);
        expect(box.bottom, box.text).toBeLessThan(viewport.height - 50);
      }
    }
  }
});
