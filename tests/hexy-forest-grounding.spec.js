import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {openAdventureMenu} from './arcade-input.helpers';
import {createAdventure,stepAdventure,playerBody} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {groundY,groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {forestPlaneRoot,forestWorldX,forestTreeRoot} from '../src/components/arcade/adventure/render/emberForestProjection';
import {followAdventureCamera} from '../src/components/arcade/adventure/render/adventureCamera';
import {emberBlastSize,burstEmberProjectile,emberBlastHitbox} from '../src/components/arcade/adventure/engine/adventureEmberBlast';
import {landEmberFire} from '../src/components/arcade/adventure/engine/adventureEmberFire';
import {fortWindows,fortWindowFrame} from '../src/components/arcade/adventure/actors/bosses/adventureFortWindows';
import {fortTargets} from '../src/components/arcade/adventure/actors/bosses/adventureEmberFort';
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
function fresh(x=10800){const s=createAdventure(5);for(const key of ['enemies','outposts','stars','supplies','cages'])s[key]=[];s.emberEnvironment.trees.forEach(q=>q.phase='spent');Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x)),hurt:0});return s;}
function hit(s,e,damage=999){s.shots.push({x:e.x,y:e.y-40,vx:0,vy:0,r:8,kind:-1,damage,age:0,life:1,hits:[]});tick(s,1);}

