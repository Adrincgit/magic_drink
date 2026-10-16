import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,adventureCarry,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {clashPortraitFrames,clashCastingFrame,clashPortraitCrop,clashPortraitSprite} from '../src/components/arcade/adventure/engine/clashActing';
import {scenicTreeRoot} from '../src/components/arcade/adventure/render/emberAtmosphereCanvas';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {emberBurnAt} from '../src/components/arcade/adventure/world/adventureEmberTrail';

test('1-5 has no rescued companions or interior crates, including campaign carry and retry',()=>{
 const previous=createAdventure(5);previous.rescued=3;
 for(const carry of [{},adventureCarry(previous)]){
  const s=createAdventure(3,false,carry);expect(s.cages).toHaveLength(0);expect(s.rescued).toBe(0);
  expect(s.supplies.length).toBeGreaterThan(0);expect(s.supplies.every(q=>q.x<s.level.circusEntrance.trigger)).toBe(true);
  expect(s.supplies.some(q=>q.loot?.type==='fullheal')).toBe(true);
  s.checkpointAt=[660,480];retryAdventure(s);expect(s.cages).toHaveLength(0);expect(s.rescued).toBe(0);expect(s.supplies.some(q=>q.x>=0)).toBe(false);
 }
 expect(createAdventure(5).cages.length).toBeGreaterThan(0);
});

test('the summit trees belong to the burned forest and their roots stay fixed under camera movement',()=>{
 const s=createAdventure(5),trees=s.level.fallingTrees;
 expect(trees.some(q=>q.x>=10600&&q.x<14400)).toBe(false);
 for(const q of trees.slice(0,2)){
  expect(emberBurnAt(q.x)).toBeGreaterThan(.95);expect(q.y).toBe(groundY(s.level.route,q.x));
  expect(q.scenic).toBe(true);s.camera={x:q.x-450,y:q.y-420,zoom:1};
  const before=scenicTreeRoot(s,q);expect(before.worldY).toBeGreaterThan(q.y-25);
  s.camera.x+=120;s.camera.y-=40;const after=scenicTreeRoot(s,q);
  expect(before.x-after.x).toBeCloseTo(120*.72);expect(after.y-before.y).toBeCloseTo(40*.72);expect(after.worldY).toBe(before.worldY);
 }
});

test('winning keeps the original casting cycle moving and never switches to an open-mouth row',()=>{
 for(const pressure of [.499,.43,.35,.28,.16,.04]){
  const frames=new Set();for(let n=0;n<120;n++){
   const q={pressure,wave:n%2};expect(clashPortraitFrames(q).boss).toBe(3);frames.add(clashCastingFrame(q,true,n/60));
   const pose=clashPortraitSprite(q,true,n/60);expect(pose.key).toBe('harlequin-clash-grin');expect(pose.cols).toBe(3);expect(pose.bust).toBeUndefined();
  }expect(frames.size).toBe(3);
 }
 expect([.45,.28,.1].map(pressure=>clashPortraitSprite({pressure},true,1).frame)).toEqual([0,0,0]);
 for(const time of [0,.1,1,10])expect(clashCastingFrame({pressure:.1},true,time,true)).toBe(0);
 for(const pressure of [.5,.6,.9])expect(clashPortraitFrames({pressure}).boss).not.toBe(3);
});

test('both portraits approach their faces progressively without growing into the beam corridor',()=>{
 for(const boss of [false,true]){
  let previous=1;for(const pressure of [.5,.4,.3,.15,.02]){
   const crop=clashPortraitCrop({pressure},boss);expect(crop.zoom).toBeGreaterThanOrEqual(previous);previous=crop.zoom;
   expect(crop.x).toBeGreaterThanOrEqual(0);expect(crop.y).toBe(0);expect(crop.x+crop.w).toBeLessThanOrEqual(384);expect(crop.y+crop.h).toBeLessThanOrEqual(276);
   if(boss){expect(crop.x).toBeLessThan(60);expect(crop.x+crop.w).toBeGreaterThan(310);}
   expect(crop.zoom).toBeCloseTo(clashPortraitCrop({pressure:1-pressure},boss).zoom);
  }
  expect(previous).toBeGreaterThan(boss?1.4:1.5);
 }
});

