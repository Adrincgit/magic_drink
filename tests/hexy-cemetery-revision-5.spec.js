import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {stepGraveyard,damageGrave,cryptFrame} from '../src/components/arcade/adventure/engine/adventureGraveyard';
import {enemyDrawing} from '../src/components/arcade/adventure/render/adventureSprites';
import {enemyGeometry} from '../src/components/arcade/adventure/actors/enemies/adventureEnemyGeometry';
import {nightmareFenceRuns,projectNightmareFence} from '../src/components/arcade/adventure/render/nightmareGateCanvas';
import {groundY} from '../src/components/arcade/adventure/world/adventureTerrain';
const place=(s,x)=>Object.assign(s.player,{x,y:groundY(s.level.route,x),ground:s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),vx:0,vy:0,hurt:999});
const tick=(s,seconds)=>{for(let i=0;i<Math.round(seconds*120);i++)stepGraveyard(s,1/120,makeEnemy);};

test('6: capture uses a registered continuous transformation and retains the complete final zombie identity',()=>{
 const s=createAdventure(6),e=s.enemies.find(e=>e.fleeing),z=makeEnemy(e.x+12,e.y,18);s.graves=[];s.enemies=[e,z];stepGraveyard(s,.001,makeEnemy);const x=e.x,frames=new Set();
 for(let i=0;i<420;i++){const d=enemyDrawing(e);if(e.capture){frames.add(d.frame);expect(d.key).toBe('nightmare-conversion-v5');expect(d.size).toBe(enemyGeometry({type:18}).size);}stepGraveyard(s,1/120,makeEnemy);expect(e.x).toBe(x);}
 tick(s,.02);expect([...frames]).toEqual(Array.from({length:16},(_,i)=>i));expect(e.type).toBe(18);expect(e.hp).toBe(13.8);expect(e.fleeing).toBe(false);expect(e.armMissing).toBe(false);expect(enemyDrawing(e)).toEqual({key:'nightmare-zombie-walk',frame:0});expect(e.phase).toBe('newlyTurned');
});

test('6: rescue remains possible even during the last transformation pose',()=>{
 const s=createAdventure(6),e=s.enemies.find(e=>e.fleeing),z=makeEnemy(e.x+12,e.y,18);s.graves=[];s.enemies=[e,z];stepGraveyard(s,.001,makeEnemy);tick(s,3.35);expect(enemyDrawing(e).frame).toBe(15);z.trap=2;stepGraveyard(s,.01,makeEnemy);expect(e.capture).toBeNull();expect(e.rescued).toBe(true);expect(e.type).toBe(0);expect(e.fleeing).toBe(true);
});

test('7: sealed crypts open, emit mist, then release eight spaced actors and never exceed capacity',()=>{
 const s=createAdventure(6),q=s.graves.find(q=>q.kind==='crypt');s.graves=[q];s.enemies=[];place(s,q.x-300);const phases=[],frames=new Set(),spawns=[];let previous=0;
 for(let i=0;i<2400;i++){
  stepGraveyard(s,1/120,makeEnemy);if(!phases.includes(q.phase))phases.push(q.phase);frames.add(cryptFrame(q));if(q.spawned>previous){spawns.push(i/120);previous=q.spawned;}
  if(['warning','opening','mist'].includes(q.phase))expect(q.spawned).toBe(0);if(q.phase==='warning')expect(cryptFrame(q)).toBe(0);
 }
 expect(phases).toEqual(['warning','opening','mist','releasing','open']);expect([...frames]).toEqual([0,1,2,3,4]);expect(spawns).toHaveLength(8);expect(spawns[0]).toBeGreaterThan(5.3);for(let i=1;i<8;i++)expect(spawns[i]-spawns[i-1]).toBeGreaterThanOrEqual(.71);expect(q.hp).toBe(80);
 s.enemies[0].hp=0;tick(s,12);expect(q.spawned).toBe(9);expect(s.enemies.filter(e=>e.hp>0)).toHaveLength(8);
});

test('7: destruction cancels scheduled releases at every stage and damage never opens a sealed door early',()=>{
 for(const stop of [1,4.5,5.8,6.6,9]){
  const s=createAdventure(6),q=s.graves.find(q=>q.kind==='crypt');s.graves=[q];s.enemies=[];place(s,q.x-300);tick(s,stop);const spawned=q.spawned;
  if(stop===1){damageGrave(s,q,60);expect(cryptFrame(q)).toBe(0);}damageGrave(s,q,q.hp);tick(s,20);expect(q.spawned).toBe(spawned);expect(q.phase).toBe('broken');expect(cryptFrame(q)).toBe(7);
 }
});

test('8: fence connections stay anchored while the foreground moves faster and the distance moves slower',()=>{
 const s=createAdventure(6),runs=nightmareFenceRuns(s),origin=4100;
 for(const run of Object.values(runs)){
  s.camera={x:origin,y:20};const a=run.map(p=>projectNightmareFence(s,p));s.camera={x:origin+300,y:-150};const b=run.map(p=>projectNightmareFence(s,p));
  expect(b[0]).toEqual(a[0]);for(let i=0;i<a.length;i++){expect(b[i].y).toBe(a[i].y);expect(b[i].h).toBe(a[i].h);expect(b[i].x-a[i].x).toBeCloseTo(-300*(run[i].depth-1));}
  s.camera={x:origin,y:100};expect(run.map(p=>projectNightmareFence(s,p))).toEqual(a);
 }
 expect(runs.near.at(-1).h).toBeGreaterThan(runs.near[0].h);expect(runs.far.at(-1).h).toBeLessThan(runs.far[0].h);expect(runs.near[0].y).toBeGreaterThan(s.player.y);expect(runs.far[0].y).toBeLessThan(s.player.y);
});

