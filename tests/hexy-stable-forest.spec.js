import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {forestPlaneRoot,forestTreeRoot} from '../src/components/arcade/adventure/render/emberForestProjection';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {emberBackdropPlacement} from '../src/components/arcade/adventure/render/emberTrailCanvas';
import {emberSceneryTrees} from '../src/components/arcade/adventure/render/emberComposition';

test('every planted root keeps its world height while the camera crosses hills and pits',()=>{
 const s=createAdventure(5);
 for(const x of [6100,6400,6590,11800,17200,18900,24700,31000]){
  s.camera={x:x-300,y:100,zoom:1};
  const baseline=forestTreeRoot(s,x,1,360),worldY=baseline.y+s.camera.y;
  for(const cameraX of [x-600,x-100,x+300,x-300])for(const zoom of [.5,.72,1]){
   s.camera={x:cameraX,y:-260,zoom};const root=forestTreeRoot(s,x,1,360);
   expect(root.y/zoom+s.camera.y).toBeCloseTo(worldY,7);
   expect(root.x/zoom+s.camera.x).toBeCloseTo(x,7);
   expect(forestPlaneRoot(s,x).y/zoom+s.camera.y).toBeCloseTo(groundY(s.level.route,x),7);
  }
 }
});

test('fort zoom stops after arrival and stays fixed while running toward and away from its core',()=>{
 const s=createAdventure(5);s.arenaLocked=true;s.player.x=30300;s.player.y=620;
 for(let i=0;i<900;i++)followAdventureCamera(s,1/120);
 const start=s.camera.zoom;
 for(let i=0;i<1800;i++){
  s.player.x=31300+850*Math.sin(i/150);followAdventureCamera(s,1/120);
  expect(Math.abs(s.camera.zoom-start)).toBeLessThan(1e-9);
  expect((620-s.camera.y)*s.camera.zoom).toBeCloseTo(440,5);
 }
});

test('the canopy framing and planted trees stay fixed through altitude and boss lens changes',()=>{
 const s=createAdventure(5);s.camera.x=22000;const img={width:2172,height:362};
 const first=emberBackdropPlacement(s,img),trees=emberSceneryTrees(s.level);
 for(const y of [-900,0,650])for(const zoom of [.5,.8,1]){
  Object.assign(s.camera,{y,backdropY:y,zoom});s.player.y=y+400;
  expect(emberBackdropPlacement(s,img)).toEqual(first);expect(emberSceneryTrees(s.level)).toEqual(trees);
 }
 s.camera.x+=120;expect(emberBackdropPlacement(s,img).x).toBeLessThan(first.x);
});

test('ground texture at the rear and front follows exactly the same camera translation',async({page})=>{
 await page.goto('/');const result=await page.evaluate(async()=>{
  const {createAdventure}=await import('/src/components/arcade/adventure/engine/adventureModel.js');
  const {loadAdventureArt}=await import('/src/components/arcade/adventure/render/adventureCanvas.js');
  const {drawForestFloor}=await import('/src/components/arcade/adventure/render/emberSurfaceCanvas.js');
  const s=createAdventure(5),art=await loadAdventureArt(),c=document.createElement('canvas');c.width=960;c.height=540;const g=c.getContext('2d',{willReadFrequently:true});
  s.camera={x:1100,y:90,zoom:1};drawForestFloor(g,s,art);const a=g.getImageData(0,0,960,540).data;
  s.camera.x+=24;g.clearRect(0,0,960,540);drawForestFloor(g,s,art);const b=g.getImageData(0,0,960,540).data;
  return [380,440,510].map(y=>{let error=0,n=0;for(let x=80;x<800;x++)for(let channel=0;channel<3;channel++){error+=Math.abs(a[(y*960+x+24)*4+channel]-b[(y*960+x)*4+channel]);n++;}return error/n;});
 });for(const error of result)expect(error).toBeLessThan(.1);
});

test('sustained keyboard traversal, reversals, jumps and boss approach are recorded at normal speed',async({page})=>{
 test.setTimeout(180000);const folder='tests/artifacts/arcade/stable-forest';fs.mkdirSync(folder,{recursive:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.stableForest=Object.assign({keys:{},paused:true,trace:[]},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='stable-forest';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=(x,quiet)=>{const s=w.s=w.createAdventure(5);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.hearts=50;s.noticeTime=0;
   if(quiet){s.enemies=[];s.outposts=[];s.emberEnvironment.trees.forEach(q=>q.phase='spent');}
   for(let i=0;i<900;i++)w.followAdventureCamera(s,1/120);w.renderAdventure(w.c,s,w.art);};w.scene(150,true);
  for(const name of ['keydown','keyup'])window.addEventListener(name,e=>{const key={ArrowRight:'right',ArrowLeft:'left',Space:'jump',KeyZ:'attack'}[e.code];if(key){e.preventDefault();w.keys[key]=name==='keydown';}});
  let last=performance.now(),acc=0;
  const frame=now=>{acc+=Math.min(.06,(now-last)/1000);last=now;if(w.paused)acc=0;
   while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}
   w.renderAdventure(w.c,w.s,w.art);if(!w.paused)w.trace.push({x:w.s.player.x,y:w.s.player.y,camera:{...w.s.camera},arena:w.s.arenaLocked});requestAnimationFrame(frame);};requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3600000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='stable-forest-motion.webm';a.click();};w.recorder.start();
 });
 const shot=async name=>page.locator('#stable-forest').screenshot({path:folder+'/'+name+'.jpg'});
 const move=async(seconds,keys)=>{
  const until=await page.evaluate(seconds=>{const w=window.stableForest;w.paused=false;return w.s.time+seconds;},seconds);
  for(const key of keys)await page.keyboard.down(key);await page.waitForFunction(t=>window.stableForest.s.time>=t,until,{timeout:20000});for(const key of keys)await page.keyboard.up(key);
  await page.evaluate(()=>{window.stableForest.paused=true;});
 };
 await shot('opening');await move(7,['ArrowRight']);await shot('opening-forward');await move(3,['ArrowLeft']);await shot('opening-reverse');
 for(const [name,x]of [['hill',5200],['descent',17100]]){
  await page.evaluate(x=>window.stableForest.scene(x,true),x);await shot(name+'-start');await move(5,['ArrowRight']);await move(.9,['ArrowRight','Space']);await move(2,['ArrowRight']);await shot(name+'-forward');await move(3,['ArrowLeft']);await shot(name+'-reverse');
 }
 await page.evaluate(()=>window.stableForest.scene(22800,false));await move(5,['ArrowRight','KeyZ']);await shot('inferno');await move(2,['ArrowLeft','KeyZ']);
 await page.evaluate(()=>window.stableForest.scene(30020,true));await move(5,['ArrowRight','KeyZ']);await shot('fort-wide');await move(4,['ArrowRight','KeyZ']);await shot('fort-near');await move(4,['ArrowLeft','KeyZ']);await shot('fort-retreat');
 const trace=await page.evaluate(()=>window.stableForest.trace);fs.writeFileSync(folder+'/motion-trace.json',JSON.stringify(trace));expect(trace.length).toBeGreaterThan(800);
 const download=page.waitForEvent('download');await page.evaluate(()=>window.stableForest.recorder.stop());await(await download).saveAs(folder+'/stable-forest-motion.webm');expect(errors).toEqual([]);
});
