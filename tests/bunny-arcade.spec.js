import { test, expect } from '@playwright/test';
import { openLanding, goWorld } from './landing.helpers';
const key='magic-drink-arcade-v1';
const saved=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
const ready=page=>expect(page.locator('[data-bunny-arcade]')).toHaveAttribute('data-phase','ready');
async function clickInScene(page,locator) {
  // Check the actual hit target without scrollIntoView changing the sticky camera.
  await expect.poll(()=>locator.evaluate(el=>{
    const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
    return x>0&&x<innerWidth&&y>0&&y<innerHeight&&el.contains(document.elementFromPoint(x,y));
  })).toBe(true);
  const r=await locator.boundingBox(),scroll=await page.evaluate(()=>scrollY);
  await page.mouse.click(r.x+r.width/2,r.y+r.height/2);
  expect(await page.evaluate(()=>scrollY)).toBe(scroll);
  await expect(locator).toHaveAttribute('data-found','true');
}

for(const width of [1440,390,360])test(`${width}: the invitation leads to five friends across pages and a hidden machine`,async({page})=>{
  test.setTimeout(65000);page.setDefaultTimeout(12000);await page.setViewportSize({width,height:width===1440?1000:width===360?640:844});
  await openLanding(page);
  await goWorld(page,.162);
  const shore=page.locator('[data-hunt-bunny=shore]:visible');
  await clickInScene(page,shore);
  await expect(page.locator('[data-bunny-guide]')).toBeVisible();
  await page.getByRole('button',{name:'¡Voy a encontrarlos!'}).click();
  // A second physical tap, without browser automation scrolling the sticky
  // scene again as its pointer parallax settles.
  const box=await shore.boundingBox(),scroll=await page.evaluate(()=>scrollY);
  await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  expect(await page.evaluate(()=>scrollY)).toBe(scroll);
  expect((await saved(page)).coins).toBe(2);
  await expect(page.locator('[data-bunny-guide]')).not.toBeVisible();
  await expect(page.locator('[data-arcade-cabinet]')).toHaveCount(0);
  const lookoutSign=page.locator('[data-lookout-trigger]>span');
  await expect.poll(()=>lookoutSign.evaluate(el=>{const r=el.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('[data-lookout-trigger]');})).toBe(true);
  const sign=await lookoutSign.boundingBox();await page.mouse.click(sign.x+sign.width/2,sign.y+sign.height/2);
  await expect(page.locator('[data-lookout-view]')).toBeVisible();
  await page.locator('[data-lookout-view]').focus();
  for(let i=0;i<3;i++)await page.keyboard.press('ArrowLeft');
  const lookout=page.locator('[data-hunt-bunny=lookout]');
  await clickInScene(page,lookout);
  await page.keyboard.press('Escape');
  for(const [route,id] of [['hexy','festival'],['bebidas','interview'],['wonderpop-plaza','plaza']]){
    await page.goto('/'+route);const bunny=page.locator(`[data-hunt-bunny=${id}]`);await bunny.scrollIntoViewIfNeeded();
    await bunny.evaluate(el=>{const observer=new MutationObserver(()=>{if(el.querySelector('[data-magic-coin]')){el.dataset.coinObserved='true';observer.disconnect();}});observer.observe(el,{childList:true,subtree:true});});
    await bunny.click({position:{x:30,y:22}});await expect(bunny).toHaveAttribute('data-found','true');
    await expect(bunny).toHaveAttribute('data-coin-observed','true');
  }
  await expect.poll(async()=>(await saved(page)).found.length).toBe(5);
  expect((await saved(page)).coins).toBe(6);
  await page.locator('[data-arcade-cabinet]').click();
  await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready');
  expect((await saved(page)).arcadeFound).toBe(true);
  await expect(page.locator('[data-credit-count]')).toContainText('6');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('coins are spent once; pause, refund, replay, settlement and accessories persist',async({page})=>{
  await page.goto('/arcade/bunny');await ready(page);
  await page.locator('[data-insert-coin]').dblclick();
  await expect(page.locator('[data-bunny-arcade]')).toHaveAttribute('data-phase','playing');
  expect((await saved(page)).coins).toBe(0);
  await page.locator('canvas[tabindex]').press('Space');
  await expect.poll(()=>page.locator('canvas[tabindex]').getAttribute('data-player-y')).not.toBe('0.00');
  await page.keyboard.press('KeyP');await expect(page.locator('[data-bunny-arcade]')).toHaveAttribute('data-phase','paused');
  const time=await page.locator('canvas[tabindex]').getAttribute('data-run-time');await page.waitForTimeout(350);
  expect(await page.locator('canvas[tabindex]').getAttribute('data-run-time')).toBe(time);
  await page.getByRole('button',{name:'Devolver mi moneda y salir'}).click();await ready(page);
  expect((await saved(page)).coins).toBe(1);
  // Exercise the same receipt API the renderer calls, including duplicate settlement.
  await page.evaluate(async()=>{const store=await import('/src/components/arcade/arcadeStore.js');const run=await store.beginRun();await Promise.all([store.finishRun(run.id,{won:true,stars:35}),store.finishRun(run.id,{won:true,stars:35})]);});
  expect((await saved(page)).coins).toBe(1);expect((await saved(page)).stars).toBe(35);
  await page.reload();await ready(page);
  await page.locator('[data-accessory-choice=crown]').click();
  await expect.poll(async()=>(await saved(page)).stars).toBe(10);expect((await saved(page)).equipped).toBe('crown');
  await page.reload();await ready(page);await expect(page.locator('[data-accessory-choice=crown]')).toHaveAttribute('aria-pressed','true');
  await page.locator('[data-practice]').click();await expect(page.locator('[data-bunny-arcade]')).toHaveAttribute('data-phase','playing');
  expect((await saved(page)).coins).toBe(1);
  await expect(page.locator('[data-bunny-arcade]')).toHaveAttribute('data-phase','result',{timeout:20000});
  expect((await saved(page)).stars).toBe(10);expect((await saved(page)).coins).toBe(1);
});

test('mobile touch, reduced motion and English keep the free game usable',async({browser})=>{
  const context=await browser.newContext({viewport:{width:360,height:640},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto('/arcade/bunny');await ready(page);
  await page.getByRole('button',{name:'Switch to English'}).tap();
  await expect(page.getByRole('heading',{level:1})).toContainText('Little paws');
  await page.locator('[data-practice]').tap();await expect(page.locator('[data-bunny-arcade]')).toHaveAttribute('data-phase','playing');
  const screen=page.locator('canvas[tabindex]');await screen.tap();
  await expect.poll(()=>screen.getAttribute('data-player-y')).not.toBe('0.00');
  await page.getByRole('button',{name:'Pause game'}).tap();
  await page.getByRole('button',{name:'End practice'}).tap();await ready(page);
  await expect(page.locator('[data-credit-count]')).toContainText('01');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await context.close();
});

test('reduced-motion mobile keeps the invitation and remote cabinet reachable',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage();await openLanding(page);
  const bunny=page.locator('[data-hunt-bunny=shore]:visible');await bunny.scrollIntoViewIfNeeded();await bunny.tap();
  await page.getByRole('button',{name:'¡Voy a encontrarlos!'}).tap();
  await page.goto('/wonderpop-plaza');await page.locator('[data-arcade-cabinet]').tap();
  await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready');
  await expect(page.locator('[data-credit-count]')).toContainText('2');
  await context.close();
});
