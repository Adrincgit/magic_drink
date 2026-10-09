import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {castHarlequinFire,PYRE_DURATION,PYRE_AFTERBURN} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {CLOTH_BURN_DURATION} from '../src/components/arcade/adventure/actors/bosses/harlequinChaos';

function fresh(stage=2){
 const s=createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;
 Object.assign(s.player,{x:1500,y:480,ground:2});
 Object.assign(s.boss,{x:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage,hp:stage===1?720:stage===2?420:240});
 return s;
}
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};

test('the base ignites during eruption and remains the same damaging fire throughout column extinction',()=>{
 const s=fresh();s.boss.debrisClock=100;s.boss.move='pyre';s.boss.volley=0;s.player.x=1980;
 castHarlequinFire(s,s.boss,enemyShot);const column=s.hostile[1];s.player.x=2060;
 tick(s,Math.ceil((column.delay+.03)*120));
 const base=s.hostile.find(q=>q.kind==='harlequin-groundfire'&&q.x===column.x);
 expect(base).toBeTruthy();expect(column.life).toBeGreaterThan(0);expect(base.age).toBeLessThan(.05);
 tick(s,Math.ceil((PYRE_DURATION-.12)*120));expect(column.life).toBeGreaterThan(0);expect(base.damaging).toBe(true);
 const age=base.age;tick(s,30);
 expect(s.hostile).not.toContain(column);expect(s.hostile).toContain(base);expect(base.age).toBeGreaterThan(age);expect(base.damaging).toBe(true);
 expect(base.life).toBeGreaterThan(PYRE_AFTERBURN-.4);
 s.player.x=base.x;tick(s);expect(s.hearts).toBe(4);s.player.x=2060;
 tick(s,Math.ceil((base.life+.02)*120));expect(s.hostile.filter(q=>q.x===column.x)).toHaveLength(0);
});

test('burning cloth is absent in phase one, falls in phase two without tracking, burns away and resets on retry',()=>{
 const first=fresh(1);tick(first,900);expect(first.hostile).toHaveLength(0);
 const s=fresh();tick(s,380);expect(s.hostile).toHaveLength(0);tick(s,10);
 const cloth=s.hostile.find(q=>q.kind==='harlequin-cloth');expect(cloth?.state).toBe('fall');expect(cloth.y).toBeLessThan(0);
 const released=cloth.x;s.player.x=2300;tick(s,100);expect(cloth.x-released).toBeCloseTo(12*100/120);expect(cloth.y).toBeGreaterThan(-100);expect(s.hearts).toBe(5);
 let n=0;while(cloth.state==='fall'&&n++<500)tick(s);
 expect(cloth.state).toBe('burn');expect(cloth.y).toBe(s.level.arena.y);expect(s.effects.some(q=>q.fireBurst&&q.grounded)).toBe(true);
 const landed=cloth.x;tick(s,70);expect(cloth.x).toBe(landed);expect(cloth.damaging).toBe(true);tick(s,20);expect(cloth.damaging).toBe(false);
 tick(s,70);expect(s.hostile).not.toContain(cloth);expect(n/120).toBeGreaterThan(.5);expect(CLOTH_BURN_DURATION).toBeGreaterThan(1);
 retryAdventure(s);expect(s.hostile).toHaveLength(0);expect(s.boss.debrisClock).toBeUndefined();expect(s.boss.heatWind).toBeUndefined();
});

test('a falling curtain can hurt Hexy and a sideways dodge avoids it',()=>{
 for(const dodge of [false,true]){
  const s=fresh();s.boss.debrisClock=0;tick(s);const cloth=s.hostile[0];
  s.player.x=cloth.x+(dodge?130:0);tick(s,280);
  expect(s.hearts).toBe(dodge?5:4);expect(s.done).toBe(false);
 }
});

test('a faster crossing rush demands a jump and held hat glide can land after its fire cools',()=>{
 for(const airborne of [false,true]){
  const s=fresh();s.boss.debrisClock=100;Object.assign(s.boss,{move:'dash',phase:'warn',timer:.001,warnDuration:1});
  let jumping=false,double=false,glides=0,landing;
  for(let i=0;i<540;i++){
   let jump=false;
   if(airborne){
    if(!jumping&&s.boss.x<s.player.x+300){jumping=true;}
    jump=jumping;
    if(jumping&&!double&&s.player.jumps===1&&s.player.vy>=0){jump=false;double=true;}
   }
   tick(s,1,{jump});if(s.player.gliding)glides++;
   if(s.player.ground!==null&&jumping&&i>150&&!landing)landing={age:s.time,fire:s.hostile.filter(q=>q.kind==='harlequin-groundfire'&&Math.abs(q.x-s.player.x)<48&&q.damaging).length};
   if(s.boss.phase==='recover')s.boss.timer=100;
  }
  if(airborne){expect(glides).toBeGreaterThan(120);expect(s.hearts).toBe(5);expect(landing?.fire).toBe(0);}else expect(s.hearts).toBeLessThan(5);
  expect(s.boss.x).toBe(s.level.arena.left+190);expect(s.boss.heatWind).toBeCloseTo(0,2);
 }
});

