const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const folder = path.resolve('context/rediseno/implementacion-v9/capturas');
  fs.mkdirSync(folder, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const report = { browser: browser.version(), errors: [], captures: [] };
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) report.errors.push(`${response.status()} ${response.url()}`); });
  try {
    for (const size of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
      await page.setViewportSize(size);
      await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
      await page.waitForSelector('[data-journey][data-ready=true]');
      await page.evaluate(() => { document.querySelectorAll('img').forEach(img => img.loading='eager'); return document.fonts.ready; });
      const scenes = [
 ['hero','[data-runway]',0], ['city','[data-runway]',.162], ['hexy','[data-runway]',.3132],
 ['join-035','[data-runway]',.35], ['join-037','[data-runway]',.37], ['join-039','[data-runway]',.39], ['join-041','[data-runway]',.41],
 ['festival','[data-runway]',.49], ['join-060','[data-runway]',.60], ['join-0616','[data-runway]',.616], ['join-063','[data-runway]',.63], ['garden-entry','[data-runway]',.649], ['plaza','[data-runway]',.68], ['plaza-near','[data-runway]',.735], ['door','[data-runway]',.8], ['interior','[data-runway]',.878], ['original','[data-runway]',1],
 ];
      for (const [label, selector, progress] of scenes) {
        await page.locator(selector).first().evaluate((element, p) => {
          const stage = element.querySelector('[data-screen],[data-stage]');
          const top = element.getBoundingClientRect().top + scrollY;
          scrollTo({ top: top + (p === null ? Math.max(0, (element.offsetHeight-innerHeight)/2) : p * (element.offsetHeight-stage.offsetHeight)), behavior: 'instant' });
        }, progress);
        await page.waitForTimeout(300);
        await page.locator(selector).first().evaluate(async element => { await Promise.all([...element.querySelectorAll('img')].map(image => image.decode().catch(() => {}))); });
        await page.screenshot({ path: path.join(folder, `${size.name}-${label}.png`) });
        report.captures.push({ size: size.name, label, ...await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, y: scrollY, height: document.documentElement.scrollHeight })) });
      }
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(folder, '../capture-report.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length || report.captures.some(capture => capture.overflow)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
