import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,adventureCarry} from '../src/components/arcade/adventure/engine/adventureModel';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {RIVER_PLANES,riverPlanePlacement} from '../src/components/arcade/adventure/world/adventureRiverDepth';
import {riverBridgePiers,riverBridgeSegments} from '../src/components/arcade/adventure/render/adventureRiverCanvas';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {SUPER_RECHARGE} from '../src/components/arcade/adventure/engine/adventureRewards';
import {applyRequestedLocalReset,LOCAL_RESET_KEY} from '../src/components/arcade/shared/arcadeLocalReset';
const dir='tests/artifacts/arcade/stage-polish/';
function quiet(index=0){const s=createAdventure(index);for(const k of ['enemies','hazards','cages','stars','supplies','outposts'])s[k]=[];return s;}

test('river panoramas do not jump when the screen centre crosses an elevation change',()=>{
 const s=quiet(1),img={width:2172,height:724};s.camera={x:3400,y:150,backdropY:150,zoom:1};const before=RIVER_PLANES.map(p=>riverPlanePlacement(s,img,p));
 s.camera.x=4900;s.camera.zoom=.72;const after=RIVER_PLANES.map(p=>riverPlanePlacement(s,img,p));expect(after.map(p=>p.y)).toEqual(before.map(p=>p.y));
 for(const fps of [30,60,120]){s.camera={x:0,y:40,backdropY:40,zoom:1};s.player.x=9000;for(let i=0;i<fps;i++)followAdventureCamera(s,1/fps);expect(Math.abs(s.camera.y-40)).toBeLessThanOrEqual(140.001);expect(Math.abs(s.camera.backdropY-40)).toBeLessThanOrEqual(48.001);}
});


test('every bridge wake is registered to an actual pillar in the stretched deck artwork',()=>{
 const s=quiet(1),img={width:2172,height:724};
 for(const bridge of s.platforms.filter(q=>q.bridge)){
  const segments=riverBridgeSegments(bridge,img),piers=riverBridgePiers(bridge,img);expect(piers).toHaveLength((segments.length-2)*2);
  for(const q of piers){expect(q.x).toBeGreaterThan(bridge.x);expect(q.x).toBeLessThan(bridge.x+bridge.w);expect(q.y).toBeCloseTo(bridge.y+110.4);expect(q.w).toBeGreaterThan(20);}
 }
});


for(const index of [0,1])test(`boss ${index+1} arrives gradually after advancing into the arena, with no attacks during its entrance`,()=>{
 const s=quiet(index),a=s.level.arena;s.player.x=a.entry+130;s.player.y=a.y;s.player.ground=s.platforms.length-1;stepAdventure(s,{},1/120);expect(s.boss.phase).toBe('sleep');
 s.player.x=a.entry+141;stepAdventure(s,{},1/120);expect(s.boss.phase).toBe('intro');expect(s.boss.x).toBeGreaterThan(a.right+300);expect(s.boss.vulnerable).toBe(false);const x=s.boss.x,px=s.player.x;
 for(let i=0;i<120;i++)stepAdventure(s,{right:true},1/120);expect(s.player.x).toBeGreaterThan(px+100);expect(s.boss.x).toBeLessThan(x);expect(s.boss.phase).toBe('intro');expect(s.hostile).toHaveLength(0);
 let maxStep=0;while(s.boss.phase==='intro'){const previous=s.boss.x;stepAdventure(s,{},1/120);maxStep=Math.max(maxStep,Math.abs(previous-s.boss.x));expect(s.hostile).toHaveLength(0);}
 expect(maxStep).toBeLessThan(5);expect(s.boss.arrival.age).toBeGreaterThan(4);expect(s.boss.phase).toBe('recover');expect(s.boss.vulnerable).toBe(true);
});

