import fs from 'node:fs';
import {chromium} from '@playwright/test';

const folder='tests/artifacts/arcade/village-dust/',browser=await chromium.launch({channel:'chrome'});
fs.mkdirSync(folder,{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4321');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  window.dustReview=Object.assign({},...await Promise.all(['engine/adventureModel.js','world/adventureTerrain.js','render/adventureCanvas.js'].map(p=>import(root+p))));
  const w=window.dustReview;w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:999999';document.body.append(w.c);
 });
 for(const name of ['soil','cobbles','carriage']){
  const r=await page.evaluate(async name=>{
   const w=window.dustReview,s=w.createAdventure(7),x=name==='cobbles'?9000:650;
   s.enemies=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.stars=[];s.cages=[];s.supplies=[];s.noticeTime=0;s.shopSeen=true;
   Object.assign(s.player,{x,y:w.groundY(s.level.route,x),hurt:999,ground:s.platforms.indexOf(w.groundAt(s.platforms,x))});s.camera={x:x-240,y:40,backdropY:40,zoom:1};s.village.furthest=x;
   s.villagers=name==='carriage'?[]:[0,1,6,7].map((style,i)=>({...s.level.villagers.find(n=>n.style===style),id:'dust:'+i,x:x+160+i*145,y:w.groundY(s.level.route,x+160+i*145),state:'flee',runAge:0,gait:0,age:0,speed:205,warning:false,trip:false,tripped:true,warned:true,defender:false}));
   s.carriages=name==='carriage'?s.carriages.map(q=>({...q,x:x+450,active:true})):[];
   const stream=w.c.captureStream(60),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000});
   const data=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>resolve(String(f.result).split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   const stats={maxPuffs:0,kinds:[],simulationTime:0};let start,last,acc=0;
   rec.start();await new Promise((resolve,reject)=>{const frame=now=>{try{
    start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;
    while(acc>=1/120){w.stepAdventure(s,{},1/120);stats.simulationTime+=1/120;acc-=1/120;stats.maxPuffs=Math.max(stats.maxPuffs,s.villageDust.length);for(const q of s.villageDust)if(!stats.kinds.includes(q.kind))stats.kinds.push(q.kind);}
    const h=s.player.hurt;s.player.hurt=0;w.renderAdventure(w.c,s,w.art);s.player.hurt=h;
    if(now-start<3700)requestAnimationFrame(frame);else resolve();
   }catch(e){reject(e);}};requestAnimationFrame(frame);});
   s.villagers=[];s.carriages=[];for(let i=0;i<90;i++)w.stepAdventure(s,{},1/120);stats.puffsAfterStopping=s.villageDust.length;
   rec.stop();const video=await data;stream.getTracks().forEach(t=>t.stop());return{video,stats};
  },name);
  fs.writeFileSync(folder+name+'.webm',Buffer.from(r.video,'base64'));fs.writeFileSync(folder+name+'.json',JSON.stringify(r.stats,null,2)+'\n');
  // Decode the recorded video; screenshots alone do not verify playback.
  const decoded=await page.evaluate(async source=>{
   const v=document.createElement('video');v.muted=true;v.src=source;await new Promise(resolve=>v.onloadeddata=resolve);if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=1e6;});
   const c=document.createElement('canvas');c.width=1440;c.height=810;const ctx=c.getContext('2d'),full=[];
   for(let i=0;i<9;i++){await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=.12+(v.duration-.2)*i/8;});ctx.drawImage(v,(i%3)*480,Math.floor(i/3)*270,480,270);if([1,3,5].includes(i)){const f=document.createElement('canvas');f.width=v.videoWidth;f.height=v.videoHeight;f.getContext('2d').drawImage(v,0,0);full.push(f.toDataURL('image/png').split(',')[1]);}}
   return{montage:c.toDataURL('image/png').split(',')[1],full};
  },'data:video/webm;base64,'+r.video);
  fs.writeFileSync(folder+name+'-motion.png',Buffer.from(decoded.montage,'base64'));decoded.full.forEach((p,i)=>fs.writeFileSync(folder+name+'-frame-'+i+'.png',Buffer.from(p,'base64')));
  if(!r.stats.maxPuffs||r.stats.puffsAfterStopping)throw new Error('Dust did not appear and settle: '+name);
  console.log(name+': '+JSON.stringify(r.stats));
 }
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();}
