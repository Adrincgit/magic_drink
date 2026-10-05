import { test, expect } from '@playwright/test';

async function open(page) {
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
}

// Measure contacts in the painted room's coordinates, not viewport coordinates.
// A camera may move; a Bunny's seat or a chair's feet must not slide on that room.
async function contacts(backdrop) {
  return backdrop.evaluate(el => {
    const room = el.querySelector('[data-room-plate]').getBoundingClientRect();
    return [...el.querySelectorAll('[data-ground-props], [data-bunny-seat]')].map(item => {
      const r = item.getBoundingClientRect();
      return { x: (r.x - room.x) / room.width, y: (r.bottom - room.y) / room.height, width: r.width / room.width };
    });
  });
}

for (const width of [390, 1440, 2559]) {
  test(`floor and tabletop contacts do not slide at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    for (const room of ['backstage', 'studio', 'encore']) {
      await page.locator(`[data-hexy-scene="${room}"]`).evaluate(el => el.scrollIntoView());
      const backdrop = page.locator(`[data-room-backdrop="${room}"]`);
      await expect(backdrop).toHaveCSS('visibility', 'visible');
      await expect.poll(() => backdrop.locator('img').evaluateAll(imgs => imgs.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
      await page.mouse.move(40, 300); await page.waitForTimeout(700);
      const before = await contacts(backdrop);
      const floor = await backdrop.locator('[data-room-plate]').boundingBox();
      await page.mouse.move(width - 40, 500);
      await page.mouse.wheel(0, 190); await page.waitForTimeout(700);
      const after = await contacts(backdrop);
      expect(Math.abs((await backdrop.locator('[data-room-plate]').boundingBox()).y - floor.y)).toBeGreaterThan(.1);
      expect(after.length).toBe(before.length);
      for (let i = 0; i < before.length; i++) {
        expect(after[i].x).toBeCloseTo(before[i].x, 5);
        expect(after[i].y).toBeCloseTo(before[i].y, 5);
        expect(after[i].width).toBeCloseTo(before[i].width, 5);
      }
      if (room === 'backstage') {
        expect(before).toHaveLength(1);
        expect(before[0]).toEqual({ x: 0, y: 1, width: 1 });
      }
      if (room === 'studio') {
        expect(before).toHaveLength(4);
        // The painted desk's rear edge descends from left to right. Verify the
        // visible feet (94% down the sprite) sit INSIDE the wooden surface,
        // as well as staying still relative to it when the camera moves.
        const feet = await backdrop.evaluate(el => {
          const plate = el.querySelector('[data-room-plate]').getBoundingClientRect();
          return [...el.querySelectorAll('[data-bunny-seat]')].map(seat => {
            const r = seat.getBoundingClientRect();
            return { x: (r.x + r.width * .5 - plate.x) / plate.width,
              y: (r.bottom - r.height * .06 - plate.y) / plate.height };
          });
        });
        feet.forEach(foot => {
          const paintedDeskEdge = .70 + .14 * foot.x;
          expect(foot.y - paintedDeskEdge).toBeGreaterThan(.025);
          expect(foot.y).toBeLessThan(.87);
        });
      }
      if (room === 'encore') {
        // The independent performer and her contact shadow share the stage's
        // coordinate system, while the sky can travel behind its open dome.
        await expect(backdrop.locator('[data-room-plate]')).toHaveAttribute('src', /world-v46\/hall/);
        await expect(backdrop.locator('[data-ground-composition]>img')).toHaveCount(1);
      }
    }
  });
}

test('the Bunny choir animates above planted seats and stops when its room leaves view', async ({ page }) => {
  await open(page);
  await page.locator('#estudio').evaluate(el => el.scrollIntoView());
  const backdrop = page.locator('[data-room-backdrop=studio]');
  const performer = backdrop.locator('[data-bunny-performer]').first();
  const before = await contacts(backdrop);
  await page.locator('#estudio').getByRole('button', { name: /One more take/ }).click();
  await expect(performer).toHaveCSS('animation-play-state', 'running');
  const scale = await performer.evaluate(el => getComputedStyle(el).scale);
  await page.waitForTimeout(180);
  expect(await performer.evaluate(el => getComputedStyle(el).scale)).not.toBe(scale);
  const singing = await contacts(backdrop);
  singing.forEach((contact, i) => {
    expect(contact.x).toBeCloseTo(before[i].x, 5);
    expect(contact.y).toBeCloseTo(before[i].y, 5);
  });
  await page.locator('[data-hexy-scene=encore]').evaluate(el => el.scrollIntoView());
  await expect(performer).toHaveCSS('animation-play-state', 'paused');
});

test('hanging stars attach overhead and the concert has no foreground curtains', async ({ page }) => {
  await open(page);
  for (const room of ['backstage', 'studio']) {
    const rig = page.locator(`[data-room-backdrop=${room}] [data-hanging-rig]`);
    await expect(rig.locator('[data-star-pendant]')).toHaveCount(3);
    await page.locator(`[data-hexy-scene="${room}"]`).evaluate(el => el.scrollIntoView());
    const rail = await rig.locator('div').first().boundingBox();
    const hangers = await rig.locator('[data-star-pendant]').evaluateAll(els => els.map(el => el.getBoundingClientRect().top));
    for (const y of hangers) expect(Math.abs(y - rail.y)).toBeLessThanOrEqual(14);
  }
  await expect(page.locator('[data-room-scene=records]')).toHaveCount(0);
  await expect(page.locator('[data-passage-overlap=encore]')).toHaveCount(0);
  await expect(page.locator('[data-room-backdrop=encore] [data-room-layer="curtains"]')).toHaveCount(0);
  await expect(page.locator('[data-passage-overlap=encore-curtains]')).toHaveCount(0);
  await expect(page.locator('[data-room-backdrop=encore] img[src*="bunny"]')).toHaveCount(0);
});

test('the common finish can be toggled without blocking controls or moving fixed navigation', async ({ page }) => {
  await open(page);
  const nav = page.getByRole('navigation', { name: 'Hexy navigation' });
  const initial = await nav.boundingBox();
  const finish = page.locator('[data-hexy-finish]');
  await expect(finish).toHaveCSS('pointer-events', 'none');
  await expect(finish).toHaveAttribute('data-enabled', 'true');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  const toggle = page.getByRole('button', { name: /Illustrated finish/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(finish).toHaveCSS('display', 'none');
  await toggle.click();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Listen to music' }).click();
  await expect.poll(() => page.locator('audio').evaluate(audio => audio.currentTime)).toBeGreaterThan(0);
  await page.locator('#estudio').evaluate(el => el.scrollIntoView());
  const after = await nav.boundingBox();
  expect(after.y).toBeCloseTo(initial.y, 1);
  expect(after.width).toBeCloseTo(initial.width, 1);
  const finishBounds = await page.locator('[data-finish-grain]').boundingBox();
  expect(finishBounds.y).toBe(0);
  expect(finishBounds.height).toBe(900);
});

test('reduced motion preserves all artwork but stops camera and moving grain', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  await page.locator('#estudio').evaluate(el => el.scrollIntoView());
  const layers = page.locator('[data-room-layer]');
  await expect(page.locator('[data-ground-composition]')).toHaveCount(3);
  expect(await layers.evaluateAll(els => els.every(el => getComputedStyle(el).transform === 'none'))).toBe(true);
  await expect(page.locator('[data-finish-grain]')).toHaveAttribute('data-grain-state', 'still');
  expect(await page.locator('[data-bunny-performer]').evaluateAll(els => els.every(el => getComputedStyle(el).animationName === 'none'))).toBe(true);
  await expect(page.locator('[data-room-backdrop=studio]')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('[data-room-backdrop=encore]')).toHaveCSS('visibility', 'hidden');
});
