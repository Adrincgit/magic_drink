import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {followAdventureCamera,cameraView} from '../src/components/arcade/adventure/render/adventureCamera';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {riverWoodlandPlacement,RIVER_PLANES,riverPlanePlacement} from '../src/components/arcade/adventure/world/adventureRiverDepth';
const dir='tests/artifacts/arcade/dash-camera/';
function quiet(index=0){const s=createAdventure(index);for(const key of ['enemies','outposts','supplies','hazards','cages','stars','pickups'])s[key]=[];return s;}

test('projectile hits damage and interrupt ground rolls and air dashes, including simultaneous guard input',()=>{
 for(const airborne of [false,true])for(const guard of [false,true])for(const kind of ['ball','note','pellet']){
  const s=quiet();s.player.x=500;s.player.y=airborne?300:groundY(s.platforms,500);s.player.ground=airborne?null:0;
  stepAdventure(s,{dash:true,guard},1/120);expect(s.player.dash).toBeGreaterThan(0);expect(s.player.guarding).toBe(false);
  const body=playerBody(s.player);s.hostile=[{x:s.player.x+4,y:body.y+body.h/2,vx:-180,vy:0,r:9,age:0,life:2,kind}];
  const hearts=s.hearts;stepAdventure(s,{dash:true,guard},1/120);
  expect(s.hearts).toBe(hearts-1);expect(s.player.dash).toBe(0);expect(s.player.hitReact).toBeGreaterThan(0);expect(s.events).toContain('hit');expect(s.events).not.toContain('guardBlock');expect(s.hostile).toHaveLength(0);
 }
});

test('rolling still avoids a projectile above the body, while real shields and damage grace keep their effects',()=>{
 const s=quiet();s.player.x=500;s.hostile=[{x:504,y:s.player.y-53,vx:0,vy:0,r:4,age:0,life:2,kind:'ball'}];stepAdventure(s,{dash:true},1/120);expect(s.hearts).toBe(5);expect(s.hostile).toHaveLength(1);
 for(const shield of [0,1]){
  const hit=quiet();hit.shield=shield;hit.player.x=500;
  for(let i=0;i<2;i++)hit.hostile.push({x:504,y:hit.player.y-25,vx:0,vy:0,r:9,age:0,life:2,kind:'ball'});
  stepAdventure(hit,{dash:true},1/120);expect(hit.hearts).toBe(shield?5:4);expect(hit.shield).toBe(0);expect(hit.player.hurt).toBeGreaterThan(0);
 }
});

test('boss pullback keeps the floor steady and the viewport inside the map at every frame',()=>{
 for(const index of [0,1])for(const fps of [30,60,120]){
  const s=quiet(index),a=s.level.arena,normal=s.level.cameraFloor||440;s.player.x=a.entry+150;s.player.y=a.y;
  s.camera={x:s.player.x-300,y:a.y-normal,backdropY:a.y-normal,zoom:1};s.arenaLocked=true;s.boss.phase='intro';
  let floor=normal;
  for(let i=0;i<fps*5;i++){
   s.boss.x=a.right+460-Math.min(1,i/(fps*4))*800;
   followAdventureCamera(s,1/fps);const view=cameraView(s),next=(a.y-s.camera.y)*view.zoom;
   expect(s.camera.x).toBeGreaterThanOrEqual(0);expect(s.camera.x+view.width).toBeLessThanOrEqual(s.level.width+.00001);
   expect(next).toBeGreaterThanOrEqual(floor-.00001);expect(next-floor).toBeLessThan(8);expect(next).toBeLessThanOrEqual(index?470.001:475.001);floor=next;
   expect(s.camera.backdropY).toBeCloseTo(a.y-normal,6);
  }
  expect(s.camera.zoom).toBeLessThan(.85);
 }
});