test('the airborne ultimate has four sustained forward-leg poses, fixed wand registration and an eighty-second base recharge',()=>{
 const s=quiet();Object.assign(s.player,{x:450,y:270,ground:null,vy:-200});stepAdventure(s,{super:true},1/120);expect(s.superCooldown).toBe(80);const frames=new Set(),tips=[];
 while(s.superCinematic){stepAdventure(s,{},1/120);if(s.player.superCast>0){const p=hexyPose(s);expect(p.sheet).toBe('air-super-release');frames.add(p.frame);const tip=hexyMuzzle(s);expect(s.superCinematic.origin).toEqual(tip);tips.push({x:Math.round((tip.x-s.player.x)*1e6),y:Math.round((tip.y-s.player.y)*1e6)});}}
 expect(frames.size).toBe(4);expect(new Set(tips.map(p=>JSON.stringify(p))).size).toBe(1);expect(SUPER_RECHARGE).toBe(80);expect(createAdventure(1,false,adventureCarry(s)).superCooldown).toBe(80);
});

test('the explicitly requested development reset erases progress once and leaves future earnings and production saves intact',()=>{
 const data=new Map([['save',JSON.stringify({stars:2000,adventureUnlocked:4,modsOwned:['encore-pocket']})],['save:before-loadout-reset','old'],['lang','en']]);const storage={getItem:key=>data.get(key)||null,removeItem:key=>data.delete(key),setItem:(key,value)=>data.set(key,value)};
 expect(applyRequestedLocalReset(storage,'save',false)).toBe(false);expect(data.has('save')).toBe(true);
 expect(applyRequestedLocalReset(storage,'save',true)).toBe(true);expect(data.has('save')).toBe(false);expect(data.has('save:before-loadout-reset')).toBe(false);expect(data.get('lang')).toBe('en');expect(data.get(LOCAL_RESET_KEY)).toBe('done');
 data.set('save','new earnings');expect(applyRequestedLocalReset(storage,'save',true)).toBe(false);expect(data.get('save')).toBe('new earnings');
});