for(const [kind,factor]of [['ember-torch',.6],['ember-cinder',.6],['ember-mortar',.75]]){
 test(`${kind}: exact reduction and blast damage beyond the projectile and persistent fire`,()=>{
  expect(emberBlastSize(kind)).toBeCloseTo(648*factor,8);
  for(const [offset,damaged]of [[120,true],[255,false]]){
   const s=fresh(10800+offset),before=s.hearts;
   const q={kind,ember:true,x:10800,y:-520,vx:0,vy:100,r:12,age:.5,life:1};
   expect(landEmberFire(s,q)).toBe(true);expect(s.effects.at(-1).size).toBeCloseTo(648*factor);
   tick(s,63);expect(s.hearts).toBe(before-(damaged?1:0));if(damaged)expect(s.player.hitType).toBe('fire');
  }
 });
}
test('quenched shots make reduced visual bursts but no damaging blast; smoke cannot damage',()=>{
 const s=fresh();burstEmberProjectile(s,{kind:'ember-torch',x:s.player.x,y:s.player.y},{damaging:false});tick(s,90);expect(s.hearts).toBe(s.maxHearts);
 expect(emberBlastHitbox({kind:'ember-blast',age:.65,size:400,x:0,y:0})).toBeNull();
});
test('balloon defeat pops, falls, lands on the local floor, shows all eight poses and then leaves',()=>{
 const s=fresh(),e=makeEnemy(11000,-690,13);e.timer=999;s.enemies=[e];hit(s,e);
 expect(e.hp).toBe(0);const start=e.y,frames=new Set();let landed=false;
 for(let i=0;i<400;i++){if(!s.enemies.includes(e))break;frames.add(enemyDrawing(e).frame);tick(s,1);if(e.landed){landed=true;expect(e.y).toBe(groundY(s.level.route,e.x));}}
 expect(e.y).toBeGreaterThan(start+100);expect(landed).toBe(true);expect([...frames]).toEqual([0,1,2,3,4,5,6,7]);expect(s.enemies).not.toContain(e);
});
test('windows announce fire, can be individually destroyed with normal shots, and stay disabled',()=>{
 const s=fresh(31500);s.arenaLocked=true;s.player.hurt=999;Object.assign(s.boss,{engaged:true,phase:'recover',timer:999,vulnerable:true});
 tick(s,250);const opened=fortWindows(s).find(q=>q.phase!=='closed');expect(opened).toBeTruthy();expect(fortWindowFrame(opened)).toBeGreaterThan(0);expect(s.hostile.some(q=>q.window)).toBe(false);
 tick(s,220);expect(s.hostile.some(q=>q.window===opened.id)).toBe(true);
 const port=fortWindows(s).find(q=>q.id===opened.id),hp=s.boss.hp;
 s.shots.push({x:port.x,y:port.y,vx:0,vy:0,r:6,kind:-1,damage:24,age:0,life:1,hits:[]});tick(s,1);
 expect(fortWindows(s).find(q=>q.id===port.id).hp).toBe(0);expect(s.boss.hp).toBe(hp);expect(fortTargets(s).some(t=>t.part===port.id)).toBe(false);
 s.hostile=[];let otherFired=false;for(let i=0;i<2200;i++){tick(s,1);expect(s.hostile.some(q=>q.window===port.id)).toBe(false);if(s.hostile.some(q=>q.window))otherFired=true;}
 expect(otherFired).toBe(true);expect(fortWindowFrame(fortWindows(s).find(q=>q.id===port.id))).toBe(7);
});
test('fixed fort framing preserves floor contact on arrival and departure',()=>{
 const s=fresh(30250);s.player.hurt=999;for(let i=0;i<600;i++)followAdventureCamera(s,1/120);let maxFloorStep=0;
 s.arenaLocked=true;let last=(620-s.camera.y)*s.camera.zoom;
 for(let i=0;i<1000;i++){
  s.player.x=i<450?30250+i*3:31600-(i-450)*1.8;
  followAdventureCamera(s,1/120);
  const floor=(620-s.camera.y)*s.camera.zoom;maxFloorStep=Math.max(maxFloorStep,Math.abs(floor-last));last=floor;
  for(const depth of [.52,.78,1,1.55]){
   const point=forestPlaneRoot(s,31800,depth);expect(point.zoom).toBe(s.camera.zoom);
   expect(forestWorldX(s.camera,point.x,depth)).toBeCloseTo(31800,6);
   expect(point.y).toBeCloseTo(floor,6);
  }
 }
 expect(maxFloorStep).toBeLessThan(.6);expect(last).toBeCloseTo(440,3);
 s.arenaLocked=false;
 for(let i=0;i<450;i++){followAdventureCamera(s,1/120);const floor=(620-s.camera.y)*s.camera.zoom;expect(Math.abs(floor-last)).toBeLessThan(.6);last=floor;}
 expect(last).toBeCloseTo(s.level.cameraFloor,1);
});
test('wide tree roots reach the downhill side instead of hanging over slopes',()=>{
 const s=fresh(17500);s.camera={x:17000,y:0,zoom:.75};
 for(const depth of [.52,.78,1]){const root=forestTreeRoot(s,17500,depth,400);for(const dx of [-128,0,128])expect(root.y).toBeGreaterThanOrEqual(groundY(s.level.route,root.groundX+dx)*.75);}
});

test('all five hollow floors remain opaque below the playable rim',async({page})=>{
 await page.goto('/');const reports=await page.evaluate(async()=>{
  const {createAdventure}=await import('/src/components/arcade/adventure/engine/adventureModel.js');
  const {loadAdventureArt}=await import('/src/components/arcade/adventure/render/adventureCanvas.js');
  const {drawForestFloor}=await import('/src/components/arcade/adventure/render/emberSurfaceCanvas.js');
  const {forestPlaneRoot,forestWorldX}=await import('/src/components/arcade/adventure/render/emberForestProjection.js');
  const s=createAdventure(5),art=await loadAdventureArt(),canvas=document.createElement('canvas');canvas.width=960;canvas.height=540;const c=canvas.getContext('2d',{willReadFrequently:true});
  return s.level.emberPits.map(pit=>{
   s.camera={x:pit.x-300,y:pit.y-440,zoom:1};c.fillStyle='#ff00ff';c.fillRect(0,0,960,540);drawForestFloor(c,s,art);const pixels=c.getImageData(0,0,960,540).data;let leaks=0;
   for(let x=310;x<290+pit.w;x++){
    const start=forestPlaneRoot(s,forestWorldX(s.camera,x,.6),.6).y;
    for(let y=Math.ceil(start)+2;y<540;y++){const i=(y*960+x)*4;if(pixels[i]>245&&pixels[i+1]<10&&pixels[i+2]>230)leaks++;}
   }return {pit:pit.x,leaks};
  });
 });for(const q of reports)expect(q.leaks,`sky leaks in hollow ${q.pit}`).toBe(0);
});

