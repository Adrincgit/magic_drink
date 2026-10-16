import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';

test('real village actions dispatch decoded recordings and pause stops active voices',async({page})=>{
 test.setTimeout(180000);const errors=[],missing=[],dir='tests/artifacts/arcade/creature-audio/';fs.mkdirSync(dir,{recursive:true});
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('function stepAdventure(s,input,dt){','function stepAdventure(s,input,dt){globalThis.__creatureScene=s;')});});
 await page.route('**/src/components/arcade/shared/audio/creatureSamples.js*',async route=>{const response=await route.fetch();let body=await response.text();body=body.replace('return{loaded:buffers.size,failures};','globalThis.__creatureReady={loaded:buffers.size,failures};return globalThis.__creatureReady;').replace('start(buffer,cue.gain,cue.voice?voiceOut:out);','start(buffer,cue.gain,cue.voice?voiceOut:out);(globalThis.__recordedCues??=[]).push({kind,name,duration:buffer.duration,at});').replace('if(!voices.delete(v))return;','if(!voices.delete(v))return;(globalThis.__stoppedCues??=[]).push(v.kind);');await route.fulfill({response,body});});
 await page.goto('/arcade');await expect(page.locator('[data-title-screen]')).toBeVisible({timeout:90000});await openAdventureMenu(page);await page.locator('[data-title-menu]').getByRole('button',{name:/Elegir/}).click();await page.locator('[data-level-choice="7"]').click();await page.locator('[data-practice]').click();await page.locator('[data-chapter-intro]').click();
 await expect.poll(()=>page.evaluate(()=>window.__creatureReady)).toEqual({loaded:14,failures:[]});await expect.poll(()=>page.evaluate(()=>!!window.__creatureScene)).toBe(true);
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.creatureTools=Object.assign({},...await Promise.all(['actors/enemies/adventureEnemies.js','world/adventureTerrain.js','engine/adventureAmmo.js'].map(p=>import(root+p)))),s=window.__creatureScene,x=9000;
  s.enemies=[];s.villagers=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.hostile=[];s.villageObstacles=[];s.villageRubble=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;
  Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),vx:0,vy:0,hurt:999,dir:1});s.camera={x:x-260,y:40,backdropY:40,zoom:1};w.equipDrink(s,0);
  const e=Object.assign(w.makeEnemy(x+250,s.player.y,26,0),{active:true,phase:'patrol',timer:0});s.enemies=[e];s.villagers=[{id:'audio-victim',x:x+130,y:s.player.y,state:'candy',age:0,curseAge:0,style:0,active:true}];window.__recordedCues=[];
 });
 await expect.poll(()=>page.evaluate(()=>window.__recordedCues.map(q=>q.kind))).toContain('witchAbsorb');await expect.poll(()=>page.evaluate(()=>window.__recordedCues.map(q=>q.kind))).toContain('pumpkinBirth');
 await page.evaluate(()=>{const s=window.__creatureScene,w=window.creatureTools;const e=Object.assign(w.makeEnemy(s.player.x+180,s.player.y,25,1),{active:true,phase:'windup',phaseAge:.7,timer:0,candyAim:{x:s.player.x,y:s.player.y-40}});s.enemies=[e];s.villagers=[];s.hostile=[];});
 await expect.poll(()=>page.evaluate(()=>window.__recordedCues.map(q=>q.kind))).toContain('soulCast');
 await page.evaluate(()=>{const s=window.__creatureScene;s.enemies[0].hp=1;s.enemies[0].phase='patrol';s.enemies[0].timer=99;s.hostile=[];});
 await page.keyboard.down('KeyZ');await expect.poll(()=>page.evaluate(()=>window.__recordedCues.map(q=>q.kind))).toContain('pumpkinDeath');await page.keyboard.up('KeyZ');
 await page.evaluate(()=>{const s=window.__creatureScene,w=window.creatureTools,e=Object.assign(w.makeEnemy(s.player.x+200,s.player.y,26,2),{active:true,timer:0,phase:'patrol'});s.enemies=[e];s.villagers=[{id:'pause-victim',x:s.player.x+80,y:s.player.y,state:'candy',age:0,curseAge:0,style:0,active:true}];s.shots=[];window.__recordedCues=[];window.__stoppedCues=[];});
 await expect.poll(()=>page.evaluate(()=>window.__recordedCues.map(q=>q.kind))).toContain('witchAbsorb');await page.keyboard.press('Escape');await expect.poll(()=>page.evaluate(()=>window.__stoppedCues)).toContain('witchAbsorb');
 fs.writeFileSync(dir+'runtime.json',JSON.stringify(await page.evaluate(()=>({ready:window.__creatureReady,stopped:window.__stoppedCues,cues:window.__recordedCues})),null,2));expect(errors).toEqual([]);expect(missing).toEqual([]);
});
