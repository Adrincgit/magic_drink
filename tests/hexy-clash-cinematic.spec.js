import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {createAdventure,stepAdventure,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginHarlequinUltimate} from '../src/components/arcade/adventure/actors/bosses/harlequinUltimate';
import {clashPortraitFrames,CLASH_TRAVEL} from '../src/components/arcade/adventure/engine/adventurePowerClash';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {superCameraOffset} from '../src/components/arcade/adventure/render/adventureSuperCanvas';
import {duelSide} from '../src/components/arcade/adventure/render/duelCutinCanvas';
const tick=(s,input={})=>stepAdventure(s,input,1/120);
function scene(reverse=false){const s=createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];Object.assign(s.player,{x:reverse?2480:1460,y:480,ground:2});Object.assign(s.boss,{x:s.player.x+(reverse?-80:80),y:480,hp:240,stage:3,engaged:true,phase:'recover',timer:100,turn:3});return s;}

test('a close boss visibly jumps away on either side, then charges with live movement and shaking',()=>{
 for(const reverse of [false,true]){const s=scene(reverse);beginHarlequinUltimate(s);const start=s.boss.x;let highest=480,frames=0;
  while(s.boss.ultimate.state==='leap'&&frames++<130){tick(s);highest=Math.min(highest,s.boss.y);const c=s.camera;expect((s.boss.x-c.x)*c.zoom).toBeGreaterThan(25);expect((s.boss.x-c.x)*c.zoom).toBeLessThan(935);}
  expect(frames).toBeGreaterThan(95);expect(highest).toBeLessThan(255);expect(Math.abs(s.boss.x-start)).toBeGreaterThan(800);expect(Math.abs(s.boss.x-s.player.x)).toBeGreaterThan(950);expect(s.boss.y).toBe(480);
  const x=s.player.x;for(let i=0;i<60;i++)tick(s,{left:reverse,right:!reverse});expect(Math.abs(s.player.x-x)).toBeGreaterThan(20);
  expect(Math.hypot(...Object.values(superCameraOffset(s)))).toBeGreaterThan(.1);expect(superCameraOffset(s,true)).toEqual({x:0,y:0});expect(duelSide(s)).toBe(reverse);expect(duelSide(s,true)).toBe(!reverse);
 }
});

test('camera closes with proximity, opens with separation on either side, and preserves floor and scenery',()=>{
 for(const reverse of [false,true]){const s=scene(reverse);const settle=()=>{for(let i=0;i<600;i++)followAdventureCamera(s,1/120);};s.camera.backdropY=40;settle();const near=s.camera.zoom;
  s.boss.x=reverse?1365:2515;settle();expect(near).toBeGreaterThan(1);expect(s.camera.zoom).toBeLessThan(near-.3);expect(s.camera.x).toBeGreaterThanOrEqual(0);expect(s.camera.x+960/s.camera.zoom).toBeLessThanOrEqual(s.level.width);
  for(const actor of [s.player,s.boss])expect((actor.x-s.camera.x)*s.camera.zoom).toBeGreaterThan(40);
  expect((480-s.camera.y)*s.camera.zoom).toBeCloseTo(454,2);expect(s.camera.backdropY).toBe(40);
 }
});

test('launch travels before impact; contest starts only on contact and grin begins at twenty-point advantage',()=>{
 const s=scene();beginHarlequinUltimate(s);for(let i=0;i<150&&s.boss.ultimate.state==='leap';i++)tick(s);tick(s,{super:true});
 for(let i=0;i<130&&s.powerClash.state==='windup';i++)tick(s);
 expect(s.powerClash.state).toBe('travel');expect(s.events).toContain('harlequinRelease');expect(s.events).not.toContain('clashImpact');let frames=0,impacts=0;
 while(s.powerClash.state==='travel'&&frames++<60){tick(s);impacts+=s.events.filter(e=>e==='clashImpact').length;expect(s.powerClash.contestAge).toBe(0);}
 expect(frames/120).toBeCloseTo(CLASH_TRAVEL,1);expect(impacts).toBe(1);expect(s.powerClash.state).toBe('contest');expect(s.powerClash.sparks.length).toBe(40);
 expect(clashPortraitFrames({pressure:.4,rally:0,contestAge:2}).boss).toBe(3);expect(clashPortraitFrames({pressure:.41,rally:0,contestAge:2}).boss).not.toBe(3);
});

