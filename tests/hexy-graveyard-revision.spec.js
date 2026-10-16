import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies,updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {damageGrave,stepGraveyard,stepSpookyIdle} from '../src/components/arcade/adventure/engine/adventureGraveyard';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
import {followAdventureCamera,cameraView} from '../src/components/arcade/adventure/render/adventureCamera';
const quiet=()=>{const s=createAdventure(6);s.damage=()=>{};return s;};
const tick=(s,n)=>{for(let i=0;i<n;i++){s.time+=1/120;s.fxTime+=1/120;updateEnemies(s,1/120,playerBody,()=>{});}};
const place=(s,x)=>{s.player.x=x;s.player.y=groundY(s.platforms,x);s.player.ground=s.platforms.findIndex(q=>x>=q.x&&x<q.x+q.w);s.player.hurt=999;};
test('long forest-to-cemetery route has fleeing groups and a separate final miniboss',()=>{
 const s=quiet();expect(s.level.width).toBe(21440);expect(s.level.cemeteryStart).toBeGreaterThan(4000);expect(s.graves.every(q=>q.x>s.level.cemeteryStart)).toBe(true);
 for(let x=0;x<s.level.width;x+=30)expect(s.platforms.some(q=>q.kind==='earth'&&x>=q.x&&x<=q.x+q.w)).toBe(true);
 expect(s.platforms.some(q=>q.kind==='nightmare-branch')).toBe(true);expect(s.enemies.filter(e=>e.fleeGroup===0)).toHaveLength(4);expect(s.enemies.some(e=>e.type===20)).toBe(false);expect(s.boss.type).toBe(23);expect(s.stars.filter(q=>q.value===10)).toHaveLength(5);
});
test('zombies have 3x normal health, reserved giant has 30x',()=>{
 const base=makeEnemy(0,480,0).hp;for(const type of [18,21])expect(makeEnemy(0,480,type).hp/base).toBeCloseTo(3);expect(makeEnemy(0,480,20).hp/base).toBeCloseTo(30);
});
test('panicked groups run without attacking, look behind and vary their pace',()=>{
 const s=quiet();place(s,920);s.enemies=s.enemies.filter(e=>e.fleeGroup===0);const starts=s.enemies.map(e=>e.x),poses=new Set();let contacts=0;s.damage=()=>contacts++;
 for(let i=0;i<300;i++){tick(s,1);s.enemies.forEach(e=>poses.add(enemyDrawing(e).frame));}
 expect(s.enemies).toHaveLength(4);expect(s.enemies.every((e,i)=>e.x<starts[i]-750)).toBe(true);expect(new Set(s.enemies.map(e=>e.fleeSpeed)).size).toBeGreaterThan(1);expect([...poses].some(n=>n>=8)).toBe(true);expect(s.enemies.every(e=>enemyDrawing(e).key==='red-clown-flee')).toBe(true);expect(s.hostile).toHaveLength(0);expect(contacts).toBe(0);
});
test('destroying a warning headstone requires several hits and cancels its spawn',()=>{
 const s=quiet(),q=s.graves[0];s.graves=[q];s.enemies=[];place(s,q.x-250);tick(s,1);expect(q.phase).toBe('warning');damageGrave(s,q,2);expect(q.hp).toBe(16);expect(q.phase).toBe('warning');for(let i=0;i<8;i++)damageGrave(s,q,2);tick(s,1200);expect(q.phase).toBe('broken');expect(q.spawned).toBe(0);expect(s.enemies).toHaveLength(0);
});
test('one headstone makes one actor; crypts replenish a bounded group until broken',()=>{
 const s=quiet(),q=s.graves.find(q=>q.kind==='crypt');s.graves=[q];s.enemies=[];place(s,q.x-300);tick(s,5400);expect(q.spawned).toBe(8);expect(s.enemies.filter(e=>e.graveId===q.index&&e.hp>0)).toHaveLength(8);
 s.enemies[0].hp=0;tick(s,1500);expect(q.spawned).toBe(9);damageGrave(s,q,q.hp);s.enemies=[];tick(s,3000);expect(q.spawned).toBe(9);expect(s.enemies).toHaveLength(0);
 const t=quiet(),head=t.graves[0];t.graves=[head];t.enemies=[];place(t,head.x-200);tick(t,3000);expect(head.spawned).toBe(1);
});
test('actual basic shots can destroy a headstone before its warning expires',()=>{
 const s=quiet(),q=s.graves[0];s.graves=[q];s.enemies=[];s.cages=[];s.supplies=[];place(s,q.x-220);
 for(let i=0;i<480;i++)stepAdventure(s,{attack:true},1/120);expect(q.hp).toBe(0);expect(q.spawned).toBe(0);
});
test('walking and crawling zombies pursue beyond the old home boundary and keep animating',()=>{
 for(const type of [18,21]){const s=quiet(),e=makeEnemy(7400,485,type);s.enemies=[e];s.graves=[];const frames=new Set();
  for(let i=0;i<1800;i++){s.player.x=e.x-440;tick(s,1);if(i>1200)frames.add(enemyDrawing(e).frame);}
  expect(e.x).toBeLessThan(e.home-400);expect(frames.size).toBe(8);expect(e.y).toBeCloseTo(groundY(s.platforms,e.x));e.phase='jump';tick(s,1);expect(e.phase).toBe('patrol');
 }
});
test('ghost recovery never teleports to its grave and resumes forward pursuit',()=>{
 const s=quiet(),e=makeEnemy(7400,410,19);e.baseY=485;s.enemies=[e];s.graves=[];const states=new Set();let largest=0;
 for(let i=0;i<2000;i++){s.player.x=e.x-220;s.player.y=485;const x=e.x,y=e.y;tick(s,1);const moved=Math.hypot(e.x-x,e.y-y);if(moved>4)expect(e.nightmareHidden&&e.phase==='hidden').toBe(true);else largest=Math.max(largest,moved);states.add(e.phase);}
 expect([...states]).toEqual(expect.arrayContaining(['windup','rush','recover','patrol']));expect(largest).toBeLessThan(4);expect(e.x).not.toBe(e.home);
});
test('a caught fleeing clown transforms in place with the full zombie health',()=>{
 const s=quiet(),e=s.enemies.find(e=>e.fleeing),z=makeEnemy(e.x+12,e.y,18);s.enemies=[e,z];s.graves=[];const count=s.enemies.length;stepGraveyard(s,.01,makeEnemy);expect(e.infection).toBeGreaterThan(0);const x=e.x;for(let i=0;i<450;i++)stepGraveyard(s,1/120,makeEnemy);expect(s.enemies).toHaveLength(count);expect(e.x).toBe(x);expect(e.type).toBe(18);expect(e.hp).toBe(13.8);expect(e.fleeing).toBe(false);
});
test('skeleton stays whole after damage and throws a mimed rib without loose parts',()=>{
 const s=quiet(),e=makeEnemy(7400,485,22);s.enemies=[e];s.graves=[];place(s,7700);e.hp=e.maxHp*.7;tick(s,90);expect(e.lostParts).toBeUndefined();expect(s.looseBones).toHaveLength(0);
 let thrown=false;for(let i=0;i<1200;i++){tick(s,1);if(s.hostile.some(q=>q.kind==='bone'&&q.boneFrame===9)){thrown=true;break;}}expect(thrown).toBe(true);expect(s.looseBones.every(b=>b.frame!==9)).toBe(true);
 e.hp=e.maxHp*.2;tick(s,1);expect(e.lostParts).toBeUndefined();expect(s.looseBones).toHaveLength(0);
});
test('Hexy fear idle alternates shiver and forehead gesture and cancels immediately on input',()=>{
 const s=quiet();s.player.fearAge=-1;for(let i=0;i<600;i++)stepSpookyIdle(s,{},1/120);expect(hexyPose(s).sheet).toBe('fear');expect(s.player.fearVariant).toBe(0);
 for(let i=0;i<960;i++)stepSpookyIdle(s,{},1/120);expect(s.player.fearVariant).toBe(1);expect(hexyPose(s).frame).toBeGreaterThanOrEqual(4);stepSpookyIdle(s,{right:true},1/120);expect(s.player.fearAge).toBe(-1);expect(hexyPose(s).sheet).not.toBe('fear');
});
test('bellkeeper telegraphs its attacks, and its complete collapse opens the exit',()=>{
 const s=quiet();s.enemies=[];s.graves=[];place(s,s.level.arena.entry);const states=new Set();for(let i=0;i<1700;i++){updateBoss(s,1/120,{body:playerBody,say:()=>{}});states.add(s.boss.phase);}expect([...states]).toEqual(expect.arrayContaining(['intro','ringWindup','ring','charge','rush','recover']));expect(s.hostile.some(q=>q.kind==='bell-wisp')).toBe(true);
 s.boss.hp=0;for(let i=0;i<300;i++)updateBoss(s,1/120,{body:playerBody});expect(s.boss.defeat.ready).toBe(true);expect(s.arenaLocked).toBe(false);expect(s.events.filter(e=>e==='bossDown')).toHaveLength(1);
});
test('checkpoint retry clears earlier graves and resets remaining encounters',()=>{
 const s=quiet();s.checkpointAt=[11200,groundY(s.platforms,11200)];retryAdventure(s);expect(s.graves.filter(q=>q.x<11200).every(q=>q.phase==='broken')).toBe(true);expect(s.graves.filter(q=>q.x>11200).every(q=>q.phase==='sealed')).toBe(true);expect(s.boss.type).toBe(23);expect(s.boss.phase).toBe('sleep');
});
test('idle expressions work through the real game step and the full boss victory completes',()=>{
 const s=quiet();s.enemies=[];s.graves=[];place(s,3400);for(let i=0;i<625;i++)stepAdventure(s,{},1/120);expect(s.player.fearAge).toBeGreaterThanOrEqual(0);expect(hexyPose(s).sheet).toBe('fear');
 const t=quiet();t.enemies=[];t.graves=[];place(t,t.level.arena.entry);t.boss.hp=2;let wins=0;for(let i=0;i<8000&&!t.done;i++){stepAdventure(t,{attack:true,left:t.boss.x<t.player.x,right:t.boss.x>t.player.x+260},1/120);wins+=t.events.filter(e=>e==='win').length;}expect(t.boss.hp).toBe(0);expect(t.won).toBe(true);expect(wins).toBe(1);
});
test('miniboss camera contains Hexy and the bell from either end of the arena',()=>{
 for(const side of [-1,1]){const s=quiet(),a=s.level.arena;s.arenaLocked=true;s.boss.phase='patrol';place(s,side<0?a.left+100:a.right-100);s.boss.x=side<0?s.player.x+500:s.player.x-500;for(let i=0;i<240;i++)followAdventureCamera(s,1/120);const v=cameraView(s);for(const x of [s.player.x,s.boss.x]){expect(x).toBeGreaterThan(s.camera.x);expect(x).toBeLessThan(s.camera.x+v.width);}}
});
test('the whole route can be traversed into the arena after shooting the two blocking crypts',()=>{
 const s=quiet();s.player.hurt=999;let maxEnemies=0;for(let i=0;i<18500&&!s.boss.engaged;i++){stepAdventure(s,{right:true,attack:true},1/120);maxEnemies=Math.max(maxEnemies,s.enemies.length);expect(Number.isFinite(s.player.y)).toBe(true);}expect(s.graves.filter(q=>q.kind==='crypt').every(q=>q.hp===0)).toBe(true);expect(s.boss.engaged).toBe(true);expect(s.player.x).toBeGreaterThan(s.level.arena.entry-3);expect(s.checkpointAt[0]).toBe(19520);expect(s.enemies.every(e=>!e.fleeing)).toBe(true);expect(maxEnemies).toBeLessThan(65);
});

