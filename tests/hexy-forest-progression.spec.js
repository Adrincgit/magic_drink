import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {groundAt,groundY,surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {emberTreeFrame} from '../src/components/arcade/adventure/engine/adventureEmberEnvironment';
const folder='tests/artifacts/arcade/forest-progression';
function scene(x){
 const s=createAdventure(5);for(const key of ['enemies','stars','supplies','outposts','cages'])s[key]=[];
 s.emberEnvironment.trees.forEach(q=>q.phase='spent');
 Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.indexOf(groundAt(s.platforms,x))});return s;
}
test('all hollows have flat approaches, and the thicket follows the descent on continuous ground',()=>{
 const s=createAdventure(5);
 for(const pit of s.level.emberPits)for(let x=pit.x-150;x<pit.x+pit.w+150;x+=25)expect(groundY(s.level.route,x)).toBe(pit.rim);
 expect(s.level.bushes.filter(q=>q.x>=21900&&q.x<=24700).length).toBeGreaterThan(25);
 for(const q of s.level.branchTrees){expect(q.x).toBeGreaterThanOrEqual(21600);expect(groundAt(s.platforms,q.x)).toBeTruthy();}
});
test('the real jump reaches the entry stone and crosses all six trees on their painted branches',()=>{
 const s=scene(21840);s.doubleJump=false;
 const targets=[s.platforms.find(q=>q.x===21880),...s.platforms.filter(q=>q.kind==='branch'&&q.branch<2)];
 for(const q of targets){
  stepAdventure(s,{},1/120);const x=q.x+q.w/2;let landed=false;
  for(let i=0;i<650;i++){
   const dx=x-s.player.x;stepAdventure(s,{right:dx>5,left:dx< -5,jump:true},1/120);
   if(i>8&&s.player.ground===s.platforms.indexOf(q)){landed=true;break;}
  }
  expect(landed,`branch ${q.tree}:${q.branch}; player ${s.player.x},${s.player.y}; target ${x},${q.y}`).toBe(true);
  expect(s.player.y).toBeCloseTo(surfaceY(q,s.player.x),3);
 }
 expect(s.player.x).toBeGreaterThan(24400);expect(s.hearts).toBe(s.maxHearts);
});
test('tree animation visits split, fall, impact and settling paintings and ends on its fallen pose',()=>{
 const s=scene(10780),q=s.emberEnvironment.trees[0];q.phase='standing';const frames=new Set();
 for(let i=0;i<500;i++){stepAdventure(s,{},1/120);frames.add(emberTreeFrame(q));}
 expect([...frames].sort((a,b)=>a-b)).toEqual(Array.from({length:16},(_,i)=>i));
 expect(q.phase).toBe('fallen');expect(emberTreeFrame(q)).toBe(15);
});

test('the authored thicket enemies ignite several bushes and their ground fire hurts the player',async({page})=>{
 await page.goto('/');fs.mkdirSync(folder,{recursive:true});
 const result=await page.evaluate(async()=>{
  const {createAdventure,stepAdventure}=await import('/src/components/arcade/adventure/engine/adventureModel.js');
  const {loadAdventureArt,renderAdventure}=await import('/src/components/arcade/adventure/render/adventureCanvas.js');
  const {groundAt}=await import('/src/components/arcade/adventure/world/adventureTerrain.js');
  const {followAdventureCamera}=await import('/src/components/arcade/adventure/render/adventureCamera.js');
  const s=createAdventure(5),art=await loadAdventureArt();s.hearts=20;s.noticeTime=0;
  Object.assign(s.player,{x:22300,y:620,ground:s.platforms.indexOf(groundAt(s.platforms,22300))});
  let burning=0;for(let i=0;i<1600;i++){stepAdventure(s,{},1/120);burning=s.emberEnvironment.bushes.filter(q=>q.state==='burning').length;if(burning>=3&&s.hearts<20)break;}
  for(let i=0;i<900;i++)followAdventureCamera(s,1/120);
  const c=document.createElement('canvas');c.id='ambush-review';c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(c);renderAdventure(c,s,art);
  return{burning,hearts:s.hearts,groundFire:s.hostile.filter(q=>q.source==='forest').length};
 });
 await page.locator('#ambush-review').screenshot({path:folder+'/08-burning-thicket.jpg'});
 expect(result.burning).toBeGreaterThanOrEqual(3);expect(result.groundFire).toBeGreaterThan(0);expect(result.hearts).toBeLessThan(20);
});

