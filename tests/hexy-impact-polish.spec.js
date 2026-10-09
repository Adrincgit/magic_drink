import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {dropHarlequinSupply,damageSupply,updateSupplies} from '../src/components/arcade/adventure/world/adventureSupplies';
import {harlequinDrawing,updateHarlequin} from '../src/components/arcade/adventure/actors/bosses/adventureHarlequin';
import {harlequinFireHitbox,PYRE_HEIGHT} from '../src/components/arcade/adventure/actors/bosses/harlequinFire';
import {beginHarlequinUltimate} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {fluidSockets} from '../src/components/arcade/adventure/actors/bosses/harlequinFluidSockets';
const tick=(s,input={})=>stepAdventure(s,input,1/120);
function safe(level=0,air=false){
 const s=createAdventure(level);s.enemies=[];s.outposts=[];s.hazards=[];s.pickups=[];s.shots=[];s.stars=[];
 const platform=s.platforms.find(q=>q.w>600),x=platform.x+platform.w*.5,y=surfaceY(platform,x);
 Object.assign(s.player,{x,y:y-(air?160:0),ground:air?null:s.platforms.indexOf(platform),hurt:0});
 s.hearts=1;s.boss.phase='sleep';return s;
}
function lethal(s){const p=s.player;s.hostile.push({x:p.x,y:p.y-25,vx:0,vy:0,r:12,life:1,age:0,kind:'test'});tick(s);}
test('all four levels play a slow falling defeat on ground and in the air, then stay prone',()=>{
 for(let level=0;level<4;level++)for(const air of [false,true]){
  const s=safe(level,air);lethal(s);expect(s.playerDefeat?.state).toBe('fall');expect(s.done).toBe(false);expect(s.hearts).toBe(0);expect(s.events).toContain('hexyDefeatLaunch');
  const frames=new Set(),ys=[];let deaths=0,lands=0,n=0;
  while(!s.done&&n++<700){tick(s,{right:true,jump:true,attack:true,super:true});frames.add(s.player.clashFlight.frame);ys.push(s.player.y);deaths+=s.events.filter(k=>k==='death').length;lands+=s.events.filter(k=>k==='hexyDefeatLand').length;expect(s.hearts).toBe(0);expect(s.superCinematic).toBeFalsy();}
  expect(s.done).toBe(true);expect(s.won).toBe(false);expect(n/120).toBeGreaterThan(2);expect(n/120).toBeLessThan(5.5);expect(Math.max(...ys)-Math.min(...ys)).toBeGreaterThan(25);expect(frames.size).toBeGreaterThanOrEqual(4);expect(lands).toBe(1);expect(deaths).toBe(1);expect(s.player.clashFlight.frame).toBe(4);
  const x=s.player.x;tick(s,{jump:true});expect(s.player.x).toBe(x);retryAdventure(s);expect(s.playerDefeat).toBeUndefined();expect(s.player.clashFlight).toBeUndefined();expect(s.done).toBe(false);
 }
});
test('bottomless defeat animates without teleporting to a checkpoint or inventing a landing',()=>{
 const s=safe();s.platforms=[];s.player.ground=null;s.player.y=510;s.player.vy=300;s.camera={x:0,y:0,zoom:1};s.checkpointAt=[9999,480];tick(s);
 expect(s.playerDefeat?.pit).toBe(true);expect(s.done).toBe(false);const x=s.player.x,y=s.player.y;
 tick(s);expect(s.player.y).toBeGreaterThan(y);expect(s.player.x).toBe(x);let landed=false;
 for(let i=0;i<400&&!s.done;i++){tick(s);landed ||= s.events.includes('hexyDefeatLand');}expect(s.done).toBe(true);expect(landed).toBe(false);
});
test('destroying each aid crate at several fall heights never suspends debris or its drink',()=>{
 for(const stage of [2,3])for(const delay of [0,45,115]){
  const s=createAdventure(3);s.supplies=[];s.player.x=1600;dropHarlequinSupply(s,stage);for(let i=0;i<delay;i++)updateSupplies(s,1/120);
  const q=s.supplies[0];damageSupply(s,q,99);const start=q.y;updateSupplies(s,1/120);expect(q.y).toBeGreaterThan(start);damageSupply(s,q,99);expect(s.pickups).toHaveLength(1);
  for(let i=0;i<480;i++)updateSupplies(s,1/120);expect(q.y).toBe(s.level.arena.y);expect(q.falling).toBe(false);expect(q.hp).toBe(0);expect(s.pickups[0].y).toBe(s.level.arena.y-28);expect(s.pickups[0].vy).toBe(0);
 }
});
test('new running cycle has twelve drawings and a long surviving-boss recovery holds arms down',()=>{
 for(const stage of [1,2,3]){const s=createAdventure(3),b=s.boss;b.stage=stage;b.phase='attack';b.move='dash';const frames=new Set();
  for(let i=0;i<12;i++){b.sprintDistance=i*23;const pose=harlequinDrawing(s);expect(pose.key).toContain('sprint');frames.add(pose.frame);}expect(frames.size).toBe(12);
 }
 const s=createAdventure(3);s.arenaLocked=true;s.enemies=[];s.outposts=[];s.stars=[];s.supplies=[];Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{phase:'recover',timer:100,engaged:true,stage:3,hp:240,turn:3});beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')tick(s);tick(s,{super:true});while(['windup','travel'].includes(s.powerClash.state))tick(s);
 for(let i=0;s.powerClash.state==='contest'&&i<1900;i++)tick(s,{attack:i%15===0});expect(s.powerClash.won).toBe(true);
 while(s.powerClash.state!=='land')tick(s);const frames=new Set();let n=0;while(s.powerClash&&n++<600){frames.add(harlequinDrawing(s).frame);tick(s);}
 expect(n/120).toBeGreaterThan(3.3);expect([...frames]).toEqual([16,17,18,19]);expect(s.boss.hp).toBe(48);expect(s.boss.exhausted).toBe(3);expect(harlequinDrawing(s).frame).toBe(19);
 s.damage=()=>{};for(let i=0;i<240;i++)updateHarlequin(s,1/120,{body:playerBody},()=>{});expect(harlequinDrawing(s).frame).toBe(19);expect(s.boss.phase).toBe('recover');s.boss.hp=0;expect(harlequinDrawing(s).frame).toBe(12);for(let i=0;i<240;i++)tick(s);expect(harlequinDrawing(s).frame).toBe(16);
});
test('tall pyres cover their visible lane while leaving generous horizontal escape gaps',()=>{
 const q={kind:'harlequin-pyre',x:200,floor:480},box=harlequinFireHitbox(q);expect(box.h).toBe(PYRE_HEIGHT);expect(box.h).toBeGreaterThan(220);expect(box.y+box.h).toBe(480);expect(160-box.w).toBeGreaterThan(100);
});
test('all 96 new action cells and eight fire cells preserve independent transparent silhouettes',async()=>{
 for(const name of ['motion-fluid','motion-fluid-mid','motion-fluid-final']){const im=sharp('public/arcade/sprites/bosses/harlequin/'+name+'.webp');expect((await im.metadata()).hasAlpha).toBe(true);
  for(let i=0;i<32;i++){const {data}=await im.clone().extract({left:i%4*512,top:Math.floor(i/4)*512,width:512,height:512}).raw().toBuffer({resolveWithObject:true});let count=0;for(let k=3;k<data.length;k+=4)if(data[k]>100)count++;expect(count).toBeGreaterThan(5000);expect(count).toBeLessThan(160000);for(const k of [3,511*4+3,511*512*4+3,data.length-1])expect(data[k]).toBe(0);}
 }
 const m=await sharp('public/arcade/sprites/bosses/harlequin/pyres.webp').metadata();expect([m.width,m.height,m.hasAlpha]).toEqual([768,1024,true]);
});
test('every new throwing socket overlaps its painted release flame in all damage stages',async()=>{
 for(const [stage,name]of ['motion-fluid','motion-fluid-mid','motion-fluid-final'].entries()){
  const {data,info}=await sharp('public/arcade/sprites/bosses/harlequin/'+name+'.webp').raw().toBuffer({resolveWithObject:true});
  for(const [move,frame]of [['vault',12],['fan',20],['ribbon',28]]){const q=fluidSockets[stage][move],x=Math.round(256+q.x/(320*1.5/512)),y=Math.round(490+q.y/(320*1.5/512));let lit=false;
   for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const k=((Math.floor(frame/4)*512+y+dy)*info.width+frame%4*512+x+dx)*4;if(data[k+3]>130&&data[k]>200&&data[k+2]<100)lit=true;}expect(lit).toBe(true);
  }
 }
});

