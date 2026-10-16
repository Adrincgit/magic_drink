import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure,playerBody,retryAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy,updateEnemies} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {beginNightmareDefeat,stepNightmareBranches} from '../src/components/arcade/adventure/engine/adventureNightmareMotion';
import {skeletonFrame} from '../src/components/arcade/adventure/actors/enemies/nightmareSkeletonAnimation';
import {groundY,surfaceY} from '../src/components/arcade/adventure/world/adventureTerrain';
const scene=()=>{const s=createAdventure(6);s.doubleJump=false;for(const k of ['enemies','graves','cages','supplies','pickups','stars'])s[k]=[];return s;};
const place=(s,x,q=null)=>Object.assign(s.player,{x,y:q?surfaceY(q,x):groundY(s.level.route,x),ground:q?s.platforms.indexOf(q):s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),vx:0,vy:0,hurt:999});

test('2: four spaced pairs offer a higher path with every bough reachable by a normal jump',()=>{
 const base=scene();expect(base.level.branchTrees).toHaveLength(8);expect(base.doubleJump).not.toBe(true);const boughs=base.platforms.filter(q=>q.kind==='nightmare-branch');
 for(let group=0;group<4;group++){
  const route=boughs.slice(group*4,group*4+4);expect(base.level.branchTrees[group*2+1].x-base.level.branchTrees[group*2].x).toBeGreaterThanOrEqual(550);
  expect(groundY(base.level.route,route[3].x)-route[3].y).toBeGreaterThan(220);
  for(let j=0;j<4;j++){
   let reached=false;
   for(const u of [.55,.75,.9,.98])for(const v of [.08,.2,.4,.6]){
    if(reached)continue;const s=scene(),target=s.platforms.find(q=>q.tree===route[j].tree&&q.side===route[j].side&&q.kind==='nightmare-branch'),previous=j?s.platforms.find(q=>q.tree===route[j-1].tree&&q.side===route[j-1].side&&q.kind==='nightmare-branch'):null,tx=target.x+target.w*v;
    place(s,previous?previous.x+previous.w*u:tx,previous);
    for(let i=0;i<200;i++){stepAdventure(s,{jump:true,right:s.player.x<tx-3,left:s.player.x>tx+3},1/120);if(s.player.ground===s.platforms.indexOf(target)){reached=true;break;}}
   }
   expect(reached,JSON.stringify({group,j,target:route[j]})).toBe(true);
  }
 }
});

test('2: boughs support Hexy for three seconds, warn, fall after 3.5 and reset on retry',()=>{
 const s=scene(),q=s.platforms.find(q=>q.kind==='nightmare-branch'),i=s.platforms.indexOf(q);place(s,q.x+q.w/2,q);
 stepNightmareBranches(s,3);expect(q.gone).not.toBe(true);expect(s.player.ground).toBe(i);stepNightmareBranches(s,.49);expect(q.gone).not.toBe(true);stepNightmareBranches(s,.02);expect(q.gone).toBe(true);expect(s.player.ground).toBeNull();retryAdventure(s);expect(s.platforms[i].gone).toBeUndefined();
});

test('1 and 3: crossing the steep approach and reversing keeps Hexy visible and damps vertical camera travel',()=>{
 const s=scene();place(s,3450);s.camera={x:3150,y:s.player.y-440,backdropY:40,zoom:1};let maxSpeed=0,slowFrames=0;
 for(let i=0;i<960;i++){const old=s.camera.y;stepAdventure(s,{right:i<480,left:i>=480},1/120);const speed=Math.abs(s.camera.y-old)*120;maxSpeed=Math.max(maxSpeed,speed);if(speed<=70.01)slowFrames++;const foot=s.player.y-s.camera.y;expect(foot).toBeGreaterThan(330);expect(foot).toBeLessThan(500);expect(s.camera.backdropY).toBe(40);}
 expect(maxSpeed).toBeLessThan(110);expect(slowFrames/960).toBeGreaterThan(.9);expect(s.hearts).toBe(5);
});

test('5: a defeated skeleton plays eight crumble poses, leaves a pile, then releases independent parts without ghosts',()=>{
 const s=scene();place(s,7200);const e=makeEnemy(7450,groundY(s.level.route,7450),22);Object.assign(e,{hp:0,defeated:true,active:true});beginNightmareDefeat(s,e);s.enemies=[e];let hits=0;s.damage=()=>hits++;const frames=new Set();
 for(let i=0;i<300;i++){s.time+=1/120;updateEnemies(s,1/120,playerBody,()=>{});frames.add(skeletonFrame(e));expect(e.y).toBe(groundY(s.level.route,e.x));}
 expect([...frames]).toEqual([16,17,18,19,20,21,22,23]);expect(s.enemies).toContain(e);expect(e.deadTime).toBeCloseTo(.5);expect(s.enemies.filter(q=>q.fragmentKind)).toHaveLength(5);expect(s.enemies.some(q=>q.type===19)).toBe(false);
 for(let i=0;i<65;i++)updateEnemies(s,1/120,playerBody,()=>{});expect(s.enemies).not.toContain(e);expect(s.enemies.filter(q=>q.fragmentKind)).toHaveLength(5);
});

