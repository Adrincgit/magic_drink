import { test, expect } from '@playwright/test';
import { readPixels } from './pixel-motion.helpers.js';

async function open(page, lang = 'es') {
  await page.addInitScript(lang => { if (!localStorage.getItem('lang')) localStorage.setItem('lang', lang); }, lang);
  await page.goto('/bebidas');
  await page.locator('astro-island[component-url*="MagicDrinkExperience"]:not([ssr])').waitFor({ state: 'attached' });
  await page.locator('[data-magic-drink] img').evaluateAll(imgs => Promise.all(imgs.map(img => { img.loading = 'eager'; return img.decode(); })));
  await page.evaluate(() => document.fonts.ready);
}

test('one Magic Drink, bilingual content, valid product art and no flavor catalogue', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await open(page);
  for (const lang of ['es', 'en']) {
    await page.getByRole('button', { name: lang.toUpperCase(), exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('h1')).toHaveText(lang === 'es' ? 'Destapala magia.' : 'Uncapthe magic.');
    await expect(page.locator('#la-carta')).toContainText(lang === 'es' ? 'Sin cafeína' : 'Caffeine free');
    await expect(page.locator('main')).not.toContainText(/Original|sabores|flavors|Bubble Tape|Dragon Grape|Banana Drama/i);
    expect(await page.title()).not.toMatch(/Original/i);
    expect(await page.locator('meta[name=description]').getAttribute('content')).not.toMatch(/Original/i);
  }
  await page.reload();
  await expect(page.locator('h1')).toContainText('Uncap');
  await expect(page.getByRole('button', { name: 'Open your Magic Drink', exact: true })).toBeEnabled();
  expect(errors).toEqual([]);
});

for (const width of [320, 390, 820, 1440, 2559]) {
  test(`the composition and controls fit at ${width}px with a separate portrait layout`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 1900 ? 1300 : 900 });
    await open(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
    const portrait = width <= 720;
    expect(await page.locator('[data-drink-ground=bar] img').evaluate(img => img.currentSrc)).toContain(portrait ? 'bar-mobile.webp' : 'bar-room.webp');
    for (const id of ['la-barra', 'la-carta', 'un-ratito-mas']) {
      await page.locator(`#${id}`).evaluate(el => el.scrollIntoView());
      for (const box of await page.locator(`#${id} h1, #${id} h2, #${id} [data-scene-control]`).evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, text:el.textContent }; }))) {
        expect(box.left, box.text).toBeGreaterThanOrEqual(4);
        expect(box.right, box.text).toBeLessThanOrEqual(width - 4);
      }
    }
    if (portrait) {
      await page.locator('#la-barra').evaluate(el => el.scrollIntoView());
      const button = await page.getByRole('button', { name: 'Abre tu Magic Drink', exact: true }).boundingBox();
      const can = await page.locator('[data-drink-contact=can]').boundingBox();
      expect(can.y).toBeGreaterThan(button.y + button.height + 20);
    }
  });
}

test('opening uses lid frames and leaves the label and contact point unchanged; keyboard can replay it', async ({ page }) => {
  await open(page);
  await page.addStyleTag({ content: '[data-hexy-finish] { display:none !important; } * { animation-play-state:paused !important; } [data-drink-contact=can] { background:#61384d; }' });
  await expect(page.locator('[data-drink-lift-cel]')).toHaveAttribute('data-ready', 'true');
  const can = page.locator('[data-drink-contact=can]');
  const beforeBox = await can.boundingBox();
  const capture = () => page.screenshot({ clip:{ x:beforeBox.x, y:beforeBox.y+beforeBox.height*.28, width:beforeBox.width, height:beforeBox.height*.72 } }).then(readPixels);
  const before = await capture();
  const button = page.getByRole('button', { name: 'Abre tu Magic Drink', exact: true });
  await button.focus(); await button.press('Enter');
  await expect(can).toHaveAttribute('data-open', 'true');
  await expect(page.getByRole('status')).toHaveText('Ese sonidito. Esa sonrisa.');
  const cels = page.locator('[data-drink-lift-cel], [data-drink-open-cel]');
  await cels.evaluateAll(els => els.forEach(el => el.getAnimations().forEach(a => a.currentTime = 100)));
  await expect(page.locator('[data-drink-lift-cel]')).toHaveCSS('visibility', 'visible');
  await expect(page.locator('[data-drink-open-cel]')).toHaveCSS('visibility', 'hidden');
  await cels.evaluateAll(els => els.forEach(el => el.getAnimations().forEach(a => a.currentTime = 400)));
  await expect(page.locator('[data-drink-lift-cel]')).toHaveCSS('visibility', 'hidden');
  const after = await capture();
  expect(after.data.reduce((max, v, i) => Math.max(max, Math.abs(v - before.data[i])), 0)).toBeLessThanOrEqual(3);
  expect(await can.boundingBox()).toEqual(beforeBox);
  await expect(page.locator('[data-drink-open-cel]')).toHaveCSS('visibility', 'visible');
  await page.getByRole('button', { name: '¿Otra vez?', exact: true }).press('Enter');
  await expect(can).toHaveAttribute('data-open', 'false');
  await expect(page.locator('[data-drink-open-cel]')).toHaveCSS('visibility', 'hidden');
});

