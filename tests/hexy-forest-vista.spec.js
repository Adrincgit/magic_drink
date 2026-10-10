import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {igniteEmberFromAttack} from '../src/components/arcade/adventure/engine/adventureEmberFire';
import {groundAt} from '../src/components/arcade/adventure/world/adventureTerrain';
import {emberBirdSilhouettes} from '../src/components/arcade/adventure/render/emberBackgroundCanvas';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
const folder='tests/artifacts/arcade/forest-vista';

for(const [label,q,friendly]of [
 ['Dragon Grape',{kind:0},true],['Dragon Grape strong',{kind:0,heavy:true},true],
 ['ascending torch',{kind:'ember-torch',vy:-200}],['mortar',{kind:'ember-mortar'}],
 ['balloon cinder',{kind:'ember-cinder'}],['fort window',{kind:'ember-window'}],
 ['right breath',{kind:'ember-breath',dir:1,range:220,x:21800}],
 ['left breath',{kind:'ember-breath',dir:-1,range:220,x:22180}],
 ['fort vent',{kind:'fort-breath',element:'fire',dir:1,range:220,x:21800}],
 ['flaming blast edge',{kind:'ember-blast',size:486,age:.4,x:21870,y:620,grounded:true}],
 ['spreading groundfire',{kind:'harlequin-groundfire',source:'forest',damaging:true,age:.7,floor:620}],
])test(`${label} ignites brush on contact`,()=>{
 const s=createAdventure(5);s.emberEnvironment.bushes=[{x:22000,y:620,state:'green',age:0}];
 igniteEmberFromAttack(s,{x:22000,y:590,r:12,age:1,life:2,...q},friendly);
 expect(s.emberEnvironment.bushes[0].state).toBe('burning');
 expect(s.hostile.some(q=>q.source==='forest')).toBe(true);
});
for(const q of [{kind:-1},{kind:3},{kind:'barge-jet'},
 {kind:'ember-torch',quenched:true},{kind:'ember-blast',size:486,age:.7},
 {kind:'harlequin-groundfire',source:'forest',damaging:true,age:.1,floor:620}])test(`non-fire or inactive flames cannot ignite brush: ${JSON.stringify(q)}`,()=>{
 const s=createAdventure(5);s.emberEnvironment.bushes=[{x:22000,y:620,state:'green',age:0}];
 igniteEmberFromAttack(s,{x:22000,y:590,r:24,life:2,age:1,...q},true);
 expect(s.emberEnvironment.bushes[0].state).toBe('green');
});
test('a real Dragon Grape cast ignites brush through the game update loop',()=>{
 const s=createAdventure(5);for(const k of ['enemies','outposts','cages','supplies','stars'])s[k]=[];
 s.emberEnvironment.trees=[];s.emberEnvironment.bushes=[{x:22000,y:620,state:'green',age:0}];
 Object.assign(s,{weapon:0,ammo:100,ammoWeapon:0,ammoCapacity:100});
 Object.assign(s.player,{x:21800,y:620,dir:1,ground:s.platforms.indexOf(groundAt(s.platforms,21800))});
 for(let i=0;i<120;i++)stepAdventure(s,{attack:true},1/120);
 expect(s.emberEnvironment.bushes[0].state).toBe('burning');
});
test('many fleeing silhouettes remain visible from the ridge throughout a full migration cycle',()=>{
 const s=createAdventure(5);s.player.x=12200;
 for(let time=0;time<84;time+=.5){s.time=time;const birds=emberBirdSilhouettes(s);expect(birds.filter(q=>q.alpha>.4).length).toBeGreaterThan(25);}
 const before=emberBirdSilhouettes(s);s.camera.y-=500;s.camera.zoom=.5;
 expect(emberBirdSilhouettes(s)).toEqual(before);
});
for(const type of [10,11,12,13])test(`actual fire enemy ${type} ignites brush through its complete attack cycle`,()=>{
 const s=createAdventure(5);for(const k of ['enemies','outposts','cages','supplies','stars'])s[k]=[];
 Object.assign(s.player,{x:22000,y:620,ground:s.platforms.indexOf(groundAt(s.platforms,22000)),hurt:999});s.emberEnvironment.trees=[];
 s.emberEnvironment.bushes=[{x:22000,y:620,state:'green',age:0,seed:0},{x:22080,y:620,state:'green',age:0,seed:1}];
 const e=makeEnemy(22180,type===13?390:620,type);e.timer=0;e.dir=-1;s.enemies=[e];
 let lit=false;for(let i=0;i<960;i++){stepAdventure(s,{},1/120);if(s.emberEnvironment.bushes.some(q=>q.state==='burning')){lit=true;break;}}
 expect(lit).toBe(true);
});
test('inspect actual forest composition at the opening, ridge, descent, thicket and fortress',async({page})=>{
 fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.vista=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='vista-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=x=>{const s=w.s=w.createAdventure(5);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.hearts=50;s.noticeTime=0;s.time=12;s.fxTime=12;
   s.enemies=[];s.outposts=[];s.emberEnvironment.trees.forEach(q=>q.phase='spent');
   if(x>30000)s.arenaLocked=true;for(let i=0;i<900;i++)w.followAdventureCamera(s,1/120);w.renderAdventure(w.c,s,w.art);};
 });
 for(const [name,x]of [['01-lush',150],['02-uphill',6000],['03-vista',11200],['04-descent',18500],['05-thicket',22100],['06-blackened',28800],['07-fort',30800]]){
  await page.evaluate(x=>window.vista.scene(x),x);await page.locator('#vista-review').screenshot({path:folder+'/'+name+'.jpg'});
 }
 expect(errors).toEqual([]);
});

