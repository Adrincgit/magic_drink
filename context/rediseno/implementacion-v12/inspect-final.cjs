const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const folder = 'context/rediseno/implementacion-v12/capturas';
(async () => {
  fs.mkdirSync(folder, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  try {
    for (const size of [{ name: 'wide', width: 2559, height: 1304 }, { name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
      await page.setViewportSize(size);
      await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
      await page.evaluate(async () => { await document.fonts.ready; });
      await page.waitForSelector('[data-journey][data-ready=true]');
      if (size.name === 'mobile') await page.screenshot({ path: `${folder}/mobile-hero.png` });
      await page.locator('[data-runway]').evaluate(el => scrollTo({ top: (el.offsetHeight - el.querySelector('[data-stage]').offsetHeight) * .3132, behavior: 'instant' }));
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${folder}/${size.name}-hexy.png` });
      await page.locator('[data-scene-player] summary').click();
      await page.screenshot({ path: `${folder}/${size.name}-credits.png` });
    }
    for (const size of (process.argv.includes('--credits-only') ? [] : [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }])) {
      await page.setViewportSize(size);
      for (const route of ['hexy', 'nosotros', 'wonderpop-plaza', 'magicdrinkday']) {
        await page.goto(`http://localhost:4321/${route}`, { waitUntil: 'networkidle' });
        const control = page.locator('main [data-scene-control]').first();
        await control.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1300);
        await page.screenshot({ path: `${folder}/${size.name}-controls-${route}.png` });
      }
    }
    fs.writeFileSync(`context/rediseno/implementacion-v12/${process.argv.includes('--credits-only') ? 'credits-inspection' : 'final-inspection'}.json`, JSON.stringify({ errors, captures: process.argv.includes('--credits-only') ? 7 : 15 }, null, 2));
    console.log(JSON.stringify(errors));
    if (errors.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