test('record revision 4 scenery, canopy, hand and complete skeleton poses',async({page})=>{
 test.setTimeout(180000);const folder='tests/artifacts/arcade/cemetery-revision-4/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.r4=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureNightmareMotion.js','actors/enemies/adventureEnemies.js','actors/enemies/adventureNightmares.js','render/adventureCanvas.js','render/nightmareTrailCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='actor-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=(x=7200)=>{w.s=w.createAdventure(6);w.s.noticeTime=0;w.s.enemies=[];w.s.graves=[];w.s.stars=[];w.s.pickups=[];w.s.supplies=[];w.s.cages=[];Object.assign(w.s.player,{x,y:w.groundY(w.s.level.route,x),ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:999});w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};w.action=()=>({});};
  w.enemy=(x,type,props={})=>{const e=w.makeEnemy(x,w.groundY(w.s.level.route,x),type);Object.assign(e,{active:true},props);w.s.enemies.push(e);return e;};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async seconds=>{
   const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000}),stats={phases:[],souls:0,throws:0,deathFrames:[],grounds:[],maxFrameSeconds:0};
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.paint();rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;stats.maxFrameSeconds=Math.max(stats.maxFrameSeconds,(now-last)/1000);acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.stepAdventure(w.s,w.action(w.s.time),1/120);if(w.s.platforms[w.s.player.ground]?.kind==='nightmare-branch'&&!stats.grounds.includes(w.s.player.ground))stats.grounds.push(w.s.player.ground);for(const e of w.s.enemies){if(!stats.phases.includes(e.phase))stats.phases.push(e.phase);if(e.hp<=0&&[18,21,22].includes(e.type)){const f=w.nightmareDrawing(e).frame;if(!stats.deathFrames.includes(f))stats.deathFrames.push(f);}}stats.souls=Math.max(stats.souls,w.s.enemies.filter(e=>e.fromZombie).length);stats.throws=Math.max(stats.throws,w.s.hostile.filter(e=>e.kind==='bone').length);acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['opening',9],['gate-return',12],['canopy',11],['skeleton-walk',8],['skeleton-attack',8],['skeleton-crumble',6],['hand',6]]){
  if(process.env.CEMETERY4_SCENES&&!process.env.CEMETERY4_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.r4;
   if(name==='opening'){w.pose(90);w.action=t=>({right:t>2&&t<6,left:t>=6});}
   if(name==='gate-return'){w.pose(3650);w.action=t=>({right:t<6,left:t>=6});}
   if(name==='canopy'){
    w.pose(1880);const low=w.s.platforms.findIndex(q=>q.kind==='nightmare-branch'&&q.tree===0&&q.side===-1),high=w.s.platforms.findIndex(q=>q.kind==='nightmare-branch'&&q.tree===0&&q.side===1);let stage=0;
    w.action=t=>{const p=w.s.player;if(stage===0&&p.ground===low)stage=1;if(stage===1&&p.x>w.s.platforms[low].x+w.s.platforms[low].w-12)stage=2;if(stage===2&&p.ground===high)stage=3;if(stage===0)return{jump:true};if(stage===1)return{right:true};if(stage===2)return{jump:true,right:p.x<w.s.platforms[high].x+35};return{};};
   }
   if(name==='skeleton-walk'){w.pose();w.enemy(7540,22,{timer:99});w.action=t=>({right:t>3&&t<5});}
   if(name==='skeleton-attack'){w.pose();w.enemy(7480,22,{timer:.1});}
   if(name==='skeleton-crumble'){w.pose();w.enemy(7480,22,{timer:99,hp:2});w.action=t=>({attack:t>1.4&&t<1.5});}
   if(name==='hand'){w.pose();w.enemy(7490,24,{timer:.1});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.r4.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#actor-review').screenshot({path:folder+name+'.png'});
  if(name==='skeleton-attack'){expect(stats.phases).toEqual(expect.arrayContaining(['pluck','throw','recover']));expect(stats.throws).toBeGreaterThan(0);}if(name==='skeleton-crumble')expect(stats.deathFrames).toEqual([16,17,18,19,20,21,22,23]);if(name==='canopy')expect(stats.grounds.length).toBeGreaterThanOrEqual(2);

 }
 expect(errors).toEqual([]);
});
