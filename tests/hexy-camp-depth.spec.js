import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepCampTents} from '../src/components/arcade/adventure/engine/adventureCamp';
import {collectibleFrame} from '../src/components/arcade/adventure/render/adventureSprites';
import {CAMP_PLANES,campPlaneX,campSmokePlacement,campTentPlacement} from '../src/components/arcade/adventure/render/circusCampCanvas';
import {damageSupply} from '../src/components/arcade/adventure/world/adventureSupplies';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const dir='tests/artifacts/camp-depth';

test('gold stars never address negative atlas cells anywhere in the exterior',()=>{
 const s=createAdventure(3);
 const old=Array.from({length:28},(_,i)=>`3:star:${-5000+i*155}:${435-(i%3===1?20:0)}`);
 const replay=createAdventure(3,false,{collectedStars:old});expect(replay.stars.filter(q=>q.taken)).toHaveLength(28);
 for(const star of s.stars)for(let i=0;i<240;i++){
  const frame=collectibleFrame(i/60,star.x);expect(frame).toBeGreaterThanOrEqual(0);expect(frame).toBeLessThan(4);
 }
 expect([0,1,2,3].map(i=>collectibleFrame(i/7,-12120))).toEqual([0,1,2,3]);
});
test('all eight tent squads announce, emerge from their own door, and stop spawning after defeat',()=>{
 const s=createAdventure(3);expect(s.level.circusEntrance.doorX-s.player.x).toBeGreaterThan(11000);expect(s.enemies).toHaveLength(0);
 expect(s.campTents).toHaveLength(8);
 for(const q of s.campTents){
  s.player.x=q.x-560;stepCampTents(s,.1);expect(q.state).toBe('opening');expect(s.enemies.filter(e=>e.campTent===q.id)).toHaveLength(0);
  stepCampTents(s,.9);const e=s.enemies.find(e=>e.campTent===q.id);expect(e.x).toBe(q.x);expect(e.emerging).toBeGreaterThan(0);expect(e.action).toBe(0);
  for(let i=0;i<1000;i++){for(const e of s.enemies)e.hp=0;stepCampTents(s,1/60);}
  expect(q.state).toBe('cleared');expect(q.spawned).toBe(q.crew.length);
  expect(s.enemies.filter(e=>e.campTent===q.id)).toHaveLength(q.crew.length);
 }
 expect(s.enemies).toHaveLength(19);
 s.checkpointAt=[-3640,480];retryAdventure(s);
 expect(s.campTents.every(q=>q.state==='closed')).toBe(true);expect(s.player.x).toBe(s.level.spawn[0]);
 s.checkpointAt=[660,480];retryAdventure(s);tick(s,100);expect(s.enemies).toHaveLength(0);
});
test('the midpoint heart is released only by breaking the marked crate, then heals one heart on pickup',()=>{
 const s=createAdventure(3),box=s.supplies.find(q=>q.preview==='heart');s.hearts=1;s.player.x=box.x-100;s.player.y=480;s.player.ground=0;
 tick(s,40);expect(s.hearts).toBe(1);expect(s.pickups.some(q=>q.type==='heart')).toBe(false);
 damageSupply(s,box,3);expect(s.pickups).toHaveLength(0);damageSupply(s,box,1);expect(s.pickups.filter(q=>q.type==='heart')).toHaveLength(1);
 s.player.x=box.x;tick(s,100);expect(s.hearts).toBe(2);
 expect(campTentPlacement(s).w).toBeGreaterThan(2500);
});
test('depth planes separate laterally, keep their roots still, and smoke animates with a parked camera',()=>{
 const s=createAdventure(3);const a=CAMP_PLANES.map(p=>campPlaneX(s,100,p.depth));s.camera.x+=100;
 CAMP_PLANES.forEach((p,i)=>expect(a[i]-campPlaneX(s,100,p.depth)).toBeCloseTo(p.depth*100));
 for(let layer=0;layer<3;layer++){
  const before=campSmokePlacement(s,0,layer);s.time+=2;const after=campSmokePlacement(s,0,layer);
  expect(after.x).not.toBe(before.x);expect(after.mix).not.toBe(before.mix);expect(after.y).toBe(before.y);
  const quiet=campSmokePlacement(s,0,layer,true);s.time+=5;expect(campSmokePlacement(s,0,layer,true)).toEqual(quiet);
 }
});
test('inspect the actual layered camp, tent emergence, healing crate and giant side entrance',async({page})=>{
 fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';const w=window.campReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','render/circusCampCanvas.js','world/adventureSupplies.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='camp-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=x=>{w.s=w.createAdventure(3);Object.assign(w.s.player,{x,y:480,ground:0});w.s.time=13;w.s.noticeTime=0;for(let i=0;i<800;i++)w.followAdventureCamera(w.s,1/120);};
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
 });
 const pixels=await page.evaluate(()=>{
  const w=window.campReview,s=w.createAdventure(3),canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const c=canvas.getContext('2d',{willReadFrequently:true});
  const floor=()=>{c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,960,540);c.translate(-s.camera.x,-s.camera.y);w.drawCampGround(c,s,w.art);return c.getImageData(0,0,960,540).data;};
  const a=floor();s.camera.x+=24;const b=floor();const rows=[390,440,510].map(y=>{let error=0,n=0;for(let x=80;x<800;x++)for(let k=0;k<3;k++){error+=Math.abs(a[(y*960+x+24)*4+k]-b[(y*960+x)*4+k]);n++;}return error/n;});
  const back=reduced=>{c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,960,540);w.drawCampBackdrop(c,s,w.art,reduced);return c.getImageData(0,0,960,340).data;};
  const diff=(a,b)=>a.reduce((n,v,i)=>n+Math.abs(v-b[i]),0)/a.length;
  const smoke=back(false);s.time+=3;const moving=diff(smoke,back(false)),quiet=back(true);s.time+=3;
  return{rows,moving,reduced:diff(quiet,back(true))};
 });
 for(const error of pixels.rows)expect(error).toBeLessThan(.1);expect(pixels.moving).toBeGreaterThan(.1);expect(pixels.reduced).toBe(0);
 for(const [name,x]of [['01-start',-12120],['02-first-tent',-11500],['03-deep-camp',-7580],['04-guard',-3280],['05-heart',-710],['06-grand-tent',-270]]){
  await page.evaluate(x=>{const w=window.campReview;w.scene(x);w.paint();},x);await page.locator('#camp-review').screenshot({path:dir+'/'+name+'.jpg'});
 }
 await page.evaluate(()=>{const w=window.campReview;w.scene(-11550);for(let i=0;i<180;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await page.locator('#camp-review').screenshot({path:dir+'/07-emergence.jpg'});
 await page.evaluate(()=>{const w=window.campReview,q=w.createAdventure(3).supplies.find(q=>q.preview==='heart');w.scene(q.x-140);const box=w.s.supplies.find(q=>q.preview==='heart');w.damageSupply(w.s,box,4);for(let i=0;i<60;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await page.locator('#camp-review').screenshot({path:dir+'/08-heart-released.jpg'});
 expect(errors).toEqual([]);
});