test('all cloth, disintegration and aura drawings retain native transparency',async()=>{
 const im=sharp('public/arcade/sprites/effects/painted-duel/circus-chaos.webp');
 expect(await im.metadata()).toMatchObject({width:1536,height:2304,hasAlpha:true});
 for(let i=0;i<24;i++){
  const raw=await im.clone().extract({left:i%4*384,top:Math.floor(i/4)*384,width:384,height:384}).raw().toBuffer();
  let count=0;for(let k=3;k<raw.length;k+=4)if(raw[k]>100)count++;
  expect(count).toBeGreaterThan(1000);expect(count).toBeLessThan(120000);
  for(const k of [3,383*4+3,383*384*4+3,raw.length-1])expect(raw[k]).toBe(0);
 }
});

test('review the smaller room, bending aura, falling cloth and simultaneous column base in motion',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/chaos/';fs.mkdirSync(folder,{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1280,height:720});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const [model,render,camera,fire,enemies]=await Promise.all([import(root+'engine/adventureModel.js'),import(root+'render/adventureCanvas.js'),import(root+'render/adventureCamera.js'),import(root+'actors/bosses/harlequinFire.js'),import(root+'actors/enemies/adventureEnemies.js')]);
  const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='chaos-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1280px;height:720px';document.body.append(canvas);
  const w=window.chaosReview={model,render,camera,fire,enemies,canvas,art};
  w.fresh=(distance=930,stage=2)=>{
   const s=model.createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;
   Object.assign(s.player,{x:1900-distance/2,y:480,ground:2,hurt:20});
   Object.assign(s.boss,{x:1900+distance/2,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage,hp:stage===1?720:stage===2?420:240,debrisClock:100});
   for(let i=0;i<600;i++)camera.followAdventureCamera(s,1/120);w.s=s;return s;
  };
  w.tick=(n=1,input={})=>{for(let i=0;i<n;i++)model.stepAdventure(w.s,input,1/120);};
  w.paint=(circusFloor='dark')=>render.renderAdventure(canvas,w.s,art,{circusFloor});
  w.rush=reverse=>{const s=w.fresh();if(reverse)[s.player.x,s.boss.x]=[s.boss.x,s.player.x];Object.assign(s.boss,{move:'dash',phase:'warn',timer:.001,warnDuration:1});w.tick(35);w.paint();};
 });
 const canvas=page.locator('#chaos-review');
 for(const [name,distance]of [['near',300],['medium',930],['far',2350]]){
  await page.evaluate(distance=>{const w=window.chaosReview;w.fresh(distance);w.paint();},distance);await canvas.screenshot({path:folder+'room-'+name+'.jpg'});
 }
 for(const reverse of [false,true]){
  await page.evaluate(reverse=>window.chaosReview.rush(reverse),reverse);await canvas.screenshot({path:folder+'aura-running-'+(reverse?'right':'left')+'.jpg'});
 }
 await page.evaluate(()=>{const w=window.chaosReview,s=w.fresh();s.boss.debrisClock=0;w.tick(150);w.paint();});await canvas.screenshot({path:folder+'cloth-falling.jpg'});
 await page.evaluate(()=>{const w=window.chaosReview;w.tick(105);w.paint();});await canvas.screenshot({path:folder+'cloth-burning.jpg'});
 await page.evaluate(()=>{const w=window.chaosReview;w.tick(60);w.paint();});await canvas.screenshot({path:folder+'cloth-ashes.jpg'});
 await page.evaluate(()=>{const w=window.chaosReview,s=w.fresh();s.player.x=1980;s.boss.move='pyre';s.boss.volley=0;w.fire.castHarlequinFire(s,s.boss,w.enemies.enemyShot);s.player.x=2060;w.tick(135);w.paint();});await canvas.screenshot({path:folder+'columns-with-bases.jpg'});
 await page.evaluate(()=>{const w=window.chaosReview;w.tick(110);w.paint();});await canvas.screenshot({path:folder+'persistent-bases.jpg'});
 await page.evaluate(()=>window.chaosReview.paint('wood'));await canvas.screenshot({path:folder+'wood-preserved.jpg'});
 const video=await page.evaluate(async()=>{
  const w=window.chaosReview,s=w.fresh();s.boss.debrisClock=0;
  Object.assign(s.boss,{move:'dash',phase:'warn',timer:1,warnDuration:1});
  const stream=w.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3500000}),chunks=[];
  rec.ondataavailable=e=>chunks.push(e.data);rec.start();let jumping=false;
  await new Promise(resolve=>{const start=performance.now();let prev=start,acc=0;const frame=now=>{
   const age=(now-start)/1000;acc+=Math.min(.05,(now-prev)/1000);prev=now;
   while(acc>=1/120){if(w.s.boss.x<w.s.player.x+300)jumping=true;w.tick(1,{jump:jumping});acc-=1/120;}
   if(w.s.boss.phase==='recover')w.s.boss.timer=100;w.paint();
   if(age<7.2)requestAnimationFrame(frame);else resolve();
  };requestAnimationFrame(frame);});
  const stopped=new Promise(resolve=>rec.onstop=resolve);rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());
  const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);
 });
 fs.writeFileSync(folder+'fire-chaos.webm',Buffer.from(video,'base64'));expect(errors).toEqual([]);
});
