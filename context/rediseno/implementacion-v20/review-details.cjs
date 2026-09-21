const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const dir = path.join(__dirname, 'capturas');
  const results = [];
  async function go(page, p) {
    await page.locator('[data-runway]').evaluate((el,p) => scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.offsetHeight-el.querySelector('[data-stage]').offsetHeight)*p/2.18,behavior:'instant'}),p);
    await page.waitForTimeout(450);
  }
  for(const [name,width,height] of [['wide',2559,1303],['short',390,640],['phone',390,844]]) {
    const page = await browser.newPage({viewport:{width,height}});
    await page.goto('http://localhost:4321');
    await page.locator('[data-journey][data-ready="true"][data-assets-ready="true"]').waitFor();
    for(const [label,p] of [['shop',1.25],['lounge',1.59],['faq',1.89]]) {
      await go(page,p);
      if(label==='faq') await page.locator('#question-3').click();
      await page.screenshot({path:path.join(dir,`${name}-${label}-final.png`)});
    }
    await go(page,1.25); await page.locator('[data-keepsake="cosplay"]').click();
    await page.screenshot({path:path.join(dir,`${name}-album-final.png`)});
    await page.keyboard.press('Escape');
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.goto('http://localhost:4321/#directorio-wonderpop');
  await page.locator('[data-atrium-engine][data-renderer="webgl"]').waitFor();
  for(const [name,x,y] of [['left',5,5],['right',1435,895]]){
    await page.mouse.move(x,y);await page.waitForTimeout(800);
    results.push({name,depth:await page.locator('[data-atrium-engine]').evaluate(el=>el.atriumDiagnostics)});
    await page.screenshot({path:path.join(dir,`parallax-${name}.png`)});
  }
  await page.mouse.move(720,450);
  for(const [name,p] of [['before',1.062],['covered',1.075],['after',1.109]]){
    await go(page,p);await page.screenshot({path:path.join(dir,`transition-${name}.png`)});
  }
  fs.writeFileSync(path.join(__dirname,'detail-review.json'),JSON.stringify(results,null,2));
  await browser.close();
})();