test('review dense forest, dry slopes, branch ambush and blackened smoke in the actual renderer',async({page})=>{
 test.setTimeout(180000);fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.grove=Object.assign({keys:{},paused:true,trace:[]},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','render/adventureCamera.js','world/adventureTerrain.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='grove-review';w.c.style='position:fixed;inset:0;z-index:99999;width:1440px;height:810px';document.body.append(w.c);
  w.scene=(x,quiet=false)=>{const s=w.s=w.createAdventure(5);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.hearts=50;s.noticeTime=0;
   if(quiet){s.enemies=[];s.outposts=[];s.emberEnvironment.trees.forEach(q=>q.phase='spent');}
   for(let i=0;i<900;i++)w.followAdventureCamera(s,1/120);w.renderAdventure(w.c,s,w.art);};w.scene(150,true);
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
 });
 const shot=async name=>page.locator('#grove-review').screenshot({path:folder+'/'+name+'.jpg'});
 for(const [name,x]of [['01-lush',150],['02-uphill',6000],['03-dry-ridge',12200],['04-descent',18500],['05-thicket',22100],['06-blackened',28800],['07-fort',30800]]){
  await page.evaluate(([x,name])=>{const w=window.grove;w.scene(x,true);if(name==='07-fort'){w.s.arenaLocked=true;for(let i=0;i<900;i++)w.followAdventureCamera(w.s,1/120);}w.paint();},[x,name]);await shot(name);
 }
 await page.evaluate(()=>{const w=window.grove;w.scene(22300);for(let i=0;i<430;i++)w.stepAdventure(w.s,{},1/120);w.paint();});await shot('thicket-before-ignition');
 for(const age of [0,.4,.65,.9,1.2,1.6]){
  await page.evaluate(age=>{const w=window.grove;w.scene(10780,true);const q=w.s.emberEnvironment.trees[0];q.phase='falling';q.age=age;if(age>=1.05){q.phase='fallen';q.age=age-1.05;}w.paint();},age);await shot('fall-'+age);
 }
 await page.evaluate(()=>{
  const w=window.grove;w.scene(150,true);
  for(const name of ['keydown','keyup'])window.addEventListener(name,e=>{const key={ArrowRight:'right',ArrowLeft:'left',Space:'jump',KeyZ:'attack'}[e.code];if(key){e.preventDefault();w.keys[key]=name==='keydown';}});
  let last=performance.now(),acc=0;
  const frame=now=>{acc+=Math.min(.06,(now-last)/1000);last=now;if(w.paused)acc=0;
   while(acc>=1/120){w.stepAdventure(w.s,w.keys,1/120);acc-=1/120;}
   w.paint();if(!w.paused)w.trace.push({x:w.s.player.x,y:w.s.player.y,camera:{...w.s.camera},arena:w.s.arenaLocked});requestAnimationFrame(frame);};requestAnimationFrame(frame);
  const chunks=[];w.recorder=new MediaRecorder(w.c.captureStream(30),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3600000});w.recorder.ondataavailable=e=>chunks.push(e.data);w.recorder.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='forest-progression-motion.webm';a.click();};w.recorder.start();
 });
 const move=async(seconds,keys=[])=>{
  const until=await page.evaluate(seconds=>{const w=window.grove;w.paused=false;return w.s.time+seconds;},seconds);
  for(const key of keys)await page.keyboard.down(key);await page.waitForFunction(t=>window.grove.s.time>=t,until,{timeout:20000});for(const key of keys)await page.keyboard.up(key);
  await page.evaluate(()=>{window.grove.paused=true;});
 };
 await move(5,['ArrowRight']);await move(2,['ArrowLeft']);
 for(const x of [5800,18500]){await page.evaluate(x=>window.grove.scene(x,true),x);await move(4,['ArrowRight']);await move(2,['ArrowLeft']);}
 await page.evaluate(()=>{const w=window.grove;w.scene(10780,true);w.s.emberEnvironment.trees[0].phase='standing';});await move(4);
 await page.evaluate(()=>window.grove.scene(21840,true));
 for(const index of [0,1,2]){
  const q=await page.evaluate(index=>{const w=window.grove;const targets=[w.s.platforms.find(q=>q.x===21880),...w.s.platforms.filter(q=>q.kind==='branch'&&q.branch<2)];const p=targets[index];w.paused=false;return{x:p.x+p.w/2,index:w.s.platforms.indexOf(p)};},index);
  await page.keyboard.down('Space');await page.keyboard.down('ArrowRight');await page.waitForFunction(x=>window.grove.s.player.x>x-10,q.x,{timeout:6000});await page.keyboard.up('ArrowRight');
  await page.waitForFunction(i=>window.grove.s.player.ground===i,q.index,{timeout:6000});await page.keyboard.up('Space');await page.waitForFunction(()=>window.grove.s.lastInput.jump===false);
  await page.evaluate(()=>{window.grove.paused=true;});await shot('branch-landing-'+index);
 }
 await page.evaluate(()=>window.grove.scene(23000));await move(4,['ArrowRight','KeyZ']);await shot('thicket-combat');
 await page.evaluate(()=>window.grove.scene(28800,true));await move(2,['ArrowRight']);await move(2,['ArrowLeft']);
 await page.evaluate(()=>window.grove.scene(30020,true));await move(4.5,['ArrowRight','KeyZ']);await shot('fort-arrival');await move(4,['ArrowRight','KeyZ']);await move(4,['ArrowLeft','KeyZ']);await shot('fort-retreat');
 const download=page.waitForEvent('download');await page.evaluate(()=>window.grove.recorder.stop());await(await download).saveAs(folder+'/forest-progression-motion.webm');
 const trace=await page.evaluate(()=>window.grove.trace);fs.writeFileSync(folder+'/motion-trace.json',JSON.stringify(trace));expect(trace.length).toBeGreaterThan(700);
 expect(errors).toEqual([]);
});
