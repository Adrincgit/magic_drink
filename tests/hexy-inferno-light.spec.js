import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginHarlequinUltimate,ultimateBeamGeometry} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {harlequinFireHitbox,leaveHarlequinFire,TRAIL_DURATION} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {enemyShot} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {clashContact,CLASH_DURATION} from '../src/components/arcade/adventure/engine/adventurePowerClash';

function fresh(stage=3,reverse=false){
 const s=createAdventure(3);s.supplies=[];s.stars=[];s.shots=[];s.arenaLocked=true;s.noticeTime=0;
 Object.assign(s.player,{x:reverse?2850:1500,y:480,ground:2});
 Object.assign(s.boss,{x:reverse?1450:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage,hp:stage===2?420:240,turn:0,debrisClock:100});
 return s;
}
const tick=(s,n=1,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function charge(s){beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')tick(s);}
function release(s){charge(s);while(s.boss.ultimate.state==='charge')tick(s);}

test('phase two rush fire is born taller and its physical height diminishes as it consumes itself',()=>{
 const s=fresh(2),b=s.boss;b.dir=1;const old=b.x;b.x+=140;leaveHarlequinFire(s,b,enemyShot,old);
 const fire=s.hostile[0],heights=[harlequinFireHitbox(fire).h];tick(s,90);heights.push(harlequinFireHitbox(fire).h);tick(s,90);heights.push(harlequinFireHitbox(fire).h);
 expect(fire.source).toBe('rush');expect(heights[0]).toBeGreaterThan(80);expect(heights[1]).toBeLessThan(heights[0]);expect(heights[2]).toBeLessThan(heights[1]);
 tick(s,90);expect(s.hostile).not.toContain(fire);expect(TRAIL_DURATION).toBe(2.1);
 for(const [remaining,hearts]of [[1.9,4],[.65,5]]){
  const s=fresh(2);Object.assign(s.player,{y:415,ground:null,vy:0});
  s.hostile=[{kind:'harlequin-groundfire',harlequin:true,source:'rush',stage:2,x:s.player.x,y:480,floor:480,age:.2,life:remaining,duration:2.1,vx:0,vy:0,r:0}];
  tick(s);expect(s.hearts).toBe(hearts);
 }
});

test('an unopposed ray advances visibly and ignites only the floor it has passed, in either direction',()=>{
 for(const reverse of [false,true]){
  const s=fresh(3,reverse);release(s);s.player.x=s.boss.x-s.boss.dir*150;s.player.hurt=20;
  tick(s,8);const early=ultimateBeamGeometry(s),fires=s.hostile.filter(q=>q.source==='ultimate');
  expect(early.progress).toBeGreaterThan(0);expect(early.progress).toBeLessThan(.5);expect(fires.length).toBeGreaterThan(0);
  for(const q of fires)expect((q.x-early.b.x)*s.boss.dir).toBeLessThanOrEqual(1);
  const count=fires.length;tick(s,30);const end=ultimateBeamGeometry(s);
  expect(end.progress).toBe(1);expect(end.b.y).toBeLessThanOrEqual(s.level.arena.y);expect(s.hostile.filter(q=>q.source==='ultimate').length).toBeGreaterThan(count);
  expect(s.boss.ultimate.endImpact).toBe(true);expect(s.effects.some(q=>q.fireBurst&&q.size>400)).toBe(true);
  tick(s,120);expect(s.boss.ultimate.state).toBe('recover');expect(s.hostile.some(q=>q.source==='ultimate')).toBe(true);
  tick(s,440);expect(s.hostile.some(q=>q.source==='ultimate')).toBe(false);
 }
});

test('unopposed hits produce a large blast and smoke, and a lethal cast continues during the slow defeat',()=>{
 for(const lethal of [false,true]){
  const s=fresh();s.hearts=lethal?2:5;release(s);let n=0;
  while(!s.boss.ultimate.hit&&n++<90)tick(s);
  expect(s.hearts).toBe(lethal?0:3);expect(s.effects.some(q=>q.fireBurst&&q.size>450)).toBe(true);expect(s.effects.filter(q=>q.cinematicSmoke).length).toBeGreaterThanOrEqual(12);
  const age=s.boss.ultimate.age;tick(s,60);expect(s.boss.ultimate.age).toBeGreaterThan(age);
  if(lethal){expect(s.done).toBe(false);expect(s.playerDefeat).toBeTruthy();tick(s,180);expect(ultimateBeamGeometry(s)).toBeNull();tick(s,300);expect(s.done).toBe(true);expect(s.player.clashFlight.frame).toBe(4);}
  else{expect(s.done).toBe(false);expect(s.hearts).toBe(3);}
 }
});

test('rapid presses can push either beam to the opponent before fifteen seconds without skipping the struggle',()=>{
 for(const reverse of [false,true])for(const fps of [30,60,120])for(const rate of [0,8,10]){
  const s=fresh(3,reverse);charge(s);tick(s,1,{super:true});while(['windup','travel'].includes(s.powerClash.state))tick(s);
  let frame=0;while(s.powerClash.state==='contest'&&frame<fps*16){const t=frame/fps,previous=(frame-1)/fps;stepAdventure(s,{attack:rate>0&&Math.floor(t*rate)!==Math.floor(previous*rate)},1/fps);frame++;}
  const q=s.powerClash;expect(q.won).toBe(rate>0);expect(q.contestAge).toBeGreaterThanOrEqual(6);expect(q.contestAge).toBeLessThan(CLASH_DURATION);
  const h=clashContact(s),length=Math.hypot(h.a.x-h.b.x,h.a.y-h.b.y),target=rate>0?h.b:h.a;
  expect(Math.hypot(h.x-target.x,h.y-target.y)).toBeLessThan(length*.035);
 }
});

test('floor reflections follow actual fire and remain steady with reduced motion',async({page})=>{
 await page.goto('/arcade');const result=await page.evaluate(async()=>{
  const [{createAdventure},{drawInfernoFloorLights}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/infernoLightCanvas.js')]);
  const s=createAdventure(3);s.player.x=300;s.arenaLocked=false;s.boss.phase='sleep';s.hostile=[{harlequin:true,kind:'harlequin-card',x:300,y:420,life:2,age:.2}];
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const c=canvas.getContext('2d');
  const paint=()=>{c.fillStyle='#14131c';c.fillRect(0,0,960,540);drawInfernoFloorLights(c,s,true);return [...c.getImageData(300,488,1,1).data];};
  const lit=paint();s.fxTime=5;const reduced=paint();s.hostile[0].x=600;const moved=paint();return{lit,reduced,moved};
 });
 expect(result.lit[0]).toBeGreaterThan(65);expect(result.lit[0]).toBeGreaterThan(result.lit[1]);expect(result.reduced).toEqual(result.lit);expect(result.moved[0]).toBeLessThan(result.lit[0]-30);
});

test('review floor glow, planted barriers, diminishing rush flames and the unopposed ultimate in motion',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/inferno-light/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1280,height:720});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const [engine,render,camera,ultimate,fire,enemies]=await Promise.all([import(root+'engine/adventureModel.js'),import(root+'render/adventureCanvas.js'),import(root+'render/adventureCamera.js'),import(root+'actors/bosses/harlequinUltimate.js'),import(root+'actors/bosses/harlequinFire.js'),import(root+'actors/enemies/adventureEnemies.js')]);
  const canvas=document.createElement('canvas');canvas.id='inferno-light-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1280px;height:720px';document.body.append(canvas);
  const w=window.infernoLight={engine,render,camera,ultimate,fire,enemies,canvas,art:await render.loadAdventureArt()};
  w.fresh=(stage=2)=>{const s=engine.createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:1500,y:480,ground:2,hurt:20});Object.assign(s.boss,{x:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage,hp:stage===2?420:240,debrisClock:100});for(let i=0;i<600;i++)camera.followAdventureCamera(s,1/120);w.s=s;return s;};
  w.tick=(n=1,input={})=>{for(let i=0;i<n;i++)engine.stepAdventure(w.s,input,1/120);};w.paint=(circusFloor='dark')=>render.renderAdventure(canvas,w.s,w.art,{circusFloor});
  w.cast=(lethal=false)=>{const s=w.fresh(3);s.player.hurt=0;s.hearts=lethal?2:5;ultimate.beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')w.tick();while(s.boss.ultimate.state==='charge')w.tick();};
 });
 const canvas=page.locator('#inferno-light-review');
 await page.evaluate(()=>{const w=window.infernoLight,s=w.fresh();s.player.x=s.level.arena.left+110;for(let i=0;i<600;i++)w.camera.followAdventureCamera(s,1/120);w.paint();});await canvas.screenshot({path:folder+'barrier-base.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight,s=w.fresh();w.enemies.enemyShot(s,1980,400,0,0,'harlequin-ember',{harlequin:true,r:16,age:.3});w.paint();});await canvas.screenshot({path:folder+'projectile-light.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight,s=w.fresh();s.boss.move='pyre';s.boss.volley=0;w.fire.castHarlequinFire(s,s.boss,w.enemies.enemyShot);w.tick(140);w.paint();});await canvas.screenshot({path:folder+'column-reflections.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight,s=w.fresh();Object.assign(s.boss,{move:'dash',phase:'warn',timer:.001,warnDuration:1});w.tick(50);w.paint();});await canvas.screenshot({path:folder+'rush-tall-and-low.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight;w.tick(150);w.paint();});await canvas.screenshot({path:folder+'rush-cooling.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight;w.cast();w.tick(10);w.paint();});await canvas.screenshot({path:folder+'solo-travel.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight;w.tick(22);w.paint();});await canvas.screenshot({path:folder+'solo-impact.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight;w.tick(140);w.paint();});await canvas.screenshot({path:folder+'solo-afterburn.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight;w.cast(true);w.tick(45);w.paint();});await canvas.screenshot({path:folder+'lethal-explosion.jpg'});
 await page.evaluate(()=>{const w=window.infernoLight;w.tick(200);w.paint();});await canvas.screenshot({path:folder+'lethal-fall.jpg'});
 const video=await page.evaluate(async()=>{
  const w=window.infernoLight;w.cast();w.s.player.hurt=20;
  const stream=w.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3500000}),chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.start();
  await new Promise(resolve=>{const start=performance.now();let prev=start,acc=0;const frame=now=>{const age=(now-start)/1000;acc+=Math.min(.05,(now-prev)/1000);prev=now;while(acc>=1/120){w.tick(1,{jump:true});acc-=1/120;}if(w.s.boss.phase==='recover')w.s.boss.timer=100;w.paint();if(age<4.4)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  const stopped=new Promise(resolve=>rec.onstop=resolve);rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);
 });fs.writeFileSync(folder+'solo-fire-review.webm',Buffer.from(video,'base64'));expect(errors).toEqual([]);
});
