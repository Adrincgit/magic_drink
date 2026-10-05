import { test, expect } from '@playwright/test';
import { readPixels } from './pixel-motion.helpers.js';

async function open(page) {
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
  await page.locator('[data-concert-journey]').evaluate(el => el.scrollIntoView());
  await page.locator('[data-concert-journey] img').evaluateAll(imgs => Promise.all(imgs.map(img => img.decode())));
}

test('the dome and performance share one long environment with a separate high resolution performer', async ({ page }) => {
  await open(page);
  const journey = page.locator('[data-concert-journey]');
  const transition = await page.locator('[data-concert-transition]').boundingBox();
  const show = await page.locator('[data-concert-show]').boundingBox();
  expect(transition.height).toBeGreaterThan(900);
  expect(show.y).toBeCloseTo(transition.y + transition.height, 1);
  await expect(journey.locator('[data-concert-canvas]')).toHaveCount(1);
  const performer = page.locator('[data-hexy-master]');
  expect((await performer.boundingBox()).y).toBeGreaterThan(900);
  const pixels = await performer.evaluate(img => {
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
    const alpha = (x, y) => ctx.getImageData(Math.floor(x * c.width), Math.floor(y * c.height), 1, 1).data[3];
    return { height: img.naturalHeight, rendered: img.getBoundingClientRect().height, outside: [alpha(.01, .01), alpha(.04, .5), alpha(.5, .8)], body: alpha(.5, .3) };
  });
  expect(pixels.height).toBeGreaterThanOrEqual(1536);
  expect(pixels.height).toBeGreaterThan(pixels.rendered);
  pixels.outside.forEach(a => expect(a).toBeLessThan(10));
  expect(pixels.body).toBeGreaterThan(245);
});