test('review actual death, release, eruption, smoke and cinematic recovery in motion',async({page})=>{
 test.setTimeout(120000);const dir='tests/artifacts/arcade/impact-polish/';fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1280,height:720});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [engine,render,camera,boss,supplies]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/bosses/harlequinUltimate.js'),import('/src/components/arcade/adventure/world/adventureSupplies.js')]);
  const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='impact-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1280px;height:720px';document.body.append(canvas);
  const w=window.impact={canvas,art,engine,render,boss,supplies};
  w.fresh=()=>{const s=engine.createAdventure(3);s.arenaLocked=true;s.enemies=[];s.outposts=[];s.hazards=[];s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:1500,y:480,ground:2});Object.assign(s.boss,{x:2430,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3});for(let i=0;i<600;i++)camera.followAdventureCamera(s,1/120);w.s=s;return s;};
  w.tick=(count=1,input={})=>{for(let i=0;i<count;i++)engine.stepAdventure(w.s,input,1/120);};w.paint=()=>render.renderAdventure(canvas,w.s,art,{});w.fresh();w.paint();
 });
 const canvas=page.locator('#impact-review');
 for(const [name,setup,frames]of [
  ['air-death','s.hearts=1;s.player.y=300;s.player.ground=null;s.hostile.push({x:s.player.x,y:275,vx:0,vy:0,r:14,age:0,life:1,kind:"test"});',[1,45,80,130,130]],
  ['pyre','Object.assign(s.boss,{phase:"warn",move:"pyre",timer:.01,warnDuration:1});',[40,55,40,30]],
  ['ribbon','Object.assign(s.boss,{phase:"warn",move:"ribbon",timer:.15,warnDuration:1});',[15,25,10,10,10]],
  ['crate','w.supplies.dropHarlequinSupply(s,2);w.supplies.damageSupply(s,s.supplies[0],1);',[1,90,130]],
 ]){
  await page.evaluate(setup=>{const w=window.impact,s=w.fresh();Function('w','s',setup)(w,s);},setup);
  for(let i=0;i<frames.length;i++){await page.evaluate(n=>{const w=window.impact;w.tick(n);w.paint();},frames[i]);await canvas.screenshot({path:dir+name+'-'+i+'.jpg'});}
 }
 for(const won of [false,true]){
  await page.evaluate(won=>{const w=window.impact,s=w.fresh();w.boss.beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')w.tick();w.tick(1,{super:true});while(['windup','travel'].includes(s.powerClash.state))w.tick();s.powerClash.pressure=won?.78:.15;w.tick(70,{attack:false});s.powerClash.pressure=won?.78:.15;w.paint();},won);
  await canvas.screenshot({path:dir+(won?'winning':'losing')+'.jpg'});
  await page.evaluate(won=>{const w=window.impact;w.s.powerClash.state='resolve';w.s.powerClash.age=0;w.s.powerClash.won=won;},won);
  for(const [name,n]of [['blast',58],['flight',60],['impact',102],['sit',125],['stand',125],['tired',125]]){await page.evaluate(n=>{const w=window.impact;w.tick(n);w.paint();},n);await canvas.screenshot({path:dir+(won?'boss':'hexy')+'-'+name+'.jpg'});}
 }
 // Capture live renderer frames at real cadence, including a run and a complete defeat.
 const video=await page.evaluate(async()=>{
  const w=window.impact,s=w.fresh();Object.assign(s.boss,{phase:'warn',move:'dash',timer:.15,warnDuration:1});
  const stream=w.canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000}),chunks=[];rec.ondataavailable=e=>chunks.push(e.data);rec.start();
  await new Promise(resolve=>{let n=0;const frame=()=>{if(n===180){w.fresh();w.s.hearts=1;w.s.player.y=310;w.s.player.ground=null;w.s.hostile.push({x:w.s.player.x,y:285,vx:0,vy:0,r:14,life:1,age:0,kind:'test'});}w.tick(2);w.paint();if(++n<450)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
  const finished=new Promise(resolve=>rec.onstop=resolve);rec.stop();await finished;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);
 });fs.writeFileSync(dir+'motion-review.webm',Buffer.from(video,'base64'));expect(errors).toEqual([]);
});
