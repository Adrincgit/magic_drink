import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/act-2-expansion/',out='tests/artifacts/arcade/act-two/';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/arcade/'))missing.push(r.url());});
try{
 await page.route('**/__review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#171521"></body>'}));await page.goto('http://127.0.0.1:4321/__review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','render/adventureCanvas.js','actors/bosses/adventureActTwoBosses.js'].map(p=>import(root+p))));w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style.width='1440px';w.c.style.height='810px';document.body.append(w.c);
 });
 const report=[];
 for(const id of [8,9,10]){
  await page.evaluate(id=>{const s=w.createAdventure(id),b=s.boss,a=s.level.arena;s.enemies=[];s.supplies=[];s.cages=[];s.player.x=b.x-340;s.player.y=a.y;s.player.hurt=999;s.noticeTime=0;s.arenaLocked=true;Object.assign(b,{phase:'windup',move:'fan',timer:0,phaseAge:.9,engaged:true,vulnerable:true,aim:{x:s.player.x,y:s.player.y-35},attackDir:-1,volley:0});w.stepAdventure(s,{},1/120);s.camera={x:b.x-640,y:a.y-440,backdropY:40,zoom:1};s.shake=0;w.renderAdventure(w.c,s,w.art);},id);
  await page.locator('canvas').screenshot({path:dir+'muzzle-'+id+'.png'});
  for(const [scene,x,y]of id===8?[['barns',2700,275],['carriage',7010,480]]:id===9?[['garden',600,480],['gallery',2870,110],['balconies',6600,265]]:[['entrance',360,480]]){
   await page.evaluate(({id,x,y})=>{const s=w.createAdventure(id);s.player.x=x;s.player.y=y;s.player.hurt=999;s.noticeTime=0;s.camera={x:Math.max(0,x-260),y:y-390,backdropY:40,zoom:1};s.shake=0;w.renderAdventure(w.c,s,w.art);},{id,x,y});
   await page.locator('canvas').screenshot({path:dir+id+'-'+scene+'.png'});
  }
  const result=await page.evaluate(async id=>{
   const s=w.createAdventure(id),a=s.level.arena;s.enemies=[];s.player.x=a.entry+140;s.player.y=a.y;s.player.hurt=999;const samples=[],phases=new Set(),events={};let sim=0,last,started,half=false,third=false,killed=false,next=0;
   const duration=id===10?30:20,targets=id===10?[.5,2.5,4.4,7.8,10.2,12.5,15.3,18.3,21.4,24.2,27,29.5]:[.5,2.5,4.3,6.8,9.2,11.7,14.4,17.1,19.6];
   // Warm all textures before the capture clock starts.
   w.renderAdventure(w.c,s,w.art);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000}),done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(r.result.split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
   await new Promise(resolve=>{const frame=now=>{
    started??=now;last??=now;let left=Math.min(.04,(now-last)/1000);last=now;sim+=left;
    if(!half&&sim>8.5){s.boss.vulnerable=true;w.damageActTwoBoss(s,999);half=true;}
    if(id===10&&!third&&sim>18){s.boss.vulnerable=true;w.damageActTwoBoss(s,999);third=true;}
    if(!killed&&sim>(id===10?26:16.4)){s.boss.vulnerable=true;w.damageActTwoBoss(s,999);killed=true;}
    while(left>0){const dt=Math.min(left,1/120);w.stepAdventure(s,{},dt);left-=dt;for(const ev of s.events){const key=typeof ev==='string'?ev:ev.kind;events[key]=(events[key]||0)+1;}}
    s.player.hurt=999;s.shake=0;s.noticeTime=0;w.renderAdventure(w.c,s,w.art);phases.add(s.boss.phase);
    if(sim>=targets[next]){samples.push({t:sim,wall:(now-started)/1000,phase:s.boss.phase,move:s.boss.move,stage:s.boss.stage,hp:s.boss.hp,x:s.boss.x,y:s.boss.y,hostile:s.hostile.length});next++;}
    if(sim<duration)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
   const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(r=>v.onloadeddata=r);if(!Number.isFinite(v.duration))await new Promise(r=>{v.onseeked=r;v.currentTime=1000;});
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=Math.ceil(samples.length/3)*270;const g=sheet.getContext('2d'),frames=[];
   for(const [i,sample]of samples.entries()){
    await new Promise(r=>{v.onseeked=r;v.currentTime=Math.min(v.duration-.04,Math.max(.001,sample.wall));});g.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);g.fillStyle='#151023';g.fillRect(i%3*480,Math.floor(i/3)*270,330,24);g.fillStyle='#fff';g.font='14px sans-serif';g.fillText(id+' '+sample.t.toFixed(1)+'s '+sample.phase+' '+sample.move,i%3*480+5,Math.floor(i/3)*270+17);
    if([2,4,6].includes(i)){const c=document.createElement('canvas');c.width=1440;c.height=810;c.getContext('2d').drawImage(v,0,0);frames.push({name:id+'-frame-'+i,data:c.toDataURL('image/png').split(',')[1]});}
   }
   return {id,video,sheet:sheet.toDataURL('image/png').split(',')[1],frames,samples,phases:[...phases],events};
  },id);
  fs.writeFileSync(out+'boss-'+id+'.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+'boss-'+id+'-playback.png',Buffer.from(result.sheet,'base64'));for(const q of result.frames)fs.writeFileSync(dir+q.name+'.png',Buffer.from(q.data,'base64'));delete result.video;delete result.sheet;delete result.frames;report.push(result);console.log(JSON.stringify({id,phases:result.phases,stages:[...new Set(result.samples.map(q=>q.stage))]}));
 }
 fs.writeFileSync(dir+'validation.json',JSON.stringify({errors,missing,scenes:report},null,2));if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
