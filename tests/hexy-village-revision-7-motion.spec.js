import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const folder='tests/artifacts/arcade/village-depth-v7/';
test('witch gestures, pumpkin creation and fall, rubble and defenders play through the real engine',async({page})=>{
 test.setTimeout(360000);fs.mkdirSync(folder,{recursive:true});const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.v7Review=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','render/adventureCanvas.js','engine/villageRescue.js','engine/villagePumpkins.js','engine/adventureAmmo.js','engine/adventureVillage.js','actors/villageVillagers.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.id='v7-review';w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
  w.pose=()=>{const s=w.s=w.createAdventure(7),x=7900,y=w.groundY(s.level.route,x);Object.assign(s.player,{x,y,hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.camera={x:x-300,y:40,backdropY:40,zoom:1};s.village.furthest=x;s.checkpointAt=s.level.checkpoints.filter(q=>q[0]<=x).at(-1)||null;s.noticeTime=0;s.enemies=[];s.stars=[];s.supplies=[];s.cages=[];s.villagers=[];s.villageRubble=[];s.carriages=[];w.action=()=>({});w.before=()=>{};w.duration=6200;};
  w.paint=()=>{const h=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art);w.s.player.hurt=h;};
  w.record=async()=>{
   w.paint();const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000}),stats={states:[],render:[],simulationTime:0,defeats:[],maxPumpkins:0};
   const done=new Promise(r=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>r(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.before(stats.simulationTime);w.stepAdventure(w.s,w.action(stats.simulationTime),1/120);stats.simulationTime+=1/120;for(const q of w.s.villagers)if(!stats.states.includes(q.state))stats.states.push(q.state);stats.minWitchX=Math.min(stats.minWitchX??Infinity,...w.s.enemies.filter(e=>e.type===26).map(e=>e.x));stats.maxWitchX=Math.max(stats.maxWitchX??-Infinity,...w.s.enemies.filter(e=>e.type===26).map(e=>e.x));stats.pools=Math.max(stats.pools||0,w.s.hostile.filter(q=>q.kind==='witch-puddle').length);stats.maxGhosts=Math.max(stats.maxGhosts||0,w.s.enemies.filter(e=>e.type===19).length);stats.finishSeen ||= w.s.enemies.some(e=>e.popcornDefeat?.pumpkin);stats.hitFrames??=[];for(const e of w.s.enemies)if(e.type===26&&e.witchHitAge>=0&&e.witchHitAge<.36){const f=w.villageEnemyDrawing(e).frame;if(!stats.hitFrames.includes(f))stats.hitFrames.push(f);}stats.gaits??={};for(const n of w.s.villagers)if(n.state==='flee'){const a=stats.gaits[n.style]??=[];const f=w.villageVillagerRunFrame(n);if(!a.includes(f))a.push(f);}stats.maxPumpkins=Math.max(stats.maxPumpkins,w.s.enemies.filter(e=>e.type===27).length);for(const e of w.s.enemies)if(e.type===27&&e.defeated&&!stats.defeats.length)stats.defeats.push({time:stats.simulationTime});acc-=1/120;}const at=performance.now();w.paint();stats.render.push(performance.now()-at);if(now-start<w.duration)requestAnimationFrame(frame);else resolve();}catch(error){reject(error);}};requestAnimationFrame(frame);});
   stats.pumpkinFinish=w.s.enemies.some(e=>e.type===25&&e.popcornDefeat?.pumpkin);stats.ghosts=w.s.enemies.filter(e=>e.type===19).length;stats.candy=!!w.s.player.candy;stats.pumpkin=!!w.s.player.candy?.pumpkin;stats.done=w.s.done;stats.hearts=w.s.hearts;stats.playerX=w.s.player.x;stats.render.sort((a,b)=>a-b);stats.renderP95=stats.render[Math.floor(stats.render.length*.95)];delete stats.render;rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,stats};
  };
 });
 for(const name of (process.env.VILLAGE_SCENES||'clown-fire,cast-ground,cast-air,witch-drop,witch-hit-ground,witch-hit-air,crowd,pumpkin-finish,rubble-depth').split(',')){
  await page.evaluate(name=>{
   const w=window.v7Review;w.pose();const s=w.s,x=s.player.x,y=s.player.y;
   const npc=(style=0,at=x+170)=>({...s.level.villagers.find(q=>q.style===style),x:at,y:w.groundY(s.level.route,at),state:'candy',age:0,gait:0,runAge:0,warning:false,trip:false});
   if(name.startsWith('cast')||name.startsWith('absorb')){
    const e=Object.assign(w.makeEnemy(x+330,y,26,9),{active:true,flying:name.endsWith('air'),flightHeight:150,timer:0,hp:5});s.enemies=[e];
    if(name.startsWith('absorb')){const q=npc();q.curseOwner=w.witchId(e);s.villagers=[q];}
   }
   if(['pumpkin-fire','pumpkin-fall'].includes(name)){
    const q=npc(),e=w.spawnSoulPumpkin(s,w.makeEnemy(x+400,y,26,8),q);s.villagers=[q];Object.assign(e,{x:x+400,y:y-135,phase:'patrol',phaseAge:0,flightHeight:135,timer:name==='pumpkin-fire'?0:99});
    if(name==='pumpkin-fire'){const target=npc(0,x+170);target.id='fire-target';target.state='trapped';s.villagers.push(target);}
    else w.before=t=>{if(t>.9&&!e.reviewHit){e.reviewHit=true;s.shots.push({x:e.x-16,y:e.y-38,vx:200,vy:0,r:8,kind:0,damage:9,life:.4,age:0,hits:[],scale:1});}};
   }
   if(name==='rubble'){const r={...s.level.rubble[0],x:x+250,y:w.groundY(s.level.route,x+250)},q={...npc(0,r.x),id:r.villager,state:'trapped',rubbleId:r.id};s.villageRubble=[r];s.villagers=[q];w.action=t=>({attack:t>.7});}
   if(name==='defenders'){s.villagers=[0,6].map((style,i)=>({...npc(style,x+220+i*125),id:'defender:'+i,state:'flee',defender:true,defended:false}));s.enemies=[w.makeEnemy(x+600,y,18,9),w.makeEnemy(x+800,y,18,10)];}

   if(name.startsWith('hexy-')){
    const e=Object.assign(w.makeEnemy(x+350,y,26,30),{active:true,timer:-1});s.enemies=[e];w.beginCandyCapture(s,{kind:'candy-ray',owner:w.witchId(e)});s.player.candy.age=1.1;w.duration=7600;
    if(name==='hexy-escape')w.action=t=>t>2.1&&t<3.7?{left:Math.floor((t-2.1)/.06)%2===0,right:Math.floor((t-2.1)/.06)%2!==0}:{};
   }
   if(name==='clown-fire'){s.enemies=[Object.assign(w.makeEnemy(x+330,y,25,9),{active:true,timer:0})];s.villagers=[{...npc(0,x+170),state:'trapped'}];}
   if(name==='long-ray'){s.enemies=[Object.assign(w.makeEnemy(x+500,y,26,9),{active:true,flying:true,flightHeight:170,timer:0,phase:'windup',phaseAge:0,candyAim:{x:x+140,y:y+100}})];}
   if(name==='occlusion'){
    const at=6710,fy=w.groundY(s.level.route,at);Object.assign(s.player,{x:at,y:fy,dir:1,ground:s.platforms.indexOf(w.groundAt(s.platforms,at))});s.camera={x:at-300,y:40,backdropY:40,zoom:1};w.equipDrink(s,13);w.action=t=>({special:t>.6});w.enemyShot(s,at+420,fy-45,Math.PI,100,'soul-flame',{r:13,life:4,village:true});
   }
   if(name==='crowd'){
    s.villagers=Array.from({length:8},(_,i)=>({...npc(i,x+100+i*82),id:'runner:'+i,state:'flee',speed:190+i*3,warned:true,tripped:true,trip:false,runAge:i*.07}));w.duration=4000;w.action=()=>({left:true});
   }
   if(name.startsWith('witch-hit')){
    const e=Object.assign(w.makeEnemy(x+330,y,26,0),{active:true,flying:name.endsWith('air'),flightHeight:145,timer:99,hp:11.5});s.enemies=[e];let hits=0;
    w.before=t=>{if(t>.8+hits*1.3&&hits<3){hits++;s.shots.push({x:e.x,y:e.y-60,vx:0,vy:0,r:8,kind:0,damage:1,life:.05,age:0,hits:[],scale:1});}};
   }
   if(name==='witch-drop'){
    const e=Object.assign(w.makeEnemy(x+300,y,26,0),{active:true,flying:true,flightHeight:175,timer:0,airCasts:1});s.enemies=[e];w.duration=7000;
    const n={...npc(0,x+600),id:'pool-target',state:'trapped'};s.villagers=[n];w.before=()=>{const pool=s.hostile.find(q=>q.kind==='witch-puddle');if(pool&&n.state==='trapped'){n.x=pool.x;n.y=w.groundY(s.level.route,n.x);}};
   }
   if(name==='pumpkin-finish'){
    const e=Object.assign(w.makeEnemy(x+220,y,25,0),{active:true,timer:99,hp:2,releasesSoul:true});s.enemies=[e];w.equipDrink(s,13);w.action=t=>({special:t>.6});
   }
   if(name==='rubble-depth'){
    const r={...s.level.rubble[0],x:x+100,y:w.groundY(s.level.route,x+100),freed:true,age:0};s.villageRubble=[r];w.action=t=>({right:t>.3&&t<2.2,left:t>2.6});
   }
   if(name==='clouds'){const at=2400;Object.assign(s.player,{x:at,y:w.groundY(s.level.route,at),ground:s.platforms.indexOf(w.groundAt(s.platforms,at))});s.camera={x:at-300,y:40,backdropY:40,zoom:1};}
  },name);
  const r=await page.evaluate(()=>window.v7Review.record());fs.writeFileSync(folder+name+'.webm',Buffer.from(r.data,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(r.stats,null,2));
  if(name==='clown-fire')expect(r.stats.states).toContain('turning');if(name.startsWith('witch-hit'))expect(r.stats.hitFrames.sort((a,b)=>a-b)).toEqual([12,13,14,15]);if(name==='witch-drop'){expect(r.stats.pools).toBeGreaterThan(0);expect(r.stats.states).toContain('turning');}if(name==='pumpkin-finish'){expect(r.stats.finishSeen).toBe(true);expect(r.stats.maxGhosts).toBe(0);}if(name==='crowd')for(const a of Object.values(r.stats.gaits))expect(a).toHaveLength(8);
  if(name.startsWith('absorb')){expect(r.stats.states).toContain('carried');expect(r.stats.maxPumpkins).toBe(1);}if(name==='pumpkin-fall'){expect(r.stats.defeats).toHaveLength(1);expect(r.stats.states).toContain('rescue');expect(r.stats.states).toContain('flee');}if(name==='pumpkin-fire')expect(r.stats.states).toContain('turning');if(name==='rubble')expect(r.stats.states).toContain('recover');if(name==='defenders')expect(r.stats.states).toContain('defend');
 }
 expect(errors).toEqual([]);expect(missing).toEqual([]);
});
