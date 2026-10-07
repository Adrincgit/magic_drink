import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
const dir='tests/artifacts/arcade/progression-polish/shop-regression/';
const ready=async page=>{await page.goto('/arcade');await openAdventureMenu(page);await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready',{timeout:30000});};
async function withinGame(page){
 const boxes=await page.evaluate(()=>{const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};return{shop:rect('[data-adventure-shop]'),canvas:rect('[data-adventure-canvas]'),stage:rect('[data-adventure-shop] > div')};});
 for(const key of ['x','y','width','height']){expect(Math.abs(boxes.shop[key]-boxes.canvas[key])).toBeLessThan(1);expect(Math.abs(boxes.stage[key]-boxes.canvas[key])).toBeLessThan(1);}
 expect(boxes.shop.width/boxes.shop.height).toBeCloseTo(16/9,2);
 if(await page.evaluate(()=>!!document.fullscreenElement)){expect(boxes.shop.y).toBeGreaterThanOrEqual(0);expect(boxes.shop.y+boxes.shop.height).toBeLessThanOrEqual(page.viewportSize().height);}
}
async function select(page,id){
 const shop=page.locator('[data-adventure-shop]');
 for(let i=0;i<10;i++){if(await shop.locator('[data-mod="'+id+'"]').count()){await shop.locator('[data-mod="'+id+'"]').focus();return;}await shop.getByRole('button',{name:'Página siguiente',exact:true}).click();}
 throw Error('Mod not found: '+id);
}
async function inspect(page,id){
 await select(page,id);await page.locator('[data-mod="'+id+'"][data-selected="true"]').click();await expect(page.locator('[data-item-popup="'+id+'"]')).toBeVisible();
}
async function closeItem(page){await page.getByRole('button',{name:'Cerrar artículo',exact:true}).click();await expect(page.locator('[data-item-popup]')).toHaveCount(0);}
async function enter(page){
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');const canvas=page.locator('[data-adventure-canvas]');await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('[data-adventure-canvas]').dataset.playerX)>315);await page.keyboard.up('ArrowRight');
 await page.evaluate(()=>{window.shopPoses=[];const canvas=document.querySelector('[data-adventure-canvas]');new MutationObserver(()=>{const phase=document.querySelector('[data-hexy-adventure]').dataset.phase;if(phase.startsWith('shop-'))window.shopPoses.push(phase+'|'+canvas.dataset.pose);}).observe(canvas,{attributes:true,attributeFilter:['data-pose']});});
 await page.keyboard.press('KeyE');await expect(page.locator('[data-adventure-shop]')).toBeVisible();await withinGame(page);
}
for(const width of [1440,390])test(width+': illustrated counter, item popup, collection upgrades and forward exit',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height:900});
 await page.addInitScript(()=>{if(!localStorage.getItem('magic-drink-arcade-v1'))localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,coins:1,stars:2000,adventureUnlocked:2,modSlots:3}));});
 await ready(page);await page.locator('[data-insert-coin]').click();await enter(page);
 const shop=page.locator('[data-adventure-shop]'),canvas=page.locator('[data-adventure-canvas]'),root=page.locator('[data-hexy-adventure]'),machine=page.getByRole('region',{name:'Aventura de Hexy',exact:true});
 expect(await page.evaluate(()=>window.shopPoses.some(p=>p.includes('shop-enter:')))).toBe(true);
 const frozen=await canvas.getAttribute('data-sim-frame');await page.keyboard.press('Space');await page.keyboard.press('KeyR');await page.waitForTimeout(100);expect(await canvas.getAttribute('data-sim-frame')).toBe(frozen);
 await expect(page.locator('audio')).toHaveAttribute('data-music-track','shop');await expect.poll(()=>page.locator('audio').evaluate(a=>!a.paused&&a.currentTime>0)).toBe(true);
 const dialogue=await page.locator('[data-miso-dialogue]').getAttribute('data-miso-dialogue');await expect(page.locator('[data-miso-dialogue]')).not.toHaveAttribute('data-miso-dialogue',dialogue,{timeout:8500});
 await machine.screenshot({path:dir+'counter-'+width+'.jpg'});
 const money=Number(await page.locator('[data-shop-money]').textContent());
 for(const id of ['quick-cast','bright-spark','full-bubble','starter-1']){
  await inspect(page,id);await expect(page.locator('[data-upgrade-mod]')).toHaveCount(0);
  if(id==='bright-spark')await machine.screenshot({path:dir+'inspect-'+width+'.jpg'});
  await page.locator('[data-buy-mod="'+id+'"]').click();await expect(page.locator('[data-open-owned]')).toBeVisible();await closeItem(page);
 }
 // An owned item at the counter has no upgrade action; improvements live in the collection.
 await inspect(page,'bright-spark');await expect(page.locator('[data-upgrade-mod]')).toHaveCount(0);await page.locator('[data-open-owned]').click();await expect(shop).toHaveAttribute('data-shop-view','collection');
 await expect(page.locator('[data-product-info]')).toContainText('30%');await page.locator('[data-upgrade-mod="bright-spark"]').click();await expect(page.locator('[data-product-info]')).toContainText('40%');
 await machine.screenshot({path:dir+'upgrade-'+width+'.jpg'});
 await page.locator('[data-upgrade-mod="bright-spark"]').click();await expect(page.locator('[data-product-info]')).toContainText('50%');await expect(page.locator('[data-upgrade-mod]')).toHaveCount(0);
 await page.locator('[data-equip-mod="bright-spark"]').click();await closeItem(page);
 for(const id of ['quick-cast','full-bubble']){await page.locator('[data-collection-mod="'+id+'"]').click();await page.locator('[data-equip-mod="'+id+'"]').click();await closeItem(page);}
 await page.locator('[data-collection-mod="starter-1"]').click();await page.locator('[data-equip-mod="starter-1"]').click();await expect(page.locator('[data-item-popup]').getByRole('status')).toContainText('¡Estuche lleno!');await closeItem(page);
 await expect(shop.locator('[data-equipped-slot]:not([data-equipped-slot=""])')).toHaveCount(3);await expect(page.locator('[data-shop-money]')).toHaveText(String(money-60-80-100-85-200-320));await withinGame(page);await machine.screenshot({path:dir+'collection-'+width+'.jpg'});
 await shop.getByRole('button',{name:width===1440?'Volver al camino →':'Salir de la tienda',exact:true}).click();await expect(root).toHaveAttribute('data-phase','playing');
 const exit=await page.evaluate(()=>window.shopPoses.filter(p=>p.startsWith('shop-leaving|shop-exit:')));expect(new Set(exit).size).toBeGreaterThanOrEqual(6);expect(Number(await canvas.getAttribute('data-player-x'))||Number(await canvas.getAttribute('data-playerX'))).toBeGreaterThan(395);
 await expect(page.locator('[data-hud-mod]')).toHaveCount(3);await expect(page.locator('[data-hud-mod="bright-spark"]')).toHaveAttribute('data-mod-level','3');
 await expect(page.locator('audio')).not.toHaveAttribute('data-music-track','shop');await expect.poll(()=>page.locator('audio').evaluate(a=>!a.paused)).toBe(true);
 await canvas.locator('..').screenshot({path:dir+'back-on-path-'+width+'.jpg'});
 await page.keyboard.press('KeyE');await expect(shop).toBeVisible();await shop.getByRole('button',{name:'Salir de la tienda'}).click();await expect(root).toHaveAttribute('data-phase','playing');expect(errors).toEqual([]);
 await ready(page);await page.locator('[data-insert-coin]').click();await expect(page.locator('[data-hud-mod="bright-spark"]')).toHaveAttribute('data-mod-level','3');
});
test('local popup, fullscreen, resizing, Escape and reduced motion preserve the game frame',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await ready(page);await page.locator('[data-practice]').click();await enter(page);
 const shop=page.locator('[data-adventure-shop]');await inspect(page,'bright-spark');await page.keyboard.press('Escape');await expect(page.locator('[data-item-popup]')).toHaveCount(0);await expect(shop).toBeVisible();
 const scroll=await page.evaluate(()=>scrollY);await shop.locator('[data-shop-collection]').click();expect(await page.evaluate(()=>scrollY)).toBe(scroll);
 await page.getByRole('region',{name:'Aventura de Hexy',exact:true}).evaluate(el=>el.requestFullscreen());await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);await withinGame(page);await page.screenshot({path:dir+'fullscreen.jpg'});
 await page.evaluate(()=>document.exitFullscreen());await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(false);await withinGame(page);
 await page.setViewportSize({width:900,height:550});await withinGame(page);await page.setViewportSize({width:390,height:844});await withinGame(page);
 await expect(shop.locator('[data-merchant-frame]')).toHaveCount(0);await expect(shop.getByAltText('Hexy eligiendo sus amuletos')).toBeVisible();
 await shop.focus();await page.keyboard.press('Escape');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await expect(page.locator('[data-adventure-canvas]')).toBeFocused();
});