test('burnt paint remains uniform between subpixel rows on both slopes',async({page})=>{
 await page.goto('/');const ranges=await page.evaluate(async()=>{
  const {createAdventure}=await import('/src/components/arcade/adventure/engine/adventureModel.js');
  const {groundY}=await import('/src/components/arcade/adventure/world/adventureTerrain.js');
  const {drawForestFloor}=await import('/src/components/arcade/adventure/render/emberSurfaceCanvas.js');
  const tile=color=>{const c=document.createElement('canvas');c.width=1800;c.height=400;const g=c.getContext('2d');g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c;};
  const art={'forest-path-0':tile('#dcaf78'),'forest-path-1':tile('#2d201b')},s=createAdventure(5);
  const c=document.createElement('canvas');c.width=1440;c.height=810;const g=c.getContext('2d',{willReadFrequently:true});g.scale(1.5,1.5);
  return [6000,17500,22000].map(x=>{
   s.camera={x:x-480,y:groundY(s.level.route,x)-420,zoom:1};g.fillStyle='#ff00ff';g.fillRect(0,0,960,540);drawForestFloor(g,s,art);
   const data=g.getImageData(720,650,1,150).data;
   return [0,1,2].map(channel=>{const v=Array.from({length:150},(_,y)=>data[y*4+channel]);return Math.max(...v)-Math.min(...v);});
  });
 });for(const channels of ranges)for(const variation of channels)expect(variation).toBeLessThanOrEqual(2);
});

test('real chapter menu, keyboard advance and return show the forest opening',async({page})=>{
 test.setTimeout(60000);const folder='tests/artifacts/arcade/forest-grounding';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/arcade');await openAdventureMenu(page);
 await page.getByRole('button',{name:/Elegir capítulo/}).click();await page.locator('[data-level-choice="5"]').click();await page.locator('[data-practice]').click();
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 const c=page.locator('[data-adventure-canvas]');await expect(c).toHaveAttribute('data-level','5');
 await c.screenshot({path:folder+'/real-start.jpg'});
 await page.keyboard.down('KeyZ');await page.keyboard.down('ArrowRight');await expect.poll(async()=>Number(await c.getAttribute('data-player-x')),{timeout:15000}).toBeGreaterThan(1150);await page.keyboard.up('ArrowRight');await page.keyboard.up('KeyZ');
 await c.screenshot({path:folder+'/real-forward.jpg'});
 await page.keyboard.down('ArrowLeft');await expect.poll(async()=>Number(await c.getAttribute('data-player-x'))).toBeLessThan(750);await page.keyboard.up('ArrowLeft');
 await c.screenshot({path:folder+'/real-return.jpg'});expect(errors).toEqual([]);
});

