const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const dir = path.join(__dirname, 'capturas'); fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  const sizes = process.argv.includes('--tablet') ? [[800, 900]] : process.argv.includes('--extra') ? [[2559, 1303], [800, 900], [390, 640]] : [[1440, 900], [390, 844]];
  for (const [width, height] of sizes) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto('http://localhost:4321/#hexy');
    await page.locator('[data-journey][data-assets-ready=true]').waitFor();
    await page.locator('[data-journey-loader]').waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
    for (const [name, p] of [['door', .852], ['atrium', .89], ['directory', .99], ['turn-before', 1.062], ['turn-covered', 1.075], ['turn-after', 1.09], ['gallery', 1.2], ['end', 1.4]]) {
      await page.locator('[data-runway]').evaluate((el, p) => scrollTo({ top: (el.offsetHeight - el.querySelector('[data-stage]').offsetHeight) * p / Number(el.closest('[data-journey]').dataset.worldEnd), behavior: 'instant' }), p);
      await page.waitForTimeout(500);
      console.log(width, name, await page.locator('[data-stage]').evaluate(el => ({ scroll: el.scrollTop, top: el.getBoundingClientRect().top, continuationScroll: el.querySelector('[data-continuation]').scrollTop, progress: el.closest('[data-journey]').dataset.worldProgress })));
      await page.screenshot({ path: path.join(dir, `${width}x${height}-${name}.png`) });
    }
    const gallery = page.locator('[data-world-scene="gallery"]');
    await gallery.getByRole('button', { name: 'Siguiente pieza' }).click();
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(dir, `${width}x${height}-magic-change.png`) });
    await page.waitForTimeout(600);
    await gallery.getByRole('button', { name: /^Ver detalle:/ }).click();
    await page.screenshot({ path: path.join(dir, `${width}x${height}-detail.png`) });
    await page.keyboard.press('Escape');
    await gallery.getByRole('button', { name: 'Mapa de la plaza' }).click();
    await page.screenshot({ path: path.join(dir, `${width}x${height}-map.png`) });
    await page.keyboard.press('Escape');
    await gallery.getByRole('button', { name: 'Hexy', exact: true }).click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(dir, `${width}x${height}-music.png`) });
    await page.close();
  }
  await browser.close(); console.log(JSON.stringify({ errors }, null, 2));
})();
