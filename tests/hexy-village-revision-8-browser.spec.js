import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/village-depth-v8/';
test('actual game: opening evacuation, ruined streets, keyboard destruction and witch capture',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function stepAdventure(s,input,dt){','function stepAdventure(s,input,dt){globalThis.__v8Live=s;')});});
 await page.goto('/arcade');await expect(page.locator('[data-title-screen]')).toBeVisible({timeout:90000});await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir capítulo/}).click();await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();
 await expect.poll(()=>page.evaluate(()=>!!window.__v8Live)).toBe(true);const canvas=page.locator('[data-adventure-canvas]');
 await page.evaluate(()=>{window.__v8Live.player.hurt=999;});await page.keyboard.down('ArrowRight');await page.waitForTimeout(1500);await page.keyboard.up('ArrowRight');await canvas.screenshot({path:folder+'real-opening.png'});
 for(const [width,height] of [[1440,900],[1920,1080]]){await page.setViewportSize({width,height});for(const x of [7600,9800,13050,15450,18400]){
  await page.evaluate(async x=>{const s=window.__v8Live,{groundY}=await import('/src/components/arcade/adventure/world/adventureTerrain.js');Object.assign(s.player,{x,y:groundY(s.level.route,x),vx:0,vy:0,hurt:999});s.camera={x:x-300,y:40,backdropY:40,zoom:1};s.noticeTime=0;},x);await page.waitForTimeout(100);await canvas.screenshot({path:folder+`real-${width}-${x}.png`});
 }}
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(async()=>{const s=window.__v8Live,{groundY,groundAt}=await import('/src/components/arcade/adventure/world/adventureTerrain.js'),r=s.villageObstacles.find(q=>q.x===10160),x=r.x-180;s.enemies=[];s.villagers=[];s.hostile=[];for(const q of s.villageObstacles)q.ambush=false;Object.assign(s.player,{x,y:groundY(s.level.route,x),vx:0,vy:0,dir:1,hurt:999,ground:s.platforms.indexOf(groundAt(s.platforms,x))});s.camera={x:x-300,y:40,backdropY:40,zoom:1};});
 await page.keyboard.down('KeyZ');await expect.poll(()=>page.evaluate(()=>window.__v8Live.villageObstacles.find(q=>q.x===10160).broken),{timeout:10000}).toBe(true);await page.keyboard.up('KeyZ');await canvas.screenshot({path:folder+'real-barricade-broken.png'});
 await page.evaluate(async()=>{const s=window.__v8Live,root='/src/components/arcade/adventure/',[{makeEnemy},{beginCandyCapture,witchId},{groundY,groundAt}]=await Promise.all([import(root+'actors/enemies/adventureEnemies.js'),import(root+'engine/villageRescue.js'),import(root+'world/adventureTerrain.js')]),x=9000,y=groundY(s.level.route,x);Object.assign(s.player,{x,y,vx:0,vy:0,hurt:999,ground:s.platforms.indexOf(groundAt(s.platforms,x))});s.camera={x:x-300,y:40,backdropY:40,zoom:1};const e=Object.assign(makeEnemy(x+320,y,26,4),{active:true,flying:true,flightHeight:170,phase:'recover',timer:5});s.enemies=[e];beginCandyCapture(s,{kind:'witch-puddle',owner:witchId(e)});});
 await expect.poll(()=>page.evaluate(()=>!!window.__v8Live.player.candy?.absorber)).toBe(true);await page.waitForTimeout(1200);const prompt=page.locator('[data-candy-escape]');await expect(prompt).toBeVisible();await expect(prompt.locator('strong')).toHaveCount(0);await page.locator('[data-game-screen]').screenshot({path:folder+'real-absorb-hexy.png'});
 for(let i=0;i<21;i++){await page.keyboard.press('KeyZ',{delay:30});await page.waitForTimeout(25);}await expect(prompt).toHaveCount(0);expect(await page.evaluate(()=>!!window.__v8Live.player.candy)).toBe(false);
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