test('legacy interior checkpoints are discarded on retry and no flag is recreated on entry',()=>{
 const s=scene();s.checkpointAt=[1150,480];s.checkpoint=true;s.done=true;retryAdventure(s);expect(s.player.x).toBe(-1140);expect(s.checkpointAt).toBeNull();expect(s.level.checkpoints).toEqual([]);
 for(let i=0;i<1100&&s.player.x<1380;i++)tick(s,{right:true});expect(s.player.x).toBeGreaterThan(1000);expect(s.checkpointAt).toBeNull();expect(s.checkpoint).toBe(false);
});

test('twenty-four full-body drawings preserve clear gutters, transparency and distinct animation frames',async()=>{
 for(const file of ['public/arcade/sprites/ui/hexy-clash-full.webp','public/arcade/sprites/bosses/harlequin/clash-full.webp']){
  const img=sharp(file),m=await img.metadata();expect([m.width,m.height,m.hasAlpha]).toEqual([1152,1792,true]);
  for(let row=0;row<4;row++){const hashes=[];for(let col=0;col<3;col++){
   const raw=await img.clone().extract({left:col*384,top:row*448,width:384,height:448}).raw().toBuffer();let clear=0,solid=0;
   for(let i=3;i<raw.length;i+=4){if(raw[i]<10)clear++;if(raw[i]>200)solid++;}expect(clear/raw.length*4).toBeGreaterThan(.4);expect(solid).toBeGreaterThan(20000);
   for(const [x,y]of [[0,0],[383,0],[0,447],[383,447]])expect(raw[(y*384+x)*4+3]).toBe(0);hashes.push(raw.toString('base64'));
  }expect(new Set(hashes).size).toBe(3);}
 }
});

test('review both sides, charge, travelling rays and sustained collision in the real renderer',async({page})=>{
 const folder='tests/artifacts/arcade/clash-cinematic/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:810});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const [engine,render,camera,boss]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/render/adventureCamera.js'),import('/src/components/arcade/adventure/actors/bosses/harlequinUltimate.js')]);
  const art=await render.loadAdventureArt(),canvas=document.createElement('canvas');canvas.id='duel-review';canvas.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(canvas);
  window.duelReview={canvas,art,tick:input=>engine.stepAdventure(window.duelReview.s,input||{},1/120),paint:()=>render.renderAdventure(canvas,window.duelReview.s,art),fresh:reverse=>{const s=engine.createAdventure(3);s.arenaLocked=true;s.supplies=[];s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:reverse?2480:1460,y:480,ground:2});Object.assign(s.boss,{x:reverse?1440:2460,y:480,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:240,turn:3});for(let i=0;i<600;i++)camera.followAdventureCamera(s,1/120);window.duelReview.s=s;boss.beginHarlequinUltimate(s);}};
 });
 for(const reverse of [false,true]){
  await page.evaluate(reverse=>{const w=window.duelReview;w.fresh(reverse);for(let i=0;i<240;i++)w.tick();w.paint();},reverse);await page.locator('#duel-review').screenshot({path:folder+(reverse?'right':'left')+'-charge.jpg'});
  await page.evaluate(()=>{const w=window.duelReview;w.tick({super:true});for(let i=0;i<100;i++)w.tick();w.paint();});await page.locator('#duel-review').screenshot({path:folder+(reverse?'right':'left')+'-prepare.jpg'});
  for(const [name,frames]of [['launch',18],['travel',15],['impact',15],['struggle',330]]){
   await page.evaluate(n=>{const w=window.duelReview;for(let i=0;i<n;i++)w.tick({attack:i%15===0});w.paint();},frames);await page.locator('#duel-review').screenshot({path:folder+(reverse?'right':'left')+'-'+name+'.jpg'});
  }
 }
 expect(errors).toEqual([]);
});
