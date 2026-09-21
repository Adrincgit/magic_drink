const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const dir = path.join(__dirname, 'capturas'); fs.mkdirSync(dir, { recursive: true });
  const report = [];
  for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('http://localhost:4321');
    await page.locator('[data-journey][data-ready="true"][data-assets-ready="true"]').waitFor();
    for (const [scene, progress] of [['atrium', .96], ['shop', 1.25], ['lounge', 1.59], ['faq', 1.89], ['end', 2.18]]) {
      await page.locator('[data-runway]').evaluate((el, p) => {
        const stage = el.querySelector('[data-stage]');
        scrollTo({ top: el.getBoundingClientRect().top + scrollY + (el.offsetHeight - stage.offsetHeight) * p / 2.18, behavior: 'instant' });
      }, progress);
      await page.waitForTimeout(1400);
      await page.screenshot({ path: path.join(dir, `${name}-${scene}.png`) });
      report.push({ name, scene, errors: [...errors], state: await page.locator('[data-journey]').evaluate(el => ({ p: el.dataset.worldProgress, chapter: el.dataset.worldChapter, width: document.documentElement.scrollWidth })) });
    }
    await page.close();
  }
  fs.writeFileSync(path.join(__dirname, 'visual-review.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
