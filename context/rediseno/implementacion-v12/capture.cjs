const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const folder = 'context/rediseno/implementacion-v12/capturas';
(async () => {
  fs.mkdirSync(folder, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  try {
    for (const size of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }, { name: 'wide', width: 2559, height: 1304 }]) {
      await page.setViewportSize(size);
      await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-journey][data-ready=true]');
      await page.evaluate(async () => {
        document.querySelectorAll('img').forEach(img => img.loading = 'eager');
        await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
        await document.fonts.ready;
      });
      for (const [name, p] of [['hero', 0], ['city', .162], ['hexy', .3132], ['festival', .49], ['garden', .68], ['interior', .878], ['closing', 1]]) {
        await page.locator('[data-runway]').evaluate((el, p) => scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - el.querySelector('[data-stage]').offsetHeight) * p, behavior: 'instant' }), p);
        await page.waitForTimeout(600);
        await page.screenshot({ path: `${folder}/${size.name}-${name}.png` });
      }
      await page.goto('http://localhost:4321/bebidas', { waitUntil: 'networkidle' });
      await page.screenshot({ path: `${folder}/${size.name}-product.png`, fullPage: true });
    }
    fs.writeFileSync('context/rediseno/implementacion-v12/capture-report.json', JSON.stringify({ errors, screenshots: 24 }, null, 2));
    console.log(JSON.stringify(errors));
    if (errors.length) process.exitCode = 1;
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
