import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
const dir='tests/artifacts/tactical-mods';
test('buy and equip charms, swap by keyboard/touch/controller, and render decoy and reply in the actual game',async({page})=>{
 test.setTimeout(120000);fs.mkdirSync(dir,{recursive:true});const errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.addInitScript(()=>{
  localStorage.setItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish','done');
  localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,campaign:2,economy:2,stars:2000,adventureUnlocked:3,modSlots:3}));
  window.virtualPad=null;Object.defineProperty(navigator,'getGamepads',{value:()=>[window.virtualPad]});
 });
 // Expose only this browser fixture's state; production code gains no debug API.
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch(),source=await response.text();await route.fulfill({response,body:source.replace('s.spareDrink=validSpare(carry.spareDrink);','s.spareDrink=validSpare(carry.spareDrink);if(!carry.trial)window.tacticalTest=s;')});});
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-insert-coin]').click();
 const root=page.locator('[data-hexy-adventure]'),canvas=page.locator('[data-adventure-canvas]'),shop=page.locator('[data-adventure-shop]');await expect(root).toHaveAttribute('data-phase','playing');
 await canvas.focus();await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>Number(document.querySelector('[data-adventure-canvas]').dataset.playerX)>315);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyE');await expect(shop).toBeVisible();
 const startMoney=Number(await page.locator('[data-shop-money]').textContent()),ids=['confetti-step','reply-bell'];
 for(const id of ids){
  const item=shop.locator('[data-mod="'+id+'"]');for(let i=0;i<12&&!(await item.count());i++)await shop.getByRole('button',{name:'Página siguiente',exact:true}).click();
  await expect(item).toBeVisible();await item.focus();await item.click();await expect(page.locator('[data-item-popup="'+id+'"] img')).toHaveJSProperty('complete',true);
  await page.locator('[data-buy-mod="'+id+'"]').click();await expect(page.locator('[data-equip-mod]')).toBeVisible();
 }
 
 for(const id of ids){await shop.locator('[data-mod="'+id+'"]').click();await page.locator('[data-equip-mod="'+id+'"]').click();}
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).modsEquipped)).toHaveLength(2);await expect(page.locator('[data-shop-money]')).toHaveText(String(startMoney-225));await shop.screenshot({path:dir+'/01-shop.png'});
 await shop.getByRole('button',{name:/Volver al camino/}).click();await expect(root).toHaveAttribute('data-phase','playing');
 await page.evaluate(async()=>{const s=window.tacticalTest,{collectDrink,spendDrink}=await import('/src/components/arcade/adventure/engine/adventureAmmo.js');s.enemies=[];s.outposts=[];s.cages=[];s.hazards=[];s.supplies=[];s.pickups=[];s.stars=[];s.noticeTime=0;collectDrink(s,5);spendDrink(s,9);collectDrink(s,9);spendDrink(s,7);});
 await expect(canvas).toHaveAttribute('data-weapon','9');await expect(canvas).toHaveAttribute('data-spare-ammo','75');await canvas.focus();await page.keyboard.press('KeyQ');await expect(canvas).toHaveAttribute('data-weapon','5');await expect(canvas).toHaveAttribute('data-ammo','75');
 await page.waitForFunction(()=>!window.tacticalTest.swapWait);await page.locator('[data-swap-drink]').click();await expect(canvas).toHaveAttribute('data-weapon','9');await expect(canvas).toHaveAttribute('data-ammo','35');
 await page.evaluate(()=>window.virtualPad={id:'Tactical test pad',index:0,mapping:'standard',connected:true,axes:[0,0,0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});
 await expect(page.locator('[data-gamepad-state]')).toHaveAttribute('data-gamepad-state','connected');await page.waitForTimeout(100);await page.waitForFunction(()=>!window.tacticalTest.swapWait);
 await page.evaluate(()=>{window.virtualPad.buttons[11]={pressed:true,value:1};});await expect(canvas).toHaveAttribute('data-weapon','5');await page.evaluate(()=>{window.virtualPad.buttons[11]={pressed:false,value:0};});
 await canvas.locator('..').screenshot({path:dir+'/02-pocket-desktop.png'});
 await page.setViewportSize({width:390,height:844});const swap=page.locator('[data-swap-drink]');await expect(swap).toBeVisible();const box=await swap.boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(390);await page.waitForFunction(()=>!window.tacticalTest.swapWait);await swap.tap({force:true}).catch(()=>swap.click());await expect(canvas).toHaveAttribute('data-weapon','9');await canvas.locator('..').screenshot({path:dir+'/03-pocket-mobile.png'});await page.setViewportSize({width:1440,height:900});
 await canvas.focus();await page.evaluate(()=>{const c=document.querySelector('[data-adventure-canvas]'),chunks=[];window.modsRecorder=new MediaRecorder(c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});window.modsRecorder.ondataavailable=e=>chunks.push(e.data);window.modsRecorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='mods-motion.webm';a.click();};window.modsRecorder.start();});
 await page.keyboard.press('KeyX');await page.waitForFunction(()=>window.tacticalTest.player.dash===0);await expect.poll(()=>page.evaluate(()=>!!window.tacticalTest.confettiDecoy)).toBe(true);await canvas.screenshot({path:dir+'/04-paper-decoy.png'});
 await page.evaluate(()=>{const s=window.tacticalTest,d=s.confettiDecoy;s.hostile.push({kind:'ball',x:d.x-65,y:d.y-36,vx:200,vy:0,r:12,age:0,life:2});});await page.waitForFunction(()=>window.tacticalTest.effects.some(f=>f.confetti));await canvas.screenshot({path:dir+'/05-confetti.png'});
 await page.evaluate(async()=>{const s=window.tacticalTest,{makeEnemy}=await import('/src/components/arcade/adventure/actors/enemies/adventureEnemies.js');const e=makeEnemy(s.player.x+220,s.player.y,5);e.timer=99;s.enemies=[e];s.hostile=[];s.magic=100;s.player.parryWait=0;window.attackerHp=e.hp;});
 await page.keyboard.down('KeyV');await page.waitForFunction(()=>window.tacticalTest.player.guarding);await page.evaluate(()=>{const s=window.tacticalTest;s.hostile.push({kind:'ball',x:s.player.x+42,y:s.player.y-43,vx:-220,vy:0,r:12,age:0,life:2});});await page.waitForFunction(()=>window.tacticalTest.shots.some(q=>q.reflected));await canvas.screenshot({path:dir+'/06-reply.png'});await page.keyboard.up('KeyV');
 await page.waitForFunction(()=>window.tacticalTest.enemies[0].hp<window.attackerHp);await canvas.screenshot({path:dir+'/07-return-impact.png'});
 const download=page.waitForEvent('download');await page.evaluate(()=>window.modsRecorder.stop());await(await download).saveAs(dir+'/mods-motion.webm');
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')));expect(save.modsEquipped).toEqual(ids);expect(errors).toEqual([]);expect(missing).toEqual([]);
});