test('record continuous movement and reversals through grass, ridge reveal, descent and boss zoom',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.walk=Object.assign({paused:true,keys:{},trace:[]},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='vista-walk';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=x=>{const s=w.s=w.createAdventure(5);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),hurt:999});s.hearts=50;s.noticeTime=0;
   s.enemies=[];s.outposts=[];s.emberEnvironment.trees.forEach(q=>q.phase='spent');for(let i=0;i<900;i++)w.followAdventureCamera(s,1/120);};w.scene(150);
  for(const name of ['keydown','keyup'])window.addEventListener(name,e=>{const key={ArrowRight:'right',ArrowLeft:'left',Space:'jump',KeyZ:'attack'}[e.code];if(key){e.preventDefault();w.keys[key]=name==='keydown';}});
  let last=performance.now(),acc=0;
  const frame=now=>{acc+=Math.min(.06,(now-last)/1000);last=now;if(w.paused)acc=0;
   while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}
   w.renderAdventure(w.c,w.s,w.art);if(!w.paused)w.trace.push({x:w.s.player.x,y:w.s.player.y,camera:{...w.s.camera},time:w.s.time,arena:w.s.arenaLocked});requestAnimationFrame(frame);};requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='forest-vista-motion.webm';a.click();};w.recorder.start();
 });
 const move=async(seconds,keys=[])=>{
  const until=await page.evaluate(seconds=>{const w=window.walk;w.paused=false;return w.s.time+seconds;},seconds);
  for(const key of keys)await page.keyboard.down(key);await page.waitForFunction(t=>window.walk.s.time>=t,until,{timeout:20000});for(const key of keys)await page.keyboard.up(key);
  await page.evaluate(()=>{window.walk.paused=true;});
 };
 await move(6,['ArrowRight']);await move(2,['ArrowLeft']);
 await page.evaluate(()=>window.walk.scene(9500));await move(5.5,['ArrowRight']);await move(3);await move(2,['ArrowLeft']);
 await page.evaluate(()=>window.walk.scene(17900));await move(5,['ArrowRight']);await move(2,['ArrowLeft']);
 await page.evaluate(()=>{const w=window.walk;w.scene(22100);Object.assign(w.s,{weapon:0,ammo:100,ammoWeapon:0,ammoCapacity:100});});await move(4,['ArrowRight','KeyZ']);
 await page.evaluate(()=>window.walk.scene(28600));await move(2,['ArrowRight']);await move(2,['ArrowLeft']);
 await page.evaluate(()=>window.walk.scene(30020));await move(7,['ArrowRight','KeyZ']);await move(3,['ArrowLeft','KeyZ']);
 const trace=await page.evaluate(()=>window.walk.trace);fs.writeFileSync(folder+'/motion-trace.json',JSON.stringify(trace));expect(trace.length).toBeGreaterThan(700);
 const stable=trace.filter(q=>q.arena&&q.camera.zoom<.501);expect(stable.length).toBeGreaterThan(30);
 for(const q of stable)expect(Math.abs((620-q.camera.y)*q.camera.zoom-440)).toBeLessThan(1);
 const download=page.waitForEvent('download');await page.evaluate(()=>window.walk.recorder.stop());await(await download).saveAs(folder+'/forest-vista-motion.webm');expect(errors).toEqual([]);
});
