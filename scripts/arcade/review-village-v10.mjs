import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/village-depth-v10/',browser=await chromium.launch({channel:'chrome'});
fs.mkdirSync(folder,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.goto(process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4321');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.v10Review=Object.assign({},...await Promise.all(['engine/adventureModel.js','world/adventureTerrain.js','render/adventureCanvas.js','engine/villageRescue.js','engine/villageObstacles.js'].map(p=>import(root+p))));
  const w=window.v10Review;w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
 });
 for(const name of (process.env.VILLAGE_SCENES||'blockade-pressure,blockade-rescue,generic-blocked,warning-baker,warning-child,candy-timeout').split(',')){
  const r=await page.evaluate(async name=>{
   const w=window.v10Review,s=w.createAdventure(7),wall=s.villageObstacles.find(q=>q.blockade),x=name.startsWith('blockade')?wall.x-230:name.startsWith('warning')?1800:9000;
   s.enemies=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.carriages=[];s.stars=[];s.cages=[];s.supplies=[];s.noticeTime=0;
   Object.assign(s.player,{x,y:w.groundY(s.level.route,x),hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.camera={x:x-240,y:40,backdropY:40,zoom:1};s.village.furthest=x;
   const npc=(style,at,state='trapped')=>({...s.level.villagers.find(q=>q.style===style),id:'review:'+style,x:at,y:w.groundY(s.level.route,at),state,runAge:0,gait:0,age:0,speed:205,warning:false,trip:false,warned:true,tripped:true,defender:false,rubbleId:null,hidingCover:null});
   s.villagers=[];let duration=6500;
   if(name.startsWith('blockade')){s.villagers=s.level.villagers.filter(q=>q.blockadeGroup).map(q=>({...q,state:'flee',age:0,runAge:0,gait:0,warned:true,tripped:true}));s.villageObstacles=[wall];w.prepareVillageObstacles(s);s.villageObstacles=s.villageObstacles.filter(q=>q.blockade);s.platforms=s.platforms.filter(q=>!q.villageObstacle||q.villageObstacle===wall.id);duration=name==='blockade-pressure'?22000:17000;}
   if(name==='generic-blocked'){
    const r=s.level.obstacles.find(q=>q.x===10160);w.prepareVillageObstacles(s);s.villageObstacles=s.villageObstacles.filter(q=>q.id===r.id);s.villageObstacles[0].ambush=false;s.platforms=s.platforms.filter(q=>!q.villageObstacle||q.villageObstacle===r.id);const at=r.x-220;Object.assign(s.player,{x:at,y:w.groundY(s.level.route,at),ground:s.platforms.indexOf(w.groundAt(s.platforms,at))});s.camera={x:at-240,y:40,backdropY:40,zoom:1};s.villagers=[npc(0,r.x+r.w/2+40,'flee'),npc(2,r.x+r.w/2+95,'flee'),npc(7,r.x+r.w/2+150,'flee')];duration=4500;
   }
   if(name.startsWith('warning')){const n=npc(name==='warning-baker'?0:2,x+170,'flee');n.warning=true;n.warned=false;s.villagers=[n];duration=1800;}
   if(name==='candy-timeout'){const n=npc(0,x+180,'candy');n.curseAge=28.6;n.age=28.6;s.villagers=[n];w.beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.age=28.6;duration=3500;}
   const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000});
   const data=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>resolve(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   const stats={simulationTime:0,maxOrbs:0,fallenOrbs:0,witchShots:false,orbOwners:[],states:[],rescued:false,targets:[],render:[],minZoom:1,maxBlocked:0,maxClimbLift:0,maxBlockadeEnemies:0,maxCarried:0,wallBroken:false,hexyFreed:false,panicFrames:[]};let start,last,acc=0;
   rec.start();await new Promise((resolve,reject)=>{const frame=now=>{try{
    start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){
     const t=stats.simulationTime;
     w.stepAdventure(s,{attack:name==='blockade-rescue'&&t>2.2},1/120);stats.simulationTime+=1/120;acc-=1/120;
     stats.minZoom=Math.min(stats.minZoom,s.camera.zoom);stats.maxBlocked=Math.max(stats.maxBlocked,s.villagers.filter(q=>q.blocked).length);stats.maxClimbLift=Math.max(stats.maxClimbLift,...s.villagers.map(q=>q.climbLift||0));stats.maxBlockadeEnemies=Math.max(stats.maxBlockadeEnemies,s.enemies.filter(q=>q.blockadeEnemy).length);stats.maxCarried=Math.max(stats.maxCarried,s.enemies.filter(q=>q.carriedId).length);stats.wallBroken ||= s.villageObstacles.some(q=>q.blockade&&q.broken);stats.hexyFreed ||= name==='candy-timeout'&&!s.player.candy;for(const n of s.villagers)if(n.blockedFrame!==undefined&&!stats.panicFrames.includes(n.blockedFrame))stats.panicFrames.push(n.blockedFrame);
     stats.maxOrbs=Math.max(stats.maxOrbs,s.enemies.filter(q=>q.orbitParent&&q.hp>0).length);stats.fallenOrbs=Math.max(stats.fallenOrbs,s.enemies.filter(q=>q.orbitParent&&q.pumpkinFall).length);
     for(const q of s.hostile){if(q.kind==='candy-ray')stats.witchShots=true;if(q.owner?.startsWith('orbit:')&&!stats.orbOwners.includes(q.owner))stats.orbOwners.push(q.owner);}
     for(const n of s.villagers)if(!stats.states.includes(n.state))stats.states.push(n.state);stats.rescued ||= s.villageRubble.some(q=>q.freed);
     for(const e of s.enemies)if(e.lastVillageTarget&&!stats.targets.includes(e.lastVillageTarget))stats.targets.push(e.lastVillageTarget);
    }
    const at=performance.now(),h=s.player.hurt;s.player.hurt=0;w.renderAdventure(w.c,s,w.art);s.player.hurt=h;stats.render.push(performance.now()-at);
    if(now-start<duration)requestAnimationFrame(frame);else resolve();
   }catch(e){reject(e);}};requestAnimationFrame(frame);});
   stats.render.sort((a,b)=>a-b);stats.renderP95=stats.render[Math.floor(stats.render.length*.95)];delete stats.render;
   rec.stop();const video=await data;stream.getTracks().forEach(t=>t.stop());return{video,stats};
  },name);
  fs.writeFileSync(folder+name+'.webm',Buffer.from(r.video,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(r.stats,null,2)+'\n');
  const decoded=await page.evaluate(async source=>{
   const v=document.createElement('video');v.muted=true;v.src=source;await new Promise(resolve=>v.onloadeddata=resolve);if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=1e6;});
   const c=document.createElement('canvas');c.width=1440;c.height=1080;const ctx=c.getContext('2d'),full=[];
   for(let i=0;i<12;i++){await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=.1+(v.duration-.2)*i/11;});ctx.drawImage(v,(i%3)*480,Math.floor(i/3)*270,480,270);if([1,3,5,7,9].includes(i)){const f=document.createElement('canvas');f.width=v.videoWidth;f.height=v.videoHeight;f.getContext('2d').drawImage(v,0,0);full.push({i,png:f.toDataURL('image/png').split(',')[1]});}}
   return{montage:c.toDataURL('image/png').split(',')[1],full};
  },'data:video/webm;base64,'+r.video);
  fs.writeFileSync(folder+name+'-motion.png',Buffer.from(decoded.montage,'base64'));decoded.full.forEach(f=>fs.writeFileSync(folder+name+'-frame-'+f.i+'.png',Buffer.from(f.png,'base64')));
  if(name==='blockade-pressure'&&(r.stats.maxBlocked<12||r.stats.minZoom>.8||r.stats.maxCarried<1))throw new Error('Incomplete pressure scene: '+JSON.stringify(r.stats));
  if(name==='blockade-rescue'&&!r.stats.wallBroken)throw new Error('Wall resisted every real shot.');
  if(name==='candy-timeout'&&(!r.stats.hexyFreed||!r.stats.states.includes('rescue')))throw new Error('Candy timer failed.');
  console.log(name+': '+JSON.stringify(r.stats));
 }
 if(errors.length||missing.length)throw new Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
