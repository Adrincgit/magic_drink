import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
test('real controls render painted Volt sprites, air recoil and spatial enemy/world audio',async({page})=>{
 test.setTimeout(180000);const errors=[],missing=[],dir='tests/artifacts/arcade/combat-v12/';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function stepAdventure(s,input,dt){','function stepAdventure(s,input,dt){globalThis.__combat12=s;')});});
 await page.route('**/src/components/arcade/shared/audio/sounds.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function arcadeSound(event,enabled=true){','function arcadeSound(event,enabled=true){(globalThis.__audio12??=[]).push(typeof event==="string"?event:event.kind);')});});
 await page.goto('/arcade');await expect(page.locator('[data-title-screen]')).toBeVisible({timeout:90000});await openAdventureMenu(page);await page.locator('[data-title-menu]').getByRole('button',{name:/Elegir/}).click();await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();await expect.poll(()=>page.evaluate(()=>!!window.__combat12)).toBe(true);
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.combatTools=Object.assign({},...await Promise.all(['engine/adventureAmmo.js','actors/hexy/hexyAnimation.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js'].map(p=>import(root+p)))),s=window.__combat12;
  s.enemies=[];s.villagers=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.hostile=[];s.villageObstacles=[];s.villageRubble=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;
  Object.assign(s.player,{x:10000,y:w.groundY(s.level.route,10000),ground:s.platforms.indexOf(w.groundAt(s.platforms,10000)),vx:0,vy:0,hurt:0,dir:1});s.camera={x:9740,y:40,backdropY:40,zoom:1};w.equipDrink(s,9);s.modLevels['starter-9']=3;
 });
 await page.keyboard.down('KeyZ');await expect.poll(()=>page.evaluate(()=>window.combatTools.hexyPose(window.__combat12).sheet)).toBe('volt-cast');await expect.poll(()=>page.evaluate(()=>window.__audio12?.includes('voltShot'))).toBe(true);await page.locator('[data-adventure-canvas]').screenshot({path:dir+'real-controls-volt.png'});await page.keyboard.up('KeyZ');
 await page.evaluate(()=>{const s=window.__combat12;window.combatTools.equipDrink(s,13);Object.assign(s.player,{ground:null,y:s.player.y-170,vy:180,vx:0,jumps:1});});
 await page.keyboard.down('KeyC');await expect.poll(()=>page.evaluate(()=>window.combatTools.hexyPose(window.__combat12).sheet)).toBe('popcorn-air');await page.locator('[data-adventure-canvas]').screenshot({path:dir+'real-controls-popcorn-air.png'});await page.keyboard.up('KeyC');await expect.poll(()=>page.evaluate(()=>window.__audio12?.includes('popcornCast'))).toBe(true);
 // Let the actual enemy update commit a ray, and the actual shot loop shatter
 // a nearby cart. These events travel through the production audio dispatcher.
 await page.evaluate(()=>{const s=window.__combat12,w=window.combatTools,x=s.player.x;Object.assign(s.player,{y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),vx:0,vy:0,hurt:999});const e=w.makeEnemy(x+280,s.player.y,26,0);Object.assign(e,{active:true,phase:'windup',phaseAge:1.09,dir:-1,candyAim:{x,y:s.player.y-40}});s.enemies=[e];const r={id:'audio-test-cart',kind:'wagon',x:x+130,y:s.player.y,w:90,h:110,hp:1};s.villageObstacles=[r];s.platforms.push({x:r.x-r.w/2,y:r.y-r.h,w:r.w,h:r.h,villageObstacle:r.id,dx:0,dy:0});s.shots.push({x:r.x-60,y:r.y-50,vx:700,vy:0,r:8,kind:13,damage:3,heavy:true,life:1,age:0,hits:[]});});
 await expect.poll(()=>page.evaluate(()=>window.__audio12?.includes('witchRay'))).toBe(true);await expect.poll(()=>page.evaluate(()=>window.__audio12?.includes('wagonBreak'))).toBe(true);
 await page.keyboard.press('Escape');expect(errors).toEqual([]);expect(missing).toEqual([]);
});
