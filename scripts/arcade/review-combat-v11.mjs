import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='tests/artifacts/arcade/combat-v11/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().startsWith('Review:'))console.log(m.text());});
const watchdog=setTimeout(()=>void browser.close(),180000);
try{
 await page.goto(process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4321');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.review11=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureAmmo.js','engine/villageRescue.js','render/adventureCanvas.js','render/adventureCamera.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','actors/hexy/hexyAnimation.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:99999';document.body.append(w.c);
  w.scene=(kind=9,x=10000)=>{const s=w.createAdventure(7);s.enemies=[];s.villagers=[];s.carriages=[];s.cages=[];s.outposts=[];s.supplies=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(p=>!p.villageObstacle);s.noticeTime=0;s.village.furthest=20000;
   Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),hurt:0,dir:1});s.camera={x:x-200,y:40,backdropY:40,zoom:1};w.equipDrink(s,kind);s.modLevels['starter-9']=3;w.s=s;return s;};
  w.tick=(n,input={})=>{for(let i=0;i<n;i++)w.stepAdventure(w.s,input,1/120);};w.paint=()=>{w.s.shake=0;w.renderAdventure(w.c,w.s,w.art);};w.snap=()=>{w.paint();return w.c.toDataURL('image/png').split(',')[1];};console.log('Review: assets loaded.');
 });
 const images=await page.evaluate(()=>{
  const w=window.review11,images={};let s=w.scene();
  s.enemies=Array.from({length:7},(_,i)=>{const x=s.player.x+255+i*88,e=w.makeEnemy(x,w.groundY(s.level.route,x),25,i);e.hp=60;e.timer=99;return e;});w.tick(75,{attack:true});s.camera={x:s.player.x-130,y:-42,backdropY:40,zoom:.85};images['volt-chain']=w.snap();
  s.enemies.forEach(e=>e.hp=.01);w.tick(20,{attack:true});w.tick(22);images['charred-troops']=w.snap();
  s=w.scene(13);w.tick(1,{special:true});w.tick(18);images['popcorn-recoil']=w.snap();
  const gallery=document.createElement('canvas');gallery.width=1440;gallery.height=15*180;const c=gallery.getContext('2d');
  for(let kind=-1;kind<14;kind++)for(let mode=0;mode<2;mode++){
   s=w.scene(kind);w.tick(mode?1:16,mode?{special:true}:{attack:true});if(mode)w.tick(29);w.paint();const col=mode,row=kind+1;c.drawImage(w.c,0,240,1440,570,col*720,row*180,720,180);c.fillStyle='#121220dd';c.fillRect(col*720,row*180,250,25);c.fillStyle='white';c.font='15px sans-serif';c.fillText(`${kind<0?'Basic':kind} / ${mode?'Strong':'Normal'}`,col*720+10,row*180+18);
  }images['attack-gallery']=gallery.toDataURL('image/png').split(',')[1];return images;
 });
 for(const [name,data]of Object.entries(images))fs.writeFileSync(dir+name+'.png',Buffer.from(data,'base64'));
 console.log('Review: all attack renders saved.');
 const video=await page.evaluate(async()=>{
  const w=window.review11,s=w.scene(9,22300),e=w.createAdventure(7).enemies.find(q=>q.type===28);s.player.hurt=999;s.enemies=[e];s.villageBlockade.started=true;s.villageBlockade.waves=3;
  const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5500000}),states=new Set();let start,last,phase2=false,capture=false,killed=false;
  const data=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
  await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;const t=(now-start)/1000,dt=Math.min(.05,(now-last)/1000);last=now;
   if(t>5&&!phase2){e.hp=e.maxHp*.48;phase2=true;}
   if(t>8&&!capture){w.beginCandyCapture(s,{kind:'candy-ray'});capture=true;}
   if(t>11.5&&!killed){delete s.player.candy;s.shots.push({kind:9,chainTarget:e,x:e.x,y:e.y-60,r:12,damage:500,vx:0,vy:0,life:.1,age:0,heavy:true,hidden:true,hits:[]});killed=true;}
   w.stepAdventure(s,{},dt);states.add(e.phase);w.paint();if(t<15)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});rec.stop();const encoded=await data;stream.getTracks().forEach(t=>t.stop());
  const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+encoded;await new Promise(resolve=>v.onloadeddata=resolve);if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=10000;});
  const montage=document.createElement('canvas');montage.width=1440;montage.height=1080;const c=montage.getContext('2d');
  for(let i=0;i<12;i++){await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=.1+(v.duration-.25)*i/11;});c.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);}
  return{encoded,montage:montage.toDataURL('image/png').split(',')[1],states:[...states],duration:v.duration};
 });
 fs.writeFileSync(dir+'harvester.webm',Buffer.from(video.encoded,'base64'));fs.writeFileSync(dir+'harvester-motion.png',Buffer.from(video.montage,'base64'));console.log('Review: boss recording decoded.');
 const audio=await page.evaluate(async()=>{
  const {HEXY_ATTACK_EVENTS,playHexyAttackSound,createHexyChannelVoice}=await import('/src/components/arcade/shared/audio/hexyAttackSound.js'),{playPopcornSound}=await import('/src/components/arcade/shared/audio/popcornSound.js'),{createEffectsBus}=await import('/src/components/arcade/shared/audio/effectsBus.js');
  const events=[...HEXY_ATTACK_EVENTS,'popcornShot','popcornCast'],rate=24000,ctx=new OfflineAudioContext(1,rate*(events.length*.65+5),rate),master=ctx.createGain();master.gain.value=.7;master.connect(ctx.destination);const out=createEffectsBus(ctx,master);
  // The bus exposes its input, matching the production signal chain.
  const input=out.input||out;events.forEach((event,i)=>{if(!playHexyAttackSound(ctx,input,event,i*.65))playPopcornSound(ctx,input,event,i*.65);});
  const voice=createHexyChannelVoice(ctx,input);voice.update({kind:'electric',force:1});
  const pause=ctx.suspend(2);const render=ctx.startRendering();await pause;voice.stop();await ctx.resume();const b=await render,data=b.getChannelData(0),buffer=new ArrayBuffer(44+data.length*2),v=new DataView(buffer),str=(at,t)=>{for(let i=0;i<t.length;i++)v.setUint8(at+i,t.charCodeAt(i));};str(0,'RIFF');v.setUint32(4,buffer.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,data.length*2,true);let peak=0,sum=0,clipped=0;
  for(let i=0;i<data.length;i++){peak=Math.max(peak,Math.abs(data[i]));sum+=data[i]**2;if(Math.abs(data[i])>=1)clipped++;v.setInt16(44+i*2,Math.max(-1,Math.min(1,data[i]))*32767,true);}
  const encoded=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob([buffer]));});return{encoded,peak,rms:Math.sqrt(sum/data.length),clipped,events,tailPeak:Math.max(...data.slice(-rate))};
 });
 fs.writeFileSync(dir+'attacks.wav',Buffer.from(audio.encoded,'base64'));delete audio.encoded;const report={errors,states:video.states,duration:video.duration,audio};fs.writeFileSync(dir+'review.json',JSON.stringify(report,null,2));
 if(errors.length||audio.clipped||audio.tailPeak>.0001)throw Error(JSON.stringify(report));console.log(JSON.stringify(report));
}finally{clearTimeout(watchdog);await browser.close();}