for (const width of [390, 1440, 2559]) {
  test(`the open stage keeps the full performer centered and clear of the ticket at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await open(page);
    const scene = page.locator('[data-concert-journey]');
    await expect(scene.locator('[data-concert-layer=curtains]')).toHaveCount(0);
    await expect(scene).toHaveCSS('border-top-width', '0px');
    await expect(scene.locator('[data-room-backdrop]')).toHaveCSS('opacity', '1');
    await page.locator('[data-concert-show]').evaluate(el => el.scrollIntoView());
    const hexy = await page.locator('[data-concert-hexy]').boundingBox();
    const ticket = await page.locator('[data-concert-ticket]').boundingBox();
    const stage = await page.locator('[data-room-backdrop=encore] [data-room-plate]').boundingBox();
    expect(hexy.x + hexy.width / 2).toBeCloseTo(stage.x + stage.width / 2, 1);
    expect(Math.abs(hexy.x + hexy.width / 2 - width / 2)).toBeLessThan(6);
    expect(hexy.y).toBeGreaterThan(90);
    expect(hexy.y + hexy.height).toBeLessThan(960);
    expect(hexy.height).toBeLessThan(600);
    const face = { x: hexy.x + hexy.width * .5, y: hexy.y + hexy.height * .18 };
    expect(face.x).toBeGreaterThan(35); expect(face.x).toBeLessThan(width - 35);
    expect(face.y).toBeGreaterThan(85); expect(face.y).toBeLessThan(750);
    expect(face.x < ticket.x || face.x > ticket.x + ticket.width || face.y < ticket.y || face.y > ticket.y + ticket.height).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('the two cloud planes move at different depths while Hexy stays registered on stage', async ({ page }) => {
  await open(page);
  const positions = () => page.evaluate(() => {
    const floor = document.querySelector('[data-room-backdrop=encore] [data-room-plate]').getBoundingClientRect();
    const body = document.querySelector('[data-concert-hexy]').getBoundingClientRect();
    return { contact: { x: (body.x - floor.x) / floor.width, y: (body.bottom - floor.y) / floor.height },
      cloud: ['far-clouds', 'near-clouds'].map(name => new DOMMatrix(getComputedStyle(document.querySelector(`[data-concert-layer="${name}"]`)).transform).m42) };
  });
  await page.mouse.move(80, 400); await page.waitForTimeout(650);
  const before = await positions();
  await page.mouse.wheel(0, 400); await page.mouse.move(1300, 500); await page.waitForTimeout(650);
  const after = await positions();
  expect(after.contact.x).toBeCloseTo(before.contact.x, 5);
  expect(after.contact.y).toBeCloseTo(before.contact.y, 5);
  const far = after.cloud[0] - before.cloud[0], near = after.cloud[1] - before.cloud[1];
  expect(far).toBeGreaterThan(2); expect(near).toBeGreaterThan(far * 1.5);
});

test('the concert loops pause offscreen and reduced motion preserves a complete static scene', async ({ page }) => {
  await open(page);
  const cloud = page.locator('[data-concert-layer=near-clouds] img');
  const pose = page.locator('[data-concert-cel=blink]');
  const initial = await cloud.evaluate(el => getComputedStyle(el).translate);
  await page.waitForTimeout(400);
  expect(await cloud.evaluate(el => getComputedStyle(el).translate)).not.toBe(initial);
  await page.locator('#estudio').evaluate(el => el.scrollIntoView());
  await expect(cloud).toHaveCSS('animation-play-state', 'paused');
  await expect(pose).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-hexy-world]')).toHaveAttribute('data-reduced-motion', 'true');
  await expect(cloud).toHaveCSS('animation-name', 'none');
  await expect(pose).toHaveCSS('animation-name', 'none');
  expect(await page.locator('[data-concert-journey] [data-room-layer]').evaluateAll(els => els.every(el => getComputedStyle(el).transform === 'none'))).toBe(true);
});

test('the concert ticket opens the current playlist and returns to the same scene', async ({ page }) => {
  await open(page);
  await page.locator('[data-concert-show]').evaluate(el => el.scrollIntoView());
  const scroll = await page.evaluate(() => scrollY);
  await page.locator('[data-concert-ticket]').getByRole('button', { name: /One more song/ }).click();
  await expect(page.locator('[data-listening-room]')).toBeVisible();
  await expect(page.locator('audio')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-listening-room]')).not.toBeVisible();
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(scroll, 0);
});

test('the balcony covers the join with solid artwork and the dome has no overlay label', async ({ page }) => {
  await open(page);
  await expect(page.getByText('FOLLOW THE LIGHTS', { exact: true })).toHaveCount(0);
  await expect(page.getByText('SIGUE LAS LUCES', { exact: true })).toHaveCount(0);
  for (const width of [390, 1440, 2559]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.locator('[data-concert-journey]').evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - 450));
    const coverage = await page.evaluate(async () => {
      const scene = document.querySelector('[data-concert-journey]').getBoundingClientRect();
      const img = document.querySelector('[data-passage-overlap=concert-balcony] img');
      await img.decode(); const r = img.getBoundingClientRect();
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      return Array.from({ length: 25 }, (_, i) => ctx.getImageData(Math.floor((innerWidth * (i + .5) / 25 - r.x) / r.width * c.width), Math.floor((scene.top - r.y) / r.height * c.height), 1, 1).data[3]);
    });
    coverage.forEach(a => expect(a).toBeGreaterThan(240));
  }
});

test('dome and stage lanterns swing around fixed chain attachments', async ({ page }) => {
  await open(page);
  const lamps = page.locator('[data-concert-pendant]');
  expect(await lamps.count()).toBeGreaterThan(10);
  const sample = time => lamps.evaluateAll((els, time) => els.map(el => {
    el.getAnimations().forEach(a => { a.pause(); a.currentTime = time; });
    const x = Number(el.dataset.anchorX), y = Number(el.dataset.anchorY);
    const m = el.getCTM();
    const root = new DOMPoint(x, y).matrixTransform(m), body = new DOMPoint(x, y + 180).matrixTransform(m);
    return { root: [root.x, root.y], body: [body.x, body.y] };
  }), time);
  const before = await sample(0), after = await sample(2400);
  for (const i of [6, 19]) {
    expect(after[i].root[0]).toBeCloseTo(before[i].root[0], 2);
    expect(after[i].root[1]).toBeCloseTo(before[i].root[1], 2);
    expect(Math.hypot(after[i].body[0] - before[i].body[0], after[i].body[1] - before[i].body[1])).toBeGreaterThan(1);
  }
});

test('registered singing and blink cels change the face while the body and boots stay identical', async ({ page }) => {
  await open(page);
  await page.locator('[data-concert-show]').evaluate(el => el.scrollIntoView());
  const hexy = page.locator('[data-concert-hexy]');
  await expect(hexy).toHaveAttribute('data-frames-ready', 'true');
  // Let the scroll observer register the stage before freezing the scene.
  await page.waitForTimeout(800);
  await page.addStyleTag({ content: '[data-hexy-finish], .cinematic-grain::before, [data-concert-layer=confetti] { display: none !important; } * { animation-play-state: paused !important; } [data-concert-hexy] { background: #37253f; }' });
  await page.evaluate(() => document.getAnimations().forEach(a => { a.pause(); a.currentTime = 0; }));
  const box = await hexy.boundingBox();
  // Compare the actual performer over a solid backing to exclude scenery
  // pixels that show through the sprite's transparent background.
  const capture = () => page.screenshot({ clip: box }).then(readPixels);
  const region = (frame, x, y, width, height) => {
    const rows = [];
    const left = Math.floor(frame.width * x), top = Math.floor(frame.height * y);
    const w = Math.floor(frame.width * width), h = Math.floor(frame.height * height);
    for (let row = top; row < top + h; row++) rows.push(frame.data.subarray((row * frame.width + left) * 3, (row * frame.width + left + w) * 3));
    return Buffer.concat(rows);
  };
  const baseline = await capture();
  const body = region(baseline, .1, .4, .8, .6), face = region(baseline, .38, .128, .24, .115);
  for (const time of [800, 4280]) {
    await hexy.locator('[data-concert-cel]').evaluateAll((els, t) => els.forEach(el => el.getAnimations().forEach(a => { a.currentTime = t; })), time);
    const frame = await capture();
    const nextBody = region(frame, .1, .4, .8, .6);
    // Chrome can round a few antialiased pixels by 1–2 RGB values when the
    // expression starts compositing. Any actual pose/foot change exceeds this.
    const bodyDifference = nextBody.reduce((max, value, i) => Math.max(max, Math.abs(value - body[i])), 0);
    expect(bodyDifference).toBeLessThanOrEqual(3);
    const next = region(frame, .38, .128, .24, .115);
    const changed = next.reduce((n, v, i) => n + (Math.abs(v - face[i]) > 12 ? 1 : 0), 0);
    expect(changed / face.length).toBeGreaterThan(.02);
  }
  await expect(hexy.locator('[data-hexy-shadow]')).toBeVisible();
});

test('an unavailable expression leaves the original complete character visible', async ({ page }) => {
  await page.route('**/world-v48/hexy-blink.webp', route => route.abort());
  await page.goto('/hexy');
  await page.locator('astro-island[component-url*="HexyShowcase"]:not([ssr])').waitFor({ state: 'attached' });
  await page.locator('[data-concert-show]').evaluate(el => el.scrollIntoView());
  await page.locator('[data-hexy-master]').evaluate(img => img.decode());
  await expect(page.locator('[data-concert-hexy]')).toHaveAttribute('data-frames-ready', 'false');
  await expect(page.locator('[data-hexy-master]')).toBeVisible();
  await expect(page.locator('[data-concert-cel=vowel]')).toHaveCSS('opacity', '0');
});
