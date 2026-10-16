import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/village-depth-v10/';
test('actual chapter: crowded blockade lens, resisted keyboard fire, side warning and automatic candy release',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function stepAdventure(s,input,dt){','function stepAdventure(s,input,dt){globalThis.__v10Live=s;')});});
 await page.goto('/arcade');await expect(page.locator('[data-title-screen]')).toBeVisible({timeout:90000});await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir capítulo/}).click();await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();await expect.poll(()=>page.evaluate(()=>!!window.__v10Live)).toBe(true);
 await page.evaluate(async()=>{
  const s=window.__v10Live,{groundY,groundAt}=await import('/src/components/arcade/adventure/world/adventureTerrain.js'),r=s.villageObstacles.find(q=>q.blockade),x=r.x-230;
  Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,dir:1,hurt:999});s.camera={x:x-300,y:40,backdropY:40,zoom:1};s.weapon=-1;
 });
 await expect.poll(()=>page.evaluate(()=>window.__v10Live.camera.zoom)).toBeLessThan(.8);await expect.poll(()=>page.evaluate(()=>window.__v10Live.villagers.filter(q=>q.blockadeGroup&&q.blocked).length)).toBeGreaterThanOrEqual(10);
 for(const [width,height] of [[1440,900],[1920,1080]]){await page.setViewportSize({width,height});await page.waitForTimeout(450);await page.locator('[data-adventure-canvas]').screenshot({path:folder+`real-blockade-${width}.png`});}
 // Keep the keyboard destruction check independent of enemies hitting Hexy.
 await page.evaluate(()=>{const s=window.__v10Live;s.enemies=[];s.hostile=[];s.villageBlockade.waves=3;});await page.keyboard.down('KeyZ');await page.waitForTimeout(900);
 expect(await page.evaluate(()=>window.__v10Live.villageObstacles.find(q=>q.blockade).hp)).toBeGreaterThan(70);await expect.poll(()=>page.evaluate(()=>window.__v10Live.villageObstacles.find(q=>q.blockade).broken),{timeout:22000}).toBe(true);await page.keyboard.up('KeyZ');await page.waitForTimeout(1000);await page.locator('[data-adventure-canvas]').screenshot({path:folder+'real-wall-broken.png'});
 await page.evaluate(async()=>{
  const s=window.__v10Live,root='/src/components/arcade/adventure/',[{groundY,groundAt},{beginCandyCapture}]=await Promise.all([import(root+'world/adventureTerrain.js'),import(root+'engine/villageRescue.js')]);s.enemies=[];s.hostile=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);const x=9000,n={...s.level.villagers.find(q=>q.style===0),x:9200,y:groundY(s.level.route,9200),state:'candy',age:1.3,curseAge:28.8,curseOwner:'review-timeout'};s.villagers=[n];
  Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,hurt:999});s.camera={x:x-300,y:40,backdropY:40,zoom:1};beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.age=28.8;
 });
 await page.setViewportSize({width:1440,height:900});await page.locator('[data-adventure-canvas]').screenshot({path:folder+'real-candy-before.png'});await expect.poll(()=>page.evaluate(()=>!window.__v10Live.player.candy&&window.__v10Live.villagers[0].autoReleased),{timeout:5000}).toBe(true);await page.locator('[data-adventure-canvas]').screenshot({path:folder+'real-candy-after.png'});
 await page.evaluate(async()=>{
  const s=window.__v10Live,{groundY,groundAt}=await import('/src/components/arcade/adventure/world/adventureTerrain.js'),x=1800,n={...s.level.villagers.find(q=>q.style===0),x:x+170,y:groundY(s.level.route,x+170),state:'flee',warning:true,warned:false,trip:false,tripped:true,age:0,runAge:0};s.villagers=[n];s.carriages=[];Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,hurt:999});s.camera={x:x-260,y:40,backdropY:40,zoom:1};
 });
 await expect.poll(()=>page.evaluate(()=>window.__v10Live.villagers[0].state)).toBe('warning');await page.locator('[data-adventure-canvas]').screenshot({path:folder+'real-warning.png'});expect(errors).toEqual([]);expect(missing).toEqual([]);
});