test('camera depth moves the exterior while counter, can, furniture and their contact planes stay registered', async ({ page }) => {
  await open(page);
  const measure = () => page.evaluate(() => [...document.querySelectorAll('[data-drink-scene]')].map(scene => {
    const ground = scene.querySelector('[data-drink-ground]').getBoundingClientRect();
    const contact = scene.querySelector('[data-drink-contact]').getBoundingClientRect();
    return { x:contact.x-ground.x, y:contact.y-ground.y, city:getComputedStyle(scene.querySelector('[data-drink-layer=city]')).transform };
  }));
  await page.mouse.move(720,450); await page.waitForTimeout(400);
  const before = await measure();
  await page.mouse.move(1370,450); await page.evaluate(() => scrollBy(0,210)); await page.waitForTimeout(700);
  const after = await measure();
  expect(after[0].city).not.toBe(before[0].city);
  for (const i of [0,1]) { expect(after[i].x).toBeCloseTo(before[i].x,1); expect(after[i].y).toBeCloseTo(before[i].y,1); }
  await page.locator('#un-ratito-mas').evaluate(el => el.scrollIntoView());
  await expect(page.locator('[data-drink-scene=bar]')).toHaveAttribute('data-visible','false');
  await expect(page.locator('[data-drink-bunny-cel]')).toHaveCSS('animation-play-state','running');
});

test('menu restores focus and scroll; language and opening state survive closing it', async ({ page }) => {
  await open(page);
  await page.getByRole('button',{name:'Abre tu Magic Drink',exact:true}).click();
  await page.locator('#un-ratito-mas').evaluate(el=>el.scrollIntoView());
  const scroll=await page.evaluate(()=>scrollY);
  const trigger=page.getByRole('button',{name:'Menú',exact:true});
  await trigger.click();
  const menu=page.locator('[data-drink-menu]');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link',{name:'Magic Drink',exact:true})).toHaveAttribute('aria-current','page');
  await menu.getByRole('button',{name:/Acabado ilustrado/}).click();
  await expect(page.locator('[data-hexy-finish]')).toHaveAttribute('data-enabled','false');
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible(); await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>scrollY)).toBeCloseTo(scroll,0);
  await expect(page.locator('[data-drink-contact=can]')).toHaveAttribute('data-open','true');
});

test('reduced motion retains complete artwork and stops the camera, cels and atmosphere', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'}); await open(page);
  await expect(page.locator('[data-magic-drink]')).toHaveAttribute('data-reduced-motion','true');
  await page.getByRole('button',{name:'Abre tu Magic Drink',exact:true}).click();
  await expect(page.locator('[data-drink-open-cel]')).toHaveCSS('visibility','visible');
  await expect(page.locator('[data-drink-lift-cel]')).toHaveCSS('animation-name','none');
  await expect(page.locator('[data-drink-bunny-cel]')).toHaveCSS('animation-name','none');
  await expect(page.locator('[data-drink-layer=city]').first()).toHaveCSS('transform','none');
});

test('failed opening artwork preserves the complete can and all navigation', async ({ page }) => {
  await page.route('**/can-open.webp', route=>route.abort());
  await page.goto('/bebidas');
  await expect(page.getByRole('status')).toHaveText('Tu Magic Drink está aquí.');
  await expect(page.locator('[data-drink-can]')).toBeVisible();
  await expect(page.getByRole('button',{name:'Abre tu Magic Drink',exact:true})).toBeDisabled();
  await expect(page.getByRole('link',{name:'Vamos a Wonderpop',exact:true})).toHaveAttribute('href','/wonderpop-plaza');
});
