const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const dir = path.join(__dirname, 'capturas'); fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  for (const [width, height] of [[1440, 900], [2559, 1303], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:4321');
    await page.locator('[data-journey][data-assets-ready=true]').waitFor();
    await page.locator('[data-journey-loader]').waitFor({ state: 'hidden' });
    for (const [name, p] of [['hero', 0], ['city', .162], ['hexy', .3132], ['festival', .49], ['door', .84], ['door-middle', .848], ['door-end', .852], ['atrium', .878], ['directory', 1]]) {
      await page.locator('[data-runway]').evaluate((el, p) => scrollTo({ top: (el.offsetHeight - el.querySelector('[data-stage]').offsetHeight) * p, behavior: 'instant' }), p);
      await page.waitForTimeout(350);
      if (name === 'hexy') await page.getByRole('button', { name: 'Reproducir No Brain, Just Vibes!' }).click();
      await page.screenshot({ path: path.join(dir, `${width}-${name}.png`) });
    }
    await page.locator('[data-compact-player]').getByRole('button', { name: 'Lista de canciones', exact: true }).click();
    await page.screenshot({ path: path.join(dir, `${width}-playlist.png`) });
    await page.close();
  }
  await browser.close(); console.log(JSON.stringify({ errors }, null, 2));
})();