test('record revision 5 conversion, crypt opening and gate depth',async({page})=>{
 test.setTimeout(180000);const folder='tests/artifacts/arcade/cemetery-revision-5/';fs.mkdirSync(folder,{recursive:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.r5=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','engine/adventureGraveyard.js','render/adventureSprites.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(f=>import(root+f))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='revision-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=x=>{w.s=w.createAdventure(6);w.s.noticeTime=0;for(const k of ['enemies','graves','stars','pickups','supplies','cages'])w.s[k]=[];Object.assign(w.s.player,{x,y:w.groundY(w.s.level.route,x),ground:w.s.platforms.findIndex(q=>q.kind==='earth'&&x>=q.x&&x<q.x+q.w),hurt:999});w.s.camera={x:Math.max(0,x-300),y:w.s.player.y-440,backdropY:40,zoom:1};w.action=()=>({});};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async seconds=>{
   const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000}),stats={phases:[],conversion:[],spawned:0,converted:false,maxFrameSeconds:0,renderTimes:[],maxStep:0,minHearts:5};
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});w.paint();rec.start();let start,last,acc=0;
   await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;stats.maxFrameSeconds=Math.max(stats.maxFrameSeconds,(now-last)/1000);acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){const x=w.s.player.x;w.stepAdventure(w.s,w.action(w.s.time),1/120);stats.maxStep=Math.max(stats.maxStep,Math.abs(w.s.player.x-x));stats.minHearts=Math.min(stats.minHearts,w.s.hearts);
     for(const q of w.s.graves){if(!stats.phases.includes(q.phase))stats.phases.push(q.phase);stats.spawned=Math.max(stats.spawned,q.spawned);}
     for(const e of w.s.enemies){if(e.capture){const f=w.enemyDrawing(e).frame;if(!stats.conversion.includes(f))stats.conversion.push(f);}stats.converted||=!!e.converted;}acc-=1/120;
    }const renderStart=performance.now();w.paint();stats.renderTimes.push(performance.now()-renderStart);if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
   stats.crypts=w.s.graves.map(q=>({hp:q.hp,spawned:q.spawned}));stats.playerX=w.s.player.x;stats.renderTimes.sort((a,b)=>a-b);stats.renderP95=stats.renderTimes[Math.floor(stats.renderTimes.length*.95)];delete stats.renderTimes;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const [name,seconds]of [['gate-return',11],['gate-crossing',7],['gate-distance',5],['conversion',6],['crypt-opening',12],['crypt-destroy',32]]){
  if(process.env.CEMETERY5_SCENES&&!process.env.CEMETERY5_SCENES.split(',').includes(name))continue;
  await page.evaluate(name=>{const w=window.r5;
   if(name==='gate-return'){w.pose(3950);w.action=t=>({right:t>1&&t<4,left:t>5.5&&t<8.5});}
   if(name==='gate-crossing'){w.pose(4110);w.action=t=>({right:t<2.2,left:t>3.4&&t<5.6,jump:t>.65&&t<1||t>4.3&&t<4.55});}
   if(name==='gate-distance'){w.pose(5680);w.action=t=>({right:t<2,left:t>2.8});}
   if(name==='conversion'){w.pose(7200);const e=w.makeEnemy(7520,w.groundY(w.s.level.route,7520),0),z=w.makeEnemy(7545,e.y,18);Object.assign(e,{fleeing:true,active:true,fleeDir:-1,dir:-1,capture:{age:0,attacker:z},infection:3.5,phase:'infection'});Object.assign(z,{active:true,phase:'feeding',prey:e,nightmareVariant:0,armMissing:false});w.s.enemies=[e,z];}
   if(name.startsWith('crypt')){const q=w.createAdventure(6).graves.find(q=>q.kind==='crypt');w.pose(q.x-330);w.s.graves=[q];if(name==='crypt-destroy')w.action=t=>({attack:t>7,right:t>18});}
  },name);
  const {data,stats}=await page.evaluate(seconds=>window.r5.record(seconds),seconds);fs.writeFileSync(folder+name+'.webm',Buffer.from(data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(stats,null,2));await page.locator('#revision-review').screenshot({path:folder+name+'.png'});
  expect(stats.maxStep).toBeLessThan(10);expect(stats.minHearts).toBe(5);if(name==='conversion'){expect(stats.conversion).toEqual(Array.from({length:16},(_,i)=>i));expect(stats.converted).toBe(true);}if(name==='crypt-opening'){expect(stats.phases).toEqual(expect.arrayContaining(['warning','opening','mist','releasing','open']));expect(stats.spawned).toBe(8);}if(name==='crypt-destroy'){expect(stats.crypts[0].hp).toBe(0);expect(stats.playerX).toBeGreaterThan(9720+193);}
 }
 expect(errors).toEqual([]);
});
