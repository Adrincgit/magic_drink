import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/village-5-2/revision-14/',artifacts='tests/artifacts/arcade/group-absorption/';
fs.mkdirSync(dir+'audio',{recursive:true});fs.mkdirSync(artifacts,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.route('**/__review',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Group absorption review</title><body style="margin:0;background:#151221"></body>'}));
 await page.goto('http://127.0.0.1:4321/__review');
 const review=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/',w=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/villageRescue.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','world/adventureTerrain.js'].map(p=>import(root+p)))),art=await w.loadAdventureArt();
  const c=document.createElement('canvas');c.width=1440;c.height=810;document.body.append(c);
  function scene(flying){
   const s=w.createAdventure(7),x=9000,y=w.groundY(s.level.route,x);
   s.villagers=Array.from({length:5},(_,i)=>({...s.level.villagers[i],id:'review-'+i,state:'candy',x:x-500+i*105,y,age:1,curseAge:1,active:false,warning:false,defender:false}));
   s.enemies=[Object.assign(w.makeEnemy(x+60,y,26,71),{active:true,flying,flightHeight:150,phase:'patrol',timer:0})];
   s.hostile=[];s.villageRubble=[];s.villageObstacles=[];s.carriages=[];s.supplies=[];s.cages=[];s.outposts=[];s.platforms=s.platforms.filter(q=>!q.villageObstacle);s.village.furthest=20000;s.noticeTime=0;
   Object.assign(s.player,{x:x-580,y,ground:null,vx:0,vy:0,hurt:999});
   // Within the same 620px suction reach; take a different path from the five NPCs.
   s.player.x=x-540;w.beginCandyCapture(s,{kind:'candy-ray'});s.player.candy.age=1.1;
   s.camera={x:x-670,y:20,backdropY:20,zoom:1};return s;
  }
  // Paint before recording so deferred first-draw work cannot shift video time.
  w.renderAdventure(c,scene(false),art);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const chunks=[],stream=c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:5000000});
  const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
  let state=scene(false),mode=0,start,last,simTime=0,nextSnapshot=0,hit=false;const metrics=[],targets=[1.3,2.1,3.65,4.9,5.8,6.95];rec.start();
  await new Promise(resolve=>{const frame=now=>{
   start??=now;last??=now;const wall=(now-start)/1000,dt=Math.min(.04,(now-last)/1000);last=now;
   if(!hit&&simTime>=1.1){const e=state.enemies[0];state.shots.push({kind:0,x:e.x,y:e.y-60,vx:0,vy:0,r:16,life:.2,age:0,damage:1,hits:[]});hit=true;}
   // Substeps retain the same simulation cadence as the actual game.
   let left=dt;while(left>0){const step=Math.min(1/120,left);w.stepAdventure(state,{},step);left-=step;}simTime+=dt;
   state.shake=0;state.noticeTime=0;state.camera={x:8330,y:20,backdropY:20,zoom:1};w.renderAdventure(c,state,art);
   if(simTime>=targets[nextSnapshot]){metrics.push({mode,t:simTime,wall,hp:state.enemies[0].hp,states:state.villagers.map(q=>q.state),pulls:state.villagers.filter(q=>q.state==='absorbing').length,hexy:state.player.candy?.absorbProgress,pumpkins:state.enemies.filter(q=>q.type===27).length,playerShell:state.enemies.filter(q=>q.playerSoul).length,done:state.done});nextSnapshot++;}
   if(simTime>=7.1){if(mode===1){resolve();return;}state=scene(true);mode=1;simTime=0;nextSnapshot=0;hit=false;}
   requestAnimationFrame(frame);
  };requestAnimationFrame(frame);});
  rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());
  const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+video;await new Promise(resolve=>v.onloadeddata=resolve);
  if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=1000;});
  const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=1080;const g=sheet.getContext('2d'),frames=[];
  for(const [i,snapshot]of metrics.entries()){
   const t=snapshot.wall;
   await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=t;});g.drawImage(v,i%3*480,Math.floor(i/3)*270,480,270);
   g.fillStyle='#161023';g.fillRect(i%3*480,Math.floor(i/3)*270,110,23);g.fillStyle='#fff';g.font='14px sans-serif';g.fillText((snapshot.mode===0?'Ground ':'Flying ')+snapshot.t.toFixed(1)+'s',i%3*480+5,Math.floor(i/3)*270+17);
   if([0,2,4,6,8,10].includes(i)){const full=document.createElement('canvas');full.width=1440;full.height=810;full.getContext('2d').drawImage(v,0,0);frames.push({name:(snapshot.mode===0?'ground':'flying')+'-'+targets[i%6],data:full.toDataURL('image/png').split(',')[1]});}
  }
  return{video,contact:sheet.toDataURL('image/png').split(',')[1],frames,metrics,duration:v.duration};
 });
 fs.writeFileSync(artifacts+'group-absorption.webm',Buffer.from(review.video,'base64'));fs.writeFileSync(dir+'decoded-playback.png',Buffer.from(review.contact,'base64'));
 for(const frame of review.frames)fs.writeFileSync(dir+frame.name+'.png',Buffer.from(frame.data,'base64'));delete review.video;delete review.contact;delete review.frames;
 const audio=await page.evaluate(async()=>{
  const root='/src/components/arcade/shared/audio/',{CREATURE_CUES,createCreaturePlayer}=await import(root+'creatureSamples.js'),{createEffectsBus}=await import(root+'effectsBus.js'),{playHexyAttackSound}=await import(root+'hexyAttackSound.js'),rate=32000,results=[],sources=[];
  const decoder=new AudioContext({sampleRate:rate});for(const file of [...new Set(Object.values(CREATURE_CUES).flatMap(q=>q.files))]){const b=await decoder.decodeAudioData(await(await fetch('/arcade/audio/creatures/'+file+'.wav')).arrayBuffer());sources.push({file,channels:b.numberOfChannels,rate:b.sampleRate,duration:b.duration});}await decoder.close();
  for(const kind of [...Object.keys(CREATURE_CUES),'crowd-mix','hexy-basic']){
   const ctx=new OfflineAudioContext(2,rate*(kind==='crowd-mix'?4:2.1),rate),fx=ctx.createGain(),vo=ctx.createGain();fx.gain.value=.49;vo.gain.value=.49*.6;fx.connect(ctx.destination);vo.connect(ctx.destination);
   const out=createEffectsBus(ctx,fx),voiceOut=createEffectsBus(ctx,vo),player=createCreaturePlayer(ctx,out,voiceOut);await player.preload();
   if(kind==='hexy-basic')playHexyAttackSound(ctx,out,'cast',0);
   else if(kind==='crowd-mix'){for(const[i,k]of Object.keys(CREATURE_CUES).entries())player.play(k,i*.08,{pan:i/8-.4});for(let t=0;t<3;t+=.25)playHexyAttackSound(ctx,out,'cast',t);}
   else player.play(kind,0);
   const b=await ctx.startRendering();let peak=0,sum=0,clipped=0;for(let ch=0;ch<2;ch++)for(const v of b.getChannelData(ch)){peak=Math.max(peak,Math.abs(v));sum+=v*v;if(Math.abs(v)>=1)clipped++;}
   const bytes=new ArrayBuffer(44+b.length*4),dv=new DataView(bytes),str=(at,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(at+i,s.charCodeAt(i));};str(0,'RIFF');dv.setUint32(4,bytes.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,rate,true);dv.setUint32(28,rate*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);str(36,'data');dv.setUint32(40,b.length*4,true);
   for(let ch=0;ch<2;ch++)for(let i=0;i<b.length;i++)dv.setInt16(44+(i*2+ch)*2,Math.round(Math.max(-1,Math.min(1,b.getChannelData(ch)[i]))*32767),true);
   const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob([bytes]));});results.push({kind,peak,rms:Math.sqrt(sum/(b.length*2)),clipped,data});
  }return{sources,results};
 });
 const before=JSON.parse(fs.readFileSync('context/arcade/village-5-2/revision-13/validation.json','utf8')).audio;
 for(const a of audio.results){fs.writeFileSync(dir+'audio/'+a.kind+'.wav',Buffer.from(a.data,'base64'));delete a.data;const old=before.find(q=>q.kind===a.kind);a.rmsChangeDb=20*Math.log10(a.rms/old.rms);}
 const report={errors,...review,audio};fs.writeFileSync(dir+'validation.json',JSON.stringify(report,null,2));console.log(JSON.stringify({errors,metrics:review.metrics,audio:audio.results}));
 if(errors.length||audio.results.some(q=>q.clipped)||review.metrics.length!==12||review.metrics.filter(q=>q.t>6).some(q=>q.pumpkins!==6||!q.done)||review.metrics.filter(q=>q.t<1.4).some(q=>q.hp!==10.5||q.pulls!==5||!q.hexy))throw Error('Group review failed');
}finally{await browser.close();}