test('production canvas renders and records graveyard motion without runtime errors',async({page})=>{
 test.setTimeout(150000);const folder='tests/artifacts/arcade/graveyard-revision/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.graveReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();
  w.c=document.createElement('canvas');w.c.id='grave-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=x=>{w.s=w.createAdventure(6);w.s.noticeTime=0;w.s.player.hurt=999;w.s.player.x=x;w.s.player.y=w.groundY(w.s.platforms,x);w.s.player.ground=w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<=q.x+q.w);w.s.camera={x:Math.max(0,Math.min(w.s.level.width-960,x-300)),y:w.s.player.y-440,backdropY:40,zoom:1};};
  w.paint=()=>w.renderAdventure(w.c,w.s,w.art);
  w.record=async(seconds,input={})=>{const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5500000});const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.paint();rec.start();let start,last,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,input,1/120);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;};
 });
 for(const[name,x,seconds,input]of [['panic',920,5,{}],['emergence',4750,8,{}],['crypt',5860,8,{}],['skeleton',5430,6,{attack:true}],['crawler',7000,7,{}],['fear',3400,14,{}],['bellkeeper',19900,12,{attack:true}]]){
  if(process.env.GRAVE_REVIEW_SCENES&&!process.env.GRAVE_REVIEW_SCENES.split(',').includes(name))continue;
  await page.evaluate(x=>window.graveReview.pose(x),x);const data=await page.evaluate(([seconds,input])=>window.graveReview.record(seconds,input),[seconds,input]);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));await page.locator('#grave-review').screenshot({path:folder+name+'.png'});
 }
 expect(errors).toEqual([]);
});
