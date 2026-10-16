import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const folder='tests/artifacts/arcade/village-depth-v8/';
test('witch gestures, pumpkin creation and fall, rubble and defenders play through the real engine',async({page})=>{
 test.setTimeout(360000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.v8Review=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','render/adventureCanvas.js','engine/villageRescue.js','engine/villagePumpkins.js','engine/adventureAmmo.js','engine/adventureVillage.js','actors/villageVillagers.js','engine/villageObstacles.js','engine/villageResistance.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='v8-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=()=>{const s=w.s=w.createAdventure(7),x=9000,y=w.groundY(s.level.route,x);Object.assign(s.player,{x,y,hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.camera={x:x-300,y:40,backdropY:40,zoom:1};s.village.furthest=x;s.checkpointAt=s.level.checkpoints.filter(q=>q[0]<=x).at(-1)||null;s.noticeTime=0;s.enemies=[];s.stars=[];s.supplies=[];s.cages=[];s.villagers=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.carriages=[];w.action=()=>({});w.before=()=>{};w.duration=6200;};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async()=>{
   w.paint();const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000}),stats={states:[],render:[],simulationTime:0,defeats:[],maxPumpkins:0};
   const done=new Promise(r=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.before(stats.simulationTime);w.stepAdventure(w.s,w.action(stats.simulationTime),1/120);stats.simulationTime+=1/120;for(const q of w.s.villagers)if(!stats.states.includes(q.state))stats.states.push(q.state);stats.minWitchX=Math.min(stats.minWitchX??Infinity,...w.s.enemies.filter(e=>e.type===26).map(e=>e.x));stats.maxWitchX=Math.max(stats.maxWitchX??-Infinity,...w.s.enemies.filter(e=>e.type===26).map(e=>e.x));stats.pools=Math.max(stats.pools||0,w.s.hostile.filter(q=>q.kind==='witch-puddle').length);stats.broken=Math.max(stats.broken||0,(w.s.villageObstacles||[]).filter(q=>q.broken).length);stats.blocked=Math.max(stats.blocked||0,w.s.villagers.filter(q=>q.blocked).length);stats.hexyAbsorbed ||= !!w.s.player.candy?.absorber;stats.stoodOn??=[];const on=w.s.platforms[w.s.player.ground]?.villageObstacle;if(on&&!stats.stoodOn.includes(on))stats.stoodOn.push(on);stats.maxGhosts=Math.max(stats.maxGhosts||0,w.s.enemies.filter(e=>e.type===19).length);stats.finishSeen ||= w.s.enemies.some(e=>e.popcornDefeat?.pumpkin);stats.hitFrames??=[];for(const e of w.s.enemies)if(e.type===26&&e.witchHitAge>=0&&e.witchHitAge<.36){const f=w.villageEnemyDrawing(e).frame;if(!stats.hitFrames.includes(f))stats.hitFrames.push(f);}stats.gaits??={};for(const n of w.s.villagers)if(n.state==='flee'){const a=stats.gaits[n.style]??=[];const f=w.villageVillagerRunFrame(n);if(!a.includes(f))a.push(f);}stats.maxPumpkins=Math.max(stats.maxPumpkins,w.s.enemies.filter(e=>e.type===27).length);for(const e of w.s.enemies)if(e.type===27&&e.defeated&&!stats.defeats.length)stats.defeats.push({time:stats.simulationTime});acc-=1/120;}const at=performance.now();w.paint();stats.render.push(performance.now()-at);if(now-start<w.duration)requestAnimationFrame(frame);else resolve();}catch(error){reject(error);}};requestAnimationFrame(frame);});
   stats.pumpkinFinish=w.s.enemies.some(e=>e.type===25&&e.popcornDefeat?.pumpkin);stats.ghosts=w.s.enemies.filter(e=>e.type===19).length;stats.candy=!!w.s.player.candy;stats.pumpkin=!!w.s.player.candy?.pumpkin;stats.done=w.s.done;stats.hearts=w.s.hearts;stats.playerX=w.s.player.x;stats.render.sort((a,b)=>a-b);stats.renderP95=stats.render[Math.floor(stats.render.length*.95)];delete stats.render;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const name of (process.env.VILLAGE_SCENES||'ray-ground,ray-air,absorb-ground,absorb-air,absorb-hexy,defenders,sprint,rubble,wagon-jump,wagon-break,pocket,glow-hexy').split(',')){
  await page.evaluate(name=>{
   const w=window.v8Review;w.pose();const s=w.s,x=s.player.x,y=s.player.y;
   const npc=(style=0,at=x+170)=>({...s.level.villagers.find(q=>q.style===style),id:'review:'+style,x:at,y:w.groundY(s.level.route,at),state:'flee',age:0,gait:0,runAge:0,warned:true,tripped:true,trip:false,warning:false,defender:false});
   if(name.startsWith('ray-'))s.enemies=[Object.assign(w.makeEnemy(x+360,y,26,4),{active:true,flying:name.endsWith('air'),flightHeight:170,timer:0})];
   if(name.startsWith('absorb-')){
    const e=Object.assign(w.makeEnemy(x+320,y,26,4),{active:true,flying:name.endsWith('air'),flightHeight:170,timer:0,hp:4});s.enemies=[e];
    if(name==='absorb-hexy'){e.phase='recover';e.timer=5;w.beginCandyCapture(s,{kind:'witch-puddle',owner:w.witchId(e)});w.duration=7500;}
    else{const n=npc(0);n.state='candy';n.curseOwner=w.witchId(e);s.villagers=[n];}
   }
   if(name==='defenders'){
    s.villagers=[npc(0,x+180),npc(6,x+350)];for(const n of s.villagers){n.defender=true;n.defended=false;}
    s.enemies=[Object.assign(w.makeEnemy(x+620,y,18,4),{active:false,timer:999,hp:999})];w.duration=5300;
   }
   if(name==='sprint'){s.villagers=[npc(6,x+170)];w.action=()=>({left:true});w.duration=3500;}
   if(name==='rubble'){
    const r={...s.level.rubble[0],x:x+145,y:w.groundY(s.level.route,x+145)},n=npc(0,r.x);n.id=r.villager;n.state='trapped';n.rubbleId=r.id;s.villageRubble=[r];s.villagers=[n];w.action=t=>({attack:t>1.3});w.duration=5000;
   }
   if(name.startsWith('wagon-')){
    w.prepareVillageObstacles(s);const r=s.villageObstacles.find(q=>q.kind==='wagon'),step=s.villageObstacles.find(q=>q.id===r.id+':step:-1');for(const q of s.villageObstacles)q.ambush=name==='wagon-break'&&q.id===r.id;
    const at=step.x-95;Object.assign(s.player,{x:at,y:w.groundY(s.level.route,at),ground:s.platforms.indexOf(w.groundAt(s.platforms,at)),dir:1});s.camera={x:at-200,y:40,backdropY:40,zoom:1};
    if(name==='wagon-break'){w.equipDrink(s,13);w.action=t=>({attack:t>.7&&t<2.1,special:t>2.5&&t<2.7});w.duration=7000;}
    else{
     let stage=0,since=0;w.before=t=>{const on=s.platforms[s.player.ground]?.villageObstacle;if(stage===0&&on===step.id){stage=1;since=t;}else if(stage===2&&on===r.id){stage=3;since=t;}};
     w.action=t=>stage===0?{right:true,jump:t>.2}:stage===1?t-since<.12?{}:(stage=2,since=t,{right:true,jump:true}):stage===2?{right:true,jump:t-since<.42}:{};w.duration=5000;
    }
   }
   if(name==='pocket'){
    w.prepareVillageObstacles(s);const left=s.villageObstacles.find(q=>q.x===10160);for(const q of s.villageObstacles)q.ambush=false;
    s.villagers=s.level.villagers.filter(q=>q.obstaclePocket===0).map(q=>({...q,state:'flee',age:0,gait:0,runAge:0,warned:true,tripped:true}));const at=left.x-210;Object.assign(s.player,{x:at,y:w.groundY(s.level.route,at),dir:1,ground:s.platforms.indexOf(w.groundAt(s.platforms,at))});s.camera={x:at-170,y:40,backdropY:40,zoom:1};s.enemies=[Object.assign(w.makeEnemy(10520,w.groundY(s.level.route,10520),26,2),{active:true,flying:true,flightHeight:175,timer:1.2})];w.equipDrink(s,13);w.action=t=>({special:t>3.2&&t<3.5});w.duration=8000;
   }
   if(name==='glow-hexy'){s.enemies=[Object.assign(w.makeEnemy(x+480,y,26,4),{active:true,timer:0,hp:999})];w.action=t=>({attack:t>.6});w.duration=4000;}
  },name);
  const r=await page.evaluate(()=>window.v8Review.record());fs.writeFileSync(folder+name+'.webm',Buffer.from(r.data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(r.stats,null,2));
  if(name.startsWith('absorb-')&&name!=='absorb-hexy'){expect(r.stats.maxPumpkins).toBe(1);expect(r.stats.states).toContain('carried');}if(name==='absorb-hexy')expect(r.stats.hexyAbsorbed).toBe(true);if(name==='wagon-jump')expect(r.stats.stoodOn).toContain('village-obstacle:0');if(name==='wagon-break')expect(r.stats.broken).toBeGreaterThanOrEqual(2);if(name==='pocket'){expect(r.stats.blocked).toBeGreaterThan(0);expect(r.stats.broken).toBeGreaterThan(0);}if(name==='rubble')expect(r.stats.states).toContain('recover');
 }
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
