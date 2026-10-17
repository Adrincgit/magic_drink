import fs from 'node:fs/promises';
import {chromium} from '@playwright/test';
const dir='context/arcade/global-feedback/review/';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('**/__review',r=>r.fulfill({contentType:'text/html',body:'<html><body style="margin:0;background:#151322"></body></html>'}));
try{
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__review');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/hexy/hexyAnimation.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','input/adventureGamepad.js'].map(p=>import(base+p))));
  w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='width:1440px;height:810px;display:block';document.body.append(w.canvas);
  w.setup=name=>{
   const weapon=name.includes('electric')?9:name.includes('fire')?0:-1,s=w.s=w.createAdventure(7,false,{weapon,ammo:600,mods:['sky-guard'],modLevels:{'sky-guard':2,'starter-9':3}});
   s.level={...s.level,checkpoints:[],spookyIdle:false};
   for(const k of ['enemies','villagers','villageRubble','villageStones','villageObstacles','villageBlockades','outposts','supplies','cages','stars','hazards','carriages','campTents'])s[k]=[];
   s.platforms=[{x:0,y:480,w:30000,h:350,baseY:480,dx:0,dy:0,kind:'earth'}];s.level.route=s.platforms;s.noticeTime=0;
   Object.assign(s.player,{x:7460,y:480,ground:0});w.camera={x:7220,y:40,backdropY:40,zoom:1};s.camera={...w.camera};
   w.keys={};if(name.startsWith('glide')){Object.assign(s.player,{y:145,ground:null,vy:140,jumps:1,gliding:true});s.lastInput.jump=true;w.keys={jump:true,attack:true,...(name.includes('up')?{up:true}:name.includes('down')?{down:true}:{})};}
   if(name.startsWith('guard')){w.keys={guard:true,right:true,...(name.includes('up')?{up:true}:{})};}
   if(name==='fire'||name==='electric'){
    s.player.x=7460;w.keys={attack:true};s.enemies=(name==='electric'?[0,18,25]:[18]).map((type,i)=>{const e=w.makeEnemy(7670+i*105,480,type,i);Object.assign(e,{timer:99,hp:1000,maxHp:1000});return e;});
   }
   if(name==='dust'){s.player.x=7460;w.keys={right:true};}
   if(name==='idle-worried')s.hearts=2;if(name==='idle-tired')s.hearts=1;
   w.trace=[];w.name=name;
  };
  w.paint=()=>w.renderAdventure(w.canvas,w.s,w.art);
  w.step=()=>{w.stepAdventure(w.s,w.keys,1/120);w.s.camera={...w.camera};const p=w.s.player,pose=w.hexyPose(w.s),tip=w.hexyMuzzle(w.s);w.trace.push({time:w.s.time,x:p.x,y:p.y,vy:p.vy,gliding:p.gliding,sheet:pose.sheet,frame:pose.frame,tip,dust:w.s.surfaceDust.length,enemy:w.s.enemies.map(e=>({x:e.x,y:e.y,hp:e.hp,burning:e.burning,elementHit:e.elementHit}))});};
  w.record=async(seconds)=>{
   const chunks=[],stream=w.canvas.captureStream(30),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),done=new Promise(resolve=>{recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
   recorder.start();let start,last,acc=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});recorder.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return data;
  };
 });
 for(const name of ['glide','glide-up','glide-down','guard','guard-up','fire','electric','dust','idle-worried','idle-tired']){
  await page.evaluate(n=>{window.review.setup(n);window.review.paint();},name);
  const video=await page.evaluate(()=>window.review.record(2.3));await fs.writeFile(dir+name+'.webm',Buffer.from(video,'base64'));
  const trace=await page.evaluate(()=>window.review.trace);await fs.writeFile(dir+name+'-trace.json',JSON.stringify(trace));
  await page.locator('canvas').screenshot({path:dir+name+'.png'});console.log(name+' '+trace.length+' physics ticks');
 }
 // Decode the recordings, rather than accepting source sprites or a build as
 // proof of registration, stride continuity, effect timing and alpha edges.
 await page.setContent('<video muted></video>');
 for(const name of ['glide','guard','guard-up','fire','electric','dust','idle-worried','idle-tired']){
  const source='data:video/webm;base64,'+(await fs.readFile(dir+name+'.webm')).toString('base64');
  const trace=JSON.parse(await fs.readFile(dir+name+'-trace.json','utf8'));
  const png=await page.evaluate(async({source,name,trace})=>{
   const video=document.querySelector('video');video.src=source;await new Promise(r=>video.onloadeddata=r);
   if(!Number.isFinite(video.duration))await new Promise(r=>{video.onseeked=r;video.currentTime=1e6;});
   const c=document.createElement('canvas');c.width=1600;c.height=560;const b=c.getContext('2d');
   for(let i=0;i<8;i++){
    const time=.06+i*(Math.min(video.duration-.1,2.2)-.06)/7;await new Promise(r=>{video.onseeked=r;video.currentTime=time;});
    const actor=trace.reduce((a,b)=>Math.abs(a.time-time)<Math.abs(b.time-time)?a:b),x=i%4*400,y=Math.floor(i/4)*280;
    const crop=name==='fire'||name==='electric'?[260,450,900,300]:[(actor.x-7220)*1.5-170,(actor.y-40)*1.5-205,400,250];
    const scale=Math.min(400/crop[2],250/crop[3]),w=crop[2]*scale,h=crop[3]*scale;
    b.fillStyle='#151322';b.fillRect(x,y,400,280);b.drawImage(video,...crop,x+(400-w)/2,y+(250-h)/2,w,h);b.fillStyle='#fff3d1';b.font='15px sans-serif';b.fillText(name+' | '+time.toFixed(2)+' s',x+8,y+271);
   }
   return c.toDataURL('image/png').split(',')[1];
  },{source,name,trace});
  await fs.writeFile(dir+name+'-playback.png',Buffer.from(png,'base64'));
 }
 await fs.writeFile(dir+'errors.json',JSON.stringify(errors));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