test('distant woodland and panorama registration ignore combat zoom and retain distinct horizontal depths',()=>{
 const s=quiet(1),img={width:1200,height:1400};s.camera={x:11850,y:250,backdropY:250,zoom:1};
 for(const q of s.level.woodland){
  const before=riverWoodlandPlacement(s,img,q);
  for(const zoom of [.62,.72,.82,1]){s.camera.zoom=zoom;s.camera.y=650-470/zoom;expect(riverWoodlandPlacement(s,img,q)).toEqual(before);}
  s.camera.x+=80;const moved=riverWoodlandPlacement(s,img,q);expect(before.x-moved.x).toBeCloseTo(80*q.depth);expect(moved.y).toBe(before.y);s.camera.x-=80;
 }
 expect(new Set(s.level.woodland.map(q=>q.depth)).size).toBe(3);
 const arenaTrees=s.level.woodland.map(q=>riverWoodlandPlacement(s,img,q)).filter(p=>p.x+p.w>0&&p.x<960);
 expect(arenaTrees.length).toBeLessThanOrEqual(2);expect(arenaTrees.length).toBeGreaterThan(0);
 for(const p of arenaTrees){expect(p.h).toBeGreaterThanOrEqual(500);expect(p.y+p.h*.72).toBeGreaterThan(480);}
 for(const plane of RIVER_PLANES){const p=riverPlanePlacement(s,img,plane);expect(p.x).toBeLessThan(0);expect(p.x+p.w).toBeGreaterThanOrEqual(960);}
});

test('local render removes rejected foreground and records boss arrival, charge zoom and map boundaries',async({page})=>{
 fs.mkdirSync(dir,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const [{createAdventure,stepAdventure},{loadAdventureArt,renderAdventure},{groundY},{followAdventureCamera}]=await Promise.all([import('/src/components/arcade/adventure/engine/adventureModel.js'),import('/src/components/arcade/adventure/render/adventureCanvas.js'),import('/src/components/arcade/adventure/world/adventureTerrain.js'),import('/src/components/arcade/adventure/render/adventureCamera.js')]);
  const art=await loadAdventureArt(),rejected=Object.keys(art).filter(k=>/foreground|near-tree/.test(k));
  const canvas=document.createElement('canvas');canvas.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(canvas);const captures=[],bounds=[];
  const capture=name=>captures.push({name,data:canvas.toDataURL('image/jpeg',.92)});
  const scene=(index,x)=>{const s=createAdventure(index);for(const key of ['enemies','outposts','supplies','hazards','cages','stars','pickups'])s[key]=[];s.player.x=x;s.player.y=groundY(s.platforms,x);s.player.ground=s.platforms.findIndex(q=>x>=q.x&&x<q.x+q.w);const floor=s.level.cameraFloor||440;s.camera={x:x-300,y:s.player.y-floor,backdropY:s.player.y-floor,zoom:1};return s;};
  for(const [index,x] of [[0,960],[0,5150],[1,820],[1,1350],[1,6900],[1,4700]]){const s=scene(index,x);renderAdventure(canvas,s,art);capture(`level-${index+1}-${x}`);}
  const chunks=[],recorder=new MediaRecorder(canvas.captureStream(12),{mimeType:'video/webm;codecs=vp9'});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.start();
  for(const index of [0,1]){
   const a=createAdventure(index).level.arena,s=scene(index,a.entry+141);renderAdventure(canvas,s,art);capture(`boss-${index+1}-before`);
   for(let frame=0;frame<64;frame++){
    for(let n=0;n<5;n++)stepAdventure(s,{},1/60);renderAdventure(canvas,s,art);
    const right=s.camera.x+960/s.camera.zoom;bounds.push(right-s.level.width);
    if([0,3,8,16,32,48,63].includes(frame))capture(`boss-${index+1}-${frame}`);
    await new Promise(resolve=>setTimeout(resolve,1000/12));
   }
   if(index===1){s.boss.transformed=true;s.boss.phase='warn';s.boss.move='organ-charge';s.player.x=a.left+24;s.boss.x=a.right-230;
    for(let i=0;i<120;i++)followAdventureCamera(s,1/120);renderAdventure(canvas,s,art);capture('organ-charge-wide');bounds.push(s.camera.x+960/s.camera.zoom-s.level.width);
    s.player.x=a.right-24;s.boss.x=a.right-260;for(let i=0;i<120;i++)followAdventureCamera(s,1/120);renderAdventure(canvas,s,art);capture('organ-right-boundary');
   }
  }
  const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.stop();await stopped;const bytes=new Uint8Array(await new Blob(chunks,{type:recorder.mimeType}).arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return{captures,rejected,maxMapOverrun:Math.max(...bounds),video:btoa(binary)};
 });
 for(const shot of result.captures)fs.writeFileSync(dir+shot.name+'.jpg',Buffer.from(shot.data.split(',')[1],'base64'));
 fs.writeFileSync(dir+'boss-camera.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+'render.json',JSON.stringify({errors,rejected:result.rejected,maxMapOverrun:result.maxMapOverrun},null,2));
 expect(errors).toEqual([]);expect(result.rejected).toEqual([]);expect(result.maxMapOverrun).toBeLessThanOrEqual(.00001);
});
