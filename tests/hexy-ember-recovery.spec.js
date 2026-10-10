import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import fs from 'node:fs';
import {igniteEmberGround} from '../src/components/arcade/adventure/engine/adventureEmberFire';

function approach(index,dir){
 const s=createAdventure(5),pit=s.level.emberPits[index],x=dir>0?pit.x-55:pit.x+pit.w+55;
 for(const key of ['enemies','stars','supplies','outposts','cages'])s[key]=[];
 for(const q of s.emberEnvironment.trees)q.phase='spent';
 Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x))});
 for(let i=0;i<800;i++)followAdventureCamera(s,1/120);
 return {s,pit};
}
for(let index=0;index<5;index++)for(const dir of [-1,1])for(const exit of [-1,1]){
 test(`pit ${index+1}: enter ${dir}, exit ${exit}, recover and retry without losing the map`,()=>{
  const {s,pit}=approach(index,dir),move=dir>0?{right:true}:{left:true};let burned=false,maxCameraStep=0,minFeet=Infinity,maxFeet=-Infinity;
  for(let i=0;i<240;i++){
   const before=s.camera.y;stepAdventure(s,move,1/120);
   maxCameraStep=Math.max(maxCameraStep,Math.abs(s.camera.y-before));
   minFeet=Math.min(minFeet,(s.player.y-s.camera.y)*s.camera.zoom);maxFeet=Math.max(maxFeet,(s.player.y-s.camera.y)*s.camera.zoom);
   if(s.player.hitType==='fire'){burned=true;break;}
  }
  expect(burned).toBe(true);expect(maxCameraStep).toBeLessThan(3);expect(minFeet).toBeGreaterThan(280);expect(maxFeet).toBeLessThan(535);
  // Keep walking against the exit wall without jumping: never tunnel below earth.
  for(let i=0;i<80;i++)stepAdventure(s,move,1/120);
  if(s.player.x<pit.x||s.player.x>pit.x+pit.w)expect(s.player.y).toBeLessThanOrEqual(groundY(s.level.route,s.player.x)+1);
  for(let i=0;i<360;i++)stepAdventure(s,{right:exit>0,left:exit<0,jump:i<44||i>=48&&i<150},1/120);
  expect(exit>0?s.player.x>pit.x+pit.w+35:s.player.x<pit.x-35).toBe(true);
  expect(s.player.ground).not.toBeNull();expect(s.player.y).toBeLessThanOrEqual(groundY(s.level.route,s.player.x)+1);expect(s.playerDefeat).toBeFalsy();
  const checkpoint=s.checkpointAt||s.level.spawn;retryAdventure(s);stepAdventure(s,{},1/120);
  expect(Math.abs(s.camera.y-(checkpoint[1]-s.level.cameraFloor))).toBeLessThan(2);
  expect(s.enemies.some(e=>Math.abs(e.x-s.player.x)<200)).toBe(false);
 });
}
test('charcoal collision and camera remain bounded at 30, 60 and 120 fps; fire lands on the bed',()=>{
 for(const rate of [30,60,120])for(let index=0;index<5;index++){
  const {s,pit}=approach(index,1);let burn=false;
  for(let i=0;i<rate*3;i++){
   const cameraY=s.camera.y;stepAdventure(s,{right:true},1/rate);
   expect(Math.abs(s.camera.y-cameraY)).toBeLessThanOrEqual(180/rate+.001);
   if(s.player.hitType==='fire')burn=true;
   if(s.player.x>pit.x+pit.w)expect(s.player.y).toBeLessThanOrEqual(groundY(s.level.route,s.player.x)+6);
  }
  expect(burn).toBe(true);expect(s.playerDefeat).toBeFalsy();
  const x=pit.x+pit.w/2;igniteEmberGround(s,x);expect(s.hostile.find(q=>q.source==='forest'&&q.x===x).y).toBe(pit.y);
 }
});
test('staying in charcoal causes a complete defeat and retry returns to a visible checkpoint',()=>{
 const {s,pit}=approach(1,1);s.hearts=1;s.checkpoint=true;s.checkpointAt=s.level.checkpoints[1];
 for(let i=0;i<300&&!s.playerDefeat;i++)stepAdventure(s,{right:true},1/120);
 expect(s.playerDefeat).toBeTruthy();
 for(let i=0;i<900&&!s.done;i++)stepAdventure(s,{},1/120);
 expect(s.done).toBe(true);retryAdventure(s);
 for(let i=0;i<120;i++)stepAdventure(s,{},1/120);
 expect(s.player.ground).not.toBeNull();expect(s.hearts).toBe(s.maxHearts);expect(s.playerDefeat).toBeFalsy();
 expect(s.player.y-s.camera.y).toBeGreaterThan(350);expect(s.player.y-s.camera.y).toBeLessThan(450);
});
test('browser keyboard walk falls into the high ridge hollow, escapes and retries while rendering',async({page})=>{
 test.setTimeout(60000);const folder='tests/artifacts/arcade/ember-recovery/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const [model,canvas,terrain,camera]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await canvas.loadAdventureArt(),c=document.createElement('canvas');c.id='recovery-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const s=model.createAdventure(5),pit=s.level.emberPits[1];for(const key of ['enemies','stars','supplies','outposts','cages'])s[key]=[];
  const x=pit.x-55;Object.assign(s.player,{x,y:terrain.groundY(s.level.route,x),ground:s.platforms.indexOf(terrain.groundAt(s.platforms,x))});s.noticeTime=0;
  for(let i=0;i<800;i++)camera.followAdventureCamera(s,1/120);
  const w=window.recovery={s,pit,...model,paused:false,input:{},samples:[],paint:()=>canvas.renderAdventure(c,s,art)};
  const keys={ArrowRight:'right',ArrowLeft:'left',Space:'jump'};
  for(const name of ['keydown','keyup'])window.addEventListener(name,e=>{if(keys[e.code]){e.preventDefault();w.input[keys[e.code]]=name==='keydown';}});
  let last=performance.now();const frame=now=>{const dt=Math.min((now-last)/1000,1/30);last=now;if(!w.paused){model.stepAdventure(s,w.input,dt);w.samples.push({x:s.player.x,y:s.player.y,camera:s.camera.y,vy:s.player.vy,ground:s.player.ground,jumps:s.player.jumps,input:{...w.input},react:s.player.hitReact});}w.paint();requestAnimationFrame(frame);};requestAnimationFrame(frame);
 });
 await page.locator('#recovery-review').screenshot({path:folder+'ridge-before.jpg'});
 await page.keyboard.down('ArrowRight');await page.waitForFunction(()=>window.recovery.s.player.hitType==='fire');await page.keyboard.up('ArrowRight');
 await page.locator('#recovery-review').screenshot({path:folder+'ridge-fall.jpg'});
 await page.waitForFunction(()=>window.recovery.s.player.hitReact<=0);
 await page.keyboard.down('ArrowRight');await page.keyboard.down('Space');
 try{await page.waitForFunction(()=>window.recovery.s.player.y<window.recovery.pit.rim-5,null,{timeout:5000});}catch(error){fs.writeFileSync(folder+'jump-debug.json',JSON.stringify(await page.evaluate(()=>({samples:window.recovery.samples,pit:window.recovery.pit})),null,2));throw error;}await page.keyboard.up('Space');
 await page.waitForFunction(()=>window.recovery.s.lastInput.jump===false);
 await page.keyboard.down('Space');await page.waitForFunction(()=>window.recovery.s.player.x>window.recovery.pit.x+window.recovery.pit.w+65);await page.keyboard.up('Space');await page.keyboard.up('ArrowRight');
 await page.waitForFunction(()=>window.recovery.s.player.ground!==null);await page.locator('#recovery-review').screenshot({path:folder+'ridge-escaped.jpg'});
 const observed=await page.evaluate(()=>{const w=window.recovery;w.paused=true;return{samples:w.samples,hearts:w.s.hearts,x:w.s.player.x,exit:w.pit.x+w.pit.w+65};});
 expect(observed.hearts).toBeGreaterThan(0);expect(observed.x).toBeGreaterThan(observed.exit);
 expect(Math.max(...observed.samples.map(q=>q.camera))-Math.min(...observed.samples.map(q=>q.camera))).toBeLessThan(70);
 await page.evaluate(()=>{const w=window.recovery;w.retryAdventure(w.s);w.paint();});await page.locator('#recovery-review').screenshot({path:folder+'ridge-retry.jpg'});
 fs.writeFileSync(folder+'keyboard-trace.json',JSON.stringify(observed,null,2));expect(errors).toEqual([]);
});