test('recorded motion review: roots, brush, hills, reversing and the entire fort camera pullback',async({page})=>{
 test.setTimeout(150000);const folder='tests/artifacts/arcade/forest-grounding';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',mods=await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','world/adventureTerrain.js','render/adventureCamera.js','actors/enemies/adventureEnemies.js','actors/bosses/adventureFortWindows.js'].map(p=>import(base+p)));
  const c=document.createElement('canvas');c.id='grounding-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);
  const w=window.grounding=Object.assign({c,keys:{},paused:true,samples:[]},...mods);w.art=await w.loadAdventureArt();
  w.scene=x=>{const s=w.createAdventure(5);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),hurt:999});s.noticeTime=0;for(let i=0;i<800;i++)w.followAdventureCamera(s,1/120);w.s=s;w.paint();};
  w.paint=()=>w.renderAdventure(c,w.s,w.art);w.scene(1200);
  for(const name of ['keydown','keyup'])window.addEventListener(name,e=>{const key={ArrowRight:'right',ArrowLeft:'left',Space:'jump',KeyZ:'attack'}[e.code];if(key){e.preventDefault();w.keys[key]=name==='keydown';}});
  let last=performance.now(),acc=0;const frame=now=>{acc+=Math.min((now-last)/1000,.06);last=now;if(w.paused)acc=0;while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}w.paint();if(!w.paused)w.samples.push({x:w.s.player.x,y:w.s.player.y,camera:{...w.s.camera},arena:w.s.arenaLocked});requestAnimationFrame(frame);};requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(c.captureStream(25),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2400000});w.recorder.ondataavailable=e=>chunks.push(e.data);
  w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='forest-motion.webm';a.click();};w.recorder.start();
 });
 const capture=async name=>page.locator('#grounding-review').screenshot({path:folder+'/'+name+'.jpg'});
 const move=async(seconds,key)=>{const end=await page.evaluate(seconds=>{window.grounding.paused=false;return window.grounding.s.time+seconds;},seconds);await page.keyboard.down(key);await page.waitForFunction(end=>window.grounding.s.time>=end,end,{timeout:15000});await page.keyboard.up(key);await page.evaluate(()=>{window.grounding.paused=true;});};
 for(const [name,x]of [['opening',1200],['uphill',5400],['descent',18000],['brush',23200]]){
  await page.evaluate(x=>window.grounding.scene(x),x);await capture(name+'-before');await move(2.6,'ArrowRight');await capture(name+'-forward');await move(1.2,'ArrowLeft');await capture(name+'-reverse');
 }
 await page.evaluate(()=>window.grounding.scene(30020));await capture('fort-entry');await move(5,'ArrowRight');await capture('fort-wide');await move(2,'ArrowLeft');await capture('fort-retreat');await move(4,'ArrowRight');await capture('fort-near');
 await page.evaluate(()=>{const w=window.grounding,s=w.s;Object.assign(s.boss,{phase:'recover',timer:999});s.hostile=[];s.enemies=[];for(let i=0;i<850&&!w.fortWindows(s).some(q=>q.phase==='aim'&&q.age>.5);i++)w.stepAdventure(s,{},1/120);w.paint();});await capture('window-ready');
 await page.evaluate(()=>{const w=window.grounding,s=w.s,q=w.fortWindows(s).find(q=>q.phase==='aim');s.shots.push({x:q.x,y:q.y,vx:0,vy:0,r:6,kind:-1,damage:25,age:0,life:1,hits:[]});w.stepAdventure(s,{},1/120);for(let i=0;i<40;i++)w.stepAdventure(s,{},1/120);w.paint();});await capture('window-destroyed');
 await page.evaluate(()=>{const w=window.grounding;w.scene(10800);w.s.enemies=[w.makeEnemy(10970,-690,13)];w.s.shots.push({x:10970,y:-730,vx:0,vy:0,r:8,kind:-1,damage:999,age:0,life:1,hits:[]});w.stepAdventure(w.s,{},1/120);});
 for(const [name,n]of [['balloon-pop',16],['balloon-fall',45],['balloon-land',80],['balloon-dazed',40]]){await page.evaluate(n=>{const w=window.grounding;for(let i=0;i<n;i++)w.stepAdventure(w.s,{},1/120);w.paint();},n);await capture(name);}
 const result=await page.evaluate(()=>{const w=window.grounding;return{samples:w.samples,zoom:w.samples.filter(q=>q.arena).map(q=>q.camera.zoom)};});
 expect(Math.min(...result.zoom)).toBeLessThan(.6);expect(Math.max(...result.zoom)).toBeGreaterThan(.9);fs.writeFileSync(folder+'/motion-trace.json',JSON.stringify(result));
 const download=page.waitForEvent('download');await page.evaluate(()=>window.grounding.recorder.stop());await(await download).saveAs(folder+'/forest-motion.webm');expect(errors).toEqual([]);
});
