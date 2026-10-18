import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir=process.env.MAGIC_DRINK_REVIEW_DIR||'context/arcade/encore-repair/review/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:960,height:540}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__route_polish',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#292331"></body>'}));
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__route_polish');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','engine/adventureSuperTiming.js','actors/enemies/adventureEnemies.js','actors/enemies/adventureElementHits.js','render/adventureCanvas.js','render/adventureSuperCutin.js','render/adventureSuperCanvas.js','render/clashImpactCanvas.js','actors/hexy/hexyAnimation.js','engine/adventureSuper.js','world/adventureTerrain.js','engine/adventureAmmo.js','engine/villageRescue.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='display:block;width:960px;height:540px';document.body.append(w.canvas);
  w.setup=spec=>{
   w.spec=spec;w.age=0;w.wallTime=0;w.trace=[];w.captured=false;const s=w.s=w.createAdventure(spec.index||0);s.noticeTime=0;s.enemies=[];s.hazards=[];s.stars=[];s.cages=[];s.player.hurt=999;
   if(!spec.props){s.outposts=[];s.supplies=[];s.graves=[];}
   if(spec.waterEnemy){spec.x=s.level.rivers[0].x+230;}
   if(spec.bridge){spec.x=s.level.rivers[0].x+300;}
   if(spec.rubble){const r=s.villageObstacles.find(q=>q.kind!=='step');spec.x=r.x-r.w/2-130;s.villageObstacles=[r];r.ambush=false;r.hp=1;s.platforms=s.platforms.filter(p=>!p.villageObstacle||p.villageObstacle===r.id);s.villageRubble=[];w.equipDrink(s,9);}
   const x=spec.x??1000,floor=w.groundY(s.platforms,x);
   Object.assign(s.player,{x,y:floor-(spec.air?135:0),ground:spec.air?null:s.platforms.findIndex(p=>x>=p.x&&x<=p.x+p.w),vy:0});
   if(spec.hearts)s.hearts=spec.hearts;
   if(spec.candy){s.villagers=[];s.villageObstacles=[];s.villageRubble=[];const e=w.makeEnemy(x+180,floor,25);Object.assign(e,{active:true,phase:'patrol',timer:.05});s.enemies=[e];}
   if(spec.fireHit){const e=w.makeEnemy(x+190,floor,0);Object.assign(e,{active:true,hp:100,maxHp:100,timer:999});s.enemies=[e];w.equipDrink(s,0);}
   if(spec.run){s.villageObstacles=[];s.platforms=s.platforms.filter(p=>!p.villageObstacle);}
   if(spec.waterEnemy){const ex=x+155,e=w.makeEnemy(ex,floor,spec.waterEnemy);Object.assign(e,{active:true,hp:4,maxHp:4,timer:999,phase:spec.waterEnemy===8?'swim':'sail',aquatic:true,boat:true,waterY:floor+(spec.waterEnemy===8?134:143),y:floor+148,phaseAge:0,diveWait:999,surfaceWait:999,swimAge:-999,swimClock:0,home:ex,left:ex,right:ex,sailDir:1});s.enemies=[e];}
   if(spec.rubble){const r=s.villageObstacles[0],e=w.makeEnemy(r.x+r.w/2+70,w.groundY(s.platforms,r.x+r.w/2+70),25);e.timer=999;e.hp=100;s.enemies=[e];}
   w.fixed=spec.camera||{x:x-240,y:floor-(spec.waterEnemy?245:spec.air?350:310),zoom:spec.waterEnemy?1.2:1.5,backdropY:40};
   if(spec.ultimate){w.beginSuper(s,{super:true,...spec.input});}
   Object.assign(s.camera,w.fixed);w.renderAdventure(w.canvas,s,w.art);
  };
  w.step=()=>{
   const s=w.s,q=w.spec,t=w.age;w.age+=1/120;
   let input={};
   if(q.run){input={right:true,attack:q.fire,up:q.aimUp};w.fixed.x=s.player.x-240;if(t>1.7)s.hearts=s.maxHearts;}
   if(q.waterEnemy)input={hold:true,down:true,attack:true};
   if(q.rubble)input={attack:true};
   if(q.fireHit)input={attack:t>.2&&t<1.6};
   if(q.candy){if(t>.4&&!w.captured){w.beginCandyCapture(s,{kind:'lantern-soul',owner:'review-clown'});w.captured=true;}if(t>3)input={attack:Math.floor(t*20)%2===0};}
   if(q.ultimate)input={super:true,...q.input};
   s.player.hurt=999;w.stepAdventure(s,input,1/120);Object.assign(s.camera,w.fixed);
   if(Math.floor(w.age*24)!==Math.floor(t*24))w.trace.push({t:w.age,wall:w.wallTime,pose:w.hexyPose(s),portrait:w.superCutinPortrait(s),arrivals:s.superCinematic?Array.from({length:48},(_,i)=>w.hexyChargeParticle(s,i,s.superCinematic.age)).filter(p=>p.phase===1).length:null,manga:w.superMangaTiming(s),x:s.player.x,y:s.player.y,hearts:s.hearts,candy:!!s.player.candy,dust:s.surfaceDust.length+(s.superCinematic?.surfaceDust?.length||0),shots:s.shots.length,splashes:s.effects.filter(q=>q.bargeSplash).length,enemies:s.enemies.map(e=>({x:e.x,gait:e.gait,hp:e.hp,phase:e.phase})),rubble:s.villageObstacles?.map(r=>({hp:r.hp,broken:r.broken})),beam:s.voltBeam?.segments});
  };
  w.record=async seconds=>{
   const stream=w.canvas.captureStream(60),parts=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(parts,{type:'video/webm'}));};});
   rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;w.wallTime=(now-start)/1000;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.canvas,w.s,w.art);w.s.player.hurt=hurt;if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return{video,trace:w.trace};
  };
 });
 const cases=[
  ['accepted-run',{index:7,x:3500,run:true,hearts:1},2.5],['fire-reaction',{index:0,x:1100,fireHit:true},2.5],['candy-patrol',{index:7,x:3500,candy:true},6],
  ['ultimate-meadow-grass',{index:0,x:1100,ultimate:true,input:{right:true}},4.5],['ultimate-bridge-wood',{index:2,bridge:true,ultimate:true,input:{right:true}},4.5],
  ...[false,true].flatMap(air=>[['right',{right:true}],['up',{up:true}],['up-diagonal',{up:true,right:true}],['down-diagonal',{down:true,right:true}],['down',{down:true}],['down-left',{down:true,left:true}]].map(([name,input])=>['ultimate-'+name+(air?'-air':'-ground'),{index:7,x:3500,air,ultimate:true,input},4.5])),
 ];
 const report=[];
 for(const [name,spec,seconds] of cases){
  if(process.argv[2]&&!new RegExp(process.argv[2]).test(name))continue;
  if(spec.ultimate){
   const snapshots=await page.evaluate(spec=>{
    const w=window.review;w.setup(spec);const shots=[];
    for(const [stage,target] of [['gathering',w.SUPER_WINDUP*.6],['heroic',w.SUPER_WINDUP*.84],['arrived',w.SUPER_WINDUP*.93],['manga',w.SUPER_WINDUP+.04],['colour',w.SUPER_WINDUP+w.SUPER_MANGA_DURATION+.04],['release',w.SUPER_WINDUP+.82]]){
     while(w.age<target)w.step();w.s.player.hurt=0;w.renderAdventure(w.canvas,w.s,w.art);w.s.player.hurt=999;
     shots.push({stage,data:w.canvas.toDataURL('image/png').split(',')[1]});
     if(['gathering','heroic','arrived'].includes(stage)){
      const tip=w.hexyMuzzle(w.s),zoom=w.s.camera.zoom||1,crop=document.createElement('canvas');crop.width=crop.height=180;
      crop.getContext('2d').drawImage(w.canvas,(tip.x-w.s.camera.x)*zoom-90,(tip.y-w.s.camera.y)*zoom-90,180,180,0,0,180,180);
      shots.push({stage:stage+'-wand',data:crop.toDataURL('image/png').split(',')[1]});
     }
    }return shots;
   },spec);
   for(const shot of snapshots)fs.writeFileSync(dir+name+'-'+shot.stage+'.png',Buffer.from(shot.data,'base64'));
  }
  await page.evaluate(spec=>window.review.setup(spec),spec);const result=await page.evaluate(seconds=>window.review.record(seconds),seconds);
  fs.writeFileSync(dir+name+'.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+name+'-trace.json',JSON.stringify(result.trace));
  const playback=await page.evaluate(async({data,seconds,name,trace,ultimate})=>{
   const video=document.createElement('video');video.muted=true;const loaded=new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});video.src='data:video/webm;base64,'+data;await loaded;
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=900;const c=sheet.getContext('2d');
   const windup=window.review.SUPER_WINDUP,targets=ultimate?[.06,windup*.32,windup*.6,windup*.88,windup+.02,windup+.065,windup+.14,windup+1.4,windup+2.48]:Array.from({length:9},(_,i)=>.06+i*(seconds-.18)/8);
   for(let i=0;i<9;i++){const target=targets[i],sample=trace.reduce((best,p)=>Math.abs(p.t-target)<Math.abs(best.t-target)?p:best,trace[0]),time=Math.min(seconds-.04,Math.max(.02,sample.wall));await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});const x=i%3*480,y=Math.floor(i/3)*300;c.drawImage(video,0,0,960,540,x,y,480,270);c.fillStyle='#201d29';c.fillRect(x,y+270,480,30);c.fillStyle='#fff0d0';c.font='16px sans-serif';c.fillText(name+' | sim '+sample.t.toFixed(2)+' s',x+8,y+291);}
   return sheet.toDataURL('image/png').split(',')[1];
  },{data:result.video,seconds,name,trace:result.trace,ultimate:!!spec.ultimate});fs.writeFileSync(dir+name+'-playback.png',Buffer.from(playback,'base64'));
  report.push({name,frames:result.trace.length,maxDust:Math.max(...result.trace.map(q=>q.dust)),maxSplashes:Math.max(...result.trace.map(q=>q.splashes)),sheets:[...new Set(result.trace.map(q=>q.pose.sheet))]});console.log(name+': recorded and decoded');
 }
 fs.writeFileSync(dir+'report'+(process.argv[2]?'-partial':'')+'.json',JSON.stringify({cases:report,runtimeErrors:errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
