const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const folder = 'context/rediseno/implementacion-v11/capturas';
(async () => {
  fs.mkdirSync(folder, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  try {
    for (const size of [{ name: 'wide', width: 2559, height: 1304 }, { name: 'mobile', width: 390, height: 844 }]) {
      await page.setViewportSize(size);
      await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-journey][data-ready=true]');
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach(img => img.loading = 'eager');
        await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
        await document.fonts.ready;
      });
      for (const [name, p] of [['hero', 0], ['hexy', .3132], ['stage', .49], ['stage-end', .56], ['garden', .68], ['garden-near', .765]]) {
        await page.locator('[data-runway]').evaluate((el, p) => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - el.querySelector('[data-stage]').offsetHeight) * p, behavior: 'instant' }), p);
        await page.waitForTimeout(650);
        if (p > .4 && p < .6) await page.waitForSelector('[data-crowd-motion][data-renderer=webgl]', { state: 'attached' });
        if (p >= .63) await page.waitForSelector('[data-garden-world][data-renderer=webgl]', { state: 'attached' });
        await page.screenshot({ path: `${folder}/${size.name}-${name}.png` });
      }
    }
    console.log(JSON.stringify(errors));
    if (errors.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
