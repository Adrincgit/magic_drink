import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {stepEmberWildlife,resetEmberWildlife} from '../src/components/arcade/adventure/engine/adventureEmberWildlife';
import {woodlandRoot} from '../src/components/arcade/adventure/render/emberWoodlandLayers';
import {woodlandCoverage} from '../src/components/arcade/adventure/render/emberComposition';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {adventureMusic} from '../src/components/arcade/adventure/world/adventureWorlds';
const folder='tests/artifacts/arcade/woodland-depth';
test('each woodland plane has a fixed root and returns to the same place after camera reversals',()=>{
 const s=createAdventure(5);
 for(const depth of [.48,.72,.85])for(const x of [600,6600,9800,17100,29000]){
  s.camera={x:x-300,y:groundY(s.level.route,x)-420,zoom:1};const a=woodlandRoot(s,x,depth);
  s.camera.x+=100;const b=woodlandRoot(s,x,depth);expect(b.x-a.x).toBeCloseTo(-100*depth,7);expect(b.y).toBe(a.y);
  s.camera.y+=80;expect(woodlandRoot(s,x,depth).y-b.y).toBeCloseTo(-80*depth,7);
  s.camera.x-=100;s.camera.y-=80;expect(woodlandRoot(s,x,depth)).toEqual(a);
 }
});
test('the overlook is revealed at a spatial edge, rather than by fading the whole forest',()=>{
 const s=createAdventure(5);s.camera={x:10000,y:-500,zoom:1};
 expect(woodlandCoverage(s,100)).toBe(1);expect(woodlandCoverage(s,800)).toBe(0);
 s.player.x+=500;expect(woodlandCoverage(s,100)).toBe(1);expect(woodlandCoverage(s,800)).toBe(0);
 s.camera.x=11000;for(const x of [0,240,480,960])expect(woodlandCoverage(s,x)).toBe(0);
 s.camera.x=17000;for(const x of [0,240,480,960])expect(woodlandCoverage(s,x)).toBe(1);
});
test('wildlife runs left along the hill, clears the route and never retriggers when walking back',()=>{
 const s=createAdventure(5);s.player.x=6100;s.camera.x=5800;s.emberEnvironment.wildlife=resetEmberWildlife(6000);
 stepEmberWildlife(s,1/120);const herd=s.emberEnvironment.wildlife.animals,initial=herd.map(q=>q.x);expect(herd).toHaveLength(3);
 for(let i=0;i<240;i++)stepEmberWildlife(s,1/120);
 for(const [i,q]of herd.entries()){expect(q.x).toBeLessThan(initial[i]-300);expect(q.y).toBe(groundY(s.level.route,q.x));expect(q.stride).toBeGreaterThan(300);}
 for(let i=0;i<1300;i++)stepEmberWildlife(s,1/120);expect(s.emberEnvironment.wildlife.animals).toHaveLength(0);
 s.player.x=5700;stepEmberWildlife(s,.1);s.player.x=6100;stepEmberWildlife(s,.1);expect(s.emberEnvironment.wildlife.animals).toHaveLength(0);
});
test('the selected level music is an exact copy of the supplied MP3',()=>{
 const hash=path=>crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
 expect(hash('public/arcade/music/exploration/ember-trail.mp3')).toBe('0326dbdbadabb0f45f0ca3a6e9a738ff9bc4afd3f3c6be723fb7e56d4e74f419');
 const q=adventureMusic(5,'playing');expect(q.src).toBe('/arcade/music/exploration/ember-trail.mp3');expect(q.loop).toBe(true);
});
test('render the woodland groups, concealed edge, wildlife and arena at their real scales',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.woodland=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureEmberWildlife.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='woodland-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=x=>{const s=w.s=w.createAdventure(5);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.hearts=50;s.noticeTime=0;s.time=12;s.fxTime=12;
   s.enemies=[];s.outposts=[];s.emberEnvironment.trees.forEach(q=>q.phase='spent');
   if(x>30000)s.arenaLocked=true;for(let i=0;i<900;i++)w.followAdventureCamera(s,1/120);w.renderAdventure(w.c,s,w.art);};
 });
 for(const [name,x]of [['01-start',150],['02-uphill',6100],['03-edge-approach',9600],['04-last-trees',10200],['05-vista',11200],['06-return',15400],['07-descent',18300],['08-thicket',22500],['09-fort',30800]]){
  await page.evaluate(x=>window.woodland.scene(x),x);
  if(x===6100)await page.evaluate(()=>{const w=window.woodland;for(let i=0;i<300;i++)w.stepEmberWildlife(w.s,1/120);w.renderAdventure(w.c,w.s,w.art);});
  await page.locator('#woodland-review').screenshot({path:folder+'/'+name+'.jpg'});
 }
 const sound=await page.evaluate(async()=>{
  const {adventureMusic}=await import('/src/components/arcade/adventure/world/adventureWorlds.js');
  const a=new Audio(adventureMusic(5,'playing').src);a.muted=true;a.loop=true;await a.play();const duration=a.duration;
  const seeked=new Promise(resolve=>a.addEventListener('seeked',resolve,{once:true}));a.currentTime=duration-.15;await seeked;
  const deadline=performance.now()+6000;while(a.currentTime>2&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,100));
  const time=a.currentTime;a.pause();return{duration,time,error:a.error?.message};
 });expect(sound.duration).toBeGreaterThan(30);expect(sound.time).toBeLessThan(2);expect(sound.error).toBeUndefined();expect(errors).toEqual([]);
});

