import fs from 'node:fs';
import {chromium} from '@playwright/test';
const dir='context/arcade/hexy-acting/review/';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:960,height:540}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__route_polish',r=>r.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#292331"></body>'}));
 await page.goto((process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4322')+'/__route_polish');
 await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const w=window.review=Object.assign({},...await Promise.all(['engine/adventureModel.js','actors/enemies/adventureEnemies.js','render/adventureCanvas.js','actors/hexy/hexyAnimation.js','engine/adventureSuper.js','world/adventureTerrain.js','engine/adventureAmmo.js','engine/villageObstacles.js'].map(f=>import(root+f))));
  w.art=await w.loadAdventureArt();w.canvas=document.createElement('canvas');w.canvas.style='display:block;width:960px;height:540px';document.body.append(w.canvas);
  w.setup=spec=>{
   w.spec=spec;w.age=0;w.trace=[];const s=w.s=w.createAdventure(spec.index||0);s.noticeTime=0;s.enemies=[];s.hazards=[];s.stars=[];s.cages=[];s.player.hurt=999;
   if(!spec.props){s.outposts=[];s.supplies=[];s.graves=[];}
   if(spec.waterEnemy){spec.x=s.level.rivers[0].x+230;}
   if(spec.rubble){const r=s.villageObstacles.find(q=>q.kind!=='step');spec.x=r.x-r.w/2-130;s.villageObstacles=[r];r.ambush=false;r.hp=1;s.platforms=s.platforms.filter(p=>!p.villageObstacle||p.villageObstacle===r.id);s.villageRubble=[];w.equipDrink(s,9);}
   const x=spec.x??1000,floor=w.groundY(s.platforms,x);
   Object.assign(s.player,{x,y:floor-(spec.air?135:0),ground:spec.air?null:s.platforms.findIndex(p=>x>=p.x&&x<=p.x+p.w),vy:0});
   if(spec.hearts)s.hearts=spec.hearts;
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
   if(q.ultimate)input={super:true,...q.input};
   s.player.hurt=999;w.stepAdventure(s,input,1/120);Object.assign(s.camera,w.fixed);
   if(Math.floor(w.age*24)!==Math.floor(t*24))w.trace.push({t:w.age,pose:w.hexyPose(s),x:s.player.x,y:s.player.y,hearts:s.hearts,dust:s.surfaceDust.length,shots:s.shots.length,splashes:s.effects.filter(q=>q.bargeSplash).length,enemies:s.enemies.map(e=>({hp:e.hp,phase:e.phase})),rubble:s.villageObstacles?.map(r=>({hp:r.hp,broken:r.broken})),beam:s.voltBeam?.segments});
  };
  w.record=async seconds=>{
   const stream=w.canvas.captureStream(60),parts=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:4000000});
   const done=new Promise(resolve=>{rec.ondataavailable=e=>parts.push(e.data);rec.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.readAsDataURL(new Blob(parts,{type:'video/webm'}));};});
   rec.start();let start,last,acc=0;
   await new Promise((resolve,reject)=>{const frame=now=>{try{start??=now;last??=now;acc+=Math.min(.05,(now-last)/1000);last=now;while(acc>=1/120){w.step();acc-=1/120;}const hurt=w.s.player.hurt;w.s.player.hurt=0;w.renderAdventure(w.canvas,w.s,w.art);w.s.player.hurt=hurt;if(now-start<seconds*1000)requestAnimationFrame(frame);else resolve();}catch(e){reject(e);}};requestAnimationFrame(frame);});
   rec.stop();const video=await done;stream.getTracks().forEach(t=>t.stop());return{video,trace:w.trace};
  };
 });
 const cases=[
  ...[1,2].flatMap(hearts=>[['run',{}],['run-fire',{fire:true}],['run-up',{fire:true,aimUp:true}]].map(([name,opts])=>['health-'+hearts+'-'+name,{index:7,x:3500,run:true,hearts,...opts},2.8])),
  ...[1,2].flatMap(index=>[8,9].map(type=>['water-'+index+'-'+type,{index,waterEnemy:type},3])),
  ['rubble-volt',{index:7,rubble:true},3.2],
  ...[false,true].flatMap(air=>[['right',{right:true}],['up',{up:true}],['up-diagonal',{up:true,right:true}],['down-diagonal',{down:true,right:true}],['down',{down:true}],['down-left',{down:true,left:true}]].map(([name,input])=>['ultimate-'+name+(air?'-air':'-ground'),{index:7,x:3500,air,ultimate:true,input},3.35])),
 ];
 const report=[];
 for(const [name,spec,seconds] of cases){
  if(process.argv[2]&&!new RegExp(process.argv[2]).test(name))continue;
  await page.evaluate(spec=>window.review.setup(spec),spec);const result=await page.evaluate(seconds=>window.review.record(seconds),seconds);
  fs.writeFileSync(dir+name+'.webm',Buffer.from(result.video,'base64'));fs.writeFileSync(dir+name+'-trace.json',JSON.stringify(result.trace));
  const playback=await page.evaluate(async({data,seconds,name})=>{
   const video=document.createElement('video');video.muted=true;const loaded=new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=reject;});video.src='data:video/webm;base64,'+data;await loaded;
   const sheet=document.createElement('canvas');sheet.width=1440;sheet.height=900;const c=sheet.getContext('2d');
   for(let i=0;i<9;i++){const time=.06+i*(seconds-.18)/8;await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});const x=i%3*480,y=Math.floor(i/3)*300;c.drawImage(video,0,0,960,540,x,y,480,270);c.fillStyle='#201d29';c.fillRect(x,y+270,480,30);c.fillStyle='#fff0d0';c.font='16px sans-serif';c.fillText(name+' | '+time.toFixed(2)+' s',x+8,y+291);}
   return sheet.toDataURL('image/png').split(',')[1];
  },{data:result.video,seconds,name});fs.writeFileSync(dir+name+'-playback.png',Buffer.from(playback,'base64'));
  report.push({name,frames:result.trace.length,maxDust:Math.max(...result.trace.map(q=>q.dust)),maxSplashes:Math.max(...result.trace.map(q=>q.splashes)),sheets:[...new Set(result.trace.map(q=>q.pose.sheet))]});console.log(name+': recorded and decoded');
 }
 fs.writeFileSync(dir+'report'+(process.argv[2]?'-partial':'')+'.json',JSON.stringify({cases:report,runtimeErrors:errors},null,2));if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
