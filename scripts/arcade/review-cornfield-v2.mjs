import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir=process.argv.includes('--cartoon')?'context/arcade/cornfield-cartoon-v3/':'context/arcade/cornfield-v2/',url=process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322';
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
try{
 await page.route('**/__corn',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#171521"></body>'}));await page.goto(url+'/__corn');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','actors/bosses/adventureActTwoBosses.js','actors/enemies/adventureEnemies.js','engine/actTwoRoute.js'].map(p=>import(root+p))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style.width='1440px';w.c.style.height='810px';document.body.append(w.c);
 });
 for(const [name,x,y,stage,phase,move]of [['road',750,480],['corn',2800,480],['sheds',5600,210],['hollow',8400,550],['king',14300,480,1,'windup','fan'],['roots',14300,480,2,'attack','roots'],['leap',14300,480,2,'attack','leap']]){
  await page.evaluate(({x,y,stage,phase,move})=>{
   const s=w.createAdventure(8);s.player.x=x;s.player.y=y;s.player.hurt=999;s.noticeTime=0;s.time=3;
   if(stage){Object.assign(s.boss,{stage,phase,move,engaged:true,vulnerable:true,timer:.6,phaseAge:.45,phaseDuration:1.1,originX:14820,targetX:14300,originY:480,aim:{x,y:y-35}});s.arenaLocked=true;}
   for(let i=0;i<20;i++)w.stepAdventure(s,{},1/120);
   s.camera={x:Math.max(0,x-280),y:y-440,backdropY:40,zoom:1};if(stage)s.camera={x:13900,y:-70,backdropY:40,zoom:.8};s.shake=0;w.renderAdventure(w.c,{...s,player:{...s.player,hurt:0}},w.art);
  },{x,y,stage,phase,move});await page.locator('canvas').screenshot({path:dir+name+'.png'});
 }
 if(process.argv.includes('--cartoon'))for(const [name,stage,heading]of [['cast-lineup',0,-1],['king-with-clown',1,-1],['harvest-with-clown',2,-1],['king-release-left',1,-1],['king-release-right',1,1],['harvest-charge',2,-1]]){
  await page.evaluate(({name,stage,dir})=>{
   const s=w.createAdventure(8);s.noticeTime=0;s.time=2;s.player.hurt=0;
   if(!stage){s.player.x=150;s.enemies=[[355,480,0],[550,480,25],[745,480,29],[850,340,32]].map(([x,y,type],i)=>w.prepareCornEnemy(w.makeEnemy(x,y,type,i)));s.camera={x:0,y:40,backdropY:40,zoom:1};}
   else{
    s.player.x=14250;s.enemies=[w.makeEnemy(14500,480,0)];Object.assign(s.boss,{stage,dir,phase:'recover',phaseAge:.3,move:'fan',engaged:true,timer:1,phaseDuration:1});s.camera={x:13880,y:-70,backdropY:40,zoom:.8};
    if(name.includes('release'))Object.assign(s.boss,{phase:'attack',phaseAge:.03,muzzleTime:.13});
    if(name.includes('charge'))Object.assign(s.boss,{phase:'windup',phaseAge:.5,timer:.4,phaseDuration:.9,move:'harvest'});
   }
   s.shake=0;w.renderAdventure(w.c,s,w.art);
  },{name,stage,dir:heading});await page.locator('canvas').screenshot({path:dir+name+'.png'});
 }
 if(!process.argv.includes('--stills')){
  for(const scene of [{name:'entering-corn',x:1820,y:480,duration:13},{name:'hollow-run',x:7650,y:490,duration:13},{name:'king-both-phases',x:14140,y:480,duration:62,boss:true}]){
   const result=await page.evaluate(async scene=>{
    const s=w.createAdventure(8),b=s.boss;s.player.x=scene.x;s.player.y=scene.y;s.player.hurt=999;s.supplies=[];s.noticeTime=0;
    if(scene.boss)s.enemies=[];
    s.camera={x:scene.boss?13760:Math.max(0,scene.x-300),y:scene.y-440,backdropY:40,zoom:scene.boss?.8:1};
    w.renderAdventure(w.c,{...s,player:{...s.player,hurt:0}},w.art);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5500000}),done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
    let age=0,last,start,changed=false,killed=false,next=0;const samples=[],moves=new Set(),phases=new Set(),timings=[];rec.start();
    await new Promise(resolve=>{const frame=now=>{
     start??=now;last??=now;let left=Math.min(.045,(now-last)/1000);last=now;age+=left;
     if(scene.boss&&!changed&&age>24){b.vulnerable=true;w.damageActTwoBoss(s,999);changed=true;}
     if(scene.boss&&!killed&&age>58){b.vulnerable=true;w.damageActTwoBoss(s,999);killed=true;}
     const before=performance.now();
     while(left>0){const dt=Math.min(left,1/120);s.player.hurt=999;const input=scene.boss?{left:s.player.x>b.x-260,right:s.player.x<b.x-420,jump:age%5>3.5}: {right:true,attack:true,jump:age%2.9>2.2};w.stepAdventure(s,input,dt);left-=dt;}
     s.noticeTime=0;s.shake=0;w.renderAdventure(w.c,{...s,player:{...s.player,hurt:0}},w.art);timings.push(performance.now()-before);moves.add(b.stage+':'+b.move);phases.add(b.phase);
     if(age>=next){samples.push({age,wall:(now-start)/1000,x:s.player.x,y:s.player.y,phase:b.phase,move:b.move,stage:b.stage});next+=scene.boss?4:1.5;}
     if(age<scene.duration)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});
    rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
    const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1000;});
    const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=Math.ceil(samples.length/3)*270;const g=sheet.getContext('2d');
    for(const [i,q]of samples.entries()){await new Promise(r=>{v.onseeked=r;v.currentTime=Math.min(v.duration-.04,Math.max(.001,q.wall));});g.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);g.fillStyle='#171323';g.fillRect(i%3*480,Math.floor(i/3)*270,430,23);g.fillStyle='#fff';g.font='14px sans-serif';g.fillText(q.age.toFixed(1)+'s / '+q.stage+' '+q.phase+' '+q.move,i%3*480+5,Math.floor(i/3)*270+17);}
    timings.sort((a,b)=>a-b);
    return{video,sheet:sheet.toDataURL('image/png').split(',')[1],samples,moves:[...moves],phases:[...phases],frameMs:{median:timings[Math.floor(timings.length*.5)],p95:timings[Math.floor(timings.length*.95)]}};
   },scene);
   fs.writeFileSync(dir+scene.name+'.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+scene.name+'-playback.png',Buffer.from(result.sheet,'base64'));delete result.video;delete result.sheet;fs.writeFileSync(dir+scene.name+'.json',JSON.stringify(result,null,2));console.log(scene.name,JSON.stringify({moves:result.moves,frameMs:result.frameMs}));
  }
 }
 fs.writeFileSync(dir+'browser-errors.json',JSON.stringify({errors,missing},null,2));if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
