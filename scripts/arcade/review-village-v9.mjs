import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/village-depth-v9/',browser=await chromium.launch({channel:'chrome'});
fs.mkdirSync(folder,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
 await page.goto(process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4321');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.v9Review=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','render/adventureCanvas.js','engine/villageRescue.js','engine/villagePumpkins.js','engine/villageOrbit.js'].map(p=>import(root+p))));
  const w=window.v9Review;w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
 });
 for(const name of (process.env.VILLAGE_SCENES||'orbit-combat,orbit-break,hide-blacksmith,hide-woman,hide-risk,rapid-targets').split(',')){
  const r=await page.evaluate(async name=>{
   const w=window.v9Review,s=w.createAdventure(7),special=s.enemies.find(e=>e.conjurer),x=name.startsWith('orbit')?special.home-300:9000;
   s.enemies=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.carriages=[];s.stars=[];s.cages=[];s.supplies=[];s.noticeTime=0;
   Object.assign(s.player,{x,y:w.groundY(s.level.route,x),hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.camera={x:x-240,y:40,backdropY:40,zoom:1};s.village.furthest=x;
   const npc=(style,at,state='trapped')=>({...s.level.villagers.find(q=>q.style===style),id:'review:'+style,x:at,y:w.groundY(s.level.route,at),state,runAge:0,gait:0,age:0,speed:205,warning:false,trip:false,warned:true,tripped:true,defender:false,rubbleId:null,hidingCover:null});
   s.villagers=[];let duration=6500,broken=false,witchBroken=false;
   if(name.startsWith('orbit')){s.enemies=[special];s.villagers=[npc(0,x+80)];duration=8200;}
   if(name.startsWith('hide')){
    const style=name==='hide-woman'?7:6,n=npc(style,x+220,'hiding');n.hidingCover=n.rubbleId='review-shelter';s.villagers=[n];s.villageRubble=[{id:n.hidingCover,x:n.x,y:n.y,hp:4,villager:n.id,shelter:true}];duration=5200;
    if(name==='hide-risk')s.enemies=[Object.assign(w.makeEnemy(x+480,n.y,25,4),{active:true,rapidLantern:true,timer:0})];
   }
   if(name==='rapid-targets'){
    s.enemies=[Object.assign(w.makeEnemy(x+400,s.player.y,25,4),{active:true,rapidLantern:true,timer:0})];s.villagers=[npc(0,x+560)];duration=9000;
   }
   const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6500000});
   const data=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>resolve(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   const stats={simulationTime:0,maxOrbs:0,fallenOrbs:0,witchShots:false,orbOwners:[],states:[],rescued:false,targets:[],render:[]};let start,last,acc=0;
   rec.start();await new Promise((resolve,reject)=>{const frame=now=>{try{
    start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){
     const t=stats.simulationTime;
     if(name==='orbit-break'){
      const orb=s.enemies.find(q=>q.orbitParent&&q.hp>0);
      // Controlled real collision fixtures exercise the shared shot/defeat path.
      if(orb&&!broken&&t>1.8){s.shots.push({x:orb.x-25,y:orb.y-25,vx:500,vy:0,r:8,damage:5,life:.5,kind:0,age:0,hits:[]});broken=true;}
      if(!witchBroken&&t>3.6){s.shots.push({x:special.x-25,y:special.y-65,vx:500,vy:0,r:8,damage:20,life:.5,kind:0,age:0,hits:[]});witchBroken=true;}
     }
     w.stepAdventure(s,{attack:name.startsWith('hide')&&name!=='hide-risk'&&t>1.5},1/120);stats.simulationTime+=1/120;acc-=1/120;
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
  if(name==='orbit-combat'&&(r.stats.maxOrbs!==3||!r.stats.witchShots||r.stats.orbOwners.length!==3))throw new Error('Incomplete orbit fire: '+JSON.stringify(r.stats));
  if(name==='orbit-break'&&r.stats.fallenOrbs!==3)throw new Error('Escorts failed to collapse.');
  if(['hide-blacksmith','hide-woman'].includes(name)&&(!r.stats.rescued||!r.stats.states.includes('flee')))throw new Error('Shelter rescue failed.');
  console.log(name+': '+JSON.stringify(r.stats));
 }
 if(errors.length||missing.length)throw new Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
