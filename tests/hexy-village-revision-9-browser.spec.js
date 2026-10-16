import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
const folder='tests/artifacts/arcade/village-depth-v9/';
test('actual chapter: natural escort activation and keyboard rescue of a hidden civilian',async({page})=>{
 test.setTimeout(120000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function stepAdventure(s,input,dt){','function stepAdventure(s,input,dt){globalThis.__v9Live=s;')});});
 await page.goto('/arcade');await expect(page.locator('[data-title-screen]')).toBeVisible({timeout:90000});await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir capítulo/}).click();await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();
 await expect.poll(()=>page.evaluate(()=>!!window.__v9Live)).toBe(true);
 await page.evaluate(async()=>{const s=window.__v9Live,{groundY,groundAt}=await import('/src/components/arcade/adventure/world/adventureTerrain.js'),e=s.enemies.find(q=>q.conjurer),x=e.home-300;Object.assign(s.player,{x,y:groundY(s.level.route,x),vx:0,vy:0,hurt:999,ground:s.platforms.indexOf(groundAt(s.platforms,x))});s.camera={x:x-300,y:40,backdropY:40,zoom:1};s.noticeTime=0;});
 await expect.poll(()=>page.evaluate(()=>window.__v9Live.enemies.filter(q=>q.orbitParent&&q.hp>0).length)).toBe(3);
 for(const [width,height] of [[1440,900],[1920,1080]]){await page.setViewportSize({width,height});await page.waitForTimeout(650);await page.locator('[data-adventure-canvas]').screenshot({path:folder+`real-orbit-${width}.png`});}
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(async()=>{
  const s=window.__v9Live,{groundY,groundAt}=await import('/src/components/arcade/adventure/world/adventureTerrain.js'),r=s.villageRubble.find(q=>q.shelter),n=s.villagers.find(q=>q.id===r.villager),x=r.x-145;
  Object.assign(n,s.level.villagers.find(q=>q.id===n.id),{state:'hiding',age:0,runAge:0});Object.assign(r,{hp:4,freed:false,age:0});s.enemies=[];s.villagers=[n];s.villageRubble=[r];s.hostile=[];s.shots=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);
  Object.assign(s.player,{x,y:groundY(s.level.route,x),vx:0,vy:0,dir:1,hurt:999,ground:s.platforms.indexOf(groundAt(s.platforms,x))});s.camera={x:x-300,y:40,backdropY:40,zoom:1};
 });
 await page.waitForTimeout(500);await page.locator('[data-adventure-canvas]').screenshot({path:folder+'real-hiding.png'});await page.keyboard.down('KeyZ');
 await expect.poll(()=>page.evaluate(()=>window.__v9Live.villageRubble[0].freed),{timeout:10000}).toBe(true);await page.keyboard.up('KeyZ');await expect.poll(()=>page.evaluate(()=>window.__v9Live.villagers[0].state)).toBe('flee');await page.locator('[data-adventure-canvas]').screenshot({path:folder+'real-rescue.png'});
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