test('record continuous movement and reversals through wildlife, spatial reveal, return and boss zoom',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.walk=Object.assign({paused:true,keys:{},trace:[]},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='vista-walk';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=x=>{const s=w.s=w.createAdventure(5);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),hurt:0});s.hearts=50;s.noticeTime=0;
   s.enemies=[];s.outposts=[];s.emberEnvironment.trees.forEach(q=>q.phase='spent');for(let i=0;i<900;i++)w.followAdventureCamera(s,1/120);};w.scene(150);
  for(const name of ['keydown','keyup'])window.addEventListener(name,e=>{const key={ArrowRight:'right',ArrowLeft:'left',Space:'jump',KeyZ:'attack'}[e.code];if(key){e.preventDefault();w.keys[key]=name==='keydown';}});
  let last=performance.now(),acc=0;
  const frame=now=>{acc+=Math.min(.06,(now-last)/1000);last=now;if(w.paused)acc=0;
   while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}
   w.renderAdventure(w.c,w.s,w.art);if(!w.paused)w.trace.push({x:w.s.player.x,y:w.s.player.y,camera:{...w.s.camera},time:w.s.time,arena:w.s.arenaLocked});requestAnimationFrame(frame);};requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='woodland-depth-motion.webm';a.click();};w.recorder.start();
 });
 const move=async(seconds,keys=[])=>{
  const until=await page.evaluate(seconds=>{const w=window.walk;w.paused=false;return w.s.time+seconds;},seconds);
  for(const key of keys)await page.keyboard.down(key);await page.waitForFunction(t=>window.walk.s.time>=t,until,{timeout:20000});for(const key of keys)await page.keyboard.up(key);
  await page.evaluate(()=>{window.walk.paused=true;});
 };
 await move(4,['ArrowRight']);await move(2,['ArrowLeft']);
 await page.evaluate(()=>window.walk.scene(6000));await move(5,['ArrowRight']);
 await page.evaluate(()=>window.walk.scene(9200));await move(8.5,['ArrowRight']);await move(2);await move(5,['ArrowLeft']);
 await page.evaluate(()=>window.walk.scene(15000));await move(5,['ArrowRight']);
 await page.evaluate(()=>window.walk.scene(17900));await move(4,['ArrowRight']);await move(2,['ArrowLeft']);
 await page.evaluate(()=>{const w=window.walk;w.scene(22100);Object.assign(w.s,{weapon:0,ammo:100,ammoWeapon:0,ammoCapacity:100});});await move(4,['ArrowRight','KeyZ']);
 await page.evaluate(()=>window.walk.scene(28600));await move(2,['ArrowRight']);await move(2,['ArrowLeft']);
 await page.evaluate(()=>window.walk.scene(30020));await move(7,['ArrowRight','KeyZ']);await move(3,['ArrowLeft','KeyZ']);
 const trace=await page.evaluate(()=>window.walk.trace);fs.writeFileSync(folder+'/motion-trace.json',JSON.stringify(trace));expect(trace.length).toBeGreaterThan(700);
 const stable=trace.filter(q=>q.arena&&q.camera.zoom<.501);expect(stable.length).toBeGreaterThan(30);
 for(const q of stable)expect(Math.abs((620-q.camera.y)*q.camera.zoom-440)).toBeLessThan(1);
 const download=page.waitForEvent('download');await page.evaluate(()=>window.walk.recorder.stop());await(await download).saveAs(folder+'/woodland-depth-motion.webm');expect(errors).toEqual([]);
});
