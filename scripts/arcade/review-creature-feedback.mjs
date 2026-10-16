import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/village-5-2/revision-13/',artifacts='tests/artifacts/arcade/creature-audio/';fs.mkdirSync(dir+'audio',{recursive:true});fs.mkdirSync(artifacts,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('**/__review',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Review</title><body style="margin:0;background:#151221"></body>'}));await page.goto('http://127.0.0.1:4321/__review');
 const audio=await page.evaluate(async()=>{
  const root='/src/components/arcade/shared/audio/',{CREATURE_CUES,createCreaturePlayer}=await import(root+'creatureSamples.js'),{createEffectsBus}=await import(root+'effectsBus.js'),{playHexyAttackSound}=await import(root+'hexyAttackSound.js');
  const results=[],rate=32000;
  function wav(b){const bytes=new ArrayBuffer(44+b.length*4),v=new DataView(bytes),str=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i));};str(0,'RIFF');v.setUint32(4,bytes.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,2,true);v.setUint32(24,rate,true);v.setUint32(28,rate*4,true);v.setUint16(32,4,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,b.length*4,true);for(let ch=0;ch<2;ch++)for(let i=0;i<b.length;i++)v.setInt16(44+(i*2+ch)*2,Math.round(Math.max(-1,Math.min(1,b.getChannelData(ch)[i]))*32767),true);return new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob([bytes]));});}
  for(const kind of [...Object.keys(CREATURE_CUES),'crowd-mix','hexy-basic']){
   const ctx=new OfflineAudioContext(2,rate*(kind==='crowd-mix'?4:2.1),rate),fx=ctx.createGain(),vo=ctx.createGain();fx.gain.value=.7*.7;vo.gain.value=.7*.7*.6;fx.connect(ctx.destination);vo.connect(ctx.destination);const out=createEffectsBus(ctx,fx),voiceOut=createEffectsBus(ctx,vo),player=createCreaturePlayer(ctx,out,voiceOut);const loaded=await player.preload();if(loaded.failures.length)throw Error('Missing recordings');
   if(kind==='hexy-basic')playHexyAttackSound(ctx,out,'cast',0);
   else if(kind==='crowd-mix'){for(const [i,k]of Object.keys(CREATURE_CUES).entries())player.play(k,i*.08,{pan:i/8-.4});for(let t=0;t<3;t+=.25)playHexyAttackSound(ctx,out,'cast',t);}
   else player.play(kind,0);
   const b=await ctx.startRendering();let peak=0,sum=0,clipped=0;for(const data of [b.getChannelData(0),b.getChannelData(1)])for(const v of data){peak=Math.max(peak,Math.abs(v));sum+=v*v;if(Math.abs(v)>=1)clipped++;}
   results.push({kind,peak,rms:Math.sqrt(sum/(b.length*2)),clipped,data:await wav(b)});
  }return results;
 });for(const a of audio){fs.writeFileSync(dir+'audio/'+a.kind+'.wav',Buffer.from(a.data,'base64'));delete a.data;}
 console.log('Audio rendered through the actual effects and voices buses.');
 const review=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureAmmo.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(p=>import(root+p)))),art=await w.loadAdventureArt();
  const c=document.createElement('canvas');c.width=1440;c.height=810;c.style='width:1440px;height:810px';document.body.append(c);
  const scene=()=>{const s=w.createAdventure(7),x=9000;s.enemies=[];s.villagers=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.villageRubble=[];s.villageObstacles=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;s.noticeTime=0;Object.assign(s.player,{x,y:w.groundY(s.level.route,x)-140,ground:null,vx:0,vy:320,dir:1,jumps:1,hurt:0});s.camera={x:x-260,y:40,backdropY:40,zoom:1};w.equipDrink(s,13);return s;};
  const film=document.createElement('canvas');film.width=1440;film.height=810;const g=film.getContext('2d'),times=[0,5,13,25,43,65],metrics=[];
  for(const [row,mode]of ['side','down','up'].entries()){
   const s=scene(),castY=s.player.y;let frame=0;
   for(let i=0;i<=65;i++){
    w.stepAdventure(s,{special:i===0,down:mode==='down',up:mode==='up'},1/120);s.shake=0;
    if(times.includes(i)){w.renderAdventure(c,s,art);const x=frame*240,y=row*270;g.drawImage(c,x,y,240,135);g.fillStyle='#fff2d2';g.font='14px sans-serif';g.fillText(mode+' '+(i/120).toFixed(2)+'s',x+7,y+156);metrics.push({mode,t:i/120,y:s.player.y-castY,flash:!!s.popcornFlash,blast:s.effects.some(e=>e.popcornBlast)});frame++;}
   }
  }
  // Record real playback, then seek/decode it before exporting the contact sheet.
  const chunks=[],stream=c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});let s=scene(),start,last,mode=-1;
  const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
  await new Promise(resolve=>{const step=now=>{start??=now;last??=now;const t=(now-start)/1000,dt=Math.min(.025,(now-last)/1000);last=now;const next=Math.min(2,Math.floor(t/1.2));let cast=false;if(next!==mode){s=scene();mode=next;cast=true;}w.stepAdventure(s,{special:cast,down:mode===1,up:mode===2},dt||1/120);w.renderAdventure(c,s,art);if(t<3.6)requestAnimationFrame(step);else resolve();};requestAnimationFrame(step);});rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
  const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(resolve=>v.onloadeddata=resolve);if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=1000;});
  const decoded=document.createElement('canvas');decoded.width=1440;decoded.height=810;const dc=decoded.getContext('2d');let i=0;
  for(const t of [.02,.1,.18,.3,1.22,1.3,1.38,1.55,2.42,2.5,2.58,2.75]){await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=t;});dc.drawImage(v,i%4*360,Math.floor(i/4)*270,360,203);i++;}
  return{metrics,video,contact:film.toDataURL('image/png').split(',')[1],decoded:decoded.toDataURL('image/png').split(',')[1],duration:v.duration};
 });fs.writeFileSync(artifacts+'popcorn-feedback.webm',Buffer.from(review.video,'base64'));fs.writeFileSync(dir+'popcorn-frames.png',Buffer.from(review.contact,'base64'));fs.writeFileSync(dir+'popcorn-playback.png',Buffer.from(review.decoded,'base64'));delete review.video;delete review.contact;delete review.decoded;
 const report={errors,audio,...review};fs.writeFileSync(dir+'validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({errors,audio,duration:review.duration}));if(errors.length||audio.some(a=>a.clipped||a.peak<.001))throw Error('Review failed');
}finally{await browser.close();}
