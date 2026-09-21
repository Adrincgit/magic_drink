const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const folder = path.join(__dirname, 'capturas'); fs.mkdirSync(folder, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: path.join(folder, 'video'), size: { width: 1440, height: 900 } } });
    const page = await context.newPage();
    await page.goto('http://localhost:4321/#directorio-wonderpop');
    await page.locator('[data-atrium-engine][data-renderer=webgl]').waitFor();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll('[data-continuation] img')].map(img => img.decode().catch(() => {}))); });
    for (const [from, to, duration] of [[.80, 1.2, 12000], [1.2, .86, 9000]]) {
      await page.evaluate(async ({ from, to, duration }) => {
        const runway = document.querySelector('[data-runway]'), stage = document.querySelector('[data-stage]');
        const distance = (runway.offsetHeight - stage.offsetHeight) / Number(runway.closest('[data-journey]').dataset.worldEnd);
        await new Promise(resolve => {
          let start;
          const tick = now => {
            start ??= now; const part = Math.min(1, (now - start) / duration);
            scrollTo({ top: distance * (from + (to - from) * part), behavior: 'instant' });
            if (part < 1) requestAnimationFrame(tick); else resolve();
          }; requestAnimationFrame(tick);
        });
      }, { from, to, duration });
    }
    const video = page.video(); await context.close();
    await video.saveAs(path.join(folder, 'recorrido-v18.webm'));
    for (const [width, height] of [[2559, 1303], [390, 844], [390, 640]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.goto('http://localhost:4321/#directorio-wonderpop');
      await page.locator('[data-atrium-engine][data-renderer=webgl]').waitFor();
      await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(folder, `final-atrium-${width}-${height}.png`) });
      await page.locator('[data-atrium-directory]').getByRole('button', { name: 'Mapa de la plaza' }).click();
      await page.screenshot({ path: path.join(folder, `final-map-${width}-${height}.png`) });
      await page.getByRole('dialog').getByRole('button', { name: 'Coleccionables' }).click();
      await page.waitForTimeout(1400);
      await page.screenshot({ path: path.join(folder, `final-gallery-${width}-${height}.png`) });
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
