import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
test('real chapter controls: illuminated Volt III and the Harvester encounter render without errors',async({page})=>{
 test.setTimeout(150000);const errors=[],missing=[],dir='tests/artifacts/arcade/combat-v11/';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function stepAdventure(s,input,dt){','function stepAdventure(s,input,dt){globalThis.__combat11=s;')});});
 await page.goto('/arcade');await expect(page.locator('[data-title-screen]')).toBeVisible({timeout:90000});await openAdventureMenu(page);await page.locator('[data-title-menu]').getByRole('button',{name:/Elegir/}).click();await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();await expect.poll(()=>page.evaluate(()=>!!window.__combat11)).toBe(true);
 await page.evaluate(async()=>{
  const s=window.__combat11,r='/src/components/arcade/adventure/',[{equipDrink},{makeEnemy},{groundY,groundAt}]=await Promise.all([import(r+'engine/adventureAmmo.js'),import(r+'actors/enemies/adventureEnemies.js'),import(r+'world/adventureTerrain.js')]);
  s.enemies=[];s.hostile=[];s.villagers=[];s.carriages=[];s.villageObstacles=[];s.villageRubble=[];s.supplies=[];s.cages=[];s.outposts=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;
  const x=10000;Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,dir:1,hurt:0});s.camera={x:x-230,y:40,backdropY:40,zoom:1};equipDrink(s,9);s.modLevels['starter-9']=3;
  s.enemies=Array.from({length:6},(_,i)=>Object.assign(makeEnemy(x+225+i*82,groundY(s.level.route,x+225+i*82),25,i),{hp:60,timer:99}));
 });
 await page.keyboard.down('KeyZ');await expect.poll(()=>page.evaluate(()=>window.__combat11.voltBeam?.segments.length||0)).toBeGreaterThan(5);await page.locator('[data-adventure-canvas]').screenshot({path:dir+'real-volt.png'});await page.keyboard.up('KeyZ');await expect.poll(()=>page.evaluate(()=>window.__combat11.voltBeam)).toBeNull();
 await page.evaluate(async()=>{
  const s=window.__combat11,r='/src/components/arcade/adventure/',[{createAdventure},{groundY,groundAt}]=await Promise.all([import(r+'engine/adventureModel.js'),import(r+'world/adventureTerrain.js')]);
  const e=createAdventure(7).enemies.find(q=>q.type===28);s.enemies=[e];s.hostile=[];s.shots=[];const x=e.x-460;Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),vx:0,vy:0,hurt:0});s.camera={x:x-180,y:40,backdropY:40,zoom:1};
 });
 await expect.poll(()=>page.evaluate(()=>window.__combat11.enemies[0].phase)).toBe('intro');await page.locator('[data-adventure-canvas]').screenshot({path:dir+'real-harvester.png'});
 await expect.poll(()=>page.evaluate(()=>window.__combat11.enemies[0].phase),{timeout:7000}).toBe('windup');await page.keyboard.down('KeyZ');await expect.poll(()=>page.evaluate(()=>window.__combat11.enemies[0].hp),{timeout:6000}).toBeLessThan(185);await page.keyboard.up('KeyZ');
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
