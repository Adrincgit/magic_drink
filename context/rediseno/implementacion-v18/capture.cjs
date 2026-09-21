const { chromium } = require('@playwright/test');
const fs = require('node:fs');
(async () => {
  fs.mkdirSync(`${__dirname}/capturas`, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  for (const [width, height] of process.argv.includes('--mobile') ? [[390,844]] : [[1440,900]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type()==='error') errors.push(e.text()); });
    await page.goto('http://localhost:4321/#directorio-wonderpop');
    await page.locator('[data-journey][data-assets-ready=true]').waitFor();
    await page.waitForTimeout(2000);
    for (const progress of [.852,.875,.90,.925,.95,.975,.99,1.02,1.074,1.09,1.2]) {
      await page.locator('[data-runway]').evaluate((el,p)=>scrollTo({top:(el.offsetHeight-el.querySelector('[data-stage]').offsetHeight)*p/Number(el.closest('[data-journey]').dataset.worldEnd),behavior:'instant'}),progress);
      await page.waitForTimeout(200);
      await page.screenshot({path:`${__dirname}/capturas/${width}-${progress}.png`});
      console.log(progress, await page.locator('[data-atrium-engine]').evaluate(el=>el.atriumDiagnostics?.()));
    }
    await page.close();
  }
  await browser.close(); console.log(JSON.stringify({errors},null,2));
})().catch(error=>{console.error(error);process.exitCode=1});