test('render charge, both advantages, hill and relocated trees with the actual game art',async({page})=>{
 test.setTimeout(90000);const folder='tests/artifacts/arcade/duel-cleanup/';fs.mkdirSync(folder,{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:810});await page.goto('/arcade');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/';
  const w=window.duelCleanup=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js','actors/bosses/harlequinUltimate.js','engine/clashActing.js'].map(p=>import(base+p))));
  w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.id='cleanup-review';w.canvas.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.canvas);
  w.paint=()=>w.renderAdventure(w.canvas,w.s,w.art);
  w.battle=reverse=>{const s=w.s=w.createAdventure(3);s.arenaLocked=true;s.stars=[];s.noticeTime=0;Object.assign(s.player,{x:reverse?2460:1460,y:480,ground:2});Object.assign(s.boss,{x:reverse?1460:2460,y:480,phase:'recover',timer:100,engaged:true,stage:3,hp:240,turn:3});for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);w.beginHarlequinUltimate(s);while(s.boss.ultimate.state==='leap')w.stepAdventure(s,{},1/120);};
 });
 for(const reverse of [false,true]){
  await page.evaluate(reverse=>{const w=window.duelCleanup;w.battle(reverse);for(let i=0;i<55;i++)w.stepAdventure(w.s,{},1/120);w.paint();},reverse);
  await page.locator('#cleanup-review').screenshot({path:folder+(reverse?'reversed-':'')+'charge.png'});
  await page.evaluate(()=>{const w=window.duelCleanup;w.stepAdventure(w.s,{super:true},1/120);for(let i=0;i<54;i++)w.stepAdventure(w.s,{},1/120);w.paint();});
  await page.locator('#cleanup-review').screenshot({path:folder+(reverse?'reversed-':'')+'both-charging.png'});
  await page.evaluate(()=>{const w=window.duelCleanup;while(['windup','travel'].includes(w.s.powerClash.state))w.stepAdventure(w.s,{},1/120);});
  for(const [name,pressure]of [['equal',.5],['boss-winning',.12],['hexy-winning',.88]]){
   await page.evaluate(pressure=>{const w=window.duelCleanup;Object.assign(w.s.powerClash,{pressure,portraitPressure:pressure,age:4,contestAge:4});w.s.fxTime=4;w.paint();},pressure);
   await page.locator('#cleanup-review').screenshot({path:folder+(reverse?'reversed-':'')+name+'.png'});
  }
 }
 for(const [name,x]of [['hill',10900],['burned-trees',26700],['last-tree',28900]]){
  await page.evaluate(x=>{const w=window.duelCleanup,s=w.s=w.createAdventure(5);s.player.x=x-120;s.player.y=w.groundY(s.level.route,s.player.x);s.player.ground=s.platforms.indexOf(w.groundAt(s.platforms,s.player.x));s.noticeTime=0;s.enemies=[];s.camera.y=s.camera.backdropY=s.player.y-420;for(let i=0;i<400;i++)w.followAdventureCamera(s,1/120);s.fxTime=2;w.paint();},x);
  await page.locator('#cleanup-review').screenshot({path:folder+name+'.png'});
 }
 const clip=await page.evaluate(async()=>{
  const w=window.duelCleanup;w.battle(false);w.stepAdventure(w.s,{super:true},1/120);
  const chunks=[],stream=w.canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:'video/webm'});
  const recording=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=async()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
  recorder.start();let start,last,lag=0;await new Promise((resolve,reject)=>{
   function frame(now){try{start??=now;last??=now;lag+=Math.min(.05,(now-last)/1000);last=now;const t=Math.min(6,(now-start)/1000);if(w.s.powerClash.state==='contest')w.s.powerClash.pressure=.5-.42*Math.sin((t-1.5)*Math.PI/2.2);while(lag>=1/120){w.stepAdventure(w.s,{},1/120);lag-=1/120;}w.paint();if(t<6)requestAnimationFrame(frame);else resolve();}catch(error){reject(error);}}requestAnimationFrame(frame);
  });recorder.stop();const data=await recording;stream.getTracks().forEach(track=>track.stop());return data;
 });
 fs.writeFileSync(folder+'expression-motion.webm',Buffer.from(clip,'base64'));
 expect(errors).toEqual([]);
});
