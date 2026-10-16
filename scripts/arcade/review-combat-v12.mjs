import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='tests/artifacts/arcade/combat-v12/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));const watchdog=setTimeout(()=>void browser.close(),180000);
try{
 await page.goto(process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4321');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=window.review12=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureAmmo.js','engine/villageRescue.js','render/adventureCanvas.js','render/hexyCanvas.js','actors/enemies/adventureEnemies.js','world/adventureTerrain.js','actors/hexy/hexyAnimation.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='position:fixed;inset:0;width:1440px;height:810px;z-index:99999';document.body.append(w.c);
  w.scene=(kind=9)=>{const s=w.createAdventure(7);s.enemies=[];s.villagers=[];s.carriages=[];s.cages=[];s.outposts=[];s.supplies=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(p=>!p.villageObstacle);s.noticeTime=0;s.village.furthest=20000;
   const x=10000;Object.assign(s.player,{x,y:w.groundY(s.level.route,x),ground:s.platforms.indexOf(w.groundAt(s.platforms,x)),vx:0,vy:0,hurt:0,dir:1});s.camera={x:x-180,y:40,backdropY:40,zoom:1};w.equipDrink(s,kind);s.modLevels['starter-9']=3;w.s=s;return s;};
  w.tick=(n,input={})=>{for(let i=0;i<n;i++)w.stepAdventure(w.s,input,1/120);};w.paint=()=>{w.s.shake=0;w.renderAdventure(w.c,w.s,w.art);};w.snap=()=>{w.paint();return w.c.toDataURL('image/png').split(',')[1];};
 });
 const images=await page.evaluate(()=>{
  const w=window.review12,images={};let s=w.scene();s.enemies=[w.makeEnemy(s.player.x+400,s.player.y,25,0)];s.enemies[0].hp=100;s.enemies[0].timer=99;w.tick(25,{attack:true});images['volt-painted-in-game']=w.snap();
  // Enlarge the actual render for visual inspection, preserving native alpha.
  const gallery=document.createElement('canvas');gallery.width=1440;gallery.height=900;const c=gallery.getContext('2d');c.fillStyle='#242836';c.fillRect(0,0,1440,900);
  const specs=[['stand-fire',0],['volt-cast',0],['volt-cast',1],['volt-cast',3],['air-aim',0],['volt-cast',4],['volt-cast',6],['volt-cast',7],['popcorn-air',0],['popcorn-air',2],['popcorn-air',4],['popcorn-air',7]];
  specs.forEach(([sheet,frame],i)=>{const x=i%4*360,y=Math.floor(i/4)*300;c.save();c.translate(x+180,y+270);c.scale(2.5,2.5);w.drawHexy(c,w.art,{sheet,frame},0,0,false);c.restore();c.fillStyle='white';c.font='16px sans-serif';c.fillText(sheet+' '+frame,x+14,y+25);});images['sprite-comparison']=gallery.toDataURL('image/png').split(',')[1];
  s=w.scene(13);s.player.y-=120;s.player.ground=null;s.player.vy=360;w.tick(1,{special:true});w.tick(22);images['popcorn-air-in-game']=w.snap();return images;
 });
 for(const [name,data]of Object.entries(images))fs.writeFileSync(dir+name+'.png',Buffer.from(data,'base64'));
 console.log('New sprites rendered.');
 const video=await page.evaluate(async()=>{
  const w=window.review12;w.scene();const chunks=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});let start,last,air=false,shot=false,reverse=false;
  const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
  await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;const t=(now-start)/1000,dt=Math.min(.035,(now-last)/1000);last=now;
   if(t>=2&&!air){w.scene(13);w.s.player.y-=150;w.s.player.ground=null;w.s.player.vy=260;air=true;}
   if(t>=4&&!reverse){w.scene();w.s.player.dir=-1;reverse=true;}
   const input=t<2||t>=4?{attack:true}:!shot?{special:true}:{};if(air)shot=true;
   w.stepAdventure(w.s,input,dt);w.paint();if(t<6)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});rec.stop();const encoded=await done;stream.getTracks().forEach(t=>t.stop());
  const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+encoded;await new Promise(resolve=>v.onloadeddata=resolve);if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=10000;});
  const montage=document.createElement('canvas');montage.width=1440;montage.height=1080;const c=montage.getContext('2d'),times=[.05,.4,.8,1.2,2.03,2.12,2.23,2.4,2.62,4.1,4.5,5.2];
  for(let i=0;i<times.length;i++){await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=times[i];});c.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);}
  return{encoded,montage:montage.toDataURL('image/png').split(',')[1],duration:v.duration};
 });
 fs.writeFileSync(dir+'sprites-motion.webm',Buffer.from(video.encoded,'base64'));fs.writeFileSync(dir+'sprites-motion.png',Buffer.from(video.montage,'base64'));console.log('Motion video decoded.');
 const audio=await page.evaluate(async()=>{
  const root='/src/components/arcade/shared/audio/',{HEXY_ATTACK_EVENTS,playHexyAttackSound,createHexyChannelVoice}=await import(root+'hexyAttackSound.js'),{WORLD_COMBAT_EVENTS,playWorldCombatSound,createVillageVoice}=await import(root+'worldCombatSound.js'),{playPopcornSound}=await import(root+'popcornSound.js'),{createEffectsBus}=await import(root+'effectsBus.js');
  const events=[...HEXY_ATTACK_EVENTS,'popcornShot','popcornCast',...WORLD_COMBAT_EVENTS],rate=32000,step=1.6,ctx=new OfflineAudioContext(2,Math.ceil(rate*(events.length*step+4)),rate),master=ctx.createGain();master.gain.value=.7;master.connect(ctx.destination);const input=createEffectsBus(ctx,master);
  events.forEach((event,i)=>{if(!playHexyAttackSound(ctx,input,event,i*step)&&!playPopcornSound(ctx,input,event,i*step))playWorldCombatSound(ctx,input,event,i*step,{pan:0});});
  const b=await ctx.startRendering(),data=b.getChannelData(0);let peak=0,sum=0,clipped=0;for(const x of data){peak=Math.max(peak,Math.abs(x));sum+=x*x;if(Math.abs(x)>=1)clipped++;}
  const levels=events.map((event,i)=>{let sum=0;for(let n=Math.round(i*step*rate);n<Math.round((i*step+1.5)*rate);n++)sum+=data[n]**2;return{event,rms:Math.sqrt(sum/(1.5*rate))};});
  async function wav(b){const samples=b.length,channels=b.numberOfChannels,buffer=new ArrayBuffer(44+samples*channels*2),v=new DataView(buffer),str=(at,t)=>{for(let i=0;i<t.length;i++)v.setUint8(at+i,t.charCodeAt(i));};str(0,'RIFF');v.setUint32(4,buffer.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,b.sampleRate,true);v.setUint32(28,b.sampleRate*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,samples*channels*2,true);for(let ch=0;ch<channels;ch++){const data=b.getChannelData(ch);for(let i=0;i<samples;i++)v.setInt16(44+(i*channels+ch)*2,Math.max(-1,Math.min(1,data[i]))*32767,true);}return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob([buffer]));});}
  const channelCtx=new OfflineAudioContext(2,rate*6,rate),cm=channelCtx.createGain();cm.gain.value=.7;cm.connect(channelCtx.destination);const co=createEffectsBus(channelCtx,cm),voice=createHexyChannelVoice(channelCtx,co),village=createVillageVoice(channelCtx,co);voice.update({kind:'electric',force:1});village.update({gain:.1,frequency:950,pitch:43,crackle:.4,pan:.6});
  const pause=channelCtx.suspend(2),render=channelCtx.startRendering();await pause;voice.stop();village.stop();voice.stop();village.stop();await channelCtx.resume();const cb=await render;let tail=0;for(const x of cb.getChannelData(0).slice(rate*3))tail=Math.max(tail,Math.abs(x));
  // Compare the preserved basic cast against the previous exact synthesis.
  const basicCtx=new OfflineAudioContext(1,rate,rate),newGain=basicCtx.createGain();newGain.connect(basicCtx.destination);playHexyAttackSound(basicCtx,newGain,'cast',0);const actual=(await basicCtx.startRendering()).getChannelData(0);
  const oldCtx=new OfflineAudioContext(1,rate,rate);[1050,1570,2090].forEach((hz,i)=>{const o=oldCtx.createOscillator(),g=oldCtx.createGain(),at=i*.02;o.type='sine';o.frequency.setValueAtTime(hz,at);o.frequency.exponentialRampToValueAtTime(hz*.65,at+.14);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.031/(i+1),at+.006);g.gain.exponentialRampToValueAtTime(.0001,at+.14);o.connect(g);g.connect(oldCtx.destination);o.start(at);o.stop(at+.16);});const previous=(await oldCtx.startRendering()).getChannelData(0);let basicDifference=0;for(let i=0;i<actual.length;i++)basicDifference=Math.max(basicDifference,Math.abs(actual[i]-previous[i]));
  return{encoded:await wav(b),channels:await wav(cb),peak,rms:Math.sqrt(sum/data.length),clipped,tail,basicDifference,levels};
 });
 fs.writeFileSync(dir+'fx-preview.wav',Buffer.from(audio.encoded,'base64'));fs.writeFileSync(dir+'channels-release.wav',Buffer.from(audio.channels,'base64'));delete audio.encoded;delete audio.channels;
 const report={errors,duration:video.duration,audio};fs.writeFileSync(dir+'review.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 if(errors.length||audio.clipped||audio.tail>.00001||audio.basicDifference>.000001||audio.levels.some(q=>!Number.isFinite(q.rms)||q.rms<.00001))throw Error('Audio/runtime verification failed');
}finally{clearTimeout(watchdog);await browser.close();}
