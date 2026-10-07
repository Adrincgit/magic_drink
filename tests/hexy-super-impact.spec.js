import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {SUPER_WINDUP,SUPER_DURATION} from '../src/components/arcade/adventure/engine/adventureMagic';
import {surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {superCameraOffset} from '../src/components/arcade/adventure/render/adventureSuperCanvas';
import {bossHitbox} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
const dir='tests/artifacts/arcade/super-impact/';
function scene(airborne=false,facing=1){
 const s=createAdventure();for(const k of ['enemies','hostile','outposts','supplies','hazards','stars','cages'])s[k]=[];
 Object.assign(s.player,{x:600,y:airborne?290:480,ground:airborne?null:0,dir:facing});return s;
}

test('release gradually pushes Hexy backwards at all frame rates while the world stays frozen and the beam follows her wand',()=>{
 for(const airborne of [false,true])for(const facing of [-1,1])for(const fps of [30,60,120]){
  const s=scene(airborne,facing),start={x:s.player.x,y:s.player.y,camera:{...s.camera},time:s.time},events=[];let previous=s.player.x;
  stepAdventure(s,{super:true},1/fps);
  while(s.superCinematic){
   const q=s.superCinematic;events.push(...s.events);
   if(q.age<SUPER_WINDUP)expect(s.player.x).toBe(start.x);
   else expect(q.origin).toEqual(hexyMuzzle(s));
   expect((previous-s.player.x)*facing).toBeGreaterThanOrEqual(-1e-8);expect(Math.abs(previous-s.player.x)).toBeLessThan(1.1);previous=s.player.x;
   expect(s.player.y).toBe(start.y);expect(s.camera).toEqual(start.camera);expect(s.time).toBe(start.time);
   stepAdventure(s,{left:true,right:true,jump:true,dash:true},1/fps);
  }
  expect((start.x-s.player.x)*facing).toBeCloseTo(airborne?40:28,6);
  expect(events.filter(e=>e==='superCast')).toHaveLength(1);expect(events.filter(e=>e==='superPulse')).toHaveLength(8);
  expect(s.superCooldown).toBe(80);expect(s.magic).toBe(10);
 }
});

test('ground recoil follows a slope across a continuous seam without sinking or snapping back afterwards',()=>{
 const s=scene();s.platforms=[{x:0,y:500,yEnd:440,w:590,kind:'earth'},{x:590,y:440,yEnd:350,w:600,kind:'earth'}];
 s.player.ground=1;s.player.y=surfaceY(s.platforms[1],s.player.x);stepAdventure(s,{super:true},1/120);
 while(s.superCinematic){stepAdventure(s,{},1/120);expect(s.player.y).toBeCloseTo(surfaceY(s.platforms[s.player.ground],s.player.x),6);}
 expect(s.player.x).toBeCloseTo(572);expect(s.player.ground).toBe(0);const end=s.player.x;stepAdventure(s,{},1/120);expect(s.player.x).toBeCloseTo(end);
});

test('recoil stops at ledges, map and arena boundaries, and solid boss bodies',()=>{
 const ledge=scene();ledge.platforms=[{x:590,y:480,w:180,kind:'stone'}];
 stepAdventure(ledge,{super:true},1/120);while(ledge.superCinematic)stepAdventure(ledge,{},1/120);
 expect(ledge.player.x).toBeGreaterThanOrEqual(598);expect(ledge.player.x).toBeLessThan(600);expect(ledge.player.ground).toBe(0);expect(ledge.player.y).toBe(480);
 const edge=scene(true);edge.player.x=20;stepAdventure(edge,{super:true},1/120);while(edge.superCinematic)stepAdventure(edge,{},1/120);expect(edge.player.x).toBeGreaterThanOrEqual(18);expect(edge.player.x).toBeLessThan(20);
 const arena=createAdventure(1);arena.enemies=[];arena.hostile=[];arena.arenaLocked=true;arena.player.x=arena.level.arena.left+26;arena.player.y=arena.level.arena.y-140;arena.player.ground=null;
 stepAdventure(arena,{super:true},1/120);while(arena.superCinematic)stepAdventure(arena,{},1/120);expect(arena.player.x).toBeGreaterThanOrEqual(arena.level.arena.left+24);
 const body=createAdventure(1);body.enemies=[];body.hostile=[];body.boss.phase='recover';body.boss.timer=10;const hull=bossHitbox(body);
 Object.assign(body.player,{x:hull.x-16,y:hull.y+100,ground:null,dir:-1});const x=body.player.x;
 stepAdventure(body,{super:true},1/120);while(body.superCinematic)stepAdventure(body,{},1/120);expect(body.player.x).toBeGreaterThanOrEqual(x);expect(body.player.x+15).toBeLessThanOrEqual(hull.x);
});

test('launch kick decays into a small vibration, fades away and is absent with reduced motion',()=>{
 const s=scene();s.superCinematic={age:SUPER_WINDUP,dir:1};expect(superCameraOffset(s).x).toBe(-4);
 s.superCinematic.dir=-1;expect(superCameraOffset(s).x).toBe(4);
 for(let age=0;age<SUPER_DURATION;age+=1/120){s.superCinematic.age=age;const offset=superCameraOffset(s);expect(Math.abs(offset.x)).toBeLessThanOrEqual(4.1);expect(Math.abs(offset.y)).toBeLessThan(.7);expect(superCameraOffset(s,true)).toEqual({x:0,y:0});if(age<SUPER_WINDUP)expect(offset).toEqual({x:0,y:0});}
 s.superCinematic.age=SUPER_DURATION-.001;expect(Math.abs(superCameraOffset(s).x)).toBeLessThan(.01);
 s.superCinematic.age=SUPER_DURATION;expect(superCameraOffset(s)).toEqual({x:0,y:0});
});

test('local render records ground and air recoil in both directions with a registered beam and reduced-motion variant',async({page})=>{
 fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{hexyMuzzle}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/actors/hexy/hexyAnimation.js')]);
  const art=await loadAdventureArt(),canvas=document.createElement('canvas');canvas.style='position:fixed;inset:0;width:1280px;height:720px;z-index:999999';document.body.append(canvas);const captures=[],positions=[];
  const chunks=[],recorder=new MediaRecorder(canvas.captureStream(30),{mimeType:'video/webm;codecs=vp9'});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start();
  for(const airborne of [false,true])for(const facing of [1,-1]){
   const s=createAdventure();for(const k of ['enemies','hostile','outposts','supplies','hazards','stars','cages'])s[k]=[];
   Object.assign(s.player,{x:600,y:airborne?300:480,ground:airborne?null:0,dir:facing});s.camera={x:120,y:40,backdropY:40,zoom:1};const name=(airborne?'air':'ground')+(facing>0?'-right':'-left');
   stepAdventure(s,{super:true},1/120);
   for(let frame=0;frame<98;frame++){
    if(frame>0)for(let n=0;n<4;n++)stepAdventure(s,{},1/120);
    renderAdventure(canvas,s,art);
    if([18,28,48,86].includes(frame)){
     captures.push({name:name+'-'+frame,data:canvas.toDataURL('image/jpeg',.92)});
     positions.push({name,frame,x:s.player.x,y:s.player.y,origin:s.superCinematic?.origin,tip:hexyMuzzle(s)});
    }
    if(frame===48&&airborne&&facing===1){renderAdventure(canvas,s,art,{reduced:true});captures.push({name:'air-reduced',data:canvas.toDataURL('image/jpeg',.92)});renderAdventure(canvas,s,art);}
    await new Promise(resolve=>setTimeout(resolve,1000/30));
   }
  }
  const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.stop();await stopped;const bytes=new Uint8Array(await new Blob(chunks,{type:recorder.mimeType}).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return{captures,positions,video:btoa(binary)};
 });
 for(const shot of result.captures)fs.writeFileSync(dir+shot.name+'.jpg',Buffer.from(shot.data.split(',')[1],'base64'));
 fs.writeFileSync(dir+'ultimate-recoil.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+'render.json',JSON.stringify({errors,positions:result.positions},null,2));
 expect(errors).toEqual([]);for(const p of result.positions.filter(p=>p.frame>18))expect(p.origin).toEqual(p.tip);
});