test('the live local app resets the old wallet and renders foreground, bridge contact, entrances and the airborne ultimate',async({page})=>{
 fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/arcade');await page.evaluate(()=>{localStorage.removeItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish');localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,economy:2,stars:1980,coins:500,adventureUnlocked:4,adventureCleared:[0,1],modsOwned:['encore-pocket']}));});await page.reload();
 await page.waitForFunction(()=>localStorage.getItem('magic-drink-arcade:owner-reset:2026-10-06-stage-polish')==='done');
 const wallet=await page.evaluate(async()=>{const {beginRun}=await import('/src/components/arcade/shared/arcadeStore.js');await beginRun(true);return JSON.parse(localStorage.getItem('magic-drink-arcade-v1'));});expect(wallet.stars).toBe(0);expect(wallet.coins).toBe(0);expect(wallet.adventureUnlocked).toBe(0);expect(wallet.modsOwned).toEqual([]);
 const shots=await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{groundY},{drawRiverPierWater,drawRiverWater,drawRiverBridge}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureRiverCanvas.js')]);
  const art=await loadAdventureArt(),canvas=document.createElement('canvas');canvas.style.cssText='width:1440px;height:810px;position:fixed;inset:0;z-index:99999';document.body.appendChild(canvas);window.polishPreview=canvas;
  const captures=[];
  function scene(index,x,name){const s=createAdventure(index);for(const k of ['enemies','outposts','supplies','pickups','hazards','stars','cages'])s[k]=[];s.player.x=x;s.player.y=groundY(s.platforms,x);s.player.ground=s.platforms.findIndex(q=>x>=q.x&&x<q.x+q.w);const floor=s.level.cameraFloor||440;s.camera={x:x-300,y:s.player.y-floor,backdropY:s.player.y-floor,zoom:1};s.time=8;renderAdventure(canvas,s,art);captures.push({name,data:canvas.toDataURL('image/jpeg',.9)});return s;}
  scene(1,4700,'bridge-contact');scene(1,6460,'river-clearance');scene(0,6650,'meadow-clearance');
  scene(0,1050,'meadow-foreground');scene(0,8460,'meadow-lake');scene(0,5150,'meadow-slope');scene(1,5400+740,'river-foreground');
  scene(0,9590,'meadow-near-tree');scene(1,1350,'river-near-tree');scene(1,5610+740,'river-near-tree-2');
  for(const index of [0,1]){const a=createAdventure(index).level.arena,s=scene(index,a.entry+141,`arena-${index+1}`);stepAdventure(s,{},1/120);for(let i=0;i<300;i++)stepAdventure(s,{},1/120);renderAdventure(canvas,s,art);captures.push({name:`arrival-${index+1}`,data:canvas.toDataURL('image/jpeg',.9)});}
  const air=scene(0,540,'air-ultimate');air.player.y-=130;air.player.ground=null;stepAdventure(air,{super:true},1/120);for(let i=0;i<145;i++)stepAdventure(air,{},1/120);renderAdventure(canvas,air,art);captures.push({name:'air-ultimate',data:canvas.toDataURL('image/jpeg',.9)});
  const s=scene(1,4700,'bridge'),ctx=canvas.getContext('2d');canvas.width=960;canvas.height=540;
  const pixels=paint=>{ctx.clearRect(0,0,960,540);ctx.save();ctx.translate(-s.camera.x,-s.camera.y);paint();ctx.restore();return ctx.getImageData(0,0,960,540).data;};
  const before=pixels(()=>drawRiverPierWater(ctx,s,art));s.time+=.28;const after=pixels(()=>drawRiverPierWater(ctx,s,art));let motion=0;for(let i=0;i<before.length;i+=4)if(before[i]!==after[i]||before[i+3]!==after[i+3])motion++;
  const one=pixels(()=>drawRiverPierWater(ctx,s,art,true));s.time+=2;const two=pixels(()=>drawRiverPierWater(ctx,s,art,true));let reduced=0;for(let i=0;i<one.length;i++)if(one[i]!==two[i])reduced++;
  const origin=s.camera.x,river=s.level.rivers[0];
  const contact=()=>{ctx.clearRect(0,0,960,540);ctx.save();ctx.translate(-origin,-river.y+80);drawRiverWater(ctx,s,art);for(const bridge of s.platforms.filter(q=>q.bridge))drawRiverBridge(ctx,bridge,art);drawRiverPierWater(ctx,s,art);ctx.restore();return ctx.getImageData(200,0,600,540).data;};
  const fixed=contact();s.camera.x+=80;const walked=contact();let cameraSlip=0;for(let i=0;i<fixed.length;i++)if(fixed[i]!==walked[i])cameraSlip++;
  const chunks=[],recorder=new MediaRecorder(canvas.captureStream(12),{mimeType:'video/webm;codecs=vp9'});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start();
  for(const [index,x,name] of [[0,800,'meadow-walk'],[0,4900,'slope-walk'],[0,9220,'forest-edge-walk'],[1,980,'river-walk'],[1,6050,'river-slope-walk'],[1,3850,'bridge-walk']]){
   const walk=scene(index,x,name);
   for(let frame=0;frame<32;frame++){for(let n=0;n<5;n++)stepAdventure(walk,{right:true},1/60);renderAdventure(canvas,walk,art);if(frame%10===0)captures.push({name:`${name}-${frame}`,data:canvas.toDataURL('image/jpeg',.9)});await new Promise(resolve=>setTimeout(resolve,1000/12));}
  }
  const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.stop();await stopped;
  const bytes=new Uint8Array(await new Blob(chunks,{type:recorder.mimeType}).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return{captures,motion,reduced,cameraSlip,video:btoa(binary)};
 });
 for(const q of shots.captures)fs.writeFileSync(dir+q.name+'.jpg',Buffer.from(q.data.split(',')[1],'base64'));expect(shots.motion).toBeGreaterThan(100);expect(shots.reduced).toBe(0);expect(shots.cameraSlip).toBe(0);expect(errors).toEqual([]);
 fs.writeFileSync(dir+'parallax-walk.webm',Buffer.from(shots.video,'base64'));
 await page.evaluate(()=>localStorage.setItem('magic-drink-arcade-v1',JSON.stringify({version:1,economy:2,stars:12})));await page.reload();const after=await page.evaluate(async()=>{const {beginRun}=await import('/src/components/arcade/shared/arcadeStore.js');await beginRun(true);return JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).stars;});expect(after).toBe(12);
});
