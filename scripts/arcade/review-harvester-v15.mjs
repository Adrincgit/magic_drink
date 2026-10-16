import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/village-5-2/revision-15/',artifacts='tests/artifacts/arcade/harvester-v15/';fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(artifacts,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
try{
 await page.route('**/__review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Harvester review</title><body style="margin:0;background:#151221"></body>'}));await page.goto('http://127.0.0.1:4321/__review');
 const results=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/villageRescue.js','engine/villageHarvester.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(p=>import(root+p)))),art=await w.loadAdventureArt();
  const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=810;document.body.append(canvas);
  const record=async(name,state,duration,targets,steer=()=>{})=>{
   const samples=[],events={},phases=new Set();let started,last,sim=0,next=0;
   w.renderAdventure(canvas,state,art);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   const chunks=[],stream=canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
   await new Promise(resolve=>{const frame=now=>{
    started??=now;last??=now;const dt=Math.min(.04,(now-last)/1000);last=now;steer(state,sim);
    let left=dt;while(left>0){const step=Math.min(left,1/120);w.stepAdventure(state,{},step);left-=step;for(const ev of state.events){const kind=typeof ev==='string'?ev:ev.kind;events[kind]=(events[kind]||0)+1;}}sim+=dt;
    if(name==='carriage'){state.camera={x:0,y:40,zoom:1,backdropY:40};}if(name==='defenders')state.camera={x:8650,y:40,zoom:1,backdropY:40};if(name==='warning')state.camera={x:280,y:40,zoom:1,backdropY:40};
    state.shake=0;state.noticeTime=0;w.renderAdventure(canvas,state,art);const boss=state.enemies.find(e=>e.type===28);if(boss)phases.add(boss.phase);
    if(sim>=targets[next]){samples.push({t:sim,wall:(now-started)/1000,phase:boss?.phase,x:boss?.x,y:boss?.y,hp:boss?.hp,flying:boss?.flying,stones:state.villageStones.length,defenders:state.villagers.filter(q=>q.state==='defend').length,warning:state.villagers.some(q=>q.state==='warning'),pumpkins:state.enemies.filter(q=>q.type===27).length});next++;}
    if(sim<duration)requestAnimationFrame(frame);else resolve();
   };requestAnimationFrame(frame);});rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
   const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(resolve=>v.onloadeddata=resolve);if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=1000;});
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=Math.ceil(samples.length/3)*270;const g=sheet.getContext('2d'),frames=[];
   for(const [i,sample]of samples.entries()){
    await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=Math.min(v.duration-.05,Math.max(.001,sample.wall));});g.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);g.fillStyle='#151023';g.fillRect(i%3*480,Math.floor(i/3)*270,225,24);g.fillStyle='#fff';g.font='14px sans-serif';g.fillText(name+' '+sample.t.toFixed(2)+'s '+(sample.phase||''),i%3*480+5,Math.floor(i/3)*270+17);
    if(name==='boss'&&[2,4,6,8].includes(i)||name==='carriage'&&i===2||name==='defenders'&&i===1||name==='warning'&&i===2){const c=document.createElement('canvas');c.width=1440;c.height=810;c.getContext('2d').drawImage(v,0,0);frames.push({name:name+'-'+i,data:c.toDataURL('image/png').split(',')[1]});}
   }
   return{name,video,sheet:sheet.toDataURL('image/png').split(',')[1],samples,frames,events,phases:[...phases],duration:v.duration};
  };
  function quiet(x){const s=w.createAdventure(7);s.enemies=[];s.villagers=[];s.carriages=[];s.hostile=[];s.villageRubble=[];s.villageObstacles=[];s.supplies=[];s.outposts=[];s.cages=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),vx:0,vy:0,hurt:999});s.camera={x:x-260,y:40,backdropY:40,zoom:1};s.village.furthest=x;s.noticeTime=0;return s;}
  const output=[],boss=quiet(22400),original=w.createAdventure(7).enemies.find(e=>e.type===28);boss.enemies=[original];boss.player.x=original.x-420;boss.village.furthest=24000;let meal=false,half=false,killed=false;
  output.push(await record('boss',boss,25,[.5,2.6,4.7,6.4,7.3,8.3,9.7,12.3,15.9,19.1,22.8,24.8],(s,t)=>{
   if(!meal&&t>=1.8){s.villagers=[0,1,2].map(i=>({...s.level.villagers[i],id:'boss-meal-'+i,x:original.x-200-i*85,y:original.baseY,state:'candy',age:0,curseAge:0,active:false}));meal=true;}
   if(!half&&t>=5.9){original.hp=original.maxHp*.49;half=true;}
   if(!killed&&t>=22){s.shots.push({kind:9,chainTarget:original,voltProbe:true,x:original.x,y:original.y-70,vx:0,vy:0,r:15,life:.2,age:0,damage:1000,hits:[],hidden:true});killed=true;}
   // Keep the review alive while leaving enemy attacks and trajectories intact.
   s.player.hurt=999;
  }));
  const carriage=w.createAdventure(7);carriage.enemies=[];carriage.villagers=[];carriage.player.hurt=999;
  output.push(await record('carriage',carriage,5,[1.9,2.65,3.2,3.65,4.3,4.9]));
  const defenders=quiet(8950);defenders.village.furthest=24000;defenders.villagers=[0,6].map((style,i)=>({...defenders.level.villagers.find(q=>q.style===style),id:'thrower-'+i,style,defender:true,defended:false,state:'flee',x:9000+i*125,y:480,age:0,warning:false,trip:false}));defenders.enemies=[Object.assign(w.makeEnemy(9430,480,25,2),{active:true,timer:99})];
  output.push(await record('defenders',defenders,3.8,[.3,.47,.65,1.5,2.65,3.6]));
  const warning=quiet(500),n={...warning.level.villagers.find(q=>q.warning),x:700,y:480,state:'flee',age:0,runAge:0};warning.villagers=[n,...[0,1,2].map(i=>({...warning.level.villagers[i],id:'runner-'+i,x:900+i*100,y:480,state:'flee',age:0,runAge:0,warning:false,trip:false}))];
  output.push(await record('warning',warning,3.5,[.15,.65,1.3,1.9,2.5,3.3]));
  return output;
 });
 for(const scene of results){fs.writeFileSync(artifacts+scene.name+'.webm',Buffer.from(scene.video,'base64'));fs.writeFileSync(dir+scene.name+'-playback.png',Buffer.from(scene.sheet,'base64'));for(const frame of scene.frames)fs.writeFileSync(dir+frame.name+'.png',Buffer.from(frame.data,'base64'));delete scene.video;delete scene.sheet;delete scene.frames;}
 fs.writeFileSync(dir+'validation.json',JSON.stringify({errors,missing,scenes:results},null,2));console.log(JSON.stringify({errors,missing,scenes:results.map(q=>({name:q.name,phases:q.phases,samples:q.samples}))}));if(errors.length||missing.length)throw Error('Rendered review failed');
}finally{await browser.close();}
