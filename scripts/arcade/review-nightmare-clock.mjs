import fs from 'node:fs/promises';
import sharp from 'sharp';
import {chromium} from '@playwright/test';
const out='tests/artifacts/arcade/nightmare-clock-v12';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:810}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
try{
 await page.route('**/__clock_review',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#171121"></body>'}));await page.goto((process.env.HEXY_TEST_URL||'http://localhost:4321')+'/__clock_review');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';window.w=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/nightmarePowerClash.js','render/adventureCanvas.js','render/adventureCamera.js','actors/bosses/nightmareUltimate.js','render/nightmareEnergyCanvas.js','render/nightmareContactRegistration.js'].map(p=>import(root+p))));
  w.art=await w.loadAdventureArt();w.c=document.createElement('canvas');w.c.style='width:1440px;height:810px';document.body.append(w.c);
  w.tick=(seconds,input={})=>{for(let i=0;i<Math.round(seconds*120);i++)w.stepAdventure(w.s,input,1/120);};
  w.paint=()=>{w.s.shake=0;w.s.noticeTime=0;const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.c,w.s,w.art,{});w.s.player.hurt=hurt;};
  w.setup=(side=1)=>{
   const s=w.s=w.createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.stars=[];s.cages=[];s.arenaLocked=true;s.noticeTime=0;s.episodeTwo.seen=new Set([0,1,2]);s.episodeTwo.captionAge=0;
   Object.assign(s.player,{x:side>0?2850:5650,y:a.y,ground:1,hurt:999,dir:side});Object.assign(s.boss,{x:side>0?5000:3000,y:a.y,dir:-side,phase:'recover',timer:100,engaged:true,vulnerable:true,stage:3,hp:117,encoreAid:true,nightmareCooldown:999,staffCooldown:999});
   w.beginNightmareUltimate(s);w.tick(1.9);w.stepAdventure(s,{super:true},1/120);while(s.powerClash.state!=='contest')w.stepAdventure(s,{},1/120);return s;
  };
  w.prepare=name=>{
   const s=w.setup(name.endsWith('-left')?-1:1),q=s.powerClash;w.elapsed=0;q.impactAge=99;q.boostFlash=0;q.age=2;
   if(name==='expiry-surprise'){q.contestAge=q.limit-.75;q.pressure=.68;w.action=(t)=>({attack:Math.floor(t*120)%18<8,super:s.powerClash?.boostReady&&!s.powerClash?.hexyBoost});}
   else if(name.startsWith('midpoint')){Object.assign(q,{bossBoost:true,bossReleased:true,hexyBoost:true,hexyReleased:true,bossAmplification:1,hexyAmplification:1,pressure:.5,portraitPressure:.5,contestAge:5,limit:25});w.action=t=>({attack:Math.floor(t*120)%18<8});}
   else{Object.assign(q,{bossBoost:true,bossReleased:true,hexyBoost:true,hexyReleased:true,bossAmplification:1,hexyAmplification:1,pressure:name==='expiry-win'?.75:.3,portraitPressure:name==='expiry-win'?.75:.3,contestAge:q.limit-.75});w.action=t=>({attack:Math.floor(t*120)%18<8});}
   for(let i=0;i<600;i++)w.followAdventureCamera(s,1/120);w.paint();
  };
  w.record=async(seconds)=>{
   const chunks=[],samples=[],stream=w.c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:7000000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});rec.start();
   let start,last,acc=0,next=0;await new Promise(resolve=>{const frame=now=>{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.elapsed+=1/120;w.stepAdventure(w.s,w.action(w.elapsed),1/120);acc-=1/120;}
    if(w.elapsed>=next){const q=w.s.powerClash;samples.push({t:+w.elapsed.toFixed(3),state:q?.state,pressure:q?.pressure,remaining:q?w.nightmareClashRemaining(q):0,bossBoost:q?.bossBoost,hexyBoost:q?.hexyBoost,won:q?.won,hearts:w.s.hearts,bossHP:w.s.boss.hp});next+=.1;}
    w.paint();if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();};requestAnimationFrame(frame);});rec.stop();const data=await done;stream.getTracks().forEach(t=>t.stop());return{data,samples};
  };
 });
 // Verify the actual Canvas transform of every painted core. The three
 // luminous centers must coincide at all widths, facings and rotations.
 const sockets=await page.evaluate(()=>{
  const canvas=document.createElement('canvas'),c=canvas.getContext('2d'),original=c.drawImage.bind(c),reports=[];
  for(const side of [1,-1])for(const width of [470,950,1150])for(let frame=0;frame<48;frame++){
   const a={x:side*1500,y:500},b={x:-side*200,y:-300},phase=frame%12+.5,base=Math.floor(phase),mix=phase-base,one=w.NIGHTMARE_STAR_CORES[base],two=w.NIGHTMARE_STAR_CORES[(base+1)%12],star=one.map((v,i)=>v+(two[i]-v)*mix),front=w.NIGHTMARE_VORTEX_CORES[frame%16],plasma=w.NIGHTMARE_PLASMA_CORES[frame%8],point={x:250,y:100};
   let active,core;const errors=[];c.drawImage=(...args)=>{if(args[0]===active||active==='star'){const x=args[5]+core[0]*args[7]/args[3],y=args[6]+core[1]*args[8]/args[4],p=c.getTransform().transformPoint(new DOMPoint(x,y));errors.push(Math.hypot(p.x-point.x,p.y-point.y));}original(...args);};
   active='star';core=star;w.drawNightmareStarBeam(c,w.art['super-beam'],phase,a,point,width);
   active=w.art['aerial-candy-vortex'];core=front;w.drawNightmareVortex(c,w.art,frame%16,b,point,width);
   active=w.art['nightmare-clash-plasma'];core=plasma;w.drawNightmareContactCore(c,w.art,frame%8,point,360,1.2);
   reports.push({side,width,frame,error:Math.max(...errors)});
  }
  return{samples:reports.length,maxError:Math.max(...reports.map(q=>q.error))};
 });
 if(sockets.maxError>.01)throw Error('Painted contact drift: '+JSON.stringify(sockets));
 const scenes=[['midpoint-right',4],['midpoint-left',4],['expiry-surprise',8],['expiry-win',4],['expiry-loss',4]];
 for(const [name,seconds]of scenes){
  await page.evaluate(n=>w.prepare(n),name);const r=await page.evaluate(t=>w.record(t),seconds);
  await fs.writeFile(out+'/'+name+'.webm',Buffer.from(r.data,'base64'));await fs.writeFile(out+'/'+name+'.json',JSON.stringify(r.samples,null,2));
  const playback=await browser.newPage({viewport:{width:960,height:540}});await playback.route('**/__playback',r=>r.fulfill({body:'<body style="margin:0"><video style="width:960px;height:540px" muted></video></body>'}));await playback.goto((process.env.HEXY_TEST_URL||'http://localhost:4321')+'/__playback');
  await playback.evaluate(async data=>{const v=document.querySelector('video');v.src='data:video/webm;base64,'+data;await new Promise(r=>{v.onloadeddata=r;});},r.data);
  const tiles=[],times=Array.from({length:12},(_,i)=>.1+(seconds-.3)*i/11);
  for(const [i,t]of times.entries()){
   await playback.evaluate(async t=>{const v=document.querySelector('video');await new Promise(r=>{v.onseeked=r;v.currentTime=t;});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},t);
   const buf=await playback.locator('video').screenshot();tiles.push({input:await sharp(buf).resize(480,270).png().toBuffer(),left:i%3*480,top:Math.floor(i/3)*270});
  }
  await sharp({create:{width:1440,height:1080,channels:3,background:'#171121'}}).composite(tiles).jpeg({quality:94}).toFile(out+'/'+name+'-playback.jpg');await playback.close();console.log(name+' recorded and decoded');
 }
 await fs.writeFile(out+'/report.json',JSON.stringify({sockets,errors,missing},null,2));if(errors.length||missing.length)throw Error(JSON.stringify({errors,missing}));
}finally{await browser.close();}
